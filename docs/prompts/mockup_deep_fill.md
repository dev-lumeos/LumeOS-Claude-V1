# Claude Code Prompt — LUMEOS Mockup Deep Fill

## Deine Aufgabe

Du arbeitest im Repo `D:\GitHub\LumeOS-Claude-V1`.

Das Mockup hat eine **vollständig modulare Struktur** die du verstehen musst bevor du anfängst.
Dann liest du das alte Repo gründlich und füllst die Views mit echtem Content.

---

## Die Struktur — lies das zuerst

```
apps/web/public/mockup/
  index.html                    ← Shell (NICHT anfassen)
  tokens.css                    ← Design Tokens (NICHT anfassen)
  components/shell/
    Sidebar.js                  ← window.renderSidebar()
    ModuleHeader.js             ← window.renderModuleHeader()
    TabNav.js                   ← window.renderTabNav()
  features/
    [modul]/
      index.js                  ← window.render[Modul](tab) — Dispatcher
      [ViewName].js             ← window.[Modul]_[ViewName]() — HIER füllst du ein
```

### Wie ein View-File funktioniert

Jede View-Datei hat genau diese Form:

```js
// features/nutrition/DiaryView.js
window.Nutrition_DiaryView = function() {
  return `...HTML mit CSS vars aus tokens.css...`;
};
```

**Du änderst NUR die View-Dateien** — index.js Dispatcher und Shell-Components bleiben unverändert.

### CSS Klassen die verfügbar sind (aus index.html `<style>`)

```
.card                    → weißes Card (border-radius, shadow)
.card-header             → flex space-between mit card-title + badge
.card-title              → fetter Titel
.card-grid               → 2-spaltig
.card-grid-3             → 3-spaltig
.data-row                → flex space-between mit border-bottom
.data-label / .data-val  → Label / Wert Paar
.progress-wrap           → Progress Bar Container
.progress-track / .progress-fill → Track + Fill
.stat-card               → grauer Hintergrund Card
.stat-val / .stat-lbl / .stat-delta → Kennzahl + Label + Trend
.badge badge-green/orange/blue/red/gray → Badges
.chat-area / .chat-msg-user / .chat-msg-ai → Chat
.chat-input-bar / .chat-input / .chat-send → Chat Input
.ai-card / .ai-card-title / .ai-card-text / .ai-actions / .ai-btn → AI Cards
.meal-item / .meal-dot / .meal-name / .meal-cal / .meal-macro → Mahlzeiten
.exercise-row / .ex-num / .ex-name / .ex-sets / .ex-weight → Übungen
.suppl-item / .suppl-check.done / .suppl-name / .suppl-dose → Supplements
.rs-circle / .rs-val / .rs-lbl → Recovery Score Circle
.goal-card → Ziel-Card
.delta-up / .delta-dn → Trend-Farben
.typing-dot → animierter Typing Dot
```

### CSS Variablen (aus tokens.css — IMMER nutzen, NIE hardcoden)

```css
/* Farben */
var(--brand-50/100/200/500/600/700)   → Grün-Töne
var(--surface-page/card/card-alt/hover/border/border-strong)
var(--text-primary/secondary/tertiary/muted/subtle)
var(--semantic-success/warning/danger/info-bg/text/border)
var(--accent-nutrition/training/coach/goals/supplements/recovery/medical/memory)

/* Gradients */
var(--gradient-dashboard/nutrition/training/coach/goals/supplements/recovery/medical/memory/analytics/marketplace/admin)

/* Spacing */
var(--space-1) bis var(--space-12)
var(--r-sm/md/lg/xl/full)   → Border Radius
var(--shadow-sm/md/lg)

/* Typography */
var(--font-sans/mono)
var(--text-micro/xs/sm/base/lg/xl/2xl/3xl/4xl)
var(--fw-normal/medium/semibold/bold)

/* KPI Tiles */
var(--kpi-tile-bg/border/text/label)
var(--kpi-text)   → weißer Text auf Gradient

/* Sonstiges */
var(--layout-content-pad)   → 24px
var(--transition-fast/colors/std)
```

---

## Altes Repo — hier suchst du

```
temp/lumeosold/apps/app/modules/          ← Alle alten Module-Komponenten
temp/lumeosold/apps/app/components/       ← Shared Components
temp/lumeosold/src/modules/               ← Weitere Module-Dateien
temp/lumeosold/apps/app/app/globals.css   ← CSS Patterns
```

**Wichtig:** Das alte Repo hat eine doppelte Struktur — Module sind sowohl in
`apps/app/modules/[modul]/` als auch in `src/modules/[modul]/` vorhanden.
Beide Orte lesen für vollständiges Bild.

---

## Was noch fehlt — geh tiefer

### NUTRITION — `temp/lumeosold/apps/app/modules/nutrition/`

