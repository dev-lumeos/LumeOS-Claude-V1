// G-428/A2 - der Reiter zeigt wieder Inhalt. Und: die anderen
// Module sind unberuehrt.
//
// `[read]` **Die Klammer liegt im geteilten Hook** - also wird
// gemessen, dass die sechs anderen Module weiter das alte Verhalten
// haben. **Eine geteilte Mechanik hat Ausnahmen** (Lehre aus
// `geteilte-mechanik-hat-ausnahmen`).
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 200)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

async function schirm(adresse) {
  await p.goto(`${ZIEL}${adresse}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1600)
  return p.evaluate(() => {
    const alle = [...document.querySelectorAll('.v2-card')]
    const aeussere = alle.filter(k => !k.parentElement?.closest('.v2-card'))
    return {
      kacheln: aeussere.length,
      zeichen: document.body.innerText.length,
      rotation: /rotation map/i.test(document.body.innerText),
    }
  })
}

console.log(`\n=== G-428/A2 — ${KONTO} ===\n`)

for (const a of ['/v2/supplements?tab=injection', '/v2/supplements?tab=injektionen']) {
  const r = await schirm(a)
  console.log(`${a}`)
  console.log(`   Kacheln ${r.kacheln}  Zeichen ${r.zeichen}  "Rotation map" ${r.rotation}`)
}

// Das Foto fuer A2: der Reiter mit Inhalt.
await p.goto(`${ZIEL}/v2/supplements?tab=injection`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1600)
await p.screenshot({ path: 'docs/bilder/g428/injektionsreiter.png', fullPage: true })
console.log('\nBild: docs/bilder/g428/injektionsreiter.png')

// ── Die sechs anderen Module: unveraendert? ──────────────────────
console.log('\n=== die anderen Module (Klammer gilt dort NICHT) ===\n')
for (const m of ['nutrition', 'training', 'recovery', 'medical', 'goals', 'coach']) {
  const gut = await schirm(`/v2/${m}`)
  // `[read]` **Ein erfundener Reiter** - ohne Liste darf er NICHT
  // geklammert werden, das Verhalten bleibt wie vor G-428.
  const falsch = await schirm(`/v2/${m}?tab=gibtesnicht`)
  console.log(`/v2/${m}`.padEnd(16)
    + `Standard ${String(gut.kacheln).padStart(3)} Kacheln  |  `
    + `?tab=gibtesnicht ${String(falsch.kacheln).padStart(3)} Kacheln`)
}

console.log(`\nSeitenfehler gesamt: ${fehler.length} ${JSON.stringify(fehler.slice(0, 3))}`)
await b.close()
