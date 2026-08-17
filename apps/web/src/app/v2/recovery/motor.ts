// Der Rechenkern des Recovery-Moduls.
//
// QUELLE: theme-v1/module-recovery-engine.jsx (394 Zeilen).
//
// `[read]` Diese Datei ist die Trennlinie des Moduls: sie enthaelt NUR
// Daten und Formeln, kein JSX. Genau so liegt sie in der Vorlage —
// `-engine.jsx` definiert keine einzige Komponente, sondern schiebt am
// Ende 30 Namen nach `window` (Zeile 382-394), aus denen sich der
// Rahmen bedient.
//
// **Die Formeln bleiben stehen.** Dieselbe Regel wie beim Nutrition
// score (G-05) und beim Training score (G-16): die Gewichtung stammt
// aus der Vorlage und wird uebernommen, nicht erfunden. Betrifft
// `baseRecoveryCurve`, die vier Modifikatoren, `calcHRVScore` (z-Wert),
// `calcSleepScore` (0.40/0.40/0.20), `calcRecoveryScore` in beiden
// Modi, `calcTrainingLoadScore` und die acht Uebertrainingssignale.
// Ein Test legt sie daneben.
//
// GEAENDERT IST NUR DAS TECHNISCHE: TypeScript statt JS, benannte
// Exporte statt `Object.assign(window, …)`.
//
// `[cmd]` DIE ZAHLEN SIND ERFUNDEN. `recovery` hat kein Schema — in
// `supabase/_pipeline/` kommt der Begriff in keiner SQL-Datei vor.
// Was hier steht, ist der Datensatz der Vorlage, unveraendert.

// ── 18 Muskelgruppen der Koerperkarte (F3) ──────────────────────
// [cmd] module-recovery-engine.jsx:5-10.
export const MUSCLE_GROUPS_BODYMAP = [
  'trapezius', 'upper_back', 'lower_back', 'chest',
  'biceps', 'triceps', 'forearm', 'front_deltoids', 'back_deltoids',
  'abs', 'obliques', 'adductor', 'hamstring',
  'quadriceps', 'abductors', 'calves', 'gluteal', 'neck',
] as const

export type MuscleSlug = typeof MUSCLE_GROUPS_BODYMAP[number]

// [cmd] module-recovery-engine.jsx:12-18.
export const MUSCLE_LABEL: Record<string, string> = {
  trapezius: 'Trapezius', upper_back: 'Upper back', lower_back: 'Lower back', chest: 'Chest',
  biceps: 'Biceps', triceps: 'Triceps', forearm: 'Forearm', front_deltoids: 'Front delts',
  back_deltoids: 'Rear delts', abs: 'Abs', obliques: 'Obliques', adductor: 'Adductors',
  hamstring: 'Hamstrings', quadriceps: 'Quadriceps', abductors: 'Abductors', calves: 'Calves',
  gluteal: 'Glutes', neck: 'Neck',
}

/**
 * Muskelname des Trainingsmoduls → Kuerzel der Koerperkarte.
 *
 * `[cmd]` module-recovery-engine.jsx:21-28. Das ist die Naht zwischen
 * den Modulen: Training kennt „Pectoralis Major", Recovery kennt
 * `chest`. Wer die beiden Module verbindet, braucht genau diese Karte.
 */
export const MUSCLE_SLUG_MAP: Record<string, string> = {
  'Pectoralis Major': 'chest', 'Latissimus Dorsi': 'upper_back', 'Trapezius': 'trapezius',
  'Erector Spinae': 'lower_back', 'Quadriceps': 'quadriceps', 'Hamstrings': 'hamstring',
  'Gluteus Maximus': 'gluteal', 'Triceps Brachii': 'triceps', 'Biceps Brachii': 'biceps',
  'Rectus Abdominis': 'abs', 'Obliques': 'obliques', 'Anterior Deltoid': 'front_deltoids',
  'Posterior Deltoid': 'back_deltoids', 'Gastrocnemius': 'calves', 'Adductors': 'adductor',
  'Abductors': 'abductors', 'Forearm Flexors': 'forearm', 'Sternocleidomastoid': 'neck',
}

