import { Router } from "./lib/router";
import { registerRoutes } from "./routes";
import type { Env } from "./types";

const router = new Router();
registerRoutes(router);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};

