# Training Module — Feature Specs
> Spec Phase 4 | Features, Regeln, Implementierungsdetails

---

## Feature 1: Exercise Library

### Was es ist
1.200+ unique Übungen (1.850 in DB inkl. Varianten), vollständig in DE/EN/TH.
Read-only für User — keine Custom Exercises.

### Daten-Inventar
| Asset | Anzahl | Details |
|---|---|---|
| Unique Exercises | ~1.200 | nach Male/Female-Dedup |
| DB-Einträge | 1.850 | DE/EN/TH vollständig |
| Bilder | 4.645 | Start/End, Male/Female, Cloudflare R2 |
| Videos | 2.363 (~11 GB) | 12 Kategorien, Abdominals+Back live |
| Muskelgruppen | 157 | DE/EN/TH, normalisiert |
| Equipment | ~40 | normalisiert aus 82 Rohdaten |

### Klassifikation
- category: Bodyweight | Free Weights | Resistance | Cardio | Stretching
- tracking_type: weight_reps | reps_only | duration | distance_duration
- movement_pattern: push | pull | squat | hinge | carry | rotation
- discipline: bodybuilding | powerlifting | olympic | general

### Suche
- Volltextsuche: Name + Alias + Muskelgruppe (pg_trgm, <50ms)
- Multi-Filter: Kategorie + Muskelgruppe + Equipment + Schwierigkeit (kombinierbar)
- Virtualisierte Liste (nur sichtbare Items rendern bei 1.200+)

### Exercise Evaluation Scores (0–100)
Inspired by Alpha Progression. Einzigartiges Feature im Markt.
- Basiert auf: SFR (Stimulus-to-Fatigue Ratio), Mechanical Tension, Stretch Position
- "Lat Pulldown: 92/100 für Lat-Entwicklung, Cable Crossover: 45/100"
- Hilft User die effektivsten Übungen für ihr Ziel zu finden

---

## Feature 2: Routine Management

