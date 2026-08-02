# Goals Module — API Documentation

## Base URL
`http://localhost:5900/api/goals`

## Server
Hono on Port 5900 (9th API server)

---

## Measurements

### GET /measurements
Get measurement for a specific date.
```
Query: ?date=2026-02-25
Response: { ok: true, data: { id, date, weight_kg, body_fat_pct, method, muscle_mass_kg, bmi, ffmi, notes } }
```

### GET /measurements/history
Get measurement history.
```
Query: ?days=30 (default 30)
Response: { ok: true, data: [{ date, weight_kg, body_fat_pct, muscle_mass_kg, bmi, ffmi }] }
```

### GET /measurements/latest
Get most recent measurement.
```
Response: { ok: true, data: { ...measurement, deltas: { weight_kg: +0.5, body_fat_pct: -0.3, ... } } }
```

### POST /measurements
Create new measurement.
```
Body: { date, weight_kg, body_fat_pct, method?, notes? }
Computed server-side: muscle_mass_kg, bmi, ffmi (requires user_height from settings)
Response: { ok: true, data: { id, ...measurement } }
```

### PUT /measurements/:id
Update measurement.
```
Body: { weight_kg?, body_fat_pct?, method?, notes? }
Response: { ok: true, data: { ...updated } }
```

### DELETE /measurements/:id
```
Response: { ok: true }
```

---

## Circumferences

### GET /circumferences
Get circumferences for a date.
```
Query: ?date=2026-02-25
Response: { ok: true, data: { id, date, neck_cm, shoulders_cm, chest_cm, upper_arm_left_cm, upper_arm_right_cm, forearm_left_cm, forearm_right_cm, waist_cm, hip_cm, thigh_left_cm, thigh_right_cm, calf_left_cm, calf_right_cm } }
```

### GET /circumferences/history
```
Query: ?days=30
Response: { ok: true, data: [...] }
```

### GET /circumferences/ratios
Computed ratios from latest circumferences.
```
Response: {
  ok: true,
  data: {
    shoulder_waist_ratio: 1.62,
    arm_symmetry_pct: 97.5,     // 100 = perfect
    leg_symmetry_pct: 98.2,
    v_taper_score: 1.62,
    proportions: {
      ideal_chest: 148.3,        // Steve Reeves formula based on wrist/ankle
      actual_chest: 112.0,
      pct_of_ideal: 75.5
    }
  }
}
```

### POST /circumferences
```
Body: { date, neck_cm?, shoulders_cm?, chest_cm?, upper_arm_left_cm?, upper_arm_right_cm?, forearm_left_cm?, forearm_right_cm?, waist_cm?, hip_cm?, thigh_left_cm?, thigh_right_cm?, calf_left_cm?, calf_right_cm? }
Response: { ok: true, data: { id, ... } }
```

### PUT /circumferences/:id
```
Body: { ...partial fields }
Response: { ok: true, data: { ...updated } }
```

---

## Photos

### POST /photos/session
Start a new photo session.
```
Body: { session_type: "mandatory_8" | "quarter_turns" | "detail" | "custom", notes? }
Response: { ok: true, data: { session_id, session_type, created_at } }
```

### POST /photos/upload
Upload a photo to a session.
```
Body: { session_id, pose_type, image: "data:image/jpeg;base64,..." }
Response: { ok: true, data: { id, pose_type, thumbnail_path, created_at } }
```

### GET /photos/sessions
List all photo sessions.
```
Query: ?limit=20&offset=0
Response: { ok: true, data: [{ session_id, date, session_type, photo_count, overall_ai_analysis }] }
```

### GET /photos/session/:id
Get session with all photos.
```
Response: { ok: true, data: { session, photos: [{ id, pose_type, image_path, thumbnail_path, ai_analysis, ai_scores }] } }
```

### GET /photos/pose/:poseType
Get all photos of a specific pose chronologically.
```
Query: ?limit=10
Response: { ok: true, data: [{ id, date, image_path, thumbnail_path, ai_scores }] }
```

### DELETE /photos/:id
```
Response: { ok: true }
```

---

## AI Analysis

### POST /analysis/photo
Analyze a single photo with Claude Vision.
```
Body: { photo_id }
Response: {
  ok: true,
  data: {
    muscle_scores: { biceps: 7, lats: 8, quads: 6, abs: 5, ... },
    conditioning: 6,
    symmetry: 8,
    estimated_body_fat_pct: 14,
    strengths: ["Back width", "Shoulder caps"],
    weaknesses: ["Quad separation", "Calf size"],
    notes: "Good overall development..."
  }
}
```

### POST /analysis/compare
Compare two photos of the same pose.
```
Body: { photo_id_1, photo_id_2 }
Response: {
  ok: true,
  data: {
    changes: { biceps: +1, quads: +2, abs: 0, ... },
    overall_progress: "significant_improvement",
    summary: "Deutliche Verbesserung in Quad-Definition...",
    recommendations: ["Focus on calf training", "Maintain back width"]
  }
}
```

### GET /analysis/report
Generate periodic AI report.
```
Query: ?period=weekly|monthly
Response: {
  ok: true,
  data: {
    period, date_range,
    top_improvements: [...],
    focus_areas: [...],
    measurements_summary: {...},
    photo_comparison: {...},
    recommendations: [...],
    cross_module_insights: [...]
  }
}
```

---

## Goals/Targets

### GET /targets
Get all active goals.
```
Response: { ok: true, data: [{ id, goal_type, target_value, target_metric, current_value, progress_pct, deadline, status }] }
```

### POST /targets
Create a new goal.
```
Body: { goal_type: "weight"|"body_fat"|"muscle_mass"|"circumference"|"visual", target_value, target_metric?, deadline? }
Response: { ok: true, data: { id, ... } }
```

### PUT /targets/:id
```
Body: { target_value?, deadline?, status? }
Response: { ok: true, data: { ...updated } }
```

### DELETE /targets/:id
```
Response: { ok: true }
```

### GET /targets/:id/progress
```
Response: { ok: true, data: { goal, history: [...], projected_date, on_track: true|false } }
```

---

## Dashboard

### GET /dashboard
Overview combining latest data from all sources.
```
Response: {
  ok: true,
  data: {
    latest_measurement: { weight_kg, body_fat_pct, ffmi, date },
    latest_circumferences: { ..., ratios },
    latest_photo_session: { date, photo_count, ai_summary },
    active_goals: [{ goal_type, progress_pct }],
    trends: { weight_7d, body_fat_7d, muscle_mass_7d }
  }
}
```
