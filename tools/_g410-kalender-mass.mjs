// G-410/A1: die Masse des Kalenders am Schirm gegen die Vorlage.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const B = 'http://localhost:3220'
const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1600, height: 1100 } })
const p = await c.newPage()
await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'coach@lumeos.app')
await p.fill('input[type=password]', wortFuer('coach@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })
await p.goto(`${B}/?draft=calendar`, { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
const m = await p.evaluate(() => {
  const kal = document.querySelector('.dk-kal')
  const zellen = [...document.querySelectorAll('.dk-kal-zelle')]
  const z = zellen[0]
  const striche = [...document.querySelectorAll('.dk-kal-strich')]
  const cs = getComputedStyle(z)
  return {
    spalten: getComputedStyle(kal).gridTemplateColumns,
    rasterSpalten: getComputedStyle(document.querySelector('.dk-kal-raster')).gridTemplateColumns.split(' ').length,
    zellen: zellen.length,
    zellenHoehe: Math.round(z.getBoundingClientRect().height),
    minHeight: cs.minHeight,
    padding: cs.padding,
    radius: cs.borderRadius,
    wochentage: document.querySelectorAll('.dk-kal-wt').length,
    striche: striche.length,
    stricheHoehe: striche.length ? Math.round(striche[0].getBoundingClientRect().height) : 0,
    legende: document.querySelectorAll('.dk-kal-legende-eintrag').length,
    tageszeilen: document.querySelectorAll('.dk-kal-tageszeile').length,
    naechste: document.querySelectorAll('.dk-kal-naechste').length,
    mehr: document.querySelectorAll('.dk-kal-mehr').length,
  }
})
console.log(JSON.stringify(m, null, 1))
console.log('\nVorlage: 1.5fr/1fr · 7 Spalten · 35 Zellen · minHeight 62 · padding 6px')
console.log('         7 Wochentage · Strich 3px · Legende 5 · Upcoming 7')
await b.close()
