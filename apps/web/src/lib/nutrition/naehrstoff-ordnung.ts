// Die Naehrstoffordnung aus `nutrition.nutrient_defs` (G-101, C-54).
//
// **DIE HIERARCHIE STECKT IN `display_tier`, NICHT IN EINEM
// `parent_code`.** `[cmd]` Gemessen am 2026-08-20: die Tabelle hat
// keine Elternspalte. Sie fuehrt **138 Naehrstoffe in 12 Gruppen**, je
// mit `display_tier` (1–3) und `sort_index`; **kein Eintrag ohne
// Stufe.**
//
// `[read]` **Toms Befund *„zeigt nur added sugar"*** kam daher, dass
// die Oberflaeche diese Ordnung gar nicht las: der Baum in
// `nutrient-baum.ts` ist eine **feste Liste aus dem Entwurf** — 79
// erfundene Eintraege in 8 Gruppen, deren Namen (`Macronutrients`,
// `Bioactives`) in der Datenbank nicht vorkommen.
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

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

export type NaehrstoffKnoten = {
  code: string
  name: string
  einheit: string | null
  stufe: number
  sort: number
  /** Der Tageswert, falls die Tagessumme ihn fuehrt. */
  wert: number | null
  /** Die Referenz aus `nutrient_reference_values`, falls vorhanden. */
  referenz: number | null
  referenz_art: string | null
  kinder: NaehrstoffKnoten[]
}

export type NaehrstoffGruppe = {
  name: string
  /** Alle Eintraege der Gruppe, auch die verschachtelten. */
  anzahl: number
  /** Wieviele davon einen Tageswert haben. */
  mitWert: number
  knoten: NaehrstoffKnoten[]
}

export type NaehrstoffOrdnung = {
  gruppen: NaehrstoffGruppe[]
  gesamt: number
  /** Wieviele Naehrstoffe die Tagessumme ueberhaupt fuehrt. */
  messbar: number
  fehler: string | null
}

/**
 * `daily_summary` fuehrt die Werte als SPALTEN, nicht als JSON.
 *
 * `[cmd]` 28 Naehrstoffe plus die Makros — gemessen an der
 * Spaltenliste. Der Code aus `nutrient_defs` ist gross geschrieben
 * (`VITD`), die Spalte klein (`vitd`); Sonderzeichen werden ersetzt:
 * `F18:3CN3` wird zu `f18_3cn3`.
 */
function spaltenname(code: string): string {
  return code.toLowerCase().replace(/[:.-]/g, '_')
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

export async function ladeOrdnung(stichtag: string): Promise<NaehrstoffOrdnung> {
  const leer: NaehrstoffOrdnung = { gruppen: [], gesamt: 0, messbar: 0, fehler: null }
  try {
    const client = createSessionClient()
    const db = client.schema('nutrition')

    const [defsR, refsR, summeR] = await Promise.allSettled([
      db.from('nutrient_defs')
        .select('code, name_de, unit, group_de, display_tier, sort_index')
        .order('sort_index', { ascending: true }),
      db.from('nutrient_reference_values')
        .select('nutrient_code, reference_kind, value_min, unit'),
      db.from('daily_summary').select('*').eq('entry_date', stichtag).maybeSingle(),
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

    // Referenzen: je Code die erste, die eine Untergrenze traegt.
    // `[read]` Mehrere Zeilen je Code sind normal — sie unterscheiden
    // nach Geschlecht und Alter. Das Dashboard braucht die Ordnung,
    // nicht die persoenliche Auswahl; die trifft
    // `daily_reference_assessment`.
    const refs = new Map<string, { wert: number | null; art: string | null }>()
    if (refsR.status === 'fulfilled' && !refsR.value.error) {
      for (const r of (refsR.value.data ?? []) as unknown as Array<Record<string, unknown>>) {
        const code = text(r.nutrient_code)
        if (!code || refs.has(code)) continue
        refs.set(code, { wert: zahl(r.value_min), art: text(r.reference_kind) })
      }
    }

    const summe = (summeR.status === 'fulfilled' && !summeR.value.error
      ? summeR.value.data
      : null) as Record<string, unknown> | null

    const proGruppe = new Map<string, NaehrstoffKnoten[]>()
    let messbar = 0
    for (const d of defs) {
      const code = text(d.code)
      const gruppe = text(d.group_de)
      if (!code || !gruppe) continue
      const wert = summe ? zahl(summe[spaltenname(code)]) : null
      if (wert !== null) messbar += 1
      const ref = refs.get(code)
      const knoten: NaehrstoffKnoten = {
        code,
        name: text(d.name_de) ?? code,
        einheit: text(d.unit),
        stufe: zahl(d.display_tier) ?? 1,
        sort: zahl(d.sort_index) ?? 0,
        wert,
        referenz: ref?.wert ?? null,
        referenz_art: ref?.art ?? null,
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

    return { gruppen, gesamt: defs.length, messbar, fehler: null }
  } catch (e) {
    return { ...leer, fehler: e instanceof Error ? e.message : String(e) }
  }
}
