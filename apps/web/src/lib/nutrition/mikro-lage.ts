// ════════════════════════════════════════════════════════════════════
// DIE LAGE JE MIKRONAEHRSTOFF — G-239
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30. Nur Typen kommen von dort.
//
// **Diese Datei rechnet NICHT.** `[read]` `reference_pct`,
// `reference_status` und `reference_direction` entstehen in
// `nutrition.daily_reference_assessment` — eine zweite Rechnung hier
// waere eine zweite Wahrheit. **Sie ordnet nur ein, was die Funktion
// liefert.**
//
// ══ DIE VIER REGELN AUS C-48, GEGEN DIE DATEN GEPRUEFT ══════════════
//
// `[cmd]` **Gemessen am 2026-08-28 auf `dev@lumeos.app`, 2026-06-01
// (der Tag mit den meisten Eintraegen; 181 Tage tragen Daten):**
//
//     reference_status   Zeilen   mit reference_pct   missing_count
//     complete               57            46                    0
//     incomplete             77             0                  407
//     not_applicable         15             0                    0
//     energy_share            3             0                    0
//     nutrient_density        2             0                    0
//
// **Regel 1 — Fehlzaehler bleiben sichtbar.** `[cmd]` **Alle 77
// `incomplete`-Zeilen tragen NULL Prozentwerte** und zusammen 407
// fehlende Positionen. `[read]` **Die Funktion macht daraus schon
// keine Null — die Oberflaeche darf es auch nicht.** Deshalb hat
// `unvollstaendig` hier einen eigenen Zustand und keinen Prozentwert.
//
// **Regel 2 — die Wertart entscheidet die Leserichtung.** `[cmd]`
// `reference_direction` traegt `target`, `upper_limit` oder `range`.
// **Derselbe Prozentwert bedeutet Gegenteiliges:**
//
//     Calcium   71,9 % eines PRI (target)       -> zu wenig
//     Calcium   27,3 % eines UL  (upper_limit)  -> unbedenklich
//
// `[read]` **Calcium ist der Beleg in einer Zeile** — derselbe
// Naehrstoff, derselbe Tag, zwei Referenzen, entgegengesetzte
// Lesart. **Beides als „so viel Prozent" anzuzeigen waere
// gefaehrlich.**
//
// **Regel 3 — ohne Referenz ist keine Null.** `[cmd]`
// `NO_STANDALONE_REFERENCE` 57 und `NO_REFERENCE` 21 Zeilen.
// `[read]` **Das ist dieselbe Klasse wie `begruendet_leer` gegen
// `nicht_bearbeitet` (G-208):** „es gibt keinen Richtwert" ist eine
// Aussage, „0 % gedeckt" waere eine andere und falsche.
//
// **Regel 4 — die Werte gelten fuer gesunde Erwachsene.** `[cmd]` Die
// Funktion liefert Alter, Geschlecht, Schwangerschaft und Stillzeit
// mit; auf dev: 31, `male`, beides `false`. `[read]` **Sichtbar wird
// es als Fusszeile am Bestand** — wer die Zahlen liest, soll wissen,
// fuer wen sie gelten.
//
// ══ WELCHE `reference_kind` MUSS EIN NUTZER UNTERSCHEIDEN? ══════════
//
// **Aus G-218 uebernommen:** dort war die Frage, welche Achse ein
// Nutzer unterscheiden muss und welche eine Sache fuer den Beleg ist.
//
// `[cmd]` **Zehn Auspraegungen auf dev** — `NO_STANDALONE_REFERENCE`
// 57, `AI` 21, `NO_REFERENCE` 21, `UL` 17, `PRI` 17, `FORMULA` 15,
// `PRI_COMBINED` 2, `RI` 2, `ALAP` 1, `AI_COMBINED` 1.
//
// `[read]` **Sie fallen auf DREI Leserichtungen zusammen**, und die
// sind das, was zaehlt: `target` (erreichen), `upper_limit` (nicht
// ueberschreiten), `range` (dazwischen bleiben). **Die zehn Arten
// selbst gehoeren an den Beleg** — ob ein Zielwert `PRI`, `AI` oder
// `FORMULA` heisst, aendert nichts am Handeln, wohl aber an der
// Nachvollziehbarkeit.

import type { ReferenceAssessmentRow } from './reference-assessment-read'

