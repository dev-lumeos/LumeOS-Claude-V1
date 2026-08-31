// ════════════════════════════════════════════════════════════════════
// DIE WERKBANK — C-372 / G-306 / C-375
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg — A-30.
//
// **Grundlage, in dieser Reihenfolge gelesen:**
//
//     E-40                          wozu der Planner da ist
//     E-41                          Rollenteilung, zwei Sperren
//     ADR_IMPROVEMENTS_PACKAGE #17  die Immutabilitaetsregel
//     SPEC_01 Abschnitt 8 und 9     vier Quellen
//     SPEC_03 Flow 3                Aktivieren
//
// `[read]` **Den ADR hat vor G-298 niemand gelesen** — deshalb steht
// er hier an dritter Stelle und nicht am Ende.

// ══ DIE ERSTE SPERRE: aktiv heisst eingefroren ══════════════════════
//
// `[cmd]` **`ADR_IMPROVEMENTS_PACKAGE` #17, woertlich:**
//
//     MealPlan.status = 'active'
//       -> MealPlanDay: READ-ONLY
//       -> MealPlanItem: READ-ONLY
//       -> API gibt 409 Conflict bei PUT/PATCH/DELETE
//
// `[cmd]` **Die Begruendung steht dort:** *,,MealPlanLog referenziert
// `plan_item_id`. Wenn Items nachtraeglich geaendert werden, stimmt
// die Compliance-History nicht mehr."*
//
// `[cmd]` **Am 2026-08-31 gemessen: `meal_plan_logs.plan_entry_id`
// existiert und traegt `ON DELETE RESTRICT`** auf
// `meal_plan_entries`. `[read]` **Die Datenbank verhindert also das
// LOESCHEN einer protokollierten Position — nicht ihr AENDERN.**
// **Genau die Luecke, die G-298 aufgemacht hat.**

/**
 * `[cmd]` **Der CHECK an `meal_plans` kennt fuenf Werte** — am
 * 2026-08-31 aus `pg_constraint` gelesen.
 */
export const PLAN_STATUS = [
  'assigned', 'active', 'completed', 'paused', 'archived',
] as const
export type PlanStatus = (typeof PLAN_STATUS)[number]

/**
 * Duerfen die Positionen dieses Plans geaendert werden?
 *
 * `[read]` **Nur `active` sperrt.** `[read]` **`completed` und
 * `archived` sperren NICHT** — der ADR nennt sie nicht, und ein
 * abgeschlossener Plan traegt sein Log bereits; wer ihn umbaut,
 * aendert Vergangenes. **Das ist eine offene Frage und im Bericht
 * benannt, nicht hier entschieden.**
 *
 * `[read]` **Die Regel heisst also: gesperrt ist, was laeuft.**
 */
export function positionenGesperrt(status: string): boolean {
  return status === 'active'
}

/**
 * Warum gesperrt — der Satz, den der Nutzer liest.
 *
 * `[read]` **Er nennt den Grund UND den Ausweg.** `[cmd]` **Der ADR
 * schreibt beides vor:** *,,Coach oder User muss Plan pausieren, eine
 * Kopie erstellen, bearbeiten und neu aktivieren."*
 *
 * `[read]` **Ein Satz ohne Ausweg waere die Sackgasse, vor der der
 * Auftrag warnt** — *gesperrt zu sein, ohne einen Weg zu haben, ist
 * schlimmer als gar keine Sperre.*
 */
export const AKTIV_GESPERRT_SATZ =
  'Dieser Plan läuft. Seine Positionen sind eingefroren, weil das '
  + 'Protokoll auf sie zeigt — nachträgliche Änderungen würden die '
  + 'Einhaltungs-Auswertung verfälschen.'

export const AKTIV_AUSWEG_SATZ =
  'Über „Kopie bearbeiten“ entsteht ein Entwurf mit denselben Wochen '
  + 'und Positionen. Der laufende Plan bleibt mit seinem Protokoll '
  + 'unberührt.'

