// G-455 — die Produktsuche mit Allergiefilter, gemessen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'networkidle' })
const hole = (q) => s.evaluate(async u => {
  const a = await fetch(u)
  const j = await a.json()
  return { gesamt: j.gesamt, zeilen: j.zeilen?.length, weg: j.weg,
           hartEntfernt: j.hartEntfernt, allergieProdukte: j.allergieProdukte,
           allergieFehler: j.allergieFehler, gesamtUnscharf: j.gesamtUnscharf,
           erste: j.zeilen?.[0]?.name_en, marken: [...new Set((j.zeilen??[]).map(z=>z.marke))].slice(0,4) }
}, q)

const faelle = {
  'ohne Filter':        '/api/supplements/produkte?q=&status=On%20Market',
  'Allergien AUS':      '/api/supplements/produkte?q=&status=On%20Market&allergien=0',
  'eine Marke':         '/api/supplements/produkte?q=&status=On%20Market&marken=NOW',
  'drei Marken':        '/api/supplements/produkte?q=&status=On%20Market&marken=NOW,Solgar,Swanson',
  'Smartsuche':         '/api/supplements/produkte?q=gold%20standart%20wey&status=On%20Market',
}
const aus = {}
for (const [name, u] of Object.entries(faelle)) aus[name] = await hole(u)
console.log(JSON.stringify(aus, null, 2))
await b.close()
