# Recovery API Documentation

## Base URL
`http://localhost:5400`

## Endpoints Overview

### Recovery Check-ins API

#### `GET /checkin`
Get recovery check-in for a specific date.

**Query Parameters:**
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to today)

**Example:**
```bash
GET /checkin?date=2026-03-25
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "rec001",
    "user_id": "user123",
    "date": "2026-03-25",
    "sleep_hours": 7.5,
    "sleep_quality": 8,
    "subjective_feeling": 7,
    "mood": "good",
    "soreness": {
      "chest": 1,
      "legs": 2,
      "shoulders": 0
    },
    "created_at": "2026-03-25T06:30:00Z"
  }
}
```

#### `GET /checkin/today`
Get today's recovery check-in.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "rec002",
    "sleep_hours": 8.0,
    "sleep_quality": 9,
    "subjective_feeling": 8,
    "mood": "motivated",
    "soreness": {}
  }
}
```

#### `POST /checkin`
Create or update recovery check-in (UPSERT operation).

**Body:**
```json
{
  "date": "2026-03-25",
  "sleep_hours": 7.5,
  "sleep_quality": 8,
  "subjective_feeling": 7,
  "mood": "good",
  "soreness": {
    "chest": 1,
    "legs": 2
  },
  "notes": "Felt good after yesterday's workout"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "rec001",
    "recovery_score": 78.5,
    "created_at": "2026-03-25T06:30:00Z"
  }
}
```

### Recovery Scores API

#### `GET /score`
Get calculated recovery score for a specific date.

**Query Parameters:**
- `date` (string, optional): Date in YYYY-MM-DD format

**Response:**
```json
{
  "ok": true,
  "data": {
    "date": "2026-03-25",
    "recovery_score": 78.5,
    "components": {
      "sleep_quality_score": 24.0,
      "sleep_hours_score": 14.1,
      "feeling_score": 10.5,
      "soreness_score": 8.3,
      "training_score": 10.5,
      "nutrition_score": 7.0,
      "mood_score": 4.0,
      "modality_bonus": 0.1,
      "total": 78.5
    },
    "recommendation": "Good recovery. Ready for moderate to high intensity training."
  }
}
```

#### `GET /score/trend`
Get recovery score trends over time.

**Query Parameters:**
- `days` (number, optional): Number of days to include (default: 7, max: 30)
- `start_date` (string, optional): Start date in YYYY-MM-DD format
- `end_date` (string, optional): End date in YYYY-MM-DD format

**Response:**
```json
{
  "ok": true,
  "data": {
    "scores": [
      {
        "date": "2026-03-25",
        "recovery_score": 78.5,
        "sleep_hours": 7.5,
        "sleep_quality": 8
      },
      {
        "date": "2026-03-24", 
        "recovery_score": 82.1,
        "sleep_hours": 8.0,
        "sleep_quality": 9
      }
    ],
    "average_score": 80.3,
    "trend_direction": "stable"
  }
}
```

### Recovery Modalities API

#### `GET /modalities`
Get recovery modalities for a specific date.

**Query Parameters:**
- `date` (string, optional): Date in YYYY-MM-DD format

**Response:**
```json
{
  "ok": true,
  "data": {
    "modalities": [
      {
        "id": "mod001",
        "type": "sauna",
        "duration_minutes": 20,
        "intensity": "moderate",
        "notes": "15 min at 80°C",
        "logged_at": "2026-03-25T18:00:00Z"
      },
      {
        "id": "mod002",
        "type": "cold_plunge",
        "duration_minutes": 3,
        "temperature": 4,
        "logged_at": "2026-03-25T18:25:00Z"
      }
    ]
  }
}
```

#### `POST /modalities`
Log a recovery modality.

**Body:**
```json
{
  "type": "massage",
  "duration_minutes": 60,
  "intensity": "deep",
  "notes": "Deep tissue massage focusing on legs",
  "logged_at": "2026-03-25T20:00:00Z"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "mod003",
    "type": "massage",
    "recovery_benefit": 2.5,
    "logged_at": "2026-03-25T20:00:00Z"
  }
}
```

#### `PUT /modalities/:id`
Update a recovery modality entry.

#### `DELETE /modalities/:id`
Delete a recovery modality entry.

### AI Integration API

#### `GET /for-ai`
Get recovery data formatted for AI Coach analysis.

**Response:**
```json
{
  "ok": true,
  "data": {
    "current_score": 78.5,
    "recent_scores": [78.5, 82.1, 75.3, 79.8],
    "sleep_pattern": {
      "avg_hours": 7.8,
      "avg_quality": 8.2,
      "consistency": "good"
    },
    "soreness_hotspots": ["legs", "shoulders"],
    "modality_frequency": {
      "sauna": 3,
      "cold_plunge": 2,
      "massage": 1
    },
    "recommendations": [
      "Consider more sleep on training days",
      "Legs showing consistent soreness - increase recovery focus"
    ]
  }
}
```

### HRV Integration API

#### `GET /hrv`
Get HRV (Heart Rate Variability) data.

**Query Parameters:**
- `date` (string, optional): Date in YYYY-MM-DD format
- `days` (number, optional): Number of days for trend analysis

**Response:**
```json
{
  "ok": true,
  "data": {
    "hrv_score": 42.5,
    "rmssd": 38.2,
    "readiness": "moderate",
    "trend": "declining",
    "source": "hrv4training"
  }
}
```

#### `POST /hrv`
Upload HRV measurement.

**Body:**
```json
{
  "measurement_time": "2026-03-25T06:00:00Z",
  "rmssd": 38.2,
  "heart_rate": 58,
  "source": "hrv4training"
}
```

## Recovery Score Calculation

### Formula Components
```
Recovery Score = Σ(component × weight)

Components:
- Sleep Quality (30%): (sleep_quality/10) × 30
- Sleep Hours (15%): min(sleep_hours, 8)/8 × 15
- Subjective Feeling (15%): (subjective_feeling/10) × 15  
- Soreness (10%): (1 - avg_soreness/3) × 10
- Training Load (15%): Based on recent training volume
- Nutrition (10%): Based on nutrition compliance
- Mood (5%): motivated=100, good=80, neutral=60, tired=30, sick=10
- Modality Bonus (0-5): Points for recovery modalities

Total: Clamped to 0-100
```

### Score Interpretation
- **90-100**: Excellent recovery, ready for high intensity
- **80-89**: Good recovery, ready for moderate to high intensity  
- **70-79**: Average recovery, moderate intensity recommended
- **60-69**: Below average, consider light training or rest
- **50-59**: Poor recovery, rest day recommended
- **<50**: Very poor recovery, extended rest needed

## Database Tables Used
- `recovery_checkins` - Daily recovery check-ins
- `recovery_scores` - Calculated daily scores  
- `recovery_modalities` - Recovery activities logged
- `hrv_measurements` - Heart rate variability data
- `sleep_data` - Sleep tracking integration

## Error Handling
Standard error format:
```json
{
  "ok": false,
  "error": "Error message",
  "code": "RECOVERY_ERROR_CODE"
}
```

## Authentication
Requires valid JWT token:
```
Authorization: Bearer <jwt-token>
```

## Integration Points
- **Training Module**: Receives training load data
- **Nutrition Module**: Receives nutrition compliance scores
- **Coach Module**: Provides recovery insights for recommendations
- **Goals Module**: Reports recovery adherence to goals