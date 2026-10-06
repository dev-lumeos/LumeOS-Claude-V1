// Das Ankerdatum — G-544/A2. **Reine Rechnung, kein I/O.**
//
// ══ WAS DER ENTWURF ZEIGT ══════════════════════════════════════════
//
// `[cmd]` **`module-goals-editor.jsx:295-330`, der `anchor`-Reiter:**
//
//     „Set your show or target date. Everything upstream —
//      sub-phases, refeed start, peak week, taper — recomputes
//      backwards from here."
//
// `[cmd]` **Der Entwurf setzt `anchorDate = '2026-11-14'`** (`:61`)
// **und zeigt sechs Zeilen** (`:313-319`):
//
//     Prep start        2026-05-30   24 wk out
//     Mid phase start   2026-07-25   16 wk out
//     Late phase start  2026-09-19    8 wk out
//     Refeeds begin     2026-07-25   16 wk out
//     Peak week start   2026-11-07    1 wk out
//     Show day          2026-11-14    0
//
// `[cmd]` **Nachgerechnet, alle vier Datumszeilen stimmen als
// `anker − N Wochen`:**
//
//     2026-11-14 − 24 Wochen = 2026-05-30   ✓
//     2026-11-14 − 16 Wochen = 2026-07-25   ✓
//     2026-11-14 −  8 Wochen = 2026-09-19   ✓
//     2026-11-14 −  1 Woche  = 2026-11-07   ✓
//
// `[read]` **Im Entwurf sind die Daten fest eingetippt** — hier
// werden sie gerechnet, und die Wochen kommen aus dem Katalog.
//
// ══ WARUM DIESE DATEI SERVER-FREI IST ══════════════════════════════
//
// `[read]` **Der Auftrag: „Die Rechnung gehoert server-frei nach
// `lib/goals/`, nicht in die Komponente — sie wird vom Editor
// (G-539) erneut gebraucht, und zwei Rechnungen fuer dasselbe gehen
// auseinander."**
//
// `[read]` **Kein Import aus einem `*-write`- oder `*-read`-Modul**
// (A-30): beide Seiten duerfen diese Datei benutzen.
//
// ══ DIE WOCHEN KOMMEN AUS DEM KATALOG ══════════════════════════════
//
// `[cmd]` **`goal_strategies.sub_phases`, gemessen 2026-09-30** —
// **eine** der 17 Zeilen fuehrt sie (`contest_prep`):
//
//     early      "24–16"   string
//     mid        "16–8"    string
//     late       "8–2"     string
//     peak_week  1         number
//
// `[cmd]` **Der Trenner ist U+2013 (Gedankenstrich), nicht der
// Bindestrich und nicht der Pfeil** — gemessen an den Codepoints.
// `[read]` **Wer auf `-` prueft, findet nichts** und zeigt eine leere
// Achse, ohne dass es auffaellt.

import { utcTagIso } from '@lumeos/shared/datum'
/** Eine Zeile des rueckwaerts gerechneten Plans. */
export type Ankerzeile = {
  /** Der Name aus `sub_phases`, oder der feste des Entwurfs. */
  name: string
  /** ISO-Tag. */
  datum: string
  /** Wochen vor dem Anker. `0` ist der Anker selbst. */
  wochenVorher: number
  /**
   * `true` fuer die Ankerzeile selbst — der Entwurf zeigt sie als
   * *„Show day"* mit `0`.
   */
  anker: boolean
}

const ISO = /^\d{4}-\d{2}-\d{2}$/

/**
 * Ein Datum um N Wochen zurueck.
 *
 * `[read]` **Ohne `Date.now()`** — der Anker kommt von aussen.
 * `[read]` **In UTC gerechnet**, damit kein Zeitzonensprung einen Tag
 * verschiebt (die Lehre aus `lib/datum.ts`).
 */
export function minusWochen(iso: string, wochen: number): string | null {
  if (!ISO.test(iso)) return null
  const t = Date.parse(`${iso}T00:00:00Z`)
  if (!Number.isFinite(t)) return null
  return utcTagIso(new Date(t - wochen * 7 * 86400000))
}

/**
 * Die Wochenangabe einer Teilphase, als Zahl.
 *
 * `[cmd]` **Die Spalte fuehrt zwei Formen:** `"24–16"` (eine Spanne)
 * und `1` (eine Zahl). `[read]` **Bei einer Spanne zaehlt der ANFANG**
 * — *„Mid phase start"* ist der Beginn der Spanne `16–8`, also 16
 * Wochen vor dem Anker.
 *
 * `[cmd]` **Der Trenner ist U+2013**; Bindestrich und Pfeil werden
 * mitgenommen, weil eine spaetere Zeile sie tragen koennte.
 */
export function wochenAusAngabe(w: unknown): number | null {
  if (typeof w === 'number') return Number.isFinite(w) ? w : null
  if (typeof w !== 'string') return null
  // U+2013 · U+2192 · ASCII-Bindestrich
  const teil = w.split(/[–→-]/)[0]?.trim()
  const n = Number(teil)
  return Number.isFinite(n) ? n : null
}

export type Teilphasenangabe = {
  name: string
  weeks: string | number | null
}

