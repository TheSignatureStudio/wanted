export interface Env {
  DB: D1Database;
  APP_VERSION?: string;
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

// User types
export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  team_id?: string;
  employment_type?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

// Work Location types
export interface WorkLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  allowed_modes: string;
  archived: number;
  created_at: string;
  updated_at: string;
}

// Attendance types
export type WorkMode = 'ONSITE' | 'REMOTE' | 'FIELD';

export interface AttendanceLog {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out?: string;
  work_mode: WorkMode;
  location_id?: string;
  verified: number;
  created_at: string;
  updated_at: string;
}

// Remote Schedule types
export type RemoteStatus = 'pending' | 'approved' | 'denied';

export interface RemoteSchedule {
  id: string;
  user_id: string;
  work_date: string;
  status: RemoteStatus;
  reason?: string;
  archived: number;
  created_at: string;
  updated_at: string;
}

// Resource types
export type ResourceType = 'MEETING_ROOM' | 'ZOOM_ACCOUNT' | 'EQUIPMENT';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity?: number;
  has_zoom: number;
  timezone: string;
  metadata?: string;
  archived: number;
  created_at: string;
  updated_at: string;
}

// Reservation types
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  id: string;
  resource_id: string;
  organizer_id: string;
  starts_at: string;
  ends_at: string;
  status: ReservationStatus;
  agenda?: string;
  attendees: string;
  created_at: string;
  updated_at: string;
}

// Leave types
export interface LeaveBalance {
  id: string;
  user_id: string;
  year: number;
  leave_type: string;
  allowance_days: number;
  used_days: number;
  created_at: string;
  updated_at: string;
}

export type LeaveRequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled';

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: LeaveRequestStatus;
  reason?: string;
  created_at: string;
  updated_at: string;
}

// Weekly Summary types
export interface WeeklySummary {
  id: string;
  user_id: string;
  week_start: string;
  total_minutes: number;
  overtime_minutes: number;
  exceeds_limit: number;
  created_at: string;
  updated_at: string;
}

