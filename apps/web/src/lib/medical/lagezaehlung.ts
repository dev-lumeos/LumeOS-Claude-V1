// Wie viele Marker ausserhalb ihrer Bereiche liegen (G-84).
//
// **Reine Rechnung** — ohne Datenbank und ohne React, damit sie
// prüfbar bleibt. Dasselbe Muster wie `lib/training/auswertung.ts`
// (G-69) und `lib/supplements/auswertung.ts` (G-74).
//
// **DIE ZWEI ZAHLEN BLEIBEN GETRENNT.** `[read]` Toms Entscheidung zu
// G-84: *„Ein Laborbereich ist die Referenz des Labors — die steht auf
// dem Befund. Ein Optimalband ist eine Empfehlung aus der Literatur.
// Sie zu addieren macht aus einer Messung und einer Meinung eine
// Zahl."*
//
// `[read]` Derselbe Grundsatz wie die Doppelbereichslogik aus G-46:
// zwei Bereiche **nebeneinander**, nicht ineinander gerechnet. Die
// Liste führt sie seit G-60 getrennt; der Kopf tut es jetzt auch.
//
// **KEINE BEWERTUNG.** `[read]` Gezählt wird, **wo** ein Wert liegt —
// nicht, was das bedeutet. Ein Wert über dem Bereich ist eine Messung;
// „das ist bedenklich" wäre eine Diagnose, und die Kopfzeile sagt
// selbst *„no diagnosis, no therapy advice"*.

import type { MarkerReihe } from './reihe'

/**
 * Die Lagezählung über alle Marker.
 *
 * `[cmd]` Gezählt wird je Marker die **jüngste** Messung — dieselbe,
 * die die Liste in ihrer Zeile zeigt. `zuReihen` hat sie bereits
 * ausgewählt (`aktuell`), und `lage`/`optimalLage` sind daran
 * gerechnet. Hier wird nichts neu bestimmt, nur summiert.
 */
export type Lagezaehlung = {
  /** Marker mit einer jüngsten Messung, also zählbare. */
  marker: number
  /** Über dem Laborbereich des Befunds. */
  ueber_bereich: number
  /** Unter dem Laborbereich des Befunds. */
  unter_bereich: number
  /** Über oder unter — die Summe der zwei darüber. */
  ausserhalb_bereich: number
  /**
   * Ausserhalb des **Optimalbands**, aber innerhalb des Laborbereichs.
   *
   * `[read]` **Nur die zusätzlichen.** Wer schon ausserhalb des
   * Laborbereichs liegt, wird nicht zweimal gezählt — sonst wäre die
   * Summe grösser als die Zahl der Marker.
   */
  ausserhalb_optimal: number
  /**
   * Die Vereinigung beider — **deckungsgleich mit dem Filter
   * „Non-optimal only"** in der Liste.
   *
   * `[read]` Toms Auflage: *„Die Zahl muss zum Filter passen. Wenn der
   * Kopf 1 und 5 zeigt und der Filter ‚Non-optimal only · 6', muss
   * erkennbar sein, dass es dieselben sechs sind."*
   */
  auffaellig: number
  /** Marker ohne jeden Bereich — sie können nirgends „ausserhalb" sein. */
  ohne_bereich: number
}

export function zaehleLagen(reihen: MarkerReihe[]): Lagezaehlung {
  const ueber = reihen.filter(r => r.lage === 'darueber').length
  const unter = reihen.filter(r => r.lage === 'darunter').length
  const ausserhalbBereich = ueber + unter

  // Nur die, die im Laborbereich liegen und trotzdem ausserhalb des
  // Optimalbands — sonst doppelt gezählt.
  const nurOptimal = reihen.filter(r =>
    r.lage === 'im_bereich'
    && (r.optimalLage === 'darueber' || r.optimalLage === 'darunter')).length

  return {
    marker: reihen.length,
    ueber_bereich: ueber,
    unter_bereich: unter,
    ausserhalb_bereich: ausserhalbBereich,
    ausserhalb_optimal: nurOptimal,
    auffaellig: ausserhalbBereich + nurOptimal,
    ohne_bereich: reihen.filter(r => r.lage === 'unbekannt').length,
  }
}

// ── Gruppierung für den Health score ────────────────────────────

/**
 * Ob sich die Marker über `biomarker_spec_enrichment` gruppieren
 * lassen — die Vorbedingung für einen Gesundheitswert.
 *
 * `[cmd]` **Gemessen am 2026-08-20: 23 von 37.** Von den 14 übrigen
 * sind **5 blosse LOINC-Abweichungen** (dieselbe Grösse unter anderem
 * Code) und **9 echte Lücken**.
 *
 * `[read]` **Der Score bleibt deshalb Attrappe.** Toms Entscheidung:
 * *„Ein Gesundheitswert, der die beiden wichtigsten Lipidmarker
 * stillschweigend auslässt, ist schlechter als keiner — er sieht aus
 * wie ein Gesamtbild und ist ein Ausschnitt."*
 *
 * Diese Funktion rechnet den Score **nicht**. Sie beantwortet nur die
 * Frage, wie weit die Zuordnung trägt — damit der nächste Durchgang
 * die Zahl vorfindet, statt sie neu zu messen.
 */
export type Gruppierbarkeit = {
  marker: number
  zugeordnet: number
  offen: number
  /** Anteil in Prozent, auf eine Stelle. */
  abdeckung_pct: number
  /** Die Gruppen mit ihrer Markerzahl, grösste zuerst. */
  gruppen: Array<{ gruppe: string; marker: number }>
  /** Namen der Marker ohne Gruppe — sie stehen im Bericht. */
  ohne_gruppe: string[]
}

export function pruefeGruppierbarkeit(
  reihen: MarkerReihe[],
  gruppeJeCode: Map<string, string>,
): Gruppierbarkeit {
  const jeGruppe = new Map<string, number>()
  const offen: string[] = []

  for (const r of reihen) {
    const g = r.loinc_code ? gruppeJeCode.get(r.loinc_code) : undefined
    if (g) jeGruppe.set(g, (jeGruppe.get(g) ?? 0) + 1)
    else offen.push(r.name)
  }

  const zugeordnet = reihen.length - offen.length
  return {
    marker: reihen.length,
    zugeordnet,
    offen: offen.length,
    abdeckung_pct: reihen.length > 0
      ? Math.round((zugeordnet / reihen.length) * 1000) / 10
      : 0,
    gruppen: Array.from(jeGruppe.entries())
      .map(([gruppe, marker]) => ({ gruppe, marker }))
      .sort((a, b) => b.marker - a.marker || a.gruppe.localeCompare(b.gruppe)),
    ohne_gruppe: offen.slice().sort(),
  }
}
