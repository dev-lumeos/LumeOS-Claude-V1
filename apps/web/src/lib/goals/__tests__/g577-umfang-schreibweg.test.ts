/**
 * G-577 — die Umfangserfassung bekommt ihren Schreibweg
 *
 * `[cmd]` **`goals.body_circumference_write` hatte null Aufrufer** in
 * `apps/` und `packages/`, gezaehlt bei der Abnahme von G-535.
 * **Die Funktion ist gebaut, geprueft, seit G-535 auf `auth.uid()`
 * umgestellt — und ein Nutzer konnte keinen Umfang eintragen.**
 *
 * `[read]` **Die Luecke ist zwei Monate unbemerkt geblieben, weil
 * jede Messung nur gefragt hat, ob die Funktion RICHTIG ist** —
 * keine hat gezaehlt, ob sie ERREICHT wird. **A5 ist die Zeile, die
 * das dauerhaft macht.**
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  UMFANGSSTELLEN, UMFANG_QUELLEN, LEERE_UMFANGSEINGABE,
  pruefeUmfang, alsParameter, zahl,
  type UmfangEingabe,
} from '../umfang-rechnung'

const HIER = dirname(fileURLToPath(import.meta.url))
const SRC = join(HIER, '..', '..', '..')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

/** Ein vollstaendiger, gueltiger Satz — die Grundlage der Proben. */
const GUELTIG: UmfangEingabe = {
  ...LEERE_UMFANGSEINGABE,
  measurement_date: '2026-10-01',
  measurement_time: '08:30',
  werte: { waist_cm: '82' },
}

// ════════════════════════════════════════════════════════════════
// A5 — der Waechter, der den Aufrufer haelt
// ════════════════════════════════════════════════════════════════

/**
 * Alle `.ts`/`.tsx` unter `apps/web/src`, ohne Tests und ohne Bau.
 *
 * `[read]` **Der Heuhaufen wird GEZAEHLT** — eine Liste, die leer
 * laeuft, prueft nichts.
 */
function quelldateien(pfad: string, aus: string[] = []): string[] {
  for (const e of readdirSync(pfad)) {
    if (e === '__tests__' || e === 'node_modules' || e.startsWith('.next')) continue
    const p = join(pfad, e)
    if (statSync(p).isDirectory()) quelldateien(p, aus)
    else if (e.endsWith('.ts') || e.endsWith('.tsx')) aus.push(p)
  }
  return aus
}