// ── Die Silhouette (viewBox 0 0 100 126) ────────────────────────
// [cmd] module-recovery-engine.jsx:34-65. Kopf+Rumpf+Beine als ein
// Teilpfad, jeder Arm als eigener; `nonzero` vereint sie an der
// Schulter. Zeichen fuer Zeichen uebernommen — eine nachgezeichnete
// Silhouette waere eine andere Figur.
export const SILHOUETTE_PATH = [
  // Kopf + Hals + Rumpf + Beine
  'M 50 2 c -4.2 0 -7.5 3.3 -7.5 7.5 0 2.7 0.7 4.8 2 6.4 '
  + 'c -0.9 1.1 -1.2 2.4 -1.2 3.9 '
  + 'c -4.4 0.9 -7.9 2.2 -10.5 4 c -2.6 1.8 -4 4.2 -4.3 7.2 '
  + 'l -1.4 14.6 c -0.3 3.4 -0.5 6.6 -0.5 9.6 '
  + 'l 0 9.4 c 0 3.2 0.4 6 1.2 8.4 '
  + 'l 0 4.2 c 0 2.8 0.4 5.4 1.2 7.8 l 2.2 6.4 c 0.6 1.8 0.9 3.6 0.9 5.4 '
  + 'l 0 16 c 0 2.4 0.5 4.4 1.4 6 l 1.4 2.5 c 0.9 1.5 2.1 2.3 3.8 2.3 '
  + 'l 2.5 0 c 2.2 0 3.5 -1.2 3.7 -3.6 l 1.5 -18 '
  + 'c 0.2 -2.7 0.6 -5.1 1.2 -7.4 l 1.9 -7 c 0.4 -1.4 0.7 -1.4 1.1 0 '
  + 'l 1.9 7 c 0.6 2.3 1 4.7 1.2 7.4 l 1.5 19 '
  + 'c 0.2 2.4 1.5 3.6 3.7 3.6 l 2.5 0 c 1.7 0 3 -0.8 3.9 -2.4 '
  + 'l 1.5 -2.7 c 0.9 -1.6 1.4 -3.7 1.4 -6.2 l 0 -17.8 '
  + 'c 0 -1.8 0.3 -3.6 0.9 -5.4 l 2.2 -6.4 c 0.8 -2.4 1.2 -5 1.2 -7.8 '
  + 'l 0 -4.2 c 0.8 -2.4 1.2 -5.2 1.2 -8.4 l 0 -9.4 '
  + 'c 0 -3 -0.2 -6.2 -0.5 -9.6 l -1.4 -14.6 '
  + 'c -0.3 -3 -1.7 -5.4 -4.3 -7.2 c -2.6 -1.8 -6.1 -3.1 -10.5 -4 '
  + 'c 0 -1.5 -0.3 -2.8 -1.2 -3.9 c 1.3 -1.6 2 -3.7 2 -6.4 '
  + 'c 0 -4.2 -3.3 -7.5 -7.5 -7.5 z',
  // linker Arm — am Deltoid am breitesten, laeuft zum Handgelenk aus
  'M 33.2 23.8 C 25.5 24.6 19.4 27.2 16.8 32.4 '
  + 'L 18.4 49 L 21.2 65 L 23.4 74.2 '
  + 'C 25.4 75.8 28.8 75.8 30.6 74.2 '
  + 'L 30.2 60 L 30.9 45 L 32.4 33 z',
  // rechter Arm — gleiche Windung: Innenkante herunter, Aussenkante hoch
  'M 66.8 23.8 L 67.6 33 '
  + 'L 69.1 45 L 69.8 60 L 69.4 74.2 '
  + 'C 71.2 75.8 74.6 75.8 76.6 74.2 '
  + 'L 78.8 65 L 81.6 49 L 83.2 32.4 '
  + 'C 80.6 27.2 74.5 24.6 66.8 23.8 z',
].join(' ')

