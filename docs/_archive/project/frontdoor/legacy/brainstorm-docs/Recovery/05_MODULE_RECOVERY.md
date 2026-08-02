# LUMEOS — Modul: Recovery
> Konsolidiert | 2026-04-14
> API Port: 5400 | Status: ✅ 85% komplett

---

## 1. Zweck

Das Recovery-Modul monitort Erholung, Schlafqualität, Stress-Level und gibt datenbasierte Empfehlungen für optimale Trainingsperformance. Es schützt den User vor Übertraining und maximiert Adaptation durch evidenzbasiertes Recovery-Management.

---

## 2. Architektur

```
Frontend (Next.js/Vite)
  apps/app/modules/recovery/
    ├── components/
    │   ├── DailyCheckin.tsx
    │   ├── MuscleRecoveryMap.tsx
    │   ├── RecoveryScoreCard.tsx
    │   ├── OvertrainingAlert.tsx
    │   └── ModalityTracker.tsx
    ├── hooks/
    └── stores/

API Layer (Hono, Port 5400)
  src/api/recovery/
    ├── routes/
    │   ├── checkin.ts
    │   ├── hrv.ts
    │   ├── modalities.ts
    │   └── insights.ts
    └── utils/
        └── computeScore.ts

Database
  Schema: recovery.*
```

---

## 3. Features

### 3.1 Daily Recovery Assessment (Morning Check-in)
Tägliche Erfassung von:
- Schlafqualität (1-10) + Schlafdauer (Stunden)
- Subjektives Wohlbefinden (1-10)
- Stimmung: motivated, good, neutral, tired, sick
- Energie-Level (1-10)
- Muskelkater-Mapping (interaktive Body Map)

### 3.2 Muscle Soreness Mapping
- Interaktive Body Map: Muskelgruppen-Auswahl
- Soreness Scale pro Gruppe: 0 (none) bis 3 (severe)
- Hotspot-Detection: häufig verhärtete Bereiche
- Recovery Patterns: Kater-Trends über Zeit

### 3.3 Recovery Score (0-100)

**Score-Formel:**
```typescript
recoveryScore = (
  sleep_quality_score    * 0.30 +   // sleep_quality/10 × 30
  sleep_hours_score      * 0.15 +   // min(hours,8)/8 × 15
  subjective_score       * 0.15 +   // feeling/10 × 15
  soreness_score         * 0.10 +   // (1 - avg_soreness/3) × 10
  training_load_score    * 0.15 +   // basierend auf Training-Volume
  nutrition_score        * 0.10 +   // Nutrition-Compliance
  mood_score             * 0.05     // Mood-Multiplikator
) + modality_bonus                  // 0-5 Bonus für Recovery-Aktivitäten
```

**Training Readiness:** `ready | caution | rest`
**Thresholds:** ok ≥ 75, warn 50-74, block < 50

### 3.4 HRV Integration
- Metriken: RMSSD, pNN50
- Autonomic Balance: Sympathikus/Parasympathikus
- Persönliche Baseline-Berechnung
- HRV-basierte Trainings-Readiness
- Device Integration: HRV4Training, Elite HRV, Oura, Whoop
- *Hinweis: Kamera-basiertes HRV scaffolded, noch nicht implementiert*

### 3.5 Sleep Stage Analysis
- Deep Sleep (Recovery-kritisch)
- REM Sleep (mentale Erholung)
- Sleep Efficiency: Schlafzeit / Zeit im Bett
- Wake Frequency (Schlaffragmentierung)
- Integration: Oura, Whoop, Apple Health, Eight Sleep

### 3.6 Recovery Modality Tracking
Unterstützte Modalitäten:
| Modalität | Tracked |
|---|---|
| Sauna | Temperatur, Dauer, Sofort-Effekt, Next-Day-Effekt |
| Cold Plunge | Temperatur, Dauer, Protokoll |
| Massage | Typ (Deep Tissue/Sports/Swedish), Dauer, Kosten |
| Stretching | Dauer, Fokus-Bereiche, Effectiveness-Rating |
| Meditation | Dauer, Typ, Stressreduktion |
| Active Recovery | Light Cardio, Yoga, Mobility |

**Effectiveness Tracking:**
- Sofort-Bewertung (1-10)
- Next-Day Recovery Score Impact (gemessen)
- Cost-Benefit (ROI bei bezahlten Behandlungen)
- AI-Empfehlung der effektivsten Modalitäten pro User

### 3.7 Übertraining-Detection
**Automatische Alerts bei:**
- Recovery Score < persönlicher Threshold an 3+ aufeinanderfolgenden Tagen
- HRV-Rückgang > 15% vom persönlichen Baseline
- Konsistent schlechte Schlafqualität (Trend)
- Anhaltender Muskelkater (Schlafmangel-Muskelgruppen)

**Alert Severities:** low | moderate | high | critical

**Intervention bei Critical:**
- Empfohlene Rest Days
- Training-Modifikationen (Deload, Volume-Reduktion)
- Recovery-Protokoll-Empfehlungen
- Nutrition-Anpassungen (mehr Kalorienzufuhr)

