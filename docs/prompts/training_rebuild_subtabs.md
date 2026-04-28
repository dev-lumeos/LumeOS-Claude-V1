# Claude Code — Training Modul: Kompletter Rebuild mit 2-Level Navigation

## Problem

Das aktuelle Mockup hat für Training eine flache 7-Tab-Struktur.
Das alte Repo hatte **7 Primary Tabs mit je 2-5 Sub-Tabs** = ~35 Screen-States.
Damit fehlen aktuell ca. 70% des Modul-Contents.

## Schritt 1: Sub-Tab System in index.html einbauen

Öffne `apps/web/public/mockup/index.html`.

Im `<style>` Block ergänzen:
```css
/* Sub-Tab Navigation */
.subtab-nav { display:flex;gap:4px;padding:6px var(--layout-content-pad);
  border-bottom:1px solid var(--surface-border);overflow-x:auto;flex-shrink:0;
  background:var(--surface-card-alt);-ms-overflow-style:none;scrollbar-width:none }
.subtab-btn { display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:var(--r-md);
  cursor:pointer;font-size:11px;font-weight:var(--fw-medium);color:var(--text-tertiary);
  transition:var(--transition-fast);white-space:nowrap;user-select:none;background:transparent;border:none }
.subtab-btn:hover { color:var(--text-secondary);background:var(--surface-hover) }
.subtab-btn.active { background:var(--surface-card);color:var(--brand-700);
  box-shadow:inset 0 0 0 1px var(--surface-border) }
```

Im JavaScript-Teil: `switchTab` und `renderShell` erweitern:

```js
// Aktuellen Sub-Tab State pro Modul
const subTabState = {};

window.switchTab = function(idx) {
  activeTab = idx;
  // Sub-Tab zurücksetzen auf 0 wenn Primary Tab wechselt
  if (!subTabState[activeModule]) subTabState[activeModule] = {};
  subTabState[activeModule][idx] = subTabState[activeModule][idx] || 0;
  renderShell();
};

window.switchSubTab = function(idx) {
  if (!subTabState[activeModule]) subTabState[activeModule] = {};
  subTabState[activeModule][activeTab] = idx;
  renderShell();
};

function getActiveSubTab() {
  return (subTabState[activeModule] && subTabState[activeModule][activeTab]) || 0;
}

function renderShell() {
  const m = MODULES[activeModule];
  const subTab = getActiveSubTab();
  const subTabs = m.subTabs && m.subTabs[activeTab];

  let subTabNav = '';
  if (subTabs && subTabs.length > 1) {
    subTabNav = `<div class="subtab-nav">${
      subTabs.map((st, i) =>
        `<button class="subtab-btn${i === subTab ? ' active' : ''}" onclick="switchSubTab(${i})">${st}</button>`
      ).join('')
    }</div>`;
  }

  document.getElementById('main-area').innerHTML =
    window.renderModuleHeader(m) +
    window.renderTabNav(m, activeTab) +
    subTabNav +
    `<div class="content module-content">${m.render(activeTab, subTab)}</div>`;
}
```

## Schritt 2: Training MODULES-Eintrag in index.html ersetzen

```js
training: {
  icon: '🏋️', title: 'Training', gradient: 'g-training',
  desc: 'Push Day — Woche 18, Tag 3',
  kpis: [{val:'4',lbl:'Workouts 🏅'},{val:'12.400',lbl:'Volumen kg'},{val:'82%',lbl:'Adherenz'}],
  tabs: ['💪 Training', '📚 Übungen', '📊 Fortschritt', '🎯 Programme', '🧘 Erholung', '📈 Analytik', '⚙️ Einstellungen'],
  subTabs: {
    0: ['▶️ Starten', '📝 Quick Log', '📋 Vorlagen'],
    1: ['🔍 Durchsuchen', '🏷️ Kategorien'],
    2: ['📜 History', '📊 Stats', '📅 Kalender', '🧠 Insights'],
    3: ['💪 Meine Routinen', '🏋️ Coach Programme', '📅 Wochenplan', '📈 Periodisierung'],
    4: ['💤 Status', '🔥 Muskel-Map', '📐 Körper'],
    5: ['📊 Übersicht', '💪 Kraft', '📈 Volumen', '🏆 Rekorde', '🔧 Tools'],
    6: [],
  },
  render: (tab, subTab = 0) => window.renderTraining(tab, subTab),
},
```

