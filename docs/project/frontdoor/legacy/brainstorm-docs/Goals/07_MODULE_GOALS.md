# LUMEOS — Modul: Goals
> Konsolidiert | 2026-04-14
> API Port: 5900 | Status: ✅ Vollständig implementiert

---

## 1. Zweck

Das Goals-Modul ist der **zentrale Aggregation Point** von Lumeos. Es ist kein weiteres Feature-Modul — es ist der Betriebssystem-Kern um den alle anderen Module rotieren.

> **Tom's Vision:** "Goals ist nicht ein weiteres Modul sondern der Aggregation Point. Alle Scores sind relativ zum Ziel, nicht absolut. Jeder Alert und jede Empfehlung muss beantworten: 'Bringt dich das näher an dein Ziel?'"

---

## 2. Architektur

```
Goals Module (5900) ← Zentraler Aggregation Point
         ↑
         ├── Nutrition API    → Tägliche Compliance
         ├── Training API     → Workout Adherence, Strength Progress
         ├── Recovery API     → Recovery Readiness
         ├── Supplements API  → Stack Compliance
         └── Medical API      → Health Marker Progress

Coach API (5500) → liest Goals für goal-zentrierte Empfehlungen
```

---

## 3. Features

### 3.1 Goal-Typen

**Body Composition**
- Gewichtsziel (Gewichtsverlust/Aufbau)
- Körperfettanteil
- Muskelmasse (Lean Mass Target)
- Körpermaße (Taille, Arme, Oberschenkel...)
- Visual Transformation (Foto-basiert)

**Performance**
- Kraft-Ziele (1RM für spezifische Übungen)
- Ausdauer-Ziele (Cardio-Performance)
- Skill Acquisition (neue Bewegungen/Sportarten)
- Mobility / Flexibilität

**Health**
- Biomarker-Optimierung (z.B. LDL senken, D3 erhöhen)
- Symptom-Auflösung
- Energie-Level
- Schlafqualität

**Lifestyle**
- Gewohnheitsbildung (Habit Formation)
- Konsistenz-Ziele (z.B. 5×/Woche Training)
- Work-Life-Balance
- Stress-Management

### 3.2 SMART Goal Framework
- **Specific:** Klare, eindeutige Zieldefinition mit messbaren Metriken
- **Measurable:** Quantifizierbare Targets mit exakten Messprotokollen
- **Achievable:** AI-validierte realistische Targets (User-Profil + History)
- **Relevant:** Ziele aligned mit tieferen Motivationen
- **Time-bound:** Optimale Deadlines mit adaptiver Timeline-Anpassung

### 3.3 Adaptive Goal Intelligence
- **Dynamic Target Adjustment:** Ziele passen sich automatisch dem Fortschritt an
- **Plateau Detection:** AI erkennt Stagnation und schlägt Modifikationen vor
- **Seasonal Adaptation:** Ziele adaptieren an saisonale Faktoren (Feiertage, Reisen)
- **Life Event Integration:** Major Life Events triggern Zielanpassungen
- **Evidence-Based Optimization:** Kontinuierliche Verbesserung basierend auf Erfolgsmustern

### 3.4 TDEE-basierte Ziele (Adaptive)
- Dynamische Kalorienziele basierend auf tatsächlichem Training-Volumen
- Macro Cycling: Carb Cycling, Refeed-Strategien
- Auto-Adjustments bei Plateau (±200 kcal Anpassung)
- Bulk/Cut/Maintain Phasen-Management
- Periodisierung (Offseason → Lean Bulk → Mini Cut → Prep)

### 3.5 Cross-Module Progress Tracking

```
Goal: "8kg Muskelaufbau in 6 Monaten"
↓
Progress Contributions:
  Nutrition:  Protein-Compliance 92% ✅  → +15 Progress Points
  Training:   Volume +12% MoM ✅        → +20 Progress Points
  Recovery:   Avg Score 78 ✅           → +10 Progress Points
  Supplements: Compliance 88% ✅        → +5 Progress Points
  Medical:    Testosterone 620 ng/dL ✅ → +5 Progress Points
─────────────────────────────────────────
Overall Goal Progress: 68% on track
Bottleneck: Schlaf (6.2h avg) limitiert Recovery → Training-Adaptation
```

### 3.6 Success Prediction (AI)
- Goal-Achievement-Probability basierend auf aktueller Trajectory
- "Wenn du so weitermachst, erreichst du dein Ziel in X Wochen"
- Scenario-Modeling: "Wenn du Schlaf auf 7.5h verbesserst → +3 Wochen früher"

