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
  // G-590: optional — fehlt eins, laesst der Schreibweg die Spalte
  // unberuehrt, statt sie beim `upsert` zu leeren. Das Check-in-
  // Formular fuehrt alle drei nicht.
  energy_level?: string
  motivation?: string
  stress_level: string
  // G-590: die vier Felder, die das Formular fuehrt und die bis hier
  // nicht gespeichert wurden. `[cmd]` Die drei Zahlen tragen je einen
  // CHECK `>= 0`; `soreness` nur `jsonb_typeof = 'object'`.
  alcohol_units: string
  caffeine_mg: string
  screen_time_before_bed: string
  /** Muskelkater je Recovery-Kuerzel, Stufen 0-3 wie im Formular. */
  soreness: Record<string, number>
  notes?: string
}

export const LEERER_CHECKIN: CheckinEingabe = {
  entry_date: '', checkin_time: '', sleep_hours: '', sleep_quality: '',
  subjective_feeling: '', mood: 'neutral', energy_level: '',
  motivation: '', stress_level: '', alcohol_units: '', caffeine_mg: '',
  screen_time_before_bed: '', soreness: {}, notes: '',
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
  skala(fehler, 'energy_level', e.energy_level ?? '', 'Energie')
  skala(fehler, 'motivation', e.motivation ?? '', 'Motivation')
  skala(fehler, 'stress_level', e.stress_level, 'Stress')
  // `[cmd]` G-590: `checkins_alcohol_units_check` (numeric),
  // `_caffeine_mg_check` und `_screen_time_before_bed_check` (integer)
  // — alle drei `>= 0`.
  for (const [feld, roh, ganzzahlig, text] of [
    ['alcohol_units', e.alcohol_units, false, 'Alkohol: nicht negativ.'],
    ['caffeine_mg', e.caffeine_mg, true, 'Koffein: ganze mg, nicht negativ.'],
    ['screen_time_before_bed', e.screen_time_before_bed, true,
      'Bildschirmzeit: ganze Minuten, nicht negativ.'],
  ] as const) {
    const n = zahl(roh)
    if (n !== null && (Number.isNaN(n) || n < 0 || (ganzzahlig && !Number.isInteger(n)))) {
      fehler.push({ feld, text })
    }
  }
  // `[read]` Das Schema prueft nur, dass es ein Objekt ist. Die Stufen
  // 0-3 sind die des Formulars und des Lesewegs (`checkin-read.ts`).
  if (Object.values(e.soreness ?? {}).some(v => !Number.isInteger(v) || v < 0 || v > 3)) {
    fehler.push({ feld: 'soreness', text: 'Muskelkater: Stufe 0 bis 3.' })
  }
  return fehler
}

/**
 * G-590: die Check-in-Spalten jenseits der Pflichtfelder, so wie sie
 * der `upsert` sendet.
 *
 * `[read]` **Ein fehlendes Feld fehlt auch im Ergebnis** — PostgREST
 * setzt beim `upsert` nur gesendete Spalten. Ein zweites Speichern
 * aus dem Formular, das Energie, Motivation und Notiz nicht fuehrt,
 * laesst deren Bestandswert deshalb stehen, statt ihn zu leeren.
 *
 * `[cmd]` **`soreness` im Bestand traegt nur Stufen 1-3** (gemessen
 * 2026-10-03) — eine 0 heisst *kein Kater* und wird nicht abgelegt.
 */
export function checkinZusatz(e: CheckinEingabe): Record<string, unknown> {
  const n = (roh: string) => {
    const z = zahl(roh)
    return z === null || Number.isNaN(z) ? null : z
  }
  const g = (roh: string) => { const z = n(roh); return z === null ? null : Math.round(z) }
  return {
    ...(e.energy_level !== undefined && { energy_level: g(e.energy_level) }),
    ...(e.motivation !== undefined && { motivation: g(e.motivation) }),
    ...(e.notes !== undefined && { notes: e.notes.trim() || null }),
    alcohol_units: n(e.alcohol_units),
    caffeine_mg: g(e.caffeine_mg),
    screen_time_before_bed: g(e.screen_time_before_bed),
    soreness: Object.fromEntries(
      Object.entries(e.soreness ?? {}).filter(([, v]) => v > 0)),
  }
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
