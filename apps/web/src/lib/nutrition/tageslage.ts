// ════════════════════════════════════════════════════════════════════
// DIE LAGE DES TAGES — C-48
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30. Nur Typen kommen von dort.
//
// **Diese Datei rechnet keine Bewertung.** `[read]` Die steht in
// `mikro-lage.ts` (G-239) und in `daily_reference_assessment`. **Hier
// geht es um die Ebene davor: was wurde gegessen, wie steht der Tag.**
//
// ══ DER BEFUND, DER DIESE DATEI NOETIG MACHT ════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-28 auf dev:** `ansicht.tsx:150`
// bildete den Leerzustand als
//
//     const leer = !summe || summe.item_count === 0
//
// **und warf damit ZWEI verschiedene Lagen in einen Topf.** `[cmd]`
// Auf dem Bildschirm gemessen — beide Tage zeigten denselben Satz
// *„Nichts erfasst an diesem Tag"*:
//
//     2026-01-15   keine Zeile in `daily_summary`, 0 Mahlzeiten
//                  -> es wurde nie etwas angelegt
//     2026-05-29   4 Mahlzeiten, 0 Positionen
//                  -> es wurde gegessen und nichts erfasst
//
// `[read]` **Das ist genau die Unterscheidung, nach der die
// Gegenprobe des Auftrags fragt** — und dieselbe Klasse wie
// `begruendet_leer` gegen `nicht_bearbeitet` (G-208) und
// `ohne_referenz` gegen `unvollstaendig` (G-239). **Ein leerer Tag
// und ein unfertiger Tag sind nicht dasselbe.**
//
// ══ REGEL 1 AUS DEM BEFUND ══════════════════════════════════════════
//
// `[cmd]` **`nutrition.daily_summary` traegt 74 Spalten, davon 35
// `_missing`-Zaehler** (gemessen 2026-08-28). **Steht einer ueber
// null, ist die Summe unvollstaendig — die Oberflaeche darf daraus
// keine Null machen.**
//
// `[cmd]` **Auf dev feuern sie fast nie:** bei den vier Hauptmakros
// **0 von 181 Tagen**. `vitc_missing` dagegen an **180 von 181**,
// `water_g` und `zn` an je 3, `fe` an 1.
//
// `[read]` **Das ist ein Befund, kein Fehler:** die Regel ist im Code
// da, hat bei den Makros aber nichts zu zeigen. **Wer sie nur an
// `enercc` prueft, haelt sie faelschlich fuer tot.**

import type { DailySummaryRow, SummaryMacro } from './diary-summary'

/**
 * Die Lage des Tages.
 *
 * `[read]` **`nichts_angelegt` und `ohne_positionen` sind
 * verschieden** — siehe Kopf. `teilweise` heisst: erfasst, aber mit
 * Luecken in der Summe.
 */
export type Tageslage =
  | 'nichts_angelegt'
  | 'ohne_positionen'
  | 'teilweise'
  | 'erfasst'

export function tageslageVon(summe: DailySummaryRow | null): Tageslage {
  if (!summe) return 'nichts_angelegt'
  if (summe.item_count === 0) {
    // `[cmd]` Der Unterschied haengt an `meal_count`: eine Zeile in
    // `daily_summary` ohne Mahlzeit gibt es auf dev nicht (0 Faelle),
    // eine Mahlzeit ohne Positionen schon (1 Fall, 2026-05-29).
    return summe.meal_count > 0 ? 'ohne_positionen' : 'nichts_angelegt'
  }
  return 'erfasst'
}

export const LAGE_TITEL: Record<Tageslage, string> = {
  nichts_angelegt: 'Nichts erfasst an diesem Tag.',
  ohne_positionen: 'Mahlzeiten angelegt, aber nichts darin.',
  teilweise: 'Teilweise erfasst.',
  erfasst: '',
}

/**
 * Der Satz unter dem Titel.
 *
 * `[read]` **Bei `ohne_positionen` darf nicht „nichts erfasst"
 * stehen** — es steht etwas da, es fehlt nur der Inhalt. Der
 * Unterschied entscheidet, was der Nutzer als Naechstes tut.
 */
