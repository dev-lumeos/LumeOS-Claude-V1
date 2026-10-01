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
  /**
   * `[cmd]` **Seit C-464 da** — `goals.zielwerte_am()` gab die Spalte
   * schon zurueck, der Leseweg liess sie fallen (G-417).
   */
  fiber_g: number | null
  linoleic_acid_g: number | null
  alpha_linolenic_acid_g: number | null
  herkunft: 'formel' | 'manuell'
  tdee: number | null
  nutrition_goal: string | null
}

/** Was die Formel aus dem Profil macht — inklusive Grund, wenn nicht. */
export type Zielvorschlag = {
  /**
   * `[cmd]` **G-568/A3: das Ziel, zu dem diese Zahlen gehoeren.**
   *
   * `[cmd]` **`berechne_zielwerte` gibt es seit G-563 zurueck** —
   * `goal_id uuid` als letzte Spalte (gemessen an
   * `563_target_scoped_calculation.sql:31`).
   *
   * `[read]` **Eine Kalorienzahl ohne ihr Ziel ist bei zwei Zielen
   * keine Aussage** — dieselbe Lehre wie der Phasenkopf aus G-564.
   *
   * `[read]` **`null`, solange die alte Signatur live ist** — sie
   * fuehrt die Spalte nicht.
   */
  goal_id: string | null
  bmr: number | null
  tdee: number | null
  kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  linoleic_acid_g: number | null
  alpha_linolenic_acid_g: number | null
  nutrition_goal: string | null
  kalorienfaktor: number | null
  /** `null` heisst: es ging. Sonst der Grund. */
  hindernis: Hindernis | null
  fehlende_felder: string[]
}

// ── G-527: vier Hindernisse, vier Texte ──────────────────────────
//
// `[cmd]` **Hier standen zwei** — `profil_unvollstaendig` und
// `zielrichtung_ohne_faktor`. `[cmd]` **G-511 bringt zwei weitere:**
// `keine_aktive_phase` und `phasenparameter_fehlt`.
//
// `[read]` **Ohne sie wird jede Ursache, die nicht die erste ist, zu
// einem Satz:** *,,Die Formel lieferte keine Zielkalorien"*
// (`zielwerte-write.ts:54`). **Vier Ursachen, eine Meldung** — und
// die eine sagt nicht, was zu tun ist.

/**
 * Was `berechne_zielwerte` als `hindernis` zurueckgeben kann.
 *
 * `[read]` **Die Namen kommen aus der Datenbank, nicht von hier** —
 * sie muessen zeichengleich zu dem sein, was die Funktion schreibt.
 */
// ── G-568/A-30: Typ und Satz stehen server-frei ────────────
//
// `[cmd]` **Hier standen `Hindernis` und `hindernisSatz`.** `[cmd]`
// **Der Composition-Reiter ist `'use client'` und braucht den Satz**
// — ein **Wert**-Import von hier zoege `createSessionClient` und
// damit `next/headers` ins Browserbuendel (A-30, dieselbe Klasse wie
// G-74, G-412, G-537).
//
// `[read]` **Beides liegt jetzt in `zielwerte-hindernis.ts`** und
// wird hier durchgereicht — eine Quelle, zwei Seiten.
export { hindernisSatz } from './zielwerte-hindernis'
export type { Hindernis } from './zielwerte-hindernis'
import type { Hindernis } from './zielwerte-hindernis'

/**
 * Der Satz zum Hindernis — **was zu tun ist, nicht was schiefging.**
 *
 * `[read]` **Kein Fehlertext.** Drei der vier Faelle kann der Nutzer
 * selbst aufloesen; der Satz sagt ihm wie. **Der vierte
 * (`zielrichtung_ohne_faktor`) ist eine Luecke im Katalog** — dort
 * ist ehrlich, dass er nichts tun kann.
 *
 * `[read]` **Grenze zu E-74 geprueft (G-527/A4):** E-74 verbietet,
 * **aus Daten eine Diagnose abzuleiten oder einen Wert als krankhaft
 * zu bewerten.** *,,Fuer diese Phase fehlt der Kalorienwert"* ist
 * eine Aussage ueber den eigenen Datenbestand und eine Aufforderung
 * zum Ergaenzen — **keine Bewertung und keine Empfehlung.** Sie
 * faellt nicht unter E-74.
 *
 * @param fehlende Nur fuer `profil_unvollstaendig` — die Feldnamen.
 */

