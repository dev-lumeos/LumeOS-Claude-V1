// G-181: die fuenf Bilder des Nachweises.
//
// Liste zu · Tafel bei 1280 · Tafel bei 1920 · Enhanced · Liste bei
// kleiner Fensterhoehe.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'

const browser = await chromium.launch()

async function sitzung(breite, hoehe) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe } })
  const seite = await ctx.newPage()
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.fill('input[type=email]', KONTO)
  await seite.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
  return { ctx, seite }
}

async function zurListe(seite) {
  await seite.goto(`${BASIS}/v2/supplements?tab=database`,
    { waitUntil: 'networkidle', timeout: 90_000 })
  await seite.waitForTimeout(1800)
}

async function oeffne(seite, name) {
  await seite.locator(`.v2-tbl tbody tr:has-text("${name}")`).first().click()
  await seite.waitForSelector('.v2-supp-tafel', { timeout: 30_000 })
  await seite.waitForTimeout(900)
}

async function masse(seite) {
  return await seite.evaluate(() => {
    const h = document.querySelector('.v2-supp-tbl-wrap')
    const t = document.querySelector('.v2-supp-tafel')
    return {
      liste: h ? h.clientHeight : null,
      fenster: window.innerHeight,
      zahlkacheln: [...document.querySelectorAll('.v2-supp-zahl-kachel')]
        .map(e => Math.round(e.getBoundingClientRect().width)),
      textkacheln: [...document.querySelectorAll('.v2-supp-textkachel')]
        .map(e => Math.round(e.getBoundingClientRect().width)),
      tafel: t ? Math.round(t.closest('tr').getBoundingClientRect().height) : null,
    }
  })
}

// 1 · Liste zu, 1280
{
  const { ctx, seite } = await sitzung(1280, 1100)
  await zurListe(seite)
  await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g181-1-liste.png' })
  console.log('1 Liste zu (1280)   ', JSON.stringify(await masse(seite)))
  await ctx.close()
}

// 2 · Tafel offen, 1280
{
  const { ctx, seite } = await sitzung(1280, 1100)
  await zurListe(seite)
  await oeffne(seite, 'Creatine monohydrate')
  await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g181-2-tafel-1280.png' })
  console.log('2 Tafel 1280        ', JSON.stringify(await masse(seite)))
  await ctx.close()
}

// 3 · Tafel offen, 1920
{
  const { ctx, seite } = await sitzung(1920, 1100)
  await zurListe(seite)
  await oeffne(seite, 'Creatine monohydrate')
  await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g181-3-tafel-1920.png' })
  console.log('3 Tafel 1920        ', JSON.stringify(await masse(seite)))
  await ctx.close()
}

// 4 · Enhanced
{
  const { ctx, seite } = await sitzung(1440, 1100)
  await zurListe(seite)
  await oeffne(seite, '1-Testosterone')
  await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g181-4-enhanced.png' })
  console.log('4 Enhanced          ', JSON.stringify(await masse(seite)))
  await ctx.close()
}

// 5 · Kleine Fensterhoehe — waechst die Liste mit?
{
  const { ctx, seite } = await sitzung(1440, 720)
  await zurListe(seite)
  await seite.locator('.v2-supp-tbl-wrap').screenshot({ path: 'backup/g181-5-klein.png' })
  console.log('5 Fenster 720 hoch  ', JSON.stringify(await masse(seite)))
  await ctx.close()
}

await browser.close()
