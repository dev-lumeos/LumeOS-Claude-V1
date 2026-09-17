// G-473 — eine Umleitungsschleife?
// [read] `/v2` ohne Keks -> 307 nach /login?redirect=/v2. Wenn der
// angemeldete Reiter denselben 307 bekommt und /login ihn wieder
// zurueckschickt, laeuft der Reiter im Kreis — das toetet ohne
// Ausnahme und ohne Speicherwachstum.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
const wege = []
let abgestuerzt = false
s.on('crash', () => { abgestuerzt = true })
s.on('response', r => {
  const st = r.status()
  if (st >= 300 && st < 400) {
    wege.push(`${st} ${r.url().replace(BASIS,'')} -> ${r.headers()['location'] ?? '?'}`)
  } else if (r.request().resourceType() === 'document') {
    wege.push(`${st} ${r.url().replace(BASIS,'')}`)
  }
})
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', 'dev@lumeos.app')
await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)
wege.length = 0
s.goto(`${BASIS}/v2`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(()=>{})
for (let i = 0; i < 40 && !abgestuerzt; i++) await new Promise(r => setTimeout(r, 150))
console.log(JSON.stringify({ abgestuerzt, anzahlWege: wege.length,
  wege: wege.slice(0, 25) }, null, 2))
await b.close().catch(() => {})
