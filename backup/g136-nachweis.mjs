import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 2400 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await s.goto('http://127.0.0.1:3200/v2/nutrition?tab=nutrients', { waitUntil: 'networkidle' })
await s.waitForTimeout(3200)

const t = await s.locator('body').innerText()
const z = t.split('\n').map(x => x.trim()).filter(Boolean)
console.log('── Karten und ihre Zahl ──')
for (const name of ['Kohlenhydrate','Fette','Protein','Fettlösliche Vitamine',
                    'Wasserlösliche Vitamine','Elemente','Energie',
                    'Wasser','Organische Säuren','Genussmittel','Sonstige']) {
  const i = z.findIndex(x => x === name)
  console.log(`  ${name.padEnd(24)} ${i < 0 ? '— nicht da' : z.slice(i, i+3).join(' · ')}`)
}
console.log('\n── Erklärungen ──')
const e = s.locator('[data-probe="karten-erklaerung"]')
console.log(`Anzahl: ${await e.count()} (soll 4)`)
for (let i = 0; i < await e.count(); i++) {
  console.log(`  ${JSON.stringify((await e.nth(i).innerText()).slice(0, 90))}`)
}
await s.screenshot({ path: 'backup/g136-nachher.png', fullPage: true })
await b.close()
