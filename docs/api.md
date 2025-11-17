# Wanted Attendance Suite - API Documentation

## Base URL

**Production**: `https://wanted-worker.<your-subdomain>.workers.dev`  
**Development**: `http://localhost:8787` (via `wrangler dev`)

## Authentication

🚧 **Coming Soon**: Authentication via JWT/Clerk integration

## API Endpoints

### Health Check

#### `GET /api/health`

Check API status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T13:00:00.000Z",
  "version": "0.1.0"
}
```

---

### Users

#### `GET /api/users`

List all users. Supports filtering by team and role.

**Query Parameters:**
- `team_id` (optional): Filter by team
- `role` (optional): Filter by role (ADMIN|MANAGER|STAFF)

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "STAFF",
      "team_id": "team-uuid",
      "employment_type": "FULL_TIME",
      "timezone": "Asia/Seoul",
      "created_at": "2025-11-17T00:00:00.000Z",
      "updated_at": "2025-11-17T00:00:00.000Z"
    }
  ]
}
```

#### `GET /api/users/:id`

Get user by ID.

**Response:**
```json
{
  "user": { ... }
}
```

#### `POST /api/users`

Create a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "STAFF",
  "team_id": "team-uuid",
  "employment_type": "FULL_TIME",
  "timezone": "Asia/Seoul"
}
```

**Response:** `201 Created`

#### `PUT /api/users/:id`

Update user information.

**Request Body:** (partial)
```json
{
  "name": "Jane Doe",
  "role": "MANAGER"
}
```

**Response:** `200 OK`

#### `DELETE /api/users/:id`

Delete a user.

**Response:** `200 OK`

---

### Teams

#### `GET /api/teams`

List all teams.

**Response:**
```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "Engineering",
      "parent_id": null,
      "created_at": "2025-11-17T00:00:00.000Z",
      "updated_at": "2025-11-17T00:00:00.000Z"
    }
  ]
}
```

#### `GET /api/teams/:id`

Get team by ID.

#### `POST /api/teams`

Create a new team.

**Request Body:**
```json
{
  "name": "Engineering",
  "parent_id": "parent-team-uuid"
}
```

#### `PUT /api/teams/:id`

Update team information.

#### `DELETE /api/teams/:id`

Delete a team (only if no members).

---

### Attendance

#### `GET /api/attendance`

List attendance logs.

**Query Parameters:**
- `user_id` (optional): Filter by user
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "clock_in": "2025-11-17T09:00:00.000Z",
      "clock_out": "2025-11-17T18:00:00.000Z",
      "work_mode": "ONSITE",
      "location_id": "location-uuid",
      "verified": 1,
      "created_at": "2025-11-17T09:00:00.000Z",
      "updated_at": "2025-11-17T18:00:00.000Z"
    }
  ]
}
```

#### `GET /api/attendance/:id`

Get attendance log by ID.

#### `POST /api/attendance/clock-in`

Clock in for the day.

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "work_mode": "ONSITE",
  "location_id": "location-uuid",
  "latitude": 37.5665,
  "longitude": 126.9780
}
```

**Response:** `201 Created`

**Work Modes:**
- `ONSITE`: Requires location verification
- `REMOTE`: Requires approved remote schedule
- `FIELD`: Field work (flexible location)

#### `POST /api/attendance/clock-out`

Clock out for the day.

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "latitude": 37.5665,
  "longitude": 126.9780
}
```

**Response:** `200 OK`

#### `GET /api/attendance/summary/:userId`

Get weekly work hour summary.

**Query Parameters:**
- `week_start` (optional): Week start date (YYYY-MM-DD), defaults to current week

**Response:**
```json
{
  "summary": {
    "user_id": "user-uuid",
    "week_start": "2025-11-17",
    "total_minutes": 2400,
    "overtime_minutes": 0,
    "exceeds_limit": 0
  }
}
```

---

### Remote Schedules

#### `GET /v1/remote-schedules`

List remote work schedules.

**Query Parameters:**
- `userId` (optional): Filter by user
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `status` (optional): Filter by status (pending|approved|denied)

**Response:**
```json
{
  "schedules": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "work_date": "2025-11-17",
      "status": "approved",
      "reason": "Personal matters",
      "archived": 0,
      "created_at": "2025-11-17T00:00:00.000Z",
      "updated_at": "2025-11-17T00:00:00.000Z"
    }
  ]
}
```

#### `POST /v1/remote-schedules`

