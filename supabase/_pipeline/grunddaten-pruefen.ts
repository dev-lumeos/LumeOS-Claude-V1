#!/usr/bin/env node
// A-90: Der Grunddaten-Dump ist nur gueltig, solange Dump und alle darin
// eingefrorenen Quellen exakt dem Herkunftsmanifest entsprechen.
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type SourceEntry = {
  path: string
  sha256: string
  kind?: 'file' | 'tree' | 'chain'
  through_step?: string
  exclude_step_ids?: string[]
}

export type GrunddatenManifest = {
  format_version: number
  created_at: string
  source_database: string
  source_chain_step: string
  dump: {
    path: string
    sha256: string
    bytes: number
  }
  sources: SourceEntry[]
  source_compatibility_checks?: Array<{
    checked_at: string
    reason: string
    changes: Array<{
      path: string
      previous_sha256: string
      compatible_sha256: string
    }>
  }>
}

type PruefOptionen = {
  root: string
  manifestPath: string
}

export type PruefErgebnis = {
  sourcesChecked: number
  dumpBytes: number
  dumpSha256: string
}

function sha256Datei(file: string): string {
  const hash = createHash('sha256')
  hash.update(fs.readFileSync(file))
  return hash.digest('hex')
}

export function berechneQuellPruefsumme(root: string, source: SourceEntry): string {
  const file = resolveUnterRoot(root, source.path)
  const kind = source.kind ?? 'file'
  if (!fs.existsSync(file)) throw new Error(`Quelle fehlt: ${source.path}`)
  if (kind === 'tree') return sha256Baum(file)
  if (kind === 'chain') return sha256Kette(root, file, source)
  if (kind === 'file') return sha256Datei(file)
  throw new Error(`Unbekannte Quellenart: ${source.path}: ${kind}`)
}

export function berechneDateiPruefsumme(file: string): string {
  return sha256Datei(file)
}

function dateienUnter(dir: string): string[] {
  const result: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) result.push(...dateienUnter(absolute))
    else if (entry.isFile()) result.push(absolute)
  }
  return result.sort((a, b) => a.localeCompare(b, 'en'))
}

function sha256Baum(dir: string): string {
  const hash = createHash('sha256')
  for (const file of dateienUnter(dir)) {
    const relative = path.relative(dir, file).replace(/\\/g, '/')
    hash.update(relative)
    hash.update('\0')
    hash.update(sha256Datei(file))
    hash.update('\n')
  }
  return hash.digest('hex')
}

function sha256Kette(root: string, manifestFile: string, source: SourceEntry): string {
  if (!source.through_step) throw new Error(`Kettenquelle ohne through_step: ${source.path}`)
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8')) as {
    steps?: Array<{ id: string; path: string }>
  }
  if (!Array.isArray(manifest.steps)) throw new Error(`Kettenquelle ohne steps: ${source.path}`)
  const excluded = new Set(source.exclude_step_ids ?? [])
  const hash = createHash('sha256')
  let found = false
  for (const step of manifest.steps) {
    const normalizedPath = step.path.replace(/\\/g, '/')
    const isValidation = normalizedPath.startsWith('_validierung/') || normalizedPath.includes('/_validierung/')
    if (!excluded.has(step.id) && !isValidation) {
      const stepFile = resolveUnterRoot(root, step.path)
      if (!fs.existsSync(stepFile)) throw new Error(`Kettenschritt fehlt: ${step.id}: ${step.path}`)
      hash.update(step.id)
      hash.update('\0')
      hash.update(normalizedPath)
      hash.update('\0')
      hash.update(sha256Datei(stepFile))
      hash.update('\n')
    }
    if (step.id === source.through_step) {
      found = true
      break
    }
  }
  if (!found) throw new Error(`Kettenstand fehlt: ${source.through_step}`)
  return hash.digest('hex')
}

function resolveUnterRoot(root: string, relativePath: string): string {
  const absoluteRoot = path.resolve(root)
  const absolute = path.resolve(absoluteRoot, relativePath)
  const prefix = `${absoluteRoot}${path.sep}`
  if (absolute !== absoluteRoot && !absolute.startsWith(prefix)) {
    throw new Error(`Pfad ausserhalb des Repos: ${relativePath}`)
  }
  return absolute
}

