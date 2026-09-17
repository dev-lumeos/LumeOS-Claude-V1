// G-473 — der Beleg: es ist der WECHSEL der Huelle.
//
// [cmd] Gemessen: Vorseite /login, /dashboard, /nutrition toeten den
// Uebergang nach /v2 — alle drei rendern die alte `AppShell`.
// Vorseite `/` und „keine Vorseite" ueberleben.
//
// [read] Aber `/` rendert `<DashboardView />` — also AUCH die alte
// Huelle? Diese Probe klaert das, indem sie im Reiter nachsieht,
// WELCHE Huelle auf der Vorseite stand.
import { chromium } from '@playwright/test'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const SEITEN = ['/login', '/', '/dashboard', '/nutrition', '/v2/dashboard']
const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
const aus = []
for (const p of SEITEN) {
  try {
    await s.goto(`${BASIS}${p}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await new Promise(r => setTimeout(r, 800))
    const x = await s.evaluate(() => ({
      // Die alte Huelle traegt `.lume-shell`, die v2-Huelle nicht.
      alteHuelle: !!document.querySelector('.lume-shell'),
      v2Huelle: !!document.querySelector('[class*="v2-"]'),
      wurzelKind: document.body.firstElementChild?.className?.slice(0, 60) ?? '',
    }))
    aus.push({ seite: p, ...x })
  } catch (e) {
    aus.push({ seite: p, fehler: String(e).slice(0, 100) })
  }
}
console.log(JSON.stringify(aus, null, 2))
await b.close().catch(() => {})
