// G-180: die vier Bilder des Nachweises — und die Hoehe dazu.
//
// Liste zu · eine Zeile aufgeklappt · zweiter Reiter offen · ein
// Enhanced-Eintrag.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const seite = await ctx.newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
await seite.fill('input[type=email]', KONTO)
await seite.fill('input[type=password]', wortFuer(KONTO))
await Promise.all([
  seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
  seite.click('button[type=submit]'),
])

async function zurListe() {
  await seite.goto(`${BASIS}/v2/supplements?tab=database`,
    { waitUntil: 'networkidle', timeout: 90_000 })
  await seite.waitForTimeout(1800)
}

/** Hoehe der aufgeklappten Zeile gegen den Behaelter. */
async function hoehe() {
  return await seite.evaluate(() => {
    const t = document.querySelector('.v2-supp-tafel')
    if (!t) return null
    const tr = t.closest('tr')
    const h = document.querySelector('.v2-supp-tbl-wrap')
    return {
      zeile: Math.round(tr.getBoundingClientRect().height),
      behaelter: h.clientHeight,
      fenster: window.innerHeight,
      reiter: [...t.querySelectorAll('.v2-supp-reiter-knopf')]
        .map(b => b.textContent.trim()),
      kaesten: t.querySelectorAll('.v2-supp-kasten').length,
      karten: t.querySelectorAll('.v2-supp-form-karte').length,
      modale: document.querySelectorAll('[role=dialog]').length,
    }
  })
}

// ── 1 · Liste zu ────────────────────────────────────────────────────
await zurListe()
await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g180-1-liste.png' })
console.log('1 Liste zu           -> backup/g180-1-liste.png')

// ── 2 · Eine Zeile aufgeklappt ──────────────────────────────────────
await seite.locator('.v2-tbl tbody tr:has-text("Creatine monohydrate")').first().click()
await seite.waitForSelector('.v2-supp-tafel', { timeout: 30_000 })
await seite.waitForTimeout(900)
await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g180-2-offen.png' })
console.log('2 aufgeklappt        -> backup/g180-2-offen.png ',
  JSON.stringify(await hoehe()))

// ── 3 · Zweiter Reiter offen ────────────────────────────────────────
await seite.locator('.v2-supp-reiter-knopf', { hasText: 'Sicherheit' }).first().click()
await seite.waitForTimeout(700)
await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g180-3-reiter.png' })
console.log('3 zweiter Reiter     -> backup/g180-3-reiter.png',
  JSON.stringify(await hoehe()))

// ── 4 · Ein Enhanced-Eintrag ────────────────────────────────────────
await zurListe()
await seite.locator('.v2-tbl tbody tr:has-text("1-Testosterone")').first().click()
await seite.waitForSelector('.v2-supp-tafel', { timeout: 30_000 })
await seite.waitForTimeout(900)
await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g180-4-enhanced.png' })
console.log('4 Enhanced           -> backup/g180-4-enhanced.png',
  JSON.stringify(await hoehe()))

// ── 5 · Der Sammeleintrag mit seinen Formen als Karten ──────────────
await zurListe()
await seite.locator('.v2-tbl tbody tr:has-text("Magnesium")').first().click()
await seite.waitForSelector('.v2-supp-tafel', { timeout: 30_000 })
await seite.waitForTimeout(900)
await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g180-5-formen.png' })
console.log('5 Formen als Karten  -> backup/g180-5-formen.png',
  JSON.stringify(await hoehe()))

await browser.close()
