import type { Env, Team } from '../types';
import { generateId, getCurrentTimestamp, parseBody, jsonResponse, errorResponse } from '../lib/utils';

/**
 * GET /api/teams - List all teams
 */
export async function listTeams(request: Request, env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare('SELECT * FROM teams ORDER BY name ASC').all();
    return jsonResponse({ teams: result.results });
  } catch (error) {
    console.error('Error listing teams:', error);
    return errorResponse('Failed to list teams', 500);
  }
}

/**
 * GET /api/teams/:id - Get team by ID
 */
export async function getTeam(request: Request, env: Env, ctx: ExecutionContext, params?: Record<string, string>): Promise<Response> {
  const id = params?.id;
  if (!id) {
    return errorResponse('Team ID is required', 400);
  }
  try {
    const team = await env.DB.prepare('SELECT * FROM teams WHERE id = ?')
      .bind(id)
      .first();

    if (!team) {
      return errorResponse('Team not found', 404);
    }

    return jsonResponse({ team });
  } catch (error) {
    console.error('Error getting team:', error);
    return errorResponse('Failed to get team', 500);
  }
}

/**
 * POST /api/teams - Create new team
 */
export async function createTeam(request: Request, env: Env): Promise<Response> {
  try {
    const body = await parseBody<Partial<Team>>(request);

    if (!body.name) {
      return errorResponse('Team name is required');
    }

    const id = generateId();
    const now = getCurrentTimestamp();

    await env.DB.prepare(`
      INSERT INTO teams (id, name, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `)
      .bind(id, body.name, body.parent_id || null, now, now)
      .run();

    const team = await env.DB.prepare('SELECT * FROM teams WHERE id = ?')
      .bind(id)
      .first();

    return jsonResponse({ team }, 201);
  } catch (error) {
    console.error('Error creating team:', error);
    return errorResponse('Failed to create team', 500);
  }
}

/**
 * PUT /api/teams/:id - Update team
 */
export async function updateTeam(request: Request, env: Env, ctx: ExecutionContext, params?: Record<string, string>): Promise<Response> {
  try {
    const id = params?.id;
    if (!id) {
      return errorResponse('Team ID is required', 400);
    }

    const body = await parseBody<Partial<Team>>(request);

    const existing = await env.DB.prepare('SELECT * FROM teams WHERE id = ?')
      .bind(id)
      .first();

    if (!existing) {
      return errorResponse('Team not found', 404);
    }

    const now = getCurrentTimestamp();
    const updates: string[] = [];
    const params: (string | null)[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      params.push(body.name);
    }
    if (body.parent_id !== undefined) {
      updates.push('parent_id = ?');
      params.push(body.parent_id || null);
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update');
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    await env.DB.prepare(`
      UPDATE teams SET ${updates.join(', ')} WHERE id = ?
    `)
      .bind(...params)
      .run();

    const team = await env.DB.prepare('SELECT * FROM teams WHERE id = ?')
      .bind(id)
      .first();

    return jsonResponse({ team });
  } catch (error) {
    console.error('Error updating team:', error);
    return errorResponse('Failed to update team', 500);
  }
}

/**
 * DELETE /api/teams/:id - Delete team
 */
export async function deleteTeam(request: Request, env: Env, ctx: ExecutionContext, params?: Record<string, string>): Promise<Response> {
  try {
    const id = params?.id;
    if (!id) {
      return errorResponse('Team ID is required', 400);
    }

    const team = await env.DB.prepare('SELECT * FROM teams WHERE id = ?')
      .bind(id)
      .first();

    if (!team) {
      return errorResponse('Team not found', 404);
    }

    // Check if team has members
    const members = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE team_id = ?')
      .bind(id)
      .first();

    if (members && (members.count as number) > 0) {
      return errorResponse('Cannot delete team with members', 400);
    }

    await env.DB.prepare('DELETE FROM teams WHERE id = ?')
      .bind(id)
      .run();

    return jsonResponse({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return errorResponse('Failed to delete team', 500);
  }
}

