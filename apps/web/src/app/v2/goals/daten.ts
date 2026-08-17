// Die Daten und Formeln des Goals-Moduls.
//
// QUELLEN:
//   theme-v1/module-goals.jsx:7-144    — Ziele, Koerpermasse, Umfaenge
//   theme-v1/module-goals-pro.jsx:5-192 — Phasenmodelle, TDEE, Beitraege,
//                                          Posen, Verhaeltnisse
//
// `[read]` Wie bei Recovery (`motor.ts`) steht hier NUR, was kein JSX
// ist. Die Vorlage trennt das nicht — sie legt Daten und Ansicht in
// dieselbe Datei. Getrennt, weil die Formeln geprueft werden und die
// Ansicht nicht.
//
// **Die Formeln bleiben stehen.** Dieselbe Regel wie beim Nutrition
// score (G-05), Training score (G-16) und Recovery (G-21):
// `calcGoalProgress`, `findBottleneck` und `calcRatios` sind
// uebernommen, nicht erfunden. Ein Test legt sie daneben.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript statt JS, benannte
// Exporte statt globaler Konstanten.
//
// `[cmd]` DIE ZAHLEN SIND ERFUNDEN — mit einer Ausnahme, die zaehlt:
// die Composition-Kachel rechnet Mifflin-St Jeor, und genau diese
// Formel liegt seit GO-04 als `goals.berechne_zielwerte` echt vor.
// Welche Kachel auf welche Spalte passt, steht in
// docs/ssot/94-goals-mockup.md.

// ── Ziele (module-goals.jsx:7-99) ───────────────────────────────
export type Ziel = {
  id: string
  type: string
  title: string
  icon: string
  color: string
  target: { weight?: number; bf?: number; time?: number; count?: number }
  current: { weight?: number; bf?: number; time?: number; count?: number }
  start: { weight?: number; bf?: number; time?: number; count?: number }
  started: string
  deadline: string
  linkedModules: string[]
  progress: number
  pace: 'ahead' | 'on-track' | 'behind'
  note: string
  history: Array<{ d: string; weight?: number; bf?: number; time?: number; count?: number }>
}

export const ACTIVE_GOALS: Ziel[] = [
  {
    id: 'g1', type: 'Body composition', title: '78 kg @ 12% body fat',
    icon: 'goals', color: 'var(--acc-goals)',
    target: { weight: 78, bf: 12 }, current: { weight: 79.4, bf: 13.8 }, start: { weight: 81.2, bf: 15.4 },
    started: '2026-03-15', deadline: '2026-08-01',
    linkedModules: ['nutrition', 'training', 'recovery'],
    progress: 0.61, pace: 'on-track',
    note: 'Lean recomposition — preserve strength during fat loss.',
    history: [
      { d: 'Mar 15', weight: 81.2, bf: 15.4 },
      { d: 'Mar 29', weight: 80.8, bf: 15.0 },
      { d: 'Apr 12', weight: 80.5, bf: 14.6 },
      { d: 'Apr 26', weight: 80.0, bf: 14.2 },
      { d: 'May 10', weight: 79.6, bf: 13.9 },
      { d: 'May 16', weight: 79.4, bf: 13.8 },
    ],
  },
  {
    id: 'g2', type: 'Strength', title: 'Bench Press 1RM · 130 kg',
    icon: 'training', color: 'var(--acc-train)',
    target: { weight: 130 }, current: { weight: 122.5 }, start: { weight: 110 },
    started: '2026-02-04', deadline: '2026-07-15',
    linkedModules: ['training', 'recovery'],
    progress: 0.625, pace: 'ahead',
    note: 'Periodized block · linked to PPL Block 3-5.',
    history: [
      { d: 'Feb 4', weight: 110.0 }, { d: 'Feb 25', weight: 112.5 },
      { d: 'Mar 18', weight: 115.0 }, { d: 'Apr 8', weight: 117.5 },
      { d: 'Apr 29', weight: 120.0 }, { d: 'May 13', weight: 122.5 },
    ],
  },
  {
    id: 'g3', type: 'Performance', title: '10 km run · sub 45:00',
    icon: 'training', color: 'var(--acc-recov)',
    target: { time: 45 * 60 }, current: { time: 47 * 60 + 20 }, start: { time: 52 * 60 + 40 },
    started: '2026-01-12', deadline: '2026-09-15',
    linkedModules: ['training', 'recovery'],
    progress: 0.71, pace: 'on-track',
    note: 'Z2 base + 1× weekly tempo. Sub-50 hit Apr 12, sub-48 hit May 3.',
    history: [
      { d: 'Jan 12', time: 52 * 60 + 40 }, { d: 'Feb 14', time: 50 * 60 + 15 },
      { d: 'Mar 10', time: 48 * 60 + 50 }, { d: 'Apr 12', time: 49 * 60 + 5 },
      { d: 'May 3', time: 47 * 60 + 40 }, { d: 'May 14', time: 47 * 60 + 20 },
    ],
  },
  {
    id: 'g4', type: 'Habit', title: 'Meditate 5×/week for 12 weeks',
    icon: 'brain', color: 'var(--acc-buddy)',
    target: { count: 60 }, current: { count: 28 }, start: { count: 0 },
    started: '2026-03-30', deadline: '2026-06-22',
    linkedModules: ['recovery'],
    progress: 0.466, pace: 'behind',
    note: 'Currently 14d streak. Slipped 2 weeks in April.',
    history: [],
  },
]

