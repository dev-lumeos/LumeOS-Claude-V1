// G-628 Teil 3 — Weg B „Messziel hinzufügen" (Dossier 8.3), rein.
//
// `[cmd]` **Datenseite `supabase/_pipeline/11_goals/617_measurement_goal_expansion.sql`:**
// `goals.measurement_goal_create(...)` legt an, der Trigger
// `g617_measurement_goal_snapshot` haelt den Startwert fest und lehnt ab
// (`G617_*`). `[read]` **Hier steht nur, was der Aufruf braucht** — welche
// Einheit die Kette je Messart verlangt, welcher Rhythmus fest ist, und der
// Satz zu jeder Ablehnung. Startwert, Quelle und Prioritaet rechnet die Kette.
//
// `[read]` **Ein Messziel bekommt nie Phase oder Strategie.** Dieser Weg ruft
// nur `measurement_goal_create`; die Rolle `measurement` setzt die Kette.

export type Kategorie = 'koerper' | 'kraft' | 'gewohnheit' | 'eigenes'
export type Rhythmus = 'once' | 'weekly'

/**
 * Je Messart: Kategorie, Name, die Einheit, die der Trigger verlangt
 * (`G617_UNIT` / `G617_HABIT`), und der feste Rhythmus aus
 * `user_goals_measurement_source_check` (null = waehlbar).
 */
export const MESSARTEN = {
  body_weight: { kategorie: 'koerper', name: 'Gewicht', einheit: 'kg', rhythmus: null },
  body_fat: { kategorie: 'koerper', name: 'Körperfett', einheit: '%', rhythmus: null },
  circumference: { kategorie: 'koerper', name: 'Umfang', einheit: 'cm', rhythmus: null },
  e1rm: { kategorie: 'kraft', name: 'geschätztes 1RM', einheit: 'kg', rhythmus: 'once' },
  weight_reps: { kategorie: 'kraft', name: 'Gewicht bei X Wdh.', einheit: 'kg', rhythmus: 'once' },
  training_sessions_week: { kategorie: 'gewohnheit', name: 'Trainings / Woche', einheit: 'sessions_per_week', rhythmus: 'weekly' },
  cardio_sessions_week: { kategorie: 'gewohnheit', name: 'Cardio / Woche', einheit: 'sessions_per_week', rhythmus: 'weekly' },
  sleep_hours_night: { kategorie: 'gewohnheit', name: 'Schlaf h / Nacht', einheit: 'h/night', rhythmus: 'weekly' },
  steps_day: { kategorie: 'gewohnheit', name: 'Schritte / Tag', einheit: null, rhythmus: 'weekly' },
  custom: { kategorie: 'eigenes', name: 'Eigenes', einheit: null, rhythmus: null },
} as const satisfies Record<string, {
  kategorie: Kategorie; name: string; einheit: string | null; rhythmus: Rhythmus | null
}>
export type Messart = keyof typeof MESSARTEN

export const artenVon = (k: Kategorie) =>
  (Object.keys(MESSARTEN) as Messart[]).filter(a => MESSARTEN[a].kategorie === k)

/** Die 13 Stellen aus `goals.measurement_circumference_sites`, lesbar. */
export const STELLEN: Record<string, string> = {
  neck_cm: 'Hals', shoulders_cm: 'Schultern', chest_cm: 'Brust',
  upper_arm_left_cm: 'Oberarm links', upper_arm_right_cm: 'Oberarm rechts',
  forearm_left_cm: 'Unterarm links', forearm_right_cm: 'Unterarm rechts',
  waist_cm: 'Taille', hip_cm: 'Hüfte', thigh_left_cm: 'Oberschenkel links',
  thigh_right_cm: 'Oberschenkel rechts', calf_left_cm: 'Wade links', calf_right_cm: 'Wade rechts',
}

/** Einheit zum Lesen — die gespeicherte bleibt die der Kette. */
export const einheitLesbar = (e: string | null) =>
  e === 'sessions_per_week' ? 'pro Woche' : e === 'h/night' ? 'h' : e ?? ''

export interface Messformular {
  art: Messart
  titel: string
  ziel: string
  frist: string
  rhythmus: Rhythmus
  stelle: string | null
  uebungId: string | null
  wdh: string
  einheit: string
  richtung: 'more' | 'less' | null
  start: string
}

const zahl = (s: string) => { const n = Number(s.replace(',', '.')); return s.trim() !== '' && Number.isFinite(n) ? n : null }

