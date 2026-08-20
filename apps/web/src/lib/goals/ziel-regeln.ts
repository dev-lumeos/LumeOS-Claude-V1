// Die Regeln der Zieltabelle — **ohne Server-I/O** (G-79).
//
// `[cmd]` **WARUM DIESE DATEI GETRENNT IST.** Sie stand zuerst in
// `schreiben.ts`. Der Typecheck war gruen, aber die Seite antwortete
// mit **HTTP 500**:
//
//   „You're importing a component that needs next/headers."
//
// Grund: `ziel-karten.tsx` ist `'use client'` und holte von dort
// **Werte** (`ABGESCHLOSSEN`, `STATUS_LABEL`) — ein Wert-Import zieht
// die ganze Datei ins Browserbuendel, und `schreiben.ts` importiert
// `createSessionClient`, das `next/headers` braucht. Ein reiner
// `import type` waere folgenlos geblieben, ein Wert-Import ist es
// nicht.
//
// **Dieselbe Klasse Fehler wie in G-74** (dort mit `stack-read.ts`).
// Der Typecheck sieht sie nicht — nur der Browser.
//
// **Deshalb:** hier stehen Konstanten und reine Pruefungen, die beide
// Seiten benutzen duerfen. `schreiben.ts` daneben macht das I/O und
// wird nur serverseitig importiert.

/**
 * Die Status, die `user_goals_status_check` erlaubt.
 *
 * `[cmd]` Genau diese fuenf, gemessen an der CHECK-Bedingung. Der
 * Auftrag fragt nach „erreicht, nicht erreicht, abgebrochen" — die
 * Tabelle kennt sie als `achieved` und `abandoned`, dazu `paused` und
 * `on_hold` als ruhende Zustaende.
 */
export const STATUS_WERTE = [
  'active', 'paused', 'achieved', 'abandoned', 'on_hold',
] as const
export type ZielStatus = typeof STATUS_WERTE[number]

/**
 * Die Status, die ein Ziel als abgeschlossen kennzeichnen.
 *
 * `[read]` `paused` gehoert NICHT dazu — ein pausiertes Ziel laeuft
 * weiter, es ruht nur. Nur `achieved` und `abandoned` sind vorbei.
 */
export const ABGESCHLOSSEN: ZielStatus[] = ['achieved', 'abandoned']

export const STATUS_LABEL: Record<ZielStatus, string> = {
  active: 'aktiv',
  paused: 'pausiert',
  on_hold: 'zurückgestellt',
  achieved: 'erreicht',
  abandoned: 'abgebrochen',
}

/**
 * Die Prioritaetsgrenzen.
 *
 * `[cmd]` Zwei CHECK-Bedingungen wirken zusammen:
 *   `user_goals_priority_check` — 1 bis 10.
 *   `user_goals_check1` — **ein AKTIVES Ziel muss 1 bis 3 tragen.**
 *
 * `[read]` Die zweite ist die eigentliche Regel: aktive Ziele haben
 * drei Raenge, nicht zehn. Wer ein Ziel auf 5 setzt und aktiv laesst,
 * bekommt einen Datenbankfehler — die Oberflaeche bietet deshalb nur
 * 1–3 an, solange der Status `active` ist.
 */
export const PRIO_MIN_AKTIV = 1
export const PRIO_MAX_AKTIV = 3
export const PRIO_MIN = 1
export const PRIO_MAX = 10

export type ZielAenderung = {
  title?: string
  description?: string | null
  target_value?: number | null
  target_unit?: string | null
  target_date?: string | null
  status?: ZielStatus
  priority?: number
  is_primary?: boolean
}

/**
 * Prueft eine Aenderung gegen die CHECK-Bedingungen der Tabelle.
 *
 * `[read]` **Vorab und nicht erst in der Datenbank** — sonst bekommt
 * die Nutzerin eine Postgres-Meldung statt eines Satzes. Die Regeln
 * sind dieselben; hier stehen sie nur frueher.
 */
export function pruefeAenderung(a: ZielAenderung): string | null {
  if (a.title !== undefined && a.title.trim() === '') {
    return 'Der Titel darf nicht leer sein.'
  }
  if (a.priority !== undefined) {
    if (!Number.isInteger(a.priority)) {
      return 'Die Priorität muss eine ganze Zahl sein.'
    }
    if (a.priority < PRIO_MIN || a.priority > PRIO_MAX) {
      return `Die Priorität liegt zwischen ${PRIO_MIN} und ${PRIO_MAX}.`
    }
    // `user_goals_check1`: aktive Ziele nur 1-3.
    const bleibtAktiv = a.status === undefined || a.status === 'active'
    if (bleibtAktiv && (a.priority < PRIO_MIN_AKTIV || a.priority > PRIO_MAX_AKTIV)) {
      return `Ein aktives Ziel trägt Priorität ${PRIO_MIN_AKTIV} bis ${PRIO_MAX_AKTIV}.`
    }
  }
  if (a.status !== undefined && !STATUS_WERTE.includes(a.status)) {
    return `Unbekannter Status: ${a.status}`
  }
  if (a.target_value !== undefined && a.target_value !== null
      && !Number.isFinite(a.target_value)) {
    return 'Der Zielwert muss eine Zahl sein.'
  }
  return null
}
