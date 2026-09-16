// G-459/A7 — die Kontraste der Allergiekachel, GEMESSEN.
//
// [read] Derselbe Messkern wie `_g453-kontrast.mjs`: der Browser malt
// die Farbe auf ein 1x1-Canvas und die Bildpunkte werden gelesen.
// [cmd] Ein Regex ueber `oklch(0.68 0.005 270)` gab in G-453 sieben
// falsche Zahlen aus sieben Proben.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const ZIEL = process.argv[2] ?? null

const b = await chromium.launch({ headless: true })
const k = await b.newContext({ viewport: { width: 1600, height: 1100 } })
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/settings`, { waitUntil: 'networkidle' })
await s.waitForTimeout(2000)
const form = s.locator('.v2-allergie-form').first()
await form.scrollIntoViewIfNeeded({ timeout: 15000 }).catch(()=>{})
// [read] Die Liste MUSS offen sein, sonst misst man die Vorschlaege
// nicht — und der geprueft-Satz erscheint erst nach einem Klick.
//
// [cmd] ES REICHT NICHT, EINEN ZUSTAND ZU MESSEN. Ein erster Lauf gab
// 4 Proben und 0 Durchfaller — aber weder der gruene „geprueft"-Satz
// noch die Kataloglucke standen auf dem Schirm. 0 von den falschen 4.
// [read] Deshalb werden DREI Zustaende nacheinander gemessen und ihre
// Proben zusammengelegt.
const feld = form.locator('input[aria-label="Stoff"]')
const artfeld = form.locator('select[aria-label="Art"]')

async function zustand(name, tun) {
  await tun()
  const p = await s.evaluate(messen)
  return (p.proben ?? []).map(x => ({ zustand: name, ...x }))
}

function messen() {
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

  const wurzeln = [
    document.querySelector('.v2-allergie-form'),
    document.querySelector('.v2-allergie-vorschlaege'),
  ].filter(Boolean)
  if (!wurzeln.length) return { fehler: 'keine Kachel gefunden' }
  const proben = []
  const gesehen = new Set()
  const knoten = wurzeln.flatMap(w => [w, ...w.querySelectorAll('*')])
  for (const el of knoten) {
    const txt = el.textContent?.trim() ?? ''
    // [cmd] Hier stand `el.children.length > 0` — und genau daran
    // fielen die zwei Saetze aus, um die es in diesem Auftrag geht:
    // der gruene „geprueft"-Satz und die Kataloglucke tragen je ein
    // <Icon> als Kind. Sie wurden NIE gemessen, und der Lauf meldete
    // trotzdem „0 durchgefallen".
    //
    // [read] Richtig ist: EIGENER Text zaehlt, nicht Kinderlosigkeit.
    // Ein Knoten mit Kind UND eigenem Textknoten faerbt diesen Text
    // selbst — er gehoert gemessen.
    const eigen = Array.from(el.childNodes)
      .filter(n => n.nodeType === 3).map(n => n.textContent.trim())
      .join(' ').trim()
    if (!eigen) continue
    const st = getComputedStyle(el)
    const [vr, vg, vb, va] = alsRgb(st.color)
    const bg = hintergrundVon(el)
    // Halbdurchsichtige Schrift ueber ihren Hintergrund legen.
    const vorder = va >= 0.999 ? [vr, vg, vb]
      : [vr * va + bg[0] * (1 - va), vg * va + bg[1] * (1 - va), vb * va + bg[2] * (1 - va)]
    const groesse = parseFloat(st.fontSize)
    const gewicht = st.fontWeight
    // [read] Die KLASSE gehoert in den Schluessel. Ohne sie verdeckt
    // die Beschriftung „Art" die Kataloglucke — beide 11,5 px in
    // --fg-muted —, und der Lauf meldet eine Messung, die es fuer
    // diesen Satz nie gab.
    const schl = `${el.className}|${st.color}|${groesse}|${gewicht}`
    if (gesehen.has(schl)) continue
    gesehen.add(schl)
    const gross = groesse >= 24 || (groesse >= 18.66 && Number(gewicht) >= 700)
    const v = Math.round(verh(vorder, bg) * 100) / 100
    proben.push({
      beispiel: eigen.slice(0, 34),
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
}

const alle = [
  // 1) Freitext mit offener Vorschlagsliste
  ...await zustand('vorschlaege', async () => {
    await artfeld.selectOption('nahrung')
    await feld.click(); await feld.fill('laktose')
    await s.waitForSelector('.v2-allergie-vorschlag', { timeout: 8000 }).catch(()=>{})
    await s.waitForTimeout(500)
  }),
  // 2) Der gewaehlte Katalogeintrag — der GRUENE Satz
  ...await zustand('geprueft', async () => {
    await s.locator('.v2-allergie-vorschlag').first().click().catch(()=>{})
    await s.waitForTimeout(500)
  }),
  // 3) Die Kataloglucke bei `medikament`
  ...await zustand('katalogluecke', async () => {
    await artfeld.selectOption('medikament')
    await feld.click(); await feld.fill('penicillin')
    await s.waitForSelector('.v2-allergie-katalogluecke', { timeout: 8000 }).catch(()=>{})
    await s.waitForTimeout(500)
  }),
]
// Je Farbe/Groesse EINE Probe — ueber alle Zustaende hinweg.
const gesehen = new Set()
const proben = alle.filter(p => {
  // [read] Der ZUSTAND gehoert in den Schluessel — sonst verdeckt eine
  // Farbe aus dem ersten Zustand dieselbe Farbe im dritten, und man
  // meldet „geprueft" als gemessen, obwohl nichts gemessen wurde.
  const k = `${p.zustand}|${p.farbe}|${p.px}|${p.gewicht}`
  if (gesehen.has(k)) return false
  gesehen.add(k); return true
}).sort((a, b) => a.verhaeltnis - b.verhaeltnis)

if (ZIEL) await s.screenshot({ path: ZIEL })
console.log(JSON.stringify({
  proben, faelle: proben.length,
  durchgefallen: proben.filter(p => !p.besteht).length,
  zustaende: [...new Set(alle.map(p => p.zustand))],
}, null, 2))
await b.close()
