// G-184: die WADA-Lage — der Satz, der sagt, fuer wen es gilt.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { wadaLage, kategorieKurz } from '../wada-lage'

// `[cmd]` Woertlich aus der Datenbank, 387 Zeichen.
const KREATIN = 'Steht nicht auf der WADA-Verbotsliste und ist '
  + 'dopingrechtlich in keinem Verband verboten – weder in '
  + 'WADA-Code-Signatar- bzw. WADA-testenden Ligen (NADOs, IPF, IFBB, '
  + 'Natural-Verbände wie INBA/PNBA, WNBF, OCB) noch in ungetesteten '
  + 'Ligen (IFBB Professional League, NPC); Einschränkungen ergeben sich '
  + 'allenfalls aus nationalen Gesetzen oder strengeren verbandseigenen '
  + 'Regeln einzelner Ligen.'

test('G-184: der Satz kommt ungekuerzt durch', () => {
  // `[read]` **Die Kernzusage.** Die Saetze tragen ihre Quellen — wer
  // sie strafft, loest die Belegkette (Auftrag, „Was nicht zu tun ist").
  const l = wadaLage('not_prohibited', KREATIN, null)
  assert.ok(l)
  assert.equal(l!.text, KREATIN)
  assert.equal(l!.text.length, 387)
  assert.match(l!.text, /IFBB Professional League, NPC/,
    'Die Ligen stehen namentlich drin — genau das war die Frage.')
})

test('G-184: ohne note_de entsteht kein Block', () => {
  // `[cmd]` **124 der 412 sichtbaren Substanzen haben keine
  // `supplement_wada`-Zeile.** Dort darf nichts erscheinen, auch
  // keine Ueberschrift.
  assert.equal(wadaLage('not_prohibited', null, 'S1.1'), null)
  assert.equal(wadaLage(null, null, null), null)
  assert.equal(wadaLage('prohibited', '   ', 'S2'), null)
})

test('G-184: drei Zustaende, jeder mit eigener Ueberschrift', () => {
  // `[cmd]` **`monitored` gibt es dreimal** — Koffein, Semaglutid,
  // Tirzepatid. Weder erlaubt noch verboten.
  assert.equal(wadaLage('prohibited', 'x', null)!.titel, 'Für wen das Verbot gilt')
  assert.equal(wadaLage('monitored', 'x', null)!.titel,
    'Beobachtungsprogramm — was das heißt')
  assert.equal(wadaLage('not_prohibited', 'x', null)!.titel, 'Für wen das gilt')
})

test('G-184/G-194: jeder Zustand traegt seine eigene Bedeutung', () => {
  // `[cmd]` **G-194 hat diese Zuordnung korrigiert.** In G-184 stand
  // hier `warn` / `acc` / `null` — zwei davon waren falsch:
  //
  // - `not_prohibited` hatte GAR KEINE Farbe. Aber *„in keinem
  //   Verband verboten"* ist eine Aussage, keine Leerstelle — und die
  //   haeufigste (172 von 320). Jetzt `entwarnung`.
  // - `monitored` hatte `acc`, die WIRKUNGSfarbe. Das
  //   Beobachtungsprogramm sagt nichts ueber die Wirkung; es sagt,
  //   dass der Status sich aendern kann. Jetzt `pruefen`.
  assert.equal(wadaLage('prohibited', 'x', null)!.ton, 'gefahr')
  assert.equal(wadaLage('monitored', 'x', null)!.ton, 'pruefen')
  assert.equal(wadaLage('not_prohibited', 'x', null)!.ton, 'entwarnung')
})

test('G-184: die Klasse wird auf den Code gekuerzt', () => {
  // `[cmd]` **41 verschiedene Werte, bis 91 Zeichen** — der Auftrag
  // nahm reine Codes an. Der Satz dahinter steht in `note_de`.
  assert.equal(kategorieKurz('S1.1'), 'S1.1')
  assert.equal(kategorieKurz('S2/S0'), 'S2/S0')
  assert.equal(kategorieKurz('S4.4.2 Insulins and insulin-mimetics'), 'S4.4.2')
  assert.equal(
    kategorieKurz('S1.1 Anabolic agents (exogene AAS: Testosteron und '
      + 'seine Ester) — jederzeit verboten'), 'S1.1')
  assert.equal(kategorieKurz('S6.A (added 2026, in-competition)'), 'S6.A')
})

test('G-184: unknown ist keine Klasse', () => {
  // `[cmd]` 7 Zeilen tragen `unknown` — das ist das Fehlen einer
  // Klasse, nicht eine.
  assert.equal(kategorieKurz('unknown'), null)
  assert.equal(kategorieKurz(null), null)
  assert.equal(kategorieKurz(''), null)
})

test('G-184: eine Klasse, die dem Zustand widerspricht, entfaellt', () => {
  // `[cmd]` **Zwei Zeilen tragen `not prohibited` als Klasse, bei
  // `wada_status = 'prohibited'`** — Phenibut und Tianeptine. Der
  // Widerspruch steht in `note_de` selbst. Ohne diese Regel stuende
  // „verboten · not prohibited" nebeneinander.
  assert.equal(kategorieKurz('not prohibited'), null)
  assert.equal(kategorieKurz('not on WADA list (not prohibited)'), null)
})

test('G-184: der Block ist mit dem Lesepfad verdrahtet', () => {
  // `[read]` **Dieselbe Pruefung wie in G-186/187/191** — eine
  // Funktion, die niemand aufruft, besteht jeden Funktionstest.
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')

  const read = roh('src/lib/supplements/substanz-read.ts')
  assert.match(read, /wada_note:\s*text\(/,
    'Der Lesepfad reicht `note_de` nicht durch (G-184).')

  const tafel = roh('src/app/v2/supplements/substanz-tafel.tsx')
  assert.match(tafel, /wadaLage\s*\(/,
    'Die Tafel ruft `wadaLage` nicht auf (G-184).')

  // ── Warum hier die BINDUNG geprueft wird, nicht der Name ────────
  //
  // `[cmd]` **Die erste Fassung pruefte `/wada_note/` irgendwo in der
  // Datei — und blieb bei der Sabotage `wadaNote={undefined}` gruen**,
  // weil der Name in der Typdeklaration weiterlebt. Genau der blinde
  // Fleck aus G-186/187.
  //
  // `[read]` **Gemessen wird deshalb, WAS an die Eigenschaft gebunden
  // ist** — ein Feld des Datensatzes, nicht `undefined`.
  const bindung = tafel.match(/wadaNote=\{([^}]+)\}/)
  assert.ok(bindung, 'Der Block bekommt kein `wadaNote` (G-184).')
  assert.match(bindung![1], /^satz\.\w+$/,
    'An `wadaNote` haengt kein Feld des Datensatzes mehr — der Block '
    + 'ist damit abgeklemmt, obwohl der Name noch im Code steht (G-184).')

  const durchgereicht = tafel.match(/status=\{([^}]+)\}\s*note=\{([^}]+)\}/)
  assert.ok(durchgereicht,
    'Der Block bekommt Status und Satz nicht gemeinsam (G-184).')
})
