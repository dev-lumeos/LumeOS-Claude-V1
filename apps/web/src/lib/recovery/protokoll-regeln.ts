// Die Regeln fuer `recovery.recovery_protocols` — G-593.
//
// `[read]` **Serverfrei**, wie `checkin-regeln.ts` daneben (A-30): das
// Modal importiert von hier Werte, vom Schreibweg nur Typen.
//
// ══ ALLE GRENZEN SIND AUS DEM SCHEMA GELESEN ════════════════════════
//
// `[cmd]` **`pg_constraint`, gemessen 2026-10-03:**
//
//     protocol_key      CHECK IN (active_recovery_week, passive_deload,
//                                 sleep_optimization, injury_protocol)
//     status            CHECK IN (active, completed, discontinued)
//     duration_days     CHECK 1..31
//     completed_days    CHECK >= 0                (Vorgabe 0)
//     daily_activities  CHECK jsonb_typeof = 'array' (Vorgabe '[]')
//     name, target_condition, started_on          NOT NULL, kein CHECK
//
// ══ KEIN EINDEUTIGER SCHLUESSEL AUF `active` — EIN BEFUND ══════════
//
// `[cmd]` **Es gibt nur `idx_recovery_protocols_user_status`** — ein
// gewoehnlicher Index auf `(user_id, status, started_on DESC)`, nicht
// eindeutig. **Zwei aktive Protokolle je Nutzer sind erlaubt.**
// `[read]` **Die Oberflaeche erzwingt das nicht** — sie nennt ein
// bereits laufendes. Die Regel gehoert in die Datenbank (Codex).

/** Die vier Protokolle aus `recovery_protocols_protocol_key_check`. */
export const PROTOKOLL_ARTEN = [
  'active_recovery_week', 'passive_deload', 'sleep_optimization', 'injury_protocol',
] as const
export type ProtokollArt = typeof PROTOKOLL_ARTEN[number]

/** Die Zustaende aus `recovery_protocols_status_check`. */
export const PROTOKOLL_STATUS = ['active', 'completed', 'discontinued'] as const

/**
 * `target_condition` je Protokoll — **die eine Stelle**.
 *
 * `[cmd]` **Tom, 2026-10-03 (G-593):** *„snake_case des ZUSTANDS, nicht
 * des Anzeigetitels."* Die beiden Bestandszeilen folgen der Regel
 * schon (`general_recovery`, `poor_sleep`); die zwei uebrigen sind
 * nach ihr abgeleitet. **Der Knopf waehlt den Wert nie frei** — er
 * folgt aus `protocol_key`.
 *
 * `[read]` **Die Vorlage fuer einen spaeteren CHECK** (Codex). Nicht
 * `SPEC_02:329` — das ist das Vokabular der importierten Bibliothek
 * (`SPEC_08:19`), einer anderen Entitaet.
 */
export const PROTOKOLL_ZUSTAND: Record<ProtokollArt, string> = {
  active_recovery_week: 'general_recovery',
  passive_deload: 'overtraining_recovery',
  sleep_optimization: 'poor_sleep',
  injury_protocol: 'acute_injury',
}

export type Feldfehler = { feld: string; text: string }

export type ProtokollEingabe = {
  protocol_key: string
  name: string
  started_on: string
  duration_days: string
  /** Die Aktivitaeten je Tag — eine LISTE, kein Objekt (der CHECK). */
  daily_activities: string[]
}

/** Ein Protokoll pruefen — je CHECK einzeln. */
export function pruefeProtokoll(e: ProtokollEingabe): Feldfehler[] {
  const fehler: Feldfehler[] = []
  if (!(PROTOKOLL_ARTEN as readonly string[]).includes(e.protocol_key)) {
    fehler.push({ feld: 'protocol_key', text: 'Unbekanntes Protokoll.' })
  }
  if (!e.name.trim()) fehler.push({ feld: 'name', text: 'Das Protokoll braucht einen Namen.' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.started_on.trim())) {
    fehler.push({ feld: 'started_on', text: 'Ab welchem Tag?' })
  }
  const d = Number(String(e.duration_days).trim())
  if (!String(e.duration_days).trim() || !Number.isInteger(d) || d < 1 || d > 31) {
    // `[cmd]` `recovery_protocols_duration_days_check`: 1 bis 31.
    fehler.push({ feld: 'duration_days', text: 'Dauer: ganze Tage von 1 bis 31.' })
  }
  // `[cmd]` `recovery_protocols_daily_activities_check`: ein Array.
  // `[read]` **Die Falle aus dem Auftrag** — ein Objekt `{…}` waere
  // gueltiges JSON und fiele erst in der Datenbank.
  if (!Array.isArray(e.daily_activities)
    || e.daily_activities.some(a => typeof a !== 'string' || !a.trim())) {
    fehler.push({ feld: 'daily_activities', text: 'Die Tagesaufgaben als Liste von Texten.' })
  }
  return fehler
}

/**
 * Die Zeile, die der Schreibweg sendet — reine Rechnung, damit pruefbar.
 *
 * `[read]` **`status` und `completed_days` fehlen absichtlich** — ihre
 * Vorgaben (`'active'`, `0`) sind genau der Start eines Protokolls.
 */
export function protokollZeile(e: ProtokollEingabe) {
  return {
    protocol_key: e.protocol_key,
    name: e.name.trim(),
    target_condition: PROTOKOLL_ZUSTAND[e.protocol_key as ProtokollArt],
    started_on: e.started_on.trim(),
    duration_days: Number(e.duration_days),
    daily_activities: e.daily_activities.map(a => a.trim()),
  }
}
