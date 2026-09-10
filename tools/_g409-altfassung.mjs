// G-409: die alte Fassung darf sich NICHT geaendert haben.
//
// `[read]` **Der Auftrag sagt: `?bereich=` NICHT anfassen.** `[cmd]`
// Die Reiter wurden aber angefasst — also messen, ob dort noch
// dasselbe herauskommt.
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

let raus = 0, ges = 0
for (const bereich of ['uebersicht','klienten','checkins','alerts','autonomie','freigaben','nachrichten']) {
  await p.goto(`${B}/?bereich=${bereich}`, { waitUntil: 'networkidle' })
  const ziele = await p.$$eval('main a[href], .cp-inhalt a[href]', els =>
    els.map(e => e.getAttribute('href')).filter(Boolean))
  const pfade = await p.$$eval('input[name=pfad]', els => els.map(e => e.value))
  const mitDraft = [...ziele, ...pfade].filter(z => z.includes('draft'))
  ges += ziele.length + pfade.length
  raus += mitDraft.length
  console.log(`${bereich.padEnd(12)} Ziele=${ziele.length} pfad=${pfade.length} mitDraft=${mitDraft.length}`)
}
console.log(`\nZiele gesamt: ${ges} · mit ?draft= (darf 0 sein): ${raus}`)
await b.close()
