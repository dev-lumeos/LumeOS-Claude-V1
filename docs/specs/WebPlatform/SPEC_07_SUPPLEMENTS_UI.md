# SPEC_07 — Supplements UI
> WebPlatform | Stand: Mai 2026 | Status: draft
> Referenz: docs/specs/Supplements/ (Backend-Spec)

---

## 1. Übersicht

Supplements-Modul mit 6 Tabs + optionalem Extended Mode für dokumentierte Compounds (TRT/Peptide etc.).
Accent: `--acc-suppl` (terracotta, oklch(0.76 0.10 25)).

**Wichtig:** Extended Mode ist eine Tracking-Surface, kein Empfehlungs-Tool.
Kein Prescribing, keine Dosierungsempfehlungen. Nur Dokumentation.

---

## 2. Routing

```
/supplements           — Today (default)
```

Alle Tabs auf einer Route.

---

## 3. Tabs

| Tab | Inhalt |
|---|---|
| Today | Tages-Checkliste, nächste Einnahme, Refill-Alerts |
| Stack | Timing-Matrix, Supplement-Liste |
| Database | BLS-basierte Supplement-DB, Suche, Evidence |
| Compliance | Kalender, Heatmap, Streaks |
| Interactions | Erkannte Interaktionen + Synergien |
| Cost | Monats-/Jahreskosten, per-active-day |

---

## 4. Today (Tab 1)

### Layout

```
[Adherence Ring (heute genommen / total)]
[Next Dose Countdown]

[Slot Cards]
  ├── Morning (08:00)      ✓ done
  ├── Midday (12:30)       ○ upcoming
  ├── Pre-Workout (13:30)  ○ upcoming
  ├── Post-Workout         ○ upcoming
  └── Evening (22:00)      ○ upcoming

[Refill-Alerts]
[Active Cycles (Ashwagandha Wk 5/8, ...)]
```

### Adherence Ring

```tsx
<AdherenceRing taken={3} total={5}>
  <RingValue>{taken}/{total}</RingValue>
  <RingLabel>taken today</RingLabel>
</AdherenceRing>
```

### Slot Cards

```tsx
<SlotCard
  slot="morning"
  time="08:00"
  status="done"
  items={[
    { name: 'Vitamin D3+K2', dose: '5000 IU + 200µg', taken: true },
    { name: 'Omega-3',       dose: '3g EPA/DHA',       taken: true },
  ]}
  onMarkTaken={markSlotTaken}
/>
```

Jede Slot-Card: Toggle per Item (Mark Taken Button / Check-Circle).
"Mark All"-Button pro Slot.

### Log Skip Modal

```tsx
<SkipLogModal supplement={selectedItem}>
  <SkipReasonPicker reasons={[
    'Forgot',
    'Pre-workout meal skipped',
    'Travel',
    'Supply ran out',
    'Side effect concern',
    'On cycle break',
    'Too late in day',
    'Other',
  ]} />
  <NoteInput optional />
  <SaveButton />
</SkipLogModal>
```

### Refill Alerts

```tsx
<RefillAlert
  name="Omega-3"
  daysRemaining={8}
  servingsLeft={8}
  urgency="high"
  onReorder={openReorderModal}
/>
```

---

## 5. Stack (Tab 2)

### View Toggle

Zwei Views: "Matrix" und "List".

#### Matrix View

Tabelle: Supplement × Wochentag × Slot.

```
Name            Mon  Tue  Wed  Thu  Fri  Sat  Sun   Dose          Slot         Streak
Creatine         ●    ●    ●    ●    ●    ●    ●    5 g          Morning      127 d
Vitamin D3+K2    ●    ●    ●    ●    ●    ●    ●    5000 IU      Morning       84 d
Omega-3          ●    ●    ●    ●    ●    ○    ○    3 g EPA/DHA  Morning      504 d
Whey Protein     ●    ○    ●    ○    ●    ○    ○    35 g         Post-WO       21 d
```

`●` = aktiviert, `○` = nicht an diesem Tag.
Jede Zeile hat Pencil-Edit-Icon → EditSupplementModal.

#### List View

Cards pro Supplement: Name, Brand, Form, Purpose-Tags, Evidence-Pill, Kosten, Coach-Annotations.

### Add Supplement Modal