export function lageSatz(lage: Tageslage, mahlzeiten: number): string {
  if (lage === 'ohne_positionen') {
    const m = mahlzeiten === 1 ? 'Eine Mahlzeit steht' : `${mahlzeiten} Mahlzeiten stehen`
    return `${m} für diesen Tag, aber ohne Lebensmittel. `
      + 'Die Tagessumme bleibt deshalb leer — das ist keine Aussage über das, '
      + 'was du gegessen hast.'
  }
  if (lage === 'nichts_angelegt') {
    return 'Für diesen Tag ist keine Mahlzeit angelegt.'
  }
  return ''
}

// ── Regel 1: die Fehlzaehler ─────────────────────────────────────

export type Luecke = {
  code: SummaryMacro
  label: string
  fehlend: number
}

/**
 * Die Fehlzaehler der angezeigten Makros, gesammelt.
 *
 * `[read]` **Gezaehlt wird je Naehrstoff, nicht summiert** — „3
 * Positionen ohne Wert" bei Eisen und bei Vitamin C sind nicht sechs
 * Luecken, sondern zwei betroffene Naehrstoffe.
 */
export function lueckenVon(
  summe: DailySummaryRow | null,
  makros: ReadonlyArray<{ code: SummaryMacro; label: string }>,
): Luecke[] {
  if (!summe) return []
  const aus: Luecke[] = []
  for (const m of makros) {
    const fehlend = summe.macros[m.code]?.missing ?? 0
    if (fehlend > 0) aus.push({ code: m.code, label: m.label, fehlend })
  }
  return aus
}

/**
 * Der Satz zu den Luecken.
 *
 * `[cmd]` **Regel 1:** steht ein Zaehler ueber null, ist die Summe
 * unvollstaendig. `[read]` **Der Satz sagt, in welche Richtung sie
 * falsch ist** — zu niedrig, nicht bloss ungenau. Wer das nicht
 * weiss, liest eine Unterdeckung, wo eine Luecke steht.
 */
export function lueckenSatz(luecken: readonly Luecke[]): string {
  if (luecken.length === 0) return ''
  const namen = luecken.map(l => l.label).join(', ')
  const zahl = luecken.length === 1
    ? `${luecken[0].fehlend === 1 ? 'Eine Position' : `${luecken[0].fehlend} Positionen`}`
    : `${luecken.reduce((n, l) => n + l.fehlend, 0)} Positionen`
  return `${zahl} ohne Wert bei ${namen}. `
    + 'Die Summe ist damit unvollständig und eher zu niedrig als zu hoch.'
}

/** Ob eine Zahl als vollstaendig gelten darf. */
export function istVollstaendig(
  summe: DailySummaryRow | null, code: SummaryMacro,
): boolean {
  if (!summe) return false
  return (summe.macros[code]?.missing ?? 0) === 0
}

// ── Was noch fehlt ───────────────────────────────────────────────

export type Rest = {
  code: SummaryMacro
  label: string
  wert: number | null
  ziel: number | null
  /** `null`, wenn eines von beiden fehlt — kein erfundener Rest. */
  offen: number | null
  prozent: number | null
  /** Regel 1: die Summe traegt eine Luecke. */
  unvollstaendig: boolean
}

/**
 * Was am Tagesziel noch offen ist.
 *
 * `[read]` **Ohne Ziel kein Rest.** `[cmd]` Die Vorlage rechnet
 * `target.kcal - cur.kcal` mit einem festen Ziel von 2.700 — in
 * diesem Repo gibt es keine Zieltabelle mit Vorgabewerten, und ein
 * erfundener Nenner waere eine Behauptung (der Kopfkommentar von
 * `ansicht.tsx` haelt genau das fest). **Fehlt das Ziel, bleibt
 * `offen` null.**
 */
export function restVon(
  summe: DailySummaryRow | null,
  code: SummaryMacro,
  label: string,
  ziel: number | null,
): Rest {
  const wert = summe?.macros[code]?.value ?? null
  const fehlend = summe?.macros[code]?.missing ?? 0
  return {
    code,
    label,
    wert,
    ziel,
    offen: wert !== null && ziel !== null ? Math.round(ziel - wert) : null,
    prozent: wert !== null && ziel !== null && ziel !== 0
      ? Math.round((wert / ziel) * 100)
      : null,
    unvollstaendig: fehlend > 0,
  }
}
