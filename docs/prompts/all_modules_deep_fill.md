# Claude Code — LUMEOS Mockup: Alle Module Deep Fill

## Kontext

Das Mockup unter `apps/web/public/mockup/index.html` zeigt LUMEOS.
Nutrition wurde bereits ausgebaut. Jetzt alle anderen Module nach demselben Standard.

**Öffnen zum Testen:**
`file:///D:/GitHub/LumeOS-Claude-V1/apps/web/public/mockup/index.html`

---

## Das Vorgehen (für jedes Modul identisch)

1. **Spec lesen** — `docs/specs/[Modul]/SPEC_04_FEATURES.md` + `SPEC_10_COMPONENTS.md` + `SPEC_03_USER_FLOWS.md`
2. **Old Repo lesen** — `temp/lumeosold/apps/app/modules/[modul]/components/` — alle relevanten TSX-Dateien
3. **BrainstormDocs lesen** — `docs/BrainstormDocs/[Modul]/` für Vision + Strategie
4. **Bauen** — Views nach Spec + Old Repo, eine Datei pro Write

---

## Architektur-Entscheidungen die gelten

- **Jedes Modul hat einen Settings-Tab** — immer letzter Tab: `⚙️ Einstellungen`
- **2-Spalten-Layout** wo sinnvoll (Haupt-Content + rechte Sidebar mit KPIs/Score/Quick-Actions)
- **Nur CSS vars** aus tokens.css — niemals hardcoded Farben
- **CSS-only Charts** — kein Chart.js, kein Canvas
- **Realistische Dummy-Daten** — echte Werte, echte Namen, echte Strukturen
- **Eine Datei pro Write** — kein Token-Overflow

---

## SETTINGS TAB — Pattern für jedes Modul

```js
// features/[modul]/SettingsView.js
window.[Modul]_SettingsView = function() {
  return `
    <!-- Modul-spezifische Einstellungen -->
    <!-- Setup-Card wenn noch nicht konfiguriert -->
    <!-- Link zu globalen Profil-Einstellungen -->
  `;
};
```

**index.js und index.html** müssen pro Modul geupdated werden wenn Settings-Tab hinzukommt.

---

## MODUL-REIHENFOLGE

Bearbeite die Module in dieser Reihenfolge:

---

## 1. 🏋️ TRAINING

### Spec lesen
```
docs/specs/Training/SPEC_04_FEATURES.md
docs/specs/Training/SPEC_10_COMPONENTS.md
docs/specs/Training/SPEC_03_USER_FLOWS.md
docs/specs/Training/SPEC_09_SCORING.md
```

### Old Repo lesen
```
temp/lumeosold/apps/app/modules/training/components/TrainingView.new.tsx
temp/lumeosold/apps/app/modules/training/components/LiveWorkout.tsx
temp/lumeosold/apps/app/modules/training/components/SetRow.tsx
temp/lumeosold/apps/app/modules/training/components/WorkoutLogger.tsx
temp/lumeosold/apps/app/modules/training/components/MuscleMap.tsx
temp/lumeosold/apps/app/modules/training/components/MuscleFatigueHeatmap.tsx
temp/lumeosold/apps/app/modules/training/components/MuscleVolumeHeatmap.tsx
temp/lumeosold/apps/app/modules/training/components/PersonalRecordsBoard.tsx
temp/lumeosold/apps/app/modules/training/components/StatsView.tsx
temp/lumeosold/apps/app/modules/training/components/WeeklyVolumeTrend.tsx
temp/lumeosold/apps/app/modules/training/components/WorkoutComparison.tsx
temp/lumeosold/apps/app/modules/training/components/WorkoutSummary.tsx
temp/lumeosold/apps/app/modules/training/components/ConsistencyHeatmap.tsx
temp/lumeosold/apps/app/modules/training/components/DeloadRecommender.tsx
temp/lumeosold/apps/app/modules/training/components/StrengthStandards.tsx
temp/lumeosold/apps/app/modules/training/components/ProgressiveOverloadAdvisor.tsx
temp/lumeosold/apps/app/modules/training/components/RestTimer.tsx
temp/lumeosold/apps/app/modules/training/components/PlateCalculator.tsx
temp/lumeosold/apps/app/modules/training/components/AchievementBadges.tsx
temp/lumeosold/apps/app/modules/training/components/TrainingReadinessScore.tsx
temp/lumeosold/apps/app/modules/training/components/ScheduleView.tsx
```

