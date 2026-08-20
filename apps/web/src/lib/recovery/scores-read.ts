// Lese-I/O fuer `recovery.scores` und `recovery.modality_log` (G-82).
//
// `[read]` **Warum die Anzeige aus der Tabelle liest, statt zu rechnen:**
// Die Tabelle traegt den Schnappschuss mit allen Einzeltermen — damit
// ist nachvollziehbar, woraus die Zahl entstand. Eine Browserrechnung
// ist bei jedem Neuladen eine neue, und 170 Tage Verlauf lassen sich
// im Browser ohnehin nicht rechnen.
//
// `[cmd]` **Die zwei Rechnungen stimmten NICHT ueberein** — gemessen
// ueber fuenf Tage, Abweichung zwischen −7,0 und +2,6. Der Grund steht
// im Bericht: `score.ts` laesst Trainingslast und Nutrition weg, die
// Tabelle fuellt sie mit Rueckfallwerten. **Die Tabelle ist die
// bessere Zahl**, weil sie die gemessene Trainingslast benutzt, wo es
// eine gibt (118 von 170 Tagen).
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

/** Ein Anteil, so wie ihn die Tabelle fuehrt. */
export type ScoreAnteil = {
  code: string
  label: string
  /** Das Gewicht — die Obergrenze dieses Anteils. */
  gewicht: number
  /** Erreichte Punkte. */
  punkte: number
  /** Woher der Wert stammt, wo die Tabelle es sagt. */
  quelle: string | null
}

export type ScoreZeile = {
  entry_date: string
  mode: string
  score: number
  algorithm_version: string
  anteile: ScoreAnteil[]
  modality_bonus: number
  /** Die Rohwerte, die die Anzeige nennen kann. */
  sleep_hours_used: number | null
  soreness_avg_used: number | null
  soreness_reported_count: number | null
  acwr_used: number | null
  nutrition_source: string | null
  hrv_source: string | null
  modality_bonus_source: string | null
  /** Was die Rechnung ersetzen musste. */
  fallbacks: Record<string, unknown>
}

/**
 * Die Gewichte — **aus der Tabelle abgelesen, nicht neu gesetzt.**
 *
 * `[cmd]` Der stabile Kern 30/15/15/10/15/10/5, in `recovery.scores`
 * als `*_points` je Anteil. Hier stehen sie nur, damit die Anzeige den
 * Balken auf die richtige Obergrenze ziehen kann.
 */
const GEWICHT: Record<string, number> = {
  sleep_quality: 30,
  sleep_duration: 15,
  subjective_feeling: 15,
  soreness: 10,
  training_load: 15,
  nutrition: 10,
  mood: 5,
}

