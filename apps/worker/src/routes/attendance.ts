import type { Env, AttendanceLog, WorkMode } from '../types';
import {
  generateId,
  getCurrentTimestamp,
  parseBody,
  jsonResponse,
  errorResponse,
  verifyLocation,
  getWeekStart,
  calculateMinutes,
} from '../lib/utils';

/**
 * GET /api/attendance - List attendance logs
 */
export async function listAttendance(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    let query = 'SELECT * FROM attendance_logs WHERE 1=1';
    const params: string[] = [];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    if (startDate) {
      query += ' AND clock_in >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND clock_in <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY clock_in DESC LIMIT 100';

    const stmt = params.length > 0
      ? env.DB.prepare(query).bind(...params)
      : env.DB.prepare(query);

    const result = await stmt.all();

    return jsonResponse({ logs: result.results });
  } catch (error) {
    console.error('Error listing attendance:', error);
    return errorResponse('Failed to list attendance', 500);
  }
}

/**
 * GET /api/attendance/:id - Get attendance log by ID
 */
export async function getAttendance(request: Request, env: Env, ctx: ExecutionContext, params?: Record<string, string>): Promise<Response> {
  try {
    const id = params?.id;
    if (!id) {
      return errorResponse('Attendance ID is required', 400);
    }

    const log = await env.DB.prepare('SELECT * FROM attendance_logs WHERE id = ?')
      .bind(id)
      .first();

    if (!log) {
      return errorResponse('Attendance log not found', 404);
    }

    return jsonResponse({ log });
  } catch (error) {
    console.error('Error getting attendance:', error);
    return errorResponse('Failed to get attendance', 500);
  }
}

/**
 * POST /api/attendance/clock-in - Clock in
 */
export async function clockIn(request: Request, env: Env): Promise<Response> {
  try {
    const body = await parseBody<{
      user_id: string;
      work_mode: WorkMode;
      location_id?: string;
      latitude?: number;
      longitude?: number;
    }>(request);

    if (!body.user_id || !body.work_mode) {
      return errorResponse('user_id and work_mode are required');
    }

    // Check if user already clocked in today
    const today = new Date().toISOString().split('T')[0];
    const existing = await env.DB.prepare(
      'SELECT * FROM attendance_logs WHERE user_id = ? AND DATE(clock_in) = ? AND clock_out IS NULL'
    )
      .bind(body.user_id, today)
      .first();

    if (existing) {
      return errorResponse('Already clocked in today', 400);
    }

    // Verify location for ONSITE mode
    let verified = 0;
    if (body.work_mode === 'ONSITE') {
      if (!body.location_id || body.latitude === undefined || body.longitude === undefined) {
        return errorResponse('Location data required for ONSITE mode');
      }

      verified = await verifyLocation(env, body.latitude, body.longitude, body.location_id) ? 1 : 0;

      if (!verified) {
        return errorResponse('Location verification failed', 403);
      }
    } else if (body.work_mode === 'REMOTE') {
      // Check if remote work is approved for today
      const remoteSchedule = await env.DB.prepare(
        'SELECT * FROM remote_schedules WHERE user_id = ? AND work_date = ? AND status = ? AND archived = 0'
      )
        .bind(body.user_id, today, 'approved')
        .first();

      if (!remoteSchedule) {
        return errorResponse('No approved remote work schedule for today', 403);
      }

      verified = 1;
    }

    const id = generateId();
    const now = getCurrentTimestamp();

    await env.DB.prepare(`
      INSERT INTO attendance_logs (id, user_id, clock_in, work_mode, location_id, verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(id, body.user_id, now, body.work_mode, body.location_id || null, verified, now, now)
      .run();

    const log = await env.DB.prepare('SELECT * FROM attendance_logs WHERE id = ?')
      .bind(id)
      .first();

    return jsonResponse({ log }, 201);
  } catch (error) {
    console.error('Error clocking in:', error);
    return errorResponse('Failed to clock in', 500);
  }
}

/**
 * POST /api/attendance/clock-out - Clock out
 */
export async function clockOut(request: Request, env: Env): Promise<Response> {
  try {
    const body = await parseBody<{
      user_id: string;
      latitude?: number;
      longitude?: number;
    }>(request);

    if (!body.user_id) {
      return errorResponse('user_id is required');
    }

    // Find today's clock-in record
    const today = new Date().toISOString().split('T')[0];
    const log = await env.DB.prepare(
      'SELECT * FROM attendance_logs WHERE user_id = ? AND DATE(clock_in) = ? AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1'
    )
      .bind(body.user_id, today)
      .first();

    if (!log) {
      return errorResponse('No active clock-in found for today', 404);
    }

    const now = getCurrentTimestamp();

    // Update clock-out time
    await env.DB.prepare('UPDATE attendance_logs SET clock_out = ?, updated_at = ? WHERE id = ?')
      .bind(now, now, log.id)
      .run();

    // Update weekly summary
    const weekStart = getWeekStart(new Date());
    const minutes = calculateMinutes(log.clock_in as string, now);

    // Get or create weekly summary
    const summary = await env.DB.prepare(
      'SELECT * FROM weekly_summaries WHERE user_id = ? AND week_start = ?'
    )
      .bind(body.user_id, weekStart)
      .first();

    if (summary) {
      const totalMinutes = (summary.total_minutes as number) + minutes;
      const weeklyLimit = 52 * 60; // 52 hours in minutes
      const overtimeMinutes = Math.max(0, totalMinutes - weeklyLimit);
      const exceedsLimit = totalMinutes > weeklyLimit ? 1 : 0;

      await env.DB.prepare(`
        UPDATE weekly_summaries 
        SET total_minutes = ?, overtime_minutes = ?, exceeds_limit = ?, updated_at = ?
        WHERE id = ?
      `)
        .bind(totalMinutes, overtimeMinutes, exceedsLimit, now, summary.id)
        .run();
    } else {
      const id = generateId();
      const weeklyLimit = 52 * 60;
      const overtimeMinutes = Math.max(0, minutes - weeklyLimit);
      const exceedsLimit = minutes > weeklyLimit ? 1 : 0;

      await env.DB.prepare(`
        INSERT INTO weekly_summaries (id, user_id, week_start, total_minutes, overtime_minutes, exceeds_limit, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(id, body.user_id, weekStart, minutes, overtimeMinutes, exceedsLimit, now, now)
        .run();
    }

    const updatedLog = await env.DB.prepare('SELECT * FROM attendance_logs WHERE id = ?')
      .bind(log.id)
      .first();

    return jsonResponse({ log: updatedLog });
  } catch (error) {
    console.error('Error clocking out:', error);
    return errorResponse('Failed to clock out', 500);
  }
}

/**
 * GET /api/attendance/summary/:userId - Get user's weekly summary
 */
export async function getWeeklySummary(request: Request, env: Env, ctx: ExecutionContext, params?: Record<string, string>): Promise<Response> {
  try {
    const userId = params?.userId;
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    const url = new URL(request.url);
    const weekStart = url.searchParams.get('week_start') || getWeekStart(new Date());

    const summary = await env.DB.prepare(
      'SELECT * FROM weekly_summaries WHERE user_id = ? AND week_start = ?'
    )
      .bind(userId, weekStart)
      .first();

    if (!summary) {
      return jsonResponse({
        summary: {
          user_id: userId,
          week_start: weekStart,
          total_minutes: 0,
          overtime_minutes: 0,
          exceeds_limit: 0,
        },
      });
    }

    return jsonResponse({ summary });
  } catch (error) {
    console.error('Error getting weekly summary:', error);
    return errorResponse('Failed to get weekly summary', 500);
  }
}

