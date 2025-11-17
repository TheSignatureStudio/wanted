import type { Env, User } from '../types';
import { generateId, getCurrentTimestamp, parseBody, jsonResponse, errorResponse } from '../lib/utils';

/**
 * GET /api/users - List all users
 */
export async function listUsers(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const teamId = url.searchParams.get('team_id');
    const role = url.searchParams.get('role');

    let query = 'SELECT * FROM users WHERE 1=1';
    const params: string[] = [];

    if (teamId) {
      query += ' AND team_id = ?';
      params.push(teamId);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = params.length > 0
      ? env.DB.prepare(query).bind(...params)
      : env.DB.prepare(query);

    const result = await stmt.all();

    return jsonResponse({ users: result.results });
  } catch (error) {
    console.error('Error listing users:', error);
    return errorResponse('Failed to list users', 500);
  }
}

/**
 * GET /api/users/:id - Get user by ID
 */
export async function getUser(request: Request, env: Env, ctx: ExecutionContext, params?: Record<string, string>): Promise<Response> {
  try {
    const id = params?.id;
    if (!id) {
      return errorResponse('User ID is required', 400);
    }

    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first();

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return jsonResponse({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    return errorResponse('Failed to get user', 500);
  }
}

/**
 * POST /api/users - Create new user
 */
export async function createUser(request: Request, env: Env): Promise<Response> {
  try {
    const body = await parseBody<Partial<User>>(request);

    if (!body.email || !body.name) {
      return errorResponse('Email and name are required');
    }

    const id = generateId();
    const now = getCurrentTimestamp();

    await env.DB.prepare(`
      INSERT INTO users (id, email, name, role, team_id, employment_type, timezone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        id,
        body.email,
        body.name,
        body.role || 'STAFF',
        body.team_id || null,
        body.employment_type || 'FULL_TIME',
        body.timezone || 'Asia/Seoul',
        now,
        now
      )
      .run();

    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first();

    return jsonResponse({ user }, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return errorResponse('Failed to create user', 500);
  }
}

/**
 * PUT /api/users/:id - Update user
 */
export async function updateUser(request: Request, env: Env, ctx: ExecutionContext, params?: Record<string, string>): Promise<Response> {
  try {
    const id = params?.id;
    if (!id) {
      return errorResponse('User ID is required', 400);
    }

    const body = await parseBody<Partial<User>>(request);

    const existing = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first();

    if (!existing) {
      return errorResponse('User not found', 404);
    }

    const now = getCurrentTimestamp();
    const updates: string[] = [];
    const params: (string | null)[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      params.push(body.name);
    }
    if (body.role !== undefined) {
      updates.push('role = ?');
      params.push(body.role);
    }
    if (body.team_id !== undefined) {
      updates.push('team_id = ?');
      params.push(body.team_id || null);
    }
    if (body.employment_type !== undefined) {
      updates.push('employment_type = ?');
      params.push(body.employment_type);
    }
    if (body.timezone !== undefined) {
      updates.push('timezone = ?');
      params.push(body.timezone);
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update');
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await env.DB.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `)
      .bind(...params)
      .run();

    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first();

    return jsonResponse({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return errorResponse('Failed to update user', 500);
  }
}

/**
 * DELETE /api/users/:id - Delete user
 */
export async function deleteUser(request: Request, env: Env, ctx: ExecutionContext, params?: Record<string, string>): Promise<Response> {
  try {
    const id = params?.id;
    if (!id) {
      return errorResponse('User ID is required', 400);
    }

    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first();

    if (!user) {
      return errorResponse('User not found', 404);
    }

    await env.DB.prepare('DELETE FROM users WHERE id = ?')
      .bind(id)
      .run();

    return jsonResponse({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return errorResponse('Failed to delete user', 500);
  }
}