const LABEL: Record<string, string> = {
  sleep_quality: 'Schlafqualität',
  sleep_duration: 'Schlafdauer',
  subjective_feeling: 'Gefühl',
  soreness: 'Muskelkater',
  training_load: 'Trainingslast',
  nutrition: 'Ernährung',
  mood: 'Stimmung',
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function baueZeile(r: Record<string, unknown>): ScoreZeile {
  const anteile: ScoreAnteil[] = Object.keys(GEWICHT).map(code => ({
    code,
    label: LABEL[code],
    gewicht: GEWICHT[code],
    punkte: zahl(r[`${code}_points`]) ?? 0,
    quelle: code === 'nutrition' ? (r.nutrition_source as string) ?? null
      : code === 'training_load'
        ? (zahl(r.acwr_used) != null ? `ACWR ${zahl(r.acwr_used)?.toFixed(2)}` : null)
        : null,
  }))

  return {
    entry_date: String(r.entry_date),
    mode: String(r.mode ?? 'manual'),
    score: zahl(r.score) ?? 0,
    algorithm_version: String(r.algorithm_version ?? ''),
    anteile,
    modality_bonus: zahl(r.modality_bonus) ?? 0,
    sleep_hours_used: zahl(r.sleep_hours_used),
    soreness_avg_used: zahl(r.soreness_avg_used),
    soreness_reported_count: zahl(r.soreness_reported_count),
    acwr_used: zahl(r.acwr_used),
    nutrition_source: (r.nutrition_source as string) ?? null,
    hrv_source: (r.hrv_source as string) ?? null,
    modality_bonus_source: (r.modality_bonus_source as string) ?? null,
    fallbacks: (r.fallbacks as Record<string, unknown>) ?? {},
  }
}

const SPALTEN = [
  'entry_date', 'mode', 'score', 'algorithm_version',
  'sleep_quality_points', 'sleep_duration_points', 'subjective_feeling_points',
  'soreness_points', 'training_load_points', 'nutrition_points', 'mood_points',
  'modality_bonus', 'sleep_hours_used', 'soreness_avg_used',
  'soreness_reported_count', 'acwr_used', 'nutrition_source', 'hrv_source',
  'modality_bonus_source', 'fallbacks',
].join(',')

export type ScoreStand = {
  /** Die juengste Zeile, oder `null`. */
  neuster: ScoreZeile | null
  /** Der Verlauf, aelteste zuerst — fuer die Kurve. */
  verlauf: Array<{ entry_date: string; score: number }>
  gesamt: number
  fehler: string | null
}

/**
 * Die Scores der angemeldeten Nutzerin.
 *
 * `[cmd]` Kein Service-Client — die Zeilenrechte der Tabelle greifen.
 */
export async function ladeScores(grenze = 180): Promise<ScoreStand> {
  const leer: ScoreStand = { neuster: null, verlauf: [], gesamt: 0, fehler: null }
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return leer

    const { data, error, count } = await client
      .schema('recovery')
      .from('scores')
      .select(SPALTEN, { count: 'exact' })
      .order('entry_date', { ascending: false })
      .limit(grenze)

    // Ein Fehler darf nicht als „keine Scores" durchgehen.
    if (error) return { ...leer, fehler: error.message }

    const zeilen = (data ?? []).map(r => baueZeile(r as unknown as Record<string, unknown>))
    return {
      neuster: zeilen[0] ?? null,
      // Fuer die Kurve aufsteigend, wie man sie liest.
      verlauf: zeilen.slice().reverse()
        .map(z => ({ entry_date: z.entry_date, score: z.score })),
      gesamt: count ?? zeilen.length,
      fehler: null,
    }
  } catch (e) {
    return { ...leer, fehler: e instanceof Error ? e.message : String(e) }
  }
}

// ── Modalitäten ────────────────────────────────────────────────

export type Modalitaet = {
  entry_date: string
  logged_time: string | null
  modality_type: string
  duration_min: number | null
  detail: string | null
  immediate_effect: number | null
  next_day_effect: number | null
  bonus_value: number
  bonus_source: string | null
  /**
   * Der GEMESSENE Unterschied am Folgetag (C-153).
   *
   * `[read]` **Nicht zu verwechseln mit `next_day_effect`:** das ist
   * die Selbsteinschaetzung 1–10 („wie ging es dir tags darauf"),
   * dies hier die Differenz der beiden Erholungswerte. **Die eine ist
   * ein Gefuehl, die andere eine Rechnung.**
   */
  next_day_score_delta: number | null
}

export type ModalitaetenStand = {
  /** Die Eintraege des juengsten Tages mit Modalitaeten. */
  heute: Modalitaet[]
  /** Alle geladenen, juengste zuerst. */
  zeilen: Modalitaet[]
  gesamt: number
  /**
   * Wie oft je Art, mit Dauer und dem GEMESSENEN Folgetagsunterschied.
   *
   * `[cmd]` G-123: `deltaSchnitt` kommt aus `next_day_score_delta`
   * (C-153) — auf `dev` etwa Sauna **+2,76**, Eisbad **−0,07**.
   */
  jeArt: Array<{
    art: string; anzahl: number; minutenSchnitt: number | null
    deltaSchnitt: number | null; mitDelta: number
  }>
  fehler: string | null
}

