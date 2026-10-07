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
import { EBENEN } from '../../../lib/koerper/ebenen'
import { muskelLage, sippen } from '../../../lib/training/muskelzustand'
import { alsErmuedung, KARTE_ZU_RECOVERY } from './muskel-zuordnung'
import type { Ast, MuskelbaumStand } from '../../../lib/koerper/muskelbaum'
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

// ══ G-433: die KARTE folgt der LISTE ═══════════════════════════════
//
// `[cmd]` **Gemessen 2026-10-07 auf test-user:** an 2 von 31 benannten
// Kartenflaechen zeigte `Per-muscle detail` einen Wert (97 %), die
// Karte grau — `deltoids` und `tibialis`. Die Liste rechnete je Muskel
// (105 Namen, Sippe aus G-446), die Karte je Kuerzel (18, eine Gruppe
// je Kuerzel). **Tom, 2026-10-07: die Karte folgt der Liste** — kein
// Wert geht verloren.
//
// `[read]` **Eine Rechnung je Muskel**, hier: `knotenwert()`. Die Liste
// ruft sie je Knoten, die Karte je benannter Flaeche (`EBENEN`), Today
// ueber dieselbe Karte.

export type Muskeleingabe = Parameters<typeof muskelzeilen>[0]
/** Gemessen (Zahl), geliehen (Objekt) oder ohne Wert (`null`) — wie `mitWerten` es nimmt. */
export type Knotenwert = number | { wert: number; vonGruppe: string } | null

/**
 * Der Wert je Muskelknoten — die Rechnung, die bis G-433 inline in
 * `Per-muscle detail` stand, unveraendert herausgezogen.
 */
export function knotenwert(e: Muskeleingabe): (a: Pick<Ast, 'name' | 'flaeche'>) => Knotenwert {
  const knoten = e.muskelbaum?.knoten ?? []
  const katalog = new Set(e.muskelzustand?.imKatalog ?? [])
  const sippschaft = sippen(knoten)
  const namenNachId: Record<string, string> = {}
  for (const k of knoten) namenNachId[k.id] = k.name
  const nachName = new Map(knoten.map(k => [k.name.toLowerCase(), k.id]))

  return a => {
    const id = nachName.get(a.name.toLowerCase())
    // `[read]` **G-445: nie belastet ist erholt; nicht im Katalog bleibt
    // grau. G-446: die Sippe entscheidet mit** — leihen und verdichten.
    const lage = id
      ? muskelLage(id, e.muskelzustand?.zustaende ?? {}, katalog, sippschaft[id], namenNachId)
      : { herkunft: 'nicht-im-katalog' as const, zustand: null }
    if (lage.herkunft === 'nicht-im-katalog') return null
    const st = lage.zustand
    const slug = a.flaeche ? KARTE_ZU_RECOVERY[a.flaeche] : null
    const wert = calcMuscleRecovery({
      hours: st ? st.hours : Number.POSITIVE_INFINITY,
      sets: st ? st.sets : 0,
      sleepQuality: e.schlafguete ?? CHECKIN.sleep_quality,
      proteinPct: NUTRITION_INPUT.proteinPct,
      caloriePct: NUTRITION_INPUT.caloriePct,
      soreness: slug ? e.kater?.[slug] ?? 0 : 0,
    }).value
    // `[read]` **G-438: geliehen steht am Kind** — die Zeile sagt dazu, von wem.
    if (lage.herkunft === 'geliehen') return { wert, vonGruppe: lage.quelle ?? 'der Gruppe' }
    return wert
  }
}

/**
 * Was die `ErmuedungsKarte` bekommt — Today und Muscle map.
 *
 * `[read]` **Benannte Flaeche (`EBENEN`): der Wert ihres Muskels aus
 * `knotenwert`** — derselbe, der in der Liste steht. **Unbenannte
 * Flaeche** (`flanke`, `nacken`, … — die Liste hat keine Zeile dafuer):
 * der Kuerzelwert wie bisher; dort kann die Liste nicht widersprechen.
 */
export function kartendaten(e: Muskeleingabe): Array<{ id: string; fatigue: number }> {
  const wertVon = knotenwert(e)
  const raus: Array<{ id: string; fatigue: number }> = []
  const benannt = new Set<string>()
  for (const [code, eb] of Object.entries(EBENEN)) {
    if (!eb.name) continue
    benannt.add(code)
    const w = wertVon({ name: eb.name, flaeche: code })
    const zahl = typeof w === 'number' ? w : w?.wert ?? null
    if (zahl !== null) raus.push({ id: code, fatigue: 100 - zahl })
  }
  const nachKuerzel = Object.fromEntries(muskelzeilen(e).map(r => [r.slug, r.value]))
  for (const d of alsErmuedung(nachKuerzel)) if (!benannt.has(d.id)) raus.push(d)
  return raus
}
