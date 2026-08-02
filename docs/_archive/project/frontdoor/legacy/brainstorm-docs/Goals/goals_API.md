# Goals API Documentation

## Base URL
`http://localhost:5900`

## Architecture Overview

The Goals API serves as the central aggregation point for all Lumeos modules, implementing Tom's vision that "Goals is not another module but the aggregation point - everything is goal-driven." This API provides:
- **Goal-Centric Architecture** - All modules report progress toward user goals
- **Body Composition Tracking** - Comprehensive physical transformation goals
- **Nutrition Goal Management** - Macro and caloric targets aligned with body goals
- **Cross-Module Intelligence** - AI-powered goal achievement optimization
- **Progress Analytics** - Advanced tracking and projection algorithms
- **Adaptive Goal Setting** - Dynamic goal adjustment based on progress

## Core Goal Management API

### Active Goals Management

#### `GET /goals/active`
Get all active goals for the authenticated user.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "goal_123",
      "goal_type": "weight",
      "target_metric": null,
      "target_value": 75.0,
      "current_value": 80.2,
      "deadline": "2026-06-01",
      "status": "active",
      "progress_pct": 65.2,
      "created_at": "2026-03-01T00:00:00Z",
      "updated_at": "2026-03-25T08:00:00Z"
    },
    {
      "id": "goal_124",
      "goal_type": "body_fat",
      "target_metric": null,
      "target_value": 12.0,
      "current_value": 18.5,
      "deadline": "2026-09-01",
      "status": "active",
      "progress_pct": 43.8,
      "created_at": "2026-03-01T00:00:00Z"
    },
    {
      "id": "goal_125",
      "goal_type": "circumference",
      "target_metric": "waist_cm",
      "target_value": 85.0,
      "current_value": 92.0,
      "deadline": "2026-07-01",
      "status": "active",
      "progress_pct": 58.3,
      "created_at": "2026-03-15T00:00:00Z"
    }
  ]
}
```

#### `GET /goals/targets`
Alias for `/goals/active` for backward compatibility.

### Goal Creation and Management

#### `POST /goals/targets`
Create a new body composition goal.

**Body:**
```json
{
  "goal_type": "muscle_mass",
  "target_metric": null,
  "target_value": 65.0,
  "deadline": "2026-12-31"
}
```

**Goal Types:**
- `weight` - Overall body weight targets
- `body_fat` - Body fat percentage goals
- `muscle_mass` - Lean muscle mass targets
- `circumference` - Body measurements (requires target_metric)
- `visual` - Visual transformation goals

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "goal_126",
    "goal_type": "muscle_mass",
    "target_metric": null,
    "target_value": 65.0,
    "deadline": "2026-12-31",
    "status": "active",
    "user_id": "user_123",
    "created_at": "2026-03-25T08:30:00Z"
  }
}
```

#### `PUT /goals/targets/:id`
Update an existing goal.

**Body:**
```json
{
  "target_value": 67.0,
  "deadline": "2026-11-30",
  "status": "active"
}
```

