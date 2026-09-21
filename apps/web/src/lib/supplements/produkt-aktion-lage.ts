// Was man mit einem Produkt tun kann — G-484.
//
// **Tom, 2026-09-19:** *„in supplements, wenn ich ein produkt suche
// und waehlen will, muss die funktion her, dass ich es einem stack
// zuweisen kann mit den noetigen angaben, oder einem meal hinzufuegen
// kann"*
//
// **Und die Praezisierung:** *„das muss natuerlich so gebaut werden,
// dass man waehlen kann, in welchen stack / in welches heutige
// meal"* — **nicht eine Aktion, sondern eine WAHL.**
//
// ══ WARUM DIE FORM ENTSCHEIDET ══════════════════════════════════════
//
// **Tom, 2026-09-08:** *„pillen/tablet/capsule gehoeren nicht in
// meals — der wird nicht eine tablette zerhacken, nur dass es in einen
// shake rein passt."*
//
// `[read]` **Die Regel steht in `such-quellen-lage.ts`** (G-480) —
// **hier wird sie GERUFEN, nicht nachgebaut.**

import { darfInMahlzeit } from '../nutrition/such-quellen-lage'

/** Wohin ein Produkt kann. */
export type Ziel = 'stack' | 'mahlzeit'

/**
 * Welche Ziele stehen diesem Produkt offen?
 *
 * `[cmd]` **Gemessen, On Market:** 47.655 von 121.959 Produkten sind
 * untermischbar (39,1 %) — **der Rest kann nur in den Stack.**
 *
 * `[read]` **Der Stack steht IMMER offen** — auch ein Pulver kann man
 * taeglich einnehmen, ohne es in eine Mahlzeit zu ruehren.
 */
export function zieleFuer(produktform: string | null | undefined): Ziel[] {
  return darfInMahlzeit(produktform)
    ? ['stack', 'mahlzeit']
    : ['stack']
}

/**
 * Warum eine Kapsel nicht in die Mahlzeit darf.
 *
 * `[read]` **Der Satz muss dastehen, nicht nur die Abwesenheit des
 * Knopfes** — sonst haelt jemand die fehlende Wahl fuer einen Fehler
 * (dieselbe Klasse wie G-486).
 */
export const NUR_STACK_SATZ =
  'Diese Darreichungsform lässt sich nicht untermischen — sie gehört '
  + 'in den Stack, nicht in eine Mahlzeit.'

// ══ DIE ANGABEN FUER DEN STACK ══════════════════════════════════════
//
// `[cmd]` **Gemessen an `supplements.stack_items`:** `dose` und
// `dose_unit` sind NOT NULL, `frequency` und `timing` haben Vorgaben
// und je einen CHECK.

export const TIMINGS = [
  'morning', 'midday', 'evening',
  'pre_workout', 'post_workout', 'bedtime', 'with_meal', 'any',
] as const
export type Timing = (typeof TIMINGS)[number]

export const TIMING_TEXT: Readonly<Record<Timing, string>> = {
  morning: 'Morgens',
  midday: 'Mittags',
  evening: 'Abends',
  pre_workout: 'Vor dem Training',
  post_workout: 'Nach dem Training',
  bedtime: 'Vor dem Schlafen',
  with_meal: 'Zu einer Mahlzeit',
  any: 'Egal wann',
}

export const FREQUENZEN = [
  'daily', 'weekdays', 'training_days', 'custom', 'cycling',
] as const
export type Frequenz = (typeof FREQUENZEN)[number]

export const FREQUENZ_TEXT: Readonly<Record<Frequenz, string>> = {
  daily: 'Täglich',
  weekdays: 'Werktags',
  training_days: 'An Trainingstagen',
  custom: 'Eigener Rhythmus',
  cycling: 'Im Zyklus',
}

/**
 * Die Vorgabe fuer die Dosiseinheit.
 *
 * `[read]` **Die Portionseinheit des Produkts, wenn es eine hat** —
 * *„1 Scoop"* ist naeher an der Packung als *„1 Portion"*.
 * `[cmd]` **`dose_unit` darf nicht leer sein** (CHECK).
 */
export function dosisEinheitVorgabe(portionseinheit: string | null): string {
  const p = (portionseinheit ?? '').trim()
  return p.length > 0 ? p : 'Portion'
}

export type StackEingabe = {
  stack_id: string
  dose: number
  dose_unit: string
  frequency: Frequenz
  timing: Timing
}

/**
 * Taugt die Eingabe?
 *
 * `[read]` **Dieselben Grenzen wie die CHECKs** — damit die Meldung
 * aus der Anwendung kommt und nicht aus Postgres.
 */
export function pruefeStackEingabe(e: Partial<StackEingabe>): string | null {
  if (!e.stack_id) return 'Bitte einen Stack wählen.'
  if (typeof e.dose !== 'number' || !Number.isFinite(e.dose) || e.dose <= 0) {
    return 'Die Dosis muss grösser als 0 sein.'
  }
  if (!e.dose_unit || !e.dose_unit.trim()) return 'Die Einheit fehlt.'
  if (!e.timing || !TIMINGS.includes(e.timing)) return 'Bitte einen Zeitpunkt wählen.'
  if (!e.frequency || !FREQUENZEN.includes(e.frequency)) {
    return 'Bitte eine Häufigkeit wählen.'
  }
  return null
}

// ══ C-518: WARUM DER STACK DEN NAMEN TRAEGT, NICHT DIE SUBSTANZ ═════
//
// `[cmd]` **C-518 hat gemessen:** `stack_items` fuehrt SUBSTANZEN,
// nicht Produkte. *„Fuer die sieben Stack-Stoffe gibt es jeweils
// 1.478 bis 29.004 Produktkandidaten, nie genau einer."*
//
// `[cmd]` **Codex empfiehlt ein optionales Produkt ZUSAETZLICH zur
// optionalen Substanz** — **das ist nicht gebaut** (gemessen
// 2026-09-21: `stack_items` hat keine Produktspalte).
//
// `[cmd]` **Der CHECK laesst beides zu:**
// `supplement_id IS NOT NULL OR custom_name IS NOT NULL`.
//
// `[read]` **Also traegt der Eintrag den PRODUKTNAMEN** (`custom_name`)
// — **das ist, was der Nutzer gewaehlt hat.** `[read]` **Eine
// Substanz zu raten waere schlimmer:** aus 29.004 Kandidaten eine
// auszusuchen hiesse, eine Zuordnung zu behaupten, die niemand
// gemessen hat.

/** Der Name, unter dem das Produkt im Stack steht. */
export function stackName(name: string, marke: string | null): string {
  const m = (marke ?? '').trim()
  return m.length > 0 && !name.startsWith(m) ? `${m} ${name}` : name
}
