// G-473 — Chromium selbst fragen, warum der Renderer starb.
// [read] Mit --enable-logging=stderr --v=1 schreibt Chromium den
// Grund (OOM, SIGSEGV, "Check failed" …) auf stderr des Browsers.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3251'
const ZIEL = '/' + (process.argv[2] ?? 'v2').replace(/^\/+/, '')
const b = await chromium.launch({
  headless: true,
  args: ['--enable-logging=stderr', '--v=1', '--disable-crash-reporter'],
})
const k = await b.newContext()
const s = await k.newPage()
let abgestuerzt = false
s.on('crash', () => { abgestuerzt = true })
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await s.fill('input[type=email]', 'dev@lumeos.app')
await s.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await s.click('button[type=submit]')
await s.waitForTimeout(5000)
s.goto(`${BASIS}${ZIEL}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
  .catch(() => {})
for (let i = 0; i < 40 && !abgestuerzt; i++) await new Promise(r => setTimeout(r, 150))
await new Promise(r => setTimeout(r, 1500))
console.log('ABGESTUERZT=' + abgestuerzt)
await b.close().catch(() => {})
