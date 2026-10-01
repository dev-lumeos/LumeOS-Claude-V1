/**
 * G-555 — derselbe Ladefehler in Medical und Nutrition
 *
 * `[cmd]` **G-553 hat den Fehler in Goals geloest.** `[cmd]` **Zwei
 * weitere Module trugen dieselbe Zeile:**
 *
 *     medical/tab-biomarker.tsx:56      frueher return
 *     nutrition/tab-vorlieben.tsx:447   frueher return
 *     nutrition/tab-planner-echt.tsx:393  — die DRITTE, vom Punkt
 *                                          nicht genannt
 *
 * ══ WAS DER PUNKT VERMUTETE UND WAS GEMESSEN WURDE ════════════════
 *
 * `[cmd]` **Der Punkt sagte: der frueher `return` verschluckt das
 * Mockup** — in Medical namentlich `MedImportReferenz` (Zeile 399).
 *
 * `[cmd]` **Gemessen am Schirm, 2026-10-01, test-user, mit
 * erzwungenem Ladefehler:**
 *
 *     Reiter                 Attrappen  Trenner  Karten
 *     medical/biomarkers     1 -> 1     1 -> 1   3 -> 3
 *     nutrition/prefs        6 -> 6     1 -> 1   17 -> 8
 *
 * `[read]` **Die Attrappenzahl faellt NICHT.** Der Grund steht im
 * Quelltext: `MedBiomarkersReferenz` (`medical/ansicht.tsx:258`) und
 * `NutritionPrefsReferenz` (`nutrition/ansicht.tsx:1031`) stehen als
 * GESCHWISTER neben der Komponente, nicht in ihr — **ein frueher
 * `return` erreicht sie nicht.**
 *
 * `[cmd]` **Und `MedImportReferenz` steht in `MedImport`
 * (Zeile 105), einer ANDEREN Komponente** — der `return` in
 * `MedBiomarkers` (Zeile 53) kann sie gar nicht treffen.
 *
 * `[read]` **Der echte Mangel ist ein anderer, und er ist real:**
 * beide Module zeigten den ROHEN Fehlertext, ohne die Unterscheidung
 * Sitzung/Daten und ohne Weg zur Anmeldung. **Toms Fall
 * (`JWT issued at future`) stand dort als Datenfehler** — genau die
 * falsche Suche, die G-553 in Goals abgestellt hat.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { fehlerart, fehlertexte } from '../../../lib/fehler/ladefehler'

const HIER = dirname(fileURLToPath(import.meta.url))
const V2 = join(HIER, '..')
const SRC = join(V2, '..', '..')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

/** Die drei Stellen, die `ladefehler` auswerten. */
const STELLEN: Array<[string, string, string]> = [
  ['medical', 'tab-biomarker.tsx', 'Biomarkers'],
  ['nutrition', 'tab-vorlieben.tsx', 'Preferences'],
  ['nutrition', 'tab-planner-echt.tsx', 'Planner'],
]

// ════════════════════════════════════════════════════════════════
// A2 — eine Kachel, nicht drei Abschriften
// ════════════════════════════════════════════════════════════════

