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
// G-298: der CHECK in ausfuehrbarer Form - eine Stelle, nicht zwei.
import {
  EINTRAG_TYPEN, MAHLZEIT_TYPEN, bauEintrag, verletztCheck,
  naechstePosition,
} from './plan-eintrag-lage'
// C-372/G-306: Wochen, Kopie und die zwei Sperren.
import {
  positionenGesperrt, AKTIV_GESPERRT_SATZ, AKTIV_AUSWEG_SATZ,
  darfBearbeiten, FREMD_GESPERRT_SATZ,
  wochenAnker, wochenDaten, tageDerWoche,
  verschiebung, tageVerschieben,
  WOCHEN_MIN, WOCHEN_MAX,
} from './plan-werkbank'

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

  // ══ C-372: beim Aktivieren wandern die Wochen mit ═══════════════
  //
  // **Flow 3, Schritt 5: das Startdatum waehlt der Nutzer.**
  //
  // `[cmd]` **Ein Plan aus der Werkbank traegt Ankerdaten** — die
  // Wochen liegen relativ zueinander, verankert am Montag der
  // Anlegewoche (`wochenAnker`). `[read]` **Ohne diesen Schritt
  // stuende der aktivierte Plan an seinem Anker statt am gewaehlten
  // Startdatum**, und der Nutzer saehe seine Tage in der falschen
  // Woche.
  //
  // `[read]` **Die Abstaende bleiben, das Datum wird richtig** — alle
  // Wochen UND ihre Tage verschieben sich um dieselbe Zahl.
  if (felder.start_date) {
    await wochenAufStartdatumSchieben(db, id, felder.start_date)
  }

  return data as unknown as GespeicherterPlan
}

/**
 * Die Wochen eines Plans auf ein Startdatum schieben.
 *
 * `[cmd]` **`UNIQUE (plan_id, week_start)` und
 * `UNIQUE (week_id, plan_date)`** — deshalb wird in EINER Runde je
 * Zeile geschrieben und nicht paarweise getauscht.
 */
async function wochenAufStartdatumSchieben(
  db: Db, planId: string, startdatum: string,
): Promise<void> {
  const { data: wRoh, error } = await db
    .from('meal_plan_weeks')
    .select('id, week_start')
    .eq('plan_id', planId)
    .order('week_start')
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)

  const wochen = (wRoh ?? []) as unknown as Array<{ id: string; week_start: string }>
  if (wochen.length === 0) return

  const tage = verschiebung(wochen[0].week_start, startdatum)
  // `[read]` **Null Tage heisst: schon richtig** — dann wird nichts
  // geschrieben, statt jede Zeile mit demselben Wert zu ueberschreiben.
  if (tage === 0) return

  for (const w of wochen) {
    const neuStart = tageVerschieben(w.week_start, tage)
    const { error: wFehler } = await db
      .from('meal_plan_weeks')
      .update({ week_start: neuStart })
      .eq('id', w.id)
    if (wFehler) throw new DiaryWriteError('WRITE_FAILED', wFehler.message)

    const { data: dRoh } = await db
      .from('meal_plan_days')
      .select('id, plan_date')
      .eq('week_id', w.id)
    for (const d of ((dRoh ?? []) as unknown as Array<{
      id: string; plan_date: string
    }>)) {
      const { error: dFehler } = await db
        .from('meal_plan_days')
        .update({ plan_date: tageVerschieben(d.plan_date, tage) })
        .eq('id', d.id)
      if (dFehler) throw new DiaryWriteError('WRITE_FAILED', dFehler.message)
    }
  }
}


// ════════════════════════════════════════════════════════════════════
// DIE EINTRAEGE — G-298
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-08-31:** *,,meal plans sehe ich noch nichts
// brauchbares."* `[cmd]` **Die einzigen Knoepfe waren *Zuklappen* und
// *Laufzeit aendern*.**
//
// `[cmd]` **Der Schreibweg fuer den PLAN steht seit G-267/G-286.**
// **Was fehlte, sind die Positionen** — also diese drei Vorgaenge.

