// G-222: was sieht ein Nutzer OHNE alles? Nur lesend, test-user.
import { chromium } from '@playwright/test'
import { wortFuer } from '../tools/konten.mjs'

const KONTO = process.argv[2] ?? 'test-user@lumeos.local'
const MARKE = process.argv[3] ?? 'leer'
const B = 'http://127.0.0.1:3200'

const b = await chromium.launch()
const s = await b.newContext({ viewport: { width: 1400, height: 1100 } })
const p = await s.newPage()

const konsole = []
p.on('console', m => { if (m.type() === 'error') konsole.push(m.text().slice(0, 120)) })

await p.goto(`${B}/login`, { waitUntil: 'networkidle' })
await p.fill('input[type=email]', KONTO)
await p.fill('input[type=password]', wortFuer(KONTO))
await Promise.all([
  p.waitForURL(u => !u.pathname.includes('login'), { timeout: 60000 }),
  p.click('button[type=submit]'),
])

const SEITEN = [
  ['diary', '/v2/nutrition?tab=diary'],
  ['planner', '/v2/nutrition?tab=planner'],
  ['nutrients', '/v2/nutrition?tab=nutrients'],
  ['foods', '/v2/nutrition?tab=foods'],
  ['einkauf', '/v2/nutrition?tab=einkauf'],
  ['rezepte', '/v2/nutrition?tab=rezepte'],
]

const raus = []
for (const [name, pfad] of SEITEN) {
  const vorher = konsole.length
  const t0 = Date.now()
  await p.goto(`${B}${pfad}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(2200)
  const txt = await p.locator('body').innerText()

  // Was steht da? Leerzustaende, Fehlerworte, Zahlen.
  raus.push({
    tab: name,
    ms: Date.now() - t0,
    zeichen: txt.length,
    leerhinweis: /noch (keine|kein)|liegt kein|gibt es noch|Leg /i.test(txt),
    fehlerwort: /Fehler|fehlgeschlagen|Something went wrong|undefined|NaN/i.test(txt),
    nan: /NaN/.test(txt),
    konsolenfehler: konsole.length - vorher,
    // Der Inhalt, nicht die Navigation — sonst misst man das Menue.
    kopf: await p.locator('main, [role=main]').first().innerText()
      .then(m => m.split('\n').map(z => z.trim())
        .filter(z => z.length > 3).slice(0, 14))
      .catch(() => ['(kein main)']),
    fehlerstelle: (txt.match(/[^\n]{0,70}(Fehler|fehlgeschlagen)[^\n]{0,70}/gi)
      ?? []).slice(0, 3),
  })
  await p.screenshot({ path: `backup/g222-${MARKE}-${name}.png`, fullPage: false })
}

console.log(JSON.stringify({ konto: KONTO, seiten: raus }, null, 2))
await b.close()
