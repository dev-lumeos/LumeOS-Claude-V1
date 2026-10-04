// Die Regeln der Zieltabelle — **ohne Server-I/O** (G-79).
//
// `[cmd]` **WARUM DIESE DATEI GETRENNT IST.** Sie stand zuerst in
// `schreiben.ts`. Der Typecheck war gruen, aber die Seite antwortete
// mit **HTTP 500**:
//
//   „You're importing a component that needs next/headers."
//
// Grund: `ziel-karten.tsx` ist `'use client'` und holte von dort
// **Werte** (`ABGESCHLOSSEN`, `STATUS_LABEL`) — ein Wert-Import zieht
// die ganze Datei ins Browserbuendel, und `schreiben.ts` importiert
// `createSessionClient`, das `next/headers` braucht. Ein reiner
// `import type` waere folgenlos geblieben, ein Wert-Import ist es
// nicht.
//
// **Dieselbe Klasse Fehler wie in G-74** (dort mit `stack-read.ts`).
// Der Typecheck sieht sie nicht — nur der Browser.
//
// **Deshalb:** hier stehen Konstanten und reine Pruefungen, die beide
// Seiten benutzen duerfen. `schreiben.ts` daneben macht das I/O und
// wird nur serverseitig importiert.

// G-591: der Schemafehler-Satz kommt aus derselben Stelle wie G-570.
import { fehlerart, fehlertexte } from '../fehler/ladefehler'

/**
 * Die Status, die `user_goals_status_check` erlaubt.
 *
 * `[cmd]` Genau diese fuenf, gemessen an der CHECK-Bedingung. Der
 * Auftrag fragt nach „erreicht, nicht erreicht, abgebrochen" — die
 * Tabelle kennt sie als `achieved` und `abandoned`, dazu `paused` und
 * `on_hold` als ruhende Zustaende.
 */
export const STATUS_WERTE = [
  'active', 'paused', 'achieved', 'abandoned', 'on_hold',
] as const
export type ZielStatus = typeof STATUS_WERTE[number]

/**
 * Die Status, die ein Ziel als abgeschlossen kennzeichnen.
 *
 * `[read]` `paused` gehoert NICHT dazu — ein pausiertes Ziel laeuft
 * weiter, es ruht nur. Nur `achieved` und `abandoned` sind vorbei.
 */
export const ABGESCHLOSSEN: ZielStatus[] = ['achieved', 'abandoned']

export const STATUS_LABEL: Record<ZielStatus, string> = {
  active: 'aktiv',
  paused: 'pausiert',
  on_hold: 'zurückgestellt',
  achieved: 'erreicht',
  abandoned: 'abgebrochen',
}

/**
 * Die Prioritaetsgrenzen.
 *
 * `[cmd]` Zwei CHECK-Bedingungen wirken zusammen:
 *   `user_goals_priority_check` — 1 bis 10.
 *   `user_goals_check1` — **ein AKTIVES Ziel muss 1 bis 3 tragen.**
 *
 * `[read]` Die zweite ist die eigentliche Regel: aktive Ziele haben
 * drei Raenge, nicht zehn. Wer ein Ziel auf 5 setzt und aktiv laesst,
 * bekommt einen Datenbankfehler — die Oberflaeche bietet deshalb nur
 * 1–3 an, solange der Status `active` ist.
 */
export const PRIO_MIN_AKTIV = 1
export const PRIO_MAX_AKTIV = 3
export const PRIO_MIN = 1
export const PRIO_MAX = 10

export type ZielAenderung = {
  title?: string
  description?: string | null
  target_value?: number | null
  target_unit?: string | null
  target_date?: string | null
  status?: ZielStatus
  priority?: number
  is_primary?: boolean
}

/**
 * Prueft eine Aenderung gegen die CHECK-Bedingungen der Tabelle.
 *
 * `[read]` **Vorab und nicht erst in der Datenbank** — sonst bekommt
 * die Nutzerin eine Postgres-Meldung statt eines Satzes. Die Regeln
 * sind dieselben; hier stehen sie nur frueher.
 */
export function pruefeAenderung(a: ZielAenderung): string | null {
  if (a.title !== undefined && a.title.trim() === '') {
    return 'Der Titel darf nicht leer sein.'
  }
  if (a.priority !== undefined) {
    if (!Number.isInteger(a.priority)) {
      return 'Die Priorität muss eine ganze Zahl sein.'
    }
    if (a.priority < PRIO_MIN || a.priority > PRIO_MAX) {
      return `Die Priorität liegt zwischen ${PRIO_MIN} und ${PRIO_MAX}.`
    }
    // `user_goals_check1`: aktive Ziele nur 1-3.
    const bleibtAktiv = a.status === undefined || a.status === 'active'
    if (bleibtAktiv && (a.priority < PRIO_MIN_AKTIV || a.priority > PRIO_MAX_AKTIV)) {
      return `Ein aktives Ziel trägt Priorität ${PRIO_MIN_AKTIV} bis ${PRIO_MAX_AKTIV}.`
    }
  }
  if (a.status !== undefined && !STATUS_WERTE.includes(a.status)) {
    return `Unbekannter Status: ${a.status}`
  }
  if (a.target_value !== undefined && a.target_value !== null
      && !Number.isFinite(a.target_value)) {
    return 'Der Zielwert muss eine Zahl sein.'
  }
  return null
}

