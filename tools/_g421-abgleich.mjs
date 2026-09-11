// G-421/A2 - die Vorlage gegen das Gebaute, je Reiter.
//
// `[read]` **Titel gegen Titel, nicht Zeichenkette gegen Datei** -
// eine Suche ueber die ganze Datei ist immer gruen.
//
// `[cmd]` **Die Vorlage baut je Reiter eine KOMPONENTE**
// (`{tab === "goals" && <GoalsTab/>}`, Zeile 186-195) - **daher
// kommen die Namen, die `vollstaendigkeit.mjs` vermisst.**
//
// `[cmd]` **Und die Mockup-Referenz zaehlt NICHT als gebaut** - sie
// ist die Vorlage selbst, unter der Trennlinie. **Oben zaehlt.**
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd())
const VORLAGE = path.join(WURZEL,
  'docs/spezifikation/10-plattform/design-system/theme-v1/module-goals.jsx')

const jsx = fs.readFileSync(VORLAGE, 'utf8')

/**
 * Der Rumpf einer Komponente bis zur naechsten Deklaration.
 *
 * `[cmd]` **Die Vorlage schreibt `const Name = (...) =>`, nicht
 * `function Name`** - mein erster Anlauf fand deshalb NICHTS und
 * haette "nicht in der Vorlage" gemeldet.
 */
function rumpf(name) {
  const m = jsx.match(new RegExp(`^(?:const|function) ${name}\\b`, 'm'))
  if (!m) return null
  const rest = jsx.slice(m.index + m[0].length)
  const n = rest.search(/^(?:const|function) [A-Z]\w*\s*[=(]/m)
  return n < 0 ? rest : rest.slice(0, n)
}

const titelAus = (s) => [...new Set(
  [...s.matchAll(/title="([^"]+)"/g)].map(m => m[1]))]

// Die vier Reiter, die `vollstaendigkeit.mjs` vermisst - plus die
// Unterkomponenten, die es namentlich nennt.
const TEILE = ['GoalsTab', 'TimelineTab', 'MetricsTab', 'MeasureTab',
  'CompTab', 'GoalCard', 'BodyFatScale']

for (const name of TEILE) {
  const r = rumpf(name)
  if (!r) { console.log(`\n=== ${name} ===  NICHT IN DER VORLAGE`); continue }
  const titel = titelAus(r)
  // Auch die Unterkomponenten, die der Reiter selbst rendert.
  const kinder = [...new Set([...r.matchAll(/<([A-Z]\w+)\b/g)].map(m => m[1]))]
    .filter(k => !['Card', 'Row', 'Pill', 'Btn', 'KPI', 'Meter', 'Ring',
      'Icon', 'Empty', 'React', 'Fragment'].includes(k))
  console.log(`\n=== ${name} ===  ${titel.length} Kacheln`)
  titel.forEach(t => console.log(`   Kachel:  ${t}`))
  kinder.forEach(k => console.log(`   Kind:    <${k}>`))
}
