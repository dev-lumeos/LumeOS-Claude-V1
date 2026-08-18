// Lese-I/O fuer den Uebungskatalog (G-64).
//
// Liest mit der Identitaet der Sitzung — kein Service-Client, wie bei
// Nutrition und Supplements. Der Katalog ist fuer Angemeldete
// oeffentlich (`exercises_select`: `USING (is_active OR is_admin())`).
//
// WAS HIER NICHT PASSIERT: erfinden. `Type` (Compound/Isolation) gibt
// es in keiner Spalte und faellt deshalb weg (Toms Entscheidung
// 2026-08-18). `sort_weight` steht auf allen 1.416 gleich 500 und
// sortiert nichts — sortiert wird nach Name.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

/** Eine Uebung, so wie die Tabelle sie zeigt. */
export type Uebung = {
  id: string
  name: string
  discipline: string | null
  equipment_name: string | null
  equipment_name_de: string | null
  equipment_group: string | null
  /** Primaermuskeln, Wurzelgruppen, alphabetisch. */
  primaer: string[]
  /** Sekundaermuskeln, Wurzelgruppen, alphabetisch. */
  sekundaer: string[]
  /** Bestes e1RM aus den Saetzen. `null` heisst: nie geladen. */
  e1rm: number | null
  /** Der Satz dahinter, z. B. „120 kg × 3". */
  bester_satz: string | null
}

/** Eine Gruppe fuer die Geraeteauswahl. */
export type GeraeteGruppe = {
  /** Der stabile Schluessel — NICHT die deutsche Beschriftung. */
  key: string
  label_de: string
  label_en: string
  geraete: number
  uebungen: number
}

/** Ein Knoten der Muskelauswahl: Wurzel mit ihren direkten Kindern. */
export type MuskelWurzel = {
  id: string
  name: string
  body_region: string | null
  primaer: number
  beides: number
  kinder: Array<{ id: string; name: string; primaer: number; beides: number }>
}