// [cmd] module-recovery-engine.jsx:69-104.
export const MUSCLE_PATHS: Record<string, { view: 'front' | 'back'; d: string }> = {
  // ── VORNE ─────────────────────────────────────────────────────
  neck: { view: 'front', d: 'M 44.5 15.5 c 3.5 1.2 7.5 1.2 11 0 v 8 c -3.5 1 -7.5 1 -11 0 z' },
  front_deltoids: { view: 'front', d: 'M 33 24.2 C 26 25.2 20.4 27.6 17.4 32.4 l 1 8.6 l 13.2 -1.6 l 1.4 -15.2 z '
    + 'M 67 24.2 C 74 25.2 79.6 27.6 82.6 32.4 l -1 8.6 l -13.2 -1.6 l -1.4 -15.2 z' },
  chest: { view: 'front', d: 'M 33.5 27 c 4.6 -1.6 9.6 -2.4 15.9 -2.6 v 17.4 c -5.2 -0.2 -9.8 -0.9 -13.2 -2.3 c -2.8 -1.2 -3.6 -4.4 -2.7 -12.5 z '
    + 'M 66.5 27 c -4.6 -1.6 -9.6 -2.4 -15.9 -2.6 v 17.4 c 5.2 -0.2 9.8 -0.9 13.2 -2.3 c 2.8 -1.2 3.6 -4.4 2.7 -12.5 z' },
  abs: { view: 'front', d: 'M 41.5 43 h 17 v 22 c 0 3.2 -2.4 4.8 -8.5 4.8 c -6.1 0 -8.5 -1.6 -8.5 -4.8 z' },
  obliques: { view: 'front', d: 'M 34.4 43 c 2 0.3 4 0.6 5.6 0.8 v 24 c -3.2 -0.8 -5.2 -2.6 -6 -5.4 z '
    + 'M 65.6 43 c -2 0.3 -4 0.6 -5.6 0.8 v 24 c 3.2 -0.8 5.2 -2.6 6 -5.4 z' },
  biceps: { view: 'front', d: 'M 18.5 41.4 l 12.8 -1.5 l -0.9 15 l -13.3 1.4 z '
    + 'M 81.5 41.4 l -12.8 -1.5 l 0.9 15 l 13.3 1.4 z' },
  forearm: { view: 'front', d: 'M 19.4 57.6 l 11.2 -1.2 l -0.4 17 c -1.8 1.6 -5.2 1.6 -7.2 0 z '
    + 'M 80.6 57.6 l -11.2 -1.2 l 0.4 17 c 1.8 1.6 5.2 1.6 7.2 0 z' },
  abductors: { view: 'front', d: 'M 33.2 66 c 2.4 0.6 4.4 1 6.2 1.2 l -0.4 8.6 l -7 -1.4 z '
    + 'M 66.8 66 c -2.4 0.6 -4.4 1 -6.2 1.2 l 0.4 8.6 l 7 -1.4 z' },
  quadriceps: { view: 'front', d: 'M 36 78 c 4.4 -0.8 8.4 -0.5 10.4 1.2 l -1.3 24 c -1 2.6 -7.2 3 -9.8 0.8 l -0.9 -20 z '
    + 'M 64 78 c -4.4 -0.8 -8.4 -0.5 -10.4 1.2 l 1.3 24 c 1 2.6 7.2 3 9.8 0.8 l 0.9 -20 z' },
  adductor: { view: 'front', d: 'M 45.4 78 c 1.6 0.2 2.8 0.6 3.4 1.4 l -0.4 18 c -0.9 1.3 -2.6 1.3 -3.4 0 z '
    + 'M 54.6 78 c -1.6 0.2 -2.8 0.6 -3.4 1.4 l 0.4 18 c 0.9 1.3 2.6 1.3 3.4 0 z' },
  calves: { view: 'front', d: 'M 37 102 c 3.4 -0.8 6.8 -0.5 8.2 1.2 l -0.9 12.2 c -1.3 1.6 -6 1.6 -7.3 0 l -0.8 -9.6 z '
    + 'M 63 102 c -3.4 -0.8 -6.8 -0.5 -8.2 1.2 l 0.9 12.2 c 1.3 1.6 6 1.6 7.3 0 l 0.8 -9.6 z' },
  // ── HINTEN ────────────────────────────────────────────────────
  trapezius: { view: 'back', d: 'M 38.5 23.5 c 3.8 -1.4 7.6 -2 11.5 -2 c 3.9 0 7.7 0.6 11.5 2 l -1.9 11.5 c -3 1 -6.3 1.5 -9.6 1.5 c -3.3 0 -6.6 -0.5 -9.6 -1.5 z' },
  back_deltoids: { view: 'back', d: 'M 33 24.2 C 26 25.2 20.4 27.6 17.4 32.4 l 1 8.6 l 13.2 -1.6 l 1.4 -15.2 z '
    + 'M 67 24.2 C 74 25.2 79.6 27.6 82.6 32.4 l -1 8.6 l -13.2 -1.6 l -1.4 -15.2 z' },
  upper_back: { view: 'back', d: 'M 33 36 c 5 -0.6 10.2 -0.9 16.4 -0.9 v 20 c -5.8 -0.2 -10.6 -1.1 -14 -3 c -2.8 -1.6 -3.4 -7.6 -2.4 -16.1 z '
    + 'M 67 36 c -5 -0.6 -10.2 -0.9 -16.4 -0.9 v 20 c 5.8 -0.2 10.6 -1.1 14 -3 c 2.8 -1.6 3.4 -7.6 2.4 -16.1 z' },
  lower_back: { view: 'back', d: 'M 37 56.5 h 26 v 12.5 c 0 2 -2.8 3 -13 3 c -10.2 0 -13 -1 -13 -3 z' },
  triceps: { view: 'back', d: 'M 18.5 41.4 l 12.8 -1.5 l -0.9 15 l -13.3 1.4 z '
    + 'M 81.5 41.4 l -12.8 -1.5 l 0.9 15 l 13.3 1.4 z' },
  gluteal: { view: 'back', d: 'M 35 68 c 4.6 -1.4 9.2 -1.4 13.8 0 v 11.5 c -4.6 1.9 -10.2 1.9 -14.3 -1 z '
    + 'M 65 68 c -4.6 -1.4 -9.2 -1.4 -13.8 0 v 11.5 c 4.6 1.9 10.2 1.9 14.3 -1 z' },
  hamstring: { view: 'back', d: 'M 36 80.5 c 4.4 -0.8 8.4 -0.5 10.4 1.2 l -1.3 21 c -1 2.4 -7.2 2.8 -9.8 0.6 l -0.9 -18 z '
    + 'M 64 80.5 c -4.4 -0.8 -8.4 -0.5 -10.4 1.2 l 1.3 21 c 1 2.4 7.2 2.8 9.8 0.6 l 0.9 -18 z' },
}

// ── Muskelerholung (F3 / SPEC_05) ───────────────────────────────
// [cmd] module-recovery-engine.jsx:109-132. Formeln unveraendert.
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t))

/** Die Grundkurve: 0 h → 10 %, 96 h → 100 %. */
export function baseRecoveryCurve(h: number): number {
  if (h < 12) return lerp(10, 30, h / 12)
  if (h < 24) return lerp(30, 50, (h - 12) / 12)
  if (h < 48) return lerp(50, 75, (h - 24) / 24)
  if (h < 72) return lerp(75, 90, (h - 48) / 24)
  if (h < 96) return lerp(90, 100, (h - 72) / 24)
  return 100
}