### 3.7 Milestone Management
- Automatische Milestone-Erkennung (25%, 50%, 75%, 100%)
- Celebration-System (Coach + Buddy feiern Meilensteine)
- Sub-Goals für längere Ziele

### 3.8 Bottleneck Identification
- Welches Modul limitiert Goal-Progress am stärksten?
- "Dein Schlaf ist dein größter Hebel" (Recovery → Training-Adaptation)
- Prioritisierte Empfehlungen: immer was den größten Impact hat

---

## 4. Datenbank-Schema

### `user_goals`
```sql
id              UUID PK
user_id         UUID FK
title           VARCHAR NOT NULL
goal_type       VARCHAR            -- body_composition, performance, health, lifestyle
subtype         VARCHAR            -- weight_loss, muscle_gain, strength, ...
status          VARCHAR            -- active, completed, paused, abandoned
priority        INTEGER            -- 1 = Haupt-Ziel
target_value    NUMERIC
target_unit     VARCHAR
current_value   NUMERIC
start_value     NUMERIC
start_date      DATE
target_date     DATE
progress_pct    NUMERIC            -- 0-100, berechnet
achievement_probability NUMERIC    -- 0-100, AI-berechnet
notes           TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### `goal_milestones`
```sql
id              UUID PK
goal_id         UUID FK
milestone_pct   INTEGER            -- 25, 50, 75, 100
achieved_at     TIMESTAMPTZ
celebrated      BOOLEAN DEFAULT false
```

### `goal_contributions` (Cross-Module Progress)
```sql
id              UUID PK
goal_id         UUID FK
module          VARCHAR            -- nutrition, training, recovery, supplements, medical
contribution_score NUMERIC        -- 0-100
contribution_date DATE
details         JSONB              -- Was hat beigetragen
```

### `tdee_settings`
```sql
user_id         UUID PK (FK)
goal_type       VARCHAR            -- bulk, cut, maintain
target_calories INTEGER
protein_g       INTEGER
carbs_g         INTEGER
fat_g           INTEGER
macro_cycling   BOOLEAN DEFAULT false
cycling_config  JSONB
refeed_frequency VARCHAR
current_phase   VARCHAR            -- bulk, cut, maintain, prep
```

### `goal_adjustments`
```sql
id              UUID PK
goal_id         UUID FK
adjustment_type VARCHAR            -- plateau_response, life_event, seasonal
old_target      NUMERIC
new_target      NUMERIC
reason          TEXT
adjusted_at     TIMESTAMPTZ
adjusted_by     VARCHAR            -- ai_auto, user_manual
```

---

## 5. API-Endpunkte

| Route | Hauptendpunkte |
|---|---|
| `goals.ts` | CRUD Goals, `GET /goals/active`, `GET /goals/:id/progress` |
| `tdee.ts` | `GET/PUT /tdee`, `POST /tdee/recalculate` |
| `progress.ts` | `GET /progress/cross-module`, `GET /progress/contributions` |
| `predictions.ts` | `GET /predictions/:goal_id` (Achievement-Probability) |
| `milestones.ts` | `GET /milestones`, `POST /milestones/:id/celebrate` |

---

## 6. Goals als zentraler Orchestrator

```
Alle Modul-Empfehlungen werden durch die Goals-Lens gefiltert:

Coach sagt: "Erhöhe Protein auf 200g"
Goals prüft: User-Ziel = Muskelaufbau, aktuelle Protein-Compliance 88%
→ Empfehlung ist goal-aligned ✅

