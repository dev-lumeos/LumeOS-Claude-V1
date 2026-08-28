// ════════════════════════════════════════════════════════════════════
// REGELN FUER DIE TRAININGSERFASSUNG — G-216
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30. Die Datei prueft und rechnet, sie schreibt
// nicht. Dadurch ist sie ohne Datenbank testbar.
//
// ══ DER OFFENE ZUSTAND, UND WARUM ER VOM SCHEMA KOMMT ═══════════════
//
// **Auftrag: *„Was passiert mit einer Sitzung, die begonnen und nie
// abgeschlossen wurde? Bleibt sie offen, wird sie verworfen, zaehlt
// sie? Pruef, ob das Schema die Antwort schon vorgibt."***
//
// `[cmd]` **Das Schema gibt sie vor, vollstaendig:**
//
//   `workout_sessions_status_check` erlaubt genau vier Werte —
//   `planned | active | completed | cancelled` (gemessen 2026-08-28).
//   `ended_time` ist NULLABLE, und `workout_sessions_check` verlangt
//   nur `ended_time IS NULL OR ended_time >= started_time`.
//
// `[read]` **`active` mit `ended_time IS NULL` IST der offene
// Zustand.** Er war schon da, es hat ihn nur niemand geschrieben.
// **Eine unterbrochene Sitzung bleibt also offen — sie wird weder
// verworfen noch zaehlt sie als Leistung.**
//
// `[cmd]` **Und der Leseweg zaehlt sie schon heute nicht mit:**
// `sitzungen-read.ts:124` setzt `absolviert` aus dem DATUM, nicht aus
// `status`. Eine offene Sitzung von heute ist damit `absolviert:
// true`, sobald ihr Tag vorbei ist — **das ist genau der Fall, den
// G-69 „ausgefallen" nennt.** Wer sie als Leistung zaehlen will,
// filtert zusaetzlich auf `status`.
//
// ══ WAS DER BESTAND DAZU SAGT ═══════════════════════════════════════
//
// `[cmd]` **Gemessen 2026-08-28 ueber alle 66 Seed-Sitzungen:** 36
// `completed`, 28 `planned`, 2 `cancelled` — **kein einziges
// `active`.** `[read]` Der offene Zustand ist unbenutzt, nicht
// verboten.
//
// `[cmd]` **Und ein Befund am Rand:** alle 28 `planned`-Sitzungen
// tragen eine `ended_time`. `[read]` Fuer etwas, das noch nicht
// stattgefunden hat, ist das sinnlos — **die Erfassung hier setzt
// `ended_time` deshalb erst beim Abschliessen.**

/** `[cmd]` Aus `workout_sessions_status_check`, nicht erfunden. */
export const ZUSTAENDE = ['planned', 'active', 'completed', 'cancelled'] as const
export type Zustand = (typeof ZUSTAENDE)[number]

/** `[cmd]` Aus `workout_sets_set_type_check`. */
export const SATZARTEN = ['working', 'warmup', 'dropset', 'failure'] as const
export type Satzart = (typeof SATZARTEN)[number]

/** `[cmd]` Aus `workout_sessions_measurement_source_ck`. */
export const HERKUNFT = ['manual', 'device', 'import', 'admin', 'seed'] as const

export type Feldfehler = { feld: string; text: string }

export type SitzungsEingabe = {
  session_date: string
  name: string
  location: string
  notes: string
}

export type SatzEingabe = {
  reps: string
  weight_kg: string
  rpe: string
  rir: string
  set_type: Satzart
  rest_seconds: string
}

export const LEERE_SITZUNG: SitzungsEingabe = {
  session_date: '', name: '', location: '', notes: '',
}

export const LEERER_SATZ: SatzEingabe = {
  reps: '', weight_kg: '', rpe: '', rir: '', set_type: 'working', rest_seconds: '',
}

