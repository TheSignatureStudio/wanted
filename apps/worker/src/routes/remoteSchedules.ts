import type { Router } from "../lib/router";
import type { Env, RemoteSchedule } from "../types";
import { jsonResponse, errorResponse, parseBody } from "../lib/utils";

export function registerRemoteRoutes(router: Router) {
  // GET /v1/remote-schedules - List remote schedules with optional filters
  router.on("GET", "/v1/remote-schedules", async (request, env) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const status = url.searchParams.get("status");

      let query = `SELECT id, user_id, work_date, status, reason, archived, created_at, updated_at
                   FROM remote_schedules
                   WHERE archived = 0`;
      const params: (string | number)[] = [];

      if (userId) {
        query += " AND user_id = ?";
        params.push(userId);
      }

      if (startDate) {
        query += " AND work_date >= ?";
        params.push(startDate);
      }

      if (endDate) {
        query += " AND work_date <= ?";
        params.push(endDate);
      }

      if (status) {
        query += " AND status = ?";
        params.push(status);
      }

      query += " ORDER BY work_date DESC LIMIT 200";

      const statement = env.DB.prepare(query).bind(...params);
      const result = await statement.all<RemoteSchedule>();

      return jsonResponse({ schedules: result.results ?? [] });
    } catch (error) {
      return errorResponse("Failed to fetch remote schedules", 500);
    }
  });

  // GET /v1/remote-schedules/:id - Get specific remote schedule
  router.on("GET", "/v1/remote-schedules/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };
      
      const statement = env.DB.prepare(`
        SELECT id, user_id, work_date, status, reason, archived, created_at, updated_at
        FROM remote_schedules
        WHERE id = ? AND archived = 0
      `).bind(id);

      const result = await statement.first<RemoteSchedule>();

      if (!result) {
        return errorResponse("Remote schedule not found", 404);
      }

      return jsonResponse({ schedule: result });
    } catch (error) {
      return errorResponse("Failed to fetch remote schedule", 500);
    }
  });

  // POST /v1/remote-schedules - Create a new remote schedule
  router.on("POST", "/v1/remote-schedules", async (request, env) => {
    try {
      const body = await parseBody<{
        user_id: string;
        work_date: string;
        reason?: string;
      }>(request);

      if (!body.user_id || !body.work_date) {
        return errorResponse("user_id and work_date are required", 400);
      }

      // Check if schedule already exists for this user and date
      const existingStatement = env.DB.prepare(`
        SELECT id FROM remote_schedules
        WHERE user_id = ? AND work_date = ? AND archived = 0
      `).bind(body.user_id, body.work_date);

      const existing = await existingStatement.first();

      if (existing) {
        return errorResponse("Remote schedule already exists for this date", 409);
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const statement = env.DB.prepare(`
        INSERT INTO remote_schedules 
        (id, user_id, work_date, status, reason, archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(
        id,
        body.user_id,
        body.work_date,
        'pending',
        body.reason || null,
        now,
        now
      );

      await statement.run();

      const newSchedule: RemoteSchedule = {
        id,
        user_id: body.user_id,
        work_date: body.work_date,
        status: 'pending',
        reason: body.reason,
        archived: 0,
        created_at: now,
        updated_at: now,
      };

      return jsonResponse({ schedule: newSchedule }, { status: 201 });
    } catch (error) {
      return errorResponse("Failed to create remote schedule", 500);
    }
  });

  // PATCH /v1/remote-schedules/:id - Update remote schedule status
  router.on("PATCH", "/v1/remote-schedules/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };
      const body = await parseBody<{
        status?: 'pending' | 'approved' | 'denied';
        reason?: string;
      }>(request);

      if (!body.status && !body.reason) {
        return errorResponse("At least one field to update is required", 400);
      }

      const now = new Date().toISOString();
      const updates: string[] = [];
      const bindParams: (string | number)[] = [];

      if (body.status) {
        updates.push("status = ?");
        bindParams.push(body.status);
      }

      if (body.reason !== undefined) {
        updates.push("reason = ?");
        bindParams.push(body.reason);
      }

      updates.push("updated_at = ?");
      bindParams.push(now);

      bindParams.push(id);

      const statement = env.DB.prepare(`
        UPDATE remote_schedules
        SET ${updates.join(", ")}
        WHERE id = ? AND archived = 0
      `).bind(...bindParams);

      const result = await statement.run();

      if (result.meta.changes === 0) {
        return errorResponse("Remote schedule not found", 404);
      }

      // Fetch updated schedule
      const updatedStatement = env.DB.prepare(`
        SELECT id, user_id, work_date, status, reason, archived, created_at, updated_at
        FROM remote_schedules
        WHERE id = ?
      `).bind(id);

      const updatedSchedule = await updatedStatement.first<RemoteSchedule>();

      return jsonResponse({ schedule: updatedSchedule });
    } catch (error) {
      return errorResponse("Failed to update remote schedule", 500);
    }
  });

  // DELETE /v1/remote-schedules/:id - Archive remote schedule
  router.on("DELETE", "/v1/remote-schedules/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };
      const now = new Date().toISOString();

      const statement = env.DB.prepare(`
        UPDATE remote_schedules
        SET archived = 1, updated_at = ?
        WHERE id = ? AND archived = 0
      `).bind(now, id);

      const result = await statement.run();

      if (result.meta.changes === 0) {
        return errorResponse("Remote schedule not found", 404);
      }

      return jsonResponse({ message: "Remote schedule archived successfully" });
    } catch (error) {
      return errorResponse("Failed to archive remote schedule", 500);
    }
  });
}

