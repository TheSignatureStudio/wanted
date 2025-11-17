import type { Router } from "../lib/router";
import type { Env, Resource, Reservation } from "../types";
import { jsonResponse, errorResponse, parseBody } from "../lib/utils";

export function registerRoomRoutes(router: Router) {
  // GET /v1/resources - List all resources (rooms, Zoom accounts, equipment)
  router.on("GET", "/v1/resources", async (request, env) => {
    try {
      const url = new URL(request.url);
      const type = url.searchParams.get("type"); // MEETING_ROOM, ZOOM_ACCOUNT, EQUIPMENT

      let query = `SELECT id, name, type, capacity, has_zoom, timezone, metadata, archived, created_at, updated_at
                   FROM resources
                   WHERE archived = 0`;
      const params: string[] = [];

      if (type) {
        query += " AND type = ?";
        params.push(type);
      }

      query += " ORDER BY name ASC LIMIT 200";

      const statement = env.DB.prepare(query).bind(...params);
      const result = await statement.all<Resource>();

      return jsonResponse({ resources: result.results ?? [] });
    } catch (error) {
      return errorResponse("Failed to fetch resources", 500);
    }
  });

  // GET /v1/resources/:id - Get specific resource
  router.on("GET", "/v1/resources/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };

      const statement = env.DB.prepare(`
        SELECT id, name, type, capacity, has_zoom, timezone, metadata, archived, created_at, updated_at
        FROM resources
        WHERE id = ? AND archived = 0
      `).bind(id);

      const result = await statement.first<Resource>();

      if (!result) {
        return errorResponse("Resource not found", 404);
      }

      return jsonResponse({ resource: result });
    } catch (error) {
      return errorResponse("Failed to fetch resource", 500);
    }
  });

  // POST /v1/resources - Create a new resource (admin only)
  router.on("POST", "/v1/resources", async (request, env) => {
    try {
      const body = await parseBody<{
        name: string;
        type: 'MEETING_ROOM' | 'ZOOM_ACCOUNT' | 'EQUIPMENT';
        capacity?: number;
        has_zoom?: boolean;
        timezone?: string;
        metadata?: Record<string, unknown>;
      }>(request);

      if (!body.name || !body.type) {
        return errorResponse("name and type are required", 400);
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const statement = env.DB.prepare(`
        INSERT INTO resources
        (id, name, type, capacity, has_zoom, timezone, metadata, archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(
        id,
        body.name,
        body.type,
        body.capacity || null,
        body.has_zoom ? 1 : 0,
        body.timezone || 'UTC',
        body.metadata ? JSON.stringify(body.metadata) : null,
        now,
        now
      );

      await statement.run();

      const newResource: Resource = {
        id,
        name: body.name,
        type: body.type,
        capacity: body.capacity,
        has_zoom: body.has_zoom ? 1 : 0,
        timezone: body.timezone || 'UTC',
        metadata: body.metadata ? JSON.stringify(body.metadata) : undefined,
        archived: 0,
        created_at: now,
        updated_at: now,
      };

      return jsonResponse({ resource: newResource }, { status: 201 });
    } catch (error) {
      return errorResponse("Failed to create resource", 500);
    }
  });

  // PATCH /v1/resources/:id - Update resource (admin only)
  router.on("PATCH", "/v1/resources/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };
      const body = await parseBody<{
        name?: string;
        capacity?: number;
        has_zoom?: boolean;
        timezone?: string;
        metadata?: Record<string, unknown>;
      }>(request);

      if (!body.name && !body.capacity && body.has_zoom === undefined && !body.timezone && !body.metadata) {
        return errorResponse("At least one field to update is required", 400);
      }

      const now = new Date().toISOString();
      const updates: string[] = [];
      const bindParams: (string | number)[] = [];

      if (body.name) {
        updates.push("name = ?");
        bindParams.push(body.name);
      }

      if (body.capacity !== undefined) {
        updates.push("capacity = ?");
        bindParams.push(body.capacity);
      }

      if (body.has_zoom !== undefined) {
        updates.push("has_zoom = ?");
        bindParams.push(body.has_zoom ? 1 : 0);
      }

      if (body.timezone) {
        updates.push("timezone = ?");
        bindParams.push(body.timezone);
      }

      if (body.metadata) {
        updates.push("metadata = ?");
        bindParams.push(JSON.stringify(body.metadata));
      }

      updates.push("updated_at = ?");
      bindParams.push(now);

      bindParams.push(id);

      const statement = env.DB.prepare(`
        UPDATE resources
        SET ${updates.join(", ")}
        WHERE id = ? AND archived = 0
      `).bind(...bindParams);

      const result = await statement.run();

      if (result.meta.changes === 0) {
        return errorResponse("Resource not found", 404);
      }

      // Fetch updated resource
      const updatedStatement = env.DB.prepare(`
        SELECT id, name, type, capacity, has_zoom, timezone, metadata, archived, created_at, updated_at
        FROM resources
        WHERE id = ?
      `).bind(id);

      const updatedResource = await updatedStatement.first<Resource>();

      return jsonResponse({ resource: updatedResource });
    } catch (error) {
      return errorResponse("Failed to update resource", 500);
    }
  });

  // DELETE /v1/resources/:id - Archive resource (admin only)
  router.on("DELETE", "/v1/resources/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };
      const now = new Date().toISOString();

      const statement = env.DB.prepare(`
        UPDATE resources
        SET archived = 1, updated_at = ?
        WHERE id = ? AND archived = 0
      `).bind(now, id);

      const result = await statement.run();

      if (result.meta.changes === 0) {
        return errorResponse("Resource not found", 404);
      }

      return jsonResponse({ message: "Resource archived successfully" });
    } catch (error) {
      return errorResponse("Failed to archive resource", 500);
    }
  });

  // GET /v1/reservations - List reservations
  router.on("GET", "/v1/reservations", async (request, env) => {
    try {
      const url = new URL(request.url);
      const resourceId = url.searchParams.get("resourceId");
      const organizerId = url.searchParams.get("organizerId");
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const status = url.searchParams.get("status");

      let query = `SELECT id, resource_id, organizer_id, starts_at, ends_at, status, agenda, attendees, created_at, updated_at
                   FROM reservations
                   WHERE 1=1`;
      const params: (string | number)[] = [];

      if (resourceId) {
        query += " AND resource_id = ?";
        params.push(resourceId);
      }

      if (organizerId) {
        query += " AND organizer_id = ?";
        params.push(organizerId);
      }

      if (startDate) {
        query += " AND ends_at >= ?";
        params.push(startDate);
      }

      if (endDate) {
        query += " AND starts_at <= ?";
        params.push(endDate);
      }

      if (status) {
        query += " AND status = ?";
        params.push(status);
      }

      query += " ORDER BY starts_at ASC LIMIT 200";

      const statement = env.DB.prepare(query).bind(...params);
      const result = await statement.all<Reservation>();

      return jsonResponse({ reservations: result.results ?? [] });
    } catch (error) {
      return errorResponse("Failed to fetch reservations", 500);
    }
  });

  // GET /v1/reservations/:id - Get specific reservation
  router.on("GET", "/v1/reservations/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };

      const statement = env.DB.prepare(`
        SELECT id, resource_id, organizer_id, starts_at, ends_at, status, agenda, attendees, created_at, updated_at
        FROM reservations
        WHERE id = ?
      `).bind(id);

      const result = await statement.first<Reservation>();

      if (!result) {
        return errorResponse("Reservation not found", 404);
      }

      return jsonResponse({ reservation: result });
    } catch (error) {
      return errorResponse("Failed to fetch reservation", 500);
    }
  });

  // POST /v1/reservations - Create a new reservation
  router.on("POST", "/v1/reservations", async (request, env) => {
    try {
      const body = await parseBody<{
        resource_id: string;
        organizer_id: string;
        starts_at: string;
        ends_at: string;
        agenda?: string;
        attendees?: string[];
      }>(request);

      if (!body.resource_id || !body.organizer_id || !body.starts_at || !body.ends_at) {
        return errorResponse("resource_id, organizer_id, starts_at, and ends_at are required", 400);
      }

      // Check for conflicting reservations
      const conflictStatement = env.DB.prepare(`
        SELECT id FROM reservations
        WHERE resource_id = ?
          AND status IN ('pending', 'confirmed')
          AND (
            (starts_at < ? AND ends_at > ?) OR
            (starts_at < ? AND ends_at > ?) OR
            (starts_at >= ? AND ends_at <= ?)
          )
      `).bind(
        body.resource_id,
        body.ends_at, body.starts_at,
        body.ends_at, body.ends_at,
        body.starts_at, body.ends_at
      );

      const conflict = await conflictStatement.first();

      if (conflict) {
        return errorResponse("Resource is already reserved for the selected time", 409);
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const attendeesStr = body.attendees ? body.attendees.join(',') : '';

      const statement = env.DB.prepare(`
        INSERT INTO reservations
        (id, resource_id, organizer_id, starts_at, ends_at, status, agenda, attendees, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
      `).bind(
        id,
        body.resource_id,
        body.organizer_id,
        body.starts_at,
        body.ends_at,
        body.agenda || null,
        attendeesStr,
        now,
        now
      );

      await statement.run();

      const newReservation: Reservation = {
        id,
        resource_id: body.resource_id,
        organizer_id: body.organizer_id,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        status: 'pending',
        agenda: body.agenda,
        attendees: attendeesStr,
        created_at: now,
        updated_at: now,
      };

      return jsonResponse({ reservation: newReservation }, { status: 201 });
    } catch (error) {
      return errorResponse("Failed to create reservation", 500);
    }
  });

  // PATCH /v1/reservations/:id - Update reservation status or details
  router.on("PATCH", "/v1/reservations/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };
      const body = await parseBody<{
        status?: 'pending' | 'confirmed' | 'cancelled';
        agenda?: string;
        attendees?: string[];
      }>(request);

      if (!body.status && !body.agenda && !body.attendees) {
        return errorResponse("At least one field to update is required", 400);
      }

      const now = new Date().toISOString();
      const updates: string[] = [];
      const bindParams: (string | number)[] = [];

      if (body.status) {
        updates.push("status = ?");
        bindParams.push(body.status);
      }

      if (body.agenda !== undefined) {
        updates.push("agenda = ?");
        bindParams.push(body.agenda);
      }

      if (body.attendees) {
        updates.push("attendees = ?");
        bindParams.push(body.attendees.join(','));
      }

      updates.push("updated_at = ?");
      bindParams.push(now);

      bindParams.push(id);

      const statement = env.DB.prepare(`
        UPDATE reservations
        SET ${updates.join(", ")}
        WHERE id = ?
      `).bind(...bindParams);

      const result = await statement.run();

      if (result.meta.changes === 0) {
        return errorResponse("Reservation not found", 404);
      }

      // Fetch updated reservation
      const updatedStatement = env.DB.prepare(`
        SELECT id, resource_id, organizer_id, starts_at, ends_at, status, agenda, attendees, created_at, updated_at
        FROM reservations
        WHERE id = ?
      `).bind(id);

      const updatedReservation = await updatedStatement.first<Reservation>();

      return jsonResponse({ reservation: updatedReservation });
    } catch (error) {
      return errorResponse("Failed to update reservation", 500);
    }
  });

  // DELETE /v1/reservations/:id - Cancel reservation
  router.on("DELETE", "/v1/reservations/:id", async (request, env, ctx, params) => {
    try {
      const { id } = params as { id: string };
      const now = new Date().toISOString();

      const statement = env.DB.prepare(`
        UPDATE reservations
        SET status = 'cancelled', updated_at = ?
        WHERE id = ?
      `).bind(now, id);

      const result = await statement.run();

      if (result.meta.changes === 0) {
        return errorResponse("Reservation not found", 404);
      }

      return jsonResponse({ message: "Reservation cancelled successfully" });
    } catch (error) {
      return errorResponse("Failed to cancel reservation", 500);
    }
  });
}

