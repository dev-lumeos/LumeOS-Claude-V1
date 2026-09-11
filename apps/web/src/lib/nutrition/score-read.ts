// Der Nutrition score aus echten Zeilen — G-412/A1, G-417/A1-A3.
//
// **Tom, 2026-09-08:** *„aus meiner sicht, was ich in der ui noch
// nicht angebunden sehe: Nutrition score …"*
//
// ══ WAS DIESE DATEI NOCH TUT — UND WAS NICHT MEHR ══════════════════
//
// `[read]` **Sie LIEST.** `[read]` **Sie rechnet nicht.**
//
// `[cmd]` **Bis G-417 stand die Formel hier** — Gewichte, Deckelung,
// Stufenfaktor. `[cmd]` **Jetzt steht sie in `@lumeos/scoring`**, weil
// `SPEC_09_SCORING.md:11` genau diesen Ort nennt.
//
// `[read]` **Zwei Orte fuer eine Formel heissen zwei Formeln** —
// sobald einer nachgezogen wird und der andere nicht.
//
// ══ DIE DREI QUELLEN ═══════════════════════════════════════════════
//
// `[cmd]` **Die fuenf Anteile liegen in `nutrition.daily_summary`:**
// `prot625`, `enercc`, `cho`, `fat`, `fibt`. **181 Tage fuer
// `dev@lumeos.app`, gemessen 2026-09-10.**
//
// `[cmd]` **Die Ziele kommen aus `goals.zielwerte_am()`** ueber
// `lib/profile/zielwerte-read.ts`.
//
// `[cmd]` **Die Stufe aus `public.profiles.experience_level`** — live
// `pro` fuer `dev@lumeos.app`.
//
// ══ DAS BALLASTSTOFFZIEL: DER VERMERK WAR VERALTET ═════════════════
//
// `[cmd]` **G-412 stand hier:** *„kein Ballaststoffziel im Schema"*.
// `[cmd]` **Das stimmte damals und stimmt seit C-464 nicht mehr:**
// `goals.nutrition_targets.fiber_g` ist da, **fuenf Nutzer haben einen
// Wert, `dev@lumeos.app` 30,0 g, Herkunft `formel`.**
//
// `[cmd]` **Und `goals.zielwerte_am()` gab die Spalte schon zurueck** —
// gemessen an `pg_get_function_result`. **Der Leseweg liess sie
// fallen.**
//
// `[read]` **Ein Vermerk mit falschem Grund ist schlimmer als eine
// fehlende Kachel** — er verhindert, dass jemand nachsieht.
//
// Laeuft ausschliesslich serverseitig.
import { nutritionScore, type ScoreErgebnis } from '@lumeos/scoring'
import { createSessionClient } from '@lumeos/shared/session'

import { getZielwerteAm } from '../profile/zielwerte-read'

export type { Anteil, ScoreErgebnis } from '@lumeos/scoring'

export type ScoreStand = ScoreErgebnis & {
  datum: string
  fehler?: string
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const OHNE_WERTE = { enercc: null, prot625: null, cho: null, fat: null, fibt: null }
const OHNE_ZIELE = { kcal: null, protein_g: null, carbs_g: null, fat_g: null, fiber_g: null }

export async function getScoreAm(datum: string): Promise<ScoreStand> {
  const supabase = createSessionClient()
  const { data: sitzung } = await supabase.auth.getUser()
  const nutzer = sitzung?.user?.id
  if (!nutzer) {
    return {
      datum, ...nutritionScore(OHNE_WERTE, OHNE_ZIELE, null),
      fehler: 'keine Sitzung',
    }
  }

  const [tag, ziele, profil] = await Promise.all([
    supabase
      .schema('nutrition')
      .from('daily_summary')
      .select('enercc, prot625, cho, fat, fibt')
      .eq('user_id', nutzer)
      .eq('entry_date', datum)
      .maybeSingle(),
    getZielwerteAm(datum),
    supabase
      .from('profiles')
      .select('experience_level')
      .eq('id', nutzer)
      .maybeSingle(),
  ])

  if (tag.error) {
    return {
      datum, ...nutritionScore(OHNE_WERTE, OHNE_ZIELE, null),
      fehler: tag.error.message,
    }
  }

  const zeile = tag.data as Record<string, unknown> | null
  const stufe = (profil.data as { experience_level?: string | null } | null)
    ?.experience_level ?? null

  const ist = zeile
    ? {
      enercc: zahl(zeile.enercc), prot625: zahl(zeile.prot625),
      cho: zahl(zeile.cho), fat: zahl(zeile.fat), fibt: zahl(zeile.fibt),
    }
    : OHNE_WERTE

  return {
    datum,
    ...nutritionScore(ist, {
      kcal: ziele?.kcal ?? null,
      protein_g: ziele?.protein_g ?? null,
      carbs_g: ziele?.carbs_g ?? null,
      fat_g: ziele?.fat_g ?? null,
      // `[cmd]` **Seit C-464 vorhanden** — vorher die fuenfte Sperre.
      fiber_g: ziele?.fiber_g ?? null,
    }, stufe),
  }
}
