/**
 * G-578 — der Laborimport bekommt seinen Aufrufer
 *
 * `[cmd]` **Drei Funktionen, null Aufrufer** — gezaehlt am
 * 2026-10-01 in `apps/web/src` und `packages/`, ohne Tests:
 *
 *     medical.import_lab_report_rows        0
 *     medical.start_lab_report_ocr          0
 *     medical.store_lab_report_ocr_result   0
 *
 * **Der einzige Treffer im ganzen Produkt war ein Kommentar**
 * (`katalog-suche.tsx:20`).
 *
 * `[read]` **Das ist die Fehlerklasse aus G-571:** sechs Funktionen
 * gebaut, geprueft und unerreichbar, **weil jede Messung gefragt hat,
 * ob die Funktion RICHTIG ist, und keine, ob sie ANKOMMT.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  IMPORTQUELLEN, pruefeImport, alsZeilen, ergebnisSatz,
  type ImportKopf, type ImportZeile,
} from '../laborimport'
import { fachmeldung, fehlerart } from '../../fehler/ladefehler'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

const KOPF: ImportKopf = { report_date: '2026-10-01', source: 'photo_ocr' }
const ZEILEN: ImportZeile[] = [
  { marker_name: 'Hämoglobin', unit: 'g/dL', value_numeric: 15.8 },
]

// ════════════════════════════════════════════════════════════════
// A4 — der Waechter zaehlt den AUFRUF, nicht die Funktion
// ════════════════════════════════════════════════════════════════

function quelldateien(pfad: string, aus: string[] = []): string[] {
  for (const e of readdirSync(pfad)) {
    if (e === '__tests__' || e === 'node_modules' || e.startsWith('.next')) continue
    const p = join(pfad, e)
    if (statSync(p).isDirectory()) quelldateien(p, aus)
    else if (e.endsWith('.ts') || e.endsWith('.tsx')) aus.push(p)
  }
  return aus
}

/** Die drei Funktionen und die Datei, die sie rufen muss. */
const FUNKTIONEN = [
  'import_lab_report_rows',
  'start_lab_report_ocr',
  'store_lab_report_ocr_result',
] as const