export const volumeMod = (s: number) => s <= 6 ? 1.10 : s <= 12 ? 1.00 : s <= 18 ? 0.85 : s <= 24 ? 0.70 : 0.50
export const sleepMod = (q: number) => q >= 8.5 ? 1.15 : q >= 7 ? 1.00 : q >= 5 ? 0.85 : 0.65
export const nutritionMod = (p: number, c: number) => (p >= 0.9 && c >= 0.95) ? 1.1 : p >= 0.8 ? 1.0 : p >= 0.6 ? 0.8 : 0.6
export const sorenessMod = (v: number) => v === 0 ? 1.1 : v === 1 ? 1.0 : v === 2 ? 0.75 : 0.50

export type MuscleRecovery = {
  value: number; base: number; vm: number; sm: number; nm: number; som: number
}

export function calcMuscleRecovery({
  hours, sets, sleepQuality, proteinPct, caloriePct, soreness,
}: {
  hours: number; sets: number; sleepQuality: number
  proteinPct: number; caloriePct: number; soreness: number
}): MuscleRecovery {
  const base = baseRecoveryCurve(hours)
  const vm = volumeMod(sets)
  const sm = sleepMod(sleepQuality)
  const nm = nutritionMod(proteinPct, caloriePct)
  const som = sorenessMod(soreness)
  return {
    value: Math.min(100, Math.round(base * vm * sm * nm * som)),
    base: Math.round(base), vm, sm, nm, som,
  }
}

// ── Trainingszustand je Muskel (aus dem Trainingsmodul) ─────────
// [cmd] module-recovery-engine.jsx:135-154.
export type MuscleState = { hours: number; sets: number; soreness: number; lastSession: string }

export const MUSCLE_STATE: Record<string, MuscleState> = {
  chest: { hours: 38, sets: 14, soreness: 1, lastSession: 'Push B · Wed' },
  front_deltoids: { hours: 38, sets: 10, soreness: 2, lastSession: 'Push B · Wed' },
  triceps: { hours: 38, sets: 12, soreness: 1, lastSession: 'Push B · Wed' },
  upper_back: { hours: 14, sets: 18, soreness: 2, lastSession: 'Pull A · Fri' },
  back_deltoids: { hours: 14, sets: 8, soreness: 2, lastSession: 'Pull A · Fri' },
  biceps: { hours: 14, sets: 10, soreness: 1, lastSession: 'Pull A · Fri' },
  forearm: { hours: 14, sets: 6, soreness: 0, lastSession: 'Pull A · Fri' },
  trapezius: { hours: 14, sets: 8, soreness: 1, lastSession: 'Pull A · Fri' },
  quadriceps: { hours: 62, sets: 20, soreness: 1, lastSession: 'Legs A · Tue' },
  hamstring: { hours: 62, sets: 12, soreness: 2, lastSession: 'Legs A · Tue' },
  gluteal: { hours: 62, sets: 14, soreness: 1, lastSession: 'Legs A · Tue' },
  calves: { hours: 62, sets: 8, soreness: 0, lastSession: 'Legs A · Tue' },
  adductor: { hours: 62, sets: 4, soreness: 1, lastSession: 'Legs A · Tue' },
  abductors: { hours: 62, sets: 4, soreness: 0, lastSession: 'Legs A · Tue' },
  lower_back: { hours: 62, sets: 10, soreness: 2, lastSession: 'Legs A · Tue' },
  abs: { hours: 110, sets: 9, soreness: 0, lastSession: 'Core · Sun' },
  obliques: { hours: 110, sets: 6, soreness: 0, lastSession: 'Core · Sun' },
  neck: { hours: 200, sets: 0, soreness: 0, lastSession: '—' },
}

/** Der Naehrstoffstand, mit dem die Vorlage rechnet. */
export const NUTRITION_INPUT = { proteinPct: 0.79, caloriePct: 0.68 }

// ── Der heutige Check-in ────────────────────────────────────────
// [cmd] module-recovery-engine.jsx:157-170.
export const CHECKIN = {
  date: '2026-08-15',
  logged_at: '07:12',
  sleep_hours: 7.7,
  sleep_quality: 8,
  subjective_feeling: 8,
  mood: 'good',
  soreness: Object.fromEntries(
    Object.entries(MUSCLE_STATE).map(([k, v]) => [k, v.soreness])) as Record<string, number>,
  stress_level: 3,
  alcohol_units: 0,
  caffeine_mg: 280,
  screen_time_before_bed: 25,
  hrv_rmssd: 64,
}

export const MOOD_MULTIPLIER: Record<string, number> = {
  motivated: 1.0, good: 0.8, neutral: 0.6, tired: 0.3, sick: 0.1,
}

export const MOOD_META = [
  { id: 'motivated', label: 'Motivated', pts: 5.0, c: 'var(--pos)' },
  { id: 'good', label: 'Good', pts: 4.0, c: 'var(--acc-recov)' },
  { id: 'neutral', label: 'Neutral', pts: 3.0, c: 'var(--fg-muted)' },
  { id: 'tired', label: 'Tired', pts: 1.5, c: 'var(--warn)' },
  { id: 'sick', label: 'Sick', pts: 0.5, c: 'var(--neg)' },
]

// ── Modalitaeten (F2 / F6) ──────────────────────────────────────
// [cmd] module-recovery-engine.jsx:182-216.
export const MODALITY_BONUS: Record<string, number> = {
  sauna: 2.0, cold_plunge: 1.5, contrast_therapy: 2.0, massage: 2.5,
  foam_rolling: 0.5, stretching: 0.5, yoga: 0.75, meditation: 1.0,
  breathwork: 1.0, nap: 1.5, active_recovery: 0.5,
}

