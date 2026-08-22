// G-133 in der Oberflaeche: Pille klicken, Trefferzahl lesen.
// Der Beleg ist die Zahl UEBER der Liste — sie kommt aus `total`.
import { chromium } from '@playwright/test'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const browser = await chromium.launch()
const seite = await (await browser.newContext({
  viewport: { width: 1440, height: 1000 } })).newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await seite.locator('input[type=email]').count()) {
  await seite.fill('input[type=email]', 'test-user@lumeos.local')
  await seite.fill('input[type=password]', 'LumeosTestUser2026')
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
}
await seite.goto(`${BASIS}/v2/nutrition?tab=foods`,
  { waitUntil: 'networkidle', timeout: 60_000 })
await seite.waitForTimeout(1500)

// Die Trefferzahl steht als „7.140 Treffer" o. ae. ueber der Liste.
const zahl = async () => seite.evaluate(() => {
  const t = (document.body.textContent ?? '').replace(/\s+/g, ' ')
  const m = t.match(/([\d.]{3,})\s*(Treffer|Eintr|results?)/i)
  return m ? m[1] : null
})

// Steht neben den Pillen noch eine fest verdrahtete Zahl?
const pillenText = async () => seite.evaluate(() =>
  [...document.querySelectorAll('button')]
    .map(b => (b.textContent ?? '').replace(/\s+/g, ' ').trim())
    .filter(t => /^Ohne (Laktose|Gluten|Nüsse)/.test(t)))

console.log('vorher   Trefferzahl:', await zahl())
console.log('         Pillen     :', JSON.stringify(await pillenText()))

// Filterbereich oeffnen, falls er zugeklappt ist.
const filterKnopf = seite.locator('button:has-text("Filter")').first()
if (await filterKnopf.count()) {
  await filterKnopf.click().catch(() => {})
  await seite.waitForTimeout(600)
}

const pille = seite.locator('button:has-text("Ohne Laktose")').first()
if (!(await pille.count())) {
  console.log('KEINE Pille „Ohne Laktose" gefunden.')
  await seite.screenshot({ path: 'backup/g133-keine-pille.png', fullPage: true })
} else {
  await pille.click()
  await seite.waitForTimeout(2200)
  console.log('nachher  Trefferzahl:', await zahl())
  console.log('         Pillen     :', JSON.stringify(await pillenText()))
  await seite.screenshot({ path: 'backup/g133-ohne-laktose.png', fullPage: true })
}
await browser.close()
