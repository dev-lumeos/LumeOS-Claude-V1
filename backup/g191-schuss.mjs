// G-191: Astaxanthin aufklappen und die Dosis-Kachel ablichten.
//
// `[read]` Der Nachweis braucht die AUFGEKLAPPTE Zeile — die Kachel
// steht nicht in der Liste, sondern in der Tafel darunter. Deshalb
// ein eigenes Skript statt `schuss.mjs` mit `--klick`: gesucht wird
// die Zeile ueber ihren Namen, nicht ueber eine Position.
//
// Aufruf: node backup/g191-schuss.mjs <breite> <ziel>
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BREITE = Number(process.argv[2] ?? 1280)
const ZIEL = process.argv[3] ?? `backup/g191-${BREITE}.png`
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const BASIS = 'http://127.0.0.1:3200'

const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: BREITE, height: 900 } })
const p = await s.newPage()

const fehler = []
p.on('console', m => { if (m.type() === 'error') fehler.push(m.text().slice(0, 80)) })

await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type="email"]', KONTO)
await p.fill('input[type="password"]', wortFuer(KONTO))
await p.click('button[type="submit"]')
await p.waitForURL(u => !u.pathname.includes('/login'), { timeout: 30000 })

await p.goto(`${BASIS}/v2/supplements?tab=database`, { waitUntil: 'networkidle' })

// Suchen statt scrollen — die Liste hat 412 Zeilen.
const suche = p.locator('.v2-supp-suche input, input[type="search"]').first()
await suche.waitFor({ state: 'visible', timeout: 20000 })
await suche.fill('Astaxanthin')
await p.waitForTimeout(700)

const zeile = p.locator('tbody tr', { hasText: 'Astaxanthin' }).first()
await zeile.waitFor({ state: 'visible', timeout: 20000 })
await zeile.click()
await p.waitForTimeout(900)

// Auf den Dosierungs-Reiter, wenn es ihn gibt.
const reiter = p.locator('.v2-supp-reiter-knopf', { hasText: 'Dosierung' }).first()
if (await reiter.count()) { await reiter.click(); await p.waitForTimeout(600) }

const tafel = p.locator('.v2-supp-tafel').first()
const text = (await tafel.innerText()).replace(/\s+/g, ' ')

// Laeuft etwas ueber den Rand?
// `[cmd]` **Zwei Pruefungen, weil die erste allein nicht reichte:**
// `scrollWidth > clientWidth` fand den abgeschnittenen Satz NICHT —
// er brach im eigenen Kasten um, und erst die Tafel beschnitt ihn.
// Deshalb zusaetzlich: ragt der Kasten ueber seinen Elternrand?
const ueberlauf = await p.evaluate(() => {
  const aus = []
  for (const e of document.querySelectorAll(
    '.v2-supp-kasten-grund, .v2-supp-kasten-wert, .v2-supp-zahl-hinweis,'
    + ' .v2-supp-zahl-kachel, .v2-supp-dosis-kachel')) {
    if (e.scrollWidth > e.clientWidth + 1) {
      aus.push(`eigen ${e.className}: ${e.scrollWidth}>${e.clientWidth}`)
    }
    const r = e.getBoundingClientRect()
    const t = e.closest('.v2-supp-tafel')
    if (t) {
      const tr = t.getBoundingClientRect()
      if (r.right > tr.right + 1 || r.left < tr.left - 1) {
        aus.push(`beschnitten ${e.className}: `
          + `${Math.round(r.right)} vs Tafel ${Math.round(tr.right)}`)
      }
    }
  }
  return aus
})

await p.screenshot({ path: ZIEL, fullPage: false })

const STATUS = /(NOT_APPLICABLE|NO_RELIABLE_EVIDENCE|TRIAL_EXPOSURE|REGULATORY_UL|CLINICAL_GUIDELINE|MANUFACTURER_LABEL)/
console.log(JSON.stringify({
  breite: BREITE, ziel: ZIEL, konto: KONTO,
  statuscode_sichtbar: STATUS.test(text),
  englischer_satz: /No validated clinical guideline/i.test(text),
  deutscher_grund: /Keine Leitlinie nennt eine Dosis/.test(text),
  ueberlauf,
  konsolenfehler: fehler.length,
  auszug: text.slice(0, 260),
}, null, 2))

await b.close()
