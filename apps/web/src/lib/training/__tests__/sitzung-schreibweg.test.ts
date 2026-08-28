// G-216: Trainingserfassung — Regeln, Snapshot und Naht.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  pruefeSitzung, pruefeSatz, aggregat, volumen, epley, dauerMinuten,
  ZUSTAENDE, SATZARTEN, LEERE_SITZUNG, LEERER_SATZ, OFFEN_BLEIBT,
  type SatzEingabe,
} from '../sitzung-regeln'

const SATZ: SatzEingabe = { ...LEERER_SATZ, reps: '8', weight_kg: '80' }

// ── Die Zustaende kommen aus dem Schema ──────────────────────────

test('G-216: die vier Zustaende sind die des Schemas', () => {
  // `[cmd]` Aus `workout_sessions_status_check` gelesen, nicht
  // erfunden (gemessen 2026-08-28).
  assert.deepEqual([...ZUSTAENDE],
    ['planned', 'active', 'completed', 'cancelled'])
})

test('G-216: die Satzarten sind die des Schemas', () => {
  // `[cmd]` `workout_sets_set_type_check`.
  assert.deepEqual([...SATZARTEN], ['working', 'warmup', 'dropset', 'failure'])
})

// ── Die Sitzung ──────────────────────────────────────────────────

test('G-216: eine Sitzung braucht ein Datum', () => {
  assert.deepEqual(pruefeSitzung({ ...LEERE_SITZUNG, session_date: '2026-08-28' }), [])
  assert.deepEqual(
    pruefeSitzung({ ...LEERE_SITZUNG, session_date: 'gestern' }).map(f => f.feld),
    ['session_date'])
})

// ── Der Satz, gegen die CHECK-Constraints ────────────────────────

test('G-216: ein gueltiger Satz hat keine Fehler', () => {
  assert.deepEqual(pruefeSatz(SATZ), [])
})

test('G-216: ohne Wiederholungen ist es kein Satz', () => {
  // `[cmd]` `workout_sets_check` verlangt reps ODER duration ODER
  // distance. `[read]` Die Kraft-Erfassung macht daraus eine
  // Fachregel statt eines Datenbankfehlers.
  for (const r of ['', '0', '-3', 'viele', '8.5']) {
    assert.deepEqual(pruefeSatz({ ...SATZ, reps: r }).map(f => f.feld), ['reps'], r)
  }
})

test('G-216: RPE 1 bis 10, RIR 0 bis 10', () => {
  // `[cmd]` `workout_sets_rpe_check` beginnt bei 1,
  // `workout_sets_rir_check` bei 0 — das ist kein Tippfehler.
  assert.deepEqual(pruefeSatz({ ...SATZ, rpe: '0' }).map(f => f.feld), ['rpe'])
  assert.deepEqual(pruefeSatz({ ...SATZ, rpe: '10' }), [])
  assert.deepEqual(pruefeSatz({ ...SATZ, rir: '0' }), [])
  assert.deepEqual(pruefeSatz({ ...SATZ, rir: '11' }).map(f => f.feld), ['rir'])
})

test('G-216: Gewicht darf fehlen, aber nicht negativ sein', () => {
  // `[read]` Klimmzuege mit Koerpergewicht tragen kein Gewicht.
  assert.deepEqual(pruefeSatz({ ...SATZ, weight_kg: '' }), [])
  assert.deepEqual(pruefeSatz({ ...SATZ, weight_kg: '-5' }).map(f => f.feld), ['weight_kg'])
})

// ── Was gerechnet wird ───────────────────────────────────────────

test('G-216: Volumen ist reps * Gewicht, ohne Gewicht null', () => {
  // `[cmd]` Im Bestand gilt das bei allen 238 Saetzen.
  assert.equal(volumen(8, 80), 640)
  assert.equal(volumen(8, null), null,
    'Ohne Gewicht ist 0 eine Behauptung, keine Messung (G-216).')
})

