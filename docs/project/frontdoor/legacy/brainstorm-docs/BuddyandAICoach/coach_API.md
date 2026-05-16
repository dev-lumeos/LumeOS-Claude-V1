# Coach API Documentation

## Base URL
`http://localhost:5500`

## Architecture Overview

The Coach API is the AI brain of Lumeos, featuring a hybrid architecture:
- **Deterministic Engines** - Rule-based analysis and decision making
- **LLM Integration** - Claude Sonnet 4.0 and Z.AI GLM models for conversations
- **Memory System** - Conversation and decision memory with RAG
- **Cross-Module Analysis** - Data aggregation from all Lumeos modules

## Core Endpoints

### Chat & Conversation API

#### `POST /chat`
Main chat interface with AI coach.

**Body:**
```json
{
  "message": "How was my training this week?",
  "persona": "buddy",
  "include_context": true,
  "stream": false
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "response": "Based on your training data, you completed 4 workouts this week with excellent consistency...",
    "persona_used": "buddy",
    "context_included": true,
    "memory_updated": true,
    "conversation_id": "conv_123"
  }
}
```

#### `POST /chat/stream`
Streaming chat for real-time responses.

**Body:** Same as `/chat`

**Response:** Server-Sent Events (SSE)
```
data: {"type": "chunk", "content": "Based on your"}
data: {"type": "chunk", "content": " training data"}
data: {"type": "done", "conversation_id": "conv_123"}
```

### Buddy System API

#### `GET /buddy/health`
Check Buddy system health status.