/** Leerer Text wird `null`, nicht `''` — die Spalten sind nullable. */
export function text(v: string): string | null {
  const s = v.trim()
  return s.length > 0 ? s : null
}

/** `''` ist kein `0`. Ungueltiges bleibt `undefined` und faellt auf. */
export function zahl(v: string): number | null | undefined {
  const s = v.trim()
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

function istDatum(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))
}

// ── Die Sitzung ──────────────────────────────────────────────────

export function pruefeSitzung(e: SitzungsEingabe): Feldfehler[] {
  const f: Feldfehler[] = []
  if (!istDatum(e.session_date)) {
    f.push({ feld: 'session_date', text: 'Ein Datum als JJJJ-MM-TT.' })
  }
  return f
}

// ── Der Satz ─────────────────────────────────────────────────────

/**
 * `[cmd]` **`workout_sets_check` verlangt mindestens eines von
 * `reps`, `duration_seconds`, `distance_meters`.** Die Erfassung hier
 * deckt Kraft ab, also `reps` — **und macht daraus eine Fachregel
 * statt eines Datenbankfehlers:** ein Satz ohne Wiederholungen ist
 * kein Satz.
 */
export function pruefeSatz(e: SatzEingabe): Feldfehler[] {
  const f: Feldfehler[] = []

  const reps = zahl(e.reps)
  // `[cmd]` `workout_sets_reps_check`: `reps IS NULL OR reps > 0`.
  if (reps === undefined || reps === null || reps <= 0 || !Number.isInteger(reps)) {
    f.push({ feld: 'reps', text: 'Wiederholungen als ganze Zahl ueber 0.' })
  }

  const g = zahl(e.weight_kg)
  // `[cmd]` `workout_sets_weight_kg_check`: `NULL OR >= 0`.
  if (g === undefined || (g !== null && g < 0)) {
    f.push({ feld: 'weight_kg', text: 'Gewicht in kg, nicht negativ.' })
  }

  const rpe = zahl(e.rpe)
  // `[cmd]` `workout_sets_rpe_check`: `NULL OR 1..10`.
  if (rpe === undefined || (rpe !== null && (rpe < 1 || rpe > 10))) {
    f.push({ feld: 'rpe', text: 'RPE zwischen 1 und 10.' })
  }

  const rir = zahl(e.rir)
  // `[cmd]` `workout_sets_rir_check`: `NULL OR 0..10`.
  if (rir === undefined || (rir !== null && (rir < 0 || rir > 10 || !Number.isInteger(rir)))) {
    f.push({ feld: 'rir', text: 'RIR als ganze Zahl von 0 bis 10.' })
  }

  const pause = zahl(e.rest_seconds)
  // `[cmd]` `workout_sets_rest_seconds_check`: `NULL OR >= 0`.
  if (pause === undefined || (pause !== null && (pause < 0 || !Number.isInteger(pause)))) {
    f.push({ feld: 'rest_seconds', text: 'Pause in Sekunden, nicht negativ.' })
  }

  if (!SATZARTEN.includes(e.set_type)) {
    f.push({ feld: 'set_type', text: 'Unbekannte Satzart.' })
  }
  return f
}

// ── Was gerechnet wird, und was nicht ────────────────────────────

/**
 * Volumen eines Satzes.
 *
 * `[cmd]` **Im Bestand ist `volume_kg` bei allen 238 Saetzen exakt
 * `reps * weight_kg`** (gemessen 2026-08-28). Die Spalte ist NICHT
 * `GENERATED` — sie wird geschrieben, also schreibt die Naht sie
 * nach derselben Regel.
 *
 * `[read]` **Ohne Gewicht kein Volumen** — ein Klimmzug mit
 * Koerpergewicht traegt `weight_kg NULL`, und `0` waere dort eine
 * Behauptung, keine Messung. Deshalb `null`.
 */
