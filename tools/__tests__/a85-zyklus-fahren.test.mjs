// A-85 — die ausfuehrende Haelfte des Zyklus.
//
// `[read]` **Die Nachweise laufen auf Attrappen, nicht auf echten
// Punkten.** Zwei Auftraege liegen gerade in `laufend_claudecode/` und
// einer in `laufend_codex/` — **eine Probe, die eine echte Punktdatei
// verschiebt, zerstoert laufende Arbeit.** Jeder Test baut sich seine
// eigene Punktewurzel in einem Temporaerverzeichnis.
//
// `[read]` **Die reinen Funktionen werden gerufen, nicht gegreppt** —
// `assert.match` auf Quelltext misst nichts.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  abschnittErsetzen, feldSetzen, stufeVon, tabellenZeilen, wegPruefen,
} from '../zyklus-fahren.mjs'

const WERKZEUG = 'tools/zyklus-fahren.mjs'

function lauf(...args) {
  return spawnSync(process.execPath, [WERKZEUG, ...args],
    { cwd: process.cwd(), encoding: 'utf8' })
}

/** Eine Attrappen-Punktewurzel mit allen vier Stufen. */
function buehne() {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'lumeos-a85-'))
  const punkte = path.join(dir, 'punkte')
  for (const o of ['todos', 'erledigt', 'laufend_codex/next',
    'laufend_claudecode/next']) {
    fs.mkdirSync(path.join(punkte, o), { recursive: true })
  }
  return { dir, punkte }
}

function attrappe(nr, titel, felder = {}) {
  const kopf = ['---', `nr: ${nr}`, 'typ: fehler', 'modul: quer',
    'schwere: mittel', 'angelegt: 2026-10-01']
  for (const [k, v] of Object.entries(felder)) kopf.push(`${k}: ${v}`)
  kopf.push('', 'braucht: []', '---', '', `# ${nr} - ${titel}`, '',
    '## Auftrag', '', 'A1 - die Zahl oben gleicht der Zahl unten.', '')
  return kopf.join('\n')
}

// ══ A1 — DER TABELLENGENERATOR ═══════════════════════════════════════

test('A-85/A1: die Tabelle entsteht aus dem Frontmatter, Stand abgeleitet', () => {
  const zeilen = tabellenZeilen([
    {
      ordner: 'laufend_claudecode',
      vorbereitet: false,
      daten: { nr: 'G-569', beauftragt: '2026-10-01' },
      text: '---\nnr: G-569\n---\n\n# G-520 prueft Kilogramm\n',
    },
    {
      ordner: 'laufend_codex',
      vorbereitet: true,
      daten: { nr: 'G-531' },
      text: '---\nnr: G-531\n---\n\n# G-531 — die Kette\n',
    },
  ])

  assert.equal(zeilen[0], '| Agent | Nr | Inhalt | Stand |')
  assert.deepEqual(zeilen.slice(2), [
    '| Claude Code | G-569 | G-520 prueft Kilogramm | **laeuft**, raus 01.10. |',
    '| Claude Code | — | `next/` ist leer | **offen**: Schritt 7 des Zyklus |',
    '| Codex | G-531 | die Kette | **bereit in `next/`** |',
  ])
})

test('A-85/A1: ein Agent ohne jeden Punkt kommt NICHT in die Tabelle', () => {
  // `[cmd]` **`laufend_fable/` und `laufend_kimi/` existieren und sind
  // leer.** Eine Zeile "Schritt 7 offen" fuer sie waere eine
  // Falschaussage — niemand wartet dort auf einen Auftrag.
  const zeilen = tabellenZeilen([{
    ordner: 'laufend_codex',
    vorbereitet: false,
    daten: { nr: 'A-77', beauftragt: '2026-10-01' },
    text: '---\nnr: A-77\n---\n\n# A-77 - Werkzeugtests\n',
  }])
  assert.equal(zeilen.filter(z => /Fable|Kimi|Claude Code/.test(z)).length, 0)
  assert.equal(zeilen.length, 4) // Kopf, Trenner, laufend, next-leer
})