```tsx
<AddSupplementModal>
  <NameInput />
  <BrandInput />
  <FormSelect options={['Capsule', 'Powder', 'Tablet', 'Liquid', 'Softgel']} />
  <DoseInput unit="auto" />
  <SlotPicker slots={['Morning', 'Midday', 'Pre-Workout', 'Post-Workout', 'Evening']} />
  <DayPicker days={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} />
  <PurposeTagPicker />
  <CostPerMonthInput />
  <SaveButton />
</AddSupplementModal>
```

### Reorder Modal

```tsx
<ReorderModal>
  <SupplementSelector multi selectedItems={defaultRefillList} />
  <SupplyDurationInput label="Days to order for" />
  <OrderTotal cost={totalCost} />
  <MarketplaceLinkButton />
</ReorderModal>
```

---

## 6. Database (Tab 3)

### Suche und Filter

```tsx
<SupplementDatabase>
  <SearchInput placeholder="Search supplements..." />
  <CategoryFilter categories={[
    'Performance', 'Vitamin', 'Mineral',
    'Adaptogen', 'Protein', 'Fat', 'Sleep',
  ]} />
  <EvidenceFilter levels={['A', 'B+', 'B', 'C', 'D']} />
  <DatabaseTable
    items={searchResults}
    onRowClick={openProductDetail}
    onAdd={addToStack}
  />
</SupplementDatabase>
```

### Product Detail Drawer

Öffnet als Sheet (right, 460px).

```tsx
<ProductDetailDrawer supplement={selected}>
  <ProductHeader name={name} brand={brand} form={form} />
  <EvidencePill level={evidenceLevel} />
  <CoachRecommendation coach={coachRecommendation} />

  <ActiveIngredients ingredients={activeIngredients} />
  <Allergens list={allergens} />

  <ThirdPartyTesting certifications={['NSF Sport', 'Informed Sport']} />

  <SKU sku={sku} upc={upc} />
  <MarketplaceLink href={marketplaceUrl} />

  <AddToStackButton supplement={selected} />
</ProductDetailDrawer>
```

Evidence-Grade-Pill: A (grün), B+ / B (amber), C / D (rot/grau) — basierend auf publizierter Studienlage.

---

## 7. Compliance (Tab 4)

### Toggle: Kalender / Heatmap

#### Kalender-Ansicht

Monatlicher Kalender (shadcn Calendar Wrapper).
Pro Tag: Adherence-Balken (% genommen / total).
Click auf Tag → Tages-Detail (welche Items genommen/skipped).

#### Heatmap-Ansicht

GitHub-Contribution-Style. 90 Tage × Adherence-Level.
Farb-Intensität: 0% = leer, 100% = voll gesättigt.

### Per-Supplement Tabelle

```
Supplement    Taken  Planned  Rate    Streak    Last Skip
Creatine       85     90      94%     127 d     Apr 20 (forgot)
Omega-3       449    450      99.8%   504 d     Nov 2025
Beta-Alanine   62     72      86%      3 d      May 20 (pre-WO skipped)
```

---

## 8. Interactions (Tab 5)

```tsx
<InteractionList>
  <InteractionCard
    severity="moderate"
    items={['Caffeine', 'Ashwagandha']}
    mechanism="Opposing autonomic effects"
    recommendation="Take Ashwagandha in evening, Caffeine in morning"
    onViewStudies={openInteractionDetail}
  />
  <InteractionCard
    severity="low"
    items={['Magnesium', 'Whey (Calcium)']}
    mechanism="Mineral competition at absorption"
    recommendation="2h gap between doses"
  />
  <InteractionCard
    severity="synergy"
    items={['Vitamin D3', 'K2', 'Magnesium']}
    mechanism="Synergistic co-factors"
    recommendation="Stack together — optimal timing: morning with fat"
  />
</InteractionList>
```

### Interaction Detail Modal

```tsx
<InteractionDetailModal>
  <SeverityBadge severity={severity} />
  <Mechanism text={mechanism} />
  <Studies items={[
    { pmid: '28841573', journal: 'JISSN', year: 2017, finding: '...' },
  ]} />
  <Recommendation text={recommendation} />
</InteractionDetailModal>
```

---

## 9. Cost (Tab 6)

### KPI-Cards

```
Total/Month: €87.10   |  Annual: €1,045   |  Per Day: €2.90   |  Per Active Day: €3.45
```

### Per-Supplement-Tabelle

```
Supplement      Brand              $/Month   Active Days   €/Active-Day
Creatine        Bulk Powders        €8.50    30/30         €0.28
Omega-3         Nordic Naturals    €32.00    30/30         €1.07
Whey Protein    ESN                €18.00    15/30         €1.20
```

