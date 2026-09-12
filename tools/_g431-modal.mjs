// G-431/A4+A5 - Gruppe gegen Kind, am Schirm.
//
// `[read]` **Toms Satz ist eine Wenn-Dann-Aussage:** *,,wenn gruppe,
// wird im modal aufgeschluesselt, und wenn child, dann nur dieses."*
// **Also werden BEIDE Faelle gemessen** - eine Probe, die nur den
// Gruppenfall ansieht, faellt nicht, wenn das Kind auch
// aufgeschluesselt wird.
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

/** Das Modal oeffnen, indem eine Kartenflaeche geklickt wird. */
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
    const kopf = [...dlg.querySelectorAll('.v2-eyebrow')].map(x => x.textContent?.trim() ?? '')
    // `[read]` **Die Bloecke der Aufschluesselung** - je Flaeche einer,
    // erkennbar am Monospace-Code daneben.
    const codes = [...dlg.querySelectorAll('.v2-mono')]
      .map(x => x.textContent?.trim() ?? '')
      .filter(x => /^[a-z-]+$/.test(x))
    return {
      titel: dlg.querySelector('div[style*="font-weight: 600"]')?.textContent?.trim() ?? null,
      gruppenKopf: kopf.find(k => /^Group ·/.test(k)) ?? null,
      muskelKopf: kopf.find(k => /^Muscle ·/.test(k)) ?? null,
      parentKopf: kopf.some(k => /Parent/i.test(k)),
      codes: codes.filter((v, i, a) => a.indexOf(v) === i),
      pillen: [...dlg.querySelectorAll('.v2-pill')].length,
    }
  })
}

console.log(`\n=== G-431/A4 — Gruppe gegen Kind, ${KONTO} ===\n`)

// ── Der GRUPPEN-Fall: eine Flaeche, deren Kuerzel mehrere traegt ──
const gruppe = await oeffne('latissimus')
console.log('--- Klick auf `latissimus` (Kuerzel upper_back -> DREI Flaechen)')
if (!gruppe) console.log('    Fenster NICHT offen')
else {
  console.log(`    Titel            ${gruppe.titel}`)
  console.log(`    Gruppen-Kopf     ${gruppe.gruppenKopf ?? '—'}`)
  console.log(`    Muskel-Kopf      ${gruppe.muskelKopf ?? '—'}`)
  console.log(`    Parent-Block     ${gruppe.parentKopf}`)
  console.log(`    aufgeschluesselt ${JSON.stringify(gruppe.codes)}`)
  await p.screenshot({ path: 'docs/bilder/g431/a4-gruppe.png' })
}

// ── Der KIND-Fall: eine Flaeche, deren Kuerzel nur sie traegt ─────
const kind = await oeffne('chest')
console.log('\n--- Klick auf `chest` (Kuerzel chest -> EINE Flaeche)')
if (!kind) console.log('    Fenster NICHT offen')
else {
  console.log(`    Titel            ${kind.titel}`)
  console.log(`    Gruppen-Kopf     ${kind.gruppenKopf ?? '—'}`)
  console.log(`    Muskel-Kopf      ${kind.muskelKopf ?? '—'}`)
  console.log(`    Parent-Block     ${kind.parentKopf}`)
  console.log(`    aufgeschluesselt ${JSON.stringify(kind.codes)}`)
  await p.screenshot({ path: 'docs/bilder/g431/a4-kind.png' })
}

// ── A5: das Detail nach der Umstellung ───────────────────────────
const detail = await oeffne('gluteus-maximus')
console.log('\n--- A5: Klick auf `gluteus-maximus` (neu aus G-431)')
if (detail) {
  console.log(`    Titel            ${detail.titel}`)
  console.log(`    Parent-Block     ${detail.parentKopf}`)
  console.log(`    aufgeschluesselt ${JSON.stringify(detail.codes)}`)
  await p.screenshot({ path: 'docs/bilder/g431/a5-nachher.png' })
} else console.log('    Fenster NICHT offen')

console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()