/**
 * Phasen OHNE Tagesziel — sie sind kein Hindernis, sondern ein
 * eigener Zustand.
 *
 * `[cmd]` **G-527/A6 und A7, belegt in G-521/F6:** die Peak Week ist
 * **protokollgetrieben** (Entladen, Laden, Natrium — `PHASE_MODELS.md:127-131`),
 * **ein Kalorienziel verliert dort seinen Wert.**
 *
 * `[cmd]` **`expert_bb_annual` ist eine VORLAGE, die Phasen erzeugt**
 * (`PHASE_MODELS.md:167-173`: zwoelf Monate, je ein Phasenname) —
 * **sie hat selbst keines.**
 *
 * `[read]` **Der Unterschied zu einem Hindernis ist der Ton:** ein
 * Hindernis fordert zum Handeln auf. **Hier gibt es nichts zu tun,
 * und das ist richtig so** — sonst sieht der Nutzer in der
 * wichtigsten Woche seines Jahres eine Fehlermeldung.
 */
export const PHASEN_OHNE_TAGESZIEL: ReadonlySet<string> = new Set([
  'peak_week',
  'expert_bb_annual',
])

/** Warum diese Phase kein Tagesziel hat — je Phase ein eigener Satz. */
export function ohneTageszielSatz(phaseType: string): string | null {
  switch (phaseType) {
    case 'peak_week':
      return 'Die Peak Week laeuft nach Protokoll, nicht nach '
        + 'Tagesziel — Entladen, Laden, Natrium.'
    case 'expert_bb_annual':
      return 'Der Jahreszyklus ist eine Vorlage: er erzeugt Phasen, '
        + 'und die tragen das Ziel.'
    default:
      return null
  }
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
    fiber_g: zahl(r.fiber_g),
    linoleic_acid_g: zahl(r.linoleic_acid_g),
    alpha_linolenic_acid_g: zahl(r.alpha_linolenic_acid_g),
    herkunft: r.herkunft === 'manuell' ? 'manuell' : 'formel',
    tdee: zahl(r.tdee),
    nutrition_goal: text(r.nutrition_goal),
  }
}

/**
 * Erkennt die Mehrdeutigkeitsmeldung aus G-563.
 *
 * `[cmd]` **`ERRCODE = '23514'` und der Satz**, beides aus
 * `563_target_scoped_calculation.sql:284`. `[read]` **Der Code
 * allein genuegt nicht** — `23514` ist ein CHECK-Verstoss und kann
 * auch von einer Spaltenbedingung kommen.
 */
function istMehrdeutig(f: { code?: string; message?: string }): boolean {
  const t = (f.message ?? '').toLowerCase()
  return t.includes('mehrere aktive phasen')
    && t.includes('zielbezug fehlt')
}

/**
 * Kennt die Datenbank die Dreiparameter-Fassung noch nicht?
 *
 * `[cmd]` **PostgREST meldet `PGRST202`**, wenn keine Funktion mit
 * dieser Argumentliste existiert. `[read]` **Nur dann faellt der
 * Aufruf zurueck** — ein anderer Fehler bleibt ein Fehler.
 */
function istSignaturFehlt(f: { code?: string; message?: string }): boolean {
  if (f.code === 'PGRST202') return true
  const t = (f.message ?? '').toLowerCase()
  return t.includes('could not find the function')
    && t.includes('berechne_zielwerte')
}

/** Ein Vorschlag ohne Zahlen — je Feld `null`, nichts erfunden. */
const LEERER_VORSCHLAG: Zielvorschlag = {
  goal_id: null,
  bmr: null, tdee: null, kcal: null, protein_g: null, carbs_g: null,
  fat_g: null, fiber_g: null, linoleic_acid_g: null,
  alpha_linolenic_acid_g: null, nutrition_goal: null,
  kalorienfaktor: null, hindernis: null, fehlende_felder: [],
}

/**
 * Was die Formel aus dem heutigen Profil macht.
 *
 * Liefert immer eine Antwort — entweder Zahlen oder ein `hindernis`
 * mit den fehlenden Feldern. Nie beides leer.
 */
