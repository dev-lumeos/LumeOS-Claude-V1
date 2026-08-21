// Die Naehrstoffordnung aus `nutrition.nutrient_defs` (G-101, C-54),
// seit G-121 mit den Werten aus der LANGEN Tagesform (C-157).
//
// **DIE HIERARCHIE STECKT IN `display_tier`, NICHT IN EINEM
// `parent_code`.** `[cmd]` Gemessen am 2026-08-20: die Tabelle hat
// keine Elternspalte (die kommt mit C-161). Sie fuehrt **138
// Naehrstoffe in 12 Gruppen**, je mit `display_tier` (1–3) und
// `sort_index`; **kein Eintrag ohne Stufe.**
//
// **WOHER DIE WERTE KOMMEN (G-121):** nicht mehr aus `daily_summary`
// (37 Spalten), sondern aus `nutrition.nutrient_summary_window(user,
// stichtag, tage)` — sie aggregiert die lange Form
// `daily_nutrient_summary_long` und liefert **alle 138** Naehrstoffe
// samt Vollstaendigkeit (`value_count`/`missing_count`). `[cmd]` Ein
// Tag und ein Fenster sind derselbe Pfad: `p_days = 1` ist die
// Tagessumme. 30 Tage brauchen ~35 ms, 90 Tage ~92 ms (Serverzeit).
//
// **TAG ZEIGT DIE SUMME, FENSTER DEN SCHNITT:** bei `fenster > 1`
// traegt `wert` den **Schnitt je protokolliertem Tag**
// (`avg_per_logged_day`) — nur der ist mit einem Tagesziel
// vergleichbar; die Fenstersumme steht daneben in `summe`.
//
// **WOHER ZIEL UND OBERGRENZE KOMMEN:** aus
// `daily_reference_assessment(user, stichtag)` — dieselbe Funktion,
// die auch das Diary bewertet. Sie trifft die persoenliche Auswahl
// (Geschlecht, Alter) in der Datenbank; eine zweite Auswahl hier
// waere eine zweite Wahrheit. `[cmd]` 35 der 138 Codes tragen fuer
// den dev-Nutzer eine Referenz; die uebrigen zeigen einen Strich.
// `[read]` An einem Tag ohne Eintraege liefert die Funktion keine
// Zeilen — dann stehen auch die Ziele leer.
//
// **WIE AUS STUFEN EIN BAUM WIRD:** Innerhalb einer Gruppe, nach
// `sort_index` gelesen, ist der letzte Eintrag einer niedrigeren Stufe
// der Elternknoten. `[cmd]` Bei den Kohlenhydraten steht `SUGAR`
// (Stufe 1) an `sort_index` 73 — also NACH seinen Kindern. Deshalb
// wird die Gruppe **zweimal** durchlaufen: erst die Stufe-1-Knoten
// einsammeln, dann die tieferen zuordnen.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { getReferenceAssessment } from './reference-assessment-read'

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

/** Aussage ueber eine ZAHL gegen ihre Referenz — kein Urteil ueber die
 *  Person. `null` heisst: kein Wert oder keine Referenz. */
export type NaehrstoffStatus = 'unter' | 'im' | 'ueber'

export type NaehrstoffKnoten = {
  code: string
  name: string
  einheit: string | null
  stufe: number
  sort: number
  /** Der gezeigte Wert: Tag = Summe, Fenster = Schnitt je
   *  protokolliertem Tag. */
  wert: number | null
  /** Die Summe ueber das Fenster (beim Tag gleich `wert`). */
  summe: number | null
  /** Positionen im Fenster, die diesen Naehrstoff betrafen. */
  positionen: number
  /** Davon mit Wert / ohne Wert — „188 g aus 11 von 14 Positionen". */
  positionenMitWert: number
  positionenOhneWert: number
  /** Tage im Fenster mit Protokoll / davon vollstaendig fuer diesen
   *  Naehrstoff. */
  tageErfasst: number
  tageVollstaendig: number
  /** Ziel aus der persoenlichen Referenzauswahl (`target`-Zeile). */
  ziel: number | null
  zielMax: number | null
  zielArt: string | null
  /** Obergrenze (`upper_limit`-Zeile), falls gefuehrt. */
  obergrenze: number | null
  /** wert / ziel in Prozent, falls beides da ist. */
  prozent: number | null
  status: NaehrstoffStatus | null
  kinder: NaehrstoffKnoten[]
}

export type NaehrstoffGruppe = {
  name: string
  /** Alle Eintraege der Gruppe, auch die verschachtelten. */
  anzahl: number
  /** Wieviele davon einen Wert haben. */
  mitWert: number
  knoten: NaehrstoffKnoten[]
}

