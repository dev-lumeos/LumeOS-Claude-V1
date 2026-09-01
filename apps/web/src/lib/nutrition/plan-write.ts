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
// C-372: die Wochen der Werkbank.
// G-306/E-42: die Sperre haengt am PROTOKOLL der Position, nicht am
// Zustand des Plans.
import {
  positionEingefroren, GELOGGT_SATZ,
  ABLAUF_WEGE,
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
 * Aendert dieser Aufruf den INHALT des Plans — oder fuehrt er ihn aus?
 *
 * ══ G-315: AKTIVIEREN IST KEINE AENDERUNG ═════════════════
 *
 * **Tom, 2026-09-02:** *,,schwachsinn hoch 2 plan aktivieren gesperrt
 * wegen aenderung? wenn man starten will."*
 *
 * `[cmd]` **`planAendern` fragte `darfAendern` VOR jedem Feld** —
 * auch vor `status: 'active'`. **Aktivieren ging denselben Weg wie
 * Umbenennen**, und ein Coach-Plan liess sich nicht starten.
 *
 * `[cmd]` **E-42: `darf_weiterverkaufen` schuetzt vor Weiterverkauf,
 * nicht vor Benutzung.** `[cmd]` **Und E-29 schuetzt den INHALT** —
 * damit der Klient nicht umbaut, was der Coach verordnet hat.
 *
 * `[read]` **Aktivieren aendert den Inhalt nicht.** Es sagt: *ab
 * heute halte ich mich daran.* **Das ist die Benutzung, die der Coach
 * gerade will.**
 *
 * `[read]` **Als eigene Funktion, damit sie messbar ist** — inline
 * kam die Sabotage durch, weil der Waechter nur die Feldnamen im
 * Quelltext sah (G-216).
 *
 * `[cmd]` **Die ausfuehrenden Felder entstehen beim Aktivieren**
 * (Flow 3, Schritte 5-7) **und beim Ablauf** (C-373).
 */
export const AUSFUEHRENDE_FELDER = [
  'status', 'is_active', 'start_date', 'lifecycle_type', 'rollover_count',
] as const

export function aendertInhalt(felder: Record<string, unknown>): boolean {
  const gesetzt = Object.keys(felder).filter(k => felder[k] !== undefined)
  // `[read]` **Ein leerer Aufruf ist keine Aenderung.**
  return gesetzt.some(k => !(AUSFUEHRENDE_FELDER as readonly string[]).includes(k))
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

  if (aendertInhalt(felder) && !(await darfAendern(herkunft))) {
    throw new DiaryWriteError(
      'FORBIDDEN',
      herkunft === 'coach_created'
        ? 'Dieser Plan kommt von deinem Coach. Du kannst ihn aktivieren und '
          + 'verwenden — seinen Inhalt ändern erst ab Autonomiestufe 5.'
        : 'Dieser Plan stammt aus dem Marktplatz. Du kannst ihn aktivieren und '
          + 'verwenden — geändert wird er nicht.',
    )
  }

  if (felder.status === 'active') await anderePlaenePausieren(db, id)

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
 * Beim Aktivieren wird der bestehende aktive Plan pausiert — G-309.
 *
 * **`SPEC_03` Flow 3, Schritt 7:** *,,Bestätigen → status: active /
 * Bestehender aktiver Plan → status: paused."*
 *
 * `[cmd]` **Am 2026-09-01 gemessen: das geschah nicht.** `[read]`
 * **Dann haetten zwei Plaene Anspruch auf denselben Tag** — und die
 * Ghost Entries zeigten die Positionen beider nebeneinander, ohne dass
 * jemand entschieden hat, welcher gilt.
 *
 * `[read]` **`paused`, nicht `completed`:** der Plan ist nicht durch,
 * er ruht. **Er bleibt in der Bibliothek und kann zurueckgeholt
 * werden.**
 *
 * `[read]` **Der Aufruf steht VOR dem eigenen Schreiben** — danach
 * pausierte er den gerade aktivierten Plan gleich mit. **Deshalb auch
 * `.neq('id', ...)`:** zwei Gruende, einer genuegte nicht.
 *
 * `[cmd]` **Zwei Wege setzen `active`** — `planAendern` und
 * `ablaufKlaeren` (C-373). **Deshalb steht es hier einmal und nicht
 * zweimal hingeschrieben.**
 */
async function anderePlaenePausieren(db: Db, ausser: string): Promise<void> {
  const { error } = await db
    .from('meal_plans')
    .update({ status: 'paused', is_active: false })
    .eq('status', 'active')
    .neq('id', ausser)
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
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
// `pruefeHerkunft` und `pruefeProtokoll` pruefen getrennt** —
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
  // `[read]` **Beim ANLEGEN gibt es noch kein Protokoll** — eine
  // Position, die es nicht gibt, kann nicht geloggt sein. **Nur die
  // Herkunft wird geprueft** (G-269).
  await pruefeHerkunft(await herkunftDesTages(db, eingabe.day_id))

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
  await pruefeHerkunft(await herkunftDesTages(db, dayId))
  // G-306/E-42: eingefroren ist die POSITION, wenn sie geloggt ist.
  await pruefeProtokoll(db, eingabe.id)

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
  await pruefeHerkunft(await herkunftDesTages(
    db, (vorher as unknown as { day_id: string }).day_id))
  await pruefeProtokoll(db, eingabe.id)

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
 * Die Sperre — G-306, berichtigt durch E-42.
 *
 * `[cmd]` **In C-372 stand hier: 409 fuer jeden aktiven Plan.** Das
 * war die Vorgabe, und sie war falsch.
 *
 * **Tom, 2026-08-31:** *,,wenn wir den einschraenken dass er nicht
 * editieren kann dann bescheisst er sich ja selber."* `[read]` **Eine
 * Sperre, die sich umgehen laesst, macht die Daten schlechter.**
 *
 * `[cmd]` **E-42: 409 nur, wenn DIESE Position ein Log mit
 * `status <> 'pending'` traegt** — nicht fuer den ganzen Plan, und
 * auch nicht fuer zukuenftige Plantage.
 *
 * `[cmd]` **Der `resolution_check` erzwingt es:** ein `pending`-Log
 * hat kein `actual_meal_id` und kein `confirmed_at`. **Es gibt nichts
 * zu verfaelschen.**
 *
 * `[read]` **Die Herkunftspruefung bleibt** — sie kommt aus G-269/E-29
 * und hat mit dem Protokoll nichts zu tun.
 */
type Db = Awaited<ReturnType<typeof sitzung>>['db']

/**
 * Die Herkunft des Plans, zu dem ein Tag gehoert — G-269.
 *
 * `[read]` **Getrennt von der Protokollfrage**, weil sie an einer
 * anderen Stelle haengt: die Herkunft am Plan, das Log an der
 * Position.
 */
async function herkunftDesTages(db: Db, dayId: string): Promise<string | null> {
  const { data, error } = await db
    .from('meal_plan_days')
    .select('week_id, meal_plan_weeks!inner(plan_id, meal_plans!inner(plan_origin))')
    .eq('id', dayId)
    .single()
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)
  const w = (data as unknown as Record<string, unknown>)?.meal_plan_weeks as
    Record<string, unknown> | undefined
  const p = w?.meal_plans as Record<string, unknown> | undefined
  return (p?.plan_origin as string | null) ?? null
}

/** Die Coach-Sperre aus G-269 — unveraendert. */
async function pruefeHerkunft(herkunft: string | null): Promise<void> {
  if (await darfAendern(herkunft)) return
  throw new DiaryWriteError('FORBIDDEN',
    herkunft === 'coach_created'
      ? 'Dieser Plan kommt von deinem Coach und ist fuer direkte Aenderungen gesperrt.'
      : 'Dieser Plan stammt aus dem Marktplatz und wird unveraendert uebernommen.')
}

/**
 * Traegt DIESE Position ein Protokoll, das sie einfriert?
 *
 * `[cmd]` **`uq_meal_plan_logs_entry_execution`: je Position und
 * Ausfuehrungsdatum hoechstens ein Log** — es koennen aber mehrere
 * Tage sein. **Eines mit `status <> 'pending'` genuegt.**
 */
export async function pruefeProtokoll(db: Db, entryId: string): Promise<void> {
  const { data, error } = await db
    .from('meal_plan_logs')
    .select('status')
    .eq('plan_entry_id', entryId)
    .neq('status', 'pending')
    .limit(1)
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)

  const zeilen = (data ?? []) as unknown as Array<{ status: string }>
  const treffer = zeilen[0]
  if (treffer && positionEingefroren(treffer.status)) {
    throw new DiaryWriteError('POSITION_GELOGGT', GELOGGT_SATZ)
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

// ══ „Kopie bearbeiten" ist entfernt — G-306/E-42 ═══════════════════
//
// `[cmd]` **E-42 hebt die Sperre auf, zu der dieser Knopf der Ausweg
// war.** `[read]` **Ein Ausweg ohne Sperre ist keiner** — und ein
// Knopf, der ohne Grund dasteht, ist genau das, was A-59 verbietet.
//
// `[read]` **Einen Plan zu duplizieren mag fuer sich sinnvoll sein**
// (eine Variante bauen, ohne das Original anzufassen). **Dann gehoert
// es als Bibliotheksfunktion beantragt, mit eigener Begruendung** —
// nicht als Rest einer aufgehobenen Regel.

// ════════════════════════════════════════════════════════════════════
// C-377/C-373 — der abgelaufene Plan wird geklaert
// ════════════════════════════════════════════════════════════════════
//
// **Tom:** *,,ist ein kompletter plan abgelaufen muss eine meldung
// kommen und geklaert werden wie es weiter geht."*
//
// `[read]` **Die Meldung IST die Ausfuehrung des Lebenszyklus**
// (C-373) — es braucht keinen Zeitplaner, sondern eine Entscheidung.

export const ablaufKlaerenSchema = z.object({
  art: z.literal('ablauf_klaeren'),
  id: z.string().uuid(),
  weg: z.enum(ABLAUF_WEGE),
  /** Nur bei `neu_starten`: ab wann der Plan wieder laufen soll. */
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export type AblaufKlaeren = z.infer<typeof ablaufKlaerenSchema>

/**
 * Einen abgelaufenen Plan klaeren — C-377.
 *
 *     neu_starten     Wochen ab dem Startdatum, Plan bleibt aktiv
 *     anderer_plan    dieser Plan wird `completed`; die Wahl des
 *                     naechsten trifft der Nutzer in der Bibliothek
 *     ohne_plan       dieser Plan wird `completed`, nichts folgt
 *
 * `[read]` **`completed`, nicht `archived`:** der Plan ist
 * durchgelaufen, nicht weggeraeumt. **Er bleibt in der Bibliothek und
 * laesst sich neu aktivieren.**
 *
 * `[cmd]` **Bei `neu_starten` verschieben sich die Wochen** — dieselbe
 * Rechnung wie beim Aktivieren (C-372), und `rollover_count` zaehlt
 * hoch, damit die Zahl der Durchgaenge ablesbar bleibt.
 */
export async function ablaufKlaeren(eingabe: AblaufKlaeren): Promise<{
  id: string; status: string; weg: string; rollover_count: number | null
}> {
  const { db } = await sitzung()

  const { data: vorher, error: leseFehler } = await db
    .from('meal_plans')
    .select('plan_origin, rollover_count')
    .eq('id', eingabe.id)
    .single()
  if (leseFehler) throw new DiaryWriteError('WRITE_FAILED', leseFehler.message)
  const v = vorher as unknown as {
    plan_origin: string | null; rollover_count: number | null
  }
  await pruefeHerkunft(v.plan_origin)

  if (eingabe.weg === 'neu_starten') {
    if (!eingabe.start_date) {
      throw new DiaryWriteError('VALIDATION_FAILED',
        'Zum Neustarten fehlt das Startdatum.')
    }
    // `[read]` **Der Zaehler steht in `rollover_count`** — die Spalte
    // gibt es seit C-150, und sie stand bisher immer auf 0.
    const neuZaehler = (v.rollover_count ?? 0) + 1
    // G-309/Flow 3 Schritt 7 gilt auch hier — ein Neustart aktiviert.
    await anderePlaenePausieren(db, eingabe.id)
    const { error } = await db
      .from('meal_plans')
      .update({
        status: 'active', is_active: true,
        start_date: eingabe.start_date,
        rollover_count: neuZaehler,
      })
      .eq('id', eingabe.id)
    if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)

    await wochenAufStartdatumSchieben(db, eingabe.id, eingabe.start_date)
    return {
      id: eingabe.id, status: 'active', weg: eingabe.weg,
      rollover_count: neuZaehler,
    }
  }

  // `anderer_plan` und `ohne_plan` enden beide hier: dieser Plan ist
  // durch. `[read]` **Was danach kommt, entscheidet der Nutzer in der
  // Bibliothek** — ihn hier automatisch zu ersetzen waere genau der
  // stille Vorgang, den C-373 vermeidet.
  const { error } = await db
    .from('meal_plans')
    .update({ status: 'completed', is_active: false })
    .eq('id', eingabe.id)
  if (error) throw new DiaryWriteError('WRITE_FAILED', error.message)

  return {
    id: eingabe.id, status: 'completed', weg: eingabe.weg,
    rollover_count: v.rollover_count,
  }
}
