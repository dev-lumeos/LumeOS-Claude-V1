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