Rechnet Cost-per-Active-Day korrekt (nur Tage an denen das Supplement geplant war).

### 12-Monats-Trend

Recharts `AreaChart`. Y = monatliche Kosten.

### Category Split

Donut-Chart oder Tabelle: Performance / Recovery / Foundation / Protein.

---

## 10. Extended Mode

### Gate

```tsx
<ExtendedModeGate onUnlock={unlockExtendedMode}>
  <GateCard>
    <GateTitle>Extended Mode</GateTitle>
    <GateDisclaimer>
      Tracking only. Not medical advice. Physician supervision required.
      Do not use this to self-prescribe or adjust protocols.
    </GateDisclaimer>
    <PhysicianConfirmCheckbox label="I am under physician supervision" />
    <UnlockButton />
  </GateCard>
</ExtendedModeGate>
```

### Extended Mode Header (nach Unlock)

```tsx
<ExtendedHeader>
  <TagPill>Tracking only</TagPill>
  <TagPill>Physician supervised</TagPill>
  <PhysicianInfo
    name="Dr. Kessler"
    lastVisit="Apr 15"
    nextVisit="Jul 15"
  />
  <MedicalModuleLink />
</ExtendedHeader>
```

### Compound Cards

```tsx
<CompoundCard compound={compound}>
  <CompoundName>{compound.name}</CompoundName>
  <CompoundDose>{compound.dose}</CompoundDose>
  <CompoundSchedule schedule={compound.schedule} />
  <LabStatus status={compound.labStatus} />  // in_range | watch | out_of_range
  <CompoundActions>
    <LogDoseButton />
    <ViewDetailsButton />
  </CompoundActions>
</CompoundCard>
```

### Cycle Timeline

Horizontaler Streifen: 16 Wochen × Compounds.
Farbcodiert: done (gedimmt), active (akzent), off (keine Farbe).
"This week" Marker.

### Bloodwork Panel

Tabelle: 12 Biomarker, Wert, Range, Trend-Pfeil, Status-Dot.

```
Marker              Value     Range          Trend  Status
Total T             820 ng/dL  264–916        →      ok
Free T              28 pg/mL   9–30           →      ok
E2 sensitive        22 pg/mL   10–40          ↓      ok
Hematocrit          50.2 %     38–52          ↑      watch
Fasting Glucose     104 mg/dL  70–99          ↑      out-of-range
```

Out-of-range Werte: rot markiert, Link zu Medical Modul.

### Permissions Modal

```tsx
<ExtendedPermissionsModal>
  <PermissionMatrix
    rows={compounds}
    cols={['Medical Coach', 'Nutrition Coach', 'Training Coach', 'Buddy']}
    values={permissions}
    onChange={updatePermission}
  />
  <AuditLogLink />
  <SaveButton />
</ExtendedPermissionsModal>
```

---

## 11. Context Panel (Supplements)

```tsx
CONTEXT_DATA.supplements = {
  buddy: {
    state: 'idle',
    message: 'Pre-workout dose in 4h 02m. Omega-3 Refill in 8 Tagen.',
  },
  insights: [
    { type: 'warn', text: 'Omega-3 läuft am 26. Mai aus — 8 Softgels verbleibend' },
    { type: 'info', text: 'Ashwagandha Cycle Wk 5/8 — Caffeine endet gleichzeitig' },
    { type: 'pos',  text: 'Compliance 94% / 30d · Omega-3 Streak 504 Tage' },
  ],
  quickActions: ['Mark Taken', 'Log Skip', 'Order Refills', 'Find Supplement'],
};
```

---

## 12. Acceptance Criteria

```
[ ] Today: 5 Slot-Cards (Morning/Midday/Pre-WO/Post-WO/Evening)
[ ] Mark Taken togglet State live, Ring aktualisiert
[ ] Log Skip Modal speichert Grund + optionale Note
[ ] Stack Matrix zeigt korrekte Day-Pills
[ ] Database Evidence-Grades korrekt farbcodiert
[ ] Product Detail zeigt 3rd-Party-Testing (NSF/Informed Sport)
[ ] Compliance Kalender und Heatmap Toggle funktioniert
[ ] Interactions sortiert nach Severity
[ ] Cost per-active-day berechnung korrekt
[ ] Extended Mode Gate: Unlock nur mit Checkbox-Bestätigung
[ ] Extended Mode: Bloodwork out-of-range rot + Link zu Medical
[ ] Cycle Timeline ohne Overflow
```
