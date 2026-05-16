# Recovery Module — Product Requirements Document

**Date:** 2026-02-23
**Status:** Sprint 1 — Self-Report MVP
**Module:** Recovery 😴
**Port:** 5400

---

## Overview

Recovery Module für Lumeos — täglicher Recovery Score basierend auf Self-Report, Training Load und Nutrition-Daten. Muscle Recovery Map mit realistischer SVG-Silhouette. Kein Wearable im MVP — alles Self-Report + berechnete Daten aus bestehenden Modulen.

---

## Sprint 1 Scope

### S1.1 — Morning Check-in
- **Schlaf-Log**: Stunden (Slider 0-12h, 0.5 Steps), Einschlafzeit, Aufwachzeit
- **Schlafqualität**: 1-10 Skala (Emoji-Slider: 😫→😴→😊→🤩)
- **Subjektives Empfinden**: 1-10 Skala ("Wie fühlst du dich?")
- **Muskelkater-Map**: Klickbare Body-Silhouette (react-body-highlighter), pro Muskelgruppe 0-3 Soreness (0=nichts, 1=leicht, 2=mittel, 3=stark)
- **Stimmung**: 5 Options (💪 Motiviert, 😊 Gut, 😐 Neutral, 😩 Müde, 🤒 Krank)
- **Quick-Entry**: Soll in <30 Sekunden machbar sein
- **Auto-Prompt**: Auf Home-Screen als erstes Element wenn heute noch kein Check-in

### S1.2 — Recovery Score (0-100)
Composite Score aus verfügbaren Daten:

| Input | Gewicht | Quelle |
|-------|---------|--------|
| Schlafqualität | 30% | Morning Check-in |
| Schlaf-Dauer vs. Ziel (8h) | 15% | Morning Check-in |
| Subjektives Empfinden | 15% | Morning Check-in |
| Muskelkater (Durchschnitt) | 10% | Morning Check-in |
| Training Load (gestern) | 15% | Training Module (wenn verfügbar, sonst neutral) |
| Nutrition Score (gestern) | 10% | Nutrition Module |
| Stimmung | 5% | Morning Check-in |

Score-Mapping:
- 🟢 80-100: Optimal — Push hard
- 🟡 60-79: Good — Normal training
- 🟠 40-59: Moderate — Reduce intensity
- 🔴 0-39: Low — Rest day recommended

### S1.3 — Muscle Recovery Map
- **SVG Body Silhouette** via `react-body-highlighter` (anterior + posterior view)
- **Farbcoding**: Grün (>80% recovered) → Gelb (50-80%) → Rot (<50%)
- **Recovery % pro Muskelgruppe** berechnet aus:
  - Stunden seit letztem Training dieser Gruppe
  - Volumen (Sets × Reps) des letzten Trainings
  - Schlafqualität letzte Nacht
  - Nutrition Score
  - Self-reported Soreness
- **Klickbar**: Tap auf Muskelgruppe → Detail (letztes Training, Recovery %, Empfehlung)
- **18 Muskelgruppen**: trapezius, upper-back, lower-back, chest, biceps, triceps, forearm, front-deltoids, back-deltoids, abs, obliques, adductor, hamstring, quadriceps, abductors, calves, gluteal, neck

### S1.4 — Recovery Modality Logging
Schnelles Logging von Recovery-Aktivitäten:

| Modality | Felder |
|----------|--------|
| 🧊 Cold Plunge | Dauer (min), Temperatur (°C) |
| 🔥 Sauna | Dauer (min), Temperatur (°C), Typ (Trocken/Nass/Infrarot) |
| 💆 Massage | Dauer (min), Typ (Deep Tissue/Sports/Thai/Foam Roll) |
| 🧘 Stretching | Dauer (min), Typ (Statisch/Dynamisch/Yoga) |
| 🫁 Breathwork | Dauer (min), Typ (Box/Wim Hof/4-7-8) |
| 🧠 Meditation | Dauer (min) |
| 😴 Nap | Dauer (min) |
| 🚶 Active Recovery | Dauer (min), Typ (Walk/Swim/Light Cardio) |

- Quick-Log: Tap modality → Dauer eingeben → Done
- Wird im Recovery Score als Bonus berücksichtigt (+2-5 Punkte je nach Modality)

### S1.5 — Overtraining Detection
Basierend auf verfügbaren Daten warnen wenn:
- Subjektives Empfinden ≤3 für 3+ Tage
- Recovery Score <50 für 3+ Tage
- Stimmung "Müde" oder "Krank" für 3+ Tage
- Schlafqualität ≤4 für 3+ Nächte

Alert-Levels:
- ⚠️ Warning (2-3 Signale): "Dein Körper braucht mehr Erholung"
- 🔴 Critical (4+ Signale): "Übertraining-Risiko! Deload-Woche empfohlen"

### S1.6 — Recovery Trends
- 7/14/30-Tage Recovery Score Verlauf (Line Chart)
- Schlaf-Trends (Durchschnittliche Dauer, Qualität)
- Muscle Recovery Heatmap (welche Gruppen chronisch untererholt?)
- Modality-Frequenz (wie oft Sauna, Cold Plunge etc.)

---

## Navigation Restructure

