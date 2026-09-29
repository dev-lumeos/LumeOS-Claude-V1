// Der Katalog `goals.goal_strategies` — G-541.
//
// `[cmd]` **Bis 14:00 hatten zehn Elemente des Vorschaupanels keine
// Quelle** (gemeldet in G-534/A5: Sub-phases, Guards, Exit conditions,
// Success metrics, Jahreszyklus, Best for, Purpose, Editor,
// Hoechstdauer, Protein). `[cmd]` **Seit G-538 stehen sie als Spalten
// in einer Tabelle mit 17 Zeilen.**
//
// ══ WAS GEMESSEN WURDE, BEVOR DIESE DATEI ENTSTAND ═════════════════
//
// `[cmd]` **2026-09-29, gegen die laufende Datenbank — je Element,
// wie viele der 17 Zeilen INHALT tragen:**
//
//     editor_modes  17     guards         7     purpose    1
//     protein       16     sub_phases     1     exits      1
//     max_duration   9     best_for       1     success    1
//                                              annual     1
//
// `[read]` **Eine Spalte zu haben heisst nicht, einen Wert zu
// haben.** `[read]` **Sechs der zehn Elemente sind in genau EINER
// Zeile gefuellt** — `body_recomp` traegt `success` und `best_for`,
// `maintain` traegt `purpose`, `reverse_diet` traegt `exits`,
// `contest_prep` traegt `sub_phases`, `expert_bb_annual` traegt
// `annual`.
//
// `[read]` **Deshalb entscheidet nicht das Element ueber den Strich,
// sondern die ZEILE** (A2): dieselbe Strategie zeigt `guards` als
// Liste und `exits` als Strich, und der Grund steht daneben.
//
// ── Der Schluessel ─────────────────────────────────────────────────
//
// `[cmd]` **`goal_phases.strategie_code` ist ein Fremdschluessel auf
// `goal_strategies.code`** — gemessen ueber
// `constraint_column_usage`. `[read]` **Das ist die Verbindung
// zwischen Phase und Katalog, nicht der Phasenname:** von den neun
// `PHASENARTEN` haben nur sechs eine gleichnamige Zeile
// (`contest_prep`, `expert_bb_annual`, `lean_bulk`, `mini_cut`,
// `peak_week`, `reverse_diet`) — `fat_loss`, `recomp` und
// `maintenance` haben keine.
//
// `[read]` **Die Strategie ist die feinere Einteilung:** wo die
// Phasenart `fat_loss` sagt, kennt der Katalog `aggressive_cut`,
// `moderate_cut`, `conservative_cut` und `mini_cut` — jede mit
// eigenem Faktor, eigener Rate, eigenen Makros. **Das loest die
// Variantenkachel aus G-534 auf:** sie zeigte drei Woerter ohne eine
// einzige Zahl, weil `phase_rate_rules` leer war und die Varianten
// keine Zeilen hatten. Sie haben jetzt welche — es sind eigene
// Strategien, keine Varianten.

import { createSessionClient } from '@lumeos/shared/session'

/** Ein Abschnitt aus `sub_phases`. Die Form kommt aus den Daten. */
export type Teilphase = {
  name: string
  /** `"24→16"` oder eine Wochenzahl — die Spalte fuehrt beides. */
  weeks: string | null
  deficit: number | null
  cardio: string | null
  special: boolean
}

/** Ein Monatsblock aus `annual`. */
export type Jahresblock = {
  months: string
  phase: string
  focus: string | null
}

/**
 * Eine Zeile aus `goal_strategies`.
 *
 * `[read]` **Die Felder heissen wie die Spalten** — wer die Tabelle
 * kennt, findet sich hier zurecht, und ein umbenanntes Feld waere
 * eine zweite Wahrheit.
 */
export type Strategie = {
  code: string
  label: string
  description: string
  icon: string
  category: string
  tier: 'simple' | 'advanced'
  tdee_modifier: number | null
  weight_change_target_percent: number | null
  max_duration_weeks: number | null
  protein_per_kg: number | null
  fat_percent: number | null
  macro_cycling: boolean
  refeed_schedule: boolean
  auto_adjust: boolean
  peak_week: boolean
  badge: string | null
  warnings: string[]
  requirements: Anforderungen
  guards: string[]
  next_codes: string[]
  exits: string[]
  success: string[]
  best_for: string[]
  purpose: string[]
  editor_modes: string[]
  sub_phases: Teilphase[]
  annual: Jahresblock[]
}

/**
 * Was eine Strategie verlangt.
 *
 * `[cmd]` **Gemessen: vier der 17 Zeilen tragen ueberhaupt etwas** —
 * `aggressive_cut` und `expert_bb_annual` je `min_experience`,
 * `contest_prep` beides, `peak_week` nur `coach_approval`.
 */
export type Anforderungen = {
  min_experience?: string
  coach_approval?: boolean
  min_body_fat?: number
}

