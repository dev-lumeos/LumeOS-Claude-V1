// G-218: die feinstufige Bewertung — beide Achsen.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  STUFEN, STUFEN_RANG, STUFEN_FARBE, STUFEN_TEXT, HANDLUNG_TEXT,
  istHervorgehoben, istArztsache, nachStufe, verteilung,
} from '../regel-stufen'

test('G-218: die vier Stufen sind die des Katalogs', () => {
  // `[cmd]` Aus `supplements.rule_catalog` gelesen (2026-08-28):
  // critical 10, high 18, medium 17, low 19.
  assert.deepEqual([...STUFEN], ['critical', 'high', 'medium', 'low'])
})

test('G-218: die sieben Handlungsarten sind die des Katalogs', () => {
  // `[cmd]` physician_referral 33, information 15, lab_context 8,
  // warning 3, schedule_adjustment 2, general_information 2,
  // verify_prescription 1 — Summe 64.
  assert.deepEqual(Object.keys(HANDLUNG_TEXT).sort(), [
    'general_information', 'information', 'lab_context',
    'physician_referral', 'schedule_adjustment', 'verify_prescription',
    'warning',
  ])
})

test('G-218: schwerste zuerst, Unbekanntes ans Ende', () => {
  const sortiert = nachStufe([
    { rule_id: 'c', severity: 'low' },
    { rule_id: 'a', severity: 'critical' },
    { rule_id: 'd', severity: 'erfunden' },
    { rule_id: 'b', severity: 'high' },
  ])
  assert.deepEqual(sortiert.map(r => r.rule_id), ['a', 'b', 'c', 'd'],
    'Eine unbekannte Stufe ist kein Notfall — sie faellt ans Ende (G-218).')
})

test('G-218: bei gleicher Stufe entscheidet die Kennung', () => {
  // `[read]` Sonst springt die Reihenfolge zwischen zwei Aufrufen,
  // und das sieht aus wie ein Fehler (G-187).
  const s = nachStufe([
    { rule_id: 'wr_z', severity: 'high' },
    { rule_id: 'wr_a', severity: 'high' },
  ])
  assert.deepEqual(s.map(r => r.rule_id), ['wr_a', 'wr_z'])
})

// ── Der Kern: critical gegen high ────────────────────────────────

test('G-218: critical und high teilen sich die FARBE — deshalb Flaeche', () => {
  // `[cmd]` **Der gemessene Befund (2026-08-28):** beide rendern in
  // `--neg` = `oklch(0.50 0.16 22)`. `[read]` Ein zweiter Rotton
  // daneben waere nicht unterscheidbar — `critical` bekommt deshalb
  // Rahmen und Hintergrund, nicht eine dritte Rotnuance.
  assert.equal(STUFEN_FARBE.critical, STUFEN_FARBE.high,
    'Wenn die Farben sich trennen liessen, braeuchte es die Flaeche nicht (G-218).')
  assert.equal(istHervorgehoben('critical'), true)
  assert.equal(istHervorgehoben('high'), false,
    'Mit `high` waeren es 28 von 64 Regeln — das hebt nichts mehr hervor (G-218).')
})

test('G-218: die Stufe steht auf Deutsch da', () => {
  assert.equal(STUFEN_TEXT.critical, 'kritisch')
  assert.equal(STUFEN_TEXT.low, 'gering')
  for (const s of STUFEN) {
    assert.ok(STUFEN_TEXT[s], `Stufe ${s} ohne Klartext (G-218).`)
    assert.notEqual(STUFEN_TEXT[s], s, `Stufe ${s} ist unuebersetzt (G-218).`)
  }
})

// ── Die zweite Achse ─────────────────────────────────────────────

test('G-218: die Handlungsart haengt NICHT an der Schwere', () => {
  // `[cmd]` **Das ist die Messung, die die Gestaltung entscheidet:**
  // `physician_referral` steht bei 17 `high`, 10 `critical` UND 6
  // `medium`. `[read]` Eine `medium`-Regel, die zum Arzt schickt,
  // sagt etwas anderes als eine, die ein Einnahmefenster verschiebt.
  assert.equal(istArztsache('physician_referral'), true)
  assert.equal(istArztsache('schedule_adjustment'), false)
  assert.equal(istArztsache('lab_context'), false)
  assert.equal(istArztsache(null), false)
})

test('G-218: jede Handlungsart hat einen deutschen Text', () => {
  for (const [k, v] of Object.entries(HANDLUNG_TEXT)) {
    assert.ok(v.length > 0, `${k} ohne Text (G-218).`)
    assert.notEqual(v, k, `${k} ist unuebersetzt (G-218).`)
  }
})

// ── Die Verteilung ───────────────────────────────────────────────

test('G-218: gezaehlt wird, was zutrifft — nicht der Katalog', () => {
  // `[read]` Eine Kopfzeile „10 kritisch" waere eine Falschmeldung,
  // solange keine davon feuert.
  const v = verteilung([
    { severity: 'critical' }, { severity: 'high' }, { severity: 'high' },
  ])
  assert.deepEqual(v, [
    { stufe: 'critical', anzahl: 1 },
    { stufe: 'high', anzahl: 2 },
  ], 'Leere Stufen gehoeren nicht in die Kopfzeile (G-218).')
  assert.deepEqual(verteilung([]), [])
})

test('G-218: die Verteilung steht in der Rangfolge', () => {
  const v = verteilung([{ severity: 'low' }, { severity: 'critical' }])
  assert.deepEqual(v.map(x => x.stufe), ['critical', 'low'])
})

// ── Die Anzeige benutzt beide Achsen ─────────────────────────────

const ohneKommentare = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-218: die Karte zeichnet BEIDE Achsen aus', () => {
  const s = ohneKommentare('src/app/v2/supplements/tab-interactions-echt.tsx')
  assert.match(s, /istHervorgehoben\(r\.severity\)/,
    'Die Schwere hebt die Karte nicht hervor (G-218).')
  assert.match(s, /istArztsache\(r\.aktion\)/,
    'Die Handlungsart wird nicht ausgezeichnet — dann geht sie zwischen '
    + 'den Kontextmarken unter (G-218).')
})

test('G-218: die Anzeige fuehrt keine eigene Stufentabelle', () => {
  // `[read]` Zwei Tabellen fuer dieselbe Zusage laufen auseinander —
  // dieselbe Begruendung wie bei der Naht (G-122).
  const s = ohneKommentare('src/app/v2/supplements/tab-interactions-echt.tsx')
  assert.doesNotMatch(s, /const\s+(SCHWERE_FARBE|SCHWERE_RANG|AKTION_TEXT)\s*[:=]/,
    'Die Anzeige haelt eine zweite Stufentabelle (G-218).')
})

test('G-218: keine Regel wird umbewertet', () => {
  // `[cmd]` Auftrag: „Keine Regel aendern, keine severity anpassen —
  // die Anzeige folgt dem Bestand."
  const s = ohneKommentare('src/lib/supplements/regel-stufen.ts')
  assert.doesNotMatch(s, /\.(insert|update|upsert|delete)\(/,
    'Die Stufendatei schreibt (G-218).')
  assert.doesNotMatch(s, /severity\s*=\s*'/,
    'Die Stufendatei setzt eine severity (G-218).')
})
