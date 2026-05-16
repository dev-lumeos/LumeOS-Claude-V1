# Training Module — API

## Base URL
`http://training:5200`

## Auth
JWT via `Authorization: Bearer <token>` (globalAuthMiddleware)

## Route-Mounting Reihenfolge (kritisch)
```typescript
app.route('/api/training/exercises/search', exerciseSearchRouter)  // VOR /:id
app.route('/api/training/exercises',         exercisesRouter)
app.route('/api/training/muscle-groups',     muscleGroupsRouter)
app.route('/api/training/equipment',         equipmentRouter)
app.route('/api/training/routines',          routinesRouter)
app.route('/api/training/sessions/live',     liveSessionRouter)     // VOR /sessions
app.route('/api/training/sessions',          sessionsRouter)
app.route('/api/training/sets',              setsRouter)
app.route('/api/training/records',           recordsRouter)
app.route('/api/training/progression',       progressionRouter)
app.route('/api/training/schedule',          scheduleRouter)
app.route('/api/training/analytics',         analyticsRouter)
app.route('/api/training/feedback',          feedbackRouter)
app.route('/api/training/landmarks',         landmarksRouter)
app.route('/api/training/for-ai',            forAiRouter)
app.route('/api/training/for-goals',         forGoalsRouter)
app.route('/api/training/for-recovery',      forRecoveryRouter)
app.route('/api/training/pending-actions',   pendingActionsRouter)
```

---

## Exercises

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/training/exercises` | Suche (q, category, muscle_group_id, body_region, equipment_id, difficulty, sort, limit, offset) |
| GET | `/api/training/exercises/:id` | Detail mit allen Nährstoffen + User History |
| GET | `/api/training/exercises/search` | Smart Search (Debounced, mit Evaluation Score sort) |
| GET | `/api/training/muscle-groups` | Alle 157 Muskelgruppen als Baum |
| GET | `/api/training/equipment` | Alle ~40 Equipment-Typen |

**Exercise Search Query-Params:** `q` · `category` · `muscle_group_id` · `body_region` · `equipment_id` · `tracking_type` · `difficulty` · `sort` (relevance/evaluation_desc/name_asc/popularity) · `limit` · `offset`

---

## Routines

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/training/routines` | Alle Routines (filter: active_only, creator_type) |
| POST | `/api/training/routines` | Erstellen |
| GET | `/api/training/routines/:id` | Detail mit Exercises |
| PUT | `/api/training/routines/:id` | Updaten |
| DELETE | `/api/training/routines/:id` | Deaktivieren (soft delete) |
| POST | `/api/training/routines/:id/duplicate` | Kopieren |

---

## Live Workout

| Method | Route | Beschreibung |
|---|---|---|
| POST | `/api/training/sessions/live/start` | Session starten (routine_id optional) |
| POST | `/api/training/sessions/live/:id/sets` | Set loggen + PR-Check |
| POST | `/api/training/sessions/live/:id/complete` | Abschliessen |
| DELETE | `/api/training/sessions/live/:id` | Abbrechen |

**Start Response:** Session-ID + alle Exercises mit Previous Performance + Progression Suggestion
**Set Response:** `estimated_1rm`, `volume_kg`, `is_pr`, `pr_type`, `session_totals`

---

## Sessions History

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/training/sessions` | History (from, to, limit, offset) |
| GET | `/api/training/sessions/:id` | Detail mit Exercises + Sets |

---

## Progression

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/training/progression/:exerciseId/suggestion` | Nächster Satz Vorschlag |
| GET | `/api/training/progression/:exerciseId/config` | Aktuelle Konfiguration |
| PUT | `/api/training/progression/:exerciseId/config` | Konfiguration updaten |

**Suggestion Response:** `weight_kg`, `reps`, `model`, `reason`, `deload_warning`

---

## Personal Records

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/training/records` | Alle PRs (filter: exercise_id, pr_type) |
| GET | `/api/training/records/:exerciseId/history` | PR-Verlauf für Chart |

---

## Analytics

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/training/analytics/summary` | Periode-Zusammenfassung (week/month/3months/year) |
| GET | `/api/training/analytics/volume` | Wöchentliches Volumen (weeks, muscle_group_id) |
| GET | `/api/training/analytics/strength` | Stärke-Verlauf (exercise_id, weeks) |
| GET | `/api/training/analytics/balance` | Push/Pull/Legs Balance + Status |
| GET | `/api/training/analytics/landmarks` | Volume Landmarks mit Status |

---

## Schedule

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/training/schedule` | Wochenplan + next_workout + streak |
| PUT | `/api/training/schedule` | Wochenplan updaten |

---

## Feedback & Landmarks

| Method | Route | Beschreibung |
|---|---|---|
| POST | `/api/training/feedback` | Post-Workout Feedback (pump, soreness, performance) |
| GET | `/api/training/landmarks` | Volume Landmarks mit Feedback-Loop Status |

---

## Cross-Module

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/training/for-ai` | Buddy Context (status, trends, muscle map, flags) |
| GET | `/api/training/for-goals` | Goals Compliance (compliance_score, sessions, volume) |
| POST | `/api/training/for-recovery` | Training Load an Recovery senden |
| GET | `/api/training/pending-actions` | Offene Actions für Buddy-TODO |

---

## Response Format

```json
{ "ok": true, "data": T }
{ "ok": false, "error": "message", "code": "ERROR_CODE" }
```

HTTP Status: 400 · 401 · 403 · 404 · 409 · 500
