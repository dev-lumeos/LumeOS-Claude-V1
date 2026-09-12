// G-431 - die neue Verteilung messen, nicht rechnen.
//
// `[read]` **Eine von Hand gerechnete Zahl im Test ist eine
// Behauptung** - diese hier kommt aus dem Code selbst.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const HILF = path.join(WURZEL, 'apps/web/src/app/v2/recovery/__tests__/_g431-mess.ts')

fs.writeFileSync(HILF, `import { FLAECHEN, muskelnZurFlaeche, MUSKEL_ZU_FLAECHE, flaechenVonMuskel } from '../muskel-ebenen'
import { nachArt, RECOVERY_ZU_KARTE, flaechenFuer } from '../muskel-zuordnung'

const ist: Record<string, number> = {}
for (const f of FLAECHEN) {
  const n = muskelnZurFlaeche(f).length
  if (n > 0) ist[f] = n
}
const sortiert = Object.entries(ist).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
console.log('--- Verteilung ---')
for (const [k, v] of sortiert) console.log('  ' + (/-/.test(k) ? "'" + k + "'" : k) + ': ' + v + ',')
console.log('Summe: ' + Object.values(ist).reduce((a, b) => a + b, 0))
console.log('Namen: ' + Object.keys(MUSKEL_ZU_FLAECHE).length)
const mehrfach = Object.keys(MUSKEL_ZU_FLAECHE).filter(n => flaechenVonMuskel(n).length > 1)
console.log('Mehrfach: ' + mehrfach.length + ' (' + mehrfach.join(', ') + ')')
console.log('--- Einordnung ---')
console.log('gruppe: ' + nachArt('gruppe').length)
console.log('teilstueck: ' + nachArt('teilstueck').length)
console.log('nicht-muskel: ' + nachArt('nicht-muskel').length)
const belegt = new Set(Object.keys(RECOVERY_ZU_KARTE).flatMap(s => flaechenFuer(s)))
const gruppen = nachArt('gruppe')
console.log('eingefaerbt: ' + gruppen.filter(g => belegt.has(g)).length)
console.log('ohne Kuerzel: ' + gruppen.filter(g => !belegt.has(g)).join(', '))
`)

try {
  console.log(execFileSync('npx', ['tsx', 'src/app/v2/recovery/__tests__/_g431-mess.ts'],
    { cwd: path.join(WURZEL, 'apps/web'), encoding: 'utf8',
      shell: process.platform === 'win32' }))
} finally {
  fs.unlinkSync(HILF)
}