export const COMPLETED_GOALS = [
  { id: 'gc1', title: 'Sub-50 min 10k', deadline: '2026-04-30', completedOn: '2026-04-12', icon: 'training', color: 'var(--acc-recov)' },
  { id: 'gc2', title: 'Deadlift 1RM · 180 kg', deadline: '2026-03-15', completedOn: '2026-03-04', icon: 'training', color: 'var(--acc-train)' },
  { id: 'gc3', title: 'TRT initiation + 6mo stabilization', deadline: '2025-03-12', completedOn: '2025-03-08', icon: 'medical', color: 'var(--acc-medic)' },
]

/**
 * Die Koerpermasse. `[cmd]` module-goals.jsx:101-121 erzeugt die
 * Verlaeufe mit `Math.random()` — **das geht hier nicht**: der Server
 * wuerfelt andere Zahlen als der Browser, und React meldet eine
 * Hydrations-Abweichung. Ersetzt durch eine feste Pseudofolge mit
 * derselben Form (Sinus + Drift); der Zufallsanteil ist an den Index
 * gebunden statt an den Zufallsgenerator.
 */
function streuung(i: number, staerke: number): number {
  // Deterministischer Ersatz fuer (Math.random() - 0.5) * staerke.
  return (Math.sin(i * 12.9898) * 43758.5453 % 1 - 0.5) * staerke
}

export const BODY_METRICS = {
  weight: {
    current: 79.4, unit: 'kg',
    history: Array.from({ length: 180 }, (_, i) => {
      const t = (i - 30) / 150
      return 81.5 - t * 2.3 + Math.sin(i * 0.4) * 0.4 + streuung(i, 0.4)
    }),
  },
  bodyfat: {
    current: 13.8, unit: '%',
    history: Array.from({ length: 30 }, (_, i) => 15.4 - (i / 30) * 1.7 + streuung(i + 500, 0.3)),
  },
  leanMass: {
    current: 68.4, unit: 'kg',
    history: Array.from({ length: 30 }, (_, i) => 67.9 + (i / 30) * 0.5 + Math.sin(i * 0.5) * 0.2),
  },
}