## Schritt 3: features/training/index.js komplett neu schreiben

```js
window.renderTraining = function(tab, subTab) {
  subTab = subTab || 0;
  switch(tab) {
    case 0: // 💪 Training
      switch(subTab) {
        case 0: return window.Training_WorkoutStart();
        case 1: return window.Training_QuickLog();
        case 2: return window.Training_Templates();
        default: return '';
      }
    case 1: // 📚 Übungen
      switch(subTab) {
        case 0: return window.Training_ExerciseBrowse();
        case 1: return window.Training_ExerciseCategories();
        default: return '';
      }
    case 2: // 📊 Fortschritt
      switch(subTab) {
        case 0: return window.Training_HistoryView();
        case 1: return window.Training_StatsView();
        case 2: return window.Training_CalendarView();
        case 3: return window.Training_InsightsView();
        default: return '';
      }
    case 3: // 🎯 Programme
      switch(subTab) {
        case 0: return window.Training_RoutineList();
        case 1: return window.Training_CoachRoutines();
        case 2: return window.Training_ScheduleView();
        case 3: return window.Training_PeriodizationView();
        default: return '';
      }
    case 4: // 🧘 Erholung
      switch(subTab) {
        case 0: return window.Training_RecoveryIntel();
        case 1: return window.Training_MusclesView();
        case 2: return window.Training_BodyComposition();
        default: return '';
      }
    case 5: // 📈 Analytik
      switch(subTab) {
        case 0: return window.Training_AnalyticsOverview();
        case 1: return window.Training_StrengthView();
        case 2: return window.Training_VolumeView();
        case 3: return window.Training_RecordsView();
        case 4: return window.Training_ToolsView();
        default: return '';
      }
    case 6: return window.Training_SettingsView();
    default: return '';
  }
};
```

## Schritt 4: Neue View-Dateien anlegen (Script-Tags in index.html!)

### Neue Dateien die fehlen:

**`features/training/WorkoutStart.js`** — `window.Training_WorkoutStart`
Lies: `temp/lumeosold/apps/app/modules/training/components/RoutineList.tsx`
Zeigt: 3-4 Quick-Start Routine Cards (PPL Push / PPL Pull / PPL Legs / Cardio),
darunter "Leeres Training starten" Button, oben ein Gradient-Banner "Training starten".

**`features/training/QuickLog.js`** — `window.Training_QuickLog`
Lies: `temp/lumeosold/apps/app/modules/training/components/WorkoutLogger.tsx`
Zeigt: Übungssuche + Schnell-Set-Eingabe (Übung / Gewicht / Reps) ohne kompletten Workout-Flow.

**`features/training/Templates.js`** — `window.Training_Templates`
Lies: `temp/lumeosold/apps/app/modules/training/components/CoachTemplateBuilder.tsx`
Zeigt: Coach-erstellte Trainingsvorlagen, Source-Badges (Coach/Marketplace/AI), Assign-Flow.

**`features/training/ExerciseBrowse.js`** — `window.Training_ExerciseBrowse`
Lies: `temp/lumeosold/apps/app/modules/training/components/ExerciseSearch.tsx`
         `temp/lumeosold/apps/app/modules/training/data/exercises.ts`
Zeigt: Suchfeld, Kategorie-Chips (Brust/Rücken/Schulter/Beine/Arme/Core),
Liste mit Übungskarten (Name, Muskelgruppe, Equipment, Schwierigkeitsgrad).
Klick auf Karte → ExerciseDetail mit Ausführungs-Hinweis + Kraftstandards.

**`features/training/ExerciseCategories.js`** — `window.Training_ExerciseCategories`
Zeigt: Muskelgruppen-Grid mit Icon + Übungsanzahl. Klick zeigt gefilterte Liste.

**`features/training/StatsView.js`** — `window.Training_StatsView`
Lies: `temp/lumeosold/apps/app/modules/training/components/StatsView.tsx`
         `temp/lumeosold/apps/app/modules/training/components/WorkoutStreakTracker.tsx`
         `temp/lumeosold/apps/app/modules/training/components/SessionTonnageCard.tsx`
         `temp/lumeosold/apps/app/modules/training/components/MuscleBalanceRadar.tsx`
         `temp/lumeosold/apps/app/modules/training/components/TrainingSplitAnalyzer.tsx`
