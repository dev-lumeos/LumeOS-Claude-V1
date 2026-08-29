// ════════════════════════════════════════════════════════════════════
// WORAUS EIN MIKRO-FLAG ENTSTEHT — C-323
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30. Diese Datei rechnet aus Tageswerten, die ihr
// uebergeben werden; sie holt nichts.
//
// `[read]` **Ein Flag ist kein neuer Datenweg**, sondern die
// Verdichtung dessen, was seit G-249 (die vier Lagen) und G-247 (die
// Zeitraeume) schon da ist — **zu einer Aussage ueber DAUER.**
//
// ══ WARUM DAUER, UND WARUM ES DAS HEUTE NICHT GIBT ══════════════════
//
// `[cmd]` **Gemessen am 2026-08-29:** `naehrstoff-ordnung.ts:451`
// bildet `status` aus `avg_per_logged_day` — **dem Mittelwert ueber
// das Fenster.** Der bestehende Filter „Auffaellig"
// (`naehrstoff-anzeige.ts:197`) liest genau diesen einen Wert.
//
// `[read]` **Damit sind zwei voellig verschiedene Lagen ununter-
// scheidbar:** durchgehend 79 Prozent, und 45 Tage bei 40 Prozent
// neben 45 Tagen bei 118. **Beide ergeben denselben Mittelwert und
// dasselbe „unter Ziel".** Die erste ist ein Muster, die zweite ist
// Schwankung.
//
// `[cmd]` **Die Tageswerte liegen bereit:**
// `nutrition.reference_assessment_window(user, enddatum, tage)`
// liefert je Naehrstoff eine Zeile mit `daily_assessments` (jsonb) —
// **auf dev 90 Eintraege mit `entry_date`, `reference_pct` und
// `reference_status`.** Es fehlt nur das Zaehlen.
//
// ══ DIE MESSUNG, DIE DEN ZUSCHNITT ENTSCHIEDEN HAT ══════════════════
//
// `[cmd]` **`dev@lumeos.app`, 90 Tage bis 2026-08-29** — Tage unter
// dem Ziel bzw. ueber der Obergrenze, aus `daily_assessments`
// entfaltet:
//
//     WATER      88 von 88 unter Ziel      MG    87 ueber Grenze *
//     F18:2CN6   84 von 90 unter Ziel      NIA   51 ueber Grenze *
//     NACL       78 von 90 unter Ziel      VITA  42 ueber Grenze
//     NA         61 von 71 unter Ziel      MN     5 ueber Grenze
//     VITD       56 · CA 56 · F18:3CN3 55
//
// `[cmd]` **`tom.seed@example.com` liefert dieselbe Reihenfolge**
// (Seed aus derselben Quelle). **`test-user@lumeos.local` hat 12 Tage
// und faellt bei 7 Tagen ganz aus** — zu wenig Daten fuer eine
// Dauer-Aussage, und das ist die richtige Antwort, kein Fehler.
//
// `[read]` **Dieselben Naehrstoffe stehen bei 7, 30 und 90 Tagen
// oben.** **Eine feste Liste waere also moeglich — sie ist trotzdem
// falsch:** die Reihenfolge entsteht aus Toms Essgewohnheiten, nicht
// aus einer Eigenschaft von Bodybuildern. **Gezaehlt wird ueber alle
// Naehrstoffe; was oben steht, entscheiden die Daten.**
//
// ══ DIE STERNCHEN: DREI OBERGRENZEN GELTEN NICHT FUER NAHRUNG ═══════
//
// `[cmd]` **Das ist der Befund, der einen naiven Flag unbrauchbar
// macht.** Von 19 Obergrenzen tragen **drei** in `notes` eine
// Einschraenkung auf Supplemente:
//
//     MG     „Applies to pharmacological/supplemental magnesium
//             only, not magnesium naturally present in foods."
//     NIA    „Applies to synthetic niacin from supplements or
//             fortified foods."
//     FOLAC  „Applies to supplemental folic acid and related
//             synthetic forms, not food folate."
//
// `[cmd]` **Zwei davon sind die lautesten Warnungen auf dev: MG mit
// 87 und NIA mit 51 Tagen — zusammen 138 von 185 Ueberschreitungen.**
//
// `[read]` **Ein Flag ohne diese Ausnahme wuerde 87-mal vor
// Magnesium aus Nahrung warnen, wo die Quelle selbst sagt, dass die
// Grenze dafuer nicht gilt.**
//
// `[cmd]` **Und es steht NICHT strukturiert da:** `target_applies_to`
// fuehrt Naehrstoffcodes (welche Stoffe der Wert abdeckt), **keine
// Quellenunterscheidung.** Die Einschraenkung existiert nur als
// Freitext in `notes`.
//
// `[read]` **Deshalb steht die Liste hier, mit dem Zitat daneben.**
// **Das ist keine erfundene Regel** — es ist die Aussage der Quelle,
// die strukturell nicht abfragbar ist. **Gemeldet als Befund:** wenn
// die Spalte je entsteht, ersetzt sie diese Liste.

