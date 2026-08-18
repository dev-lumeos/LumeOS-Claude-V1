// Lage eines Laborwerts zu seinen Bereichen — reine Rechnung, ohne
// Datenbank und ohne React, damit sie prüfbar bleibt.
//
// **KEINE BEWERTUNG.** `[read]` Der Auftrag G-46: *„Ob ein Wert gut
// ist, ist eine medizinische Aussage. Die Anzeige sagt, wo er liegt —
// im Bereich, darüber, darunter — nicht, was er bedeutet und schon gar
// nicht, was jemand tun soll."*
//
// Deshalb heissen die Lagen `im_bereich`, `darueber`, `darunter`,
// `unbekannt` — und nicht `optimal`, `kritisch` oder `auffaellig`.
// `[cmd]` Die Attrappe (`daten.ts:33-40`) führte `Optimal`,
// `Critical low` und `Critical high`; das sind Urteile, keine Lagen,
// und sie kommen hier nicht wieder vor. Dieselbe Grenze wie bei C-49
// (Nutrition-Score) und GO-14 (Körperfett).

/** Wo der Wert relativ zu einem Bereich liegt. Mehr sagt die Anzeige nicht. */
export type Lage = 'im_bereich' | 'darueber' | 'darunter' | 'unbekannt'

/** Woher der Bereich stammt — `lab_result_values_read` liefert das mit. */
export type Bereichsherkunft = 'lab_report' | 'catalog_fallback' | 'none'

export type Bereich = {
  low: number | null
  high: number | null
  text: string | null
  unit: string | null
}

/**
 * Die Lage eines Werts in einem Bereich.
 *
 * `[cmd]` Eine offene Grenze ist kein Ausschluss: ein Bereich mit nur
 * `high` (etwa „<5,7 %") sagt über die Unterseite nichts, also gilt
 * dort `im_bereich`, solange die Obergrenze hält. Wer stattdessen
 * `darunter` meldete, erfände eine Grenze, die das Labor nicht führt.
 */
export function lageImBereich(wert: number | null, bereich: Bereich | null): Lage {
  if (wert == null || bereich == null) return 'unbekannt'
  const { low, high } = bereich
  if (low == null && high == null) return 'unbekannt'
  if (high != null && wert > high) return 'darueber'
  if (low != null && wert < low) return 'darunter'
  return 'im_bereich'
}

/**
 * Zerlegt einen Bereichstext in Zahlen, wenn er eindeutig ist.
 *
 * `[cmd]` GEMESSEN, WARUM ES DAS BRAUCHT: von 464 Zeilen in
 * `medical.biomarker_reference_ranges` tragen **54 Zahlen und 410 nur
 * Text**. Die 54 stehen zudem auf `do_not_import_without_source` und
 * werden von `medical.lab_result_values_read` ausgeschlossen — der
 * Katalogrückfall liefert damit **heute ausschliesslich Text**.
 *
 * Erkannt werden die drei Schreibweisen, die im Bestand vorkommen:
 *   `8.5–10.5 mg/dL`  (Halbgeviertstrich, auch `-`)
 *   `<5.7%`           (nur Obergrenze)
 *   `>40 mg/dL`       (nur Untergrenze)
 *
 * `[annahme]` Was sich nicht eindeutig zerlegen lässt, bleibt Text und
 * wird als Text gezeigt. Raten wäre hier schlimmer als nichts sagen:
 * eine falsch geratene Grenze sähe aus wie eine gemessene.
 */
export function bereichAusText(text: string | null): { low: number | null; high: number | null } | null {
  if (!text) return null
  const t = text.trim()

  // `12,5–14,5` oder `12.5-14.5` — beide Striche, beide Dezimalzeichen.
  const spanne = /^([<>]?\s*)?(-?\d+(?:[.,]\d+)?)\s*[–—-]\s*(-?\d+(?:[.,]\d+)?)/.exec(t)
  if (spanne && !spanne[1]?.trim()) {
    const low = zahl(spanne[2])
    const high = zahl(spanne[3])
    if (low != null && high != null && low <= high) return { low, high }
  }

  const nurOben = /^<\s*=?\s*(-?\d+(?:[.,]\d+)?)/.exec(t)
  if (nurOben) {
    const high = zahl(nurOben[1])
    if (high != null) return { low: null, high }
  }

  const nurUnten = /^>\s*=?\s*(-?\d+(?:[.,]\d+)?)/.exec(t)
  if (nurUnten) {
    const low = zahl(nurUnten[1])
    if (low != null) return { low, high: null }
  }

  return null
}

