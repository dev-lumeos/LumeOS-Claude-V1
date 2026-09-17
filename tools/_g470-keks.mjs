// G-470 — sieht die MIDDLEWARE den Keks?
// [read] Der Keks steht im Browser (beide Server). Die Frage ist, ob
// er mitgeschickt wird und ob der Server ihn lesen kann.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', 'dev@lumeos.app')
await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)
const kekse = await k.cookies()
// Jetzt gezielt eine geschuetzte Route holen und sehen, was passiert.
// [read] Der Reiter STUERZT AB (`Page crashed`) — deshalb wird der
// Absturz aufgefangen und gemeldet, statt das Skript zu beenden.
const konsole = []
const seitenfehler = []
s.on('console', m => { if (m.type() === 'error') konsole.push(m.text().slice(0, 300)) })
s.on('pageerror', e => seitenfehler.push(e.message.slice(0, 300)))
s.on('crash', () => seitenfehler.push('PAGE CRASHED'))
let r = null
let absturz = null
try {
  r = await s.goto(`${BASIS}/v2/settings`, { waitUntil: 'domcontentloaded' })
  await s.waitForTimeout(2500)
} catch (e) {
  absturz = String(e).slice(0, 200)
}
console.log(JSON.stringify({
  basis: BASIS,
  kekseImBrowser: kekse.map(c => ({
    name: c.name, path: c.path, domain: c.domain,
    httpOnly: c.httpOnly, sameSite: c.sameSite, laenge: c.value.length,
  })),
  geschuetzteRoute: {
    status: r?.status() ?? null,
    absturz,
    konsole: konsole.slice(0, 5),
    seitenfehler: seitenfehler.slice(0, 5),
  },
}, null, 2))
await b.close()