test('A-85/A1: ausserhalb der Markierungen bleibt die Datei byteidentisch', () => {
  const vor = 'Prosa oben\n\nmit Leerzeile\n'
  const nach = '\n## Ein Abschnitt, der bleibt\n\n    eine Zahl: 604\n'
  const alt = `${vor}<!-- ERZEUGT:laufend-tabelle -->\nALT\nALT\n`
    + `<!-- /ERZEUGT:laufend-tabelle -->${nach}`

  const neu = abschnittErsetzen(alt, ['| a |', '|---|', '| b |'])

  assert.equal(neu.slice(0, vor.length), vor)
  assert.equal(neu.slice(-nach.length), nach)
  assert.match(neu, /<!-- ERZEUGT:laufend-tabelle -->\n\| a \|\n\|---\|\n\| b \|\n<!-- \/ERZEUGT/)
  assert.ok(!neu.includes('ALT'))
})

test('A-85/A1 Sabotage: fehlt eine Markierung, bricht es ab statt zu raten', () => {
  // `[read]` **Eine geratene Grenze loescht Prosa.** Die Gegenprobe ist
  // der Normalfall darueber: MIT Marken geht es durch.
  assert.throws(() => abschnittErsetzen('nur Prosa, keine Marken\n', ['| a |']),
    /Markierungen fehlen/)
  assert.throws(() => abschnittErsetzen(
    '<!-- /ERZEUGT:laufend-tabelle -->\n<!-- ERZEUGT:laufend-tabelle -->\n', ['| a |']),
    /Endmarkierung steht vor/)
})

