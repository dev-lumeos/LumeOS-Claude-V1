import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'
const b = await chromium.launch()
const s = await b.newPage({ viewport: { width: 1440, height: 2400 } })
await s.goto('http://127.0.0.1:3200/login', { waitUntil: 'networkidle' })
await s.fill('input[type="email"]', 'dev@lumeos.app')
await s.fill('input[type="password"]', wortFuer('dev@lumeos.app'))
await s.click('button[type="submit"]')
await s.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

async function lage(url, marke) {
  await s.goto(url, { waitUntil: 'networkidle' })
  await s.waitForTimeout(2600)
  const t = await s.locator('body').innerText()
  const z = t.split('\n').map(x => x.trim()).filter(Boolean)
  const nimm = (was, n = 3) => {
    const i = z.findIndex(x => x.includes(was))
    return i < 0 ? `${was}: —` : `${was}: ${z.slice(i, i + n).join(' · ')}`
  }
  console.log(`\n── ${marke} ──`)
  console.log('  ' + nimm('Tag ', 2))
  console.log('  ' + nimm('7-day compliance', 3))
  console.log('  ' + nimm('Plan settings', 6))
  console.log('  ' + nimm('Lifecycle types', 3))
  // Die Bibliothek unten: welche Kacheln, welcher ist "In der Werkbank"?
  const kacheln = await s.locator('.v2-g-cols-3 .v2-card').allInnerTexts()
  console.log(`  Bibliothek: ${kacheln.length} Kacheln`)
  kacheln.slice(0, 4).forEach(k => console.log(`     ${JSON.stringify(k.split('\n')[0])}`))
  return t
}

const a = await lage('http://127.0.0.1:3200/v2/nutrition?tab=plans', 'Meal plans OHNE ?plan=')
const b2 = await lage('http://127.0.0.1:3200/v2/nutrition?tab=plans&plan=af1e7288-8f74-4b5e-a226-f9d5eedc1410', 'Meal plans MIT ?plan=Buddy')
console.log(`\nText identisch: ${a === b2 ? 'JA' : 'NEIN'}`)
await b.close()