export const eintragAnlegenSchema = z.object({
  art: z.literal('eintrag'),
  day_id: z.string().uuid(),
  typ: z.enum(EINTRAG_TYPEN),
  quelleId: z.string().uuid(),
  mahlzeit: z.enum(MAHLZEIT_TYPEN),
  menge: z.number().positive('Die Menge muss groesser als 0 sein.').max(100000),
  notiz: z.string().trim().max(500).nullish(),
})

export const eintragAendernSchema = z.object({
  art: z.literal('eintrag_aendern'),
  id: z.string().uuid(),
  typ: z.enum(EINTRAG_TYPEN),
  quelleId: z.string().uuid(),
  mahlzeit: z.enum(MAHLZEIT_TYPEN),
  menge: z.number().positive('Die Menge muss groesser als 0 sein.').max(100000),
  notiz: z.string().trim().max(500).nullish(),
})

export const eintragLoeschenSchema = z.object({
  art: z.literal('eintrag_loeschen'),
  id: z.string().uuid(),
})

export type EintragAnlegen = z.infer<typeof eintragAnlegenSchema>
export type EintragAendern = z.infer<typeof eintragAendernSchema>
export type EintragLoeschen = z.infer<typeof eintragLoeschenSchema>

export type GespeicherterEintrag = {
  id: string
  day_id: string
  entry_type: string
  meal_type: string
  slot_order: number
}

// `[cmd]` **`herkunftDesTages` und `pruefeFreigabe` sind in G-306
// entfernt.** `[read]` **Sie prueften nur die Herkunft;
// `pruefePositionsRecht` prueft beide Sperren in EINER Abfrage** —
// zwei Funktionen fuer dieselbe Frage waeren zwei Stellen, an denen
// eine vergessen werden kann. **A-59: nicht aufgerufen heisst
// entfernt.**

/**
 * Einen Eintrag anlegen — G-298.
 *
 * `[cmd]` **`slot_order` wird hier vergeben, nicht vom Browser
 * geschickt** — sonst kollidieren zwei Fenster auf derselben Zahl.
 */
export async function planEintragAnlegen(
  eingabe: EintragAnlegen,
): Promise<GespeicherterEintrag> {
  const { db, user } = await sitzung()
  // G-306/ADR #17: prueft BEIDE Sperren - Status und Herkunft.
  await pruefePositionsRecht(db, eingabe.day_id)

  const felder = bauEintrag(eingabe)
  // `[read]` **Die Gegenprobe vor dem Schreiben**, damit die Meldung
  // sagt, WAS falsch ist — die Datenbank meldete nur den CHECK-Namen.
  const fehler = verletztCheck(felder)
  if (fehler) throw new DiaryWriteError('VALIDATION_FAILED', fehler)

  const { data: belegt, error: leseFehler } = await db
    .from('meal_plan_entries')
    .select('slot_order')
    .eq('day_id', eingabe.day_id)
    .eq('meal_type', eingabe.mahlzeit)
  if (leseFehler) throw new DiaryWriteError('WRITE_FAILED', leseFehler.message)

  const position = naechstePosition(
    ((belegt ?? []) as unknown as Array<{ slot_order: number }>)
      .map(z => z.slot_order),
  )

  const { data, error } = await db
    .from('meal_plan_entries')
    .insert({
      ...felder,
      day_id: eingabe.day_id,
      user_id: user.id,
      slot_order: position,
    })
    .select('id, day_id, entry_type, meal_type, slot_order')
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  return data as unknown as GespeicherterEintrag
}

/**
 * Einen Eintrag aendern — G-298.
 *
 * `[read]` **Alle drei Quellkennungen werden geschrieben, auch die
 * `null`en.** Wechselt ein Eintrag von Rezept auf Lebensmittel und
 * bliebe `recipe_id` stehen, waeren zwei Kennungen gesetzt — der
 * CHECK verlangt genau eine.
 */
