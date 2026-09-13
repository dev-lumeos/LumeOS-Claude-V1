// G-446: die Liste als TEXT lesen — je Zeile Name + Wert + Zusatz.
// Anmeldeblock woertlich aus tools/schuss.mjs, statt ihn neu zu erfinden.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const KONTO = 'dev@lumeos.app'
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1920, height: 1400 } })
const p = await k.newPage()

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await p.locator('input[type=email]').count()) {
  await p.fill('input[type=email]', KONTO)
  await p.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    p.click('button[type=submit]'),
  ])
}
await p.goto(`${BASIS}/v2/recovery?tab=muscles`,
  { waitUntil: 'networkidle', timeout: 60_000 })
await p.waitForTimeout(2500)

const zeilen = await p.$$eval('[data-muskelzeile]', els => els.map(e => {
  const name = e.getAttribute('data-muskelzeile') ?? ''
  const txt = (e.textContent ?? '').replace(/\s+/g, ' ').trim()
  return `${name} || ${txt.slice(name.length).trim()}`
}))
console.log(`ZEILEN: ${zeilen.length}  URL: ${p.url()}`)
for (const z of zeilen) console.log(z)
await b.close()