// [cmd] module-goals.jsx:123-136.
export const MEASUREMENTS = [
  { id: 'neck', label: 'Neck', current: 41.0, last: 41.2, history: [42.0, 41.8, 41.6, 41.4, 41.2, 41.0] },
  { id: 'chest', label: 'Chest', current: 108.0, last: 109.0, history: [109.5, 109.4, 109.2, 109.0, 109.0, 108.0] },
  { id: 'shoulder', label: 'Shoulders', current: 124.5, last: 124.0, history: [122.0, 122.5, 123.0, 123.5, 124.0, 124.5] },
  { id: 'waist', label: 'Waist (navel)', current: 82.0, last: 83.5, history: [86.0, 85.0, 84.0, 83.5, 83.0, 82.0] },
  { id: 'hip', label: 'Hip', current: 96.0, last: 96.5, history: [98.0, 97.5, 97.0, 96.5, 96.5, 96.0] },
  { id: 'armR', label: 'Arm · right (flexed)', current: 39.5, last: 39.3, history: [38.5, 38.8, 39.0, 39.2, 39.3, 39.5] },
  { id: 'armL', label: 'Arm · left (flexed)', current: 39.0, last: 38.8, history: [38.0, 38.3, 38.5, 38.6, 38.8, 39.0] },
  { id: 'forearm', label: 'Forearm', current: 32.0, last: 32.0, history: [31.5, 31.6, 31.8, 32.0, 32.0, 32.0] },
  { id: 'thighR', label: 'Thigh · right', current: 60.0, last: 60.5, history: [61.0, 60.8, 60.5, 60.5, 60.5, 60.0] },
  { id: 'thighL', label: 'Thigh · left', current: 59.5, last: 60.0, history: [60.5, 60.3, 60.0, 60.0, 60.0, 59.5] },
  { id: 'calfR', label: 'Calf · right', current: 39.5, last: 39.3, history: [39.0, 39.1, 39.2, 39.3, 39.3, 39.5] },
  { id: 'calfL', label: 'Calf · left', current: 39.0, last: 38.8, history: [38.5, 38.7, 38.8, 38.8, 38.8, 39.0] },
]

export const PHOTO_PROGRESSION = [
  { date: '2026-03-15', weight: 81.2, bf: 15.4 },
  { date: '2026-04-01', weight: 80.6, bf: 14.8 },
  { date: '2026-04-15', weight: 80.0, bf: 14.4 },
  { date: '2026-05-01', weight: 79.7, bf: 14.0 },
  { date: '2026-05-15', weight: 79.4, bf: 13.8 },
]

/**
 * Tage bis zur Frist.
 *
 * `[cmd]` module-goals.jsx:315-323. Die Vorlage rechnet gegen ein
 * FESTES Heute (`new Date("2026-05-16T12:00:00")`) — uebernommen.
 * Ein echtes `Date.now()` waere hier falsch: die Fristen der Attrappe
 * liegen 2026 und liefen sonst je nach Tag anders ab. Ausserdem
 * wuerde ein bewegliches Heute serverseitig anders rechnen als im
 * Browser und eine Hydrations-Abweichung erzeugen.
 */
export const HEUTE_DER_VORLAGE = '2026-05-16'

export function daysToDeadline(deadline: string): string {
  const target = new Date(`${deadline}T12:00:00`)
  const now = new Date(`${HEUTE_DER_VORLAGE}T12:00:00`)
  const days = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return `overdue ${-days}d`
  if (days < 30) return `${days}d left`
  if (days < 365) return `${Math.floor(days / 7)}w left`
  return `${Math.floor(days / 30)}mo left`
}

export function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Phasenmodelle (module-goals-pro.jsx:5-68) ───────────────────
export type Phase = {
  id: string
  name: string
  color: string
  variants?: Record<string, {
    deficit: number[]; rate: string; protein: number[]; maxWeeks: number; dietBreak: string
  }>
  params?: Record<string, string | number[] | number>
  guards?: string[]
  next: string[]
  subPhases?: Array<{ name: string; weeks: string; deficit?: number; cardio?: string; special?: boolean }>
  refeeds?: string
  peakWeek?: string
  exits?: string[]
  success?: string[]
  bestFor?: string[]
  purpose?: string[]
  annual?: Array<{ months: string; phase: string; focus: string }>
  autoTransitions?: boolean
  coachOverride?: boolean
  requires?: string
}