**Status Options:**
- `active` - Goal is being actively pursued
- `achieved` - Goal has been successfully completed
- `paused` - Goal is temporarily on hold

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "goal_126",
    "target_value": 67.0,
    "deadline": "2026-11-30",
    "status": "active",
    "updated_at": "2026-03-25T08:35:00Z"
  }
}
```

#### `DELETE /goals/targets/:id`
Remove a goal (soft delete recommended).

### Advanced Goal Progress Tracking

#### `GET /goals/targets/:id/progress`
Get detailed progress analysis for a specific goal including historical data and projections.

**Response:**
```json
{
  "ok": true,
  "data": {
    "goal": {
      "id": "goal_123",
      "goal_type": "weight",
      "target_value": 75.0,
      "current_value": 80.2,
      "deadline": "2026-06-01",
      "progress_pct": 65.2,
      "status": "active"
    },
    "history": [
      {
        "date": "2026-03-25",
        "value": 80.2
      },
      {
        "date": "2026-03-20",
        "value": 81.1
      },
      {
        "date": "2026-03-15",
        "value": 82.0
      }
    ],
    "projected_date": "2026-05-15",
    "on_track": true,
    "insights": {
      "current_rate": "-0.18 kg/week",
      "required_rate": "-0.15 kg/week", 
      "performance": "ahead_of_schedule",
      "confidence": 0.85
    }
  }
}
```

## Nutrition Goals Integration

### Nutrition Goal Management

#### `GET /nutrition-goals`
Get nutrition goals aligned with body composition targets.

**Response:**
```json
{
  "ok": true,
  "data": {
    "daily_targets": {
      "calories": 2150,
      "protein_g": 150,
      "carbs_g": 200,
      "fat_g": 85,
      "fiber_g": 35
    },
    "goal_alignment": {
      "primary_body_goal": "weight_loss",
      "caloric_deficit": 500,
      "macro_strategy": "high_protein_moderate_carb",
      "adaptation_level": 0.85
    },
    "weekly_adjustments": {
      "calories_adjustment": -50,
      "protein_adjustment": 5,
      "reason": "plateau_breaking_protocol"
    }
  }
}
```

#### `POST /nutrition-goals/calculate`
Calculate optimal nutrition goals based on body composition targets.

**Body:**
```json
{
  "body_goal_id": "goal_123",
  "activity_level": "moderately_active",
  "dietary_preferences": ["high_protein"],
  "timeline_weeks": 12
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "calculated_targets": {
      "maintenance_calories": 2650,
      "goal_calories": 2150,
      "deficit_surplus": -500,
      "protein_g": 150,
      "protein_per_kg": 2.0,
      "carbs_g": 200,
      "fat_g": 85
    },
    "phasing_strategy": [
      {
        "phase": "initial",
        "weeks": "1-4",
        "calories": 2150,
        "adjustments": "establish_baseline"
      },
      {
        "phase": "progression", 
        "weeks": "5-8",
        "calories": 2100,
        "adjustments": "moderate_restriction"
      },
      {
        "phase": "final",
        "weeks": "9-12", 
        "calories": 2050,
        "adjustments": "final_push"
      }
    ],
    "success_probability": 0.87
  }
}
```

## Body Measurements & Circumferences

### Body Measurement Tracking

#### `GET /measurements`
Get comprehensive body measurement history.

**Query Parameters:**
- `from_date` (string): Start date (ISO 8601)
- `to_date` (string): End date (ISO 8601)
- `limit` (number): Maximum results (default: 50)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "measurement_456",
      "date": "2026-03-25",
      "weight_kg": 80.2,
      "body_fat_pct": 18.5,
      "muscle_mass_kg": 62.8,
      "bone_mass_kg": 3.2,
      "water_pct": 58.5,
      "metabolic_age": 28,
      "visceral_fat_rating": 6,
      "measurement_method": "bioelectrical_impedance",
      "notes": "Morning measurement, fasted",
      "created_at": "2026-03-25T07:00:00Z"
    }
  ]
}
```

#### `POST /measurements`
Log new body measurement data.

**Body:**
```json
{
  "date": "2026-03-25",
  "weight_kg": 80.2,
  "body_fat_pct": 18.5,
  "muscle_mass_kg": 62.8,
  "measurement_method": "bioelectrical_impedance",
  "notes": "Morning measurement, fasted"
}
```