export type KatalogFilter = {
  suche?: string
  /** Schluessel aus `GeraeteGruppe.key`, nicht die Beschriftung. */
  geraeteGruppe?: string
  disziplin?: string
  /** `muscle_groups.id` — Wurzel oder Kind, beides erlaubt. */
  muskelId?: string
  /**
   * Zaehlt eine Uebung nur, wenn der Muskel PRIMAER beansprucht wird.
   *
   * `[read]` Der Vorgabewert ist `true`. Begruendung im Bericht:
   * „Hamstrings" liefert 100 gegen 384 Treffer — der Unterschied
   * zwischen „trainiert die Beinbeuger" und „die Beinbeuger sind
   * irgendwie beteiligt".
   */
  nurPrimaer?: boolean
  limit?: number
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

/**
 * Wieviele Zeilen PostgREST hoechstens je Abfrage liefert.
 *
 * `[cmd]` Wer mehr braucht — `exercise_muscles` hat 6.588 Zeilen —
 * muss seitenweise holen. Eine einzige Abfrage zaehlt sonst still zu
 * niedrig; genau das lieferte anfangs „Freie Gewichte (822)" statt
 * 1.056.
 */
export const SEITE_GROESSE = 1000

/**
 * Wieviele IDs eine `.in(...)`-Liste hoechstens tragen darf.
 *
 * `[cmd]` Gemessen am 2026-08-18: 200 gehen durch, 252 nicht —
 * PostgREST antwortet „URI too long". Die Bibliothek reicht das als
 * leere Liste weiter, nicht als Fehler.
 */
export const GRENZE_IN_IDS = 200

/** Die Seitengrenzen fuer `n` Zeilen, je `SEITE_GROESSE`. */
export function seitenPlan(n: number): Array<{ von: number; bis: number }> {
  if (n <= 0) return []
  // Bei genau `SEITE_GROESSE` folgt eine weitere Anfrage: der
  // Aufrufer kann nicht wissen, ob noch etwas kommt.
  const seiten = Math.floor(n / SEITE_GROESSE) + 1
  return Array.from({ length: seiten }, (_, i) => ({
    von: i * SEITE_GROESSE,
    bis: (i + 1) * SEITE_GROESSE - 1,
  }))
}

/**
 * Die Geraetegruppen fuer die Auswahl.
 *
 * `[cmd]` Gruppiert wird ueber `equipment_group` (den stabilen
 * Schluessel), NICHT ueber `equipment_group_de`. Grund: „Chest Press
 * Machine" traegt `Geraete & Baenke` ohne Umlaute, alle anderen 28
 * `Geräte & Bänke` — nach der Beschriftung gruppiert gaebe es zwei
 * Eintraege fuer dieselbe Gruppe. Gemeldet im Bericht.
 */
export async function getGeraeteGruppen(): Promise<GeraeteGruppe[]> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const t = supabase.schema('training')
  const { data: geraete } = await t
    .from('equipment')
    .select('id,name,name_de,equipment_group,equipment_group_de,equipment_group_en')

  const gruppen = new Map<string, GeraeteGruppe>()
  const geraeteJeGruppe = new Map<string, string[]>()
  for (const g of geraete ?? []) {
    const r = g as unknown as Record<string, unknown>
    const key = r.equipment_group ? String(r.equipment_group) : 'other'
    if (!geraeteJeGruppe.has(key)) geraeteJeGruppe.set(key, [])
    geraeteJeGruppe.get(key)!.push(String(r.id))

    const vorhanden = gruppen.get(key)
    const de = String(r.equipment_group_de ?? key)
    if (vorhanden) {
      vorhanden.geraete += 1
      // `[cmd]` „Chest Press Machine" traegt `Geraete & Baenke` ohne
      // Umlaute, die uebrigen 28 `Geräte & Bänke`. Die Beschriftung
      // mit Umlauten gewinnt — sonst haengt die Anzeige davon ab,
      // welches Geraet zuerst kommt. Gemeldet im Bericht.
      if (/[äöüÄÖÜ]/.test(de) && !/[äöüÄÖÜ]/.test(vorhanden.label_de)) {
        vorhanden.label_de = de
      }
    } else {
      gruppen.set(key, {
        key,
        label_de: de,
        label_en: String(r.equipment_group_en ?? key),
        geraete: 1,
        uebungen: 0,
      })
    }
  }

  // Die Uebungszahl je Gruppe kommt als `count` aus der Datenbank —
  // NICHT durch Zaehlen im Speicher. `[cmd]` PostgREST liefert
  // hoechstens 1.000 Zeilen je Abfrage; bei 1.416 Uebungen zaehlte
  // eine Schleife im Speicher zu niedrig (gemessen: 822 statt 1.056).
  const keys = Array.from(gruppen.keys())
  await Promise.all(keys.map(async key => {
    const ids = geraeteJeGruppe.get(key) ?? []
    if (ids.length === 0) return
    const { count } = await t.from('exercises')
      .select('*', { count: 'exact', head: true }).in('equipment_id', ids)
    const g = gruppen.get(key)
    if (g) g.uebungen = count ?? 0
  }))

  return Array.from(gruppen.values()).sort((a, b) => b.uebungen - a.uebungen)
}

/** Die Disziplinen mit ihrer Uebungszahl. */
export async function getDisziplinen(): Promise<Array<{ name: string; anzahl: number }>> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const t = supabase.schema('training')
  // `[cmd]` Fuenf feste Werte aus C-90 — Strength, Bodyweight,
  // Stretching, Yoga, Cardio, null ohne Zuordnung. Je Wert ein
  // `count`, statt 1.416 Zeilen zu holen und im Speicher zu zaehlen:
  // PostgREST deckelt bei 1.000 und die Summe faellt zu niedrig aus.
  const { data: proben } = await t.from('exercises')
    .select('discipline').not('discipline', 'is', null).limit(1000)
  const namen = Array.from(new Set((proben ?? [])
    .map(r => String((r as unknown as Record<string, unknown>).discipline))))

  const mitZahl = await Promise.all(namen.map(async name => {
    const { count } = await t.from('exercises')
      .select('*', { count: 'exact', head: true }).eq('discipline', name)
    return { name, anzahl: count ?? 0 }
  }))
  return mitZahl.filter(d => d.anzahl > 0).sort((a, b) => b.anzahl - a.anzahl)
}