**Response:**
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2026-03-25T07:58:00Z",
  "checks": {
    "database": "connected",
    "llm_provider": "ready",
    "event_pipeline": "active",
    "cron_scheduler": "running",
    "rule_engine": "operational",
    "memory_system": "ready"
  }
}
```

#### `GET /buddy/dashboard`
Get daily command center dashboard.

**Response:**
```json
{
  "ok": true,
  "data": {
    "daily_state": {
      "date": "2026-03-25",
      "user_id": "user123",
      "module_scores": {
        "nutrition": 85.2,
        "training": 92.1,
        "recovery": 78.5,
        "supplements": 90.0
      },
      "overall_score": 86.5,
      "trend_direction": "improving"
    },
    "decisions": [
      {
        "id": "dec_001",
        "decision_type": "nutrition_reminder",
        "action_status": "suggested",
        "reasoning": "User missed breakfast, suggest quick protein option",
        "priority": "medium"
      }
    ],
    "active_interventions": 2,
    "compliance_rate": 0.87
  }
}
```

#### `POST /buddy/decision`
Execute a buddy decision.

**Body:**
```json
{
  "decision_type": "meal_suggestion",
  "priority": "high",
  "context": {
    "time_of_day": "breakfast",
    "calories_remaining": 1850,
    "protein_needed": 25
  }
}
```

#### `GET /buddy/trends`
Get trend analysis and patterns.

**Query Parameters:**
- `days` (number): Analysis period (default: 7, max: 30)
- `modules` (string): Comma-separated modules to analyze

**Response:**
```json
{
  "ok": true,
  "data": {
    "trend_period": {
      "start_date": "2026-03-18",
      "end_date": "2026-03-25",
      "days_analyzed": 7
    },
    "trends": {
      "nutrition": {
        "average_score": 83.4,
        "trend": "improving",
        "key_insights": ["Protein intake consistently good", "Missed meals on weekends"]
      },
      "training": {
        "average_score": 89.2,
        "trend": "stable", 
        "key_insights": ["Excellent workout consistency", "Progressive overload on track"]
      }
    },
    "cross_module_insights": [
      "Poor sleep correlates with missed breakfast",
      "Training days show better nutrition adherence"
    ]
  }
}
```

### Memory System API

#### `GET /memory`
Get user's conversation and decision memory.

**Query Parameters:**
- `type` (string): Memory type (conversation, decision, preference)
- `category` (string): Memory category (nutrition, training, etc.)
- `limit` (number): Results limit (default: 20)

**Response:**
```json
{
  "ok": true,
  "data": {
    "memories": [
      {
        "id": "mem_001",
        "memory_type": "preference",
        "category": "nutrition",
        "content": "User prefers protein smoothies for breakfast",
        "confidence": 0.95,
        "last_accessed": "2026-03-25T06:30:00Z",
        "access_count": 12
      }
    ],
    "total": 1
  }
}
```

#### `POST /memory`
Create new memory entry.

**Body:**
```json
{
  "memory_type": "preference",
  "category": "training",
  "content": "User prefers morning workouts at 6 AM",
  "confidence": 0.9,
  "context": {
    "source": "conversation",
    "date": "2026-03-25"
  }
}
```

#### `DELETE /memory/:id`
Delete specific memory entry.

### Knowledge Base API

#### `GET /knowledge/search`
Search the RAG knowledge base.

**Query Parameters:**
- `q` (string): Search query
- `category` (string): Knowledge category (nutrition, training, supplements)
- `limit` (number): Results limit (default: 5, max: 20)

**Response:**
```json
{
  "ok": true,
  "data": {
    "results": [
      {
        "id": "kb_001",
        "title": "Progressive Overload Principles",
        "content": "Progressive overload is achieved by gradually increasing...",
        "category": "training",
        "relevance_score": 0.92,
        "source": "exercise_science_textbook"
      }
    ],
    "query_processed": "progressive overload training",
    "total_results": 1
  }
}
```

#### `POST /knowledge`
Add knowledge to the base (admin only).

**Body:**
```json
{
  "title": "Protein Synthesis and Timing",
  "content": "Protein synthesis rates are elevated for 24-48 hours...",
  "category": "nutrition",
  "source": "peer_reviewed_research",
  "tags": ["protein", "muscle_growth", "timing"]
}
```

### Action Executor API

#### `POST /actions/meal/log`
Log a meal through coach interface.

**Body:**
```json
{
  "meal_type": "breakfast",
  "foods": [
    {
      "food_id": "f001",
      "quantity": 150,
      "portion": "1 medium apple"
    }
  ],
  "meal_time": "2026-03-25T07:00:00Z"
}
```

#### `POST /actions/meal/preview`
Preview meal before logging.

**Response:**
```json
{
  "ok": true,
  "data": {
    "preview": {
      "total_calories": 285,
      "protein_g": 1.2,
      "carbs_g": 68.5,
      "fat_g": 0.8,
      "foods_summary": "1 medium apple, 200ml orange juice"
    },
    "confirmation_token": "preview_abc123"
  }
}
```

#### `POST /actions/meal/confirm`
Confirm and log previewed meal.

**Body:**
```json
{
  "confirmation_token": "preview_abc123"
}
```

#### `POST /actions/weight/log`
Log body weight measurement.

**Body:**
```json
{
  "weight_kg": 75.5,
  "measurement_time": "2026-03-25T06:00:00Z",
  "notes": "After morning bathroom, before breakfast"
}
```

#### `POST /actions/supplements/log`
Log supplement intake.

**Body:**
```json
{
  "supplement_id": "s001",
  "dose": 1000,
  "dose_unit": "mg",
  "time_taken": "2026-03-25T08:00:00Z"
}
```

#### `POST /actions/recovery/checkin`
Log recovery check-in.

**Body:**
```json
{
  "sleep_hours": 7.5,
  "sleep_quality": 8,
  "mood": "good",
  "energy_level": 7,
  "soreness": {
    "legs": 2,
    "shoulders": 1
  }
}
```

### Coaching & Recommendations API

#### `GET /coaching/suggestions/meal`
Get AI meal suggestions.

**Query Parameters:**
- `meal_type` (string): breakfast, lunch, dinner, snack
- `calories_target` (number): Target calories for meal
- `dietary_preferences` (string): Preferences to consider

**Response:**
```json
{
  "ok": true,
  "data": {
    "suggestions": [
      {
        "name": "High-Protein Breakfast Bowl",
        "calories": 420,
        "protein_g": 35,
        "prep_time": 10,
        "ingredients": ["Greek yogurt", "berries", "protein powder", "almonds"],
        "reasoning": "Meets your protein target and fits your busy morning schedule"
      }
    ],
    "context_used": {
      "protein_goal": 25,
      "time_available": 10,
      "preferences": ["high_protein", "quick_prep"]
    }
  }
}
```

#### `GET /coaching/suggestions/workout`
Get AI workout suggestions.

**Query Parameters:**
- `available_time` (number): Minutes available
- `equipment` (string): Available equipment
- `muscle_focus` (string): Target muscle groups

**Response:**
```json
{
  "ok": true,
  "data": {
    "workout": {
      "name": "Quick Upper Body Strength",
      "duration_minutes": 45,
      "equipment_needed": ["dumbbells", "bench"],
      "exercises": [
        {
          "exercise_id": "ex001",
          "name": "Dumbbell Bench Press",
          "sets": 3,
          "reps": "8-10",
          "rest_seconds": 90
        }
      ],
      "reasoning": "Focuses on upper body as requested, fits time constraint"
    }
  }
}
```

#### `GET /coaching/weekly-report`
Generate weekly performance report.

**Response:**
```json
{
  "ok": true,
  "data": {
    "week_summary": {
      "period": "2026-03-18 to 2026-03-25",
      "overall_score": 86.5,
      "goals_achieved": 4,
      "goals_missed": 1,
      "streak_days": 6
    },
    "module_performance": {
      "nutrition": {
        "score": 85,
        "highlights": ["Consistent protein intake", "Good meal timing"],
        "areas_to_improve": ["Weekend meal planning"]
      }
    },
    "recommendations": [
      "Plan weekend meals in advance",
      "Consider meal prep on Sunday"
    ]
  }
}
```

### Automation & Rules API

#### `GET /automations`
Get active automations and rules.

**Response:**
```json
{
  "ok": true,
  "data": {
    "automations": [
      {
        "id": "auto_001",
        "name": "Morning Nutrition Reminder",
        "trigger": "daily_8am",
        "condition": "breakfast_not_logged",
        "action": "send_notification",
        "status": "active"
      }
    ]
  }
}
```

#### `POST /automations`
Create new automation rule.

**Body:**
```json
{
  "name": "Pre-Workout Supplement Reminder",
  "trigger": "before_workout",
  "trigger_timing": 30,
  "condition": "supplements_not_taken",
  "action": "suggest_supplement",
  "action_params": {
    "supplement_type": "pre_workout",
    "timing": "30_minutes_before"
  }
}
```

### Profile & Preferences API

#### `GET /profile`
Get user's coach profile and preferences.

**Response:**
```json
{
  "ok": true,
  "data": {
    "coach_preferences": {
      "communication_style": "encouraging",
      "reminder_frequency": "moderate",
      "focus_areas": ["nutrition", "training"],
      "intervention_threshold": "medium"
    },
    "personalization": {
      "preferred_meal_times": ["07:00", "12:00", "19:00"],
      "workout_schedule": ["monday", "wednesday", "friday"],
      "coaching_persona": "buddy"
    }
  }
}
```

#### `PUT /profile`
Update coach profile and preferences.

**Body:**
```json
{
  "coach_preferences": {
    "communication_style": "direct",
    "reminder_frequency": "high"
  },
  "personalization": {
    "coaching_persona": "professional"
  }
}
```

## AI Model Configuration

### Primary Models
- **Claude Sonnet 4.0**: Main conversation and reasoning
- **Z.AI GLM-4.7**: Intent detection and lightweight tasks
- **Claude Vision**: Image analysis (meal photos, progress pics)

### Model Selection
```typescript
interface ModelConfig {
  conversation: 'claude-sonnet-4';
  intent_detection: 'glm-4.7-flash';
  vision_tasks: 'claude-sonnet-4';
  reasoning: 'claude-sonnet-4';
  suggestions: 'claude-sonnet-4';
}
```

## Error Handling

### Standard Error Format
```json
{
  "ok": false,
  "error": "Memory not found",
  "code": "MEMORY_NOT_FOUND",
  "details": {
    "memory_id": "mem_123",
    "user_id": "user456"
  }
}
```

### Error Codes
- `COACH_UNAVAILABLE`: AI service temporarily unavailable
- `MEMORY_LIMIT_EXCEEDED`: User memory storage limit reached
- `INVALID_PERSONA`: Specified persona not available
- `CONTEXT_BUILD_FAILED`: Failed to build conversation context
- `DECISION_TIMEOUT`: Buddy decision processing timeout

## Authentication
Requires valid JWT token:
```
Authorization: Bearer <jwt-token>
```

## Rate Limiting
- **Chat endpoints**: 60 requests per minute
- **Memory operations**: 100 requests per minute
- **Knowledge search**: 30 requests per minute
- **Action executor**: 120 requests per minute

## Integration Points
- **All Modules**: Receives data for cross-module analysis
- **Goals Module**: Reports coaching effectiveness
- **Human Coach Module**: Coordinates with human trainers
- **Marketplace Module**: Suggests relevant products