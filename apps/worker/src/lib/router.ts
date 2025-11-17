import type { Env, Handler } from "../types";

type RouteHandler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  params?: Record<string, string>
) => Promise<Response> | Response;

type Route = {
  method: string;
  pattern: URLPattern;
  handler: RouteHandler;
};

export class Router {
  private routes: Route[] = [];

  on(method: string, pathname: string, handler: RouteHandler) {
    this.routes.push({
      method: method.toUpperCase(),
      pattern: new URLPattern({ pathname }),
      handler,
    });
    return this;
  }

  get(pathname: string, handler: RouteHandler) {
    return this.on('GET', pathname, handler);
  }

  post(pathname: string, handler: RouteHandler) {
    return this.on('POST', pathname, handler);
  }

  put(pathname: string, handler: RouteHandler) {
    return this.on('PUT', pathname, handler);
  }

  delete(pathname: string, handler: RouteHandler) {
    return this.on('DELETE', pathname, handler);
  }

  async handle(request: Request, env: Env, ctx: ExecutionContext) {
    // Handle OPTIONS for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const { pathname } = url;

    for (const route of this.routes) {
      if (
        (route.method === "*" || route.method === request.method) &&
        route.pattern.test({ pathname })
      ) {
        const match = route.pattern.exec({ pathname });
        const params = match?.pathname.groups || {};
        return route.handler(request, env, ctx, params);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Route not found",
        path: pathname,
      }),
      {
        status: 404,
        headers: { 
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

