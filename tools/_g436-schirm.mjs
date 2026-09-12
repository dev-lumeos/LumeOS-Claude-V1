// G-436 - die Ansicht am Schirm: A1, A3, A4, A5.
//
// `[read]` **Gemessen wird, was DASTEHT** - nicht, was der Quelltext
// verspricht. **Die drei Zustaende muessen am Schirm unterscheidbar
// sein, sonst sind es zwei.**
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'
const BILD = process.argv[4] ?? 'docs/bilder/g436/a1-nachher.png'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 2200 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 200)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

await p.goto(`${ZIEL}/v2/recovery?tab=muscles`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)

// ══ Die Zeilen tragen `data-muskelzeile` ════════════════════════
//
// `[read]` **Am Element ankern, nicht am Wortlaut** (die Lehre aus
// G-389/G-435).
const d = await p.evaluate(() => {
  const zeilen = [...document.querySelectorAll('[data-muskelzeile]')]
  const zustand = { wert: [], strich: [], grau: [], gruppe: [] }
  const stufen = {}

  for (const z of zeilen) {
    const name = z.getAttribute('data-muskelzeile')
    const txt = (z.textContent ?? '').replace(/\s+/g, ' ')
    const pl = Math.round(parseFloat(getComputedStyle(z).paddingLeft))
    ;(stufen[pl] ??= []).push(name)

    if (/Ø \d+%/.test(txt)) zustand.gruppe.push(`${name}: ${txt.slice(0, 58)}`)
    else if (/\d+%/.test(txt)) zustand.wert.push(`${name}: ${txt.slice(0, 44)}`)
    else if (txt.includes('kein Volumen zugeordnet')) zustand.strich.push(name)
    else if (txt.includes('nicht gezeichnet')) zustand.grau.push(name)
  }

  // Sind „--" und „grau" WIRKLICH verschieden? Farbe messen.
  const farbe = (sel) => {
    const el = [...document.querySelectorAll('[data-muskelzeile]')]
      .find(z => (z.textContent ?? '').includes(sel))
    return el ? getComputedStyle(el).color : null
  }

  return {
    zeilen: zeilen.length,
    zustand: Object.fromEntries(Object.entries(zustand).map(([k, v]) => [k, v.length])),
    bsp: {
      gruppe: zustand.gruppe.slice(0, 3),
      wert: zustand.wert.slice(0, 3),
      strich: zustand.strich.slice(0, 3),
      grau: zustand.grau.slice(0, 3),
    },
    stufen: Object.fromEntries(Object.entries(stufen)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([k, v]) => [k, v.length])),
    farbeStrich: farbe('kein Volumen zugeordnet'),
    farbeGrau: farbe('nicht gezeichnet'),
    // A4: gibt es irgendwo einen Aufklapper?
    aufklapper: document.querySelectorAll('details, [aria-expanded]').length,
  }
})

console.log('\n=== Per-muscle detail: die Hierarchie ===\n')
console.log(`  Zeilen gesamt     ${d.zeilen}`)
console.log(`  Einrueckung       ${JSON.stringify(d.stufen)}`)
console.log(`\n  DIE DREI ZUSTAENDE (+ Gruppen):`)
console.log(`    Gruppe (Ø)      ${String(d.zustand.gruppe).padStart(3)}   ${d.bsp.gruppe[0] ?? ''}`)
console.log(`    Wert            ${String(d.zustand.wert).padStart(3)}   ${d.bsp.wert.join(' | ')}`)
console.log(`    „--" kein Vol.  ${String(d.zustand.strich).padStart(3)}   ${d.bsp.strich.join(', ')}`)
console.log(`    grau            ${String(d.zustand.grau).padStart(3)}   ${d.bsp.grau.join(', ')}`)
console.log(`\n  Farbe „--"        ${d.farbeStrich}`)
console.log(`  Farbe grau        ${d.farbeGrau}`)
console.log(`  -> unterscheidbar ${d.farbeStrich !== d.farbeGrau ? 'JA (Farbe)' : 'nur ueber den Text'}`)
console.log(`\n  A4 Aufklapper     ${d.aufklapper}  ${d.aufklapper === 0 ? '-> immer offen' : '-> ZUSTAND VORHANDEN'}`)

await p.screenshot({ path: BILD, fullPage: true })
console.log(`\n  Bild: ${BILD}`)
console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()

// ── A4: WO sitzen die Aufklapper? ───────────────────────────────
//
// `[read]` **Eine Zahl ohne Ort ist kein Befund** - liegen sie in
// der Kachel oder woanders auf der Seite?
const b2 = await chromium.launch()
const c2 = await b2.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 2200 } })
const p2 = await c2.newPage()
await p2.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p2.fill('input[type=email]', KONTO)
await p2.fill('input[type=password]', wortFuer(KONTO))
await p2.click('button[type=submit]')
await p2.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })
await p2.goto(`${ZIEL}/v2/recovery?tab=muscles`, { waitUntil: 'networkidle' })
await p2.waitForTimeout(1600)
const orte = await p2.evaluate(() => [...document.querySelectorAll('details, [aria-expanded]')]
  .map(e => {
    const inZeile = !!e.closest('[data-muskelzeile]')
    const karte = e.closest('div')?.textContent?.slice(0, 40) ?? ''
    return { tag: e.tagName, inHierarchie: inZeile, umfeld: karte.replace(/\s+/g, ' ') }
  }))
console.log('\n  Aufklapper im Einzelnen:')
for (const o of orte) console.log(`    ${o.tag}  in der Hierarchie: ${o.inHierarchie}  „${o.umfeld}"`)
await b2.close()

// ── Wie LANG ist die Kachel? ────────────────────────────────────
//
// **Auftrag:** *„wenn es zu lang wird: melden, nicht kuerzen."*
// `[read]` **Also gemessen, nicht geschaetzt.**
const b3 = await chromium.launch()
const c3 = await b3.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1200 } })
const p3 = await c3.newPage()
await p3.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p3.fill('input[type=email]', KONTO)
await p3.fill('input[type=password]', wortFuer(KONTO))
await p3.click('button[type=submit]')
await p3.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })
await p3.goto(`${ZIEL}/v2/recovery?tab=muscles`, { waitUntil: 'networkidle' })
await p3.waitForTimeout(1600)
const masse = await p3.evaluate(() => {
  const z = document.querySelector('[data-muskelzeile]')
  const kachel = z?.closest('.v2-card') ?? z?.parentElement?.parentElement
  const alle = [...document.querySelectorAll('[data-muskelzeile]')]
  const oben = Math.min(...alle.map(e => e.getBoundingClientRect().top + scrollY))
  const unten = Math.max(...alle.map(e => e.getBoundingClientRect().bottom + scrollY))
  return {
    kachel: kachel ? Math.round(kachel.getBoundingClientRect().height) : null,
    liste: Math.round(unten - oben),
    seite: Math.round(document.documentElement.scrollHeight),
    schirm: window.innerHeight,
  }
})
console.log(`\n  Kachelhoehe       ${masse.kachel} px`)
console.log(`  nur die Liste     ${masse.liste} px  (105 Zeilen)`)
console.log(`  ganze Seite       ${masse.seite} px, Schirm ${masse.schirm} px`)
console.log(`  -> Bildschirme    ${(masse.seite / masse.schirm).toFixed(1)}x`)
await b3.close()
