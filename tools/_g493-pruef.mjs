// G-493 -- die vier Befunde messen.
//
// A1  ein Wort fuer die Aktion
// A2  eine neue Mahlzeit im Modal, mit pre_workout/post_workout
// A4  der gewaehlte Zielknopf ist erkennbar
// A8  Kontraste
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'
const SUCHFELD = 'input[aria-label="Produkt suchen"]'
const PULVER = ['Gold Standard 100% Whey Chocolate Peanut Butter', 'ON Optimum Nutrition']

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext({viewport:{width:1500,height:1200}})).newPage()
const fehler=[]; s.on('pageerror', e=>fehler.push(String(e).slice(0,200)))
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
// Filter leeren, von einem NEUTRALEN Reiter aus (G-491).
await s.goto(`${BASIS}/v2/supplements?tab=heute`, { waitUntil: 'domcontentloaded' })
await s.evaluate(async () => {
  await fetch('/api/supplements/filter', { method:'PUT',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({ status:'On Market', kategorie:null, form:null,
                           marken:[], allergienAn:true, leisteOffen:false }) })
})

// [read] Kontrast ueber ein 1x1-Canvas, nie ueber Zeichenketten --
// oklch() bricht jeden Regex.
const KONTRAST = `(() => {
  const lum = (c) => {
    const k = document.createElement('canvas'); k.width = k.height = 1
    const x = k.getContext('2d'); x.fillStyle = c; x.fillRect(0,0,1,1)
    const [r,g,bb] = x.getImageData(0,0,1,1).data
    const f = (v) => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4) }
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(bb)
  }
  window.__kontrast = (el) => {
    const c = getComputedStyle(el)
    let hg = c.backgroundColor, p = el
    while ((hg === 'rgba(0, 0, 0, 0)' || hg === 'transparent') && p.parentElement) {
      p = p.parentElement; hg = getComputedStyle(p).backgroundColor
    }
    const a = lum(c.color), bl = lum(hg)
    return Math.round(((Math.max(a,bl)+0.05)/(Math.min(a,bl)+0.05))*100)/100
  }
})()`

// ── A1: das Aktionswort ueberall ─────────────────────────────────
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector(SUCHFELD, { timeout: 40000 })
await s.waitForTimeout(1500)
await s.locator(SUCHFELD).type(PULVER[0], { delay: 15 })
await s.waitForTimeout(4000)
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 }).catch(()=>{})

const a1liste = await s.evaluate(() =>
  [...document.querySelectorAll('[data-probe="zeile-add"]')]
    .slice(0,3).map(k => (k.textContent ?? '').trim()))
console.log('A1 Liste:', JSON.stringify(a1liste))

// die Tafel
await s.locator('.v2-tbl tbody tr', { hasText: PULVER[1] }).first().locator('td').first().click()
await s.waitForTimeout(3000)
const a1tafel = await s.evaluate(() =>
  document.querySelector('[data-probe="produkt-add"]')?.textContent?.trim() ?? null)
console.log('A1 Tafel:', JSON.stringify(a1tafel))

// die Substanzen
await s.goto(`${BASIS}/v2/supplements?tab=catalog`, { waitUntil: 'domcontentloaded' })
await s.waitForTimeout(3000)
await s.locator('.v2-tbl tbody tr').first().waitFor({ timeout: 30000 }).catch(()=>{})
const a1subst = await s.evaluate(() => {
  const k = [...document.querySelectorAll('.v2-tbl tbody tr button')]
    .filter(x => /Add|Hinzuf/i.test(x.textContent ?? ''))
  return k.slice(0,3).map(x => (x.textContent ?? '').trim())
})
console.log('A1 Substanzen:', JSON.stringify(a1subst))

// ── A4 + A2: das Modal ───────────────────────────────────────────
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })
await s.waitForSelector(SUCHFELD, { timeout: 40000 })
await s.waitForTimeout(1500)
await s.locator(SUCHFELD).type(PULVER[0], { delay: 15 })
await s.waitForTimeout(4000)
await s.locator('.v2-tbl tbody tr', { hasText: PULVER[1] }).first()
  .locator('[data-probe="zeile-add"]').click()
await s.waitForTimeout(2500)
await s.evaluate(KONTRAST)

const a4vorher = await s.evaluate(() => {
  const f = (p) => {
    const e = document.querySelector(`[data-probe="${p}"]`)
    if (!e) return null
    const c = getComputedStyle(e)
    return { gedrueckt: e.getAttribute('aria-pressed'), farbe: c.color,
             hg: c.backgroundColor, fett: c.fontWeight }
  }
  return { stack: f('aktion-stack'), mahlzeit: f('aktion-mahlzeit') }
})
console.log('\nA4 KEINER gewaehlt:', JSON.stringify(a4vorher, null, 2))
await s.screenshot({ path: '../../backup/x-g493-a4-keiner.png' })

await s.locator('[data-probe="aktion-mahlzeit"]').click()
await s.locator('[data-probe="mahlzeit-portion"]').waitFor({ timeout: 30000 }).catch(()=>{})
await s.waitForTimeout(1200)
const a4nachher = await s.evaluate(() => {
  const f = (p) => {
    const e = document.querySelector(`[data-probe="${p}"]`)
    if (!e) return null
    const c = getComputedStyle(e)
    return { gedrueckt: e.getAttribute('aria-pressed'), farbe: c.color,
             hg: c.backgroundColor, fett: c.fontWeight,
             kontrast: window.__kontrast(e) }
  }
  return { stack: f('aktion-stack'), mahlzeit: f('aktion-mahlzeit'),
           neuerKnopf: !!document.querySelector('[data-probe="neue-mahlzeit-oeffnen"]') }
})
console.log('\nA4 MAHLZEIT gewaehlt:', JSON.stringify(a4nachher, null, 2))
await s.screenshot({ path: '../../backup/x-g493-a4-gewaehlt.png' })

// ── A2: die neue Mahlzeit ────────────────────────────────────────
await s.locator('[data-probe="neue-mahlzeit-oeffnen"]').click()
await s.waitForTimeout(900)
const a2 = await s.evaluate(() => {
  const w = document.querySelector('[data-probe="neue-art"]')
  return {
    arten: w ? [...w.options].map(o => `${o.value}=${o.textContent.trim()}`) : null,
    zeitDa: !!document.querySelector('[data-probe="neue-zeit"]'),
  }
})
console.log('\nA2 ARTEN:', JSON.stringify(a2, null, 2))
await s.screenshot({ path: '../../backup/x-g493-a2-neue-mahlzeit.png' })

console.log('\nSeitenfehler:', fehler.slice(0,3))
await b.close().catch(()=>{})
