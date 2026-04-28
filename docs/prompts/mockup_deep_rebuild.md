# Claude Code — LUMEOS Mockup Deep Rebuild

## Ausgangslage

Das aktuelle Mockup zeigt nur 20% von dem was das alte Repo hatte.
Der User hat das alte System gesehen und sagt: "da fehlt tonnenweise".

Du musst das alte Repo **wirklich lesen** — nicht raten.
Jede Datei die relevant ist, lies sie. Dann bau nach.

---

## Altes Repo — Fundstelle

```
temp/lumeosold/apps/app/modules/[modul]/components/
temp/lumeosold/apps/app/modules/[modul]/hooks/
```

---

## Was du PRO MODUL lesen und umsetzen musst

---

### 🍽️ NUTRITION — `features/nutrition/DiaryView.js`

**Lies zuerst:**
```
temp/lumeosold/apps/app/modules/nutrition/components/DiaryView.tsx
temp/lumeosold/apps/app/modules/nutrition/components/MacroRing.tsx
temp/lumeosold/apps/app/modules/nutrition/components/DaySummary.tsx
temp/lumeosold/apps/app/modules/nutrition/components/SmartMealEntry.tsx
temp/lumeosold/apps/app/modules/nutrition/components/GhostMealEntry.tsx
temp/lumeosold/apps/app/modules/nutrition/components/DeficitSuggestions.tsx
temp/lumeosold/apps/app/modules/nutrition/components/MicroDashboard.tsx
temp/lumeosold/apps/app/modules/nutrition/components/WaterTracker.tsx
temp/lumeosold/apps/app/modules/nutrition/components/WeightTracker.tsx
temp/lumeosold/apps/app/modules/nutrition/components/SmartSuggestions.tsx
temp/lumeosold/apps/app/modules/nutrition/components/StreakBadge.tsx
temp/lumeosold/apps/app/modules/nutrition/components/DateNavigation.tsx
temp/lumeosold/apps/app/modules/nutrition/components/RemainingBar.tsx
```

**Was gebaut werden muss:**

1. **DateNavigation oben** — ‹ Datum › mit Heute-Button, Wochentag anzeigen

2. **5 Mahlzeit-Slots** (nicht 3!) in dieser Reihenfolge:
   - 🌅 Frühstück (07:00)
   - 🍎 Snack 1 (10:00)
   - 🍽️ Mittagessen (12:00)
   - 🍌 Snack 2 (15:00)
   - 🌙 Abendessen (18:00)

   Jeder Slot hat **3 Zustände** je nach Situation:
   - **Logged**: grüne Border, Einträge listenweise mit kcal, "+ Hinzufügen" Link
   - **Ghost** (Mahlplan vorhanden, noch nicht bestätigt): gestrichelte Border, Plan-Items ausgegraut, Buttons: "Bestätigen ✓", "Anpassen ✏️", "MealCam 📷", "Überspringen"
   - **Smart Entry** (kein Plan): "Gleiche wie gestern", "Favoriten", "Suchen", "+ Manuell"

3. **MacroRing** — CSS conic-gradient Kreis mit P/KH/F Segmenten, Kcal in Mitte

4. **RemainingBar** — Verbleibende Makros als horizontale Fortschrittsleiste

5. **MicroDashboard** — Vitamine & Mineralien Sektion:
   - Vitamin A/C/D/B12, Calcium, Eisen, Zink als Mini-Bars
   - Ampel-Färbung: rot <70%, gelb 70-90%, grün >90%

6. **DeficitSuggestions** — "Du hast noch X kcal offen" mit konkreten Lebensmittel-Vorschlägen

7. **SmartSuggestions** — "Gleiche wie gestern", AI-Vorschlag für heutige Mahlzeit

8. **StreakBadge** — "🔥 12 Tage Protein-Streak" als Badge oben

9. **WeightTracker** mit Mini-Chart (letzte 7 Tage, CSS bars)

10. **WaterTracker** — Gläser-Visualisierung mit klickbaren Gläsern

---

### 🍽️ NUTRITION — `features/nutrition/InsightsView.js`