### Views die gebaut/verbessert werden

**CalendarView.js** — Verbessern:
- ConsistencyHeatmap — 52-Wochen GitHub-Style Jahresübersicht
- Workout-Typ Filter (Push/Pull/Legs/Cardio/Rest)
- Volumen-Bubble pro Tag (S/M/L Punkt-Grösse)
- Klick auf Tag → Workout-Detail Popup

**MusclesView.js** — Vorhanden, tiefer ausbauen:
- MuscleMap — SVG Körper-Silhouette Vorder+Rückseite mit Farben
  (grün=erholt, gelb=leicht, orange=mittel, rot=stark erschöpft)
- MuscleFatigueHeatmap — Tabelle: Muskelgruppe | Letztes Training | Stunden erholt | Readiness %
- MuscleVolumeHeatmap — Volumen pro Muskelgruppe letzte 4 Wochen
- DeloadRecommender — Card wenn Volumen >3 Wochen steigt
- TrainingReadinessScore — Tages-Score basierend auf Recovery + letztem Training

**HistoryView.js** — Tiefer ausbauen:
- WorkoutComparison — vs. letztes Mal pro Übung (↑ +5kg, ↓ -1 Rep, = gleich)
- WorkoutSummary — Tonnage, Volumen, Dauer, Intensitäts-Score
- PersonalRecordsBoard — Top 5 PRs mit Datum und e1RM
- AchievementBadges — PR-Badges, Streak-Badges
- WeeklyVolumeTrend — 12-Wochen Balken pro Muskelgruppe
- StatsView — StrengthStandards (Bankdrücken: Intermediate 1.0×BW etc.)

**PlanView.js** — Verbessern:
- ScheduleView — Wochenplan mit Drag-Indikator
- Periodisierungs-Info (aktueller Block, Woche X/Y, nächste Deload)
- VolumeLandmarks pro Muskelgruppe (MEV/MAV/MRV Balken)

**LiveWorkout.js** — Tiefer ausbauen:
- SetRow — vollständige Set-States (done ✅ / current 🔲 / upcoming)
- RestTimer — prominenter Circle-Countdown nach jedem Set
- ProgressiveOverloadAdvisor — "+2.5kg heute möglich (letztes Mal: 3×8 @ 87.5kg)"
- PlateCalculator — welche Scheiben auflegen für gegebenes Gewicht
- PostWorkoutFeedback — nach letztem Set: Erschöpfung 1-10, RPE, Notiz

**RoutineList.js** — Verbessern:
- Routine-Preview beim Expand (erste 3 Übungen, Volumen-Schätzung)
- Kategorie-Chips (Push/Pull/Legs/Full Body/Cardio)

**SettingsView.js** — NEU:
- Equipment (Multi-Select: Gym/Home/Bodyweight/Bands/Kettlebell/Cables)
- Trainingsfrequenz (2-7 Tage/Woche)
- Bevorzugter Split (PPL/Upper-Lower/Full Body/Bro Split)
- Progression-Methode (Linear/DUP/Undulating)
- Einheiten (kg/lbs)
- PR-Berechnung (Epley/Brzycki Formel)
- Setup-Card wenn Training noch nicht konfiguriert

### Tabs nach Update
```js
training: { tabs: ['📅 Kalender', '💪 Muskeln', '📜 History', '🗓️ Plan', '⚡ Live', '📚 Routinen', '⚙️ Einstellungen'] }
```

---

## 2. 😴 RECOVERY

### Spec lesen
```
docs/specs/Recovery/SPEC_04_FEATURES.md
docs/specs/Recovery/SPEC_10_COMPONENTS.md
docs/specs/Recovery/SPEC_03_USER_FLOWS.md
docs/specs/Recovery/SPEC_09_SCORING.md
docs/specs/Recovery/SPEC_05_METRICS_ALGORITHMS.md
```

