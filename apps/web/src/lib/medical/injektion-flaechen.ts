// Injektionsorte auf Muskelflaechen — G-396.
//
// ══ WARUM FLAECHEN STATT PUNKTE ═════════════════════════════════════
//
// **Tom, 2026-09-09:** *„die injektionsorte sollen auch anwaehlbar
// sein wie in muscle soreness, und ein modal mit all den werten
// betreffs punkt und daten dazu. sowie die farblichen
// unterscheidungen logisch nach gebrauch wie in muscle soreness."*
//
// `[cmd]` **Die Koerperkarte kann das seit G-55:** `onPick`,
// `role="button"`, `tabIndex`, Tastaturbedienung. **Die
// Injektionskachel hat es nie benutzt** — der fuenfzehnte A-71-Fall.
//
// `[read]` **Die 16 Eintraege in `INJEKTIONS_ORTE` bleiben stehen**,
// werden aber nicht mehr benutzt. **Gemeldet, nicht geloescht** — sie
// tragen Koordinaten, die ein spaeterer Auftrag brauchen kann.

/** Eine Zeile aus `medical.injection_sites`, auf das Noetige verkuerzt. */
export type OrtFuerFlaeche = {
  id: string
  route: string
  display_name: string
  minimum_rest_days: number | null
  minimum_rest_days_reason: string | null
}

/** Eine Zeile aus `medical.injection_logs`. */
export type ProtokollZeile = {
  injection_site_id: string
  injected_at: string
  volume_ml?: number | null
  substance_name?: string | null
  route?: string | null
  pain_score?: number | null
  complication?: string | null
  override_reason?: string | null
}

/**
 * Welche Nadelempfehlung zu einem Ort gehoert.
 *
 * `[cmd]` **`injection_needle_recommendations` haelt 8 Zeilen fuer 16
 * Orte**, verschluesselt auf `site` — die ORTSART, nicht die Id
 * (C-445/A5). **Gemessene Werte der Spalte:** `deltoid`,
 * `vastus_lateralis`, `ventrogluteal`, `subcutaneous`.
 *
 * `[read]` **Quadriceps liest `vastus_lateralis`** — das ist der
 * Muskelkopf, in den intramuskulaer injiziert wird, und der
 * Ortsname in der Nadeltabelle. **Alle vier SubQ-Orte lesen
 * `subcutaneous`**, weil die Empfehlung am Weg haengt, nicht am Ort.
 */
export const ORT_ZU_NADELART: Record<string, string> = {
  delt_l: 'deltoid',
  delt_r: 'deltoid',
  quad_l: 'vastus_lateralis',
  quad_r: 'vastus_lateralis',
  vglute_l: 'ventrogluteal',
  vglute_r: 'ventrogluteal',
  sq_delt_l: 'subcutaneous',
  sq_delt_r: 'subcutaneous',
  thigh_sq_l: 'subcutaneous',
  thigh_sq_r: 'subcutaneous',
  abd_l: 'subcutaneous',
  abd_r: 'subcutaneous',
  // `[cmd]` **Fuer `glute` und `lat` fuehrt die Tabelle KEINE Zeile.**
  // `[read]` **Das Modal sagt das dann auch so** — E-72: ein leeres
  // Feld braucht einen benannten Grund, keine stille Leere.
}

/**
 * Welche Muskelflaeche ein Injektionsort einfaerbt.
 *
 * ══ GEMESSEN, NICHT GERATEN ═════════════════════════════════════════
 *
 * `[cmd]` **`MUSKELN` fuehrt 21 Flaechen** (gemessen 2026-09-09):
 * chest, abs, obliques, biceps, triceps, deltoids, trapezius, neck,
 * forearm, adductors, quadriceps, knees, tibialis, calves, gluteal,
 * hamstring, head, hair, hands, ankles, feet.
 *
 * `[cmd]` **`latissimus` ist NICHT dabei** — der Auftrag fragt danach,
 * und die Antwort ist nein. **Die Rueckansicht fuehrt nur `gluteal`
 * und `hamstring` als Rumpfflaechen; der obere Ruecken ist
 * `trapezius`.**
 *
 * `[read]` **`lat_l/r` faellt deshalb auf `trapezius`** — die
 * naechstliegende vorhandene Flaeche, nicht die anatomisch genaue.
 * **Das ist eine Naeherung und steht so im Bericht.** Eine eigene
 * Latissimus-Flaeche waere neue Pfaddaten in `packages/ui` — das
 * verbietet der Auftrag ausdruecklich.
 */
