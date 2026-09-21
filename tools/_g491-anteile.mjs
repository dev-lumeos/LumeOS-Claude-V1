// G-491/A1 -- WELCHER Filter frisst die Treffer?
//
// [read] Die Leermeldung nennt nur die Kategorie -- gespeichert sind
// aber DREI Filter (plus Status). Diese Probe legt sie einzeln an,
// damit der Bericht sagen kann, welcher wieviel nimmt.
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'
const KONTO='dev@lumeos.app', BASIS='http://127.0.0.1:3200'

const WORTE = ['Gold Standard 100% Whey Vanilla Ice Cream','Ultraplex Vitamin D3','Vitamin D3','Creatine','Whey','Micronized Creatine Monohydrate']

// [cmd] Genau der gespeicherte Stand, gemessen 2026-09-21 in
// public.user_display_preferences, Schluessel supplements.produkt_filter.
const FAELLE = [
  ['ohne Filter',            {}],
  ['status=On Market',       { status:'On Market' }],
  ['+ kategorie=protein',    { status:'On Market', kategorie:'protein' }],
  ['+ form=Powder [E0162]',  { status:'On Market', form:'Powder [E0162]' }],
  ['+ marke=Optimum Nutr.',  { status:'On Market', marken:'Optimum Nutrition' }],
  ['ALLE VIER (gespeichert)',{ status:'On Market', kategorie:'protein', form:'Powder [E0162]', marken:'Optimum Nutrition' }],
]

const b = await chromium.launch({ headless: true })
const s = await (await b.newContext()).newPage()
await s.goto(`${BASIS}/login`, { waitUntil: 'networkidle' })
if (await s.locator('input[type=email]').count()) {
  await s.fill('input[type=email]', KONTO); await s.fill('input[type=password]', wortFuer(KONTO))
  await Promise.all([s.waitForURL(u=>!u.pathname.includes('login')), s.click('button[type=submit]')])
}
await s.goto(`${BASIS}/v2/supplements?tab=produkte`, { waitUntil: 'domcontentloaded' })

const aus = await s.evaluate(async ([WORTE, FAELLE]) => {
  const r = []
  for (const q of WORTE) {
    for (const [name, filter] of FAELLE) {
      const p = new URLSearchParams({ q })
      for (const [k, v] of Object.entries(filter)) p.set(k, v)
      if (!p.has('status')) p.set('status', 'alle')
      const a = await fetch(`/api/supplements/produkte?${p}`)
      const j = await a.json().catch(() => null)
      r.push({ q, filter: name, treffer: (j?.zeilen ?? []).length, weg: j?.weg ?? null })
    }
  }
  return r
}, [WORTE, FAELLE])
await b.close().catch(()=>{})

for (const q of WORTE) {
  console.log(`\n"${q}"`)
  for (const z of aus.filter(z => z.q === q)) {
    console.log(`  ${String(z.treffer).padStart(4)}  ${z.weg ?? '-'}  ${z.filter}`)
  }
}