**DiaryView** — bereits vorhanden, aber ausbaufähig:
- Mahlzeit-Expand: Klick auf Mahlzeit zeigt Nährwert-Details
- Pre-Workout Optimizer Card (wenn Training heute)
- Snack-Suggestions basierend auf verbliebenen Makros
- Kalorien-Ring (CSS-only, kein Canvas) oben als visuelle Zusammenfassung
- Lies: `SmartSuggestions.tsx`, `MealCard.tsx`, `PreWorkoutOptimizer.tsx`

**InsightsView** — bereits vorhanden, erweitern:
- `NutrientHeatmap` — eigene Sektion mit Wochentags-Vergleich
- Makro-Splitting Donut als CSS-Kreissegment
- Beste/schlechteste Tage der Woche
- Lies: `InsightsView.tsx`, `NutrientHeatmap.tsx`

**GoalsView** — bereits vorhanden, erweitern:
- Makro Cycling Config (Training vs. Rest Days unterschiedliche Makros)
- TDEE-Berechnung mit interaktivem Aktivitätsfaktor-Wähler
- Adaptive TDEE Sidebar Widget
- Lies: `GoalSelector.tsx`, `MacroCyclingConfig.tsx`, `AdaptiveTDEESidebar.tsx`

**HeatmapView** — bereits vorhanden, ist gut

---

### TRAINING — `temp/lumeosold/apps/app/modules/training/`

**CalendarView** — bereits vorhanden, erweitern:
- Workout-Typ-Filter (Push/Pull/Legs/Cardio)
- Wochendetail beim Klick auf Woche
- Volumen-Indikator pro Tag (Bubble-Größe)
- Lies: `CalendarView.tsx`, `ScheduleView.tsx`

**HistoryView** — bereits vorhanden, erweitern:
- Workout-Vergleich (dieses vs. letztes Mal)
- PR (Personal Record) Badge wenn neuer Rekord
- Lies: `WorkoutHistory.tsx`

**PlanView** — bereits vorhanden, gut

**LiveWorkout** — bereits vorhanden, erweitern:
- Rest Timer nach Set (Countdown)
- Vorheriger Satz als Referenz anzeigen
- Progression Hinweis (+2.5kg möglich)
- Lies: `LiveWorkout.tsx`

**RoutineList** — bereits vorhanden, erweitern:
- Routine-Preview beim Hover (erste 3 Übungen)
- Volumen-Schätzung
- Lies: `RoutineList.tsx`

---

### COACH — `temp/lumeosold/apps/app/modules/coach/`

**ChatInterface** — bereits vorhanden, gut
Verbessern: AI Buddy Avatar, BuddyFloatingWidget-Stil

**DecisionFeed** — bereits vorhanden, gut

**TrendsView** — bereits vorhanden, erweitern:
- BuddyTrends: Körper-Komposition Trend
- Health-Score Breakdown nach Kategorie (Schlaf 25%, Training 25%, Ernährung 25%, Recovery 25%)
- Lies: `BuddyTrends.tsx`, `TrendsView.tsx`

**MemoryView** — bereits vorhanden, erweitern:
- BuddyMemory: Zeitstrahl der letzten Einträge
- Kategorie-Tabs (Ziele / Training / Ernährung / Schlaf)
- Lies: `BuddyMemory.tsx`

---

### GOALS — `temp/lumeosold/apps/app/modules/goals/`

**OverviewView** — bereits vorhanden, erweitern:
- GoalProgressBanner: Große Fortschritts-Übersicht oben
- GoalStreakWidget: Visueller Streak-Counter
- GoalAlignmentCard: Module-Sync Indicator
- Lies: `GoalProgressBanner.tsx`, `GoalStreakWidget.tsx`, `GoalAlignmentCard.tsx`

**BodyView** — bereits vorhanden, erweitern:
- CircumferenceEntry: Richtige Eingabe-Form mit Körpersilhouette-Legende
- RatiosCard: Taille/Hüfte Ratio, Schulter/Taille Ratio
- Lies: `CircumferenceEntry.tsx`, `RatiosCard.tsx`

**TrendsView** — bereits vorhanden, gut

**IntelligenceView** — bereits vorhanden, erweitern:
- CrossModuleCorrelations aus Goals-Perspektive
- WeeklyReport: Mini-Wochenbericht für Ziele
- Lies: `CrossModuleCorrelations.tsx`, `WeeklyReport.tsx`

---

### SUPPLEMENTS — `temp/lumeosold/apps/app/modules/supplements/`

Alle drei Views sind gut. Kleine Verbesserungen:
- TodayView: Nächste Einnahme-Erinnerung (Countdown)
- StackView: Kategorie-Gruppen (Vitamine, Mineralien, Performance, Adaptogene)
- EnhancedView: Interaktions-Matrix zwischen den Supplements

---

### RECOVERY — `temp/lumeosold/apps/app/modules/recovery/`

Alle vier Views sind gut. Verbesserungen:
- OverviewView: Recovery-Trend 7 Tage (Score-Linie)
- SleepView: Schlaf-Effizienz % (Zeit im Bett vs. Schlafzeit)
- HRVView: Baseline-Berechnung erklären
- LogView: Korrelation von Log-Einträgen zu Schlaf/Performance

---

