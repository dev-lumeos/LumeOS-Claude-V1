// G-343: steht *Sonstige* noch am Schirm? Nur lesend.
import { chromium } from '@playwright/test'

const MARKE = process.argv[2] ?? 'vorher'
const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1500, height: 1000 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', 'LumeosDev2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

await p.goto(`${B}/v2/nutrition?tab=nutrients&fenster=30`,
  { waitUntil: 'networkidle' })
await p.waitForTimeout(4500)

const t = await p.locator('body').innerText()
const raus = {
  // Die Kartenüberschriften der Nährstoffordnung.
  karten: await p.locator('.v2-card-h, [class*="card"] h3, h3')
    .evaluateAll(n => n.map(e => e.textContent.trim())
      .filter(x => x && x.length < 40)).catch(() => []),
  sonstige_im_text: /Sonstige(?!s)/.test(t),
  // Welche Karte traegt was? Der Textblock um die Ueberschrift.
  ausschnitt: t.includes('Sonstige')
    ? t.slice(t.indexOf('Sonstige') - 40, t.indexOf('Sonstige') + 120)
      .split('\n').filter(Boolean)
    : [],
  fettbegleit_ausschnitt: t.includes('Fettbegleitstoffe')
    ? t.slice(t.indexOf('Fettbegleitstoffe'), t.indexOf('Fettbegleitstoffe') + 120)
      .split('\n').filter(Boolean)
    : [],
  // In welcher Reihenfolge stehen die Karten wirklich?
  reihenfolge: ['Kohlenhydrate','Fette','Protein','Fettlösliche',
    'Wasserlösliche','Elemente','Energie','Wasser','Organische',
    'Genussmittel','Sonstige','Fettbegleitstoffe']
    .map(k => ({ k, pos: t.indexOf(k) }))
    .filter(x => x.pos >= 0).sort((a, b) => a.pos - b.pos).map(x => x.k),
  fettbegleit: /Fettbegleit/.test(t),
  stickstoff: /Stickstoff/.test(t),
  // Ist die Protein-Karte zu? Dann steht NT drin, aber unsichtbar.
  protein_karte: t.includes('Protein')
    ? t.slice(t.indexOf('Protein'), t.indexOf('Protein') + 90)
      .split(String.fromCharCode(10)).filter(Boolean)
    : [],
  cholesterin: /Cholesterin/.test(t),
}

await p.screenshot({ path: `backup/g343-${MARKE}-nutrients.png`, fullPage: true })
console.log(JSON.stringify(raus, null, 2))
await b.close()