const MOD_SPALTEN = [
  'entry_date', 'logged_time', 'modality_type', 'duration_min', 'detail',
  'immediate_effect', 'next_day_effect', 'bonus_value', 'bonus_source',
  // G-123: seit C-153 gefuellt (89 von 89 auf `dev`).
  'next_day_score_delta',
].join(',')

/**
 * Die Modalitaeten der angemeldeten Nutzerin.
 *
 * `[cmd]` 89 Zeilen auf `dev@lumeos.app`, vier Arten: `stretching` 42,
 * `sauna` 19, `cold_plunge` 15, `massage` 13.
 *
 * `[read]` **`bonus_value` ist auf allen 89 gleich 0**, mit
 * `bonus_source = 'pending_c124_e5'`. Das ist kein Fehler, sondern der
 * Stand: die Bonuswerte je Art sind Entscheidungspunkt E5 und warten
 * auf C-124. **Die Anzeige zeigt die 0 und sagt, worauf sie wartet** —
 * einen Wert zu erfinden waere schlimmer.
 */
export async function ladeModalitaeten(grenze = 120): Promise<ModalitaetenStand> {
  const leer: ModalitaetenStand = {
    heute: [], zeilen: [], gesamt: 0, jeArt: [], fehler: null,
  }
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return leer

    const { data, error, count } = await client
      .schema('recovery')
      .from('modality_log')
      .select(MOD_SPALTEN, { count: 'exact' })
      .order('entry_date', { ascending: false })
      .order('logged_time', { ascending: true })
      .limit(grenze)

    if (error) return { ...leer, fehler: error.message }

    const zeilen: Modalitaet[] = (data ?? []).map(r => {
      const roh = r as unknown as Record<string, unknown>
      return {
        entry_date: String(roh.entry_date),
        logged_time: (roh.logged_time as string) ?? null,
        modality_type: String(roh.modality_type),
        duration_min: zahl(roh.duration_min),
        detail: (roh.detail as string) ?? null,
        immediate_effect: zahl(roh.immediate_effect),
        next_day_effect: zahl(roh.next_day_effect),
        bonus_value: zahl(roh.bonus_value) ?? 0,
        bonus_source: (roh.bonus_source as string) ?? null,
        next_day_score_delta: zahl(roh.next_day_score_delta),
      }
    })

    const juengster = zeilen[0]?.entry_date ?? null
    const zaehler = new Map<string, {
      n: number; min: number; mitMin: number; delta: number; mitDelta: number
    }>()
    for (const z of zeilen) {
      const e = zaehler.get(z.modality_type)
        ?? { n: 0, min: 0, mitMin: 0, delta: 0, mitDelta: 0 }
      e.n += 1
      if (z.duration_min != null) { e.min += z.duration_min; e.mitMin += 1 }
      // `[read]` Nur die gefuellten mitteln — eine fehlende Messung ist
      // keine Null, sondern eine fehlende Messung.
      if (z.next_day_score_delta != null) {
        e.delta += z.next_day_score_delta
        e.mitDelta += 1
      }
      zaehler.set(z.modality_type, e)
    }

    return {
      heute: juengster ? zeilen.filter(z => z.entry_date === juengster) : [],
      zeilen,
      gesamt: count ?? zeilen.length,
      jeArt: Array.from(zaehler.entries())
        .map(([art, e]) => ({
          art,
          anzahl: e.n,
          minutenSchnitt: e.mitMin > 0 ? Math.round(e.min / e.mitMin) : null,
          deltaSchnitt: e.mitDelta > 0
            ? Math.round((e.delta / e.mitDelta) * 100) / 100
            : null,
          mitDelta: e.mitDelta,
        }))
        .sort((a, b) => b.anzahl - a.anzahl),
      fehler: null,
    }
  } catch (e) {
    return { ...leer, fehler: e instanceof Error ? e.message : String(e) }
  }
}
