// G-409/A5: jedes der dreizehn Modale OEFFNEN und messen.
//
// `[read]` **Nicht den Knopf zaehlen** — den Kasten aufmachen.
// `[cmd]` Ein Knopf ohne Wirkung sieht aus wie einer mit (C-426).
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { wortFuer } from './konten.mjs'

const BASIS = 'http://localhost:3220'
const ZIEL = 'docs/bilder/g409/modale'
mkdirSync(ZIEL, { recursive: true })

// Je Modal eine Adresse, auf der es geoeffnet wird.
const MODALE = [
  ['alarm', '/?draft=alerts&kind=rules&modal=alarm&mid=AL-018'],
  ['einstellungen', '/?draft=team&modal=einstellungen'],
  ['regel', '/?draft=alerts&kind=rules&modal=regel&mid=r1'],
  ['teamEinladen', '/?draft=team&modal=teamEinladen'],
  ['teamMitglied', '/?draft=team&modal=teamMitglied&mid=tm2'],
  ['coach', '/?draft=analytics&kind=revenue&modal=coach&mid=c-train'],
  ['coachEinladen', '/?draft=calendar&modal=coachEinladen'],
  ['qr', '/?draft=calendar&modal=qr'],
  ['nachrichten', '/?draft=inbox&modal=nachrichten'],
  ['athlet', '/?draft=analytics&kind=patterns&modal=athlet&mid=a1'],
  ['notiz', '/?draft=athletes&kind=notes&modal=notiz&mid=n1'],
  ['neuerPlan', '/?draft=plans&modal=neuerPlan'],
  ['vorschlag', '/?draft=analytics&kind=revenue&modal=vorschlag'],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1600, height: 1100 } })
const p = await ctx.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 160)))

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'coach@lumeos.app')
await p.fill('input[type=password]', wortFuer('coach@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })

const zeilen = []
for (const [name, url] of MODALE) {
  await p.goto(BASIS + url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(300)
  const m = await p.evaluate(() => {
    const d = document.querySelector('.dk-modal')
    if (!d) return { offen: false }
    return {
      offen: true,
      titel: d.querySelector('.dk-modal-titel')?.textContent?.trim() ?? '',
      felder: d.querySelectorAll('.v2-row, .dk-kennzahl, .dk-kasten').length,
      knoepfe: d.querySelectorAll('.dk-modal-fuss .v2-btn, .dk-modal-fuss a').length,
      vermerk: d.querySelectorAll('.dk-attrappe').length,
    }
  })
  await p.screenshot({ path: `${ZIEL}/${name}.png` })
  zeilen.push({ name, ...m })
  console.log(`${name.padEnd(15)} offen=${m.offen}`,
    m.offen ? `Felder=${String(m.felder).padStart(2)} Knoepfe=${m.knoepfe} Vermerk=${m.vermerk} "${m.titel.slice(0, 34)}"` : '')
}

// Und: schliesst der Schliessen-Knopf wirklich?
await p.goto(`${BASIS}/?draft=team&modal=einstellungen`, { waitUntil: 'networkidle' })
const vorher = await p.evaluate(() => !!document.querySelector('.dk-modal'))
await p.click('.dk-modal-fuss .v2-btn')
await p.waitForTimeout(500)
const nachher = await p.evaluate(() => !!document.querySelector('.dk-modal'))
console.log(`\nSchliessen: offen=${vorher} -> offen=${nachher}`)

const auf = zeilen.filter(z => z.offen).length
console.log(`\nModale geprueft: ${zeilen.length} · geoeffnet: ${auf} · zu: ${zeilen.length - auf}`)
if (fehler.length) console.log('SEITENFEHLER:', fehler.slice(0, 3))
writeFileSync('docs/bilder/g409/modale.json', JSON.stringify(zeilen, null, 1))
await browser.close()
