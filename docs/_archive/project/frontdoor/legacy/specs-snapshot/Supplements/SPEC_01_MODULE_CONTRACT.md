# Supplements Module — Module Contract
> Spec Phase 1 | Final

---

## 1. Zweck

Das Supplements-Modul verwaltet alle Supplement-bezogenen Daten in LumeOS.

**Kernaufgaben:**
- Supplement-Datenbank (kuratiert, evidence-graded)
- Stack Management (mehrere Stacks, 1 aktiv)
- Daily Intake Logging + Compliance
- Interaction Checker (regelbasiert, deterministisch)
- Inventory Management
- Intelligence Engine (Gap Analysis, Redundancy, Training-Aware Timing)
- Enhanced Mode (PEDs) — strikt separiert, Opt-In

---

## 2. Prinzipien

| Prinzip | Bedeutung |
|---|---|
| **Rule-First** | Interaction-Checks sind deterministisch, kein AI-Feeling |
| **Hard-Separated Modes** | Standard und Enhanced haben getrennte Tabellen, getrennte UX |
| **Schema-Isolation** | Alle Tabellen im Schema `supplements` |
| **3-sprachig** | name_de, name_en, name_th — TH initial NULL |
| **Single Active Stack** | Nur 1 Stack gleichzeitig aktiv → vereinfacht Daily Tracking |
| **Evidence-First** | Jedes Supplement hat ein explizites Evidence-Grade (S/A/B/C/D/F) |
| **Nutrition Integration** | Gap Analysis basiert auf echten BLS-Mikronährstoff-Daten |

---

## 3. Inputs

### 3.1 Von Nutrition — Tages-Mikronährstoffe (für Gap Analysis)
```
GET http://nutrition:5100/api/nutrition/summary?date=today
```
Felder: VITD, FE, ZN, CA, MG, K, FOL, VITB12, VITC, ... (alle Tier-1 Mikros)

Basis für: "Dir fehlen X mg Magnesium → Supplement empfohlen"

### 3.2 Von Training — Heutiger Workout-Typ (für Training-Aware Stack)
```
GET http://training:5200/api/training/sessions/live
OR
GET http://training:5200/api/training/schedule?date=today
```
Felder: `session_type` (push/pull/legs/cardio/rest), `completed_at`

Basis für: "Leg Day → Creatine + Beta-Alanine Pre, Magnesium Post"

### 3.3 Von Medical — Biomarker (für Effectiveness Tracking)
```
GET http://medical:5800/api/medical/biomarkers?user_id=:uid
```
Felder: Vitamin D (25-OH-D), Magnesium, Zink, Ferritin, etc.

Basis für: "Vitamin D 18 → 52 ng/mL nach 3 Monaten Supplementation ✅"

### 3.4 Von Goals — Aktuelle Phase + Ziele
```
GET http://goals:5900/api/goals/targets/today?user_id=:uid
```
Felder: `goal_phase`, `primary_goal`

Basis für: Stack-Empfehlungen passend zur Goal-Phase.

---

## 4. Outputs

### 4.1 → Goals: Supplement Compliance Score
```
POST http://goals:5900/api/goals/contributions
```
```json
{
  "module": "supplements",
  "date": "2026-04-15",
  "compliance_score": 87,
  "details": {
    "items_taken": 7,
    "items_scheduled": 8,
    "compliance_pct": 87.5,
    "active_stack": "Daily Basics",
    "critical_interactions": 0
  }
}
```

### 4.2 → Nutrition: Supplement-Nährstoffbeitrag
```
POST http://nutrition:5100/api/nutrition/supplement-nutrients
```
```json
{
  "date": "2026-04-15",
  "nutrients_from_supplements": {
    "VITD": 3000,
    "MG": 400,
    "ZN": 15,
    "FAPUN3": 2000
  }
}
```

### 4.3 → Buddy: Echtzeit-Kontext
```
GET /api/supplements/for-ai
```
```json
{
  "stack_status": "7/8 Supplements heute genommen",
  "pending": ["Magnesium (abends)"],
  "gap_alerts": ["Vitamin D: nur 600 IU aus Food (Ziel: 3000 IU)"],
  "training_stack": {
    "today": "Leg Day",
    "pre_workout": ["Creatine 5g", "Caffeine 200mg"],
    "post_workout": ["Magnesium 400mg"]
  },
  "interactions": [],
  "compliance_pct": 87.5
}
```

### 4.4 → Medical: Supplement-Log für Korrelationen
```
POST http://medical:5800/api/medical/supplement-log
```

---

## 5. Modul-Grenzen

### Supplements BESITZT:
- Supplement-Datenbank (kuratiert, evidence-graded)
- Enhanced Substances Datenbank
- User Stacks + Stack Items
- Intake Logs
- Supplement Interactions Database
- Inventory Tracking
- Intelligence Engine (Gap Analysis, Redundancy, Timing Optimizer, Cost)
- Compliance Score Berechnung

### Supplements BESITZT NICHT:
| Was | Wer |
|---|---|
| Blutwerte interpretieren | Medical Modul |
| Medikamenten-Planung | Medical Modul |
| Training planen | Training Modul |
| Payments / Kaufabwicklung | Marketplace Modul |
| TDEE-Berechnung | Goals Modul |

### Schreib-Rechte anderer Module:
| Modul | Was |
|---|---|
| Human Coach | Stack Templates mit `source: 'coach'` zuweisen |
| Marketplace | Supplement-Produkte nach Kauf verknüpfen |

---

## 6. Enhanced Mode — Sicherheitsarchitektur

```
Default: Enhanced Mode = OFF
User aktiviert: Explizite Einwilligung + Age Verification
Datentrennung: enhanced_substances Tabelle getrennt
UX-Trennung: Separate Sektion, nie in Standard-Flows
Interaction-Checks: Extended auf Enhanced+Standard Kombinationen
Logging: Enhanced Intake Logs getrennt gespeichert
Privacy: Enhanced-Daten nie im Standard-Export
```

**Enhanced Mode ist First-Class** — vollständig implementiert,
aber immer explizit vom User aktiviert.

---

## 7. API-Übersicht

```
http://supplements:5300
  /api/supplements/catalog         Supplement-DB durchsuchen
  /api/supplements/catalog/:id     Detail eines Supplements
  /api/supplements/enhanced        Enhanced Substances
  /api/supplements/stacks          CRUD Stacks
  /api/supplements/stacks/:id/activate  Stack aktivieren
  /api/supplements/items           Items in aktivem Stack
  /api/supplements/intake          Daily Logging
  /api/supplements/intake/today    Heutige Einnahme-Liste
  /api/supplements/interactions    Interaction Checker
  /api/supplements/inventory       Bestand-Tracking
  /api/supplements/intelligence    Gap Analysis, Redundancy, Timing
  /api/supplements/analytics       Compliance, Kosten, History
  /api/supplements/for-ai          Buddy Context
  /api/supplements/for-goals       Compliance Export
  /api/supplements/pending-actions Offene User-Actions
```

---

## 8. Sprachen

**3-sprachig:** DE / EN / TH auf `name_de`, `name_en`, `name_th`.
TH initial NULL — kein Pflichtfeld.
Evidence-Texte: EN primär, DE wichtig, TH später.
