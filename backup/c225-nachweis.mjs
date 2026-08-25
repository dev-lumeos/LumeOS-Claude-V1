// C-225-Nachweis als test-user@lumeos.local (G-175: ohne Kopierschritt).
// Weg 1: Einladen (relationships invited, Ziel coach.seed)
// Weg 2: Antworten in der neuen Beziehung (messages INSERT)
// Weg 3 (nach SQL-Fremdnachricht, zweiter Aufruf --gelesen): Als gelesen.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const BASIS = 'http://localhost:3200'
const KONTO = 'test-user@lumeos.local'
const COACH_SEED = '10000000-0000-0000-0000-000000000901'
const nurGelesen = process.argv.includes('--gelesen')

const browser = await chromium.launch({ headless: true })
const seite = await browser.newPage({ viewport: { width: 1440, height: 900 } })

try {
  await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
  if (await seite.locator('input[type=email]').count()) {
    await seite.fill('input[type=email]', KONTO)
    await seite.fill('input[type=password]', wortFuer(KONTO))
    await Promise.all([
      seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
      seite.click('button[type=submit]'),
    ])
  }

  if (!nurGelesen) {
    // Weg 1: Einladen.
    await seite.goto(`${BASIS}/v2/coach/human?tab=overview`, { waitUntil: 'networkidle', timeout: 120_000 })
    await seite.fill('[aria-label="Coach-Kennung"]', COACH_SEED)
    await seite.fill('[aria-label="Einladungsnotiz"]', 'C-225-Nachweis')
    await seite.click('button:has-text("Einladen")')
    await seite.waitForSelector('text=Einladung angelegt', { timeout: 30_000 })
    console.log('EINGELADEN')
    await seite.reload({ waitUntil: 'networkidle' })
    await seite.screenshot({ path: 'backup/c225-eingeladen.png' })

    // Weg 2: Antworten im (noch nachrichtenlosen) Thread.
    await seite.goto(`${BASIS}/v2/coach/human?tab=messages`, { waitUntil: 'networkidle', timeout: 120_000 })
    await seite.fill('[aria-label="Antwort"]', 'C-225-Testnachricht')
    await seite.click('button:has-text("Senden")')
    await seite.waitForSelector('text=Gesendet.', { timeout: 30_000 })
    console.log('GESENDET')
    await seite.screenshot({ path: 'backup/c225-gesendet.png' })
  } else {
    // Weg 3: die fremde (per SQL eingespielte) Nachricht als gelesen.
    await seite.goto(`${BASIS}/v2/coach/human?tab=messages`, { waitUntil: 'networkidle', timeout: 120_000 })
    await seite.click('button:has-text("Als gelesen")')
    await seite.waitForTimeout(2000)
    console.log('GELESEN-KLICK')
    await seite.screenshot({ path: 'backup/c225-gelesen.png' })
  }
} finally {
  await browser.close()
}
