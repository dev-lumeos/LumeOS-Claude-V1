# Recovery Module — Features

## Implementierte Features

### 1. Morning Check-in (<30 Sekunden)

Tägliche Erfassung. UPSERT — überschreibbar.

- Schlafdauer (Slider 0–12h, 0.5er Schritte)
- Schlafqualität (1–10 Emoji-Slider)
- Subjektives Empfinden (1–10)
- Muskelkater Body Map — react-body-highlighter, 18 Muskelgruppen, 0–3 per Tap
- Stimmung: motivated / good / neutral / tired / sick
- Optional (Progressive Disclosure): Stress, Alkohol, Koffein, Screen-Time, Schmerz-Bereiche
- Auto-Prompt auf Home-Screen nach 10 Uhr wenn kein Checkin

Code: `routes/checkin.ts` · `recovery.recovery_checkins` · `CheckinModal.tsx` · `useCheckinToday.ts`

---

### 2. Recovery Score (0–100)

3 Modi — Progressive Enhancement.

**Modi:**
- `manual` (MVP): Schlaf + Empfinden + Kater + Training + Nutrition + Stimmung
- `hrv`: Wie manual, aber HRV ersetzt teilweise subjektive Inputs (25% Gewicht)
- `wearable`: HRV + Sleep Stages aus Wearable (beste Genauigkeit)

Trigger: Score wird automatisch nach jedem Checkin-INSERT neu berechnet.

Training Readiness: excellent (90+) / good (80+) / moderate (70+) / poor (60+) / rest (<60)

Code: `routes/score.ts` · `recovery.recovery_scores` · `packages/scoring/src/recovery.ts` · `RecoveryScoreCard.tsx`

---

### 3. Muscle Recovery Map

Einzigartiges Feature — kein Competitor hat das.

- Recovery % pro Muskelgruppe aus: Training Load + Sleep + Nutrition + Soreness
- Base Recovery Curve: 0–12h → 10–30%, 12–24h → 30–50%, 24–48h → 50–75%, 48–72h → 75–90%, 72–96h → 90–100%
- Modifikatoren: Volume (Sets) + Sleep Quality + Nutrition (Protein/Kalorien) + Soreness
- 18 Muskelgruppen (SVG Body Map, anterior + posterior)
- Farbcoding: 🟢 >80% / 🟡 50–80% / 🔴 <50%
- Training-Empfehlung: "Heute Push Day ideal (Chest/Shoulders/Triceps alle >85%)"

Code: `routes/muscle-map.ts` · `MuscleRecoveryMap.tsx` · `useMusclemap.ts`

---

### 4. HRV Integration

- Metriken: RMSSD (primär), pNN50
- Messquellen: Apple HealthKit / Google Health Connect, Oura, WHOOP, HRV4Training, phone_camera (scaffolded), manual
- Phone Camera: PPG via Flashlight, 60s, r=0.98 vs. Chest Strap (HRV4Training Paper)
- Baseline: 30-Tage Rolling Average (min. 7 Messungen für valide Berechnung)
- HRV Score: Z-Score normalisiert → 0–100 (70 = Baseline, +15 pro Sigma)

Code: `routes/hrv.ts` · `recovery.hrv_measurements` · `recovery.hrv_baselines` · `HRVCard.tsx` · `useHRVData.ts`

---

### 5. Sleep Tracking

- Manuell im Morning Check-in (Stunden + Qualität)
- Wearable-Import: Apple HealthKit / Google Health Connect
- Wearable-Daten: Schlafdauer, Deep Sleep %, REM Sleep %, Sleep Efficiency, Sleep Latency
- Conflict Resolution: Wearable-Daten preferred wenn `device_confidence > 0.8`

Code: `routes/sleep.ts` · `recovery.sleep_data` · `useSleepData.ts`

---

### 6. Recovery Modality Logging

12 Modalitäten tracked mit Effectiveness Tracking (2-stufig).

| Modalitäten | Bonus |
|---|---|
| Massage | +2.5 Punkte |
| Sauna, Contrast Therapy | +2.0 |
| Cold Plunge | +1.5 |
| Nap (20–30min) | +1.5 |
| Meditation, Breathwork | +1.0 |
| Yoga | +0.75 |
| Stretching, Foam Rolling, Active Recovery | +0.5–0.75 |

Max Bonus/Tag: 5 Punkte.

Effectiveness Tracking: Sofort-Rating (1–10) + Next-Day Impact (Score-Delta berechnet)

Code: `routes/modalities.ts` · `recovery.recovery_modalities` · `ModalityLogger.tsx`

---

### 7. Übertraining Detection

8 Signale kombiniert. Automatische Alert-Generierung.

| Signale | Threshold |
|---|---|
| HRV < Baseline | >10% unter 14d-Durchschnitt für 5+ Tage |
| Resting HR erhöht | >5bpm über Baseline 3+ Tage |
| Recovery Score tief | <55 im 3-Tage-Durchschnitt |
| Schlaf schlecht | <6/10 für 3+ Nächte |
| Erschöpfung subjektiv | ≤4/10 für 3+ Tage |
| Soreness hoch | 3+ Tage mit starkem Kater |
| Motivation niedrig | ≤3/10 5-Tage-Trend |
| Performance sinkend | Training: Volume/Strength fällt |

**Severity:** 3–4 Signale = moderate, 5–6 = high, 7+ = critical

Code: `routes/alerts.ts` · `recovery.overtraining_alerts` · `OvertrainingAlert.tsx`

---

### 8. Recovery Protocols

5 System-Vorlagen für häufige Szenarien:
- Active Recovery Week (7 Tage, Evidence A)
- Passive Deload (7 Tage, Evidence A)
- Sleep Optimization Protocol (14 Tage)
- Injury Protocol Light (10 Tage)
- Overtraining Recovery (5 Tage, intensiv)

Code: `routes/protocols.ts` · `recovery.recovery_protocols` · `ProtocolCard.tsx`

---

### 9. Training Load Integration

- Eingehend vom Training-Modul nach Session-Abschluss (POST /training-load)
- Speichert: volume_kg, intensity_avg_rpe, muscles_worked JSONB
- Berechnet: ACWR (Acute/Chronic Workload Ratio)
- Ausgehend ans Training-Modul vor Session (GET /readiness)

Code: `routes/training-load.ts` · `routes/readiness.ts` · `recovery.training_load_logs`

---

### 10. Recovery Insights

- 7d/30d Trend-Zusammenfassung
- Pattern Recognition: "Sauna → +2.3 Punkte Ø", "Protein >160g → +12% Score"
- Modality Effectiveness Ranking
- Best/worst Recovery Day der Woche

Code: `routes/insights.ts` · `InsightsView.tsx` · `PatternInsights.tsx`

---

## Geplante Features

### Mittlere Priorität

| Feature | Beschreibung |
|---|---|
| Phone Camera HRV vollständig | Scaffolded, PPG-Algorithmus implementieren |
| WHOOP + Oura Direct API | Tier 2 Integration für detailliertere Daten |
| Protocol Template Library | Weitere Protokoll-Vorlagen |
| Coach-Access zu Recovery | Coach sieht Recovery-Trends seiner Clients |

### Niedrige Priorität

| Feature | Beschreibung |
|---|---|
| Garmin Body Battery Sync | Tier 2 Direktintegration |
| Community Recovery Insights | Anonymisierte Aggregation |
| Apple Watch Standalone | Recovery Check-in direkt von Watch |
