// G-470/A3 — warum die Anmeldung im Produktionsbau scheitert.
//
// [read] Gemessen wird, was der Browser sieht: Konsolenmeldungen,
// Seitenfehler, die Antwort des Anmeldeaufrufs und die Kekse danach.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const KONTO = 'dev@lumeos.app'

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
const konsole = []
const fehler = []
const auth = []
s.on('console', m => { if (m.type() === 'error') konsole.push(m.text().slice(0, 200)) })
s.on('pageerror', e => fehler.push(e.message.slice(0, 200)))
s.on('response', async r => {
  if (/auth\/v1|token/.test(r.url())) {
    let body = ''
    try { body = (await r.text()).slice(0, 200) } catch {}
    auth.push({ url: r.url().slice(0, 90), status: r.status(), body })
  }
})

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', KONTO)
await s.fill('input[type=password]', wortFuer(KONTO))
await s.click('button[type=submit]')
await s.waitForTimeout(6000)

const kekse = await k.cookies()
console.log(JSON.stringify({
  basis: BASIS,
  urlDanach: s.url(),
  sichtbarerFehler: await s.evaluate(() => {
    const t = document.body.textContent ?? ''
    const m = t.match(/(nicht m[oö]glich|falsch|Fehler)[^.]{0,80}/)
    return m ? m[0] : null
  }),
  authAufrufe: auth,
  kekse: kekse.map(c => ({ name: c.name, laenge: c.value.length })),
  konsole: konsole.slice(0, 6),
  seitenfehler: fehler.slice(0, 6),
}, null, 2))
await b.close()
