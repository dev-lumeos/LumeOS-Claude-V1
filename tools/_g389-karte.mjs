// G-389/A4 - zeigt die Rotationskarte die Flaeche als benutzt?
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const ZIEL = process.argv[2] ?? 'http://localhost:3200'
const b = await chromium.launch()
const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1680, height: 1400 } })
const p = await c.newPage()
await p.goto(`${ZIEL}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'test-user@lumeos.local')
await p.fill('input[type=password]', wortFuer('test-user@lumeos.local'))
await p.click('button[type=submit]')
await p.waitForURL(u => !u.pathname.includes('login'), { timeout: 25000 })
await p.goto(`${ZIEL}/v2/supplements?tab=injection`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2000)
const d = await p.evaluate(() => {
  const t = document.body.innerText
  // Die Protokollzeilen des Reiters.
  const zeilen = [...document.querySelectorAll('table tbody tr')]
    .map(r => r.innerText.replace(/\s+/g, ' ').trim()).slice(0, 6)
  return {
    // `[cmd]` **DER Satz, der an den ECHTEN Zeilen haengt**
    // (`protokoll.length === 0`, tab-injektionen.tsx:282).
    satzKeineInjektion: /Noch keine Injektion erfasst/.test(t),
    nenntGluteal: /gluteal/i.test(t),
    zeilen,
  }
})
console.log(JSON.stringify(d, null, 1).slice(0, 700))
await b.close()
