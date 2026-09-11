// Der Mikronaehrstoff-Verlauf — G-412/A6.
//
// **Tom, 2026-09-08:** *„Micronutrient trend — anbinden. … Miss, ob
// der Anteil je Tag rechenbar ist oder zu teuer wird."*
//
// ══ GEMESSEN, BEVOR HIER ETWAS STAND ═══════════════════════════════
//
// `[cmd]` **`nutrition.micronutrient_snapshot(user, datum)` liefert
// acht Zeilen je Tag** — dieselbe Funktion, die die Schnappschuss-
// Kachel fuellt.
//
// `[cmd]` **Kosten fuer 30 Tage, `explain analyze` am 2026-09-10:**
//
//     Execution Time: 645 ms   (240 Zeilen, ein Aufruf)
//
// `[read]` **Also EIN Aufruf ueber `generate_series`, nicht dreissig.**
// `[cmd]` **Dreissig Einzelaufrufe waeren dieselbe Arbeit plus
// dreissig Rundreisen** — die Lehre aus dem OFFSET-Blaettern.
//
// `[read]` **645 ms sind spuerbar** — deshalb nur fuer den
// Insights-Reiter geladen, den jemand absichtlich oeffnet, nicht fuer
// das Tagebuch.
//
// ══ UND DIE VORLAGE ════════════════════════════════════════════════
//
// `[cmd]` **`module-nutrition.jsx:399` (`NutrientHeatmap`) fuellt die
// Zellen mit `Math.random()`.** `[read]` **Hier nicht** — wo ein Tag
// keinen Anteil hergibt, bleibt die Zelle leer und sagt es.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

export type TrendZelle = {
  datum: string
  /** Anteil an der Referenz, 0 bis 1+. `null` = nicht ermittelbar. */
  anteil: number | null
}

export type TrendReihe = {
  code: string
  label: string
  zellen: TrendZelle[]
}

export type MikroTrendStand = {
  von: string
  bis: string
  tage: string[]
  reihen: TrendReihe[]
  fehler?: string
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Acht Naehrstoffe ueber `tage` Tage bis `stichtag`.
 *
 * `[read]` **Beidseitig begrenzt** — ohne Untergrenze zoege die
 * Abfrage die ganze Vergangenheit, ohne Obergrenze auch die Zukunft
 * (Seed-Daten reichen dorthin).
 */
export async function ladeMikroTrend(
  stichtag: string, tage = 30,
): Promise<MikroTrendStand> {
  const bis = stichtag
  const vonD = new Date(`${stichtag}T00:00:00Z`)
  vonD.setUTCDate(vonD.getUTCDate() - (tage - 1))
  const von = vonD.toISOString().slice(0, 10)

  const leer: MikroTrendStand = { von, bis, tage: [], reihen: [] }

  const supabase = createSessionClient()
  const { data: sitzung } = await supabase.auth.getUser()
  const nutzer = sitzung?.user?.id
  if (!nutzer) return { ...leer, fehler: 'keine Sitzung' }

  // ══ WARUM DREISSIG AUFRUFE UND NICHT EINER ══════════════════
  //
  // `[cmd]` **In SQL ginge es in einem:**
  // `select (micronutrient_snapshot(u, d)).* from generate_series(...)`
  // — **gemessen 645 ms fuer 240 Zeilen.**
  //
  // `[cmd]` **Ein Client kann das nicht stellen** — er ruft
  // Funktionen ueber RPC, und eine `micronutrient_trend(von, bis)`
  // gibt es nicht (gemessen in `information_schema.routines`).
  //
  // `[read]` **Sie anzulegen hiesse `supabase/` anzufassen** — das
  // gehoert Codex (C-463), und dieser Auftrag verbietet es
  // ausdruecklich.
  //
  // `[cmd]` **Also dreissig Aufrufe GLEICHZEITIG, nicht nacheinander**
  // — `Promise.all`, eine Rundreise-Wartezeit statt dreissig (die
  // Lehre aus dem OFFSET-Blaettern).
  //
  // `[read]` **Als Folgearbeit vermerkt:** eine
  // `micronutrient_trend`-Funktion machte daraus einen Aufruf.
  const tageListeRoh: string[] = []
  for (let i = 0; i < tage; i++) {
    const d = new Date(`${von}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + i)
    tageListeRoh.push(d.toISOString().slice(0, 10))
  }

  const antworten = await Promise.all(tageListeRoh.map(d =>
    supabase
      .schema('nutrition')
      .rpc('micronutrient_snapshot', { p_user_id: nutzer, p_entry_date: d })
      .then(a => ({ datum: d, ...a }))))

  const ersterFehler = antworten.find(a => a.error)
  if (ersterFehler?.error) return { ...leer, fehler: ersterFehler.error.message }

  const roh: Array<Record<string, unknown>> = antworten.flatMap(a =>
    ((a.data ?? []) as unknown as Array<Record<string, unknown>>)
      .map(r => ({ ...r, entry_date: a.datum })))
  const tageListe: string[] = []
  const reihen = new Map<string, TrendReihe>()

  for (const r of roh) {
    const datum = String(r.entry_date ?? '')
    if (!datum) continue
    if (!tageListe.includes(datum)) tageListe.push(datum)
    const code = String(r.nutrient_code ?? '')
    if (!code) continue
    const pct = zahl(r.reference_pct)
    if (!reihen.has(code)) {
      reihen.set(code, {
        code,
        // `[cmd]` **`label_de`, wie `mikro-read.ts:113`** — mein erster
        // Anlauf riet `short_label`, und am Schirm standen Codes
        // (`VITC`, `F18:3CN3`) statt Namen.
        label: String(r.label_de ?? code),
        zellen: [],
      })
    }
    reihen.get(code)!.zellen.push({
      datum,
      anteil: pct === null ? null : pct / 100,
    })
  }

  tageListe.sort()
  // `[read]` **`Array.from`, nicht `for…of` ueber die Map** — das
  // tsconfig dieser App zielt unter ES2015, und die Schleife waere
  // ein Uebersetzungsfehler.
  const fertig: TrendReihe[] = Array.from(reihen.values())
  for (const reihe of fertig) {
    reihe.zellen.sort((a: TrendZelle, b: TrendZelle) =>
      a.datum.localeCompare(b.datum))
  }

  return { von, bis, tage: tageListe, reihen: fertig }
}
