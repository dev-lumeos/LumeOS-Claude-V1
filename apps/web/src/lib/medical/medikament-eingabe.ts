// Die Regeln der Medikamenteneingabe — G-211.
//
// ══ WARUM SERVERFREI ════════════════════════════════════════════════
//
// `[read]` **Dieselbe Trennung wie `wirkstoff-luecke.ts` (G-208) und
// `wirkstoff-marke.ts` (G-210).** In G-208 hat sie der Build erzwungen:
// ein einziger WERT-Import aus dem Leseweg in eine `'use client'`-Datei
// zog `next/headers` ins Browserbuendel (A-30). **Hier liegt, was das
// Formular als Wert braucht.**
//
// ══ WAS HIER NICHT STEHT ════════════════════════════════════════════
//
// `[read]` **Keine I/O, kein Schreibzugriff.** Die eine Schreibstelle
// ist `medikament-write.ts`; diese Datei sagt nur, was gueltig ist und
// wie ein Eintrag einzuordnen ist.

/**
 * Die Bindung eines Eintrags an den Wirkstoffkatalog.
 *
 * ══ DER DRITTE ZUSTAND, UND WARUM ER EINER IST ══════════════════════
 *
 * `[read]` **In G-208 gab es zwei Sorten Leere:** *begruendet leer*
 * (ein Mischpraeparat hat keine CAS-Nummer — der Datensatz ist
 * vollstaendig) und *nicht bearbeitet* (niemand hat nachgesehen).
 *
 * **Hier ist es ein dritter Fall, und er unterscheidet sich von beiden
 * darin, dass er eine FOLGE hat, nicht nur eine Anzeige.**
 *
 *     zugeordnet         Wirkstoff bekannt, Regeln sehen den Eintrag
 *     nicht_zugeordnet   Freitext ohne Wirkstoff — von KEINER Regel
 *                        gesehen
 *
 * `[cmd]` **Die Folge ist gemessen, nicht behauptet:** 30 der 64
 * Regeln lesen `medical.medications[]`. Sie lesen dabei NICHT
 * `active_substance_id` selbst, sondern `drug_class` (9 Regeln) und
 * `cyp_profile` (1) — **und genau diese beiden Felder werden aus dem
 * Katalog uebernommen, wenn eine Zuordnung besteht.** Ohne Zuordnung
 * bleiben sie leer (`'{}'` ist der Spaltenvorgabewert), und dann
 * trifft keine Bedingung.
 *
 * `[read]` **Deshalb ist „nicht zugeordnet" keine Formfrage.** Der
 * Eintrag steht in der Liste, zaehlt in der Uebersicht — und ist fuer
 * die Auswertung unsichtbar.
 */
export type Bindung = 'zugeordnet' | 'nicht_zugeordnet'

/**
 * Der Satz, der die Folge benennt.
 *
 * `[read]` **Im Ton von *„Das heisst nicht, dass es keine gibt"***
 * (G-210) — **ein Hinweis, keine Fehlermeldung.** Der Eintrag ist
 * richtig; unvollstaendig ist der Katalog.
 *
 * `[cmd]` **Und der Grund dafuer ist gemessen:** `DE` steht bei 0 von
 * 448 Produkten (G-210). **Wer Concor nimmt, kann es gar nicht
 * zuordnen** — nicht weil er etwas falsch macht, sondern weil der
 * Katalog den deutschen Handelsnamen nicht fuehrt.
 */
export const OHNE_BINDUNG_FOLGE =
  'Dieser Eintrag wird von keiner Wechselwirkungsregel geprüft. Er '
  + 'bleibt in deiner Liste — die automatische Prüfung übergeht ihn.'

export const OHNE_BINDUNG_GRUND =
  'Das heisst nicht, dass du etwas falsch gemacht hast: der Katalog '
  + 'führt keine deutschen Handelsnamen. Wenn du den Wirkstoff kennst, '
  + 'such ihn oben — dann greifen die Regeln.'

/** Was das Formular sammelt. */
export type MedikamentEingabe = {
  /** Freitext, Pflicht. `[cmd]` `user_medications_name_check` verlangt ihn. */
  name: string
  /** Die Katalogbindung — `null` ist erlaubt und der dritte Zustand. */
  active_substance_id: string | null
  dose_amount: string
  dose_unit: string
  doses_per_day: string
  route: string
  start_date: string
  indication: string
  notes: string
}

export const LEERE_EINGABE: MedikamentEingabe = {
  name: '', active_substance_id: null,
  dose_amount: '', dose_unit: '', doses_per_day: '', route: '',
  start_date: '', indication: '', notes: '',
}

