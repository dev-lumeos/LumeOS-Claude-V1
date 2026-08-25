// C-227: Waechter ueber Kategorienfilter und Farben — in BEIDE
// Richtungen.
//
// Richtung 1: der Filter zaehlt und filtert richtig (Fixtures, weil
// die Live-Spalte bis C-226 leer ist). Richtung 2: keine Farbe ist
// hartkodiert (nur `--kat-*`-Variablen, und jede davon steht in
// supplements.css), und keine Kategorie kommt ohne Textkennzeichnung
// aus.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  KATEGORIE_FARBEN, KAT_WEITERE_VAR, UNZUGEORDNET_ID, UNZUGEORDNET_TEXT,
  filtereGruppe, filtereKategorien, gruppeGesperrt, gruppeVon,
  kategorieFarbe, kategorieLabel, kategorieVon, nachGruppenwechsel, trifftSuche,
  zaehleGruppen, zaehleKategorien,
} from '../substanz-kategorien'
import { startOffen } from '../substanz-anzeige'

const CSS = path.join(process.cwd(), 'src/app/v2/supplements/supplements.css')
const DETAIL = path.join(process.cwd(), 'src/app/v2/supplements/substanz-detail.tsx')
const MODALE = path.join(process.cwd(), 'src/app/v2/supplements/modale.tsx')

// ── Richtung 1: der Filter ───────────────────────────────────────

/** Fixture in den Groessenverhaeltnissen der C-197-Zaehlung. */
const FIXTURE = [
  ...Array.from({ length: 3 }, () => ({ canonical_category: 'peptide' })),
  ...Array.from({ length: 2 }, () => ({ canonical_category: 'aas' })),
  { canonical_category: 'sarm' },           // kleine Kategorie -> Sammelfarbe
  { canonical_category: null },             // LumeOS-Eintrag ohne Kimi-Satz
  { canonical_category: '' },               // leer zaehlt wie null
]

test('die Zaehler sind gezaehlt: gross zuerst, unzugeordnet am Ende', () => {
  assert.deepEqual(zaehleKategorien(FIXTURE), [
    ['peptide', 3], ['aas', 2], ['sarm', 1], [UNZUGEORDNET_ID, 2],
  ])
})

test('Mehrfachauswahl vereinigt: Peptide UND SARMs zugleich', () => {
  assert.equal(filtereKategorien(FIXTURE, new Set(['peptide', 'sarm'])).length, 4)
  assert.equal(filtereKategorien(FIXTURE, new Set(['aas'])).length, 2)
  // Leere Auswahl heisst alle — nicht keiner.
  assert.equal(filtereKategorien(FIXTURE, new Set()).length, FIXTURE.length)
})

test('null ist unzugeordnet — ein eigener Zustand, keine Restklasse', () => {
  assert.equal(kategorieVon({ canonical_category: null }), UNZUGEORDNET_ID)
  assert.equal(filtereKategorien(FIXTURE, new Set([UNZUGEORDNET_ID])).length, 2)
  assert.match(UNZUGEORDNET_TEXT, /F-05/, 'Der Text sagt, WAS unzugeordnet heisst.')
  assert.match(UNZUGEORDNET_TEXT, /nicht .sonstige./)
})

// ── Richtung 2: Farben und Textpflicht ───────────────────────────

test('jede Farbe ist eine CSS-Variable, keine ist hartkodiert', () => {
  for (const [kat, cssVar] of Object.entries(KATEGORIE_FARBEN)) {
    assert.match(cssVar, /^--kat-[a-z]+$/, `${kat}: ${cssVar}`)
    assert.equal(kategorieFarbe(kat), `var(${cssVar})`)
  }
  // Unbekannte Kategorie: Sammelfarbe, aber ihr EIGENES Label.
  assert.equal(kategorieFarbe('dopamine_agonist'), `var(${KAT_WEITERE_VAR})`)
  assert.equal(kategorieLabel('dopamine_agonist'), 'dopamine agonist')
})

test('jede benutzte Variable steht in supplements.css — hell UND dunkel', () => {
  const css = fs.readFileSync(CSS, 'utf8')
  const variablen = Object.values(KATEGORIE_FARBEN).concat(KAT_WEITERE_VAR)
  for (const v of variablen) {
    const definitionen = css.split('\n').filter(z => z.trim().startsWith(`${v}:`)).length
    assert.equal(definitionen, 2,
      `${v}: ${definitionen} Definition(en) — erwartet 2 (Basis + data-theme="light").`)
  }
  // Und umgekehrt: keine --kat-Variable im CSS, die der Code nicht kennt.
  const imCss = Array.from(new Set(css.match(/--kat-[a-z]+(?=:)/g) ?? []))
  for (const v of imCss) {
    assert.ok(variablen.includes(v), `${v} steht im CSS, aber der Code kennt sie nicht.`)
  }
})

