// Lese-I/O fuer die Kachel „Training readiness" (G-86).
//
// `[read]` **Die Kachel steht in Training, die Zahlen stehen in
// Recovery.** Der Auftrag sagt es: *„das ist Recovery.
// `recovery.scores` hat 170 Zeilen seit C-125. Pruef, ob eine
// Lesefunktion reicht."* Sie reicht — es wird nichts gerechnet, was
// C-125 nicht schon gerechnet hat.
//
// `[cmd]` **Die fuenf Zeilen des Mockups und ihre Spalten**, gemessen
// am 2026-08-20 auf `dev@lumeos.app` (170 Zeilen, alle belegt):
//
//   Recovery          <- `score`                    79,4
//   Sleep quality     <- `sleep_quality_score`      30 … 80
//   Soreness — chest  <- `soreness_score`           22,3 … 66,7
//   Nutrition         <- `nutrition_score`          70 … 70  (fest!)
//   Mood              <- `mood_score`               45 … 100
//
// `[read]` **Die `*_score`-Spalten, nicht die `*_points`.** Der Meter
// der Kachel will 0–100; `*_points` traegt je Anteil ein eigenes
// Gewicht (30, 15, 10, 5) und waere auf einem gemeinsamen Balken
// nicht vergleichbar.
//
// `[cmd]` **`nutrition_score` ist auf allen 170 Zeilen 70** — der
// Rueckfallwert aus C-123/E9, kein gemessener Wert. Er wird gezeigt
// UND als Rueckfall gekennzeichnet; die Quelle steht in
// `nutrition_source`. Dasselbe gilt fuer `hrv_score`: **auf allen 170
// Zeilen NULL**, weil alles im `manual`-Modus gerechnet ist.
//
// `[read]` **Kein Urteil.** Das Mockup schreibt neben den Ring „Good
// to go" und einen Ratschlag („consider attempting 120kg ×3"). Das
// sind die Readiness-Stufen der `SPEC_09` — Entscheidungspunkt E3,
// den Tom einzeln abnimmt. G-76 und G-82 haben sie aus Recovery
// entfernt; sie kommen hier nicht durch die Hintertuer wieder herein.
import { createSessionClient } from '@lumeos/shared/session'

/** Eine Zeile der Kachel: Name, Wert 0–100, Herkunft. */
export type ReadinessZeile = {
  code: string
  label: string
  /** 0–100, oder `null`, wenn die Spalte leer ist. */
  wert: number | null
  /**
   * Gesetzt, wenn der Wert NICHT gemessen ist — dann nennt die
   * Anzeige ihn und den Grund, statt ihn als Messung auszugeben.
   */
  rueckfall: string | null
}

export type ReadinessStand = {
  entry_date: string
  /** Der Gesamtwert aus `recovery.scores.score`. */
  score: number
  zeilen: ReadinessZeile[]
  /** Welche Muskeln der Check-in als wund meldet, fuer die Beschriftung. */
  wundeMuskeln: string[]
  fehler: string | null
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

/**
 * Die juengste Bereitschaftszeile der angemeldeten Nutzerin.
 *
 * `[cmd]` Kein Service-Client — die Zeilenrechte der Tabelle greifen.
 * Gegengeprueft: `test-user@lumeos.local` sieht 0 Zeilen (G-82).
 *
 * `null` heisst „keine Zeile" und ist kein Fehler: dann bleibt die
 * Entwurfskachel mit ihrer Marke stehen.
 */
export async function ladeReadiness(): Promise<ReadinessStand | null> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return null

    const { data, error } = await client
      .schema('recovery')
      .from('scores')
      .select('entry_date,score,sleep_quality_score,soreness_score,'
        + 'nutrition_score,mood_score,nutrition_source,hrv_source')
      .order('entry_date', { ascending: false })
      .limit(1)

    if (error) {
      return {
        entry_date: '', score: 0, zeilen: [], wundeMuskeln: [],
        fehler: error.message,
      }
    }
    const r = data?.[0] as unknown as Record<string, unknown> | undefined
    if (!r) return null

    // Die wunden Muskeln fuer die Beschriftung der Soreness-Zeile.
    // `[read]` Das Mockup schreibt „Soreness — chest" hart hin; die
    // Tabelle fuehrt einen Schnitt ueber die gemeldeten Muskeln. Der
    // Name kommt deshalb aus dem Check-in desselben Tages.
    let wunde: string[] = []
    const { data: ci } = await client
      .schema('recovery')
      .from('checkins')
      .select('soreness')
      .eq('entry_date', String(r.entry_date))
      .limit(1)
    const roh = ci?.[0]?.soreness as Record<string, number> | undefined
    if (roh) {
      wunde = Object.entries(roh)
        .filter(([, v]) => Number(v) > 0)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map(([k]) => k)
    }

    const zeilen: ReadinessZeile[] = [
      {
        code: 'recovery', label: 'Recovery',
        wert: zahl(r.score), rueckfall: null,
      },
      {
        code: 'sleep', label: 'Schlafqualität',
        wert: zahl(r.sleep_quality_score), rueckfall: null,
      },
      {
        code: 'soreness',
        label: wunde.length
          ? `Muskelkater — ${wunde.join(', ')}`
          : 'Muskelkater',
        wert: zahl(r.soreness_score), rueckfall: null,
      },
      {
        code: 'nutrition', label: 'Ernährung',
        wert: zahl(r.nutrition_score),
        // `[cmd]` Auf allen 170 Zeilen `fallback_c123_e9`.
        rueckfall: (r.nutrition_source as string) ?? null,
      },
      {
        code: 'mood', label: 'Stimmung',
        wert: zahl(r.mood_score), rueckfall: null,
      },
    ]

    return {
      entry_date: String(r.entry_date),
      score: zahl(r.score) ?? 0,
      zeilen,
      wundeMuskeln: wunde,
      fehler: null,
    }
  } catch (e) {
    return {
      entry_date: '', score: 0, zeilen: [], wundeMuskeln: [],
      fehler: e instanceof Error ? e.message : String(e),
    }
  }
}
