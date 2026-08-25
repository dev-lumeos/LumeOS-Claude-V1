// G-181: die Kachelbreiten bei 1280 und 1920 — und die Zeilenlaenge.
//
// `[read]` **Der Messwert ist die Zeilenlaenge in Zeichen**, nicht die
// Pixelbreite: eine Kachel darf breit sein, ein Textabsatz nicht.
// Ueber 90 Zeichen je Zeile wird Fliesstext muehsam.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const NAME = process.env.LUMEOS_NAME ?? 'Creatine monohydrate'

const browser = await chromium.launch()

/** Zeichen je Zeile: Breite geteilt durch die Breite eines Zeichens. */
const MESSUNG = `(() => {
  const aus = { zahl: [], text: [], satz: null, zeilen: null }
  for (const k of document.querySelectorAll('.v2-supp-zahl-kachel')) {
    aus.zahl.push(Math.round(k.getBoundingClientRect().width))
  }
  for (const k of document.querySelectorAll('.v2-supp-textkachel')) {
    aus.text.push(Math.round(k.getBoundingClientRect().width))
  }
  const s = document.querySelector('.v2-supp-erster-satz')
  if (s) aus.satz = Math.round(s.getBoundingClientRect().width)
  // Die laengste gerenderte Zeile in Zeichen — ueber alle Absaetze
  // der Tafel, per Bereichsmessung Zeile fuer Zeile.
  let max = 0
  for (const p of document.querySelectorAll('.v2-supp-tafel p')) {
    const knoten = p.firstChild
    if (!knoten || knoten.nodeType !== 3) continue
    const text = knoten.textContent
    const r = document.createRange()
    let start = 0, letzteOben = null
    for (let i = 0; i <= text.length; i++) {
      r.setStart(knoten, Math.min(i, text.length))
      r.setEnd(knoten, Math.min(i + 1, text.length))
      const box = r.getBoundingClientRect()
      if (letzteOben === null) letzteOben = box.top
      if (box.top > letzteOben + 2 || i === text.length) {
        max = Math.max(max, i - start)
        start = i
        letzteOben = box.top
      }
    }
  }
  aus.zeilen = max
  return aus
})()`

for (const breite of [1280, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 1100 } })
  const seite = await ctx.newPage()
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.fill('input[type=email]', KONTO)
  await seite.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ])
  await seite.goto(`${BASIS}/v2/supplements?tab=database`,
    { waitUntil: 'networkidle', timeout: 90_000 })
  await seite.waitForTimeout(2000)
  await seite.locator(`.v2-tbl tbody tr:has-text("${NAME}")`).first().click()
  await seite.waitForSelector('.v2-supp-tafel', { timeout: 30_000 })
  await seite.waitForTimeout(900)

  const d = await seite.evaluate(MESSUNG)
  const hoehe = await seite.evaluate(() => {
    const h = document.querySelector('.v2-supp-tbl-wrap')
    return { behaelter: h.clientHeight, fenster: window.innerHeight }
  })
  console.log(`\n=== Fensterbreite ${breite} ===`)
  console.log(`  Zahlenkacheln : ${d.zahl.join(' · ') || '(keine)'} px`)
  console.log(`  Textkacheln   : ${d.text.join(' · ') || '(keine)'} px`)
  console.log(`  erster Satz   : ${d.satz ?? '—'} px`)
  console.log(`  laengste Zeile: ${d.zeilen} Zeichen`)
  console.log(`  Liste         : ${hoehe.behaelter} px von ${hoehe.fenster}`)
  await ctx.close()
}

await browser.close()