/**
 * Die Muskelauswahl: 7 Wurzeln mit ihren direkten Kindern.
 *
 * `[cmd]` Der Baum ist VIER Ebenen tief (7 → 28 → 45 → 15). Ebene 2
 * und 3 sind anatomische Einzelmuskeln (`adductor brevis`,
 * `Fibularis Muscles`) — als Filter unbrauchbar. Gezeigt werden
 * Wurzeln und Ebene 1; die Zaehlung schliesst alle Nachfahren ein.
 */
export async function getMuskelBaum(): Promise<MuskelWurzel[]> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const t = supabase.schema('training')
  const { data: gruppen } = await t
    .from('muscle_groups').select('id,name,parent_id,body_region')

  // `[cmd]` 6.588 Zuordnungen — PostgREST liefert hoechstens 1.000 je
  // Abfrage. Seitenweise holen, sonst zaehlt der Baum zu niedrig.
  const zuordnungen: Array<Record<string, unknown>> = []
  for (let von = 0; ; von += SEITE_GROESSE) {
    const { data } = await t.from('exercise_muscles')
      .select('exercise_id,muscle_group_id,role')
      .range(von, von + SEITE_GROESSE - 1)
    const stapel = (data ?? []) as unknown as Array<Record<string, unknown>>
    zuordnungen.push(...stapel)
    if (stapel.length < SEITE_GROESSE) break
  }

  type Knoten = { id: string; name: string; parent: string | null; region: string | null }
  const knoten = new Map<string, Knoten>()
  for (const g of gruppen ?? []) {
    const r = g as Record<string, unknown>
    knoten.set(String(r.id), {
      id: String(r.id),
      name: String(r.name),
      parent: r.parent_id ? String(r.parent_id) : null,
      region: (r.body_region as string) ?? null,
    })
  }

  // Je Knoten die Menge seiner Nachfahren (inklusive sich selbst).
  // `Array.from` statt `for … of map.values()`: das Uebersetzungsziel
  // ist aelter als es2015 und braeuchte sonst `--downlevelIteration`.
  const alleKnoten = Array.from(knoten.values())
  const nachfahren = new Map<string, Set<string>>()
  for (const k of alleKnoten) {
    let lauf: Knoten | undefined = k
    while (lauf) {
      if (!nachfahren.has(lauf.id)) nachfahren.set(lauf.id, new Set())
      nachfahren.get(lauf.id)!.add(k.id)
      lauf = lauf.parent ? knoten.get(lauf.parent) : undefined
    }
  }

  const zaehle = (id: string, nurPrimaer: boolean) => {
    const menge = nachfahren.get(id) ?? new Set<string>()
    const uebungen = new Set<string>()
    for (const z of zuordnungen ?? []) {
      const r = z as Record<string, unknown>
      if (!menge.has(String(r.muscle_group_id))) continue
      if (nurPrimaer && String(r.role) !== 'primary') continue
      uebungen.add(String(r.exercise_id))
    }
    return uebungen.size
  }

  const wurzeln = alleKnoten.filter(k => !k.parent)
  return wurzeln
    .map(w => ({
      id: w.id,
      name: w.name,
      body_region: w.region,
      primaer: zaehle(w.id, true),
      beides: zaehle(w.id, false),
      kinder: alleKnoten
        .filter(k => k.parent === w.id)
        .map(k => ({
          id: k.id, name: k.name,
          primaer: zaehle(k.id, true), beides: zaehle(k.id, false),
        }))
        .filter(k => k.beides > 0)
        .sort((a, b) => b.beides - a.beides),
    }))
    .filter(w => w.beides > 0)
    .sort((a, b) => b.beides - a.beides)
}

/**
 * Der gefilterte Uebungskatalog.
 *
 * `[read]` Die Suche laeuft ueber `ilike` auf dem Namen — der
 * Trigramm-Index (`idx_exercises_name_trgm`) traegt sie. In SQL
 * gemessen: unter 1 ms.
 */
