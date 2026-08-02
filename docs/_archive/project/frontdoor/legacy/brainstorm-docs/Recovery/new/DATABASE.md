# Recovery Module — Database Schema

## Schema & Übersicht

Alle Recovery-Tabellen im Schema `recovery`. Cross-Modul nur via API.

---

## Tabellen-Index

| Tabelle | Beschreibung |
|---|---|
| `recovery.recovery_checkins` | Täglicher Morning Check-in (UPSERT) |
| `recovery.recovery_scores` | Berechneter Daily Score (via Trigger) |
| `recovery.hrv_measurements` | HRV-Messungen aus Wearables oder Phone |
| `recovery.hrv_baselines` | Persönliche HRV-Baseline (30d Rolling) |
| `recovery.sleep_data` | Detaillierte Schlafdaten |
| `recovery.recovery_modalities` | Recovery-Aktivitäten |
| `recovery.training_load_logs` | Eingehende Training-Daten |
| `recovery.overtraining_alerts` | Automatische Übertraining-Warnungen |
| `recovery.recovery_protocols` | System-Protokoll-Vorlagen |
| `recovery.user_protocol_assignments` | User-Protokoll-Zuweisungen |

**VIEWs:**
- `weekly_recovery_stats` (Materialized)
- `muscle_readiness`
- `modality_effectiveness`

---

## Kern-Tabellen Detail

### `recovery.recovery_checkins`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` | UUID NOT NULL | |
| `date` | DATE NOT NULL | UNIQUE mit user_id |
| `sleep_hours` | NUMERIC(3,1) | 0.0–12.0 in 0.5er |
| `sleep_quality` | SMALLINT | 1–10 |
| `sleep_start_time` / `sleep_end_time` | TIME | |
| `subjective_feeling` | SMALLINT | 1–10 |
| `mood` | TEXT | motivated / good / neutral / tired / sick |
| `energy_level` | SMALLINT | 1–10 |
| `motivation` | SMALLINT | 1–10 |
| `soreness` | JSONB DEFAULT '{}' | {"quadriceps": 2, "chest": 1} — 0–3 pro Gruppe |
| `pain_areas` | TEXT[] | Spezifische Schmerzstellen |
| `stress_level` | SMALLINT | 1–10 |
| `work_stress` / `life_stress` | SMALLINT | |
| `alcohol_units` | NUMERIC(3,1) | |
| `caffeine_mg` | INTEGER | |
| `screen_time_hours` | NUMERIC(3,1) | Vor Schlaf |
| `resting_hr` / `hrv_rmssd` / `spo2_pct` | NUMERIC | Wearable (optional) |

**UNIQUE:** (user_id, date)
**Trigger:** `trg_compute_recovery_score` → nach INSERT/UPDATE sofort Score berechnen

---

### `recovery.recovery_scores`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` / `date` | | UNIQUE |
| `recovery_score` | NUMERIC(5,2) | 0–100 |
| `sleep_quality_score` … `modality_bonus` | NUMERIC | Alle Komponenten-Scores |
| `readiness_level` | TEXT | excellent / good / moderate / poor / rest |
| `intensity_recommendation` | TEXT | high / moderate / light / rest / deload |
| `mode` | TEXT | manual / hrv / wearable |
| `training_load_used` / `nutrition_compliance_used` / `hrv_baseline_used` | NUMERIC | Snapshot für Debugging |
| `acwr_used` | NUMERIC(5,3) | |

---

### `recovery.hrv_measurements`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `measured_at` | TIMESTAMPTZ | |
| `rmssd` | NUMERIC(6,2) | ms |
| `pnn50` | NUMERIC(5,2) | % |
| `heart_rate` | NUMERIC(5,1) | |
| `hrv_score` | NUMERIC(5,2) | Normalisiert 0–100 |
| `device_source` | TEXT | hrv4training / oura / whoop / garmin / apple_health / google_health / phone_camera / manual |
| `measurement_quality` | TEXT | excellent / good / fair / poor |

---

