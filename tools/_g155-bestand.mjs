// G-155: Jede Kachel jedes Moduls, hell und dunkel.
//
// Nur Messen — kein Code wird angefasst. Je Aufruf zwei Laeufe
// (A-45), damit ein Kaltstart von einem Befund zu unterscheiden ist.
//
// Eine Anmeldung fuer alle Aufrufe: `schuss.mjs` meldet sich je
// Aufruf neu an, das waere bei 124 Aufrufen die halbe Laufzeit.
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const WORT = process.env.LUMEOS_WORT ?? 'LumeosDev2026'
const ZIEL = 'backup/bestand'
const SCHWELLE_MS = 300

/** Die Tabs je Modul — aus `ansicht.tsx` gelesen, nicht geraten. */
const MODULE = {
  dashboard: [null],
  nutrition: ['diary', 'insights', 'nutrients', 'foods', 'plans', 'prefs', 'planner'],
  training: ['today', 'plan', 'history', 'library', 'progress',
             'landmarks', 'standards', 'calendar', 'hrzones', 'offline'],
  recovery: ['today', 'checkin', 'muscles', 'hrv', 'sleep',
             'modalities', 'overtraining', 'protocols', 'stress'],
  supplements: ['today', 'stack', 'extended', 'catalog', 'stacks', 'intel',
                'inventory', 'injection', 'compliance', 'interactions', 'cost'],
  goals: ['goals', 'phase', 'tdee', 'cross', 'timeline',
          'metrics', 'measure', 'comp', 'physique', 'poses'],
  medical: ['dashboard', 'biomarkers', 'import', 'tracking', 'insights'],
  coach: ['overview', 'coaches', 'permissions', 'proposals', 'autonomy',
          'checkins', 'messages', 'notes', 'invites', 'onboard'],
  settings: [null],
}

mkdirSync(ZIEL, { recursive: true })
const browser = await chromium.launch()
const aufnahme = []

for (const modus of ['hell', 'dunkel']) {
  const kontext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: modus === 'dunkel' ? 'dark' : 'light',
  })
  const seite = await kontext.newPage()

  const fehler = []
  seite.on('console', m => { if (m.type() === 'error') fehler.push(m.text()) })

  let sammler = null
  seite.on('requestfinished', a => {
    if (!sammler) return
    try {
      const t = a.timing()
      if (t && t.responseEnd >= 0) {
        sammler.push({ url: a.url().replace(BASIS, ''),
                       ms: Math.round(t.responseEnd), typ: a.resourceType() })
      }
    } catch { /* Timing nicht mehr abfragbar */ }
  })

  // Einmal anmelden, dann alle Tabs in derselben Sitzung.
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  if (await seite.locator('input[type=email]').count()) {
    await seite.fill('input[type=email]', KONTO)
    await seite.fill('input[type=password]', WORT)
    await Promise.all([
      seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
      seite.click('button[type=submit]'),
    ])
  }

  async function laden(url) {
    const anfragen = []
    sammler = anfragen
    const t0 = Date.now()
    await seite.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
    const ms = Date.now() - t0
    sammler = null
    const langsamste = anfragen.filter(a => a.ms > SCHWELLE_MS)
      .sort((a, b) => b.ms - a.ms).slice(0, 2)
    return { ms, anfragen: anfragen.length, langsamste }
  }

  for (const [modul, tabs] of Object.entries(MODULE)) {
    for (const tab of tabs) {
      const pfad = tab ? `/v2/${modul}?tab=${tab}` : `/v2/${modul}`
      const name = tab ? `${modul}-${tab}` : modul
      const datei = `${ZIEL}/${name}-${modus}.png`
      try {
        const lauf1 = await laden(`${BASIS}${pfad}`)
        fehler.length = 0          // Meldungen des ersten Laufs verwerfen
        const lauf2 = await laden(`${BASIS}${pfad}`)
        await seite.waitForTimeout(700)

        const marken = await seite.locator('text=/Attrappe/i').count()
        const titel = await seite.title()
        await seite.screenshot({ path: datei, fullPage: true })

        const zeile = {
          modul, tab, modus, pfad, datei, titel,
          attrappen: marken,
          konsolenfehler: fehler.length,
          fehler: fehler.slice(0, 3).map(f => f.slice(0, 140)),
          ms_lauf1: lauf1.ms, ms_lauf2: lauf2.ms,
          anfragen: lauf1.anfragen,
          langsamste: lauf1.langsamste,
        }
        aufnahme.push(zeile)
        console.log(`${name.padEnd(26)} ${modus.padEnd(7)}`
          + ` ${String(lauf1.ms).padStart(5)} / ${String(lauf2.ms).padStart(5)} ms`
          + `  Attr ${String(marken).padStart(2)}  Fehler ${fehler.length}`)
      } catch (e) {
        const zeile = { modul, tab, modus, pfad, datei: null,
                        fehlgeschlagen: String(e).slice(0, 160) }
        aufnahme.push(zeile)
        console.log(`${name.padEnd(26)} ${modus.padEnd(7)} FEHLGESCHLAGEN`)
      }
    }
  }
  await kontext.close()
}

writeFileSync(`${ZIEL}/aufnahme.json`, JSON.stringify(aufnahme, null, 2))
console.log(`\n${aufnahme.length} Aufnahmen -> ${ZIEL}/aufnahme.json`)
await browser.close()
