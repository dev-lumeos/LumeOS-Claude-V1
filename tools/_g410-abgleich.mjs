// G-410/A4: je Kachel die Zahl der Vorlage gegen die im Bau.
//
// `[read]` **Nicht behaupten, dass kopiert wurde** — die Werte der
// Vorlage aus der `.jsx` lesen und im gerenderten Text suchen.
//
// `[cmd]` **Findet der Browser den Wert nicht, ist er nicht
// kopiert** — egal wie der Quelltext aussieht.
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { wortFuer } from './konten.mjs'

const D = 'docs/spezifikation/10-plattform/design-system/coach-portal-draft'
const BASIS = 'http://localhost:3220'
mkdirSync('docs/bilder/g410', { recursive: true })

/** Die Werte, die die Vorlage in dieser Kachel zeigt. */
const PROBEN = [
  // ── Kalender (portal-tools.jsx) ──────────────────────────────
  ['calendar', '/?draft=calendar', 'Monatsraster', [
    'September 2026', '14', 'Weekly check-in', 'Prep review · 6 weeks out',
    'Plateau discussion', 'Lukas Bauer', 'Niko Brandt', 'Daniel Vogel',
    '08:00', '11:00', '17:30',
  ]],
  ['calendar', '/?draft=calendar', 'Legende', [
    'Check-in', 'Session', 'Call', 'Prep review', 'Deadline',
  ]],
  ['calendar', '/?draft=calendar', 'Als naechstes', [
    'Form review · video', 'Plan handover', 'Mira', 'Carla',
  ]],

  // ── Akte: Klientenkarte (client-record.jsx) ──────────────────
  ['record', '/?draft=athletes&kind=record', 'Klientenkarte', [
    'Lukas Bauer', 'full access granted', 'Elite', 'Mar 2024',
    'Contest prep · classic physique · 20 Sep', 'week 18 of 20',
    '31, 182 cm', 'Anders Lindqvist · training', 'Jana Bauer · nutrition',
    'Dr. Kessler · medical', '8 Mar 2024',
  ]],
]

/** Reiter der Akte: Kachel -> Werte der Vorlage. */
const REITER_PROBEN = [
  ['Overview', ['6 of 6', '34.2 t', '8.4', '126 days', '2,180', '218 g',
    '97 %', '4.2 L', '58', '6.4 h', '48 ms', '54']],
  ['Training', ['6 of 6', '34.2 t', '8.4', '126 days', '24', '6.8 t', '8.1',
    '132.5 kg', '137.5 kg']],
  ['Nutrition', ['2,180', '218 g', '97 %', '4.2 L', '218', '220', '180',
    '190', '52', '55', '62', '71', '84',
    'Samstag 200 kcal darueber']],
  ['Recovery', ['58', '6.4 h', '48 ms', '54']],
  ['Supplements', ['Creatine mono', '5 g', '100', 'Vitamin D3', '4000 IU',
    'Omega-3', '2 g EPA']],
  ['Body', ['81.4 kg', '6.8 %', '75.9 kg']],
  ['Medical', ['cleared for competition prep', 'Dr. Kessler']],
  ['Timeline', ['Push depletion logged · 24 sets, RPE 8.1',
    'Check-in: energy 5, soreness 6, sleep 6.4 h']],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1600, height: 1300 } })
const p = await ctx.newPage()
await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'coach@lumeos.app')
await p.fill('input[type=password]', wortFuer('coach@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })

const zeilen = []
let ges = 0, da = 0

for (const [, url, kachel, werte] of PROBEN) {
  await p.goto(BASIS + url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(280)
  const text = await p.evaluate(() => document.querySelector('.dp-inhalt').innerText)
  const fehlt = werte.filter(w => !text.includes(w))
  ges += werte.length; da += werte.length - fehlt.length
  zeilen.push({ kachel, vorlage: werte.length, gebaut: werte.length - fehlt.length, fehlt })
  console.log(`${kachel.padEnd(16)} ${String(werte.length - fehlt.length).padStart(2)}/${werte.length}`
    + (fehlt.length ? `   FEHLT: ${fehlt.join(' · ')}` : ''))
}

await p.goto(`${BASIS}/?draft=athletes&kind=record`, { waitUntil: 'networkidle' })
for (const [reiter, werte] of REITER_PROBEN) {
  await p.click(`.dk-modulwahl button:has-text("${reiter}")`)
  await p.waitForTimeout(240)
  const text = await p.evaluate(() => document.querySelector('.dp-inhalt').innerText)
  const fehlt = werte.filter(w => !text.includes(w))
  ges += werte.length; da += werte.length - fehlt.length
  zeilen.push({ kachel: `Akte/${reiter}`, vorlage: werte.length, gebaut: werte.length - fehlt.length, fehlt })
  console.log(`${('Akte/' + reiter).padEnd(16)} ${String(werte.length - fehlt.length).padStart(2)}/${werte.length}`
    + (fehlt.length ? `   FEHLT: ${fehlt.join(' · ')}` : ''))
}

console.log(`\nWerte der Vorlage: ${ges} · am Schirm gefunden: ${da} · fehlend: ${ges - da}`)
writeFileSync('docs/bilder/g410/abgleich.json', JSON.stringify(zeilen, null, 1))
await browser.close()
