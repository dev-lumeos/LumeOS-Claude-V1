#!/usr/bin/env node
// C-216: Inventarisiert backup/ additiv. Dieser Lauf verschiebt, archiviert
// oder loescht keine Quelldatei; eine spaetere Archiventscheidung bleibt offen.
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { relative, resolve, sep, dirname, join } from 'node:path'

function option(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1] ?? null
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function normalizedRelative(root, path) {
  return relative(root, path).split(sep).join('/')
}

function workItem(path) {
  const match = /(?:^|[/_\-.])(go|c|g)[_-]?(\d{1,4})(?=$|[/_\-.])/i.exec(path)
  return match ? `${match[1].toUpperCase()}-${match[2]}` : null
}

function purpose(path) {
  const lower = path.toLowerCase()
  if (/\.(png|jpe?g|webp|gif|svg)$/.test(lower) || /(?:schirm|screenshot|bild)/.test(lower)) return 'screenshot'
  if (/\.(mjs|cjs|js|ts|tsx|py|ps1|sh)$/.test(lower)) return 'probe_script'
  if (/\.(sql|dump|backup|bak)$/.test(lower) || /(?:^|[-_/])(before|vor|snapshot|schema)(?:[-_/]|$)/.test(lower)) return 'database_snapshot'
  if (/\.(json|jsonl|csv|tsv|xlsx|xls|pdf|md|txt)$/.test(lower)) return 'evidence_or_reference'
  return 'unclassified'
}

async function collect(root, output) {
  const files = []
  const skipped = []
  const outputRelative = normalizedRelative(root, output)

  async function visit(directory) {
    let entries
    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch (error) {
      skipped.push({ path: normalizedRelative(root, directory), reason: error.code ?? 'unreadable_directory' })
      return
    }
    for (const entry of entries) {
      const absolute = join(directory, entry.name)
      const path = normalizedRelative(root, absolute)
      if (path === outputRelative || path.startsWith('_manifests/')) continue
      if (entry.isDirectory()) {
        await visit(absolute)
        continue
      }
      if (!entry.isFile()) {
        skipped.push({ path, reason: 'not_a_regular_file' })
        continue
      }
      try {
        const info = await stat(absolute)
        files.push({
          path,
          bytes: info.size,
          modifiedAt: info.mtime.toISOString(),
          purpose: purpose(path),
          workItem: workItem(path),
        })
      } catch (error) {
        skipped.push({ path, reason: error.code ?? 'changed_during_scan' })
      }
    }
  }

  await visit(root)
  files.sort((a, b) => a.path.localeCompare(b.path))
  skipped.sort((a, b) => a.path.localeCompare(b.path))
  return { files, skipped }
}

const backupRoot = resolve(option('--root') ?? 'backup')
const output = resolve(option('--out') ?? join(backupRoot, '_manifests', `manifest-${timestamp()}.json`))
const { files, skipped } = await collect(backupRoot, output)
const byPurpose = Object.fromEntries(
  [...new Set(files.map(file => file.purpose))]
    .sort()
    .map(key => [key, files.filter(file => file.purpose === key).length]),
)
const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  root: normalizedRelative(process.cwd(), backupRoot),
  safety: 'read-only inventory; no source file is deleted, moved, or archived',
  summary: {
    files: files.length,
    bytes: files.reduce((sum, file) => sum + file.bytes, 0),
    byPurpose,
    skippedDuringScan: skipped.length,
  },
  files,
  skipped,
}

await mkdir(dirname(output), { recursive: true })
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
process.stdout.write(`${normalizedRelative(process.cwd(), output)}: ${files.length} Dateien inventarisiert\n`)
