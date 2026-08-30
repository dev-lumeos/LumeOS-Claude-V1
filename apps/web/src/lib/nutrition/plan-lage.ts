// ════════════════════════════════════════════════════════════════════
// DIE LAGE EINES PLANS — G-267 / G-268 / G-269 / G-270
// ════════════════════════════════════════════════════════════════════
//
// `[cmd]` **Serverfrei.** Kein Import aus dem Leseweg, kein
// `next/headers` — A-30.
//
// ══ DIE WICHTIGSTE UNTERSCHEIDUNG DES AUFTRAGS ══════════════════════
//
// `[cmd]` **Gemessen am 2026-08-30:** `meal_plan_entries` hat KEINE
// Statusspalte, `meal_plan_logs` hat eine. **Der Eintrag ist die
// Vorlage, das Log die Ausfuehrung.**
//
// `[read]` **Wer am Eintrag nach Status sucht, findet keinen und
// haelt ihn fuer fehlend.** Deshalb steht es hier als Satz und nicht
// nur im Auftragstext.
//
// ══ UND DER BEFUND, DER DEN AUFTRAG EINSCHRAENKT ════════════════════
//
// `[cmd]` **`meal_plan_logs` ist LEER — 0 Zeilen, fuer jeden
// Nutzer.** `[read]` **Damit werden die drei Attrappen nicht zu
// echten Zahlen, sondern zu Leerzustaenden.** Das ist ein
// Fortschritt (eine Kachel, die sagt „noch nichts protokolliert",
// ist ehrlich; eine mit erfundenen Zahlen nicht) — **aber es ist
// nicht dasselbe wie „angebunden".**

/**
 * Die Herkunft eines Plans — G-268 / G-269.
 *
 * `[cmd]` **Der CHECK erlaubt drei Werte oder `NULL`:**
 * `self_created`, `coach_created`, `marketplace`.
 *
 * `[read]` **`NULL` ist der vierte Zustand und der haeufigste:** die
 * beiden Bestandsplaene tragen ihn, **weil die Herkunft nicht
 * belegbar war.** Ihn als „selbst erstellt" anzuzeigen waere eine
 * Behauptung.
 */
export type Herkunft = 'self_created' | 'coach_created' | 'marketplace' | 'unbekannt'

export function herkunftVon(roh: string | null): Herkunft {
  if (roh === 'self_created' || roh === 'coach_created' || roh === 'marketplace') {
    return roh
  }
  return 'unbekannt'
}

export const HERKUNFT_TEXT: Record<Herkunft, string> = {
  self_created: 'selbst erstellt',
  coach_created: 'vom Coach',
  marketplace: 'aus dem Marktplatz',
  unbekannt: 'Herkunft nicht hinterlegt',
}

/**
 * Der Satz zur unbekannten Herkunft.
 *
 * `[read]` **Er sagt, warum es leer ist** — sonst sieht es aus wie
 * ein Anzeigefehler. Dieselbe Klasse wie `begruendet_leer` gegen
 * `nicht_bearbeitet` (G-208).
 */
export const HERKUNFT_UNBEKANNT_SATZ =
  'Für diesen Plan ist keine Herkunft hinterlegt — er stammt aus der Zeit '
  + 'vor der Unterscheidung. Das ist keine Aussage darüber, wer ihn erstellt hat.'

/**
 * Ob der Plan bearbeitet werden darf — G-269.
 *
 * `[read]` **Drei Gruende, nicht zwei.** Ein gesperrter Coach-Plan
 * und ein Plan unbekannter Herkunft sind verschiedene Faelle, und
 * der Nutzer muss wissen, welcher vorliegt.
 *
 * `[cmd]` **E-29: die Freigabe kommt aus
 * `coach.darf_nutrition_plan_aendern(p_client)`**, nicht aus
 * `coach.client_autonomy` — die Funktion prueft volle Sicht,
 * `nutrition_auto_apply` UND Stufe 5.
 *
 * `[cmd]` **Gemessen am 2026-08-30: `dev`, `test-user` und
 * `max.seed` bekommen alle `false`.**
 */
export type Bearbeitbar =
  | { erlaubt: true }
  | { erlaubt: false; grund: 'coach_sperrt' | 'fremde_quelle'; satz: string }

export function bearbeitbarkeit(
  herkunft: Herkunft, coachFreigabe: boolean,
): Bearbeitbar {
  // Ein selbst erstellter Plan gehoert der Nutzerin — immer.
  if (herkunft === 'self_created' || herkunft === 'unbekannt') {
    return { erlaubt: true }
  }
  if (coachFreigabe) return { erlaubt: true }
  if (herkunft === 'coach_created') {
    return {
      erlaubt: false,
      grund: 'coach_sperrt',
      satz: 'Dieser Plan kommt von deinem Coach. Direkte Änderungen sind erst '
        + 'ab Autonomiestufe 5 freigegeben — sprich ihn an, wenn du etwas '
        + 'anpassen möchtest.',
    }
  }
  return {
    erlaubt: false,
    grund: 'fremde_quelle',
    satz: 'Dieser Plan stammt aus dem Marktplatz und wird unverändert '
      + 'übernommen. Leg eine Kopie an, wenn du ihn anpassen möchtest.',
  }
}

