import type { Env, Handler } from "../types";

type Route = {
  method: string;
  pattern: URLPattern;
  handler: Handler;
};

export class Router {
  private routes: Route[] = [];

  on(method: string, pathname: string, handler: Handler) {
    this.routes.push({
      method: method.toUpperCase(),
      pattern: new URLPattern({ pathname }),
      handler,
    });
    return this;
  }

  async handle(request: Request, env: Env, ctx: ExecutionContext) {
    const { pathname } = new URL(request.url);

    for (const route of this.routes) {
      if (
        (route.method === "*" || route.method === request.method) &&
        route.pattern.test({ pathname })
      ) {
        return route.handler(request, env, ctx);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Route not found",
        path: pathname,
      }),
      {
        status: 404,
        headers: { "content-type": "application/json" },
      }
    );
  }
}