/**
 * Die Lage eines Naehrstoffs.
 *
 * `[read]` **`unvollstaendig` und `ohne_referenz` sind keine
 * Bewertung**, sondern die Auskunft, warum es keine gibt.
 */
export type Lage =
  | 'gedeckt'
  | 'zu_wenig'
  | 'zu_viel'
  | 'im_bereich'
  | 'unvollstaendig'
  | 'ohne_referenz'

/** `[cmd]` Aus `reference_direction` gelesen, nicht erfunden. */
export const RICHTUNGEN = ['target', 'upper_limit', 'range'] as const

/** `[cmd]` Die beiden Arten ohne Richtwert, aus `reference_kind`. */
export const OHNE_REFERENZ = ['NO_REFERENCE', 'NO_STANDALONE_REFERENCE'] as const

/**
 * Ab wann ein Zielwert als gedeckt gilt.
 *
 * `[read]` **Das ist KEINE neue Schwelle** — der Auftrag verbietet
 * sie. Es ist die Grenze, die der Mockup fuehrt (`pct>=80` gruen,
 * `>=50` gelb) und die aus dem Vorgaengerrepo stammt. **Sie faerbt,
 * sie bewertet nicht:** die Zahl daneben steht unveraendert da.
 */
export const GEDECKT_AB = 80

export function lageVon(r: {
  reference_status: string
  reference_kind: string | null
  reference_direction: string | null
  reference_pct: number | null
}): Lage {
  // Regel 3 zuerst: ohne Richtwert gibt es nichts zu bewerten.
  if (r.reference_kind && (OHNE_REFERENZ as readonly string[]).includes(r.reference_kind)) {
    return 'ohne_referenz'
  }
  // Regel 1: unvollstaendig ist ein Zustand, kein Prozentwert.
  if (r.reference_status === 'incomplete') return 'unvollstaendig'
  if (r.reference_pct === null) {
    // `energy_share` und `nutrient_density` tragen keinen Prozentwert
    // gegen einen Richtwert — sie sind ein Anteil, keine Deckung.
    return r.reference_status === 'complete' ? 'ohne_referenz' : 'unvollstaendig'
  }
  // Regel 2: die Richtung entscheidet, was die Zahl bedeutet.
  if (r.reference_direction === 'upper_limit') {
    return r.reference_pct > 100 ? 'zu_viel' : 'gedeckt'
  }
  if (r.reference_direction === 'range') {
    return 'im_bereich'
  }
  return r.reference_pct >= GEDECKT_AB ? 'gedeckt' : 'zu_wenig'
}

/**
 * Der Satz, der die Zahl lesbar macht.
 *
 * `[read]` **Ohne ihn ist „163 %" mehrdeutig** — bei einem Zielwert
 * gut, bei einer Obergrenze ein Warnzeichen.
 */
export function richtungsSatz(richtung: string | null): string {
  if (richtung === 'upper_limit') return 'der Obergrenze'
  if (richtung === 'range') return 'des Richtbereichs'
  return 'des Zielwerts'
}

export const LAGE_TEXT: Record<Lage, string> = {
  gedeckt: 'gedeckt',
  zu_wenig: 'zu wenig',
  zu_viel: 'über der Obergrenze',
  im_bereich: 'im Richtbereich',
  unvollstaendig: 'unvollständig',
  ohne_referenz: 'kein Richtwert',
}

export const LAGE_FARBE: Record<Lage, string> = {
  gedeckt: 'var(--pos)',
  zu_wenig: 'var(--warn)',
  // `[read]` Zu viel ist NICHT dieselbe Farbe wie zu wenig — eine
  // Ueberschreitung der Obergrenze ist die ernstere Lage.
  zu_viel: 'var(--neg)',
  im_bereich: 'var(--pos)',
  // `[read]` Grau, nicht rot: es ist kein Befund, sondern das Fehlen
  // eines Befunds (G-208).
  unvollstaendig: 'var(--fg-dim)',
  ohne_referenz: 'var(--fg-dim)',
}

/**
 * Ob die Zeile ueberhaupt einen Prozentwert zeigen darf.
 *
 * `[cmd]` **Regel 1 als Funktion.** Auf dev tragen alle 77
 * `incomplete`-Zeilen `reference_pct = null`; wer trotzdem eine Zahl
 * zeigte, muesste sie erfinden.
 */
