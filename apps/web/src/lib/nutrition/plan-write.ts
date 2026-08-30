// Schreibpfad fuer Essensplaene — G-267 / G-268.
//
// **Tom, 2026-08-29:** *,,new plan geht nix"* und *,,wenn man plaene
// erstellen kann dann kann man die auch editieren"*.
//
// `[read]` **Im letzten Durchgang wurde der Knopf bewusst nicht
// gebaut:** *,,ein Knopf, der ein Formular oeffnet, das die Haelfte
// seiner Felder nicht speichern kann, ist schlimmer als einer, der
// wartet."* `[cmd]` **Seit dem 2026-08-30 stehen die sechs Spalten —
// nachgemessen, nicht dem Bericht geglaubt** (die Lehre aus G-273,
// wo eine „gebaute" Funktion live fehlte).
//
// Die Logik liegt hier, die Route uebersetzt nur HTTP — dieselbe
// Teilung wie in `diary-write.ts`.
//
// Laeuft ausschliesslich serverseitig.
import { z } from 'zod'

import { createSessionClient } from '@lumeos/shared/session'
import { DiaryWriteError } from './diary-model'

/**
 * Die erlaubten Werte, wie die CHECKs sie fuehren.
 *
 * `[cmd]` **Am 2026-08-30 aus `pg_constraint` gelesen**, nicht
 * ausgedacht: `meal_plans_lifecycle_type_check` und
 * `meal_plans_plan_origin_check`.
 */
export const ZYKLUS_WERTE = ['once', 'rollover', 'sequence'] as const
export const STATUS_WERTE = [
  'assigned', 'active', 'completed', 'paused', 'archived',
] as const

/**
 * Ein neuer Plan.
 *
 * `[read]` **`plan_origin` steht NICHT im Schema der Eingabe.** Wer
 * ueber diese Route anlegt, erstellt selbst — **die Herkunft wird
 * gesetzt, nicht erfragt.** Sonst koennte ein Browser einen Plan als
 * `coach_created` ausgeben und damit die Sperre aus G-269 umgehen.
 */