Zeigt: Monats-Volumen Balken, Streak-Tracker, Push/Pull/Legs Balance als Donut,
Tonnage-Trend, Split-Analyse.

**`features/training/InsightsView.js`** — `window.Training_InsightsView`
Lies: `temp/lumeosold/apps/app/modules/training/components/TrainingInsights.tsx`
         `temp/lumeosold/apps/app/modules/training/components/ProgressiveOverloadAdvisor.tsx`
Zeigt: AI-Insights Cards (Progression erkannt / Übertraining-Signal /
Muskelgruppen-Imbalance), ProgressiveOverload-Advisor mit konkreten Gewichts-Empfehlungen.

**`features/training/CoachRoutines.js`** — `window.Training_CoachRoutines`
Zeigt: Vom Coach zugewiesene Programme mit Status, Plan-Preview, Aktivierungs-Button.

**`features/training/ScheduleView.js`** — `window.Training_ScheduleView`
Lies: `temp/lumeosold/apps/app/modules/training/components/ScheduleView.tsx`
Zeigt: 7-Tage Wochenplan als Grid + Drag-Indikatoren, nächste 4 Wochen Vorschau.

**`features/training/PeriodizationView.js`** — `window.Training_PeriodizationView`
Lies: `temp/lumeosold/apps/app/modules/training/components/PeriodizationView.tsx`
Zeigt: Aktueller Mesozyklus (Block-Name, Woche X/Y), Phase-Timeline (Akkumulation
→ Intensivierung → Realisierung → Deload), Volumen-Verlauf Chart.

**`features/training/RecoveryIntel.js`** — `window.Training_RecoveryIntel`
Lies: `temp/lumeosold/apps/app/modules/training/components/RecoveryIntel.tsx`
Zeigt: Training-Readiness Score mit Breakdown (Recovery / Sleep / Soreness / Load / Mood),
Empfehlung für heute, Cross-Modul Inputs (HRV / Schlaf / Muskelkater).

**`features/training/BodyComposition.js`** — `window.Training_BodyComposition`
Lies: `temp/lumeosold/apps/app/modules/training/components/BodyComposition.tsx`
Zeigt: Körperfett % Trend, Muskelmasse-Schätzung, FFMI-Berechnung, Gewicht-Verlauf.

**`features/training/AnalyticsOverview.js`** — `window.Training_AnalyticsOverview`
Lies: `temp/lumeosold/apps/app/modules/training/components/AchievementBadges.tsx`
         `temp/lumeosold/apps/app/modules/training/components/WeeklyVolumeTrend.tsx`
         `temp/lumeosold/apps/app/modules/training/components/WorkoutStreakTracker.tsx`
         `temp/lumeosold/apps/app/modules/training/components/TrainingReadinessScore.tsx`
Zeigt: 4er Stats-Grid, Achievement Badges (5 Badges earned/locked), Weekly Volume
12-Wochen Trend, Streak Kalender.

**`features/training/StrengthView.js`** — `window.Training_StrengthView`
Lies: `temp/lumeosold/apps/app/modules/training/components/StrengthSparklines.tsx`
         `temp/lumeosold/apps/app/modules/training/components/StrengthStandards.tsx`
         `temp/lumeosold/apps/app/modules/training/components/WorkoutComparison.tsx`
Zeigt: Kraftkurven (Sparklines) für Big 4, Kraft-Standards Tabelle (Beginner/
Intermediate/Advanced/Elite), WorkoutComparison letzte Session.

**`features/training/VolumeView.js`** — `window.Training_VolumeView`
Lies: `temp/lumeosold/apps/app/modules/training/components/VolumeLandmarks.tsx`
         `temp/lumeosold/apps/app/modules/training/components/MuscleVolumeHeatmap.tsx`
         `temp/lumeosold/apps/app/modules/training/components/MuscleGroupCountdown.tsx`
         `temp/lumeosold/apps/app/modules/training/components/DeloadRecommender.tsx`
Zeigt: Volume Landmarks (MEV/MAV/MRV) pro Muskelgruppe als Balken mit Position-Marker,
Muskel-Volume Heatmap (4 Wochen), Countdown bis nächste Einheit pro Muskelgruppe.