export async function planEintragAendern(
  eingabe: EintragAendern,
): Promise<GespeicherterEintrag> {
  const { db } = await sitzung()

  const { data: vorher, error: leseFehler } = await db
    .from('meal_plan_entries')
    .select('day_id')
    .eq('id', eingabe.id)
    .single()
  if (leseFehler) throw new DiaryWriteError('WRITE_FAILED', leseFehler.message)
  const dayId = (vorher as unknown as { day_id: string }).day_id
  await pruefePositionsRecht(db, dayId)

  const felder = bauEintrag(eingabe)
  const fehler = verletztCheck(felder)
  if (fehler) throw new DiaryWriteError('VALIDATION_FAILED', fehler)

  const { data, error } = await db
    .from('meal_plan_entries')
    .update(felder)
    .eq('id', eingabe.id)
    .select('id, day_id, entry_type, meal_type, slot_order')
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  return data as unknown as GespeicherterEintrag
}

/**
 * Einen Eintrag entfernen — G-298.
 *
 * `[read]` **Hart geloescht, nicht `deleted_at`.** `[cmd]`
 * **`meal_plan_entries` hat keine solche Spalte** (18 Spalten,
 * gemessen am 2026-08-31) — **eine Position ist eine Vorlage, kein
 * Protokoll.** Die Ausfuehrung steht in `meal_plan_logs` und bleibt
 * unberuehrt.
 */
export async function planEintragLoeschen(
  eingabe: EintragLoeschen,
): Promise<{ geloescht: string }> {
  const { db } = await sitzung()

  const { data: vorher, error: leseFehler } = await db
    .from('meal_plan_entries')
    .select('day_id')
    .eq('id', eingabe.id)
    .single()
  if (leseFehler) throw new DiaryWriteError('WRITE_FAILED', leseFehler.message)
  await pruefePositionsRecht(
    db, (vorher as unknown as { day_id: string }).day_id)

  const { error } = await db
    .from('meal_plan_entries')
    .delete()
    .eq('id', eingabe.id)
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  return { geloescht: eingabe.id }
}

// ════════════════════════════════════════════════════════════════════
// DIE WERKBANK — C-372 / G-306
// ════════════════════════════════════════════════════════════════════
//
// **E-40:** *,,ohne Schreibweg fuer Wochen gibt es keine Werkbank."*
// **E-41:** Bibliothek gegen Werkbank, und zwei Sperren.
// **ADR #17:** ein aktiver Plan hat READ-ONLY Positionen.

/**
 * Die Sperre aus ADR #17 — G-306.
 *
 * `[cmd]` **`MealPlan.status = 'active'` -> `MealPlanItem`
 * READ-ONLY, API gibt 409.** `[cmd]` **Der Grund:
 * `meal_plan_logs.plan_entry_id` zeigt auf die Position** (am
 * 2026-08-31 gemessen, mit `ON DELETE RESTRICT`).
 *
 * `[read]` **Die Datenbank verhindert nur das LOESCHEN einer
 * protokollierten Position, nicht ihr AENDERN** — deshalb steht die
 * Regel hier und nicht nur im Schema.
 *
 * `[read]` **Und sie prueft BEIDE Sperren** (E-41): die vom Status
 * und die vom Ersteller. Sie haben verschiedene Meldungen, weil sie
 * verschiedene Auswege haben.
 */
type Db = Awaited<ReturnType<typeof sitzung>>['db']

