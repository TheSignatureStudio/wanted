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

