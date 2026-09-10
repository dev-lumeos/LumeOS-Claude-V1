# Recovery Module — Core Entities
> Spec Phase 2 | Datenmodell

---

## Entity-Übersicht

```
USER DATA (täglich)                  STAMMDATEN
──────────────────────────────       ─────────────────────
RecoveryCheckin (1/Tag, UPSERT)      RecoveryProtocol
  └── (enthält soreness JSONB)         └── UserProtocolAssignment
RecoveryScore   (1/Tag, computed)
MuscleSoreness  (via Checkin JSONB)  HRVBaseline (computed, rolling 30d)
HRVMeasurement
SleepData
RecoveryModality
OvertrainingAlert
TrainingLoadLog (incoming from Training)

VIEWs:
  weekly_recovery_stats
  muscle_readiness
  modality_effectiveness
```

---

## Allgemeine Regeln

**Schema:** Alle Tabellen im Schema `recovery`.
**1 Checkin/Tag:** UNIQUE (user_id, date) auf recovery_checkins.
**Score ist computed:** recovery_scores wird nach Checkin berechnet und gecacht.
**Muscle Map:** Soreness als JSONB in Checkin + Training Load aus Training-Modul.

---

## 1. RecoveryCheckin

Täglicher Morning Check-in. UPSERT (kann überschrieben werden).

```
id                  UUID PK
user_id             UUID NOT NULL
date                DATE NOT NULL
checkin_time        TIMESTAMPTZ DEFAULT now()
UNIQUE (user_id, date)

-- Schlaf
sleep_hours         NUMERIC(3,1)           0.0–12.0 in 0.5er Schritten
sleep_quality       SMALLINT               1–10
sleep_start_time    TIME                   Einschlafzeit
sleep_end_time      TIME                   Aufwachzeit

-- Subjektive Bewertungen
subjective_feeling  SMALLINT               1–10 Gesamtgefühl
mood                TEXT DEFAULT 'neutral'
  motivated | good | neutral | tired | sick
energy_level        SMALLINT               1–10
motivation          SMALLINT               1–10

-- Muskelkater JSONB
-- Format: {"chest": 1, "legs": 2, "lower_back": 3}
-- Keys = muscle_group slugs, Values = 0–3 (0=kein, 3=stark)
soreness            JSONB DEFAULT '{}'

-- Schmerz-Bereiche (spezifisch)
pain_areas          TEXT[]

-- Stress
stress_level        SMALLINT               1–10 gesamt
work_stress         SMALLINT               1–10 Arbeit
life_stress         SMALLINT               1–10 Persönlich

-- Lifestyle-Faktoren (optional)
alcohol_units       NUMERIC(3,1)           Standard-Einheiten
caffeine_mg         INTEGER
screen_time_hours   NUMERIC(3,1)           Vor Schlaf

-- Wearable-Daten (importiert, wenn verfügbar)
resting_hr          INTEGER
hrv_rmssd           NUMERIC(6,2)
spo2_pct            NUMERIC(4,1)
respiratory_rate    NUMERIC(4,1)

notes               TEXT
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

---

## 2. RecoveryScore

Berechneter Daily Recovery Score. Nach jedem Checkin (re)berechnet.

```
id                        UUID PK
user_id                   UUID NOT NULL
date                      DATE NOT NULL
UNIQUE (user_id, date)

-- Gesamt-Score
recovery_score            NUMERIC(5,2) NOT NULL    0–100

-- Komponenten-Scores (0–100 je)
sleep_quality_score       NUMERIC(5,2)
sleep_duration_score      NUMERIC(5,2)
subjective_feeling_score  NUMERIC(5,2)
soreness_score            NUMERIC(5,2)
hrv_score                 NUMERIC(5,2)
stress_score              NUMERIC(5,2)
training_load_score       NUMERIC(5,2)
nutrition_score           NUMERIC(5,2)
mood_score                NUMERIC(5,2)
modality_bonus            NUMERIC(4,2)    0–5 Bonus

-- Training Readiness
readiness_level           TEXT
  excellent | good | moderate | poor | rest
intensity_recommendation  TEXT
  high | moderate | light | rest | deload

-- Berechnung-Metadata
algorithm_version         TEXT DEFAULT 'v1.0'
calculated_at             TIMESTAMPTZ

