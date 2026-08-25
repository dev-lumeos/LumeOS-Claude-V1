// G-157: die GERENDERTE Seite messen — mit Sitzung und ohne.
//
// Quelltextzahl und Renderzahl liegen auseinander (G-161: 5 gegen 4),
// deshalb wird hier der Browser gefragt, nicht `rg`.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const WORT = wortFuer('test-user@lumeos.local')

const browser = await chromium.launch()

async function messen(seite, tab) {
  await seite.goto(`${BASIS}/v2/nutrition?tab=${tab}`,
    { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.waitForTimeout(1200)
  return await seite.evaluate(() => {
    const t = (document.body.textContent ?? '').replace(/\s+/g, ' ')
    return {
      attrappen: (t.match(/Attrappe/g) ?? []).length,
      hinweis: /eine leere Fläche ist ehrlicher/.test(t),
      // Die Spuren des alten Entwurfs — duerfen NIRGENDS auftauchen.
      entwurfNutrients: /Fake 14-day trend/.test(t) || /Nutrient Analysis/i.test(t),
      entwurfPrefs: /die Schalter schreiben nichts/.test(t),
      // Die echten Zweige.
      echteOrdnung: /aus nutrition\.nutrient_defs/.test(t),
      echteVorlieben: /aus nutrition\.food_preferences/.test(t),
      laenge: t.length,
    }
  })
}

// `[cmd]` **Gemessen 2026-08-23:** `dev@lumeos.app` hat 1 Vorlieben-Satz,
// `test-user@lumeos.local` hat 0 — beide sehen dieselben 138
// `nutrient_defs`. Damit trennt das Konto die beiden Zweige:
// dev -> echt, test-user -> Hinweis.
const KONTEN = [['dev@lumeos.app', 'LumeosDev2026']]

for (const [lage, anmelden] of [['OHNE Sitzung', false], ['MIT Sitzung', true]]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const seite = await ctx.newPage()
  if (!anmelden) {
    // `[cmd]` Ohne Sitzung leitet der Server auf /login um — der Tab
    // wird nie gerendert. Der Rueckfall ist SO nicht ausloesbar.
    await seite.goto(`${BASIS}/v2/nutrition?tab=nutrients`,
      { waitUntil: 'networkidle', timeout: 60_000 })
    console.log(`\n=== ${lage} (anonym) ===`)
    console.log(`  Server leitet um auf: ${new URL(seite.url()).pathname}`)
    console.log('  -> Der Tab wird nicht gerendert. Der Rueckfall ist ueber')
    console.log('     eine fehlende Sitzung NICHT ausloesbar; der leere Zweig')
    console.log('     greift nur bei angemeldetem Konto ohne Daten.')
    await ctx.close()
    continue
  }
  await ctx.close()
}

for (const [konto, wort] of KONTEN) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const seite = await ctx.newPage()
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  await seite.fill('input[type=email]', konto)
  await seite.fill('input[type=password]', wort)
  await Promise.all([
    seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
    seite.click('button[type=submit]'),
  ]).catch(() => {})
  const drin = !seite.url().includes('/login')
  console.log(`\n=== MIT Sitzung: ${konto} ${drin ? '' : '(ANMELDUNG FEHLGESCHLAGEN)'} ===`)
  if (!drin) { await ctx.close(); continue }
  for (const tab of ['nutrients', 'prefs']) {
    const d = await messen(seite, tab)
    console.log(`  ${tab.padEnd(10)} Attrappen ${String(d.attrappen).padStart(2)}`
      + `  Hinweis ${d.hinweis ? 'ja  ' : 'nein'}`
      + `  Entwurf-nut ${d.entwurfNutrients ? 'JA!' : 'nein'}`
      + `  Entwurf-prefs ${d.entwurfPrefs ? 'JA!' : 'nein'}`
      + `  echt(ord/vor) ${d.echteOrdnung ? 'j' : 'n'}/${d.echteVorlieben ? 'j' : 'n'}`
      + `  ${d.laenge} Z`)
  }
  await ctx.close()
}
await browser.close()
