// Der Waechter fuer G-172: Deutsch und Scrollbarkeit.
//
// ── ZWEI DINGE, DIE LEISE ZURUECKKOMMEN ─────────────────────────
//
// `[cmd]` **1. Englische Sichttexte.** Supplements hatte 22 davon fest
// im Quelltext, waehrend Nutrition und Settings die i18n-Schicht seit
// A-14 nutzen. Wer eine Kachel ergaenzt, tippt den Text hin — und
// niemand merkt es, weil die Seite ja aussieht wie vorher.
//
// `[cmd]` **2. Der Scroll-Container.** `.v2-supp-tbl-wrap` hatte nur
// `overflow-x`; die Tabelle wuchs in die Seite, und der Spaltenkopf war
// nach dem ersten Bildschirm weg. Ein `overflow-y` faellt beim
// Aufraeumen schnell wieder heraus.
//
// `[read]` **Am Quelltext geprueft, nicht im Browser:** Beides sind
// Aussagen ueber den Bauplan („kein englischer Text fest verdrahtet",
// „die Regel steht in der CSS"), nicht ueber einen Zustand. Sie gelten
// fuer jede Sprache und jede Breite zugleich.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const V2 = path.join(process.cwd(), 'src/app/v2/supplements')
const CSS = path.join(V2, 'supplements.css')

/**
 * Die englischen Sichttexte, die G-172 entfernt hat.
 *
 * `[read]` Bewusst die WORTLAUTE, nicht ein Muster wie /[A-Z][a-z]+/ —
 * eine Heuristik ueber englische Woerter meldet `Icon name="plus"` und
 * jeden Eigennamen mit. Was hier steht, stand wirklich in der Anzeige.
 */
const RAUS = [
  'Add supplement', 'Add to stack', 'Export stack', 'Search catalog',
  'in stack', 'not in stack',
  '>Evidence<', '>In stack<', '>Action<', '>Mode<', '>Timing<',
]

/**
 * `[cmd]` **`>Dose<` steht NICHT in der Liste**, obwohl G-172 es an
 * drei Stellen ersetzt hat. Die vierte sitzt in `LogInjektionFenster`
 * — einer Attrappe, die nicht auf der Liste der 22 stand und deshalb
 * englisch bleibt.
 *
 * `[read]` **Ein halb uebersetzter Dialog ist schlechter als ein
 * ganzer englischer.** Der Rest des Fensters (`Site`, `Volume`,
 * `Pain`) ist ebenfalls englisch; im Bericht steht es als Befund.
 */


/** Dateien, die G-172 auf `messages/` umgestellt hat. */
const UMGESTELLT = [
  'ansicht.tsx', 'modale.tsx', 'substanz-detail.tsx',
]

test('keine englischen Sichttexte mehr fest im Quelltext', () => {
  for (const datei of UMGESTELLT) {
    const p = path.join(V2, datei)
    const roh = fs.readFileSync(p, 'utf8')
    // Kommentare zaehlen nicht — sie erklaeren, was FRUEHER dastand.
    // `[read]` Ohne das bestaetigt der Test sein eigenes Changelog;
    // derselbe Fehler wie in G-166, dort gegengeprobt.
    const quelle = roh
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '')
    for (const wort of RAUS) {
      assert.ok(!quelle.includes(wort),
        `${datei} enthaelt wieder «${wort}» fest im Quelltext. `
        + 'Sichttexte gehoeren nach `messages/{de,en}.json` (G-172).')
    }
  }
})