describe('G-555/A2 — die Fehlerkachel ist geteilt', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(existsSync(join(V2, 'medical', 'tab-biomarker.tsx')),
      'der Pfad nach v2/ stimmt nicht')
    assert.ok(existsSync(join(SRC, 'components', 'shell',
      'ladefehler-kachel.tsx')), 'die geteilte Kachel fehlt')
  })

  it('ladefehler.ts liegt modulfrei, nicht unter goals/', () => {
    // `[cmd]` **Drei Module brauchen sie** — unter `goals/` haette
    // ein medical-Fehler keinen Platz.
    assert.ok(existsSync(join(SRC, 'lib', 'fehler', 'ladefehler.ts')),
      'lib/fehler/ladefehler.ts fehlt')
    assert.ok(!existsSync(join(SRC, 'lib', 'goals', 'ladefehler.ts')),
      'die Datei liegt wieder unter goals/ — dann ist sie an ein '
      + 'Modul gebunden')
  })

  it('kein Importpfad zeigt noch auf den alten Ort', () => {
    // `[read]` **Ein verwaister Pfad faellt erst beim Bauen auf** —
    // und beim Bauen eines ANDEREN Moduls.
    for (const [modul, datei] of STELLEN.map(s => [s[0], s[1]])) {
      const q = lies(join(V2, modul, datei))
      assert.ok(!/goals\/ladefehler/.test(q),
        `${modul}/${datei} importiert aus lib/goals/ladefehler`)
    }
    const goals = lies(join(V2, 'goals', 'ansicht.tsx'))
    assert.ok(!/goals\/ladefehler/.test(goals),
      'goals/ansicht.tsx zeigt noch auf den alten Ort')
  })

  it('jede der drei Stellen nutzt die geteilte Kachel', () => {
    for (const [modul, datei] of STELLEN.map(s => [s[0], s[1]])) {
      const q = lies(join(V2, modul, datei))
      assert.match(q, /<LadefehlerKachel\b/,
        `${modul}/${datei} baut die Fehlerkachel selbst`)
      assert.match(q, /from '\.\.\/\.\.\/\.\.\/components\/shell\/ladefehler-kachel'/,
        `${modul}/${datei} importiert die geteilte Kachel nicht`)
    }
  })

  it('keine Stelle zeigt den rohen Fehlertext ohne Kachel', () => {
    // `[cmd]` **Das war der Mangel:** `<Card title="Biomarkers"
    // sub="konnten nicht geladen werden">` mit `{echt.ladefehler}`
    // darunter — **ohne Fehlerart, ohne Anmeldeweg.**
    //
    // `[read]` **Gesucht wird die FORM**, nicht der Text: ein
    // `ladefehler` im JSX, das nicht in einer `LadefehlerKachel`
    // steckt.
    for (const [modul, datei] of STELLEN.map(s => [s[0], s[1]])) {
      const q = lies(join(V2, modul, datei))
      // `[read]` **`{echt.ladefehler && (` ist KEIN roher Text** —
      // das ist die Bedingung, unter der die Kachel erscheint.
      // **Gesucht ist der Ausdruck als Kind**, also mit `>` davor
      // oder `<` dahinter.
      assert.ok(!/>\s*\{\s*(?:echt|d)\.ladefehler\s*\}/.test(q),
        `${modul}/${datei} rendert den rohen Fehlertext — die Kachel `
        + 'traegt ihn, mit Fehlerart und Anmeldeweg')
      assert.ok(!/konnten nicht geladen werden/.test(q),
        `${modul}/${datei} fuehrt eine eigene Fehlerueberschrift`)
    }
  })

  it('der Waechter trifft die Form, die er sucht', () => {
    // `[read]` **Eine Suche, die nichts findet, beweist nichts** —
    // erst an der GELOESCHTEN Zeile eichen. **Das ist der Rumpf des
    // fruehen `return` aus `tab-biomarker.tsx:59`, wortgleich.**
    const geloescht = `
        <div className="v2-muted" style={{ fontSize: 12 }}>
          {echt.ladefehler}
        </div>`
    assert.ok(/>\s*\{\s*(?:echt|d)\.ladefehler\s*\}/.test(geloescht),
      'der Waechter findet die geloeschte Zeile nicht — dann findet '
      + 'er auch die naechste nicht')

    // `[cmd]` **Und was er NICHT treffen darf:** die Bedingung, unter
    // der die Kachel ueberhaupt erscheint.
    assert.ok(!/>\s*\{\s*(?:echt|d)\.ladefehler\s*\}/.test(
      '{echt.ladefehler && (\n  <LadefehlerKachel text={echt.ladefehler} />'),
      'der Waechter faellt ueber die Bedingung statt ueber den '
      + 'rohen Text')
  })

  it('jede Stelle nennt ihr Modul', () => {
    // `[read]` **Der Datenfall nennt den Reiter** — „Die Daten
    // konnten nicht geladen werden" allein sagt nicht, welche.
    for (const [modul, datei, name] of STELLEN) {
      const q = lies(join(V2, modul, datei))
      assert.match(q, new RegExp(`modul="${name}"`),
        `${modul}/${datei} uebergibt kein Modul an die Kachel`)
    }
  })
})

// ════════════════════════════════════════════════════════════════
// A1 — der Mockup-Teil haengt nicht am Ladefehler
// ════════════════════════════════════════════════════════════════