async function pruefePositionsRecht(db: Db, dayId: string): Promise<void> {
  const { data, error } = await db
    .from('meal_plan_days')
    .select('week_id, meal_plan_weeks!inner(plan_id, '
      + 'meal_plans!inner(status, plan_origin))')
    .eq('id', dayId)
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)

  // `[read]` Ueber `unknown`, nicht direkt: der Typ der verschachtelten
  // Auswahl ist ein Vereinigungstyp mit `GenericStringError`, und ein
  // direkter Cast waere ein Typfehler.
  const w = (data as unknown as Record<string, unknown>)?.meal_plan_weeks as
    Record<string, unknown> | undefined
  const p = w?.meal_plans as Record<string, unknown> | undefined
  const status = String(p?.status ?? '')
  const herkunft = (p?.plan_origin as string | null) ?? null

  // `[read]` **Die fremde Herkunft zuerst** — sie laesst sich nicht
  // durch Kopieren umgehen, also waere der Kopier-Hinweis falsch.
  //
  // `[cmd]` **C-375: die Spalte `darf_bearbeiten` gibt es noch
  // nicht** (am 2026-08-31 gemessen). Bis dahin traegt `plan_origin`
  // die Aussage: die Coach-Sperre aus G-269 gilt weiter.
  if (!(await darfAendern(herkunft))) {
    throw new DiaryWriteError('FORBIDDEN',
      herkunft === 'coach_created'
        ? 'Dieser Plan kommt von deinem Coach und ist fuer direkte Aenderungen gesperrt.'
        : FREMD_GESPERRT_SATZ)
  }

  if (positionenGesperrt(status)) {
    throw new DiaryWriteError('PLAN_AKTIV',
      `${AKTIV_GESPERRT_SATZ} ${AKTIV_AUSWEG_SATZ}`)
  }
}

// ══ C-372: einen Plan MIT Wochen anlegen ════════════════════════════
//
// `[cmd]` **`New plan` fragte bisher Name, Ziele, Lebenszyklus,
// Startdatum, Tageszahl** — und legte einen Plan ohne Wochen an, den
// niemand fuellen konnte (G-304).
//
// `[read]` **E-40: Lebenszyklus und Startdatum gehoeren nicht ins
// Anlegen** — sie entstehen beim Aktivieren (Flow 3, Schritte 5+6).
// **Was zaehlt: Name, Beschreibung, Tagesziele, Wochenzahl.**

export const planMitWochenSchema = z.object({
  art: z.literal('plan_werkbank'),
  name: z.string().trim().min(1, 'Der Plan braucht einen Namen.').max(120),
  description: z.string().trim().max(500).nullish(),
  target_kcal: z.number().positive().max(20000).nullish(),
  target_protein_g: z.number().nonnegative().max(2000).nullish(),
  target_carbs_g: z.number().nonnegative().max(3000).nullish(),
  target_fat_g: z.number().nonnegative().max(1000).nullish(),
  wochen: z.number().int().min(WOCHEN_MIN).max(WOCHEN_MAX),
  /** `[read]` Der Anker kommt vom Aufrufer, nie aus `new Date()` hier. */
  heute: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum als YYYY-MM-DD.'),
})

export type PlanMitWochen = z.infer<typeof planMitWochenSchema>

/**
 * Ein Plan mit leeren Wochen und Tagen — die Werkbank.
 *
 * `[read]` **Der Plan bekommt `status: 'assigned'`**, nicht `active`
 * — er ist ein Entwurf, und genau deshalb sind seine Positionen
 * bearbeitbar (ADR #17).
 *
 * `[cmd]` **`week_start` ist NOT NULL, ein Entwurf hat aber kein
 * Startdatum.** `[read]` **Geloest ueber den Anker** (`wochenAnker`):
 * die Wochen liegen relativ zueinander, und beim Aktivieren werden
 * sie auf das echte Datum verschoben.
 */
