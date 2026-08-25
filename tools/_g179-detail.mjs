// G-179: was zeigt das Detailfenster wirklich? (Spezifikation §9)
//
// `[read]` Gemessen wird die GERENDERTE Seite, nicht der Quelltext —
// bei G-161 lagen Quelltextzahl und Renderzahl auseinander.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'

// Name in der Liste -> was geprueft wird.
const PROBEN = (process.env.LUMEOS_PROBEN ?? [
  'Creatine monohydrate', 'Beta-carotene', 'Magnesium', '1-Testosterone',
].join('|')).split('|')

const ABSCHNITTE = ['Zu viel', 'Zu wenig', 'Wie es wirkt', 'Was es bringt',
  'Wann und wie', 'Wer es nicht nehmen sollte', 'Mythen', 'Die Formen',
  'Fragen', 'Was nicht zurückkommt', 'Überwachung', 'Reinheit',
  'Übliche Menge', 'Obergrenze', 'Einnahme']

const VERBOTEN = [
  ['Lueckenbericht (G-177)', /Ohne Quelle im neuen Katalog/],
  ['Schemageschichte', /Breittabelle|jsonb|keine Spalte/],
  ['Slug unter dem Namen', /sub_[0-9a-f]{10}/],
  ['Feldzahl-Anriss', /\d+ Felder/],
  ['JSON-null als Wert', /(^|[\s>])null([\s<]|$)/],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const seite = await ctx.newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
await seite.fill('input[type=email]', KONTO)
await seite.fill('input[type=password]', wortFuer(KONTO))
await Promise.all([
  seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
  seite.click('button[type=submit]'),
])
await seite.goto(`${BASIS}/v2/supplements?tab=database`,
  { waitUntil: 'networkidle', timeout: 90_000 })
await seite.waitForTimeout(2000)

// ── Die Liste (G-176) ───────────────────────────────────────────────
const liste = await seite.evaluate(() => {
  const zeilen = document.querySelectorAll('.v2-tbl tbody tr')
  const t = (document.body.textContent ?? '').replace(/\s+/g, ' ')
  const letzte = zeilen[zeilen.length - 1]
  return {
    zeilen: zeilen.length,
    fuss: (t.match(/\d+ von \d+ Einträgen[^·]*·?\s*[a-z_.]*/) ?? ['(keine)'])[0],
    verfeinern: /Suche verfeinern/.test(t),
    letzte: (letzte?.querySelector('td div')?.textContent ?? '').trim(),
  }
})
console.log('=== Die Liste (G-176) ===')
console.log(`  Zeilen im DOM : ${liste.zeilen}`)
console.log(`  Fusszeile     : ${liste.fuss}`)
console.log(`  „verfeinern"  : ${liste.verfeinern ? 'JA (Fehler)' : 'nein'}`)
console.log(`  letzte Zeile  : ${liste.letzte}`)

// ── Die Detailfenster (G-177, C-107, §9) ────────────────────────────
for (const name of PROBEN) {
  const zeile = seite.locator(`.v2-tbl tbody tr:has-text("${name}")`).first()
  if (!await zeile.count()) { console.log(`\n=== ${name}: NICHT in der Liste ===`); continue }
  await zeile.click()
  await seite.waitForSelector('[role=dialog]', { timeout: 30_000 })
  await seite.waitForTimeout(800)

  const d = await seite.evaluate((abschnitte) => {
    const dlg = document.querySelector('[role=dialog]')
    const t = (dlg?.textContent ?? '').replace(/\s+/g, ' ')
    const kopf = (dlg?.querySelector('.v2-modal-h')?.textContent ?? '')
      .replace(/\s+/g, ' ').trim()
    const rumpf = dlg?.querySelector('.v2-modal-body')
    const erster = (rumpf?.querySelector('p')?.textContent ?? '').trim()
    return {
      kopf,
      ersterSatz: erster.slice(0, 96),
      gezeigt: abschnitte.filter(a => t.includes(a)),
      laenge: t.length,
      text: t,
    }
  }, ABSCHNITTE)

  console.log(`\n=== ${name} ===`)
  console.log(`  Kopf        : ${d.kopf.slice(0, 88)}`)
  console.log(`  Erster Satz : ${d.ersterSatz}`)
  console.log(`  Abschnitte  : ${d.gezeigt.join(' · ') || '(keine)'}`)
  for (const [was, muster] of VERBOTEN) {
    if (muster.test(d.text)) console.log(`  VERBOTEN    : ${was} erscheint!`)
  }
  await seite.keyboard.press('Escape').catch(() => {})
  await seite.locator('.v2-modal-veil').first().click({ position: { x: 5, y: 5 } })
    .catch(() => {})
  await seite.waitForTimeout(500)
}

await browser.close()
