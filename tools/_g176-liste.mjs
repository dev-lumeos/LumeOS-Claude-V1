// G-176: was kosten 290 Zeilen im DOM — gegen 50?
//
// `[read]` Der Auftrag verlangt die Zahl VOR der Entscheidung. Blind
// entfernen waere so falsch wie blind behalten: 290 Zeilen koennen
// harmlos sein oder die Seite lahmlegen, und das entscheidet nicht die
// Zahl allein, sondern was je Zeile im DOM steht.
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

const start = Date.now()
await seite.goto(`${BASIS}/v2/supplements?tab=database`,
  { waitUntil: 'networkidle', timeout: 60_000 })
await seite.waitForTimeout(1500)
const geladen = Date.now() - start

const d = await seite.evaluate(() => {
  const zeilen = document.querySelectorAll('.v2-tbl tbody tr')
  const huelle = document.querySelector('.v2-supp-tbl-wrap')
  const text = (document.body.textContent ?? '').replace(/\s+/g, ' ')
  const fuss = text.match(/(\d+) von (\d+) (?:Treffern|Eintr)/)
  // Die letzte Zeile: erreichbar ohne Tippen?
  const letzte = zeilen.length ? zeilen[zeilen.length - 1] : null
  return {
    zeilenImDom: zeilen.length,
    knotenGesamt: document.querySelectorAll('*').length,
    fusszeile: fuss ? fuss[0] : '(keine)',
    huelleHoehe: huelle ? huelle.clientHeight : null,
    huelleScroll: huelle ? huelle.scrollHeight : null,
    scrollbar: huelle ? huelle.scrollHeight > huelle.clientHeight + 2 : false,
    letzterName: letzte
      ? (letzte.querySelector('td div')?.textContent ?? '').trim() : null,
  }
})

console.log(`Konto: ${KONTO}`)
console.log(`Ladezeit bis networkidle : ${geladen} ms`)
console.log(`Zeilen im DOM            : ${d.zeilenImDom}`)
console.log(`Knoten im Dokument       : ${d.knotenGesamt}`)
console.log(`Fusszeile                : ${d.fusszeile}`)
console.log(`Huelle sichtbar/scrollbar: ${d.huelleHoehe} / ${d.huelleScroll} px`
  + `  Rollbalken: ${d.scrollbar ? 'ja' : 'NEIN'}`)
console.log(`Letzte Zeile im DOM      : ${d.letzterName}`)

// Bis ganz nach unten rollen — ohne zu tippen.
const unten = await seite.evaluate(async () => {
  const h = document.querySelector('.v2-supp-tbl-wrap')
  if (!h) return null
  h.scrollTop = h.scrollHeight
  await new Promise(r => setTimeout(r, 700))
  const zeilen = document.querySelectorAll('.v2-tbl tbody tr')
  const letzte = zeilen[zeilen.length - 1]
  return {
    zeilen: zeilen.length,
    name: (letzte?.querySelector('td div')?.textContent ?? '').trim(),
    amEnde: Math.abs(h.scrollTop + h.clientHeight - h.scrollHeight) < 3,
  }
})
console.log()
console.log('Nach dem Rollen ans Ende, ohne Tippen:')
console.log(`  Zeilen ${unten?.zeilen}  letzte: ${unten?.name}  am Ende: ${unten?.amEnde}`)

await browser.close()