/** Ein Tag aus `daily_assessments`. */
export type FlagTag = {
  tag: string
  pct: number | null
  status: string
}

/**
 * Die Obergrenzen, die laut ihrer eigenen Quelle nicht fuer Nahrung
 * gelten.
 *
 * `[cmd]` **Aus `nutrition.nutrient_reference_values.notes` gelesen,
 * am 2026-08-29** — nicht ausgedacht. Drei von 19 Obergrenzen.
 */
export const GRENZE_NUR_SUPPLEMENT: Readonly<Record<string, string>> = {
  MG: 'Die Obergrenze gilt für Magnesium aus Präparaten, nicht für Magnesium aus Lebensmitteln.',
  NIA: 'Die Obergrenze gilt für synthetisches Niacin aus Präparaten oder angereicherten Lebensmitteln.',
  FOLAC: 'Die Obergrenze gilt für Folsäure aus Präparaten, nicht für Folat aus Lebensmitteln.',
}

/**
 * Ab wann aus Tagen ein Muster wird.
 *
 * `[read]` **Das ist keine Prozentschwelle** — der Auftrag verbietet
 * sie, und sie waere auch die falsche Achse. Es ist ein ANTEIL der
 * bewerteten Tage: **die Haelfte.**
 *
 * `[read]` **Warum die Haelfte und nicht ein Drittel:** bei 90 Tagen
 * traefe ein Drittel schon zu, wenn an zwei von drei Tagen alles in
 * Ordnung ist. **Die Haelfte sagt: das ist der Normalfall, nicht die
 * Ausnahme.**
 *
 * `[cmd]` **Gegen die Daten geprueft:** auf dev, 90 Tage, laesst sie
 * WATER (88/88), F18:2CN6 (84/90), NACL (78/90) und NA (61/71)
 * durch und haelt MN (5/90) und VITE (2/90) zurueck.
 */
export const MUSTER_ANTEIL = 0.5

/**
 * Wie viele bewertete Tage es mindestens braucht.
 *
 * `[read]` **Ein Tag ist kein Muster, und drei sind es auch nicht.**
 * `[cmd]` `test-user@lumeos.local` hat 12 Tage mit Daten und faellt
 * im 7-Tage-Fenster ganz aus — **das ist die richtige Antwort.**
 */
export const MIN_TAGE = 4

export type FlagArt =
  | 'unter_ziel'
  | 'ueber_grenze'
  | 'grenze_nur_supplement'

export type Flag = {
  code: string
  name: string
  art: FlagArt
  /** Tage, an denen die Lage zutraf. */
  tage: number
  /** Bewertete Tage im Zeitraum — der Nenner. */
  bewertet: number
  /** Tage, an denen die Summe unvollstaendig war. */
  unvollstaendig: number
}

/**
 * Zaehlt die Tage — die eine Stelle, an der aus Werten Dauer wird.
 *
 * **Vorgabe 2, die Leserichtung:** `richtung` entscheidet, was ein
 * Prozentwert bedeutet. `[read]` **80 Prozent eines Zielwerts sind zu
 * wenig, 80 Prozent einer Obergrenze sind unbedenklich** (C-48
 * Regel 2). **Ohne sie warnt es falschherum.**
 *
 * **Vorgabe 3, Unvollstaendiges ist kein Mangel:** `[cmd]` Tage mit
 * `reference_status = 'incomplete'` tragen auf dev durchgaengig
 * `reference_pct = null`. **Sie zaehlen weder als getroffen noch als
 * bewertet** — sie stehen im eigenen Zaehler.
 */
export function flagVon(
  code: string,
  name: string,
  richtung: string | null,
  tage: readonly FlagTag[],
  gedecktAb: number,
): Flag | null {
  let bewertet = 0
  let unvollstaendig = 0
  let getroffen = 0

  for (const t of tage) {
    if (t.status === 'incomplete') unvollstaendig += 1
    if (t.status !== 'complete' || t.pct === null) continue
    bewertet += 1
    if (richtung === 'upper_limit') {
      if (t.pct > 100) getroffen += 1
    } else if (richtung === 'target') {
      if (t.pct < gedecktAb) getroffen += 1
    }
  }

  if (bewertet < MIN_TAGE) return null
  if (getroffen < bewertet * MUSTER_ANTEIL) return null

  const art: FlagArt = richtung === 'upper_limit'
    ? (code in GRENZE_NUR_SUPPLEMENT ? 'grenze_nur_supplement' : 'ueber_grenze')
    : 'unter_ziel'

  return { code, name, art, tage: getroffen, bewertet, unvollstaendig }
}

