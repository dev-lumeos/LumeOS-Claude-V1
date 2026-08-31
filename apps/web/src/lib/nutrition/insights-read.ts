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
import type {
  TrendTag, MakroKnoten, Flag,
} from './insights-lage'

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
  /**
   * G-291/G-295: die Tagesreihe des Fensters, beidseitig begrenzt.
   *
   * `[cmd]` **Gemessen am 2026-08-31: `daily_summary` traegt 77
   * KUENFTIGE Tage** (bis 2026-11-16) — die Seeds reichen bewusst
   * nach vorn. `[read]` **Ohne obere Grenze zeichnete der Trend
   * morgen mit.** Die Abfrage unten hat sie seit jeher; hier steht
   * sie, damit es niemand herausnimmt.
   */
  reihe: TrendTag[]
  /** G-293: die Makros mit ihren Untergliedern. */
  makroBaum: MakroKnoten[]
  /** G-292: die Warnungen des Fensters. */
  flags: Flag[]
  /** Das Kalorienziel — ohne es gibt es keine Deckung (G-295). */
  zielKcal: number | null
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

// ══ G-293: der Makrobaum ═══════════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-31 ueber 30 Tage:** `FAT` 65,40 g,
// darunter `FASAT` 14,07 · `FAMS` 29,95 · `FAPU` 11,29; unter
// `FAPU` dann `FAPUN3` 4,44 und `FAPUN6` 6,84.
//
// `[read]` **Die Teile ergeben nicht das Ganze** — 55,31 gegen
// 65,40. Der BLS fuehrt weitere Fettbestandteile. **Die Differenz
// wird gezeigt, nicht verschwiegen** (`restVon` in `insights-lage`).
//
// `[cmd]` **Gemessen am 2026-08-31: `daily_nutrient_summary_long`
// fuehrt `nutrient_name_de` und `nutrient_unit` selbst.** `[read]`
// **Deshalb steht hier nur die Auswahl, keine Namenstabelle** — eine
// zweite Liste neben der Datenbank veraltet, sobald jemand einen
// Namen in `nutrient_defs` aendert, und niemand merkt es.
const MAKRO_CODES = [
  'PROT625', 'CHO', 'SUGAR', 'STARCH', 'POLYL', 'FIBT',
  'FAT', 'FASAT', 'FAMS', 'FAPU', 'FAPUN3', 'FAPUN6',
] as const

/** Der leere Stand — eine Stelle, damit kein Feld vergessen wird. */
const LEER: InsightsStand = {
  bilanz: null, makros: null, fehler: null,
  reihe: [], makroBaum: [], flags: [], zielKcal: null,
}