export const ORT_ZU_FLAECHE: Record<string, string> = {
  delt_l: 'deltoids',
  delt_r: 'deltoids',
  sq_delt_l: 'deltoids',
  sq_delt_r: 'deltoids',
  quad_l: 'quadriceps',
  quad_r: 'quadriceps',
  thigh_sq_l: 'quadriceps',
  thigh_sq_r: 'quadriceps',
  glute_l: 'gluteal',
  glute_r: 'gluteal',
  vglute_l: 'gluteal',
  vglute_r: 'gluteal',
  abd_l: 'obliques',
  abd_r: 'obliques',
  // `[cmd]` **Naeherung, siehe oben** — `latissimus` gibt es nicht.
  lat_l: 'trapezius',
  lat_r: 'trapezius',
}

/** Links oder rechts, aus der Id gelesen. */
export function seiteVonOrt(id: string): 'links' | 'rechts' | undefined {
  if (id.endsWith('_l')) return 'links'
  if (id.endsWith('_r')) return 'rechts'
  return undefined
}

/**
 * Die vier Zustaende nach `Injection Planner`, Abschnitt 5.1.
 *
 * ══ E-57 MACHT DREI DAVON UNERREICHBAR ══════════════════════════════
 *
 * `[cmd]` **Die Spec rechnet `rest_remaining = site.rest_days -
 * days_ago`** und leitet daraus `resting`, `soon` und `ready` ab.
 * **Ihre Tabelle nennt Zahlen:** Deltoid 5 Tage, Gluteus 7.
 *
 * `[cmd]` **In der Datenbank ist `minimum_rest_days` bei ALLEN 16
 * Orten NULL**, mit Begruendung in `minimum_rest_days_reason`:
 * *„E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit fuer
 * wiederholte IM-Injektionen."*
 *
 * `[cmd]` **E-57 ist eine gueltige Entscheidung** (`status: gueltig`,
 * 18 recherchierte Quellen): **keine Leitlinie von WHO, CDC oder
 * einer Fachgesellschaft, keine kontrollierte Humanstudie.** *„Die
 * Zahlen, die auf TRT-Seiten und in Foren stehen, sind Praxisregeln —
 * nicht validierte Grenzwerte."* Sie schreibt ausdruecklich
 * `minimum_rest_days = null` fuer beide Wege vor.
 *
 * `[read]` **Damit sind die Zahlen der Spec genau das, was E-57 nach
 * 18 Quellen verworfen hat.** Sie hier einzusetzen hiesse, eine
 * medizinische Empfehlung zu erfinden, die das Projekt bewusst nicht
 * gibt — und E-74 verbietet das Bewerten ohnehin.
 *
 * `[read]` **Also zwei Zustaende statt vier**, und der Grund steht am
 * Schirm:
 *
 *     nie benutzt   kein Protokolleintrag  ->  `fresh`
 *     benutzt       mit Datum des letzten Einstichs  ->  `benutzt`
 *
 * **Kein `resting`, kein `soon`, kein `ready`** — sie brauchen alle
 * eine Ruhezeit in Tagen. **Der Befund steht im Bericht, die Kachel
 * benennt ihn.**
 */
export type OrtZustand = {
  ort: OrtFuerFlaeche
  status: 'fresh' | 'benutzt'
  tageSeither: number | null
  letzte: ProtokollZeile | null
}

