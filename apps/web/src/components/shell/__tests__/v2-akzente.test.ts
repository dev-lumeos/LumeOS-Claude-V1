// G-02: Die Modulakzente stehen jetzt ZWEIMAL im Repo — in
// app-shell.tsx (alte Oberflaeche) und in packages/ui/src/module-accent.ts
// (v2). Das war eine Entscheidung, keine Nachlaessigkeit: [cmd] die
// alte Liste hat kein `export`, und der Auftrag verbietet, die Datei
// anzufassen.
//
// Der Preis einer zweiten Liste ist Drift. Dieser Test macht daraus
// einen Fehlschlag statt einer Entdeckung im Nebeneinander.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'

function lies(...teile: string[]): string {
  return readFileSync(path.join(process.cwd(), ...teile), 'utf8')
}

/** Zieht `name: 'wert',`-Paare aus einem benannten Objektliteral. */
function paare(quelle: string, name: string): Record<string, string> {
  const start = quelle.indexOf(name)
  assert.notEqual(start, -1, `${name} nicht gefunden`)
  const auf = quelle.indexOf('{', start)
  const zu = quelle.indexOf('}', auf)
  const block = quelle.slice(auf + 1, zu)
  const out: Record<string, string> = {}
  block.replace(/([a-z]+)\s*:\s*'([a-z]+)'/g, (_m, k: string, v: string) => {
    out[k] = v
    return ''
  })
  return out
}

test('die beiden Akzentlisten stimmen ueberein', () => {
  const alt = paare(
    lies('src', 'components', 'shell', 'app-shell.tsx'), 'moduleAccentMap')
  const neu = paare(
    lies('..', '..', 'packages', 'ui', 'src', 'module-accent.ts'), 'MODULE_ACCENT')

  assert.ok(Object.keys(alt).length >= 11,
    `nur ${Object.keys(alt).length} Eintraege aus app-shell.tsx gelesen — ` +
    'hat sich der Aufbau der Datei geaendert?')

  assert.deepEqual(neu, alt,
    'Die Akzentliste in packages/ui weicht von der in app-shell.tsx ab. ' +
    'Beide Oberflaechen laufen nebeneinander; dieselben Module muessen ' +
    'dieselben Farben tragen.')
})

test('jeder Akzent hat einen Token im Thema', () => {
  const neu = paare(
    lies('..', '..', 'packages', 'ui', 'src', 'module-accent.ts'), 'MODULE_ACCENT')
  const thema = lies('src', 'styles', 'themes', 'lume.css')

  const fehlend = Object.values(neu)
    .filter((v, i, a) => a.indexOf(v) === i)
    .filter(v => !thema.includes(`--acc-${v}:`))

  assert.deepEqual(fehlend, [],
    'Akzentschluessel ohne Token in lume.css — var(--acc-…) liefe ins Leere')
})