export const GOAL_PHASES: Record<string, Phase> = {
  fat_loss: {
    id: 'fat_loss', name: 'Fat Loss', color: 'var(--acc-suppl)',
    variants: {
      moderate: { deficit: [-400, -600], rate: '0.5–0.75% BW/wk', protein: [1.8, 2.4], maxWeeks: 20, dietBreak: '1 wk every 8' },
      aggressive: { deficit: [-750, -1000], rate: '1.0–1.5% BW/wk', protein: [2.3, 3.1], maxWeeks: 8, dietBreak: '1 wk every 4' },
    },
    guards: ['strength_loss > 10% → reduce deficit', 'weekly_loss > 1.0kg → +150 kcal', 'duration > max → force transition'],
    next: ['reverse_diet', 'maintenance', 'lean_bulk'],
  },
  lean_bulk: {
    id: 'lean_bulk', name: 'Lean Bulk', color: 'var(--acc-train)',
    params: { surplus: [200, 400], rate: '0.25–0.5% BW/month', protein: [1.6, 2.2], fatPct: [25, 35], maxWeeks: 52 },
    guards: ['bf_increase > 2% in 4 wk → −100 kcal', 'gain > 1kg/wk → surplus too high', 'no strength 3+ wk → check training'],
    next: ['mini_cut', 'maintenance', 'contest_prep'],
  },
  maintenance: {
    id: 'maintenance', name: 'Maintenance', color: 'var(--acc-recov)',
    params: { target: 'TDEE ± 100', protein: [1.4, 2.0], duration: 'indefinite' },
    purpose: ['Stabilisierung nach Cut/Bulk', 'Langfristige Ernährung', 'Lifestyle Mode'],
    next: ['fat_loss', 'lean_bulk', 'recomp', 'contest_prep'],
  },
  recomp: {
    id: 'recomp', name: 'Recomposition', color: 'var(--acc-goals)',
    params: { trainingDays: '+200 kcal', restDays: '−300 kcal', weeklyAvg: '~maintenance', protein: [2.0, 2.4] },
    success: ['BF% fallend', 'Kraft steigend', 'Gewicht stabil'],
    bestFor: ['Anfänger', 'Nach Trainingspause', 'Muscle Memory'],
    next: ['lean_bulk', 'fat_loss'],
  },
  contest_prep: {
    id: 'contest_prep', name: 'Contest Prep', color: 'var(--neg)',
    params: { duration: '16–24 wk', protein: [2.3, 3.1] },
    subPhases: [
      { name: 'early', weeks: '24–16', deficit: -300, cardio: 'low' },
      { name: 'mid', weeks: '16–8', deficit: -600, cardio: 'moderate' },
      { name: 'late', weeks: '8–2', deficit: -750, cardio: 'high' },
      { name: 'peak_week', weeks: '1', special: true },
    ],
    refeeds: '1–2×/wk after week 8 · high carb',
    peakWeek: '3d carb depletion · 2d carb load · sodium manipulation',
    guards: ['BF% < 5% (M) / < 10% (F) → health warning', 'strength_loss > 20% → reduce deficit', 'hormonal symptoms → medical check'],
    next: ['reverse_diet'],
  },
  reverse_diet: {
    id: 'reverse_diet', name: 'Reverse Diet', color: 'var(--acc-coach)',
    params: { weeklyIncrease: [50, 150], primaryMacro: 'carbs', protein: 'maintain', maxWeeks: 16 },
    exits: ['reached estimated TDEE', 'gain > 0.5kg/wk', 'user satisfied'],
    guards: ['weekly gain > 0.5kg → slow increase', 'hunger normalized → close to TDEE'],
    next: ['maintenance', 'lean_bulk', 'fat_loss'],
  },
  expert_bb_annual: {
    id: 'expert_bb_annual', name: 'Expert BB · Annual', color: 'var(--acc-buddy)',
    annual: [
      { months: '1–4', phase: 'LEAN_BULK', focus: 'Masseaufbau' },
      { months: '5–6', phase: 'MAINTENANCE', focus: 'Transition' },
      { months: '7–10', phase: 'CONTEST_PREP', focus: 'Diäten' },
      { months: '11', phase: 'PEAK WEEK + SHOW', focus: 'Wettkampf' },
      { months: '12', phase: 'REVERSE_DIET', focus: 'Recovery' },
    ],
    autoTransitions: true,
    coachOverride: true,
    // [cmd] Die Vorlage setzt `requires` ZWEIMAL (Zeile 57 "advanced",
    // Zeile 65 "experience ≥ advanced"); der zweite gewinnt in JS.
    // Uebernommen ist der zweite — das ist, was dort laeuft.
    requires: 'experience ≥ advanced',
    next: [],
  },
}

// [cmd] module-goals-pro.jsx:71-92.
export const PHASE_STATE = {
  current: 'recomp',
  variant: null as string | null,
  startedOn: '2026-03-15',
  week: 9,
  maxWeeks: 20,
  adherence: 94,
  weightTrend: -0.18,
  strengthTrend: +4.2,
  bfTrend: -0.12,
  experience: 'advanced',
  recommendation: {
    action: 'no_change',
    reason: 'On track — BF ↓, strength ↑, weight stable. Textbook recomp response.',
    confidence: 0.88,
  },
  suggestedTransition: {
    to: 'lean_bulk',
    inWeeks: 4,
    why: 'Recomp yield flattening after ~13 weeks. Lean bulk would capture better strength gains.',
  },
}

