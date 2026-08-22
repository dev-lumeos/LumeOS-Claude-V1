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
// **Diese Datei rechnet Quotienten — und traegt seit GO-21/G-89 die
// Einordnungen, die einen BELEG haben:** die WHO-Grenzwerte (Grad A,
// KEEP_NUMERIC, mit Quelle und Jahr an jeder Zahl) und die
// Traditions-Proportionen als beschriftete Heuristik (Grad E,
// LABEL_HEURISTIC). `[read]` Die Regel von damals gilt unveraendert —
// **eine Zahl ohne Beleg wird nicht gebaut** —, nur liegen die Belege
// jetzt vor (crawl_025, constant_evidence_registry).

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

// ── GO-21: die belegten Grenzwerte (crawl_025, Grad A) ──────────
//
// `[read]` **Die Trennlinie von G-87 gilt weiter** — nur bekommt sie
// jetzt die Quellen, die damals fehlten: WHR, WHtR, Bauchumfang und
// BMI tragen amtliche Grenzwerte (WHO/NICE, Evidenzgrad A,
// KEEP_NUMERIC). **Sprachregel: „unter/ueber dem Grenzwert", nie
// „gesund"** — die Schwellen sind epidemiologische Risikomarker.
// **Ohne gesetztes Geschlecht gibt es KEINE Schwelle, nur das
// Verhaeltnis.**
//
// `[cmd]` **Ein gemeldeter Widerspruch:** der Auftrag nannte fuer
// Frauen „unter 0,80"; die Registry (BP-WHR-001) und die WHO 2008
// fuehren **0,85** („substantially increased risk"). Gebaut ist die
// Registry-Zahl mit ihrer Quelle — eine Zahl mit falscher
// Quellenangabe waere schlimmer als der Befund.

export type Grenzquelle = {
  registryId: string
  grad: 'A' | 'B' | 'C' | 'D' | 'E'
  quelle: string
  jahr: number
}

export type Grenzlage = {
  /** Die geltende Schwelle; `null` = kein Geschlecht gesetzt oder
   *  kein Wert. */
  schwelle: number | null
  /** Aussage ueber die Zahl: unter/ueber dem Grenzwert. */
  lage: 'unter' | 'ueber' | null
  quelle: Grenzquelle
}

const WHO_2008: Grenzquelle = {
  registryId: 'BP-WHR-001', grad: 'A',
  quelle: 'WHO Expert Consultation', jahr: 2008,
}

/** WHR-Grenzwerte der WHO: ab 0,90 (Maenner) bzw. 0,85 (Frauen)
 *  deutlich erhoehtes metabolisches Risiko. */
export function whrLage(wert: number | null, geschlecht: string | null): Grenzlage {
  const schwelle = geschlecht === 'male' ? 0.90
    : geschlecht === 'female' ? 0.85 : null
  return {
    schwelle,
    lage: wert == null || schwelle == null ? null : wert < schwelle ? 'unter' : 'ueber',
    quelle: WHO_2008,
  }
}

/** WHtR: Taille unter der halben Koerpergroesse (globaler
 *  Screening-Grenzwert 0,5) — gilt fuer beide Geschlechter. */
export function whtrLage(taille: number | null, groesse: number | null): {
  verhaeltnis: Verhaeltnis; lage: 'unter' | 'ueber' | null; quelle: Grenzquelle
} {
  const v = quotient(taille, groesse)
  return {
    verhaeltnis: v,
    lage: v.wert == null ? null : v.wert < 0.5 ? 'unter' : 'ueber',
    quelle: { registryId: 'BP-WHTR-002', grad: 'A', quelle: 'Ashwell (Syst. Review); NICE', jahr: 2012 },
  }
}

