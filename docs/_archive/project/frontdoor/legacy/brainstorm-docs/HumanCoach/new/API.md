# Human Coach Module — API

## Base URL
`http://human-coach:5600`

## Auth
JWT via `Authorization: Bearer <token>`
Coach-Endpoints: Require `is_coach = true` in JWT

---

## 1. Dashboard

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/dashboard/summary` | Summary Widget |
| GET | `/api/coach/dashboard/clients` | Client Cards (sortiert nach Risk) |
| GET | `/api/coach/dashboard/activity` | Activity Feed (Events aller Clients) |
| GET | `/api/coach/dashboard/metrics` | Coach Performance KPIs |

**Summary Response:**
```json
{
  "total_clients": 28, "active_clients": 25,
  "critical_alerts": 2, "high_alerts": 4,
  "avg_adherence_pct": 74.8, "avg_autonomy_level": 2.8,
  "recent_achievements": 3, "unread_alerts": 6
}
```

**Client Cards Response:**
```json
{
  "clients": [
    {
      "client_id": "uuid", "display_name": "Max M.",
      "status": "attention",
      "autonomy_level": 2,
      "alerts": { "critical": 0, "high": 1, "medium": 2 },
      "metrics": {
        "adherence_7d": 65, "adherence_trend": "down",
        "recovery_score": 58, "goal_progress": 42
      },
      "last_contact_at": "2026-04-16T18:32:00Z",
      "quick_actions": ["message", "adjust_plan"]
    }
  ]
}
```

---

## 2. Clients

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/clients` | Alle Clients (filter: status, autonomy, risk) |
| POST | `/api/coach/clients` | Neuen Client hinzufügen (Invite) |
| GET | `/api/coach/clients/:id` | Basis-Info |
| GET | `/api/coach/clients/:id/full-profile` | Vollständiges Profil (alle Module, Permission-gefiltert) |
| PUT | `/api/coach/clients/:id` | Status, Notes, Tags updaten |
| DELETE | `/api/coach/clients/:id` | Relationship beenden |

**Full Profile Response:**
```json
{
  "client": { "display_name": "Max M.", "autonomy_level": 2 },
  "training": {
    "last_session": "2026-04-16", "weekly_adherence_pct": 85,
    "strength_trend": "up", "prs_this_week": 1
  },
  "nutrition": {
    "calories_today": 2840, "calorie_target": 3150, "adherence_pct": 72,
    "protein_g": 162, "protein_target": 185
  },
  "recovery": {
    "today_score": 62, "trend_7d": [71,68,65,62,58,61,62], "avg_sleep_h": 6.2
  },
  "supplements": { "compliance_7d_pct": 78, "stack_items": 6 },
  "medical": null,  // permission: none
  "goals": { "phase": "lean_bulk", "progress_pct": 45.8, "on_track": true },
  "alerts_open": 3
}
```

---

## 3. Alerts

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/alerts` | Alle Alerts (filter: severity, type, client, status) |
| PUT | `/api/coach/alerts/:id/read` | Als gelesen markieren |
| PUT | `/api/coach/alerts/:id/acknowledge` | Bestätigen + Coach Note |
| PUT | `/api/coach/alerts/:id/resolve` | Lösen |
| PUT | `/api/coach/alerts/:id/dismiss` | Verwerfen (false positive etc.) |
| POST | `/api/coach/alerts/bulk-acknowledge` | Mehrere Alerts auf einmal |

**Alert Response:**
```json
{
  "id": "uuid",
  "client_name": "Max M.",
  "type": "recovery_issues",
  "severity": "high", "priority": 2,
  "title": "Recovery Score unter 50% seit 4 Tagen",
  "message": "Max's Recovery Score hat sich verschlechtert: 71→65→58→54→52. Ø Schlaf: 6.2h. Mögliche Ursache: Overtraining.",
  "recommended_actions": ["Deload-Woche empfehlen", "Schlaf besprechen", "Training-Volumen analysieren"],
  "created_at": "2026-04-17T07:00:00Z",
  "status": "open"
}
```

---

## 4. Rule Builder

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/rules` | Alle Regeln des Coaches |
| POST | `/api/coach/rules` | Neue Regel erstellen |
| PUT | `/api/coach/rules/:id` | Updaten |
| DELETE | `/api/coach/rules/:id` | Löschen (soft delete) |
| POST | `/api/coach/rules/:id/test` | Testlauf: welche Clients würden heute triggern? |
| GET | `/api/coach/rules/templates` | System-Templates |
| POST | `/api/coach/rules/from-template/:template_id` | Regel aus Template erstellen |

**Rule POST Body:**
```json
{
  "name": "Protein Alert",
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
  "cooldown_minutes": 1440
}
```

**Test Response:**
```json
{
  "would_trigger_for": ["Max M.", "Lisa K."],
  "total_clients_checked": 25,
  "trigger_count": 2
}
```

---

## 5. Autonomy

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/clients/:id/autonomy` | Aktueller Level + Scores |
| PUT | `/api/coach/clients/:id/autonomy` | Level ändern |
| GET | `/api/coach/clients/:id/autonomy-history` | Verlauf aller Änderungen |
| GET | `/api/coach/clients/:id/autonomy/recommendation` | Auto-Empfehlung |

---

## 6. Adherence

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/clients/:id/adherence` | Aktuelle Adherence (7/14/30 Tage) |
| GET | `/api/coach/clients/:id/adherence/trend` | Trend + Intervention Points |
| GET | `/api/coach/dashboard/adherence-overview` | Alle Clients im Vergleich |

---

## 7. Programs

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/programs` | Alle Programme des Coaches |
| POST | `/api/coach/programs` | Neues Programm erstellen |
| PUT | `/api/coach/programs/:id` | Updaten |
| POST | `/api/coach/programs/:id/assign` | Zu einem/mehreren Clients zuweisen |
| GET | `/api/coach/programs/templates` | Vorlagen |

---

## 8. Messages + Check-ins

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/messages/:client_id` | Chat-Verlauf |
| POST | `/api/coach/messages` | Nachricht senden |
| GET | `/api/coach/checkins/:client_id` | Check-in History |
| POST | `/api/coach/checkins/send/:client_id` | Check-in Template senden |
| GET | `/api/coach/checkins/templates` | Verfügbare Templates |

---

## 9. Permissions (Client-seitig)

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/permissions/:coach_client_id` | Aktuelle Permissions |
| PUT | `/api/coach/permissions/:coach_client_id` | Permission updaten (Client-Auth) |
| GET | `/api/coach/my-coaches` | Client: wer hat Zugriff auf meine Daten? |

---

## Client-seitige API (apps/app)

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/coach/client/my-coach` | Mein Coach (Name, Avatar, Kontakt) |
| GET | `/api/coach/client/programs` | Vom Coach zugewiesene Programme |
| GET | `/api/coach/client/messages` | Chat mit Coach |
| POST | `/api/coach/client/messages` | Nachricht an Coach |
| GET | `/api/coach/client/checkin` | Aktuelles Check-in Template |
| POST | `/api/coach/client/checkin` | Check-in absenden |
