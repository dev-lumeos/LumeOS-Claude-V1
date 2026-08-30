// A-60: eine `Map` ueber die Server-Client-Grenze kommt leer an.
//
// `[read]` **Die gefaehrlichste Klasse: kein Absturz, keine Meldung,
// nur nichts.** React serialisiert Props nach JSON; `Map` und `Set`
// haben keine JSON-Form und kommen als `{}` an. **Die Kacheln bleiben
// leer, und nichts im Protokoll sagt warum.**
//
// ══ WARUM EIN EIGENER WAECHTER ══════════════════════════════════════
//
// `[cmd]` **Gemessen am 2026-08-30: der Typecheck faengt es NICHT.**
// Eine Probe — `'use client'`-Komponente mit `karte: Map<string,
// string>`, aus einer Serverkomponente mit `new Map(...)` aufgerufen —
// lief durch `tsc --noEmit` ohne eine einzige Meldung.
//
// `[cmd]` **Und der `serverimport`-Waechter kann es nicht:** er liest
// das gebaute Buendel und sucht Marken wie `createServerClient`. **Eine
// Map-Prop hinterlaesst dort keine Marke** — sie ist ein
// Laufzeitverhalten, keine Zeichenkette. Die Naht liegt im Quelltext,
// nicht im Buendel.
//
// ══ WAS ER PRUEFT ═══════════════════════════════════════════════════
//
// `[read]` **Die Wirkung, nicht das Wort:** nicht „kommt `Map` vor" —
// eine Map INNERHALB einer Client-Datei ist voellig richtig
// (`naehrstoff-ordnung-tab.tsx:94` baut eine aus einem Array, genau die
// Behebung aus A-60). **Sondern: steht `Map`/`Set` in der PROP-Signatur
// einer `'use client'`-Komponente?**
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const WURZEL = path.resolve(process.cwd(), '../..')

function dateien(): string[] {
  const roh = execFileSync('git', ['ls-files', '--',
    'apps/web/src/**/*.ts', 'apps/web/src/**/*.tsx',
    'packages/**/*.ts', 'packages/**/*.tsx',
  ], { cwd: WURZEL, encoding: 'utf8' })
  return roh.split('\n').map(z => z.trim()).filter(Boolean)
}

const lies = (rel: string) =>
  fs.readFileSync(path.join(WURZEL, rel), 'utf8')