// [cmd] module-goals-pro.jsx:95-107.
export const TDEE_STATE = {
  method: 'adaptive',
  current: 2847,
  formulaBaseline: 2732,
  alpha: 0.3,
  history: [2680, 2712, 2745, 2760, 2788, 2801, 2822, 2835, 2847],
  weeklyIntakeAvg: 2610,
  weightDeltaKg: -0.18,
  lastAdjustment: { week: 8, delta: -100, reason: 'Plateau trotz 94% Adherence' },
  crossModule: { trainingLoad: +64, recoveryPenalty: -22 },
  weightMA7: 79.42,
  weightRaw: 79.6,
}

// ── Modulbeitraege (module-goals-pro.jsx:110-154) ───────────────
export const CONTRIBUTIONS: Record<string, number> = {
  nutrition: 88, training: 92, recovery: 74, supplements: 94, medical: 86,
}

export const CONTRIB_WEIGHTS = {
  body_composition_gain: {
    nutrition: 0.30, training: 0.35, recovery: 0.20, supplements: 0.10, medical: 0.05,
  } as Record<string, number>,
}

export type Fortschritt = {
  overall: number
  status: 'excellent' | 'on_track' | 'needs_attention' | 'at_risk'
  breakdown: Record<string, number>
}

/**
 * Der gewichtete Gesamtwert.
 *
 * `[cmd]` module-goals-pro.jsx:121-135, unveraendert uebernommen —
 * einschliesslich der Division durch `wsum`. `[read]` Der
 * Umsetzungsplan fuehrt sie als W-8: die Gewichte summieren sich zu
 * 1.0, die Division ist damit wirkungslos. **Sie bleibt trotzdem
 * stehen** — die Vorlage ist die Vorgabe, und das Ergebnis ist
 * dasselbe. Wer sie streicht, aendert nichts am Wert, aber die
 * Herkunft ist dann nicht mehr nachvollziehbar.
 */
export function calcGoalProgress(
  contrib: Record<string, number>, weights: Record<string, number>,
): Fortschritt {
  let total = 0
  let wsum = 0
  const breakdown: Record<string, number> = {}
  for (const [m, w] of Object.entries(weights)) {
    const s = contrib[m] ?? 0
    breakdown[m] = Math.round(s * w)
    total += s * w
    wsum += w
  }
  const overall = wsum > 0 ? Math.round(total / wsum) : 0
  return {
    overall,
    status: overall >= 80 ? 'excellent' : overall >= 65 ? 'on_track' : overall >= 50 ? 'needs_attention' : 'at_risk',
    breakdown,
  }
}

export type Engpass = {
  module: string; current: number; avg: number; gap: number; rec: string
}

/** [cmd] module-goals-pro.jsx:137-154. */
export function findBottleneck(
  contrib: Record<string, number>, weights: Record<string, number>,
): Engpass | null {
  const vals = Object.values(contrib)
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length
  let worst = ''
  let gap = 0
  for (const [m, s] of Object.entries(contrib)) {
    const g = (avg - s) * (weights[m] ?? 0)
    if (g > gap) { gap = g; worst = m }
  }
  if (!worst || gap < 0.5) return null
  const recs: Record<string, string> = {
    nutrition: 'Makros tracken + Protein-Ziel priorisieren',
    training: 'Training-Frequenz erhöhen oder Routine optimieren',
    recovery: 'Schlaf auf 7–8h erhöhen + Recovery-Aktivitäten',
    supplements: 'Supplement-Einnahme konsistenter gestalten',
    medical: 'Nächste Blutuntersuchung einplanen',
  }
  return {
    module: worst, current: contrib[worst], avg: Math.round(avg),
    gap: Math.round(gap * 10) / 10, rec: recs[worst],
  }
}

