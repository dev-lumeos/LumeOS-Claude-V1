// G-435/A1 - was steht WIRKLICH im Modal?
//
// `[read]` **Die Probe aus G-432 sucht feste Ueberschriften** - nach
// dem Umbau heissen sie anders, und sie meldet „—" statt zu sagen,
// was da ist. **Also erst ansehen, dann pruefen.**
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'
const FLAECHE = process.argv[4] ?? 'latissimus'
const BILD = process.argv[5] ?? 'docs/bilder/g435/a1-nachher.png'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1500 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 200)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

await p.goto(`${ZIEL}/v2/recovery?tab=muscles`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1600)

// `[read]` **Einen Punkt suchen, der WIRKLICH auf der Flaeche liegt**
// - die Lehre aus der Sichel in G-432.
const t = await p.evaluate((code) => {
  for (const g of document.querySelectorAll(`[data-muskel="${code}"]`)) {
    const r = g.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue
    for (let i = 1; i <= 29; i += 1) {
      for (let j = 1; j <= 29; j += 1) {
        const x = r.left + (r.width * i) / 30, y = r.top + (r.height * j) / 30
        const el = document.elementFromPoint(x, y)
        if (el?.closest('[data-muskel]')?.getAttribute('data-muskel') === code) return { x, y }
      }
    }
  }
  return null
}, FLAECHE)

if (!t) { console.log(`kein Treffpunkt auf "${FLAECHE}"`); await b.close(); process.exit(1) }
await p.mouse.click(t.x, t.y)
await p.waitForTimeout(900)

const d = await p.evaluate(() => {
  const dlg = document.querySelector('[role="dialog"]')
  if (!dlg) return null
  return {
    titel: dlg.querySelector('div[style*="font-weight: 600"]')?.textContent?.trim() ?? null,
    koepfe: [...dlg.querySelectorAll('.v2-eyebrow')].map(x => x.textContent?.trim() ?? ''),
    nichtGezeichnet: (dlg.textContent?.match(/\(nicht gezeichnet\)/g) ?? []).length,
    hoehe: Math.round(dlg.getBoundingClientRect().height),
    text: (dlg.textContent ?? '').replace(/\s+/g, ' ').slice(0, 500),
  }
})

console.log(`\n=== Modal "${FLAECHE}" ===\n`)
if (!d) console.log('  Fenster NICHT offen')
else {
  console.log(`  Titel             ${d.titel}`)
  console.log(`  Hoehe             ${d.hoehe} px`)
  console.log(`  „(nicht gez.)"    ${d.nichtGezeichnet}x`)
  console.log(`  Ueberschriften:`)
  for (const k of d.koepfe) console.log(`    - ${k}`)
  console.log(`\n  Text: ${d.text.slice(0, 400)}`)
  await p.screenshot({ path: BILD, fullPage: true })
  console.log(`\n  Bild: ${BILD}`)
}

console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()
