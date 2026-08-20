// Die Verhältnisse aus den Körperumfängen (G-87).
//
// **Reine Rechnung** — ohne Datenbank und ohne React, nach demselben
// Muster wie `lib/medical/lagezaehlung.ts` (G-84) und
// `lib/training/auswertung.ts` (G-69).
//
// `[read]` **Die Trennlinie dieses Auftrags:** *„Verhältnisse sind
// rechenbar: Taille zu Hüfte, Schulter zu Taille, Arm zu Oberschenkel.
// Das ist Arithmetik, keine Bewertung. Aber die Einstufung ist eine:
// ‚goldener Schnitt', ‚klassische Proportionen', Idealwerte. Wenn das
// Mockup sie zeigt, brauchen sie eine Quelle — sonst Attrappe."*
//
// **Deshalb rechnet diese Datei Quotienten und sonst nichts.** Kein
// Zielwert, keine Ampel, keine Einstufung. `[read]` Dieselbe Regel wie
// bei MEV/MAV/MRV (C-105) und den Injektions-Ruhefenstern (C-109):
// **eine Zahl ohne Beleg wird nicht gebaut.**

import type { Umfangssatz } from './lesen'

/** Ein Quotient mit seinen zwei Zutaten — damit er nachrechenbar ist. */
export type Verhaeltnis = {
  /** Der Quotient, auf drei Stellen. `null`, wenn eine Zutat fehlt. */
  wert: number | null
  /** Zähler in cm, wie gemessen. */
  zaehler: number | null
  /** Nenner in cm, wie gemessen. */
  nenner: number | null
}

/**
 * Die Symmetrie eines Paars: die kleinere Seite am Mittel.
 *
 * `[cmd]` Die Formel stammt aus der Vorlage (`daten.ts:calcRatios`,
 * `module-goals-pro.jsx:180-192`) und wird übernommen, nicht neu
 * erfunden — `min / mittel × 100`. Sie ist reine Arithmetik: **100 %
 * heisst gleich lang, nicht gut.**
 */
export type Symmetrie = {
  prozent: number | null
  links: number | null
  rechts: number | null
  /** Rechts minus links, in cm. Das Vorzeichen bleibt stehen. */
  differenz_cm: number | null
}

export type Verhaeltnisse = {
  /** Der Tag, aus dem gerechnet wurde. */
  stichtag: string | null
  /** Taille zu Hüfte — die einzige mit einer amtlichen Quelle, s. u. */
  taille_huefte: Verhaeltnis
  /** Schulter zu Taille. */
  schulter_taille: Verhaeltnis
  /** Brust zu Taille. */
  brust_taille: Verhaeltnis
  /** Mittlerer Oberarm zu mittlerem Oberschenkel. */
  arm_bein: Verhaeltnis
  arm_symmetrie: Symmetrie
  bein_symmetrie: Symmetrie
  /** Wieviele der 13 Stellen der jüngste Satz trägt. */
  belegte_stellen: number
}

/** Drei Nachkommastellen, wie die Vorlage — und `null` bleibt `null`. */
function quotient(zaehler: number | null, nenner: number | null): Verhaeltnis {
  if (zaehler == null || nenner == null || nenner === 0) {
    return { wert: null, zaehler, nenner }
  }
  return { wert: Math.round((zaehler / nenner) * 1000) / 1000, zaehler, nenner }
}

function mittel(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null
  if (a == null) return b
  if (b == null) return a
  return (a + b) / 2
}

function symmetrie(links: number | null, rechts: number | null): Symmetrie {
  const m = mittel(links, rechts)
  if (links == null || rechts == null || m == null || m === 0) {
    return { prozent: null, links, rechts, differenz_cm: null }
  }
  return {
    prozent: Math.round((Math.min(links, rechts) / m) * 1000) / 10,
    links,
    rechts,
    differenz_cm: Math.round((rechts - links) * 100) / 100,
  }
}

const STELLEN: Array<keyof Umfangssatz> = [
  'neck_cm', 'shoulders_cm', 'chest_cm',
  'upper_arm_left_cm', 'upper_arm_right_cm',
  'forearm_left_cm', 'forearm_right_cm',
  'waist_cm', 'hip_cm',
  'thigh_left_cm', 'thigh_right_cm',
  'calf_left_cm', 'calf_right_cm',
]

/**
 * Rechnet die Verhältnisse aus dem **jüngsten** Satz.
 *
 * `[cmd]` `ladeUmfaenge` sortiert aufsteigend und schneidet bereits am
 * Stichtag ab (`lte`) — der letzte Eintrag ist damit der jüngste Satz
 * bis heute. Ein künftiger Satz kann hier nicht hereinrutschen.
 */
export function rechneVerhaeltnisse(saetze: Umfangssatz[]): Verhaeltnisse | null {
  const j = saetze[saetze.length - 1]
  if (!j) return null

  return {
    stichtag: j.measurement_date || null,
    taille_huefte: quotient(j.waist_cm, j.hip_cm),
    schulter_taille: quotient(j.shoulders_cm, j.waist_cm),
    brust_taille: quotient(j.chest_cm, j.waist_cm),
    arm_bein: quotient(
      mittel(j.upper_arm_left_cm, j.upper_arm_right_cm),
      mittel(j.thigh_left_cm, j.thigh_right_cm),
    ),
    arm_symmetrie: symmetrie(j.upper_arm_left_cm, j.upper_arm_right_cm),
    bein_symmetrie: symmetrie(j.thigh_left_cm, j.thigh_right_cm),
    belegte_stellen: STELLEN.filter(s => j[s] != null).length,
  }
}

/**
 * Die Veränderung je Stelle zwischen den zwei jüngsten Sätzen.
 *
 * `[read]` Die Vorlage zeigt `Current · Previous · Δ · Trend` je Stelle.
 * **Die Richtung bleibt hier ohne Farbe:** die Vorlage färbt eine
 * wachsende Taille rot und einen wachsenden Arm grün
 * (`tab-physique.tsx:99-101`). Das ist eine Bewertung — welche
 * Richtung erwünscht ist, hängt vom Ziel ab, und das Modul gibt sie
 * nicht ab. Die Zahl mit Vorzeichen sagt dasselbe ohne Urteil.
 */
export type StellenVergleich = {
  schluessel: keyof Umfangssatz
  /** Der Name, wie ihn die Vorlage führt. */
  name: string
  jetzt: number | null
  vorher: number | null
  differenz: number | null
}

const NAMEN: Record<string, string> = {
  neck_cm: 'Neck',
  shoulders_cm: 'Shoulders',
  chest_cm: 'Chest',
  upper_arm_left_cm: 'Upper arm L',
  upper_arm_right_cm: 'Upper arm R',
  forearm_left_cm: 'Forearm L',
  forearm_right_cm: 'Forearm R',
  waist_cm: 'Waist',
  hip_cm: 'Hips',
  thigh_left_cm: 'Thigh L',
  thigh_right_cm: 'Thigh R',
  calf_left_cm: 'Calf L',
  calf_right_cm: 'Calf R',
}

export function vergleicheStellen(saetze: Umfangssatz[]): StellenVergleich[] {
  const j = saetze[saetze.length - 1]
  const v = saetze[saetze.length - 2]
  if (!j) return []

  return STELLEN.map(s => {
    const jetzt = (j[s] ?? null) as number | null
    const vorher = (v ? v[s] ?? null : null) as number | null
    return {
      schluessel: s,
      name: NAMEN[s] ?? String(s),
      jetzt,
      vorher,
      differenz: jetzt != null && vorher != null
        ? Math.round((jetzt - vorher) * 100) / 100
        : null,
    }
  })
}
