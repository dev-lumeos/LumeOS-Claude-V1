# Medical Module — Product Requirements Document

**Date:** 2026-02-24
**Status:** PRD Complete → Build Started
**Module:** Medical 🩺
**Research:** `research/medical/` (11 competitor profiles, 100+ biomarkers catalogued)

---

## Vision

> **"Die erste App die Blutwerte mit Ernährung, Training, Supplements und Recovery verbindet — nicht nur tracken, sondern verstehen."**

---

## Scope — MVP (Sprint 1)

### Was wir bauen:
1. **Bloodwork Hub** — Manuelle Eingabe + Verwaltung von Laborwerten
2. **100+ Biomarker** in 9 Kategorien mit optimalen Referenzwerten
3. **Biomarker Dashboard** — Aktuelle Werte, Ampel (optimal/normal/auffällig)
4. **Trend Charts** — Verlauf pro Biomarker über Zeit
5. **Medication Tracker** — Rx + OTC Medikamente mit Reminders
6. **Symptom Logger** — Tägliches Symptom-Tracking
7. **Cross-Module Insights** — Verbindungen zu Nutrition/Supplements/Recovery
8. **Doctor Export** — Druckbarer Report

### Was NICHT in MVP:
- PDF OCR Upload (Sprint 2)
- FHIR/HL7 Integration (Sprint 3)
- E2E Encryption (Sprint 3)
- Lab Test Partnerships (Sprint 4)
- Correlation Engine (Sprint 2)

---

## Database Schema

### Migration 015: medical

```sql
-- Biomarker definitions (seeded, not user-created)
CREATE TABLE IF NOT EXISTS biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loinc_code TEXT,
  name TEXT NOT NULL,
  name_de TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  lab_range_min DECIMAL(10,4),
  lab_range_max DECIMAL(10,4),
  optimal_range_min DECIMAL(10,4),
  optimal_range_max DECIMAL(10,4),
  description TEXT,
  description_de TEXT,
  relevance TEXT[],
  sort_order INTEGER DEFAULT 0
);

-- User lab results
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  lab_date DATE NOT NULL,
  lab_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual biomarker values per lab result
CREATE TABLE IF NOT EXISTS lab_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID NOT NULL REFERENCES lab_results(id) ON DELETE CASCADE,
  biomarker_id UUID NOT NULL REFERENCES biomarkers(id),
  value DECIMAL(12,4) NOT NULL,
  unit TEXT,
  flag TEXT, -- optimal, normal, low, high, critical
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  category TEXT DEFAULT 'rx', -- rx, otc, supplement
  purpose TEXT,
  prescriber TEXT,
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  reminders JSONB DEFAULT '[]',
  side_effects TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication logs
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id),
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'taken', -- taken, skipped, late
  notes TEXT
);

-- Symptom definitions
CREATE TABLE IF NOT EXISTS symptom_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_de TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Daily symptom entries
CREATE TABLE IF NOT EXISTS symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  symptom_type_id UUID NOT NULL REFERENCES symptom_types(id),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  severity INTEGER NOT NULL CHECK (severity >= 0 AND severity <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_results_user ON lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_date ON lab_results(lab_date DESC);
CREATE INDEX IF NOT EXISTS idx_lab_values_result ON lab_values(lab_result_id);
CREATE INDEX IF NOT EXISTS idx_lab_values_biomarker ON lab_values(biomarker_id);
CREATE INDEX IF NOT EXISTS idx_medications_user ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_med ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user ON symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_date ON symptom_logs(log_date);
```

---

## API Endpoints (Port 5800)

### Biomarkers (Reference)
- `GET /api/medical/biomarkers` — All biomarkers (with category filter)
- `GET /api/medical/biomarkers/:id` — Single biomarker with optimal ranges

### Lab Results
- `GET /api/medical/labs` — User's lab results (newest first)
- `POST /api/medical/labs` — Create lab result entry
- `GET /api/medical/labs/:id` — Lab result with all values
- `PUT /api/medical/labs/:id` — Update lab result
- `DELETE /api/medical/labs/:id` — Delete lab result
- `POST /api/medical/labs/:id/values` — Add biomarker values to a lab result
- `GET /api/medical/labs/latest` — Latest value per biomarker

### Biomarker Trends
- `GET /api/medical/trends/:biomarkerId` — Historical values for a biomarker
- `GET /api/medical/dashboard` — Dashboard summary (categories with latest values + flags)

### Medications
- `GET /api/medical/medications` — User's medications (active first)
- `POST /api/medical/medications` — Add medication
- `PUT /api/medical/medications/:id` — Update medication
- `DELETE /api/medical/medications/:id` — Delete medication
- `POST /api/medical/medications/:id/log` — Log medication taken/skipped
- `GET /api/medical/medications/:id/logs` — Medication log history

### Symptoms
- `GET /api/medical/symptoms/types` — All symptom types
- `GET /api/medical/symptoms` — User's symptom logs (by date range)
- `POST /api/medical/symptoms` — Log symptom
- `GET /api/medical/symptoms/summary` — Symptom summary (last 30 days)

### Reports
- `GET /api/medical/report` — Generate doctor-friendly summary report

### Cross-Module
- `GET /api/medical/insights` — Cross-module medical insights

---

## Acceptance Criteria

- AC1: User can create a lab result with date + lab name
- AC2: User can add biomarker values to a lab result (with auto-flagging)
- AC3: Biomarker values show optimal/normal/low/high/critical flag
- AC4: Dashboard shows 9 categories with latest values + traffic light
- AC5: Trend chart shows historical values per biomarker with reference bands
- AC6: User can add/edit/delete medications
- AC7: User can log medication taken/skipped
- AC8: User can log daily symptoms with severity 0-10
- AC9: Cross-module insights connect biomarkers to nutrition/supplements
- AC10: Doctor export generates readable summary
- AC11: 100+ biomarkers seeded with optimal ranges
- AC12: All UI in German with i18n keys (DE/EN/TH)
