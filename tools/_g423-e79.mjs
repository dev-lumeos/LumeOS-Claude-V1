// G-423/A5+A6 - E-79 am Schirm.
//
// **Tom:** *„wenn er triceps waehlt weil er lokal ein tendonproblem
// hat, dann zeigen wir den triceps und keinen rotationsvorschlag,
// weil nur triceps vorhanden ist."*
//
// `[read]` **Zwei Zustaende, zwei Fotos:** eine Flaeche -> kein
// Vorschlag; zwei -> einer.
//
// `[cmd]` **Laeuft auf `test-user@lumeos.local`** - eine Klickprobe
// schreibt mit, und Laeufe auf `dev` ueberschreiben Toms
// Einstellungen.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const KONTO = 'test-user@lumeos.local'

const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()

const fehler = []
p.on('pageerror', e => fehler.push(String(e).slice(0, 160)))

await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })

/** Was die Kachel zeigt. */
const lage = () => p.evaluate(() => {
  const karte = [...document.querySelectorAll('.v2-card')].find(k =>
    (k.querySelector('h3, h2, .v2-card-title')?.textContent ?? '')
      .includes('Injektionspunkte'))
  if (!karte) return { da: false }
  const t = karte.innerText.replace(/\s+/g, ' ')
  return {
    da: true,
    unter: karte.querySelector('[class*=sub]')?.textContent?.trim() ?? null,
    vorschlag: (t.match(/Nächster Vorschlag: (\w+)/) ?? [])[1] ?? null,
    keinVorschlag: t.includes('Kein Rotationsvorschlag'),
    text: t.slice(0, 260),
  }
})

async function flaecheWaehlen(flaeche, gauge, laenge) {
  await p.selectOption('select[aria-label="Substanz"]', { index: 1 })
  await p.waitForTimeout(300)
  await p.selectOption('select[aria-label="Fläche"]', flaeche)
  await p.fill('input[aria-label="Nadelstärke"]', gauge)
  await p.fill('input[aria-label="Nadellänge"]', laenge)
  await p.click('button:has-text("Fläche hinzufügen")')
  await p.waitForTimeout(2600)
}

await p.goto(`${ZIEL}/v2/supplements?tab=injection`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1600)
console.log('VORHER (nichts konfiguriert):')
console.log(' ', JSON.stringify(await lage()).slice(0, 300))

// ── EINE Flaeche: Triceps, wie in Toms Beispiel ──────────────────
await flaecheWaehlen('triceps', '29G', '0.5')
const eine = await lage()
console.log('\nEINE Flaeche (triceps):')
console.log('  Unterzeile:  ', eine.unter)
console.log('  Vorschlag:   ', eine.vorschlag ?? '(keiner)')
console.log('  Satz da:     ', eine.keinVorschlag ? 'JA' : 'NEIN')
await p.screenshot({ path: 'docs/bilder/g423/e79-eine-flaeche.png', fullPage: true })

// ── ZWEI Flaechen: jetzt muss ein Vorschlag kommen ───────────────
await flaecheWaehlen('abs', '29G', '0.5')
const zwei = await lage()
console.log('\nZWEI Flaechen (triceps + abs):')
console.log('  Unterzeile:  ', zwei.unter)
console.log('  Vorschlag:   ', zwei.vorschlag ?? '(keiner)')
console.log('  Satz da:     ', zwei.keinVorschlag ? 'JA' : 'NEIN')
await p.screenshot({ path: 'docs/bilder/g423/e79-zwei-flaechen.png', fullPage: true })

console.log('\n-- URTEIL --')
console.log(eine.keinVorschlag && !eine.vorschlag && zwei.vorschlag && !zwei.keinVorschlag
  ? 'E-79 GILT: eine Flaeche -> kein Vorschlag, zwei -> einer.'
  : 'E-79 NICHT belegt.')
if (fehler.length) console.log('SEITENFEHLER:', fehler.slice(0, 2))

await b.close()
