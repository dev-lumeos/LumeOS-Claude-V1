// G-492 -- fuellt die Nachlese die Formspalte?
//
// [read] Vorher war sie in ALLEN acht gemessenen Zeilen leer.
// Gemessen wird die API, nicht der Schirm -- der Schirm kommt
// spaeter und braucht erst die Spalte.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext()).newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })

for (const q of ['Whey', 'Vitamin D3', 'Creatine']) {
  const d = await s.evaluate(async (q) => {
    const a = await fetch(`/api/supplements/produkte?q=${encodeURIComponent(q)}&status=alle`)
    const j = await a.json().catch(() => null)
    const z = j?.zeilen ?? []
    const formen = {}
    for (const r of z) {
      const k = r.produktform ?? '(leer)'
      formen[k] = (formen[k] ?? 0) + 1
    }
    return { weg: j?.weg, zeilen: z.length, ohneForm: z.filter(r => !r.produktform).length, formen }
  }, q)
  console.log(`"${q}"  weg=${d.weg}  zeilen=${d.zeilen}  OHNE FORM=${d.ohneForm}`)
  console.log('   ', JSON.stringify(d.formen))
}
await b.close().catch(()=>{})