**Lies:**
```
temp/lumeosold/apps/app/modules/nutrition/components/InsightsView.tsx
temp/lumeosold/apps/app/modules/nutrition/components/MacroDashboard.tsx
temp/lumeosold/apps/app/modules/nutrition/components/MacroDetail.tsx
temp/lumeosold/apps/app/modules/nutrition/components/NutritionScoreCard.tsx
temp/lumeosold/apps/app/modules/nutrition/components/TrendAnalysis.tsx
temp/lumeosold/apps/app/modules/nutrition/components/CrossModuleInsights.tsx
temp/lumeosold/apps/app/modules/nutrition/components/NutrientHeatmap.tsx
```

**Was gebaut werden muss:**
- NutritionScoreCard — Gesamtscore 0-100 mit Breakdown
- MacroDashboard — Wochenübersicht mit Balken-Chart
- MacroDetail — Detailansicht pro Makro mit Quellen (Proteinquellen: Hähnchen 45%, Whey 22% etc.)
- TrendAnalysis — Kalorientrend Chart, Gewichtstrend
- CrossModuleInsights — Ernährung-Training Korrelation, Ernährung-Schlaf Korrelation
- NutrientHeatmap — Woche x Nährstoffe Grid

---

### 🏋️ TRAINING — Alle Views

**Lies zuerst:**
```
temp/lumeosold/apps/app/modules/training/components/TrainingView.new.tsx
temp/lumeosold/apps/app/modules/training/components/LiveWorkout.tsx
temp/lumeosold/apps/app/modules/training/components/WorkoutLogger.tsx
temp/lumeosold/apps/app/modules/training/components/SetRow.tsx
temp/lumeosold/apps/app/modules/training/components/MuscleMap.tsx
temp/lumeosold/apps/app/modules/training/components/MuscleFatigueHeatmap.tsx
temp/lumeosold/apps/app/modules/training/components/MuscleVolumeHeatmap.tsx
temp/lumeosold/apps/app/modules/training/components/PersonalRecordsBoard.tsx
temp/lumeosold/apps/app/modules/training/components/StatsView.tsx
temp/lumeosold/apps/app/modules/training/components/TrainingInsights.tsx
temp/lumeosold/apps/app/modules/training/components/WeeklyVolumeTrend.tsx
temp/lumeosold/apps/app/modules/training/components/WorkoutSummary.tsx
temp/lumeosold/apps/app/modules/training/components/ConsistencyHeatmap.tsx
temp/lumeosold/apps/app/modules/training/components/DeloadRecommender.tsx
temp/lumeosold/apps/app/modules/training/components/StrengthStandards.tsx
temp/lumeosold/apps/app/modules/training/components/PlateCalculator.tsx
temp/lumeosold/apps/app/modules/training/components/RestTimer.tsx
temp/lumeosold/apps/app/modules/training/components/WorkoutComparison.tsx
temp/lumeosold/apps/app/modules/training/components/AchievementBadges.tsx
temp/lumeosold/apps/app/modules/training/components/ProgressiveOverloadAdvisor.tsx
```

**HistoryView — ersetzen mit:**
- Letzte 5 Workouts als expandierbare Cards mit vollständigen Set-Logs
- WorkoutComparison — "vs. letztes Mal" für jede Übung (↑ +5kg, ↓ -1 Rep)
- WorkoutSummary — Tonnage, Volumen, Dauer, Intensität als Kennzahlen
- SessionTonnageCard — Totale Last als Highlights
- AchievementBadges — PR-Badges, Streak-Badges, Milestone-Badges

**CalendarView — erweitern mit:**
- ConsistencyHeatmap — 52-Wochen Jahresübersicht (wie GitHub)
- MuscleGroupCountdown — Wann welche Muskelgruppe zuletzt trainiert

**HistoryView NEUE SEKTION — StatsView:**
- WeeklyVolumeTrend — 12-Wochen Balken pro Muskelgruppe
- StrengthStandards — "Bankdrücken: Intermediate (1.0x BW)" Klassifikation
- PersonalRecordsBoard — Top 5 PRs mit Datum