export function ortZustand(
  ort: OrtFuerFlaeche,
  protokoll: readonly ProtokollZeile[],
  stichtag: string,
): OrtZustand {
  // `[read]` **Ein Stichtag als `string`, keine Uhr** — G-390: eine
  // Funktion, die keinen Zeitpunkt annimmt, kann keinen falschen
  // annehmen.
  const heute = Date.parse(`${stichtag}T00:00:00Z`)
  const eigene = protokoll
    .filter(p => p.injection_site_id === ort.id)
    .sort((a, b) => Date.parse(b.injected_at) - Date.parse(a.injected_at))
  const letzte = eigene[0] ?? null
  if (!letzte) return { ort, status: 'fresh', tageSeither: null, letzte: null }
  const ms = heute - Date.parse(letzte.injected_at)
  const tage = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / 86400000)) : null
  return { ort, status: 'benutzt', tageSeither: tage, letzte }
}

/**
 * Die Farbe eines Zustands.
 *
 * `[read]` **Zwei Farben, weil es zwei Zustaende gibt.** `--fg-dim`
 * ist im Haus die Farbe fuer *„kein Wert"* (so nutzt sie
 * `injektionsFarbe` fuer „nie benutzt"), `--acc-suppl` der
 * Modulakzent. **Keine Ampel** — eine Ampel waere eine Bewertung,
 * und die gibt E-57 nicht her.
 */
export function zustandsFarbe(z: OrtZustand): string {
  return z.status === 'fresh' ? 'var(--fg-dim)' : 'var(--acc-suppl)'
}

/**
 * Eine einfaerbbare Haelfte einer Muskelflaeche.
 *
 * `[read]` **Mehrere Orte teilen sich eine Flaeche** — `delt_l` und
 * `sq_delt_l` beide `deltoids` links, `glute_l` und `vglute_l` beide
 * `gluteal` links. **Die Flaeche traegt EINE Farbe, das Modal ALLE
 * Orte** (A8).
 */
export type FlaechenGruppe = {
  flaeche: string
  seite: 'links' | 'rechts' | undefined
  /** Alle Orte dieser Haelfte, der zuletzt benutzte zuerst. */
  orte: OrtZustand[]
  farbe: string
}

/**
 * Die Orte zu Flaechenhaelften zusammenfassen.
 *
 * ══ WELCHER ORT DIE FARBE BESTIMMT ══════════════════════════════════
 *
 * `[cmd]` **Der Auftrag sagt: „der dringendere gewinnt".** `[read]`
 * **Dringlichkeit ist eine Ruhezeitrechnung, und die gibt es nach
 * E-57 nicht** (siehe `OrtZustand`). **Also die naechstliegende
 * Ordnung, die die Daten tragen: der zuletzt benutzte Ort gewinnt.**
 *
 * `[read]` **Eine Flaeche, in die heute injiziert wurde, faerbt sich
 * benutzt** — auch wenn der zweite Ort darin nie benutzt wurde. **Das
 * ist die vorsichtigere Richtung:** sie zeigt Gebrauch an, statt ihn
 * zu verdecken. **Und beide Orte stehen im Modal**, mit ihrem eigenen
 * Datum.
 */
export function flaechenGruppen(
  orte: readonly OrtFuerFlaeche[],
  protokoll: readonly ProtokollZeile[],
  stichtag: string,
): FlaechenGruppe[] {
  const nach = new Map<string, FlaechenGruppe>()
  for (const ort of orte) {
    const flaeche = ORT_ZU_FLAECHE[ort.id]
    if (!flaeche) continue
    const seite = seiteVonOrt(ort.id)
    const schluessel = `${flaeche}|${seite ?? '-'}`
    const gruppe = nach.get(schluessel)
      ?? { flaeche, seite, orte: [], farbe: 'var(--fg-dim)' }
    gruppe.orte.push(ortZustand(ort, protokoll, stichtag))
    nach.set(schluessel, gruppe)
  }
  const alle: FlaechenGruppe[] = Array.from(nach.values())
  for (const gruppe of alle) {
    // `[read]` **Benutzte zuerst, darunter nach Tagen aufsteigend** —
    // der zuletzt benutzte Ort steht oben und gibt die Farbe.
    gruppe.orte.sort((a: OrtZustand, b: OrtZustand) => {
      if (a.status !== b.status) return a.status === 'benutzt' ? -1 : 1
      return (a.tageSeither ?? Infinity) - (b.tageSeither ?? Infinity)
    })
    const erster = gruppe.orte[0]
    if (erster) gruppe.farbe = zustandsFarbe(erster)
  }
  return alle
}
