export interface Env {
  DB: D1Database;
  APP_VERSION: string;
}

export type Handler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext
) => Promise<Response> | Response;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