// ══ DIE ZWEITE SPERRE: fremde Herkunft ══════════════════════════════
//
// **Tom, E-41:** *,,die gekauften Plaene oder vom Coach brauchen ein
// Flag das definiert ob es editable sein soll oder nicht."*
//
// `[cmd]` **Gemessen am 2026-08-31: es gibt kein solches Flag** —
// kein `editable`, `readonly`, `locked` oder `is_template` in
// `nutrition` oder `coach`. **Der einzige Treffer war
// `checkins.template_id`, und der gehoert zu Recovery.**
//
// `[read]` **Die Spalte gehoert Codex** (C-375 nennt sie:
// `darf_bearbeiten boolean NOT NULL DEFAULT true`). **Hier steht die
// Auswertung, damit sie fertig ist, wenn die Spalte kommt** — und
// solange sie fehlt, ist die Antwort `true`, gemessen und nicht
// behauptet.

/**
 * Darf der Empfaenger diesen Plan ueberhaupt aendern?
 *
 * `[read]` **`undefined` heisst: die Spalte gibt es noch nicht.**
 * **Dann gilt `true`** — ein eigener Plan war nie gesperrt, und
 * fremde gibt es heute nicht (alle `plan_origin` sind
 * `self_created` oder `NULL`).
 */
export function darfBearbeiten(flag: boolean | null | undefined): boolean {
  return flag !== false
}

export const FREMD_GESPERRT_SATZ =
  'Der Ersteller dieses Plans hat Änderungen nicht freigegeben. '
  + 'Du kannst ihn aktivieren und verwenden, aber nicht umbauen.'

// ══ BEIDE SPERREN ZUSAMMEN ══════════════════════════════════════════
//
// `[read]` **E-41: *,,Zwei Sperren, die nichts miteinander zu tun
// haben."*** **`aktiv` kommt vom Log, `nicht editierbar` vom
// Ersteller.**
//
// `[read]` **Die Anzeige muss sie unterscheiden**, weil der Ausweg
// verschieden ist: bei `aktiv` hilft eine Kopie, bei fremder Herkunft
// nicht.

export type Sperre =
  | { art: 'offen' }
  | { art: 'aktiv'; satz: string; ausweg: string }
  | { art: 'fremd'; satz: string }
  /** Beides zugleich — der Kopierweg hilft dann nicht. */
  | { art: 'beides'; satz: string }

export function sperreVon(
  status: string, darfFlag: boolean | null | undefined,
): Sperre {
  const aktiv = positionenGesperrt(status)
  const fremd = !darfBearbeiten(darfFlag)
  if (aktiv && fremd) {
    return {
      art: 'beides',
      satz: `${FREMD_GESPERRT_SATZ} Außerdem läuft er gerade.`,
    }
  }
  // `[read]` **Die fremde Herkunft steht VOR der Aktivsperre**, weil
  // sie sich nicht durch Kopieren umgehen laesst — ein Ausweg, den es
  // nicht gibt, waere schlimmer als keiner.
  if (fremd) return { art: 'fremd', satz: FREMD_GESPERRT_SATZ }
  if (aktiv) {
    return { art: 'aktiv', satz: AKTIV_GESPERRT_SATZ, ausweg: AKTIV_AUSWEG_SATZ }
  }
  return { art: 'offen' }
}

/** Die Marke an der Karte — kurz, neben dem Status. */
export const SPERRE_MARKE: Record<Sperre['art'], string | null> = {
  offen: null,
  aktiv: 'Positionen eingefroren',
  fremd: 'nicht bearbeitbar',
  beides: 'nicht bearbeitbar',
}

/**
 * Hilft eine Kopie?
 *
 * `[read]` **Nur bei der Aktivsperre.** Bei fremder Herkunft waere
 * die Kopie ein Weg um die Entscheidung des Erstellers herum — und
 * genau das soll das Flag verhindern.
 */
export function kopieHilft(s: Sperre): boolean {
  return s.art === 'aktiv'
}

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
