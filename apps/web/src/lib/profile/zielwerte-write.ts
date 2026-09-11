// Zielwerte setzen — die bewusste Handlung, die aus dem Vorschlag ein
// Ziel macht.
//
// `[read]` GO-04 hat Rechnen und Speichern getrennt. Diese Datei ist
// die Bruecke: sie ruft die Formel auf und schreibt deren Ergebnis,
// ohne selbst zu rechnen. Zwei Kopien derselben Rechenregel driften —
// die Regel steht in `goals.berechne_zielwerte`.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { ProfileWriteError } from './profile-model'
import { getZielwertVorschlag, type Zielwerte } from './zielwerte-read'

/** Heute in lokaler Zeit als YYYY-MM-DD. */
function heute(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

/**
 * Setzt die Zielwerte aus der Formel, gueltig ab heute.
 *
 * `upsert` auf (user_id, gueltig_ab): wer zweimal am selben Tag setzt,
 * ueberschreibt den Tageseintrag statt einen zweiten anzulegen.
 * `[read]` Das ist die richtige Auslegung des Gueltigkeitsdatums —
 * pro Tag gilt ein Ziel, nicht das zuletzt geklickte von dreien.
 */
export async function setzeZielwerteAusFormel(): Promise<Zielwerte> {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new ProfileWriteError('NO_SESSION', 'Keine angemeldete Session.')

  const stichtag = heute()
  const vorschlag = await getZielwertVorschlag(stichtag)

  if (vorschlag.hindernis === 'profil_unvollstaendig') {
    throw new ProfileWriteError(
      'INVALID_INPUT',
      `Profil unvollstaendig: ${vorschlag.fehlende_felder.join(', ')} fehlt.`,
    )
  }
  if (vorschlag.hindernis === 'zielrichtung_ohne_faktor') {
    throw new ProfileWriteError(
      'INVALID_INPUT',
      'Fuer diese Zielrichtung gibt es noch keinen Kalorienzuschlag.',
    )
  }
  if (vorschlag.kcal === null) {
    throw new ProfileWriteError('INVALID_INPUT', 'Die Formel lieferte keine Zielkalorien.')
  }

  const zeile = {
    user_id: user.id,
    gueltig_ab: stichtag,
    kcal: vorschlag.kcal,
    protein_g: vorschlag.protein_g,
    carbs_g: vorschlag.carbs_g,
    fat_g: vorschlag.fat_g,
    linoleic_acid_g: vorschlag.linoleic_acid_g,
    alpha_linolenic_acid_g: vorschlag.alpha_linolenic_acid_g,
    herkunft: 'formel' as const,
    tdee: vorschlag.tdee,
    nutrition_goal: vorschlag.nutrition_goal,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .schema('goals')
    .from('nutrition_targets')
    .upsert(zeile, { onConflict: 'user_id,gueltig_ab' })
    .select('gueltig_ab, kcal, protein_g, carbs_g, fat_g, fiber_g, linoleic_acid_g, alpha_linolenic_acid_g, herkunft, tdee, nutrition_goal')
    .maybeSingle()

  if (error) throw new ProfileWriteError('WRITE_FAILED', error.message)
  if (!data) throw new ProfileWriteError('WRITE_FAILED', 'Upsert lieferte keine Zeile zurueck.')

  const r = data as Record<string, unknown>
  const zahl = (v: unknown): number | null => {
    if (v === null || v === undefined) return null
    const n = typeof v === 'string' ? Number(v) : v
    return typeof n === 'number' && Number.isFinite(n) ? n : null
  }

  return {
    gueltig_ab: typeof r.gueltig_ab === 'string' ? r.gueltig_ab : stichtag,
    kcal: zahl(r.kcal),
    protein_g: zahl(r.protein_g),
    carbs_g: zahl(r.carbs_g),
    fat_g: zahl(r.fat_g),
    // `[cmd]` **Seit C-464 eine Spalte** — wird zurueckgelesen, damit
    // die Antwort nicht faelschlich `null` traegt (G-417).
    fiber_g: zahl(r.fiber_g),
    linoleic_acid_g: zahl(r.linoleic_acid_g),
    alpha_linolenic_acid_g: zahl(r.alpha_linolenic_acid_g),
    herkunft: r.herkunft === 'manuell' ? 'manuell' : 'formel',
    tdee: zahl(r.tdee),
    nutrition_goal: typeof r.nutrition_goal === 'string' ? r.nutrition_goal : null,
  }
}
