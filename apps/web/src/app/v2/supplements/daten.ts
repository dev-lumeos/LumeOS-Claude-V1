// Die Daten der Supplements-Vorlage, uebernommen.
//
// QUELLE: theme-v1/module-supplements.jsx — mechanisch extrahiert,
// nicht abgetippt. Kein Wert, keine Reihenfolge, kein Text geaendert.
//
// `[read]` Alles hier ist ERFUNDEN. Es gibt kein `supplements`-Schema
// (`[cmd]` geprueft: information_schema kennt keines), also gibt es
// nichts anzubinden. Die Zahlen sind die des Entwurfs und bleiben es,
// bis eine Quelle existiert — genau wie beim Dashboard und beim
// Training.

export type Evidence = 'A' | 'B' | 'C' | 'D'

export type StackItem = {
  id: string
  name: string
  brand: string
  form: string
  dose: string
  slot: string
  days: number[]
  purpose: string[]
  evidence: string
  notes: string
  started: string
  monthlyCost: number
  servingsLeft: number
  servingsTotal: number
  refill: string
  streakDays: number
  coachRecommended?: boolean
  /** `[cmd]` Nur EIN Eintrag der Vorlage traegt das Feld (Zeile 61).
      Die Anzeige liest es an drei Stellen — bei den uebrigen sieben
      ist es `undefined` und faellt auf die Warnfarbe zurueck. So steht
      es in der Vorlage; uebernommen, nicht begradigt. */
  refillUrgent?: boolean
}


export const STACK: StackItem[] = [
  {
    id: "creatine",
    name: "Creatine Monohydrate",
    brand: "Bulk Pure Series",
    form: "Powder",
    dose: "5 g",
    slot: "morning",
    days: [1, 1, 1, 1, 1, 1, 1], // Mo Tu We Th Fr Sa Su
    purpose: ["Strength", "Power output", "Hydration"],
    evidence: "A",
    notes: "Maintenance dose. No loading phase used.",
    started: "2024-08-12",
    monthlyCost: 8.20,
    servingsLeft: 18,
    servingsTotal: 60,
    refill: "May 28",
    streakDays: 287,
    coachRecommended: true,
  },
  {
    id: "d3k2",
    name: "Vitamin D3 + K2 (MK-7)",
    brand: "Pure Encapsulations",
    form: "Capsule",
    dose: "4000 IU + 200 µg",
    slot: "morning",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Immune", "Bone health", "Calcium routing"],
    evidence: "A",
    notes: "Stack synergy — K2 directs Ca to bone.",
    started: "2024-04-02",
    monthlyCost: 6.40,
    servingsLeft: 34,
    servingsTotal: 90,
    refill: "Jun 14",
    streakDays: 412,
    coachRecommended: true,
  },
  {
    id: "omega3",
    name: "Omega-3 EPA/DHA",
    brand: "Nordic Naturals · Ultimate Omega",
    form: "Softgel",
    dose: "2 × 1280 mg (EPA 640 / DHA 480)",
    slot: "morning",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Inflammation", "Cognition", "CV"],
    evidence: "A",
    notes: "Take with fat-containing meal for absorption.",
    started: "2024-01-08",
    monthlyCost: 28.50,
    servingsLeft: 8,
    servingsTotal: 60,
    refill: "May 26",
    refillUrgent: true,
    streakDays: 504,
    coachRecommended: false,
  },
  {
    id: "whey",
    name: "Whey Isolate",
    brand: "ESN Iso Whey · Vanilla",
    form: "Powder",
    dose: "30 g",
    slot: "post_workout",
    days: [1, 1, 1, 0, 1, 1, 0], // Mo Tu We _ Fr Sa _
    purpose: ["Protein top-up", "Recovery"],
    evidence: "A",
    notes: "Post-training only. Skip on rest days (Thu/Sun).",
    started: "2023-11-04",
    monthlyCost: 18.20,
    servingsLeft: 22,
    servingsTotal: 33,
    refill: "Jun 8",
    streakDays: 88,
    coachRecommended: true,
  },
  {
    id: "betaala",
    name: "Beta-Alanine",
    brand: "Bulk · CarnoSyn",
    form: "Powder",
    dose: "3.2 g",
    slot: "pre_workout",
    days: [1, 0, 1, 0, 1, 1, 0],
    purpose: ["Muscle endurance", "Carnosine buffer"],
    evidence: "B+",
    notes: "Tingling normal in first 20 min — paraesthesia.",
    started: "2025-02-18",
    monthlyCost: 4.10,
    servingsLeft: 41,
    servingsTotal: 80,
    refill: "Jul 2",
    streakDays: 64,
    coachRecommended: true,
  },
  {
    id: "caffeine",
    name: "Caffeine Anhydrous",
    brand: "Bulk · 200 mg tabs",
    form: "Tablet",
    dose: "200 mg",
    slot: "pre_workout",
    days: [1, 0, 1, 0, 1, 1, 0],
    purpose: ["Stimulant", "Performance"],
    evidence: "A",
    notes: "Cycle-aware — Tom takes 2 weeks off every 8.",
    started: "2024-03-20",
    monthlyCost: 2.10,
    servingsLeft: 64,
    servingsTotal: 120,
    refill: "Jul 22",
    streakDays: 41,
    coachRecommended: false,
  },
  {
    id: "magnesium",
    name: "Magnesium Glycinate",
    brand: "Pure Encapsulations",
    form: "Capsule",
    dose: "400 mg (elemental)",
    slot: "evening",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Sleep", "Muscle relax", "HRV"],
    evidence: "A",
    notes: "Glycinate form best tolerated — no GI issues.",
    started: "2024-06-15",
    monthlyCost: 12.40,
    servingsLeft: 28,
    servingsTotal: 90,
    refill: "Jun 9",
    streakDays: 332,
    coachRecommended: true,
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha (KSM-66)",
    brand: "Sensoril/KSM dual std.",
    form: "Capsule",
    dose: "600 mg",
    slot: "evening",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Cortisol", "Stress", "Sleep"],
    evidence: "B+",
    notes: "8-week on / 2-week off cycle. Currently week 5 of 8.",
    started: "2025-04-14",
    monthlyCost: 18.00,
    servingsLeft: 12,
    servingsTotal: 60,
    refill: "May 31",
    streakDays: 35,
    coachRecommended: true,
  },
  {
    id: "probiotic",
    name: "Probiotic · 50B CFU",
    brand: "Seed DS-01",
    form: "Capsule",
    dose: "2 caps · 50B CFU",
    slot: "midday",
    days: [1, 1, 1, 1, 1, 1, 1],
    purpose: ["Gut microbiome", "Immunity"],
    evidence: "B+",
    notes: "24 strains · take 30 min before lunch with water only.",
    started: "2025-01-08",
    monthlyCost: 49.90,
    servingsLeft: 22,
    servingsTotal: 60,
    refill: "Jun 4",
    streakDays: 128,
    coachRecommended: false,
  },
];

