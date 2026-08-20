// Lesepfad fuer zwei Insights-Kacheln (G-101).
//
// **NICHTS NEU GERECHNET.** `[read]` Die Kalorienbilanz kommt aus
// `goals.adaptive_tdee` — dieselbe Funktion, die das Goals-Modul liest
// (`ladeAdaptivenTdee`). Der Makroschnitt ist eine Mittelung ueber
// `daily_summary`; sie steht hier, weil sie nirgends sonst gebraucht
// wird.
//
// **NICHT GEBAUT: der Mikronaehrstoff-Trend.** `[cmd]` Gemessen am
// 2026-08-20: `daily_summary` fuehrt **28 Mikronaehrstoffe als
// Spalten** und damit je Tag einen Wert — ein Trend WAERE also
// rechenbar. Was fehlt, ist die Referenz je Tag: die persoenliche
// Empfehlung kommt aus `daily_reference_assessment`, und die rechnet
// **einen Tag auf einmal**. Ein Trend ueber 14 Tage braeuchte 14
// Aufrufe je Seitenaufruf. Das ist eine Entscheidung, keine
// Nebenwirkung — im Bericht 152 als Befund.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

export type Bilanz = {
  zufuhr: number | null
  verbrauch: number | null
  /** Zufuhr minus Verbrauch. Negativ heisst Defizit. */
  abstand: number | null
  gewicht_delta_kg: number | null
  tage: number | null
  vollstaendige_tage: number | null
  konfidenz: string | null
  belastbar: boolean
  status: string | null
  /** `[cmd]` Der Glaettungsfaktor — GO-15. Wird gezeigt, nicht verschwiegen. */
  alpha: number | null
}

export type Makroschnitt = {
  tage: number
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  /** Energieanteile in Prozent — aus den Gramm gerechnet, nicht geraten. */
  anteil_protein: number | null
  anteil_carbs: number | null
  anteil_fat: number | null
}

export type InsightsStand = {
  bilanz: Bilanz | null
  makros: Makroschnitt | null
  fehler: string | null
}

/**
 * Energieanteile aus Gramm.
 *
 * `[cmd]` 4 kcal/g fuer Protein und Kohlenhydrate, 9 fuer Fett — die
 * Atwater-Faktoren. `[read]` Die Summe der drei muss nicht 100 %
 * ergeben: Alkohol und Ballaststoffe tragen ebenfalls Energie. Deshalb
 * wird gegen die SUMME DER DREI normiert und nicht gegen `enercc` —
 * sonst faehlten Prozentpunkte, ohne dass jemand sagen koennte, wo.
 */
export function energieAnteile(p: number | null, c: number | null, f: number | null): {
  protein: number | null; carbs: number | null; fat: number | null
} {
  if (p === null || c === null || f === null) {
    return { protein: null, carbs: null, fat: null }
  }
  const kp = p * 4, kc = c * 4, kf = f * 9
  const summe = kp + kc + kf
  if (summe <= 0) return { protein: null, carbs: null, fat: null }
  return {
    protein: Math.round((kp / summe) * 1000) / 10,
    carbs: Math.round((kc / summe) * 1000) / 10,
    fat: Math.round((kf / summe) * 1000) / 10,
  }
}

export async function ladeInsights(
  stichtag: string, tage = 14,
): Promise<InsightsStand> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { bilanz: null, makros: null, fehler: null }

    const von = new Date(`${stichtag}T00:00:00Z`)
    von.setUTCDate(von.getUTCDate() - (tage - 1))
    const vonIso = von.toISOString().slice(0, 10)

    const [tdeeR, summenR] = await Promise.allSettled([
      client.schema('goals').rpc('adaptive_tdee', {
        p_user_id: user.id, p_stichtag: stichtag, p_window_days: tage,
      }),
      client.schema('nutrition').from('daily_summary')
        .select('entry_date, enercc, prot625, cho, fat')
        .gte('entry_date', vonIso).lte('entry_date', stichtag),
    ])

    const stand: InsightsStand = { bilanz: null, makros: null, fehler: null }

    if (tdeeR.status === 'fulfilled' && !tdeeR.value.error) {
      const r = (Array.isArray(tdeeR.value.data) ? tdeeR.value.data[0] : null) as
        Record<string, unknown> | null
      if (r) {
        const zufuhr = zahl(r.avg_intake_kcal)
        const verbrauch = zahl(r.adaptive_tdee_kcal)
        stand.bilanz = {
          zufuhr,
          verbrauch,
          abstand: zufuhr !== null && verbrauch !== null
            ? Math.round((zufuhr - verbrauch) * 10) / 10
            : null,
          gewicht_delta_kg: zahl(r.weight_delta_kg),
          tage: zahl(r.window_days),
          vollstaendige_tage: zahl(r.complete_intake_days),
          konfidenz: text(r.confidence),
          belastbar: r.reliable === true,
          status: text(r.status),
          alpha: zahl(r.alpha),
        }
      }
    } else if (tdeeR.status === 'fulfilled' && tdeeR.value.error) {
      stand.fehler = tdeeR.value.error.message
    }

    if (summenR.status === 'fulfilled' && !summenR.value.error) {
      const zeilen = (summenR.value.data ?? []) as unknown as Array<Record<string, unknown>>
      const mittel = (feld: string): number | null => {
        const werte = zeilen.map(z => zahl(z[feld])).filter((n): n is number => n !== null)
        if (werte.length === 0) return null
        return Math.round((werte.reduce((s, n) => s + n, 0) / werte.length) * 10) / 10
      }
      const p = mittel('prot625'), c = mittel('cho'), f = mittel('fat')
      const anteile = energieAnteile(p, c, f)
      stand.makros = {
        tage: zeilen.length,
        kcal: mittel('enercc'),
        protein_g: p, carbs_g: c, fat_g: f,
        anteil_protein: anteile.protein,
        anteil_carbs: anteile.carbs,
        anteil_fat: anteile.fat,
      }
    }

    return stand
  } catch (e) {
    return { bilanz: null, makros: null, fehler: e instanceof Error ? e.message : String(e) }
  }
}