/** Traegt die Datei ganz oben `'use client'`? */
function istClient(text: string): boolean {
  return /^\s*(['"])use client\1/.test(text.replace(/^﻿/, ''))
}

/**
 * Die Prop-Signaturen einer Datei.
 *
 * `[read]` **Nur die Signatur, nicht der Rumpf.** Zwischen `({` und
 * dem passenden `})` einer exportierten Komponente steht, was von
 * aussen hereinkommt — und nur das reist ueber die Grenze.
 */
function propSignaturen(text: string): string[] {
  const raus: string[] = []
  // `export function X({ ... }: { ... })` — der Typteil nach dem `:`.
  const rx = /export\s+(?:default\s+)?function\s+\w+\s*\(\s*\{[^}]*\}\s*:\s*\{/g
  let m: RegExpExecArray | null
  while ((m = rx.exec(text)) !== null) {
    // Ab der oeffnenden Klammer des Typs bis zur passenden schliessenden.
    let tiefe = 1
    let i = rx.lastIndex
    while (i < text.length && tiefe > 0) {
      if (text[i] === '{') tiefe++
      else if (text[i] === '}') tiefe--
      i++
    }
    raus.push(text.slice(rx.lastIndex, i - 1))
  }
  return raus
}

const VERBOTEN = /(?<![A-Za-z0-9_])(Map|Set|WeakMap|WeakSet|ReadonlyMap|ReadonlySet)\s*</

test('A-60: keine Map/Set in der Prop-Signatur einer Client-Komponente', () => {
  // `[read]` **Der Fall aus G-246:** `getErklaertexte` gab eine `Map`
  // zurueck, die Ansicht war `'use client'` — die Kacheln blieben leer,
  // ohne Fehler. **Behoben durch ein Array; die Map entsteht jetzt im
  // Client.**
  const funde: string[] = []
  for (const rel of dateien()) {
    let text: string
    try {
      text = lies(rel)
    } catch {
      continue
    }
    if (!istClient(text)) continue
    if (!/Map\s*<|Set\s*</.test(text)) continue
    for (const sig of propSignaturen(text)) {
      const treffer = VERBOTEN.exec(sig)
      if (treffer) {
        const feld = /(\w+)\??\s*:\s*[^;,]*$/.exec(
          sig.slice(0, treffer.index).split(/[;,]/).pop() ?? '')
        funde.push(`${rel}: Prop ${feld?.[1] ?? '?'} vom Typ ${treffer[1]}<...>`)
      }
    }
  }
  assert.deepEqual(funde, [],
    'Eine Map/Set steht in der Prop-Signatur einer Client-Komponente. '
    + 'Sie kommt dort LEER an — React serialisiert Props nach JSON, und '
    + 'Map/Set haben keine JSON-Form. Kein Fehler, keine Meldung, nur '
    + 'nichts. Als Array uebergeben und die Map im Client bauen '
    + '(Vorbild: naehrstoff-ordnung-tab.tsx:94). Gefunden:\n  '
    + funde.join('\n  '))
})

test('A-60: der Waechter misst etwas — Gegenprobe', () => {
  // `[read]` **Ein Waechter, der eine Abwesenheit sichert, ist wertlos,
  // wenn er nicht anschlaegt** (A-62). `[cmd]` **Am 2026-08-30 gibt es
  // im Repo keinen einzigen Fall** — ohne diese Gegenprobe waere der
  // Test gruen, auch wenn die Erkennung kaputt ist.
  const probe = `'use client'
export function X({ karte, liste }: { karte: Map<string, number>; liste: string[] }) {
  return null
}
`
  assert.ok(istClient(probe), 'Die Client-Erkennung greift nicht mehr.')
  const sigs = propSignaturen(probe)
  assert.equal(sigs.length, 1, 'Die Prop-Signatur wurde nicht gefunden.')
  assert.match(sigs[0], VERBOTEN, 'Eine Map-Prop wird nicht erkannt.')

  // Und die Gegenrichtung: ein Array darf NICHT anschlagen.
  const sauber = `'use client'
export function Y({ liste }: { liste: Array<[string, number]> }) { return null }
`
  const s2 = propSignaturen(sauber)
  assert.equal(s2.length, 1)
  assert.doesNotMatch(s2[0], VERBOTEN,
    'Ein Array schlaegt faelschlich an — dann ist der Waechter unbrauchbar.')

  // Eine Map IM RUMPF einer Client-Datei ist richtig und darf nicht
  // anschlagen — genau die Behebung aus A-60.
  const imRumpf = `'use client'
export function Z({ offen }: { offen: string[] }) {
  const s = new Set<string>(offen)
  return null
}
`
  for (const sig of propSignaturen(imRumpf)) {
    assert.doesNotMatch(sig, VERBOTEN,
      'Eine Map im Rumpf schlaegt an — das ist die BEHEBUNG, kein Fehler.')
  }
})

// `[cmd]` **Warum es diesen Waechter ueberhaupt braucht, gemessen am
// 2026-08-30:** eine Probe unter `app/_a60probe/` — `'use client'`-
// Komponente mit `karte: Map<string, string>`, aus einer
// Serverkomponente mit `new Map(...)` aufgerufen — lief durch
// `tsc --noEmit` **ohne eine einzige Meldung.**
//
// `[read]` **Das steht hier als Kommentar, nicht als dritter Test.**
// Ein `assert.ok(true)` mit einer Begruendung darueber misst nichts —
// genau die Sorte Waechter, die das Wort statt der Wirkung prueft.