Request remote work for a specific date.

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "work_date": "2025-11-20",
  "reason": "Personal matters"
}
```

#### `PATCH /v1/remote-schedules/:id`

Update remote schedule status (manager/admin only).

**Request Body:**
```json
{
  "status": "approved"
}
```

#### `DELETE /v1/remote-schedules/:id`

Archive remote schedule.

---

### Resources & Reservations

#### `GET /v1/resources`

List resources (meeting rooms, Zoom accounts, equipment).

**Query Parameters:**
- `type` (optional): Filter by type (MEETING_ROOM|ZOOM_ACCOUNT|EQUIPMENT)

**Response:**
```json
{
  "resources": [
    {
      "id": "uuid",
      "name": "Conference Room A",
      "type": "MEETING_ROOM",
      "capacity": 20,
      "has_zoom": 1,
      "timezone": "Asia/Seoul",
      "metadata": null,
      "archived": 0,
      "created_at": "2025-11-17T00:00:00.000Z",
      "updated_at": "2025-11-17T00:00:00.000Z"
    }
  ]
}
```

#### `POST /v1/resources`

Create a new resource (admin only).

#### `GET /v1/reservations`

List reservations.

**Query Parameters:**
- `resourceId` (optional): Filter by resource
- `organizerId` (optional): Filter by organizer
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `status` (optional): Filter by status (pending|confirmed|cancelled)

**Response:**
```json
{
  "reservations": [
    {
      "id": "uuid",
      "resource_id": "resource-uuid",
      "organizer_id": "user-uuid",
      "starts_at": "2025-11-17T14:00:00.000Z",
      "ends_at": "2025-11-17T15:00:00.000Z",
      "status": "confirmed",
      "agenda": "Team meeting",
      "attendees": "user1,user2,user3",
      "created_at": "2025-11-17T00:00:00.000Z",
      "updated_at": "2025-11-17T00:00:00.000Z"
    }
  ]
}
```

#### `POST /v1/reservations`

Create a new reservation.

**Request Body:**
```json
{
  "resource_id": "resource-uuid",
  "organizer_id": "user-uuid",
  "starts_at": "2025-11-17T14:00:00.000Z",
  "ends_at": "2025-11-17T15:00:00.000Z",
  "agenda": "Team meeting",
  "attendees": ["user1", "user2", "user3"]
}
```

---

### Leave Management

#### `GET /v1/leave-balances`

List leave balances.

**Query Parameters:**
- `userId` (optional): Filter by user
- `year` (optional): Filter by year

**Response:**
```json
{
  "balances": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "year": 2025,
      "leave_type": "Annual",
      "allowance_days": 15,
      "used_days": 3,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-11-17T00:00:00.000Z"
    }
  ]
}
```

#### `POST /v1/leave-balances`

Create leave balance (admin only).

#### `GET /v1/leave-requests`

List leave requests.

**Query Parameters:**
- `userId` (optional): Filter by user
- `status` (optional): Filter by status (pending|approved|denied|cancelled)
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "leave_type": "Annual",
      "start_date": "2025-12-20",
      "end_date": "2025-12-22",
      "status": "pending",
      "reason": "Family vacation",
      "created_at": "2025-11-17T00:00:00.000Z",
      "updated_at": "2025-11-17T00:00:00.000Z"
    }
  ]
}
```

#### `POST /v1/leave-requests`

Submit a leave request.

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "leave_type": "Annual",
  "start_date": "2025-12-20",
  "end_date": "2025-12-22",
  "reason": "Family vacation"
}
```

**Response:**
```json
{
  "request": { ... },
  "business_days": 3
}
```

#### `PATCH /v1/leave-requests/:id`

Update leave request status (manager/admin only).

**Request Body:**
```json
{
  "status": "approved"
}
```

---

### Notifications

#### `GET /v1/notifications/weekly-alert/:userId`

Check if user is approaching 52-hour weekly limit.

**Response:**
```json
{
  "alert_level": "warning",
  "message": "주간 근무시간이 증가하고 있습니다. 현재 45.5시간 근무 중 (6.5시간 남음)",
  "total_hours": 45.5,
  "max_hours": 52,
  "remaining_hours": 6.5,
  "week_start": "2025-11-17",
  "logs_count": 5
}
```

**Alert Levels:**
- `none`: Normal (< 45 hours)
- `warning`: Approaching limit (45-50 hours)
- `critical`: Near limit (50-52 hours)
- `exceeded`: Over limit (> 52 hours)

#### `GET /v1/notifications/leave-reminder/:userId`

Check leave balance and get reminders.

**Response:**
```json
{
  "year": 2025,
  "reminders": [
    {
      "leave_type": "Annual",
      "remaining_days": 5,
      "alert_level": "low",
      "message": "Annual 휴가가 5일 남았습니다."
    }
  ]
}
```

#### `GET /v1/notifications/pending-approvals/:userId`

Get pending approvals count for managers/admins.

**Response:**
```json
{
  "pending_count": 8,
  "remote_schedules": 3,
  "leave_requests": 5,
  "message": "8건의 승인 대기 중인 요청이 있습니다."
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` Bad Request
- `403` Forbidden (e.g., location verification failed)
- `404` Not Found
- `500` Internal Server Error

---

## Work Mode Rules

### ONSITE
- Requires GPS coordinates
- Must be within configured location radius
- Location verification required

### REMOTE
- Requires approved remote schedule for the day
- No GPS verification
- Must be requested and approved in advance

### FIELD
- Flexible location
- No GPS verification required
- For field workers/sales staff

---

## Weekly Hour Limits

- **52-hour limit** per week (Monday-Sunday)
- Overtime automatically calculated
- `exceeds_limit` flag set to 1 when limit exceeded
- Used for compliance monitoring and alerts

