// G-410/A2+A3: die acht Reiter fotografieren und den Text pruefen.
//
// `[cmd]` **A3: KEIN Spaltenname am Schirm.** `[read]` **Gemessen
// wird der GERENDERTE Text**, nicht der Quelltext — ein Spaltenname
// kann auch aus den Daten kommen.
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { wortFuer } from './konten.mjs'

const BASIS = 'http://localhost:3220'
const ZIEL = 'docs/bilder/g410/akte'
mkdirSync(ZIEL, { recursive: true })

// Die acht Reiter der Vorlage (`client-record.jsx:139`).
const REITER = ['Overview', 'Training', 'Nutrition', 'Recovery',
  'Supplements', 'Body', 'Medical', 'Timeline']

// A3: diese Zeichenfolgen duerfen im gerenderten Text NICHT vorkommen.
const VERBOTEN = ['_schnitt', '_g_', 'tage_mit', 'letzter_eintrag']

const browser = await chromium.launch()
const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1600, height: 1200 } })
const p = await ctx.newPage()
await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'coach@lumeos.app')
await p.fill('input[type=password]', wortFuer('coach@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })

// Wo die Akte steht: der Unterpunkt UND die Athletenseite.
const ORTE = [
  ['unterpunkt', '/?draft=athletes&kind=record'],
  ['athletseite', '/athlet/d15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6?draft=1'],
]

const zeilen = []
const treffer = []
for (const [ort, url] of ORTE) {
  await p.goto(BASIS + url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(300)

  for (const r of REITER) {
    await p.click(`.dk-modulwahl button:has-text("${r}")`)
    await p.waitForTimeout(220)
    const m = await p.evaluate(() => {
      const i = document.querySelector('.dp-inhalt')
      return {
        karten: i.querySelectorAll('.v2-card').length,
        kennzahlen: i.querySelectorAll('.dk-kennzahl').length,
        zeilen: i.querySelectorAll('.v2-row').length,
        balken: i.querySelectorAll('.v2-meter').length,
        vermerke: i.querySelectorAll('.dk-attrappe').length,
        text: i.innerText,
      }
    })
    if (ort === 'unterpunkt') {
      await p.screenshot({ path: `${ZIEL}/${r.toLowerCase()}.png` })
    }
    for (const v of VERBOTEN) {
      if (m.text.includes(v)) treffer.push(`${ort}/${r}: „${v}"`)
    }
    if (ort === 'unterpunkt') {
      zeilen.push({ reiter: r, karten: m.karten, kennzahlen: m.kennzahlen,
        zeilen: m.zeilen, balken: m.balken, vermerke: m.vermerke })
      console.log(`${r.padEnd(12)} Karten=${m.karten} Kennzahlen=${m.kennzahlen}`
        + ` Zeilen=${String(m.zeilen).padStart(2)} Balken=${m.balken} Vermerke=${m.vermerke}`)
    }
  }
}

console.log(`\nA3 — verbotene Zeichenfolgen im gerenderten Text: ${treffer.length}`)
for (const t of treffer.slice(0, 12)) console.log('   ' + t)

writeFileSync('docs/bilder/g410/akte.json', JSON.stringify({ zeilen, treffer }, null, 1))
await browser.close()