export const SLOTS = [
  { id: "morning",      label: "Morning",     time: "07:00", icon: "training" },
  { id: "midday",       label: "Midday",      time: "12:30", icon: "nutrition" },
  { id: "pre_workout",  label: "Pre-workout", time: "17:30", icon: "training" },
  { id: "post_workout", label: "Post-workout",time: "19:30", icon: "nutrition" },
  { id: "evening",      label: "Evening",     time: "22:00", icon: "recovery" },
];

export const DAY_LETTERS = ["M","T","W","T","F","S","S"];

export const EVIDENCE_PALETTE = {
  "A":  "var(--pos)",
  "B+": "var(--acc-recov)",
  "B":  "var(--acc-recov)",
  "C":  "var(--warn)",
  "D":  "var(--neg)",
};

export const SUPPLEMENT_DB = [
  { name: "Creatine Monohydrate", category: "Performance", purpose: "Strength, power, hydration", evidence: "A",  inStack: true,  doseTypical: "3–5 g/d", notes: "Strongest evidence in supplementation. Loading optional." },
  { name: "Whey Protein Isolate", category: "Protein",     purpose: "Protein top-up, recovery",   evidence: "A",  inStack: true,  doseTypical: "20–40 g/serving", notes: "Best post-training. Casein for slow release." },
  { name: "Vitamin D3 (+K2)",     category: "Vitamin",     purpose: "Immune, bone, mood",          evidence: "A",  inStack: true,  doseTypical: "1000–4000 IU/d", notes: "Pair with K2 (MK-7) to direct Ca to bone." },
  { name: "Omega-3 (EPA/DHA)",    category: "Fatty acid",  purpose: "Inflammation, cognition, CV", evidence: "A",  inStack: true,  doseTypical: "1–3 g EPA+DHA/d", notes: "Triglyceride form > ethyl ester." },
  { name: "Magnesium Glycinate",  category: "Mineral",     purpose: "Sleep, HRV, muscle relax",   evidence: "A",  inStack: true,  doseTypical: "200–400 mg elemental", notes: "Glycinate or citrate; avoid oxide." },
  { name: "Beta-Alanine",         category: "Performance", purpose: "Muscle endurance",            evidence: "B+", inStack: true,  doseTypical: "3.2–6 g/d", notes: "Causes harmless paraesthesia." },
  { name: "Caffeine Anhydrous",   category: "Stimulant",   purpose: "Performance, alertness",     evidence: "A",  inStack: true,  doseTypical: "3–6 mg/kg pre-exercise", notes: "Cycle to maintain sensitivity." },
  { name: "Ashwagandha (KSM-66)", category: "Adaptogen",   purpose: "Cortisol, stress, sleep",    evidence: "B+", inStack: true,  doseTypical: "300–600 mg/d", notes: "8w on / 2w off recommended." },
  { name: "L-Citrulline Malate",  category: "Performance", purpose: "Vasodilation, pump, recovery",evidence: "B",  inStack: false, doseTypical: "6–8 g pre-exercise", notes: "Often confused with arginine." },
  { name: "Zinc Picolinate",      category: "Mineral",     purpose: "Immune, testosterone, sleep",evidence: "B",  inStack: false, doseTypical: "15–30 mg/d", notes: "Long-term needs copper balance." },
  { name: "L-Theanine",           category: "Amino acid",  purpose: "Calm focus (with caffeine)", evidence: "B+", inStack: false, doseTypical: "100–200 mg", notes: "Pairs 1:2 with caffeine." },
  { name: "BCAAs",                category: "Amino acid",  purpose: "Anti-catabolic (claimed)",   evidence: "C",  inStack: false, doseTypical: "5–10 g", notes: "Largely redundant with whole protein." },
  { name: "Tribulus Terrestris",  category: "Adaptogen",   purpose: "Libido (claimed)",            evidence: "D",  inStack: false, doseTypical: "—", notes: "No evidence for testosterone." },
  { name: "Rhodiola Rosea",       category: "Adaptogen",   purpose: "Fatigue, focus, stress",     evidence: "B",  inStack: false, doseTypical: "200–600 mg/d", notes: "Look for 3% rosavins / 1% salidroside." },
  { name: "Tongkat Ali",          category: "Adaptogen",   purpose: "Cortisol, libido, T",        evidence: "B",  inStack: false, doseTypical: "200–400 mg/d", notes: "Recent solid trials; quality varies." },
];

