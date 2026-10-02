// C-295: Datenproduzierende Pipeline-Schritte und ihre Hilfswerkzeuge
// duerfen nur den kanonischen Kimi-Bestand unter docs/kimi_research lesen.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const repo = process.cwd()
// Getrennt geschrieben, damit der Waechter nicht seine eigene Pruefzeichenfolge findet.
const alterPfad = ['backup', 'kimi-research'].join('/')
const neuerPfad = 'docs/kimi_research/supplement_performance_database'

function dateienUnter(relativeRoot: string): string[] {
  const root = path.join(repo, relativeRoot)
  const found: string[] = []

  function walk(directory: string): void {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(absolute)
      else found.push(absolute)
    }
  }

  walk(root)
  return found
}

test('C-295: die Pipeline und das Evidenzwerkzeug lesen aus genau einem Kimi-Pfad', () => {
  const candidates = [
    ...dateienUnter('supabase/_pipeline'),
    path.join(repo, 'tools/evidenz-registry-generieren.py'),
  ]
  const oldReferences = candidates
    .filter(file => fs.readFileSync(file, 'utf8').includes(alterPfad))
    .map(file => path.relative(repo, file).replaceAll('\\', '/'))

  assert.deepEqual(oldReferences, [], `alter Kimi-Pfad in: ${oldReferences.join(', ')}`)
  assert.equal(
    fs.existsSync(path.join(repo, neuerPfad, 'data')),
    true,
    'kanonischer Kimi-Datenpfad fehlt',
  )
})

function jsonl(file: string): Array<Record<string, unknown>> {
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line) as Record<string, unknown>)
}

test('C-556: der kanonische Bestand traegt 243/79/124 Zeilen und zehn Nachweismarker', () => {
  const substances = path.join(repo, neuerPfad, 'data', 'substances')
  const files = [
    ['supplements.jsonl', 243],
    ['peptides.jsonl', 79],
    ['performance_compounds.jsonl', 124],
  ] as const
  const rows = files.flatMap(([file, expected]) => {
    const parsed = jsonl(path.join(substances, file))
    assert.equal(parsed.length, expected, file)
    return parsed
  })
  const effects = rows.flatMap(row => Array.isArray(row.lab_effects) ? row.lab_effects : []) as Array<Record<string, unknown>>

  assert.equal(effects.filter(effect => effect.effect_type === 'detection_marker').length, 10)
  assert.equal(effects.filter(effect => effect.effect_type === 'lab_interference').length, 2)

  const importer = fs.readFileSync(
    path.join(repo, 'supabase/_pipeline/14_medical/147_substance_lab_markers.ts'),
    'utf8',
  )
  assert.match(importer, /fail\(`Unbekannter effect_type: \$\{text\}`\)/)
})