export function pruefeGrunddatenManifest(options: PruefOptionen): PruefErgebnis {
  const manifestFile = resolveUnterRoot(options.root, options.manifestPath)
  if (!fs.existsSync(manifestFile)) throw new Error(`Grunddaten-Manifest fehlt: ${options.manifestPath}`)

  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8')) as GrunddatenManifest
  if (manifest.format_version !== 1 && manifest.format_version !== 2) {
    throw new Error(`Unbekannte Manifestversion: ${manifest.format_version}`)
  }
  if (!manifest.created_at || !manifest.source_database || !manifest.source_chain_step) {
    throw new Error('Grunddaten-Manifest ohne vollstaendige Herkunft')
  }
  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) {
    throw new Error('Grunddaten-Manifest ohne Quellen')
  }

  const seen = new Set<string>()
  for (const source of manifest.sources) {
    if (seen.has(source.path)) throw new Error(`Doppelte Quelle: ${source.path}`)
    seen.add(source.path)
    const file = resolveUnterRoot(options.root, source.path)
    if (!fs.existsSync(file)) throw new Error(`Quelle fehlt: ${source.path}`)
    const kind = source.kind ?? 'file'
    if (kind !== 'file' && kind !== 'tree' && kind !== 'chain') {
      throw new Error(`Unbekannte Quellenart: ${source.path}: ${kind}`)
    }
    if (kind === 'tree' && !fs.statSync(file).isDirectory()) throw new Error(`Quellbaum ist kein Verzeichnis: ${source.path}`)
    if ((kind === 'file' || kind === 'chain') && !fs.statSync(file).isFile()) {
      throw new Error(`Quelldatei ist keine Datei: ${source.path}`)
    }
    const actual = berechneQuellPruefsumme(options.root, source)
    if (actual !== source.sha256) {
      throw new Error(`Quelle geaendert: ${source.path} (erwartet ${source.sha256}, ist ${actual})`)
    }
  }

  const dumpResult = pruefeDump(options.root, manifest)

  return {
    sourcesChecked: manifest.sources.length,
    ...dumpResult,
  }
}

function pruefeDump(root: string, manifest: GrunddatenManifest): Omit<PruefErgebnis, 'sourcesChecked'> {
  const dumpFile = resolveUnterRoot(root, manifest.dump.path)
  if (!fs.existsSync(dumpFile)) throw new Error(`Grunddaten-Dump fehlt: ${manifest.dump.path}`)
  const stat = fs.statSync(dumpFile)
  if (stat.size !== manifest.dump.bytes) {
    throw new Error(`Dumpgroesse geaendert: ${manifest.dump.path} (erwartet ${manifest.dump.bytes}, ist ${stat.size})`)
  }
  const dumpSha256 = sha256Datei(dumpFile)
  if (dumpSha256 !== manifest.dump.sha256) {
    throw new Error(`Dump geaendert: ${manifest.dump.path} (erwartet ${manifest.dump.sha256}, ist ${dumpSha256})`)
  }

  return {
    dumpBytes: stat.size,
    dumpSha256,
  }
}

export function pruefeGrunddatenDump(options: PruefOptionen): Omit<PruefErgebnis, 'sourcesChecked'> {
  const manifestFile = resolveUnterRoot(options.root, options.manifestPath)
  if (!fs.existsSync(manifestFile)) throw new Error(`Grunddaten-Manifest fehlt: ${options.manifestPath}`)
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8')) as GrunddatenManifest
  if (manifest.format_version !== 1 && manifest.format_version !== 2) {
    throw new Error(`Unbekannte Manifestversion: ${manifest.format_version}`)
  }
  return pruefeDump(options.root, manifest)
}

function main(): void {
  const manifestArg = process.argv[2] ?? 'supabase/_pipeline/daten/grunddaten-dump.manifest.json'
  const result = pruefeGrunddatenManifest({ root: process.cwd(), manifestPath: manifestArg })
  console.log(
    `A-90 Grunddaten gruen: ${result.sourcesChecked} Quellen, ` +
    `${result.dumpBytes} Bytes, sha256 ${result.dumpSha256}`,
  )
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