test('die Komponente traegt keine hartkodierte Kategoriefarbe und immer Text', () => {
  const quelle = fs.readFileSync(DETAIL, 'utf8')
  // Kein Hex, kein oklch/rgb-Literal in der Komponente — Farben kommen
  // aus kategorieFarbe() und den Modul-Variablen.
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(quelle),
    'Hex-Farbe in substanz-detail.tsx — Kategorien nur ueber var(--kat-…).')
  assert.ok(!/oklch\(|rgb\(/.test(quelle),
    'Farb-Literal in substanz-detail.tsx — gehoert nach supplements.css.')
  // Die Kennzeichnung rendert das Label — Farbe ist nie allein.
  assert.ok(/kategorieLabel\(/.test(quelle), 'Die Textkennzeichnung fehlt.')
  assert.ok(/KategoriePill/.test(quelle))
})

// ── C-229: Gruppen, Klapp-Start, description, Add mit Stackwahl ──

test('C-229: die drei Gruppen zaehlen und filtern, das Gate sperrt', () => {
  // [cmd] C-228-Erwartung: supplement 307 · peptide 82 · enhanced 177.
  // Fixture in denselben Verhaeltnissen, klein.
  const liste = [
    ...Array.from({ length: 3 }, () => ({ gruppe: 'supplement' })),
    { gruppe: 'peptide' },
    ...Array.from({ length: 2 }, () => ({ gruppe: 'enhanced' })),
    { gruppe: null },   // noch ohne C-228-Lauf
  ]
  assert.deepEqual(zaehleGruppen(liste), { supplement: 3, peptide: 1, enhanced: 2 })
  assert.equal(gruppeVon({ gruppe: 'erfunden' }), null, 'Keine Gruppe wird erfunden.')
  // Gate zu (unter pro/elite): peptide/enhanced gesperrt, und der
  // Gesamtblick zeigt nur supplement + ungruppiert.
  assert.ok(gruppeGesperrt('peptide', false) && gruppeGesperrt('enhanced', false))
  assert.ok(!gruppeGesperrt('supplement', false))
  assert.equal(filtereGruppe(liste, null, false).length, 4)
  // Gate offen: alles; eine gewaehlte Gruppe: nur sie.
  assert.equal(filtereGruppe(liste, null, true).length, 7)
  assert.equal(filtereGruppe(liste, 'enhanced', true).length, 2)
})

test('G-186: die Suche findet auch ueber die Zwecke', () => {
  // ══ WARUM KEIN FILTER ═══════════════════════════════════════════
  //
  // `[cmd]` **Gemessen 2026-08-25: 895 Zweck-Eintraege, davon 842
  // VERSCHIEDEN.** Der haeufigste trifft 9 von 318. **Eine
  // Filterleiste haette 842 Knoepfe** — es sind Saetze, keine
  // Schlagworte.
  //
  // `[cmd]` **Der Gewinn ist gemessen:** „Schlaf" 11 → 22 Treffer,
  // „Muskelaufbau" 4 → 30, „Regeneration" 0 → 8.
  const e = {
    name: 'Magnesium glycinate',
    description: 'Chelatierte Magnesiumform.',
    zwecke: ['Einschlafen und Schlafqualität', 'Muskelkrämpfe'],
  }
  assert.equal(trifftSuche(e, 'Schlaf'), true,
    'Wer „Schlaf" sucht, muss Magnesium finden — ohne zu wissen, dass '
    + 'es ein Mineralstoff ist (G-186).')
  assert.equal(trifftSuche(e, 'magnesium'), true, 'Der Name trifft weiter.')
  assert.equal(trifftSuche(e, 'chelatiert'), true, 'Die Beschreibung auch.')
  assert.equal(trifftSuche(e, 'Kreatin'), false, 'Was nicht passt, passt nicht.')
  assert.equal(trifftSuche(e, ''), true, 'Leere Suche trifft alles.')
})

test('G-186: die Liste ist mit `trifftSuche` verdrahtet', () => {
  // `[read]` **Die Verdrahtung, nicht nur die Funktion.** Ein
  // `trifftSuche`, das niemand aufruft, besteht jeden Funktionstest.
  const quelle = fs.readFileSync(DETAIL, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  assert.match(quelle, /trifftSuche\(s, f\)/,
    'Die Liste filtert nicht ueber `trifftSuche` — die Zwecke werden '
    + 'dann nicht durchsucht (G-186 Punkt 3).')

  // Und der LISTEN-Lesepfad liefert die Zwecke ueberhaupt.
  //
  // `[cmd]` **Der erste Anlauf dieser Pruefung war blind:** sie suchte
  // `wofuer_de, wofuer_en` in der ganzen Datei — und fand es in der
  // DETAIL-Abfrage, auch nachdem die LISTEN-Abfrage zerstoert war.
  // Die Negativprobe blieb gruen (gegengeprobt 2026-08-25).
  //
  // `[read]` **Geprueft wird jetzt die Abfrage von
  // `ladeSubstanzListe`**, nicht die Datei.
  const read = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/supplements/substanz-read.ts'), 'utf8')
  const anfang = read.indexOf('export async function ladeSubstanzListe')
  assert.ok(anfang > 0, '`ladeSubstanzListe` nicht gefunden.')
  const ende = read.indexOf('export async function', anfang + 40)
  const listenpfad = read.slice(anfang, ende > 0 ? ende : undefined)

  // `[cmd]` **Zweiter blinder Fleck derselben Pruefung:** auch im
  // Listenpfad steht `wofuer_de` zweimal — in der ABFRAGE und in der
  // Abbildung darunter. Wer nur den Pfad durchsucht, sieht die
  // zerstoerte Abfrage nicht, weil die Abbildung den Namen weiter
  // traegt. **Geprueft wird die `.select(...)`-Zeichenkette selbst.**
  //
  // `[cmd]` **Dritter Anlauf, und der Grund war jedes Mal derselbe:**
  // der Name stand auch im KOMMENTAR ueber der Abfrage. Ohne
  // Kommentarentfernung prueft der Waechter seine eigene Begruendung.
  const select = listenpfad
    .slice(listenpfad.indexOf('.select('), listenpfad.indexOf('.eq('))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  assert.match(select, /wofuer_de/,
    'Die ABFRAGE der Liste laedt `wofuer_de` nicht — dann ist `zwecke` '
    + 'immer leer und die Suche findet keinen Zweck (G-186 Punkt 3).')
  assert.match(listenpfad, /zwecke:/,
    'Die Liste bildet `zwecke` nicht ab.')
})

test('G-182: der Gruppenwechsel setzt die Kategorie zurueck', () => {
  // ══ DER FEHLER, DEN DAS BEWACHT ═════════════════════════════════
  //
  // **Tom, 2026-08-25:** *„waehle ich zb enhanced/fatburner und danach
  // supplements kommt nichts mehr weil er die subkategorie nicht auf
  // alle zuruecksetzt und immer noch auf fatburner steht."*
  //
  // `[cmd]` **`fatburner` gibt es NUR unter `enhanced`** — 10
  // Substanzen, gemessen 2026-08-25. Unter `supplement` (182
  // Eintraege) trifft die Kategorie keine einzige Zeile.
  //
  // `[read]` **`Alle` aus G-181 loest das nicht** — es loest das
  // Abwaehlen, nicht den Gruppenwechsel. Der Fehler ist die
  // Zustandsfuehrung.
  const mitFatburner: ReadonlySet<string> = new Set(['fatburner'])

  const gewechselt = nachGruppenwechsel('enhanced', 'supplement', mitFatburner)
  assert.equal(gewechselt.gruppe, 'supplement')
  assert.equal(gewechselt.kategorien.size, 0,
    'Nach dem Gruppenwechsel darf keine Kategorie mehr stehen — sonst '
    + 'ist die Liste leer und niemand sieht warum (G-182).')

  // Auch der Weg zurueck auf „Alle" setzt zurueck.
  const aufAlle = nachGruppenwechsel('enhanced', null, mitFatburner)
  assert.equal(aufAlle.gruppe, null)
  assert.equal(aufAlle.kategorien.size, 0)
})

test('G-182: dieselbe Gruppe nochmal aendert nichts', () => {
  // `[read]` **Sonst raeumte jeder Klick auf den aktiven Knopf die
  // Kategorie weg** — auch wenn gar nichts gewechselt hat.
  const kat: ReadonlySet<string> = new Set(['vitamine', 'mineralstoffe'])
  const gleich = nachGruppenwechsel('supplement', 'supplement', kat)
  assert.equal(gleich.kategorien.size, 2,
    'Ohne Wechsel bleibt der Kategoriestand, wie er war.')
  assert.equal(gleich.kategorien, kat, 'Und zwar unveraendert, nicht kopiert.')
})

test('G-182: das Detail benutzt nachGruppenwechsel, nicht setGruppe roh', () => {
  // `[read]` **Die Regel darf nicht am Aufrufer vorbei umgangen
  // werden.** Ein `setGruppe(...)` direkt im Knopf waere genau der
  // Zustand von vorher.
  const quelle = fs.readFileSync(DETAIL, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  assert.match(quelle, /nachGruppenwechsel\(/,
    'Der Gruppenwechsel muss ueber `nachGruppenwechsel()` laufen.')
  assert.equal(/onClick=\{\(\) => setGruppe\(/.test(quelle), false,
    'Ein Knopf ruft `setGruppe` direkt auf — damit bleibt die Kategorie '
    + 'stehen und die Liste ist leer (G-182).')
})

test('C-229/G-180: das Detail ist zu, bis jemand es aufklappt', () => {
  // ── G-180 hat die Mechanik ersetzt, nicht die Regel ─────────────
  //
  // `[read]` **Toms Regel steht: „das sind zusatzinfos die keiner
  // sehen muss wenn er es nicht explizit will."** Bis G-179 hielt
  // `startOffen()` die `Klappe`-Bloecke im Modal zu.
  //
  // `[cmd]` **G-180 hat Modal und Bloecke entfernt** (315 Zeilen) —
  // die Tafel klappt jetzt unter der Zeile auf. **Die Regel gilt
  // unveraendert und wird hier an der neuen Mechanik geprueft:**
  // keine Zeile ist offen, solange niemand geklickt hat.
  //
  // `[read]` **Deshalb prueft dieser Test nicht mehr `<Klappe`** —
  // das waere eine Pruefung auf ein Werkzeug statt auf die Zusage.
  const quelle = fs.readFileSync(DETAIL, 'utf8')
  assert.match(quelle, /useState<string \| null>\(null\)/,
    'Die offene Zeile muss mit `null` starten — nichts ist vorab offen.')
  assert.equal(/offeneZeile,\s*set\w+\]\s*=\s*React\.useState<string \| null>\(['"]/
    .test(quelle), false,
    'Es darf keine Zeile fest vorab geoeffnet sein.')
  assert.match(quelle, /aria-expanded=\{istOffen\}/,
    'Die Zeile muss ihren Zustand melden — sonst weiss kein Screenreader, '
    + 'dass sie aufklappbar ist.')
})

test('G-180: immer nur EINE Zeile offen', () => {
  // `[cmd]` **Das ist die Hoehenbremse**, nicht Geschmack: der
  // Rollbehaelter ist 660 px hoch (60vh von 1100, gemessen
  // 2026-08-25). Zwei offene Zeilen sprengten ihn.
  //
  // `[read]` **Ein `Set` waere hier der Fehler** — es erlaubt mehrere.
  // Der Zustand ist bewusst ein einzelner Wert.
  const quelle = fs.readFileSync(DETAIL, 'utf8')
  assert.equal(/offeneZeile[^=]*=\s*React\.useState<Set/.test(quelle), false,
    'Die offene Zeile darf kein Set sein — dann waeren mehrere offen und '
    + 'die Zeile waechst ueber ihren Behaelter (G-180).')
})

test('C-229: der Add-Dialog sendet stack_id und zeigt die Stackwahl', () => {
  const quelle = fs.readFileSync(MODALE, 'utf8')
  const senden = quelle.indexOf("intake?was=position")
  const rumpfEnde = quelle.indexOf('})', senden)
  const rumpf = quelle.slice(senden, rumpfEnde + 400)
  assert.ok(/stack_id:/.test(rumpf),
    'Add sendet keine stack_id — der Dialog schriebe wieder stumm in den aktiven Stack.')
  assert.ok(/aria-label="Stack"/.test(quelle), 'Die Stackwahl fehlt im Dialog.')
})

test('die Erwartung der grossen Kategorien traegt eigene Farben', () => {
  // [cmd] Die acht grossen aus der C-197-Zaehlung (peptide 60, aas 31,
  // botanical 26, sports_ingredient 24, mineral 23, vitamin 19,
  // performance 19, protein_amino_acid 16) plus unzugeordnet.
  for (const k of ['peptide', 'aas', 'botanical', 'sports_ingredient',
    'mineral', 'vitamin', 'performance', 'protein_amino_acid', UNZUGEORDNET_ID]) {
    assert.ok(KATEGORIE_FARBEN[k], `${k} hat keine eigene Farbvariable.`)
  }
})