export const INTERACTIONS = [
  {
    severity: "moderate",
    items: ["Caffeine Anhydrous", "Ashwagandha"],
    title: "Stimulant + adaptogen — opposing autonomic effects",
    body: "Caffeine (taken 17:30) drives sympathetic tone, Ashwagandha (22:00) reduces it. Spacing of >4 hours generally avoids interference — your current schedule is fine, but moving Ashwagandha earlier would blunt its sleep effect.",
    affects: "Sleep onset, HRV recovery",
    recommendation: "Keep ≥4h gap — current schedule (4.5h) is within tolerance."
  },
  {
    severity: "low",
    items: ["Magnesium Glycinate", "Whey Isolate"],
    title: "Mineral + protein — minor absorption competition",
    body: "Whey taken post-workout (~19:30) contains ~250 mg calcium per scoop, which slightly reduces magnesium absorption (~10–15%) if taken within 2 hours. Your Magnesium is at 22:00, giving 2.5h separation.",
    affects: "Mg bioavailability",
    recommendation: "Current 2.5h gap is sufficient. No action needed."
  },
  {
    severity: "info",
    items: ["Vitamin D3", "Vitamin K2 (MK-7)", "Magnesium Glycinate"],
    title: "Bone-health synergy stack",
    body: "D3 → K2 → Mg form a complementary triad: D3 promotes Ca absorption, K2 directs it to bone, Mg activates D3 enzymatically. This is a positive interaction.",
    affects: "Bone density, vascular calcification risk",
    recommendation: "Maintain current stack."
  },
];

// ══ G-499: `EXTENDED_STACK`/`EXTENDED_LABS` stehen woanders ══════
//
// `[cmd]` **Sie liegen in `daten-extended.ts`.** `[read]` **Ein
// Modul ist unteilbar:** solange sie hier standen, zogen die vier
// Dateien, die `STACK` importieren, die PED-Wirkstoffliste mit ins
// Seitenbuendel — auch ohne sie je zu benutzen.
