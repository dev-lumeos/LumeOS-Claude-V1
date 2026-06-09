# SPEC_03 — Dashboard UI
> WebPlatform | Stand: Mai 2026 | Status: draft

---

## 1. Übersicht

Das Dashboard ist das Standard-Modul beim Login und zeigt den tagesaktuellen Cross-Module-Status.
Accent: `--acc-dash` (steel, oklch(0.78 0.04 240)).

**Operator-Frage:** "Was ist mein heutiger Status und was soll ich als Nächstes tun?"

---

## 2. Routing

```
/dashboard          — Dashboard-Hauptseite (kein Tab-System)
```

Kein Sub-Routing. Das Dashboard ist eine einzige scrollbare Seite (max. 1.5 Viewports).

---

## 3. Layout

```
┌───────────────────────────────────────────────────────┐
│ [Topbar: Dashboard | Datum]                           │
│                                                       │
│ KPI-Grid (4 Cards, 2×2)                               │
│ ─────────────────────────────────────────────────     │
│ Today Flow Timeline (Horizontal)                      │
│ ─────────────────────────────────────────────────     │
│ ┌────────────────────┐  ┌──────────────────────┐     │
│ │  Macros Today      │  │  Activity Feed        │     │
│ │  (Ring + Bars)     │  │  (letzte 5 Events)    │     │
│ └────────────────────┘  └──────────────────────┘     │
│ ─────────────────────────────────────────────────     │
│ ┌────────────────────┐  ┌──────────────────────┐     │
│ │  Readiness         │  │  Tonight's Plan       │     │
│ │  (Recovery+Score)  │  │  (Workout/Sleep)      │     │
│ └────────────────────┘  └──────────────────────┘     │
└───────────────────────────────────────────────────────┘
```

---

## 4. Komponenten

### KPI-Grid (4 Cards)

```tsx
<KpiGrid>
  <KpiCard
    label="Calories"
    value={1840}
    unit="kcal"
    target={2400}
    progress={0.77}
    sparkline={last7DayCalories}
    accent="var(--acc-nutri)"
  />
  <KpiCard
    label="Training Load"
    value={72}
    unit="% vol"
    trend="up"
    sparkline={last7DayVolume}
    accent="var(--acc-train)"
  />
  <KpiCard
    label="Recovery"
    value={82}
    unit="/ 100"
    trend="up"
    sparkline={last7DayRecovery}
    accent="var(--acc-recov)"
  />
  <KpiCard
    label="Supplements"
    value={3}
    unit="/ 5 taken"
    progress={0.60}
    accent="var(--acc-suppl)"
  />
</KpiGrid>
```

Jede KPI-Card: Großer Zahlenwert (Mono, 28px), Sparkline 7d, Trend-Pfeil optional.

### Today Flow Timeline (Horizontal)

Visualisiert den geplanten Tagesablauf als horizontale Timeline von 06:00 bis 23:00.
Blöcke mit Farb-Coding per Modul (Nutrition = Nutri-Accent, Training = Train-Accent, etc.).

```tsx
<TodayTimeline
  items={[
    { time: '08:00', type: 'meal', label: 'Breakfast', module: 'nutrition', status: 'done' },
    { time: '12:00', type: 'workout', label: 'Pull Day', module: 'training', status: 'upcoming' },
    { time: '16:00', type: 'supplement', label: 'Pre-Workout', module: 'supplements', status: 'upcoming' },
    { time: '22:00', type: 'sleep', label: 'Wind Down', module: 'recovery', status: 'planned' },
  ]}
  currentTime={now}
/>
```

Overflow: `hidden`, keine Scroll. Blöcke haben `max-width` und werden bei Überlappung skaliert.

### Macros Today (Ring + Bars)

```tsx
<MacroCard>
  <MacroRing
    calories={{ current: 1840, target: 2400 }}
    protein={{ current: 142, target: 180 }}
    carbs={{ current: 180, target: 240 }}
    fat={{ current: 52, target: 70 }}
  />
  <MacroBarList items={[...]} />
</MacroCard>
```

