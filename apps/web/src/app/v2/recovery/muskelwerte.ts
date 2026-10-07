// G-441 — die Muskelwerte, EINMAL gerechnet, fuer Today und Muscle map.
//
// `[cmd]` **G-440 hat die Muscle-map-Kachel auf `workout_sets`
// umgestellt — die Rechnung stand aber inline in ihrem `useMemo`.**
// Today rechnete daneben weiter aus `MUSCLE_STATE` (18 feste
// Mockup-Zeilen), und `muskelwerte()` in `ansicht.tsx` behauptete
// *„wie Today und Muscle map sie berechnen"* — ohne Aufrufer.
// **Zwei Kacheln, dieselbe Karte, zwei Quellen.**
//
// `[read]` **Hier steht die Rechnung aus G-440 unveraendert**, nur
// herausgezogen: beide Kacheln rufen sie, keine baut sie nach.
//
// `[read]` **Kein `'use client'`, kein I/O** — die Eingaben kommen
// geladen von der Seite; nur Typen aus dem Leseweg (A-30).
import {
  CHECKIN, MUSCLE_GROUPS_BODYMAP, NUTRITION_INPUT, calcMuscleRecovery,
} from './motor'
import { SCHLUESSEL_ZU_GRUPPE } from '../../../lib/koerper/schluessel-gruppe'
import { muskelLage, sippen } from '../../../lib/training/muskelzustand'
import type { MuskelbaumStand } from '../../../lib/koerper/muskelbaum'
import type { MuskelzustandStand } from '../../../lib/training/muskelzustand-read'

/**
 * Je Kuerzel der Karte eine Zeile — aufsteigend nach Erholung.
 *
 * @param kater      `soreness` aus dem juengsten Check-in, sonst `null`.
 * @param schlafguete `sleep_quality` aus dem juengsten Check-in, sonst `null`.
 */
export function muskelzeilen({ kater, schlafguete, muskelbaum, muskelzustand }: {
  kater: Record<string, number> | null
  schlafguete: number | null
  muskelbaum?: MuskelbaumStand
  muskelzustand?: MuskelzustandStand
}) {
  // `[cmd]` **G-445: aus der Liste wieder ein `Set`** — sie kommt als
  // Array ueber die `'use client'`-Grenze.
  const katalog = new Set(muskelzustand?.imKatalog ?? [])
  // `[cmd]` **G-446: Eltern und Kinder je Muskel** — ohne sie kann
  // `muskelLage` weder leihen noch verdichten.
  const knoten = muskelbaum?.knoten ?? []
  const sippschaft = sippen(knoten)
  const namenNachId: Record<string, string> = {}
  for (const k of knoten) namenNachId[k.id] = k.name
  const nachName = new Map(knoten.map(k => [k.name.toLowerCase(), k.id]))

  return MUSCLE_GROUPS_BODYMAP.map(slug => {
    // `[cmd]` **G-438:** `SCHLUESSEL_ZU_GRUPPE` nennt die Muskelgruppe,
    // an der die Messung haengt.
    const gruppe = SCHLUESSEL_ZU_GRUPPE[slug]
    const id = gruppe ? nachName.get(gruppe.toLowerCase()) : undefined
    const lage = id
      ? muskelLage(id, muskelzustand?.zustaende ?? {}, katalog, sippschaft[id], namenNachId)
      : { herkunft: 'nicht-im-katalog' as const, zustand: null }
    // `[read]` **Nicht im Katalog bleibt grau** — ihn kann keine Uebung
    // treffen; „erholt" waere eine Aussage ueber etwas, das nie
    // stattfinden kann (G-445).
    if (lage.herkunft === 'nicht-im-katalog') {
      return { slug, value: null as number | null, herkunft: lage.herkunft }
    }
    // `[read]` **Der Kater kommt aus dem Check-in**; ohne Check-in ist
    // er `0` — eine Angabe, kein geratener Wert.
    const k = kater?.[slug] ?? 0
    const st = lage.zustand
    // `[cmd]` **G-445: unbelastet heisst `hours` unendlich, `sets` 0**
    // — `baseRecoveryCurve` gibt ab 96 h glatt 100.
    const calc = calcMuscleRecovery({
      hours: st ? st.hours : Number.POSITIVE_INFINITY,
      sets: st ? st.sets : 0,
      sleepQuality: schlafguete ?? CHECKIN.sleep_quality,
      proteinPct: NUTRITION_INPUT.proteinPct,
      caloriePct: NUTRITION_INPUT.caloriePct,
      soreness: k,
    })
    return { slug, ...(st ?? {}), soreness: k, ...calc, herkunft: lage.herkunft }
  }).sort((a, b) => (a.value ?? 999) - (b.value ?? 999))
}

/** Kuerzel -> Wert, wie die `ErmuedungsKarte` ihn bekommt. */
export function muskelwerte(...a: Parameters<typeof muskelzeilen>): Record<string, number | null> {
  return Object.fromEntries(muskelzeilen(...a).map(r => [r.slug, r.value]))
}
