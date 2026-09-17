// G-465 — welcher Zweig der Route kostet die Zeit?
// [read] `allergien=0` schaltet den harten Filter ab (die Route
// kennt den Schalter schon). Die Differenz ist die Antwort.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS='http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const s = await (await b.newContext()).newPage()
await s.goto(`${BASIS}/login`, { waitUntil:'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]','dev@lumeos.app')
  await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
const FAELLE = [
  ['mit Allergiefilter',  '/api/supplements/produkte?seite=0&status=alle'],
  ['OHNE Allergiefilter', '/api/supplements/produkte?seite=0&status=alle&allergien=0'],
]
for (const [name, u] of FAELLE) {
  const zeiten = []
  for (let i=0;i<3;i++) {
    const t = await s.evaluate(async (x) => {
      const t0 = performance.now()
      const a = await fetch(x); const j = await a.json()
      return { ms: Math.round(performance.now()-t0), zeilen: j.zeilen?.length ?? 0,
               allergieProdukte: j.allergieProdukte ?? null }
    }, u)
    zeiten.push(t)
  }
  console.log(name.padEnd(22), JSON.stringify(zeiten))
}
await b.close()
