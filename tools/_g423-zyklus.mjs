// G-423/A3+A4 - Zyklus starten, pausieren, beenden; Protokoll anlegen.
// Am SCHIRM, auf `test-user@lumeos.local`.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()
const f = []
p.on('pageerror', e => f.push(String(e).slice(0, 140)))
await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'test-user@lumeos.local')
await p.fill('input[type=password]', wortFuer('test-user@lumeos.local'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })
await p.goto(`${ZIEL}/v2/supplements?tab=extended`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)

const lage = () => p.evaluate(() => {
  const k = [...document.querySelectorAll('.v2-card')].find(x =>
    (x.querySelector('h3, h2, .v2-card-title')?.textContent ?? '').trim() === 'Zyklen')
  if (!k) return { da: false }
  const t = k.innerText.replace(/\s+/g, ' ')
  return { da: true, unter: k.querySelector('[class*=sub]')?.textContent?.trim() ?? null,
    laeuft: t.includes('läuft'), pausiert: t.includes('pausiert'), beendet: t.includes('beendet'),
    text: t.slice(0, 200) }
})
console.log('0 vorher:', JSON.stringify(await lage()).slice(0, 200))

await p.selectOption('select[aria-label="Substanz"]', { index: 1 })
await p.click('button:has-text("Zyklus starten")')
await p.waitForTimeout(2800)
console.log('1 gestartet:', JSON.stringify(await lage()).slice(0, 210))
await p.screenshot({ path: 'docs/bilder/g423/zyklus-1-gestartet.png', fullPage: true })

await p.click('button:has-text("Pausieren")')
await p.waitForTimeout(2800)
console.log('2 pausiert: ', JSON.stringify(await lage()).slice(0, 210))
await p.screenshot({ path: 'docs/bilder/g423/zyklus-2-pausiert.png', fullPage: true })

await p.click('button:has-text("Beenden")')
await p.waitForTimeout(2800)
console.log('3 beendet:  ', JSON.stringify(await lage()).slice(0, 210))
await p.screenshot({ path: 'docs/bilder/g423/zyklus-3-beendet.png', fullPage: true })

// A4 - Protokoll aus einer Vorlage.
await p.selectOption('select[aria-label="Vorlage"]', { index: 1 })
await p.selectOption('select[aria-label="Ankersubstanz"]', { index: 1 })
await p.click('button:has-text("Aus Vorlage anlegen")')
await p.waitForTimeout(3000)
const prot = await p.evaluate(() => {
  const k = [...document.querySelectorAll('.v2-card')].find(x =>
    (x.querySelector('h3, h2, .v2-card-title')?.textContent ?? '').trim() === 'Protokolle')
  return k ? k.innerText.replace(/\s+/g, ' ').slice(0, 260) : '(keine Kachel)'
})
console.log('\n4 Protokoll:', prot)
await p.screenshot({ path: 'docs/bilder/g423/protokoll-angelegt.png', fullPage: true })
if (f.length) console.log('SEITENFEHLER:', f.slice(0, 2))
await b.close()
