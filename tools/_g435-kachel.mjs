// G-435/A6 - was steht in `Per-muscle detail`?
//
// **Tom:** *„da will ich parent und darunter childs sehen."*
//
// `[read]` **Gemessen wird die Einrueckung**, nicht das Wort - eine
// flache Liste mit Ueberschrift saehe im Text genauso aus.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'
const BILD = process.argv[4] ?? 'docs/bilder/g435/a6-kachel.png'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 2000 } })
const p = await c.newPage()
const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 200)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

await p.goto(`${ZIEL}/v2/recovery?tab=muscles`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1800)

const d = await p.evaluate(() => {
  // Die Kachel an ihrem Titel finden - nicht an einer Position.
  const karten = [...document.querySelectorAll('div,section')]
  const kachel = karten.find(k => {
    const t = k.querySelector('.v2-card-title, [class*="title"]')
    return t?.textContent?.trim() === 'Per-muscle detail'
  }) ?? karten.find(k => k.textContent?.includes('Per-muscle detail')
    && k.textContent.includes('Hierarchie'))
  if (!kachel) return null

  const eyebrows = [...kachel.querySelectorAll('.v2-eyebrow')]
    .map(x => x.textContent?.trim() ?? '')
  const hier = eyebrows.find(x => x.startsWith('Hierarchie'))

  // ══ Die Einrueckung ist der Nachweis ══════════════════════════
  //
  // `[read]` **Eine flache Liste haette ueberall dasselbe
  // `padding-left`.** Gezaehlt wird, wieviele VERSCHIEDENE
  // Einrueckungen vorkommen.
  const zeilen = [...kachel.querySelectorAll('div')]
    .filter(z => {
      const pl = getComputedStyle(z).paddingLeft
      return /^\d/.test(pl) && z.children.length >= 1
        && z.querySelector('span') && !z.querySelector('table')
    })
  const stufen = {}
  for (const z of zeilen) {
    const pl = Math.round(parseFloat(getComputedStyle(z).paddingLeft))
    const txt = z.querySelector('span')?.textContent?.trim() ?? ''
    if (!txt || txt.length > 40) continue
    ;(stufen[pl] ??= []).push(txt)
  }

  return {
    hier,
    tabellenZeilen: kachel.querySelectorAll('tbody tr').length,
    stufen: Object.fromEntries(Object.entries(stufen)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([k, v]) => [k, { anzahl: v.length, bsp: v.slice(0, 4) }])),
    nichtGezeichnet: (kachel.textContent?.match(/nicht gezeichnet/g) ?? []).length,
  }
})

console.log('\n=== Per-muscle detail ===\n')
if (!d) console.log('  Kachel NICHT gefunden')
else {
  console.log(`  Ueberschrift      ${d.hier ?? '— fehlt —'}`)
  console.log(`  Tabellenzeilen    ${d.tabellenZeilen}`)
  console.log(`  „nicht gez."      ${d.nichtGezeichnet}x`)
  console.log(`\n  Einrueckungsstufen (der Nachweis fuer die Hierarchie):`)
  const st = Object.entries(d.stufen)
  for (const [px, v] of st) {
    console.log(`    ${String(px).padStart(3)}px  ${String(v.anzahl).padStart(3)} Zeilen  ${v.bsp.join(', ').slice(0, 66)}`)
  }
  console.log(`\n  VERSCHIEDENE Stufen: ${st.length}  ${st.length >= 2 ? '-> eingerueckt' : '-> FLACH'}`)
  await p.screenshot({ path: BILD, fullPage: true })
  console.log(`\n  Bild: ${BILD}`)
}
console.log(`\nSeitenfehler: ${fehler.length} ${JSON.stringify(fehler.slice(0, 2))}`)
await b.close()
