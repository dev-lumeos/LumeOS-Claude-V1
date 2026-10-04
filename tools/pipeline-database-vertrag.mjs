import { spawn } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const QUELLDATEI = /\.(?:c|m)?(?:j|t)s$/i
const EIGENER_NAME = /process\.env\.(LUMEOS_[A-Z0-9_]*DATABASE)\b/g
const PGDATABASE_LESER = /process\.env\.PGDATABASE\b/
const POSTGRES_RUECKFALL = /process\.env\.PGDATABASE\s*(?:\?\?|\|\|)\s*(['"])postgres\1/g
const FESTE_BASISDATENBANK = /(['"])-d\1\s*,\s*(['"])postgres\2/g
const GESPERRTER_ZUGRIFF = 86
const PARALLELE_LAEUFE = 12
const MAX_LAUFZEIT_MS = 5_000
// Unter Last (12 parallele Laeufe neben anderen Testdateien) kann ein Start
// laenger dauern. Ein Abbruch durch das Zeitlimit beweist nichts - er wird
// einmal einzeln und mit Luft wiederholt, erst dann zaehlt das Ergebnis.
const WIEDERHOLUNG_MS = 60_000
// Die Probe aktiviert auch boolesche CLI-Schalter wie --a95-live, blockiert
// aber jeden Kindprozess und Netzwerkzugriff, bevor eine Datenbank erreichbar ist.
const LAUFZEIT_SPERRE = `data:text/javascript,${encodeURIComponent(`
import childProcess from 'node:child_process'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import { syncBuiltinESMExports } from 'node:module'

const gesperrt = () => process.exit(${GESPERRTER_ZUGRIFF})
for (const name of ['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork']) {
  childProcess[name] = gesperrt
}
http.request = gesperrt
http.get = gesperrt
https.request = gesperrt
https.get = gesperrt
net.Socket.prototype.connect = gesperrt
globalThis.fetch = gesperrt

const includes = process.argv.includes.bind(process.argv)
process.argv.includes = (wert, ab = 0) =>
  typeof wert === 'string' && wert.startsWith('--') ? true : includes(wert, ab)

syncBuiltinESMExports()
`)}`

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

function pruefeLauf(datei, database, zeitlimit = MAX_LAUFZEIT_MS) {
  const env = {
    ...process.env,
    LUMEOS_DB_CONTAINER: '__a98_gesperrt__',
  }
  if (database === null) {
    delete env.PGDATABASE
  } else {
    env.PGDATABASE = database
  }

  return new Promise((resolve) => {
    const kind = spawn(
      process.execPath,
      ['--import', 'tsx', '--import', LAUFZEIT_SPERRE, datei],
      {
        env,
        stdio: 'ignore',
        timeout: zeitlimit,
        windowsHide: true,
      },
    )

    kind.once('error', (fehler) => resolve({ fehler }))
    kind.once('close', (code, signal) => resolve({ code, signal }))
  })
}

async function parallelAbbilden(eintraege, abbilden) {
  const ergebnisse = new Array(eintraege.length)
  let naechsterIndex = 0

  async function arbeiter() {
    while (naechsterIndex < eintraege.length) {
      const index = naechsterIndex
      naechsterIndex += 1
      ergebnisse[index] = await abbilden(eintraege[index])
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(PARALLELE_LAEUFE, eintraege.length) },
      () => arbeiter(),
    ),
  )
  return ergebnisse
}

function laufVerletztVertrag(ergebnis) {
  return ergebnis.fehler || ergebnis.signal || ergebnis.code === 0 || ergebnis.code === GESPERRTER_ZUGRIFF
}

function laufBefund(modus, ergebnis) {
  if (ergebnis.fehler) return `${modus}: Start fehlgeschlagen`
  if (ergebnis.signal) return `${modus}: abgebrochen mit ${ergebnis.signal}`
  if (ergebnis.code === GESPERRTER_ZUGRIFF) return `${modus}: Datenbank- oder Kindprozess erreicht`
  return `${modus}: Exit 0`
}

async function analysierePipelineDatenbankvertrag(pipelineWurzel) {
  const verstoesse = []
  const pgLeser = []
  const dateien = await quellDateien(pipelineWurzel)

  for (const datei of dateien) {
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

    const pgTreffer = PGDATABASE_LESER.exec(inhalt)
    if (pgTreffer) {
      pgLeser.push({
        absolut: datei,
        relativ,
        zeile: zeileVon(inhalt, pgTreffer.index),
      })
    }
  }

  const laufErgebnisse = await parallelAbbilden(pgLeser, async (datei) => ({
    datei,
    laeufe: [
      ['ohne PGDATABASE', await pruefeLauf(datei.absolut, null)],
      ['mit PGDATABASE=postgres', await pruefeLauf(datei.absolut, 'postgres')],
    ],
  }))

  // Zeitlimit-Abbrueche einzeln wiederholen, nacheinander, ohne Konkurrenz.
  for (const eintrag of laufErgebnisse) {
    for (const lauf of eintrag.laeufe) {
      if (lauf[1].signal) {
        lauf[1] = await pruefeLauf(
          eintrag.datei.absolut,
          lauf[0] === 'ohne PGDATABASE' ? null : 'postgres',
          WIEDERHOLUNG_MS,
        )
      }
    }
  }

  for (const { datei, laeufe } of laufErgebnisse) {
    const befund = laeufe
      .filter(([, ergebnis]) => laufVerletztVertrag(ergebnis))
      .map(([modus, ergebnis]) => laufBefund(modus, ergebnis))
    if (befund.length > 0) {
      verstoesse.push({
        datei: datei.relativ,
        zeile: datei.zeile,
        grund: `PGDATABASE-Leser ist im Lauf nicht fail-closed (${befund.join('; ')}).`,
      })
    }
  }

  if (pgLeser.length === 0 && verstoesse.length === 0) {
    verstoesse.push({
      datei: '.',
      zeile: 1,
      grund: 'Kein PGDATABASE-Leser wurde im Lauf geprueft.',
    })
  }

  verstoesse.sort((a, b) =>
    a.datei.localeCompare(b.datei) || a.zeile - b.zeile || a.grund.localeCompare(b.grund),
  )
  return {
    verstoesse,
    quellskripte: dateien.length,
    gepruefteSkripte: pgLeser.length,
  }
}

export async function pruefePipelineDatenbankvertrag(pipelineWurzel) {
  return (await analysierePipelineDatenbankvertrag(pipelineWurzel)).verstoesse
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const wurzel = path.resolve(process.argv[2] ?? 'supabase/_pipeline')
  const { verstoesse, quellskripte, gepruefteSkripte } = await analysierePipelineDatenbankvertrag(wurzel)
  console.log(`${gepruefteSkripte} von ${quellskripte} Pipeline-Skripten im Lauf geprueft.`)
  if (verstoesse.length === 0) {
    console.log('OK: Pipeline-Datenbankvertrag gilt.')
  } else {
    for (const verstoss of verstoesse) {
      console.error(`${verstoss.datei}:${verstoss.zeile}: ${verstoss.grund}`)
    }
    process.exitCode = 1
  }
}