### `recovery.hrv_baselines`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `user_id` | UUID PK | |
| `avg_rmssd` | NUMERIC(6,2) | |
| `stddev_rmssd` | NUMERIC(6,2) | |
| `data_points` | INTEGER | Min. 7 für valide Baseline |

---

### `recovery.sleep_data`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `sleep_date` | DATE | UNIQUE mit user_id |
| `total_sleep_minutes` | INTEGER | |
| `deep_sleep_minutes` / `rem_sleep_minutes` / `light_sleep_minutes` | INTEGER | |
| `sleep_efficiency` | NUMERIC(5,2) | total/in_bed × 100 |
| `sleep_latency_minutes` | INTEGER | |
| `wake_frequency` | INTEGER | |
| `data_source` | TEXT | oura / whoop / apple_health / google_health / garmin / manual |
| `device_confidence` | NUMERIC(3,2) | 0.0–1.0 |

---

### `recovery.recovery_modalities`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `modality_type` | TEXT | sauna / cold_plunge / contrast_therapy / massage / foam_rolling / stretching / yoga / meditation / breathwork / nap / active_recovery |
| `duration_minutes` | INTEGER | |
| `temperature_c` | NUMERIC(4,1) | Sauna/Cold Plunge |
| `intensity` | TEXT | light / moderate / deep / therapeutic |
| `location` | TEXT | home / gym / spa / clinic |
| `cost_eur` | NUMERIC(8,2) | |
| `immediate_effect` | SMALLINT | 1–10 |
| `next_day_effect` | SMALLINT | 1–10 (nachträglich) |
| `next_day_score_delta` | NUMERIC(5,2) | Berechnetes Score-Delta |

---

### `recovery.training_load_logs`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `session_id` | UUID | Referenz auf training.workout_sessions |
| `volume_kg` | NUMERIC(10,2) | |
| `intensity_avg_rpe` | NUMERIC(3,1) | |
| `muscles_worked` | JSONB | {"Pectoralis Major": {"sets": 12, "volume_kg": 1800}} |
| `acute_load` / `chronic_load` | NUMERIC | 7d-Summe / 28d-Ø |
| `acwr` | NUMERIC(5,3) | acute/chronic |

---

### `recovery.overtraining_alerts`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `severity` | TEXT | low / moderate / high / critical |
| `signals_count` | INTEGER | |
| `signals` | JSONB | [{id, value, threshold, days}] |
| `recommended_action` | TEXT | |
| `rest_days_suggested` | INTEGER | |
| `status` | TEXT | active / acknowledged / resolved |

---

## Trigger

| Trigger | Tabelle | Was |
|---|---|---|
| `trg_compute_recovery_score` | `recovery_checkins` | Score nach INSERT/UPDATE neu berechnen |

---

## VIEWs

### `weekly_recovery_stats` (Materialized)
```sql
-- user_id, week_start, avg_score, avg_sleep_hours,
-- avg_sleep_quality, avg_hrv_rmssd, checkin_days,
-- score_variability, trend_direction
```

### `muscle_readiness`
```sql
-- user_id, muscle_group, last_trained_date,
-- hours_since_trained, total_sets, total_volume
-- (aus training_load_logs der letzten 7 Tage)
```

### `modality_effectiveness`
```sql
-- user_id, modality_type,
-- avg_immediate, avg_next_day, avg_score_delta,
-- usage_count, avg_cost, roi_per_euro
```

---

## RLS-Policies

Alle User-Tabellen: `auth.uid()::text = user_id::text`.
`recovery_protocols`: SELECT für alle (System-Daten).

---

## Schema-Entscheidungen

**Warum separates `recovery` Schema?** Domain-Isolation, kein Cross-Schema-Join.

**Warum Trigger für Score-Berechnung?** Score immer aktuell, keine App-Logik die vergessen kann.

**Warum soreness als JSONB?** Flexibles Key-Value für 18 Muskelgruppen ohne 18 Spalten.

**Warum muscles_worked als JSONB?** Training-Modul schickt beliebig viele Muskelgruppen mit Volumen.