/** Ein Feldfehler — Feldname und Satz. */
export type EingabeFehler = { feld: string; text: string }

function zahl(roh: string): number | null {
  const t = roh.trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : NaN
}

/**
 * Die Eingabe pruefen — dieselben Regeln, die die Datenbank erzwingt.
 *
 * ══ WARUM DOPPELT GEPRUEFT WIRD ═════════════════════════════════════
 *
 * `[cmd]` **Die Datenbank haelt bereits:** `name_check`
 * (`btrim(name) <> ''`), `dose_amount_check` (`> 0`),
 * `doses_per_day_check` (`> 0`), `user_medications_check`
 * (`end_date >= start_date`) — **alle vier gegengeprobt am
 * 2026-08-27, alle vier weisen ab.**
 *
 * `[read]` **Diese Pruefung ersetzt sie nicht, sie kommt ihr zuvor.**
 * Ein Constraint-Fehler ist eine Postgres-Meldung auf Englisch mit
 * Spaltennamen; ein Mensch braucht einen Satz am richtigen Feld.
 * **Die Datenbank bleibt die Wahrheit — sie ist die letzte Instanz,
 * nicht die erste.**
 */
export function pruefeEingabe(e: MedikamentEingabe): EingabeFehler[] {
  const fehler: EingabeFehler[] = []

  if (!e.name.trim()) {
    fehler.push({ feld: 'name', text: 'Ein Name ist nötig.' })
  }
  if (!e.start_date.trim()) {
    fehler.push({ feld: 'start_date', text: 'Seit wann nimmst du es?' })
  }

  const menge = zahl(e.dose_amount)
  if (menge !== null && (Number.isNaN(menge) || menge <= 0)) {
    fehler.push({ feld: 'dose_amount', text: 'Eine Menge größer als null.' })
  }
  const proTag = zahl(e.doses_per_day)
  if (proTag !== null && (Number.isNaN(proTag) || proTag <= 0)) {
    fehler.push({ feld: 'doses_per_day', text: 'Wie oft pro Tag? Größer als null.' })
  }
  return fehler
}

/**
 * Wie ein Eintrag gebunden ist.
 *
 * `[read]` **Eine Zeichenkette aus Leerzeichen ist keine Bindung.**
 * Das ist dieselbe Vorsicht wie in `feld()` (G-208): technisch
 * gefuellt, inhaltlich leer.
 */
export function bindungVon(
  active_substance_id: string | null | undefined,
): Bindung {
  return typeof active_substance_id === 'string' && active_substance_id.trim()
    ? 'zugeordnet'
    : 'nicht_zugeordnet'
}

/**
 * Wie viele Eintraege von den Regeln uebergangen werden.
 *
 * `[read]` **Die Zahl gehoert in die Liste, nicht in den Bericht** —
 * dieselbe Linie wie die Bilanzzeile aus G-208 (*„2 von 3 Feldern
 * gefuellt"*). Wer fuenf Medikamente fuehrt und drei davon als
 * Freitext, soll das sehen, ohne jede Zeile einzeln zu pruefen.
 */
export function zaehleOhneBindung(
  eintraege: Array<{ active_substance_id: string | null }>,
): number {
  return eintraege.filter(m => bindungVon(m.active_substance_id) === 'nicht_zugeordnet').length
}

/**
 * Was beim Absetzen gesetzt wird.
 *
 * ══ ABSETZEN IST KEIN LOESCHEN ══════════════════════════════════════
 *
 * **Auftrag: *„Was jemand genommen hat, bleibt Teil seiner Geschichte
 * — und eine Wechselwirkung, die vor drei Wochen galt, erklaert einen
 * Laborwert von heute."***
 *
 * `[cmd]` **Die Spalten existieren beide:** `end_date` (`date`,
 * nullable) und `is_active` (`boolean NOT NULL DEFAULT true`).
 * **Es wird nichts geloescht.**
 *
 * `[cmd]` **`user_medications_check` verlangt `end_date >=
 * start_date`.** Ein Absetzdatum vor dem Beginn weist die Datenbank
 * ab — deshalb wird es hier vorher gefangen.
 */
export function absetzenGueltig(
  start_date: string, end_date: string,
): EingabeFehler[] {
  if (!end_date.trim()) {
    return [{ feld: 'end_date', text: 'Seit wann nimmst du es nicht mehr?' }]
  }
  if (start_date.trim() && end_date.trim() < start_date.trim()) {
    return [{
      feld: 'end_date',
      text: 'Das Absetzdatum liegt vor dem Beginn.',
    }]
  }
  return []
}