### 3.8 Deload Recommendations
- Strukturierte Deload-Wochen (Volume/Intensity -50%)
- Active Recovery Prescriptions
- Automatisch getriggert bei Plateau + Low Recovery

---

## 4. Datenbank-Schema

### `recovery_checkins`
```sql
id                  UUID PK
user_id             UUID FK
checkin_date        DATE
sleep_hours         NUMERIC(3,1)
sleep_quality       INTEGER            -- 1-10
sleep_bedtime       TIME
sleep_wake_time     TIME
subjective_feeling  INTEGER            -- 1-10
mood                VARCHAR            -- motivated, good, neutral, tired, sick
energy_level        INTEGER            -- 1-10
recovery_score      INTEGER            -- 0-100 (berechnet)
training_readiness  VARCHAR            -- ready, caution, rest
notes               TEXT
created_at          TIMESTAMPTZ
```

### `muscle_soreness_logs`
```sql
id              UUID PK
checkin_id      UUID FK
muscle_group    VARCHAR
soreness_level  INTEGER            -- 0-3
```

### `hrv_logs`
```sql
id              UUID PK
user_id         UUID FK
logged_at       TIMESTAMPTZ
rmssd           NUMERIC
pnn50           NUMERIC
heart_rate      INTEGER
device_source   VARCHAR            -- hrv4training, oura, whoop
```

### `recovery_modalities`
```sql
id              UUID PK
user_id         UUID FK
modality_type   VARCHAR            -- sauna, cold_plunge, massage, etc.
duration_minutes INTEGER
temperature_c   NUMERIC            -- für Sauna/Cold Plunge
effectiveness_rating INTEGER      -- 1-10
cost_eur        NUMERIC
notes           TEXT
logged_at       TIMESTAMPTZ
next_day_impact NUMERIC            -- Score-Delta nach Modalität
```

### `recovery_insights` (aggregiert)
```sql
user_id         UUID FK
period_start    DATE
period_end      DATE
avg_score       NUMERIC
avg_sleep_hours NUMERIC
avg_sleep_quality NUMERIC
avg_hrv         NUMERIC
dominant_soreness VARCHAR[]        -- häufigste Muskelgruppen
best_modality   VARCHAR            -- effektivste Modalität
```

---

## 5. API-Endpunkte

| Route | Hauptendpunkte |
|---|---|
| `checkin.ts` | `POST /checkin`, `GET /checkin/today`, `GET /checkin/history` |
| `hrv.ts` | `POST /hrv`, `GET /hrv/trend`, `GET /hrv/baseline` |
| `modalities.ts` | `POST /modalities/log`, `GET /modalities/effectiveness` |
| `insights.ts` | `GET /insights/7d`, `GET /insights/30d`, `GET /insights/patterns` |

---

## 6. Score-Berechnung Detail

```typescript
// computeScore.ts
function computeRecoveryScore(checkin: RecoveryCheckin): number {
  const sleepQualityScore = (checkin.sleep_quality / 10) * 30;
  const sleepHoursScore   = (Math.min(checkin.sleep_hours, 8) / 8) * 15;
  const subjectiveScore   = (checkin.subjective_feeling / 10) * 15;
  const sorenessScore     = (1 - getAvgSoreness(checkin.muscle_soreness) / 3) * 10;
  const trainingLoadScore = computeTrainingLoadScore(checkin.user_id) * 0.15 * 100;
  const nutritionScore    = getNutritionCompliance(checkin.user_id) * 0.10 * 100;
  const moodScore         = getMoodMultiplier(checkin.mood) * 5;
  const modalityBonus     = getModalityBonus(checkin.user_id); // 0-5

  return Math.round(
    sleepQualityScore + sleepHoursScore + subjectiveScore +
    sorenessScore + trainingLoadScore + nutritionScore +
    moodScore + modalityBonus
  );
}
```

---

## 7. Verbindungen zu anderen Modulen

| Modul | Verbindung |
|---|---|
| **Goals** | Recovery Score → Goal Contribution |
| **Training** | Training Load Index ← Training-Volume; Readiness → Training-Intensität |
| **Nutrition** | Nutrition Compliance fließt in Recovery Score ein |
| **Medical** | Cortisol, CRP Werte aus Medical beeinflussen Recovery-Bewertung |
| **Coach (AI)** | Recovery-Trends für Empfehlungen (Deload, Schlaf-Coaching) |

---

## 8. Offene Punkte

| # | Typ | Beschreibung | Priorität |
|---|---|---|---|
| TODO | 🟡 | Kamera-basiertes HRV (scaffolded, nicht gebaut) | 🟡 MITTEL |
| TODO | 🟡 | Wearable-Integration (Oura, Whoop APIs) | 🟡 MITTEL |
| TODO | 🟡 | Sleep Quality Auto-Detection (via Wearable) | 🟡 MITTEL |
| TODO | 🟡 | Recovery Protocol Templates Library | 🟡 MITTEL |
| TODO | 🟢 | Community Recovery Insights | 🟢 NIEDRIG |
