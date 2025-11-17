import type { Router } from "../lib/router";
import type { Env } from "../types";

type Room = {
  id: string;
  name: string;
  capacity: number;
  hasZoom: boolean;
  timezone: string;
};

export function registerRoomRoutes(router: Router) {
  router.on("GET", "/v1/rooms", async (_request, env) => {
    const rooms = await fetchRooms(env);
    return json(rooms);
  });
}

async function fetchRooms(env: Env): Promise<Room[]> {
  const statement = env.DB.prepare(
    `SELECT id, name, capacity, has_zoom as hasZoom, timezone
     FROM resources
     WHERE type = 'MEETING_ROOM'
     ORDER BY name ASC
     LIMIT 100`
  );

  const result = await statement.all<Room>();

  if (!result.results) {
    return [];
  }

  return result.results;
}

function json(payload: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

