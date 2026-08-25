// G-182: der Filterweg und die Bilder.
//
// Der Nachweis von Punkt 1 laeuft als Test — hier wird derselbe Weg
// zusaetzlich am laufenden Bild gefahren, weil Tom ihn so gegangen ist.
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

const zeilen = () => seite.$$eval('.v2-tbl tbody tr[aria-expanded]', t => t.length)

// ── Punkt 1: enhanced -> fatburner -> supplements ───────────────────
await zurListe()
console.log('=== Punkt 1: der Weg, den Tom gegangen ist ===')
console.log(`  Start                     ${await zeilen()} Zeilen`)

await seite.locator('.v2-pill', { hasText: 'Enhanced' }).first().click()
await seite.waitForTimeout(700)
console.log(`  nach „Enhanced"           ${await zeilen()} Zeilen`)

const fat = seite.locator('.v2-pill', { hasText: 'fatburner' }).first()
if (await fat.count()) {
  await fat.click()
  await seite.waitForTimeout(700)
  console.log(`  nach „fatburner"          ${await zeilen()} Zeilen`)
} else {
  console.log('  „fatburner" nicht in der Leiste — Kategorienamen pruefen')
}

await seite.locator('.v2-pill', { hasText: 'Supplements' }).first().click()
await seite.waitForTimeout(800)
const nachher = await zeilen()
const katAktiv = await seite.$$eval('.v2-pill[aria-pressed="true"]',
  ps => ps.map(p => p.textContent.trim()))
console.log(`  nach „Supplements"        ${nachher} Zeilen   (erwartet 182)`)
console.log(`  aktive Filter danach      ${JSON.stringify(katAktiv)}`)
await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g182-1-filter.png' })

// ── Punkt 1b: der Leer-Hinweis ──────────────────────────────────────
await zurListe()
await seite.fill('.v2-feld', 'zzzgibtesnicht')
await seite.waitForTimeout(800)
const leer = await seite.evaluate(() => {
  const t = document.querySelector('.v2-supp-tbl-wrap')?.textContent ?? ''
  return { hinweis: /Keine Substanz enthält/.test(t), knopf: /Filter zurücksetzen/.test(t) }
})
console.log(`\n=== Punkt 1b: 0 Treffer ===`)
console.log(`  Hinweis: ${leer.hinweis ? 'ja' : 'NEIN'}   Knopf: ${leer.knopf ? 'ja' : 'NEIN'}`)
await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g182-2-leer.png' })

// ── BPC-157 auf allen Reitern ───────────────────────────────────────
await zurListe()
await seite.locator('.v2-tbl tbody tr:has-text("BPC-157")').first().click()
await seite.waitForSelector('.v2-supp-tafel', { timeout: 30_000 })
await seite.waitForTimeout(800)
const namen = await seite.$$eval('.v2-supp-reiter-knopf',
  ks => ks.map(k => k.textContent.trim()))
console.log(`\n=== BPC-157: ${namen.length} Reiter — ${namen.join(' · ')} ===`)
for (let i = 0; i < namen.length; i++) {
  await seite.locator('.v2-supp-reiter-knopf').nth(i).click()
  await seite.waitForTimeout(600)
  const d = await seite.evaluate(() => {
    const t = document.querySelector('.v2-supp-tafel')
    return {
      objekt: (t.textContent ?? '').includes('[object Object]'),
      warn: (t.textContent ?? '').includes('Was nicht zurückkommt'),
      quellen: t.querySelectorAll('.v2-supp-quelle').length,
    }
  })
  console.log(`  ${namen[i].padEnd(14)} objekt:${d.objekt ? 'JA!' : 'nein'} `
    + `warn:${d.warn ? 'ja' : 'nein'} quellen:${d.quellen}`)
  await seite.locator('.v2-supp-tbl-wrap')
    .screenshot({ path: `backup/g182-3-bpc-${i + 1}.png` })
}

await browser.close()
