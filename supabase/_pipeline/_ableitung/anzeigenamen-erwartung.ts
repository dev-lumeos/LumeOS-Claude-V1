// Die erwartete Zeilenzahl der Anzeigenamen — ABGELEITET, nicht
// festgeschrieben.
//
// ANLASS (2026-08-15): `[cmd]` In beiden Einspielschritten stand
// `EXPECTED_LINES = 5775` hart im Code, fuenfmal insgesamt. Beim
// Phase-1-Nachtrag wuchs `anzeigenamen.jsonl` auf 7.140 Zeilen, die
// Zahl wurde nicht mitgezogen — die Kette brach bei 025 ab.
//
// `[read]` Die harte Zahl war KEIN Fehler, sondern Absicherung gegen
// einen stillen Teilimport; genau so ist er bei den Fettsaeuren
// passiert. Sie einfach auf 7.140 zu setzen wuerde das Problem beim
// naechsten Bestandsnachtrag wiederholen.
//
// Stattdessen wird die Erwartung aus DREI Quellen gebildet, die alle
// uebereinstimmen muessen:
//   1. daten/anzeigenamen.jsonl        (Ausgabe der Kuration)
//   2. daten/anzeigenamen-eingabe.jsonl (Eingabe derselben Kuration)
//   3. nutrition.foods                  (der Bestand selbst)
// Weicht eine ab, bricht der Schritt ab und nennt ALLE DREI Zahlen —
// sonst ist nicht erkennbar, welche Seite hinkt.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

export const AUSGABE = 'supabase/_pipeline/daten/anzeigenamen.jsonl'
export const EINGABE = 'supabase/_pipeline/daten/anzeigenamen-eingabe.jsonl'

export function zeilenVon(datei: string): string[] {
  return fs.readFileSync(datei, 'utf8').split('\n').filter(l => l.length > 0)
}

/** Anzahl Lebensmittel im Bestand — die massgebliche Groesse. */
export function foodsImBestand(container: string, db: string): number {
  const r = spawnSync('docker',
    ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', db, '-t', '-A',
     '-c', 'SELECT count(*) FROM nutrition.foods;'],
    { encoding: 'utf8' })
  if (r.status !== 0) {
    console.error(r.stderr || 'psql-Aufruf fehlgeschlagen')
    process.exit(r.status ?? 1)
  }
  const n = Number(String(r.stdout).trim())
  if (!Number.isFinite(n)) {
    console.error(`nutrition.foods: unerwartete Antwort "${String(r.stdout).trim()}"`)
    process.exit(1)
  }
  return n
}

/**
 * Prueft die drei Zahlen gegeneinander und liefert die Erwartung.
 * Bricht ab, sobald eine abweicht — mit allen drei Zahlen in der
 * Meldung.
 */
export function erwarteteZeilen(container: string, db: string): number {
  const ausgabe = zeilenVon(AUSGABE).length
  const eingabe = zeilenVon(EINGABE).length
  const foods = foodsImBestand(container, db)

  if (ausgabe !== eingabe || ausgabe !== foods) {
    console.error(
      'Zeilenzahlen stimmen nicht ueberein — Abbruch.\n' +
      `  anzeigenamen.jsonl        : ${ausgabe}\n` +
      `  anzeigenamen-eingabe.jsonl: ${eingabe}\n` +
      `  nutrition.foods           : ${foods}\n` +
      'Alle drei muessen gleich sein. Die abweichende Seite zeigt, wo\n' +
      'der Nachtrag fehlt: Kuration unvollstaendig, Eingabe veraltet,\n' +
      'oder der Bestand ist gewachsen ohne dass kuriert wurde.')
    process.exit(1)
  }
  return ausgabe
}
