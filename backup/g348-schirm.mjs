// G-348: kommt ein manueller Posten in „Wie gestern" mit?
// Buehne auf test-user, NICHT auf dev. Der Rueckbau steht im Skript
// danach (SQL), gezaehlt.
import { chromium } from '@playwright/test'

const B = 'http://127.0.0.1:3200'
const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 1000 } })
const p = await s.newPage()

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', 'test-user@lumeos.local')
await p.fill('input[type=password]', 'LumeosTestUser2026')
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

const raus = {}

const heute = new Date()
const gestern = new Date(heute.getTime() - 86400000)
const iso = (d) => d.toISOString().slice(0, 10)

await p.goto(`${B}/v2/nutrition?tab=diary&datum=${iso(gestern)}`,
  { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
const gesternText = await p.locator('body').innerText()
raus.gestern = {
  posten_da: gesternText.includes('Pasta im Ristorante'),
}
await p.screenshot({ path: 'backup/g348-gestern.png', fullPage: false })

// ── Heute: „Same as yesterday" ─────────────────────────────────────
await p.goto(`${B}/v2/nutrition?tab=diary&datum=${iso(heute)}`,
  { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)

// `[read]` **wieGestern sucht die Mahlzeit MIT DEMSELBEN
// meal_type** — der Posten liegt auf `other` (Sonstiges), also
// zaehlt nur der Knopf dieser Karte.
//
// `[read]` **Ueber den Text der Karte statt ueber ihre Struktur** —
// die Klassennamen sind nicht verlaesslich.
raus.knopf_da = await p.getByRole('button', { name: /Same as yesterday/i }).count()
raus.geklickt = await p.evaluate(() => {
  const knoepfe = [...document.querySelectorAll('button')]
    .filter(b => /Same as yesterday/i.test(b.textContent ?? ''))
  for (const b of knoepfe) {
    // Die naechste Karte aufwaerts, egal wie sie heisst.
    let n = b.parentElement
    for (let i = 0; i < 6 && n; i += 1) {
      const t = n.textContent ?? ''
      if (/Snack/.test(t) && t.length < 400) {
        b.scrollIntoView(); b.click(); return 'Snack'
      }
      n = n.parentElement
    }
  }
  return null
})
await p.waitForTimeout(5000)

const heuteText = await p.locator('body').innerText()
raus.karten_heute = heuteText.split(String.fromCharCode(10))
  .filter(z => /^(Frühstück|Mittagessen|Abendessen|Snack|Sonstiges|Vor dem|Nach dem)/.test(z.trim()))
  .slice(0, 8)
raus.heute = {
  posten_uebernommen: heuteText.includes('Pasta im Ristorante'),
  kcal_da: /450/.test(heuteText),
}
await p.screenshot({ path: 'backup/g348-heute.png', fullPage: false })

console.log(JSON.stringify(raus, null, 2))
await b.close()
