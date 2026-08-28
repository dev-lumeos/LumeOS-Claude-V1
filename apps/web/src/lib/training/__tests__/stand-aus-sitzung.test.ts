// G-217: der Stand beim Betreten des Formulars — fortsetzen, nicht fragen.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  standVon, standSatz, darfAbschliessen, OHNE_SATZ_HINWEIS,
  type OffeneSitzung,
} from '../stand-aus-sitzung'

const HEUTE = '2026-08-28'
const OFFEN: OffeneSitzung = {
  id: 'a', session_date: HEUTE, started_time: '18:00:00', total_sets: 3,
}

test('G-217: ohne offene Sitzung ist der Stand `keine`', () => {
  assert.equal(standVon(null, HEUTE), 'keine')
  assert.equal(standSatz('keine', null), 'Kein laufendes Training.')
})

test('G-217: eine offene Sitzung von heute wird fortgesetzt', () => {
  assert.equal(standVon(OFFEN, HEUTE), 'offen_heute')
  assert.match(standSatz('offen_heute', OFFEN), /von heute/)
  assert.match(standSatz('offen_heute', OFFEN), /3 Sätze/)
})

test('G-217: eine aeltere offene Sitzung wird benannt, nicht behoben', () => {
  // `[read]` Wer vergessen hat abzuschliessen, soll es SEHEN. Eine
  // erfundene `ended_time` waere schlimmer als eine offene Sitzung.
  const alt = { ...OFFEN, session_date: '2026-08-26' }
  assert.equal(standVon(alt, HEUTE), 'offen_aelter')
  const satz = standSatz('offen_aelter', alt)
  assert.match(satz, /2026-08-26/)
  assert.match(satz, /nicht abgeschlossen/)
})

test('G-217: das Datum wird als Text verglichen, nicht ueber Date', () => {
  // `[read]` `new Date('2026-08-28')` verschoebe die Spalte je nach
  // Zeitzone um einen Tag — dieselbe Falle, die `absolviert` in
  // `sitzungen-read.ts` vermeidet.
  const s = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/training/stand-aus-sitzung.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')
  assert.doesNotMatch(s, /new Date\(/,
    'Der Stand rechnet mit Date — das verschiebt Datumsspalten (G-217).')
})

test('G-217: ein Satz heisst „1 Satz", nicht „1 Sätze"', () => {
  assert.match(standSatz('offen_heute', { ...OFFEN, total_sets: 1 }), /\b1 Satz\b/)
  assert.doesNotMatch(standSatz('offen_heute', { ...OFFEN, total_sets: 1 }), /1 Sätze/)
})

test('G-217: ohne Saetze laesst sich nicht abschliessen', () => {
  // `[read]` Sonst entstuende eine absolvierte Einheit ohne Leistung
  // — dieselbe leere Behauptung wie `status: completed` beim Anlegen
  // (G-216). Verwerfen bleibt erlaubt.
  assert.equal(darfAbschliessen(0), false)
  assert.equal(darfAbschliessen(1), true)
  assert.match(OHNE_SATZ_HINWEIS, /verwirf/i,
    'Der Hinweis nennt den Ausweg nicht (G-217).')
})

// ── Das Formular baut keine zweite Naht ──────────────────────────

const ohneKommentare = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-217: das Formular schreibt nicht selbst', () => {
  // `[cmd]` Die Naht ist `lib/training/sitzung-write.ts` (G-216).
  // Ein `.from(...).insert(...)` im Formular waere eine zweite.
  const s = ohneKommentare('src/app/v2/training/sitzung-formular.tsx')
  assert.doesNotMatch(s, /\.(insert|update|upsert|delete)\(/,
    'Das Formular schreibt selbst — die Naht ist sitzung-write.ts (G-217).')
  assert.doesNotMatch(s, /createSessionClient|createClient/,
    'Das Formular baut einen eigenen Datenbankzugriff (G-217).')
})

test('G-217: das Formular gibt den Uebungsnamen NICHT mit', () => {
  // `[cmd]` **`exercise_name` friert die Naht aus dem Katalog ein**
  // (G-216, live gegengeprobt). `[read]` Wer den Namen durch den
  // Browser reichte, koennte einen beliebigen schreiben — der
  // Snapshot muss aus der Quelle kommen.
  const s = ohneKommentare('src/app/v2/training/sitzung-formular.tsx')
  const aufruf = /uebungAnhaengenAktion\(([^)]*)\)/.exec(s)
  assert.ok(aufruf, 'Kein Aufruf von uebungAnhaengenAktion gefunden (G-217).')
  assert.doesNotMatch(aufruf[1], /name/i,
    'Der Name geht ans Anhaengen mit — dann waere er kein Snapshot (G-217).')

  const aktion = ohneKommentare('src/app/v2/training/sitzung-aktionen.ts')
  const sig = /uebungAnhaengenAktion\(\s*([\s\S]*?)\)\s*:/.exec(aktion)
  assert.ok(sig, 'Keine Signatur von uebungAnhaengenAktion gefunden (G-217).')
  assert.doesNotMatch(sig[1], /name/i,
    'Die Aktion nimmt einen Namen entgegen — der gehoert dem Katalog (G-217).')
})

test('G-217: A-30 — nur Typen aus dem Leseweg in die Browserdatei', () => {
  // `[cmd]` Ein Wert-Import aus `uebungen-read` oder `sitzungen-read`
  // zoege `next/headers` in das Browserpaket.
  const s = ohneKommentare('src/app/v2/training/sitzung-formular.tsx')
  const muster = /import\s+(type\s+)?\{[^}]*\}\s+from\s+'[^']*(uebungen-read|sitzungen-read)'/g
  let t: RegExpExecArray | null
  let gefunden = 0
  while ((t = muster.exec(s)) !== null) {
    gefunden++
    assert.ok(t[1], `Wert-Import aus ${t[2]} in einer 'use client'-Datei (A-30).`)
  }
  assert.ok(gefunden > 0, 'Kein Import aus dem Leseweg gefunden — Test prueft nichts (G-217).')
})