Coach sagt: "Reduziere Training-Volumen diese Woche"
Goals prüft: User hat Marathon-Ziel in 3 Monaten
→ Flag: könnte Ausdauer-Ziel beeinflussen ⚠️
→ Empfehlung mit Kontext ausgeben
```

---

## 7. Verbindungen zu allen Modulen

Goals ist **das einzige Modul das aktiv alle anderen integriert.**

| Modul | Was Goals bekommt | Was Goals gibt |
|---|---|---|
| Nutrition | Daily Score, Macro Compliance | TDEE-Ziele, Macro-Targets |
| Training | Volume Progress, Strength Gains | Training-Frequenz-Empfehlung |
| Recovery | Recovery Scores, Readiness | Rest-Day-Empfehlung |
| Supplements | Compliance Score | Goal-basierte Stack-Prioritäten |
| Medical | System Scores, Marker-Verläufe | Health Goal Targets |
| Coach (AI) | Goal-Status für Empfehlungen | Alle Goal-Daten |

---

## 8. Offene Punkte

| # | Typ | Beschreibung | Priorität |
|---|---|---|---|
| TODO | 🟡 | Success Prediction ML vollständig | 🟡 MITTEL |
| TODO | 🟡 | Scenario-Modeling UI ("Was wenn...") | 🟡 MITTEL |
| TODO | 🟡 | Goal-Templates für häufige Ziele | 🟡 MITTEL |
| TODO | 🟢 | Social Goals (geteilte Ziele mit Coach) | 🟢 NIEDRIG |

---

## 9. Body Composition Tracker

Sub-Feature im Goals-Modul. Navigation: Goals Tab → Sub-Tab "Body Composition".

Zwei komplementäre Tracking-Methoden:
1. **Klassisch (Manuell)** — Messungen, Körperfett%, Umfänge, Scores
2. **Visual AI (Kamera)** — Standardisierte Posen, AI-Analyse, automatisierte Reports

---

### 9.1 Klassische Messungen

**Körperkomposition:**
- Körperfett% — Methode wählbar: Caliper (3/7-Falten), DEXA, BIA-Waage, Visuell, Hydrostatisch
- Muskelmasse (kg) — Berechnet: Gewicht × (1 - Körperfett%/100)
- Gewicht (kg) — Verknüpft mit bestehendem Weight Tracking
- BMI — Automatisch (informativ, nicht Fokus)
- FFMI (Fat-Free Mass Index) — Berechnet: Muskelmasse / Größe² + 6.1 × (1.8 - Größe)
  - Natürlicher Bereich: 18-25, Elite: 25+

**Umfänge (alle in cm, L/R wo sinnvoll):**
Hals, Schultern (breitester Punkt), Brust (Nippelhöhe),
Oberarm L/R (gebeugt), Unterarm L/R (breitester),
Taille (Nabel), Hüfte (breitester), Oberschenkel L/R (15cm über Knie), Wade L/R

**Automatisch berechnete Verhältnisse:**
- Schulter-Taille-Ratio (Ziel: >1.618 = Goldener Schnitt)
- Arm-Symmetrie % (L/R Differenz)
- Bein-Symmetrie %
- V-Taper Score (Schulter / Taille)
- Proportions-Score (Steve Reeves Formel)

---

### 9.2 Visual AI (Kamera-basiert)

**A) 8 IFBB Mandatory Poses (Wettkampf-Standard)**

| # | Pose | Zeigt |
|---|---|---|
| 1 | Front Double Biceps | Bizeps, Lats, Quads, Abs, Schultern |
| 2 | Front Lat Spread | Lat-Breite, V-Taper, Brust, Quads |
| 3 | Side Chest (L/R) | Brusttiefe, Schulter, Arm, Quad/Ham |
| 4 | Rear Double Biceps | Bizeps, Lats, Traps, Erector, Glutes, Hams, Waden |
| 5 | Rear Lat Spread | Rückenbreite, -dichte, Taper |
| 6 | Side Triceps (L/R) | Trizeps, Obliques, Hams |
| 7 | Abdominal & Thigh | Abs, Quad-Definition, Serratus |
| 8 | Most Muscular | Gesamtmuskulatur, Conditioning |

**B) 4 Quarter Turns (Standard Progress-Check-ins)**

| # | Pose |
|---|---|
| 1 | Front Relaxed |
| 2 | Right Side |
| 3 | Back Relaxed |
| 4 | Left Side |

**C) Detail-Aufnahmen (9 Muscle Close-Ups)**
Delts, Bizeps, Trizeps, Brust, Abs, Rücken, Quads, Hamstrings, Waden

---

### 9.3 API Endpoints Goals Module (Port 5900)

```
GET    /api/goals/measurements?date=       → Measurement für Datum
GET    /api/goals/measurements/history?days= → Verlauf
GET    /api/goals/measurements/latest      → Aktuellste + Deltas
POST   /api/goals/measurements             → Neue Messung (computed: muscle_mass, bmi, ffmi)
PUT    /api/goals/measurements/:id         → Update
DELETE /api/goals/measurements/:id         → Delete

GET    /api/goals/circumferences?date=     → Umfänge für Datum
GET    /api/goals/circumferences/history?days= → Verlauf
GET    /api/goals/circumferences/ratios    → Berechnete Verhältnisse (Goldener Schnitt, V-Taper)
POST   /api/goals/circumferences           → Neue Messung
```
