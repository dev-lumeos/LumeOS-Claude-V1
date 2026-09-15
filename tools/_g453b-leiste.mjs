// G-453 (Nachtrag) — die foodsdb-Leiste, gemessen und fotografiert.
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
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2500)
const fuss = () => s.evaluate(() => document.body.textContent.match(/[\d.]+ von [\d.]+ geladen/)?.[0]
  ?? document.body.textContent.match(/[\d.]+ von [\d.]+ Treffern/)?.[0])

const zu = await s.evaluate(() => ({
  zeilen: document.querySelectorAll('.v2-tbl tbody tr').length,
  filterPanel: !!document.querySelector('.v2-supp-prod-filter'),
  eCodesSichtbar: (document.querySelector('.v2-tabinhalt')?.textContent?.match(/\[E\d+\]/g) ?? []).length,
  kategorien: Array.from(document.querySelectorAll('.v2-pill')).map(p=>p.textContent.trim()).filter(t=>/^\w.*\d/.test(t)).length,
}))
await s.screenshot({ path: 'backup/x-g453b-leiste-zu.png' })

// Filter aufklappen
await s.locator('button[aria-controls="v2-supp-prod-filter"]').click()
await s.waitForTimeout(800)
const auf = await s.evaluate(() => ({
  filterPanel: !!document.querySelector('.v2-supp-prod-filter'),
  gruppen: Array.from(document.querySelectorAll('.v2-supp-prod-filter .v2-eyebrow')).map(e=>e.textContent.trim()),
  markenfeld: !!document.querySelector('input[aria-label="Marke filtern"]'),
  pulldown: document.querySelectorAll('select[aria-label="Marke auswählen"] option').length,
  formen: Array.from(document.querySelectorAll('.v2-supp-prod-filter-reihe')).at(1)
    ?.textContent?.slice(0, 120),
  eCodesSichtbar: (document.querySelector('.v2-tabinhalt')?.textContent?.match(/\[E\d+\]/g) ?? []).length,
}))
await s.screenshot({ path: 'backup/x-g453b-filter-offen.png' })

const mess = await s.evaluate(() => {
  // ══ WARUM NICHT DIE FARBZEICHENKETTE GEPARST WIRD ═════════════════
  //
  // `[cmd]` **Ein erster Entwurf las `getComputedStyle().color` mit
  // einem `[\d.]+`-Muster.** Das Ergebnis war unbrauchbar: die Farben
  // stehen als `oklch(0.68 0.005 270)` da, und das Muster machte
  // daraus `rgb(0.68, 0.005, 270)` — der Hintergrund kam als
  // `rgb(1, 0, 0)`, also reines Rot, heraus. **Sieben von sieben
  // Proben fielen durch, und keine einzige Zahl war echt.**
  //
  // `[read]` **Deshalb rechnet der BROWSER um, nicht der Regex:**
  // die Farbe wird auf ein 1x1-Canvas gemalt, und ausgelesen werden
  // die Bildpunkte. **Was dabei herauskommt, ist das, was auf dem
  // Schirm steht** — unabhaengig davon, in welcher Schreibweise die
  // Farbe im Stylesheet stand.
  const flaeche = document.createElement('canvas')
  flaeche.width = flaeche.height = 1
  const stift = flaeche.getContext('2d', { willReadFrequently: true })
  function alsRgb(farbe) {
    stift.clearRect(0, 0, 1, 1)
    stift.fillStyle = '#000'
    stift.fillStyle = farbe
    stift.fillRect(0, 0, 1, 1)
    const d = stift.getImageData(0, 0, 1, 1).data
    return [d[0], d[1], d[2], d[3] / 255]
  }
  const lin = c => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  const verh = (f, h) => { const a = lum(f), b = lum(h); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }

  // Die WIRKSAME Hintergrundfarbe: die erste deckende in der
  // Elternkette. `[read]` **Halbdurchsichtige werden ueberblendet**,
  // nicht uebersprungen — eine Pille mit 10 % Farbe auf Weiss ergibt
  // einen anderen Hintergrund als Weiss.
  function hintergrundVon(el) {
    const stapel = []
    for (let n = el; n; n = n.parentElement) {
      const [r, g, b, a] = alsRgb(getComputedStyle(n).backgroundColor)
      if (a === 0) continue
      stapel.push([r, g, b, a])
      if (a >= 0.999) break
    }
    let unten = stapel.pop() ?? [255, 255, 255, 1]
    let [ur, ug, ub] = unten
    while (stapel.length) {
      const [r, g, b, a] = stapel.pop()
      ur = r * a + ur * (1 - a); ug = g * a + ug * (1 - a); ub = b * a + ub * (1 - a)
    }
    return [ur, ug, ub]
  }

  const tafel = document.querySelector('.v2-supp-prod-filter')
  if (!tafel) return { fehler: 'keine Filterleiste' }
  const proben = []
  const gesehen = new Set()
  for (const el of tafel.querySelectorAll('*')) {
    const txt = el.textContent?.trim() ?? ''
    if (!txt || el.children.length > 0) continue
    const st = getComputedStyle(el)
    const [vr, vg, vb, va] = alsRgb(st.color)
    const bg = hintergrundVon(el)
    // Halbdurchsichtige Schrift ueber ihren Hintergrund legen.
    const vorder = va >= 0.999 ? [vr, vg, vb]
      : [vr * va + bg[0] * (1 - va), vg * va + bg[1] * (1 - va), vb * va + bg[2] * (1 - va)]
    const groesse = parseFloat(st.fontSize)
    const gewicht = st.fontWeight
    const schl = `${st.color}|${groesse}|${gewicht}`
    if (gesehen.has(schl)) continue
    gesehen.add(schl)
    const gross = groesse >= 24 || (groesse >= 18.66 && Number(gewicht) >= 700)
    const v = Math.round(verh(vorder, bg) * 100) / 100
    proben.push({
      beispiel: txt.slice(0, 34),
      klasse: el.className || el.tagName.toLowerCase(),
      farbe: st.color,
      hintergrund: `rgb(${bg.map(x => Math.round(x)).join(', ')})`,
      px: groesse, gewicht,
      verhaeltnis: v,
      schwelle: gross ? 3 : 4.5,
      besteht: v >= (gross ? 3 : 4.5),
    })
  }
  proben.sort((a, b) => a.verhaeltnis - b.verhaeltnis)
  return { proben, faelle: proben.length, durchgefallen: proben.filter(p => !p.besteht).length }
})



// Formfilter setzen
const vorForm = await fuss()
await s.locator('.v2-supp-prod-filter button:has-text("Softgel Capsule")').first().click()
await s.waitForTimeout(2500)
const nachForm = await fuss()
await s.screenshot({ path: 'backup/x-g453b-formfilter.png' })

console.log(JSON.stringify({ zu, auf, vorForm, nachForm,
  kontrastLeiste: mess }, null, 2))
await b.close()
