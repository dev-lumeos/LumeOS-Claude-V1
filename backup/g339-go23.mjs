// GO-23: gibt es eine Dimmung unter 50 % Deckung? Nur lesend.
import { chromium } from '@playwright/test'

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

await p.goto(`${B}/v2/nutrition?tab=nutrients`, { waitUntil: 'networkidle' })
await p.waitForTimeout(4000)

const t = await p.locator('body').innerText()
const raus = {
  // Steht die "aus X von Y"-Angabe irgendwo?
  deckungsangabe: (t.match(/aus \d+ von \d+/g) ?? []).slice(0, 5),
  nennt_unvollstaendig: /unvollst/i.test(t),
  // Gibt es ueberhaupt verschiedene Deckgrade am Schirm?
  prozentwerte: (t.match(/\d+\s?%/g) ?? []).slice(0, 8),
}

// Die Wirkung von GO-23 waere: Werte mit geringer Deckung sind
// blasser. Also: gibt es MEHR ALS EINE Deckkraft bei den Zahlen?
raus.deckkraefte = await p.evaluate(() => {
  const zellen = [...document.querySelectorAll('td, span, div')]
    .filter(e => /^[\d.,]+$/.test((e.textContent ?? '').trim())
      && e.children.length === 0)
  const werte = new Set()
  for (const e of zellen.slice(0, 300)) {
    const s = getComputedStyle(e)
    werte.add(`${s.opacity}|${s.color}`)
  }
  return { verschiedene: werte.size, beispiele: [...werte].slice(0, 6) }
})

await p.screenshot({ path: 'backup/go23-nutrients.png', fullPage: true })
console.log(JSON.stringify(raus, null, 2))
await b.close()
