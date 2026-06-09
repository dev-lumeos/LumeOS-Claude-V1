# SPEC_06 — Recovery UI
> WebPlatform | Stand: Mai 2026 | Status: draft
> Referenz: docs/specs/Recovery/ (Backend-Spec)

---

## 1. Übersicht

Recovery zeigt täglichen Recovery-Score, HRV, Schlaf, Biometrics, Protokoll-Tracking und KI-Empfehlungen.
Accent: `--acc-recov` (sage, oklch(0.78 0.08 160)).

---

## 2. Routing

```
/recovery              — Today (default, alle Tabs auf einer Seite)
```

Kein Sub-Routing. Alle Recovery-Bereiche als Tabs auf `/recovery`.

---

## 3. Tabs

| Tab | Inhalt |
|---|---|
| Today | Score-Ring, Schlaf-Summary, Biometrics, Readiness-Sliders |
| Sleep | Schlaf-Detail, Staging, 14-Nächte-Trend |
| Biometrics | HRV-Trend + Annotation, RHR, Wearable-Import |
| Protocols | Protokoll-Log, Häufigkeit, Empfehlungen |
| Insights | KI-Empfehlungen, Korrelationen |
| Body Map | Anatomische Recovery-Karte |

---

## 4. Today (Tab 1)

### Layout

```
[Recovery Score Ring — groß, zentral]
[Score Breakdown: Sleep / HRV / Readiness / Training Load]

[Readiness-Sliders]
  ├── Energie (1–10)
  ├── Muskelkater (1–10)
  └── Mood (1–10)

[Protokoll-Cards: Heute geplant / erledigt]
[HRV-Highlight + Annotate-Button]
```

### Recovery Score Ring

```tsx
<RecoveryScoreRing score={82} trend={+4}>
  <ScoreValue>{score}</ScoreValue>     // Mono, 56px
  <ScoreLabel>Recovery</ScoreLabel>
  <TrendBadge trend={trend} />
</RecoveryScoreRing>
```

Ring-Farbe: ≥ 80 grün (`--pos`), 60–79 amber (`--warn`), < 60 rot (`--neg`).
Implementiert als SVG `<circle>` mit `stroke-dasharray`.

### Score Breakdown

4 Sub-Scores als horizontale Bars:

```tsx
<ScoreBreakdown items={[
  { label: 'Sleep',          value: 82, weight: 0.35 },
  { label: 'HRV',            value: 74, weight: 0.30 },
  { label: 'Readiness',      value: 80, weight: 0.20 },
  { label: 'Training Load',  value: 68, weight: 0.15 },
]} />
```

### Readiness Check-In

```tsx
<ReadinessCheckIn onSubmit={submitReadiness}>
  <ReadinessSlider label="Energy"       min={1} max={10} />
  <ReadinessSlider label="Muscle soreness" min={1} max={10} invertBad />
  <ReadinessSlider label="Mood"         min={1} max={10} />
  <SubmitButton />
</ReadinessCheckIn>
```

Erscheint einmal täglich (morgens). Nach Submit: schreibgeschützt mit Timestamp.

---

## 5. Sleep (Tab 2)

### Schlaf-Staging Chart

```tsx
<SleepStagingChart nights={14}>
  {/* Pro Nacht: Balken mit Phasen (Awake/REM/Light/Deep) */}
  {/* Hover: Detail-Tooltip mit Phasen-Dauer */}
</SleepStagingChart>
```

Wenn keine Wearable-Daten: Balken = Schlafdauer (geschätzte Staging-Breakdown basierend auf Score).

### Manuelle Schlaf-Eingabe Modal

Trigger: "Log Sleep"-Button im Tab-Header.

```tsx
<SleepLogModal>
  <TimeInput label="Eingeschlafen" />
  <TimeInput label="Aufgewacht" />
  <ScoreInput label="Schlaf-Qualität (subjektiv)" min={1} max={10} />
  <NoteInput placeholder="Alkohol, Late meal, Stress..." />
  <SaveButton />
</SleepLogModal>
```

---

## 6. Biometrics / HRV (Tab 3)

### HRV-Chart mit Annotation

```tsx
<HRVChart data={last30Days}>
  <DataPointClickHandler onPointClick={openHRVAnnotationModal} />
</HRVChart>
```

Click auf Datenpunkt → HRV Annotation Modal.

### HRV Annotation Modal

```tsx
<HRVAnnotateModal date={selectedDate} hrv={selectedHRV}>
  <TagPicker tags={[
    'travel', 'alcohol', 'illness', 'late meal',
    'stress', 'coffee', 'heat', 'cold',
  ]} />
  <NoteInput />
  <ConfidenceSlider min={1} max={5} />
  <SaveButton />
</HRVAnnotateModal>
```

### Wearable-Setup

