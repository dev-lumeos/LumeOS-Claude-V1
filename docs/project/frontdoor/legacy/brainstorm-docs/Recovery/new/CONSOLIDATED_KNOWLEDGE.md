# Recovery Module — Konsolidiertes Wissen
> Konsolidiert aus 12 Alt-Dokumenten | 2026-04-15
> Quellen: 05_MODULE_RECOVERY.md, lumeos-recovery-strategy.md, recovery-metrics.md,
> recovery_DATABASE.md, recovery_FEATURES.md, recovery_API.md, recmod_PRD.md,
> recmod_TODO.md, recovery_README.md, recovery_RESEARCH.md,
> recovery_MIGRATION.md, recovery_COMPONENTS.md

---

## 1. Zweck & Status

Port 5400. Monitort Erholung, Schlafqualität, Stress-Level und gibt
datenbasierte Empfehlungen für optimale Trainingsperformance. Schützt vor
Übertraining, maximiert Adaptation durch evidenzbasiertes Recovery-Management.

**Status (2026-04-14):** 85% komplett. Sprint 1 (Self-Report MVP) implementiert.
Wearable-Integration geplant (Phase 2).

---

## 2. Kern-USPs

1. **Muscle-Specific Recovery Map** — kein Competitor bietet das. Nicht globaler Score,
   sondern pro Muskelgruppe wann sie wieder ready ist. "Heute Push, nicht Pull — Lats 65%."
2. **Kein Wearable nötig** — Phone Camera HRV + Self-Report. WHOOP $30/mo vs. Lumeos $9.99/mo.
3. **Cross-Module Recovery** — Training Load + Nutrition + Bloodwork beeinflussen Score.
   WHOOP weiß nicht was du gegessen hast oder welche Muskeln kaputt sind.

---

## 3. Recovery Score (0-100)

### Composite-Formel (6 Inputs + Bonus)

| Input | Gewicht | Quelle |
|---|---|---|
| Schlafqualität (1-10) | 30% | Morning Check-in |
| Schlafdauer vs. 8h Ziel | 15% | Morning Check-in |
| Subjektives Empfinden (1-10) | 15% | Morning Check-in |
| HRV vs. persönliche Baseline | 25% | Wearable / Phone Camera (wenn verfügbar) |
| Training Load (gestern) | 15% | Training Modul |
| Nutrition Score (gestern) | 10% | Nutrition Modul |
| Stimmung | 5% | Morning Check-in |
| Modality Bonus | 0–5 Punkte | Recovery Modalities |

**MVP-Gewichtung (ohne HRV/Wearable):**
Schlafqualität 30% · Schlafdauer 15% · Empfinden 15% · Soreness 10% · Training 15% · Nutrition 10% · Stimmung 5%

### Training Readiness Thresholds
| Score | Status | Empfehlung |
|---|---|---|
| 90–100 | excellent | Maximale Intensität / PR-Tag |
| 80–89 | good | Normal Training |
| 70–79 | moderate | Moderate Intensität |
| 60–69 | poor | Leichtes Training / Skills |
| < 60 | rest | Rest Day empfohlen |

---

## 4. Muscle Recovery Map

### Pro-Muskelgruppe Berechnung
```
recovery_pct = base_curve(hours_since_training)
             × sleep_modifier(sleep_quality)
             × nutrition_modifier(protein, calories)
             × hrv_modifier(hrv_vs_baseline)
             × soreness_modifier(self_reported)
             × volume_modifier(sets_last_session)
```

### Base Recovery Curve
| Stunden | Recovery % | Status |
|---|---|---|
| 0–12 | 10–30% | 🔴 Aktive Erholung |
| 12–24 | 30–50% | 🔴 Noch erholt sich |
| 24–48 | 50–75% | 🟡 Annähernd ready |
| 48–72 | 75–90% | 🟢 Bereit für Moderat |
| 72–96 | 90–100% | 🟢 Vollständig erholt |
| 96+ | 95–100% | ⚪ Risiko: Detraining |

### 18 Tracked Muskelgruppen (mit SVG Body Map)
trapezius · upper_back · lower_back · chest · biceps · triceps · forearm ·
front_deltoids · back_deltoids · abs · obliques · adductor ·
hamstring · quadriceps · abductors · calves · gluteal · neck

---

## 5. Morning Check-in (Daily Assessment)

Quick Entry (<30 Sekunden):
- Schlafdauer (Slider 0–12h, 0.5er Schritte)
- Schlafqualität (1–10, Emoji-Slider)
- Subjektives Empfinden (1–10)
- Muskelkater Body Map (0–3 pro Gruppe: 0=nichts, 3=stark)
- Stimmung (motivated | good | neutral | tired | sick)

