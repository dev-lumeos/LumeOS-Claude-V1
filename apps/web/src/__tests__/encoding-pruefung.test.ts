// Die Encoding-Pruefung selbst pruefen.
//
// [read] Eine Pruefung, die noch nie fehlgeschlagen ist, ist kein Beleg.
// Dieser Test legt fuer jede der fuenf Schadensklassen eine Datei mit
// den passenden BYTES an und verlangt, dass die Pruefung anschlaegt —
// und dass sie eine saubere Datei mit echten Umlauten in Ruhe laesst.
//
// Der letzte Punkt ist der wichtigere: eine Pruefung, die bei jedem
// "ü" anspringt, wird nach zwei Tagen abgeschaltet.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const SKRIPT = path.join(process.cwd(), '..', '..', 'tools', 'encoding-pruefen.mjs')

/** Laesst die Pruefung in einem eigenen Verzeichnis laufen. */
function pruefe(dateien: Record<string, Buffer>): { code: number; text: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'enc-'))
  try {
    for (const [name, inhalt] of Object.entries(dateien)) {
      fs.writeFileSync(path.join(dir, name), inhalt)
    }
    try {
      const out = execFileSync(process.execPath, [SKRIPT], {
        cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      })
      return { code: 0, text: out }
    } catch (e) {
      const err = e as { status?: number; stdout?: string; stderr?: string }
      return { code: err.status ?? 1, text: `${err.stdout ?? ''}${err.stderr ?? ''}` }
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

test('doppelte Kodierung wird erkannt', () => {
  // "Hi " + c3 83 c2 bc — das ist ein zweimal kodiertes "ü".
  const r = pruefe({
    'a.md': Buffer.from([0x48, 0x69, 0x20, 0xc3, 0x83, 0xc2, 0xbc, 0x0a]),
  })
  assert.equal(r.code, 1)
  assert.match(r.text, /doppelt/)
})

test('ein doppelt kodiertes Dreibyte-Zeichen wird erkannt', () => {
  // NACHTRAG 2026-08-16: Diese Luecke war echt. Ein frischer Commit trug
  // einen doppelt kodierten Gedankenstrich, und die Pruefung sagte
  // "sauber" — sie kannte nur die Einleitungen c383/c382, die bei
  // ZWEIBYTE-Zeichen (Umlauten) entstehen. Ein DREIBYTE-Zeichen
  // (e2 80 94) wird zu c3a2 e282ac e28094, Einleitung c3a2.
  const r = pruefe({
    'a.ts': Buffer.from([0x48, 0x69, 0x20, 0xc3, 0xa2, 0xe2, 0x82, 0xac, 0xe2, 0x80, 0x94]),
  })
  assert.equal(r.code, 1, 'Gedankenstrich doppelt kodiert muss auffallen')
  assert.match(r.text, /c3a2/)
})

test('ein echtes a-Zirkumflex schlaegt nicht an', () => {
  // "Ça va" und franzoesische Woerter mit â duerfen durchgehen.
  const r = pruefe({ 'a.md': Buffer.from('Ça va, châteaux, être', 'utf8') })
  assert.equal(r.code, 0, `Falschmeldung:
${r.text}`)
})

test('UTF-16 wird erkannt, nicht nur der UTF-8-BOM', () => {
  // [read] Die PowerShell-Umleitung schreibt UTF-16LE. Die frueherere
  // Pruefung fragte nur nach ef bb bf und sah es deshalb nicht.
  const r = pruefe({ 'a.md': Buffer.from([0xff, 0xfe, 0x48, 0x00]) })
  assert.equal(r.code, 1)
  assert.match(r.text, /utf16/)
})

test('UTF-8-BOM wird gemeldet, bricht aber nicht ab', () => {
  // Bewusst Exit 0: der BOM ist unerwuenscht, zerstoert aber nichts.
  // `[cmd]` Im Bestand tragen ihn 10 Dateien, darunter zwei, die
  // gesperrt sind (foods/page.tsx fuer G-07, BrainstormDocs als
  // Datenquelle). Waere er ein Fehler, bliebe das Gate dauerhaft rot —
  // und ein dauerhaft rotes Gate wird umgangen statt repariert.
  const r = pruefe({ 'a.md': Buffer.from([0xef, 0xbb, 0xbf, 0x48, 0x69]) })
  assert.equal(r.code, 0, 'ein BOM allein darf den Commit nicht aufhalten')
  assert.match(r.text, /BOM/i, 'gemeldet werden muss er trotzdem')
})

test('ein BOM verdeckt keinen echten Fehler in derselben Datei', () => {
  // BOM + doppelte Kodierung: der Fehler muss gewinnen.
  const r = pruefe({
    'a.md': Buffer.concat([
      Buffer.from([0xef, 0xbb, 0xbf]),
      Buffer.from([0x48, 0x69, 0x20, 0xc3, 0x83, 0xc2, 0xbc]),
    ]),
  })
  assert.equal(r.code, 1)
  assert.match(r.text, /doppelt/)
})

test('ungueltiges UTF-8 wird erkannt', () => {
  const r = pruefe({ 'a.md': Buffer.from([0x48, 0x69, 0xff, 0xfe, 0x41]) })
  assert.equal(r.code, 1)
  assert.match(r.text, /kein-utf8/)
})

test('das Ersetzungszeichen wird erkannt', () => {
  const r = pruefe({ 'a.md': Buffer.from('Hi ' + '\uFFFD' + ' da', 'utf8') })
  assert.equal(r.code, 1)
  assert.match(r.text, /fffd/)
})

// --- Die andere Richtung: keine Falschmeldungen -------------------

test('echte Umlaute schlagen NICHT an', () => {
  const r = pruefe({
    'a.md': Buffer.from('Grüße, Käse, Nüsse, Öl, Weiß', 'utf8'),
    'b.sql': Buffer.from("SELECT 'Kohlenhydrate, verfügbar';", 'utf8'),
  })
  assert.equal(r.code, 0, `sauberer Text wurde gemeldet:\n${r.text}`)
})

test('ein echtes A-Tilde ohne Folgezeichen schlaegt nicht an', () => {
  // "São Paulo" ist korrektes UTF-8: c3 a3 — kein c383.
  const r = pruefe({ 'a.md': Buffer.from('São Paulo, Ångström', 'utf8') })
  assert.equal(r.code, 0, `Falschmeldung:\n${r.text}`)
})

test('leeres Verzeichnis ist sauber', () => {
  const r = pruefe({})
  assert.equal(r.code, 0)
  assert.match(r.text, /sauber/)
})
