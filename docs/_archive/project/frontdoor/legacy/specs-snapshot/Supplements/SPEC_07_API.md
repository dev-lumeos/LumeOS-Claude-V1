# Supplements Module — API Specification
> Spec Phase 7 | Alle Endpoints

---

## Übersicht

**Base URL:** `http://supplements:5300`
**Auth:** JWT via `Authorization: Bearer <token>`
**Format:** `{ ok: boolean, data?: T, error?: string }`

## Route-Mounting

```typescript
app.route('/api/supplements/catalog',         catalogRouter)
app.route('/api/supplements/enhanced',        enhancedRouter)
app.route('/api/supplements/stacks',          stacksRouter)
app.route('/api/supplements/items',           itemsRouter)
app.route('/api/supplements/intake',          intakeRouter)
app.route('/api/supplements/interactions',    interactionsRouter)
app.route('/api/supplements/inventory',       inventoryRouter)
app.route('/api/supplements/intelligence',    intelligenceRouter)
app.route('/api/supplements/analytics',       analyticsRouter)
app.route('/api/supplements/settings',        settingsRouter)
app.route('/api/supplements/templates',       templatesRouter)
app.route('/api/supplements/for-ai',          forAiRouter)
app.route('/api/supplements/for-goals',       forGoalsRouter)
app.route('/api/supplements/pending-actions', pendingActionsRouter)
app.route('/api/supplements/health',          healthRouter)
```

---

## 1. Supplement Catalog — `/api/supplements/catalog`

### `GET /api/supplements/catalog`

**Query-Parameter:**

| Param | Typ | Default | Beschreibung |
|---|---|---|---|
| `q` | string | `''` | Suchbegriff |
| `category` | string | — | Vitamins \| Minerals \| Performance \| ... |
| `evidence_grade` | string | — | S \| A \| B \| C \| D \| F |
| `goal` | string | — | muscle_building \| fat_loss \| recovery \| health \| longevity |
| `limit` | integer | 20 | Max. Ergebnisse |
| `offset` | integer | 0 | Paginierung |

**Response:**
```json
{
  "ok": true,
  "data": {
    "hits": [
      {
        "id": "uuid",
        "name": "Creatine Monohydrate",
        "name_de": "Kreatin Monohydrat",
        "category": "Performance",
        "evidence_grade": "S",
        "typical_dose_min": 3, "typical_dose_max": 5, "dose_unit": "g",
        "timing_default": "morning",
        "benefits": ["Kraft ↑", "Muskelmasse ↑", "Recovery ↑"],
        "priority": "essential",
        "requires_cycling": false,
        "nutrients_provided": {},
        "interaction_count": 0
      }
    ],
    "total": 47,
    "limit": 20,
    "offset": 0
  }
}
```

---

### `GET /api/supplements/catalog/:id`

