// Aus 140 flachen Werten werden 35 Marker mit Verlauf.
//
// **WARUM DIESE DATEI EXISTIERT:** `[read]` Der Auftrag G-60: *„Eine
// Liste, in der Form der Attrappe"* — mit Verlauf, Sparkline und
// Bereichsbalken. `medical.lab_result_values_read` liefert eine Zeile
// je Messung, die Attrappe zeigt eine Zeile je Marker. Diese Datei ist
// die Faltung dazwischen, ohne Datenbank und ohne React, damit sie
// prüfbar bleibt — dasselbe Muster wie `befund.ts`.
//
// **KEINE BEWERTUNG.** Die Regel aus G-46 gilt weiter: die Anzeige
// sagt, **wo** ein Wert liegt, nicht was er bedeutet. Hier wird
// deshalb nichts berechnet, was ein Urteil wäre — kein Punktwert,
// keine Ampel, keine Empfehlung. Der Trend ist eine Rechnung über
// gemessene Zahlen, keine Aussage über Gesundheit.

import { bereichAusText, gueltigerBereich, lageImBereich, type Bereich, type Lage } from './befund'
import type { BefundWert } from './lesen'

/** Ein Marker mit allen seinen Messungen, jüngste zuerst. */
export type MarkerReihe = {
  /** LOINC, wenn zugeordnet — sonst der Rohtext als Schlüssel. */
  schluessel: string
  loinc_code: string | null
  name: string
  /** Kurzname aus `biomarker_aliases.canonical_name`, wenn es einen gibt. */
  kurz: string | null
  /** `loinc_class` des Katalogs — die einzige Gruppierung, die die Daten führen. */
  klasse: string | null
  einheit: string
  /** Alle Messungen, ALT → NEU (die Sparkline liest in dieser Richtung). */
  messungen: Messung[]
  /** Die jüngste Messung — sie trägt Wert, Bereich und Lage der Zeile. */
  aktuell: Messung
  bereich: Bereich | null
  lage: Lage
  optimal: { low: number | null; high: number | null } | null
  optimalText: string | null
  optimalLage: Lage
  /** Prozentuale Änderung erste → letzte Messung, `null` bei n < 2. */
  trendProzent: number | null
}

export type Messung = {
  id: string
  datum: string
  wert: number | null
  wertText: string | null
  operator: string
  reportId: string
  /**
   * G-80: die vier Felder, die bis dahin ungenutzt dastanden.
   *
   * `[read]` Der Befund aus G-63: *„Dass ein Bereich ein Rückfall ist,
   * sieht man heute nicht mehr."* In G-46 war die Herkunftsspalte
   * ausdrücklich gebaut und fiel mit der Flachliste weg (G-60).
   */
  reference_source: 'lab_report' | 'catalog_fallback' | 'none'
  /** Welches Labor gemessen hat. `[cmd]` Zwei im Bestand. */
  lab_name: string | null
  /** Uhrzeit des Befunds. `[cmd]` Auf allen fünf gefüllt. */
  report_time: string | null
  /**
   * `[cmd]` **Auf allen 140 Zeilen `unknown`.** Die Anzeige zeigt ihn
   * deshalb nur, wenn er etwas sagt — `unknown` ist keine Angabe,
   * sondern deren Fehlen.
   */
  fasting_status: string | null
}

/**
 * Die prozentuale Änderung über die Reihe.
 *
 * `[read]` **Erste gegen letzte Messung, nicht Regression.** Die
 * Attrappe rechnet eine lineare Regression über sechs erfundene Punkte
 * (`calcBiomarkerTrend`, `daten.ts`). Hier stehen vier bis fünf echte
 * Messungen, und die Aussage soll ablesbar bleiben: *„von 88 auf 102"*
 * ist eine Beobachtung, eine Steigung je Panel wäre eine Interpolation
 * zwischen ungleich verteilten Terminen (Feb, Apr, Jun, Aug, Aug).
 *
 * `[annahme]` Bei einem Ausgangswert von 0 ist die relative Änderung
 * nicht definiert; die Reihe meldet dann `null` statt Unendlich.
 */
export function trendProzent(messungen: Messung[]): number | null {
  const zahlen = messungen.map(m => m.wert).filter((w): w is number => w != null)
  if (zahlen.length < 2) return null
  const erst = zahlen[0]
  const letzt = zahlen[zahlen.length - 1]
  if (erst === 0) return null
  return Math.round(((letzt - erst) / Math.abs(erst)) * 1000) / 10
}

/**
 * Faltet die flache Werteliste zu Markerreihen.
 *
 * `[cmd]` Gruppiert wird nach `loinc_code`, wenn es einen gibt — sonst
 * nach dem Markernamen. **Der Rückfall ist nötig und nicht kosmetisch:**
 * zwei der 140 Werte tragen keinen Code (`match_status` `ambiguous`
 * bzw. `unknown`). Ohne Rückfall fielen sie in einen gemeinsamen
 * `null`-Topf und erschienen als ein Marker mit zwei Namen.
 *
 * `[read]` Weggelassen wird keiner. Tom: *„Wenn Daten importiert werden
 * und wir die nicht in der DB haben, kommt nichts."* — der Marker steht
 * trotzdem da, mit seinem Rohtext.
 */
