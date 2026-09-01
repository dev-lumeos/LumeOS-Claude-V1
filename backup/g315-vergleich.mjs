// G-315: jede Vorlagenzeile gegen den Ist-Zustand.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 1600 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=plans', { waitUntil: 'networkidle' })
await s.waitForTimeout(2600)

const px = async (sel, prop) => {
  const el = s.locator(sel).first()
  if (await el.count() === 0) return null
  return el.evaluate((n, p) => getComputedStyle(n)[p], prop)
}
const zeile = (nr, soll, ist, ok) =>
  console.log(`  Z.${String(nr).padEnd(8)} ${soll.padEnd(42)} ${ok ? 'ok  ' : 'FEHLT'} ${ist}`)

console.log('=== Vorlage gegen Ist ===')

// Z. 364 — Ring
const ring = s.locator('.v2-ring').first()
const rb = await ring.count() ? await ring.boundingBox() : null
zeile(364, 'Ring size 92, Label unter der Zahl', rb ? `${Math.round(rb.width)}px` : '—',
  rb && Math.round(rb.width) === 92)

// Z. 373 — die Rechnung, mono, 10,5 px
const t = await s.locator('body').innerText()
const rech = t.match(/\(\d+ best[^\n]*z[äa]hlen nicht/)
const rechEl = s.locator('.v2-mono').filter({ hasText: 'bestätigt' }).first()
const rechPx = await rechEl.count() ? await px('.v2-mono:has-text("bestätigt")', 'fontSize') : null
zeile(373, 'Rechnung, mono, 10.5px', rechPx ?? '—', !!rech && rechPx === '10.5px')

// Z. 391 — Zeit links, 38 px
const zeitEl = s.locator('.v2-num.v2-dim').filter({ hasText: /^\d\d:\d\d$/ }).first()
const zb = await zeitEl.count() ? await zeitEl.boundingBox() : null
zeile(391, 'Zeit links, 38px breit', zb ? `${Math.round(zb.width)}px "${(await zeitEl.innerText()).trim()}"` : '—',
  zb && Math.round(zb.width) === 38)

// Z. 392 — Mahlzeitname 12,5 px / 600
const namen = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
let nameOk = false, namePx = '—'
for (const n of namen) {
  const el = s.locator(`span:text-is("${n}")`).first()
  if (await el.count() === 0) continue
  const fs = await el.evaluate(x => getComputedStyle(x).fontSize)
  const fw = await el.evaluate(x => getComputedStyle(x).fontWeight)
  namePx = `${fs} / ${fw}`
  nameOk = fs === '12.5px' && fw === '600'
  break
}
zeile(392, 'Mahlzeitname 12.5px, 600', namePx, nameOk)

// Z. 396 — Lebensmittel 46 px eingerueckt
const lm = s.locator('.v2-muted').filter({ hasText: /./ })
let lmOk = false, lmPx = '—'
for (let i = 0; i < await lm.count(); i++) {
  const p = await lm.nth(i).evaluate(x => getComputedStyle(x).paddingLeft)
  if (p === '46px') { lmOk = true; lmPx = p; break }
}
zeile(396, 'Lebensmittel, 46px eingerueckt', lmPx, lmOk)

// Z. 398-404 — vier Knoepfe
for (const [n, k] of [['Confirm as planned', 400], ['MealCam', 401],
                      ['Log deviation', 402], ['Skip', 403]]) {
  const c = await s.getByRole('button', { name: n, exact: true }).count()
  zeile(k, `Knopf "${n}"`, c > 0 ? `${c}x` : 'nicht gebaut', c > 0)
}

// Z. 414-419 — Plan settings, fuenf Zeilen
const ps = t.indexOf('Plan settings')
const psBlock = ps >= 0 ? t.slice(ps, t.indexOf('Lifecycle types', ps)) : ''
const psZeilen = (psBlock.match(/\n/g) ?? []).length
console.log(`  Z.414-419 Plan settings, 5 Zeilen`.padEnd(54) +
  (psBlock ? psBlock.split('\n').filter(Boolean).slice(2).join(' · ') : '—'))

// Z. 435-441 — Sparkline
const spark = await s.locator('svg').filter({ has: s.locator('polyline, path') }).count()
zeile(436, 'Sparkline h=44', `${spark} svg`, spark > 0)
for (const n of ['Avg', 'Deviations', 'Skips']) {
  zeile(438, `"${n}"`, t.includes(n) ? 'da' : '—', t.includes(n))
}

console.log('\n=== Die zwei Fehler ===')
console.log(`  Aktivieren-Knoepfe: ${await s.getByRole('button', { name: 'Aktivieren' }).count()}`)
console.log(`  "gesperrt" im Text: ${t.includes('gesperrt') ? 'JA' : 'nein'}`)
const namen2 = t.match(/Aufbau-Wochenplan/g) ?? []
console.log(`  aktiver Plan erscheint: ${namen2.length}x`)

await s.screenshot({ path: 'backup/g315-nachher.png', fullPage: false })
await b.close()
