// G-341: die Erfasst-Spalte am Schirm. Nur lesend.
import { chromium } from '@playwright/test'

const MARKE = process.argv[2] ?? 'vorher'
const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1600, height: 1000 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', 'LumeosDev2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

// Das 60-Tage-Fenster, damit die Zahlen des Punktes vergleichbar sind.
await p.goto(`${B}/v2/nutrition?tab=nutrients&fenster=60`,
  { waitUntil: 'networkidle' })
await p.waitForTimeout(4500)

const raus = {}
raus.spaltenkoepfe = await p.locator('thead th')
  .evaluateAll(n => n.map(e => e.textContent.trim()).filter(Boolean))

// Die drei Codes aus dem Punkt: was steht in ihrer Zeile?
raus.zeilen = await p.evaluate(() => {
  const codes = ['VITA', 'CARTB', 'CAROTPAXB']
  const raus = {}
  for (const tr of document.querySelectorAll('tbody tr')) {
    const t = tr.textContent ?? ''
    for (const c of codes) {
      if (new RegExp(`(?<![A-Z])${c}(?![A-Z])`).test(t) && !raus[c]) {
        raus[c] = [...tr.querySelectorAll('td')]
          .map(td => (td.textContent ?? '').trim())
          .filter(Boolean)
      }
    }
  }
  return raus
})

// Wie oft steht "vollst." ueberhaupt auf der Seite?
const txt = await p.locator('body').innerText()
raus.vollst_treffer = (txt.match(/\d+\/\d+ Tg\. vollst\./g) ?? []).length
raus.null_vollst = (txt.match(/0\/\d+ Tg\. vollst\./g) ?? []).length

await p.screenshot({ path: `backup/g341-${MARKE}-nutrients.png`, fullPage: true })
console.log(JSON.stringify(raus, null, 2))
await b.close()