Supplement-Detail mit Interactions für aktiven Stack.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "name": "Vitamin D3",
    "name_de": "Vitamin D3 (Cholecalciferol)",
    "name_th": null,
    "category": "Vitamins",
    "evidence_grade": "S",
    "evidence_summary": "Starke Evidenz für Knochengesundheit, Immunfunktion und Hormonbalance",
    "evidence_sources": [{"doi": "10.1001/jama...", "year": 2019, "finding": "..."}],
    "typical_dose_min": 2000, "typical_dose_max": 5000, "dose_unit": "IU",
    "absorption_notes": "Mit fetthaltiger Mahlzeit einnehmen für optimale Absorption",
    "requires_food": true,
    "nutrients_provided": {"VITD": {"amount": 1000, "unit": "IU"}},
    "benefits": ["Knochengesundheit", "Immunsystem", "Testosteron-Support"],
    "side_effects": ["Hyperkalzämie bei extremer Überdosierung (>10.000 IU/Tag)"],
    "contraindications": ["Hyperkalzämie", "Niereninsuffizienz"],
    "stack_interactions": [
      {
        "partner": "Vitamin K2", "type": "synergy", "severity": "info",
        "description_de": "K2 leitet durch Supplementierung erhöhtes Calcium zu den Knochen",
        "recommendation_de": "Gemeinsam einnehmen empfohlen"
      }
    ],
    "nutrition_gap": {
      "current_from_food_iu": 420,
      "rda_iu": 800,
      "deficit_iu": 380
    }
  }
}
```

---

## 2. Enhanced Substances — `/api/supplements/enhanced`

Nur verfügbar wenn `enhanced_mode = true`.

### `GET /api/supplements/enhanced`

**Query:** `q`, `category`, `route`, `limit`, `offset`

**Response:** Analog zu Catalog, mit zusätzlichen Feldern:
`hepatotoxicity_level`, `cardiovascular_risk`, `androgenic_rating`, `anabolic_rating`,
`requires_pct`, `requires_ai`, `aromatization`, `detection_time_days`

---

### `GET /api/supplements/enhanced/:id`

Enhanced Substance Detail mit Bloodwork Panel.

---

## 3. Stacks — `/api/supplements/stacks`

### `GET /api/supplements/stacks`

Alle Stacks des Users.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "name": "Daily Basics",
      "goal": "health",
      "is_active": true,
      "source": "user",
      "item_count": 5,
      "total_monthly_cost": 42.50,
      "interaction_alerts": 0,
      "created_at": "2026-03-01T00:00:00Z"
    }
  ]
}
```

---

### `POST /api/supplements/stacks`

Stack erstellen (optional mit Template).

**Body:**
```json
{
  "name": "Bulk Stack",
  "goal": "muscle_building",
  "template_id": "uuid",
  "description": "optional"
}
```

---

### `POST /api/supplements/stacks/:id/activate`

Stack aktivieren. Deaktiviert alle anderen.

**Response:**
```json
{
  "ok": true,
  "data": {
    "activated": { "id": "uuid", "name": "Bulk Stack" },
    "deactivated": [{ "id": "uuid", "name": "Daily Basics" }],
    "interaction_check": {
      "critical": 0, "warnings": 1, "cautions": 2
    }
  }
}
```

---

### `PUT /api/supplements/stacks/:id`

Stack updaten (Name, Beschreibung, Goal).

---

### `DELETE /api/supplements/stacks/:id`

Stack löschen (soft delete wenn Items vorhanden).

---

## 4. Stack Items — `/api/supplements/items`

### `GET /api/supplements/items`

