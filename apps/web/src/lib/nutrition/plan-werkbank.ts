// ════════════════════════════════════════════════════════════════════
// DIE WERKBANK — C-372 / G-306 / C-375
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// **Grundlage:**
//
//     E-40   wozu der Planner da ist
//     E-41   Rollenteilung
//     E-42   editieren ist erlaubt, weiterverkaufen nicht
//            -- loest ADR_IMPROVEMENTS_PACKAGE #17 ab
//     SPEC_01 Abschnitt 8 und 9, SPEC_03 Flow 3
//
// `[cmd]` **`E-42` hat am 2026-08-31 den ADR abgeloest.** `[read]`
// **Die Sperre aus C-372 (409 fuer jeden aktiven Plan) ist damit
// zurueckgebaut** — sie steht jetzt an der einzelnen Position und
// haengt am Protokoll, nicht am Planzustand.

// ══ DIE SPERRE: geloggt heisst eingefroren, nicht „aktiv" ═══════════
//
// **BERICHTIGT am 2026-09-01 durch E-42.** `[cmd]` **`E-42` loest
// `ADR_IMPROVEMENTS_PACKAGE` #17 ab.**
//
// `[cmd]` **In C-372 stand hier: 409 fuer JEDEN aktiven Plan.** Das
// war die Vorgabe, und sie war falsch.
//
// **Tom, 2026-08-31:** *,,wenn wir den einschraenken dass er nicht
// editieren kann dann bescheisst er sich ja selber im sinne: ach ich
// kann nicht editieren dann melde ich einfach etwas anderes das ich
// gegessen habe."*
//
// `[read]` **Eine Sperre, die sich umgehen laesst, macht die Daten
// schlechter.** **Wer den Plan nicht aendern darf, traegt beim Loggen
// etwas Falsches ein — und dann steht im Protokoll eine Abweichung,
// die keine war.**
//
//     geloggt         eingefroren -- das ist Vergangenheit
//     nicht geloggt   frei, auch zukuenftige Plantage
//
// `[cmd]` **Der `resolution_check` an `meal_plan_logs` erzwingt es
// bereits** — am 2026-09-01 aus `pg_constraint` gelesen:
//
//     pending    -> actual_meal_id NULL, confirmation_mode NULL,
//                   confirmed_at NULL, skipped_at NULL
//     confirmed  -> actual_meal_id NOT NULL, confirmed_at NOT NULL
//     deviated   -> zusaetzlich deviation_kcal/-_pct NOT NULL
//     skipped    -> skipped_at NOT NULL
//
// `[read]` **Ein `pending`-Log traegt nichts, was sich verfaelschen
// liesse.** **Deshalb sperrt es nicht.**

/**
 * `[cmd]` **Der CHECK an `meal_plans` kennt fuenf Werte** — am
 * 2026-08-31 aus `pg_constraint` gelesen.
 */
export const PLAN_STATUS = [
  'assigned', 'active', 'completed', 'paused', 'archived',
] as const
export type PlanStatus = (typeof PLAN_STATUS)[number]

/**
 * `[cmd]` **Die vier Log-Zustaende**, aus
 * `meal_plan_logs_status_check`.
 */
export const LOG_STATUS = [
  'pending', 'confirmed', 'deviated', 'skipped',
] as const
export type LogStatus = (typeof LOG_STATUS)[number]

/**
 * Ist DIESE Position eingefroren?
 *
 * `[read]` **Die Frage gilt der Position, nicht dem Plan.** `[cmd]`
 * **E-42: 409 nur, wenn diese Position ein Log mit
 * `status <> 'pending'` traegt.**
 *
 * `[read]` **`null` heisst: kein Log** — dann ist sie frei. **Und ein
 * `pending`-Log ist auch keines im Sinne der Sperre:** es haelt keinen
 * Wert, der sich verfaelschen liesse.
 *
 * `[read]` **Der Plan-Status spielt keine Rolle mehr.** Ein aktiver
 * Plan mit ungeloggten Positionen ist voll bearbeitbar — auch fuer
 * zukuenftige Plantage.
 */
export function positionEingefroren(logStatus: string | null | undefined): boolean {
  if (!logStatus) return false
  return logStatus !== 'pending'
}

/**
 * Warum eingefroren — der Satz, den der Nutzer liest.
 *
 * `[read]` **Kein Ausweg noetig und keiner genannt.** Der Grund ist
 * kein Zustand, der sich aufheben laesst: **diese Mahlzeit ist
 * gegessen oder ausgelassen worden.** Was vergangen ist, bleibt.
 */