// ── Posen (module-goals-pro.jsx:157-161) ────────────────────────
export const POSE_SETS: Record<string, string[]> = {
  mandatory: ['Front Double Biceps', 'Front Lat Spread', 'Side Chest L', 'Side Chest R', 'Rear Double Biceps', 'Rear Lat Spread', 'Side Triceps L', 'Side Triceps R', 'Abdominal & Thigh', 'Most Muscular'],
  quarter: ['Front Relaxed', 'Right Side', 'Back Relaxed', 'Left Side'],
  detail: ['Delts', 'Biceps', 'Triceps', 'Chest', 'Abs', 'Back', 'Quads', 'Hamstrings', 'Calves'],
}

// ── 13 Umfaenge (module-goals-pro.jsx:164-178) ──────────────────
export const CIRCUMFERENCES = [
  { id: 'neck', label: 'Neck', v: 41.0, prev: 41.2 },
  { id: 'shoulders', label: 'Shoulders', v: 124.5, prev: 124.0 },
  { id: 'chest', label: 'Chest', v: 108.0, prev: 109.0 },
  { id: 'bicep_l', label: 'Bicep L', v: 39.0, prev: 38.8 },
  { id: 'bicep_r', label: 'Bicep R', v: 39.5, prev: 39.3 },
  { id: 'forearm_l', label: 'Forearm L', v: 31.8, prev: 31.7 },
  { id: 'forearm_r', label: 'Forearm R', v: 32.0, prev: 32.0 },
  { id: 'waist', label: 'Waist', v: 82.0, prev: 83.5 },
  { id: 'hips', label: 'Hips', v: 96.0, prev: 96.5 },
  { id: 'thigh_l', label: 'Thigh L', v: 59.5, prev: 60.0 },
  { id: 'thigh_r', label: 'Thigh R', v: 60.0, prev: 60.5 },
  { id: 'calf_l', label: 'Calf L', v: 39.0, prev: 38.8 },
  { id: 'calf_r', label: 'Calf R', v: 39.5, prev: 39.3 },
]

/** [cmd] module-goals-pro.jsx:180-192. Der goldene Schnitt bleibt. */
export function calcRatios(c: typeof CIRCUMFERENCES) {
  const g = (id: string) => c.find(x => x.id === id)?.v ?? 0
  const armAvg = (g('bicep_l') + g('bicep_r')) / 2
  const legAvg = (g('thigh_l') + g('thigh_r')) / 2
  return {
    shoulderWaist: +(g('shoulders') / g('waist')).toFixed(3),
    goldenTarget: 1.618,
    armSymmetry: +(Math.min(g('bicep_l'), g('bicep_r')) / armAvg * 100).toFixed(1),
    legSymmetry: +(Math.min(g('thigh_l'), g('thigh_r')) / legAvg * 100).toFixed(1),
    vTaper: Math.min(100, Math.round((g('shoulders') / g('waist') / 1.618) * 100)),
    reeves: 88,
  }
}

// ── Composition: die Profilwerte der Vorlage ────────────────────
// [cmd] module-goals.jsx:548-560. Tom: 36 J., 184 cm, 79,4 kg, 13,8 %.
//
// `[read]` **HIER LIEGT DIE UEBERSCHNEIDUNG MIT ECHTEN DATEN.** Die
// Vorlage rechnet Mifflin-St Jeor und multipliziert mit dem
// Aktivitaetsfaktor — genau das, was GO-04 als
// `goals.berechne_zielwerte` gebaut hat. Die Zahlen hier sind
// trotzdem die der Vorlage; angebunden wird im Folgeauftrag.
export const COMP_PROFIL = {
  age: 36, height: 184, weight: 79.4, bf: 13.8, sex: 'male' as const,
  activityFactor: 1.725,
}

/** Mifflin-St Jeor. [cmd] module-goals.jsx:556-558. */
export function calcBMR(p: typeof COMP_PROFIL): number {
  return p.sex === 'male'
    ? 10 * p.weight + 6.25 * p.height - 5 * p.age + 5
    : 10 * p.weight + 6.25 * p.height - 5 * p.age - 161
}

export function compWerte(p = COMP_PROFIL) {
  const heightM = p.height / 100
  const bmi = p.weight / (heightM * heightM)
  const leanMass = p.weight * (1 - p.bf / 100)
  const ffmi = leanMass / (heightM * heightM)
  const ffmiAdj = ffmi + 6.1 * (1.8 - heightM)
  const bmr = calcBMR(p)
  const tdee = bmr * p.activityFactor
  return { bmi, leanMass, ffmi, ffmiAdj, bmr, tdee }
}