export function zeigtProzent(lage: Lage, pct: number | null): boolean {
  if (lage === 'unvollstaendig' || lage === 'ohne_referenz') return false
  return pct !== null
}

/** Die Fehlmeldung, wenn Positionen ohne Wert dazwischenliegen. */
export function fehlSatz(missing: number): string {
  if (missing <= 0) return ''
  return missing === 1
    ? '1 Position ohne Wert — die Summe ist unvollständig.'
    : `${missing} Positionen ohne Wert — die Summe ist unvollständig.`
}

export const OHNE_REFERENZ_SATZ =
  'Für diesen Nährstoff gibt es keinen eigenständigen Richtwert. '
  + 'Das ist keine Aussage über deine Zufuhr.'

// ── Die Gruppen ──────────────────────────────────────────────────
//
// `[cmd]` **Uebernommen aus dem Mockup** (`MicroDashboard.js`), der
// laut Auftrag aus der Spec mit Abgleich zum Vorgaengerrepo
// entstanden ist: Vitamine (fett-/wasserloeslich getrennt),
// Mineralstoffe, Spurenelemente, Aminosaeuren, Fettsaeuren.
//
// `[read]` **`nutrient_display_tier` wird NICHT als Gliederung
// benutzt** — laut G-140 ist es ein Abo-Tier, keine Baumebene, und
// G-235 haelt die Frage offen.

export type Gruppe = {
  key: string
  titel: string
  codes: readonly string[]
}

export const GRUPPEN: readonly Gruppe[] = [
  {
    key: 'vit_fett',
    titel: 'Vitamine, fettlöslich',
    codes: ['VITA', 'VITD', 'VITE', 'VITK'],
  },
  {
    key: 'vit_wasser',
    titel: 'Vitamine, wasserlöslich',
    codes: ['VITC', 'THIA', 'RIBF', 'NIA', 'NIAEQ', 'PANTAC',
      'VITB6', 'BIOT', 'FOL', 'FOLDFE', 'VITB12'],
  },
  {
    key: 'mineral',
    titel: 'Mineralstoffe',
    codes: ['CA', 'MG', 'P', 'K', 'NA', 'CLD', 'NACL'],
  },
  {
    key: 'spuren',
    titel: 'Spurenelemente',
    codes: ['FE', 'ZN', 'ID', 'CU', 'MN', 'CR', 'MO', 'FD'],
  },
  {
    key: 'amino',
    titel: 'Aminosäuren',
    codes: ['LEU', 'ILE', 'VAL', 'LYS', 'MET', 'PHE', 'THR',
      'TRP', 'HIS', 'CYSTE', 'TYR', 'AAE9'],
  },
  {
    key: 'fett',
    titel: 'Fettsäuren',
    codes: ['F20:5CN3', 'F22:6CN3', 'F18:2CN6', 'F18:3CN3',
      'F22:5CN3', 'FASAT', 'FAMS', 'FAPU'],
  },
]

export type ZeileMitLage = ReferenceAssessmentRow & { lage: Lage }

/**
 * Ein Naehrstoff mit BEIDEN Referenzen — G-239.
 *
 * `[cmd]` **Der Befund, gemessen am 2026-08-28:** 12 Naehrstoffe auf
 * dev tragen ZWEI Zeilen — einen Zielwert und eine Obergrenze
 * (Calcium, Eisen, Magnesium, Vitamin A, Vitamin B6, Kupfer, Jod,
 * Mangan, Molybdaen, Phosphor, Fluorid, Niacin).
 *
 * `[read]` **Das ist Regel 2 in ihrer schaerfsten Form:** derselbe
 * Naehrstoff, derselbe Tag, zwei Prozentwerte mit entgegengesetzter
 * Lesart. `[cmd]` Calcium steht bei **71,9 % des PRI** (zu wenig) und
 * gleichzeitig bei **27,3 % des UL** (unbedenklich).
 *
 * `[read]` **Wer je Zeile eine Kachel zeigt, zeigt Calcium zweimal
 * mit widerspruechlichem Anschein.** Deshalb wird je Naehrstoff
 * zusammengefasst, mit der Obergrenze als Nebenaussage.
 */
