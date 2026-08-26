// G-184: der WADA-Block am Bild, vier Substanzen.
//
// Aufruf: node backup/g184-schuss.mjs <breite> <substanz> <ziel>
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BREITE = Number(process.argv[2] ?? 1280)
const SUBSTANZ = process.argv[3] ?? 'Creatine monohydrate'
const ZIEL = process.argv[4] ?? `backup/g184-${BREITE}.png`
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'

const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: BREITE, height: 1000 } })
const p = await s.newPage()
const fehler = []
p.on('console', m => { if (m.type() === 'error') fehler.push(m.text().slice(0, 70)) })

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type="email"]', KONTO)
await p.fill('input[type="password"]', wortFuer(KONTO))
await p.click('button[type="submit"]')
await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })

await p.goto(`${BASIS}/v2/supplements?tab=database`, { waitUntil: 'networkidle' })

const suche = p.locator('.v2-supp-suche input, input[type="search"]').first()
await suche.waitFor({ state: 'visible', timeout: 20000 })
await suche.fill(SUBSTANZ)
await p.waitForTimeout(800)

const zeile = p.locator('tbody tr', { hasText: SUBSTANZ }).first()
await zeile.waitFor({ state: 'visible', timeout: 20000 })
await zeile.click()
await p.waitForTimeout(1000)

const block = p.locator('.v2-supp-wada-block').first()
const da = await block.count() > 0

let mass = null
if (da) {
  await block.scrollIntoViewIfNeeded()
  mass = await block.evaluate(e => {
    const r = e.getBoundingClientRect()
    const t = e.closest('.v2-supp-tafel')
    const tr = t ? t.getBoundingClientRect() : null
    const abs = getComputedStyle(e)
    const txt = e.querySelector('.v2-supp-wada-text')
    // Laengste sichtbare Zeile in Zeichen — der Messwert aus G-181.
    // `[read]` **Gemessen, nicht geschaetzt.** Die erste Fassung
    // rechnete `Breite / (Schriftgrad × 0.5)` und kam auf 94 Zeichen,
    // wo das Bild rund 78 zeigt. Jetzt wird die laengste TATSAECHLICH
    // gesetzte Zeile ueber Range-Rechtecke ermittelt.
    let zeichenProZeile = null
    if (txt && txt.firstChild) {
      const r = document.createRange()
      const s = txt.textContent
      let max = 0, zeilen = 1, start = 0
      let letzteOben = null
      for (let i = 1; i <= s.length; i++) {
        r.setStart(txt.firstChild, i - 1)
        r.setEnd(txt.firstChild, i)
        const oben = Math.round(r.getBoundingClientRect().top)
        if (letzteOben !== null && oben !== letzteOben) {
          max = Math.max(max, i - 1 - start)
          start = i - 1
          zeilen++
        }
        letzteOben = oben
      }
      max = Math.max(max, s.length - start)
      zeichenProZeile = max
      e.dataset.zeilen = String(zeilen)
    }
    return {
      breite: Math.round(r.width),
      maxWidth: abs.maxWidth,
      zeichenProZeile,
      beschnitten: tr ? (r.right > tr.right + 1 || r.left < tr.left - 1) : false,
      ueberlauf: e.scrollWidth > e.clientWidth + 1,
      ton: e.getAttribute('data-ton'),
      zeilen: Number(e.dataset.zeilen || 0),
      text: (txt ? txt.textContent : '').trim(),
    }
  })
}

await p.screenshot({ path: ZIEL, fullPage: false })

console.log(JSON.stringify({
  breite: BREITE, substanz: SUBSTANZ, ziel: ZIEL,
  block_da: da,
  ...(mass ? {
    block_breite: mass.breite, max_width: mass.maxWidth,
    zeichen_je_zeile: mass.zeichenProZeile, zeilen: mass.zeilen,
    beschnitten: mass.beschnitten, ueberlauf: mass.ueberlauf,
    ton: mass.ton, zeichen: mass.text.length,
    anfang: mass.text.slice(0, 80),
  } : {}),
  konsolenfehler: fehler.length,
}, null, 2))

await b.close()
