// Aus Sitzungen, Uebungen und Saetzen werden die Kachelzahlen.
//
// **Reine Rechnung** — ohne Datenbank und ohne React, damit sie
// pruefbar bleibt. Dasselbe Muster wie `lib/medical/reihe.ts` (G-60)
// und `lib/goals/lesen.ts:alterAm` (GO-16).
//
// **DIE TRENNLINIE: absolviert gegen geplant.** `[read]` Tom zu G-69:
// *„Volumen, Streak, 1RM und Fortschritt zaehlen nur bis heute — sonst
// behauptet die Anzeige Leistung, die nicht erbracht wurde. Kalender
// und Plan zeigen alle."* Jede Funktion hier sagt in ihrem Kopf, auf
// welcher Seite sie steht.
//
// **KEINE BEWERTUNG.** `[read]` Der Auftrag: *„Keine Bewertung, ob
// jemand gut trainiert."* Hier wird gezaehlt und summiert; es gibt
// keine Note, keine Ampel und keine Empfehlung.

import type { Satz, Sitzung, SitzungsUebung } from './sitzungen-read'

// ── Volumen je Muskelgruppe ─────────────────────────────────────

export type MuskelVolumen = {
  muskel: string
  saetze: number
  volumen_kg: number
  wiederholungen: number
}

/**
 * Volumen je Muskel-Wurzelgruppe — **nur absolvierte Sitzungen.**
 *
 * `[cmd]` Eine Uebung kann mehrere Primaermuskeln haben (Kniebeuge:
 * Glutes, Quadriceps, Gluteus Medius). **Das Volumen wird dann jeder
 * Gruppe voll zugerechnet, nicht geteilt** — so zaehlt die Vorlage
 * („Sets per muscle"), und so zaehlt auch die Trainingsliteratur:
 * ein Satz Kniebeugen ist ein Satz fuer die Beine, kein halber.
 *
 * `[read]` Die Folge muss in der Anzeige stehen: **die Summe ueber
 * alle Muskeln ist groesser als das Gesamtvolumen.** Wer das nicht
 * sagt, laesst eine Zahl falsch aussehen.
 */
export function volumenJeMuskel(
  sitzungen: Sitzung[],
  uebungen: SitzungsUebung[],
  muskeln: Map<string, string[]>,
  nurAbsolvierte = true,
): MuskelVolumen[] {
  const erlaubt = new Set(
    sitzungen.filter(s => !nurAbsolvierte || s.absolviert).map(s => s.id))

  const summe = new Map<string, MuskelVolumen>()
  for (const u of uebungen) {
    if (!erlaubt.has(u.workout_session_id)) continue
    const gruppen = u.exercise_id ? muskeln.get(u.exercise_id) ?? [] : []
    if (gruppen.length === 0) continue
    for (const m of gruppen) {
      const bisher = summe.get(m) ?? { muskel: m, saetze: 0, volumen_kg: 0, wiederholungen: 0 }
      bisher.saetze += u.actual_sets ?? 0
      bisher.volumen_kg += u.actual_volume_kg ?? 0
      bisher.wiederholungen += u.total_reps ?? 0
      summe.set(m, bisher)
    }
  }
  return Array.from(summe.values()).sort((a, b) => b.volumen_kg - a.volumen_kg)
}

// ── Serie (Streak) ──────────────────────────────────────────────

export type Serie = {
  /** Wochen in Folge mit mindestens einer absolvierten Sitzung. */
  wochen: number
  /** Die laengste solche Folge im Bestand. */
  laengste: number
  /** Kalenderwochen mit ihrer Sitzungszahl, alt nach neu. */
  wochenreihe: Array<{ woche: string; sitzungen: number }>
}