export async function getUebungen(filter: KatalogFilter = {}): Promise<{
  zeilen: Uebung[]
  gesamt: number
}> {
  const supabase = createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { zeilen: [], gesamt: 0 }

  const t = supabase.schema('training')
  const nurPrimaer = filter.nurPrimaer !== false

  // Die Muskelgruppe und alle ihre Nachfahren. `[cmd]` Der Baum ist
  // vier Ebenen tief — wer „Chest" waehlt, meint auch „Upper Chest"
  // und die Einzelmuskeln darunter. Das sind hoechstens 95 IDs und
  // damit unkritisch fuer die URL-Laenge.
  let muskelGruppenIds: string[] | null = null
  if (filter.muskelId) {
    const { data: gruppen } = await t.from('muscle_groups').select('id,parent_id')
    const kinderVon = new Map<string, string[]>()
    for (const g of gruppen ?? []) {
      const r = g as unknown as Record<string, unknown>
      const p = r.parent_id ? String(r.parent_id) : null
      if (!p) continue
      if (!kinderVon.has(p)) kinderVon.set(p, [])
      kinderVon.get(p)!.push(String(r.id))
    }
    const menge = new Set<string>()
    const sammle = (id: string) => {
      if (menge.has(id)) return
      menge.add(id)
      for (const k of kinderVon.get(id) ?? []) sammle(k)
    }
    sammle(filter.muskelId)
    muskelGruppenIds = Array.from(menge)
  }

  // Geraetegruppe -> Geraete-IDs.
  let geraeteIds: string[] | null = null
  if (filter.geraeteGruppe) {
    const { data: geraete } = await t.from('equipment')
      .select('id').eq('equipment_group', filter.geraeteGruppe)
    geraeteIds = (geraete ?? []).map(r => String((r as Record<string, unknown>).id))
    if (geraeteIds.length === 0) return { zeilen: [], gesamt: 0 }
  }

  // `[cmd]` KEIN `.in('id', [...])` mit der Trefferliste der
  // Muskelgruppe: ueber rund 200 UUIDs antwortet PostgREST mit
  // „URI too long", und der Fehler kam als leere Liste zurueck —
  // gemessen, nachdem „Chest, mit sekundaer" (252 Treffer) null
  // Zeilen zeigte. Statt der IDs wird ueber die Verbundtabelle
  // gefiltert; die Muskelbedingung steht als `inner join`.
  const muskelJoin = filter.muskelId
    ? `,exercise_muscles!inner(muscle_group_id,role)`
    : ''

  let q = t.from('exercises').select(
    'id,name,discipline,equipment_id,'
    + 'equipment:equipment_id (name,name_de,equipment_group)'
    + muskelJoin,
    { count: 'exact' })

  if (filter.suche) q = q.ilike('name', `%${filter.suche}%`)
  if (geraeteIds) q = q.in('equipment_id', geraeteIds)
  if (filter.disziplin) q = q.eq('discipline', filter.disziplin)
  if (filter.muskelId && muskelGruppenIds) {
    q = q.in('exercise_muscles.muscle_group_id', muskelGruppenIds)
    if (nurPrimaer) q = q.eq('exercise_muscles.role', 'primary')
  }

  const { data, count, error } = await q.order('name').limit(filter.limit ?? 100)
  // Ein Fehler darf nicht als „nichts gefunden" durchgehen — genau das
  // hat den `URI too long`-Fall so lange verdeckt.
  if (error) throw new Error(`Uebungen lesen: ${error.message}`)

  const ids = (data ?? []).map(r => String((r as unknown as Record<string, unknown>).id))
  if (ids.length === 0) return { zeilen: [], gesamt: count ?? 0 }

  // Muskeln je Uebung, auf die Wurzelgruppe zusammengefasst.
  const { data: gruppen } = await t.from('muscle_groups').select('id,name,parent_id')
  const knoten = new Map<string, { name: string; parent: string | null }>()
  for (const g of gruppen ?? []) {
    const r = g as Record<string, unknown>
    knoten.set(String(r.id), {
      name: String(r.name), parent: r.parent_id ? String(r.parent_id) : null })
  }
  const wurzelName = (id: string) => {
    let lauf = knoten.get(id)
    while (lauf?.parent) lauf = knoten.get(lauf.parent)
    return lauf?.name ?? null
  }

  const { data: zuord } = await t.from('exercise_muscles')
    .select('exercise_id,muscle_group_id,role').in('exercise_id', ids)
  const muskeln = new Map<string, { p: Set<string>; s: Set<string> }>()
  for (const z of zuord ?? []) {
    const r = z as Record<string, unknown>
    const ex = String(r.exercise_id)
    const name = wurzelName(String(r.muscle_group_id))
    if (!name) continue
    if (!muskeln.has(ex)) muskeln.set(ex, { p: new Set(), s: new Set() })
    if (String(r.role) === 'primary') muskeln.get(ex)!.p.add(name)
    else muskeln.get(ex)!.s.add(name)
  }

  // e1RM je Uebung aus den Saetzen — nur fuer die sichtbaren Zeilen.
  const e1rm = await getBesteSaetze(ids)

  const zeilen: Uebung[] = (data ?? []).map(r => {
    const roh = r as unknown as Record<string, unknown>
    const eqRoh = roh.equipment
    const eq = (Array.isArray(eqRoh) ? eqRoh[0] : eqRoh) as Record<string, unknown> | null
    const id = String(roh.id)
    const m = muskeln.get(id)
    const best = e1rm.get(id)
    return {
      id,
      name: String(roh.name),
      discipline: (roh.discipline as string) ?? null,
      equipment_name: eq ? String(eq.name) : null,
      equipment_name_de: eq?.name_de ? String(eq.name_de) : null,
      equipment_group: eq?.equipment_group ? String(eq.equipment_group) : null,
      primaer: m ? Array.from(m.p).sort() : [],
      sekundaer: m ? Array.from(m.s).sort() : [],
      e1rm: best?.e1rm ?? null,
      bester_satz: best?.satz ?? null,
    }
  })

  return { zeilen, gesamt: count ?? zeilen.length }
}

