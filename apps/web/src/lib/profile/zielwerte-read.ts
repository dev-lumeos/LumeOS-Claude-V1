// Lese-I/O fuer Zielwerte und ihre Herleitung (GO-03, GO-04).
//
// ZWEI FRAGEN, ZWEI FUNKTIONEN — und das ist Absicht:
//
//   `getZielwerteAm`  liest, was GILT (goals.zielwerte_am).
//   `getZielwertVorschlag` rechnet, was GELTEN KOENNTE
//                     (goals.berechne_zielwerte).
//
// [read] Rechnen und Speichern sind getrennt. Der Auftrag verlangt das
// ausdruecklich, und der Grund ist der Gueltigkeitszeitraum: eine
// Berechnung, die bei jedem Abruf schreibt, legte bei jeder
// Profilaenderung eine neue Zeile an — auch beim Vertippen. Wann eine
// Zeile entsteht, entscheidet die Nutzerin.
//
// Laeuft ausschliesslich serverseitig.
import { createSessionClient } from '@lumeos/shared/session'

import { ProfileWriteError } from './profile-model'

/** Was an einem Tag gilt. */
export type Zielwerte = {
  gueltig_ab: string
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  herkunft: 'formel' | 'manuell'
  tdee: number | null
  nutrition_goal: string | null
}

/** Was die Formel aus dem Profil macht — inklusive Grund, wenn nicht. */
export type Zielvorschlag = {
  bmr: number | null
  tdee: number | null
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  nutrition_goal: string | null
  kalorienfaktor: number | null
  /** `null` heisst: es ging. Sonst der Grund. */
  hindernis: 'profil_unvollstaendig' | 'zielrichtung_ohne_faktor' | null
  fehlende_felder: string[]
}

function zahl(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null
}

async function requireSession() {
  const supabase = createSessionClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new ProfileWriteError('NO_SESSION', 'Keine angemeldete Session.')
  return { supabase, userId: user.id }
}

/** Die an einem Tag gueltigen Zielwerte. `null` heisst: keine gesetzt. */
export async function getZielwerteAm(stichtag: string): Promise<Zielwerte | null> {
  const { supabase, userId } = await requireSession()

  const { data, error } = await supabase
    .schema('goals')
    .rpc('zielwerte_am', { p_user_id: userId, p_stichtag: stichtag })

  if (error) throw new ProfileWriteError('WRITE_FAILED', error.message)
  const zeile = Array.isArray(data) ? data[0] : null
  if (!zeile) return null

  const r = zeile as Record<string, unknown>
  return {
    gueltig_ab: text(r.gueltig_ab) ?? stichtag,
    kcal: zahl(r.kcal),
    protein_g: zahl(r.protein_g),
    carbs_g: zahl(r.carbs_g),
    fat_g: zahl(r.fat_g),
    herkunft: r.herkunft === 'manuell' ? 'manuell' : 'formel',
    tdee: zahl(r.tdee),
    nutrition_goal: text(r.nutrition_goal),
  }
}

/**
 * Was die Formel aus dem heutigen Profil macht.
 *
 * Liefert immer eine Antwort — entweder Zahlen oder ein `hindernis`
 * mit den fehlenden Feldern. Nie beides leer.
 */
export async function getZielwertVorschlag(stichtag: string): Promise<Zielvorschlag> {
  const { supabase, userId } = await requireSession()

  const { data, error } = await supabase
    .schema('goals')
    .rpc('berechne_zielwerte', { p_user_id: userId, p_stichtag: stichtag })

  if (error) throw new ProfileWriteError('WRITE_FAILED', error.message)
  const zeile = (Array.isArray(data) ? data[0] : null) as Record<string, unknown> | null

  if (!zeile) {
    return {
      bmr: null, tdee: null, kcal: null, protein_g: null, carbs_g: null,
      fat_g: null, nutrition_goal: null, kalorienfaktor: null,
      hindernis: 'profil_unvollstaendig',
      fehlende_felder: [],
    }
  }

  const h = text(zeile.hindernis)
  return {
    bmr: zahl(zeile.bmr),
    tdee: zahl(zeile.tdee),
    kcal: zahl(zeile.kcal),
    protein_g: zahl(zeile.protein_g),
    carbs_g: zahl(zeile.carbs_g),
    fat_g: zahl(zeile.fat_g),
    nutrition_goal: text(zeile.nutrition_goal),
    kalorienfaktor: zahl(zeile.kalorienfaktor),
    hindernis: h === 'profil_unvollstaendig' || h === 'zielrichtung_ohne_faktor'
      ? h
      : null,
    fehlende_felder: Array.isArray(zeile.fehlende_felder)
      ? (zeile.fehlende_felder as unknown[]).filter((f): f is string => typeof f === 'string')
      : [],
  }
}