**LiveWorkout — erweitern:**
- SetRow mit richtigen Set-States (done/current/upcoming)
- RestTimer als prominenter Countdown-Circle
- ProgressiveOverloadAdvisor — "+2.5kg heute möglich basierend auf letztem Mal"
- PostWorkoutFeedback nach Workout-Ende (Wie war's? Erschöpfung 1-10)

**Neue Tab: "Muskeln" (zwischen Kalender und History)**
- MuscleMap — SVG Körper-Silhouette (Vorder/Rückseite) mit Muskelgruppen eingefärbt
  - Farben: grün=erholt, gelb=leicht erschöpft, orange=mittel, rot=stark erschöpft
- MuscleFatigueHeatmap — Tabelle: Muskelgruppe | Letztes Training | Erschöpfung | Empfehlung
- MuscleReadinessWidget — "Heute empfohlen: Pull Day (Rücken 72h erholt)"
- DeloadRecommender — wenn nötig

---

### 😴 RECOVERY — Alle Views

**Lies:**
```
temp/lumeosold/apps/app/modules/recovery/components/RecoveryTodayView.tsx
temp/lumeosold/apps/app/modules/recovery/components/MorningCheckin.tsx
temp/lumeosold/apps/app/modules/recovery/components/RecoveryScoreCard.tsx
temp/lumeosold/apps/app/modules/recovery/components/SleepAnalyticsCard.tsx
temp/lumeosold/apps/app/modules/recovery/components/RecoveryMuscleMap.tsx
temp/lumeosold/apps/app/modules/recovery/components/RecoveryTrends.tsx
temp/lumeosold/apps/app/modules/recovery/components/OvertrainingAlert.tsx
temp/lumeosold/apps/app/modules/recovery/components/RecoveryPromptCard.tsx
```

**OverviewView — komplett neu:**
- MorningCheckin als erstes — Kurzform: "Wie schläfst du? Energie? Stimmung?" (1-5 Sterne je)
- RecoveryScoreCard — Score als großes Donut-Element, nicht nur ein Circle
- RecoveryPromptCard — AI Empfehlung basierend auf Score
- OvertrainingAlert — wenn Score <60 für 3 Tage: prominente Warnung
- Tagesstruktur: Checkin → Score → Schlaf-Summary → Empfehlung

**Neuer Tab: "Muskeln"**
- RecoveryMuscleMap — Körper-Silhouette mit Muskel-Recovery-Status
  - Jede Muskelgruppe eingefärbt nach Recovery-Status
  - Klick auf Muskel → Detail (letztes Training, Stunden seit Training, Readiness %)

**SleepView — erweitern:**
- SleepAnalyticsCard mit Schlaf-Effizienz, Konsistenz, REM-Anteil
- Schlaf-Coach Tipps basierend auf Daten
- Einschlaf/Aufwach-Pattern über 14 Tage

---

### 🤖 COACH — Alle Views

**Lies:**
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
temp/lumeosold/apps/app/modules/coach/components/NotificationBell.tsx
temp/lumeosold/apps/app/modules/coach/components/TrainingAdaptationCards.tsx
temp/lumeosold/apps/app/modules/coach/components/MessageBubble.tsx
```

**ChatInterface — tiefer ausbauen:**
- DailyBriefing als erstes Element im Chat (nicht Bubbles, sondern Card-Format)
- EveningSummary als letztes Element (abends)
- QuickActionBar unterhalb des Inputs — Schnellzugriff Buttons: "Mahlzeit loggen", "Training starten", "Wie war's?", "Was soll ich essen?"
- QuickCommands — Slash-Commands: /essen, /training, /report, /analyse
- TrainingAdaptationCards — nach Workout: "Soll ich das Volumen nächste Woche anpassen?"
- MessageBubble — verschiedene Bubble-Typen: AI, User, System, Warning

**DecisionFeed — tiefer:**
- BuddyDecisionFeed mit Kategorien: Ernährung, Training, Recovery, Supplements
- WatcherPanel — Was der Watcher gerade überwacht (aktive Rules)
- WatcherSummary — Zusammenfassung der Watcher-Aktivität

**Neuer Tab: "Watcher"**
- WatcherPanel — Liste aktiver Rules (wenn X dann Y)
  - "Wenn Recovery < 70 → Training-Volumen -20%"
  - "Wenn Protein < 140g → Abend-Reminder"
- CoachAutonomyConfig — Slider: "Coach darf selbstständig handeln" (0-100%)
- Watcher-Log: Was wurde heute automatisch ausgelöst

**TrendsView — tiefer:**
- InsightCards — mehrere AI-generierte Insight-Cards
- WeeklyReportView — formaler Wochenbericht
- Körper-Komposition Trend (Gewicht, KFA, Muskelmasse)

---

### 🎯 GOALS — Alle Views

**Lies:**
```
temp/lumeosold/apps/app/modules/goals/components/GoalsView.tsx
temp/lumeosold/apps/app/modules/goals/components/GoalForm.tsx
temp/lumeosold/apps/app/modules/goals/components/GoalsList.tsx
temp/lumeosold/apps/app/modules/goals/components/BodyCompositionView.tsx
temp/lumeosold/apps/app/modules/goals/components/CircumferenceEntry.tsx
temp/lumeosold/apps/app/modules/goals/components/RatiosCard.tsx
temp/lumeosold/apps/app/modules/goals/components/TrendCharts.tsx
temp/lumeosold/apps/app/modules/goals/components/MeasurementEntry.tsx
temp/lumeosold/apps/app/modules/goals/components/dashboard/  ← ganzes Verzeichnis
temp/lumeosold/apps/app/modules/goals/components/intelligence/ ← ganzes Verzeichnis
temp/lumeosold/apps/app/modules/goals/components/tracking/ ← ganzes Verzeichnis
temp/lumeosold/apps/app/modules/goals/components/visual/ ← ganzes Verzeichnis
```

**GoalsList — tiefer:**
- Vollständige Goal-Cards mit Progress-Indicator, Timeline, Sub-Goals
- "Ziel hinzufügen" Button mit Form
- GoalForm — Formular mit: Name, Typ (Gewicht/Kraft/Ausdauer/Körper), Zielwert, Deadline

**BodyCompositionView — komplett:**
- CircumferenceEntry mit allen Körperstellen: Taille, Hüfte, Brust, Ober-/Unterarm, Ober-/Unterschenkel, Schulter, Nacken
- RatiosCard — WHR (Taille/Hüfte), Schulter/Taille, FFMI
- BodyComposition Trend — Gewicht/KFA/Muskelmasse gestapelt

---

### 💊 SUPPLEMENTS — Alle Views

**Lies:**
```
temp/lumeosold/apps/app/modules/supplements/
```

Verzeichnis komplett scannen, dann:
- TodayView: Morgen/Mittag/Abend/Schlaf Protokoll (4 Tageszeiten)
- StackView: Kategorien (Vitamine/Mineralien/Performance/Adaptogene/Aminosäuren)
- Supplement-Karte pro Item: Name, Dosis, Timing, Wirkung, Evidenz-Level

---

### 📊 DASHBOARD — Alle Views

**Lies:**
```
temp/lumeosold/apps/app/modules/dashboard/
```

Verzeichnis komplett scannen, dann alle Dashboard-Komponenten nachbauen.

---

## Layout-Regel: 2-Spalten wo vorhanden

Das alte Repo hatte auf Desktop eine **2-Spalten-Layout** für manche Views.

```js
// Wenn ein View viel Content hat → 2-Spalten Layout
return `
  <div style="display:grid;grid-template-columns:1fr 320px;gap:16px;align-items:start">
    <div>
      <!-- Haupt-Content Links -->
    </div>
    <div>
      <!-- Sidebar-Widgets Rechts: Streak, Score, Quick Stats, AI-Tip -->
    </div>
  </div>
`;
```

**Rechte Spalte** (Sidebar-Widgets) für diese Views:
- Nutrition/DiaryView: Rechts → MacroRing groß, StreakBadge, SmartSuggestions, WeightTracker
- Training/HistoryView: Rechts → PersonalRecords, WeeklyVolume, DeloadRecommender
- Recovery/OverviewView: Rechts → RecoveryScore groß, Schlaf-Stats, Empfehlung
- Coach/ChatInterface: Rechts → QuickActions, WatcherStatus, TagesStats
- Goals/OverviewView: Rechts → Streak, AlignmentScore, Heute's Action

---

## Neue Tabs die komplett fehlen

**Training** → Tab "Muskeln" hinzufügen:
```js
// features/training/index.js — erweitern:
window.renderTraining = function(tab) {
  switch(tab) {
    case 0: return window.Training_CalendarView();
    case 1: return window.Training_MusclesView();   // NEU
    case 2: return window.Training_HistoryView();
    case 3: return window.Training_PlanView();
    case 4: return window.Training_LiveWorkout();
    case 5: return window.Training_RoutineList();
    default: return '';
  }
};
```

Neue Datei: `features/training/MusclesView.js`

**Recovery** → Tab "Muskeln" hinzufügen:
```js
// features/recovery/index.js — erweitern:
case 4: return window.Recovery_MusclesView();
```

Neue Datei: `features/recovery/MusclesView.js`

**Coach** → Tab "Watcher" hinzufügen:
```js
case 4: return window.Coach_WatcherView();
```

Neue Datei: `features/coach/WatcherView.js`

**Wenn neue Tabs hinzugefügt werden: index.html MUSS AUCH geupdated werden** (MODULES-Objekt dort hat die Tab-Namen)

---

## Tabs-Update in index.html

Wenn du neue Tabs hinzufügst, muss das MODULES-Objekt in index.html geupdated werden.

**Aktuell in index.html:**
```js
training: { tabs: ['📅 Kalender', '📜 History', '🗓️ Plan', '⚡ Live', '📚 Routinen'] }
recovery: { tabs: ['📊 Übersicht', '😴 Schlaf', '💓 HRV', '📝 Log'] }
coach:    { tabs: ['💬 Chat', '🧭 Entscheidungen', '📊 Trends', '🧠 Memory'] }
```

**Nach Update:**
```js
training: { tabs: ['📅 Kalender', '💪 Muskeln', '📜 History', '🗓️ Plan', '⚡ Live', '📚 Routinen'] }
recovery: { tabs: ['📊 Übersicht', '💪 Muskeln', '😴 Schlaf', '💓 HRV', '📝 Log'] }
coach:    { tabs: ['💬 Chat', '🧭 Entscheidungen', '📊 Trends', '🧠 Memory', '👁️ Watcher'] }
```

---

## Pflicht-Regeln

1. **Eine Datei pro Write** — kein Token-Limit
2. **Alle CSS vars** — niemals hardcoded
3. **Lies zuerst** — jede relevante Datei im alten Repo
4. **2-Spalten Layout** wo es sinnvoll ist (Desktop)
5. **Realistische Daten** — echte Werte, echte Strukturen
6. **CSS-only Charts** — kein Chart.js, kein Canvas
7. **Neue View-Dateien anlegen** für neue Tabs

## Reihenfolge

1. Nutrition/DiaryView.js — komplett neu (5 Slots, 2-Spalten, alle Widgets)
2. Training/MusclesView.js — neue Datei
3. Training/HistoryView.js — StatsView + WorkoutComparison
4. Recovery/OverviewView.js — MorningCheckin, PromptCard
5. Recovery/MusclesView.js — neue Datei
6. Coach/WatcherView.js — neue Datei
7. Coach/ChatInterface.js — DailyBriefing, QuickActions
8. Goals/OverviewView.js + BodyView.js — vollständiger
9. Nutrition/InsightsView.js — MacroDetail, CrossModule
10. index.html — Tabs updaten
11. index.js Dispatcher für neue Tabs updaten

## Test nach jedem Modul
```
file:///D:/GitHub/LumeOS-Claude-V1/apps/web/public/mockup/index.html
```