function zahl(s: string): number | null {
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Der Bereich, der gilt: der des Befunds, sonst der des Katalogs.
 *
 * `[read]` Der Auftrag: *„Der Befundbereich gewinnt. Jedes Labor führt
 * eigene Bereiche, und sie stehen auf dem Ausdruck. Der Katalogbereich
 * ist der Rückfall, wenn der Befund keinen mitliefert — und dass er
 * ein Rückfall ist, muss sichtbar sein."*
 *
 * `[cmd]` Die Vorrangregel steckt bereits in
 * `medical.lab_result_values_read` (`140_medical_schema.sql:240-252`):
 * sie liefert `COALESCE(v.lab_reference_*, rr.*)` und dazu
 * `reference_source` als `lab_report` | `catalog_fallback` | `none`.
 * Hier wird sie nicht zum zweiten Mal entschieden, sondern nur
 * ausgewertet — sonst gäbe es zwei Wahrheiten.
 */
export function gueltigerBereich(zeile: {
  reference_low: number | null
  reference_high: number | null
  reference_text: string | null
  reference_unit: string | null
}): Bereich | null {
  const ausText = zeile.reference_low == null && zeile.reference_high == null
    ? bereichAusText(zeile.reference_text)
    : null

  const low = zeile.reference_low ?? ausText?.low ?? null
  const high = zeile.reference_high ?? ausText?.high ?? null
  if (low == null && high == null && !zeile.reference_text) return null

  return { low, high, text: zeile.reference_text, unit: zeile.reference_unit }
}

/** Die drei Zustände aus C-72, an `entry_confidence` und `loinc_code` ablesbar. */
export type Zuordnung = 'zugeordnet' | 'mehrdeutig' | 'unbekannt'

/**
 * `[cmd]` **Die Datenbank sagt es selbst — nicht geraten.**
 * `142_laborimport_matching.sql` hat der Tabelle `match_status`
 * gegeben, und eine Pruefbedingung haelt ihn mit `loinc_code`
 * zusammen:
 *
 *     match_status IN ('exact','manual_verified') AND loinc_code IS NOT NULL
 *  OR match_status IN ('ambiguous','unknown')     AND loinc_code IS NULL
 *                                                 AND needs_verification
 *
 * Damit ist `match_status` die belastbare Quelle; `entry_confidence`
 * ist nur der Rueckfall, falls das Feld einmal fehlt.
 *
 * `[cmd]` Live belegt an den sechs Testwerten:
 *   Hemoglobin           → `718-7`,  `exact`,     Confidence 0,98
 *   Glucose [Mass/vol…]  → ohne Code, `ambiguous`, 3 Kandidaten
 *   Unbekannter Marker X → ohne Code, `unknown`,   Confidence 0,00
 *
 * `[read]` Tom: *„Wenn Daten importiert werden und wir die nicht in der
 * DB haben, kommt nichts."* — der Marker steht trotzdem da, mit seinem
 * Rohtext. Deshalb gibt es hier keinen Fall, der `null` zurückgibt und
 * die Zeile aus der Anzeige nimmt.
 */
export function zuordnung(zeile: {
  loinc_code: string | null
  match_status?: string | null
  entry_confidence?: number | null
  needs_verification?: boolean | null
}): Zuordnung {
  switch (zeile.match_status) {
    case 'exact':
    case 'manual_verified':
      return 'zugeordnet'
    case 'ambiguous':
      return 'mehrdeutig'
    case 'unknown':
      return 'unbekannt'
    default:
      break
  }
  if (zeile.loinc_code) return 'zugeordnet'
  return (zeile.entry_confidence ?? 0) > 0 ? 'mehrdeutig' : 'unbekannt'
}