// ── G-537: ein Ziel ANLEGEN ──────────────────────────────────────
//
// `[cmd]` **`lib/goals/schreiben.ts` kannte bis heute nur
// `zielAendern` und `reihenfolgeSetzen`** — **kein `zielAnlegen`.**
// `[read]` **Man konnte in LumeOS kein Ziel erstellen;** die Zeilen
// in der Datenbank sind Seed.

/**
 * Die vier Zielarten.
 *
 * `[cmd]` **Aus `user_goals_goal_type_check` gelesen**, gemessen
 * 2026-09-29 — nicht aus dem Mockup abgetippt.
 *
 * `[read]` **Der Entwurf zeigt SECHS** (`module-goals.jsx:696-703`:
 * body_comp, weight, strength, performance, habit, custom) — **die
 * Datenbank erlaubt vier.** **Der CHECK gewinnt.**
 *
 * `[read]` **Die Namen sind Anzeigetexte** — der CHECK kennt nur
 * die Schluessel.
 */
export const ZIELARTEN = [
  { id: 'body_composition', name: 'Koerperzusammensetzung',
    zweck: 'Gewicht, Koerperfett, Muskelmasse' },
  { id: 'performance', name: 'Leistung',
    zweck: 'Kraft, Ausdauer, ein Wettkampf' },
  { id: 'health', name: 'Gesundheit',
    zweck: 'Blutwerte, Blutdruck, Schlaf' },
  { id: 'lifestyle', name: 'Lebensstil',
    zweck: 'Gewohnheiten, Regelmaessigkeit' },
] as const

export type Zielart = typeof ZIELARTEN[number]['id']

/** Was ein neues Ziel braucht. Nur `NOT NULL` ist Pflicht. */
export type ZielNeu = {
  goal_type: Zielart
  /**
   * `[cmd]` **G-557/A1: die zweite Ebene.** `user_goals.subtype` hat
   * keinen CHECK, aber **keine der 11 Zeilen fuehrt `NULL`**
   * (gemessen 2026-09-30).
   *
   * `[read]` **Er kommt aus `unterartFuer()`**, nicht aus einer
   * Eingabe — der Knopf bringt ihn mit, oder die Strategie sagt die
   * Richtung.
   */
  subtype?: string | null
  title: string
  /** ISO-Tag. `gueltig_ab` ist `NOT NULL`. */
  gueltig_ab: string
  priority: number
  description?: string | null
  target_value?: number | null
  target_unit?: string | null
  start_value?: number | null
  current_value?: number | null
  target_date?: string | null
  motivation_reason?: string | null
}

export type ZielFeldfehler = { feld: string; text: string }

const ISO_TAG = /^\d{4}-\d{2}-\d{2}$/

/**
 * Prueft ein neues Ziel gegen die CHECKs der Tabelle.
 *
 * `[read]` **Je Regel ein Feldfehler, nicht ein Sammelsatz** —
 * damit die Meldung am Feld stehen kann.
 *
 * `[read]` **Die Regeln stehen schon in der Datenbank** — hier
 * stehen sie nur frueher, damit die Nutzerin einen Satz sieht und
 * keine Postgres-Meldung.
 */
export function pruefeNeuesZiel(z: ZielNeu): ZielFeldfehler[] {
  const f: ZielFeldfehler[] = []

  // [cmd] user_goals_goal_type_check
  if (!ZIELARTEN.some(a => a.id === z.goal_type)) {
    f.push({ feld: 'goal_type', text: 'Diese Zielart gibt es nicht.' })
  }

  // [cmd] user_goals_title_check: btrim(title) <> ''
  if (!z.title || z.title.trim() === '') {
    f.push({ feld: 'title', text: 'Gib dem Ziel einen Titel.' })
  }

  // [cmd] gueltig_ab NOT NULL
  if (!ISO_TAG.test(z.gueltig_ab ?? '')) {
    f.push({ feld: 'gueltig_ab', text: 'Ein Startdatum ist erforderlich.' })
  }

  // [cmd] user_goals_check: target_date IS NULL OR >= gueltig_ab
  if (z.target_date) {
    if (!ISO_TAG.test(z.target_date)) {
      f.push({ feld: 'target_date', text: 'Kein gueltiges Datum.' })
    } else if (ISO_TAG.test(z.gueltig_ab ?? '')
      && z.target_date < z.gueltig_ab) {
      f.push({
        feld: 'target_date',
        text: 'Die Deadline liegt vor dem Start.',
      })
    }
  }

  // [cmd] user_goals_check1 — ein neues Ziel ist immer `active`.
  if (!Number.isInteger(z.priority)) {
    f.push({ feld: 'priority', text: 'Die Prioritaet muss eine ganze Zahl sein.' })
  } else if (z.priority < PRIO_MIN_AKTIV || z.priority > PRIO_MAX_AKTIV) {
    f.push({
      feld: 'priority',
      text: `Ein aktives Ziel traegt Prioritaet ${PRIO_MIN_AKTIV} bis ${PRIO_MAX_AKTIV}.`,
    })
  }

  for (const [feld, wert] of [
    ['target_value', z.target_value], ['start_value', z.start_value],
    ['current_value', z.current_value],
  ] as Array<[string, number | null | undefined]>) {
    if (wert !== undefined && wert !== null && !Number.isFinite(wert)) {
      f.push({ feld, text: 'Das muss eine Zahl sein.' })
    }
  }

  return f
}

