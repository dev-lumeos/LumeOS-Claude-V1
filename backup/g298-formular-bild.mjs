// Ein Bild des offenen Formulars — der Nachweis „je Position".
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'

const browser = await chromium.launch()
const seite = await browser.newPage({ viewport: { width: 1280, height: 1000 } })

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await seite.fill('input[type="email"]', KONTO)
await seite.fill('input[type="password"]', wortFuer(KONTO))
await seite.click('button[type="submit"]')
await seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 30000 })

await seite.goto(`${BASIS}/v2/nutrition?tab=planner`, { waitUntil: 'networkidle' })
await seite.waitForTimeout(1200)

const zelle = seite.locator('.v2-planner-zelle').first()
await zelle.hover()
await zelle.locator('button[aria-label^="Eintrag hinzufügen"]').click()
await seite.waitForTimeout(500)

const karte = seite.locator('.v2-card').filter({ hasText: 'Aufbau' }).first()
const ziel = await karte.count() > 0 ? karte : seite.locator('.v2-card').first()
await ziel.screenshot({ path: 'backup/g298-formular.png' })
console.log('Bild: backup/g298-formular.png')

const text = await zelle.innerText()
console.log('--- Zellinhalt mit offenem Formular ---')
console.log(text.replace(/\s+\n/g, '\n').slice(0, 400))

await browser.close()