/** Die Obergrenze. Sechs Anwendungen kaufen keinen besseren Wert. */
export const MAX_DAILY_BONUS = 5.0

export const MODALITY_META: Record<string, { label: string; icon: string; c: string }> = {
  sauna: { label: 'Sauna', icon: 'flame', c: 'var(--neg)' },
  cold_plunge: { label: 'Cold plunge', icon: 'droplet', c: 'var(--acc-recov)' },
  contrast_therapy: { label: 'Contrast therapy', icon: 'droplet', c: 'var(--acc-coach)' },
  massage: { label: 'Massage', icon: 'recovery', c: 'var(--acc-buddy)' },
  foam_rolling: { label: 'Foam rolling', icon: 'recovery', c: 'var(--acc-train)' },
  stretching: { label: 'Stretching', icon: 'recovery', c: 'var(--acc-goals)' },
  yoga: { label: 'Yoga', icon: 'recovery', c: 'var(--acc-goals)' },
  meditation: { label: 'Meditation', icon: 'brain', c: 'var(--acc-coach)' },
  breathwork: { label: 'Breathwork', icon: 'brain', c: 'var(--acc-buddy)' },
  nap: { label: 'Nap', icon: 'moon', c: 'var(--acc-recov)' },
  active_recovery: { label: 'Active recovery', icon: 'training', c: 'var(--acc-train)' },
}

export type ModalityEntry = {
  id: string; type: string; date: string; time: string; duration: number
  detail: string; immediate: number; nextDay: number | null; scoreDelta: number | null
}

export const MODALITY_LOG: ModalityEntry[] = [
  { id: 'ml1', type: 'cold_plunge', date: '2026-08-15', time: '07:08', duration: 3, detail: '12 °C', immediate: 8, nextDay: 7, scoreDelta: +4 },
  { id: 'ml2', type: 'stretching', date: '2026-08-15', time: '10:30', duration: 15, detail: 'hips + thoracic', immediate: 6, nextDay: null, scoreDelta: null },
  { id: 'ml3', type: 'sauna', date: '2026-08-14', time: '19:30', duration: 20, detail: '92 °C', immediate: 9, nextDay: 8, scoreDelta: +6 },
  { id: 'ml4', type: 'massage', date: '2026-08-12', time: '17:00', duration: 60, detail: 'deep tissue', immediate: 9, nextDay: 9, scoreDelta: +8 },
  { id: 'ml5', type: 'meditation', date: '2026-08-14', time: '22:00', duration: 12, detail: 'focused attention', immediate: 7, nextDay: 6, scoreDelta: +2 },
  { id: 'ml6', type: 'nap', date: '2026-08-13', time: '14:20', duration: 25, detail: 'post-lunch', immediate: 8, nextDay: null, scoreDelta: +3 },
]

export const TODAY_MODALITIES = MODALITY_LOG.filter(m => m.date === '2026-08-15')

export type ModalityBonus = { raw: number; capped: number; wasCapped: boolean }

export function calcModalityBonus(mods: Array<{ type: string }>): ModalityBonus {
  const raw = mods.reduce((s, m) => s + (MODALITY_BONUS[m.type] ?? 0), 0)
  return {
    raw: Math.round(raw * 10) / 10,
    capped: Math.min(raw, MAX_DAILY_BONUS),
    wasCapped: raw > MAX_DAILY_BONUS,
  }
}

// ── ACWR / Trainingslast (F2) ───────────────────────────────────
// [cmd] module-recovery-engine.jsx:219-225.
export const ACWR_DATA = { acute_7d: 2142, chronic_28d: 1980, acwr: 1.08 }

export function calcTrainingLoadScore(acwr: number): number {
  if (acwr >= 0.8 && acwr <= 1.3) return 1.0
  if (acwr < 0.8) return 0.9
  if (acwr <= 1.5) return 1.3 - (acwr - 1.3) * 2
  return Math.max(0.1, 1.5 - acwr)
}

// ── HRV (F4) ────────────────────────────────────────────────────
// [cmd] module-recovery-engine.jsx:228-241.
export const HRV_BASELINE = { avg_rmssd: 58.4, stddev_rmssd: 6.2, window_days: 30, samples: 28 }

/** z = (rmssd − Mittel) / Streuung, Wert = 70 + z × 15, gedeckelt. */
export function calcHRVScore(rmssd: number, base = HRV_BASELINE): { score: number; z: number } {
  const z = (rmssd - base.avg_rmssd) / base.stddev_rmssd
  return {
    score: Math.max(0, Math.min(100, Math.round(70 + z * 15))),
    z: Math.round(z * 100) / 100,
  }
}

export const HRV_LOG = [
  { date: '2026-08-15', rmssd: 64, method: 'phone_ppg', quality: 0.94, note: '' },
  { date: '2026-08-14', rmssd: 62, method: 'phone_ppg', quality: 0.91, note: '' },
  { date: '2026-08-13', rmssd: 58, method: 'chest_strap', quality: 0.99, note: 'orthostatic test' },
  { date: '2026-08-12', rmssd: 55, method: 'phone_ppg', quality: 0.88, note: 'late training' },
  { date: '2026-08-11', rmssd: 61, method: 'phone_ppg', quality: 0.93, note: '' },
  { date: '2026-08-10', rmssd: 59, method: 'wearable', quality: 0.96, note: '' },
  { date: '2026-08-09', rmssd: 52, method: 'phone_ppg', quality: 0.79, note: 'poor signal, moved' },
]

