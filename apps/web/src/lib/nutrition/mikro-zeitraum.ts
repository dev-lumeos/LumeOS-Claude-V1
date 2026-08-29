// ════════════════════════════════════════════════════════════════════
// DER ZEITRAUM UEBER MIKRONAEHRSTOFFEN — G-247 (E-24)
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30. Nur Typen kommen von dort.
//
// ══ WARUM NICHT DIE TAGESBEWERTUNG N-MAL ════════════════════════════
//
// **Auftrag: *„Ein Schnitt ueber sieben Tage ist NICHT die
// Tagesbewertung siebenmal — die Mengen werden gemittelt, dann
// bewertet."***
//
// `[read]` **Die Reihenfolge entscheidet das Ergebnis.** Wer erst je
// Tag bewertet und dann die Urteile zaehlt, bekommt *„an 6 von 12
// Tagen ueber der Grenze"*. Wer erst mittelt und dann bewertet,
// bekommt *„im Schnitt darunter"*. **Beides ist wahr und beides
// heisst etwas anderes.**
//
// `[cmd]` **Vitamin A auf dev, 90 Tage bis 2026-06-01, gemessen
// 2026-08-28:** Schnitt 2.820 µg, groesster Tag 5.865 µg, Obergrenze
// 3.000 µg — **6 von 12 Tagen darueber, der Schnitt darunter.**
//
// `[read]` **E-24 loest das:** der Schnitt ist die Anzeige, die
// Spanne steht im Detail. **Diese Datei rechnet den Schnitt und
// behaelt die Spanne.**
//
// ══ REGEL 1 WIRD IM ZEITRAUM ZUR REGEL ══════════════════════════════
//
// `[cmd]` **Gemessen ueber 90 Tage auf dev: 973 von 1.794 Tageszeilen
// sind unvollstaendig**, und **alle 138 Naehrstoffe** haben
// mindestens einen unvollstaendigen Tag.
//
// `[read]` **Im Tagesmodus war das die Ausnahme, im Zeitraum ist es
// der Normalfall.** Ein Schnitt, der ueber Luecken hinwegmittelt,
// ist systematisch zu niedrig — **und zwar umso mehr, je laenger der
// Zeitraum.**
//
// `[read]` **Deshalb wird gezaehlt, nicht verschwiegen:** je
// Naehrstoff steht, aus wie vielen Tagen der Schnitt stammt und wie
// viele davon unvollstaendig waren. **Wer das nicht sieht, haelt
// einen Luckenschnitt fuer eine Unterversorgung.**

import type { Lage } from './mikro-lage'

/** `[cmd]` Aus dem Mockup `module-nutrition-nutrients.jsx:485`. */
export const ZEITRAEUME = [1, 7, 30, 90] as const
export type Zeitraum = (typeof ZEITRAEUME)[number]

export const ZEITRAUM_TEXT: Record<Zeitraum, string> = {
  1: 'Heute',
  7: '7 Tage',
  30: '30 Tage',
  90: '90 Tage',
}

/**
 * `[read]` **Der Standard bleibt der Tag**, weil die Oberflaeche im
 * Tagesmodus laeuft — der Auftrag sagt es, und der Mockup setzt
 * `useState("today")`.
 */
export const ZEITRAUM_STANDARD: Zeitraum = 1

/** Ein Tageswert eines Naehrstoffs, wie ihn die View liefert. */
export type Tageswert = {
  entry_date: string
  total_value: number | null
  value_complete: boolean
}

/**
 * Was ein Zeitraum je Naehrstoff ergibt.
 *
 * `[read]` **`schnitt` ist der Mittelwert der TAGE MIT WERT**, nicht
 * der Summe geteilt durch die Fensterlaenge. Ein Tag ohne Erfassung
 * ist keine Null — dieselbe Regel wie in C-48 und G-239.
 */
export type Spanne = {
  schnitt: number | null
  kleinster: number | null
  groesster: number | null
  /** Der Tag, an dem der groesste Wert stand. */
  groesster_tag: string | null
  kleinster_tag: string | null
  /** Tage mit einem Wert. */
  tage: number
  /** Davon Tage mit Luecke in der Summe (Regel 1). */
  tage_unvollstaendig: number
}

export const LEERE_SPANNE: Spanne = {
  schnitt: null, kleinster: null, groesster: null,
  groesster_tag: null, kleinster_tag: null,
  tage: 0, tage_unvollstaendig: 0,
}

/**
 * Schnitt und Spanne aus Tageswerten.
 *
 * `[read]` **Tage ohne Wert zaehlen nicht mit** — weder im Nenner
 * noch als Null. Wer sie mitmittelt, druckt den Schnitt kuenstlich.
 */
export function spanneVon(tage: readonly Tageswert[]): Spanne {
  const mitWert = tage.filter(t => t.total_value !== null)
  if (mitWert.length === 0) return LEERE_SPANNE

  let summe = 0
  let min = mitWert[0]
  let max = mitWert[0]
  for (const t of mitWert) {
    const v = t.total_value as number
    summe += v
    if (v < (min.total_value as number)) min = t
    if (v > (max.total_value as number)) max = t
  }
  return {
    schnitt: Number((summe / mitWert.length).toFixed(3)),
    kleinster: min.total_value,
    groesster: max.total_value,
    kleinster_tag: min.entry_date,
    groesster_tag: max.entry_date,
    tage: mitWert.length,
    tage_unvollstaendig: mitWert.filter(t => !t.value_complete).length,
  }
}

