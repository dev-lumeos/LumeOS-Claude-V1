// G-455 — Rauchprobe und Messung.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const ZIEL = '/' + (process.argv[2] ?? 'v2/settings').replace(/^\/+/, '')
const FOTO = process.argv[3] ?? null
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
const fehler = []
s.on('pageerror', e => fehler.push('PAGEERROR: ' + e.message.slice(0, 200)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
const r = await s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const m = await s.evaluate(() => ({
  kachel: !!document.querySelector('.v2-allergie-form'),
  zeilen: Array.from(document.querySelectorAll('.v2-allergie-zeile'))
    .map(z => ({
      stoff: z.querySelector('.v2-allergie-stoff')?.textContent.trim(),
      // G-459/A8: die Reichweite je Zeile — ungekuerzt, denn 56.948
      // ist genau die Zahl, an der ein PostgREST-Deckel auffiele.
      reichweite: z.querySelector('.v2-allergie-reichweite')?.textContent.trim(),
    })),
  leerhinweis: document.body.textContent.includes('LumeOS leitet keine ab'),
}))
if (FOTO) {
  // Die Kachel ins Bild holen — sie steht unter dem Profilformular.
  await s.locator('.v2-allergie-form').first()
    .scrollIntoViewIfNeeded({ timeout: 15000 }).catch(() => {})
  await s.waitForTimeout(600)
  await s.screenshot({ path: FOTO })
}
console.log(JSON.stringify({ ziel: ZIEL, status: r?.status(), ...m, fehler }, null, 2))
await b.close()