// ── Schlaf (F5) ─────────────────────────────────────────────────
// [cmd] module-recovery-engine.jsx:244-266.
export const SLEEP_DATA = {
  source: 'wearable',
  total_sleep_minutes: 462,
  time_in_bed_minutes: 492,
  sleep_efficiency: 94,
  deep_sleep_minutes: 79,
  rem_sleep_minutes: 101,
  light_sleep_minutes: 251,
  awake_minutes: 31,
  bedtime: '22:48',
  wake: '06:30',
}

export type SleepScore = {
  score: number; mode: 'wearable' | 'subjective'
  eff?: number; dur?: number; deep?: number; q?: number; d?: number
}

/**
 * Zwei Wege: mit Wearable 0.40/0.40/0.20, ohne 0.60/0.40.
 *
 * `[read]` Der zweite Weg ist der wichtigere — die Vorlage sagt selbst,
 * er sei „what most users get". Die Rechnung verweigert nie ein
 * Ergebnis, sie faellt zurueck.
 */
export function calcSleepScore(data: typeof SLEEP_DATA | null, checkin: typeof CHECKIN): SleepScore {
  if (data) {
    const eff = data.sleep_efficiency / 100
    const dur = Math.min(data.total_sleep_minutes / 480, 1)
    const deep = Math.min((data.deep_sleep_minutes ?? 0) / 90, 1)
    return { score: Math.round((eff * 0.4 + dur * 0.4 + deep * 0.2) * 100), mode: 'wearable', eff, dur, deep }
  }
  const q = (checkin.sleep_quality ?? 7) / 10
  const d = Math.min((checkin.sleep_hours ?? 7) / 8, 1)
  return { score: Math.round((q * 0.6 + d * 0.4) * 100), mode: 'subjective', q, d }
}

// ── Erholungswert · zwei Modi (F2) ──────────────────────────────
// [cmd] module-recovery-engine.jsx:269-307.
export function avgSoreness(soreness: Record<string, number>): number {
  const vals = Object.values(soreness || {})
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
}

export type ScoreTerm = { key: string; label: string; raw: string; w: number; val: number }

export type RecoveryScore = {
  mode: string; terms: ScoreTerm[]; subtotal: number; bonus: ModalityBonus
  score: number; hrv: { score: number; z: number }; tls: number
  sor: number; nutritionScore: number
}

/**
 * Der Erholungswert in zwei Modi.
 *
 * `manual` gewichtet Schlafqualitaet mit 30 und kennt kein HRV;
 * `hrv` nimmt 25 fuer HRV und senkt die Schlafqualitaet auf 15.
 * **Beide Gewichtungen stammen aus der Vorlage** und werden von einem
 * Test festgehalten.
 */
export function calcRecoveryScore(mode: 'manual' | 'hrv' = 'hrv'): RecoveryScore {
  const c = CHECKIN
  const tls = calcTrainingLoadScore(ACWR_DATA.acwr)
  const nutritionScore = 0.88 // aus dem Nutrition-Modul
  const bonus = calcModalityBonus(TODAY_MODALITIES)
  const sor = avgSoreness(c.soreness)
  const hrv = calcHRVScore(c.hrv_rmssd)

  let terms: ScoreTerm[]
  if (mode === 'manual') {
    terms = [
      { key: 'sleep_quality', label: 'Sleep quality', raw: `${c.sleep_quality}/10`, w: 30, val: (c.sleep_quality / 10) * 30 },
      { key: 'sleep_hours', label: 'Sleep duration', raw: `${c.sleep_hours}h`, w: 15, val: (Math.min(c.sleep_hours, 8) / 8) * 15 },
      { key: 'subjective', label: 'Subjective feel', raw: `${c.subjective_feeling}/10`, w: 15, val: (c.subjective_feeling / 10) * 15 },
      { key: 'soreness', label: 'Soreness (inv.)', raw: `avg ${sor.toFixed(2)}/3`, w: 10, val: (1 - sor / 3) * 10 },
      { key: 'training_load', label: 'Training load', raw: `ACWR ${ACWR_DATA.acwr}`, w: 15, val: tls * 15 },
      { key: 'nutrition', label: 'Nutrition', raw: `${Math.round(nutritionScore * 100)}%`, w: 10, val: nutritionScore * 10 },
      { key: 'mood', label: 'Mood', raw: c.mood, w: 5, val: MOOD_MULTIPLIER[c.mood] * 5 },
    ]
  } else {
    terms = [
      { key: 'sleep_quality', label: 'Sleep quality', raw: `${c.sleep_quality}/10`, w: 15, val: (c.sleep_quality / 10) * 15 },
      { key: 'sleep_hours', label: 'Sleep duration', raw: `${c.sleep_hours}h`, w: 15, val: (Math.min(c.sleep_hours, 8) / 8) * 15 },
      { key: 'hrv', label: 'HRV', raw: `${c.hrv_rmssd}ms · z ${hrv.z}`, w: 25, val: (hrv.score / 100) * 25 },
      { key: 'subjective', label: 'Subjective feel', raw: `${c.subjective_feeling}/10`, w: 10, val: (c.subjective_feeling / 10) * 10 },
      { key: 'soreness', label: 'Soreness (inv.)', raw: `avg ${sor.toFixed(2)}/3`, w: 10, val: (1 - sor / 3) * 10 },
      { key: 'training_load', label: 'Training load', raw: `ACWR ${ACWR_DATA.acwr}`, w: 15, val: tls * 15 },
      { key: 'nutrition', label: 'Nutrition', raw: `${Math.round(nutritionScore * 100)}%`, w: 10, val: nutritionScore * 10 },
    ]
  }
  const subtotal = terms.reduce((s, t) => s + t.val, 0)
  const score = Math.round(Math.min(100, subtotal + bonus.capped))
  return { mode, terms, subtotal: Math.round(subtotal * 10) / 10, bonus, score, hrv, tls, sor, nutritionScore }
}