export const GELOGGT_SATZ =
  'Diese Position ist protokolliert — sie wurde bestätigt, abgewichen '
  + 'oder ausgelassen. Vergangenes bleibt stehen, damit die Auswertung '
  + 'stimmt. Für heute und morgen kannst du frei planen.'

/** Die Marke an einer eingefrorenen Position. */
export const GELOGGT_MARKE = 'protokolliert'

// ══ C-375/E-42: das Flag heisst Weiterverkauf, nicht Bearbeiten ═════
//
// **Tom, 2026-08-31:** *,,wenn ich einen plan kaufe dann ist das mein
// plan, aber ein Coach der einen mealplan auf marketplace verkauft,
// dass der nicht wiederverkaufbar wird."*
//
// `[read]` **In C-372 stand hier `darf_bearbeiten`** — **das falsche
// Flag.** `[cmd]` **E-42: gemeint ist ein Weiterverkaufsschutz, kein
// Editierschutz.**
//
//     Weiterverkauf   ein gekaufter Plan darf nicht weiterverkauft
//                     werden -- ein Lizenzthema
//     Editieren       darf nie gesperrt werden -- der Nutzer besitzt
//                     seinen Plan
//
// `[read]` **Die Anzeige sagt es, sie sperrt nicht.**

/**
 * Darf dieser Plan weiterverkauft werden?
 *
 * `[cmd]` **Die Spalte heisst `darf_weiterverkaufen`, `NOT NULL
 * DEFAULT true`.** `[read]` **`undefined` heisst: noch nicht
 * gelesen** — dann gilt die Vorgabe.
 *
 * `[read]` **Diese Frage sperrt NICHTS in der Oberflaeche.** Es gibt
 * keinen Weiterverkauf zu verhindern, solange es keinen Marktplatz
 * gibt (E-39). **Das Flag wird angezeigt, damit die Einschraenkung
 * sichtbar ist, bevor sie greift.**
 */
export function darfWeiterverkaufen(flag: boolean | null | undefined): boolean {
  return flag !== false
}

export const KEIN_WEITERVERKAUF_SATZ =
  'Dieser Plan darf nicht weiterverkauft werden. Ändern und verwenden '
  + 'kannst du ihn frei — er gehört dir.'

export const KEIN_WEITERVERKAUF_MARKE = 'nicht weiterverkäuflich'

// ══ WAS HIER NICHT MEHR STEHT ═══════════════════════════════════════
//
// `[cmd]` **`positionenGesperrt`, `AKTIV_GESPERRT_SATZ`,
// `AKTIV_AUSWEG_SATZ`, `darfBearbeiten`, `FREMD_GESPERRT_SATZ`,
// `sperreVon`, `SPERRE_MARKE` und `kopieHilft` sind entfernt** —
// A-59.
//
// `[read]` **Sie gehoerten zu einer Sperre, die es so nicht geben
// soll.** `[cmd]` **Und `planKopieren` faellt mit ihnen:** *,,Kopie
// bearbeiten"* war die Antwort auf diese Sperre.
//
// `[read]` **Einen Plan zu duplizieren mag sinnvoll sein** — aber
// dann als Bibliotheksfunktion mit eigener Begruendung, nicht als
// Ausweg aus einer aufgehobenen Regel. **Der Auftrag laesst die Wahl,
// und das ist sie.**

// ══ C-372: die Wochen eines neuen Plans ═════════════════════════════
//
// **E-40:** *,,Was beim Anlegen zaehlt: Name, Beschreibung,
// Tagesziele, und wie viele Wochen. Dann steht ein leerer Plan in der
// Werkbank, und der Nutzer fuellt ihn."*
//
// `[cmd]` **Gemessen am 2026-08-31:**
//
//     meal_plan_weeks   plan_id, user_id, week_start NOT NULL
//                       UNIQUE (plan_id, week_start)
//     meal_plan_days    day_index CHECK 1..7
//                       UNIQUE (week_id, plan_date)
//                       UNIQUE (week_id, day_index)
//
// `[read]` **`week_start` ist NOT NULL, aber ein Plan hat beim Bauen
// KEIN Startdatum** (E-40: das entsteht beim Aktivieren). **Der
// Widerspruch ist echt und unten geloest.**

/** Wie viele Wochen ein neuer Plan bekommt — E-40. */
export const WOCHEN_MIN = 1
export const WOCHEN_MAX = 12