describe('G-578/A4 — jede der drei Funktionen hat einen Aufrufer', () => {
  const DATEIEN = quelldateien(SRC)

  it('der Heuhaufen ist nicht leer', () => {
    assert.ok(DATEIEN.length > 200,
      `nur ${DATEIEN.length} Quelldateien — der Waechter laeuft ins Leere`)
  })

  for (const f of FUNKTIONEN) {
    it(`${f} wird gerufen, nicht nur erwaehnt`, () => {
      // `[read]` **Gesucht wird der AUFRUF.** `[cmd]` **Der einzige
      // Treffer vor diesem Punkt war ein Kommentar** — ein Waechter
      // auf den blossen Namen waere damals schon gruen gewesen und
      // haette die Luecke zugedeckt.
      const rufer = DATEIEN.filter(p =>
        new RegExp(`\\.rpc\\(\\s*'${f}'`).test(lies(p)))
      assert.ok(rufer.length >= 1,
        `medical.${f} hat keinen Aufrufer — gebaut und unerreichbar `
        + '(G-571)')
    })
  }

  it('der Waechter trifft die Form, die er sucht', () => {
    // `[read]` **Erst an einem bekannten Fall eichen** — sonst
    // beweist ein Nichtfund nichts.
    const echt = "await db().rpc('start_lab_report_ocr', { p_report_id: id })"
    assert.ok(/\.rpc\(\s*'start_lab_report_ocr'/.test(echt),
      'der Waechter findet den eigenen Aufruf nicht')
    // `[cmd]` **Und der Kommentar aus `katalog-suche.tsx:20` darf
    // NICHT als Aufruf zaehlen** — genau er war der einzige Treffer.
    const kommentar = '// nur `biomarker_marker_candidates`, `import_lab_report_rows`,'
    assert.ok(!/\.rpc\(\s*'import_lab_report_rows'/.test(kommentar),
      'der Waechter haelt eine Erwaehnung fuer einen Aufruf')
  })

  it('der Weg fuehrt von der Oberflaeche bis zur Funktion', () => {
    // `[read]` **Ein Aufruf ohne Knopf waere derselbe Fehler eine
    // Ebene hoeher.**
    const modale = lies(join(SRC, 'app', 'v2', 'medical', 'modale.tsx'))
    assert.match(modale, /zeilenUebernehmenAktion\(/,
      'das Pruefmodal ruft die Serveraktion nicht')
    assert.match(modale, /data-ocr-uebernehmen/,
      'es gibt keinen Uebernehmen-Knopf')

    const verlauf = lies(join(SRC, 'app', 'v2', 'medical', 'tab-verlauf.tsx'))
    assert.match(verlauf, /erkennungStartenAktion\(/,
      'der Dateiweg merkt keine Erkennung vor')
    assert.match(verlauf, /data-ocr-starten/,
      'es gibt keinen Knopf fuer die Erkennung')

    const aktionen = lies(join(SRC, 'app', 'v2', 'medical', 'laborimport-aktionen.ts'))
    assert.match(aktionen, /'use server'/, 'die Aktionen laufen nicht serverseitig')

    const write = lies(join(SRC, 'lib', 'medical', 'laborimport-write.ts'))
    for (const f of FUNKTIONEN) {
      assert.ok(new RegExp(`\\.rpc\\(\\s*'${f}'`).test(write),
        `der Schreibweg ruft ${f} nicht`)
    }
  })

  it('der Uebernahmeknopf ist kein InEntwicklungKnopf mehr', () => {
    // `[cmd]` **ROH gelesen** — `lies()` entfernt Kommentare, und der
    // alte Grund WAR einer. **Die Lehre aus G-577:** ein Waechter,
    // der seinen Gegenstand wegfiltert, misst nichts.
    const roh = readFileSync(
      join(SRC, 'app', 'v2', 'medical', 'modale.tsx'), 'utf8')
    const a = roh.indexOf('function OCRReviewModal')
    const rumpf = roh.slice(a, roh.indexOf('function ManualEntryModal'))
    assert.ok(a > 0 && rumpf.length > 500, 'das Modal wurde nicht gefunden')
    assert.ok(!/<InEntwicklungKnopf titel="Confirm \+ save"/.test(rumpf),
      'der Uebernahmeknopf ist wieder gesperrt — der Schreibweg ist '
      + 'gebaut und wird gerufen')
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — die Signatur, gemessen statt angenommen
// ════════════════════════════════════════════════════════════════

describe('G-578/A1 — die Nutzlast passt zur Signatur', () => {
  it('eine Zeile traegt marker_name und unit', () => {
    // `[cmd]` **Beides wirft im Rumpf**, gelesen 2026-10-01:
    // `marker_name missing` und `unit missing`.
    const [z] = alsZeilen(ZEILEN)
    assert.equal(z.marker_name, 'Hämoglobin')
    assert.equal(z.unit, 'g/dL')
  })

  it('kein loinc_code in der Nutzlast', () => {
    // `[read]` **Die Zuordnung macht die Datenbank** — je Zeile ruft
    // die Funktion `biomarker_marker_candidates(marker_name, unit)`.
    // **Ein mitgeschickter Code waere eine vorweggenommene
    // Entscheidung, und es gibt kein Feld dafuer.**
    const [z] = alsZeilen(ZEILEN)
    assert.ok(!('loinc_code' in z), 'die Oberflaeche schickt einen LOINC mit')
    assert.ok(!('match_status' in z))
  })

  it('leere Felder fallen weg statt null zu werden', () => {
    const [z] = alsZeilen([{ marker_name: 'x', unit: 'y', notes: '  ' }])
    assert.ok(!('notes' in z), 'eine leere Notiz steht in der Nutzlast')
    assert.ok(!('value_numeric' in z), 'ein fehlender Wert steht als null drin')
  })

  it('die Quellen kommen aus dem CHECK', () => {
    // `[cmd]` **`lab_reports_source_check` kennt fuenf Werte.**
    // `[read]` **`seed` fehlt hier bewusst** — er gehoert den
    // Testdaten, nicht einem Nutzerimport.
    assert.deepEqual([...IMPORTQUELLEN],
      ['manual', 'pdf_upload', 'photo_ocr', 'lab_import'])
    assert.ok(!(IMPORTQUELLEN as readonly string[]).includes('seed'))
  })

  it('der Aufrufer legt KEINE lab_reports-Zeile selbst an', () => {
    // `[cmd]` **Die Funktion tut es im Rumpf** (`INSERT INTO
    // medical.lab_reports … RETURNING id`). `[read]` **Wer vorher
    // selbst schriebe, erzeugte zwei Berichte.**
    const write = lies(join(SRC, 'lib', 'medical', 'laborimport-write.ts'))
    assert.ok(!/from\('lab_reports'\)[\s\S]{0,80}\.insert\(/.test(write),
      'der Schreibweg legt selbst einen Bericht an — die Funktion '
      + 'tut das bereits')
  })

  it('p_user_id kommt aus der Sitzung, nicht vom Aufrufer', () => {
    // `[read]` **`p_user_id <> auth.uid()` wirft `user mismatch`** —
    // ein Parameter vom Browser waere eine Einladung, einen fremden
    // zu nennen.
    const write = lies(join(SRC, 'lib', 'medical', 'laborimport-write.ts'))
    assert.match(write, /p_user_id:\s*user\.id/,
      'p_user_id stammt nicht aus auth.getUser()')
  })

  it('das Ergebnis wird geprueft, nicht angenommen — in ALLEN DREI', () => {
    // `[cmd]` **G-79** — und `RETURNS TABLE` kommt als Array.
    //
    // `[read]` **Gezaehlt, nicht gesucht.** `[cmd]` **Eine Sabotage,
    // die die Pruefung aus EINER der drei Funktionen nahm, kam gruen
    // durch** — ein `assert.match` ist zufrieden, sobald es die
    // beiden anderen findet. **Drei Wege, drei Pruefungen.**
    const write = lies(join(SRC, 'lib', 'medical', 'laborimport-write.ts'))
    const auspacken = write.match(/Array\.isArray\(data\)/g) ?? []
    const pruefen = write.match(/zeile\?\.report_id/g) ?? []
    assert.equal(auspacken.length, 3,
      `nur ${auspacken.length} von 3 Rueckgaben werden ausgepackt`)
    assert.equal(pruefen.length, 3,
      `nur ${pruefen.length} von 3 Rueckgaben werden geprueft — ein `
      + 'Ergebnis ohne Kennung gilt dort als Erfolg (G-79)')
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — die Pruefung kommt der Funktion zuvor
// ════════════════════════════════════════════════════════════════

describe('G-578/A1 — die Pruefung nennt die Zeile', () => {
  it('ohne Datum faellt sie', () => {
    assert.ok(pruefeImport({ ...KOPF, report_date: '' }, ZEILEN)
      .some(f => f.feld === 'report_date'))
  })

  it('ohne Zeile faellt sie', () => {
    assert.ok(pruefeImport(KOPF, []).some(f => f.feld === 'zeilen'))
  })

  it('eine Zeile ohne Namen nennt ihre Nummer', () => {
    // `[read]` **Die Funktion bricht in der Schleife ab** und meldet
    // englisch ohne Zeilenbezug. **Deshalb hier vorher, mit Nummer.**
    const f = pruefeImport(KOPF, [
      { marker_name: 'ok', unit: 'g/dL' },
      { marker_name: '  ', unit: 'g/dL' },
    ])
    assert.ok(f.some(x => x.feld === 'zeile.1.marker_name'),
      'die zweite Zeile wird nicht geprueft')
    assert.match(f.find(x => x.feld === 'zeile.1.marker_name')!.text, /Zeile 2/,
      'der Satz nennt die Zeilennummer nicht')
  })

  it('eine Zeile ohne Einheit faellt auch', () => {
    assert.ok(pruefeImport(KOPF, [{ marker_name: 'x', unit: '' }])
      .some(f => f.feld === 'zeile.0.unit'))
  })

  it('eine unbekannte Quelle faellt', () => {
    assert.ok(pruefeImport({ ...KOPF, source: 'seed' as never }, ZEILEN)
      .some(f => f.feld === 'source'))
  })

  it('der gueltige Fall faellt nicht', () => {
    assert.deepEqual(pruefeImport(KOPF, ZEILEN), [])
  })

  it('der Ergebnissatz nennt die drei Zustaende', () => {
    // `[read]` **`ambiguous` und `unknown` sind UEBERNOMMEN** — mit
    // `needs_verification = true`. **Eine Erfolgsmeldung ohne diese
    // Zahl verschwiege, dass ein Mensch nachsehen muss.**
    const s = ergebnisSatz({
      report_id: 'x', inserted_count: 11, exact_count: 8,
      ambiguous_count: 2, unknown_count: 1,
    })
    assert.match(s, /11 Zeilen/)
    assert.match(s, /8 zugeordnet/)
    assert.match(s, /2 mehrdeutig/)
    assert.match(s, /1 unbekannt/)
    assert.match(s, /3 brauchen eine Pruefung/,
      'der Satz nennt die Zahl der offenen Faelle nicht')
  })

  it('ohne offene Faelle fehlt der Pruefsatz', () => {
    const s = ergebnisSatz({
      report_id: 'x', inserted_count: 3, exact_count: 3,
      ambiguous_count: 0, unknown_count: 0,
    })
    assert.ok(!/Pruefung/.test(s), 'der Pruefsatz steht ohne offene Faelle')
  })
})

// ════════════════════════════════════════════════════════════════
// A3 — P0001 und user mismatch bekommen einen Text
// ════════════════════════════════════════════════════════════════

describe('G-578/A3 — die Fachmeldungen haben einen Satz', () => {
  it('user mismatch wird uebersetzt', () => {
    // `[cmd]` **Vor diesem Punkt: null Treffer auf `P0001` und
    // `user mismatch` in `apps/web/src/lib`.**
    const s = fachmeldung('medical import: user mismatch')
    assert.ok(s, 'user mismatch hat keinen Text')
    assert.match(s!, /anderen Konto/,
      'der Satz sagt nicht, woran es liegt')
    assert.ok(!/Fehler|error|P0001/i.test(s!),
      'der Satz reicht den technischen Fehler durch')
  })

  it('user mismatch ist KEIN Sitzungsfehler', () => {
    // `[read]` **Die Sitzung ist gueltig** — sie gehoert nur zu einer
    // anderen Person. **Zur Anmeldung zu schicken waere die falsche
    // Suche** (G-553).
    assert.equal(fehlerart('medical import: user mismatch'), 'daten')
  })

  it('die fehlende OCR-Sitzung IST einer', () => {
    // `[cmd]` **`28000`, geworfen von beiden OCR-Funktionen**, wenn
    // `auth.uid()` leer ist. `[read]` **Der TEXT traegt kein
    // Sitzungsmerkmal** — ohne den Code stuende er als Datenfehler
    // da, ohne Weg zur Anmeldung.
    assert.equal(
      fehlerart('medical OCR: authentication required', '28000'), 'sitzung')
    assert.equal(
      fehlerart('medical OCR: authentication required'), 'daten',
      'ohne Code bleibt es ein Datenfehler — das ist der Grund fuer '
      + 'die Codepruefung')
  })

  it('alle sieben Fachmeldungen haben einen Satz', () => {
    // `[cmd]` **Aus den drei Funktionsruempfen gelesen, 2026-10-01.**
    for (const t of [
      'medical import: user mismatch',
      'medical import: rows must be an array',
      'medical import: marker_name missing',
      'medical import: unit missing',
      'medical OCR: authentication required',
      'medical OCR: own report with original not found',
      'medical OCR: own processing report not found',
    ]) {
      const s = fachmeldung(t)
      assert.ok(s && s.length > 20, `ohne Satz: ${t}`)
    }
  })

  it('was keinen Satz hat, bekommt keinen erfundenen', () => {
    // `[read]` **`null` heisst: der technische Satz steht da** — und
    // das ist besser als ein erfundener (G-553).
    assert.equal(fachmeldung('some other postgres error'), null)
    assert.equal(fachmeldung(null), null)
  })

  it('der Schreibweg benutzt sie', () => {
    const write = lies(join(SRC, 'lib', 'medical', 'laborimport-write.ts'))
    assert.match(write, /from '\.\.\/fehler\/ladefehler'/,
      'der Schreibweg fuehrt eine eigene Fehlerkunde')
    assert.match(write, /fachmeldung\(/, 'die Fachmeldung wird nicht benutzt')
  })

  it('die Datei liegt querliegend, nicht unter medical', () => {
    // `[read]` **G-555 hat sie aus `goals/` geholt** — ein zweiter
    // Ort fuer dieselbe Frage driftet.
    assert.ok(existsSync(join(SRC, 'lib', 'fehler', 'ladefehler.ts')))
    assert.ok(!existsSync(join(SRC, 'lib', 'medical', 'ladefehler.ts')),
      'medical fuehrt eine eigene Fehlerkunde')
  })
})

// ════════════════════════════════════════════════════════════════
// A2 — die OCR-Funktionen stehen am Dateiweg
// ════════════════════════════════════════════════════════════════

describe('G-578/A2 — die Erkennung haengt am Original', () => {
  it('der Knopf steht dort, wo eine Datei liegt', () => {
    // `[cmd]` **`start_lab_report_ocr` verlangt
    // `file_ref IS NOT NULL`** — sonst `P0002`.
    const roh = readFileSync(
      join(SRC, 'app', 'v2', 'medical', 'tab-verlauf.tsx'), 'utf8')
    const i = roh.indexOf('data-ocr-starten')
    assert.ok(i > 0, 'der Knopf fehlt')
    // `[read]` **Er steht im `d.pfad`-Zweig** — der Zweig ohne Pfad
    // bietet „Datei wählen" an.
    const davor = roh.slice(Math.max(0, i - 2000), i)
    assert.match(davor, /d\.pfad\s*\n?\s*\?/,
      'der Knopf steht nicht im Zweig mit vorhandenem Original')
  })

  it('der Knopf sagt, was fehlt', () => {
    // `[read]` **Die Funktion ERKENNT nichts** — sie merkt vor.
    // **Wenn der Dienst fehlt, ist das ein Befund und kein Grund,
    // einen zu bauen** (A2). **Nichts behaupten, was nicht laeuft.**
    const roh = readFileSync(
      join(SRC, 'app', 'v2', 'medical', 'tab-verlauf.tsx'), 'utf8')
    const i = roh.indexOf('data-ocr-starten')
    const block = roh.slice(i, i + 1200)
    // `[read]` **Beide Stellen einzeln**, nicht „irgendwo im Block":
    // `[cmd]` **eine Sabotage, die den Hinweis aus dem `title`
    // strich, kam gruen durch** — die Erfolgsmeldung darunter trug
    // denselben Satz, und ein `match` ueber den ganzen Block war
    // damit zufrieden.
    const titel = block.slice(block.indexOf('title={'), block.indexOf('onClick'))
    assert.match(titel, /fehlt noch/,
      'der Knopf verschweigt im title, dass der Erkennungsdienst fehlt')
    const meldung = block.slice(block.indexOf('setMeldung'))
    assert.match(meldung, /fehlt noch/,
      'die Erfolgsmeldung verschweigt, dass der Erkennungsdienst fehlt')
    assert.match(block, /vormerken|vorgemerkt/,
      'der Knopf behauptet, er erkenne etwas')
  })

  it('store_lab_report_ocr_result hat einen Weg, aber keine Quelle', () => {
    // `[read]` **Der Befund, offen benannt:** die Funktion wird
    // gerufen, **aber von keiner Oberflaeche** — es gibt nichts, das
    // ein Erkennungsergebnis erzeugt. **Der Weg steht, die Quelle
    // fehlt.**
    const write = lies(join(SRC, 'lib', 'medical', 'laborimport-write.ts'))
    assert.match(write, /\.rpc\(\s*'store_lab_report_ocr_result'/,
      'der Weg fehlt')
    const aktionen = lies(join(SRC, 'app', 'v2', 'medical', 'laborimport-aktionen.ts'))
    assert.match(aktionen, /erkennungAblegenAktion/,
      'die Serveraktion fehlt')
  })

  it('die Reihenfolge steht in der Datenbank, nicht im Code', () => {
    // `[cmd]` **`store_…` verlangt `ocr_status = 'processing'`** —
    // also erst vormerken, dann ablegen. `[read]` **Die Funktion
    // erzwingt es**, der Aufrufer muss es nicht nachbauen.
    const write = lies(join(SRC, 'lib', 'medical', 'laborimport-write.ts'))
    assert.ok(!/ocr_status\s*===?\s*'processing'/.test(write),
      'der Aufrufer baut die Reihenfolge nach — die Funktion '
      + 'erzwingt sie bereits')
  })
})