**Vorher (6 Tabs):** Home | Diary | Insights | Foods | Training | Supps
**Nachher (5 Tabs):** Home | Diary | Training | Supps | Recovery

- **Foods** → wird Header-Tab unter Diary ("Essen | Insights | Suche")
- **Insights** → wird Header-Tab unter Diary
- **Recovery** → neuer eigener Bottom Tab (💤)

---

## Database Schema (Migration 010)

```sql
-- Recovery check-ins (morning survey)
CREATE TABLE recovery_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC(3,1),
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_time TIME,
  wake_time TIME,
  subjective_feeling INT CHECK (subjective_feeling BETWEEN 1 AND 10),
  mood TEXT CHECK (mood IN ('motivated','good','neutral','tired','sick')),
  soreness JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Recovery modality logs
CREATE TABLE recovery_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  modality TEXT NOT NULL CHECK (modality IN ('cold_plunge','sauna','massage','stretching','breathwork','meditation','nap','active_recovery')),
  duration_min INT,
  temperature_c NUMERIC(4,1),
  subtype TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily recovery scores (computed + cached)
CREATE TABLE recovery_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  score INT CHECK (score BETWEEN 0 AND 100),
  sleep_component NUMERIC(5,2),
  feeling_component NUMERIC(5,2),
  soreness_component NUMERIC(5,2),
  training_component NUMERIC(5,2),
  nutrition_component NUMERIC(5,2),
  mood_component NUMERIC(5,2),
  modality_bonus NUMERIC(5,2) DEFAULT 0,
  muscle_recovery JSONB DEFAULT '{}',
  overtraining_signals INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_recovery_checkins_user_date ON recovery_checkins(user_id, date);
CREATE INDEX idx_recovery_modalities_user_date ON recovery_modalities(user_id, date);
CREATE INDEX idx_recovery_scores_user_date ON recovery_scores(user_id, date);

-- RLS
ALTER TABLE recovery_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY recovery_checkins_user ON recovery_checkins FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY recovery_modalities_user ON recovery_modalities FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001');
CREATE POLICY recovery_scores_user ON recovery_scores FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000001');
```

---

## API Endpoints (Port 5400)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/recovery/checkin?date= | Get check-in for date |
| POST | /api/recovery/checkin | Create/update check-in |
| GET | /api/recovery/score?date= | Get recovery score for date |
| GET | /api/recovery/scores?days=N | Get score history |
| GET | /api/recovery/muscle-map?date= | Get per-muscle recovery % |
| GET | /api/recovery/modalities?date= | Get modality logs for date |
| POST | /api/recovery/modalities | Log a modality |
| DELETE | /api/recovery/modalities/:id | Delete modality log |
| GET | /api/recovery/trends?days=N | Get trends data |
| GET | /api/recovery/overtraining | Get overtraining assessment |

---

## UI Components

| Component | Description |
|-----------|-------------|
| RecoveryView | Tab container with sub-tabs |
| MorningCheckin | Check-in form (sleep, feeling, soreness map, mood) |
| RecoveryScoreCard | Big score ring + breakdown |
| MuscleRecoveryMap | SVG body silhouette with color coding |
| MuscleDetailModal | Tap muscle → detail view |
| ModalityLogger | Quick-log recovery activities |
| ModalityHistory | List of logged modalities |
| RecoveryTrends | Score chart + sleep trends |
| OvertrainingAlert | Warning banner when signals detected |

---

## Cross-Module Connectors

- **← Training Module**: Last training per muscle group (date, volume, intensity)
- **← Nutrition Module**: Yesterday's nutrition score, protein intake
- **← Supplement Module**: Recovery-relevant supplements (Magnesium, ZMA, Glutamine)
- **→ Home**: Recovery Score on Home dashboard, Morning Check-in prompt
- **→ Training**: "Today's recommended training" based on muscle readiness

---

## i18n Keys needed

~60 new keys across DE/EN/TH for:
- Check-in form labels
- Mood options
- Modality names and subtypes
- Score descriptions
- Muscle group names
- Overtraining warnings
- Trend labels

---

## Phase 2 (Later)
- Apple HealthKit / Google Health Connect integration
- Phone Camera HRV measurement
- Sleep stage analysis
- Wearable-enhanced Recovery Score
- AI Coach integration ("Your recovery is low because...")
- Recovery Protocol templates (Deload Week, Active Recovery Week)

---

## Acceptance Criteria

- [ ] AC1: Morning Check-in completable in <30s (sleep hours, quality, feeling, mood, soreness map)
- [ ] AC2: Recovery Score 0-100 computed from check-in + cross-module data
- [ ] AC3: Muscle Recovery Map shows anterior + posterior body with color-coded muscles
- [ ] AC4: Clicking muscle shows detail (last trained, recovery %, recommendation)
- [ ] AC5: Recovery modalities can be logged (8 types with relevant fields)
- [ ] AC6: Overtraining detection shows warning when 3+ signals present
- [ ] AC7: Recovery trends show 7/14/30d score history
- [ ] AC8: Recovery has own bottom tab (💤), Foods+Insights moved under Diary as header tabs
- [ ] AC9: All UI text in DE/EN/TH
- [ ] AC10: All data persisted in Supabase (3 tables)
