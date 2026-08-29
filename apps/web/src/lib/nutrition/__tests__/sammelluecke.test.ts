// G-248: der Sammelhinweis statt neun einzelner Zaehler.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { gesamtLueckenSatz } from '../tageslage'

test('G-248: der Sammelsatz nennt beide Zahlen', () => {
  // `[cmd]` **Gemessen 2026-08-29, dev@lumeos.app:** 76 von 138
  // Naehrstoffen unvollstaendig.
  const s = gesamtLueckenSatz({ unvollstaendig: 76, gesamt: 138 })
  assert.match(s, /76 von 138/)
})

test('G-248: er sagt die Richtung des Fehlers', () => {
  // `[read]` „Unvollstaendig" allein genuegt nicht — wer nicht weiss,
  // dass die Summe zu NIEDRIG ist, liest eine Unterdeckung (C-48).
  const s = gesamtLueckenSatz({ unvollstaendig: 3, gesamt: 138 })
  assert.match(s, /zu niedrig/)
})

test('G-248: er verweist auf den Nutrients-Reiter statt aufzuzaehlen', () => {
  // `[read]` **Bei 76 von 138 waere eine Namensliste unlesbar** — und
  // die Frage „welcher" beantwortet der andere Reiter besser.
  const s = gesamtLueckenSatz({ unvollstaendig: 76, gesamt: 138 })
  // `[read]` **Auf den REITER geprueft, nicht auf das Wort** — die
  // erste Fassung suchte „Nährstoffe", und das steht ohnehin im
  // Satz („Bei 76 von 138 Nährstoffen"). Eine Sabotage, die den
  // Verweis durch „steht anderswo" ersetzte, kam durch.
  assert.match(s, /Reiter Nährstoffe/,
    'Der Satz verweist nicht auf den Nutrients-Reiter (G-248).')
})

test('G-248: ohne Luecke kein Satz', () => {
  assert.equal(gesamtLueckenSatz({ unvollstaendig: 0, gesamt: 138 }), '')
  assert.equal(gesamtLueckenSatz(null), '')
})

// ── Die Anzeige haelt sich daran ─────────────────────────────────

const ohneKommentare = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-248: das Tagebuch zeigt den Sammelhinweis', () => {
  // `[read]` **Am Bedingungskopf geprueft, nicht am Vorkommen** —
  // `{false && (` liess den Aufruf im Text stehen und kam durch.
  const s = ohneKommentare('src/app/v2/nutrition/ansicht.tsx')
  assert.match(s, /\{gesamtLueckenSatz\(lueckenGesamt\) && \(/,
    'Der Sammelhinweis haengt nicht mehr an seinem Satz (G-248).')
  assert.doesNotMatch(s, /\{false && \(/,
    'Ein Block ist auf false festgenagelt (G-248).')
})

test('G-248: die Zahl kommt aus einer Abfrage, nicht aus 35 Spalten', () => {
  // `[read]` **35 Spalten in das Tagebuch zu laden waere teurer und
  // nicht genauer** — `daily_nutrient_summary_long` zaehlt es direkt.
  // `[read]` **Beide Abfragen muessen zaehlen, nicht nur eine** —
  // die erste Fassung fand das erste `count: 'exact'` und war
  // zufrieden, obwohl die zweite Zeilen lud.
  const s = ohneKommentare('src/lib/nutrition/reference-assessment-read.ts')
  const block = /export async function getLueckenZahl[\s\S]*?\n\}/.exec(s)
  assert.ok(block, 'getLueckenZahl nicht gefunden (G-248).')
  const zaehlend = (block[0].match(/count: 'exact', head: true/g) ?? []).length
  const abfragen = (block[0].match(/\.select\(/g) ?? []).length
  assert.equal(zaehlend, abfragen,
    `${abfragen} Abfragen, aber nur ${zaehlend} zaehlen (G-248).`)
})

// ── G-11: keine doppelten Kacheln ────────────────────────────────

test('G-11: der Insights-Entwurf zeigt die echten Kacheln nicht doppelt', () => {
  // `[cmd]` **Gemessen 2026-08-29:** „Calorie balance" und „Macro
  // split · 14d avg" standen **je zweimal** auf dem Schirm — oben
  // echt, darunter als Attrappe. **Dieselbe Doppelung wie in
  // G-249.**
  const s = ohneKommentare('src/app/v2/nutrition/ansicht.tsx')
  assert.match(s, /<NutritionInsightsTab\s+ohneEchte=\{/,
    'Der Entwurf wird ohne die Unterscheidung gerendert (G-11).')

  const t = ohneKommentare('src/app/v2/nutrition/tab-insights.tsx')
  assert.match(t, /\{!ohneEchte && \(/,
    'Der Entwurf kennt das Flag nicht (G-11).')
  // `[read]` **Der Entwurf bleibt vollstaendig aufrufbar** — ohne
  // Flag zeigt er alle drei Kacheln.
  assert.match(t, /ohneEchte\?: boolean/,
    'Das Flag ist nicht abschaltbar (G-11).')
})