test('G-216: ein Aufwaermsatz bekommt kein 1RM', () => {
  // `[cmd]` 216 von 238 Saetzen tragen einen Wert; die fehlenden
  // sind `warmup`. `[read]` Ein Aufwaermsatz sagt ueber die
  // Maximalkraft nichts.
  assert.equal(epley(8, 80, 'warmup'), null)
  assert.equal(epley(8, 80, 'working'), 101.33)
})

test('G-216: die Dauer ueber Mitternacht ist null, keine Zahl', () => {
  // `[cmd]` `workout_sessions_duration_minutes_check` verbietet
  // negative Werte.
  assert.equal(dauerMinuten('18:00:00', '19:30:00'), 90)
  assert.equal(dauerMinuten('23:30:00', '00:15:00'), null)
})

// ── Die Aggregate ────────────────────────────────────────────────

test('G-216: das Aggregat wird gerechnet, nicht fortgeschrieben', () => {
  // `[cmd]` **Der Grund steht im Bestand:** nur 14 von 36
  // Seed-Sitzungen fuehren ein `total_sets`, das mit der echten Zahl
  // uebereinstimmt (gemessen 2026-08-28).
  const a = aggregat([
    { reps: 8, volume_kg: 640, weight_kg: 80, estimated_1rm: 101.33 },
    { reps: 6, volume_kg: 540, weight_kg: 90, estimated_1rm: 108 },
    { reps: 10, volume_kg: null, weight_kg: null, estimated_1rm: null },
  ])
  assert.equal(a.total_sets, 3)
  assert.equal(a.total_reps, 24)
  assert.equal(a.total_volume_kg, 1180)
  assert.equal(a.max_weight_kg, 90)
  assert.equal(a.best_estimated_1rm, 108)
})

test('G-216: ein leeres Aggregat ist 0, nicht null', () => {
  const a = aggregat([])
  assert.equal(a.total_sets, 0)
  assert.equal(a.total_volume_kg, 0)
  assert.equal(a.max_weight_kg, null,
    'Ein Hoechstgewicht ohne Saetze gibt es nicht (G-216).')
})

test('G-216: der Satz zum offenen Zustand nennt beide Folgen', () => {
  assert.match(OFFEN_BLEIBT, /nicht als Leistung/i)
  assert.match(OFFEN_BLEIBT, /nicht verloren/i)
})

// ── Die Naht ─────────────────────────────────────────────────────

const ohneKommentare = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

function alleQuellen(): string[] {
  const aus: string[] = []
  const geh = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) geh(p)
      else if (/\.tsx?$/.test(e.name) && !/__tests__/.test(p)) aus.push(p)
    }
  }
  geh(path.join(process.cwd(), 'src'))
  return aus
}