export async function planMitWochenAnlegen(
  eingabe: PlanMitWochen,
): Promise<{ id: string; name: string; wochen: number; tage: number }> {
  const { db, user } = await sitzung()

  const { data, error } = await db
    .from('meal_plans')
    .insert({
      user_id: user.id,
      name: eingabe.name,
      description: eingabe.description ?? null,
      target_kcal: eingabe.target_kcal ?? null,
      target_protein_g: eingabe.target_protein_g ?? null,
      target_carbs_g: eingabe.target_carbs_g ?? null,
      target_fat_g: eingabe.target_fat_g ?? null,
      // E-40: Startdatum und Lebenszyklus entstehen beim Aktivieren.
      start_date: null,
      days_count: eingabe.wochen * 7,
      lifecycle_type: null,
      status: 'assigned',
      plan_origin: 'self_created',
      measurement_source: 'manual',
    })
    .select('id, name')
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  const plan = data as unknown as { id: string; name: string }

  const anker = wochenAnker(eingabe.heute)
  const starts = wochenDaten(anker, eingabe.wochen)

  const { data: wochenRoh, error: wFehler } = await db
    .from('meal_plan_weeks')
    .insert(starts.map((s, i) => ({
      plan_id: plan.id,
      user_id: user.id,
      week_start: s,
      name: `Woche ${i + 1}`,
    })))
    .select('id, week_start')
  if (wFehler) throw new DiaryWriteError('WRITE_FAILED', wFehler.message)

  const wochen = (wochenRoh ?? []) as unknown as Array<{
    id: string; week_start: string
  }>

  // `[cmd]` **`day_index` CHECK 1..7** — gemessen am 2026-08-31:
  // 0 und 8 werden abgewiesen, 1 nicht.
  const tage = wochen.flatMap(w =>
    tageDerWoche(w.week_start).map(t => ({
      week_id: w.id,
      user_id: user.id,
      plan_date: t.plan_date,
      day_index: t.day_index,
    })))

  const { error: tFehler } = await db.from('meal_plan_days').insert(tage)
  if (tFehler) throw new DiaryWriteError('WRITE_FAILED', tFehler.message)

  return { id: plan.id, name: plan.name, wochen: wochen.length, tage: tage.length }
}

// ══ G-306: der Ausweg — Kopie bearbeiten ════════════════════════════
//
// `[cmd]` **Der ADR schreibt ihn vor:** *,,Coach oder User muss Plan
// pausieren, eine Kopie erstellen, bearbeiten und neu aktivieren.
// Original-Plan mit seinem Log bleibt unveraendert erhalten."*
//
// `[read]` **Ohne Knopf ist die Regel eine Sackgasse** — der Nutzer
// sieht, dass er nicht darf, und findet keinen Weg (Auftrag).

export const planKopierenSchema = z.object({
  art: z.literal('plan_kopieren'),
  id: z.string().uuid(),
  /** `[read]` Der Name darf abweichen; ohne Angabe „… (Kopie)". */
  name: z.string().trim().min(1).max(120).optional(),
  /**
   * `[cmd]` **Der ADR nennt das Pausieren als ersten Schritt.**
   * `[read]` **Es ist trotzdem eine Wahl:** wer eine Variante bauen
   * will, laesst das Original laufen.
   */
  original_pausieren: z.boolean().default(false),
})

export type PlanKopieren = z.infer<typeof planKopierenSchema>

/**
 * Eine bearbeitbare Kopie eines Plans — mit Wochen, Tagen und
 * Positionen.
 *
 * `[read]` **Das Log wird NICHT kopiert.** `meal_plan_logs` gehoert
 * zum Original; eine Kopie hat nichts ausgefuehrt. **Genau darum
 * geht der ADR diesen Weg: das Original behaelt seine Historie.**
 */
