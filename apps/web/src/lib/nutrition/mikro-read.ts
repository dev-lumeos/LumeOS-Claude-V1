// Lesepfad fuer die zwei Mikronaehrstoff-Kacheln des Diary (G-101).
//
// **BEIDE FUNKTIONEN LIEGEN IN DER DATENBANK.** `[cmd]`
// `nutrition.micronutrient_snapshot(user, datum)` und
// `nutrition.micronutrient_below_threshold(user, datum, pct)` — hier
// wird nichts nachgerechnet, nur geholt und in Typen uebersetzt.
//
// `[cmd]` **Der Auftrag nannte den Namen falsch**, aber anders als
// vermutet: `micronutrient_overview_items` ist die **Konfiguration**
// (8 Zeilen: welche Naehrstoffe die Kachel zeigt, in welcher
// Reihenfolge), `micronutrient_snapshot` die **Funktion**, die daraus
// mit den Tageswerten die Kachel fuellt. Beides existiert.
//
// **DIE GRENZE:** `[read]` Zahlen ja, Urteile nein. Die Funktion
// liefert `reference_kind` (PRI, AI, UL, GOAL, FORMULA) und
// `completeness`; wo sie `incomplete` meldet, steht **keine Prozentzahl**
// — und hier wird auch keine erfunden.
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

export type MikroZeile = {
  reihenfolge: number
  code: string
  label: string
  /** Der lange Name aus `nutrient_defs`, fuer den Titel. */
  name_lang: string | null
  einheit: string | null
  wert: number | null
  referenz: number | null
  /**
   * Prozent der Referenz. `null` heisst **nicht ermittelbar**, nicht
   * null Prozent — die Funktion laesst es leer, wenn die Tagessumme
   * unvollstaendig ist.
   */
  prozent: number | null
  /** `PRI`, `AI`, `UL`, `GOAL`, `FORMULA` — oder `NO_REFERENCE`. */
  referenz_art: string | null
  /** `complete` oder `incomplete`. */
  vollstaendigkeit: string | null
  hinweis: string | null
  quelle: string | null
}

export type UnterSchwelleZeile = {
  code: string
  name: string
  wert: number | null
  referenz: number | null
  prozent: number | null
  referenz_art: string | null
  einheit: string | null
}

export type MikroStand = {
  zeilen: MikroZeile[]
  /** Die Schwelle in Prozent, gegen die geprueft wurde. */
  schwelle: number
  /** Wieviele Naehrstoffe insgesamt geprueft wurden. */
  geprueft: number
  unterSchwelle: UnterSchwelleZeile[]
  fehler: string | null
}

const LEER: MikroStand = {
  zeilen: [], schwelle: 80, geprueft: 0, unterSchwelle: [], fehler: null,
}

/**
 * Beide Kacheln in einem Aufruf.
 *
 * `[read]` Die Schwelle steht bei 80 %: darunter faellt ein Wert
 * sichtbar hinter die Empfehlung zurueck, ohne dass jede Schwankung
 * eine Meldung ergibt. **Sie ist eine Anzeigeentscheidung, keine
 * medizinische** — der Text an der Kachel sagt das.
 */
export async function ladeMikro(
  stichtag: string,
  schwelle = 80,
): Promise<MikroStand> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return LEER

    const db = client.schema('nutrition')
    const [schnapp, unten] = await Promise.allSettled([
      db.rpc('micronutrient_snapshot', {
        p_user_id: user.id, p_entry_date: stichtag,
      }),
      db.rpc('micronutrient_below_threshold', {
        p_user_id: user.id, p_entry_date: stichtag, p_threshold_pct: schwelle,
      }),
    ])

    const stand: MikroStand = { ...LEER, schwelle }

    if (schnapp.status === 'fulfilled' && !schnapp.value.error) {
      const roh = (schnapp.value.data ?? []) as unknown as Array<Record<string, unknown>>
      stand.zeilen = roh.map(r => ({
        reihenfolge: zahl(r.display_order) ?? 0,
        code: text(r.nutrient_code) ?? '',
        label: text(r.label_de) ?? text(r.nutrient_code) ?? '',
        name_lang: text(r.nutrient_name_de),
        einheit: text(r.unit),
        wert: zahl(r.actual_value),
        referenz: zahl(r.reference_value),
        prozent: zahl(r.reference_pct),
        referenz_art: text(r.reference_kind),
        vollstaendigkeit: text(r.reference_status),
        hinweis: text(r.source_note),
        quelle: text(r.value_source),
      })).sort((a, b) => a.reihenfolge - b.reihenfolge)
    } else if (schnapp.status === 'fulfilled' && schnapp.value.error) {
      stand.fehler = schnapp.value.error.message
    }

    if (unten.status === 'fulfilled' && !unten.value.error) {
      // Die Funktion gibt EINE Zeile mit einem JSON-Feld zurueck.
      const roh = (unten.value.data ?? []) as unknown as Array<Record<string, unknown>>
      const zeile = roh[0] ?? {}
      stand.geprueft = zahl(zeile.total_assessed) ?? 0
      const liste = Array.isArray(zeile.items) ? zeile.items : []
      stand.unterSchwelle = (liste as Array<Record<string, unknown>>).map(i => ({
        code: text(i.nutrient_code) ?? '',
        name: text(i.name_de) ?? text(i.nutrient_code) ?? '',
        wert: zahl(i.actual_value),
        referenz: zahl(i.reference_value),
        prozent: zahl(i.reference_pct),
        referenz_art: text(i.reference_kind),
        einheit: text(i.unit),
      })).sort((a, b) => (a.prozent ?? 999) - (b.prozent ?? 999))
    }

    return stand
  } catch (e) {
    return { ...LEER, fehler: e instanceof Error ? e.message : String(e) }
  }
}
