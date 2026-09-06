/**
 * G-359 / E-68 — der Entwurf verdraengt nicht mehr
 *
 * **Tom, 2026-09-07:** *,,nun sehe ich dass tonnenweise zeugs
 * einfach weg ist aus der ui."*
 *
 * `[cmd]` **Die Ursache war kein Loeschen, sondern ein
 * Entweder-oder:** `echt.phase ? <PhaseEcht/> : <GoalsPhaseView/>`.
 * **Lag eine echte Phase vor, verschwand der ganze Entwurf** — mit
 * den neun Phasenarten, dem Jahreszyklus-Editor und der
 * Vorlagenbibliothek.
 *
 * `[cmd]` **Am Schirm gemessen (2026-09-06): 18 von 26 genannten
 * Elementen unerreichbar, obwohl ihr Quelltext dasteht.**
 *
 * `[read]` **Diese Datei misst die WIRKUNG, nicht das Wort:** steht
 * an der Stelle ein Ternaer mit einer Entwurfsansicht im
 * Sonst-Zweig?
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..')

const lies = (p: string) => readFileSync(p, 'utf8')

/** Die Entwurfsansichten, die verdraengt werden koennten. */
const ENTWUERFE = [
  'GoalsPhaseView', 'GoalsPhysiqueView', 'TimelineTab',
  'GoalsCrossModuleView', 'GoalsPosesView', 'GoalsTDEEView',
]

describe('G-359 — der Entwurf bleibt sichtbar (E-68)', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(lies(join(GOALS, 'ansicht.tsx')).length > 1000,
      'ansicht.tsx nicht gefunden — der Pfad stimmt nicht')
  })

  // ── 1 · Keine Entwurfsansicht steht im Sonst-Zweig ───────────────
  for (const name of ENTWUERFE) {
    it(`${name} steht in keinem Sonst-Zweig`, () => {
      const t = lies(join(GOALS, 'ansicht.tsx'))
      // `[read]` **Die Wirkung: `: <Entwurf` heisst, er kommt NUR,
      // wenn die echte Seite leer ist.** Genau das war der Fehler.
      const verdraengt = new RegExp(`:\\s*<${name}\\b`)
      assert.ok(!verdraengt.test(t),
        `${name} steht im Sonst-Zweig eines Ternaers — `
        + 'ein Entwurf darf nicht verdraengt werden (E-68)')
    })
  }

  it('und keiner steht hinter einem `.length > 0 ?`', () => {
    const t = lies(join(GOALS, 'ansicht.tsx'))
    assert.ok(
      !/length\s*\)?\s*>\s*0\s*\n?\s*\?\s*\(?\s*\n?\s*<[A-Z]/.test(t),
      'ein Ternaer waehlt wieder zwischen echt und Entwurf',
    )
  })

  // ── 2 · Die drei Reiter rendern beides ───────────────────────────
  for (const [reiter, entwurf] of [
    ['phase', 'GoalsPhaseView'],
    ['physique', 'GoalsPhysiqueView'],
    ['timeline', 'TimelineTab'],
  ] as const) {
    it(`Reiter \`${reiter}\` rendert ${entwurf} unbedingt`, () => {
      const t = lies(join(GOALS, 'ansicht.tsx'))
      const i = t.indexOf(`tab === '${reiter}'`)
      assert.ok(i > 0, `der Zweig fuer \`${reiter}\` fehlt`)
      // Den Block herausschneiden, sonst sucht man in der ganzen
      // Datei und findet immer irgendwas.
      const block = t.slice(i, i + 700)
      assert.ok(block.includes(`<${entwurf}`),
        `${entwurf} wird im Reiter \`${reiter}\` nicht gerendert`)
      // `[cmd]` **Die Sabotageprobe fand die Luecke:** `{null &&
      // <Entwurf/>}` enthaelt `<Entwurf` und kam durch.
      // `[read]` **Also die Bedingung DAVOR pruefen, nicht die
      // Anwesenheit des Namens.**
      const vorn = block.slice(0, block.indexOf(`<${entwurf}`))
      const letzteKlammer = vorn.lastIndexOf('{')
      const wache = letzteKlammer >= 0 ? vorn.slice(letzteKlammer) : ''
      // `[cmd]` **Gemessen am sabotierten Text: die Wache lautet
      // `"{null && "`** — `(^|\\s)` vor `null` traf nicht, weil `{`
      // davorsteht. **Deshalb `[{(\\s]` statt `\\s`.**
      assert.ok(
        !/[{(\s](null|false|0|undefined)\s*&&\s*$/.test(wache.trim())
        && !/\?\s*$/.test(wache.trim()),
        `${entwurf} steht hinter einer abschaltenden Bedingung: `
        + `\`${wache.trim().slice(0, 40)}\``,
      )
    })
  }

  // ── 3 · E-68: die Marke traegt Quelle UND Grund ──────────────────
  it('`attrappeAus` nennt Quelle und Grund', async () => {
    const { attrappeAus } = await import('../ansicht')
    const s = attrappeAus('theme-v1/module-goals-pro.jsx', 'X-Schreibweg (G-1)')
    assert.match(s, /theme-v1\/module-goals-pro\.jsx/, 'die Quelle fehlt')
    assert.match(s, /wartet auf:/, 'der Grund fehlt')
  })

  it('die drei tragenden Kacheln nennen einen Grund', () => {
    const t = lies(join(GOALS, 'tab-phase.tsx'))
    // `[cmd]` **Nicht die Zahl der Marken zaehlen** — die war schon
    // hoch (G-355: 69). **Sondern: nennen DIESE drei den Grund?**
    for (const kachel of ['Phase state machine', 'Phase parameters',
      'Expert BB annual']) {
      const i = t.indexOf(kachel)
      assert.ok(i > 0, `Kachel \`${kachel}\` fehlt`)
      const block = t.slice(i, i + 420)
      assert.ok(block.includes('attrappeAus('),
        `\`${kachel}\` traegt die alte Marke ohne Grund (E-68)`)
    }
  })

  it('und der Grund nennt einen Punkt, nicht nur „noch nicht"', () => {
    const t = lies(join(GOALS, 'tab-phase.tsx'))
    // `[read]` **Kein `s`-Flag** — es braucht ES2018, das Ziel liegt
    // darunter (TS1501). `[\s\S]` tut dasselbe ohne Flag.
    const gruende = t.match(/attrappeAus\([\s\S]{0,240}?\)\)?\}/g) ?? []
    assert.ok(gruende.length >= 3, `nur ${gruende.length} Gruende`)
    for (const g of gruende) {
      assert.ok(/G-\d{2,3}|unbekannt, nie untersucht/.test(g),
        `ein Grund nennt weder Punkt noch „unbekannt": ${g.slice(0, 70)}`)
    }
  })

  // ── 4 · Die Entwurfsdateien sind noch da ─────────────────────────
  it('kein Entwurf wurde geloescht', () => {
    const da = readdirSync(GOALS)
    for (const f of ['tab-phase.tsx', 'tab-physique.tsx',
      'tab-timeline.tsx', 'phase-editor.tsx']) {
      assert.ok(da.includes(f), `${f} fehlt — E-68: nichts verschwindet`)
    }
  })
})
