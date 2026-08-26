// G-197: was sieht der Waechter bei einer sabotierten Tabelle?
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const Q = join(process.cwd(), 'apps/web/src')
function d(p, a = []) {
  for (const e of readdirSync(p)) {
    if (e === 'node_modules') continue
    const q = join(p, e)
    if (statSync(q).isDirectory()) d(q, a)
    else if (/\.tsx?$/.test(e)) a.push(q)
  }
  return a
}
const alle = d(Q)
const ist = p => p.includes('__tests__')
let tests = ''
for (const p of alle.filter(ist)) tests += readFileSync(p, 'utf8')

const src = alle.filter(p => !ist(p))
  .map(p => readFileSync(p, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, ''))
  .join('\n')

const namen = new Set()
for (const m of src.matchAll(/\.from\('([a-z_][a-z0-9_]*)'\)/g)) namen.add(m[1])

const gesucht = process.argv[2] ?? 'community_anzeigeX'
const alsGanzes = (n) =>
  new RegExp(`(?<![a-z0-9_])${n}(?![a-z0-9_])`).test(tests)

console.log(JSON.stringify({
  gesucht,
  verdrahtet: namen.has(gesucht),
  inTestsAlsGanzes: alsGanzes(gesucht),
  alleMitPraefix: [...namen].filter(n => n.startsWith('community')),
}, null, 2))
