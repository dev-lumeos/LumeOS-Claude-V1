/**
 * G-354 — die Zielarten haben eine Quelle
 *
 * `[cmd]` **Der Befund: das *New goal*-Modal fuehrte eine sechste
 * Liste mit `body_comp`** — einem Wert, den
 * `user_goals_goal_type_check` ablehnt.
 *
 * `[read]` **Dieselbe Klasse wie G-339.** **Ein Zaehlwaechter, der
 * nach `const types =` sucht, findet die naechste nicht** — deshalb
 * misst diese Datei die WIRKUNG: **steht in einer v2-Datei ein
 * Zielart-Wert, der nicht aus `ziel-arten.ts` kommt?**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  ZIEL_ARTEN, ZIEL_ART_TEXT, ZIEL_UNTERARTEN, zielArtAuswahl,
  AKTIVE_PLAETZE, PRIORITAET_MAX,
} from '../ziel-arten'

// `[read]` **Der Pfad kommt aus der Datei, nicht aus `cwd`** — sonst
// ist die Probe aus der Wurzel gruen und faellt im Gate.
const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..', '..')
const V2 = join(WURZEL, 'apps', 'web', 'src', 'app', 'v2')

const lies = (p: string) => readFileSync(p, 'utf8')

function tsxDateien(pfad: string): string[] {
  const aus: string[] = []
  for (const e of readdirSync(pfad)) {
    const p = join(pfad, e)
    if (statSync(p).isDirectory()) {
      if (e === '__tests__') continue
      aus.push(...tsxDateien(p))
    } else if (e.endsWith('.tsx')) aus.push(p)
  }
  return aus
}

describe('G-354 — eine Quelle fuer die Zielarten', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(
      lies(join(V2, 'goals', 'modale.tsx')).length > 1000,
      'goals/modale.tsx nicht gefunden — der Pfad stimmt nicht',
    )
  })

  // ── 1 · Die Liste selbst ─────────────────────────────────────────
  it('genau die vier Werte des CHECK', () => {
    // `[read]` **Eine Untergrenze erlaubt Verlust** — deshalb fest.
    assert.equal(ZIEL_ARTEN.length, 4)
    assert.deepEqual([...ZIEL_ARTEN].sort(),
      ['body_composition', 'health', 'lifestyle', 'performance'])
  })

  it('`body_comp` ist KEIN gueltiger Wert', () => {
    // `[cmd]` **Der Fund aus G-352** — die Datenbank kennt ihn nicht.
    assert.ok(!(ZIEL_ARTEN as readonly string[]).includes('body_comp'))
  })

  it('jede Art hat einen Namen, keiner ist der Rohcode', () => {
    for (const a of ZIEL_ARTEN) {
      const n = ZIEL_ART_TEXT[a]
      assert.ok(n && n.length > 2, `${a} hat keinen Namen`)
      assert.notEqual(n, a, `${a} zeigt den Rohcode`)
    }
  })

  it('die Auswahl liefert vier Paare aus Code und Name', () => {
    const w = zielArtAuswahl()
    assert.equal(w.length, 4)
    assert.deepEqual(w.map(x => x.code), [...ZIEL_ARTEN])
    assert.equal(w[0].label, 'Körperzusammensetzung')
  })

  // ── 2 · Die Unterarten sind gemessen, nicht erfunden ──────────────
  it('jede Unterart haengt an einer bekannten Art', () => {
    for (const art of Object.keys(ZIEL_UNTERARTEN)) {
      assert.ok((ZIEL_ARTEN as readonly string[]).includes(art),
        `${art} ist keine bekannte Zielart`)
    }
  })

  it('die fuenf gemessenen Unterarten stehen drin, ohne Dublette', () => {
    const alle = Object.values(ZIEL_UNTERARTEN).flat()
    assert.equal(alle.length, 5, 'G-352 hat fuenf gezaehlt')
    assert.equal(new Set(alle).size, 5, 'eine Unterart steht doppelt')
    assert.deepEqual([...alle].sort(),
      ['cardio_frequency', 'cut', 'gain_muscle', 'strength',
        'training_capacity'])
  })

  it('`health` bleibt leer — null Zeilen, kein erfundener Wert', () => {
    // `[read]` **C-378: wenn die Daten nicht da sind, erfinden wir
    // sie nicht.**
    assert.deepEqual(ZIEL_UNTERARTEN.health, [])
  })

  // ── 3 · Die Drei kommt aus dem CHECK ─────────────────────────────
  it('AKTIVE_PLAETZE ist 3, PRIORITAET_MAX ist 10', () => {
    assert.equal(AKTIVE_PLAETZE, 3)
    assert.equal(PRIORITAET_MAX, 10)
  })

  // ── 4 · Kein Fenster fuehrt eine eigene Liste ────────────────────
  it('keine v2-Datei nennt `body_comp`', () => {
    const schuldig: string[] = []
    for (const d of tsxDateien(V2)) {
      // `[read]` **Mit Wortgrenze** — `body_composition` enthaelt
      // `body_comp` als Teilkette und waere sonst ein Falschtreffer.
      if (/(?<![a-z0-9_])body_comp(?![a-z0-9_])/.test(lies(d))) {
        schuldig.push(d.replace(/\\/g, '/').split('/v2/')[1])
      }
    }
    assert.deepEqual(schuldig, [],
      `\`body_comp\` steht noch in: ${schuldig.join(', ')}`)
  })

  it('das New-goal-Modal holt die Arten aus ziel-arten', () => {
    const t = lies(join(V2, 'goals', 'modale.tsx'))
    assert.match(t, /zielArtAuswahl|ZIEL_ARTEN/,
      'modale.tsx fuehrt wieder eine eigene Liste')
  })

  it('und es zaehlt die Arten nicht selbst hoch', () => {
    // `[cmd]` **Die alte Liste hatte SECHS Eintraege** — wer sie
    // zurueckbaut, faellt hier auf.
    const t = lies(join(V2, 'goals', 'modale.tsx'))
    const block = t.slice(t.indexOf('NewGoalModal'),
      t.indexOf('NewGoalModal') + 2000)
    assert.ok(
      !/\{\s*id:\s*['"](weight|habit|custom)['"]/.test(block),
      'die Altrepo-Liste steht wieder im Modal',
    )
  })
})