#### `GET /circumferences`
Get body circumference measurements.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "circ_789",
      "date": "2026-03-25",
      "neck_cm": 38.5,
      "chest_cm": 102.0,
      "waist_cm": 92.0,
      "hips_cm": 98.5,
      "bicep_left_cm": 35.2,
      "bicep_right_cm": 35.8,
      "thigh_left_cm": 58.5,
      "thigh_right_cm": 59.0,
      "calf_left_cm": 38.0,
      "calf_right_cm": 38.2,
      "measurement_conditions": "relaxed",
      "notes": "Consistent measurement protocol",
      "created_at": "2026-03-25T07:30:00Z"
    }
  ]
}
```

#### `POST /circumferences`
Log new circumference measurements.

**Body:**
```json
{
  "date": "2026-03-25",
  "waist_cm": 92.0,
  "chest_cm": 102.0,
  "bicep_right_cm": 35.8,
  "thigh_left_cm": 58.5,
  "measurement_conditions": "relaxed",
  "notes": "Weekly progress check"
}
```

## Goal Intelligence & Analytics

### AI-Powered Goal Insights

#### `GET /intelligence`
Get AI-generated insights about goal achievement strategies.

**Query Parameters:**
- `goal_id` (string): Specific goal to analyze
- `time_horizon` (string): Analysis period (1_month, 3_months, 6_months)

**Response:**
```json
{
  "ok": true,
  "data": {
    "goal_analysis": {
      "goal_id": "goal_123",
      "achievement_probability": 0.87,
      "current_trajectory": "ahead_of_schedule",
      "key_success_factors": [
        "consistent_caloric_deficit",
        "adequate_protein_intake",
        "regular_strength_training"
      ],
      "risk_factors": [
        "weekend_calorie_surplus",
        "inconsistent_meal_timing"
      ]
    },
    "optimization_recommendations": [
      {
        "category": "nutrition",
        "recommendation": "Increase protein intake by 10g on training days",
        "expected_impact": "15% faster muscle preservation",
        "confidence": 0.82
      },
      {
        "category": "training",
        "recommendation": "Add 2 cardio sessions per week",
        "expected_impact": "25% faster fat loss",
        "confidence": 0.78
      }
    ],
    "milestone_projections": [
      {
        "milestone": "10% progress",
        "projected_date": "2026-04-15",
        "confidence": 0.91
      },
      {
        "milestone": "50% progress",
        "projected_date": "2026-05-20",
        "confidence": 0.85
      },
      {
        "milestone": "goal_achievement",
        "projected_date": "2026-06-25",
        "confidence": 0.73
      }
    ]
  }
}
```

#### `POST /intelligence/optimize`
Request AI optimization suggestions for goal achievement.

**Body:**
```json
{
  "goal_id": "goal_123",
  "current_challenges": ["plateau", "motivation"],
  "available_time_hours_week": 8,
  "dietary_restrictions": ["vegetarian"],
  "equipment_access": ["home_gym", "bodyweight"]
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "optimization_strategy": {
      "strategy_name": "plateau_breaking_protocol",
      "duration_weeks": 4,
      "expected_improvement": "resume_2x_progress_rate",
      "confidence": 0.83
    },
    "action_plan": [
      {
        "week": 1,
        "nutrition_changes": [
          "reduce_calories_by_100",
          "increase_protein_by_15g"
        ],
        "training_changes": [
          "add_hiit_2x_week",
          "increase_training_volume_10pct"
        ]
      }
    ],
    "monitoring_metrics": [
      "weekly_weight_change",
      "energy_levels",
      "workout_performance",
      "sleep_quality"
    ]
  }
}
```

### Cross-Module Goal Integration

#### `GET /dashboard`
Get comprehensive goal dashboard with cross-module integration.

**Response:**
```json
{
  "ok": true,
  "data": {
    "goal_summary": {
      "total_active_goals": 3,
      "goals_on_track": 2,
      "goals_ahead": 1,
      "goals_behind": 0,
      "overall_progress_score": 76.4
    },
    "module_contributions": {
      "nutrition": {
        "alignment_score": 85.2,
        "key_metrics": {
          "calorie_adherence": 0.89,
          "macro_adherence": 0.82,
          "meal_timing_consistency": 0.76
        },
        "recent_trends": "improving",
        "goal_impact": "positive"
      },
      "training": {
        "alignment_score": 78.9,
        "key_metrics": {
          "workout_consistency": 0.92,
          "progressive_overload": 0.71,
          "volume_progression": 0.84
        },
        "recent_trends": "stable",
        "goal_impact": "positive"
      },
      "recovery": {
        "alignment_score": 71.3,
        "key_metrics": {
          "sleep_quality": 0.78,
          "recovery_score": 0.73,
          "stress_management": 0.65
        },
        "recent_trends": "declining",
        "goal_impact": "limiting_factor"
      }
    },
    "goal_specific_insights": [
      {
        "goal_id": "goal_123",
        "insight": "Weight loss accelerating due to improved sleep quality",
        "supporting_data": ["recovery_score_trend", "calorie_deficit_consistency"],
        "confidence": 0.87
      }
    ]
  }
}
```

#### `GET /for-ai`
Provide goal data for AI coach integration and recommendations.

**Response:**
```json
{
  "ok": true,
  "data": {
    "active_goals_summary": {
      "primary_goal": {
        "type": "weight_loss",
        "target": "75kg",
        "current": "80.2kg",
        "progress": 65.2,
        "deadline": "2026-06-01",
        "on_track": true
      },
      "secondary_goals": [
        {
          "type": "body_fat_reduction",
          "target": "12%",
          "current": "18.5%",
          "progress": 43.8
        }
      ]
    },
    "coaching_priorities": [
      {
        "category": "nutrition",
        "priority": "high",
        "focus": "maintain_caloric_deficit",
        "target_metrics": ["daily_calories", "protein_intake"]
      },
      {
        "category": "training", 
        "priority": "medium",
        "focus": "muscle_preservation",
        "target_metrics": ["strength_maintenance", "training_volume"]
      },
      {
        "category": "recovery",
        "priority": "high",
        "focus": "sleep_optimization",
        "target_metrics": ["sleep_duration", "sleep_quality"]
      }
    ],
    "success_indicators": {
      "weekly_weight_change": "-0.5 to -0.8 kg",
      "energy_levels": "stable or improving",
      "strength_retention": ">95% of baseline",
      "adherence_rate": ">80% across all modules"
    },
    "intervention_triggers": {
      "plateau_weeks": 2,
      "energy_decline_threshold": 3,
      "adherence_drop_threshold": 0.7,
      "strength_loss_threshold": 0.1
    }
  }
}
```

## Goal Achievement Analytics

### Progress Trend Analysis

#### `GET /analytics/trends`
Get detailed trend analysis across all goals and contributing factors.

**Query Parameters:**
- `timeframe` (string): Analysis period (1_month, 3_months, 6_months, 1_year)
- `goal_types` (string): Comma-separated goal types to analyze

**Response:**
```json
{
  "ok": true,
  "data": {
    "overall_trends": {
      "goal_achievement_rate": 0.73,
      "average_time_to_goal": 16.8,
      "adherence_improvement": 0.15,
      "satisfaction_score": 4.2
    },
    "goal_specific_trends": [
      {
        "goal_type": "weight",
        "success_rate": 0.82,
        "average_duration_weeks": 14,
        "common_challenges": ["plateaus", "social_events", "travel"],
        "success_factors": ["meal_prep", "consistent_tracking", "realistic_targets"]
      }
    ],
    "seasonal_patterns": {
      "winter_months": {
        "goal_creation_rate": 0.15,
        "achievement_rate": 0.68,
        "common_challenges": ["reduced_activity", "comfort_eating"]
      },
      "spring_months": {
        "goal_creation_rate": 0.35,
        "achievement_rate": 0.78,
        "motivation_factors": ["summer_preparation", "renewed_energy"]
      }
    }
  }
}
```

### Predictive Goal Modeling

#### `POST /analytics/predict`
Generate predictive models for goal achievement based on current trajectory.

**Body:**
```json
{
  "goal_id": "goal_123",
  "prediction_horizon_weeks": 12,
  "scenario_modeling": true,
  "confidence_intervals": true
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "baseline_prediction": {
      "achievement_date": "2026-05-15",
      "final_value": 74.8,
      "confidence_interval": [73.5, 76.2],
      "success_probability": 0.87
    },
    "scenario_analysis": [
      {
        "scenario": "perfect_adherence",
        "achievement_date": "2026-04-20",
        "success_probability": 0.96
      },
      {
        "scenario": "weekend_challenges",
        "achievement_date": "2026-06-10",
        "success_probability": 0.71
      },
      {
        "scenario": "motivation_decline",
        "achievement_date": "2026-07-15",
        "success_probability": 0.52
      }
    ],
    "optimization_opportunities": [
      {
        "factor": "meal_prep_consistency",
        "impact_on_timeline": "2_weeks_faster",
        "implementation_difficulty": "medium"
      },
      {
        "factor": "cardio_frequency_increase",
        "impact_on_timeline": "1_week_faster",
        "implementation_difficulty": "low"
      }
    ]
  }
}
```

## Error Handling

### Standard Error Format
```json
{
  "ok": false,
  "error": "Goal not found",
  "code": "GOAL_NOT_FOUND",
  "details": {
    "goal_id": "goal_123",
    "user_id": "user_456"
  }
}
```

### Error Codes
- `GOAL_NOT_FOUND`: Requested goal does not exist for user
- `INVALID_GOAL_TYPE`: Unsupported goal type specified
- `MEASUREMENT_REQUIRED`: Goal progress requires measurement data
- `DEADLINE_PASSED`: Cannot update goal with past deadline
- `CONFLICTING_GOALS`: Multiple goals of same type not allowed
- `INSUFFICIENT_DATA`: Not enough data for trend analysis

## Authentication & Authorization
All endpoints require JWT authentication:
```
Authorization: Bearer <jwt-token>
```

## Rate Limiting
- **Goal operations**: 60 requests per minute
- **Analytics queries**: 30 requests per minute
- **Intelligence endpoints**: 20 requests per minute
- **Bulk data operations**: 10 requests per minute

## Integration Points
- **All Modules**: Report progress and metrics toward goals
- **Coach Module**: AI coach uses goal data for personalized coaching
- **Nutrition Module**: Nutrition targets derived from body composition goals
- **Training Module**: Workout programming aligned with body goals
- **Recovery Module**: Recovery optimization supports goal achievement