-- Beitragende Daten (snapshot für Debugging)
training_load_used        NUMERIC(8,2)    kg×sets (von Training-Modul)
nutrition_compliance_used NUMERIC(5,2)    % (von Nutrition-Modul)
hrv_baseline_used         NUMERIC(6,2)    30-Tage Rolling Average
```

---

## 3. HRVMeasurement

HRV-Messungen aus Wearables oder Phone Camera.

```
id                   UUID PK
user_id              UUID NOT NULL
measured_at          TIMESTAMPTZ NOT NULL
measurement_date     DATE NOT NULL

-- HRV Metriken
rmssd                NUMERIC(6,2)           ms
pnn50                NUMERIC(5,2)           %
heart_rate           NUMERIC(5,1)           bpm
hrv_score            NUMERIC(5,2)           Normalisierter Score 0–100

-- Quelle
device_source        TEXT
  hrv4training | oura | whoop | garmin | elite_hrv | apple_health |
  google_health | phone_camera | manual
measurement_position TEXT DEFAULT 'lying'   standing | sitting | lying
measurement_duration INTEGER                Sekunden (60 standard)

-- Qualität
measurement_quality  TEXT                   excellent | good | fair | poor
artifacts_detected   INTEGER DEFAULT 0
```

---

## 4. HRVBaseline

Berechnete persönliche HRV-Baseline (30-Tage Rolling Average).
Wird täglich nach neuer Messung aktualisiert.

```
user_id              UUID PK
avg_rmssd            NUMERIC(6,2)    30-Tage Durchschnitt
stddev_rmssd         NUMERIC(6,2)    Standardabweichung
min_rmssd            NUMERIC(6,2)
max_rmssd            NUMERIC(6,2)
data_points          INTEGER         Anzahl Messungen in Berechnung
calculated_at        TIMESTAMPTZ
```

---

## 5. SleepData

Detaillierte Schlafdaten — manuell oder aus Wearable importiert.

```
id                      UUID PK
user_id                 UUID NOT NULL
sleep_date              DATE NOT NULL
UNIQUE (user_id, sleep_date)

bedtime                 TIMESTAMPTZ
sleep_start             TIMESTAMPTZ    Tatsächlicher Einschlaf
wake_time               TIMESTAMPTZ
time_in_bed_minutes     INTEGER
total_sleep_minutes     INTEGER

-- Schlafphasen (Minuten)
deep_sleep_minutes      INTEGER
rem_sleep_minutes       INTEGER
light_sleep_minutes     INTEGER
awake_minutes           INTEGER

-- Qualitäts-Metriken
sleep_efficiency        NUMERIC(5,2)   total_sleep / time_in_bed × 100
sleep_latency_minutes   INTEGER        Zeit zum Einschlafen
wake_frequency          INTEGER        Anzahl Aufwachmomente

-- Subjektiv
sleep_quality_rating    SMALLINT       1–10
grogginess_rating       SMALLINT       1–10 Morgen-Benommenheit

-- Quelle
data_source             TEXT
  oura | whoop | apple_health | google_health | garmin | eight_sleep | manual
device_confidence       NUMERIC(3,2)   0.0–1.0

created_at              TIMESTAMPTZ
```

---

## 6. RecoveryModality

Geloggte Recovery-Aktivitäten.

```
id                  UUID PK
user_id             UUID NOT NULL
date                DATE NOT NULL
modality_type       TEXT NOT NULL
  sauna | cold_plunge | contrast_therapy | massage | foam_rolling |
  stretching | yoga | meditation | breathwork | nap | active_recovery | other

-- Details (typabhängig)
duration_minutes    INTEGER
temperature_c       NUMERIC(4,1)    Sauna/Cold Plunge
intensity           TEXT            light | moderate | deep | therapeutic
pressure_level      TEXT            Massage
location            TEXT            home | gym | spa | clinic
provider            TEXT            Behandler / Einrichtung
cost_eur            NUMERIC(8,2)

-- Effectiveness
immediate_effect    SMALLINT        1–10 Sofort-Gefühl
next_day_effect     SMALLINT        1–10 Nächster Tag (nachträglich bewertbar)
next_day_score_delta NUMERIC(5,2)   Berechnete Score-Veränderung