### Old Repo lesen
```
temp/lumeosold/apps/app/modules/recovery/components/RecoveryTodayView.tsx
temp/lumeosold/apps/app/modules/recovery/components/MorningCheckin.tsx
temp/lumeosold/apps/app/modules/recovery/components/RecoveryScoreCard.tsx
temp/lumeosold/apps/app/modules/recovery/components/SleepAnalyticsCard.tsx
temp/lumeosold/apps/app/modules/recovery/components/RecoveryMuscleMap.tsx
temp/lumeosold/apps/app/modules/recovery/components/RecoveryTrends.tsx
temp/lumeosold/apps/app/modules/recovery/components/OvertrainingAlert.tsx
temp/lumeosold/apps/app/modules/recovery/components/RecoveryPromptCard.tsx
temp/lumeosold/apps/app/modules/recovery/components/DiaryTabView.tsx
```

### Views die gebaut/verbessert werden

**OverviewView.js** — Komplett neu strukturieren:
- MorningCheckin ganz oben (5 Felder mit Stern-Rating 1-5):
  Schlafqualität / Energie / Stimmung / Muskelkater / Stress
- RecoveryScoreCard — großer Donut (CSS conic-gradient), Score + Kategorie
- RecoveryPromptCard — AI-Empfehlung ("Heute leichtes Training empfohlen")
- OvertrainingAlert — wenn Score <60 für 3+ Tage: rote Warning-Card
- 2-Spalten: Links Checkin+Score, Rechts Schlaf-Summary+Vitals

**MusclesView.js** — Vorhanden, tiefer ausbauen:
- RecoveryMuscleMap — Körper-Silhouette mit Recovery-% pro Muskelgruppe
- Klick auf Muskelgruppe → Detail (letztes Training, Stunden seit Training, Readiness)
- Sortier-Tabelle: Muskelgruppe | Status | Empfehlung

**SleepView.js** — Tiefer ausbauen:
- SleepAnalyticsCard — Schlaf-Effizienz %, REM-Anteil, Tiefschlaf-Anteil
- 14-Tage Einschlaf/Aufwach Konsistenz-Chart
- Schlaf-Coach Tipps basierend auf erkannten Mustern
- Wearable-Integration Status (Oura/Apple Health/Garmin)

**HRVView.js** — Verbessern:
- Baseline-Berechnung erklären (letzte 30T Ø)
- Ampel-Status mit Interpretation
- Korrelation HRV ↔ Training-Leistung

**LogView.js** — Verbessern:
- DiaryTabView — strukturiertes Recovery-Tagebuch
- Modalities (Sauna, Kältebad, Massage, Stretching, Foam Rolling)
- Korrelations-Hinweis ("An Tagen mit Sauna: HRV +8ms im Schnitt")

**SettingsView.js** — NEU:
- Schlaf-Ziel (Stunden, Einschlaf/Aufwach-Zeiten)
- Wearable-Integration (Oura/Apple Health/Garmin verknüpfen)
- Checkin-Erinnerung (Uhrzeit)
- HRV-Baseline Zeitraum (7/14/30/60 Tage)
- Muskel-Recovery Algorithmus (24h/48h/72h je nach Intensität)
- Setup-Card wenn Recovery noch nicht konfiguriert

### Tabs nach Update
```js
recovery: { tabs: ['📊 Übersicht', '💪 Muskeln', '😴 Schlaf', '💓 HRV', '📝 Log', '⚙️ Einstellungen'] }
```

---

## 3. 🤖 COACH (AI Buddy)

### Spec lesen
```
docs/specs/BuddyandAICoach/SPEC_04_FEATURES.md
docs/specs/BuddyandAICoach/SPEC_10_COMPONENTS.md
docs/specs/BuddyandAICoach/SPEC_03_USER_FLOWS.md
docs/specs/BuddyandAICoach/SPEC_05_ENGINES.md
```

### Old Repo lesen
```
temp/lumeosold/apps/app/modules/coach/components/ChatInterface.tsx
temp/lumeosold/apps/app/modules/coach/components/DailyBriefing.tsx
temp/lumeosold/apps/app/modules/coach/components/EveningSummary.tsx
temp/lumeosold/apps/app/modules/coach/components/QuickActionBar.tsx
temp/lumeosold/apps/app/modules/coach/components/QuickCommands.tsx
temp/lumeosold/apps/app/modules/coach/components/BuddyDecisionFeed.tsx
temp/lumeosold/apps/app/modules/coach/components/WatcherPanel.tsx
temp/lumeosold/apps/app/modules/coach/components/WatcherSummary.tsx
temp/lumeosold/apps/app/modules/coach/components/CoachAutonomyConfig.tsx
temp/lumeosold/apps/app/modules/coach/components/InsightCards.tsx
temp/lumeosold/apps/app/modules/coach/components/BuddyTrends.tsx
temp/lumeosold/apps/app/modules/coach/components/WeeklyReportView.tsx
temp/lumeosold/apps/app/modules/coach/components/TrainingAdaptationCards.tsx
temp/lumeosold/apps/app/modules/coach/components/MessageBubble.tsx
temp/lumeosold/apps/app/modules/coach/components/PersonaSelector.tsx
temp/lumeosold/apps/app/modules/coach/components/NotificationBell.tsx
```