function schreiberAuf(tabelle: string): string[] {
  const aus: string[] = []
  for (const datei of alleQuellen()) {
    const s = fs.readFileSync(datei, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '')
    if (!new RegExp(`from\\('${tabelle}'\\)`).test(s)) continue
    if (/\.(insert|update|upsert|delete)\(/.test(s)) {
      aus.push(datei.replace(process.cwd(), '').replace(/\\/g, '/'))
    }
  }
  return aus
}

for (const tabelle of ['workout_sessions', 'workout_exercises', 'workout_sets']) {
  test(`G-216: genau EINE Datei schreibt auf \`${tabelle}\``, () => {
    assert.deepEqual(schreiberAuf(tabelle),
      ['/src/lib/training/sitzung-write.ts'],
      'Soll: genau eine Schreibstelle (G-216).')
  })
}

// ── Der Snapshot ─────────────────────────────────────────────────

test('G-216: `exercise_name` wird beim Schreiben eingefroren', () => {
  // `[read]` Dieselbe Regel wie `dose_snapshot` (G-138) und
  // `height_cm_snapshot` (G-122): zum Schreibzeitpunkt kopiert,
  // danach nie nachgeschlagen.
  const s = ohneKommentare('src/lib/training/sitzung-write.ts')

  const einfuegen = /\.from\('workout_exercises'\)\s*\n\s*\.insert\(\{([\s\S]*?)\}\)/.exec(s)
  assert.ok(einfuegen, 'Kein insert auf workout_exercises gefunden (G-216).')
  assert.match(einfuegen[1], /exercise_name:\s*String\(uebung\.name\)/,
    'Der Name wird nicht aus dem Katalog eingefroren (G-216).')

  // Und er darf beim Aendern NICHT nachgezogen werden.
  const aendern = /\.from\('workout_exercises'\)\s*\n\s*\.update\(\{([\s\S]*?)\}\)/.exec(s)
  assert.ok(aendern, 'Kein update auf workout_exercises gefunden (G-216).')
  assert.doesNotMatch(aendern[1], /exercise_name/,
    'Das Aendern zieht den Snapshot nach — dann waere es keiner (G-216).')
})

test('G-216: eine neue Sitzung ist offen, nicht abgeschlossen', () => {
  // `[cmd]` Der Vorgabewert der Spalte ist `'completed'`. `[read]`
  // Wer ihn stehen laesst, hat eine absolvierte Sitzung ohne einen
  // einzigen Satz.
  const s = ohneKommentare('src/lib/training/sitzung-write.ts')
  const einfuegen = /\.from\('workout_sessions'\)\s*\n\s*\.insert\(\{([\s\S]*?)\}\)/.exec(s)
  assert.ok(einfuegen, 'Kein insert auf workout_sessions gefunden (G-216).')
  assert.match(einfuegen[1], /status:\s*'active'/,
    'Die neue Sitzung uebernimmt den Vorgabewert `completed` (G-216).')
  assert.match(einfuegen[1], /ended_time:\s*null/,
    'Eine offene Sitzung darf keine Endzeit tragen (G-216).')
})

test('G-216: jeder Schreibzugriff prueft auf null Zeilen (G-79)', () => {
  // `[cmd]` PostgREST meldet `ok`, wenn der Zeilenschutz leer
  // filtert. Jedes insert/update traegt deshalb ein `.select(...)`.
  //
  // `[read]` **Erst gezaehlt, dann gemessen.** Die erste Fassung
  // verglich die ANZAHL `.select(` mit der Anzahl `.insert|update(`
  // — die Sabotageprobe kam durch, weil ein Zugriff mit zwei
  // `.select()` den Verlust bei einem anderen ausglich. **Genau die
  // Klasse „eine Pruefung misst etwas anderes als gemeint".**
  // Jetzt wird JEDE Anweisung einzeln betrachtet.
  const s = ohneKommentare('src/lib/training/sitzung-write.ts')
  const ohne: string[] = []
  const muster = /\.(insert|update)\(/g
  let t: RegExpExecArray | null
  while ((t = muster.exec(s)) !== null) {
    // Die Anweisung reicht bis zum abschliessenden Strichpunkt.
    const rest = s.slice(t.index)
    const anweisung = rest.slice(0, rest.indexOf('\n  if ') + 1 || rest.indexOf(';') + 1)
    if (!/\.select\(/.test(anweisung)) {
      ohne.push(`${t[1]} bei Zeichen ${t.index}`)
    }
  }
  assert.deepEqual(ohne, [],
    `Schreibzugriffe ohne .select(): ${ohne.join(', ')} (G-79).`)
})

test('G-216: verwerfen loescht nicht', () => {
  // `[read]` Dieselbe Entscheidung wie „Absetzen ist kein Loeschen"
  // (G-211): ein abgebrochenes Training ist eine Tatsache ueber den
  // Tag.
  const s = ohneKommentare('src/lib/training/sitzung-write.ts')
  assert.match(s, /status:\s*'cancelled'/)
  assert.doesNotMatch(s, /\.delete\(\)/,
    'Der Schreibweg loescht — verwerfen ist ein Zustand (G-216).')
})
