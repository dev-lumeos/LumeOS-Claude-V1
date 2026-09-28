/**
 * G-527 — der Schreibweg kennt die vier Hindernisse
 *
 * `[cmd]` **Gemessen am 2026-09-28:** `zielwerte-read.ts:53` fuehrte
 * ZWEI Hindernisse, G-511 bringt zwei weitere. **Treffer auf
 * `23514` in `apps/web/src`: null.**
 *
 * `[cmd]` **`zielwerte-write.ts:54` endete fuer alles ausser
 * `profil_unvollstaendig` in einem Satz:** *,,Die Formel lieferte
 * keine Zielkalorien."* `[read]` **Vier Ursachen, eine Meldung** —
 * und die eine sagt nicht, was zu tun ist.
 *
 * `[read]` **Diese Datei misst die WIRKUNG:** hat jedes Hindernis
 * seinen eigenen Satz, sagt der Satz eine HANDLUNG, und wird aus
 * einem `23514` dasselbe Hindernis wie auf der Leseseite?
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  hindernisSatz, ohneTageszielSatz, PHASEN_OHNE_TAGESZIEL,
  type Hindernis,
} from '../zielwerte-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const WRITE = join(HIER, '..', 'zielwerte-write.ts')

/** Quelltext ohne Kommentare — sonst liest der Waechter seine
 *  eigene Begruendung (die Lehre aus G-512). */
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const ALLE: Hindernis[] = [
  'profil_unvollstaendig', 'zielrichtung_ohne_faktor',
  'keine_aktive_phase', 'phasenparameter_fehlt',
]

describe('G-527 — vier Hindernisse, vier Texte', () => {
  // ── 1 · Jedes Hindernis hat einen eigenen Satz ──────────────────
  it('die vier Saetze sind verschieden', () => {
    const saetze = ALLE.map(h => hindernisSatz(h))
    assert.equal(new Set(saetze).size, 4,
      'zwei Hindernisse teilen sich einen Satz — dann sieht der '
      + 'Nutzer wieder eine Meldung fuer mehrere Ursachen')
    for (const s of saetze) {
      assert.ok(s.length > 20, `zu kurz, sagt nichts: "${s}"`)
    }
  })

  // ── 2 · Der Satz sagt, was zu tun ist ──────────────────────────
  //
  // `[read]` **Drei der vier kann der Nutzer aufloesen** — dort
  // steht eine Handlung. **Beim vierten waere eine Handlung eine
  // Luege**, er kann nichts tun.
  it('die drei aufloesbaren Faelle nennen eine Handlung', () => {
    const handlung = /Ergaenze|Waehle|Trag/
    for (const h of ['profil_unvollstaendig', 'keine_aktive_phase',
      'phasenparameter_fehlt'] as Hindernis[]) {
      assert.match(hindernisSatz(h), handlung,
        `${h} nennt keine Handlung — der Satz sagt nur, was schiefging`)
    }
  })

  it('der nicht aufloesbare Fall taeuscht keine Handlung vor', () => {
    const s = hindernisSatz('zielrichtung_ohne_faktor')
    assert.match(s, /liegt nicht an deinen Angaben/,
      'der Satz sagt nicht, dass der Nutzer nichts tun kann')
  })

  it('profil_unvollstaendig nennt die fehlenden Felder', () => {
    const s = hindernisSatz('profil_unvollstaendig', ['height_cm', 'birth_date'])
    assert.match(s, /height_cm/, 'das fehlende Feld steht nicht im Satz')
    assert.match(s, /birth_date/, 'nur das erste Feld wird genannt')
  })

  // ── 3 · 23514 wird zum Hindernis, nicht zum Serverfehler ───────
  it('der Schreibweg faengt 23514', () => {
    const q = ohneKommentare(readFileSync(WRITE, 'utf8'))
    assert.match(q, /'23514'/,
      "der Schreibweg kennt 23514 nicht — ein CHECK-Verstoss wird "
      + 'wieder zu HTTP 500')
    assert.match(q, /hindernisAusFehler\(/,
      'die Zuordnung fehlt')
    assert.match(q, /hindernisSatz\(/,
      'der Schreibweg baut seinen eigenen Text statt den der Leseseite '
      + '— zwei Kopien driften')
  })

  it('der alte Auffangsatz deckt die Hindernisse nicht mehr zu', () => {
    const q = ohneKommentare(readFileSync(WRITE, 'utf8'))
    // `[read]` **Der Satz DARF bleiben** — fuer den Fall „kein
    // Hindernis, aber auch keine Zahl". **Er darf nur nicht mehr
    // der einzige sein.**
    const vorHindernis = q.indexOf('vorschlag.hindernis')
    const vorSatz = q.indexOf('Die Formel lieferte keine Zielkalorien')
    assert.ok(vorHindernis > 0 && vorHindernis < vorSatz,
      'die Hindernispruefung steht nicht VOR dem Auffangsatz — '
      + 'dann faengt er sie wieder alle ab')
  })

  // ── 4 · Zwei Phasen haben KEIN Tagesziel (A6/A7) ───────────────
  it('peak_week und expert_bb_annual sind kein Hindernis, sondern ein Zustand', () => {
    for (const p of ['peak_week', 'expert_bb_annual']) {
      assert.ok(PHASEN_OHNE_TAGESZIEL.has(p),
        `${p} laeuft in die Kalorienpruefung — der Nutzer sieht eine `
        + 'Fehlermeldung, wo es nichts zu beheben gibt')
      const s = ohneTageszielSatz(p)
      assert.ok(s && s.length > 20, `${p} hat keinen eigenen Satz`)
      // `[read]` **Kein Fehlerton, keine Handlung** — hier gibt es
      // nichts zu tun.
      assert.doesNotMatch(s!, /fehlt|Fehler|Ergaenze|Waehle|Trag/,
        `${p}: der Satz klingt nach Mangel, ist aber ein Zustand`)
    }
  })

  it('eine Phase MIT Tagesziel steht nicht in der Liste', () => {
    for (const p of ['fat_loss', 'lean_bulk', 'maintenance']) {
      assert.ok(!PHASEN_OHNE_TAGESZIEL.has(p),
        `${p} wird von der Kalorienpruefung ausgenommen, obwohl die `
        + 'Spec einen Wert nennt')
      assert.equal(ohneTageszielSatz(p), null,
        `${p} traegt einen Satz, obwohl es ein Ziel hat`)
    }
  })
})
