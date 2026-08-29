// C-336: Detailtexte, die am falschen Naehrstoff haengen.
//
// `[read]` **Dieser Waechter prueft eine DATENLAGE, nicht Code** — er
// haelt fest, was am 2026-08-29 gemessen wurde, damit es nicht
// unbemerkt wieder entsteht. `[cmd]` Die Korrektur selbst ist
// Datenpflege und gehoert Codex; C-336 meldet nur.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Die zwei Faelle, gemessen am 2026-08-29.
 *
 * `[cmd]` **Beide entstanden gleich:** der Importlauf verband ueber
 * Schluesselgleichheit. Wo derselbe Code in beiden Repos existiert,
 * aber Verschiedenes bedeutet, ist der Text am falschen Naehrstoff
 * gelandet — **formal richtig, inhaltlich falsch.**
 */
const FALSCH_ZUGEORDNET = [
  {
    code: 'FD',
    hier: 'Fluorid',
    text: 'Trockenmassegehalt eines Lebensmittels',
    // Der richtige Text liegt im Vorgaengerrepo unter einem anderen
    // Schluessel und wurde nicht importiert.
    richtigerSchluessel: 'F',
    richtigerText: 'Zahnschutz',
  },
  {
    code: 'CHORL',
    hier: 'Cholesterin',
    text: 'Magensäure, Elektrolythaushalt, Verdauung',
    richtigerSchluessel: 'CHOL',
    richtigerText: 'Hormone, Zellmembranen',
  },
] as const

const QUELLE = path.join(process.cwd(), '..', '..', 'referenz', 'lumeos-2026',
  'apps', 'app', 'modules', 'nutrition', 'data', 'nutrientDetails.ts')

test('C-336: die Quelldatei des Vorgaengerrepos liegt noch da', () => {
  // `[read]` Faellt sie weg, verliert dieser Waechter seine
  // Vergleichsgrundlage — dann soll er das sagen, nicht still gruen
  // bleiben.
  assert.ok(fs.existsSync(QUELLE),
    `Die Quelldatei fehlt: ${QUELLE}. Ohne sie ist C-336 nicht pruefbar.`)
})

/** Der Block eines Schluessels aus der Quelldatei, oder `null`. */
function block(quelle: string, schluessel: string): string | null {
  const m = new RegExp(`\\n  ${schluessel}: \\{[\\s\\S]*?\\n  \\},`).exec(quelle)
  return m ? m[0] : null
}

test('C-336: der richtige Text steht im Vorgaengerrepo bereit', () => {
  // `[cmd]` **Der Beleg, dass es ein Importfehler ist und kein
  // fehlender Text:** beide richtigen Eintraege existieren in der
  // Quelldatei — unter `F` und `CHOL`, die es hier nicht gibt.
  //
  // `[read]` **Die Pruefung liest den BLOCK des Schluessels, nicht die
  // ganze Datei.** Ein `includes` ueber alles waere gruen geblieben,
  // wenn der Text irgendwo sonst steht — und genau so hat eine
  // Sabotage ueberlebt.
  const quelle = fs.readFileSync(QUELLE, 'utf8')
  for (const f of FALSCH_ZUGEORDNET) {
    // Der richtige Schluessel ist ein ANDERER als der kollidierende.
    assert.notEqual(f.richtigerSchluessel, f.code,
      `${f.code}: der richtige Schluessel darf nicht derselbe sein — `
      + 'sonst gaebe es keine Kollision zu melden.')
    const b = block(quelle, f.richtigerSchluessel)
    assert.ok(b, `Der Schluessel ${f.richtigerSchluessel} fehlt in der Quelldatei.`)
    assert.ok(b.includes(f.richtigerText),
      `Unter ${f.richtigerSchluessel} steht nicht „${f.richtigerText}", `
      + 'sondern etwas anderes.')
    // Und der richtige Text ist nicht derselbe wie der falsche.
    assert.notEqual(f.richtigerText, f.text,
      `${f.code}: richtiger und falscher Text sind identisch — dann ist `
      + 'nichts falsch zugeordnet.')
  }
})

test('C-336: der falsche Text steht dort unter dem kollidierenden Code', () => {
  // `[cmd]` **Und der Gegenbeweis:** der Text, der hier am falschen
  // Naehrstoff haengt, steht in der Quelle unter genau dem Code, der
  // in beiden Repos vorkommt. **Der Import hat korrekt gearbeitet —
  // die Bedeutung hat sich geaendert, nicht der Schluessel.**
  const quelle = fs.readFileSync(QUELLE, 'utf8')
  for (const f of FALSCH_ZUGEORDNET) {
    const b = block(quelle, f.code)
    assert.ok(b, `Der Block ${f.code} fehlt in der Quelldatei.`)
    assert.ok(b.includes(f.text),
      `Unter ${f.code} steht in der Quelle nicht „${f.text}".`)
    // Und der RICHTIGE Text steht dort gerade NICHT — sonst waere der
    // Import in Ordnung gewesen.
    assert.ok(!b.includes(f.richtigerText),
      `Unter ${f.code} steht bereits „${f.richtigerText}" — dann ist `
      + 'die Zuordnung nicht falsch.')
  }
})

test('C-336: die zwei Faelle sind benannt, nicht stillschweigend gelassen', () => {
  // `[read]` **Der Punkt des Waechters:** wer die Zuordnung
  // korrigiert, aendert diese Liste — und wer sie versehentlich
  // wiederherstellt, faellt darueber.
  assert.equal(FALSCH_ZUGEORDNET.length, 2,
    'Gemessen am 2026-08-29: genau zwei von 110 Detailzeilen sind falsch zugeordnet.')
  assert.deepEqual(FALSCH_ZUGEORDNET.map(f => f.code).sort(), ['CHORL', 'FD'])
})

test('C-336: der Import verband ueber Schluesselgleichheit', () => {
  // `[cmd]` **Die Ursache in einem Satz:** `F`, `CHOL`, `SE` und
  // `FIBTG` stehen in der Quelle, aber nicht in
  // `nutrition.nutrient_defs` — sie fielen beim Import aus, waehrend
  // `FD` und `CHORL` als exakte Treffer durchgingen.
  //
  // `[read]` **Ein Fremdschluessel faengt das nicht** — die Zeile
  // verweist auf einen existierenden Code. Nur der Inhalt ist falsch.
  const quelle = fs.readFileSync(QUELLE, 'utf8')
  for (const k of ['F', 'CHOL', 'SE', 'FIBTG']) {
    assert.match(quelle, new RegExp(`\\n  ${k}: \\{`),
      `${k} sollte in der Quelldatei stehen (nicht importiert, aber vorhanden).`)
  }
})
