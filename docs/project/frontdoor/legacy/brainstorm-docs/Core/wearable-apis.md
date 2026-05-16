# Lumeos Recovery — Wearable API Integration Guide

## Priority 1: Universal Import (covers ~90% users)

### Apple HealthKit (iOS)
- **Access:** Native iOS Framework
- **Available Data:**
  - HRV (rMSSD) — per reading + nightly average
  - Heart Rate — resting, walking, workout
  - Sleep Analysis — InBed, Asleep (Core/Deep/REM)
  - Respiratory Rate
  - Blood Oxygen (SpO2)
  - Steps, Distance, Flights Climbed
  - Active Energy Burned
  - Workouts (type, duration, HR zones)
  - Body Temperature
  - Noise Exposure
- **Why Priority 1:** Oura, WHOOP, Garmin, Polar, Fitbit, Apple Watch ALL sync to HealthKit

### Google Health Connect (Android)
- **Access:** Health Connect API
- **Available Data:** Similar to HealthKit
  - HRV, HR, Sleep, SpO2, Steps, Workouts, Respiratory Rate
- **Why Priority 1:** Samsung, Fitbit, Oura, WHOOP sync to Health Connect

---

## Priority 2: Direct Wearable APIs (richer data)

### Oura API v2 (REST)
- **Auth:** OAuth 2.0
- **Endpoints:**
  - `/v2/usercollection/daily_readiness` — Readiness Score + contributors
  - `/v2/usercollection/daily_sleep` — Sleep Score + stages + HRV
  - `/v2/usercollection/daily_activity` — Activity Score
  - `/v2/usercollection/heartrate` — 5-min HR data
  - `/v2/usercollection/sleep` — Detailed sleep sessions
- **Rate Limit:** 5000 requests/5min
- **Docs:** cloud.ouraring.com/v2/docs

### WHOOP API
- **Auth:** OAuth 2.0
- **Endpoints:**
  - `/v1/recovery` — Recovery Score + HRV + RHR + SpO2
  - `/v1/sleep` — Sleep data + stages
  - `/v1/cycle` — Strain data
  - `/v1/workout` — Workout details
- **Rate Limit:** Varies
- **Docs:** developer.whoop.com

### Garmin Health API
- **Auth:** OAuth 1.0a
- **Endpoints:**
  - Body Battery, Stress, HRV
  - Sleep data
  - Activities + Training Load
  - Steps, HR, SpO2
- **Access:** Partner program (application required)
- **Docs:** developer.garmin.com/health-api

### Polar AccessLink API
- **Auth:** OAuth 2.0
- **Endpoints:**
  - Nightly Recharge data
  - Sleep data
  - Activity data
  - Training sessions + Training Load
- **Docs:** polar.com/accesslink-api

### Fitbit Web API
- **Auth:** OAuth 2.0
- **Endpoints:**
  - HRV, Sleep, HR, SpO2
  - Stress Management Score
  - Active Zone Minutes
  - Activity data
- **Docs:** dev.fitbit.com

---

## Data Mapping: Wearable → Lumeos Recovery Score

| Lumeos Field | Apple Health | Oura API | WHOOP API | Garmin API |
|-------------|-------------|----------|-----------|------------|
| HRV (rMSSD) | `HKQuantityTypeIdentifier.heartRateVariabilitySDNN` | `daily_readiness.contributors.hrv_balance` | `recovery.score.hrv_rmssd_milli` | HRV Status |
| Resting HR | `HKQuantityTypeIdentifier.restingHeartRate` | `daily_readiness.contributors.resting_heart_rate` | `recovery.score.resting_heart_rate` | Resting HR |
| Sleep Duration | `HKCategoryTypeIdentifier.sleepAnalysis` | `daily_sleep.contributors.total_sleep` | `sleep.score.total_in_bed` | Sleep Duration |
| Sleep Stages | `.asleepCore/.asleepDeep/.asleepREM` | `sleep.sleep_phase_5_min` | `sleep.stage_summary` | Sleep Stages |
| SpO2 | `HKQuantityTypeIdentifier.oxygenSaturation` | `daily_readiness.contributors.body_temperature` | `recovery.score.spo2_percentage` | Pulse Ox |
| Resp. Rate | `HKQuantityTypeIdentifier.respiratoryRate` | via sleep data | `sleep.score.respiratory_rate` | Respiratory Rate |
| Readiness | — (compute own) | `daily_readiness.score` | `recovery.score.recovery_score` | Body Battery |