/**
 * Die `week_start`-Daten fuer einen neuen Plan.
 *
 * `[read]` **Der Widerspruch:** `week_start` ist NOT NULL, ein Plan
 * im Entwurf hat aber kein Startdatum. **Ihn mit `NULL` zu umgehen
 * ginge nicht, ihn zu erfinden waere eine Behauptung.**
 *
 * `[read]` **Geloest ueber einen ANKER:** die Wochen liegen relativ
 * zueinander, verankert an einem willkuerlichen, aber festen Datum.
 * **Beim Aktivieren werden sie auf das echte Startdatum verschoben**
 * (Flow 3, Schritt 5) — die Abstaende bleiben, das Datum wird
 * richtig.
 *
 * `[cmd]` **Der Anker ist der Montag der Woche, in der der Plan
 * angelegt wird** — damit `UNIQUE (plan_id, week_start)` haelt und
 * die Reihenfolge stimmt. **Er ist keine Aussage ueber den Start.**
 */
export function wochenAnker(heute: string): string {
  const d = new Date(`${heute}T00:00:00Z`)
  // Montag = 1; getUTCDay liefert 0 fuer Sonntag.
  const versatz = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - versatz)
  return d.toISOString().slice(0, 10)
}

/** Die `week_start`-Daten fuer `n` Wochen ab dem Anker. */
export function wochenDaten(anker: string, anzahl: number): string[] {
  const zahl = Math.min(Math.max(Math.round(anzahl), WOCHEN_MIN), WOCHEN_MAX)
  const aus: string[] = []
  for (let i = 0; i < zahl; i += 1) {
    const d = new Date(`${anker}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + i * 7)
    aus.push(d.toISOString().slice(0, 10))
  }
  return aus
}

/**
 * Die sieben Tage einer Woche.
 *
 * `[cmd]` **`day_index` CHECK 1..7** — nicht 0-basiert. `[cmd]` **Am
 * 2026-08-31 gemessen: ein Insert mit `day_index = 0` wird
 * abgewiesen** (`meal_plan_days_day_index_check`).
 */
export function tageDerWoche(weekStart: string): Array<{
  plan_date: string; day_index: number
}> {
  const aus = []
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(`${weekStart}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + i)
    aus.push({ plan_date: d.toISOString().slice(0, 10), day_index: i + 1 })
  }
  return aus
}

/**
 * Um wie viele Tage die Wochen beim Aktivieren verschoben werden.
 *
 * `[read]` **Flow 3, Schritt 5: das Startdatum waehlt der Nutzer.**
 * **Die erste Planwoche muss dann dort beginnen** — alle weiteren
 * behalten ihren Abstand.
 */
export function verschiebung(ersteWoche: string, startdatum: string): number {
  const a = Date.parse(`${ersteWoche}T00:00:00Z`)
  const b = Date.parse(`${startdatum}T00:00:00Z`)
  return Math.round((b - a) / 86_400_000)
}

export function tageVerschieben(iso: string, tage: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + tage)
  return d.toISOString().slice(0, 10)
}

// ══ WAS NICHT GEBAUT WIRD ═══════════════════════════════════════════
//
// **Auftrag: *,,Keinen Lebenszyklus ausfuehren (C-373). Kein Teilen,
// kein Kaufen."***
//
// `[cmd]` **Gemessen in G-304: es gibt keine Funktion, die einen
// Lebenszyklus ausfuehrt, und kein `pg_cron`.** `[read]` **Dieser
// Auftrag aendert daran nichts** — er baut die Werkbank, nicht die
// Uhr.
export const NICHT_GEBAUT = [
  'Lebenszyklus ausführen (once/rollover/sequence) — C-373',
  'Teilen an einen Coach — E-40 stellt es zurück',
  'Kaufen im Marktplatz — E-39 stellt es zurück',
] as const


