#!/usr/bin/env node
// C-43: Prueft, ob die README-Tabelle die ausfuehrbare Kette dokumentiert.
// Ausgefuehrt wird aus supabase/_pipeline/kette.json; die README ist nur Doku.
import fs from 'node:fs'

type Step = {
  id: string
  path: string
}

type Manifest = {
  steps: Step[]
}

const MANIFEST = 'supabase/_pipeline/kette.json'
const README = 'supabase/README.md'

function normalizedReadmePath(stepPath: string): string {
  return stepPath
    .replace(/^supabase\//, '')
    .replace(/^_pipeline\//, '')
    .replace(/^migrations\//, 'migrations/')
}

function rowKey(id: string): string {
  return id.replace(/[a-z]$/, '').replace(/^020$/, '020')
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) as Manifest
const readme = fs.readFileSync(README, 'utf8')

const tableMatch = readme.match(/## Lokaler Neubau[\s\S]*?(?=\n## |\n---\n\n## Rohdaten|$)/)
if (!tableMatch) {
  console.error(`${README}: Abschnitt "Lokaler Neubau" nicht gefunden`)
  process.exit(1)
}

const table = tableMatch[0]
const tableLines = table
  .split('\n')
  .filter(line => line.trim().startsWith('|'))
  .join('\n')
const errors: string[] = []

for (const step of manifest.steps) {
  const wantedPath = normalizedReadmePath(step.path)
  if (!tableLines.includes(wantedPath)) {
    errors.push(`README fehlt Schritt ${step.id}: ${wantedPath}`)
  }
}

const documentedPaths = [...tableLines.matchAll(/`([^`]+(?:\.sql|\.ts))`/g)].map(m => m[1])
for (const documented of documentedPaths) {
  const inManifest = manifest.steps.some(step => normalizedReadmePath(step.path) === documented)
  if (!inManifest && !documented.startsWith('_archive/')) {
    errors.push(`README dokumentiert ${documented}, aber die Datei steht nicht in ${MANIFEST}`)
  }
}

const manifestIds = manifest.steps.map(step => rowKey(step.id))
for (const expected of ['062', '071', '080', '100', '101', '102', '103', '104', '105']) {
  if (!manifestIds.includes(expected)) {
    errors.push(`${MANIFEST} fehlt erwarteter Schritt ${expected}`)
  }
}

if (errors.length) {
  console.log(`README/Kette: ${errors.length} Abweichung(en)`)
  for (const error of errors) console.log(`  - ${error}`)
  process.exit(1)
}

console.log(`README/Kette: ok (${manifest.steps.length} Schritte dokumentiert)`)