/**
 * Der Satz je Flag — ohne Zahl.
 *
 * `[read]` **Die Nachweiszeile verlangt „je Flag ein Satz, ohne
 * Zahl".** Die Zahlen stehen daneben in `dauerSatz`; **der Satz sagt,
 * was es bedeutet, nicht wie viel es ist.**
 */
export const FLAG_SATZ: Record<FlagArt, string> = {
  unter_ziel:
    'Über den Zeitraum meist unter dem Zielwert — das ist ein Muster, kein einzelner Tag.',
  ueber_grenze:
    'Über den Zeitraum meist über der Obergrenze. Diese Grenze gilt für die Gesamtzufuhr.',
  grenze_nur_supplement:
    'Über den Zeitraum meist über der Obergrenze — diese Grenze gilt aber laut Quelle '
    + 'nicht für Lebensmittel.',
}

export const FLAG_FARBE: Record<FlagArt, string> = {
  unter_ziel: 'var(--warn)',
  ueber_grenze: 'var(--neg)',
  // `[read]` Grau, nicht rot: die Grenze gilt hier nicht — es ist
  // eine Einordnung, keine Warnung. Dieselbe Klasse wie
  // `unvollstaendig` in G-249.
  grenze_nur_supplement: 'var(--fg-dim)',
}

/**
 * Die Dauer als Text — „an 42 von 90 Tagen".
 *
 * `[read]` **Das ist die Aussage, die der Auftrag verlangt.** Sie
 * nennt den Nenner mit, sonst ist die Zahl nicht einzuordnen.
 */
export function dauerSatz(f: Flag): string {
  const was = f.art === 'unter_ziel' ? 'unter dem Zielwert' : 'über der Obergrenze'
  return `an ${f.tage} von ${f.bewertet} bewerteten Tagen ${was}`
}

/**
 * Der Zusatz, wenn Tage unvollstaendig waren — Vorgabe 3.
 *
 * `[read]` **Unvollstaendiges ist kein Mangel**, aber es gehoert
 * sichtbar: wer 90 Tage erwartet und 71 als Nenner liest, soll
 * wissen, warum.
 */
export function unvollstaendigSatz(f: Flag): string {
  if (f.unvollstaendig <= 0) return ''
  return f.unvollstaendig === 1
    ? '1 Tag blieb unbewertet, weil Angaben fehlten.'
    : `${f.unvollstaendig} Tage blieben unbewertet, weil Angaben fehlten.`
}

/**
 * Die Reihenfolge: was am laengsten auffaellt, steht oben.
 *
 * `[read]` **Nicht nach Hoehe** — ein Tag mit 300 Prozent ist
 * weniger wert als 60 Tage mit 70. **Das ist Vorgabe 1 in der
 * Sortierung.**
 *
 * `[read]` **Und die Supplement-Ausnahme sinkt nach unten:** sie ist
 * eine Einordnung, keine Warnung, und darf die echten nicht
 * verdraengen.
 */
export function sortiere(flags: readonly Flag[]): Flag[] {
  const rang: Record<FlagArt, number> = {
    ueber_grenze: 0, unter_ziel: 1, grenze_nur_supplement: 2,
  }
  return [...flags].sort((a, b) =>
    rang[a.art] - rang[b.art]
    || b.tage / b.bewertet - a.tage / a.bewertet
    || b.tage - a.tage)
}

/**
 * Der Satz, wenn es zu wenig Daten gibt.
 *
 * `[cmd]` **`test-user@lumeos.local` trifft das im 7-Tage-Fenster.**
 * `[read]` **Kein Flag ist eine Aussage, „nichts gefunden" waere eine
 * andere und falsche** — dieselbe Klasse wie `begruendet_leer` gegen
 * `nicht_bearbeitet` (G-208).
 */
export function zuWenigDatenSatz(bewerteteTage: number): string {
  if (bewerteteTage >= MIN_TAGE) return ''
  return bewerteteTage === 0
    ? 'Für diesen Zeitraum liegen keine bewerteten Tage vor.'
    : `Nur ${bewerteteTage} bewertete Tage — zu wenig für eine Aussage über die Dauer.`
}
