import type { Router } from "../lib/router";
import type { Env, LeaveBalance, LeaveRequest } from "../types";
import { jsonResponse, errorResponse, parseBody } from "../lib/utils";

export function registerLeaveRoutes(router: Router) {
  // GET /v1/leave-balances - List leave balances
  router.on("GET", "/v1/leave-balances", async (request, env) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const year = url.searchParams.get("year");

      let query = `SELECT id, user_id, year, leave_type, allowance_days, used_days, created_at, updated_at
                   FROM leave_balances
                   WHERE 1=1`;
      const params: (string | number)[] = [];

      if (userId) {
        query += " AND user_id = ?";
        params.push(userId);
      }

      if (year) {
        query += " AND year = ?";
        params.push(parseInt(year));
      }

      query += " ORDER BY year DESC, leave_type ASC LIMIT 200";

      const statement = env.DB.prepare(query).bind(...params);
      const result = await statement.all<LeaveBalance>();

      return jsonResponse({ balances: result.results ?? [] });
    } catch (error) {
      return errorResponse("Failed to fetch leave balances", 500);
    }
  });

  // GET /v1/leave-balances/:id - Get specific leave balance
  router.on("GET", "/v1/leave-balances/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };

      const statement = env.DB.prepare(`
        SELECT id, user_id, year, leave_type, allowance_days, used_days, created_at, updated_at
        FROM leave_balances
        WHERE id = ?
      `).bind(id);

      const result = await statement.first<LeaveBalance>();

      if (!result) {
        return errorResponse("Leave balance not found", 404);
      }

      return jsonResponse({ balance: result });
    } catch (error) {
      return errorResponse("Failed to fetch leave balance", 500);
    }
  });

  // POST /v1/leave-balances - Create leave balance (admin only)
  router.on("POST", "/v1/leave-balances", async (request, env) => {
    try {
      const body = await parseBody<{
        user_id: string;
        year: number;
        leave_type: string;
        allowance_days: number;
      }>(request);

      if (!body.user_id || !body.year || !body.leave_type || body.allowance_days === undefined) {
        return errorResponse("user_id, year, leave_type, and allowance_days are required", 400);
      }

      // Check if balance already exists
      const existingStatement = env.DB.prepare(`
        SELECT id FROM leave_balances
        WHERE user_id = ? AND year = ? AND leave_type = ?
      `).bind(body.user_id, body.year, body.leave_type);

      const existing = await existingStatement.first();

      if (existing) {
        return errorResponse("Leave balance already exists for this user, year, and type", 409);
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const statement = env.DB.prepare(`
        INSERT INTO leave_balances
        (id, user_id, year, leave_type, allowance_days, used_days, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(
        id,
        body.user_id,
        body.year,
        body.leave_type,
        body.allowance_days,
        now,
        now
      );

      await statement.run();

      const newBalance: LeaveBalance = {
        id,
        user_id: body.user_id,
        year: body.year,
        leave_type: body.leave_type,
        allowance_days: body.allowance_days,
        used_days: 0,
        created_at: now,
        updated_at: now,
      };

      return jsonResponse({ balance: newBalance }, { status: 201 });
    } catch (error) {
      return errorResponse("Failed to create leave balance", 500);
    }
  });

  // PATCH /v1/leave-balances/:id - Update leave balance
  router.on("PATCH", "/v1/leave-balances/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };
      const body = await parseBody<{
        allowance_days?: number;
        used_days?: number;
      }>(request);

      if (body.allowance_days === undefined && body.used_days === undefined) {
        return errorResponse("At least one field to update is required", 400);
      }

      const now = new Date().toISOString();
      const updates: string[] = [];
      const bindParams: (string | number)[] = [];

      if (body.allowance_days !== undefined) {
        updates.push("allowance_days = ?");
        bindParams.push(body.allowance_days);
      }

      if (body.used_days !== undefined) {
        updates.push("used_days = ?");
        bindParams.push(body.used_days);
      }

      updates.push("updated_at = ?");
      bindParams.push(now);

      bindParams.push(id);

      const statement = env.DB.prepare(`
        UPDATE leave_balances
        SET ${updates.join(", ")}
        WHERE id = ?
      `).bind(...bindParams);

      const result = await statement.run();

      if (result.meta.changes === 0) {
        return errorResponse("Leave balance not found", 404);
      }

      // Fetch updated balance
      const updatedStatement = env.DB.prepare(`
        SELECT id, user_id, year, leave_type, allowance_days, used_days, created_at, updated_at
        FROM leave_balances
        WHERE id = ?
      `).bind(id);

      const updatedBalance = await updatedStatement.first<LeaveBalance>();

      return jsonResponse({ balance: updatedBalance });
    } catch (error) {
      return errorResponse("Failed to update leave balance", 500);
    }
  });

  // GET /v1/leave-requests - List leave requests
  router.on("GET", "/v1/leave-requests", async (request, env) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const status = url.searchParams.get("status");
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");

      let query = `SELECT id, user_id, leave_type, start_date, end_date, status, reason, created_at, updated_at
                   FROM leave_requests
                   WHERE 1=1`;
      const params: (string | number)[] = [];

      if (userId) {
        query += " AND user_id = ?";
        params.push(userId);
      }

      if (status) {
        query += " AND status = ?";
        params.push(status);
      }

      if (startDate) {
        query += " AND end_date >= ?";
        params.push(startDate);
      }

      if (endDate) {
        query += " AND start_date <= ?";
        params.push(endDate);
      }

      query += " ORDER BY start_date DESC LIMIT 200";

      const statement = env.DB.prepare(query).bind(...params);
      const result = await statement.all<LeaveRequest>();

      return jsonResponse({ requests: result.results ?? [] });
    } catch (error) {
      return errorResponse("Failed to fetch leave requests", 500);
    }
  });

  // GET /v1/leave-requests/:id - Get specific leave request
  router.on("GET", "/v1/leave-requests/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };

      const statement = env.DB.prepare(`
        SELECT id, user_id, leave_type, start_date, end_date, status, reason, created_at, updated_at
        FROM leave_requests
        WHERE id = ?
      `).bind(id);

      const result = await statement.first<LeaveRequest>();

      if (!result) {
        return errorResponse("Leave request not found", 404);
      }

      return jsonResponse({ request: result });
    } catch (error) {
      return errorResponse("Failed to fetch leave request", 500);
    }
  });

  // POST /v1/leave-requests - Create leave request
  router.on("POST", "/v1/leave-requests", async (request, env) => {
    try {
      const body = await parseBody<{
        user_id: string;
        leave_type: string;
        start_date: string;
        end_date: string;
        reason?: string;
      }>(request);

      if (!body.user_id || !body.leave_type || !body.start_date || !body.end_date) {
        return errorResponse("user_id, leave_type, start_date, and end_date are required", 400);
      }

      // Calculate business days (simplified - actual implementation should consider holidays)
      const startDate = new Date(body.start_date);
      const endDate = new Date(body.end_date);
      let businessDays = 0;
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
          businessDays++;
        }
      }

      // Check if user has enough leave balance
      const year = startDate.getFullYear();
      const balanceStatement = env.DB.prepare(`
        SELECT allowance_days, used_days
        FROM leave_balances
        WHERE user_id = ? AND year = ? AND leave_type = ?
      `).bind(body.user_id, year, body.leave_type);

      const balance = await balanceStatement.first<{ allowance_days: number; used_days: number }>();

      if (!balance) {
        return errorResponse("No leave balance found for this type and year", 404);
      }

      const remainingDays = balance.allowance_days - balance.used_days;
      if (remainingDays < businessDays) {
        return errorResponse(`Insufficient leave balance. Available: ${remainingDays} days, Requested: ${businessDays} days`, 400);
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const statement = env.DB.prepare(`
        INSERT INTO leave_requests
        (id, user_id, leave_type, start_date, end_date, status, reason, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
      `).bind(
        id,
        body.user_id,
        body.leave_type,
        body.start_date,
        body.end_date,
        body.reason || null,
        now,
        now
      );

      await statement.run();

      const newRequest: LeaveRequest = {
        id,
        user_id: body.user_id,
        leave_type: body.leave_type,
        start_date: body.start_date,
        end_date: body.end_date,
        status: 'pending',
        reason: body.reason,
        created_at: now,
        updated_at: now,
      };

      return jsonResponse({ request: newRequest, business_days: businessDays }, { status: 201 });
    } catch (error) {
      return errorResponse("Failed to create leave request", 500);
    }
  });

  // PATCH /v1/leave-requests/:id - Update leave request status
  router.on("PATCH", "/v1/leave-requests/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };
      const body = await parseBody<{
        status: 'pending' | 'approved' | 'denied' | 'cancelled';
      }>(request);

      if (!body.status) {
        return errorResponse("status is required", 400);
      }

      // Get current request
      const currentStatement = env.DB.prepare(`
        SELECT user_id, leave_type, start_date, end_date, status
        FROM leave_requests
        WHERE id = ?
      `).bind(id);

      const currentRequest = await currentStatement.first<{
        user_id: string;
        leave_type: string;
        start_date: string;
        end_date: string;
        status: string;
      }>();

      if (!currentRequest) {
        return errorResponse("Leave request not found", 404);
      }

      const now = new Date().toISOString();

      // Update request status
      const updateStatement = env.DB.prepare(`
        UPDATE leave_requests
        SET status = ?, updated_at = ?
        WHERE id = ?
      `).bind(body.status, now, id);

      await updateStatement.run();

      // If approved, update leave balance
      if (body.status === 'approved' && currentRequest.status === 'pending') {
        const startDate = new Date(currentRequest.start_date);
        const endDate = new Date(currentRequest.end_date);
        let businessDays = 0;
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDays++;
          }
        }

        const year = startDate.getFullYear();
        const balanceUpdateStatement = env.DB.prepare(`
          UPDATE leave_balances
          SET used_days = used_days + ?, updated_at = ?
          WHERE user_id = ? AND year = ? AND leave_type = ?
        `).bind(businessDays, now, currentRequest.user_id, year, currentRequest.leave_type);

        await balanceUpdateStatement.run();
      }

      // If cancelled or denied, and was previously approved, restore balance
      if ((body.status === 'cancelled' || body.status === 'denied') && currentRequest.status === 'approved') {
        const startDate = new Date(currentRequest.start_date);
        const endDate = new Date(currentRequest.end_date);
        let businessDays = 0;
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDays++;
          }
        }

        const year = startDate.getFullYear();
        const balanceRestoreStatement = env.DB.prepare(`
          UPDATE leave_balances
          SET used_days = used_days - ?, updated_at = ?
          WHERE user_id = ? AND year = ? AND leave_type = ?
        `).bind(businessDays, now, currentRequest.user_id, year, currentRequest.leave_type);

        await balanceRestoreStatement.run();
      }

      // Fetch updated request
      const updatedStatement = env.DB.prepare(`
        SELECT id, user_id, leave_type, start_date, end_date, status, reason, created_at, updated_at
        FROM leave_requests
        WHERE id = ?
      `).bind(id);

      const updatedRequest = await updatedStatement.first<LeaveRequest>();

      return jsonResponse({ request: updatedRequest });
    } catch (error) {
      return errorResponse("Failed to update leave request", 500);
    }
  });
}