export type NaehrstoffOrdnung = {
  gruppen: NaehrstoffGruppe[]
  gesamt: number
  /** Wieviele Naehrstoffe im Fenster einen Wert tragen. */
  messbar: number
  /** Wieviele eine Referenz tragen, und wie die Zahlen dazu stehen. */
  mitReferenz: number
  unterZiel: number
  ueberObergrenze: number
  /** Das gewaehlte Fenster in Tagen (1 = der Stichtag selbst). */
  fenster: number
  stichtag: string
  /** Tage mit Protokoll im Fenster (Maximum ueber alle Zeilen). */
  tageErfasst: number
  fehler: string | null
}

/**
 * Baut aus einer nach `sort_index` sortierten Gruppe den Baum.
 *
 * `[read]` Zwei Durchlaeufe, weil ein Elternknoten NACH seinen Kindern
 * stehen kann (`SUGAR` an 73, seine Kinder ab 65). Ein einzelner
 * Durchlauf mit „letzter flacherer Knoten ist der Vater" wuerde die
 * ersten sechs Kinder heimatlos lassen.
 */
export function baueBaum(flach: NaehrstoffKnoten[]): NaehrstoffKnoten[] {
  const wurzeln = flach.filter(k => k.stufe === 1)
  if (wurzeln.length === 0) {
    // Gruppen ohne Stufe-1-Knoten (Ballaststoffe, Zuckeralkohole,
    // Organische Saeuren) stehen flach — das ist kein Fehler, sondern
    // heisst: es gibt keinen Sammelbegriff dafuer.
    return flach
  }

  // Die uebrigen der Reihe nach an den zuletzt passenden Elternknoten.
  // Stufe 2 haengt an der Stufe 1, Stufe 3 an der zuletzt gesehenen
  // Stufe 2 (sonst an der Stufe 1).
  let letzteEins: NaehrstoffKnoten | null = wurzeln[0] ?? null
  let letzteZwei: NaehrstoffKnoten | null = null
  for (const k of flach) {
    if (k.stufe === 1) { letzteEins = k; letzteZwei = null; continue }
    if (k.stufe === 2) {
      letzteZwei = k
      ;(letzteEins ?? wurzeln[0]).kinder.push(k)
      continue
    }
    // Stufe 3
    const ziel = letzteZwei ?? letzteEins ?? wurzeln[0]
    ziel.kinder.push(k)
  }
  return wurzeln
}

/** Eine Zeile der Fensterfunktion, aufs Noetige reduziert. */
type FensterZeile = {
  logged_day_count: number
  complete_day_count: number
  item_count: number
  value_count: number
  missing_count: number
  total_value: number | null
  avg_per_logged_day: number | null
}

