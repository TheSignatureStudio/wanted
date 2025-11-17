import type { Router } from "../lib/router";
import type { Env } from "../types";
import { jsonResponse, errorResponse, calculateWeeklyHours, getWeekStart } from "../lib/utils";

export function registerNotificationRoutes(router: Router) {
  // GET /v1/notifications/weekly-alert/:userId - Check if user is approaching 52 hour limit
  router.on("GET", "/v1/notifications/weekly-alert/:userId", async (request, env, ctx, params) => {
    try {
      const { userId } = params as { userId: string };
      const now = new Date();
      const weekStart = getWeekStart(now);
      
      // Get current week's attendance
      const statement = env.DB.prepare(`
        SELECT clock_in, clock_out
        FROM attendance_logs
        WHERE user_id = ? AND clock_in >= ?
        ORDER BY clock_in ASC
      `).bind(userId, weekStart);

      const result = await statement.all<{ clock_in: string; clock_out?: string }>();
      const logs = result.results ?? [];

      const totalMinutes = calculateWeeklyHours(logs);
      const totalHours = totalMinutes / 60;
      const maxWeeklyHours = 52;
      const warningThreshold = 45; // 45시간부터 경고
      const criticalThreshold = 50; // 50시간부터 심각 경고

      let alertLevel: 'none' | 'warning' | 'critical' | 'exceeded' = 'none';
      let message = '';

      if (totalHours >= maxWeeklyHours) {
        alertLevel = 'exceeded';
        message = `주 52시간 근무 한도를 초과했습니다! 현재 ${totalHours.toFixed(1)}시간 근무 중입니다.`;
      } else if (totalHours >= criticalThreshold) {
        alertLevel = 'critical';
        message = `주 52시간 근무 한도에 가까워졌습니다. 현재 ${totalHours.toFixed(1)}시간 근무 중 (${(maxWeeklyHours - totalHours).toFixed(1)}시간 남음)`;
      } else if (totalHours >= warningThreshold) {
        alertLevel = 'warning';
        message = `주간 근무시간이 증가하고 있습니다. 현재 ${totalHours.toFixed(1)}시간 근무 중 (${(maxWeeklyHours - totalHours).toFixed(1)}시간 남음)`;
      } else {
        message = `정상 범위입니다. 현재 ${totalHours.toFixed(1)}시간 근무 중`;
      }

      return jsonResponse({
        alert_level: alertLevel,
        message,
        total_hours: parseFloat(totalHours.toFixed(1)),
        max_hours: maxWeeklyHours,
        remaining_hours: parseFloat((maxWeeklyHours - totalHours).toFixed(1)),
        week_start: weekStart,
        logs_count: logs.length,
      });
    } catch (error) {
      return errorResponse("Failed to check weekly alert", 500);
    }
  });

  // GET /v1/notifications/leave-reminder/:userId - Check leave balance and remind
  router.on("GET", "/v1/notifications/leave-reminder/:userId", async (request, env, ctx, params) => {
    try {
      const { userId } = params as { userId: string };
      const currentYear = new Date().getFullYear();

      // Get leave balances for current year
      const statement = env.DB.prepare(`
        SELECT leave_type, allowance_days, used_days
        FROM leave_balances
        WHERE user_id = ? AND year = ?
      `).bind(userId, currentYear);

      const result = await statement.all<{
        leave_type: string;
        allowance_days: number;
        used_days: number;
      }>();

      const balances = result.results ?? [];
      const reminders: Array<{
        leave_type: string;
        remaining_days: number;
        alert_level: 'none' | 'low' | 'critical';
        message: string;
      }> = [];

      for (const balance of balances) {
        const remainingDays = balance.allowance_days - balance.used_days;
        let alertLevel: 'none' | 'low' | 'critical' = 'none';
        let message = '';

        if (remainingDays <= 0) {
          alertLevel = 'critical';
          message = `${balance.leave_type} 휴가가 모두 소진되었습니다.`;
        } else if (remainingDays <= 3) {
          alertLevel = 'critical';
          message = `${balance.leave_type} 휴가가 ${remainingDays}일 남았습니다. 조속히 사용하세요.`;
        } else if (remainingDays <= 7) {
          alertLevel = 'low';
          message = `${balance.leave_type} 휴가가 ${remainingDays}일 남았습니다.`;
        } else {
          message = `${balance.leave_type} 휴가가 ${remainingDays}일 남았습니다.`;
        }

        reminders.push({
          leave_type: balance.leave_type,
          remaining_days: remainingDays,
          alert_level: alertLevel,
          message,
        });
      }

      return jsonResponse({
        year: currentYear,
        reminders,
      });
    } catch (error) {
      return errorResponse("Failed to check leave reminder", 500);
    }
  });

  // GET /v1/notifications/pending-approvals/:userId - Get pending approvals for managers
  router.on("GET", "/v1/notifications/pending-approvals/:userId", async (request, env, ctx, params) => {
    try {
      const { userId } = params as { userId: string };

      // Get user role
      const userStatement = env.DB.prepare(`
        SELECT role FROM users WHERE id = ?
      `).bind(userId);

      const user = await userStatement.first<{ role: string }>();

      if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
        return jsonResponse({
          pending_count: 0,
          message: "관리자 권한이 필요합니다.",
        });
      }

      // Count pending remote schedules
      const remoteStatement = env.DB.prepare(`
        SELECT COUNT(*) as count
        FROM remote_schedules
        WHERE status = 'pending' AND archived = 0
      `);

      const remoteCount = await remoteStatement.first<{ count: number }>();

      // Count pending leave requests
      const leaveStatement = env.DB.prepare(`
        SELECT COUNT(*) as count
        FROM leave_requests
        WHERE status = 'pending'
      `);

      const leaveCount = await leaveStatement.first<{ count: number }>();

      const totalPending = (remoteCount?.count || 0) + (leaveCount?.count || 0);

      return jsonResponse({
        pending_count: totalPending,
        remote_schedules: remoteCount?.count || 0,
        leave_requests: leaveCount?.count || 0,
        message: totalPending > 0 ? `${totalPending}건의 승인 대기 중인 요청이 있습니다.` : "대기 중인 요청이 없습니다.",
      });
    } catch (error) {
      return errorResponse("Failed to check pending approvals", 500);
    }
  });

  // POST /v1/notifications/subscribe - Subscribe to push notifications (webhook endpoint)
  router.on("POST", "/v1/notifications/subscribe", async (request, env) => {
    try {
      // TODO: Implement push notification subscription logic
      // This would typically store the subscription details in the database
      // and be used with a service like Firebase Cloud Messaging or Web Push API
      
      return jsonResponse({
        message: "Push notification subscription not yet implemented",
        status: "coming_soon",
      });
    } catch (error) {
      return errorResponse("Failed to subscribe to notifications", 500);
    }
  });
}