// ── Bereitschaftsstufen (F2) ────────────────────────────────────
// [cmd] module-recovery-engine.jsx:310-318.
export const READINESS_LEVELS = [
  { min: 90, level: 'excellent', label: 'Excellent', advice: 'Maximum intensity · PR day', c: 'var(--pos)' },
  { min: 80, level: 'good', label: 'Good', advice: 'Normal training', c: 'var(--pos)' },
  { min: 70, level: 'moderate', label: 'Moderate', advice: 'Moderate intensity', c: 'var(--acc-recov)' },
  { min: 60, level: 'poor', label: 'Poor', advice: 'Light training only', c: 'var(--warn)' },
  { min: 40, level: 'rest', label: 'Rest', advice: 'Rest day recommended', c: 'var(--warn)' },
  { min: 0, level: 'rest', label: 'Forced rest', advice: 'Mandatory break · see a doctor if this persists', c: 'var(--neg)' },
]

export const readinessFor = (s: number) =>
  READINESS_LEVELS.find(l => s >= l.min) ?? READINESS_LEVELS[READINESS_LEVELS.length - 1]

// ── Uebertraining · acht Signale (F7) ───────────────────────────
// [cmd] module-recovery-engine.jsx:321-346.
export const OT_DATA = {
  hrv_7d_avg: 58.7, hrv_baseline: 58.4,
  resting_hr_avg: 53, rhr_baseline: 52,
  sleep_quality_3d_avg: 7.7,
  subjective_3d_avg: 7.7,
  soreness_hotspot_days: 2,
  recovery_score_3d_avg: 79,
  motivation_5d_avg: 4.0,
  training_trend: 'improving',
}

type OtData = typeof OT_DATA

export const OVERTRAINING_SIGNALS: Array<{
  id: string; label: string; detail: (d: OtData) => string; check: (d: OtData) => boolean
}> = [
  { id: 'hrv_low', label: 'HRV below 90% of baseline', detail: d => `7d avg ${d.hrv_7d_avg} vs baseline ${d.hrv_baseline} (threshold ${(d.hrv_baseline * 0.9).toFixed(1)})`, check: d => d.hrv_7d_avg < d.hrv_baseline * 0.90 },
  { id: 'rhr_high', label: 'Resting HR elevated +5 bpm', detail: d => `${d.resting_hr_avg} bpm vs baseline ${d.rhr_baseline}`, check: d => d.resting_hr_avg > d.rhr_baseline + 5 },
  { id: 'sleep_poor', label: 'Sleep quality below 6 (3d)', detail: d => `3d avg ${d.sleep_quality_3d_avg}/10`, check: d => d.sleep_quality_3d_avg < 6 },
  { id: 'fatigue', label: 'Subjective feeling ≤ 4 (3d)', detail: d => `3d avg ${d.subjective_3d_avg}/10`, check: d => d.subjective_3d_avg <= 4 },
  { id: 'soreness', label: 'Soreness hotspot ≥ 3 days', detail: d => `${d.soreness_hotspot_days} consecutive days`, check: d => d.soreness_hotspot_days >= 3 },
  { id: 'score_low', label: 'Recovery score below 55 (3d)', detail: d => `3d avg ${d.recovery_score_3d_avg}`, check: d => d.recovery_score_3d_avg < 55 },
  { id: 'mood_low', label: 'Motivation ≤ 3 (5d)', detail: d => `5d avg ${d.motivation_5d_avg}/5`, check: d => d.motivation_5d_avg <= 3 },
  { id: 'performance', label: 'Training trend declining', detail: d => `trend: ${d.training_trend}`, check: d => d.training_trend === 'declining' },
]

export type OvertrainingResult = {
  results: Array<{ id: string; label: string; fired: boolean; detailText: string }>
  count: number
  severity: 'normal' | 'moderate' | 'high' | 'critical'
}

/** Die Schwere haengt an der ANZAHL, nicht an einem einzelnen Signal. */
export function evaluateOvertraining(data: OtData = OT_DATA): OvertrainingResult {
  const results = OVERTRAINING_SIGNALS.map(s => ({
    id: s.id, label: s.label, fired: s.check(data), detailText: s.detail(data),
  }))
  const n = results.filter(r => r.fired).length
  const severity = n >= 7 ? 'critical' : n >= 5 ? 'high' : n >= 3 ? 'moderate' : 'normal'
  return { results, count: n, severity }
}

