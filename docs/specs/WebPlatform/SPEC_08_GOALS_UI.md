# SPEC_08 — Goals & Body UI
> WebPlatform | Stand: Mai 2026 | Status: draft
> Referenz: docs/specs/Goals/ (Backend-Spec)

---

## 1. Übersicht

Zusammengeführtes Modul: Goals (Ziel-Tracking) + Body (Körperdaten, Körperfett, Maße).
Accent: `--acc-goals` (mustard, oklch(0.80 0.10 95)).

---

## 2. Routing

```
/goals                 — Goals + Body (alle Tabs auf einer Route)
```

---

## 3. Tabs

| Tab | Inhalt |
|---|---|
| Goals | Aktive Ziele als Cards, Progress-Bars |
| Timeline | Gantt-ähnliche Ziel-Timeline |
| Body Metrics | Gewicht-Chart, Körperfett, Muskelmasse |
| Measurements | Körpermaße-Tabelle, Foto-Progression |
| Composition | FFMI / BMI / BMR / TDEE Kalkulator |

---

## 4. Goals (Tab 1)

### Layout

```
[Goal Cards Grid — 2 Spalten]
[+ New Goal Button]
```

### Goal Card

```tsx
<GoalCard goal={goal}>
  <GoalHeader>
    <GoalName>{goal.name}</GoalName>
    <GoalType badge>{goal.type}</GoalType>         // Weight / Strength / BF% / Custom
    <GoalAccent color={goal.accent} />
  </GoalHeader>

  <GoalProgress
    current={goal.current}
    target={goal.target}
    unit={goal.unit}
    startValue={goal.startValue}
    pct={goal.progressPct}
  />

  <GoalMeta deadline={goal.deadline} daysLeft={daysLeft} />

  <LinkedModules modules={goal.linkedModules} />    // Pills: nutrition, training, ...

  <GoalActions>
    <EditButton />
    <LogProgressButton />
  </GoalActions>
</GoalCard>
```

### Goal Creator Modal

```tsx
<GoalCreatorModal>
  <GoalTypeSelect options={[
    'Gewicht', 'Körperfett', 'Muskelmasse',
    'Kraft (e1RM)', 'Performance', 'Custom',
  ]} />
  <GoalNameInput />
  <StartValueInput unit={selectedUnit} />
  <TargetValueInput unit={selectedUnit} />
  <DeadlinePicker />
  <LinkedModulesPicker />
  <MilestoneEditor />
  <SaveButton />
</GoalCreatorModal>
```

---

## 5. Timeline (Tab 2)

Gantt-ähnliche horizontale Timeline aller aktiven Ziele.

```tsx
<GoalTimeline>
  <TimelineHeader months={next12Months} currentMonth={now} />
  <TimelineRows>
    {goals.map(goal => (
      <TimelineRow key={goal.id}>
        <GoalLabel>{goal.name}</GoalLabel>
        <TimelineBar
          start={goal.startDate}
          end={goal.deadline}
          progress={goal.progressPct}
          color={goal.accent}
        />
        {goal.milestones.map(m => (
          <MilestoneDot date={m.date} label={m.name} achieved={m.achieved} />
        ))}
      </TimelineRow>
    ))}
  </TimelineRows>
</GoalTimeline>
```

---

## 6. Body Metrics (Tab 3)

### Gewicht-Chart

```tsx
<WeightChart data={last90Days}>
  {/* Recharts LineChart */}
  {/* Datenpunkte: täglich, wenn vorhanden */}
  {/* Trendlinie: 7d Gleitender Durchschnitt */}
  {/* Goal-Linie: gestrichelt */}
</WeightChart>
```

Quick-Log-Button über dem Chart: "Log Weight" → kleines Inline-Input.

### Körperfett & Muskelmasse

```tsx
<BodyCompositionTrend>
  <TrendChart
    series={[
      { label: 'Body Fat %', data: bfData, color: 'var(--neg)' },
      { label: 'Lean Mass kg', data: leanData, color: 'var(--pos)' },
    ]}
    weeks={12}
  />
</BodyCompositionTrend>
```

