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
import {
  getZielwertVorschlag, hindernisSatz,
  type Hindernis, type Zielwerte,
} from './zielwerte-read'

/**
 * Macht aus einem Datenbankfehler dasselbe Hindernis, das die
 * Leseseite kennt — oder `null`, wenn es keines ist.
 *
 * `[cmd]` **G-527: Treffer auf `23514` in `apps/web/src` waren
 * null.** `[read]` **`23514` ist `check_violation`** — der Code,
 * mit dem der G-511-Trigger abweist.
 *
 * `[read]` **Der Name wird aus der Meldung gelesen, nicht geraten:**
 * die Funktion nennt ihn (`keine_aktive_phase`,
 * `phasenparameter_fehlt`). **Findet sich keiner, ist es ein
 * fremder CHECK** — dann bleibt es ein Schreibfehler.
 */
function hindernisAusFehler(
  error: { code?: string; message?: string },
): Hindernis | null {
  if (error.code !== '23514') return null
  const text = error.message ?? ''
  const bekannt: Hindernis[] = [
    'keine_aktive_phase', 'phasenparameter_fehlt',
    'profil_unvollstaendig', 'zielrichtung_ohne_faktor',
  ]
  return bekannt.find(h => text.includes(h)) ?? null
}

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

  // ── G-527/A1: je Hindernis der eigene Satz ─────────────────────
  //
  // `[cmd]` **Hier standen zwei Faelle und ein Auffangsatz:** *,,Die
  // Formel lieferte keine Zielkalorien."* `[read]` **Damit wurden
  // vier Ursachen zu einer Meldung** — und die eine sagte nicht, was
  // zu tun ist.
  //
  // `[read]` **Der Text kommt aus `hindernisSatz()`**, damit Lese-
  // und Schreibweg denselben Wortlaut fuehren. **Zwei Kopien
  // driften.**
  if (vorschlag.hindernis) {
    throw new ProfileWriteError(
      'INVALID_INPUT',
      hindernisSatz(vorschlag.hindernis, vorschlag.fehlende_felder),
    )
  }
  if (vorschlag.kcal === null) {
    // `[read]` **Kein Hindernis, aber auch keine Zahl** — das ist
    // ein echter Fehler der Rechnung und bleibt es.
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

  // ── G-527/A2: 23514 ist eine Auskunft, kein Serverfehler ───────
  //
  // `[cmd]` **Hier stand `error.message` unveraendert.** `[read]`
  // **Ein CHECK-Verstoss aus dem G-511-Trigger kam damit als
  // Datenbanktext beim Nutzer an — oder als HTTP 500**, fuer eine
  // Situation, die er selbst aufloesen kann.
  //
  // `[read]` **Ein Zustand, zwei Wege, eine Meldung:** derselbe
  // Satz wie auf der Leseseite, aus derselben Funktion.
  //
  // `[cmd]` **Der Weg hierher ist echt:** die Rechnung lief oben
  // durch (kein `hindernis`, eine Zahl), und erst der Trigger beim
  // Schreiben weist ab — **etwa weil die Phase zwischen Lesen und
  // Schreiben beendet wurde.**
  if (error) {
    const h = hindernisAusFehler(error)
    if (h) throw new ProfileWriteError('INVALID_INPUT', hindernisSatz(h))
    throw new ProfileWriteError('WRITE_FAILED', error.message)
  }
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