export async function planKopieren(eingabe: PlanKopieren): Promise<{
  id: string; name: string; wochen: number; tage: number; positionen: number
  original_pausiert: boolean
}> {
  const { db, user } = await sitzung()

  const { data: origRoh, error: oFehler } = await db
    .from('meal_plans')
    .select('name, description, target_kcal, target_protein_g, '
      + 'target_carbs_g, target_fat_g, days_count, plan_origin, status')
    .eq('id', eingabe.id)
    .single()
  if (oFehler) throw new DiaryWriteError('WRITE_FAILED', oFehler.message)
  const orig = origRoh as unknown as Record<string, unknown>

  // `[read]` **Die fremde Sperre gilt auch fuer die Kopie.** Wer
  // einen Plan nicht bearbeiten darf, darf ihn nicht durch Kopieren
  // aufmachen — sonst waere das Flag wirkungslos.
  if (!(await darfAendern((orig.plan_origin as string | null) ?? null))) {
    throw new DiaryWriteError('FORBIDDEN', FREMD_GESPERRT_SATZ)
  }

  const { data: neuRoh, error: nFehler } = await db
    .from('meal_plans')
    .insert({
      user_id: user.id,
      name: eingabe.name ?? `${String(orig.name)} (Kopie)`,
      description: orig.description ?? null,
      target_kcal: orig.target_kcal ?? null,
      target_protein_g: orig.target_protein_g ?? null,
      target_carbs_g: orig.target_carbs_g ?? null,
      target_fat_g: orig.target_fat_g ?? null,
      days_count: orig.days_count ?? null,
      // Die Kopie ist ein Entwurf - sonst waere sie sofort wieder
      // gesperrt, und der Ausweg fuehrte im Kreis.
      status: 'assigned',
      start_date: null,
      lifecycle_type: null,
      // `[read]` **Eine Kopie ist selbst erstellt** — sie stammt aus
      // der Hand des Nutzers, nicht mehr vom urspruenglichen Sender.
      plan_origin: 'self_created',
      measurement_source: 'manual',
    })
    .select('id, name')
    .single()
  if (nFehler) throw new DiaryWriteError('WRITE_FAILED', nFehler.message)
  const neu = neuRoh as unknown as { id: string; name: string }

  // Wochen, Tage und Positionen mitnehmen.
  const { data: wRoh } = await db
    .from('meal_plan_weeks')
    .select('id, week_start, name')
    .eq('plan_id', eingabe.id)
    .order('week_start')
  const altWochen = (wRoh ?? []) as unknown as Array<{
    id: string; week_start: string; name: string | null
  }>

  let tageZahl = 0
  let posZahl = 0

  for (const aw of altWochen) {
    const { data: nwRoh, error: nwFehler } = await db
      .from('meal_plan_weeks')
      .insert({
        plan_id: neu.id, user_id: user.id,
        week_start: aw.week_start, name: aw.name,
        // `[cmd]` Die Spalte traegt die Herkunft einer kopierten
        // Woche - sie steht seit C-150 und wird hier gesetzt.
        copied_from_week_id: aw.id,
      })
      .select('id')
      .single()
    if (nwFehler) throw new DiaryWriteError('WRITE_FAILED', nwFehler.message)
    const nw = nwRoh as unknown as { id: string }

    const { data: dRoh } = await db
      .from('meal_plan_days')
      .select('id, plan_date, day_index, notes')
      .eq('week_id', aw.id)
      .order('day_index')
    const altTage = (dRoh ?? []) as unknown as Array<{
      id: string; plan_date: string; day_index: number; notes: string | null
    }>

    for (const at of altTage) {
      const { data: ntRoh, error: ntFehler } = await db
        .from('meal_plan_days')
        .insert({
          week_id: nw.id, user_id: user.id,
          plan_date: at.plan_date, day_index: at.day_index, notes: at.notes,
        })
        .select('id')
        .single()
      if (ntFehler) throw new DiaryWriteError('WRITE_FAILED', ntFehler.message)
      const nt = ntRoh as unknown as { id: string }
      tageZahl += 1

      const { data: eRoh } = await db
        .from('meal_plan_entries')
        .select('meal_type, slot_order, entry_type, recipe_id, food_id, '
          + 'custom_food_id, amount_g, planned_servings, portion_name, '
          + 'portion_quantity, portion_amount_g, note, planned_time')
        .eq('day_id', at.id)
        .order('slot_order')
      const altPos = (eRoh ?? []) as unknown as Array<Record<string, unknown>>
      if (altPos.length === 0) continue

      const { error: peFehler } = await db.from('meal_plan_entries').insert(
        altPos.map(p => ({ ...p, day_id: nt.id, user_id: user.id })))
      if (peFehler) throw new DiaryWriteError('WRITE_FAILED', peFehler.message)
      posZahl += altPos.length
    }
  }

  // `[cmd]` **Der ADR nennt das Pausieren als ersten Schritt** — hier
  // ist es eine Wahl, und sie wird gemeldet statt stillschweigend
  // getan.
  let pausiert = false
  if (eingabe.original_pausieren && orig.status === 'active') {
    const { error } = await db
      .from('meal_plans')
      .update({ status: 'paused', is_active: false })
      .eq('id', eingabe.id)
    if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
    pausiert = true
  }

  return {
    id: neu.id, name: neu.name, wochen: altWochen.length,
    tage: tageZahl, positionen: posZahl, original_pausiert: pausiert,
  }
}
