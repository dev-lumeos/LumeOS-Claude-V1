// Der Pace eines Ziels — G-554/A4. **Reine Rechnung, kein I/O.**
//
// ══ WARUM DAS KEINE SPALTE IST ═════════════════════════════════════
//
// `[cmd]` **Der Entwurf zeigt je Ziel einen Pace** (`ahead` /
// `on-track` / hinterher, farbig — `module-goals.jsx:750`).
// `[cmd]` **`goals.user_goals` hat dafuer KEINE Spalte**, gemessen
// 2026-09-30: `progress_pct`, `start_value`, `current_value`,
// `target_value`, `gueltig_ab` und `target_date` gibt es, `pace`
// nicht.
//
// `[read]` **Pace ist eine Ableitung aus fuenf vorhandenen Werten** —
// und deshalb gehoert er hierher und nicht in die Datenbank: er
// aendert sich mit jedem Tag, ohne dass jemand schreibt.
//
// ── Die Rechnung, von Hand nachvollziehbar ────────────────────────
//
// **Anteil der Zeit, der verstrichen ist:**
//
//     zeitanteil = (heute - start) / (deadline - start)
//
// **Wo man bei gleichmaessigem Verlauf stehen muesste:**
//
//     soll = start_value + (target_value - start_value) * zeitanteil
//
// **Und der Vergleich mit dem Ist:**
//
//     fortschritt_ist  = (current - start_value) / (target - start_value)
//     abweichung       = fortschritt_ist - zeitanteil
//
// `[read]` **Der Bruch normiert die Richtung mit:** bei einem
// Abnehmziel ist `target < start`, und beide Differenzen werden
// negativ — **der Quotient bleibt positiv.** **Deshalb braucht es
// keine Fallunterscheidung fuer Ab- und Zunehmen.**
//
// ── Ein durchgerechnetes Beispiel ─────────────────────────────────
//
// **Abnehmen von 80 kg auf 76 kg, 1. Januar bis 1. Maerz 2026,
// heute der 31. Januar, Ist 79 kg:**
//
//     dauer      = 59 Tage   (01.01. -> 01.03.)
//     verstrichen= 30 Tage   (01.01. -> 31.01.)
//     zeitanteil = 30 / 59            = 0,5085
//     soll       = 80 + (76-80)*0,5085 = 77,966 kg
//     ist_anteil = (79-80) / (76-80)   = 0,25
//     abweichung = 0,25 - 0,5085       = -0,2585
//
// `[read]` **-0,2585 liegt unter -0,05** -> **`hinterher`.** Und das
// stimmt mit dem Augenschein: **nach der Haelfte der Zeit ist ein
// Viertel der Strecke geschafft.**

/** Die drei Zustaende des Entwurfs. */
export type Pace = 'ahead' | 'on-track' | 'behind' | 'unbekannt'

/**
 * Die Schwelle, ab der ein Ziel nicht mehr *on-track* ist.
 *
 * `[read]` **Fuenf Prozentpunkte Abweichung.** `[cmd]` **Der
 * Entwurf nennt keine Zahl** — er zeigt nur die drei Zustaende.
 * **Die Schwelle ist damit eine Entscheidung dieses Punktes und
 * steht hier an einer Stelle**, statt in einem Vergleich zu
 * verschwinden.
 *
 * `[read]` **Ohne Toleranz waere fast nie etwas *on-track*:** schon
 * ein Tag Verzug kippte das Urteil.
 */
export const PACE_TOLERANZ = 0.05

export type PaceEingabe = {
  start_value: number | null
  current_value: number | null
  target_value: number | null
  /** `gueltig_ab` — ISO-Tag. */
  start: string | null
  /** `target_date` — ISO-Tag. */
  deadline: string | null
  /** Der Stichtag, von aussen. **Kein `Date.now()`.** */
  heute: string
}

export type PaceErgebnis = {
  pace: Pace
  /** Anteil der verstrichenen Zeit, 0..1. */
  zeitanteil: number | null
  /** Anteil der geschafften Strecke — kann ueber 1 und unter 0. */
  streckenanteil: number | null
  /** Wo der Wert heute stehen muesste. */
  sollwert: number | null
  /** `streckenanteil - zeitanteil`. */
  abweichung: number | null
  /**
   * Warum kein Urteil moeglich war — `null`, wenn eines vorliegt.
   *
   * `[read]` **Ein Pace ohne Grundlage ist keine Null, sondern eine
   * Leerstelle mit Grund** (E-72).
   */
  grund: string | null
}

const ISO = /^\d{4}-\d{2}-\d{2}$/

/** Tage zwischen zwei ISO-Tagen. Ohne `Date.now()`. */
export function tageZwischen(von: string, bis: string): number | null {
  if (!ISO.test(von) || !ISO.test(bis)) return null
  const a = Date.parse(`${von}T00:00:00Z`)
  const b = Date.parse(`${bis}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.round((b - a) / 86400000)
}

/**
 * Resttage bis zur Deadline — der Entwurf zeigt sie unter dem Datum.
 *
 * `[read]` **Negativ heisst ueberfaellig** — das ist eine Aussage,
 * keine Fehlbedienung.
 */
export function restTage(deadline: string | null, heute: string): number | null {
  if (!deadline) return null
  return tageZwischen(heute, deadline)
}

/**
 * Das Pace-Urteil.
 *
 * `[read]` **Jede Verweigerung nennt ihren Grund** — sonst sieht
 * eine fehlende Deadline aus wie ein Ziel im Plan.
 */
export function berechnePace(e: PaceEingabe): PaceErgebnis {
  const leer = (grund: string): PaceErgebnis => ({
    pace: 'unbekannt', zeitanteil: null, streckenanteil: null,
    sollwert: null, abweichung: null, grund,
  })

  if (e.start_value === null || e.target_value === null) {
    return leer('ohne Start- und Zielwert laesst sich kein Verlauf rechnen')
  }
  if (e.current_value === null) {
    return leer('noch kein Ist-Wert erfasst')
  }
  if (!e.start || !e.deadline) {
    return leer('ohne Deadline gibt es keinen Zeitplan')
  }

  const dauer = tageZwischen(e.start, e.deadline)
  const verstrichen = tageZwischen(e.start, e.heute)
  if (dauer === null || verstrichen === null) {
    return leer('das Datum ist nicht lesbar')
  }
  // `[read]` **Deadline am Starttag** — dann gibt es keine Strecke
  // in der Zeit, und jede Division waere eine Erfindung.
  if (dauer <= 0) {
    return leer('die Deadline liegt nicht nach dem Start')
  }

  const spanne = e.target_value - e.start_value
  if (spanne === 0) {
    return leer('Start- und Zielwert sind gleich')
  }

  // `[read]` **Beidseitig begrenzt**: vor dem Start ist nichts
  // verstrichen, nach der Deadline nicht mehr als alles.
  const zeitanteil = Math.min(1, Math.max(0, verstrichen / dauer))
  const sollwert = e.start_value + spanne * zeitanteil
  const streckenanteil = (e.current_value - e.start_value) / spanne
  const abweichung = streckenanteil - zeitanteil

  const pace: Pace = abweichung > PACE_TOLERANZ ? 'ahead'
    : abweichung < -PACE_TOLERANZ ? 'behind'
      : 'on-track'

  return { pace, zeitanteil, streckenanteil, sollwert, abweichung, grund: null }
}

/** Die Beschriftung des Entwurfs. */
export const PACE_TEXT: Record<Pace, string> = {
  ahead: 'ahead',
  'on-track': 'on-track',
  behind: 'behind',
  unbekannt: '—',
}
