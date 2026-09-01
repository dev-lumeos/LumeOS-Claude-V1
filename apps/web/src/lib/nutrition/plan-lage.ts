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
// ══ DER BEFUND VON G-270 IST SEIT G-309 UEBERHOLT ═══════════════════
//
// `[cmd]` **Hier stand: *,,`meal_plan_logs` ist LEER — 0 Zeilen, fuer
// jeden Nutzer"*** (G-270, 2026-08-30). **Das galt, solange nichts
// die Zeilen erzeugte.**
//
// `[cmd]` **Seit G-309 (2026-09-01) schreibt der Weg:** Ghost Entry
// bestaetigen, abweichen oder auslassen legt eine Zeile an. **Am
// selben Tag gemessen: drei Zeilen mit `confirmed`, `deviated`,
// `skipped`.**
//
// `[read]` **Die Leerzustaende bleiben trotzdem** — sie gelten fuer
// ein Konto, das noch nichts protokolliert hat. **Sie sind kein
// Dauerzustand mehr, sondern ein Anfangszustand.**

/**
 * Die Herkunft eines Plans — G-268 / G-269.
 *
 * `[cmd]` **Der CHECK erlaubt VIER Werte oder `NULL`** — am
 * 2026-09-01 gemessen: `self_created`, `coach_created`,
 * `marketplace`, `buddy`.
 *
 * `[cmd]` **BERICHTIGT in G-310:** hier stand *,,drei Werte"*, und
 * `herkunftVon` warf `buddy` auf `unbekannt`. **Mockup
 * (`MealPlansView.js` Z. 14) und `SPEC_03` Flow 3 Schritt 2 nennen
 * es beide.**
 *
 * `[read]` **`NULL` ist der vierte Zustand und der haeufigste:** die
 * beiden Bestandsplaene tragen ihn, **weil die Herkunft nicht
 * belegbar war.** Ihn als „selbst erstellt" anzuzeigen waere eine
 * Behauptung.
 */
export type Herkunft =
  | 'self_created' | 'coach_created' | 'marketplace' | 'buddy' | 'unbekannt'

export function herkunftVon(roh: string | null): Herkunft {
  if (roh === 'self_created' || roh === 'coach_created'
    || roh === 'marketplace' || roh === 'buddy') {
    return roh
  }
  return 'unbekannt'
}

export const HERKUNFT_TEXT: Record<Herkunft, string> = {
  self_created: 'selbst erstellt',
  coach_created: 'vom Coach',
  marketplace: 'aus dem Marktplatz',
  buddy: 'von Buddy',
  unbekannt: 'Herkunft nicht hinterlegt',
}

// ══ G-310: die Badges der Planliste ══════════════════════════
//
// `[cmd]` **`MealPlansView.js` Zeilen 10-15 und 89** — je Plan ein
// Badge mit eigener Farbe, **und `self_created` traegt keines.**
//
// `[cmd]` **`SPEC_03` Flow 3, Schritt 2 sagt dasselbe:**
//
//     Eigene (source: user)        — ohne Label
//     Vom Coach (source: coach)    — "Von [Coach-Name]"
//     Marketplace                  — "Gekauft: [Produkt-Name]"
//     Von Buddy (source: buddy)    — "Erstellt von Buddy"
//
// `[read]` **Mockup und Spec widersprechen sich hier nicht** — die
// Spec nennt den Coach- und Produktnamen zusaetzlich; **die stehen
// nicht im Schema** (`meal_plans` fuehrt keine Coach-Referenz), also
// bleibt es beim Wort ohne Namen.
//
// `[cmd]` **Der CHECK erlaubt genau diese vier** — am 2026-09-01
// gemessen: `self_created`, `coach_created`, `marketplace`, `buddy`.

/** Das Badge je Herkunft — `null` heisst: kein Badge (Mockup Z. 89). */
export const HERKUNFT_BADGE: Record<Herkunft, string | null> = {
  self_created: null,
  coach_created: 'Von Coach',
  marketplace: 'Marketplace',
  buddy: 'AI erstellt',
  unbekannt: null,
}

/**
 * Die Farbe je Badge — aus dem Mockup uebernommen.
 *
 * `[cmd]` **`MealPlansView.js`:** `#f97316` (Marketplace, Z. 11),
 * `#3b82f6` (Coach, Z. 13), `var(--brand-600)` (AI, Z. 15).
 *
 * `[read]` **`--brand-600` gibt es in v2 nicht** — dort heisst der
 * Nutrition-Akzent `--acc-nutri`. **Uebersetzt, nicht erfunden.**
 */