test('A-85/A1: --schreiben ruehrt nur den Abschnitt an, --trocken nichts', () => {
  const { dir, punkte } = buehne()
  try {
    fs.writeFileSync(path.join(punkte, 'laufend_codex', 'a-0001-probe.md'),
      attrappe('A-1', 'die Probe', { agent: 'codex', beauftragt: '2026-10-01' }))
    const ziel = path.join(dir, 'LAUFEND.md')
    const umgebung = 'oben\n\n<!-- ERZEUGT:laufend-tabelle -->\nleer\n'
      + '<!-- /ERZEUGT:laufend-tabelle -->\n\nunten\n'
    fs.writeFileSync(ziel, umgebung)

    const trocken = lauf('tabelle', '--punkte', punkte, '--ziel', ziel,
      '--schreiben', '--trocken')
    assert.equal(trocken.status, 0)
    assert.equal(fs.readFileSync(ziel, 'utf8'), umgebung, '--trocken schreibt nicht')

    const r = lauf('tabelle', '--punkte', punkte, '--ziel', ziel, '--schreiben')
    assert.equal(r.status, 0, r.stderr)
    const neu = fs.readFileSync(ziel, 'utf8')
    assert.match(neu, /^oben\n\n/)
    assert.match(neu, /\n\nunten\n$/)
    assert.match(neu, /\| Codex \| A-1 \| die Probe \| \*\*laeuft\*\*, raus 01\.10\. \|/)
    assert.ok(!neu.includes('\nleer\n'))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

// ══ A2 — DER FRONTMATTER-SETZER ══════════════════════════════════════

test('A-85/A2: ein Feld kommt vor die erste Leerzeile des Frontmatters', () => {
  const text = attrappe('A-1', 'die Probe')
  const neu = feldSetzen(text, 'agent', 'codex')
  const kopf = neu.split('\n').slice(0, neu.split('\n').indexOf('---', 1))
  assert.ok(kopf.includes('agent: codex'))
  assert.ok(kopf.indexOf('agent: codex') > kopf.indexOf('angelegt: 2026-10-01'))
  // Der Rumpf bleibt unberuehrt.
  assert.equal(neu.split('---\n').slice(2).join('---\n'),
    text.split('---\n').slice(2).join('---\n'))
})

test('A-85/A2 Sabotage: ein Feld, das schon dasteht, wird NICHT ueberschrieben', () => {
  const text = attrappe('A-1', 'die Probe', { beauftragt: '2026-09-29' })
  assert.throws(() => feldSetzen(text, 'beauftragt', '2026-10-01'),
    /beauftragt: steht schon da \(2026-09-29\)/)
  // Gegenprobe: ein leeres Feld darf ersetzt werden.
  const leer = attrappe('A-1', 'die Probe', { beauftragt: 'null' })
  assert.match(feldSetzen(leer, 'beauftragt', '2026-10-01'), /^beauftragt: 2026-10-01$/m)
})

test('A-85/A2: gelesen wird VOR dem Schreiben — die Datei bleibt vollstaendig', () => {
  // `[cmd]` **Am 01.10. standen zwei Punktdateien auf 0 Bytes**, weil ein
  // Schreibgriff die Datei leerte, bevor der Lesezugriff lief.
  //
  // `[read]` **Dieser Test misst die Reihenfolge, nicht die Atomizitaet.**
  // Dass `sicherSchreiben` ueber eine Temporaerdatei geht, ist am
  // Endzustand nicht sichtbar — ein `writeFileSync('')` plus `append`
  // liefert dieselben Bytes. Was sichtbar ist: wer zuerst leert und dann
  // liest, verliert den Inhalt. Belegt per Sabotage (`writeFileSync(quelle,
  // '')` vor `punktLesen`) — dieser Test wird rot, drei weitere mit ihm.
  const { dir, punkte } = buehne()
  try {
    const quelle = path.join(punkte, 'laufend_codex', 'next', 'a-0001-probe.md')
    fs.writeFileSync(quelle, attrappe('A-1', 'die Probe'))
    const vorher = fs.readFileSync(quelle, 'utf8')

    const r = lauf('rausgeben', quelle, '--agent', 'codex',
      '--datum', '2026-10-01', '--punkte', punkte)
    assert.equal(r.status, 0, r.stderr)

    const ziel = path.join(punkte, 'laufend_codex', 'a-0001-probe.md')
    const nachher = fs.readFileSync(ziel, 'utf8')
    assert.ok(nachher.length > 0, 'die Datei ist nicht leer')
    assert.ok(nachher.length > vorher.length, 'zwei Felder sind dazugekommen')
    assert.match(nachher, /^agent: codex$/m)
    assert.match(nachher, /^beauftragt: 2026-10-01$/m)
    // Kein Temporaerrest.
    assert.deepEqual(
      fs.readdirSync(path.join(punkte, 'laufend_codex')).filter(n => n.includes('tmp')),
      [])
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

// ══ A3 — DER UMZUG ═══════════════════════════════════════════════════

test('A-85/A3: die Stufe kommt aus dem Pfad, mit Agent', () => {
  assert.deepEqual(stufeVon('docs/punkte/todos/a-1.md'), { stufe: 'todos', agent: null })
  assert.deepEqual(stufeVon('docs/punkte/laufend_codex/next/a-1.md'),
    { stufe: 'next', agent: 'codex' })
  assert.deepEqual(stufeVon('docs/punkte/laufend_claudecode/a-1.md'),
    { stufe: 'laufend', agent: 'claudecode' })
  assert.deepEqual(stufeVon('docs/punkte/erledigt/a-1.md'), { stufe: 'erledigt', agent: null })
  assert.equal(stufeVon('docs/specs/Goals/DATABASE.md'), null)
})

test('A-85/A3: der Weg laesst eine Stufe zu und den Rueckweg nach todos', () => {
  assert.equal(wegPruefen('todos', 'next'), null)
  assert.equal(wegPruefen('next', 'laufend'), null)
  assert.equal(wegPruefen('laufend', 'erledigt'), null)
  assert.equal(wegPruefen('laufend', 'todos'), null)
  assert.equal(wegPruefen('erledigt', 'todos'), null)
})

test('A-85/A3 Sabotage: ein Sprung ueber eine Stufe ist ein Abbruch mit Grund', () => {
  assert.match(wegPruefen('todos', 'laufend'), /springt ueber eine Stufe/)
  assert.match(wegPruefen('todos', 'erledigt'), /springt ueber eine Stufe/)
  assert.match(wegPruefen('next', 'erledigt'), /springt ueber eine Stufe/)
  assert.match(wegPruefen('erledigt', 'laufend'), /geht rueckwaerts/)
  assert.match(wegPruefen('laufend', 'laufend'), /kein Umzug/)
})

test('A-85/A3 Sabotage: der Sprung wird auch im Lauf abgewiesen', () => {
  const { dir, punkte } = buehne()
  try {
    const quelle = path.join(punkte, 'todos', 'a-0001-probe.md')
    fs.writeFileSync(quelle, attrappe('A-1', 'die Probe'))

    const r = lauf('rausgeben', quelle, '--agent', 'codex', '--punkte', punkte)
    assert.equal(r.status, 1)
    assert.match(r.stderr, /springt ueber eine Stufe/)
    assert.ok(fs.existsSync(quelle), 'die Datei liegt noch, wo sie lag')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

// ══ DIE HARTE GRENZE: KEIN PLATZHALTER ═══════════════════════════════

test('A-85 Sabotage: abnehmen ohne Hash bricht ab, es setzt keinen Platzhalter', () => {
  // `[read]` **Ein Werkzeug, das einen Platzhalter einsetzt, erzeugt
  // genau die Fehlerklasse, die `punkte-pruefen` sucht.**
  const { dir, punkte } = buehne()
  try {
    const quelle = path.join(punkte, 'laufend_codex', 'a-0001-probe.md')
    fs.writeFileSync(quelle,
      attrappe('A-1', 'die Probe', { agent: 'codex', beauftragt: '2026-10-01' }))

    const ohne = lauf('abnehmen', quelle, '--punkte', punkte)
    assert.equal(ohne.status, 1)
    assert.match(ohne.stderr, /braucht --commit/)
    assert.ok(fs.existsSync(quelle), 'nicht verschoben')
    assert.ok(!fs.readFileSync(quelle, 'utf8').includes('commit:'), 'kein Platzhalter')

    const falsch = lauf('abnehmen', quelle, '--commit', 'TODO', '--punkte', punkte)
    assert.equal(falsch.status, 1)
    assert.match(falsch.stderr, /sieht nicht wie ein Git-Hash aus/)

    // Gegenprobe: mit echtem Hash geht es durch.
    const gut = lauf('abnehmen', quelle, '--commit', '309db7e1',
      '--datum', '2026-10-01', '--punkte', punkte)
    assert.equal(gut.status, 0, gut.stderr)
    const ziel = path.join(punkte, 'erledigt', 'a-0001-probe.md')
    assert.match(fs.readFileSync(ziel, 'utf8'), /^commit: 309db7e1$/m)
    assert.match(fs.readFileSync(ziel, 'utf8'), /^erledigt: 2026-10-01$/m)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('A-85: ein Lauf durch alle vier Stufen, auf Attrappen', () => {
  const { dir, punkte } = buehne()
  try {
    const name = 'a-0001-probe.md'
    let pfad = path.join(punkte, 'todos', name)
    fs.writeFileSync(pfad, attrappe('A-1', 'die Probe'))

    const schritte = [
      ['vorbereiten', ['--agent', 'claudecode'], 'laufend_claudecode/next'],
      ['rausgeben', [], 'laufend_claudecode'],
      ['abnehmen', ['--commit', 'deadbeef'], 'erledigt'],
    ]
    for (const [befehl, extra, wohin] of schritte) {
      const r = lauf(befehl, pfad, ...extra, '--datum', '2026-10-01', '--punkte', punkte)
      assert.equal(r.status, 0, `${befehl}: ${r.stderr}`)
      pfad = path.join(punkte, ...wohin.split('/'), name)
      assert.ok(fs.existsSync(pfad), `${befehl} -> ${wohin}`)
    }

    const ende = fs.readFileSync(pfad, 'utf8')
    assert.match(ende, /^agent: claudecode$/m)
    assert.match(ende, /^beauftragt: 2026-10-01$/m)
    assert.match(ende, /^erledigt: 2026-10-01$/m)
    assert.match(ende, /^commit: deadbeef$/m)
    assert.match(ende, /^## Auftrag$/m, 'der Auftragsteil ist noch da')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('A-85: vorbereiten setzt KEIN agent: — ein vorbereiteter Auftrag ist nicht zugeteilt', () => {
  // 00-LIESMICH.md:430 — und genau das prueft `zyklus-pruefen` fuer next/.
  const { dir, punkte } = buehne()
  try {
    const quelle = path.join(punkte, 'todos', 'a-0001-probe.md')
    fs.writeFileSync(quelle, attrappe('A-1', 'die Probe'))

    const r = lauf('vorbereiten', quelle, '--agent', 'codex', '--punkte', punkte)
    assert.equal(r.status, 0, r.stderr)
    const text = fs.readFileSync(
      path.join(punkte, 'laufend_codex', 'next', 'a-0001-probe.md'), 'utf8')
    assert.ok(!/^agent:/m.test(text), 'kein agent: in next/')
    assert.ok(!/^beauftragt:/m.test(text), 'kein beauftragt: in next/')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

// ══ A5 — ZYKLUS-PRUEFEN BLEIBT DIE WAHRHEIT ══════════════════════════

test('A-85/A5: ein roter Waechter nach dem Schritt laesst das Werkzeug rot werden', () => {
  // `[read]` **Das Werkzeug prueft nicht selbst, was der Waechter prueft**
  // — zwei Pruefungen, die dasselbe behaupten, laufen auseinander. Es
  // ruft ihn auf. **Hier wird belegt, dass sein Urteil durchschlaegt.**
  const { dir, punkte } = buehne()
  try {
    const rot = path.join(dir, 'rot.mjs')
    fs.writeFileSync(rot,
      "console.error('[zyklus] ROT: 3 Verstoesse, Soll 0.')\nprocess.exit(1)\n")
    const gruen = path.join(dir, 'gruen.mjs')
    fs.writeFileSync(gruen, "console.log('[zyklus] gruen: Attrappe')\n")

    const quelle = () => {
      const p = path.join(punkte, 'laufend_codex', 'next', 'a-0001-probe.md')
      fs.writeFileSync(p, attrappe('A-1', 'die Probe'))
      return p
    }

    const r = lauf('rausgeben', quelle(), '--punkte', punkte, '--waechter', rot)
    assert.equal(r.status, 1, 'ein roter Waechter macht den Lauf rot')
    assert.match(r.stderr, /zyklus-pruefen ist ROT nach diesem Schritt/)
    assert.match(r.stderr, /3 Verstoesse/, 'seine Ausgabe wird durchgereicht')

    // Gegenprobe: derselbe Schritt mit gruenem Waechter geht durch.
    fs.rmSync(path.join(punkte, 'laufend_codex', 'a-0001-probe.md'), { force: true })
    const g = lauf('rausgeben', quelle(), '--punkte', punkte, '--waechter', gruen)
    assert.equal(g.status, 0, g.stderr)
    assert.match(g.stdout, /\[zyklus\] gruen: Attrappe/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('A-85: der Ordner und --agent duerfen sich nicht widersprechen', () => {
  const { dir, punkte } = buehne()
  try {
    const quelle = path.join(punkte, 'laufend_codex', 'next', 'a-0001-probe.md')
    fs.writeFileSync(quelle, attrappe('A-1', 'die Probe'))
    const r = lauf('rausgeben', quelle, '--agent', 'claudecode', '--punkte', punkte)
    assert.equal(r.status, 1)
    assert.match(r.stderr, /liegt bei codex, --agent sagt claudecode/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