describe('G-577/A5 — die Datenbankfunktion hat einen Aufrufer', () => {
  const DATEIEN = quelldateien(SRC)

  it('der Heuhaufen ist nicht leer', () => {
    assert.ok(DATEIEN.length > 200,
      `nur ${DATEIEN.length} Quelldateien gefunden — der Waechter `
      + 'laeuft ins Leere, wenn der Pfad nicht stimmt')
  })

  // `[cmd]` **Das ist die Zusicherung, die zwei Monate gefehlt hat.**
  it('body_circumference_write wird gerufen, nicht nur erwaehnt', () => {
    // `[read]` **Gesucht wird der AUFRUF, nicht das Wort** — ein
    // Kommentar mit dem Funktionsnamen ist kein Aufrufer. **Genau
    // dieser Fall stand in G-571:** der einzige Treffer im ganzen
    // Produkt war ein Kommentar in `medical/katalog-suche.tsx:20`.
    const rufer = DATEIEN.filter(p =>
      /\.rpc\(\s*'body_circumference_write'/.test(lies(p)))
    assert.ok(rufer.length >= 1,
      'goals.body_circumference_write hat keinen Aufrufer — die '
      + 'Funktion ist gebaut und unerreichbar (G-571)')
  })

  it('der Waechter trifft die Form, die er sucht', () => {
    // `[read]` **Eine Suche, die nichts findet, beweist nichts.**
    assert.ok(/\.rpc\(\s*'body_circumference_write'/.test(
      "await db().rpc('body_circumference_write', alsParameter(e))"),
      'der Waechter findet den eigenen Aufruf nicht')
    // `[cmd]` **Und was er NICHT als Aufruf zaehlen darf:** der
    // blosse Name in einer Zeichenkette oder einem Kommentar.
    assert.ok(!/\.rpc\(\s*'body_circumference_write'/.test(
      "// ruft spaeter body_circumference_write auf"),
      'der Waechter haelt eine Erwaehnung fuer einen Aufruf')
  })

  it('der Weg fuehrt von der Oberflaeche bis zur Funktion', () => {
    // `[read]` **Ein Aufruf ohne Knopf waere derselbe Fehler eine
    // Ebene hoeher** — deshalb die ganze Kette, Glied fuer Glied.
    const modale = lies(join(SRC, 'app', 'v2', 'goals', 'modale.tsx'))
    assert.match(modale, /umfangAnlegenAktion\(/,
      'das Modal ruft die Serveraktion nicht')
    assert.match(modale, /data-umfang-speichern/,
      'es gibt keinen Speichern-Knopf')

    const aktion = lies(join(SRC, 'app', 'v2', 'goals', 'umfang-aktionen.ts'))
    assert.match(aktion, /'use server'/, 'die Aktion laeuft nicht serverseitig')
    assert.match(aktion, /umfangAnlegen\(/,
      'die Serveraktion ruft den Schreibweg nicht')

    const write = lies(join(SRC, 'lib', 'goals', 'umfang-write.ts'))
    assert.match(write, /\.rpc\(\s*'body_circumference_write'/,
      'der Schreibweg ruft die Datenbankfunktion nicht')

    // `[cmd]` **Der Ausloeser steht in `ansicht.tsx`** — ohne ihn
    // waere das Modal gebaut und unerreichbar (dieselbe Klasse).
    const ansicht = lies(join(SRC, 'app', 'v2', 'goals', 'ansicht.tsx'))
    assert.match(ansicht, /typ:\s*'logMeasure'/,
      'kein Knopf oeffnet das Umfangsmodal')
  })

  it('der falsche Vermerk ist weg', () => {
    // `[cmd]` **Er behauptete, `body_measurements` trage die
    // Umfaenge und der Schreibweg fehle** — beides falsch.
    // `[read]` **Ein Vermerk mit falschem Grund verhindert, dass
    // jemand nachsieht.**
    // `[cmd]` **ROH gelesen, ohne `lies()`** — `lies()` entfernt
    // Kommentare, **und ein Vermerk IST ein Kommentar.** `[read]`
    // **Diese Zusicherung konnte damit gar nicht fallen:** die
    // Sabotage, die den falschen Satz als Kommentar wieder einsetzte,
    // kam gruen durch. **Ein Waechter, der seinen Gegenstand
    // wegfiltert, misst nichts.**
    const roh = readFileSync(
      join(SRC, 'app', 'v2', 'goals', 'modale.tsx'), 'utf8')
    const stelle = roh.indexOf('function LogMeasureModal')
    const umfeld = roh.slice(Math.max(0, stelle - 2500), stelle + 500)
    // `[read]` **Der Satz steht noch da — als ZITAT**, im Block, der
    // seine Entfernung begruendet. **Ein Waechter, der ihn pauschal
    // verbietet, verbietet die eigene Begruendung.** `[cmd]`
    // **Gesucht ist er deshalb ohne das Zitatumfeld:** die
    // Begruendung nennt ihn hinter „stand ein `InEntwicklungKnopf`
    // mit diesem Grund:".
    const ohneZitat = umfeld.replace(
      /Hier stand ein `InEntwicklungKnopf`[\s\S]*?Schreibweg\."\*/, '')
    assert.ok(!/body_measurements` gibt es \(17 Spalten/.test(ohneZitat),
      'der falsche Vermerk steht wieder am Umfangsmodal — er '
      + 'behauptet, body_measurements trage die Umfaenge und der '
      + 'Schreibweg fehle. Beides ist falsch (G-577)')
    // `[read]` **Und der Knopf ist kein Entwicklungsknopf mehr.**
    const rumpf = roh.slice(stelle, roh.indexOf('function LogPhotoModal'))
    assert.ok(!/InEntwicklungKnopf/.test(rumpf),
      'das Umfangsmodal traegt wieder einen InEntwicklungKnopf — '
      + 'der Schreibweg ist gebaut')
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — die Felder kommen aus der Signatur, nicht aus der Attrappe
// ════════════════════════════════════════════════════════════════

describe('G-577/A1 — dreizehn Stellen, wie die Tabelle sie fuehrt', () => {
  it('es sind genau die dreizehn Spalten', () => {
    // `[cmd]` **Aus `information_schema.columns`, 2026-10-01.**
    // `[read]` **Die Attrappe fuehrt ZWOELF mit EINEM Unterarm** —
    // wer ihr folgt, verliert eine Spalte.
    assert.equal(UMFANGSSTELLEN.length, 13,
      'die Tabelle hat dreizehn Umfangsspalten')
    assert.deepEqual([...UMFANGSSTELLEN.map(s => s.feld)].sort(), [
      'calf_left_cm', 'calf_right_cm', 'chest_cm',
      'forearm_left_cm', 'forearm_right_cm', 'hip_cm', 'neck_cm',
      'shoulders_cm', 'thigh_left_cm', 'thigh_right_cm',
      'upper_arm_left_cm', 'upper_arm_right_cm', 'waist_cm',
    ])
  })

  it('beide Unterarme stehen drin', () => {
    // `[read]` **Der eine Unterschied zur Attrappe**, und er ist der
    // Grund, warum die Attrappe nicht die Vorlage sein darf.
    const felder = UMFANGSSTELLEN.map(s => s.feld)
    assert.ok(felder.includes('forearm_left_cm'))
    assert.ok(felder.includes('forearm_right_cm'))
  })

  it('die Parameternamen treffen die Signatur', () => {
    // `[cmd]` **18 Parameter, gemessen an
    // `pg_get_function_arguments` (prokind = 'f'), 2026-10-01.**
    const p = alsParameter(GUELTIG)
    assert.equal(Object.keys(p).length, 17,
      '13 Stellen + Datum + Zeit + Quelle + Notiz')
    for (const s of UMFANGSSTELLEN) {
      assert.ok(`p_${s.feld}` in p, `p_${s.feld} fehlt`)
    }
    for (const k of ['p_measurement_date', 'p_measurement_time',
      'p_measurement_source', 'p_notes']) {
      assert.ok(k in p, `${k} fehlt`)
    }
    // `[read]` **`p_source_detail` wird NICHT geschickt** — es hat
    // eine Vorgabe und die Oberflaeche hat nichts dafuer.
    assert.ok(!('p_source_detail' in p))
  })

  it('leere Felder werden null, nicht 0', () => {
    // `[read]` **Eine Null waere ein gemessener Wert** — und `0 cm`
    // faellt am CHECK, also als Fehler statt als „nicht gemessen".
    const p = alsParameter(GUELTIG)
    assert.equal(p.p_waist_cm, 82)
    assert.equal(p.p_neck_cm, null)
    assert.equal(p.p_notes, null, 'eine leere Notiz ist kein Text')
  })

  it('die Quellen kommen aus dem CHECK', () => {
    // `[cmd]` **`body_circumferences_source_ck`:** vier Werte.
    // `[read]` **Nicht die zehn aus `BF_METHODEN`** — anderer CHECK,
    // andere Tabelle.
    assert.deepEqual([...UMFANG_QUELLEN],
      ['manual', 'device', 'import', 'admin'])
  })
})

// ════════════════════════════════════════════════════════════════
// A4 — ohne Datum kein Umfang, und zwei am selben Tag
// ════════════════════════════════════════════════════════════════

describe('G-577/A4 — Ortstag und Uhrzeit sind Pflicht', () => {
  it('ohne Datum faellt die Pruefung', () => {
    const f = pruefeUmfang({ ...GUELTIG, measurement_date: '' })
    assert.ok(f.some(x => x.feld === 'measurement_date'),
      'ein Umfang ohne Datum ist kein Umfang')
  })

  it('ohne Uhrzeit faellt sie auch', () => {
    // `[cmd]` **`measurement_time` ist `NOT NULL` und Teil des
    // Eindeutigkeitsschluessels** — ohne sie kaeme ein Konflikt
    // statt einer Meldung.
    const f = pruefeUmfang({ ...GUELTIG, measurement_time: '' })
    assert.ok(f.some(x => x.feld === 'measurement_time'))
  })

  // `[cmd]` **Die Antwort auf A4, aus der Datenbank gelesen statt
  // entschieden:** `body_circumferences_user_date_time_uq` ist
  // `UNIQUE (user_id, measurement_date, measurement_time)`.
  it('zwei Messungen am selben Tag sind erlaubt — die Zeit trennt sie', () => {
    const morgens = pruefeUmfang({ ...GUELTIG, measurement_time: '08:30' })
    const abends = pruefeUmfang({ ...GUELTIG, measurement_time: '20:15' })
    assert.deepEqual(morgens, [], 'der Morgensatz faellt')
    assert.deepEqual(abends, [], 'der Abendsatz faellt')
    // `[read]` **Der Schreibweg meldet den Konflikt mit einem Satz**,
    // der sagt, was zu tun ist — nicht „Fehler 23505".
    const write = lies(join(SRC, 'lib', 'goals', 'umfang-write.ts'))
    assert.match(write, /'23505'/, 'der Konfliktfall wird nicht behandelt')
    assert.match(write, /mehrere Messungen am selben Tag/,
      'die Meldung sagt nicht, dass mehrere Messungen erlaubt sind')
  })

  it('mindestens eine Stelle braucht einen Wert', () => {
    // `[cmd]` **`body_circumferences_at_least_one_ck`** — ein Satz
    // aus dreizehn Leerfeldern ist kein Satz.
    const f = pruefeUmfang({ ...GUELTIG, werte: {} })
    const leer = f.find(x => x.feld === 'werte')
    assert.ok(leer, 'ein leerer Satz kommt durch')
    // `[read]` **Der Feldname allein genuegt nicht** — ein Fehler
    // ohne Satz ist im Formular ein leerer Kasten. **Eine Sabotage,
    // die nur den Text leerte, kam gruen durch.**
    assert.ok((leer?.text ?? '').length > 10,
      `der Leersatz traegt keinen Text („${leer?.text}")`)
    assert.match(leer!.text, /[Mm]indestens eine/,
      'der Satz nennt die Regel nicht')
  })

  it('die Grenzen sind die des CHECK, je Stelle', () => {
    // `[cmd]` **`body_circumferences_positive_ck`, gelesen 2026-10-01.**
    // `[read]` **Je Stelle ein eigenes Paar** — ein gemeinsamer
    // Bereich waere falsch: Hals 10–80, Taille 40–220.
    assert.deepEqual(pruefeUmfang({ ...GUELTIG, werte: { neck_cm: '41' } }), [])
    assert.ok(pruefeUmfang({ ...GUELTIG, werte: { neck_cm: '85' } })
      .some(x => x.feld === 'neck_cm'), 'Hals 85 cm kommt durch')
    assert.ok(pruefeUmfang({ ...GUELTIG, werte: { waist_cm: '35' } })
      .some(x => x.feld === 'waist_cm'), 'Taille 35 cm kommt durch')
    // `[read]` **Dieselbe Zahl, zwei Urteile** — das belegt, dass je
    // Stelle geprueft wird und nicht pauschal.
    assert.deepEqual(pruefeUmfang({ ...GUELTIG, werte: { waist_cm: '85' } }), [],
      'Taille 85 cm ist gueltig, Hals 85 cm nicht')
  })

  it('Komma und Punkt gelten gleich', () => {
    assert.equal(zahl('82,5'), 82.5)
    assert.equal(zahl('82.5'), 82.5)
    assert.equal(zahl(''), null, 'leer heisst nicht gemessen')
    assert.ok(Number.isNaN(zahl('abc') as number))
  })
})

// ════════════════════════════════════════════════════════════════
// A2 — fachlich ist Datenfehler, nicht Sitzung
// ════════════════════════════════════════════════════════════════

describe('G-577/A2 — die Fehlerbehandlung aus G-555', () => {
  it('der Schreibweg nutzt die querliegende Datei', () => {
    // `[cmd]` **G-555 hat `ladefehler.ts` aus `goals/` geholt.**
    // `[read]` **Benutzen, nicht neu bauen.**
    const write = lies(join(SRC, 'lib', 'goals', 'umfang-write.ts'))
    assert.match(write, /from '\.\.\/fehler\/ladefehler'/,
      'der Schreibweg fuehrt seine eigene Fehlerkunde')
    assert.ok(existsSync(join(SRC, 'lib', 'fehler', 'ladefehler.ts')),
      'lib/fehler/ladefehler.ts fehlt')
  })

  it('42501 ist der einzige Sitzungsfall', () => {
    // `[cmd]` **Die Funktion wirft `42501`**, wenn `auth.uid()` leer
    // ist (`535_auth_uid_legacy_readers.sql:109`).
    const write = lies(join(SRC, 'lib', 'goals', 'umfang-write.ts'))
    assert.match(write, /'42501'/, 'der Sitzungsfall fehlt')
    assert.match(write, /NO_SESSION/, 'er fuehrt nicht zu NO_SESSION')
  })

  it('Konflikt und CHECK sind DATENfehler, nicht Sitzung', () => {
    // `[read]` **Eine Neuanmeldung aendert daran nichts** — der
    // Nutzer wuerde auf die falsche Suche geschickt (G-553).
    const q = readFileSync(join(SRC, 'lib', 'goals', 'umfang-write.ts'), 'utf8')
    const konflikt = q.slice(q.indexOf("'23505'"), q.indexOf("'23514'"))
    assert.ok(!/NO_SESSION/.test(konflikt),
      'der Konfliktfall gilt als Sitzungsfehler')
    const check = q.slice(q.indexOf("'23514'"))
    assert.ok(!/NO_SESSION/.test(check.slice(0, 400)),
      'der CHECK-Fall gilt als Sitzungsfehler')
  })

  it('die Serveraktion wirft nicht, sie gibt zurueck', () => {
    // `[read]` **Dasselbe Muster wie G-122/G-211** — eine geworfene
    // Ausnahme waere im Client eine anonyme Meldung ohne Feldbezug.
    const aktion = lies(join(SRC, 'app', 'v2', 'goals', 'umfang-aktionen.ts'))
    assert.match(aktion, /ok:\s*false/, 'Fehler kommen nicht als Wert zurueck')
    // `[read]` **Nicht nach dem Wort `felder` suchen** — es steht
    // auch noch da, wenn der TYP es verloren hat. **Eine Sabotage,
    // die das Feld aus dem Rueckgabetyp strich, kam gruen durch.**
    // `[cmd]` **Gesucht ist die Form im Typ:** `felder:` mit einem
    // `Array<…>`, und die Zuweisung im Fehlerzweig.
    assert.match(aktion, /felder:\s*Array<\{\s*feld:\s*string/,
      'der Fehlertyp traegt keine Feldliste mehr — dann steht im '
      + 'Formular eine Sammelmeldung statt eines Satzes am Feld')
    assert.match(aktion, /felder:\s*e\.felder/,
      'die Feldfehler werden nicht durchgereicht')
  })
})
