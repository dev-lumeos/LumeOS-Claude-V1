// G-459/A1 — wo die Allergiekachel steht, GEMESSEN.
//
// Tom: „das kann eine kleinere kachel links neben erfahrungsgrad
// sein."
//
// [read] Gemessen wird die GEOMETRIE, nicht die Reihenfolge im
// Quelltext: `links neben` heisst, die rechte Kante der Kachel liegt
// links der linken Kante des Erfahrungsgrads UND die Hoehenbaender
// ueberschneiden sich. Eine Kachel darueber oder darunter erfuellt
// „links neben" nicht, steht im Quelltext aber genauso.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const FOTO = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : null

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
const fehler = []
s.on('pageerror', e => fehler.push('PAGEERROR: ' + e.message.slice(0, 200)))

await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
}
const r = await s.goto(`${BASIS}/v2/settings`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)

const m = await s.evaluate(() => {
  // [cmd] Ein erster Entwurf hangelte sich vom Textknoten nach oben,
  // bis ein Kasten groesser als 200x60 kam — und griff den WRAPPER
  // statt der Kachel: die Allergiekachel wurde bei x=773 gemeldet,
  // der Erfahrungsgrad bei x=264, also genau verkehrt herum.
  //
  // [read] `Card` rendert `.v2-card` mit `.v2-card-title` — danach
  // wird gesucht, nicht nach Groessen.
  function karte(titel) {
    for (const c of document.querySelectorAll('.v2-card')) {
      const t = c.querySelector(':scope > .v2-card-h > .v2-card-title')
      if (t && t.textContent.trim().startsWith(titel)) return c
    }
    return null
  }
  const kast = (n) => {
    if (!n) return null
    const r = n.getBoundingClientRect()
    return { links: Math.round(r.left), rechts: Math.round(r.right),
             oben: Math.round(r.top), unten: Math.round(r.bottom),
             breite: Math.round(r.width), hoehe: Math.round(r.height) }
  }
  const form = document.querySelector('.v2-allergie-form')
  if (!form) return { fehler: 'keine Allergiekachel' }
  const allergie = form.closest('.v2-card')
  const A = kast(allergie)
  const E = kast(karte('Erfahrungsgrad') ?? karte('Erfahrung'))
  const K = kast(karte('Körper'))
  const raster = allergie?.parentElement
  return {
    allergie: A, erfahrungsgrad: E, koerper: K,
    // „links neben": ganz links davon UND auf gleicher Hoehe.
    linksNeben: E && A ? A.rechts <= E.links + 2 : null,
    hoehenUeberschneidung: E && A
      ? Math.max(0, Math.min(A.unten, E.unten) - Math.max(A.oben, E.oben))
      : null,
    // „kleiner": schmaler als der Erfahrungsgrad bzw. als die Zeile.
    schmalerAlsErfahrung: E && A ? A.breite < E.breite : null,
    rasterSpalten: raster
      ? getComputedStyle(raster).gridTemplateColumns : null,
    rasterKinder: raster ? raster.children.length : null,
  }
});

if (FOTO) { await s.waitForTimeout(400); await s.screenshot({ path: FOTO, fullPage: true }) }
console.log(JSON.stringify({ status: r?.status(), ...m, fehler }, null, 2))
await b.close()
