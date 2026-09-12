// G-432/A4+A5+A6 - jeder Muskel einzeln anwaehlbar, am Schirm.
//
// `[read]` **Toms Satz ist eine Abgrenzung:** *,,jeder angezeigte
// muskel anwaehlbar (NICHT die gruppe)."* **Also wird gemessen, wie
// VIELE Flaechen ein Klick hervorhebt** - eine ist richtig, drei
// waren der Befund.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1500 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 180)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

/** Welche Flaechen sind hervorgehoben? */
async function hervorgehoben() {
  return p.evaluate(() => {
    const aus = []
    for (const g of document.querySelectorAll('[data-muskel]')) {
      const pfad = g.querySelector('path')
      if (!pfad) continue
      const sw = Number(getComputedStyle(pfad).strokeWidth.replace('px', '')) || 0
      if (sw > 1.2) aus.push(g.getAttribute('data-muskel'))
    }
    return [...new Set(aus)]
  })
}

// ── A4: der Klick auf den Latissimus ─────────────────────────────
console.log(`\n=== G-432/A4 — jeder Muskel einzeln, ${KONTO} ===\n`)
await p.goto(`${ZIEL}/v2/recovery?tab=checkin`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)
console.log(`vor dem Klick:  ${JSON.stringify(await hervorgehoben())}`)

const lat = p.locator('[data-muskel="latissimus"] path').first()
if (await lat.count() > 0) {
  await lat.click({ force: true, timeout: 8000 })
  await p.waitForTimeout(800)
  const nach = await hervorgehoben()
  console.log(`Klick auf latissimus: ${JSON.stringify(nach.sort())}`)
  console.log(`  -> ${nach.length} Flaeche(n), erwartet GENAU 1`)
  await p.screenshot({ path: 'docs/bilder/g432/a4-latissimus.png' })
} else console.log('latissimus nicht anklickbar')

// Und ein WEIT entfernter Muskel - faerbt er NUR sich?
for (const code of ["chest", "gluteus-maximus", "quadriceps"]) {
  const el = p.locator(`[data-muskel="${code}"] path`).first()
  if (await el.count() === 0) { console.log(`  ${code}: nicht da`); continue }
  await el.click({ force: true, timeout: 8000 })
  await p.waitForTimeout(700)
  const n = await hervorgehoben()
  console.log(`Klick auf ${code.padEnd(16)} -> ${JSON.stringify(n.sort())} (${n.length})`)
}

// Und ein zweiter Muskel derselben Gruppe - faerbt er NUR sich?
const tm = p.locator('[data-muskel="teres-major"] path').first()
console.log('teres-major Pfade im DOM:', await p.locator('[data-muskel="teres-major"] path').count())
if (await tm.count() > 0) {
  const box = await tm.boundingBox()
  console.log('  Kasten:', JSON.stringify(box))
  // ══ Die Mitte des Kastens ist NICHT der Muskel ═══════════════
  //
  // `[cmd]` **`elementFromPoint` in der Kastenmitte liefert `svg`,
  // keine Flaeche** - `teres-major` ist eine SICHEL, und ihre
  // Bounding-Box-Mitte liegt neben der Form.
  //
  // `[read]` **Das ist ein Fehler der PROBE, nicht des Baus** -
  // also wird ein Punkt gesucht, der wirklich auf der Form liegt.
  const treffer = await p.evaluate(([bx, by, bw, bh]) => {
    for (let i = 1; i <= 9; i += 1) {
      for (let j = 1; j <= 9; j += 1) {
        const x = bx + (bw * i) / 10, y = by + (bh * j) / 10
        const el = document.elementFromPoint(x, y)
        const g = el && el.closest('[data-muskel]')
        if (g?.getAttribute('data-muskel') === 'teres-major') return { x, y }
      }
    }
    return null
  }, [box.x, box.y, box.width, box.height])
  console.log('  Punkt AUF der Sichel:', JSON.stringify(treffer))
  if (treffer) { await p.mouse.click(treffer.x, treffer.y); await p.waitForTimeout(700) }
  const nach = await hervorgehoben()
  console.log(`Klick auf teres-major: ${JSON.stringify(nach.sort())}`)
  console.log(`  -> ${nach.length} Flaeche(n), erwartet GENAU 1`)
}

// ── A5 + A6: das Detail ──────────────────────────────────────────
console.log(`\n=== A5/A6 — Zugehoerigkeit und volle Hierarchie ===\n`)
await p.goto(`${ZIEL}/v2/recovery`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1600)
const k = p.locator('[data-muskel="latissimus"] path').first()
if (await k.count() > 0) {
  await k.click({ force: true, timeout: 8000 })
  await p.waitForTimeout(900)
  const d = await p.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]')
    if (!dlg) return null
    const txt = (dlg.textContent ?? '').replace(/\s+/g, ' ')
    const koepfe = [...dlg.querySelectorAll('.v2-eyebrow')].map(x => x.textContent?.trim() ?? '')
    return {
      zugehoerigkeit: koepfe.find(x => /Zugeh/i.test(x)) ?? null,
      gehoertZu: (txt.match(/gehört zu:\s*([A-Za-z ]{2,20})/) ?? [])[1]?.trim() ?? null,
      alleGruppen: koepfe.find(x => /Alle Muskelgruppen/i.test(x)) ?? null,
      luecken: (txt.match(/(\d+) von (\d+) gezeichnet · (\d+) Lücken/) ?? []).slice(1),
      nichtGezeichnet: (txt.match(/\(nicht gezeichnet\)/g) ?? []).length,
    }
  })
  if (d) {
    console.log(`  Zugehoerigkeit-Kopf   ${d.zugehoerigkeit ?? '—'}`)
    console.log(`  „gehoert zu"          ${d.gehoertZu ?? '—'}`)
    console.log(`  Alle-Gruppen-Kopf     ${d.alleGruppen ?? '—'}`)
    console.log(`  Deckung               ${JSON.stringify(d.luecken)}`)
    console.log(`  „(nicht gezeichnet)"  ${d.nichtGezeichnet}x`)
    await p.screenshot({ path: 'docs/bilder/g432/a5-a6-detail.png', fullPage: true })
  } else console.log('  Fenster NICHT offen')
}

console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()