// ════════════════════════════════════════════════════════════════════
// C-377/C-373 — der abgelaufene Plan stellt eine Frage
// ════════════════════════════════════════════════════════════════════
//
// **Tom, 2026-08-31:** *,,ist ein kompletter plan abgelaufen muss eine
// meldung kommen und geklaert werden wie es weiter geht,
// renew/anderen wochenplan/manuelle erfassung."*
//
// `[cmd]` **Heute steht dort *aktiv · abgelaufen* und sonst nichts**
// (G-298 zeigt es an, G-304 hat belegt, dass es keinen Weg gibt).
//
// ══ UND DAMIT KLAERT SICH C-373 ═════════════════════════════════════
//
// `[cmd]` **In G-304 gemessen: es gibt keine Funktion, die einen
// Lebenszyklus ausfuehrt, und kein `pg_cron`.**
//
// `[read]` **Die Meldung beim Ablauf IST die Ausfuehrung.** **Kein
// Zeitplaner noetig** — dieselbe Antwort wie bei C-358:
//
//     rollover    der Vorschlag lautet „neu starten"
//     sequence    der Vorschlag nennt den Folgeplan
//     once        der Vorschlag ist die Bibliothek
//
// `[read]` **Der Nutzer waehlt** — auch bei `rollover`. `[cmd]`
// **`SPEC_03` Flow 11-13 sagt *,,startet automatisch neu"*;** `[read]`
// **ohne Zeitplaner gibt es kein „automatisch", und ein Vorschlag,
// den jemand bestaetigt, ist ehrlicher als ein stiller Neustart.**

/** Die drei Wege aus Toms Satz. */
export const ABLAUF_WEGE = ['neu_starten', 'anderer_plan', 'ohne_plan'] as const
export type AblaufWeg = (typeof ABLAUF_WEGE)[number]

export const WEG_TEXT: Record<AblaufWeg, string> = {
  neu_starten: 'Denselben Plan neu starten',
  anderer_plan: 'Einen anderen Plan aktivieren',
  ohne_plan: 'Ohne Plan weitermachen',
}

export const WEG_ERKLAERUNG: Record<AblaufWeg, string> = {
  neu_starten: 'Die Wochen beginnen ab dem gewählten Startdatum von vorn. '
    + 'Das Protokoll des abgelaufenen Durchgangs bleibt stehen.',
  anderer_plan: 'Du wählst einen Plan aus der Bibliothek und aktivierst ihn.',
  ohne_plan: 'Der Plan wird abgeschlossen. Du erfasst weiter von Hand — '
    + 'ohne Plan-Einträge im Tagebuch.',
}

/**
 * Welcher Weg wird vorgeschlagen? — C-373.
 *
 * `[read]` **Der Lebenszyklus bestimmt den VORSCHLAG, nicht die
 * Handlung.** `[cmd]` **`lifecycle_type` kennt `once`, `rollover`,
 * `sequence` oder `NULL`** (`meal_plans_lifecycle_type_check`).
 *
 * `[read]` **`NULL` heisst: nicht festgelegt** — dann gibt es keinen
 * Vorschlag, und alle drei Wege stehen gleichwertig da. **Einen zu
 * bevorzugen waere eine Behauptung ueber eine Wahl, die niemand
 * getroffen hat.**
 */
export function vorschlagFuer(
  lifecycle: string | null | undefined,
): AblaufWeg | null {
  if (lifecycle === 'rollover') return 'neu_starten'
  if (lifecycle === 'sequence') return 'anderer_plan'
  if (lifecycle === 'once') return 'anderer_plan'
  return null
}

/**
 * Warum dieser Vorschlag — der Satz am gewaehlten Weg.
 *
 * `[read]` **Er nennt den Lebenszyklus als Grund**, damit der Nutzer
 * sieht, dass der Vorschlag aus seiner eigenen Wahl beim Aktivieren
 * stammt.
 */
export function vorschlagSatz(lifecycle: string | null | undefined): string | null {
  if (lifecycle === 'rollover') {
    return 'Du hattest „beginnt danach von vorn" gewählt — deshalb der Vorschlag, '
      + 'ihn neu zu starten.'
  }
  if (lifecycle === 'sequence') {
    return 'Du hattest „geht in einen Folgeplan über" gewählt — der hinterlegte '
      + 'Folgeplan steht in der Bibliothek.'
  }
  if (lifecycle === 'once') {
    return 'Du hattest „läuft einmal ab" gewählt — der Plan ist damit zu Ende.'
  }
  return 'Für diesen Plan ist kein Lebenszyklus hinterlegt — die drei Wege '
    + 'stehen deshalb gleichwertig.'
}

/** Die Frage selbst — sie steht ueber den drei Wegen. */
export const ABLAUF_FRAGE_TITEL = 'Dieser Plan ist abgelaufen'

export function ablaufFrage(bis: string, tage: number): string {
  return `Die letzte Planwoche endete am ${deutschesDatum(bis)} — vor ${tage} `
    + 'Tagen. Wie möchtest du weitermachen?'
}

function deutschesDatum(iso: string): string {
  const [j, m, t] = iso.split('-')
  return t && m && j ? `${Number(t)}.${Number(m)}.${j}` : iso
}