/**
 * Ob die Spitze eine andere Aussage traegt als der Schnitt.
 *
 * `[cmd]` **Der Kern von E-24.** Auf dev trifft es zwei Naehrstoffe
 * ueber 90 Tage (gemessen 2026-08-28): **Vitamin A** (Schnitt 2.820,
 * Spitze 5.865, Grenze 3.000) und **Mangan** (7.650 / 12.794 /
 * 11.000).
 *
 * `[read]` **Nur bei einer Obergrenze.** Bei einem Zielwert ist ein
 * einzelner hoher Tag keine Warnung, sondern ein guter Tag.
 */
export function spitzeUeberschreitet(
  spanne: Spanne, richtung: string | null, grenze: number | null,
): boolean {
  if (richtung !== 'upper_limit' || grenze === null) return false
  if (spanne.schnitt === null || spanne.groesster === null) return false
  return spanne.schnitt <= grenze && spanne.groesster > grenze
}

/**
 * Der Satz zur Spanne, im Detail.
 *
 * `[read]` **Er nennt die Tage mit** — E-24: *„mit dem Zusatz, wann
 * sie waren. Eine Ueberschreitung an drei aufeinanderfolgenden Tagen
 * sieht anders aus als drei verstreute."*
 */
export function spannenSatz(spanne: Spanne, einheit: string): string {
  if (spanne.tage === 0) return 'Keine Tageswerte im Zeitraum.'
  if (spanne.tage === 1) return 'Ein einzelner Tag — keine Spanne.'
  const z = (n: number | null) => n === null
    ? '—'
    : `${(Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10)
      .toLocaleString('de-DE')} ${einheit}`
  return `Zwischen ${z(spanne.kleinster)} (${spanne.kleinster_tag}) `
    + `und ${z(spanne.groesster)} (${spanne.groesster_tag}), `
    + `aus ${spanne.tage} Tagen.`
}

/**
 * Der Hinweis auf Luecken im Zeitraum — Regel 1.
 *
 * `[cmd]` Auf dev betrifft das ueber 90 Tage **alle 138
 * Naehrstoffe**; 973 von 1.794 Tageszeilen tragen eine Luecke.
 */
export function lueckenSatzZeitraum(spanne: Spanne): string {
  if (spanne.tage_unvollstaendig === 0) return ''
  const t = spanne.tage_unvollstaendig === 1
    ? 'An einem der Tage'
    : `An ${spanne.tage_unvollstaendig} der ${spanne.tage} Tage`
  return `${t} fehlten Werte einzelner Positionen. `
    + 'Der Schnitt ist deshalb eher zu niedrig als zu hoch.'
}

/**
 * Wie viele Tage der Zeitraum tatsaechlich abdeckt.
 *
 * `[cmd]` **Der Befund, der gemeldet gehoert:** auf dev beginnen die
 * Daten am 2026-05-20. **Ein 90-Tage-Fenster bis 2026-06-01 findet
 * nur 13 Tage** — dieselbe Zahl wie das 30-Tage-Fenster.
 *
 * `[read]` **Die Beschriftung „90 Tage" waere dann eine
 * Behauptung.** Deshalb steht die tatsaechliche Zahl daneben, statt
 * das Fenster stillschweigend zu kuerzen.
 */
export function abdeckungsSatz(spanne: Spanne, zeitraum: Zeitraum): string {
  if (zeitraum === 1 || spanne.tage === 0) return ''
  if (spanne.tage >= zeitraum) return ''
  return `${spanne.tage} von ${zeitraum} Tagen tragen Daten.`
}

// ── Der Verlauf ──────────────────────────────────────────────────

export type VerlaufPunkt = {
  tag: string
  wert: number | null
  vollstaendig: boolean
}

/**
 * Die drei Linien des Verlaufs — E-24.
 *
 * **Tom, 2026-08-28:** *,,bau sowas in die details wo die periode
 * anzeigt inkl mittelwert, zielwert, obergrenze das sagt am meisten
 * aus"*.
 *
 * `[read]` **Das ist C-48 Regel 2 als Bild:** bei Vitamin A liegen
 * beide Referenzlinien im selben Diagramm, und man sieht auf einen
 * Blick, dass der Verlauf ueber der einen und unter der anderen
 * liegt.
 */
export type VerlaufLinien = {
  mittelwert: number | null
  zielwert: number | null
  obergrenze: number | null
}

/**
 * Die Skala des Diagramms.
 *
 * `[read]` **Die Obergrenze muss sichtbar bleiben, auch wenn kein
 * Tag sie erreicht** — sonst zeigt das Bild eine Grenze, die aus dem
 * Rahmen faellt, und der Betrachter haelt den hoechsten Balken fuer
 * die Grenze. **Deshalb geht die Skala immer bis zum groessten
 * dargestellten Wert, Linien eingeschlossen.**
 */
export function skalaVon(
  punkte: readonly VerlaufPunkt[], linien: VerlaufLinien,
): number {
  let max = 0
  for (const p of punkte) if (p.wert !== null && p.wert > max) max = p.wert
  for (const l of [linien.zielwert, linien.obergrenze, linien.mittelwert]) {
    if (l !== null && l > max) max = l
  }
  // `[read]` Etwas Luft nach oben, sonst klebt der hoechste Balken
  // an der Kante und sieht abgeschnitten aus.
  return max > 0 ? max * 1.08 : 1
}

/** Die Lage eines einzelnen Tages im Verlauf — nur zum Faerben. */
export function tagesLageImVerlauf(
  wert: number | null, linien: VerlaufLinien, richtung: string | null,
): Lage | null {
  if (wert === null) return null
  if (richtung === 'upper_limit' && linien.obergrenze !== null) {
    return wert > linien.obergrenze ? 'zu_viel' : 'gedeckt'
  }
  if (linien.zielwert !== null && linien.zielwert > 0) {
    return wert >= linien.zielwert * 0.8 ? 'gedeckt' : 'zu_wenig'
  }
  return null
}