MacroRing: SVG Radial. Kalorien als äußerer Ring (grau/akzent), 3 Makros als innere Segmente.
MacroBarList: 4 Balken (Kalorien, Protein, Carbs, Fat) mit `current / target` als Text.

### Activity Feed

Letzte 5 Events Cross-Module. Chronologisch, neueste oben.

```tsx
<ActivityFeed items={[
  { time: '08:30', module: 'nutrition', text: 'Breakfast logged · 620 kcal' },
  { time: '07:15', module: 'recovery', text: 'Sleep logged · 7.2h · Score 82' },
  { time: 'Yesterday', module: 'training', text: 'Pull Day · 14 sets · 2 PRs' },
]} />
```

Modul-Accent-Dot links vom Text. Kein deep-link in V1 nötig.

### Readiness Composite

```tsx
<ReadinessCard>
  <ReadinessScore value={78} label="Readiness" />
  <ReadinessSub items={[
    { label: 'Sleep', value: 82 },
    { label: 'HRV', value: 74 },
    { label: 'Recovery', value: 78 },
  ]} />
  <ReadinessTrend data={last14DayReadiness} />
</ReadinessCard>
```

Score als große Zahl (Mono, 48px), farbcodiert: ≥80 grün, 60–79 amber, <60 rot.

### Tonight's Plan

Zeigt geplantes Training oder Recovery-Protokoll für heute Abend.

```tsx
<TonightPlan>
  {scheduledWorkout ? (
    <WorkoutPill workout={scheduledWorkout} />
  ) : (
    <RecoveryPill protocol="Rest Day" sleepGoal="22:30" />
  )}
  <PRWatch items={watchList} />
</TonightPlan>
```

---

## 5. Context Panel (Dashboard)

```tsx
CONTEXT_DATA.dashboard = {
  buddy: {
    state: 'idle',
    message: 'Guter Start. Pull Day wartet — letzte Woche 3 PRs.',
  },
  insights: [
    { type: 'warn', text: 'Protein 38g unter Ziel gestern' },
    { type: 'pos', text: 'Schlaf 3 Nächte ≥ 7.5h — Recovery-Trend positiv' },
    { type: 'info', text: 'Omega-3 Refill in 8 Tagen' },
  ],
  quickActions: [
    'Log Breakfast',
    'Start Workout',
    'Morning Check-In',
    'View Today Plan',
  ],
};
```

---

## 6. Data Fetching

```tsx
// Dashboard-Page: parallele Queries
const [
  kpiData,
  todayTimeline,
  activityFeed,
  readinessData,
] = await Promise.all([
  fetchDashboardKPIs(userId, today),
  fetchTodayTimeline(userId, today),
  fetchActivityFeed(userId, { limit: 5 }),
  fetchReadinessComposite(userId, today),
]);
```

Alle Queries via React Query, Cache-Time 5min, Revalidate on focus.

---

## 7. Empty States

| Zustand | Anzeige |
|---|---|
| Neue User ohne Daten | Onboarding-Prompt: "Start by logging your first meal" |
| Keine Trainingsplanung | "No workout planned — add one in Training" |
| Readiness fehlt | "Log sleep to see your readiness score" |

---

## 8. Acceptance Criteria

```
[ ] KPI-Grid zeigt 4 Cards mit Sparklines
[ ] Today Timeline überschreitet nie den Container (overflow: hidden)
[ ] MacroRing SVG rendert korrekt mit aktuellen Werten
[ ] Activity Feed zeigt max. 5 Items, neueste oben
[ ] Readiness Score farbcodiert (grün/amber/rot)
[ ] Context Panel zeigt 3 Insights + Quick-Actions
[ ] Dashboard lädt in < 2s (LCP-Ziel)
[ ] Keine Placeholder-Inhalte in Produktion — alle Empty States definiert
```
