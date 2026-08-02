# Supplements Module — API

## Base URL
`http://supplements:5300`

## Auth
JWT via `Authorization: Bearer <token>`

## Route-Mounting

```typescript
app.route('/api/supplements/catalog',        catalogRouter)
app.route('/api/supplements/enhanced',       enhancedRouter)
app.route('/api/supplements/stacks',         stacksRouter)
app.route('/api/supplements/items',          itemsRouter)
app.route('/api/supplements/intake',         intakeRouter)
app.route('/api/supplements/interactions',   interactionsRouter)
app.route('/api/supplements/inventory',      inventoryRouter)
app.route('/api/supplements/intelligence',   intelligenceRouter)
app.route('/api/supplements/analytics',      analyticsRouter)
app.route('/api/supplements/settings',       settingsRouter)
app.route('/api/supplements/templates',      templatesRouter)
app.route('/api/supplements/for-ai',         forAiRouter)
app.route('/api/supplements/for-goals',      forGoalsRouter)
app.route('/api/supplements/pending-actions',pendingActionsRouter)
```

---

## Catalog

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/supplements/catalog` | Suche (q, category, evidence_grade, goal, limit, offset) |
| GET | `/api/supplements/catalog/:id` | Detail + Stack-Interactions + Nutrition Gap |

**Response Detail:**
```json
{
  "id": "uuid", "name": "Vitamin D3", "evidence_grade": "S",
  "typical_dose_min": 2000, "typical_dose_max": 5000, "dose_unit": "IU",
  "absorption_notes": "Mit fetthaltiger Mahlzeit",
  "nutrients_provided": {"VITD": {"amount": 1000, "unit": "IU"}},
  "stack_interactions": [{"partner": "Vitamin K2", "type": "synergy", "severity": "info"}],
  "nutrition_gap": {"current_from_food_iu": 420, "rda_iu": 800, "deficit_iu": 380}
}
```

---

## Enhanced Substances

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/supplements/enhanced` | Suche (q, category, route, limit, offset) — nur wenn enhanced_mode |
| GET | `/api/supplements/enhanced/:id` | Detail mit Bloodwork Panel |

---

## Stacks

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/supplements/stacks` | Alle Stacks des Users |
| POST | `/api/supplements/stacks` | Erstellen (optional mit template_id) |
| PUT | `/api/supplements/stacks/:id` | Updaten |
| DELETE | `/api/supplements/stacks/:id` | Löschen |
| POST | `/api/supplements/stacks/:id/activate` | Aktivieren + Interaction Check |

**Activate Response:**
```json
{
  "activated": {"id": "uuid", "name": "Bulk Stack"},
  "deactivated": [{"id": "uuid", "name": "Daily Basics"}],
  "interaction_check": {"critical": 0, "warnings": 1, "cautions": 2}
}
```

---

## Stack Items

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/supplements/items` | Items des aktiven Stacks (oder ?stack_id=) |
| POST | `/api/supplements/items` | Hinzufügen + Interaction Check |
| PUT | `/api/supplements/items/:id` | Dosis/Timing/Name updaten |
| DELETE | `/api/supplements/items/:id` | Entfernen |
| PUT | `/api/supplements/items/reorder` | Drag & Drop Reihenfolge |

---

## Intake

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/supplements/intake/today` | Heute nach Timing-Slots gruppiert |
| POST | `/api/supplements/intake/log` | Status setzen (taken/skipped/snoozed) |
| POST | `/api/supplements/intake/generate` | Tages-Logs generieren (idempotent) |
| GET | `/api/supplements/intake/history` | History (from, to) |
| GET | `/api/supplements/intake/compliance` | Compliance-Score + Trend |

**Today Response:**
```json
{
  "date": "2026-04-17",
  "compliance_pct": 75.0,
  "slots": {
    "morning": [{"log_id": "uuid", "supplement_name": "Vitamin D3", "dose": 3000, "dose_unit": "IU", "status": "taken"}],
    "evening": [{"supplement_name": "Magnesium", "dose": 400, "status": "pending"}]
  },
  "summary": {"taken": 4, "pending": 2, "skipped": 0}
}
```

---

## Interactions

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/supplements/interactions` | Alle Interactions für aktiven Stack |
| GET | `/api/supplements/interactions/check` | Check: ?stack_id= oder ?supplement_ids= |

---

## Inventory

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/supplements/inventory` | Bestand mit Low-Stock Alerts |
| POST | `/api/supplements/inventory` | Produkt anlegen |
| PUT | `/api/supplements/inventory/:id` | Bestand aktualisieren |

---

## Intelligence

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/supplements/intelligence/gap-analysis` | Mikro-Lücken aus Food Log + Stack |
| GET | `/api/supplements/intelligence/redundancies` | Stack-Überschneidungen |
| GET | `/api/supplements/intelligence/timing` | Meal-based + Training-Aware Timing |
| GET | `/api/supplements/intelligence/cost` | Monatliche Kosten + Einsparpotential |

**Gap Analysis Response:**
```json
{
  "gaps": [
    {"nutrient_code": "MG", "from_food_avg": 245, "from_supplements": 0,
     "total": 245, "rda": 420, "pct_of_rda": 58.3, "status": "gap",
     "covered_by_stack": false, "suggestion": "Magnesium Glycinat 400mg abends"}
  ]
}
```

---

## Cross-Module

| Method | Route | Beschreibung |
|---|---|---|
| GET | `/api/supplements/for-ai` | Buddy Context (Stack-Status, Gaps, Pending, Training-Aware) |
| GET | `/api/supplements/for-goals` | Compliance Score Export |
| GET | `/api/supplements/pending-actions` | Offene User-Actions |

---

## Response Format

```json
{ "ok": true, "data": T }
{ "ok": false, "error": "message" }
```