```tsx
<WearableSetup>
  <WearableCard name="Polar H10" status="connected" lastSync="14:22" />
  <WearableCard name="Garmin Fenix 7" status="setup" onConnect={...} />
  <WearableCard name="Whoop 4.0" status="available" onConnect={...} />
  <WearableCard name="Apple Health" status="available" onConnect={...} />
</WearableSetup>
```

---

## 7. Protocols (Tab 4)

### Protokoll-Cards

```tsx
<ProtocolList>
  <ProtocolCard
    name="Sauna"
    frequency="3× / Woche"
    lastDone="heute"
    streak={5}
    onLog={logProtocol}
    onViewDetail={openProtocolDetail}
  />
  <ProtocolCard name="Cold Plunge" ... />
  <ProtocolCard name="Massage" ... />
  <ProtocolCard name="Stretching" ... />
  <ProtocolCard name="Foam Rolling" ... />
  <ProtocolCard name="Meditation" ... />
</ProtocolList>
```

"Log"-Button → Timestamp wird gesetzt, Streak +1.
Click auf Card → Protocol Detail Drawer mit Log-History.

---

## 8. Insights / KI-Empfehlungen (Tab 5)

```tsx
<RecoveryInsights>
  <InsightCard
    type="recommendation"
    priority="high"
    title="Priorisiere Schlaf diese Woche"
    body="Training-Volumen +20% — Recovery-Score Trend negativ. Schlaf-Fenster: min. 7.5h empfohlen."
    sources={['training', 'recovery']}
  />
  <InsightCard
    type="correlation"
    title="HRV-Einfluss: Alkohol"
    body="An 4 von 6 Nächten mit HRV < 55 war Alkohol annotiert. Beziehung: stark (R=0.82)."
  />
  <InsightCard
    type="pattern"
    title="Recovery-Plateau Donnerstag"
    body="Donnerstags konstant niedrigster Wochenwert. Ursache unklar — überprüfe Mittwoch-Abend-Routine."
  />
</RecoveryInsights>
```

---

## 9. Body Map (Tab 6)

### Anatomical SVG

Anatomische Körperkarte, Front- und Back-Ansicht.
Muskelgruppen farbcodiert nach Recovery-Status:

```
Farb-Schema:
  Kein Datum / Unbekannt: var(--fg-dim) (grau)
  Gut erholt (≥ 3 Tage): var(--pos) (grün, transparent)
  Mittel (1–2 Tage): var(--warn) (amber)
  Frisch trainiert (heute): var(--neg) (rot-tint)
```

```tsx
<AnatomyMap view="front">
  <MuscleRegion
    id="pectorals"
    status="trained-today"
    onClick={() => openMuscleDetail('pectorals')}
  />
  <MuscleRegion id="deltoids" status="recovered" onClick={...} />
  <MuscleRegion id="biceps" status="medium" onClick={...} />
  {/* ... alle Muskelgruppen */}
</AnatomyMap>

<AnatomyToggle onToggle={(v) => setView(v)} />
```

Muscle-Detail beim Click: Letztes Training, Volumen, Recovery-Status, empfohlener nächster Trainingstag.

**Asset:** Lizenzierte anatomische SVG. Keine hand-gezeichneten Pfade.
Optionen: `react-body-highlighter` oder eigene SVG aus freier Quelle (CC0 / MIT).

---

## 10. Context Panel (Recovery)

```tsx
CONTEXT_DATA.recovery = {
  buddy: {
    state: 'idle',
    message: 'Recovery 82 — grünes Licht für Pull Day. Sauna heute Abend empfohlen.',
  },
  insights: [
    { type: 'pos',  text: 'Schlaf 3 Nächte ≥ 7.5h — Trend positiv' },
    { type: 'info', text: 'HRV 14d-Durchschnitt: 58ms' },
    { type: 'warn', text: 'Donnerstags HRV-Einbruch — Muster erkannt' },
  ],
  quickActions: ['Log Sleep', 'Readiness Check-in', 'Log Protocol', 'View HRV'],
};
```

---

## 11. Acceptance Criteria

```
[ ] Recovery Score Ring farbcodiert (grün/amber/rot) nach Schwellwerten
[ ] Readiness Check-In erscheint einmal täglich, dann schreibgeschützt
[ ] HRV-Chart: Click auf Punkt öffnet Annotation Modal
[ ] Sleep Log Modal speichert korrekt
[ ] Body Map zeigt alle Muskelgruppen mit korrektem Status
[ ] Body Map überschreitet nie Card-Rahmen (overflow: hidden)
[ ] Protokoll-Log setzt Timestamp und erhöht Streak
[ ] Wearable-Setup zeigt Verbindungsstatus
[ ] KI-Insights-Tab zeigt mind. 3 Insight-Cards
```