### DASHBOARD — `temp/lumeosold/apps/app/modules/dashboard/`

**TodayView** — bereits vorhanden, erweitern:
- MorningBriefing: Formatiertes Briefing mit Datum, Wetter-ähnlichem Layout
- HealthMomentum: Rollender 7-Tage Trend-Indikator
- PredictiveInsights: Was erwartet mich heute basierend auf gestern
- QuickWins: 3 konkrete Aktionen die heute den größten Impact haben
- Lies: `MorningBriefing.tsx`, `HealthMomentum.tsx`, `PredictiveInsights.tsx`, `QuickWins.tsx`

**InsightsView** — bereits vorhanden, erweitern:
- VirtualCoachInsights: AI Coach Summary in Dashboard-Format
- SmartFoodSuggestions: Food-Empfehlungen für heute
- Lies: `VirtualCoachInsights.tsx`, `SmartFoodSuggestions.tsx`

**IntelligenceView** — bereits vorhanden, gut

---

### MEDICAL, ANALYTICS, MARKETPLACE, ADMIN

Diese sind bereits auf gutem Level. Falls noch Zeit:
- Medical/LabsView: Trend-Pfeile für Laborwerte im Zeitverlauf
- Analytics/ChartsView: Tages-Aktivitätskurve zusätzlich zur Heatmap
- Admin/SettingsView: Notification-Einstellungen Sektion

---

## Regeln

### Nur CSS vars — niemals hardcoded Farben
```js
// ✅ Richtig
`style="color:var(--brand-700)"`
`style="background:var(--surface-card)"`

// ❌ Falsch  
`style="color:#15803d"`
`style="background:#ffffff"`
```

### Template Literals für HTML
```js
window.Module_ViewName = function() {
  const data = [...]; // Daten oben definieren
  return `
    <div class="card">
      ${data.map(item => `
        <div class="data-row">...</div>
      `).join('')}
    </div>
  `;
};
```

### Keine externen Libraries — Charts mit HTML/CSS
```js
// Balken-Chart
`<div style="display:flex;align-items:flex-end;height:60px;gap:3px">
  ${values.map(v => `
    <div style="flex:1;background:var(--brand-500);border-radius:2px 2px 0 0;height:${(v/max)*56}px"></div>
  `).join('')}
</div>`

// Progress Bar (bereits als CSS-Klasse)
`<div class="progress-track">
  <div class="progress-fill" style="width:${pct}%;background:var(--accent-nutrition)"></div>
</div>`
```

### Realistische Dummy-Daten
```js
// Gewicht: realistischer Abwärtstrend
const weights = [87.2, 87.0, 86.8, 86.5, 86.4, 86.1, 85.8, 85.6, 85.2];

// HRV: realistische Schwankungen
const hrv = [54, 58, 52, 61, 57, 63, 58, 55, 60, 59, 56, 62, 58, 61];

// Schlaf: realistisch
const sleep = [7.2, 6.8, 7.5, 8.1, 6.9, 7.4, 7.1];

// Supplement-Namen: echte Substanzen
const supplements = ['Vitamin D3+K2', 'Omega-3 EPA/DHA', 'Kreatin Monohydrat',
                     'Magnesium Glycinat', 'Ashwagandha KSM-66', 'Zink Bisglycinat'];
```

---

## Reihenfolge

Bearbeite die Dateien in dieser Priorität:

1. **Dashboard/TodayView.js** — MorningBriefing, HealthMomentum, PredictiveInsights, QuickWins
2. **Dashboard/InsightsView.js** — VirtualCoachInsights, SmartFoodSuggestions
3. **Nutrition/DiaryView.js** — Kalorien-Ring, Mahlzeit-Details, Pre-Workout Optimizer
4. **Nutrition/InsightsView.js** — Makro-Donut, Nährstoff-Heatmap
5. **Nutrition/GoalsView.js** — Makro Cycling, Adaptive TDEE
6. **Training/LiveWorkout.js** — Rest Timer, PR Badge, Progression Hint
7. **Training/CalendarView.js** — Workout-Filter, Volumen-Bubbles
8. **Goals/OverviewView.js** — ProgressBanner, StreakWidget, AlignmentCard
9. **Goals/BodyView.js** — Circumference Form, RatiosCard
10. **Coach/TrendsView.js** — Score Breakdown, Body Komposition
11. **Coach/MemoryView.js** — Zeitstrahl, Kategorie-Tabs

Dann nach Belieben die restlichen.

---

## Token-Limit vermeiden — PFLICHT

**Schreibe NIEMALS mehr als eine Datei pro Write-Operation.**
Jede Datei = ein separater Write.
Keine Datei darf >200 Zeilen haben — wenn nötig auf das Wesentliche reduzieren.

---

## Test

Nach jeder Datei kurz checken:
```
file:///D:/GitHub/LumeOS-Claude-V1/apps/web/public/mockup/index.html
```
Browser reload → Modul anklicken → Tab prüfen.

Falls Fehler in der Browser-Konsole → sofort fixen bevor weiter.
