import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

type Step = { path: string }
const directory = 'supabase/_pipeline/_validierung'

test('G-616: jede Prüfdatei steht als eigener Schritt in kette.json', () => {
  const manifest = JSON.parse(readFileSync('supabase/_pipeline/kette.json', 'utf8')) as {
    steps: Step[]
  }
  const registered = new Set(manifest.steps.map(step => step.path.replaceAll('\\', '/')))
  const missing = readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => `${directory}/${entry.name}`)
    .filter(path => !registered.has(path))
    .sort()
  assert.deepEqual(missing, [], `Prüfdateien ohne Kettenschritt:\n${missing.join('\n')}`)
})
