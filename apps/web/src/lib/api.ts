import type {
  User,
  Team,
  AttendanceLog,
  WeeklySummary,
  ClockInRequest,
  ClockOutRequest,
} from './types';

// API Base URL - configure based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Users
  async listUsers(params?: { team_id?: string; role?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = query ? `/api/users?${query}` : '/api/users';
    return this.request<{ users: User[] }>(endpoint);
  }

  async getUser(id: string) {
    return this.request<{ user: User }>(`/api/users/${id}`);
  }

  async createUser(data: Partial<User>) {
    return this.request<{ user: User }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.request<{ user: User }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Teams
  async listTeams() {
    return this.request<{ teams: Team[] }>('/api/teams');
  }

  async getTeam(id: string) {
    return this.request<{ team: Team }>(`/api/teams/${id}`);
  }

  async createTeam(data: Partial<Team>) {
    return this.request<{ team: Team }>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeam(id: string, data: Partial<Team>) {
    return this.request<{ team: Team }>(`/api/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(id: string) {
    return this.request<{ message: string }>(`/api/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance
  async listAttendance(params?: {
    user_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = query ? `/api/attendance?${query}` : '/api/attendance';
    return this.request<{ logs: AttendanceLog[] }>(endpoint);
  }

  async getAttendance(id: string) {
    return this.request<{ log: AttendanceLog }>(`/api/attendance/${id}`);
  }

  async clockIn(data: ClockInRequest) {
    return this.request<{ log: AttendanceLog }>('/api/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async clockOut(data: ClockOutRequest) {
    return this.request<{ log: AttendanceLog }>('/api/attendance/clock-out', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWeeklySummary(userId: string, weekStart?: string) {
    const query = weekStart ? `?week_start=${weekStart}` : '';
    return this.request<{ summary: WeeklySummary }>(
      `/api/attendance/summary/${userId}${query}`
    );
  }

  // Health
  async healthCheck() {
    return this.request<{ status: string; timestamp: string; version?: string }>(
      '/api/health'
    );
  }
}

export const api = new ApiClient(API_BASE_URL);

