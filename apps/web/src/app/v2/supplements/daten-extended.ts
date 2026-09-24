// Die Extended-Entwurfskonstanten — G-499.
//
// ══ WARUM SIE NICHT MEHR IN `daten.ts` STEHEN ══════════════════════
//
// `[cmd]` **Gemessen am 2026-09-24 (Produktionsbau):** nachdem die
// Extended-Referenz in eine eigene Datei gewandert war, stand
// `HCG (Human Chorionic Gonadotropin)` **weiterhin im
// Seitenbuendel** — samt `sideEffectScore` und `nextLab`, Feldern,
// die es NUR hier gibt.
//
// `[read]` **Der Grund: ein Modul ist unteilbar.** Vier Dateien
// importieren `STACK` aus `daten.ts` (`ansicht.tsx`, `modale.tsx`,
// `tabs.tsx`, `tab-compliance.tsx`) — und holen damit jede andere
// Konstante derselben Datei mit, auch die, die sie nie anfassen.
// **Baumschnitt greift hier nicht**, weil der Rest des Moduls
// gebraucht wird.
//
// `[read]` **Das ist der fuenfte Weg ins Buendel** — nach den drei
// aus G-117 und der Referenz selbst. `[read]` **Dieselbe Lehre,
// eine Ebene tiefer: nicht der Import entscheidet, sondern die
// DATEIGRENZE.**
//
// `[read]` **Verbraucher sind ausschliesslich die beiden
// Extended-Dateien**, und beide werden dynamisch geholt:
// `tab-extended.tsx` (G-117) und `mockup-referenz-extended.tsx`
// (G-499).

export const EXTENDED_STACK = [
  {
    id: "test-c",
    name: "Testosterone Cypionate",
    category: "Hormone",
    protocol: "TRT · physician supervised",
    dose: "150 mg",
    schedule: "Mon + Thu · IM glute",
    cycleType: "continuous",
    cycleWeek: null,
    started: "2024-09-12",
    physician: "Dr. M. Kessler · Endokrinologie Berlin",
    prescription: "RX-44102 · valid through 2026-09",
    halfLife: "8 days",
    nextDose: "Mon May 18 · 07:00",
    monthlyCost: 64.00,
    sideEffectScore: 1, // 0-3
    bloodMarkers: ["Total T", "Free T", "E2 (sens)", "Hematocrit", "PSA", "Lipid panel"],
    lastLab: "2026-04-23",
    nextLab: "2026-07-15",
    labStatus: "in_range",
    notes: "Trough-target: total T 600-800 ng/dL. E2 controlled with low-dose anastrozole. HCT trending 48% — within range.",
    coachVisible: false,
    nutriCoachVisible: false,
    medicalCoachVisible: true,
  },
  {
    id: "hcg",
    name: "HCG (Human Chorionic Gonadotropin)",
    category: "Hormone",
    protocol: "Testicular preservation · w/ TRT",
    dose: "500 IU",
    schedule: "Tue + Fri · SubQ",
    cycleType: "continuous",
    cycleWeek: null,
    started: "2024-09-12",
    physician: "Dr. M. Kessler",
    prescription: "RX-44103",
    halfLife: "33 hours",
    nextDose: "Tue May 19 · 09:00",
    monthlyCost: 38.50,
    sideEffectScore: 0,
    bloodMarkers: ["LH", "FSH", "Estradiol"],
    lastLab: "2026-04-23",
    nextLab: "2026-07-15",
    labStatus: "in_range",
    notes: "Maintains testicular function and fertility during TRT.",
    coachVisible: false,
    nutriCoachVisible: false,
    medicalCoachVisible: true,
  },
  {
    id: "anastrozole",
    name: "Anastrozole (Arimidex)",
    category: "Estrogen control",
    protocol: "Aromatase inhibitor · w/ TRT",
    dose: "0.25 mg",
    schedule: "Every 3rd day",
    cycleType: "as_needed",
    cycleWeek: null,
    started: "2024-10-04",
    physician: "Dr. M. Kessler",
    prescription: "RX-44104",
    halfLife: "46 hours",
    nextDose: "Sun May 18",
    monthlyCost: 12.20,
    sideEffectScore: 1,
    bloodMarkers: ["Estradiol (sensitive)"],
    lastLab: "2026-04-23",
    nextLab: "2026-07-15",
    labStatus: "in_range",
    notes: "Titrate by E2 sensitive — aim 20-30 pg/mL. Last reading 26.",
    coachVisible: false,
    nutriCoachVisible: false,
    medicalCoachVisible: true,
  },
  {
    id: "mk677",
    name: "MK-677 (Ibutamoren)",
    category: "GH secretagogue",
    protocol: "Recovery + sleep depth",
    dose: "10 mg",
    schedule: "Daily · evening, oral",
    cycleType: "cycled",
    cycleWeek: 7,
    cycleTotalWeeks: 12,
    cycleOffWeeks: 8,
    started: "2026-03-30",
    halfLife: "6 hours",
    nextDose: "Today · 22:00",
    monthlyCost: 48.00,
    sideEffectScore: 2,
    bloodMarkers: ["IGF-1", "Fasting glucose", "HbA1c"],
    lastLab: "2026-04-23",
    nextLab: "2026-06-01",
    labStatus: "watch",
    notes: "Watch fasting glucose — last reading 102 mg/dL (up from 88). Considering early cycle-off if reaches 110.",
    coachVisible: false,
    nutriCoachVisible: true,
    medicalCoachVisible: true,
  },
  {
    id: "bpc157",
    name: "BPC-157",
    category: "Healing peptide",
    protocol: "Tendon repair · right elbow",
    dose: "250 µg",
    schedule: "Daily · SubQ near site",
    cycleType: "cycled",
    cycleWeek: 4,
    cycleTotalWeeks: 6,
    cycleOffWeeks: 4,
    started: "2026-04-22",
    halfLife: "4 hours",
    nextDose: "Today · 07:30",
    monthlyCost: 32.00,
    sideEffectScore: 0,
    bloodMarkers: [],
    lastLab: null,
    nextLab: null,
    labStatus: "not_required",
    notes: "Targeted injection site at right lateral epicondyle. 2 weeks left in 6w protocol.",
    coachVisible: false,
    nutriCoachVisible: false,
    medicalCoachVisible: true,
  },
];

