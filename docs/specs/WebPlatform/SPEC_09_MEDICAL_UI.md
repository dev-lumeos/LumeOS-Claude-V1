# SPEC_09 — Medical UI
> WebPlatform | Stand: Mai 2026 | Status: draft
> Referenz: docs/specs/Medical/ (Backend-Spec)

---

## 1. Übersicht

Medical ist ein sensibles Modul. Cleanes, ruhiges Design. Keine Diagnosen, keine Therapieempfehlungen.
"Medical = Monitoring, NOT Diagnosis" ist ein Kernprinzip des Projekts.

Accent: `--acc-medic` (rust, oklch(0.76 0.09 15)).

Datenschutz: Alle Medical-Daten sind verschlüsselt at rest. Nur der User hat Zugriff, außer bei expliziter Coach-Freigabe.

---

## 2. Routing

```
/medical               — Overview (default)
```

Alle Tabs auf einer Route.

---

## 3. Tabs

| Tab | Inhalt |
|---|---|
| Overview | Diagnosen/Notizen, Termine, Wichtige Laborwerte |
| Lab Results | Biomarker-Tabelle, Trend-Charts, Upload |
| Medications | Medikamentenliste, Einnahme-Tracking |
| History | Verletzungen, Operationen, Diagnosen (Timeline) |
| Documents | PDF-Upload für Befunde, Rezepte, Berichte |
| Appointments | Kalender-Integration, Terminnotizen |

---

## 4. Modul-Header

```tsx
<MedicalHeader>
  <ModuleTitle>Medical</ModuleTitle>
  <SecurityPill>Sensitive · encrypted at rest</SecurityPill>
</MedicalHeader>
```

---

## 5. Overview (Tab 1)

### Layout

```
[Active Conditions Cards]
[Upcoming Appointments]
[Key Lab Values (3 kritische)]
```

### Active Conditions

```tsx
<ConditionList>
  <ConditionCard
    name="Hashimoto Thyroiditis"
    status="controlled"
    note="TSH normalisiert seit März 2026"
    physician="Dr. Kessler"
  />
</ConditionList>
```

### Upcoming Appointments

```tsx
<AppointmentList upcoming limit={3}>
  <AppointmentCard
    date="Jun 15, 2026"
    daysUntil={19}
    physician="Dr. Kessler"
    type="Endocrinology"
    notes="Quarterly bloodwork review"
  />
</AppointmentList>
```

### Key Lab Values

3 wichtigste / kritische Biomarker aus aktuellem Lab Panel:

```tsx
<KeyLabValues>
  <LabKpi label="Fasting Glucose" value={104} unit="mg/dL" status="out-of-range" trend="up" />
  <LabKpi label="Total T"         value={820} unit="ng/dL" status="ok"           trend="stable" />
  <LabKpi label="Vitamin D"       value={32}  unit="ng/mL" status="watch"        trend="up" />
</KeyLabValues>
```

---

## 6. Lab Results (Tab 2)

### Biomarker-Tabelle

```
Marker              Value       Range          Trend   Status     Date
Total T             820 ng/dL   264–916        →       ok         May 10
Free T              28 pg/mL    9–30           →       ok         May 10
E2 sensitive        22 pg/mL    10–40          ↓       ok         May 10
Hematocrit          50.2 %      38–52          ↑       watch      May 10
Fasting Glucose     104 mg/dL   70–99          ↑       ⚠ over     May 10
HbA1c               5.6 %       < 5.7          →       ok         May 10
ALT                 32 U/L      7–56           →       ok         May 10
Total Cholesterol   195 mg/dL   < 200          →       ok         May 10
TSH                 1.8 mIU/L   0.4–4.0        →       ok         May 10
IGF-1               220 ng/mL   87–238         ↑       ok         May 10
LH                  4.2 IU/L    1.7–8.6        →       ok         May 10
Vitamin D           32 ng/mL    30–100         ↑       watch      May 10
```

Status-Farbcodierung:
- `ok` → neutral (fg-muted)
- `watch` → amber (--warn)
- `out-of-range` → rot (--neg), Zeile leicht rot hinterlegt

### Biomarker Detail Drawer

Click auf Zeile → Detail-Drawer (right, 460px):

```tsx
<BiomarkerDetailDrawer marker={selected}>
  <BiomarkerHeader name={name} unit={unit} />
  <CurrentValue value={value} status={status} />
  <ReferenceRange min={range.min} max={range.max} optimal={range.optimal} />
  <TrendChart data={history} months={6} />
  <BiomarkerDescription what={description} importanceFor="Training / Health" />
  <RelatedModules links={relatedModules} />
</BiomarkerDetailDrawer>
```

### Upload Lab Results

```tsx
<LabUpload>
  <UploadOptions>
    <PDFUploadButton label="Upload bloodwork PDF" />
    <ManualEntryButton label="Enter values manually" />
  </UploadOptions>
</LabUpload>
```

Add Lab Result Modal:

