// G-450 — wandert die Muskelfarbe mit dem Tageswechsler?
//
// `[read]` Gemessen wird die WIRKUNG: die Fuellfarbe des SVG-Pfades
// und der Zahlenwert in der Liste, nicht ein Klassenname.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const TAGE = process.argv.slice(2).filter(a => /^\d{4}-\d{2}-\d{2}$/.test(a))
const MUSKELN = (process.env.LUMEOS_MUSKELN ?? 'Biceps,Upper Back,Trapezius').split(',')

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}

const aus = []
for (const tag of TAGE) {
  await s.goto(`${BASIS}/v2/recovery?tab=muscles&datum=${tag}`,
               { waitUntil: 'networkidle' })
  await s.waitForTimeout(2200)
  const m = await s.evaluate(namen => {
    const text = document.querySelector('.v2-tabinhalt')?.textContent ?? ''
    // Je Muskel: die Zeile in der Liste und ihr Prozentwert.
    const werte = {}
    for (const n of namen) {
      // Die Liste fuehrt Name und Wert in benachbarten Zellen.
      const zeile = Array.from(document.querySelectorAll('tr,li,div'))
        .find(e => e.children.length <= 6
          && e.textContent?.trim().startsWith(n)
          && /\d+\s*%/.test(e.textContent ?? ''))
      werte[n] = zeile?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60) ?? null
    }
    return {
      etikett: Array.from(document.querySelectorAll('.v2-pill')).map(p=>p.textContent.trim()).filter(t=>/gemessen|angenommen|Trainingsdaten/.test(t))[0] ?? null,
      etikettText: (text.match(/Muskeln aus workout_sets[^|]{0,200}/) ?? [])[0] ?? null,
      bezugstag: (document.body.textContent.match(/gerechnet gegen den (\d{4}-\d{2}-\d{2})/) ?? [])[1] ?? null,
      zukunftshinweis: document.body.textContent.includes('liegt in der Zukunft'),
      werte,
      // Die Fuellfarben der Karte, gezaehlt — sie sind die Aussage.
      farben: (() => {
        const z = {}
        for (const p of document.querySelectorAll('svg path[fill]')) {
          const f = p.getAttribute('fill') ?? ''
          if (!f || f === 'none') continue
          z[f] = (z[f] ?? 0) + 1
        }
        return z
      })(),
    }
  }, MUSKELN)
  aus.push({ tag, ...m })
  await s.screenshot({ path: `backup/x-g450-tag-${tag}.png` })
}
console.log(JSON.stringify(aus, null, 2))
await b.close()
