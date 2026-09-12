// G-430/A2+A4+A5 - am Schirm messen, nicht im Quelltext.
//
// `[read]` **Die Frage ist nicht, ob der Code da ist** - sondern ob
// der Latissimus anwaehlbar ist, ob ein Klick auf den Elternteil die
// Kinder faerbt, und ob das Detail den Elternteil nennt.
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

await p.goto(`${ZIEL}/v2/recovery`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2000)

// ── A2: welche Flaechen zeichnet die Karte? ─────────────────────
const flaechen = await p.evaluate(() =>
  [...document.querySelectorAll('[data-muskel]')]
    .map(g => g.getAttribute('muskel') ?? g.getAttribute('data-muskel'))
    .filter((v, i, a) => v && a.indexOf(v) === i))

console.log(`\n=== G-430 am Schirm — ${KONTO} ===\n`)
console.log(`Flaechen gezeichnet: ${flaechen.length}`)
for (const neu of ['latissimus', 'teres-major', 'teres-minor', 'erector-spinae', 'flanke']) {
  console.log(`  ${neu.padEnd(16)} ${flaechen.includes(neu) ? 'DA' : 'FEHLT'}`)
}
for (const alt of ['upper-back', 'lower-back']) {
  console.log(`  ${alt.padEnd(16)} ${flaechen.includes(alt) ? 'NOCH DA (Fehler)' : 'weg (richtig)'}`)
}

// ── A4: faerbt ein Elternteil-Klick die Kinder? ─────────────────
//
// `[cmd]` **Der Check-in-Reiter traegt die anklickbare Karte.**
await p.goto(`${ZIEL}/v2/recovery?tab=checkin`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)

/** Welche Flaechen sind gerade hervorgehoben? */
async function hervorgehoben() {
  return p.evaluate(() => {
    const aus = []
    for (const g of document.querySelectorAll('[data-muskel]')) {
      const id = g.getAttribute('data-muskel')
      // `[read]` **Die Hervorhebung steckt im `stroke`/`stroke-width`
      // der Pfade** - `aktiv` setzt sie in `koerperkarte.tsx`.
      const pfad = g.querySelector('path')
      if (!pfad) continue
      const sw = Number(getComputedStyle(pfad).strokeWidth.replace('px', '')) || 0
      if (sw > 1.2) aus.push(id)
    }
    return aus
  })
}

console.log(`\n--- A4: Klick auf einen Elternteil ---`)
console.log(`vor dem Klick hervorgehoben: ${JSON.stringify(await hervorgehoben())}`)

// `[cmd]` **Der Klick geht auf den PFAD, nicht auf die Gruppe** -
// das `<g>` wird von der SVG-Flaeche ueberdeckt (60 Fehlversuche in
// der ersten Fassung dieser Probe).
async function klickeFlaeche(code) {
  const pfad = p.locator(`[data-muskel="${code}"] path`).first()
  if (await pfad.count() === 0) return false
  await pfad.click({ force: true, timeout: 8000 })
  return true
}

// `[read]` **Der Elternteil-Klick kommt ueber die Soreness-Liste** -
// sie fuehrt `upper_back` als EINE Gruppe.
const kn = p.locator('button', { hasText: /upper back/i })
const anzahl = await kn.count()
console.log(`Knopf „Upper back": ${anzahl} gefunden`)
if (anzahl > 0) {
  await kn.first().click({ force: true })
  await p.waitForTimeout(800)
  const nach = await hervorgehoben()
  console.log(`nach dem Klick hervorgehoben: ${JSON.stringify(nach.sort())}`)
  console.log(`  -> ${nach.length} Flaechen, erwartet 3 `
    + `(latissimus, teres-major, teres-minor)`)
  await p.screenshot({ path: 'docs/bilder/g430/a4-elternteil-geklickt.png' })
} else {
  // Fallback: direkt auf der Karte einen Kindmuskel treffen.
  console.log('Kein Listenknopf — Klick auf die Karte:')
  const ok = await klickeFlaeche('latissimus')
  await p.waitForTimeout(800)
  console.log(`  Klick auf latissimus: ${ok ? 'ja' : 'nein'}`)
  console.log(`  hervorgehoben: ${JSON.stringify((await hervorgehoben()).sort())}`)
  await p.screenshot({ path: 'docs/bilder/g430/a4-elternteil-geklickt.png' })
}

// ── A5: nennt das Detail den Elternteil? ────────────────────────
console.log(`\n--- A5: Per-muscle detail ---`)
await p.goto(`${ZIEL}/v2/recovery`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1600)
// Auf eine Flaeche der Karte klicken.
const karte = p.locator('[data-muskel="latissimus"] path').first()
if (await karte.count() > 0) {
  await karte.click({ force: true, timeout: 8000 })
  await p.waitForTimeout(900)
  const detail = await p.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]')
    if (!dlg) return null
    const kopf = [...dlg.querySelectorAll('.v2-eyebrow')]
      .map(x => x.textContent?.trim() ?? '')
    return {
      titel: dlg.querySelector('div[style*="font-weight: 600"]')?.textContent?.trim() ?? null,
      hatElternteil: kopf.some(k => /parent/i.test(k)),
      text: (dlg.textContent ?? '').replace(/\s+/g, ' ').slice(0, 400),
    }
  })
  console.log(`Fenster offen: ${detail ? 'ja' : 'NEIN'}`)
  // Kam die Hierarchie ueberhaupt an?
  const ausHtml = await p.evaluate(() =>
    document.documentElement.innerHTML.includes('wurzel-ruecken'))
  console.log(`  „wurzel-ruecken" irgendwo im HTML: ${ausHtml}`)
  if (detail) {
    console.log(`  „Parent"-Kopf: ${detail.hatElternteil}`)
    console.log(`  Text: ${detail.text.slice(0, 260)}`)
  }
  await p.screenshot({ path: 'docs/bilder/g430/per-muscle-detail.png', fullPage: false })
} else {
  console.log('Die Flaeche `latissimus` ist auf der Karte nicht anklickbar.')
}

console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()
