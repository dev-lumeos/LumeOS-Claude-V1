# Recovery Module — Import & Seed Pipeline
> Spec Phase 8 | System-Daten Seed

---

## Übersicht

Recovery hat deutlich weniger Import-Bedarf als Nutrition/Training.
Seed-Daten beschränken sich auf:
1. Recovery Protokoll-Vorlagen
2. Muscle Group Recovery-Parameter

---

## Phase 1: Recovery Protocols Seed

```sql
INSERT INTO recovery.recovery_protocols
  (name, name_de, description, protocol_type, target_condition,
   duration_days, modalities_recommended, training_modifications,
   nutrition_guidelines, evidence_level)
VALUES
  (
    'Active Recovery Week', 'Aktive Erholungswoche',
    'Leichte Aktivitäten für allgemeine Erholung ohne Vollpause',
    'active', 'general', 7,
    ARRAY['stretching','yoga','active_recovery','foam_rolling'],
    ARRAY['Kein Training über 60% 1RM', 'Satzanzahl halbieren', 'Keine maximalen Intensitäten'],
    ARRAY['Protein mindestens 2g/kg', 'Kalorienüberschuss +100–200 kcal', 'Omega-3 erhöhen'],
    'A'
  ),
  (
    'Passive Deload', 'Passive Entlastungswoche',
    'Strukturierte Deload-Woche: Volumen und Intensität stark reduzieren',
    'passive', 'overreaching', 7,
    ARRAY['massage','sauna','stretching'],
    ARRAY['Volumen −50%', 'Intensität −20%', 'Keine Compounds nahe Max', 'Fokus auf Technik'],
    ARRAY['Protein 2g/kg', 'Ausreichend Kalorien (kein Deficit)', 'Anti-inflammatorisch essen'],
    'A'
  ),
  (
    'Sleep Optimization Protocol', 'Schlafoptimierungs-Protokoll',
    '14-tägiges Protokoll zur Verbesserung der Schlafqualität',
    'preventive', 'general', 14,
    ARRAY['meditation','breathwork'],
    ARRAY['Kein intensives Training nach 18 Uhr', 'Abend-Session max. 60% Intensität'],
    ARRAY['Kein Koffein nach 14 Uhr', 'Magnesium 400mg abends', 'Tryptophan-reiche Abendmahlzeit'],
    'B'
  ),
  (
    'Injury Recovery - Light', 'Verletzungsprotokoll (Leicht)',
    'Protokoll für leichte Verletzungen — betroffene Bereiche schonen',
    'therapeutic', 'injury', 10,
    ARRAY['active_recovery','stretching','cold_plunge','massage'],
    ARRAY['Betroffene Muskelgruppen pausieren', 'Andere Bereiche normal trainieren', 'ROM-Arbeit täglich'],
    ARRAY['Entzündungshemmende Kost', 'Collagen 10–15g', 'Vitamin C', 'Ausreichend Protein'],
    'B'
  ),
  (
    'Overtraining Recovery', 'Übertraining-Erholung',
    'Intensives 5-tägiges Protokoll nach diagnostiziertem Übertraining',
    'therapeutic', 'overtraining', 5,
    ARRAY['massage','sauna','cold_plunge','meditation','breathwork'],
    ARRAY['Komplette Trainingspause 3–5 Tage', 'Dann: nur Active Recovery', 'Kein HIIT/Maximaltraining'],
    ARRAY['Kalorienüberschuss +300–500 kcal', 'Protein 2.5g/kg', 'Schlaf priorisieren (9h Ziel)', 'Stress minimieren'],
    'A'
  );
```

---

## Phase 2: Muscle Recovery Parameters

