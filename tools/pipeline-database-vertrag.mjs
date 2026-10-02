import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const QUELLDATEI = /\.(?:c|m)?(?:j|t)s$/i
const EIGENER_NAME = /process\.env\.(LUMEOS_[A-Z0-9_]*DATABASE)\b/g
const PG_LESER = /\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:[^;\n]*?\?\?\s*)?process\.env\.PGDATABASE\b/g
const POSTGRES_RUECKFALL = /process\.env\.PGDATABASE\s*(?:\?\?|\|\|)\s*(['"])postgres\1/g
const FESTE_BASISDATENBANK = /(['"])-d\1\s*,\s*(['"])postgres\2/g

async function quellDateien(wurzel) {
  const ergebnis = []

  async function besuche(verzeichnis) {
    for (const eintrag of await readdir(verzeichnis, { withFileTypes: true })) {
      const absolut = path.join(verzeichnis, eintrag.name)
      if (eintrag.isDirectory()) {
        await besuche(absolut)
      } else if (QUELLDATEI.test(eintrag.name)) {
        ergebnis.push(absolut)
      }
    }
  }

  await besuche(wurzel)
  return ergebnis.sort()
}

function zeileVon(inhalt, index) {
  return inhalt.slice(0, index).split(/\r?\n/).length
}

function hatFailClosed(inhalt, variable) {
  const name = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const fehlt = new RegExp(`!\\s*${name}\\b`).test(inhalt)
  const basisdatenbank = new RegExp(`\\b${name}\\s*===\\s*(['"])postgres\\1`).test(inhalt)
  return fehlt && basisdatenbank
}

export async function pruefePipelineDatenbankvertrag(pipelineWurzel) {
  const verstoesse = []

  for (const datei of await quellDateien(pipelineWurzel)) {
    const inhalt = await readFile(datei, 'utf8')
    const relativ = path.relative(pipelineWurzel, datei).replaceAll('\\', '/')

    for (const treffer of inhalt.matchAll(EIGENER_NAME)) {
      verstoesse.push({
        datei: relativ,
        zeile: zeileVon(inhalt, treffer.index),
        grund: `${treffer[1]} verletzt den gemeinsamen Vertrag PGDATABASE.`,
      })
    }

    for (const treffer of inhalt.matchAll(POSTGRES_RUECKFALL)) {
      verstoesse.push({
        datei: relativ,
        zeile: zeileVon(inhalt, treffer.index),
        grund: 'Rueckfall auf postgres ist verboten.',
      })
    }

    for (const treffer of inhalt.matchAll(FESTE_BASISDATENBANK)) {
      verstoesse.push({
        datei: relativ,
        zeile: zeileVon(inhalt, treffer.index),
        grund: 'Die Basisdatenbank ist mit -d postgres fest verdrahtet.',
      })
    }

    for (const treffer of inhalt.matchAll(PG_LESER)) {
      if (!hatFailClosed(inhalt, treffer[1])) {
        verstoesse.push({
          datei: relativ,
          zeile: zeileVon(inhalt, treffer.index),
          grund: `PGDATABASE-Leser ${treffer[1]} ist nicht fail-closed gegen fehlenden Namen und postgres.`,
        })
      }
    }
  }

  return verstoesse.sort((a, b) =>
    a.datei.localeCompare(b.datei) || a.zeile - b.zeile || a.grund.localeCompare(b.grund),
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const wurzel = path.resolve(process.argv[2] ?? 'supabase/_pipeline')
  const verstoesse = await pruefePipelineDatenbankvertrag(wurzel)
  if (verstoesse.length === 0) {
    console.log('OK: Pipeline-Datenbankvertrag gilt.')
  } else {
    for (const verstoss of verstoesse) {
      console.error(`${verstoss.datei}:${verstoss.zeile}: ${verstoss.grund}`)
    }
    process.exitCode = 1
  }
}
