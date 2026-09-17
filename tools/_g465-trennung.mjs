// G-465 — der Kurzspeicher darf NICHT zwischen Nutzern lecken.
//
// [read] Allergien sind Gesundheitsdaten. Der Speicher liegt im
// Modul, also im SERVER — er ueberlebt den Nutzerwechsel. Diese
// Probe fragt dieselbe Route mit zwei Sitzungen und vergleicht.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const BASIS='http://127.0.0.1:3200'
const b = await chromium.launch({ headless: true })

async function frage(konto) {
  const k = await b.newContext()            // eigene Sitzung, eigene Kekse
  const s = await k.newPage()
  await s.goto(`${BASIS}/login`, { waitUntil:'networkidle' })
  if (await s.locator('input[type=email]').count()) {
    await s.fill('input[type=email]', konto)
    await s.fill('input[type=password]', wortFuer(konto))
    await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')),
                       s.click('button[type=submit]')])
  }
  const r = await s.evaluate(async () => {
    const a = await fetch('/api/supplements/produkte?seite=0&status=alle')
    const j = await a.json()
    return { allergieProdukte: j.allergieProdukte ?? null, zeilen: j.zeilen?.length ?? 0 }
  })
  await k.close()
  return r
}

// dev zuerst — der fuellt den Speicher mit 56.934 Ids.
const dev = await frage('dev@lumeos.app')
const test = await frage('test-user@lumeos.local')
const devNochmal = await frage('dev@lumeos.app')

console.log(JSON.stringify({
  dev, test, devNochmal,
  // Die Sache: bekommt der zweite Nutzer die Liste des ersten?
  getrennt: dev.allergieProdukte !== test.allergieProdukte
    || dev.allergieProdukte === 0,
  devStabil: dev.allergieProdukte === devNochmal.allergieProdukte,
}, null, 2))
await b.close()
