// Der Nutrition score aus echten Zeilen — G-412/A1.
//
// **Tom, 2026-09-08:** *„aus meiner sicht, was ich in der ui noch
// nicht angebunden sehe: Nutrition score …"*
//
// ══ WAS GEMESSEN WURDE, BEVOR HIER ETWAS STAND ═════════════════════
//
// `[cmd]` **Die fuenf Anteile der Formel liegen in
// `nutrition.daily_summary`:** `prot625`, `enercc`, `cho`, `fat`,
// `fibt`. **181 Tage fuer `dev@lumeos.app`, gemessen 2026-09-10.**
//
// `[cmd]` **Die Ziele liegen in `lib/profile/zielwerte-read.ts`** —
// `kcal`, `protein_g`, `carbs_g`, `fat_g`.
//
// `[cmd]` **EIN ZIEL FEHLT: Ballaststoffe.** `[cmd]` **Gemessen
// ueber alle Schemata nach `fib`:** `daily_summary.fibt`,
// `foods_custom.fibt`, `meal_items.fibt` — **alles Zufuhr, kein
// Ziel.**
//
// `[read]` **Deshalb rechnet dieser Weg VIER Anteile und meldet den
// fuenften als offen** — eine geratene Ballaststoffgrenze waere eine
// Aussage ueber den Nutzer, die niemand getroffen hat.
//
// ══ UND DIE ERFAHRUNGSSTUFE ════════════════════════════════════════
//
// `[cmd]` **`public.profiles.experience_level` traegt sie** — live
// `pro` fuer `dev@lumeos.app`.
//
// `[cmd]` **Fuer `pro` ist kein Faktor entschieden (G-228).**
// `[read]` **Die Kachel zeigt dann den Grund statt einer Zahl** —
// die Entscheidung dazu steht in `diary-entwurf.tsx` und wird hier
// nur benutzt, nicht neu getroffen.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { getZielwerteAm } from '../profile/zielwerte-read'

/** Ein Anteil der Formel: Ist gegen Ziel, oder offen mit Grund. */
export type Anteil = {
  code: 'protein' | 'calorie' | 'carbs' | 'fat' | 'fiber'
  label: string
  gewicht: number
  /** Ist-Wert des Tages. `null`, wenn der Tag keine Zeile hat. */
  ist: number | null
  /** Ziel. `null`, wenn keines hinterlegt ist. */
  ziel: number | null
  /** `ist / ziel`, gedeckelt bei 1. `null`, wenn eines von beiden fehlt. */
  deckung: number | null
  /** Warum kein Wert — nur gesetzt, wenn `deckung === null`. */
  grund?: string
}

export type ScoreStand = {
  datum: string
  anteile: Anteil[]
  /** Die Stufe aus dem Profil. `null`, wenn keine hinterlegt ist. */
  stufe: string | null
  /** Summe der Gewichte, die wirklich gerechnet werden konnten. */
  gewichtGerechnet: number
  fehler?: string
}

/** Die fuenf Anteile, Gewichte aus `module-nutrition-spec.jsx:37-42`. */
const ANTEILE: Array<{
  code: Anteil['code']
  label: string
  gewicht: number
  spalte: string
  zielFeld: 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g' | null
}> = [
  { code: 'protein', label: 'protein', gewicht: 0.30, spalte: 'prot625', zielFeld: 'protein_g' },
  { code: 'calorie', label: 'calorie', gewicht: 0.25, spalte: 'enercc', zielFeld: 'kcal' },
  { code: 'carbs', label: 'carbs', gewicht: 0.15, spalte: 'cho', zielFeld: 'carbs_g' },
  { code: 'fat', label: 'fat', gewicht: 0.15, spalte: 'fat', zielFeld: 'fat_g' },
  // `[cmd]` **Kein Ballaststoffziel im Schema** — gemessen.
  { code: 'fiber', label: 'fiber', gewicht: 0.15, spalte: 'fibt', zielFeld: null },
]

const KEIN_FIBT_ZIEL = 'kein Ballaststoffziel im Schema — gemessen ueber '
  + 'alle Spalten mit „fib": nur Zufuhr (daily_summary.fibt), kein Zielwert'

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function getScoreAm(datum: string): Promise<ScoreStand> {
  const leer: ScoreStand = {
    datum,
    anteile: ANTEILE.map(a => ({
      code: a.code, label: a.label, gewicht: a.gewicht,
      ist: null, ziel: null, deckung: null, grund: 'kein Tageswert',
    })),
    stufe: null,
    gewichtGerechnet: 0,
  }

  const supabase = createSessionClient()
  const { data: sitzung } = await supabase.auth.getUser()
  const nutzer = sitzung?.user?.id
  if (!nutzer) return { ...leer, fehler: 'keine Sitzung' }

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

  if (tag.error) return { ...leer, fehler: tag.error.message }

  const zeile = tag.data as Record<string, unknown> | null
  const stufe = (profil.data as { experience_level?: string | null } | null)
    ?.experience_level ?? null

  let gewichtGerechnet = 0
  const anteile: Anteil[] = ANTEILE.map(a => {
    const ist = zeile ? zahl(zeile[a.spalte]) : null
    const ziel = a.zielFeld && ziele ? zahl(ziele[a.zielFeld]) : null

    let grund: string | undefined
    if (a.zielFeld === null) grund = KEIN_FIBT_ZIEL
    else if (ist === null) grund = 'kein Tageswert'
    else if (ziel === null) grund = 'kein Ziel hinterlegt'

    // `[read]` **Gedeckelt bei 1** — wer 120 % Protein isst, hat den
    // Anteil erfuellt, nicht uebererfuellt. **Ohne Deckel zoege ein
    // Ausreisser den ganzen Score nach oben.**
    const deckung = ist !== null && ziel !== null && ziel > 0
      ? Math.min(1, ist / ziel)
      : null
    if (deckung !== null) gewichtGerechnet += a.gewicht

    return {
      code: a.code, label: a.label, gewicht: a.gewicht,
      ist, ziel, deckung, ...(grund ? { grund } : {}),
    }
  })

  return { datum, anteile, stufe, gewichtGerechnet }
}
