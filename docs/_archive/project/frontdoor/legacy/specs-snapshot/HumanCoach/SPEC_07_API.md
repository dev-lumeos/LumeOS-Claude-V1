# Human Coach Module — API Specification (Spec)
> Spec Phase 7 | Alle Endpoints mit Request/Response

---

## Übersicht

**Base URL:** `http://human-coach:5600`
**Auth:** JWT via `Authorization: Bearer <token>`
**Coach-Endpoints:** Require `role = coach` in JWT + aktive Coach-Profil
**Format:** `{ ok: boolean, data?: T, error?: string }`

---

## 1. Dashboard

### `GET /api/coach/dashboard/summary`
```json
{
  "total_clients": 28,
  "active_clients": 25,
  "critical_alerts": 2,
  "high_alerts": 4,
  "unread_alerts": 6,
  "avg_adherence_pct": 74.8,
  "avg_autonomy_level": 2.8,
  "recent_achievements_7d": 3,
  "clients_needing_attention": 5
}
```

### `GET /api/coach/dashboard/clients`
**Query:** `status`, `risk_level`, `autonomy_level`, `sort=risk|name|activity`
```json
{
  "clients": [
    {
      "client_id": "uuid",
      "display_name": "Max M.",
      "avatar_url": null,
      "status": "attention",
      "risk_level": "high",
      "autonomy_level": 2,
      "alerts": { "critical": 0, "high": 1, "medium": 2 },
      "metrics": {
        "adherence_7d": 65,
        "adherence_trend": "down",
        "recovery_score": 58,
        "goal_progress": 42
      },
      "last_contact_at": "2026-04-16T18:32:00Z",
      "tags": ["contest_prep", "intermediate"]
    }
  ]
}
```

### `GET /api/coach/dashboard/activity`
**Query:** `limit=20`, `event_type`, `client_id`
```json
{
  "events": [
    {
      "type": "pr_achieved",
      "client": "Tom R.",
      "message": "Neuer PR: Bench Press 100kg",
      "occurred_at": "2026-04-17T09:15:00Z",
      "action": { "type": "celebrate", "label": "🎉 Gratulieren" }
    },
    {
      "type": "alert_critical",
      "client": "Max M.",
      "message": "Recovery Score seit 4 Tagen unter 50",
      "occurred_at": "2026-04-17T07:00:00Z",
      "action": { "type": "view_alert", "alert_id": "uuid" }
    }
  ]
}
```

### `GET /api/coach/dashboard/metrics`
Coach Performance KPIs für den gewählten Zeitraum.
**Query:** `period=weekly|monthly|quarterly`
```json
{
  "period": "monthly",
  "client_retention_rate": 0.94,
  "avg_satisfaction": 4.6,
  "goal_completion_rate": 0.72,
  "avg_response_time_hours": 3.2,
  "adherence_improvement": 0.12,
  "false_positive_rate": 0.05
}
```

---

## 2. Clients

### `GET /api/coach/clients`
**Query:** `status=active|paused|ended|all`, `risk_level`, `tag`, `autonomy_level`

### `POST /api/coach/clients`
```json
{
  "client_email": "maria@example.com",
  "start_date": "2026-05-01",
  "autonomy_level": 2,
  "coaching_style": "collaborative",
  "communication_frequency": "weekly"
}
```

### `GET /api/coach/clients/:id/full-profile`
Vollständiges Profil — Permission-gefiltert pro Modul.

```json
{
  "client": {
    "display_name": "Max M.",
    "autonomy_level": 2,
    "status": "attention",
    "start_date": "2026-02-01"
  },
  "training": {
    "accessible": true,
    "access_level": "full",
    "last_session": "2026-04-16",
    "weekly_adherence_pct": 85,
    "strength_trend": "up",
    "volume_7d_kg": 21500
  },
  "nutrition": {
    "accessible": true,
    "access_level": "full",
    "calories_today": 2840,
    "calorie_target": 3150,
    "protein_g": 162,
    "protein_target": 185,
    "adherence_pct": 72
  },
  "recovery": {
    "accessible": true,
    "access_level": "summary",
    "score_today": 58,
    "score_trend": "declining",
    "avg_sleep_h": 6.2
  },
  "supplements": {
    "accessible": true,
    "access_level": "full",
    "compliance_7d_pct": 78,
    "critical_interactions": 0
  },
  "medical": {
    "accessible": false,
    "access_level": "none",
    "message": "Client hat Medical-Zugang nicht freigegeben"
  },
  "goals": {
    "accessible": true,
    "access_level": "full",
    "phase": "lean_bulk",
    "progress_pct": 45.8,
    "on_track": true,
    "bottleneck": "recovery"
  },
  "alerts_open": 3
}
```

---

## 3. Alerts

### `GET /api/coach/alerts`
**Query:** `severity`, `type`, `client_id`, `status=open|acknowledged|all`, `limit=50`

```json
{
  "alerts": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "client_name": "Max M.",
      "type": "recovery_issues",
      "severity": "high",
      "priority": 2,
      "title": "Recovery Score kritisch niedrig (4 Tage)",
      "message": "Max's Recovery Score: 71→65→58→54→52. Ø Schlaf: 5.9h.",
      "recommended_actions": [
        "Deload-Woche empfehlen",
        "Schlaf besprechen",
        "Trainingsvolumen reduzieren"
      ],
      "status": "open",
      "created_at": "2026-04-17T07:00:00Z"
    }
  ],
  "summary": { "critical": 2, "high": 4, "medium": 8, "low": 3, "info": 5 }
}
```