### Views die gebaut/verbessert werden

**ChatInterface.js** — Tiefer ausbauen:
- DailyBriefing als erste Card oben (4 farbige Zeilen: Training/Ernährung/Recovery/Ziele)
- EveningSummary Card (abends sichtbar)
- MessageBubble Typen: user / ai / system / warning / ai-card
- QuickActionBar unter dem Input (6 Buttons: Mahlzeit loggen / Training starten / Wie war's? / Was essen? / Analysiere mich / Report)
- QuickCommands Hinweis: /essen /training /analyse /report /status
- TrainingAdaptationCard nach Workout: "Volumen diese Woche +8% — soll ich nächste Woche anpassen?"
- 2-Spalten: Links Chat-Verlauf, Rechts TagesStats + WatcherStatus

**DecisionFeed.js** — Tiefer ausbauen:
- BuddyDecisionFeed mit Kategorien-Filter (Alle/Ernährung/Training/Recovery/Supplements)
- Jede Entscheidung: Icon, Aktion, Begründung, Timestamp, Status (angenommen/ignoriert/abgelehnt)
- WatcherSummary — "Heute 3 Watcher aktiv, 1 ausgelöst"

**TrendsView.js** — Tiefer ausbauen:
- Health Score 4-Säulen-Breakdown (Schlaf 25%/Training 25%/Ernährung 25%/Recovery 25%) mit Progress Bars
- InsightCards — 3-4 AI-generierte Insight-Cards (Muster, Korrelationen, Empfehlungen)
- WeeklyReportView — Formaler Wochenbericht
- BuddyTrends — Körper-Komposition 30T Trend

**MemoryView.js** — Tiefer ausbauen:
- Kategorie-Tabs (Alle / Ziele / Training / Ernährung / Schlaf / Körper)
- Zeitstrahl der letzten 5 Einträge mit Timestamp
- Memory-Qualität Indikator ("47 Einträge · zuletzt aktualisiert heute 06:42")

**WatcherView.js** — Vorhanden, tiefer ausbauen:
- WatcherPanel — IF→THEN Regeln als Cards:
  "Wenn Recovery < 70 → Training-Volumen -20%"
  "Wenn Protein < 140g nach 20:00 → Abend-Reminder"
- CoachAutonomyConfig — Slider 0-100%: "Coach handelt selbstständig"
- Autonomie-Kategorien einzeln: Ernährung / Training / Supplements / Pläne
- Watcher-Log: Was wurde heute automatisch ausgelöst (mit Uhrzeit)

**SettingsView.js** — NEU:
- PersonaSelector (Buddy-Persönlichkeit: Motivierend/Analytisch/Freundlich/Direkt)
- Sprache des Coaches (DE/EN/TH)
- Notification-Zeiten (Morgen-Briefing / Abend-Summary / Reminder)
- Autonomie-Default (Low/Medium/High)
- Memory-Verwaltung (Reset / Export)
- Datenschutz: Was darf Buddy speichern

### Tabs nach Update
```js
coach: { tabs: ['💬 Chat', '🧭 Entscheidungen', '📊 Trends', '🧠 Memory', '👁️ Watcher', '⚙️ Einstellungen'] }
```

---

## 4. 🎯 GOALS

### Spec lesen
```
docs/specs/Goals/SPEC_04_FEATURES.md
docs/specs/Goals/SPEC_10_COMPONENTS.md
docs/specs/Goals/SPEC_03_USER_FLOWS.md
docs/specs/Goals/SPEC_09_SCORING.md
```

### Old Repo lesen
```
temp/lumeosold/apps/app/modules/goals/components/GoalsView.tsx
temp/lumeosold/apps/app/modules/goals/components/GoalsList.tsx
temp/lumeosold/apps/app/modules/goals/components/GoalForm.tsx
temp/lumeosold/apps/app/modules/goals/components/BodyCompositionView.tsx
temp/lumeosold/apps/app/modules/goals/components/CircumferenceEntry.tsx
temp/lumeosold/apps/app/modules/goals/components/RatiosCard.tsx
temp/lumeosold/apps/app/modules/goals/components/TrendCharts.tsx
temp/lumeosold/apps/app/modules/goals/components/MeasurementEntry.tsx
temp/lumeosold/apps/app/modules/goals/components/dashboard/
temp/lumeosold/apps/app/modules/goals/components/intelligence/
temp/lumeosold/apps/app/modules/goals/components/tracking/
temp/lumeosold/apps/app/modules/goals/components/visual/
```

### Views die gebaut/verbessert werden

**OverviewView.js** — Tiefer ausbauen:
- GoalsList — vollständige Goal-Cards mit Progress, Timeline, Sub-Goals, Status-Badge
- GoalForm Teaser — "+ Neues Ziel" Button mit Formular-Vorschau
- GoalProgressBanner — großer Fortschritts-Header mit Gesamt-Alignment %
- GoalStreakWidget — visueller Streak-Counter (14-Punkte Grid)
- GoalAlignmentCard — 5 Module mit Sync-Status (✅ Training aligned / ⚠️ Ernährung leicht off)
- 2-Spalten: Links Goals-Liste, Rechts Streak+Alignment+QuickStats

**BodyView.js** — Tiefer ausbauen:
- CircumferenceEntry — 8 Körperstellen (Taille/Hüfte/Brust/OA/UA/OS/US/Schulter)
- RatiosCard — WHR (Taille/Hüfte), Schulter/Taille Ratio, FFMI berechnet
- Körper-Komposition Trend — Gewicht/KFA/Muskelmasse gestapelt
- MeasurementEntry — Datum + Wert Input mit History darunter

**TrendsView.js** — Verbessern:
- TrendCharts — mehrere Metriken wählbar (Gewicht/KFA/Kraft/Ausdauer)
- Ziel-Trajectory — Projektion: "Bei aktuellem Tempo: Ziel erreicht am 15. Juni"
- Vergleich: Plan vs. Actual Linie

**IntelligenceView.js** — Verbessern:
- CrossModuleCorrelations aus Goals-Perspektive
- Goal Alignment Score Breakdown pro Modul mit Erklärung
- WeeklyReport — formaler Wochenbericht für Ziele

**SettingsView.js** — NEU:
- TDEE-Methode (Mifflin-St Jeor / Harris-Benedict / Katch-McArdle)
- Aktivitätslevel (Sedentary/Lightly/Moderately/Very/Extra Active)
- Makro-Splits anpassen (Protein/Carbs/Fat %)
- Ziel-Phase (Cut/Bulk/Maintain/Recomp/Prep)
- Gewicht täglich tracken (Toggle + Uhrzeit)
- KFA-Messmethode (Caliper/DEXA/Navy/Visuelle Schätzung)
- Wasserintake Berechnung (automatisch aus Gewicht oder manuell)

### Tabs nach Update
```js
goals: { tabs: ['🎯 Übersicht', '📉 Körper', '📈 Trends', '🧠 Intelligenz', '⚙️ Einstellungen'] }
```

---

## 5. 💊 SUPPLEMENTS

### Spec lesen
```
docs/specs/Supplements/SPEC_04_FEATURES.md
docs/specs/Supplements/SPEC_10_COMPONENTS.md
docs/specs/Supplements/SPEC_03_USER_FLOWS.md
docs/BrainstormDocs/Supplements/supplement-evidence-tiers.md
docs/BrainstormDocs/Supplements/compound-taxonomy.md
```

### Old Repo lesen
```
temp/lumeosold/apps/app/modules/supplements/
```
Ganzes Verzeichnis scannen — alle relevanten Component-Dateien lesen.

### Views die gebaut/verbessert werden

**TodayView.js** — Tiefer ausbauen:
- 4 Tageszeiten: Morgen / Mittag / Abend / Schlaf als eigene Sektionen
- Supplement-Items mit Checkbox (done/pending)
- Nächste Einnahme Countdown ("Magnesium in 2h")
- Adherenz-Streak prominent oben
- Tages-Kosten Anzeige ("Heute: ~€1.85")
- Supplement ↔ Nutrition Gap Check ("Vitamin D: Food liefert 26% — Supplement wichtig")

**StackView.js** — Tiefer ausbauen:
- Kategorien-Gruppen (Vitamine / Mineralien / Aminosäuren / Performance / Adaptogene / Sonstiges)
- Pro Item: Name, Dosis, Timing, Kategorie-Badge, Evidenz-Level Emoji (🟢🟡🔴)
- Stack-Kosten Gesamt (€/Monat)
- Interaktions-Warnungen zwischen Items (⚠️ Eisen + Calcium: zeitlich trennen)

**EnhancedView.js** — Tiefer ausbauen:
- Pro Supplement: Vollständiges Detail-Panel
  - Wirkmechanismus
  - Evidenz-Übersicht mit Studien-Anzahl
  - Optimale Dosierung + Einnahmezeitpunkt
  - Synergien (+ Vitamin K2 verstärkt Vitamin D3)
  - Interaktionen (⚠️ Zink hemmt Eisenabsorption)
  - Biologische Halbwertszeit

**SettingsView.js** — NEU:
- Stack konfigurieren (Supplements hinzufügen/entfernen)
- Reminder-Zeiten pro Supplement
- Evidenz-Anzeige-Level (Basis/Erweitert/Wissenschaftlich)
- Budget-Limit (€/Monat Warnung)
- Supplement ↔ Nutrition Integration (Gap-Detection an/aus)
- Setup-Card wenn Stack leer

### Tabs nach Update
```js
supplements: { tabs: ['☀️ Heute', '🧪 Stack', '🔬 Enhanced', '⚙️ Einstellungen'] }
```

---

## 6. 🩺 MEDICAL

### Spec lesen
```
docs/specs/Medical/SPEC_04_FEATURES.md
docs/specs/Medical/SPEC_10_COMPONENTS.md
docs/specs/Medical/SPEC_05_BIOMARKER_CATALOG.md
docs/BrainstormDocs/Medical/micronutrient-reference.md
```

### Old Repo lesen
```
temp/lumeosold/apps/app/modules/medical/
```
Ganzes Verzeichnis scannen.

### Views die gebaut/verbessert werden

**OverviewView.js** — Tiefer ausbauen:
- Gesundheitsstatus-Grid (Herz/Blut/Hormone/Schilddrüse/Leber/Niere) mit Ampeln
- Checkup-Timeline (letzte + nächste geplante)
- Aktuelle Medikamente/Therapien Widget
- Medical Alerts (wenn Laborwerte kritisch)

**LabsView.js** — Tiefer ausbauen:
- Laborwerte nach Kategorien (Blutbild / Hormone / Stoffwechsel / Vitamine / Mineralien)
- Trend-Pfeile: ↑ ↓ = vs. letzter Messung
- Referenzbereich als Balken (wo liegt der Wert im Range?)
- "Teilen mit Arzt" Button (Mockup only)
- Import-Option (Labor-PDF hochladen)

**MedicationsView.js** — Tiefer ausbauen:
- Aktive Medikamente + Supplements in einer Ansicht
- Wechselwirkungen zwischen Medikamenten und Supplements (Warning)
- Einnahme-Tracking (gleich wie Supplements TodayView)

**SettingsView.js** — NEU:
- Einheiten (mmol/L vs. mg/dL für Glucose, Cholesterin etc.)
- Referenzbereiche (Standard vs. Optimal vs. Athleten)
- Arzt-Profil (Name, Kontakt)
- Erinnerung Checkup-Intervall
- Medical History Privacy (was ist für Coach sichtbar)

### Tabs nach Update
```js
medical: { tabs: ['📋 Übersicht', '🧪 Laborwerte', '💉 Medikamente', '⚙️ Einstellungen'] }
```

---

## 7. 🧠 INTELLIGENCE

### Spec lesen
```
docs/specs/ — prüfen ob Intelligence-Spec vorhanden
docs/BrainstormDocs/Core/interaction-matrix.md
```

### Views die gebaut/verbessert werden

**CorrelationsView.js** — Tiefer ausbauen:
- Top 10 Korrelationen nach Stärke sortiert
- Positive (grün) + Negative (rot) klar getrennt
- r-Wert Balken-Visualisierung
- Zeitraum-Filter (7T/30T/90T)
- "Neu entdeckt" Badge für frische Korrelationen

**PatternsView.js** — Tiefer ausbauen:
- Muster nach Kategorie (Wochentag-Muster / Schlaf-Muster / Ernährungs-Muster)
- Konfidenz-Balken pro Muster
- Häufigkeit + Zeitraum

**AlertsView.js** — Tiefer ausbauen:
- Alerts nach Priorität (Hoch/Mittel/Niedrig) mit farbiger Border
- Handlungsempfehlung pro Alert
- "Erledigt" / "Ignorieren" Actions

**SettingsView.js** — NEU:
- Minimum Korrelations-Zeitraum (7/14/30/60/90 Tage)
- Alert-Schwellen konfigurieren
- Welche Datenquellen fliessen in Intelligence (alle Module togglebar)

### Tabs nach Update
```js
intelligence: { tabs: ['🔗 Korrelationen', '📊 Patterns', '🚨 Alerts', '⚙️ Einstellungen'] }
```

---

## 8. 📊 DASHBOARD

### Old Repo lesen
```
temp/lumeosold/apps/app/modules/dashboard/
```
Ganzes Verzeichnis scannen.

### Views die gebaut/verbessert werden

**TodayView.js** — Tiefer ausbauen:
- MorningBriefing als formatierter Header (Datum, Wetter-ähnliches Layout)
- HealthMomentum — rollender 7-Tage Trend-Indikator (↑ Verbessernd / → Stabil / ↓ Rückgang)
- PredictiveInsights — 3 AI-Predictions: "Basierend auf gestern: Training heute optimal"
- QuickWins — 3 konkrete Aktionen mit Impact-Score
- Module-Scores Grid (alle aktiven Module mit Score/Status)
- Cross-Module Alert Banner wenn kritische Alerts aktiv

**InsightsView.js** — Tiefer ausbauen:
- VirtualCoachInsights — AI Coach Summary im Dashboard-Format (nicht Chat)
- SmartFoodSuggestions — 3 konkrete Food-Empfehlungen für heute
- Wochenbericht-Teaser mit Link zu Coach

**IntelligenceView.js** — Verbessern:
- Stärkste Korrelationen dieser Woche
- Neu entdeckte Muster
- Aktive Alerts Cross-Summary

**SettingsView.js** — NEU:
- Dashboard-Layout (welche Module zeigen)
- KPI-Auswahl pro Module-Card
- Briefing-Uhrzeit
- Standard-Ansicht (Heute/Insights/Intelligence)

### Tabs nach Update
```js
dashboard: { tabs: ['🏠 Heute', '🔮 Insights', '🧠 Intelligence', '⚙️ Einstellungen'] }
```

---

## NACH ALLEN MODULEN: index.html updaten

Alle neuen Script-Tags + alle aktualisierten Tab-Listen im MODULES-Objekt.

Pattern für jeden neuen SettingsView:
```html
<script src="features/[modul]/SettingsView.js"></script>
```

---

## QUALITÄTS-STANDARD

Jede View soll so aussehen wie ein echter Prototyp — nicht wie ein Placeholder.
Konkrete Werte, echte Namen, realistische Daten.

Schlechtes Beispiel:
```js
return `<div>Training History kommt hier</div>`;
```

Gutes Beispiel:
```js
return `
  <div class="card">
    <div class="card-header">
      <div class="card-title">Push Day — 26. Apr 2026</div>
      <div class="badge badge-green">58 min · 11.240 kg</div>
    </div>
    <div class="exercise-row">
      <div class="ex-num">1</div>
      <div class="ex-name">Bankdrücken</div>
      <div class="ex-sets">4×8</div>
      <div class="ex-weight">↑ 90 kg <span style="color:var(--brand-700)">+2.5kg</span></div>
    </div>
    ...
  </div>
`;
```

---

## REIHENFOLGE INNERHALB JEDES MODULS

1. Specs + Old Repo lesen (ZUERST — kein Schreiben vorher)
2. SettingsView.js — neue Datei
3. Bestehende Views verbessern (eine nach der anderen)
4. features/[modul]/index.js — Settings-Tab hinzufügen
5. Browser testen nach jedem Modul

Dann nächstes Modul.
