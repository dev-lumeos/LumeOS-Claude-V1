// G-432/A2+A3 - zeigt das Modal die EBENE?
//
// `[read]` **Die Frage ist nicht, ob `EBENEN` stimmt** - das prueft
// `_g432-pruefen.mjs` gegen die Datenbank. **Hier wird gemessen, ob
// es am Schirm ankommt.**
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 180)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

async function oeffne(code) {
  await p.goto(`${ZIEL}/v2/recovery`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1500)
  const pfad = p.locator(`[data-muskel="${code}"] path`).first()
  if (await pfad.count() === 0) return null
  await pfad.click({ force: true, timeout: 8000 })
  await p.waitForTimeout(800)
  return p.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]')
    if (!dlg) return null
    const txt = (dlg.textContent ?? '').replace(/\s+/g, ' ')
    return {
      titel: dlg.querySelector('div[style*="font-weight: 600"]')?.textContent?.trim() ?? null,
      marken: [...dlg.querySelectorAll('.v2-pill')].map(x => x.textContent?.trim() ?? '')
        .filter(x => x === 'Gruppe' || x === 'Muskel'),
      hatWeg: /›/.test(txt),
      nichtGezeichnet: (txt.match(/Nicht gezeichnet:\s*([^—]{0,70})/) ?? [])[1]?.trim() ?? null,
      text: txt.slice(0, 320),
    }
  })
}

console.log(`\n=== G-432 am Schirm — ${KONTO} ===\n`)

for (const [code, erwartet] of [
  ['quadriceps', 'Gruppe (Rectus Femoris fehlt in der Zeichnung)'],
  ['calves', 'Gruppe (Soleus liegt darunter)'],
  ['triceps', 'Muskel (Blatt, die Koepfe haben keinen Namen)'],
  ['latissimus', 'Muskel (Blatt)'],
]) {
  const r = await oeffne(code)
  console.log(`--- ${code}   erwartet: ${erwartet}`)
  if (!r) { console.log('    Fenster NICHT offen\n'); continue }
  console.log(`    Titel             ${r.titel}`)
  console.log(`    Ebenen-Marken     ${JSON.stringify(r.marken)}`)
  console.log(`    Weg sichtbar      ${r.hatWeg}`)
  console.log(`    Nicht gezeichnet  ${r.nichtGezeichnet ?? '—'}`)
  await p.screenshot({ path: `docs/bilder/g432/${code}.png` })
  console.log('')
}

console.log(`Seitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()