export const planAnlegenSchema = z.object({
  art: z.literal('plan'),
  name: z.string().trim().min(1, 'Der Plan braucht einen Namen.').max(120),
  description: z.string().trim().max(500).nullish(),
  target_kcal: z.number().positive().max(20000).nullish(),
  target_protein_g: z.number().nonnegative().max(2000).nullish(),
  target_carbs_g: z.number().nonnegative().max(3000).nullish(),
  target_fat_g: z.number().nonnegative().max(1000).nullish(),
  lifecycle_type: z.enum(ZYKLUS_WERTE).nullish(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum als YYYY-MM-DD.').nullish(),
  days_count: z.number().int().positive().max(365).nullish(),
})

/**
 * Eine Aenderung an einem vorhandenen Plan.
 *
 * `[read]` **`plan_origin` fehlt auch hier** — die Herkunft eines
 * Plans aendert sich nicht, und sie umzuschreiben waere genau der
 * Weg, die Bearbeitungssperre auszuhebeln.
 */
export const planAendernSchema = z.object({
  art: z.literal('plan_aendern'),
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullish(),
  target_kcal: z.number().positive().max(20000).nullish(),
  target_protein_g: z.number().nonnegative().max(2000).nullish(),
  target_carbs_g: z.number().nonnegative().max(3000).nullish(),
  target_fat_g: z.number().nonnegative().max(1000).nullish(),
  lifecycle_type: z.enum(ZYKLUS_WERTE).nullish(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  days_count: z.number().int().positive().max(365).nullish(),
  status: z.enum(STATUS_WERTE).optional(),
})

export type PlanAnlegen = z.infer<typeof planAnlegenSchema>
export type PlanAendern = z.infer<typeof planAendernSchema>

/** Was die Route zurueckgibt. */
export type GespeicherterPlan = {
  id: string
  name: string
  status: string
  plan_origin: string | null
  lifecycle_type: string | null
}

async function sitzung() {
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new DiaryWriteError('NO_SESSION', 'Keine angemeldete Session.')
  return { db: client.schema('nutrition'), user }
}

/**
 * Ob der angemeldete Nutzer diesen Plan aendern darf — G-269.
 *
 * `[cmd]` **E-29: ueber die Funktion, nicht ueber die Tabelle.**
 * `coach.darf_nutrition_plan_aendern(p_client)` prueft volle Sicht,
 * `nutrition_auto_apply` UND Stufe 5 — die drei Bedingungen stehen
 * dort und nicht hier.
 *
 * `[read]` **Ein selbst erstellter Plan braucht keine Freigabe.** Die
 * Funktion wird nur gefragt, wenn die Herkunft es verlangt — sonst
 * wuerde eine Coach-Regel ueber eigene Plaene bestimmen.
 */
export async function darfAendern(planOrigin: string | null): Promise<boolean> {
  if (planOrigin !== 'coach_created' && planOrigin !== 'marketplace') return true
  const client = createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return false
  const { data, error } = await client
    .schema('coach')
    .rpc('darf_nutrition_plan_aendern', { p_client: user.id })
  if (error) return false
  return data === true
}

/**
 * Einen Plan anlegen — G-267.
 *
 * `[cmd]` **`plan_origin = 'self_created'` wird hier gesetzt**, nicht
 * vom Browser geschickt.
 *
 * `[cmd]` **`status` bleibt bei der Vorgabe `'assigned'`** — ein
 * neuer Plan ist noch nicht aktiv. **Aktivieren ist ein eigener
 * Vorgang** (`MealPlanActivationModal` in SPEC_10), und ihn hier
 * mitzumachen hiesse, zwei Entscheidungen in einen Knopf zu legen.
 */
export async function planAnlegen(eingabe: PlanAnlegen): Promise<GespeicherterPlan> {
  const { db, user } = await sitzung()
  const { art: _art, ...felder } = eingabe
  const { data, error } = await db
    .from('meal_plans')
    .insert({
      ...felder,
      user_id: user.id,
      plan_origin: 'self_created',
    })
    .select('id, name, status, plan_origin, lifecycle_type')
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  return data as unknown as GespeicherterPlan
}

/**
 * Einen Plan aendern — G-268.
 *
 * `[read]` **Die Sperre sitzt hier, nicht nur in der Oberflaeche.**
 * Ein ausgegrauter Knopf ist eine Bitte; die Pruefung im Schreibweg
 * ist die Regel.
 */
export async function planAendern(eingabe: PlanAendern): Promise<GespeicherterPlan> {
  const { db } = await sitzung()
  const { art: _art, id, ...felder } = eingabe

  // Erst die Herkunft lesen — sie entscheidet, ob geaendert werden
  // darf. `[read]` Die Zeilenrechte begrenzen ohnehin auf eigene
  // Plaene; diese Pruefung geht darueber hinaus.
  const { data: vorher, error: leseFehler } = await db
    .from('meal_plans')
    .select('plan_origin')
    .eq('id', id)
    .single()
  if (leseFehler) throw new DiaryWriteError('WRITE_FAILED', leseFehler.message)

  const herkunft = (vorher as unknown as { plan_origin: string | null }).plan_origin
  if (!(await darfAendern(herkunft))) {
    throw new DiaryWriteError(
      'FORBIDDEN',
      herkunft === 'coach_created'
        ? 'Dieser Plan kommt von deinem Coach und ist für direkte Änderungen gesperrt.'
        : 'Dieser Plan stammt aus dem Marktplatz und wird unverändert übernommen.',
    )
  }

  const { data, error } = await db
    .from('meal_plans')
    .update(felder)
    .eq('id', id)
    .select('id, name, status, plan_origin, lifecycle_type')
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  return data as unknown as GespeicherterPlan
}