Alle Items des aktiven Stacks (oder eines bestimmten Stacks via `?stack_id=`).

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "supplement_id": "uuid",
      "supplement_name": "Creatine Monohydrate",
      "supplement_name_de": "Kreatin Monohydrat",
      "evidence_grade": "S",
      "custom_name": null,
      "dose": 5, "dose_unit": "g",
      "timing": "morning",
      "frequency": "daily",
      "cycling": null,
      "sort_order": 1,
      "mode": "standard"
    }
  ]
}
```

---

### `POST /api/supplements/items`

Item zu Stack hinzufügen + automatischer Interaction Check.

**Body:**
```json
{
  "stack_id": "uuid",
  "supplement_id": "uuid",
  "dose": 3000,
  "dose_unit": "IU",
  "timing": "morning",
  "frequency": "daily",
  "custom_name": "Morning Vitamin D",
  "notes": "Mit Mittagessen"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "item": { "id": "uuid", ... },
    "interaction_alerts": [
      {
        "severity": "info",
        "type": "synergy",
        "partner": "Vitamin K2",
        "description_de": "Zusammen einnehmen empfohlen"
      }
    ]
  }
}
```

---

### `PUT /api/supplements/items/:id`

Item updaten (Dosis, Timing, Custom-Name).

---

### `DELETE /api/supplements/items/:id`

Item aus Stack entfernen.

---

### `PUT /api/supplements/items/reorder`

Reihenfolge ändern (Drag & Drop).

**Body:** `{ "order": ["uuid1", "uuid2", "uuid3"] }`

---

## 5. Intake — `/api/supplements/intake`

### `GET /api/supplements/intake/today`

Heutige Einnahme-Liste, gruppiert nach Timing-Slot.

**Response:**
```json
{
  "ok": true,
  "data": {
    "date": "2026-04-15",
    "compliance_pct": 75.0,
    "slots": {
      "morning": [
        {
          "log_id": "uuid",
          "item_id": "uuid",
          "supplement_name": "Vitamin D3",
          "dose": 3000, "dose_unit": "IU",
          "status": "taken",
          "taken_at": "2026-04-15T07:30:00Z",
          "evidence_grade": "S"
        }
      ],
      "pre_workout": [...],
      "evening": [
        {
          "log_id": "uuid",
          "supplement_name": "Magnesium Glycinat",
          "dose": 400, "dose_unit": "mg",
          "status": "pending"
        }
      ]
    },
    "summary": { "taken": 4, "pending": 2, "skipped": 0, "scheduled": 6 }
  }
}
```

---

### `POST /api/supplements/intake/log`

Status einer Einnahme setzen.

**Body:**
```json
{
  "stack_item_id": "uuid",
  "date": "2026-04-15",
  "status": "taken",
  "actual_dose": 3000,
  "notes": "optional"
}
```

---

### `POST /api/supplements/intake/generate`

Tages-Intake-Logs aus aktivem Stack generieren (idempotent).

**Body:** `{ "date": "2026-04-15" }` (default: heute)

---

### `GET /api/supplements/intake/history`

**Query:** `from`, `to`, `limit`, `offset`

---

### `GET /api/supplements/intake/compliance`

**Query:** `days` (default 30), `mode` (standard|enhanced)

**Response:**
```json
{
  "ok": true,
  "data": {
    "period_days": 30,
    "compliance_pct": 82.3,
    "weighted_compliance_pct": 88.5,
    "daily_history": [
      { "date": "2026-04-15", "pct": 83.3, "taken": 5, "scheduled": 6 }
    ]
  }
}
```

---

## 6. Interactions — `/api/supplements/interactions`

### `GET /api/supplements/interactions`

Alle Interactions für aktiven Stack.

**Response:**
```json
{
  "ok": true,
  "data": {
    "critical": [],
    "warnings": [
      {
        "id": "uuid",
        "supplement1": "Calcium", "supplement2": "Iron",
        "type": "absorption", "severity": "warning",
        "description_de": "Calcium blockiert die Eisenaufnahme",
        "recommendation_de": "2h Abstand einhalten",
        "timing_recommendation": "separate_2h"
      }
    ],
    "cautions": [...],
    "synergies": [
      {
        "supplement1": "Vitamin D3", "supplement2": "Vitamin K2",
        "type": "synergy",
        "description_de": "K2 optimiert Calcium-Routing zu den Knochen"
      }
    ]
  }
}
```

---

### `GET /api/supplements/interactions/check`

Interactions für einen bestimmten Stack oder eine Supplement-Kombination.

**Query:** `stack_id` ODER `supplement_ids` (komma-separiert)

---

## 7. Inventory — `/api/supplements/inventory`

### `GET /api/supplements/inventory`

Bestand-Übersicht mit Low-Stock Alerts.

---

### `POST /api/supplements/inventory`

Neues Produkt anlegen.

**Body:**
```json
{
  "supplement_id": "uuid",
  "product_name": "Now Foods Vitamin D3 2000IU",
  "current_stock": 180,
  "unit": "capsules",
  "expiry_date": "2027-06-01",
  "cost_per_unit": 0.08,
  "low_stock_threshold": 14
}
```

---

### `PUT /api/supplements/inventory/:id`

Bestand aktualisieren (nach Nachbestellung).

**Body:** `{ "current_stock": 180, "purchase_date": "2026-04-15" }`

---

## 8. Intelligence — `/api/supplements/intelligence`

### `GET /api/supplements/intelligence/gap-analysis`

Mikronährstoff-Lücken aus Nutrition + aktuellem Stack.

**Query:** `days` (default 7, Durchschnitt über N Tage)

**Response:**
```json
{
  "ok": true,
  "data": {
    "analysis_period_days": 7,
    "gaps": [
      {
        "nutrient_code": "VITD",
        "nutrient_name_de": "Vitamin D",
        "from_food_avg": 420,
        "from_supplements": 3000,
        "total": 3420,
        "rda": 800,
        "pct_of_rda": 427,
        "status": "ok",
        "covered_by_stack": true
      },
      {
        "nutrient_code": "MG",
        "nutrient_name_de": "Magnesium",
        "from_food_avg": 245,
        "from_supplements": 0,
        "total": 245,
        "rda": 420,
        "pct_of_rda": 58.3,
        "status": "gap",
        "covered_by_stack": false,
        "suggestion": "Magnesium Glycinat 200–400mg abends"
      }
    ]
  }
}
```

---

### `GET /api/supplements/intelligence/redundancies`

Überschneidungen im aktiven Stack.

---

### `GET /api/supplements/intelligence/timing`

Meal-based + Training-Aware Timing-Optimierung.

**Response:**
```json
{
  "ok": true,
  "data": {
    "today_workout": "legs",
    "optimized_slots": {
      "morning": ["Vitamin D3 mit Frühstück", "Omega-3"],
      "pre_workout": ["Creatine 5g", "Caffeine 200mg", "Citrulline 6g"],
      "post_workout": ["Magnesium 400mg"],
      "evening": []
    },
    "warnings": [
      "Iron und Calcium im Stack — mindestens 2h Abstand einhalten"
    ]
  }
}
```

---

### `GET /api/supplements/intelligence/cost`

Monatliche Stack-Kosten + Optimierungsvorschläge.

---

## 9. For-AI — `/api/supplements/for-ai`

```json
{
  "ok": true,
  "data": {
    "stack_status": "6/8 Supplements heute genommen (75%)",
    "pending": ["Magnesium 400mg (Abends)", "Zinc 15mg (Abendessen)"],
    "gap_alerts": [
      "Magnesium: nur 58% RDA aus Food + Stack → mehr Magnesium oder Dosis erhöhen"
    ],
    "training_stack": {
      "today": "Leg Day",
      "pre_workout": ["Creatine 5g", "Caffeine 200mg"],
      "post_workout": ["Magnesium 400mg"]
    },
    "interaction_alerts": [],
    "compliance_7d": 82.3,
    "low_stock": ["Omega-3: noch 5 Tage Vorrat"]
  }
}
```

---

## 10. For-Goals — `/api/supplements/for-goals`

```json
{
  "ok": true,
  "data": {
    "module": "supplements",
    "date": "2026-04-15",
    "compliance_score": 82,
    "details": {
      "items_taken": 6,
      "items_scheduled": 8,
      "base_compliance_pct": 75.0,
      "evidence_weighted_pct": 82.3,
      "active_stack": "Daily Basics",
      "critical_interactions": 0,
      "unresolved_interactions": 1
    }
  }
}
```

---

## 11. Pending Actions

```json
{
  "ok": true,
  "data": {
    "pending": [
      {
        "type": "take_supplement",
        "priority": "normal",
        "label": "Magnesium 400mg (Abends) noch ausstehend",
        "stack_item_id": "uuid",
        "timing": "evening",
        "action_url": "/supplements/today"
      },
      {
        "type": "low_stock",
        "priority": "high",
        "label": "Omega-3: nur noch 5 Tage Vorrat",
        "inventory_id": "uuid",
        "action_url": "/supplements/inventory"
      }
    ]
  }
}
```