/**
 * Bestes e1RM und der Satz dahinter, je Uebung.
 *
 * `[cmd]` Deckt 6 von 1.416 Uebungen — 108 Saetze. Die uebrigen
 * zeigen einen Strich, wie in der Vorlage bei `Lateral Raise`.
 */
async function getBesteSaetze(exerciseIds: string[]): Promise<
  Map<string, { e1rm: number; satz: string }>
> {
  const ergebnis = new Map<string, { e1rm: number; satz: string }>()
  const supabase = createSessionClient()
  const t = supabase.schema('training')

  const { data: we } = await t.from('workout_exercises')
    .select('id,exercise_id').in('exercise_id', exerciseIds)
  const zuUebung = new Map<string, string>()
  for (const r of we ?? []) {
    const x = r as Record<string, unknown>
    zuUebung.set(String(x.id), String(x.exercise_id))
  }
  if (zuUebung.size === 0) return ergebnis

  const { data: saetze } = await t.from('workout_sets')
    .select('workout_exercise_id,estimated_1rm,weight_kg,reps')
    .in('workout_exercise_id', Array.from(zuUebung.keys()))
    .not('estimated_1rm', 'is', null)

  for (const s of saetze ?? []) {
    const r = s as Record<string, unknown>
    const ex = zuUebung.get(String(r.workout_exercise_id))
    if (!ex) continue
    const wert = zahl(r.estimated_1rm)
    if (wert === null) continue
    const bisher = ergebnis.get(ex)
    if (!bisher || wert > bisher.e1rm) {
      const kg = zahl(r.weight_kg)
      const reps = zahl(r.reps)
      ergebnis.set(ex, {
        e1rm: wert,
        satz: kg != null && reps != null ? `${kg} kg × ${reps}` : '—',
      })
    }
  }
  return ergebnis
}
