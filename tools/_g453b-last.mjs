// G-453/3 — was traegt statt Blaettern?
// `[cmd]` G-176 hat 566 Zeilen gemessen (4.713 Knoten, 3.270-3.494 ms)
// und geschrieben: „Wenn der Katalog einmal Tausende traegt, ist die
// Messung zu wiederholen." Hier ist die Wiederholung.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
// Die DOM-Last: wie teuer sind N Zeilen im Browser?
//  Die Zeilenform ist die ECHTE aus dem Reiter, nachgebaut mit
// derselben Zellenzahl — sonst maesse man eine leere Tabelle.
const aus = []
for (const n of [50, 200, 500, 1000, 2000]) {
  aus.push(await s.evaluate(anzahl => {
    const alt = document.getElementById('g453last')
    if (alt) alt.remove()
    const w = document.createElement('div')
    w.id = 'g453last'
    const t0 = performance.now()
    const tbl = document.createElement('table')
    tbl.className = 'v2-tbl'
    const tb = document.createElement('tbody')
    for (let i = 0; i < anzahl; i++) {
      const tr = document.createElement('tr')
      for (const txt of ['Gold Standard 100% Whey Chocolate', 'ON Optimum Nutrition',
                         'Powder', '32 Gram(s) [1 scoop]', 'Details']) {
        const td = document.createElement('td')
        td.textContent = txt
        tr.appendChild(td)
      }
      tb.appendChild(tr)
    }
    tbl.appendChild(tb)
    w.appendChild(tbl)
    document.body.appendChild(w)
    // Anstrich erzwingen, sonst misst man nur das Bauen.
    const hoehe = w.getBoundingClientRect().height
    const ms = Math.round(performance.now() - t0)
    const knoten = w.querySelectorAll('*').length
    w.remove()
    return { zeilen: anzahl, knoten, anstrichMs: ms, hoehePx: Math.round(hoehe) }
  }, n))
}
console.log(JSON.stringify(aus, null, 2))
await b.close()
