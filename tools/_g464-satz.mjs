// G-464 — der Leseweg je Produkt-ID, ohne den Schirm.
//
// Aufruf:  node tools/_g464-satz.mjs <produkt-id>
//
// [cmd] Zwei Produkte heissen „Serious Mass Vanilla" (85 und 46
// Zeilen). Ueber den Namen zu suchen traf das falsche, und die
// Messung beschrieb ein anderes Produkt als die SQL-Zahlen.
// [read] Deshalb wird hier die ID gefragt — dieselbe Route, die die
// Tafel benutzt (`/api/supplements/produkt?id=`).
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const KONTO = process.env.LUMEOS_KONTO ?? 'dev@lumeos.app'
const BASIS = 'http://127.0.0.1:3200'
const ID = process.argv[2] ?? '0351cf6e-efb6-4960-bd85-caaceb73cba2'

const b = await chromium.launch({ headless: true })
const k = await b.newContext()
const s = await k.newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO)
  await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([
    s.waitForURL(u => !u.pathname.includes('login')),
    s.click('button[type=submit]'),
  ])
}

const j = await s.evaluate(async (id) => {
  const a = await fetch(`/api/supplements/produkt?id=${encodeURIComponent(id)}`)
  return { status: a.status, body: await a.json() }
}, ID)

const satz = j.body?.satz
if (!satz) {
  console.log(JSON.stringify({ id: ID, status: j.status, fehler: j.body }, null, 2))
  await b.close()
  process.exit(1)
}

const inhalt = satz.inhalt ?? []
const klassen = {}
for (const z of inhalt) {
  const k = z.content_class ?? '(ohne)'
  klassen[k] = (klassen[k] ?? 0) + 1
}
const namen = new Map()
for (const z of inhalt) {
  namen.set(z.ingredient_name, (namen.get(z.ingredient_name) ?? 0) + 1)
}
const TOMS = /^(Calcium|Vitamin C|Iron|Zinc|Thiamin|Biotin|Vitamin A|Total Fat|Protein)$/i

console.log(JSON.stringify({
  id: ID,
  name: satz.name_en,
  status: j.status,
  zeilen: inhalt.length,
  markiert: inhalt.filter(z => z.bekannt).length,
  // [read] Die ALTE Regel laesst sich hier NICHT nachrechnen:
  // `supplement_id` steht nicht in `InhaltsZeile`, und
  // `z.supplement_id` waere `undefined` — also 0, und das saehe aus
  // wie eine Messung. Die Vorher-Zahl kommt aus der Datenbank
  // (SQL, siehe Bericht), nicht von hier.
  klassenWirkstoff: inhalt.filter(z => z.content_class === 'wirkstoff').length,
  klassen,
  toms: inhalt.filter(z => TOMS.test(z.ingredient_name)).map(z => ({
    name: z.ingredient_name,
    kategorie: z.ingredient_category,
    klasse: z.content_class,
    markiert: z.bekannt,
  })),
  doppelte: {
    verschiedeneNamen: namen.size,
    inDubletten: [...namen.values()].filter(n => n > 1).reduce((a, n) => a + n, 0),
  },
}, null, 2))
await b.close()