/**
 * Der rueckwaerts gerechnete Plan.
 *
 * `[read]` **Absteigend nach Wochen** — wie im Entwurf: das
 * Frueheste oben, der Anker unten.
 *
 * `[read]` **Eine Teilphase ohne lesbare Wochenangabe faellt heraus,
 * statt auf dem Anker zu landen** — ein Datum, das nur deshalb
 * dasteht, weil eine Zahl fehlte, ist schlimmer als eine fehlende
 * Zeile.
 *
 * @param anker  Das Ziel- oder Wettkampfdatum, ISO.
 * @param phasen Aus `goal_strategies.sub_phases`.
 * @param ankerName  Die Beschriftung der Ankerzeile.
 */
export function ankerplan(
  anker: string,
  phasen: Teilphasenangabe[],
  ankerName = 'Zieltag',
): Ankerzeile[] {
  if (!ISO.test(anker)) return []

  const zeilen: Ankerzeile[] = []
  for (const p of phasen) {
    const w = wochenAusAngabe(p.weeks)
    if (w === null) continue
    const d = minusWochen(anker, w)
    if (d === null) continue
    zeilen.push({ name: p.name, datum: d, wochenVorher: w, anker: false })
  }

  zeilen.sort((a, b) => b.wochenVorher - a.wochenVorher)
  zeilen.push({ name: ankerName, datum: anker, wochenVorher: 0, anker: true })
  return zeilen
}

// ══ G-607: DIE WOCHEN KOMMEN AUS DEM VERHAELTNIS ═══════════════════
//
// `[cmd]` **Seit G-562 traegt `sub_phases` je Stufe `dauer_anteil`**
// (`contest_prep`: 4 / 8 / 6, Summe 18), **kein `weeks`** — E-85:
// der Katalog traegt das Verhaeltnis, das Programm die Wochen.
//
// `[cmd]` **Reines Runden traegt nicht:** 17 Wochen ergaeben
// 4 / 8 / 6 = 18. `[read]` **Deshalb der groesste Rest** (Hare-
// Niemeyer): erst jede Stufe abrunden, dann die fehlenden Wochen an
// die Stufen mit dem groessten Nachkommarest — bei Gleichstand an die
// fruehere. Die Summe ist damit immer die Gesamtdauer, und keine Stufe
// weicht um mehr als eine Woche von ihrem genauen Anteil ab.

/**
 * Gesamtwochen und Anteile → Wochen je Stufe.
 *
 * `[read]` **Summe immer = `gesamt`, jede Stufe ≥ 1.** Faellt eine
 * Stufe beim Runden auf 0, gibt die groesste eine Woche ab.
 * `[read]` **`null`, wenn es keine ehrliche Antwort gibt** — weniger
 * Wochen als Stufen, oder ein Anteil, der keine positive Zahl ist.
 */
export function stufenwochen(gesamt: number, anteile: number[]): number[] | null {
  if (!Number.isInteger(gesamt) || anteile.length === 0 || gesamt < anteile.length) return null
  if (!anteile.every(a => typeof a === 'number' && Number.isFinite(a) && a > 0)) return null
  const summe = anteile.reduce((s, a) => s + a, 0)
  const genau = anteile.map(a => gesamt * a / summe)
  const w = genau.map(Math.floor)
  let rest = gesamt - w.reduce((s, x) => s + x, 0)
  const nachRest = genau.map((g, i) => i).sort((a, b) =>
    (genau[b]! - w[b]!) - (genau[a]! - w[a]!) || a - b)
  for (const i of nachRest) { if (rest-- <= 0) break; w[i]!++ }
  for (let i = 0; i < w.length; i++) {
    if (w[i]! > 0) continue
    const groesste = w.indexOf(Math.max(...w))
    w[groesste]!--; w[i] = 1
  }
  return w
}

/**
 * Die Gesamtdauer: das Override des Nutzers, sonst der Katalog.
 *
 * `[cmd]` **Das Override ist `max_duration_weeks` in
 * `goal_phases.parameters`** — geschrieben von `phasenOverrideSetzen`.
 * `[read]` **Editor und Zeitachse fragen beide hier** — zwei
 * Rechnungen fuer dasselbe gehen auseinander.
 */
export function gesamtdauer(override: unknown, katalog: number | null): number | null {
  return typeof override === 'number' && Number.isFinite(override) ? override : katalog
}

/**
 * Die Teilphasen des Katalogs als Eingabe fuer `ankerplan`.
 *
 * `[read]` **`ankerplan` will je Stufe den ANFANG in Wochen vor dem
 * Anker** — die erste Stufe beginnt `gesamt` Wochen davor, jede
 * weitere um die Wochen ihrer Vorgaengerin spaeter.
 * `[read]` **Ohne Gesamtdauer oder ohne lesbare Anteile: leer** —
 * kein erfundenes Datum (G-544).
 */
export function teilphasenAusAnteil(
  phasen: Array<{ name: string; dauer_anteil: number | null }>,
  gesamt: number | null,
): Teilphasenangabe[] {
  if (gesamt === null) return []
  const w = stufenwochen(gesamt, phasen.map(p => p.dauer_anteil ?? NaN))
  if (!w) return []
  let vorher = gesamt
  return phasen.map((p, i) => {
    const z = { name: p.name, weeks: vorher }
    vorher -= w[i]!
    return z
  })
}

/**
 * Wie viele Wochen umfasst der Plan?
 *
 * `[cmd]` **Der Entwurf zeigt daneben „Total prep length: 24 wk"**
 * (`:305`). `[read]` **Das ist die groesste Wochenzahl, nicht eine
 * eigene Eingabe** — sonst koennten beide auseinandergehen.
 */
export function gesamtWochen(zeilen: Ankerzeile[]): number | null {
  const w = zeilen.map(z => z.wochenVorher)
  return w.length ? Math.max(...w) : null
}
