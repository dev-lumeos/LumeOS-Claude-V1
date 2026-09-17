// G-470/A4 — eine ANGEMELDETE Route im Produktionsbau, mit Zeit.
//
// [read] Der Browserreiter stuerzt auf `/v2/*` ab (eigener Befund).
// Gemessen wird deshalb mit `fetch` AUS einer angemeldeten Sitzung —
// derselbe Weg durch Middleware, Auth und Server-Render, nur ohne
// React im Browser.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ROUTEN = ['/v2/settings', '/v2/goals', '/v2/supplements?tab=produkte']

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', 'dev@lumeos.app')
await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)
const angemeldet = (await k.cookies()).some(c => c.name.includes('auth-token'))

const aus = []
for (const route of ROUTEN) {
  const zeiten = []
  for (let i = 0; i < 4; i++) {
    const t = await s.evaluate(async (u) => {
      const t0 = performance.now()
      const a = await fetch(u, { redirect: 'manual' })
      const txt = await a.text()
      return { ms: Math.round(performance.now() - t0), status: a.status,
               typ: a.type, laenge: txt.length }
    }, route)
    zeiten.push(t)
  }
  aus.push({
    route,
    ersterMs: zeiten[0].ms,
    weitereMs: zeiten.slice(1).map(x => x.ms),
    status: zeiten[0].status,
    // [read] Eine Umleitung waere KEINE angemeldete Antwort.
    laengeErste: zeiten[0].laenge,
  })
}
console.log(JSON.stringify({ basis: BASIS, angemeldet, routen: aus }, null, 2))
await b.close()
