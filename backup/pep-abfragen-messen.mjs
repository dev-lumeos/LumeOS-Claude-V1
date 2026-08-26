// Wie lange braucht JEDE der sieben Abfragen einzeln?
//
// `[read]` **Die langsamste Einzelabfrage ist die Untergrenze** fuer
// alles, was parallel laeuft. Liegt die Seite danach deutlich
// darueber, ist noch etwas anderes im Weg — und das gehoert benannt,
// nicht weggerundet.
//
// Gemessen wird ueber eine Route, die im Dev-Server laeuft, damit
// dieselbe Sitzung, dieselben Rechte und derselbe Client greifen wie
// beim echten Seitenaufbau.
//
// Aufruf: node backup/pep-abfragen-messen.mjs
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'

const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await s.newPage()

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type="email"]', KONTO)
await p.fill('input[type="password"]', wortFuer(KONTO))
await p.click('button[type="submit"]')
await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })

// Zwei Laeufe: der erste uebersetzt im Dev-Modus mit.
for (const lauf of [1, 2]) {
  const t0 = Date.now()
  const antwort = await p.request.get(`${BASIS}/api/messung-temp/supplements`)
  const ms = Date.now() - t0
  if (!antwort.ok()) {
    console.log(`Lauf ${lauf}: HTTP ${antwort.status()} — Messroute fehlt?`)
    console.log((await antwort.text()).slice(0, 300))
    break
  }
  const d = await antwort.json()
  console.log(`\n══ Lauf ${lauf} ═══════════════════════════════════`)
  for (const z of d.einzeln.sort((a, b) => b.ms - a.ms)) {
    console.log(`  ${String(z.ms).padStart(6)} ms  ${z.name}`)
  }
  console.log(`  ${'—'.repeat(30)}`)
  console.log(`  ${String(d.summe).padStart(6)} ms  Summe (nacheinander)`)
  console.log(`  ${String(d.langsamste).padStart(6)} ms  langsamste einzeln`)
  console.log(`  ${String(d.parallel).padStart(6)} ms  gemessen mit Promise.all`)
  console.log(`  ${String(ms).padStart(6)} ms  Antwort der Messroute gesamt`)
}

await b.close()