export function zuReihen(
  werte: BefundWert[],
  katalog: Map<string, { kurz: string | null; klasse: string | null }> = new Map(),
): MarkerReihe[] {
  const gruppen = new Map<string, BefundWert[]>()
  for (const w of werte) {
    const k = w.loinc_code ?? `name:${w.marker_name}`
    const liste = gruppen.get(k)
    if (liste) liste.push(w)
    else gruppen.set(k, [w])
  }

  const reihen: MarkerReihe[] = []
  // `[cmd]` OHNE Iteration ueber die Map selbst: das tsconfig-Ziel
  // dieses Pakets laesst das nicht zu (TS2802) — dieselbe Stelle, an
  // der schon `lesen.ts` auf `Array.from` ausweicht.
  for (const [schluessel, gruppe] of Array.from(gruppen.entries())) {
    // ALT → NEU. `lab_result_values_read` sortiert absteigend; die
    // Sparkline und die Trendrechnung lesen aufsteigend.
    const sortiert = gruppe.slice().sort((a, b) => a.report_date.localeCompare(b.report_date))
    const messungen: Messung[] = sortiert.map(w => ({
      id: w.id,
      datum: w.report_date,
      wert: w.value_numeric,
      wertText: w.value_text,
      operator: w.value_operator,
      reportId: w.report_id,
      // G-80: durchgereicht, nicht neu gelesen — `lab_result_values_read`
      // liefert alle vier bereits mit.
      reference_source: w.reference_source,
      lab_name: w.lab_name,
      report_time: w.report_time,
      fasting_status: w.fasting_status ?? null,
    }))
    const jung = sortiert[sortiert.length - 1]
    const bereich = gueltigerBereich(jung)
    const opt = jung.optimal_low != null || jung.optimal_high != null
      ? { low: jung.optimal_low ?? null, high: jung.optimal_high ?? null }
      : bereichAusText(jung.optimal_text ?? null)
    const kat = jung.loinc_code ? katalog.get(jung.loinc_code) : undefined

    reihen.push({
      schluessel,
      loinc_code: jung.loinc_code,
      name: jung.marker_name,
      kurz: kat?.kurz ?? null,
      klasse: kat?.klasse ?? null,
      einheit: jung.unit,
      messungen,
      aktuell: messungen[messungen.length - 1],
      bereich,
      lage: lageImBereich(jung.value_numeric, bereich),
      optimal: opt,
      optimalText: jung.optimal_text ?? null,
      optimalLage: opt
        ? lageImBereich(jung.value_numeric, { ...opt, text: null, unit: null })
        : 'unbekannt',
      trendProzent: trendProzent(messungen),
    })
  }

  // Jüngste Messung zuerst, dann alphabetisch — eine feste Ordnung,
  // damit die Liste zwischen zwei Aufrufen nicht springt.
  return reihen.sort((a, b) =>
    b.aktuell.datum.localeCompare(a.aktuell.datum) || a.name.localeCompare(b.name))
}

/**
 * Die Skala des Bereichsbalkens: `LAB · OPTIMAL · YOU`.
 *
 * `[cmd]` Die Attrappe spannt den Balken von `critical_low` bis
 * `critical_high` (`bausteine.tsx`, `RangeIndicator`). **Diese zwei
 * Spalten gibt es in `medical.lab_result_values` nicht** — geprüft
 * gegen `information_schema.columns`. Gespannt wird deshalb über den
 * Laborbereich mit 25 % Rand, und der Wert selbst wird eingeschlossen,
 * damit er nie ausserhalb des Balkens landet.
 *
 * `[read]` Der Rand ist Darstellung, keine Grenze: er trägt keine
 * Beschriftung und behauptet nichts über den Wert. Wer ihn für eine
 * kritische Schwelle hielte, läse eine Aussage, die die Daten nicht
 * machen.
 */
export function balkenSkala(r: MarkerReihe): {
  von: number; bis: number
  lab: [number, number] | null
  opt: [number, number] | null
  wert: number
} | null {
  const wert = r.aktuell.wert
  if (wert == null) return null

  const kandidaten = [wert]
  if (r.bereich?.low != null) kandidaten.push(r.bereich.low)
  if (r.bereich?.high != null) kandidaten.push(r.bereich.high)
  if (r.optimal?.low != null) kandidaten.push(r.optimal.low)
  if (r.optimal?.high != null) kandidaten.push(r.optimal.high)
  if (kandidaten.length < 2) return null

  const min = Math.min(...kandidaten)
  const max = Math.max(...kandidaten)
  const rand = (max - min) * 0.25 || Math.abs(max) * 0.25 || 1
  const von = min - rand
  const bis = max + rand

  // Offene Grenzen laufen bis an den Rand: ein Bereich „<5,7" sagt über
  // unten nichts, also faengt sein Band am Balkenanfang an.
  const spanne = (b: { low: number | null; high: number | null } | null): [number, number] | null => {
    if (!b || (b.low == null && b.high == null)) return null
    return [b.low ?? von, b.high ?? bis]
  }

  return {
    von,
    bis,
    lab: spanne(r.bereich),
    opt: spanne(r.optimal),
    wert,
  }
}