```tsx
<AddLabResultModal>
  <DatePicker label="Test date" />
  <PanelSelector panels={['Complete Blood Count', 'Hormone Panel', 'Metabolic', 'Custom']} />
  <MarkerEntries markers={selectedPanel.markers} />
  <LabProviderInput optional />
  <SaveButton />
</AddLabResultModal>
```

---

## 7. Medications (Tab 3)

```tsx
<MedicationList>
  <MedicationCard
    name="Levothyroxine"
    dose="75 µg"
    timing="Morning, fasted"
    prescribedBy="Dr. Kessler"
    rxNumber="RX-12345"
    startDate="Mar 2025"
    status="active"
    onLogDose={logDose}
    onEdit={editMedication}
  />
</MedicationList>
```

Ähnlich wie Supplements Today-Tab:
- Tages-Checkliste mit Timing
- Mark Taken Toggle pro Einnahme
- Compliance-Streak (optional)

---

## 8. History (Tab 4)

Chronologische Timeline.

```tsx
<MedicalHistory>
  <TimelineEvent
    date="Feb 2026"
    type="injury"
    label="Shoulder Impingement (right)"
    status="resolved"
  />
  <TimelineEvent
    date="Mar 2025"
    type="diagnosis"
    label="Hashimoto Thyroiditis"
    status="controlled"
  />
  <TimelineEvent
    date="Jan 2024"
    type="surgery"
    label="Appendectomy"
    status="resolved"
  />
</MedicalHistory>
```

Event-Typen: `injury` | `diagnosis` | `surgery` | `procedure` | `consultation`.
Status: `active` | `controlled` | `resolved`.

### Add History Event Modal

```tsx
<AddHistoryModal>
  <EventTypeSelect />
  <EventLabel />
  <DatePicker />
  <StatusSelect />
  <PhysicianInput optional />
  <NotesInput />
  <SaveButton />
</AddHistoryModal>
```

---

## 9. Documents (Tab 5)

```tsx
<DocumentList>
  <DocumentCard
    name="Bloodwork May 2026"
    type="PDF"
    date="May 10, 2026"
    category="Lab Results"
    fileSize="1.2 MB"
    onView={viewDocument}
    onDownload={downloadDocument}
  />
</DocumentList>
```

Kategorien: Lab Results / Prescriptions / Referrals / Imaging / Reports.
Upload: PDF-Drag-Drop Zone.

---

## 10. Appointments (Tab 6)

```tsx
<AppointmentCalendar>
  <MonthCalendar
    events={appointments}
    onDayClick={openDayDetail}
  />
  <UpcomingList appointments={upcoming} />
  <AddAppointmentButton onClick={openAddAppointmentModal} />
</AppointmentCalendar>
```

### Add Appointment Modal

```tsx
<AddAppointmentModal>
  <PhysicianInput />
  <SpecialtySelect />
  <DateTimePicker />
  <LocationInput optional />
  <NotesInput />
  <ReminderToggle />
  <SaveButton />
</AddAppointmentModal>
```

---

## 11. Context Panel (Medical)

```tsx
CONTEXT_DATA.medical = {
  buddy: {
    state: 'idle',
    message: 'Nächster Endo-Termin: Jun 15 (in 19 Tagen). Blutbild mitbringen.',
  },
  insights: [
    { type: 'warn', text: 'Fasting Glucose 104 mg/dL — über Normalbereich. Link zu Medical.' },
    { type: 'warn', text: 'Hematocrit 50.2% — watch — bei 52+ mit Arzt besprechen.' },
    { type: 'info', text: '19 Biomarker getrackt · 5 Medikamente · 3 aktive Diagnosen' },
  ],
  quickActions: ['Add Lab Result', 'Log Medication', 'Schedule Appointment', 'Upload Document'],
};
```

---

## 12. Datenschutz-Regeln

```
[ ] Medical-Daten encrypted at rest (Supabase RLS: nur auth.uid() = user_id)
[ ] Fotos und PDFs in separatem Storage-Bucket mit privatem Access
[ ] Coach-Zugriff nur mit expliziter User-Permission (Privacy Matrix)
[ ] Export auf Anfrage als ZIP (GDPR)
[ ] Löschung mit 30d Retention (Recovery-Frist)
```

---

## 13. Acceptance Criteria

```
[ ] Security-Pill "Sensitive · encrypted at rest" immer sichtbar im Modul-Header
[ ] Biomarker out-of-range: rot markiert + Link zu Arzt-Kontakt
[ ] Biomarker Detail Drawer zeigt 6-Monats-Trend korrekt
[ ] Lab Result Upload: PDF-Upload und manuelle Eingabe funktionieren
[ ] Medications: Mark-Taken togglet korrekt
[ ] Timeline Events chronologisch sortiert, neueste oben
[ ] Documents: Upload, View, Download funktioniert
[ ] Appointments Kalender zeigt korrekte Events
[ ] Keine Medical-Daten sichtbar für andere User ohne explizite Permission
[ ] Empty States für alle Tabs definiert
```
