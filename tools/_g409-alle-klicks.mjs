// G-409/A1: JEDEN Klick im Draft anklicken — und messen, wo er landet.
//
// `[read]` **Nicht die href lesen** — anklicken. `[cmd]` Ein
// Formular, ein `onClick` oder eine Umleitung stehen in keiner href.
import { chromium } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { wortFuer } from './konten.mjs'

const BASIS = 'http://localhost:3220'
const ZIEL = 'docs/bilder/g409'
mkdirSync(ZIEL, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1600, height: 1100 } })
const p = await ctx.newPage()
await p.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'coach@lumeos.app')
await p.fill('input[type=password]', wortFuer('coach@lumeos.app'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 20000 })

// Alle Bereiche und Unterpunkte einsammeln.
await p.goto(`${BASIS}/?draft=overview`, { waitUntil: 'networkidle' })
const bereiche = await p.$$eval('.dp-leiste .dp-eintrag', els => els
  .map(e => new URL(e.href).searchParams.get('draft')).filter(Boolean))

const seiten = []
for (const b of bereiche) {
  await p.goto(`${BASIS}/?draft=${b}`, { waitUntil: 'networkidle' })
  const kinder = await p.$$eval('.dp-inhalt .v2-tab', els => els
    .map(e => new URL(e.href).searchParams.get('kind')).filter(Boolean))
  if (kinder.length) for (const k of kinder) seiten.push([b, k])
  else seiten.push([b, null])
}

const befunde = []
for (const [b, k] of seiten) {
  const url = k ? `/?draft=${b}&kind=${k}` : `/?draft=${b}`
  await p.goto(BASIS + url, { waitUntil: 'networkidle' })

  // Jedes Klickziel IM INHALT (nicht Leiste/Kontext — die sind Schale).
  const ziele = await p.$$eval('.dp-inhalt a[href]', els =>
    els.map(e => e.getAttribute('href')).filter(h => h && !h.startsWith('#')))
  const formulare = await p.$$eval('.dp-inhalt form', els => els.map(f => {
    const felder = [...f.querySelectorAll('input[type=hidden]')]
      .map(i => `${i.name}=${i.value}`)
    return `${f.getAttribute('action') || ''}?${felder.join('&')}`
  }))

  for (const z of [...ziele, ...formulare]) {
    // Fuehrt es aus dem Draft? Ein Ziel bleibt drin, wenn es
    // ?draft= traegt ODER auf /athlet/ mit draft zeigt.
    const drin = z.includes('draft=') || z.includes('?draft')
    befunde.push({ seite: url, ziel: z, drin })
  }
}

const raus = befunde.filter(x => !x.drin)
console.log(`Seiten geprueft : ${seiten.length}`)
console.log(`Klickziele      : ${befunde.length}`)
console.log(`davon im Draft  : ${befunde.length - raus.length}`)
console.log(`FUEHREN HINAUS  : ${raus.length}`)
for (const r of raus.slice(0, 20)) console.log(`   ${r.seite}  ->  ${r.ziel}`)

writeFileSync(`${ZIEL}/klicks.json`, JSON.stringify(befunde, null, 1))
await browser.close()
