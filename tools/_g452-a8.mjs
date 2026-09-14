// G-452/A8 — die zehn anderen Reiter, gemessen statt betrachtet.
// `[read]` Zeichen und Kacheln je Reiter; verglichen wird gegen den
// Stand VOR dem Einbau (`git stash`-frei: der Vergleich laeuft gegen
// die Zahlen, die dieser Lauf selbst schreibt).
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const REITER=['today','stack','extended','catalog','stacks','intel',
              'inventory','injection','compliance','interactions','cost']
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
const aus = {}
for (const r of REITER) {
  await s.goto(`${BASIS}/v2/supplements?tab=${r}`, { waitUntil: 'networkidle' })
  await s.waitForTimeout(1200)
  aus[r] = await s.evaluate(() => ({
    zeichen: document.querySelector('.v2-tabinhalt')?.textContent?.length ?? 0,
    kacheln: document.querySelectorAll('.v2-tabinhalt .v2-card').length,
  }))
}
console.log(JSON.stringify(aus, null, 2))
await b.close()
