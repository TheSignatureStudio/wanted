// API Types matching Worker types
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

export interface Team {
  id: string;
  name: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

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

export interface WeeklySummary {
  user_id: string;
  week_start: string;
  total_minutes: number;
  overtime_minutes: number;
  exceeds_limit: number;
}

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

// Clock-in request
export interface ClockInRequest {
  user_id: string;
  work_mode: WorkMode;
  location_id?: string;
  latitude?: number;
  longitude?: number;
}

// Clock-out request
export interface ClockOutRequest {
  user_id: string;
  latitude?: number;
  longitude?: number;
}

// Geolocation
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

