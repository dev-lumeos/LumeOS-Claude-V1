/**
 * G-628 Teil 2 — Pruefungen nach Grad im „Ziel setzen"
 *
 * `[cmd]` **Datenbasis G-626 (Commit 11cb4e44), in der Kette, nicht live:**
 * `goals.ziel_grenzen_pruefen(...) RETURNS TABLE (schluessel, art, hinweis)`
 * und der Schreib-Waechter mit `G626_BLOCK` / `G626_CONFIRM` und
 * `parameters.g626_confirmed_warnings`. Die Tests halten die Oberflaeche
 * gegen die SIGNATUR in der Kette — bis zum Live-Einspielen gibt es keinen
 * Schirmnachweis.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  alsBefunde, bestaetigteSchluessel, freiAb, hoehereGrade, waechterSatz, weiterErlaubt,
  type Befund, type Pruefung,
} from '../zielpruefung'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..', '..')
const GOALS = join(HIER, '..', '..', '..', 'app', 'v2', 'goals')
const SQL = (f: string) => readFileSync(join(WURZEL, 'supabase', '_pipeline', '11_goals', f), 'utf8')
const lies = (p: string) => readFileSync(p, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

describe('G-628/2 — die Bausteine', () => {
  it('frei ab: der erste hoehere Grad ohne diese Sperre, in EXPERIENCE_LEVELS-Reihenfolge', () => {
    const jeGrad = [
      { grad: 'elite', befunde: [] },
      { grad: 'pro', befunde: [{ schluessel: 'tempo', art: 'warnung', hinweis: '' }] },
    ]
    assert.equal(freiAb('tempo', jeGrad), 'pro', 'eine Warnung bei pro heisst: dort frei')
    assert.equal(freiAb('x', [{ grad: 'pro', befunde: [{ schluessel: 'x', art: 'sperre', hinweis: '' }] }]), null)
  })
  it('die hoeheren Grade', () => {
    assert.deepEqual(hoehereGrade('advanced'), ['pro', 'elite'])
    assert.deepEqual(hoehereGrade(null), ['beginner', 'advanced', 'pro', 'elite'])
  })
  it('eine unbekannte Art gilt als Sperre — lieber zu streng', () => {
    assert.equal(alsBefunde([{ schluessel: 'k', art: 'neu', hinweis: 'h' }], [])[0]!.art, 'sperre')
  })
  const P = (befunde: Befund[]): Pruefung => ({ stand: 'geprueft', befunde, tdee: 2500 })
  const S = (s: string): Befund => ({ schluessel: s, art: 'sperre', hinweis: s, freiAb: null })
  const W = (s: string): Befund => ({ schluessel: s, art: 'warnung', hinweis: s, freiAb: null })
  it('Weiter: ohne Sperre und mit allen Haken', () => {
    assert.equal(weiterErlaubt(P([]), new Set()), true)
    assert.equal(weiterErlaubt(P([S('tempo')]), new Set(['tempo'])), false, 'eine Sperre laesst sich nicht abhaken')
    assert.equal(weiterErlaubt(P([W('a'), W('b')]), new Set(['a'])), false)
    assert.equal(weiterErlaubt(P([W('a'), W('b')]), new Set(['a', 'b'])), true)
  })
  it('nicht eingespielt laesst durch, ein Fehler sperrt, noch keine Antwort sperrt', () => {
    assert.equal(weiterErlaubt({ stand: 'nicht_eingespielt' }, new Set()), true)
    assert.equal(weiterErlaubt({ stand: 'fehler', text: 'x' }, new Set()), false)
    assert.equal(weiterErlaubt(null, new Set()), false)
  })
  it('geschrieben werden nur bestaetigte Schluessel aktueller Warnungen', () => {
    assert.deepEqual(bestaetigteSchluessel(P([W('b'), W('a'), S('c')]), new Set(['a', 'b', 'c', 'alt'])), ['a', 'b'])
  })
  it('G626_BLOCK / G626_CONFIRM werden ein Satz, kein Code', () => {
    const b = [S('diaetdauer'), W('tempo')]
    b[0]!.hinweis = 'Diaet ueber 20 Wochen ist gesperrt.'
    b[1]!.hinweis = 'Tempo braucht eine Bestaetigung.'
    assert.equal(waechterSatz('new row violates ... G626_BLOCK:diaetdauer', b),
      'Die Prüfung lässt das Ziel nicht zu: Diaet ueber 20 Wochen ist gesperrt.')
    assert.equal(waechterSatz('G626_CONFIRM:tempo', b), 'Bitte bestätige zuerst: Tempo braucht eine Bestaetigung.')
    assert.match(waechterSatz('G626_BLOCK:unbekannt', b)!, /Grenze „unbekannt"/)
    assert.equal(waechterSatz('irgendein anderer Fehler', b), null)
  })
})

describe('G-628/2 — gegen die Signatur in der Kette', () => {
  const fn = SQL('626_experience_goal_limits.sql')
  const kopf = /CREATE FUNCTION goals\.ziel_grenzen_pruefen\(([\s\S]*?)\)\s*RETURNS TABLE \(([^)]*)\)/.exec(fn)
  it('die Funktion steht in der Kette', () => assert.ok(kopf, 'ziel_grenzen_pruefen nicht gefunden'))
  const parameter = kopf![1]!.split(',').map(z => z.trim().split(/\s+/)[0]!).filter(Boolean)
  it('die Vorschau ruft genau die Parameter der Signatur', () => {
    const q = lies(join(HIER, '..', 'zielpruefung-read.ts'))
    const i = q.indexOf(".rpc('ziel_grenzen_pruefen', {")
    const block = q.slice(i, q.indexOf('})', i))
    const gerufen = Array.from(block.matchAll(/\b(p_[a-z_]+):/g)).map(m => m[1]!)
    assert.deepEqual(gerufen.slice().sort(), parameter.slice().sort())
  })
  it('die Rueckgabe hat die Spalten, die Rohbefund kennt', () => {
    assert.deepEqual(kopf![2]!.split(',').map(z => z.trim().split(/\s+/)[0]), ['schluessel', 'art', 'hinweis'])
    assert.match(lies(join(HIER, '..', 'zielpruefung.ts')),
      /export type Rohbefund = \{ schluessel: string; art: string; hinweis: string \}/)
  })
  it('die Arten heissen sperre und warnung', () => {
    const arten = new Set(Array.from(fn.matchAll(/'(sperre|warnung)'::text/g)).map(m => m[1]))
    assert.deepEqual(Array.from(arten).sort(), ['sperre', 'warnung'])
  })
  const waechter = SQL('626_controlling_goal_write_guard.sql')
  it('der Waechter liest den Schluessel, den die Oberflaeche schreibt', () => {
    assert.match(waechter, /NEW\.parameters -> 'g626_confirmed_warnings'/)
    assert.match(lies(join(GOALS, 'ziel-setzen.tsx')), /g626_confirmed_warnings: bestaetigteSchluessel\(pruefung, bestaetigt\)/)
  })
  it('die Fehlerpraefixe des Waechters sind die, die waechterSatz erkennt', () => {
    assert.match(waechter, /'G626_BLOCK:%'/)
    assert.match(waechter, /'G626_CONFIRM:%'/)
  })
  it('der Waechter nimmt die TDEE aus tdee_basis_am — die Vorschau auch', () => {
    assert.match(waechter, /goals\.tdee_basis_am\(NEW\.user_id, NEW\.gueltig_ab\)/)
    assert.match(lies(join(HIER, '..', 'zielpruefung-read.ts')), /rpc\('tdee_basis_am', \{ p_user_id: user\.id, p_stichtag: e\.startdatum \}\)/)
  })
})

describe('G-628/2 — keine Regel im Code', () => {
  it('kein Grenzwert aus experience_goal_limits in der Oberflaeche oder den Bausteinen', () => {
    for (const f of [join(GOALS, 'ziel-setzen.tsx'), join(HIER, '..', 'zielpruefung.ts'), join(HIER, '..', 'zielpruefung-read.ts')]) {
      // Das Runden des Tempos auf drei Stellen (numeric(5,3)) ist keine Grenze.
      const q = lies(f).replace(/\*\s*1000\)\s*\/\s*1000/g, '')
      assert.ok(!/\b(18[.,]5|17[.,]5|1500|1300|1200|1000|0[.,]75)\b/.test(q), `${f}: ein Grenzwert steht im Code`)
      assert.ok(!/experience_goal_limits|pace_block|diet_warn/.test(q), `${f}: liest die Grenztabelle selbst`)
    }
  })
})

describe('G-628/2 — Verdrahtung', () => {
  const Z = () => lies(join(GOALS, 'ziel-setzen.tsx'))
  it('Weiter und Ziel starten haengen an der Pruefung', () => {
    assert.match(Z(), /&& pruefungFrei\n/)
    assert.match(Z(), /disabled=\{laeuft \|\| \(!!steuerung && !wahl\) \|\| !pruefungFrei\}/)
  })
  it('der Schreibweg reicht die Parameter bis goal_phase_start', () => {
    assert.match(lies(join(HIER, '..', 'phase-write.ts')), /p_parameters: e\.parameters \?\? \{\},/)
    assert.match(lies(join(HIER, '..', 'phasenziel-write.ts')), /parameters: n\.phase\.parameters,/)
  })
  it('das Startdatum ist Stichtag der Rechnung, der Pruefung und gueltig_ab', () => {
    assert.match(Z(), /heute: startdatum, fest,/)
    assert.match(Z(), /gueltig_ab: startdatum,/)
    assert.match(Z(), /data-ziel-spaeter/)
  })
  it('die Quelle des Startwerts wird genannt', () => {
    assert.match(Z(), /letzte Messung am/)
    assert.match(Z(), /kein Trendwert vorhanden/)
  })
})
