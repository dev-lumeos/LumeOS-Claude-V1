# Goals Module — Features

## Implementierte Features

### 1. SMART Goal Management

- Goal-Typen: Body Composition / Performance / Health / Lifestyle
- SMART Framework Validation (Specific, Measurable, Achievable, Relevant, Time-bound)
- AI-Realism Score: Ist das Ziel in der gewünschten Zeit erreichbar?
- Priority 1–10 + Primary Goal Flag (nur eines gleichzeitig)
- Achievement-Probability (0–100)

Code: `routes/goals.ts` · `goals.user_goals` · `GoalsView.tsx`

---

### 2. Goal Phase State Machine (7 Phasen)

Phase Engine — deterministische Regeln, kein AI.

Phasen: fat_loss | lean_bulk | maintenance | recomp | contest_prep | reverse_diet | expert_bb_annual

- Phase Parameter: Kaloriendefizit/-überschuss, Protein-Ziel, Max. Dauer
- Auto-Guards: z.B. "Kraftverlust >10% → Deficit reduzieren"
- Semi-Automatische Transitions: System empfiehlt, User bestätigt
- Exit Conditions: Zielgewicht erreicht / Max. Dauer / User-Request

Code: `routes/phases.ts` · `goals.goal_phases` · `PhaseManager.tsx`

---

### 3. Adaptive TDEE Engine (MacroFactor-inspiriert)

- Woche 1–2: Harris-Benedict / Mifflin-St Jeor + Activity Multiplier
- Ab Woche 2: Adaptive aus echten Daten (Intake ± ΔWeight × 7700)
- Exponential Moving Average (α = 0.3) für Smoothing
- Cross-Module Korrekturen: Training Load + Recovery Score
- Wöchentliche Auto-Adjustments (±100–200 kcal bei Abweichung)
- Gewicht als 7-Tage Moving Average (verhindert Frustration durch tägliche Schwankungen)

Code: `routes/tdee.ts` · `goals.tdee_settings` · `TDEECard.tsx` · `useTDEE.ts`

---

### 4. Cross-Module Progress Aggregation

Goals = Single Source of Truth für Gesamt-Fortschritt.

- Alle Module POST täglich ihre Contribution Scores an Goals
- Goals aggregiert gewichtet je nach Goal-Typ
- Bottleneck Identification: "Dein Schlaf limitiert aktuell am meisten"
- Overall Goal Progress % = gewichtetes Mittel aller Contributions

Code: `routes/contributions.ts` · `goals.goal_contributions` · `CrossModuleProgress.tsx`

---

### 5. Body Composition Tracker (Klassisch)

- Körperfett% mit Methoden-Auswahl (Caliper/DEXA/BIA/Visuell/Hydrostatisch)
- Muskelmasse auto-berechnet (Gewicht × (1 − KF%/100))
- FFMI auto-berechnet (Natürlicher Bereich: 18–25, Elite: 25+)
- BMI (informativ)
- 7-Tage Moving Average für Gewicht

13 Umfänge: Hals · Schultern · Brust · Oberarm L/R · Unterarm L/R · Taille · Hüfte · Oberschenkel L/R · Wade L/R

Automatische Ratios:
- Schulter-Taille-Ratio (Ziel: >1.618)
- V-Taper Score
- Arm-Symmetrie % · Bein-Symmetrie %
- Steve Reeves Proportions-Score

Code: `routes/measurements.ts` · `routes/circumferences.ts` · `goals.body_measurements` · `goals.body_circumferences`

---

### 6. Visual AI (Kamera-basiert)

Standardisierte Posen + Claude Vision Analyse.

3 Sets:
- **8 IFBB Mandatory Poses:** Front Double Biceps, Front Lat Spread, Side Chest L/R, Rear Double Biceps, Rear Lat Spread, Side Triceps L/R, Abdominal & Thigh, Most Muscular
- **4 Quarter Turns:** Front Relaxed, Right Side, Back Relaxed, Left Side
- **9 Detail Close-Ups:** Delts, Biceps, Triceps, Chest, Abs, Rücken, Quads, Hamstrings, Waden

Features:
- Silhouetten-Overlay auf Kamera (Pose-Anleitung)
- Timer 3/5/10s
- "Nochmal" / "Weiter" nach jedem Foto
- AI-Analyse (Muskel-Scores, Conditioning, Symmetrie)
- Side-by-Side Vergleich
- Slider Vorher/Nachher
- Photo-Filter (nach Pose, Datum, Muskelgruppe)

Code: `routes/photos.ts` · `goals.progress_photos` · `PhotoSession.tsx` · `PoseGuide.tsx`

---

### 7. Milestone System + Celebrations

- Automatische Milestones: 25%, 50%, 75%, 100%
- User-definierte Milestones (nach Wert oder Datum)
- Celebration-System (Coach + Buddy feiern Meilensteine)
- Sub-Goals für längere Ziele

Code: `routes/milestones.ts` · `goals.goal_milestones` · `MilestoneCelebration.tsx`

---

### 8. Achievement Prediction

- Goal-Achievement-Probability basierend auf aktueller Trajectory
- "Wenn du so weitermachst, erreichst du dein Ziel in X Wochen"
- Scenario-Modeling: "Wenn du Schlaf auf 7.5h verbesserst → 3 Wochen früher"

Code: `routes/predictions.ts` · `PredictionCard.tsx`

---

### 9. Weekly Report

- Wöchentlicher Fortschritts-Report
- Module-Contribution-Analyse (was hat am meisten beigetragen?)
- Bottleneck der Woche
- Nächste Woche Empfehlungen
- Vergleich mit Vorwoche

Code: `routes/weekly-report.ts` · `WeeklyReport.tsx`

---

### 10. Onboarding Flow (Goal Setup)

- Profil: Alter, Gewicht, Größe, KF%, Trainingserfahrung
- Goal-Typ wählen (8 Optionen inkl. Expert Annual)
- Parameter: Zielgewicht, Zeithorizont, Aggressivität
- Calculated Output: "Dein TDEE: 2.847 kcal → Ziel: 2.347 kcal → -0.5kg/Woche → 16 Wochen"
- Quick-Start Templates für häufige Ziele

Code: `routes/goals.ts` (onboarding) · `GoalOnboarding.tsx`

---

## Geplante Features

### Mittlere Priorität

| Feature | Beschreibung |
|---|---|
| Scenario Modeling UI | "Was wenn ich Schlaf auf 7.5h verbesser?" interaktiv |
| Goal Templates Library | Vorgefertigte Templates für häufige Ziele |
| Contest Prep Checklist | Peak Week Protokoll-Assistent |
| Wearable-TDEE Sync | Apple Health Schritte/Kalorien → TDEE Verfeinerung |

### Niedrige Priorität

| Feature | Beschreibung |
|---|---|
| Social Goals | Geteilte Ziele mit Coach oder Trainingspartner |
| Timelapse Generator | Automatischer Fortschritts-Film aus Fotos |
| Achievement Sharing | Meilensteine teilen |