export async function getZielwertVorschlag(
  stichtag: string, goalId?: string | null,
): Promise<Zielvorschlag> {
  const { supabase, userId } = await requireSession()

  // ══ G-568/A2: das Ziel wird DURCHGEREICHT, nicht geraten ═════
  //
  // `[cmd]` **Die neue Signatur, woertlich aus G-563:**
  //
  //     goals.berechne_zielwerte(
  //       p_user_id uuid, p_goal_id uuid,
  //       p_stichtag date DEFAULT CURRENT_DATE)
  //
  // `[cmd]` **Die alte Zweiparameter-Fassung bleibt und WIRFT bei
  // mehreren aktiven Zielphasen** (`23514`):
  // *,,nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag;
  // Zielbezug fehlt"*.
  //
  // `[read]` **Wo der Aufrufer ein Ziel kennt, nennt er es** — wo
  // nicht, bleibt es offen und die Datenbank entscheidet: eine Phase
  // geht durch, zwei werfen. **Kein geratenes Ziel** (A2).
  const args = goalId
    ? { p_user_id: userId, p_goal_id: goalId, p_stichtag: stichtag }
    : { p_user_id: userId, p_stichtag: stichtag }

  let { data, error } = await supabase
    .schema('goals')
    .rpc('berechne_zielwerte', args)

  // ══ G-565: die neue Signatur ist NICHT eingespielt ══════════
  //
  // `[cmd]` **Am Schirm gefunden, 2026-10-01:** mit genau einer
  // offenen Phase reichte G-568 ein `p_goal_id` durch, und die Seite
  // antwortete mit
  //
  //     Could not find the function
  //     goals.berechne_zielwerte(p_goal_id, p_stichtag, p_user_id)
  //     in the schema cache
  //
  // `[cmd]` **Live steht nur die Zweiparameter-Fassung**
  // (`p_user_id, p_stichtag`) — G-563 ist gebaut und nicht
  // eingespielt.
  //
  // `[read]` **Die Reihenfolge verlangt beides:** die Anwendung muss
  // VOR dem Einspielen laufen und danach. **Also: den Zielbezug
  // versuchen, und wenn die Funktion ihn nicht kennt, ohne ihn
  // fragen** — dann waehlt die Datenbank wie bisher, und bei
  // mehreren Phasen wirft sie (A4).
  //
  // `[read]` **`PGRST202` ist „Funktion nicht gefunden"**, nicht
  // „Aufruf falsch" — der Rueckfall greift also genau dann, wenn die
  // Signatur fehlt, und verdeckt keinen echten Fehler.
  if (error && goalId && istSignaturFehlt(error)) {
    ;({ data, error } = await supabase
      .schema('goals')
      .rpc('berechne_zielwerte', { p_user_id: userId, p_stichtag: stichtag }))
  }

  if (error) {
    // ══ G-568/A4: die Mehrdeutigkeit ist ein ZUSTAND ══════════
    //
    // `[cmd]` **`23514` mit dem Satz aus G-563.** `[read]` **Nicht
    // als HTTP 500 und nicht als leeres Feld** — die Oberflaeche
    // zeigt ihn, und `hindernis` ist der Weg, den sie schon kennt.
    if (istMehrdeutig(error)) {
      return { ...LEERER_VORSCHLAG, hindernis: 'mehrere_phasen' }
    }
    throw new ProfileWriteError('WRITE_FAILED', error.message)
  }
  const zeile = (Array.isArray(data) ? data[0] : null) as Record<string, unknown> | null

  if (!zeile) {
    return { ...LEERER_VORSCHLAG, hindernis: 'profil_unvollstaendig' }
  }

  const h = text(zeile.hindernis)
  return {
    bmr: zahl(zeile.bmr),
    tdee: zahl(zeile.tdee),
    kcal: zahl(zeile.kcal),
    protein_g: zahl(zeile.protein_g),
    carbs_g: zahl(zeile.carbs_g),
    fat_g: zahl(zeile.fat_g),
    fiber_g: zahl(zeile.fiber_g),
    linoleic_acid_g: zahl(zeile.linoleic_acid_g),
    alpha_linolenic_acid_g: zahl(zeile.alpha_linolenic_acid_g),
    nutrition_goal: text(zeile.nutrition_goal),
    kalorienfaktor: zahl(zeile.kalorienfaktor),
    hindernis: h === 'profil_unvollstaendig' || h === 'zielrichtung_ohne_faktor'
      ? h
      : null,
    fehlende_felder: Array.isArray(zeile.fehlende_felder)
      ? (zeile.fehlende_felder as unknown[]).filter((f): f is string => typeof f === 'string')
      : [],
    // `[read]` **`null`, solange die alte Signatur live ist** — sie
    // fuehrt die Spalte nicht, und eine erfundene Kennung waere
    // schlimmer als keine.
    goal_id: text(zeile.goal_id),
  }
}