describe('G-555/A1 — das Mockup haengt nicht am Ladefehler', () => {
  /**
   * `[cmd]` **Die Referenz steht als Geschwister in `ansicht.tsx`,
   * nicht in der Komponente** — gemessen 2026-10-01. **Das ist der
   * Grund, warum die Attrappenzahl nicht faellt.**
   */
  const GESCHWISTER: Array<[string, string, string]> = [
    ['medical', 'MedBiomarkers', 'MedBiomarkersReferenz'],
    ['nutrition', 'VorliebenTab', 'NutritionPrefsReferenz'],
  ]

  for (const [modul, komponente, referenz] of GESCHWISTER) {
    it(`${modul}: ${referenz} steht neben ${komponente}`, () => {
      const q = lies(join(V2, modul, 'ansicht.tsx'))
      assert.match(q, new RegExp(`<${komponente}\\b`),
        `${komponente} wird in ansicht.tsx nicht gerendert`)
      assert.match(q, new RegExp(`<${referenz}\\s*/>`),
        `${referenz} steht nicht in ansicht.tsx — dann haengt das `
        + 'Mockup an der Komponente und faellt mit ihr')
    })
  }

  it('medical: die Datenteile haengen am Schalter, die uebrigen nicht', () => {
    // `[cmd]` **Der frueher `return` ist weg** — an seiner Stelle
    // sperrt `echtAus` nur `MarkerListe` und die Katalogsuche.
    const q = lies(join(V2, 'medical', 'tab-biomarker.tsx'))
    assert.match(q, /const echtAus = echt\.ladefehler !== null/,
      'medical hat keinen Schalter — dann faellt wieder der ganze '
      + 'Reiter aus')
    assert.ok(!/if \(echt\.ladefehler\) \{\s*return/.test(q),
      'der frueher return ist zurueck — er sperrt den ganzen Reiter')
    assert.match(q, /\{!echtAus && \(?\s*<MarkerListe/,
      'MarkerListe haengt nicht am Schalter')
  })

  it('MedImportReferenz liegt in einer anderen Komponente', () => {
    // `[cmd]` **Der Punkt nannte sie als Opfer des fruehen
    // `return`.** `[read]` **Sie steht in `MedImport`, nicht in
    // `MedBiomarkers`** — der `return` konnte sie nie treffen.
    // **Diese Zusicherung haelt den gemessenen Befund fest.**
    const roh = readFileSync(join(V2, 'medical', 'tab-biomarker.tsx'), 'utf8')
    const biomarker = roh.indexOf('export function MedBiomarkers')
    const medimport = roh.indexOf('export function MedImport')
    const referenz = roh.indexOf('<MedImportReferenz')
    assert.ok(biomarker > 0 && medimport > biomarker,
      'die Komponentenfolge hat sich geaendert')
    assert.ok(referenz > medimport,
      'MedImportReferenz steht nicht mehr in MedImport — dann gilt '
      + 'der gemessene Befund nicht mehr')
  })
})

// ════════════════════════════════════════════════════════════════
// A3 — Sitzung und Daten, in beiden Richtungen
// ════════════════════════════════════════════════════════════════

describe('G-555/A3 — die Unterscheidung gilt jetzt in allen Modulen', () => {
  it('Toms Fall ist ein Sitzungsfehler', () => {
    assert.equal(
      fehlerart('body_composition_navy: JWT issued at future'), 'sitzung')
  })

  it('ein echter Datenfehler bleibt Datenfehler', () => {
    // `[read]` **Im Zweifel Datenfehler** — eine Anmeldung aendert
    // dort nichts.
    assert.equal(fehlerart('relation "foo" does not exist'), 'daten')
    assert.equal(fehlerart('medical import: user mismatch'), 'daten')
  })

  it('der Titel traegt das Modul, der Sitzungsfall nicht', () => {
    // `[cmd]` **Hier stand `titel: 'Goals'` fest.** `[read]` **Der
    // Sitzungsfall nennt bewusst KEIN Modul** — eine abgelaufene
    // Sitzung betrifft die Anmeldung, nicht die Biomarker.
    assert.equal(fehlertexte('daten', 'Biomarkers').titel, 'Biomarkers')
    assert.equal(fehlertexte('daten', 'Preferences').titel, 'Preferences')
    assert.equal(fehlertexte('daten').titel, 'Daten',
      'ohne Modul darf kein geratenes stehen')
    assert.equal(fehlertexte('sitzung', 'Biomarkers').titel,
      'Sitzung abgelaufen',
      'der Sitzungsfall nennt das Modul — das schickt auf die '
      + 'falsche Suche')
  })

  it('die Kachel traegt Marke, Anmeldeweg und technischen Text', () => {
    const q = lies(join(SRC, 'components', 'shell', 'ladefehler-kachel.tsx'))
    assert.match(q, /data-ladefehler=\{art\}/, 'die Marke fehlt')
    assert.match(q, /data-ladefehler-text/, 'der technische Text ist nicht markiert')
    assert.match(q, /href="\/login"/, 'der Weg zur Anmeldung fehlt')
    assert.match(q, /\{text\}/,
      'der technische Text wird nicht gezeigt — er hat den Befund '
      + 'moeglich gemacht')
    // `[cmd]` **G-553: der Knopf war einmal ohne Beschriftung
    // gruen durchgegangen.** `[read]` **Ein leerer Kasten ist kein
    // Weg.**
    assert.match(q, /Zur Anmeldung/, 'der Anmeldeknopf hat keinen Text')
  })
})
