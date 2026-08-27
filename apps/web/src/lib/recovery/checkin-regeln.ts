// Die Regeln fuer Check-in und Modalitaet — G-122.
//
// `[read]` **Serverfrei**, wie `koerpermass-rechnung.ts` daneben und
// aus demselben Grund (A-30): das Formular importiert von hier Werte,
// vom Schreibweg nur Typen.
//
// ══ ALLE GRENZEN SIND AUS DEM SCHEMA GELESEN ════════════════════════
//
// `[cmd]` **Gemessen 2026-08-27 gegen `pg_constraint`** — keine Zahl
// hier ist geraten. Das ist die Lehre aus G-211: die Datenbank bleibt
// die letzte Instanz, aber ein Mensch braucht den Satz am Feld statt
// einer englischen Postgres-Meldung.

/** Die Stimmungen, die `checkins_mood_check` zulaesst. */
export const STIMMUNGEN = [
  'motivated', 'good', 'neutral', 'tired', 'sick',
] as const

/** Die Modalitaeten aus `modality_log_modality_type_check`. */
export const MODALITAETEN = [
  'sauna', 'cold_plunge', 'contrast_therapy', 'massage', 'foam_rolling',
  'stretching', 'yoga', 'meditation', 'breathwork', 'nap',
  'active_recovery', 'other',
] as const

export type Feldfehler = { feld: string; text: string }

export type CheckinEingabe = {
  entry_date: string
  checkin_time: string
  sleep_hours: string
  sleep_quality: string
  subjective_feeling: string
  mood: string
  energy_level: string
  motivation: string
  stress_level: string
  notes: string
}

export const LEERER_CHECKIN: CheckinEingabe = {
  entry_date: '', checkin_time: '', sleep_hours: '', sleep_quality: '',
  subjective_feeling: '', mood: 'neutral', energy_level: '',
  motivation: '', stress_level: '', notes: '',
}

export type ModalitaetEingabe = {
  entry_date: string
  logged_time: string
  modality_type: string
  duration_min: string
  detail: string
  immediate_effect: string
  notes: string
}

export const LEERE_MODALITAET: ModalitaetEingabe = {
  entry_date: '', logged_time: '', modality_type: '', duration_min: '',
  detail: '', immediate_effect: '', notes: '',
}

export function zahl(roh: string): number | null {
  const t = String(roh ?? '').trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

/**
 * Ein Skalenwert 1–10.
 *
 * `[cmd]` **Sieben Spalten in `checkins` tragen dieselbe Grenze** —
 * `sleep_quality`, `subjective_feeling`, `energy_level`,
 * `motivation`, `stress_level`, `work_stress`, `life_stress`.
 * **Eine Funktion, nicht sieben Abschriften.**
 */
function skala(fehler: Feldfehler[], feld: string, roh: string, wort: string) {
  const n = zahl(roh)
  if (n === null) return null
  if (Number.isNaN(n) || n < 1 || n > 10 || !Number.isInteger(n)) {
    fehler.push({ feld, text: `${wort}: eine ganze Zahl von 1 bis 10.` })
    return null
  }
  return n
}

/**
 * Einen Check-in pruefen.
 *
 * `[cmd]` **`checkins_user_id_entry_date_key` ist EINDEUTIG** — je
 * Nutzerin und Tag genau ein Check-in. `[read]` **Das ist kein
 * Fehler, sondern die Fachregel:** man hat einen Zustand pro Tag,
 * nicht drei. Der Schreibweg macht daraus ein `upsert`.
 */
export function pruefeCheckin(e: CheckinEingabe): Feldfehler[] {
  const fehler: Feldfehler[] = []
  if (!e.entry_date.trim()) {
    fehler.push({ feld: 'entry_date', text: 'Für welchen Tag?' })
  }
  if (!(STIMMUNGEN as readonly string[]).includes(e.mood.trim())) {
    fehler.push({ feld: 'mood', text: 'Unbekannte Stimmung.' })
  }
  const std = zahl(e.sleep_hours)
  if (std !== null && (Number.isNaN(std) || std < 0 || std > 14)) {
    // `[cmd]` `checkins_sleep_hours_check`: 0 bis 14.
    fehler.push({ feld: 'sleep_hours', text: 'Zwischen 0 und 14 Stunden.' })
  }
  skala(fehler, 'sleep_quality', e.sleep_quality, 'Schlafqualität')
  skala(fehler, 'subjective_feeling', e.subjective_feeling, 'Gefühl')
  skala(fehler, 'energy_level', e.energy_level, 'Energie')
  skala(fehler, 'motivation', e.motivation, 'Motivation')
  skala(fehler, 'stress_level', e.stress_level, 'Stress')
  return fehler
}

/** Eine Modalitaet pruefen. */
export function pruefeModalitaet(e: ModalitaetEingabe): Feldfehler[] {
  const fehler: Feldfehler[] = []
  if (!e.entry_date.trim()) {
    fehler.push({ feld: 'entry_date', text: 'Für welchen Tag?' })
  }
  if (!(MODALITAETEN as readonly string[]).includes(e.modality_type.trim())) {
    fehler.push({ feld: 'modality_type', text: 'Welche Anwendung?' })
  }
  const dauer = zahl(e.duration_min)
  if (dauer !== null && (Number.isNaN(dauer) || dauer < 0 || !Number.isInteger(dauer))) {
    // `[cmd]` `modality_log_duration_min_check`: >= 0.
    fehler.push({ feld: 'duration_min', text: 'Ganze Minuten, nicht negativ.' })
  }
  skala(fehler, 'immediate_effect', e.immediate_effect, 'Wirkung')
  return fehler
}

/**
 * Warum ein Bonuswert nicht gesetzt wird — der dritte Zustand hier.
 *
 * ══ ER STEHT IM SPALTENVORGABEWERT ══════════════════════════════════
 *
 * `[cmd]` **`modality_log.bonus_source` hat den Vorgabewert
 * `'pending_c124_e5'`** — gemessen 2026-08-27. `bonus_value` steht
 * auf `0`.
 *
 * `[read]` **Die Tabelle sagt selbst, dass ihr Bonus noch nicht
 * entschieden ist.** C-124/E-05 ist offen. **Der Schreibweg setzt
 * beide Felder deshalb NICHT** — er laesst den Vorgabewert stehen,
 * statt eine Null zu schreiben, die wie eine Messung aussieht.
 *
 * `[read]` **Das ist derselbe Unterschied wie in G-208:** *„geprueft
 * und null"* gegen *„noch nicht entschieden"*. Wer `bonus_value: 0`
 * schriebe, behauptete das erste.
 */
export const BONUS_OFFEN =
  'Wie stark eine Anwendung den Erholungswert hebt, ist noch nicht '
  + 'entschieden (C-124). Der Eintrag wird gespeichert, fliesst aber '
  + 'noch in keine Bewertung ein.'
