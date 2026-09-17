// G-471 — den ABSTURZGRUND vom Browser selbst erfragen.
//
// [read] Chromium meldet ueber `Inspector.targetCrashed` und die
// Prozessverwaltung, WARUM ein Renderer starb. Ausserdem wird hier
// das Protokoll des Browsers selbst mitgeschrieben (`--enable-logging`).
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2').replace(/^\/+/, '')

const b = await chromium.launch({
  headless: true,
  args: ['--enable-logging=stderr', '--v=1'],
})
const k = await b.newContext()
const s = await k.newPage()
const ereignisse = []
let abgestuerzt = false
s.on('crash', () => { abgestuerzt = true; ereignisse.push('page.crash') })

const cdp = await k.newCDPSession(s)
await cdp.send('Inspector.enable').catch(() => {})
cdp.on('Inspector.targetCrashed', () => ereignisse.push('Inspector.targetCrashed'))
cdp.on('Inspector.detached', (e) => ereignisse.push('Inspector.detached: ' + (e.reason ?? '?')))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', 'dev@lumeos.app')
await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)

cdp.send('Page.navigate', { url: `${BASIS}${ZIEL}` }).catch(e =>
  ereignisse.push('navigate-fehler: ' + String(e).slice(0, 100)))
for (let i = 0; i < 30 && !abgestuerzt; i++) {
  await new Promise(r => setTimeout(r, 200))
}
console.log(JSON.stringify({ basis: BASIS, ziel: ZIEL, abgestuerzt, ereignisse }, null, 2))
await b.close().catch(() => {})