notes               TEXT
logged_at           TIMESTAMPTZ
```

---

## 7. TrainingLoadLog

Eingehende Training-Load-Daten vom Training-Modul.
Wird beim Session-Abschluss geschrieben.

```
id                  UUID PK
user_id             UUID NOT NULL
date                DATE NOT NULL
session_id          UUID              Referenz auf training.workout_sessions

volume_kg           NUMERIC(10,2)    Gesamt-Volumen (weight × reps)
intensity_avg_rpe   NUMERIC(3,1)     Durchschnittliche RPE
session_duration_min INTEGER

-- Muskel-spezifisch (für Recovery Map)
-- Format: {"Pectoralis Major": {"sets": 12, "volume_kg": 1800}, ...}
muscles_worked      JSONB DEFAULT '{}'

-- Aggregiert für Score-Berechnung
acute_load          NUMERIC(8,2)     Last-7-Tage-Summe
chronic_load        NUMERIC(8,2)     Last-28-Tage-Durchschnitt
acwr                NUMERIC(5,3)     Acute/Chronic Workload Ratio

created_at          TIMESTAMPTZ
```

---

## 8. OvertrainingAlert

Automatisch generierte Übertraining-Warnungen.

```
id                  UUID PK
user_id             UUID NOT NULL
alert_date          DATE NOT NULL
alert_type          TEXT
  declining_recovery | high_fatigue | poor_sleep | hrv_decline |
  elevated_soreness | performance_decline | overtraining_suspected
severity            TEXT NOT NULL     low | moderate | high | critical

-- Auslöser
signals_count       INTEGER           Wie viele Signale
signals             JSONB             [{signal, value, threshold}]
days_exceeded       INTEGER

-- Empfehlungen
recommended_action  TEXT
rest_days_suggested INTEGER
training_modifications TEXT[]
recovery_protocols  TEXT[]

-- Status
status              TEXT DEFAULT 'active'    active | acknowledged | resolved
acknowledged_at     TIMESTAMPTZ
resolved_at         TIMESTAMPTZ

created_at          TIMESTAMPTZ
```

---

## 9. RecoveryProtocol

System-definierte Recovery-Protokoll-Vorlagen.

```
id                  UUID PK
name                TEXT NOT NULL
name_de             TEXT
description         TEXT
protocol_type       TEXT    active | passive | therapeutic | preventive
target_condition    TEXT    general | overreaching | injury | illness | deload
duration_days       INTEGER
daily_activities    JSONB   Strukturierte Tages-Aktivitäten
modalities_recommended TEXT[]
training_modifications TEXT[]
nutrition_guidelines TEXT[]
evidence_level      TEXT    S | A | B | C
is_active           BOOLEAN DEFAULT true
created_at          TIMESTAMPTZ
```

---

## 10. UserProtocolAssignment

User-spezifische Protokoll-Zuweisung.

```
id                  UUID PK
user_id             UUID NOT NULL
protocol_id         UUID FK → RecoveryProtocol
assigned_date       DATE NOT NULL
target_end_date     DATE
assigned_by         TEXT    ai_coach | human_coach | self
days_completed      INTEGER DEFAULT 0
compliance_rate     NUMERIC(5,2)
effectiveness_rating SMALLINT  1–10
status              TEXT DEFAULT 'active'   active | completed | discontinued
progress_notes      TEXT
created_at          TIMESTAMPTZ
```

---

## VIEWs

### weekly_recovery_stats (Materialized)
```
user_id, week_start,
avg_score, avg_sleep_hours, avg_sleep_quality,
avg_hrv_rmssd, checkin_days,
score_variability, trend_direction
```

### muscle_readiness
```
user_id, muscle_group,
last_trained_at, hours_since_trained,
training_sets, training_volume,
estimated_recovery_pct, readiness_status
```

### modality_effectiveness
```
user_id, modality_type,
avg_immediate_effect, avg_next_day_effect,
avg_score_delta, usage_count,
cost_per_session, roi_score
```

---

## Schema-Übersicht

```sql
-- User-Daten (täglich)
recovery.recovery_checkins
recovery.recovery_scores
recovery.hrv_measurements
recovery.hrv_baselines
recovery.sleep_data
recovery.recovery_modalities
recovery.training_load_logs
recovery.overtraining_alerts

-- Stammdaten
recovery.recovery_protocols
recovery.user_protocol_assignments

-- VIEWs
recovery.weekly_recovery_stats      (Materialized)
recovery.muscle_readiness
recovery.modality_effectiveness
```