---

## 7. Measurements (Tab 4)

### Körpermaße-Tabelle

```
Maß             Aktuell   Letzter Monat   Veränderung
Brust           105 cm    104 cm          +1 cm
Taille           82 cm     83 cm          -1 cm
Hüfte            99 cm     99 cm           0 cm
Oberarm (L)      42 cm     41 cm          +1 cm
Oberschenkel     62 cm     61 cm          +1 cm
Wade             42 cm     41 cm          +1 cm
```

"Log Measurements"-Button → Measurements Log Modal.

### Foto-Progression

```tsx
<PhotoProgression>
  <PhotoSlot label="Front" date={latestFrontDate}>
    {latestFrontPhoto ? (
      <PhotoThumb src={latestFrontPhoto} />
    ) : (
      <PhotoPlaceholder label="No front photo yet" onAdd={openPhotoUpload} />
    )}
  </PhotoSlot>
  <PhotoSlot label="Side" ... />
  <PhotoSlot label="Back" ... />
  <PhotoTimeline photos={allPhotos} view="side-by-side" />
</PhotoProgression>
```

Fotos sind privat (HIPAA-sensitiv), nie sichtbar für Coaches ohne explizite Permission.

---

## 8. Composition (Tab 5)

### Kalkulator-Cards

```tsx
<CompositionCalculators>
  <BMICard weight={weight} height={height} />
  <FFMICard weight={weight} height={height} bf={bfPct} />
  <BMRCard weight={weight} height={height} age={age} sex={sex} formula="mifflin-st-jeor" />
  <TDEECard bmr={bmr} activityLevel={activityLevel} />
</CompositionCalculators>
```

Alle Kalkulatoren zeigen Formel, Input-Fields inline editierbar, Ergebnis sofort aktualisiert.

### FFMI Interpretation

```tsx
<FFMIInterpretation ffmi={ffmi}>
  {ffmi < 18 && <Label>Below average</Label>}
  {ffmi >= 18 && ffmi < 20 && <Label>Average</Label>}
  {ffmi >= 20 && ffmi < 22 && <Label>Above average</Label>}
  {ffmi >= 22 && ffmi < 25 && <Label>Excellent (natural)</Label>}
  {ffmi >= 25 && <Label variant="warn">Above typical natural limit</Label>}
</FFMIInterpretation>
```

---

## 9. Context Panel (Goals)

```tsx
CONTEXT_DATA.goals = {
  buddy: {
    state: 'idle',
    message: 'Body Fat Goal: 72 Tage verbleibend. Du liegst 0.4% vor Plan — keep going.',
  },
  insights: [
    { type: 'pos', text: 'Bench Press e1RM: +5 kg diese Woche → Kraft-Ziel 94%' },
    { type: 'warn', text: 'Gewicht-Trend: leicht unter Ziel-Rate — prüfe Kalorienüberschuss' },
    { type: 'info', text: 'Symmetry Watch: Linker Bizeps 1 cm kleiner als rechts' },
  ],
  quickActions: ['Log Weight', 'Log Measurements', 'Add Goal', 'View Timeline'],
};
```

---

## 10. Acceptance Criteria

```
[ ] Goal Cards zeigen Progress-Bars mit korrekten Werten
[ ] Goal Creator Modal: alle Typen auswählbar
[ ] Timeline Gantt: Balken reichen nie über Container
[ ] Gewicht-Chart: 7d Trendlinie korrekt berechnet
[ ] Fotos: Privacy-Gate (nie für Coaches sichtbar ohne Permission)
[ ] FFMI-Berechnung korrekt (inkl. Höhen-Normalisierung auf 1.75m)
[ ] BMR Mifflin-St-Jeor Formel korrekt implementiert
[ ] TDEE Multiplikatoren korrekt (1.2 / 1.375 / 1.55 / 1.725 / 1.9)
[ ] Log Weight Button speichert mit aktuellem Timestamp
```
