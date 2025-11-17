import type { Router } from "../lib/router";
import type { Env } from "../types";

type HealthPayload = {
  status: "ok";
  version: string;
  d1: "reachable" | "unreachable";
};

export function registerHealthRoutes(router: Router) {
  router.on("GET", "/health", async (_request, env) => {
    return createHealthResponse(env);
  });
}

async function createHealthResponse(env: Env) {
  let d1Status: HealthPayload["d1"] = "unreachable";
  try {
    await env.DB.prepare("SELECT 1 as ok").first();
    d1Status = "reachable";
  } catch (error) {
    console.error("D1 health check failed", error);
  }

  const payload: HealthPayload = {
    status: "ok",
    version: env.APP_VERSION,
    d1: d1Status,
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

