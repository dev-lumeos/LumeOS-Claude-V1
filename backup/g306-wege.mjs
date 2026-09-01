// C-377: jeden der drei Wege einmal gehen.
//
// `[read]` **Der Auftrag verlangt es: *,,jeder gegangen"*.**
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'
const WEG = process.argv[2] ?? 'neu_starten'
const TEXT = {
  neu_starten: 'Denselben Plan neu starten',
  anderer_plan: 'Einen anderen Plan aktivieren',
  ohne_plan: 'Ohne Plan weitermachen',
}[WEG]

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1400, height: 1200 } })
const netz = []
seite.on('response', r => {
  if (r.url().includes('/api/nutrition/plan')) netz.push(r.status())
})

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })
await seite.goto(`${BASIS}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1400)

const frage = await seite.getByText('Dieser Plan ist abgelaufen').count()
console.log(`Ablauffrage sichtbar: ${frage > 0}`)
if (frage === 0) { await browser.close(); process.exit(1) }

await seite.getByRole('button', { name: new RegExp(TEXT) }).first().click()
await seite.waitForTimeout(400)
await seite.getByRole('button', { name: 'Übernehmen' }).click()
await seite.waitForTimeout(2600)

console.log(`Weg „${TEXT}" -> HTTP ${netz.join(', ') || '(keine Anfrage)'}`)
const nachher = await seite.locator('body').innerText()
const zeile = nachher.split('\n').find(z => z.includes('G-306 Browserprobe')) ?? ''
console.log(`Karte danach: ${zeile.trim().slice(0, 80)}`)
console.log(`Frage noch da: ${await seite.getByText('Dieser Plan ist abgelaufen').count() > 0}`)

await browser.close()
