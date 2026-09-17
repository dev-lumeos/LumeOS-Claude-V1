// G-465 — wie lange die Routen SERVERSEITIG brauchen.
//
// [read] Der Browser misst Warteschlange + Transport + Server. Curl
// gegen dieselbe Route, mit der Sitzung, misst nur den Server.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS='http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil:'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]','dev@lumeos.app')
  await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
// Eine Route NACH DER ANDEREN, je dreimal — ohne Nachbarlast.
const ROUTEN = [
  '/api/supplements/meidestoffe',
  '/api/supplements/marken',
  '/api/supplements/produkte?seite=0&status=alle',
  '/api/supplements/produkte?frage=whey&seite=0&status=alle',
]
const aus = []
for (const r of ROUTEN) {
  const zeiten = []
  for (let i=0;i<3;i++) {
    const t = await s.evaluate(async (u) => {
      const t0 = performance.now()
      const a = await fetch(u)
      await a.arrayBuffer()
      return { ms: Math.round(performance.now()-t0), status: a.status }
    }, r)
    zeiten.push(t.ms)
  }
  aus.push({ route: r.replace('/api/supplements/',''), laeufe: zeiten })
}
console.log(JSON.stringify(aus, null, 2))
await b.close()