### Quellen (identisches Schema)
- `user` — User erstellt selbst (unbegrenzt, kostenlos — direkter Vorteil vs. Strong's 3-Limit)
- `coach` — Human Coach erstellt und weist zu (read-only für User)
- `marketplace` — nach Kauf zugewiesen
- `buddy` — Buddy generiert auf User-Anweisung

### Routine Builder
- Move Up / Move Down (Drag & Drop geplant)
- Supersets: Exercise A ↔ Exercise B (gleiche superset_group)
- Giant Sets: 3+ Exercises in einer Gruppe
- Drop Sets: Gewicht reduzieren ohne Pause
- Soll-Werte: Sets × Reps, Rest Timer, RPE-Ziel
- Warm-up Calculator: Auto-generierte Aufwärmsätze basierend auf Arbeitsgewicht

### Estimated Duration
```
estimated_duration_min = Σ over exercises:
  (target_sets × avg_rep_duration_s + rest_seconds × (target_sets - 1)) / 60
  + transition_time_per_exercise_s / 60
```

### Tags: Push | Pull | Legs | Upper | Lower | Full Body | Custom
Auto-assigned basierend auf primary muscles der Exercises.

---

## Feature 3: Live Workout Tracking

### Speed-First UX (Kernprinzip)
Set-Logging in <3 Sekunden. Previous-Performance vorausgefüllt.
+/- Buttons für Gewicht. Swipe to Complete. Kein Loading.

### State Machine
IDLE → SESSION_START → EXERCISE_INTRO → SET_ACTIVE → SET_COMPLETE → REST → (loop) → SESSION_COMPLETE → SUMMARY

### Previous Performance
Für jede Übung: letzter Session-Wert in "Previous"-Spalte sichtbar.
Basis für sofortige Progressive-Overload-Sichtbarkeit.

### Set-Typen
| Typ | Beschreibung | Zählt zu Volume |
|---|---|---|
| working | Normaler Arbeitssatz | ✅ |
| warmup | Aufwärmsatz | ❌ |
| dropset | Reduziertes Gewicht direkt nach working | ✅ |
| failure | Bis zum Versagen | ✅ |

### PR Detection (automatisch nach jedem Set)
| PR-Typ | Formel |
|---|---|
| estimated_1rm | Brzycki: weight / (1.0278 − 0.0278 × reps) |
| max_weight | Höchstes Gewicht für ≥1 Rep |
| max_reps | Meiste Reps bei festem Gewicht |
| max_volume | Höchstes Set-Volumen (weight × reps) |

### RPE/RIR (Progressive Disclosure)
Default: nicht sichtbar. Aktivierbar per Button für Advanced User.
RPE 1–10 (Rate of Perceived Exertion). RIR = Reps In Reserve.

### Plate Calculator
Eingabe: Zielgewicht + Hanteltyp (20kg/15kg/10kg Bar).
Ausgabe: Welche Scheiben auf welche Seite.

---

## Feature 4: Progressive Overload Engine

### Modell 1: Linear Progression
```
Wenn alle Sets in Rep-Range ODER besser:
  → next_weight = current_weight + weight_increment (default 2.5kg)
Einsatz: Beginner, konsistente Progression
```

### Modell 2: Double Progression (Standard)
```
Phase 1 (Reps): Wenn alle Sets das obere Ende der Rep-Range erreichen
  → Rep-Range beibehalten, erst Reps erhöhen
Phase 2 (Gewicht): Wenn alle Sets bei max_reps stabil
  → weight += weight_increment, Rep-Range zurücksetzen
Einsatz: Hypertrophie, Intermediate
```

### Modell 3: Wave Loading
```
Welle: [75%, 85%, 95%, Deload 65%] (% des Trainingsgewichts)
currentWeek = 1 → Intensität Woche 1, +1 pro Woche, Reset nach Welle
Einsatz: Periodisiertes Krafttraining, Intermediate+
```

### Modell 4: RPE-Autoregulation
```
targetRPE = 8.0 (konfigurierbar)
Wenn session_rpe > targetRPE + rpe_range_max:
  → next_weight = current_weight × (1 − adjustmentFactor)
Wenn session_rpe < targetRPE − rpe_range_min:
  → next_weight = current_weight × (1 + adjustmentFactor)
Einsatz: Advanced, tagesabhängige Anpassung
```

### Modell 5: DUP (Daily Undulating Periodization)
```
Rotation: Kraft (3-5 Reps, 87-93% 1RM) → Hypertrophie (8-12, 70-80%) → Power (2-4, 85-90%)
Wechsel: täglich oder pro Session
Einsatz: Abwechslungsreiches Stimuli-Training, Advanced
```

### Fatigue Detection & Deload
```
Deload-Trigger (eines der folgenden):
  → Reps fallen 3 Sätze hintereinander ab
  → RPE > 9 in 2+ Sessions in Folge
  → Keine Progression bei dieser Übung für deload_threshold Sessions (default: 3)
  → User-Feedback: Performance 😩 in 2+ Sessions

Deload:
  → Gewicht reduzieren um deload_percentage (default: 10%)
  → Sets reduzieren auf 2/3 der normalen Anzahl
  → 1 Woche Deload, dann Wiederaufnahme
```

---

## Feature 5: Volume Landmarks & Feedback-Loop

### Population-Defaults (Sets/Woche)
Aus RP Hypertrophy Research, für alle Muskelgruppen definiert (SPEC_06 Seed Data).

### Personalisierung durch Feedback-Loop
```
Post-Workout Feedback: Pump (1-3) + Soreness (1-3) pro Muskelgruppe

Algorithmus:
  IF pump_avg ≥ 2.5 AND soreness_avg ≤ 1.5:
    personal_mav += 1 (kann noch mehr Volumen verarbeiten)
  IF soreness_avg ≥ 2.5 AND pump_avg ≤ 1.5:
    personal_mrv = MIN(personal_mrv, current_sets_this_week)
    (MRV ist offensichtlich erreicht oder überschritten)
  ELSE:
    keine Änderung (Datenpunkt gesammelt für spätere Anpassung)

Minimum Datenpunkte für Anpassung: 5 Feedback-Entries pro Muskelgruppe
```

### Volume Landmarks Status
| Status | Bedingung | UI-Farbe |
|---|---|---|
| below_mev | current_sets < mev_sets | 🔴 Warnung |
| optimal | mev_sets ≤ current ≤ mav_sets | 🟢 |
| approaching_mrv | current > mav_sets | 🟡 |
| over_mrv | current > mrv_sets | 🔴 Deload |

---

## Feature 6: Stats & Analytics

### Weekly Volume Summary (VIEW)
```sql
training.weekly_volume_summary:
  user_id, week_start, muscle_group_id,
  total_sets, total_volume_kg, session_count
```

### Muscle Balance Check
Push/Pull Ratio: Sollte ~1:1 sein (Sets Brust+Schultern / Sets Rücken+Bizeps).
Push/Pull-Imbalance → Buddy-Empfehlung mehr Pull-Training.

### Strength Standards
Vergleich mit Bevölkerungswerten (Brzycki 1RM vs. Körpergewicht).
Kategorien: Beginner / Novice / Intermediate / Advanced / Elite.

### Training-Score für Goals
```
training_score = (
  session_adherence_pct  × 0.40 +  // Geplante vs. absolvierte Sessions
  volume_in_landmarks_pct × 0.30 +  // Wie viele Muskelgruppen im MAV-Bereich
  strength_trend_pct     × 0.20 +  // Positive Stärke-Entwicklung
  muscle_balance_score   × 0.10    // Push/Pull/Legs Balance
) × 100
```

---

## Feature 7: AI Workout Generation (rules-based)

**Nicht ML.** Deterministische Regeln + Exercise Evaluation Scores.

### Algorithmus
```
1. Bestimme Muskelgruppen für heute (aus Plan oder User-Auswahl)
2. Bestimme Volume-Bedarf: current_sets bis mav_sets erreicht
3. Filtere Exercises nach: Equipment, Verfügbarkeit, recovery_status < 70%
4. Sortiere nach evaluation_score DESC
5. Wähle Top-N Exercises bis Volume-Bedarf erfüllt
6. Bestimme Sets × Reps basierend auf Progression Model + Ziel
7. Vorschau → User bestätigt
```

### Exercise Evaluation Score als Hauptkriterium
Exercises mit höheren Scores (SFR, Mechanical Tension, Stretch Position) werden bevorzugt.
"Incline DB Press: Score 89 > Cable Fly: Score 62" → Incline bevorzugt für Volumen.

---

## Feature 8: Cross-Module Integration

### Recovery → Training
```
readiness_score < 60:
  → Empfehlung: Volumen um 20-30% reduzieren
  → Intensität reduzieren
readiness_score < 40:
  → Empfehlung: Rest Day
muscle_readiness[muscle] < 50:
  → Diese Muskelgruppe heute nicht trainieren
```

### Goals → Training Volume
```
goal_phase = 'cut':
  → Volume am unteren MAV (Muskelerhalt, nicht Aufbau)
goal_phase = 'bulk':
  → Volume am oberen MAV oder über MAV in Richtung MRV
goal_phase = 'prep' (contest):
  → Spezifisches Peaking-Protokoll, hohe Intensität
```

### Medical → Training Warnings
```
crp_elevated:
  → "Entzündungsmarker erhöht — Trainingsvolumen heute reduzieren"
injury_flag[muscle]:
  → Exercises mit diesem Muskel als Primary ausblenden/warnen
testosterone_low:
  → "Hormonwerte suboptimal — leichtere Session empfohlen"
```

---

## Feature 9: Personal Records

### Auto-Detection
Nach jedem Set: Vergleich mit bisherigem PR (estimated_1rm, max_weight, max_reps, max_volume).
PR → is_pr = true auf WorkoutSet, PR-Celebration Animation.

### PR-Celebration
Sofortige visuelle + haptische Reaktion im Live Workout.
🏆 Badge am Ende in Workout Summary.
→ Buddy sendet Glückwunsch-Nachricht post-workout.

---

## Feature 10: Offline Capability (geplant)

- SQLite-Cache für alle 1.200+ Exercises (lokal auf Gerät)
- Live Workout läuft ohne Internet (speichert lokal)
- Sync beim nächsten Online-sein
- Apple Watch: Standalone Set-Logging ohne Handy (Phase 2)

---

## Feature 11: Workout-Kalender

```
CalendarView.tsx: Monatsansicht
  - Grüne Punkte = absolvierte Workouts
  - Geplante Trainingstage (aus Schedule) markiert
  - Tap auf Tag → Workout-Details
  - Streak Counter (aufeinanderfolgende aktive Wochen)
```

---

## Feature 12: Pending Actions

`GET /api/training/pending-actions` — für Buddy's Tages-TODO.

Auslöser:
- Geplanter Trainingstag heute (aus Schedule) + kein Workout geloggt nach 20h
- Post-Workout Feedback ausstehend (nach letzter Session)
- Deload-Empfehlung aktiv (3+ Sessions ohne Progression)
- Volume unter MEV bei wichtiger Muskelgruppe (≥ 3 Tage)
