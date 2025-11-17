import type { Router } from "../lib/router";
import type { Env } from "../types";

type RemoteSchedule = {
  id: string;
  userId: string;
  workDate: string;
  status: "pending" | "approved" | "denied";
  reason: string | null;
};

export function registerRemoteRoutes(router: Router) {
  router.on("GET", "/v1/remote-schedules", async (request, env) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const schedules = await fetchRemoteSchedules(env, { startDate, endDate });
    return json(schedules);
  });
}

async function fetchRemoteSchedules(
  env: Env,
  filter: { startDate: string | null; endDate: string | null }
): Promise<RemoteSchedule[]> {
  let query = `SELECT id, user_id as userId, work_date as workDate, status, reason
               FROM remote_schedules
               WHERE archived = 0`;
  const params: (string | number)[] = [];

  if (filter.startDate) {
    query += " AND work_date >= ?";
    params.push(filter.startDate);
  }

  if (filter.endDate) {
    query += " AND work_date <= ?";
    params.push(filter.endDate);
  }

  query += " ORDER BY work_date ASC LIMIT 200";

  const statement = env.DB.prepare(query).bind(...params);
  const result = await statement.all<RemoteSchedule>();

  return result.results ?? [];
}

function json(payload: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