/** Die zwoelf Parameter von `measurement_goal_create` — oder der Grund, warum nicht. */
export function messzielParameter(f: Messformular, heute: string):
  { ok: true; p: Record<string, string | number | null> } | { ok: false; fehler: string } {
  const a = MESSARTEN[f.art]
  const ziel = zahl(f.ziel)
  if (ziel === null) return { ok: false, fehler: 'Bitte einen Zielwert eintragen.' }
  if (!f.titel.trim()) return { ok: false, fehler: 'Bitte einen Titel eintragen.' }
  if (f.art === 'circumference' && !f.stelle) return { ok: false, fehler: 'Bitte die Stelle wählen.' }
  if (a.kategorie === 'kraft' && !f.uebungId) return { ok: false, fehler: 'Bitte eine Übung wählen.' }
  const wdh = f.art === 'weight_reps' ? zahl(f.wdh) : null
  if (f.art === 'weight_reps' && (wdh === null || !Number.isInteger(wdh) || wdh < 1)) return { ok: false, fehler: 'Bitte die Wiederholungen als ganze Zahl eintragen.' }
  if (a.kategorie === 'gewohnheit' && ziel <= 0) return { ok: false, fehler: 'Der Zielwert muss über null liegen.' }
  const start = f.art === 'custom' ? zahl(f.start) : null
  if (f.art === 'custom' && (start === null || !f.einheit.trim() || !f.richtung)) {
    return { ok: false, fehler: 'Bitte Startwert, Einheit und „besser ist" angeben.' }
  }
  return {
    ok: true,
    p: {
      p_measurement_type: f.art,
      p_title: f.titel.trim(),
      p_target_value: ziel,
      p_target_unit: f.art === 'custom' ? f.einheit.trim() : a.einheit,
      p_gueltig_ab: heute,
      p_target_date: f.frist || null,
      p_exercise_id: a.kategorie === 'kraft' ? f.uebungId : null,
      p_measurement_reps: wdh,
      p_measurement_site: f.art === 'circumference' ? f.stelle : null,
      p_measurement_rhythm: a.rhythmus ?? f.rhythmus,
      p_better_direction: f.art === 'custom' ? f.richtung : null,
      p_start_value: start,
    },
  }
}

/** `G617_*` als Satz. Unbekanntes bleibt Rohtext — lieber sichtbar als verschluckt. */
const SAETZE: Record<string, string> = {
  FIRST_MEASURE: 'Erst messen: für diese Messgröße gibt es noch keinen Wert. Trag zuerst eine Messung ein.',
  SOURCE_PENDING: 'Diese Gewohnheit kommt noch — ihre Quelle fehlt.',
  SITE: 'Bitte eine der 13 Körperstellen wählen.',
  UNIT: 'Die Einheit passt nicht zur Messart.',
  STRENGTH: 'Kraftziele brauchen eine Übung und sind einmalig.',
  HABIT: 'Gewohnheiten sind wöchentlich und brauchen einen Zielwert über null.',
  CUSTOM: 'Bitte Startwert, Einheit und „besser ist" angeben.',
  INPUT: 'Titel, Zielwert und Datum sind nötig.',
  TYPE: 'Diese Messart kennt die Datenbank nicht.',
  AUTH: 'Deine Anmeldung ist abgelaufen. Bitte neu anmelden.',
}
export function messzielSatz(text: string): string {
  const m = /G617_([A-Z_]+):/.exec(text)
  return (m && SAETZE[m[1]!]) ?? text
}

export interface Startstand {
  start_value: number | null
  start_source: string | null
  start_measured_at: string | null
  target_unit: string | null
}

/** Der Startwert, wie die Kette ihn festgehalten hat — in Worten. */
export function startSatz(s: Startstand): string {
  if (s.start_value === null) return 'Noch kein Wert — Start ist dein erstes Training danach.'
  const wert = `${String(s.start_value).replace('.', ',')} ${einheitLesbar(s.target_unit)}`.trim()
  const q = s.start_source ?? ''
  const woher = q.includes('4week_average') ? 'Schnitt der letzten 4 Wochen'
    : q.startsWith('training.') ? 'bester Wert aus deinen Trainings'
      : q.startsWith('goals.user_goals') ? 'selbst eingetragen' : 'letzte Messung'
  const am = s.start_measured_at ? ` am ${s.start_measured_at.split('-').reverse().join('.')}` : ''
  return `Startwert ${wert} festgehalten (${woher}${am}).`
}