const zahl = (v: unknown): number | null => {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

const liste = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

function teilphasen(v: unknown): Teilphase[] {
  if (!Array.isArray(v)) return []
  return v.flatMap((r) => {
    if (typeof r !== 'object' || r === null) return []
    const o = r as Record<string, unknown>
    if (typeof o.name !== 'string') return []
    // `[read]` **`weeks` ist mal Text (`"24→16"`), mal Zahl (`1`)** —
    // gemessen in `contest_prep`. Beides wird Text.
    const w = o.weeks
    return [{
      name: o.name,
      weeks: typeof w === 'string' ? w : typeof w === 'number' ? String(w) : null,
      deficit: zahl(o.deficit),
      cardio: typeof o.cardio === 'string' ? o.cardio : null,
      special: o.special === true,
    }]
  })
}

function jahresbloecke(v: unknown): Jahresblock[] {
  if (!Array.isArray(v)) return []
  return v.flatMap((r) => {
    if (typeof r !== 'object' || r === null) return []
    const o = r as Record<string, unknown>
    if (typeof o.months !== 'string' || typeof o.phase !== 'string') return []
    return [{
      months: o.months,
      phase: o.phase,
      focus: typeof o.focus === 'string' ? o.focus : null,
    }]
  })
}

function anforderungen(v: unknown): Anforderungen {
  if (typeof v !== 'object' || v === null) return {}
  const o = v as Record<string, unknown>
  const a: Anforderungen = {}
  if (typeof o.min_experience === 'string') a.min_experience = o.min_experience
  if (o.coach_approval === true) a.coach_approval = true
  const bf = zahl(o.min_body_fat)
  if (bf !== null) a.min_body_fat = bf
  return a
}

function zeile(r: Record<string, unknown>): Strategie {
  return {
    code: String(r.code),
    label: String(r.label),
    description: String(r.description),
    icon: String(r.icon),
    category: String(r.category),
    tier: r.tier === 'simple' ? 'simple' : 'advanced',
    tdee_modifier: zahl(r.tdee_modifier),
    weight_change_target_percent: zahl(r.weight_change_target_percent),
    max_duration_weeks: zahl(r.max_duration_weeks),
    protein_per_kg: zahl(r.protein_per_kg),
    fat_percent: zahl(r.fat_percent),
    macro_cycling: r.macro_cycling === true,
    refeed_schedule: r.refeed_schedule === true,
    auto_adjust: r.auto_adjust === true,
    peak_week: r.peak_week === true,
    badge: typeof r.badge === 'string' && r.badge !== '' ? r.badge : null,
    warnings: liste(r.warnings),
    requirements: anforderungen(r.requirements),
    guards: liste(r.guards),
    next_codes: liste(r.next_codes),
    exits: liste(r.exits),
    success: liste(r.success),
    best_for: liste(r.best_for),
    purpose: liste(r.purpose),
    editor_modes: liste(r.editor_modes),
    sub_phases: teilphasen(r.sub_phases),
    annual: jahresbloecke(r.annual),
  }
}

/**
 * Alle Strategien, alphabetisch je Rang.
 *
 * `[cmd]` **RLS erlaubt `authenticated` genau SELECT** — gemessen an
 * `pg_policies`: eine Regel `goal_strategies_select` mit `true`.
 * `[read]` **Der Katalog gehoert niemandem** — er ist fuer alle
 * gleich, deshalb kein `user_id`-Filter.
 */
export async function ladeStrategien(): Promise<Strategie[]> {
  const { data, error } = await createSessionClient()
    .schema('goals')
    .from('goal_strategies')
    .select('*')
    .order('tier', { ascending: true })
    .order('label', { ascending: true })

  if (error) throw new Error(`goal_strategies: ${error.message}`)
  return (data ?? []).map(r => zeile(r as Record<string, unknown>))
}

/**
 * Das Profil, gegen das A4 sperrt — **aus echten Spalten**.
 *
 * `[cmd]` **Beide Quellen gemessen, 2026-09-29:**
 *
 *     Erfahrung   `public.profiles.experience_level`
 *                 CHECK: beginner · advanced · pro · elite (oder NULL)
 *     Coach       `coach.relationships`, `status = 'active'`
 *                 RLS: der Klient darf seine eigene Zeile lesen
 *
 * `[read]` **Kein `min_body_fat` in den 17 Zeilen** — gemessen:
 * `requirements` fuehrt nur `min_experience` und `coach_approval`.
 * **Das Feld bleibt trotzdem in der Pruefung**, weil das Altrepo es
 * kennt und eine spaetere Zeile es tragen kann; es wird hier nur
 * nicht befuellt.
 */
export async function ladeStrategieProfil(userId: string): Promise<{
  experience: string | null
  hasCoach: boolean
}> {
  const db = createSessionClient()

  const [p, c] = await Promise.all([
    db.from('profiles').select('experience_level').eq('id', userId).maybeSingle(),
    // `[read]` **`head: true` mit `count`** — die Zeile selbst wird
    // nicht gebraucht, nur ob es eine gibt.
    db.schema('coach').from('relationships')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', userId).eq('status', 'active'),
  ])

  if (p.error) throw new Error(`profiles: ${p.error.message}`)
  // `[read]` **Ein Fehler beim Coach sperrt nicht** — sonst waere ein
  // Leserecht-Problem als „kein Coach" zu lesen und die Sperre
  // truege einen falschen Grund.
  if (c.error) throw new Error(`coach.relationships: ${c.error.message}`)

  const e = (p.data as { experience_level?: unknown } | null)?.experience_level
  return {
    experience: typeof e === 'string' ? e : null,
    hasCoach: (c.count ?? 0) > 0,
  }
}