export async function ladeOrdnung(
  stichtag: string, fenster = 1,
): Promise<NaehrstoffOrdnung> {
  const leer: NaehrstoffOrdnung = {
    gruppen: [], gesamt: 0, messbar: 0, mitReferenz: 0, unterZiel: 0,
    ueberObergrenze: 0, fenster, stichtag, tageErfasst: 0, fehler: null,
  }
  try {
    const client = createSessionClient()
    const db = client.schema('nutrition')

    const { data: { user } } = await client.auth.getUser()
    if (!user) return { ...leer, fehler: 'Keine Sitzung' }

    // Die Gliederung kommt weiter aus `nutrient_defs` — die
    // Fensterfunktion liefert nur Zeilen, wenn der Nutzer im Fenster
    // protokolliert hat, und ein leerer Tab waere die falsche Antwort
    // auf einen leeren Tag: die Ordnung existiert auch ohne Werte.
    const [defsR, fensterR, refsR] = await Promise.allSettled([
      db.from('nutrient_defs')
        .select('code, name_de, unit, group_de, display_tier, sort_index')
        .order('sort_index', { ascending: true }),
      db.rpc('nutrient_summary_window', {
        p_user_id: user.id, p_end_date: stichtag, p_days: fenster,
      }),
      getReferenceAssessment(stichtag),
    ])

    if (defsR.status !== 'fulfilled' || defsR.value.error) {
      return {
        ...leer,
        fehler: defsR.status === 'fulfilled'
          ? defsR.value.error?.message ?? 'unbekannt'
          : 'Naehrstoffliste nicht gelesen',
      }
    }

    const defs = (defsR.value.data ?? []) as unknown as Array<Record<string, unknown>>

    const werte = new Map<string, FensterZeile>()
    if (fensterR.status === 'fulfilled' && !fensterR.value.error) {
      for (const r of (fensterR.value.data ?? []) as unknown as Array<Record<string, unknown>>) {
        const code = text(r.nutrient_code)
        if (!code) continue
        werte.set(code, {
          logged_day_count: zahl(r.logged_day_count) ?? 0,
          complete_day_count: zahl(r.complete_day_count) ?? 0,
          item_count: zahl(r.item_count) ?? 0,
          value_count: zahl(r.value_count) ?? 0,
          missing_count: zahl(r.missing_count) ?? 0,
          total_value: zahl(r.total_value),
          avg_per_logged_day: zahl(r.avg_per_logged_day),
        })
      }
    }

    // Je Code die Ziel- und die Obergrenzen-Zeile der persoenlichen
    // Auswahl. Mehrere Zeilen je Code sind normal (target + UL).
    const ziele = new Map<string, { min: number | null; max: number | null; art: string | null }>()
    const grenzen = new Map<string, number>()
    if (refsR.status === 'fulfilled') {
      for (const r of refsR.value) {
        if (r.reference_direction === 'target' && !ziele.has(r.nutrient_code)) {
          ziele.set(r.nutrient_code, {
            min: r.reference_value_min, max: r.reference_value_max,
            art: r.reference_kind,
          })
        }
        if (r.reference_direction === 'upper_limit' && r.reference_value_min !== null
          && !grenzen.has(r.nutrient_code)) {
          grenzen.set(r.nutrient_code, r.reference_value_min)
        }
      }
    }

    const proGruppe = new Map<string, NaehrstoffKnoten[]>()
    let messbar = 0
    let mitReferenz = 0
    let unterZiel = 0
    let ueberObergrenze = 0
    let tageErfasst = 0
    for (const d of defs) {
      const code = text(d.code)
      const gruppe = text(d.group_de)
      if (!code || !gruppe) continue

      const z = werte.get(code)
      const wert = z === undefined ? null
        : fenster === 1 ? z.total_value : z.avg_per_logged_day
      if (wert !== null) messbar += 1
      if (z) tageErfasst = Math.max(tageErfasst, z.logged_day_count)

      const ziel = ziele.get(code) ?? null
      const obergrenze = grenzen.get(code) ?? null
      if (ziel || obergrenze !== null) mitReferenz += 1

      // Aussage ueber die Zahl: unter dem Ziel, ueber der Obergrenze,
      // sonst im Bereich — nur wo Wert UND Referenz existieren.
      let status: NaehrstoffStatus | null = null
      if (wert !== null && (ziel?.min != null || obergrenze !== null)) {
        if (obergrenze !== null && wert > obergrenze) status = 'ueber'
        else if (ziel?.min != null && wert < ziel.min) status = 'unter'
        else status = 'im'
      }
      if (status === 'unter') unterZiel += 1
      if (status === 'ueber') ueberObergrenze += 1

      const knoten: NaehrstoffKnoten = {
        code,
        name: text(d.name_de) ?? code,
        einheit: text(d.unit),
        stufe: zahl(d.display_tier) ?? 1,
        sort: zahl(d.sort_index) ?? 0,
        wert,
        summe: z?.total_value ?? null,
        positionen: z?.item_count ?? 0,
        positionenMitWert: z?.value_count ?? 0,
        positionenOhneWert: z?.missing_count ?? 0,
        tageErfasst: z?.logged_day_count ?? 0,
        tageVollstaendig: z?.complete_day_count ?? 0,
        ziel: ziel?.min ?? null,
        zielMax: ziel?.max != null && ziel.max !== ziel.min ? ziel.max : null,
        zielArt: ziel?.art ?? null,
        obergrenze,
        prozent: wert !== null && ziel?.min != null && ziel.min > 0
          ? (wert / ziel.min) * 100 : null,
        status,
        kinder: [],
      }
      const liste = proGruppe.get(gruppe)
      if (liste) liste.push(knoten)
      else proGruppe.set(gruppe, [knoten])
    }

    const gruppen: NaehrstoffGruppe[] = []
    for (const name of Array.from(proGruppe.keys())) {
      const flach = (proGruppe.get(name) ?? []).slice().sort((a, b) => a.sort - b.sort)
      gruppen.push({
        name,
        anzahl: flach.length,
        mitWert: flach.filter(k => k.wert !== null).length,
        knoten: baueBaum(flach),
      })
    }
    // Groesste Gruppe zuerst — wie die Messung sie ausweist.
    gruppen.sort((a, b) => b.anzahl - a.anzahl)

    return {
      gruppen, gesamt: defs.length, messbar, mitReferenz, unterZiel,
      ueberObergrenze, fenster, stichtag, tageErfasst, fehler: null,
    }
  } catch (e) {
    return { ...leer, fehler: e instanceof Error ? e.message : String(e) }
  }
}
