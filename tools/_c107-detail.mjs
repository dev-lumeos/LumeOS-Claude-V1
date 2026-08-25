// C-107: zeigt das Detail WADA und die Warnschwellen — und was bei
// einer Substanz mit Luecken?
//
// `[cmd]` Zwei Substanzen, beide namentlich aus der Datenbank gezogen:
//   sub_9f9bb8c160 Creatine monohydrate — WADA not_prohibited,
//      dose_ceiling mit ISSN-Beleg, Quality-Zeile vorhanden
//   sub_906d55f873 1-Testosterone — WADA prohibited, dose_ceiling
//      JSON-null, KEINE Quality-Zeile
import { chromium } from '@playwright/test'
import { wortFuer } from './konten.mjs'

const BASIS = process.env.LUMEOS_BASIS ?? 'http://127.0.0.1:3200'
const KONTO = process.env.LUMEOS_KONTO ?? 'test-user@lumeos.local'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const seite = await ctx.newPage()

await seite.goto(`${BASIS}/login`, { waitUntil: 'networkidle', timeout: 60_000 })
await seite.fill('input[type=email]', KONTO)
await seite.fill('input[type=password]', wortFuer(KONTO))
await Promise.all([
  seite.waitForURL(u => !u.pathname.includes('login'), { timeout: 60_000 }),
  seite.click('button[type=submit]'),
])

for (const [slug, name] of [
  ['sub_9f9bb8c160', 'Creatine monohydrate'],
  ['sub_906d55f873', '1-Testosterone'],
]) {
  const r = await seite.evaluate(async (s) => {
    const a = await fetch(`/api/supplements/substanz?id=${s}`)
    const j = await a.json()
    return { ok: a.ok, satz: j.satz ?? null, fehler: j.error ?? null }
  }, slug)

  console.log(`\n=== ${name} (${slug}) ===`)
  if (!r.ok || !r.satz) { console.log(`  FEHLER: ${r.fehler}`); continue }
  const s = r.satz
  console.log(`  wada_status      : ${JSON.stringify(s.wada_status)}`)
  const wt = s.warning_triggers
  console.log(`  warning_triggers : ${wt ? Object.keys(wt).join(', ') : 'null'}`)
  if (wt?.dose_ceiling) {
    const c = wt.dose_ceiling
    console.log(`    dose_ceiling   : ${typeof c === 'object' ? JSON.stringify(c).slice(0, 90) : c}`)
  } else {
    console.log('    dose_ceiling   : (nicht dabei — richtig, wenn JSON-null)')
  }
  if (wt?.no_ceiling_reason_en) {
    console.log(`    no_ceiling_reason: ${String(wt.no_ceiling_reason_en).slice(0, 70)}`)
  }
  console.log(`  quality          : ${s.quality ? 'vorhanden' : 'null (Luecke)'}`)
  console.log(`  safety           : ${s.safety ? 'vorhanden' : 'null'}`)
}

await browser.close()