export const HERKUNFT_FARBE: Record<Herkunft, string | null> = {
  self_created: null,
  coach_created: '#3b82f6',
  marketplace: '#f97316',
  buddy: 'var(--acc-nutri)',
  unbekannt: null,
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
 *
 * ══ BERICHTIGT IN G-310 — `deviated` ZAEHLT ALS ERFOLG ═════════════
 *
 * `[cmd]` **Hier stand `bestaetigt / entschieden`.**
 * `[cmd]` **`SPEC_09` Abschnitt 2 verlangt
 * `(confirmed + deviated) / decided`** und nennt die Regel
 * ausdruecklich: *,,`deviated` zaehlt als Erfolg fuer Compliance
 * (User hat sich aktiv entschieden)."*
 *
 * **Tom, 2026-09-01:** *,,Compliance misst, ob jemand seinen Plan
 * verfolgt — nicht, ob er gehorcht. Wer abweicht, hat sich mit dem
 * Plan befasst und entschieden. Wer auslaesst oder nichts tut, hat es
 * nicht."*
 *
 * `[read]` **Und die falsche Formel arbeitete gegen die Auswertung
 * aus G-309:** wenn jede Abweichung die Quote senkt, ist Abweichen
 * bestraft — **und der Nutzer traegt lieber falsch ein, als
 * abzuweichen.** Dasselbe Argument wie in E-42: eine Regel, die sich
 * umgehen laesst, erzeugt unehrliche Daten.
 *
 * `[cmd]` **Gemessen vor der Aenderung: EIN Produktaufrufer**
 * (`plans-echt.tsx`), der Rest Tests. **Keine Stelle zaehlte bewusst
 * nur `confirmed`** — deshalb dieselbe Funktion, kein zweiter Name.
 */
export function quoteVon(e: Einhaltung): number | null {
  if (e.entschieden === 0) return null
  return Math.round(((e.bestaetigt + e.abgewichen) / e.entschieden) * 1000) / 10
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
 * Der Satz fuer die Einkaufsliste — G-270, berichtigt in G-288.
 *
 * `[cmd]` **`nutrition.shopping_lists` existiert** (1 Zeile, 6
 * Positionen im Bestand), **`dev` hat nur keine.**
 *
 * `[read]` **Der Quelltext nannte bis G-271 eine fehlende Tabelle
 * als Grund** — das war falsch.
 *
 * `[cmd]` **UND DIE ZWEITE FASSUNG WAR ES AUCH:** sie sagte, die
 * Liste entstehe *,,aus einer Planwoche"*. **`SPEC_03` Flow 8 sagt:
 * *,,Rezept oeffnen -> Einkaufsliste erstellen"*.**
 *
 * `[cmd]` **Das Schema kann beides** — `shopping_lists.source_type`
 * erlaubt `manual`, `recipe`, `meal_plan`, `supplement_reorder`.
 * `[read]` **Gebaut ist `recipe`, weil nur das in einem Flow steht**
 * (E-39, G-288).
 */
export const KEINE_EINKAUFSLISTE_SATZ =
  'Noch keine Einkaufsliste angelegt. Sie entsteht aus einem Rezept — '
  + 'im Rezepte-Reiter über „Einkaufsliste".'


// ══ G-309: die Auswertung, die Tom will ═════════════════════
//
// `[cmd]` **Der Typ steht HIER, nicht in `plan-lesen.ts`** — die
// Kachel ist eine Client-Komponente, und ein WERT-Import aus dem
// Leseweg zieht `next/headers` mit (A-30).
//
// `[cmd]` **Am 2026-09-01 gemessen: `/login` antwortete HTTP 500**,
// *,,You're importing a component that needs next/headers"* — **der
// ganze Server stand, nicht nur die Kachel.**
//
// `[read]` **Ein `import type` waere durchgegangen** (er verschwindet
// beim Uebersetzen). **Der Wert `LEERER_WECHSELSTAND` nicht** — und
// genau den brauchte die Vorgabe der Prop.

export type Wechselbefund = {
  plan_entry_id: string
  meal_type: string
  bezeichnung: string
  /** Wie oft diese Position ueberhaupt entschieden wurde. */
  gesamt: number
  abgewichen: number
  ausgelassen: number
  /** `abgewichen + ausgelassen`, gemessen an `gesamt`. */
  quote: number
}

/**
 * Was die Auswertung zurueckgibt — Befunde UND Grundgesamtheit.
 *
 * `[cmd]` **Am 2026-09-01 gemessen: die Kachel sagte *,,Noch nichts
 * protokolliert"*, waehrend `lunch` dreimal abgewichen war.**
 *
 * `[read]` **Die Ursache waren zwei Quellen fuer eine Aussage:** die
 * Befunde kamen aus 28 Tagen, die Zahl der entschiedenen Zeilen aus
 * `ladePlanLogs(datum, 7)`. **Ein Wechsel vor mehr als sieben Tagen
 * erzeugte einen Befund, den die Kachel als *,,nichts da"* auswies.**
 *
 * `[read]` **Deshalb beides aus derselben Messung.** Die Kachel
 * unterscheidet drei Lagen: nichts protokolliert / protokolliert,
 * aber unauffaellig / ein Befund.
 */
export type WechselStand = {
  befunde: Wechselbefund[]
  /** Wie viele entschiedene Logzeilen im Zeitraum lagen. */
  entschieden: number
}

export const LEERER_WECHSELSTAND: WechselStand = { befunde: [], entschieden: 0 }

/**
 * Ab wann eine Position auffaellt.
 *
 * `[read]` **Zwei Vorkommen, nicht eines** — *,,immer gewechselt"*
 * heisst nicht *,,einmal gewechselt"*. **Ein einzelner Ausrutscher
 * ist kein Muster**, und eine Empfehlung darauf zu stuetzen waere
 * geraten.
 */
export const WECHSEL_AB_MAL = 2

/** Und ab welchem Anteil. */
export const WECHSEL_AB_QUOTE = 0.5
