// Zaehlt die Vollstaendigkeit des Medical-Mockups gegen die Vorlage.
//
// `[read]` `theme-v1-umsetzung.md`, Abschnitt „Vollstaendigkeit wird
// gezaehlt, nicht angesehen": Bei Supplements wurden sieben Tabs
// gebaut und je Tab die Haelfte der Unterkomponenten — 1.605 Zeilen
// Vorlage gegen 708. Das fiel nicht auf, weil der Nachweis „alle Tabs
// durchgeklickt" lautete.
//
// **Gezaehlt wird nach NAMEN, nicht nach Zeilen.** Das Skript liest
// die Vorlage, sammelt je Tab-Rumpf die aufgerufenen Komponenten und
// prueft, ob die Umsetzung sie fuehrt.
//
// Aufruf (aus apps/web):
//   node src/app/v2/medical/vollstaendigkeit.mjs
//
// Rueckgabe 0 = vollstaendig, 1 = es fehlt etwas.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd(), '../..')
const VORLAGE = path.join(WURZEL,
  'docs/spezifikation/10-plattform/design-system/theme-v1')
const MODUL = path.resolve(process.cwd(), 'src/app/v2/medical')

/** Die vier Vorlagendateien des Moduls. */
const DATEIEN = [
  'module-medical-v2.jsx',
  'module-medical-data.jsx',
  'module-medical-modals.jsx',
]

/**
 * Sammelt aus einer JSX-Quelle alle definierten Komponentennamen.
 * Erfasst `const X = (` , `window.X = (` und `function X(`.
 */
function definierte(quelle) {
  const namen = new Set()
  for (const m of quelle.matchAll(/^(?:const|function)\s+([A-Z][A-Za-z0-9_]*)/gm)) {
    namen.add(m[1])
  }
  for (const m of quelle.matchAll(/^window\.([A-Z][A-Za-z0-9_]*)\s*=/gm)) {
    namen.add(m[1])
  }
  return namen
}

/** Alle in JSX benutzten Komponenten: `<Name` und `window.Name`. */
function benutzte(quelle) {
  const namen = new Set()
  for (const m of quelle.matchAll(/<([A-Z][A-Za-z0-9_]*)[\s/>]/g)) namen.add(m[1])
  for (const m of quelle.matchAll(/window\.([A-Z][A-Za-z0-9_]*)/g)) namen.add(m[1])
  return namen
}

/**
 * Schneidet den Rumpf einer Komponente heraus.
 *
 * `[cmd]` Erster Versuch schnitt bei der naechsten `const`-Zeile ab —
 * das trifft auch verschachtelte Konstanten INNERHALB der Komponente
 * und meldete drei Tabs faelschlich mit „0 Unterkomponenten". Jetzt
 * ueber Klammernzaehlung bis zum echten Ende.
 */
function rumpf(quelle, name) {
  const start = quelle.search(
    new RegExp(`^(?:const|function|window\\.)\\s*${name}\\b`, 'm'))
  if (start < 0) return ''
  // Ab der ersten oeffnenden Klammer zaehlen, bis sie ausgeglichen ist.
  const ab = quelle.indexOf('{', start)
  if (ab < 0) return ''
  let tiefe = 0
  for (let i = ab; i < quelle.length; i++) {
    if (quelle[i] === '{') tiefe++
    else if (quelle[i] === '}') {
      tiefe--
      if (tiefe === 0) return quelle.slice(start, i + 1)
    }
  }
  return quelle.slice(start)
}

// Die Bausteine aus packages/ui — sie sind kein Modulinhalt.
const GETEILT = new Set([
  'Card', 'Pill', 'Icon', 'Ring', 'Meter', 'Row', 'Tabs', 'KPI',
  'Sparkline', 'LineChart', 'RadarChart', 'ProgressRing', 'CoverageRow',
  'ModuleHero', 'InEntwicklung', 'InEntwicklungKnopf', 'React', 'Fragment',
])

function lade(datei) {
  return fs.readFileSync(path.join(VORLAGE, datei), 'utf8')
}

// --- Die Vorlage einlesen ------------------------------------------
const v2 = lade('module-medical-v2.jsx')
const daten = lade('module-medical-data.jsx')
const modals = lade('module-medical-modals.jsx')

const vorlageDefiniert = new Set([
  ...definierte(v2), ...definierte(daten), ...definierte(modals),
])

// Die fuenf Tabs und ihre Rumpf-Komponenten.
const TABS = {
  Dashboard: 'MedDashboard',
  Biomarkers: 'MedBiomarkers',
  Import: 'MedImport',
  Tracking: 'MedTracking',
  Insights: 'MedInsights',
}

// --- Die Umsetzung einlesen ----------------------------------------
const umsetzung = fs.readdirSync(MODUL)
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map(f => fs.readFileSync(path.join(MODUL, f), 'utf8'))
  .join('\n')