// ── Protokolle (F8) ─────────────────────────────────────────────
// [cmd] module-recovery-engine.jsx:349-363.
export type Protocol = {
  id: string; name: string; goal: string; days: number | string
  activities: string[]; tasks: Array<{ t: string; done: boolean }>
}

export const RECOVERY_PROTOCOLS: Protocol[] = [
  { id: 'active_recovery_week', name: 'Active Recovery Week', goal: 'General restoration', days: 7,
    activities: ['Light cardio 20–30 min', 'Yoga or mobility flow', 'Full-body stretching', 'Sleep 8h+ target'],
    tasks: [{ t: 'Zone-1 cardio 25 min', done: true }, { t: 'Mobility flow · hips', done: true }, { t: 'Stretch 15 min', done: false }, { t: 'In bed by 22:30', done: false }] },
  { id: 'passive_deload', name: 'Passive Deload', goal: 'Overtraining recovery', days: 7,
    activities: ['Training volume −50%', 'Sleep priority 9h', 'No high-intensity work', 'Daily HRV measurement'],
    tasks: [] },
  { id: 'sleep_optimization', name: 'Sleep Optimization', goal: 'Poor sleep quality', days: 14,
    activities: ['Fixed bedtime ±15 min', 'No screens 60 min before bed', 'Caffeine cutoff 14:00', 'Magnesium 400 mg evening', 'Room ≤ 19 °C'],
    tasks: [] },
  { id: 'injury_protocol', name: 'Injury Protocol', goal: 'Acute injury', days: '7–14',
    activities: ['RICE first 72 h', 'Physio appointment', 'Modified training plan', 'Load monitoring'],
    tasks: [] },
]

export const ACTIVE_PROTOCOL = { id: 'active_recovery_week', day: 3, of: 7, started: '2026-08-13' }

// ── Offene Punkte (F10) ─────────────────────────────────────────
// [cmd] module-recovery-engine.jsx:366-380.
export type PendingAction = { type: string; priority: 'high' | 'normal' | 'low'; text: string }

export function recoveryPendingActions(): PendingAction[] {
  const out: PendingAction[] = []
  const hour = 14
  if (hour >= 10 && !CHECKIN.logged_at) out.push({ type: 'morning_checkin', priority: 'high', text: 'No check-in logged today' })
  const ot = evaluateOvertraining()
  if (ot.severity !== 'normal') out.push({ type: 'overtraining_alert', priority: 'high', text: `${ot.count} overtraining signals active · ${ot.severity}` })
  const openTasks = RECOVERY_PROTOCOLS.find(p => p.id === ACTIVE_PROTOCOL.id)?.tasks.filter(t => !t.done) ?? []
  if (openTasks.length) out.push({ type: 'protocol_task', priority: 'normal', text: `${openTasks.length} protocol tasks open today · ${openTasks.map(t => t.t).join(', ')}` })
  // Die Vorlage setzt `daysSince = 0` fest; der Zweig ist damit tot,
  // bleibt aber stehen — er zeigt, dass die Regel vorgesehen ist.
  const daysSince = 0
  if (daysSince >= 3) out.push({ type: 'hrv_measurement', priority: 'normal', text: `No HRV measurement for ${daysSince} days` })
  const unrated = MODALITY_LOG.filter(m => m.date === '2026-08-14' && m.nextDay == null)
  if (unrated.length) out.push({ type: 'next_day_modality', priority: 'low', text: `Rate yesterday's ${MODALITY_META[unrated[0].type].label.toLowerCase()}` })
  return out
}

// ── Stress (aus module-crossmodule-rest.jsx) ────────────────────
// `[cmd]` Der Tab „Stress" steht in KEINER der fuenf Recovery-Dateien.
// Beide Rahmen rufen `window.RecoveryStress` auf; definiert ist es in
// `module-crossmodule-rest.jsx:22`. Die Daten stehen dort ab Zeile 5.
export const STRESS_TODAY = { score: 44, band: 'moderate', hrvImpact: -4, trend: 'up' }

export const STRESS_SOURCES = [
  { k: 'Work load', v: 62, note: 'Two deadlines this week' },
  { k: 'Sleep debt', v: 48, note: '1.6 h short across 5 nights' },
  { k: 'Training load', v: 55, note: 'ACWR 1.08 — inside the window' },
  { k: 'Life events', v: 20, note: 'Nothing logged' },
  { k: 'Caffeine timing', v: 51, note: '200 mg at 17:30 on training days' },
  { k: 'Alcohol', v: 5, note: 'None in 14 days' },
]

export const STRESS_BANDS = [
  { to: 25, label: 'Low', color: 'var(--pos)', desc: 'Full training capacity' },
  { to: 50, label: 'Moderate', color: 'var(--acc-recov)', desc: 'Normal load, watch sleep' },
  { to: 75, label: 'Elevated', color: 'var(--warn)', desc: 'Cut volume 10–20 %' },
  { to: 100, label: 'High', color: 'var(--neg)', desc: 'Deload or rest day' },
]

export const STRESS_14D = [38, 41, 36, 44, 52, 48, 42, 39, 45, 51, 47, 43, 46, 44]
