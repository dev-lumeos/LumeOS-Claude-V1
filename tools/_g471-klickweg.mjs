// G-471 — trifft es auch den NUTZER, oder nur eine harte Navigation?
//
// [read] Nach der Anmeldung leitet die Anwendung selbst weiter
// (`router.push`). Ein Nutzer klickt danach auf „Supplements" — das
// ist eine Navigation IM Rahmen von Next, keine neue Seitenladung.
// [cmd] Wenn nur `page.goto()` toetet, ist es ein Messartefakt.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'

function mitFrist(p, ms, beiFrist) {
  return Promise.race([p.catch(e => ({ fehler: String(e).slice(0, 140) })),
    new Promise(r => setTimeout(() => r(beiFrist), ms))])
}

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
let abgestuerzt = false
const fehler = []
s.on('crash', () => { abgestuerzt = true })
s.on('pageerror', e => fehler.push(String(e).slice(0, 200)))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', 'dev@lumeos.app')
await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await s.click('button[type=submit]')
await s.waitForTimeout(6000)
const nachAnmeldung = { url: s.url(), abgestuerzt }

// Der Nutzerweg: einen Link im Rahmen anklicken.
let geklickt = null
if (!abgestuerzt) {
  const link = s.locator('a[href^="/v2"]').first()
  const anzahl = await mitFrist(link.count().then(n => ({ n })), 5000, { frist: true })
  if (anzahl.n > 0) {
    const href = await mitFrist(link.getAttribute('href').then(h => ({ h })), 5000, { frist: true })
    await mitFrist(link.click({ timeout: 8000 }).then(() => ({ ok: true })), 10000, { frist: true })
    await new Promise(r => setTimeout(r, 6000))
    geklickt = { href: href.h ?? null, urlDanach: s.url(), abgestuerzt }
  } else {
    geklickt = { keinV2Link: true, gefunden: anzahl.n ?? null }
  }
}

console.log(JSON.stringify({ basis: BASIS, nachAnmeldung, geklickt,
  abgestuerzt, fehler: fehler.slice(0, 3) }, null, 2))
await b.close().catch(() => {})