/** Bauchumfang, zweistufig (WHO 2008): 94/102 cm (M), 80/88 cm (F). */
export function bauchumfangLage(wert: number | null, geschlecht: string | null): {
  stufen: { erhoeht: number; deutlich: number } | null
  lage: 'unter' | 'erhoeht' | 'deutlich' | null
  quelle: Grenzquelle
} {
  const stufen = geschlecht === 'male' ? { erhoeht: 94, deutlich: 102 }
    : geschlecht === 'female' ? { erhoeht: 80, deutlich: 88 } : null
  return {
    stufen,
    lage: wert == null || stufen == null ? null
      : wert >= stufen.deutlich ? 'deutlich'
        : wert >= stufen.erhoeht ? 'erhoeht' : 'unter',
    quelle: { registryId: 'BP-WC-003', grad: 'A', quelle: 'WHO Expert Consultation', jahr: 2008 },
  }
}

/** BMI mit den WHO-Klassen. `[read]` Die Registry mahnt selbst: BMI
 *  allein darf einen muskuloesen Athleten nicht als Risiko labeln —
 *  der Vorbehalt gehoert mit in die Anzeige. */
export function bmiLage(gewichtKg: number | null, groesseCm: number | null): {
  wert: number | null
  klasse: string | null
  quelle: Grenzquelle
  vorbehalt: string
} {
  const wert = gewichtKg != null && groesseCm != null && groesseCm > 0
    ? Math.round((gewichtKg / ((groesseCm / 100) ** 2)) * 10) / 10
    : null
  const klasse = wert == null ? null
    : wert < 18.5 ? 'unter 18,5 (Untergewicht)'
      : wert < 25 ? '18,5–24,9 (Normalbereich)'
        : wert < 30 ? '25–29,9 (Uebergewicht)'
          : 'ab 30 (Adipositas)'
  return {
    wert,
    klasse,
    quelle: { registryId: 'BP-BMI-004', grad: 'A', quelle: 'WHO TRS 894', jahr: 2000 },
    vorbehalt: 'Bevoelkerungsmass — bei hoher Muskelmasse ohne Aussage; Taille mitlesen.',
  }
}

// ── G-89: die Traditionswerte, als Heuristik beschriftet ────────
//
// `[cmd]` crawl_025: BP-GR-006, BP-REEVES-008, BP-MCCALLUM-009,
// BP-CLASSIC-010 — alle Grad E, LABEL_HEURISTIC: Tradition aus der
// Bodybuilding-Literatur, keine Studie. **Sie duerfen so beschriftet
// gezeigt werden; KEINE Einfaerbung nach Richtung** — in einer
// Aufbauphase ist eine wachsende Taille normal.
// **BP-FFMI-005 (FFMI-25-Grenze) bleibt draussen:**
// CONFLICTING_EVIDENCE, DO_NOT_IMPLEMENT.
export type ProportionsHeuristik = {
  registryId: string
  name: string
  herkunft: string
  /** Vergleichbarer Zielwert, wenn die Zutaten gemessen werden. */
  zielwert: number | null
  /** Formeln als Text, wo die Zutaten (Handgelenk, Knoechel, Becken)
   *  gar nicht gemessen werden — dann gibt es keinen Ist-Vergleich. */
  formeln: string[]
}

export const PROPORTION_HEURISTIKEN: ProportionsHeuristik[] = [
  {
    registryId: 'BP-GR-006',
    name: 'Goldener Schnitt (Schulter : Taille)',
    herkunft: 'Grecian Ideal / Sandow 1894; heute „Adonis Index"',
    zielwert: 1.618,
    formeln: [],
  },
  {
    registryId: 'BP-REEVES-008',
    name: 'Steve-Reeves-Proportionen',
    herkunft: 'Steve Reeves, Golden Era (1940er–50er)',
    zielwert: null,
    formeln: ['Arm = 252 % Handgelenk', 'Wade = 192 % Knoechel', 'Brust = 148 % Becken'],
  },
  {
    registryId: 'BP-MCCALLUM-009',
    name: 'McCallum („Keys to Progress")',
    herkunft: 'John McCallum, IronMan-Kolumne 1965',
    zielwert: null,
    formeln: ['Brust = 6,5 x Handgelenk', 'Arm ≈ 36 % Brust'],
  },
  {
    registryId: 'BP-CLASSIC-010',
    name: 'Klassische Konventionen',
    herkunft: 'Golden-Era-Bodybuilding-Literatur',
    zielwert: null,
    formeln: ['Arm = Hals = Wade', 'Brust 25–30 cm ueber Taille'],
  },
]

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
