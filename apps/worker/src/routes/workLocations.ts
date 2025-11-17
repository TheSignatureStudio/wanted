import type { Router } from "../lib/router";
import type { Env } from "../types";

type WorkLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  allowedModes: string[];
};

export function registerWorkLocationRoutes(router: Router) {
  router.on("GET", "/v1/work-locations", async (_request, env) => {
    const locations = await fetchWorkLocations(env);
    return json(locations);
  });
}

async function fetchWorkLocations(env: Env): Promise<WorkLocation[]> {
  const statement = env.DB.prepare(
    `SELECT
      id,
      name,
      latitude,
      longitude,
      radius_meters as radiusMeters,
      allowed_modes as allowedModes
     FROM work_locations
     WHERE archived = 0
     ORDER BY name ASC`
  );

  const result = await statement.all<WorkLocation & { allowedModes: string }>();

  if (!result.results) {
    return [];
  }

  return result.results.map((row) => ({
    ...row,
    allowedModes: Array.isArray(row.allowedModes)
      ? (row.allowedModes as string[])
      : JSON.parse((row.allowedModes as unknown as string) ?? "[]"),
  }));
}

function json(payload: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

