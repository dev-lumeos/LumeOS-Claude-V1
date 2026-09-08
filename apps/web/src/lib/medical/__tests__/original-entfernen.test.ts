// Die Reihenfolge beim Entfernen eines Originals — G-381.
//
// `[read]` **Was hier geprueft wird, ist die REIHENFOLGE** — nicht,
// ob das Loeschen funktioniert. Das ist am Schirm gemessen (A3:
// `storage.objects` 3 → 2, `file_ref` geleert).
//
// `[cmd]` **Die Reihenfolge ist umgekehrt zum Ablegen:** erst der
// Verweis, dann die Datei. **Der Grund:** bricht es dazwischen ab,
// bleibt eine verwaiste Datei — die sieht niemand. Andersherum
// bliebe ein Verweis ins Leere, und der zeigt dem Nutzer einen
// Knopf, der jedes Mal scheitert.
//
// `[read]` **Warum ein Test und kein Kommentar:** ein Umbau, der die
// zwei Bloecke tauscht, faellt sonst niemandem auf — beide Wege
// „funktionieren", nur der eine hinterlaesst den schlimmeren Rest.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// `[cmd]` Der Pfad kommt aus `import.meta.url`, nicht aus `cwd` —
// sonst ist die Probe aus der Wurzel gruen und faellt im Gate.
const HIER = dirname(fileURLToPath(import.meta.url))
const QUELLE = readFileSync(join(HIER, '..', 'dokumente-write.ts'), 'utf-8')

/** Nur den Rumpf von `entferneOriginal` — nicht die ganze Datei. */
function rumpf(): string {
  const a = QUELLE.indexOf('export async function entferneOriginal')
  assert.ok(a > 0, 'entferneOriginal nicht gefunden')
  const b = QUELLE.indexOf('\nexport ', a + 10)
  return QUELLE.slice(a, b === -1 ? undefined : b)
}

test('der Verweis wird vor der Datei geloescht', () => {
  const r = rumpf()
  const verweis = r.indexOf("update({ file_ref: null })")
  const datei = r.indexOf('.remove([pfad])')
  assert.ok(verweis > 0, 'kein `update({ file_ref: null })` im Rumpf')
  assert.ok(datei > 0, 'kein `.remove([pfad])` im Rumpf')
  assert.ok(verweis < datei,
    'Die Datei wird vor dem Verweis geloescht — bei einem Abbruch '
    + 'bliebe ein Verweis auf ein geloeschtes Objekt.')
})

test('der Pfad kommt aus der eigenen Zeile, nicht vom Aufrufer', () => {
  // `[read]` Naehme die Funktion einen Pfad entgegen, liesse sich ein
  // fremder unterschieben. Die Signatur ist die Zusage.
  const r = rumpf()
  const kopf = r.slice(0, r.indexOf('{'))
  assert.ok(!/pfad\s*:/.test(kopf),
    'entferneOriginal nimmt einen Pfad entgegen — er muss aus der '
    + 'eigenen Zeile kommen')
  assert.match(r, /\.select\('id, file_ref'\)/,
    'der Pfad wird nicht aus der eigenen Zeile gelesen')
})

test('beide Schreibschritte sind auf den eigenen Nutzer begrenzt', () => {
  // `[cmd]` G-79: PostgREST meldet `ok` fuer ein Update, das der
  // Zeilenschutz auf null Zeilen gefiltert hat. `eq('user_id')` ist
  // die zweite Schranke — und die Null-Zeilen-Pruefung die dritte.
  const r = rumpf()
  const n = (r.match(/\.eq\('user_id', userId\)/g) ?? []).length
  assert.equal(n, 2,
    `\`eq('user_id', userId)\` steht ${n}-mal, erwartet 2 (Lesen und Update)`)
  assert.match(r, /if \(!\(data \?\? \[\]\)\.length\)/,
    'keine Null-Zeilen-Pruefung nach dem Update (G-79)')
})