/**
 * Der Lebenszyklus — G-270.
 *
 * `[cmd]` **CHECK: `once`, `rollover`, `sequence` oder `NULL`.**
 * `[cmd]` **Und `sequence` verlangt `next_plan_id`** — der dritte
 * CHECK erzwingt es.
 */
export type Zyklus = 'once' | 'rollover' | 'sequence' | 'unbekannt'

export function zyklusVon(roh: string | null): Zyklus {
  if (roh === 'once' || roh === 'rollover' || roh === 'sequence') return roh
  return 'unbekannt'
}

export const ZYKLUS_TEXT: Record<Zyklus, string> = {
  once: 'läuft einmal ab',
  rollover: 'beginnt danach von vorn',
  sequence: 'geht in einen Folgeplan über',
  unbekannt: 'kein Lebenszyklus hinterlegt',
}

/** Die Erklaerung je Zyklus — was am Ende des Plans geschieht. */
export const ZYKLUS_ERKLAERUNG: Record<Zyklus, string> = {
  once: 'Nach der letzten Woche endet der Plan.',
  rollover: 'Nach der letzten Woche startet er wieder bei Tag 1.',
  sequence: 'Nach der letzten Woche wird der hinterlegte Folgeplan aktiv.',
  unbekannt: 'Was am Ende geschieht, ist für diesen Plan nicht festgelegt.',
}

/**
 * Der Zustand eines Plans.
 *
 * `[cmd]` **NOT NULL mit Vorgabe `'assigned'`** — anders als die
 * uebrigen fuenf Spalten gibt es hier keine Leerstelle.
 */
export const STATUS_TEXT: Record<string, string> = {
  assigned: 'zugewiesen',
  active: 'aktiv',
  completed: 'abgeschlossen',
  paused: 'pausiert',
  archived: 'archiviert',
}

export function statusText(roh: string): string {
  return STATUS_TEXT[roh] ?? roh
}

// ── Die Ausfuehrung: was im Log steht — G-270 ────────────────────

/** Eine Zeile aus `meal_plan_logs`. */
export type LogZeile = {
  execution_date: string
  status: 'pending' | 'confirmed' | 'deviated' | 'skipped'
  confirmation_mode: string | null
  deviation_kcal: number | null
}

/**
 * Die Zaehlung ueber einen Zeitraum.
 *
 * `[read]` **`bewertet` ist der Nenner** — Tage mit Protokoll.
 * **Ohne Protokoll gibt es keine Quote, nicht null Prozent.**
 * Dieselbe Regel wie in C-323.
 */
export type Einhaltung = {
  bestaetigt: number
  abgewichen: number
  ausgelassen: number
  offen: number
  /** Zeilen mit einer Entscheidung — offen zaehlt nicht mit. */
  entschieden: number
}

export function einhaltungVon(zeilen: readonly LogZeile[]): Einhaltung {
  const z: Einhaltung = {
    bestaetigt: 0, abgewichen: 0, ausgelassen: 0, offen: 0, entschieden: 0,
  }
  for (const l of zeilen) {
    if (l.status === 'confirmed') { z.bestaetigt += 1; z.entschieden += 1 }
    else if (l.status === 'deviated') { z.abgewichen += 1; z.entschieden += 1 }
    else if (l.status === 'skipped') { z.ausgelassen += 1; z.entschieden += 1 }
    else z.offen += 1
  }
  return z
}

/**
 * Die Quote — oder `null`, wenn nichts entschieden wurde.
 *
 * `[read]` **`null` heisst „noch keine Aussage", nicht „0 Prozent".**
 * `[cmd]` **Und das ist heute der Normalfall:** `meal_plan_logs` ist
 * leer.
 */
export function quoteVon(e: Einhaltung): number | null {
  if (e.entschieden === 0) return null
  return Math.round((e.bestaetigt / e.entschieden) * 1000) / 10
}

/**
 * Der Satz, wenn noch nichts protokolliert wurde.
 *
 * `[cmd]` **Gemessen am 2026-08-30: `meal_plan_logs` hat 0 Zeilen.**
 * `[read]` **Das ist ein Leerzustand, kein fehlendes Feature** — die
 * Tabelle steht, die Spalten stehen, es ist nur noch nichts
 * geschehen. **Dieselbe Unterscheidung wie bei der Einkaufsliste.**
 */
export const KEIN_LOG_SATZ =
  'Für diesen Plan wurde noch nichts protokolliert. Sobald du Mahlzeiten '
  + 'bestätigst oder auslässt, entsteht hier die Auswertung.'

/**
 * Der Satz fuer die Einkaufsliste — G-270.
 *
 * `[cmd]` **`nutrition.shopping_lists` existiert** (1 Zeile, 6
 * Positionen im Bestand), **`dev` hat nur keine.**
 *
 * `[read]` **Der Quelltext nannte bis heute eine fehlende Tabelle
 * als Grund** — das war schon in G-271 falsch und ist es weiter.
 */
export const KEINE_EINKAUFSLISTE_SATZ =
  'Noch keine Einkaufsliste angelegt. Sie entsteht aus einer Planwoche — '
  + 'die Tabelle steht bereit, sie ist nur noch leer.'
