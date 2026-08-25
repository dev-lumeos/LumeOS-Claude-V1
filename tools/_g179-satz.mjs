// G-179: liefert der Lesepfad die Nutzertexte, Fragen und Formen?
//
// `[read]` Typecheck sagt nichts ueber PostgREST — eine falsche
// Einbettung faellt erst zur Laufzeit auf (gelernt in C-252).
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'
const SLUGS = (process.env.LUMEOS_SLUGS
  ?? 'magnesium,biotin,sub_906d55f873').split(',')

const browser = await chromium.launch()
const seite = await (await browser.newContext()).newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
await seite.fill('input[type=email]', KONTO)
await seite.fill('input[type=password]', wortFuer(KONTO))
await Promise.all([
  seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
  seite.click('button[type=submit]'),
])

for (const slug of SLUGS) {
  const r = await seite.evaluate(async (s) => {
    const a = await fetch(`/api/supplements/substanz?id=${s}`)
    const j = await a.json()
    return { ok: a.ok, satz: j.satz ?? null, fehler: j.error ?? null }
  }, slug)

  console.log(`\n=== ${slug} ===`)
  if (!r.ok || !r.satz) { console.log(`  FEHLER: ${r.fehler}`); continue }
  const s = r.satz
  console.log(`  Name        : ${s.canonical_name}`)
  console.log(`  Gruppe      : ${s.gruppe}   Grad: ${s.evidence?.overall_grade ?? '—'}`)
  console.log(`  WADA        : ${s.wada_status ?? '—'}`)
  const t = s.texte
  if (!t) {
    console.log('  texte       : NULL — keine Nutzertextzeile')
  } else {
    for (const [k, v] of Object.entries(t)) {
      const wert = Array.isArray(v) ? (v.length ? `[${v.length}] ${v[0]}` : '—')
        : (v ? String(v).slice(0, 58) : '—')
      console.log(`    ${k.padEnd(20)} ${wert}`)
    }
  }
  console.log(`  fragen      : ${s.fragen?.length ?? 0}`)
  if (s.fragen?.length) console.log(`    1. ${s.fragen[0].frage.slice(0, 60)}`)
  console.log(`  formen      : ${s.formen?.length ?? 0}`)
  for (const f of (s.formen ?? []).slice(0, 3)) {
    console.log(`    ${f.name.padEnd(34)} ${f.grad ?? '—'}  ${(f.hinweis ?? '').slice(0, 40)}`)
  }
}

await browser.close()