**`features/training/RecordsView.js`** — `window.Training_RecordsView`
Lies: `temp/lumeosold/apps/app/modules/training/components/PersonalRecordsBoard.tsx`
         `temp/lumeosold/apps/app/modules/training/components/AchievementBadges.tsx`
Zeigt: PR Board (Top 8 PRs mit e1RM, Datum, Tier-Farbe 🟡🟠🔴),
Achievement Timeline, Meilenstein-Badges.

**`features/training/ToolsView.js`** — `window.Training_ToolsView`
Lies: `temp/lumeosold/apps/app/modules/training/components/OneRepMaxCalculator.tsx`
         `temp/lumeosold/apps/app/modules/training/components/WarmupCalculator.tsx`
         `temp/lumeosold/apps/app/modules/training/components/PlateCalculator.tsx`
Zeigt: 3 Calculator-Cards nebeneinander.
1RM-Rechner (Gewicht + Reps → e1RM nach Epley/Brzycki).
Aufwärm-Rechner (Zielgewicht → 5 Aufwärm-Sets mit % und Scheiben).
Scheiben-Rechner (Zielgewicht → welche Scheiben auflegen).

## Schritt 5: Bereits vorhandene Dateien NICHT neu schreiben

Diese Dateien sind gut und bleiben:
- `CalendarView.js` ✅ (CalendarView wird jetzt unter Fortschritt → Kalender angezeigt)
- `MusclesView.js` ✅ (wird unter Erholung → Muskel-Map angezeigt)
- `HistoryView.js` ✅ (wird unter Fortschritt → History angezeigt)
- `PlanView.js` ✅ (wird unter Programme → Wochenplan angezeigt, umbenennen auf ScheduleView falls nötig)
- `LiveWorkout.js` ✅ (wird unter Training → Starten geöffnet wenn Workout aktiv)
- `RoutineList.js` ✅ (wird unter Programme → Meine Routinen angezeigt)
- `SettingsView.js` ✅ (Tab 6, kein Sub-Tab)

## Schritt 6: Script-Tags in index.html

Für jede neue Datei einen Script-Tag hinzufügen:
```html
<script src="features/training/WorkoutStart.js"></script>
<script src="features/training/QuickLog.js"></script>
<script src="features/training/Templates.js"></script>
<script src="features/training/ExerciseBrowse.js"></script>
<script src="features/training/ExerciseCategories.js"></script>
<script src="features/training/StatsView.js"></script>
<script src="features/training/InsightsView.js"></script>
<script src="features/training/CoachRoutines.js"></script>
<script src="features/training/ScheduleView.js"></script>
<script src="features/training/PeriodizationView.js"></script>
<script src="features/training/RecoveryIntel.js"></script>
<script src="features/training/BodyComposition.js"></script>
<script src="features/training/AnalyticsOverview.js"></script>
<script src="features/training/StrengthView.js"></script>
<script src="features/training/VolumeView.js"></script>
<script src="features/training/RecordsView.js"></script>
<script src="features/training/ToolsView.js"></script>
```

## Reihenfolge

1. **ZUERST:** index.html — Sub-Tab CSS + JS + switchSubTab() einbauen + Training MODULES updaten
2. **DANN:** features/training/index.js — komplett neu schreiben
3. **DANN:** Neue View-Dateien (eine nach der anderen, immer erst Old Repo lesen)
4. **DANN:** Script-Tags in index.html eintragen
5. **TESTEN:** Browser öffnen, alle 7 Primary Tabs + alle Sub-Tabs durchklicken

## Qualitäts-Hinweis

Jede View muss aussehen wie ein echter Screen.
`ExerciseBrowse.js` — mindestens 8 Übungskarten mit echten Namen (Bankdrücken, Kniebeugen etc.)
`ToolsView.js` — alle 3 Rechner müssen interaktiv wirken (Eingabefelder sichtbar, Ergebnis angezeigt)
`PeriodizationView.js` — echte Phase-Namen, Wochen-Counter, visueller Timeline-Block

## Hinweis zum Sub-Tab System für andere Module

Dieselbe Sub-Tab Logik gilt später für Recovery, Coach, Goals wenn sie ebenfalls
tiefe Navigation brauchen. Das Sub-Tab System in index.html ist universell einsetzbar.
