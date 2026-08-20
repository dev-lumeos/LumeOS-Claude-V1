// Bildschirmfoto ohne Fenster, ueber das installierte Playwright.
//
// Anlass (Tom, 2026-08-20): Agenten starteten einen Bun-Browser fuer
// Bildschirmfotos, der auf jedem Aufruf ein Konsolenfenster oeffnete.
// Playwright liegt seit jeher im Repo (@playwright/test 1.41.2) samt
// chromium_headless_shell \u2014 es wurde nur nie benutzt.
//
// Aufruf:
//   node tools/schuss.mjs <pfad> <ziel.png> [--breite 1440] [--dunkel]
//
// Beispiel:
//   node tools/schuss.mjs /v2/nutrition backup/nutrition-1440.png
//   node tools/schuss.mjs /v2/nutrition backup/nutrition-375.png --breite 375 --dunkel
//
// Meldet sich selbst an (dev@lumeos.app) und wartet, bis die Seite steht.

import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const args = process.argv.slice(2)
const pfad = args[0] ?? '/v2/nutrition'
const ziel = resolve(args[1] ?? 'backup/schuss.png')
const breite = Number(args[args.indexOf('--breite') + 1]) || 1440
const dunkel = args.includes('--dunkel')

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const WORT = process.env.LUMEOS_WORT ?? 'LumeosDev2026'

const browser = await chromium.launch({ headless: true })
const kontext = await browser.newContext({
  viewport: { width: breite, height: 900 },
  colorScheme: dunkel ? 'dark' : 'light',
})
const seite = await kontext.newPage()

const fehler = []
seite.on('console', m => { if (m.type() === 'error') fehler.push(m.text()) })

try {
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })

  if (await seite.locator('input[type=email]').count()) {
    await seite.fill('input[type=email]', KONTO)
    await seite.fill('input[type=password]', WORT)
    await Promise.all([
      seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
      seite.click('button[type=submit]'),
    ])
  }

  await seite.goto(`${BASIS}${pfad}`, { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.waitForTimeout(1200)

  mkdirSync(dirname(ziel), { recursive: true })
  await seite.screenshot({ path: ziel, fullPage: true })

  const marken = await seite.locator('text=/Attrappe/i').count()
  const titel = await seite.title()

  console.log(JSON.stringify({
    ziel, pfad, breite, modus: dunkel ? 'dunkel' : 'hell',
    titel, attrappen: marken, konsolenfehler: fehler.length,
    fehler: fehler.slice(0, 5),
  }, null, 2))
} finally {
  await browser.close()
}
