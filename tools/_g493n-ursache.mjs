// G-493/N1 -- warum zeigt der Schirm den Schluessel?
//
// [read] Die statische Probe (tools/i18n-pruefen.mjs) meldet
// "109 Verwendungen, alle vorhanden" -- und der Schirm zeigt
// trotzdem `Allgemein.hinzufuegen`. Also misst sie etwas anderes
// als die Anzeige.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
const logs=[]; s.on('console', m => { if (m.type()==='error') logs.push(m.text().slice(0,220)) })
s.on('pageerror', e => logs.push('PAGEERROR: ' + String(e).slice(0,220)))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector('input[aria-label="Produkt suchen"]', { timeout: 40000 })
await s.waitForTimeout(2500)

const d = await s.evaluate(() => {
  const t = document.body.textContent ?? ''
  // [read] Nach dem SCHLUESSEL suchen, nicht nach dem Wort -- genau
  // das hat meine erste Probe versaeumt.
  const schluessel = (t.match(/[A-Z][A-Za-z]+\.[a-zA-Z]+/g) ?? [])
    .filter(x => /^(Allgemein|Supplements|Nutrition|Training|Medical)\./.test(x))
  return {
    zeigtSchluessel: [...new Set(schluessel)],
    cookie: document.cookie,
    lang: document.documentElement.lang,
  }
})
console.log('SCHIRM:', JSON.stringify(d, null, 2))
console.log('KONSOLE:', logs.slice(0, 5))
await b.close().catch(()=>{})
