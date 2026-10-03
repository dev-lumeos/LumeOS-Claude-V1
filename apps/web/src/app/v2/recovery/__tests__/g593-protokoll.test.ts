// G-593: der Protokollknopf schreibt in `recovery.recovery_protocols`.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  pruefeProtokoll, protokollZeile, PROTOKOLL_ARTEN, PROTOKOLL_ZUSTAND,
  type ProtokollEingabe,
} from '../../../../lib/recovery/protokoll-regeln'

const GUT: ProtokollEingabe = {
  protocol_key: 'passive_deload', name: 'Passive Deload', started_on: '2026-10-03',
  duration_days: '7', daily_activities: ['Training volume −50%', 'Sleep priority 9h'],
}
const fall = (e: Partial<ProtokollEingabe>) =>
  pruefeProtokoll({ ...GUT, ...e }).map(f => f.feld)

// ── A1: je CHECK einzeln ─────────────────────────────────────────

test('G-593: eine gueltige Eingabe hat keine Fehler', () => {
  assert.deepEqual(pruefeProtokoll(GUT), [])
})

test('G-593: protocol_key — die vier des CHECKs', () => {
  assert.deepEqual([...PROTOKOLL_ARTEN],
    ['active_recovery_week', 'passive_deload', 'sleep_optimization', 'injury_protocol'])
  assert.deepEqual(fall({ protocol_key: 'deload' }), ['protocol_key'])
})

test('G-593: duration_days — ganze Tage 1 bis 31', () => {
  for (const d of ['0', '32', '7.5', '']) assert.deepEqual(fall({ duration_days: d }), ['duration_days'], d)
  for (const d of ['1', '31']) assert.deepEqual(fall({ duration_days: d }), [], d)
})

test('G-593: daily_activities — eine Liste, kein Objekt', () => {
  // `[read]` **Die Falle aus A1:** ein Objekt ist gueltiges JSON und
  // fiele erst am CHECK `jsonb_typeof = 'array'`.
  assert.deepEqual(fall({ daily_activities: { a: 'x' } as unknown as string[] }), ['daily_activities'])
  assert.deepEqual(fall({ daily_activities: ['ok', ''] }), ['daily_activities'])
  assert.deepEqual(fall({ daily_activities: [] }), [])
})

test('G-593: name und started_on sind NOT NULL', () => {
  assert.deepEqual(fall({ name: ' ' }), ['name'])
  assert.deepEqual(fall({ started_on: '' }), ['started_on'])
})

test('G-593: status und completed_days bleiben bei ihrer Vorgabe', () => {
  // `[read]` `'active'` und `0` sind genau der Start. Wer sie sendet,
  // kann einen Start als erledigt anlegen.
  const z = protokollZeile(GUT)
  assert.ok(!('status' in z), 'status wird gesendet')
  assert.ok(!('completed_days' in z), 'completed_days wird gesendet')
  assert.ok(Array.isArray(z.daily_activities))
  assert.equal(z.duration_days, 7)
})

// ── Tom, 2026-10-03: target_condition aus EINER Konstante ────────

test('G-593: target_condition folgt aus protocol_key, nie frei', () => {
  assert.deepEqual(Object.keys(PROTOKOLL_ZUSTAND).sort(), [...PROTOKOLL_ARTEN].sort())
  // Die zwei Bestandszeilen.
  assert.equal(PROTOKOLL_ZUSTAND.active_recovery_week, 'general_recovery')
  assert.equal(PROTOKOLL_ZUSTAND.sleep_optimization, 'poor_sleep')
  // Die zwei abgeleiteten.
  assert.equal(PROTOKOLL_ZUSTAND.passive_deload, 'overtraining_recovery')
  assert.equal(PROTOKOLL_ZUSTAND.injury_protocol, 'acute_injury')
  assert.equal(protokollZeile(GUT).target_condition, 'overtraining_recovery')
  // Die Eingabe kennt das Feld gar nicht.
  assert.ok(!('target_condition' in GUT))
})

// ── Aufrufer und Attrappen, je Fundstelle gezaehlt ───────────────

const SRC = path.join(process.cwd(), 'src')
const ohneKommentare = (s: string) => s
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(fs.readFileSync(path.join(SRC, p), 'utf8'))

function quellen(d = SRC, aus: string[] = []): string[] {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) { if (e.name !== '__tests__') quellen(p, aus) }
    else if (/\.tsx?$/.test(e.name)) aus.push(p)
  }
  return aus
}

test('G-593: `protokollStartenAktion` hat genau einen Aufrufer — das Modal', () => {
  const aus: Record<string, number> = {}
  for (const d of quellen()) {
    if (d.endsWith('erfassen-aktionen.ts')) continue
    const n = (ohneKommentare(fs.readFileSync(d, 'utf8')).match(/\bprotokollStartenAktion\(/g) ?? []).length
    if (n) aus[path.relative(SRC, d).replace(/\\/g, '/')] = n
  }
  assert.deepEqual(aus, { 'app/v2/recovery/modale.tsx': 1 })
})

test('G-593: genau EINE Datei schreibt auf `recovery_protocols`', () => {
  const schreiber = quellen().filter(d => {
    const s = ohneKommentare(fs.readFileSync(d, 'utf8'))
    return /from\('recovery_protocols'\)/.test(s) && /\.(insert|update|upsert|delete)\(/.test(s)
  }).map(d => path.relative(SRC, d).replace(/\\/g, '/'))
  assert.deepEqual(schreiber, ['lib/recovery/protokoll-write.ts'])
})

test('G-593: der Activate-Knopf ist keine Attrappe, sein falscher Grund ist weg', () => {
  const m = lies('app/v2/recovery/modale.tsx')
  const ab = m.indexOf('function ProtocolDetailModal(')
  const rumpf = m.slice(ab)
  assert.ok(ab > 0, 'ProtocolDetailModal nicht gefunden')
  assert.equal((rumpf.match(/<InEntwicklungKnopf titel="Activate protocol"/g) ?? []).length, 0,
    'Activate protocol ist wieder ein InEntwicklungKnopf')
  assert.equal((rumpf.match(/data-probe="protokoll-starten"/g) ?? []).length, 1)
  assert.doesNotMatch(m, /recovery\.protocols — die gibt es nicht/,
    'die Begruendung nennt wieder die Tabelle, die es unter anderem Namen gibt')
})

test('G-593: `Today · protocols logged` traegt keine Marke und liest die Tabelle', () => {
  const f = lies('app/v2/recovery/fehlende-kacheln.tsx')
  const ab = f.indexOf('<Card title="Today · protocols logged"')
  assert.ok(ab > 0, 'Kachel nicht gefunden')
  // `[read]` Bis zur Marke im Rumpf — ein `>` im `sub=`-Ausdruck
  // schnitte den Kopf sonst zu frueh ab.
  const kopf = f.slice(ab, f.indexOf('data-probe="protokolle-heute"', ab))
  // `[read]` **Jede Schreibform:** `attrappe={…}` UND das nackte
  // `attrappe` (boolesches Prop) — die zweite rutschte in der ersten
  // Fassung durch (Sabotage S8, gruen).
  assert.doesNotMatch(kopf, /\battrappe\b/, 'die Kachel ist wieder Attrappe')
  const rumpf = f.slice(ab, f.indexOf('</Card>', ab))
  assert.match(rumpf, /protokolle\.aktiv\.map\(/, 'die Kachel liest die laufenden Protokolle nicht')
  assert.doesNotMatch(f, /PROT_AUFGABEN/, 'die Entwurfsliste ist zurueck')
})
