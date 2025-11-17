export interface Env {
  DB: D1Database;
  APP_VERSION: string;
}

type HealthPayload = {
  status: "ok";
  version: string;
  d1: "reachable" | "unreachable";
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return handleHealth(env);
    }

    return new Response(
      JSON.stringify({
        message: "Wanted Attendance API",
        path: url.pathname,
      }),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
  },
};

async function handleHealth(env: Env): Promise<Response> {
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