/** Montag der Woche eines Datums, als `YYYY-MM-DD`. */
export function wochenanfang(datum: string): string {
  const d = new Date(`${datum}T12:00:00`)
  if (Number.isNaN(d.getTime())) return datum
  // `getDay()`: 0 = Sonntag. Montag als Wochenanfang.
  const versatz = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - versatz)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const t = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${t}`
}

/**
 * Die Trainingsserie — **nur absolvierte Sitzungen.**
 *
 * `[read]` Tom zu G-69: *„Streak rechnet nur bis heute — eine Serie,
 * die sich aus geplanten Trainings speist, ist keine Serie."*
 *
 * `[cmd]` Gezaehlt werden **Wochen**, nicht Tage: die Vorlage
 * beschriftet die Kachel „last 12 weeks", und ein Trainingsplan mit
 * drei Einheiten je Woche haette an Tagen gemessen nie eine Serie.
 *
 * Die laufende Serie endet an der Woche des Stichtags. Eine Luecke
 * setzt sie zurueck.
 */
export function serie(sitzungen: Sitzung[], stichtag: string, wochen = 12): Serie {
  const jeWoche = new Map<string, number>()
  for (const s of sitzungen) {
    if (!s.absolviert) continue
    const w = wochenanfang(s.session_date)
    jeWoche.set(w, (jeWoche.get(w) ?? 0) + 1)
  }

  // Die letzten `wochen` Kalenderwochen bis zum Stichtag, lueckenlos.
  const reihe: Array<{ woche: string; sitzungen: number }> = []
  const start = new Date(`${wochenanfang(stichtag)}T12:00:00`)
  for (let i = wochen - 1; i >= 0; i -= 1) {
    const d = new Date(start.getTime())
    d.setDate(d.getDate() - i * 7)
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const t = String(d.getDate()).padStart(2, '0')
    const w = `${d.getFullYear()}-${m}-${t}`
    reihe.push({ woche: w, sitzungen: jeWoche.get(w) ?? 0 })
  }

  // Laufend: von hinten zaehlen, bis eine Woche leer ist.
  let laufend = 0
  for (let i = reihe.length - 1; i >= 0; i -= 1) {
    if (reihe[i].sitzungen > 0) laufend += 1
    else break
  }

  // Laengste Folge ueber ALLE Wochen mit Sitzungen, nicht nur die
  // gezeigten zwoelf — sonst waere „laengste" eine Aussage ueber den
  // Bildausschnitt.
  const alle = Array.from(jeWoche.keys()).sort()
  let laengste = 0
  let lauf = 0
  let vorige: string | null = null
  for (const w of alle) {
    if (vorige === null) lauf = 1
    else {
      const a = new Date(`${vorige}T12:00:00`)
      a.setDate(a.getDate() + 7)
      const m = String(a.getMonth() + 1).padStart(2, '0')
      const t = String(a.getDate()).padStart(2, '0')
      lauf = `${a.getFullYear()}-${m}-${t}` === w ? lauf + 1 : 1
    }
    if (lauf > laengste) laengste = lauf
    vorige = w
  }

  return { wochen: laufend, laengste, wochenreihe: reihe }
}

// ── Kraftverlauf je Uebung ──────────────────────────────────────

export type Kraftverlauf = {
  exercise_id: string | null
  name: string
  /** Punkte alt → neu, je absolvierter Sitzung. */
  punkte: Array<{ datum: string; e1rm: number }>
  bestes_e1rm: number
  max_gewicht_kg: number
  gesamt_volumen_kg: number
  saetze: number
  /** Aenderung erste → letzte Messung in Prozent, `null` bei n < 2. */
  trend_pct: number | null
}

/**
 * Der e1RM-Verlauf je Uebung — **nur absolvierte Sitzungen.**
 *
 * `[read]` **Hier loest sich der offene Punkt aus G-64.** Dort deckte
 * `e1RM` nur 6 von 1.416 Katalogeintraegen, und 1.410 zeigten einen
 * Strich; der Vorschlag war ein eigener Bereich „meine Uebungen".
 * `[cmd]` Diese Funktion zeigt **nur, was Verlauf hat** — das sind
 * zwangslaeufig die trainierten Uebungen. Ein eigener Bereich waere
 * eine zweite Ansicht derselben sechs.
 */
export function kraftverlauf(
  sitzungen: Sitzung[],
  uebungen: SitzungsUebung[],
  saetze: Satz[],
): Kraftverlauf[] {
  const datumJeSitzung = new Map(sitzungen.map(s => [s.id, s]))
  const saetzeJeUebung = new Map<string, Satz[]>()
  for (const s of saetze) {
    const liste = saetzeJeUebung.get(s.workout_exercise_id)
    if (liste) liste.push(s)
    else saetzeJeUebung.set(s.workout_exercise_id, [s])
  }

  // Gruppiert nach Katalog-Uebung; ohne `exercise_id` nach Namen,
  // damit zwei namenlose nicht zusammenfallen.
  const gruppen = new Map<string, Kraftverlauf>()
  for (const u of uebungen) {
    const sitzung = datumJeSitzung.get(u.workout_session_id)
    if (!sitzung || !sitzung.absolviert) continue

    const schluessel = u.exercise_id ?? `name:${u.exercise_name}`
    const eintrag = gruppen.get(schluessel) ?? {
      exercise_id: u.exercise_id,
      name: u.exercise_name,
      punkte: [],
      bestes_e1rm: 0,
      max_gewicht_kg: 0,
      gesamt_volumen_kg: 0,
      saetze: 0,
      trend_pct: null,
    }

    if (u.best_estimated_1rm != null) {
      eintrag.punkte.push({ datum: sitzung.session_date, e1rm: u.best_estimated_1rm })
      if (u.best_estimated_1rm > eintrag.bestes_e1rm) {
        eintrag.bestes_e1rm = u.best_estimated_1rm
      }
    }
    if (u.max_weight_kg != null && u.max_weight_kg > eintrag.max_gewicht_kg) {
      eintrag.max_gewicht_kg = u.max_weight_kg
    }
    eintrag.gesamt_volumen_kg += u.actual_volume_kg ?? 0
    eintrag.saetze += (saetzeJeUebung.get(u.id) ?? []).length
    gruppen.set(schluessel, eintrag)
  }

  const raus = Array.from(gruppen.values())
  for (const k of raus) {
    k.punkte.sort((a, b) => a.datum.localeCompare(b.datum))
    if (k.punkte.length >= 2) {
      const erst = k.punkte[0].e1rm
      const letzt = k.punkte[k.punkte.length - 1].e1rm
      k.trend_pct = erst === 0 ? null : Math.round(((letzt - erst) / erst) * 1000) / 10
    }
  }
  return raus.sort((a, b) => b.bestes_e1rm - a.bestes_e1rm)
}

// ── Kraftstandards ──────────────────────────────────────────────

/**
 * Verhaeltnis e1RM zu Koerpergewicht.
 *
 * `[read]` Tom zu G-69: *„Standards braucht das Koerpergewicht mit
 * Stichtag."* Deshalb kommt das Gewicht von aussen und wird nicht hier
 * geholt — die Funktion weiss nicht, welcher Tag gilt.
 *
 * **KEINE EINSTUFUNG.** `[cmd]` Die Vorlage vergibt `Beginner`,
 * `Novice`, `Intermediate`, `Elite` gegen Schwellen, die sie selbst
 * mitbringt (`module-training-spec.jsx`). `[read]` Das ist eine
 * Bewertung eines Menschen, und im Repo liegt keine belegte Quelle
 * dafuer — dieselbe Lage wie bei MEV/MAV/MRV. **Gezeigt wird das
 * Verhaeltnis, nicht die Klasse.**
 */
export function kraftVerhaeltnis(
  e1rm: number | null, gewichtKg: number | null,
): number | null {
  if (e1rm == null || gewichtKg == null || gewichtKg <= 0) return null
  return Math.round((e1rm / gewichtKg) * 100) / 100
}

// ── Kennzahlen ueber alles ──────────────────────────────────────

export type Kennzahlen = {
  sitzungen_absolviert: number
  sitzungen_geplant: number
  saetze: number
  volumen_kg: number
  wiederholungen: number
  prs: number
  /** Durchschnittsdauer der absolvierten Sitzungen. */
  dauer_schnitt: number | null
}

/** Summen — **nur absolvierte Sitzungen** ausser bei `sitzungen_geplant`. */
export function kennzahlen(
  sitzungen: Sitzung[], uebungen: SitzungsUebung[], saetze: Satz[],
): Kennzahlen {
  const absolvierte = sitzungen.filter(s => s.absolviert)
  const erlaubt = new Set(absolvierte.map(s => s.id))
  const uebungsIds = new Set(
    uebungen.filter(u => erlaubt.has(u.workout_session_id)).map(u => u.id))
  const eigene = saetze.filter(s => uebungsIds.has(s.workout_exercise_id))
  const dauern = absolvierte
    .map(s => s.duration_minutes)
    .filter((d): d is number => d != null)

  return {
    sitzungen_absolviert: absolvierte.length,
    sitzungen_geplant: sitzungen.length - absolvierte.length,
    saetze: eigene.length,
    volumen_kg: absolvierte.reduce((n, s) => n + (s.total_volume_kg ?? 0), 0),
    wiederholungen: absolvierte.reduce((n, s) => n + (s.total_reps ?? 0), 0),
    prs: eigene.filter(s => s.is_pr).length,
    dauer_schnitt: dauern.length
      ? Math.round(dauern.reduce((a, b) => a + b, 0) / dauern.length)
      : null,
  }
}