// ══ G-591: DIE REIHENFOLGE AKTIVER ZIELE ════════════════════════════
//
// `[cmd]` **Gemessen 2026-10-04:** `uq_user_goals_active_slot` ist ein
// eindeutiger, NICHT aufschiebbarer Teilindex auf `(user_id, priority)
// WHERE status = 'active'`, und `user_goals_check1` erlaubt aktiv nur
// 1-3. **Ein Tausch Zeile fuer Zeile scheitert deshalb immer an
// `23505`** — und bei drei aktiven Zielen gibt es keinen freien Platz.
//
// `[cmd]` **Tom, 2026-10-04:** die Datenbank tauscht atomar —
// `goals.ziel_reihenfolge_setzen(p_reihenfolge jsonb)` (G-602, Codex).
// **Alle aktiven Ziele muessen genannt sein**, Fehler `42501` (fremdes
// oder inaktives Ziel) und `23514` (ungueltige Menge).

export type Platz = { id: string; priority: number }

/**
 * Ein aktives Ziel einen Platz hoch (`-1`) oder runter (`+1`) — mit
 * seinem Nachbarn getauscht. **Gibt ALLE aktiven Ziele zurueck**, wie
 * der Vertrag es verlangt, oder `null`, wenn es keinen Nachbarn gibt.
 */
export function tauschePlatz(
  aktive: readonly Platz[], id: string, richtung: -1 | 1,
): Platz[] | null {
  const sortiert = [...aktive].sort((a, b) => a.priority - b.priority)
  const i = sortiert.findIndex(p => p.id === id)
  const j = i + richtung
  if (i < 0 || j < 0 || j >= sortiert.length) return null
  const neu = sortiert.map(p => ({ ...p }))
  neu[i].priority = sortiert[j].priority
  neu[j].priority = sortiert[i].priority
  return neu
}

/**
 * Vorpruefung vor dem Aufruf — dieselben Regeln wie die Datenbank,
 * damit der Nutzer einen Satz bekommt statt eines Codes.
 */
export function pruefeReihenfolge(paare: readonly Platz[]): string | null {
  if (paare.length === 0) return 'Keine Ziele zum Ordnen.'
  if (paare.length > PRIO_MAX_AKTIV) {
    return `Aktive Ziele belegen höchstens ${PRIO_MAX_AKTIV} Plätze.`
  }
  const plaetze = paare.map(p => p.priority)
  if (plaetze.some(p => !Number.isInteger(p) || p < PRIO_MIN_AKTIV || p > PRIO_MAX_AKTIV)) {
    return `Ein aktives Ziel trägt Priorität ${PRIO_MIN_AKTIV} bis ${PRIO_MAX_AKTIV}.`
  }
  if (new Set(plaetze).size !== plaetze.length) return 'Jeder Platz nur einmal.'
  if (new Set(paare.map(p => p.id)).size !== paare.length) return 'Jedes Ziel nur einmal.'
  return null
}

/**
 * Der Satz zu einem Fehler aus `ziel_reihenfolge_setzen`.
 *
 * `[read]` **Kennt die Datenbank die Funktion noch nicht** (G-602 nicht
 * eingespielt oder Cache veraltet), steht der Satz aus `ladefehler.ts`
 * da — dieselbe Erkennung wie G-570, kein zweiter Text.
 */
export function reihenfolgeFehler(code: string | null | undefined, text: string): string {
  if (code === '42501') {
    return 'Ein Ziel in der Liste gehört nicht zu dir oder ist nicht mehr aktiv. '
      + 'Lade die Seite neu.'
  }
  if (code === '23514') {
    return 'Die Reihenfolge muss alle aktiven Ziele nennen und die Plätze '
      + `${PRIO_MIN_AKTIV} bis ${PRIO_MAX_AKTIV} je einmal vergeben. Lade die Seite neu.`
  }
  if (fehlerart(text, code) === 'schema') return fehlertexte('schema').satz
  return text
}

/** Die Argumente fuer `ziel_reihenfolge_setzen` — der Vertrag aus G-602. */
export function reihenfolgeArgumente(paare: readonly Platz[]) {
  return { p_reihenfolge: paare.map(p => ({ goal_id: p.id, priority: p.priority })) }
}