export const EXTENDED_LABS = [
  { marker: "Total Testosterone", value: 712,  unit: "ng/dL", range: "600–900",  status: "in_range",   trend: "stable" },
  { marker: "Free Testosterone",  value: 18.4, unit: "ng/dL", range: "15–25",    status: "in_range",   trend: "up" },
  { marker: "Estradiol (sens.)",  value: 26,   unit: "pg/mL", range: "20–35",    status: "in_range",   trend: "stable" },
  { marker: "LH",                 value: 4.2,  unit: "IU/L",  range: "1.7–8.6",  status: "in_range",   trend: "stable" },
  { marker: "FSH",                value: 3.8,  unit: "IU/L",  range: "1.5–12.4", status: "in_range",   trend: "stable" },
  { marker: "Hematocrit",         value: 48,   unit: "%",     range: "39–50",    status: "watch",      trend: "up" },
  { marker: "PSA",                value: 0.9,  unit: "ng/mL", range: "<2.5",     status: "in_range",   trend: "stable" },
  { marker: "IGF-1",              value: 286,  unit: "ng/mL", range: "115–355",  status: "in_range",   trend: "up" },
  { marker: "Fasting glucose",    value: 102,  unit: "mg/dL", range: "70–99",    status: "out_of_range", trend: "up" },
  { marker: "HbA1c",              value: 5.4,  unit: "%",     range: "<5.7",     status: "in_range",   trend: "stable" },
  { marker: "ALT",                value: 28,   unit: "U/L",   range: "<40",      status: "in_range",   trend: "stable" },
  { marker: "Total cholesterol",  value: 184,  unit: "mg/dL", range: "<200",     status: "in_range",   trend: "stable" },
];
