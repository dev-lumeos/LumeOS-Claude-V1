// G-459 — wie lange die Settings-Seite serverseitig braucht.
//
// [read] Die Trefferzahlen blaettern 57 Runden a 1.000 Zeilen
// (56.948 Treffer). Das kostet, und die Frage ist: wie viel?
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({ viewport:{width:1600,height:1100} })).newPage()
await s.goto('http://127.0.0.1:3200/login', { waitUntil:'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]','dev@lumeos.app')
  await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
const proben = []
for (let i = 0; i < 3; i++) {
  const t0 = Date.now()
  const r = await s.goto('http://127.0.0.1:3200/v2/settings', { waitUntil:'domcontentloaded' })
  proben.push({ lauf: i + 1, status: r?.status(), ms: Date.now() - t0 })
}
console.log(JSON.stringify(proben, null, 2))
await b.close()
