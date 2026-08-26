// G-195: der Reiter „Rechtslage".
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { reiterFuer } from '../substanz-reiter'
import type { Zahlen } from '../substanz-reiter'

const LEER: Zahlen = {
  menge: null, obergrenze: null, einnahme: null, mitEssen: null,
}

/** Ein Satz Texte, der genau den Ueberblick fuellt. */
const TEXTE = { kurz_was: 'Ein Stoff.' } as never

function reiter(wadaNote: string | null, rechtslage: string | null) {
  return reiterFuer(TEXTE, LEER, null, null, null, null, null, null, null,
    wadaNote, rechtslage).map(r => r.id)
}

test('G-195: der Reiter erscheint mit note_de allein', () => {
  // `[cmd]` **Gemessen 2026-08-26: 144 der 412 haben NUR `note_de`**,
  // keine Rechtslage — dort muss der Reiter trotzdem erscheinen.
  assert.ok(reiter('WADA S1: jederzeit verboten.', null).includes('rechtslage'))
})

test('G-195: und mit rechtslage_klartext allein', () => {
  // `[cmd]` **40 der 412 haben NUR die Rechtslage** — ohne
  // `supplement_wada`-Zeile. Auch dort erscheint er.
  assert.ok(reiter(null, 'In Deutschland verschreibungspflichtig.')
    .includes('rechtslage'))
})

test('G-195: ohne beides erscheint er nicht', () => {
  // ══ DIE NEGATIVPROBE AUS DEM AUFTRAG ════════════════════════════
  //
  // `[cmd]` **67 der 412 sichtbaren Substanzen haben weder das eine
  // noch das andere.** `[read]` Dort darf der Reiter nicht
  // erscheinen — ein Reiter, der nichts zeigt, ist ein Versprechen,
  // das er nicht einloest (§9).
  assert.equal(reiter(null, null).includes('rechtslage'), false)
  assert.equal(reiter('', '   ').includes('rechtslage'), false)
})

test('G-195: er steht VOR den Quellen und NACH den Fragen', () => {
  // **Tom:** *„am ende reiter vor quellen."*
  const ids = reiterFuer(TEXTE, LEER, null,
    [{ frage: 'F?', antwort: 'A' }] as never, null,
    [{ titel: 'Q' }] as never, null, null, null,
    'WADA-Satz', 'Rechtslage-Satz').map(r => r.id)
  const r = ids.indexOf('rechtslage')
  assert.ok(r > ids.indexOf('fragen'), 'Rechtslage steht vor den Fragen.')
  assert.ok(r < ids.indexOf('quellen'), 'Rechtslage steht hinter den Quellen.')
})

test('G-195: die Reiterzahl bleibt beobachtet', () => {
  // ══ EIN BEFUND, DER DEN AUFTRAG KORRIGIERT ══════════════════════
  //
  // **Auftrag: *„Kein siebter Reiter. Nachher sind es sechs."***
  //
  // `[cmd]` **Gemessen 2026-08-26 ueber alle 412 sichtbaren, ohne
  // Community-Reiter:** 7 Reiter bei **63** Substanzen · 6 bei
  // **272** · 5 bei **76**.
  //
  // `[read]` **Die Grenze war schon vor diesem Umbau erreicht** — der
  // Rechtslage-Reiter ist bei diesen 63 der siebte, nicht der achte.
  // Am Bild sind es weniger (Kreatin 5, AC-262356 4), weil selten
  // alles gefuellt ist.
  //
  // **Das ist gemeldet, nicht stillschweigend hingenommen.** Der
  // Waechter haelt den Stand fest: **acht ist die Obergrenze der
  // Mechanik**, und wer einen neunten anlegt, muss es entscheiden.
  const alle = reiterFuer(
    { kurz_was: 'x', wann_wie: 'x', zu_viel: 'x' } as never,
    { ...LEER, menge: '3 g' },
    [{ name: 'F' }] as never,
    [{ frage: 'F?', antwort: 'A' }] as never,
    'Labor', [{ titel: 'Q' }] as never, null, null,
    { nebenwirkungen: [{ id: '1' }], tradeoffs: [], mythen: [],
      qualitaet: [], begriffe: [] } as never,
    'WADA', 'Recht')
  assert.equal(alle.length, 8,
    `${alle.length} Reiter im Vollausbau — war 8 bei G-195. Ein `
    + 'neunter ist eine eigene Entscheidung, kein Nebenbei.')
})

test('G-195: der Reiter ist verdrahtet', () => {
  // `[read]` **Fuenfter Fall derselben Pruefung** (G-186/187/191/184):
  // eine Funktion, die niemand aufruft, besteht jeden Funktionstest.
  const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  const tafel = roh('src/app/v2/supplements/substanz-tafel.tsx')

  assert.match(tafel, /reiter === 'rechtslage'/,
    'Die Tafel kennt den Reiter nicht (G-195).')

  // Der WADA-Block steht GENAU EINMAL — im neuen Reiter.
  const treffer = tafel.match(/<WadaLageBlock/g) ?? []
  assert.equal(treffer.length, 1,
    `<WadaLageBlock> steht ${treffer.length}× — nach G-195 gehoert er `
    + 'nur in den Rechtslage-Reiter, nicht mehr in den Ueberblick.')

  // Und die zwei Felder werden an `reiterFuer` durchgereicht.
  assert.match(tafel, /satz\.wada_note,\s*satz\.texte\?\.rechtslage_klartext/,
    'Die Felder erreichen `reiterFuer` nicht — dann erscheint der '
    + 'Reiter nie (G-195).')
})

test('G-195: die Rechtslage steht nicht mehr in der Sicherheit', () => {
  // `[cmd]` **Sie stand dort nur bei `heikel`** — also fuer Enhanced
  // und Peptide. `[read]` Damit war ein Feld, das bei **201 von 412**
  // gefuellt ist, fuer die Mehrheit unsichtbar.
  const roh = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/supplements/substanz-tafel.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  assert.equal(/heikel && <AufgeteilterAbschnitt titel="Rechtslage"/.test(roh),
    false, 'Die Rechtslage haengt wieder an `heikel` (G-195).')
})
