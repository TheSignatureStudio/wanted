import { Router } from "../lib/router";
import type { Env } from "../types";

import { registerHealthRoutes } from "./health";
import { registerRemoteRoutes } from "./remoteSchedules";
import { registerRoomRoutes } from "./rooms";
import { registerWorkLocationRoutes } from "./workLocations";

export function createRouter() {
  const router = new Router();

  registerHealthRoutes(router);
  registerRoomRoutes(router);
  registerWorkLocationRoutes(router);
  registerRemoteRoutes(router);

  router.on("GET", "/", (_req, env: Env) =>
    new Response(
      JSON.stringify({
        service: "Wanted Attendance API",
        version: env.APP_VERSION,
        docs: "/docs",
      }),
      {
        headers: { "content-type": "application/json" },
      }
    )
  );

  return router;
}