```sql
-- Statische Tabelle mit typischen Recovery-Zeiten pro Muskelgruppe
-- (wird für baseRecoveryCurve herangezogen — Override der Defaults)

CREATE TABLE IF NOT EXISTS recovery.muscle_recovery_params (
  muscle_name       TEXT PRIMARY KEY,
  base_recovery_h   INTEGER,   -- Typische Recovery in Stunden
  max_recovery_h    INTEGER,   -- Maximum (sehr hohes Volumen)
  body_region       TEXT,
  notes             TEXT
);

INSERT INTO recovery.muscle_recovery_params VALUES
  ('Quadriceps',      72, 120, 'legs',      'Große Muskelgruppe, hohe Belastung'),
  ('Hamstrings',      72, 120, 'legs',      'Hohe exzentrische Belastung'),
  ('Gluteus Maximus', 72, 120, 'legs',      'Große Muskeln'),
  ('Gluteus Medius',  48,  96, 'legs',      NULL),
  ('Calves',          48,  72, 'legs',      'Hohe Stresstoleranz'),
  ('Pectoralis Major',48,  96, 'chest',     NULL),
  ('Upper Chest',     48,  96, 'chest',     NULL),
  ('Latissimus Dorsi',48,  96, 'back',      NULL),
  ('Rhomboids',       48,  96, 'back',      NULL),
  ('Lower Back',      72, 120, 'back',      'Erector spinae — langsam'),
  ('Anterior Deltoid',48,  72, 'shoulders', 'Synergistisch bei vielen Übungen'),
  ('Lateral Deltoid', 48,  72, 'shoulders', NULL),
  ('Posterior Deltoid',48, 72, 'shoulders', NULL),
  ('Trapezius',       48,  96, 'back',      NULL),
  ('Biceps Brachii',  36,  72, 'arms',      'Kleiner Muskel, schneller'),
  ('Triceps Brachii', 36,  72, 'arms',      NULL),
  ('Brachialis',      36,  72, 'arms',      NULL),
  ('Forearms',        24,  48, 'arms',      'Hohe Toleranz'),
  ('Rectus Abdominis',24,  48, 'core',      'Schnelle Erholung'),
  ('Obliques',        24,  48, 'core',      NULL),
  ('Hip Flexors',     36,  72, 'core',      NULL);
```

---

## Phase 3: Wearable Source Configuration

```sql
-- Referenz-Tabelle für Wearable-Datenquellen und ihre Eigenschaften
CREATE TABLE IF NOT EXISTS recovery.wearable_source_config (
  source_id         TEXT PRIMARY KEY,
  display_name      TEXT,
  supports_hrv      BOOLEAN DEFAULT false,
  supports_sleep_stages BOOLEAN DEFAULT false,
  supports_rhr      BOOLEAN DEFAULT false,
  integration_tier  INTEGER,   -- 1=HealthKit/HealthConnect, 2=Direct API
  setup_url         TEXT
);

INSERT INTO recovery.wearable_source_config VALUES
  ('apple_health',    'Apple Health',       true, true,  true,  1, NULL),
  ('google_health',   'Google Health',      true, true,  true,  1, NULL),
  ('oura',            'Oura Ring',          true, true,  true,  1, 'https://ouraring.com/api'),
  ('whoop',           'WHOOP',              true, true,  true,  2, 'https://developer.whoop.com'),
  ('garmin',          'Garmin Connect',     true, false, true,  2, 'https://developer.garmin.com'),
  ('hrv4training',    'HRV4Training',       true, false, false, 2, 'https://hrv4training.com'),
  ('elite_hrv',       'Elite HRV',          true, false, false, 2, NULL),
  ('phone_camera',    'Phone Camera (PPG)', true, false, false, 3, NULL),
  ('manual',          'Manuelle Eingabe',   true, false, true,  3, NULL);
```

---

## Phase 4: Verifikation

```sql
-- Tabellen-Übersicht
SELECT 'recovery_protocols' AS t, COUNT(*) FROM recovery.recovery_protocols
UNION ALL
SELECT 'muscle_recovery_params', COUNT(*) FROM recovery.muscle_recovery_params
UNION ALL
SELECT 'wearable_source_config', COUNT(*) FROM recovery.wearable_source_config;

-- Protokoll-Details
SELECT name, target_condition, duration_days, evidence_level
FROM recovery.recovery_protocols
ORDER BY evidence_level, duration_days;

-- Trigger testen
INSERT INTO recovery.recovery_checkins (user_id, date, sleep_hours, sleep_quality, subjective_feeling, mood)
VALUES (gen_random_uuid(), CURRENT_DATE, 7.5, 8, 7, 'good');

SELECT recovery_score, readiness_level FROM recovery.recovery_scores
WHERE date = CURRENT_DATE
ORDER BY calculated_at DESC LIMIT 1;
-- Erwartetes Ergebnis: score ~72-78, readiness 'good'
```

---

## Dateistruktur

```
src/import/recovery/
  01_seed_protocols.sql          Phase 1: Recovery Protokoll-Vorlagen
  02_seed_muscle_params.sql      Phase 2: Muskelgruppen Recovery-Parameter
  03_seed_wearable_config.sql    Phase 3: Wearable Source Konfiguration
  04_verify.sql                  Phase 4: Verifikation
  run_all.sh
```