export async function ladeInsights(
  stichtag: string, tage = 14,
): Promise<InsightsStand> {
  try {
    const client = createSessionClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return LEER

    const von = new Date(`${stichtag}T00:00:00Z`)
    von.setUTCDate(von.getUTCDate() - (tage - 1))
    const vonIso = von.toISOString().slice(0, 10)

    // `[read]` **Beide Grenzen, immer.** `[cmd]` `daily_summary`
    // traegt 77 kuenftige Tage — ohne `lte` zeichnete der Trend
    // morgen mit (gemessen 2026-08-31: 55 Zeilen statt 7).
    const [tdeeR, summenR, baumR, flagsR, zielR] = await Promise.allSettled([
      client.schema('goals').rpc('adaptive_tdee', {
        p_user_id: user.id, p_stichtag: stichtag, p_window_days: tage,
      }),
      client.schema('nutrition').from('daily_summary')
        .select('entry_date, enercc, prot625, cho, fat')
        .gte('entry_date', vonIso).lte('entry_date', stichtag),
      // G-293: die Makros mit ihren Untergliedern.
      client.schema('nutrition').from('daily_nutrient_summary_long')
        .select('nutrient_code, nutrient_name_de, nutrient_unit, total_value, value_complete')
        .eq('user_id', user.id)
        .gte('entry_date', vonIso).lte('entry_date', stichtag)
        .in('nutrient_code', [...MAKRO_CODES]),
      // G-292: die Warnungen des Fensters.
      client.schema('nutrition').rpc('reference_assessment_window_flags', {
        p_user_id: user.id, p_end_date: stichtag, p_days: tage,
      }),
      // G-295: ohne Ziel keine Deckung.
      client.schema('goals').from('nutrition_targets')
        .select('kcal, gueltig_ab')
        .eq('user_id', user.id)
        .lte('gueltig_ab', stichtag)
        .order('gueltig_ab', { ascending: false })
        .limit(1),
    ])

    const stand: InsightsStand = { ...LEER }

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
      // G-291/G-295: die Tagesreihe selbst — nicht nur ihr Mittel.
      stand.reihe = zeilen
        .map(z => ({
          datum: String(z.entry_date ?? ''),
          kcal: zahl(z.enercc),
          protein: zahl(z.prot625),
          carbs: zahl(z.cho),
          fett: zahl(z.fat),
        }))
        .filter(r => r.datum !== '')
        .sort((a, b) => a.datum.localeCompare(b.datum))
      stand.makros = {
        tage: zeilen.length,
        kcal: mittel('enercc'),
        protein_g: p, carbs_g: c, fat_g: f,
        anteil_protein: anteile.protein,
        anteil_carbs: anteile.carbs,
        anteil_fat: anteile.fat,
      }
    }

    // ── G-293: der Makrobaum ──────────────────────────────────
    if (baumR.status === 'fulfilled' && !baumR.value.error) {
      const roh = (baumR.value.data ?? []) as unknown as Array<Record<string, unknown>>
      /** Summe und Vollstaendigkeit je Code. */
      const je = new Map<string, {
        summe: number; n: number; ganz: number; name: string; einheit: string
      }>()
      for (const z of roh) {
        const code = String(z.nutrient_code ?? '')
        const wert = zahl(z.total_value)
        if (!code) continue
        const e = je.get(code) ?? {
          summe: 0, n: 0, ganz: 0,
          name: String(z.nutrient_name_de ?? code),
          einheit: String(z.nutrient_unit ?? ''),
        }
        if (wert !== null) e.summe += wert
        e.n += 1
        if (z.value_complete === true) e.ganz += 1
        je.set(code, e)
      }
      const knoten = (code: string, kinder: MakroKnoten[] = []): MakroKnoten => {
        const e = je.get(code)
        const name = e?.name ?? code
        const einheit = e?.einheit ?? ''
        return {
          code, name, einheit, kinder,
          // `[read]` Der SCHNITT je Tag, nicht die Summe — sonst
          // haengt die Zahl an der Fensterlaenge.
          wert: e && e.n > 0 ? Math.round((e.summe / e.n) * 100) / 100 : null,
          vollstaendig: e?.ganz ?? 0,
          tage: e?.n ?? 0,
        }
      }
      // `[cmd]` **Gemessen am 2026-08-31, 30 Tage:** Zucker 44,45 +
      // Staerke 234,54 + Zuckeralkohole 2,36 = **281,36 gegen CHO
      // 281,86** — Rest 0,50 g.
      //
      // `[read]` **`FIBT` steht NEBEN `CHO`, nicht darunter.** `CHO`
      // ist *Kohlenhydrate, VERFUEGBAR* — Ballaststoffe sind darin
      // nicht enthalten. **Als Kind gerechnet ergaeben die Teile
      // 320,78 gegen 281,86**, also mehr als das Ganze, und die
      // Differenz waere negativ.
      stand.makroBaum = [
        knoten('PROT625'),
        knoten('CHO', [knoten('SUGAR'), knoten('STARCH'), knoten('POLYL')]),
        knoten('FIBT'),
        knoten('FAT', [
          knoten('FASAT'),
          knoten('FAMS'),
          knoten('FAPU', [knoten('FAPUN3'), knoten('FAPUN6')]),
        ]),
      ]
    }

    // ── G-292: die Warnungen ──────────────────────────────────
    if (flagsR.status === 'fulfilled' && !flagsR.value.error) {
      const roh = (flagsR.value.data ?? []) as unknown as Array<Record<string, unknown>>
      stand.flags = roh.map(z => ({
        code: String(z.nutrient_code ?? ''),
        name: String(z.nutrient_name_de ?? z.nutrient_code ?? ''),
        richtung: String(z.reference_direction ?? ''),
        getroffen: zahl(z.triggered_day_count) ?? 0,
        bewertet: zahl(z.assessed_day_count) ?? 0,
        unvollstaendig: zahl(z.incomplete_day_count) ?? 0,
      })).filter(f => f.code !== '')
    }

    // ── G-295: das Kalorienziel ───────────────────────────────
    if (zielR.status === 'fulfilled' && !zielR.value.error) {
      const z = (Array.isArray(zielR.value.data) ? zielR.value.data[0] : null) as
        Record<string, unknown> | null
      stand.zielKcal = z ? zahl(z.kcal) : null
    }

    return stand
  } catch (e) {
    return { ...LEER, fehler: e instanceof Error ? e.message : String(e) }
  }
}
