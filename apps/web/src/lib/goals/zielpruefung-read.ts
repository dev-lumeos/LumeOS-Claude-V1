// G-628 Teil 2 — die Vorschau ruft dieselbe Pruefung wie der Schreib-Waechter.
//
// `[cmd]` **`626_controlling_goal_write_guard.sql`:** der Waechter ruft
// `goals.ziel_grenzen_pruefen` mit Profil (`experience_level`,
// `biological_sex`, `height_cm`), Start/Ziel aus dem Ziel, Zieldatum, und
// der TDEE aus `goals.tdee_basis_am(user, gueltig_ab)`. **Die Vorschau nimmt
// genau diese Quellen** — sonst zeigte sie etwas anderes, als beim
// Schreiben geprueft wird.
//
// `[read]` **„Frei ab" aus der Funktion selbst:** sie wird fuer die hoeheren
// Grade erneut gerufen (`freiAb`). Kein Grenzwert im Code.
import { createSessionClient } from '@lumeos/shared/session'

import { alsBefunde, hoehereGrade, type Pruefung, type Rohbefund } from './zielpruefung'

export type Pruefeingabe = {
  richtung: string
  startKg: number
  zielKg: number | null
  startdatum: string
  zieldatum: string | null
  programm: string
  /** Vorzeichenbehaftet, wie `goal_phases.zielrate_pct_kg_woche`; Halten: `null`. */
  tempo: number | null
}

/** PostgREST meldet eine fehlende Funktion als PGRST202; Postgres als 42883. */
const fehlt = (e: { code?: string; message?: string }) =>
  e.code === 'PGRST202' || e.code === '42883' || /Could not find the function/i.test(e.message ?? '')

export async function zielGrenzenPruefen(e: Pruefeingabe): Promise<Pruefung> {
  const db = createSessionClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { stand: 'fehler', text: 'Keine angemeldete Sitzung.' }

  const [profil, basis] = await Promise.all([
    db.from('profiles').select('experience_level, biological_sex, height_cm').eq('id', user.id).maybeSingle(),
    db.schema('goals').rpc('tdee_basis_am', { p_user_id: user.id, p_stichtag: e.startdatum }),
  ])
  if (profil.error) return { stand: 'fehler', text: `profiles: ${profil.error.message}` }
  const p = (profil.data ?? {}) as { experience_level?: string | null; biological_sex?: string | null; height_cm?: number | null }
  const tdeeZeile = Array.isArray(basis.data) ? basis.data[0] as { tdee?: number | null } | undefined : undefined
  const tdee = basis.error ? null : (typeof tdeeZeile?.tdee === 'number' ? tdeeZeile.tdee : Number(tdeeZeile?.tdee ?? NaN))
  const tdeeWert = tdee !== null && Number.isFinite(tdee) ? tdee : null

  const rufe = (grad: string | null) => db.schema('goals').rpc('ziel_grenzen_pruefen', {
    p_erfahrung: grad,
    p_richtung: e.richtung,
    p_start_kg: e.startKg,
    p_ziel_kg: e.zielKg,
    p_startdatum: e.startdatum,
    p_zieldatum: e.zieldatum,
    p_programm_code: e.programm,
    p_eigene_werte: null,
    p_geschlecht: p.biological_sex ?? null,
    p_groesse_cm: p.height_cm ?? null,
    p_tdee_kcal: tdeeWert,
    p_tempo_override: e.tempo,
  })

  const eigen = await rufe(p.experience_level ?? null)
  if (eigen.error) {
    return fehlt(eigen.error)
      ? { stand: 'nicht_eingespielt' }
      : { stand: 'fehler', text: eigen.error.message }
  }
  const roh = (eigen.data ?? []) as Rohbefund[]
  const jeGrad: Array<{ grad: string; befunde: Rohbefund[] }> = []
  if (roh.some(b => b.art !== 'warnung')) {
    for (const g of hoehereGrade(p.experience_level ?? null)) {
      const r = await rufe(g)
      if (!r.error) jeGrad.push({ grad: g, befunde: (r.data ?? []) as Rohbefund[] })
    }
  }
  return { stand: 'geprueft', befunde: alsBefunde(roh, jeGrad), tdee: tdeeWert }
}
