import { Router } from '../lib/router';
import { health } from './health';

// User routes
import { listUsers, getUser, createUser, updateUser, deleteUser } from './users';

// Team routes
import { listTeams, getTeam, createTeam, updateTeam, deleteTeam } from './teams';

// Attendance routes
import { listAttendance, getAttendance, clockIn, clockOut, getWeeklySummary } from './attendance';

// Remote schedules routes
import { registerRemoteRoutes } from './remoteSchedules';

// Resources and reservations routes
import { registerRoomRoutes } from './rooms';

// Leave routes
import { registerLeaveRoutes } from './leaves';

export function registerRoutes(router: Router) {
  // Health check
  router.get('/api/health', health);

  // User routes
  router.get('/api/users', listUsers);
  router.get('/api/users/:id', getUser);
  router.post('/api/users', createUser);
  router.put('/api/users/:id', (req, env, ctx, params) => updateUser(req, env, ctx, params));
  router.delete('/api/users/:id', (req, env, ctx, params) => deleteUser(req, env, ctx, params));

  // Team routes
  router.get('/api/teams', listTeams);
  router.get('/api/teams/:id', getTeam);
  router.post('/api/teams', createTeam);
  router.put('/api/teams/:id', (req, env, ctx, params) => updateTeam(req, env, ctx, params));
  router.delete('/api/teams/:id', (req, env, ctx, params) => deleteTeam(req, env, ctx, params));

  // Attendance routes
  router.get('/api/attendance', listAttendance);
  router.get('/api/attendance/:id', getAttendance);
  router.post('/api/attendance/clock-in', clockIn);
  router.post('/api/attendance/clock-out', clockOut);
  router.get('/api/attendance/summary/:userId', (req, env, ctx, params) => getWeeklySummary(req, env, ctx, params));

  // Register modular routes
  registerRemoteRoutes(router);
  registerRoomRoutes(router);
  registerLeaveRoutes(router);
}
