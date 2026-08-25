// G-167: Extended je Erfahrungsgrad — alle vier Stufen einzeln,
// plus „kein Grad gesetzt".
//
// ANGESAGT, bevor gemessen wird:
//   (kein Grad)  gesperrt
//   beginner     gesperrt
//   advanced     gesperrt   <- war bis G-167 offen
//   pro          OFFEN
//   elite        OFFEN
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const LABEL = { beginner: 'Beginner', advanced: 'Advanced', pro: 'Pro', elite: 'Elite' }
const ANSAGE = [
  [null, false], ['beginner', false], ['advanced', false],
  ['pro', true], ['elite', true],
]

const browser = await chromium.launch()
const seite = await (await browser.newContext({
  viewport: { width: 1440, height: 1100 } })).newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
if (await seite.locator('input[type=email]').count()) {
  await seite.fill('input[type=email]', 'test-user@lumeos.local')
  await seite.fill('input[type=password]', wortFuer('test-user@lumeos.local'))
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
}

/** Den Grad setzen — oder abwaehlen, wenn `null`. */
async function setzeGrad(grad) {
  await seite.goto(`${BASIS}/v2/settings`, { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.waitForTimeout(900)
  // Erst alles abwaehlen, was an ist.
  for (const l of Object.values(LABEL)) {
    const k = seite.locator(`button.v2-wahl:has(.v2-wahl-titel:text-is("${l}"))`)
    if (await k.getAttribute('data-on') === 'true') { await k.click(); await seite.waitForTimeout(200) }
  }
  if (grad) {
    await seite.click(`button.v2-wahl:has(.v2-wahl-titel:text-is("${LABEL[grad]}"))`)
    await seite.waitForTimeout(200)
  }
  const antwort = seite.waitForResponse(r =>
    r.url().includes('/api/profile') && r.request().method() === 'PUT')
  await seite.click('button[type=submit]')
  return (await antwort).status()
}

/** Ist Extended offen? Gemessen an dem, was der Tab zeigt. */
async function extendedOffen() {
  await seite.goto(`${BASIS}/v2/supplements?tab=extended`,
    { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.waitForTimeout(1200)
  return seite.evaluate(() => {
    const t = (document.body.textContent ?? '').replace(/\s+/g, ' ')
    return {
      gesperrt: /Extended supplements/.test(t) && /Dein Erfahrungsgrad/.test(t),
      // Der Provisoriums-Satz muss an der Sperrkachel stehen.
      vorlaeufig: /Noch nicht endgueltig geregelt/.test(t),
      // Nennt die Kachel die richtige Stufe?
      nenntPro: /ab «Pro»/.test(t),
      nenntAdvanced: /ab «Advanced»|ab «Fortgeschritten»/.test(t),
      // Der Tab selbst muss sichtbar bleiben.
      tabDa: /Extended/.test(t),
    }
  })
}

console.log('Grad'.padEnd(12) + 'PUT'.padStart(5) + '  angesagt'.padEnd(12)
  + 'gemessen'.padEnd(12) + 'Tab da  Satz da  Urteil')
console.log('-'.repeat(76))
let alleGut = true
for (const [grad, sollOffen] of ANSAGE) {
  const status = await setzeGrad(grad)
  const z = await extendedOffen()
  const istOffen = !z.gesperrt
  const ok = istOffen === sollOffen && z.tabDa
    && (istOffen || (z.vorlaeufig && z.nenntPro && !z.nenntAdvanced))
  alleGut = alleGut && ok
  console.log(String(grad ?? '(keiner)').padEnd(12) + String(status).padStart(5)
    + '  ' + (sollOffen ? 'offen' : 'gesperrt').padEnd(12)
    + (istOffen ? 'offen' : 'gesperrt').padEnd(12)
    + String(z.tabDa).padEnd(8) + String(z.vorlaeufig).padEnd(9)
    + (ok ? 'ok' : 'ABWEICHUNG'))
}
console.log()
console.log('Alle fuenf Faelle wie angesagt:', alleGut)
await browser.close()
