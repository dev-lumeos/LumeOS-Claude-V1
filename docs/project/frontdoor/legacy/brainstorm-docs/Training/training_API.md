# Training API Documentation

## Base URL
`http://localhost:5200`

## Endpoints Overview

### Exercises API

#### `GET /exercises`
Search and filter exercises from the exercise database.

**Query Parameters:**
- `q` (string, optional): Search query for exercise names
- `category` (string, optional): Exercise category filter
- `equipment` (string, optional): Required equipment filter
- `muscle` (string, optional): Primary muscle group filter
- `body_region` (string, optional): Body region filter
- `exercise_type` (string, optional): Type of exercise (strength, cardio, etc.)
- `discipline` (string, optional): Training discipline
- `limit` (number, optional): Results limit (default: 50, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Example:**
```bash
GET /exercises?q=bench press&muscle=chest&equipment=barbell
```

**Response:**
```json
{
  "exercises": [
    {
      "id": "ex001",
      "name": "Barbell Bench Press",
      "category": "strength",
      "primary_muscle": "chest",
      "secondary_muscles": ["shoulders", "triceps"],
      "equipment": "barbell",
      "instructions": "Step-by-step instructions...",
      "media_urls": ["video.mp4", "image.jpg"],
      "difficulty": "intermediate"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### `GET /exercises/:id`
Get detailed information for a specific exercise.

### Workouts API

#### `GET /workouts`
Get user's workout history with date filtering.

**Query Parameters:**
- `start_date` (string): Start date in YYYY-MM-DD format
- `end_date` (string): End date in YYYY-MM-DD format
- `limit` (number): Results limit
- `offset` (number): Pagination offset

**Response:**
```json
{
  "workouts": [
    {
      "id": "w001",
      "user_id": "user123",
      "routine_id": "r001",
      "started_at": "2026-03-25T06:00:00Z",
      "completed_at": "2026-03-25T07:30:00Z",
      "duration_minutes": 90,
      "total_volume_kg": 5250,
      "exercises": [...]
    }
  ]
}
```

#### `POST /workouts`
Start a new workout session.

**Body:**
```json
{
  "routine_id": "r001",
  "started_at": "2026-03-25T06:00:00Z",
  "exercises": [
    {
      "exercise_id": "ex001",
      "order": 1,
      "sets": [
        {
          "reps": 10,
          "weight_kg": 80,
          "rpe": 8,
          "rest_seconds": 180
        }
      ]
    }
  ]
}
```

#### `GET /workouts/:id`
Get specific workout details.

#### `PUT /workouts/:id`
Update ongoing or completed workout.

#### `DELETE /workouts/:id`
Delete a workout (soft delete).

### Routines API

#### `GET /routines`
Get user's training routines.

**Response:**
```json
{
  "routines": [
    {
      "id": "r001",
      "name": "Push/Pull/Legs",
      "description": "3-day split routine",
      "category": "strength",
      "exercises": [
        {
          "exercise_id": "ex001",
          "order": 1,
          "sets": 3,
          "reps": "8-10",
          "rest_seconds": 180
        }
      ],
      "estimated_duration": 90
    }
  ]
}
```

#### `POST /routines`
Create a new training routine.

#### `PUT /routines/:id`
Update existing routine.

#### `DELETE /routines/:id`
Delete a routine.

### Progressive Overload API

#### `GET /progression/:exercise_id/auto-fill`
Get automatic progression suggestions for an exercise.

**Query Parameters:**
- `model` (string): Progression model (linear, double, wave, rpe, daily_undulating)

**Response:**
```json
{
  "suggestions": [
    {
      "week": 1,
      "sets": 3,
      "reps": 8,
      "weight_kg": 80,
      "rpe": 8
    },
    {
      "week": 2,
      "sets": 3,
      "reps": 8,
      "weight_kg": 82.5,
      "rpe": 8
    }
  ],
  "model": "linear",
  "progression_rate": 0.025
}
```

#### `PUT /progression/:exercise_id/config`
Update progression configuration for specific exercise.

**Body:**
```json
{
  "progression_model": "linear",
  "progression_rate": 0.025,
  "deload_threshold": 3,
  "rpe_target": 8
}
```

#### `GET /progression/weekly-volume`
Get weekly training volume trends.

**Query Parameters:**
- `weeks` (number): Number of weeks to analyze (default: 8)

**Response:**
```json
{
  "volume_trend": [
    {
      "week_start": "2026-03-17",
      "total_volume_kg": 15750,
      "volume_by_muscle": {
        "chest": 3250,
        "back": 4100,
        "legs": 8400
      }
    }
  ],
  "trend_direction": "increasing",
  "avg_weekly_volume": 16200
}
```

### Training Analytics API

#### `GET /analytics/summary`
Get comprehensive training analytics.

**Query Parameters:**
- `period` (string): Analysis period (week, month, quarter)

**Response:**
```json
{
  "period": "month",
  "workouts_completed": 12,
  "total_volume_kg": 68500,
  "avg_workout_duration": 85,
  "muscle_volume_distribution": {
    "chest": 12500,
    "back": 15200,
    "legs": 28400,
    "shoulders": 8200,
    "arms": 4200
  },
  "strength_progression": {
    "bench_press": { "start": 80, "current": 87.5, "increase_pct": 9.4 },
    "squat": { "start": 120, "current": 135, "increase_pct": 12.5 }
  }
}
```

### Cross-Module Integration

#### `GET /for-ai`
Get training data formatted for AI Coach analysis.

**Response:**
```json
{
  "recent_workouts": [...],
  "volume_trends": [...],
  "strength_progression": [...],
  "recovery_indicators": [...]
}
```

## Database Tables Used
- `exercises` - Exercise database (1,448 exercises)
- `muscle_groups` - Muscle group definitions (157 groups)
- `equipment` - Equipment types (61 types)
- `workout_sessions` - Individual workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets with reps/weight/RPE
- `routines` - Training routine templates
- `routine_exercises` - Exercises within routines

## Error Handling
Standard error format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Authentication
Requires valid JWT token:
```
Authorization: Bearer <jwt-token>
```

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user
- Bulk operations have separate limits