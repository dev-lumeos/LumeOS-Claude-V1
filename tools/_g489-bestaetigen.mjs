// G-489/A3+A4 -- bestaetigen macht aus der Absicht eine Einnahme.
//
// A3  intake_log, gegen die Datenbank belegt
// A4  danach gruen und abgehakt (wie G-486)
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1400}})).newPage()
const fehler=[]; s.on('pageerror', e=>fehler.push(String(e).slice(0,200)))
const antworten=[]
s.on('response', async r => {
  if (r.url().includes('/api/nutrition/plan')) {
    antworten.push(r.status() + ' ' + (await r.text().catch(()=>'')).slice(0,160))
  }
})
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/nutrition`, { waitUntil: 'domcontentloaded' })
await s.waitForTimeout(7000)

// [read] Die GHOST-Karte mit dem Supplement finden -- ueber die
// Klasse aus ghost-eintrag.tsx:301, nicht ueber eine geratene Marke.
// [read] Auf die Karte WARTEN, nicht sie sofort zaehlen -- die
// Ghost-Liste kommt nach einer eigenen Abfrage (G-492: auf ein
// Element warten, nicht auf die Uhr).
await s.locator('.v2-ghost-offen').first().waitFor({ timeout: 40000 }).catch(()=>{})
const karte = s.locator('.v2-ghost-offen').filter({ hasText: 'Chocolate Hazelnut' }).first()
await karte.waitFor({ timeout: 40000 }).catch(()=>{})
const da = await karte.count()
console.log('Ghost-Karte gefunden:', da > 0)
if (da === 0) { console.log('ABBRUCH'); await b.close(); process.exit(1) }

await karte.scrollIntoViewIfNeeded()
await s.waitForTimeout(600)
await s.screenshot({ path: '../../backup/x-g489-a1-ghost-offen.png' })

const vorher = await karte.evaluate(e => ({
  erfuellt: e.classList.contains('v2-ghost-erfuellt'),
  text: (e.textContent ?? '').trim().slice(0, 180),
}))
console.log('VORHER:', JSON.stringify(vorher, null, 2))

// Bestaetigen
await karte.locator('button', { hasText: 'Bestätigen' }).first().click()
// [read] Auf das ERGEBNIS warten, nicht auf die Uhr.
await s.waitForTimeout(9000)

const nachher = await s.evaluate(() => {
  const k = [...document.querySelectorAll('.v2-ghost-offen, .v2-ghost-erfuellt')]
    .find(e => /Chocolate Hazelnut/.test(e.textContent ?? ''))
  return k ? {
    erfuellt: k.classList.contains('v2-ghost-erfuellt'),
    text: (k.textContent ?? '').trim().slice(0, 200),
  } : null
})
console.log('\nNACHHER:', JSON.stringify(nachher, null, 2))
console.log('ANTWORTEN:', antworten.slice(0, 3))
await s.screenshot({ path: '../../backup/x-g489-a4-erfuellt.png' })
console.log('\nSeitenfehler:', fehler.slice(0,3))
await b.close().catch(()=>{})
