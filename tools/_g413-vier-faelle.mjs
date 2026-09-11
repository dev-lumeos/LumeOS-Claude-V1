// G-413/A1 + A3 - die vier Faelle des Auftrags am Schirm.
//
// **Tom:** *„food db zeigt nichts mehr an, wenn nichts in der suche
// ist ... sprich: reine filtersuche geht nicht."*
//
// `[read]` **Jeder Fall wird EINZELN geladen**, damit keiner den
// naechsten beeinflusst.
//
// `[cmd]` **Auf die ANTWORT warten, nicht auf die Uhr** - mit einer
// festen Wartezeit las die Probe die Liste VOR der Antwort und
// meldete 50 Zeilen, wo 0 standen. **Ein falsches GRUEN.**
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const MARKE = process.argv[3] ?? 'vorher'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1200 } })
const p = await c.newPage()

const anfragen = []
p.on('request', r => {
  if (r.url().includes('/api/nutrition/foods')) anfragen.push(r.url().split('?')[1] ?? '')
})

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'dev@lumeos.app')
await p.fill('input[type=password]', wortFuer('dev@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

/** Was steht am Schirm? */
const lage = p => p.evaluate(() => {
  const txt = document.body.innerText
  // `[cmd]` **Gemessen: es gibt ZWEI Tabellen mit fast gleichem Kopf**
  // - die Trefferliste hat als einzige eine Spalte „ACTION".
  const tabelle = [...document.querySelectorAll('table')].find(t =>
    [...t.querySelectorAll('thead th')]
      .some(x => x.innerText.trim().toUpperCase() === 'ACTION'))
  const treffer = txt.match(/(Kein Lebensmittel[^\n]*|Deine Ern[^\n]*)/)
  return {
    zeilen: tabelle ? tabelle.querySelectorAll('tbody tr').length : -1,
    meldungText: treffer ? treffer[0] : null,
    erster: tabelle?.querySelector('tbody tr')?.innerText
      .replace(/\s+/g, ' ').slice(0, 44) ?? null,
  }
})

const faelle = []

async function fall(name, vorbereiten) {
  anfragen.length = 0
  await p.goto(`${ZIEL}/v2/nutrition?tab=foods`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)
  if (vorbereiten) {
    const antwort = p.waitForResponse(
      r => r.url().includes('/api/nutrition/foods'), { timeout: 10000 },
    ).catch(() => null)
    await vorbereiten(p)
    await antwort
  }
  await p.waitForTimeout(1200)
  const l = await lage(p)
  faelle.push({ name, ...l })
  console.log(`\n${name}`)
  console.log(`  Zeilen: ${l.zeilen}    erster: ${l.erster ?? '-'}`)
  if (l.meldungText) console.log(`  Meldung: ${l.meldungText}`)
  console.log(`  Netz:   ${anfragen.join('\n          ')}`)
  await p.screenshot({
    path: `docs/bilder/g413/${MARKE}-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`,
  })
}

// 1 - Food DB oeffnen, Suchfeld leer
await fall('1 leer', null)

// 2 - eine Kategorie waehlen, Feld leer.
// `[read]` **Zwei Kategorien, nicht eine** - `dev` ist vegan, und
// „Meat" hat dann RICHTIG null Treffer. **Die Frage ist, ob der
// Reiter das SAGT.**
await fall('2 kategorie erlaubt', async p => {
  await p.locator('button', { hasText: /^Produce$/ }).first().click()
})
await fall('2b kategorie ausgeschlossen', async p => {
  await p.locator('button', { hasText: /^Meat$/ }).first().click()
})

// 3 - einen Tag waehlen, Feld leer
await fall('3 tag', async p => {
  await p.click('button[aria-controls="v2-food-filter"]')
  await p.waitForTimeout(500)
  const knoepfe = p.locator('#v2-food-filter button')
  const n = await knoepfe.count()
  for (let i = 0; i < n; i++) {
    const t = (await knoepfe.nth(i).innerText()).trim()
    if (t && !/reset|close|schliessen|zurueck/i.test(t)) {
      console.log(`  (Tag gewaehlt: „${t.split('\n')[0]}")`)
      await knoepfe.nth(i).click()
      return
    }
  }
})

// 4 - ein Wort tippen, dann loeschen
await fall('4 wort und weg', async p => {
  const feld = p.locator('input[aria-label="Search foods"]')
  const ersteAntwort = p.waitForResponse(
    r => r.url().includes('q=tofu'), { timeout: 10000 }).catch(() => null)
  await feld.fill('tofu')
  await ersteAntwort
  // `[read]` **Erst loeschen, wenn „tofu" durch ist** - sonst misst
  // die Probe die Trefferliste des Wortes, nicht die danach.
  await feld.fill('')
})

console.log('\n-- URTEIL --')
// `[read]` **Ein Fall ist gut, wenn er Treffer zeigt ODER erklaert,
// warum keine da sind.** `[cmd]` **Auf einem veganen Konto ist „Meat"
// = 0 richtig** - nur darf der Satz nicht auf die Auswahl zeigen.
let schlecht = 0
for (const f of faelle) {
  const erklaert = /blenden|vorlieb/i.test(f.meldungText ?? '')
  const ok = f.zeilen > 0 || erklaert
  if (!ok) schlecht++
  console.log(`  ${f.zeilen > 0 ? 'TREFFER ' : erklaert ? 'ERKLAERT' : 'STUMM   '}  ${f.name}`)
}
console.log(`\n${schlecht} von ${faelle.length} scheitern.`)

await b.close()
