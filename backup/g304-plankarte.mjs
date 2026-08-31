// G-304: die Knoepfe INNERHALB der Plan-Uebersicht, aufgeklappt.
//
// Der erste Durchgang traf nur die Huelle. Hier wird die Karte
// geoeffnet und jeder Knopf darunter angefasst.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1600, height: 1800 } })

const netz = []
seite.on('request', r => {
  if (r.method() !== 'GET' && r.url().includes('/api/')) {
    netz.push(`${r.method()} ${r.url().replace(BASIS, '')}`)
  }
})

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await seite.goto(`${BASIS}/v2/nutrition?tab=plans`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1400)

// Alles aufklappen, was aufklappbar ist.
for (const name of ['Tage ansehen', 'Aufbau-Wochenplan']) {
  const k = seite.getByRole('button', { name: new RegExp(name) }).first()
  if (await k.count() > 0) { await k.click().catch(() => {}); await seite.waitForTimeout(700) }
}

const wurzel = seite.locator('body')
const gesamt = await wurzel.innerText()
console.log('=== Sichtbarer Text der Plan-Uebersicht (Auszug) ===')
const ab = gesamt.indexOf('ALLE PLÄNE')
console.log(gesamt.slice(ab, ab + 1400))

console.log('\n=== Knoepfe unterhalb der Reiterleiste ===\n')
const knoepfe = wurzel.locator('button:visible')
const n = await knoepfe.count()

// Die Huellenknoepfe ueberspringen: erst ab „New plan" wird es der Reiter.
let start = 0
for (let i = 0; i < n; i += 1) {
  const t = (await knoepfe.nth(i).innerText().catch(() => '')) || ''
  if (t.includes('New plan')) { start = i; break }
}

for (let i = start; i < n; i += 1) {
  const k = knoepfe.nth(i)
  let name = ''
  try {
    name = ((await k.innerText()) || (await k.getAttribute('aria-label')) || '')
      .replace(/\s+/g, ' ').trim().slice(0, 44)
  } catch { continue }
  if (!name) name = '(ohne Text)'

  const vorher = (await wurzel.innerText()).length
  const url0 = seite.url()
  netz.length = 0
  let klick = true
  try { await k.click({ timeout: 2500 }); await seite.waitForTimeout(900) }
  catch { klick = false }

  const nachher = (await wurzel.innerText()).length
  const modal = await seite.locator('.v2-modal:visible').count()
  const w = []
  if (!klick) w.push('NICHT KLICKBAR')
  if (netz.length) w.push(`schreibt: ${netz.join(', ')}`)
  if (modal > 0) w.push('Dialog')
  if (seite.url() !== url0) w.push('Adresswechsel')
  if (nachher !== vorher) w.push(`DOM ${nachher - vorher > 0 ? '+' : ''}${nachher - vorher}`)
  if (w.length === 0) w.push('*** NICHTS ***')
  console.log(`  ${name.padEnd(44)} ${w.join(' | ')}`)

  if (modal > 0) {
    const zu = seite.locator('.v2-modal button[aria-label="Schliessen"]')
    if (await zu.count() > 0) await zu.first().click().catch(() => {})
    await seite.waitForTimeout(400)
  }
  if (seite.url() !== url0) {
    await seite.goto(`${BASIS}/v2/nutrition?tab=plans`, { waitUntil: 'networkidle' })
    await seite.waitForTimeout(900)
    break  // Nach einem Reiterwechsel ist die Liste eine andere.
  }
}

await browser.close()
