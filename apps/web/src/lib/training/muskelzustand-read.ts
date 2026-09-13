// G-440 - der Leseweg zum gerechneten Muskelzustand.
//
// `[cmd]` **Getrennt von `muskelzustand.ts`**, weil die Rechnung
// ueber die `'use client'`-Grenze muss und dieser Weg
// `next/headers` mitzieht (die Lehre aus G-430: ein Wert-Import von
// hier wirft HTTP 500 auf JEDER Route, waehrend `tsc` gruen bleibt).
import { createSessionClient } from '@lumeos/shared/session'

import {
  muskelzustaende, deckungsbericht,
  type Muskelzustand, type RohSatz, type RohUebung,
  type RohSitzung, type RohZuordnung,
} from './muskelzustand'

export type MuskelzustandStand = {
  /** Je `muscle_group_id` der gerechnete Zustand. */
  zustaende: Record<string, Muskelzustand>
  deckung: ReturnType<typeof deckungsbericht>
  /** `null`, wenn gelesen wurde; sonst der Grund. */
  fehler: string | null
}

const LEER: MuskelzustandStand = {
  zustaende: {},
  deckung: { gemessen: 0, gesamt: 0, ohneDaten: 0, rollenUngewichtet: true },
  fehler: null,
}

/**
 * Alle Zeilen holen — `PostgREST` deckelt bei 1.000.
 *
 * `[cmd]` **`exercise_muscles` hat 6.588 Zeilen.** `[read]` **Ohne
 * Blaettern laege die Messung bei 1.000 und niemand saehe es** (die
 * Lehre `postgrest-deckelt-bei-1000`).
 *
 * `[read]` **Die Seiten gleichzeitig holen, nicht nacheinander** —
 * ein `await` je Seite kostet die volle Rundreise (die Lehre
 * `offset-blaettern-kostet-je-seite-voll`).
 */
async function alleZeilen<T>(
  hole: (von: number, bis: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const erste = await hole(0, 999)
  if (erste.error) throw erste.error
  const daten = erste.data ?? []
  if (daten.length < 1000) return daten

  // Ab hier blattweise weiter — die Gesamtzahl kennen wir nicht,
  // also in Bloecken zu vier Seiten gleichzeitig.
  const aus = [...daten]
  for (let block = 1; ; block += 4) {
    const seiten = await Promise.all([0, 1, 2, 3].map(i => {
      const von = (block + i) * 1000
      return hole(von, von + 999)
    }))
    let letzteVoll = false
    for (const s of seiten) {
      if (s.error) throw s.error
      const d = s.data ?? []
      aus.push(...d)
      letzteVoll = d.length === 1000
    }
    if (!letzteVoll) return aus
  }
}

/**
 * Den Trainingszustand je Muskel lesen und rechnen.
 *
 * `[read]` **Die RLS entscheidet, wessen Sitzungen kommen** — der
 * Weg filtert nicht selbst nach Nutzer. `[cmd]` **Gemessen
 * 2026-09-13: drei Konten haben Sitzungen** (30 / 30 / 6), und
 * jedes sieht nur seine eigenen.
 */
export async function ladeMuskelzustand(
  muskelnGesamt: number, jetzt: Date = new Date(),
): Promise<MuskelzustandStand> {
  try {
    const s = createSessionClient()
    const t = s.schema('training')

    const [saetze, uebungen, sitzungen, zuordnungen] = await Promise.all([
      alleZeilen<RohSatz>((von, bis) =>
        t.from('workout_sets').select('workout_exercise_id').range(von, bis)),
      alleZeilen<RohUebung>((von, bis) =>
        t.from('workout_exercises')
          .select('id,exercise_id,workout_session_id').range(von, bis)),
      alleZeilen<RohSitzung>((von, bis) =>
        t.from('workout_sessions')
          .select('id,session_date,name').range(von, bis)),
      alleZeilen<RohZuordnung>((von, bis) =>
        t.from('exercise_muscles')
          .select('exercise_id,muscle_group_id,role').range(von, bis)),
    ])

    const zustaende = muskelzustaende(
      saetze, uebungen, sitzungen, zuordnungen, jetzt)
    return {
      zustaende,
      deckung: deckungsbericht(zustaende, muskelnGesamt),
      fehler: null,
    }
  } catch (e) {
    return { ...LEER, fehler: e instanceof Error ? e.message : String(e) }
  }
}