test('die Tab-Beschriftungen kommen aus messages, nicht aus Zeichenketten', () => {
  const quelle = fs.readFileSync(path.join(V2, 'ansicht.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  // `[cmd]` Elf Tabs, elf `t(...)`-Aufrufe in `tabs()`.
  const block = quelle.slice(quelle.indexOf('function tabs('),
                             quelle.indexOf('export function SupplementsAnsicht'))
  const treffer = block.match(/label:\s*t\('/g) ?? []
  assert.equal(treffer.length, 11,
    `Erwartet elf uebersetzte Tab-Beschriftungen, gefunden ${treffer.length}. `
    + 'Steht wieder ein `label: \'…\'` da, faellt es hier auf.')
  assert.ok(!/label:\s*'/.test(block),
    'Ein Tab traegt wieder eine feste Zeichenkette statt `t(…)`.')
})

test('die Substanzliste hat einen senkrechten Scroll-Container', () => {
  const css = fs.readFileSync(CSS, 'utf8')
  const i = css.indexOf('.v2-supp-tbl-wrap {')
  assert.ok(i > 0, '`.v2-supp-tbl-wrap` fehlt in supplements.css.')
  const block = css.slice(i, css.indexOf('}', i))
  assert.match(block, /overflow-y:\s*auto/,
    '`.v2-supp-tbl-wrap` hat kein `overflow-y` mehr — die Liste waechst '
    + 'dann wieder in die Seite und der Spaltenkopf verschwindet (G-172).')
  // `[read]` **G-181 hat `60vh` durch `calc(100vh - 300px)` ersetzt**
  // (Punkt 6c: die Liste waechst mit dem Fenster). Die Zusage ist
  // dieselbe geblieben — eine Hoehe, die sich am Fenster bemisst —,
  // deshalb prueft das Muster jetzt auf `vh` in beiden Schreibweisen
  // statt auf die eine, die G-172 kannte.
  assert.match(block, /max-height:[^;]*vh/,
    '`.v2-supp-tbl-wrap` hat keine fensterbezogene `max-height` mehr. '
    + 'Ohne sie greift `overflow-y` nicht (G-172), und die Liste waechst '
    + 'nicht mit dem Fenster (G-181).')
})

test('die Liste wird nicht abgeschnitten — kein slice auf der Trefferliste', () => {
  // ── G-176 (2026-08-23) ──────────────────────────────────────────
  //
  // `[cmd]` `substanz-detail.tsx` hatte `menge.slice(0, 50)`, aus
  // `d019b79` — **also aus G-172 selbst.** Die Fusszeile sagte dann
  // *„50 von 290 Treffern — Suche verfeinern fuer mehr"*, und wer bis
  // ans Ende rollte, kam bis `Choline bitartrate`. **240 Substanzen
  // waren ohne Tippen unerreichbar.**
  //
  // `[read]` **Der Rollbehaelter oben und dieses Limit widersprachen
  // einander.** Der Behaelter wurde gebaut, damit man die Liste
  // durchblaettern kann; das Limit nahm genau das wieder weg. Die
  // Pruefung darueber allein haette es nie bemerkt — **deshalb steht
  // sie hier daneben.**
  //
  // `[cmd]` Gemessen vor der Entfernung: 50 Zeilen = 1.115 DOM-Knoten,
  // 290 Zeilen = 4.713 bei gleicher Ladezeit. Ein Limit kauft hier
  // nichts.
  const quelle = fs.readFileSync(path.join(V2, 'substanz-detail.tsx'), 'utf8')
  const ohneKommentare = quelle
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  const treffer = ohneKommentare.match(/gezeigt:\s*([^,]+),/)
  assert.ok(treffer, '`gezeigt:` nicht gefunden — wurde die Trefferliste umgebaut?')
  assert.equal(/\.slice\s*\(/.test(treffer[1]), false,
    `Die Trefferliste wird wieder beschnitten (\`${treffer[1].trim()}\`). `
    + 'Damit ist der untere Teil des Katalogs ohne Tippen unerreichbar — '
    + 'genau der Zustand, den G-172 beheben sollte (G-176).')

  // Und die Aufforderung, die daran hing, darf nicht zurueckkommen:
  // wer den Namen nicht kennt, kann die Suche nicht verfeinern.
  assert.equal(/Suche verfeinern/.test(ohneKommentare), false,
    'Der Hinweis „Suche verfeinern fuer mehr" ist zurueck. Er setzt '
    + 'voraus, dass man den gesuchten Namen kennt — ein Katalog ist '
    + 'zum Blaettern da (G-176).')
})

test('das Detail zeigt kein Schemaprotokoll und keine Kennung', () => {
  // ── G-177 (2026-08-23) ──────────────────────────────────────────
  //
  // Tom: *„das detail sieht erstens scheisse aus und zweitens alles
  // ausser was ein user wirklich sehen will."*
  //
  // `[cmd]` Im Detail stand aufgeklappt *„Ohne Quelle im neuen
  // Katalog"* mit acht begruendeten Eintraegen — **laenger als alle
  // Inhaltsbloecke zusammen** —, darunter Saetze wie *„Die alte
  // Breittabelle fuehrte `cyp` als jsonb."*
  //
  // `[read]` **DASS eine Angabe fehlt, ist fuer den Nutzer relevant.
  // WARUM sie im Schema fehlt, nicht.** Das erste steht als eine
  // Zeile da („Ohne Angabe: …"), das zweite gehoert in den Bericht.
  // `substanz-luecken.ts` bleibt — die Messung war der halbe Ertrag
  // von C-252, sie gehoert nur nicht vor den Nutzer.
  const quelle = fs.readFileSync(path.join(V2, 'substanz-detail.tsx'), 'utf8')
  const ohneKommentare = quelle
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  assert.equal(/OHNE_QUELLE/.test(ohneKommentare), false,
    'Das Detail zeigt wieder die Schema-Luecken-Liste. Sie begruendet, '
    + 'warum eine SPALTE fehlt — das interessiert den Bericht, nicht '
    + 'den, der wissen will, was die Substanz ist (G-177).')
  assert.equal(/Ohne Quelle im neuen Katalog/.test(ohneKommentare), false,
    'Die Ueberschrift des Schemaberichts ist zurueck (G-177).')

  // Und die technische Kennung gehoert nicht unter den Namen.
  //
  // `[read]` **Geprueft wird die ANZEIGE, nicht jede Verwendung.**
  // Der erste Entwurf dieser Regel schlug auf `open('add', { …
  // substanzId: satz.slug … })` an — das ist der Stack-Anker aus
  // C-252 und muss den Slug tragen. Gesucht ist der Slug als
  // Bildschirmtext im Kopfbereich, also in einem `{…}`-Ausdruck
  // innerhalb eines `<div>` neben `chemical_form`.
  const kopfbereich = ohneKommentare.slice(
    ohneKommentare.indexOf('v2-modal-h'),
    ohneKommentare.indexOf('v2-modal-body'))
  assert.equal(/satz\.slug/.test(kopfbereich), false,
    'Unter dem Namen steht wieder der Slug (`sub_b30d752d32`). Er ist '
    + 'ein Datenbankschluessel — als Stack-Anker bleibt er im Satz, '
    + 'angezeigt wird er nicht (G-177).')
})

test('die Klappen reissen Inhalt an, nicht die Feldzahl', () => {
  // `[cmd]` G-177: *„Sicherheit — 2 Felder"* bei Bromocriptine, und
  // **beide Felder trugen `unknown`.** Die Zahl versprach Inhalt, den
  // es nicht gab. `anriss()` sagt stattdessen „keine Angaben".
  const quelle = fs.readFileSync(path.join(V2, 'substanz-detail.tsx'), 'utf8')
  const ohneKommentare = quelle
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  assert.equal(/'Feld' : 'Felder'/.test(ohneKommentare), false,
    'Es werden wieder Felder gezaehlt statt Inhalt genannt (G-177).')

  // `[cmd]` **G-180 hat die Klappen entfernt** — statt zugeklappter
  // Bloecke mit Anriss gibt es Reiter, und ein Reiter ohne Inhalt
  // erscheint gar nicht. `anriss()` bleibt geprueft, wo es noch
  // benutzt wird; hier zaehlt, dass die Reiterleiste da ist.
  //
  // `[read]` **Die Regel dahinter ist dieselbe:** kein Bereich, der
  // Inhalt verspricht und keinen hat.
  const tafel = fs.readFileSync(path.join(V2, 'substanz-tafel.tsx'), 'utf8')
  assert.match(tafel, /reiterFuer\(/,
    'Die Reiter muessen aus `reiterFuer()` kommen — dort entfaellt der '
    + 'leere Reiter (G-180).')
})

test('die aufgeklappte Zeile hat eine Hoehenbremse', () => {
  // ── G-180 ───────────────────────────────────────────────────────
  //
  // `[cmd]` **Gemessen 2026-08-25:** der Rollbehaelter ist **660 px**
  // hoch (60vh von 1100), die zugeklappte Zeile 54 px. Die
  // aufgeklappten Zeilen messen 396 · 372 · 552 · 288 px — alle
  // darunter.
  //
  // `[read]` **Ohne `max-height` waechst eine Zeile mit vielen Fragen
  // ueber ihren eigenen Behaelter hinaus**, und der Tabellenkopf
  // scrollt aus dem Bild. Die Reiter allein genuegen nicht: ein
  // einzelner Reiter kann lang sein.
  //
  // `[cmd]` **Diese Pruefung fehlte im ersten Anlauf** — die
  // Negativprobe blieb gruen, als die Bremse entfernt wurde
  // (gegengeprobt am 2026-08-25). Deshalb steht sie jetzt hier.
  const quelle = fs.readFileSync(path.join(V2, 'substanz-tafel.tsx'), 'utf8')
  assert.match(quelle, /className="v2-supp-tafel-inhalt"/,
    'Der Tafelinhalt braucht seine Huelle — sie traegt die `max-height` '
    + '(G-180).')

  const css = fs.readFileSync(CSS, 'utf8')
  const i = css.indexOf('.v2-supp-tafel-inhalt {')
  assert.ok(i > 0, '`.v2-supp-tafel-inhalt` fehlt in supplements.css.')
  const block = css.slice(i, css.indexOf('}', i))
  assert.match(block, /max-height:/,
    'Ohne `max-height` waechst die aufgeklappte Zeile ueber den '
    + 'Rollbehaelter hinaus (G-180).')
  assert.match(block, /overflow-y:\s*auto/,
    'Mit `max-height`, aber ohne `overflow-y` waere der Inhalt '
    + 'abgeschnitten statt rollbar.')
})

test('nur EIN Bereich ist offen — die Reiter begrenzen die Hoehe', () => {
  // `[read]` **Die Reiter sind hier keine Zier, sondern die
  // Hoehenbegrenzung.** Wuerde die Tafel alle Bereiche untereinander
  // zeigen, waere sie ueber 900 px hoch — hoeher als ihr Behaelter.
  const quelle = fs.readFileSync(path.join(V2, 'substanz-tafel.tsx'), 'utf8')
  const ohneKommentare = quelle
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  assert.match(ohneKommentare, /<ReiterInhalt\s/,
    'Es muss genau EIN Reiterinhalt gerendert werden.')
  assert.equal((ohneKommentare.match(/<ReiterInhalt\s/g) ?? []).length, 1,
    'Mehr als ein `ReiterInhalt` heisst mehrere Bereiche gleichzeitig '
    + '— dann ist die Hoehenbegrenzung hin (G-180).')
})

test('die Kacheln haben feste Breiten — kein Bandwurm', () => {
  // ── G-181 Punkt 3 ───────────────────────────────────────────────
  //
  // **Tom, 2026-08-25:** *„bau kacheln mit fixen groessen nicht dass
  // sich ploetzlich eine kachel dynamisch auf 1600 pixel
  // vergroessert."*
  //
  // `[read]` **`max-width` ist die eigentliche Zusage.** Ohne sie wird
  // auf einem 1920er Monitor aus einer Textkachel eine Zeile ueber die
  // halbe Wand, und der Text ist unlesbar.
  //
  // `[read]` **Genau diese Sorte Bremse war in G-180 unbewacht** — die
  // Negativprobe blieb gruen, als die Hoehenbremse entfernt wurde.
  // Deshalb steht sie hier von Anfang an.
  const css = fs.readFileSync(CSS, 'utf8')

  const zahl = css.slice(css.indexOf('.v2-supp-zahl-kachel {'))
    .slice(0, css.slice(css.indexOf('.v2-supp-zahl-kachel {')).indexOf('}'))
  assert.ok(zahl.length > 0, '`.v2-supp-zahl-kachel` fehlt.')
  assert.match(zahl, /width:\s*\d+px/,
    'Die Zahlenkachel braucht eine feste Breite (Vorgabe 180-220 px).')
  assert.match(zahl, /flex:\s*0 0 auto/,
    'Ohne `flex: 0 0 auto` dehnt sich die Kachel ueber den freien Platz.')

  const text = css.slice(css.indexOf('.v2-supp-textkachel {'))
    .slice(0, css.slice(css.indexOf('.v2-supp-textkachel {')).indexOf('}'))
  assert.ok(text.length > 0, '`.v2-supp-textkachel` fehlt.')
  assert.match(text, /max-width:\s*\d+px/,
    'Die Textkachel braucht `max-width` — sonst wird sie auf einem '
    + 'breiten Monitor zur Zeile ueber die halbe Wand (G-181).')

  const satz = css.slice(css.indexOf('.v2-supp-erster-satz {'))
    .slice(0, css.slice(css.indexOf('.v2-supp-erster-satz {')).indexOf('}'))
  assert.match(satz, /max-width:\s*\d+px/,
    'Auch der erste Satz braucht eine Zeilenlaenge (G-181).')
})

test('Liste und Hoehenbremse leiten sich vom Fenster ab', () => {
  // ── G-181 Punkt 6c, zusammen mit der Bremse aus G-180 ───────────
  //
  // `[cmd]` Vorher: Behaelter `60vh` (= feste 660 px bei 1100),
  // Tafelbremse **feste 460 px** dagegen gerechnet.
  //
  // `[read]` **Waechst der Behaelter mit dem Fenster und die Bremse
  // nicht, bleibt die Tafel klein, waehrend darunter Platz frei
  // steht** — die Bremse waere dann keine Begrenzung mehr, sondern
  // eine Verkleinerung. Deshalb beide auf `vh`.
  const css = fs.readFileSync(CSS, 'utf8')

  const wrap = css.slice(css.indexOf('.v2-supp-tbl-wrap {'))
    .slice(0, css.slice(css.indexOf('.v2-supp-tbl-wrap {')).indexOf('}'))
  assert.match(wrap, /max-height:\s*calc\([^)]*vh/,
    'Die Liste muss mit der Fensterhoehe wachsen (G-181 Punkt 6c).')

  const tafel = css.slice(css.indexOf('.v2-supp-tafel-inhalt {'))
    .slice(0, css.slice(css.indexOf('.v2-supp-tafel-inhalt {')).indexOf('}'))
  assert.match(tafel, /max-height:\s*calc\([^)]*vh/,
    'Die Hoehenbremse der Tafel muss mitwachsen — sonst bleibt die '
    + 'Tafel klein, waehrend die Liste waechst (G-181).')
  assert.match(tafel, /overflow-y:\s*auto/,
    'Mit `max-height`, aber ohne `overflow-y` waere der Inhalt '
    + 'abgeschnitten statt rollbar.')
})

test('der Spaltenkopf bleibt beim Scrollen stehen', () => {
  const css = fs.readFileSync(CSS, 'utf8')
  const i = css.indexOf('.v2-supp-tbl-wrap thead th')
  assert.ok(i > 0, 'Die Sticky-Regel fuer den Spaltenkopf fehlt.')
  const block = css.slice(i, css.indexOf('}', i))
  assert.match(block, /position:\s*sticky/)
  // `[cmd]` Ohne Hintergrund scrollen die Zeilen durch den Kopf.
  assert.match(block, /background:/,
    'Der klebende Kopf braucht einen Hintergrund — sonst scrollen die '
    + 'Zeilen sichtbar hindurch.')
})

test('der Katalog-Tab zeigt die echte Datenbank, nicht den Entwurf', () => {
  const quelle = fs.readFileSync(path.join(V2, 'ansicht.tsx'), 'utf8')
  assert.match(quelle, /tab === 'catalog' && <SuppDatabase \/>/,
    'Der Katalog-Tab zeigt wieder etwas anderes als `SuppDatabase` (G-172).')
  // `[cmd]` Der Entwurf ist geloescht, nicht versteckt.
  const spec = fs.readFileSync(path.join(V2, 'tab-spec.tsx'), 'utf8')
  assert.ok(!/export function SuppCatalog\(/.test(spec),
    '`SuppCatalog` ist wieder da. Der Entwurf wurde in G-172 geloescht, '
    + 'weil er neben der echten Datenbank stand.')
})