Optional (für Fortgeschrittene):
- HRV-Messung (Phone Camera oder Wearable)
- Stress-Level (1–10: perceived / work / life)
- Alkohol-Einheiten, Koffein, Screen-Time vor Schlaf

---

## 6. Recovery Modalities

| Modalität | Was wird geloggt |
|---|---|
| Sauna | Dauer (min), Temperatur (°C), Feucht/Trocken |
| Cold Plunge | Dauer, Temperatur |
| Contrast Therapy | Abwechslung Heiß/Kalt |
| Massage | Typ (Deep Tissue/Sports/Swedish/Thai), Dauer, Kosten |
| Foam Rolling | Dauer, Körperstellen |
| Stretching/Yoga | Dauer, Typ (Statisch/Dynamisch) |
| Meditation | Dauer, Typ |
| Breathwork | Dauer, Protokoll (Box/Wim Hof/4-7-8) |
| Nap | Dauer |
| Active Recovery | Dauer, Intensität |

**Effectiveness Tracking:**
- Sofort-Rating (1–10)
- Next-Day Impact (Score-Delta berechnet)
- Cost-Benefit bei bezahlten Behandlungen

---

## 7. HRV-Integration

### Metriken
- RMSSD (Root Mean Square of Successive Differences) — Primär
- pNN50 (Percentage of RR intervals > 50ms)

### Messquellen
- Phone Camera (PPG, validated by HRV4Training — r=0.98 vs. Chest Strap)
- Apple HealthKit (iOS)
- Google Health Connect (Android)
- Direct: Oura, WHOOP, Garmin, HRV4Training, Elite HRV

### Baseline-Berechnung
30-Tage Rolling Average als persönliche Baseline.
HRV-Score = Abweichung vom persönlichen Durchschnitt.

---

## 8. Übertraining-Detection

### Signal-Kombination
| Signal | Schwelle |
|---|---|
| HRV < Baseline | >10% unter 14-Tage-Durchschnitt für 5+ Tage |
| Resting HR erhöht | >5bpm über Baseline für 3+ Tage |
| Schlafqualität niedrig | <65% für 3+ Nächte hintereinander |
| Subjektive Erschöpfung | ≤3/10 für 3+ Tage |
| Leistung fällt | Training: Volume/Strength sinkt trotz Aufwand |
| Stimmung/Motivation | Negatives Muster über 5+ Tage |
| CRP erhöht | Bloodwork |
| Testosteron gesunken | >20% unter Baseline |

### Overtraining Score
- 0–2 Signale: Normal
- 3–4: ⚠️ Warnung → Deload vorschlagen
- 5–6: 🟠 Hohes Risiko → Deload-Woche empfehlen
- 7+: 🔴 Übertraining wahrscheinlich → Arzt + Pause

---

## 9. Wearable-Integration

### MVP: Health Aggregators (Tier 1)
- Apple HealthKit (iOS) — deckt Apple Watch, Oura, WHOOP, Garmin, Fitbit
- Google Health Connect (Android) — deckt Wear OS, Samsung, Fitbit, Oura
- 90% aller Wearable-User mit 2 Integrationen

### Phase 2: Direct APIs (Tier 2)
- WHOOP API (Strain/Recovery Detail)
- Oura API (Sleep Stages Detail)
- Garmin Connect API (Body Battery)

### Phase 3: No-Hardware (Tier 3)
- Phone Camera HRV (PPG-basiert, 60 Sekunden morgens)
- Accelerometer Sleep Detection
- Kamera-basiertes HRV gescaffolded, nicht fertig implementiert

---

## 10. Cross-Module Verbindungen

| Modul | Was Recovery empfängt | Was Recovery sendet |
|---|---|---|
| Training | Training Load, Session RPE, Volume | Readiness Score, Muscle Recovery Map |
| Nutrition | Nutrition Compliance Score | Recovery-Nutrition Insights |
| Medical | Cortisol, CRP, Testosteron | Recovery Impact von Biomarkern |
| Goals | Goal Phase | Recovery Compliance Score |
| Supplements | Supplement-Compliance | Recovery-Supplement Insights |
| Buddy | — | Recovery Status, Empfehlungen |

---

## 11. Modality Modifier

```typescript
const MODALITY_BONUS: Record<string, number> = {
  sauna:             2.0,  // +2 Punkte
  cold_plunge:       1.5,
  massage:           2.5,  // Höchster Bonus
  contrast_therapy:  2.0,
  foam_rolling:      0.5,
  stretching:        0.5,
  meditation:        1.0,
  breathwork:        1.0,
  nap_20_30min:      1.5,
  active_recovery:   0.5,
};
// Maximum Bonus: 5 Punkte/Tag (auch wenn mehrere Modalitäten)
```
