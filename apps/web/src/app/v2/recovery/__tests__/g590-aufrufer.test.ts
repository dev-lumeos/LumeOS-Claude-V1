// G-590: drei Serveraktionen aus G-122 — zwei bekommen ihren Aufrufer.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  checkinZusatz, pruefeCheckin, LEERER_CHECKIN, type CheckinEingabe,
} from '../../../../lib/recovery/checkin-regeln'

const BASIS: CheckinEingabe = { ...LEERER_CHECKIN, entry_date: '2026-10-03', mood: 'good' }

// ── Was gesendet wird ────────────────────────────────────────────

test('G-590: fehlende optionale Felder fehlen auch im upsert', () => {
  // `[read]` **PostgREST setzt nur gesendete Spalten.** Das Formular
  // fuehrt Energie, Motivation und Notiz nicht — ein zweites Speichern
  // am selben Tag darf ihren Bestandswert nicht leeren.
  const { energy_level: _e, motivation: _m, notes: _n, ...ohne } = BASIS
  const z = checkinZusatz(ohne)
  for (const k of ['energy_level', 'motivation', 'notes']) {
    assert.ok(!(k in z), `\`${k}\` wird gesendet, obwohl das Formular es nicht fuehrt`)
  }
  const mit = checkinZusatz({ ...BASIS, energy_level: '6', motivation: '', notes: ' x ' })
  assert.equal(mit.energy_level, 6)
  assert.equal(mit.motivation, null)
  assert.equal(mit.notes, 'x')
})

test('G-590: Muskelkater und Schlafhygiene werden gesendet', () => {
  const z = checkinZusatz({
    ...BASIS, alcohol_units: '1,5', caffeine_mg: '280', screen_time_before_bed: '',
    soreness: { chest: 2, glutes: 0, back: 3 },
  })
  assert.equal(z.alcohol_units, 1.5)
  assert.equal(z.caffeine_mg, 280)
  assert.equal(z.screen_time_before_bed, null)
  // `[cmd]` Im Bestand traegt `soreness` nur Stufen 1-3.
  assert.deepEqual(z.soreness, { chest: 2, back: 3 })
})

test('G-590: die drei Hygienefelder und der Muskelkater werden geprueft', () => {
  // `[cmd]` `checkins_alcohol_units_check`, `_caffeine_mg_check`,
  // `_screen_time_before_bed_check`: alle `>= 0`; die beiden letzten
  // sind `integer`.
  const fall = (e: Partial<CheckinEingabe>) => pruefeCheckin({ ...BASIS, ...e }).map(f => f.feld)
  assert.deepEqual(fall({ alcohol_units: '-1' }), ['alcohol_units'])
  assert.deepEqual(fall({ alcohol_units: '0.5' }), [])
  assert.deepEqual(fall({ caffeine_mg: '12.5' }), ['caffeine_mg'])
  assert.deepEqual(fall({ screen_time_before_bed: '-3' }), ['screen_time_before_bed'])
  assert.deepEqual(fall({ soreness: { chest: 4 } }), ['soreness'])
  assert.deepEqual(fall({ soreness: { chest: 3, back: 0 } }), [])
})

// ── Die Aufrufer ─────────────────────────────────────────────────

const SRC = path.join(process.cwd(), 'src')
const ohneKommentare = (s: string) => s
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

function quellen(): string[] {
  const aus: string[] = []
  const geh = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) { if (e.name !== '__tests__') geh(p) }
      else if (/\.tsx?$/.test(e.name)) aus.push(p)
    }
  }
  geh(SRC)
  return aus
}

/** Aufrufstellen je Datei — gezaehlt, nicht gesucht. */
function aufrufe(name: string): Record<string, number> {
  const aus: Record<string, number> = {}
  for (const d of quellen()) {
    if (d.endsWith('erfassen-aktionen.ts')) continue
    const n = (ohneKommentare(fs.readFileSync(d, 'utf8'))
      .match(new RegExp(`\\b${name}\\(`, 'g')) ?? []).length
    if (n) aus[path.relative(SRC, d).replace(/\\/g, '/')] = n
  }
  return aus
}

test('G-590: der Check-in-Knopf ruft `checkinAktion` — genau eine Stelle', () => {
  assert.deepEqual(aufrufe('checkinAktion'), { 'app/v2/recovery/tab-checkin.tsx': 1 })
})

test('G-590: der Log-Knopf ruft `modalitaetAnlegenAktion` — genau eine Stelle', () => {
  assert.deepEqual(aufrufe('modalitaetAnlegenAktion'), { 'app/v2/recovery/modale.tsx': 1 })
})

test('G-590: die beiden Knoepfe sind keine Attrappe mehr', () => {
  const checkin = ohneKommentare(fs.readFileSync(
    path.join(SRC, 'app/v2/recovery/tab-checkin.tsx'), 'utf8'))
  assert.equal((checkin.match(/<InEntwicklungKnopf\b/g) ?? []).length, 0,
    'tab-checkin.tsx traegt wieder einen InEntwicklungKnopf')
  // `[read]` Nur der Rumpf von `LogModalityModal` — HRV und Protokolle
  // in derselben Datei bleiben Attrappe (A6).
  const modale = ohneKommentare(fs.readFileSync(
    path.join(SRC, 'app/v2/recovery/modale.tsx'), 'utf8'))
  const ab = modale.indexOf('function LogModalityModal(')
  const bis = modale.indexOf('\nfunction ', ab + 1)
  assert.ok(ab > 0 && bis > ab, 'LogModalityModal nicht gefunden')
  assert.equal((modale.slice(ab, bis).match(/<InEntwicklungKnopf\b/g) ?? []).length, 0,
    'der Log-Knopf ist wieder ein InEntwicklungKnopf')
  assert.equal((modale.match(/<InEntwicklungKnopf\b/g) ?? []).length, 3,
    'HRV-Speichern und die zwei Protokollknoepfe sollen Attrappe bleiben (A6)')
})