### `PUT /api/coach/alerts/:id/acknowledge`
```json
{ "coach_note": "Deload-Woche empfohlen, gechattet" }
```

### `POST /api/coach/alerts/bulk-acknowledge`
```json
{ "alert_ids": ["uuid1", "uuid2"], "note": "Reviewed in weekly check-in" }
```

---

## 4. Rules

### `GET /api/coach/rules`
```json
{
  "rules": [
    {
      "id": "uuid",
      "name": "Protein Alert Trainingstag",
      "is_enabled": true,
      "category": "nutrition",
      "trigger_count": 47,
      "effectiveness_score": 0.87,
      "last_triggered_at": "2026-04-16T00:00:00Z"
    }
  ]
}
```

### `POST /api/coach/rules`
```json
{
  "name": "Protein Alert Trainingstag",
  "conditions": [
    { "module": "nutrition", "metric": "protein_adherence_pct", "operator": "<", "value": 70 },
    { "module": "training", "metric": "session_today", "operator": "==", "value": true }
  ],
  "logic": "AND",
  "actions": {
    "type": "alert",
    "severity": "medium",
    "title": "Client unter Protein-Ziel an Trainingstag"
  },
  "cooldown_minutes": 1440,
  "applies_to_all_clients": true
}
```

### `POST /api/coach/rules/:id/test`
```json
{
  "would_trigger_for": [
    { "client_id": "uuid", "name": "Max M." },
    { "client_id": "uuid", "name": "Lisa K." }
  ],
  "total_clients_checked": 25,
  "trigger_count": 2
}
```

### `GET /api/coach/rules/templates`
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Protein Alert",
      "description": "Warnt wenn Protein unter Ziel an Trainingstag",
      "category": "nutrition",
      "difficulty": "beginner",
      "usage_count": 1847,
      "is_featured": true
    }
  ]
}
```

---

## 5. Autonomy

### `GET /api/coach/clients/:id/autonomy`
```json
{
  "current_level": 2,
  "level_name": "Developing",
  "scores": {
    "consistency": 0.82,
    "knowledge": 0.71,
    "self_correction": 0.58,
    "communication": 0.79,
    "overall": 0.73
  },
  "recommendation": {
    "suggested_level": 3,
    "should_promote": true,
    "evidence": "Konsistenz 82% über 30 Tage, Adherence Ø 79%"
  },
  "check_in_frequency": "weekly",
  "next_assessment_date": "2026-05-17"
}
```

### `PUT /api/coach/clients/:id/autonomy`
```json
{
  "new_level": 3,
  "reason": "Exzellente Konsistenz seit 6 Wochen, versteht Plan sehr gut",
  "change_trigger": "scheduled_review"
}
```

---

## 6. Adherence

### `GET /api/coach/clients/:id/adherence`
**Query:** `days=7|14|30`
```json
{
  "period_days": 7,
  "overall": 0.74,
  "weighted": 0.71,
  "by_module": {
    "nutrition":   { "score": 0.65, "trend": "declining" },
    "training":    { "score": 0.85, "trend": "stable" },
    "recovery":    { "score": 0.62, "trend": "declining" },
    "supplements": { "score": 0.78, "trend": "stable" }
  },
  "vs_cohort":  0.74,
  "vs_target":  0.85,
  "volatility": 0.18
}
```

### `GET /api/coach/dashboard/adherence-overview`
Alle Clients im Vergleich — Heatmap-Daten.

---

## 7. Programs

### `GET /api/coach/programs`
### `POST /api/coach/programs`
### `POST /api/coach/programs/:id/assign`
```json
{
  "client_ids": ["uuid1", "uuid2"],
  "start_date": "2026-05-01",
  "auto_delivery": true
}
```

---

## 8. Messages

### `GET /api/coach/messages/:client_id`
**Query:** `limit=50`, `before` (cursor)
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender": "coach",
      "content": "Hey Max, ich sehe dass dein Recovery Score fällt...",
      "message_type": "text",
      "created_at": "2026-04-17T10:30:00Z",
      "read_at": null
    }
  ]
}
```

### `POST /api/coach/messages`
```json
{
  "client_id": "uuid",
  "content": "Empfehle diese Woche eine Deload-Woche",
  "message_type": "text"
}
```

---

## 9. Permissions (Client-seitig)

### `GET /api/coach/permissions/my-coaches`
Client sieht: wer hat Zugriff + was darf er sehen.

### `PUT /api/coach/permissions/:coach_client_id/:module`
```json
{ "access_level": "summary" }
```
**Auth:** Muss Client-JWT sein (nicht Coach-JWT).

---

## 10. Client-seitige Endpoints

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/client/my-coach` | Mein Coach |
| GET | `/api/coach/client/programs` | Zugewiesene Programme |
| POST | `/api/coach/client/programs/:id/confirm` | Programm bestätigen |
| GET | `/api/coach/client/messages` | Chat |
| POST | `/api/coach/client/messages` | Nachricht an Coach |
| GET | `/api/coach/client/checkin` | Aktuelles Check-in |
| POST | `/api/coach/client/checkin` | Check-in absenden |
| GET | `/api/coach/client/permissions` | Meine Freigaben |
| PUT | `/api/coach/client/permissions/:module` | Freigabe ändern |
