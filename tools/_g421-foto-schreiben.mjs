// G-421/A4 - schreibt das LogPhotoModal in `goals.progress_photos`?
//
// `[read]` **Die Frage ist nicht, ob ein Knopf da ist** - sondern ob
// danach eine ZEILE da ist. **Vorher zaehlen, klicken, nachher
// zaehlen.**
//
// `[cmd]` **Laeuft auf `test-user@lumeos.local`** - eine Klickprobe
// schreibt mit, und Laeufe auf `dev` ueberschreiben Toms
// Einstellungen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = process.argv[3] ?? 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()

const fehler = []
p.on('console', m => { if (m.type() === 'error') fehler.push(m.text().slice(0, 160)) })
p.on('pageerror', e => fehler.push(`SEITENFEHLER: ${String(e).slice(0, 160)}`))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

await p.goto(`${ZIEL}/v2/goals?tab=measure`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

// Das Modal oeffnen - die Vorlage nennt den Knopf „New photo session".
// `[cmd]` **Der Knopf heisst „New session"** wie in der Vorlage
// (`module-goals.jsx:516`) - „New photo session" ist der
// Modal-TITEL, nicht der Ausloeser.
const knopf = p.locator('button', { hasText: /^New session$/i }).first()
const da = await knopf.count()
console.log(`Knopf „New photo session": ${da > 0 ? 'gefunden' : 'NICHT GEFUNDEN'}`)
if (da === 0) {
  // Wo steht er sonst?
  const alle = await p.evaluate(() => [...document.querySelectorAll('button')]
    .map(x => x.innerText.trim().split('\n')[0]).filter(Boolean).slice(0, 30))
  console.log('Knoepfe am Schirm:', alle.join(' | '))
  await b.close()
  process.exit(1)
}
await knopf.click()
await p.waitForTimeout(900)

// Ein Bild erzeugen und in „Front" legen.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64')
await p.setInputFiles('input[aria-label="Front"]',
  { name: 'front.png', mimeType: 'image/png', buffer: png })
await p.waitForTimeout(400)

const speichern = p.locator('button', { hasText: /Save session|Speichert/i }).first()
console.log(`Knopf „Save session" aktiv: ${!(await speichern.isDisabled())}`)
await speichern.click()
await p.waitForTimeout(3500)

const text = await p.evaluate(() => document.body.innerText)
const erfolg = text.match(/\d+ Fotos? in goals\.progress_photos gespeichert/)
const misserfolg = text.match(/Nicht gespeichert:[^\n]*/)
console.log(`\nRueckmeldung: ${erfolg?.[0] ?? misserfolg?.[0] ?? '(keine)'}`)
if (fehler.length) console.log(`Konsole: ${fehler.slice(0, 3).join(' | ')}`)

await p.screenshot({ path: 'docs/bilder/g421/foto-modal.png' })
await b.close()