const umgesetzt = new Set([
  ...definierte(umsetzung),
  // Exportierte Funktionen zaehlen mit.
  ...[...umsetzung.matchAll(/^export\s+(?:async\s+)?function\s+([A-Z][A-Za-z0-9_]*)/gm)]
    .map(m => m[1]),
])

// --- Zaehlen --------------------------------------------------------
let fehlend = 0
let gesamt = 0
console.log('Vollstaendigkeit Medical — Vorlage gegen Umsetzung\n')

/**
 * Zaehlt `<Card ... title="X"` und liefert die Titel.
 *
 * `[read]` Die Unterkomponentenzahl allein genuegt NICHT: Medicals
 * Tabs rufen kaum eigene Komponenten auf, sie setzen die Kacheln
 * direkt. Wer nur Namen zaehlt, sieht bei „0 Unterkomponenten" nicht,
 * ob eine Kachel fehlt. Deshalb zusaetzlich die Kacheltitel — das ist
 * die Groesse, die bei Supplements gefehlt hat.
 */
function kartentitel(koerper) {
  const titel = []
  for (const m of koerper.matchAll(/<Card\b[^>]*?\stitle=(?:"([^"]+)"|\{`([^`]+)`\})/gs)) {
    titel.push((m[1] ?? m[2]).replace(/\$\{[^}]+\}/g, '…').trim())
  }
  return titel
}

for (const [tab, komponente] of Object.entries(TABS)) {
  const koerper = rumpf(v2, komponente)
  const aufgerufen = [...benutzte(koerper)]
    .filter(n => !GETEILT.has(n))
    .filter(n => vorlageDefiniert.has(n))
    .sort()
  const fehlt = aufgerufen.filter(n => !umgesetzt.has(n))

  // Die Kacheln dieses Tabs — Titel fuer Titel gegen die Umsetzung.
  const titel = kartentitel(koerper)
  const titelFehlt = titel.filter(t => {
    const kern = t.split('…')[0].trim()
    return kern.length > 2 && !umsetzung.includes(kern)
  })

  gesamt += aufgerufen.length + titel.length + 1
  fehlend += fehlt.length + titelFehlt.length + (umgesetzt.has(komponente) ? 0 : 1)
  const heil = fehlt.length === 0 && titelFehlt.length === 0 && umgesetzt.has(komponente)
  console.log(`${heil ? 'OK  ' : 'FEHLT'} ${tab.padEnd(12)} ${komponente}`
    + ` — ${aufgerufen.length} Unterkomponenten, ${titel.length} Kacheln`
    + (fehlt.length ? `\n        FEHLENDE KOMPONENTEN: ${fehlt.join(', ')}` : '')
    + (titelFehlt.length ? `\n        FEHLENDE KACHELN: ${titelFehlt.join(' | ')}` : ''))
}

// Die acht Modale.
const modalNamen = [...definierte(modals)]
  .filter(n => n.endsWith('Modal'))
  .sort()
const modalFehlt = modalNamen.filter(n => !umgesetzt.has(n))
gesamt += modalNamen.length
fehlend += modalFehlt.length
console.log(`\n${modalFehlt.length ? 'FEHLT' : 'OK  '} Modale`
  + ` — ${modalNamen.length} Stueck`
  + (modalFehlt.length ? `, FEHLEN: ${modalFehlt.join(', ')}` : ''))

// Die Daten und Formeln.
const datenNamen = [...daten.matchAll(/^(?:const|function)\s+([A-Za-z_][A-Za-z0-9_]*)/gm)]
  .map(m => m[1])
  .filter(n => /^[A-Z_]+$/.test(n) || n.startsWith('calc') || n.startsWith('generate'))
  .sort()
const datenFehlt = datenNamen.filter(n => !new RegExp(`\\b${n}\\b`).test(umsetzung))
gesamt += datenNamen.length
fehlend += datenFehlt.length
console.log(`${datenFehlt.length ? 'FEHLT' : 'OK  '} Daten/Formeln`
  + ` — ${datenNamen.length} Stueck`
  + (datenFehlt.length ? `, FEHLEN: ${datenFehlt.join(', ')}` : ''))

// Die drei geteilten Bausteine des Rahmens.
const RAHMEN = ['RangeIndicator', 'FlagPill', 'TrendBadge']
const rahmenFehlt = RAHMEN.filter(n => !umgesetzt.has(n))
gesamt += RAHMEN.length
fehlend += rahmenFehlt.length
console.log(`${rahmenFehlt.length ? 'FEHLT' : 'OK  '} Rahmenbausteine`
  + ` — ${RAHMEN.length} Stueck`
  + (rahmenFehlt.length ? `, FEHLEN: ${rahmenFehlt.join(', ')}` : ''))

console.log(`\n${gesamt - fehlend} von ${gesamt} vorhanden.`)
process.exit(fehlend === 0 ? 0 : 1)