export type Naehrstoff = {
  code: string
  name: string
  einheit: string
  /** Die fuehrende Zeile — Zielwert, falls vorhanden. */
  ziel: ZeileMitLage
  /** Die Obergrenze, falls der Naehrstoff eine fuehrt. */
  grenze: ZeileMitLage | null
  /**
   * Die Lage, die die Kachel traegt.
   *
   * `[read]` **Eine Ueberschreitung der Obergrenze schlaegt alles
   * andere** — sie ist die ernstere Aussage, auch wenn der Zielwert
   * gedeckt ist.
   */
  lage: Lage
}

export function faelleZusammen(zeilen: readonly ZeileMitLage[]): Naehrstoff[] {
  const jeCode = new Map<string, ZeileMitLage[]>()
  for (const z of zeilen) {
    const liste = jeCode.get(z.nutrient_code) ?? []
    liste.push(z)
    jeCode.set(z.nutrient_code, liste)
  }

  const aus: Naehrstoff[] = []
  for (const [code, liste] of Array.from(jeCode.entries())) {
    const grenze = liste.find(z => z.reference_direction === 'upper_limit') ?? null
    const ziel = liste.find(z => z.reference_direction !== 'upper_limit') ?? liste[0]
    aus.push({
      code,
      name: ziel.nutrient_name_de,
      einheit: ziel.nutrient_unit,
      ziel,
      grenze: grenze && grenze !== ziel ? grenze : null,
      // Die Ueberschreitung gewinnt, sonst die Lage des Zielwerts.
      lage: grenze?.lage === 'zu_viel' ? 'zu_viel' : ziel.lage,
    })
  }
  return aus
}

/**
 * Zeilen in Gruppen einteilen.
 *
 * `[read]` **Was in keine Gruppe faellt, verschwindet nicht** — es
 * landet unter „Weitere". Eine stumm weggelassene Zeile waere
 * derselbe Fehler wie eine Null statt eines Fehlzaehlers.
 */
export function gruppiere<T extends { code: string }>(
  stoffe: readonly T[],
): Array<{
  key: string
  titel: string
  stoffe: T[]
}> {
  const vergeben = new Set<string>()
  const aus = GRUPPEN.map(g => {
    const treffer = stoffe.filter(s => g.codes.includes(s.code))
    for (const t of treffer) vergeben.add(t.code)
    return { key: g.key, titel: g.titel, stoffe: treffer }
  }).filter(g => g.stoffe.length > 0)

  const rest = stoffe.filter(s => !vergeben.has(s.code))
  if (rest.length > 0) {
    aus.push({ key: 'weitere', titel: 'Weitere', stoffe: rest })
  }
  return aus
}

/**
 * Die Verteilung — gezaehlt, nicht gerechnet.
 *
 * `[read]` **Jede Zeile faellt in genau eine Lage**, und die Summe
 * ist die Zahl der Zeilen. Wer die Zustaende addiert und nicht auf
 * die Gesamtzahl kommt, hat eine Zeile verloren.
 */
export function verteilung(stoffe: readonly { lage: Lage }[]): Array<{
  lage: Lage
  anzahl: number
}> {
  const reihen: Lage[] = ['zu_viel', 'zu_wenig', 'gedeckt', 'im_bereich',
    'unvollstaendig', 'ohne_referenz']
  return reihen
    .map(l => ({ lage: l, anzahl: stoffe.filter(z => z.lage === l).length }))
    .filter(x => x.anzahl > 0)
}

/**
 * Der Hinweis auf den Geltungsbereich — Regel 4.
 *
 * `[read]` **Er nennt, was die Funktion mitliefert**, und behauptet
 * nichts darueber hinaus. Fehlt das Profil, sagt er das.
 */
export function geltungsSatz(r: {
  profile_age_years: number | null
  profile_biological_sex: string | null
  profile_is_pregnant: boolean
  profile_is_lactating: boolean
} | null): string {
  if (!r || r.profile_age_years === null) {
    return 'Die Richtwerte gelten für gesunde Erwachsene. '
      + 'Für dich hinterlegt ist kein vollständiges Profil.'
  }
  const geschlecht = r.profile_biological_sex === 'female'
    ? 'weiblich'
    : r.profile_biological_sex === 'male' ? 'männlich' : null
  const teile = [`${r.profile_age_years} Jahre`]
  if (geschlecht) teile.push(geschlecht)
  if (r.profile_is_pregnant) teile.push('schwanger')
  if (r.profile_is_lactating) teile.push('stillend')
  return `Die Richtwerte gelten für gesunde Erwachsene und sind auf dein `
    + `Profil bezogen: ${teile.join(', ')}.`
}