export function volumen(reps: number | null, gewicht: number | null): number | null {
  if (reps === null || gewicht === null) return null
  return Number((reps * gewicht).toFixed(3))
}

/**
 * Geschaetztes 1RM nach Epley.
 *
 * `[cmd]` **Aufwaermsaetze bleiben ohne Wert** — im Bestand tragen
 * 216 von 238 Saetzen ein `estimated_1rm`, und die fehlenden sind
 * `set_type = 'warmup'` (`sitzungen-read.ts` beschreibt denselben
 * Befund fuer G-69). `[read]` Ein Aufwaermsatz sagt ueber die
 * Maximalkraft nichts.
 */
export function epley(
  reps: number | null, gewicht: number | null, art: Satzart,
): number | null {
  if (art === 'warmup') return null
  if (reps === null || gewicht === null || gewicht <= 0) return null
  return Number((gewicht * (1 + reps / 30)).toFixed(2))
}

// ── Die Aggregate ────────────────────────────────────────────────

export type SatzZahl = {
  reps: number | null
  volume_kg: number | null
  weight_kg: number | null
  estimated_1rm: number | null
}

export type Aggregat = {
  total_sets: number
  total_reps: number
  total_volume_kg: number
  max_weight_kg: number | null
  best_estimated_1rm: number | null
}

/**
 * Aggregate aus den Saetzen — **gerechnet, nie fortgeschrieben.**
 *
 * `[cmd]` **Der Grund steht im Bestand:** von 36 Seed-Sitzungen mit
 * Saetzen stimmt `total_sets` nur bei **14** mit der tatsaechlichen
 * Zahl ueberein, `total_reps` ebenfalls bei 14 (gemessen
 * 2026-08-28). **Eine Sitzung fuehrt 6, hat aber 7.**
 *
 * `[read]` **Ein fortgeschriebener Zaehler driftet, sobald ein
 * Schritt fehlschlaegt oder jemand einen Satz loescht.** Deshalb
 * liest die Naht nach jeder Aenderung die Saetze und rechnet neu —
 * teurer, aber nie falsch.
 */
export function aggregat(saetze: SatzZahl[]): Aggregat {
  let reps = 0
  let volumen = 0
  let maxGewicht: number | null = null
  let bestes1RM: number | null = null

  for (const s of saetze) {
    reps += s.reps ?? 0
    volumen += s.volume_kg ?? 0
    if (s.weight_kg !== null && (maxGewicht === null || s.weight_kg > maxGewicht)) {
      maxGewicht = s.weight_kg
    }
    if (s.estimated_1rm !== null && (bestes1RM === null || s.estimated_1rm > bestes1RM)) {
      bestes1RM = s.estimated_1rm
    }
  }
  return {
    total_sets: saetze.length,
    total_reps: reps,
    total_volume_kg: Number(volumen.toFixed(3)),
    max_weight_kg: maxGewicht,
    best_estimated_1rm: bestes1RM,
  }
}

/**
 * Dauer in Minuten aus zwei Uhrzeiten.
 *
 * `[read]` Ueber Mitternacht hinweg gaebe es einen negativen Wert;
 * `workout_sessions_duration_minutes_check` verbietet ihn. **Dann
 * lieber `null` als eine erfundene Zahl** — und die Sitzung laesst
 * sich trotzdem abschliessen.
 */
export function dauerMinuten(start: string, ende: string): number | null {
  const t = (s: string) => {
    const m = /^(\d{2}):(\d{2})/.exec(s)
    return m ? Number(m[1]) * 60 + Number(m[2]) : null
  }
  const a = t(start)
  const b = t(ende)
  if (a === null || b === null || b < a) return null
  return b - a
}

// ── Saetze der Sache nach ────────────────────────────────────────

export const OFFEN_BLEIBT =
  'Nicht abgeschlossene Trainings bleiben offen stehen. '
  + 'Sie zaehlen nicht als Leistung, gehen aber auch nicht verloren.'
