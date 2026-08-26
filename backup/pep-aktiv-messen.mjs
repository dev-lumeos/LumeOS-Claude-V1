// Greift `:active` wirklich? Das Standbild kann es nicht zeigen.
//
// Gemessen wird die berechnete `transform`, waehrend der Knopf
// gedrueckt ist — nicht die Quelle, nicht die CSS-Regel, sondern was
// der Browser daraus macht.
//
// `[read]` Zwei Wege, weil der erste allein truegen kann: die Maus
// kann ein Element verfehlen, das unter einem anderen liegt.
// `CSS.forcePseudoState` (CDP) fragt den Browser direkt.
//
// Aufruf: node backup/pep-aktiv-messen.mjs
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://127.0.0.1:3200'
const KONTO = 'dev@lumeos.app'

const b = await chromium.launch()
const s = await b.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'no-preference',
})
const p = await s.newPage()

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type="email"]', KONTO)
await p.fill('input[type="password"]', wortFuer(KONTO))
await p.click('button[type="submit"]')
await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })

await p.goto(`${BASIS}/v2/supplements?tab=stack`, { waitUntil: 'networkidle' })

// Ein Knopf IM Seiteninhalt, nicht in der Topbar.
const WAHL = '.v2-content .v2-btn'
const knopf = p.locator(WAHL).first()
await knopf.waitFor({ state: 'visible', timeout: 15000 })
await knopf.scrollIntoViewIfNeeded()

const ruhe = await knopf.evaluate(e => getComputedStyle(e).transform)

// Weg 1: echt druecken und halten.
const kasten = await knopf.boundingBox()
await p.mouse.move(kasten.x + kasten.width / 2, kasten.y + kasten.height / 2)
await p.mouse.down()
await p.waitForTimeout(200)
const maus = await knopf.evaluate(e => getComputedStyle(e).transform)
await p.mouse.up()
await p.waitForTimeout(250)
const danach = await knopf.evaluate(e => getComputedStyle(e).transform)

// Weg 2: den Zustand erzwingen, an der Maus vorbei.
const cdp = await s.newCDPSession(p)
await cdp.send('DOM.enable')
await cdp.send('CSS.enable')
const { root } = await cdp.send('DOM.getDocument')
const { nodeId } = await cdp.send('DOM.querySelector', {
  nodeId: root.nodeId, selector: WAHL,
})
await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['active'] })
const erzwungen = await knopf.evaluate(e => getComputedStyle(e).transform)
await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] })

const skel = await p.evaluate(() => {
  const e = document.createElement('div')
  e.className = 'v2-skel v2-skel-hero'
  document.body.appendChild(e)
  const h = getComputedStyle(e).height
  e.remove()
  return h
})

console.log(JSON.stringify({
  knopf: (await knopf.innerText()).trim().slice(0, 30),
  transitionProperty: await knopf.evaluate(e => getComputedStyle(e).transitionProperty),
  ruhe,
  per_maus: maus,
  per_cdp_erzwungen: erzwungen,
  nach_loslassen: danach,
  greift: ruhe !== erzwungen,
  kehrt_zurueck: danach === ruhe,
  skelett_hero_hoehe: skel,
  reduzierte_bewegung: await p.evaluate(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches),
}, null, 2))

await b.close()
