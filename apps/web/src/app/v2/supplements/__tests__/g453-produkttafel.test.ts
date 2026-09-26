// G-453 — die Produkttafel.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **Toms drei Punkte**, je mit einer Probe, die rot wird, wenn sie
// kippt:
//
//     1  der Markenfilter ist ein Eingabefeld, kein `select`
//     2  die Tafel ist strukturiert, die Kontraste sind gesetzt
//     3  nach Kategorie gebuendelt -- und Mischungen bleiben ganz
//
// `[read]` **Die Buendelung wird AUFGERUFEN, nicht gesucht.** `[cmd]`
// **Ein Waechter, der `blend` im Text findet, bleibt gruen, wenn die
// Zuordnung verdreht ist** — dieselbe Lehre wie in G-428 und G-452.
//
// `[read]` **Die Probedaten sind die GEMESSENEN:** die Zeilen 12-15
// von `21cfe048` (MRI N.O. Black Powder) und die Kategorienverteilung
// von `6ef78e94` (#Shatter SX-7), beide am 2026-09-14 gegen die
// laufende Instanz gelesen.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  etikettBuendel, buendelFuer, KATEGORIEN, KATEGORIEN_OHNE_AUSSAGE,
  BUENDEL, FORMEN, formLabel, MARKEN_PULLDOWN, FENSTER,
} from '../../../../lib/supplements/produkt-etikett'
import type { InhaltsZeile } from '../../../../lib/supplements/produkte-read'

const V2 = path.join(process.cwd(), 'src/app/v2/supplements')
const lies = (f: string) => fs.readFileSync(path.join(V2, f), 'utf8')

function zeile(z: Partial<InhaltsZeile> & { id: string }): InhaltsZeile {
  return {
    ingredient_name: z.id,
    ingredient_category: null,
    amount_per_serving: null,
    unit: null,
    amount_qualifier: 'not_stated',
    blend_id: null,
    reihenfolge: null,
    // G-472: `null` heisst „gilt fuer jede Portion" — der Fall,
    // den die meisten Produkte haben (eine Portionsgroesse).
    source_serving_size: null,
    ist_wirkstoff: true,
    bekannt: false,
    // G-464: die Einstufung aus C-505. `null` = wie vor G-464.
    content_class: null,
    ...z,
  }
}

// ══ 3 — die Buendelung ═════════════════════════════════════════════

test('G-453: die Kategorien landen in den vier Buendeln des Etiketts', () => {
  // `[cmd]` **Alle 19 gemessenen Kategorien, keine ausgelassen.**
  assert.equal(buendelFuer('fat'), 'naehrwerte')
  assert.equal(buendelFuer('sugar'), 'naehrwerte')
  assert.equal(buendelFuer('protein'), 'naehrwerte')
  assert.equal(buendelFuer('vitamin'), 'wirkstoffe')
  assert.equal(buendelFuer('amino acid'), 'wirkstoffe')
  assert.equal(buendelFuer('botanical'), 'wirkstoffe')
  assert.equal(buendelFuer('blend'), 'mischungen')
  assert.equal(buendelFuer('other ingredient'), 'hilfsstoffe')
  assert.equal(buendelFuer('TBD'), 'hilfsstoffe')

  // `[read]` **Eine unbekannte Kategorie landet sichtbar bei den
  // Hilfsstoffen** — nicht stumm zwischen den Wirkstoffen. `[cmd]`
  // **Kommt eine zwanzigste dazu, faellt sie hier auf.**
  assert.equal(buendelFuer('kategorie-die-es-2026-nicht-gab'), 'hilfsstoffe')
  assert.equal(buendelFuer(null), 'hilfsstoffe')

  // Jede gemessene Kategorie trifft ein Buendel, das es gibt.
  const ids = new Set(BUENDEL.map(b => b.id))
  for (const k of KATEGORIEN) {
    assert.ok(ids.has(buendelFuer(k.code)),
      `${k.code} landet in keinem bekannten Buendel.`)
  }
})

test('G-453: eine Mischung wird NICHT nach Kategorie auseinandergerissen', () => {
  // `[cmd]` **Die gemessene Mischung aus `21cfe048`:** der Kopf traegt
  // 3000 mg und `blend`, die Zutaten tragen EIGENE Kategorien.
  const roh: InhaltsZeile[] = [
    zeile({
      id: 'protein', ingredient_name: 'Protein', ingredient_category: 'protein',
      amount_per_serving: 20, unit: 'g', amount_qualifier: 'exact', reihenfolge: 12,
    }),
    zeile({
      id: 'blend-kopf', ingredient_name: 'Proprietary Blend for Size & Recovery',
      ingredient_category: 'blend', amount_per_serving: 3000, unit: 'mg',
      amount_qualifier: 'exact', reihenfolge: 13,
    }),
    // `[cmd]` **Diese beiden tragen `amino acid`** — nach Kategorie
    // sortiert stuenden sie unter *Wirkstoffe*, getrennt von ihrem
    // Kopf und von der Menge, die fuer sie gilt.
    zeile({
      id: 'akg', ingredient_name: 'L-Arginine Alpha-Ketoglutarate',
      ingredient_category: 'amino acid', blend_id: 'blend-kopf', reihenfolge: 14,
    }),
    zeile({
      id: 'hcl', ingredient_name: 'L-Arginine Hydrochloride',
      ingredient_category: 'amino acid', blend_id: 'blend-kopf', reihenfolge: 15,
    }),
  ]
  const b = etikettBuendel(roh)
  const mischungen = b.find(x => x.id === 'mischungen')
  assert.ok(mischungen, 'Es gibt kein Buendel „Mischungen".')

  // **Kopf UND beide Zutaten stehen zusammen.**
  assert.deepEqual(mischungen.zeilen.map(z => z.id),
    ['blend-kopf', 'akg', 'hcl'])

  // `[read]` **Und NICHT bei den Wirkstoffen** — das ist die Aussage.
  const wirkstoffe = b.find(x => x.id === 'wirkstoffe')
  assert.ok(!wirkstoffe || !wirkstoffe.zeilen.some(z => z.blend_id),
    'Eine Mischungszutat ist unter die Wirkstoffe gerutscht.')

  // Die Einrueckung aus G-452 ueberlebt die Buendelung.
  assert.equal(mischungen.zeilen.find(z => z.id === 'akg')!.eingerueckt, true)
  assert.equal(mischungen.zeilen.find(z => z.id === 'blend-kopf')!.eingerueckt, false)
  assert.equal(mischungen.zeilen.find(z => z.id === 'blend-kopf')!.istMischung, true)

  // Das Protein bleibt, wo es hingehoert.
  assert.deepEqual(b.find(x => x.id === 'naehrwerte')!.zeilen.map(z => z.id),
    ['protein'])
})

test('G-453: keine Zeile geht bei der Buendelung verloren', () => {
  // `[read]` **Die eigentliche Zusage einer Umsortierung** — `[cmd]`
  // eine Zuordnung, die eine Kategorie vergisst, verliert Zeilen
  // stumm, und auf dem Schirm faellt das bei 54 Zeilen niemandem auf.
  const roh = KATEGORIEN.map((k, i) =>
    zeile({ id: `z${i}`, ingredient_category: k.code, reihenfolge: i + 1 }))
  const b = etikettBuendel(roh)
  const summe = b.reduce((n, x) => n + x.zeilen.length, 0)
  assert.equal(summe, roh.length,
    `${roh.length} Zeilen hinein, ${summe} heraus.`)
})

test('G-453: ein leeres Buendel erscheint nicht', () => {
  const b = etikettBuendel([
    zeile({ id: 'a', ingredient_category: 'vitamin', reihenfolge: 1 }),
  ])
  assert.deepEqual(b.map(x => x.id), ['wirkstoffe'])
})

// ══ 3b — welche Kategorie wird ueberhaupt angeboten ═════════════════

test('A4: die fuenf aussagelosen Kategorien sind KEIN Filter mehr', () => {
  // **Tom, 2026-09-15:** *„WEG: diese Kategorien ganz raus, sie sagen
  // nichts aus — other ingredient, botanical,
  // non-nutrient/non-botanical, other, animal part or source."*
  assert.equal(KATEGORIEN.length, 14,
    `Erwartet 14 Kategorien, gefunden ${KATEGORIEN.length}.`)

  const angeboten = new Set(KATEGORIEN.map(k => k.code))
  for (const weg of KATEGORIEN_OHNE_AUSSAGE) {
    assert.ok(!angeboten.has(weg),
      `„${weg}" wird wieder als Filter angeboten — Tom hat sie gestrichen.`)
  }
  // `[read]` **Und die Liste der Gestrichenen ist die gemessene** —
  // `[cmd]` wer eine sechste dazunimmt oder eine wegnimmt, faellt hier
  // auf, statt es stumm zu tun.
  assert.deepEqual([...KATEGORIEN_OHNE_AUSSAGE].sort(), [
    'animal part or source', 'botanical',
    'non-nutrient/non-botanical', 'other', 'other ingredient',
  ])

  // `[cmd]` **Keine verbliebene liegt ueber einem Drittel** — damit
  // ist der Zusatz „fast alle" gegenstandslos, und er ist entfernt.
  for (const k of KATEGORIEN) {
    assert.ok(k.anteil < 0.34,
      `„${k.code}" trifft ${Math.round(k.anteil * 100)} % — das ist kein Filter.`)
  }
  assert.equal(KATEGORIEN[0].code, 'mineral')
  assert.equal(KATEGORIEN[0].produkte, 39960)
})

test('A4: die gestrichenen Kategorien bleiben in der TAFEL sichtbar', () => {
  // `[read]` **Kein Filter heisst nicht kein Inhalt.** `[cmd]` **`other
  // ingredient` ist mit 980.854 Zeilen das groesste Buendel** — wer
  // ein Produkt aufmacht, will das ganze Etikett (Toms Antwort vom
  // 2026-09-14).
  for (const weg of KATEGORIEN_OHNE_AUSSAGE) {
    const ziel = buendelFuer(weg)
    assert.ok(BUENDEL.some(b => b.id === ziel),
      `„${weg}" landet in keinem Buendel und waere damit unsichtbar.`)
  }
  assert.equal(buendelFuer('other ingredient'), 'hilfsstoffe')
  assert.equal(buendelFuer('botanical'), 'wirkstoffe')
})

// ══ 4 — die Darreichungsform ════════════════════════════════════════

test('A4: die Form zeigt keinen E-Code, filtert aber mit ihm', () => {
  // **Tom, 2026-09-15:** *„FORM, ohne die Klammern ... der E-Code
  // (E0159 etc.) gehoert NICHT in die Anzeige."*
  assert.equal(FORMEN.length, 10, 'Es sind nicht mehr zehn Formen.')
  for (const f of FORMEN) {
    // `[cmd]` **Der Code steht in `code`** — die Spalte traegt ihn,
    // und ein Vergleich gegen `Capsule` traefe nichts.
    assert.match(f.code, /\[E\d+\]$/,
      `„${f.code}" traegt keinen E-Code mehr — der Filter griffe ins Leere.`)
    // **Und NICHT in `label`.**
    assert.doesNotMatch(f.label, /\[E\d+\]/,
      `„${f.label}" zeigt den E-Code — Tom will ihn nicht sehen.`)
  }
  assert.equal(formLabel('Capsule [E0159]'), 'Capsule')
  assert.equal(formLabel('Tablet or Pill [E0155]'), 'Tablet or Pill')
  // `[read]` **Die RUNDE Klammer gehoert zur Bezeichnung und bleibt.**
  // `[cmd]` Ein `replace(/\(.*\)/)` haette daraus `Other` gemacht —
  // und `Other` gab es als Kategorie schon.
  assert.equal(formLabel('Other (e.g. tea bag) [E0172]'), 'Other (e.g. tea bag)')
  assert.equal(formLabel(null), '')
})

test('A4: jede Form traegt beide Zahlen, On Market und alle', () => {
  // `[cmd]` **Der Auftrag nennt `Capsule 79.822`** — das ist die Zahl
  // ueber ALLE Marktstatus. **On Market sind es 43.301.**
  // `[read]` **Der Reiter oeffnet auf „On Market"**, also waere die
  // groessere Zahl dort eine Aussage ueber eine Ansicht, die niemand
  // sieht — dieselbe Falle wie 6.012 gegen 4.907 Marken in G-452.
  const kapsel = FORMEN.find(f => f.label === 'Capsule')!
  assert.equal(kapsel.alle, 79822)
  assert.equal(kapsel.onMarket, 43301)
  for (const f of FORMEN) {
    assert.ok(f.onMarket <= f.alle,
      `„${f.label}": On Market (${f.onMarket}) ueber der Gesamtzahl (${f.alle}).`)
  }
})

test('A4: das Marken-Pulldown ist ein Ausschnitt und sagt es', () => {
  // **Tom:** *„MARKE: im Pulldown anwaehlbar, plus das Eingabefeld."*
  // `[cmd]` **4.907 Marken** — alle in ein `<select>` waere genau das
  // Scrollen, gegen das Punkt 1 gebaut wurde.
  assert.equal(MARKEN_PULLDOWN.length, 25)
  // `[cmd]` **Gemessen: die 25 haeufigsten decken 28,6 %.**
  assert.equal(MARKEN_PULLDOWN[0], 'BulkSupplements.com')
  // `[read]` **Und der Reiter sagt, dass es ein Ausschnitt ist** —
  // eine Liste, die vollstaendig aussieht, waere eine Falle.
  const q = lies('tab-produkte.tsx')
  assert.match(q, /häufigsten/,
    'Der Reiter sagt nicht mehr, dass das Pulldown nur die haeufigsten fuehrt.')
})

// ══ 1 — der Markenfilter ═══════════════════════════════════════════

test('A1: die Marke hat BEIDES — Eingabefeld und Pulldown', () => {
  const q = lies('tab-produkte.tsx')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  // ══ BERICHTIGT AM 2026-09-15 ═════════════════════════════════════
  //
  // `[cmd]` **Hier stand `assert.doesNotMatch(q, /<select/)`** — aus
  // G-453, wo Tom das Pulldown mit 4.907 Optionen weghaben wollte.
  //
  // **Tom, 2026-09-15:** *„MARKE: im Pulldown anwaehlbar, plus das
  // Eingabefeld aus Punkt 1 des urspruenglichen Auftrags."*
  //
  // `[read]` **Das ist kein Rueckschritt, sondern eine Ergaenzung:**
  // dieselbe Zustandsgroesse, zwei Bedienungen. **Was weg bleibt, ist
  // das Pulldown mit ALLEN 4.907** — es traegt die 25 haeufigsten,
  // und der Rest geht ueber das Feld.
  assert.match(q, /<MarkenFeld/, 'Das Eingabefeld fehlt.')
  assert.match(q, /aria-label="Marke filtern"/, 'Das tippbare Feld fehlt.')
  assert.match(q, /aria-label="Marke auswählen"/, 'Das Pulldown fehlt.')
  // `[cmd]` **Das Pulldown speist sich aus `MARKEN_PULLDOWN`, NICHT
  // aus `marken`** — letzteres waeren wieder alle 4.907.
  // `[cmd]` **G-455: das Pulldown filtert die schon gewaehlten
  // heraus** — es FUEGT HINZU, statt zu ersetzen. `[read]` Die Zusage
  // bleibt dieselbe: es fuehrt `MARKEN_PULLDOWN`, nicht alle 4.907.
  // `[read]` **Ueber Zeilenumbrueche hinweg** — der Ausdruck steht
  // seit G-455 dreizeilig da. `[cmd]` **`[\s\S]` statt `.`**, weil
  // `.` kein `\n` trifft.
  assert.match(q, /MARKEN_PULLDOWN[\s\S]{0,60}\.filter\([\s\S]{0,60}\.map\(m => <option/,
    'Das Pulldown fuehrt wieder die ganze Markenliste — genau das '
    + 'Scrollen, gegen das Punkt 1 gebaut wurde.')
  assert.doesNotMatch(q, /\{marken\.map\(m => <option/,
    'Das Pulldown fuehrt alle 4.907 Marken.')
})

test('A1: die Markenliste filtert mit `includes`, nicht auf den Anfang', () => {
  const q = lies('tab-produkte.tsx')
  // `[cmd]` **Gemessen 2026-09-14: es gibt `Optimum Nutrition` (49),
  // `ON Optimum Nutrition` (210) und `ON OPtimum Nutrition` (2).**
  // `[read]` **Mit `startsWith` faende „optimum" nur die erste** —
  // und die groesste Marke waere unerreichbar.
  assert.match(q, /toLowerCase\(\)\.includes\(f\)/,
    'Die Markensuche filtert nicht mehr mit `includes`.')
  assert.doesNotMatch(q, /marken\.filter\(m => m\.toLowerCase\(\)\.startsWith/,
    'Die Markensuche filtert auf den Wortanfang — „optimum" faende '
    + '„ON Optimum Nutrition" dann nicht.')
})

// ══ 2 — die Tafel ══════════════════════════════════════════════════

test('A2: die Tafel ist strukturiert und nicht mehr die Vierspaltentabelle', () => {
  const q = lies('produkt-tafel.tsx')
  // Die Bausteine des Medical-Vorbilds.
  for (const teil of [
    'v2-supp-prod-kacheln',    // Kacheln nebeneinander
    'v2-supp-prod-bilanz',     // „N von M Feldern gefuellt"
    'v2-supp-prod-buendel',    // die Gruppen
    'v2-supp-prod-fuss',       // Firmen unten, abgesetzt
  ]) {
    assert.ok(q.includes(teil), `Der Tafel fehlt \`${teil}\`.`)
  }
  // `[cmd]` **Die alte Tabelle ist WEG, nicht versteckt** (G-163):
  // keine `<th>`-Spaltenkoepfe mehr im Detail.
  assert.doesNotMatch(q, /<th\b/,
    'In der Tafel steht wieder eine Tabelle mit Spaltenkoepfen.')

  // ══ G-492: DIESE ZUSICHERUNG IST UMGEDREHT ═══════════════════════
  //
  // `[cmd]` **Hier stand:** `assert.doesNotMatch(q, /role="tablist"/)`
  // — *„der Auftrag verbietet sie ausdruecklich (ein Produkt hat
  // keine Rechtslage)"*.
  //
  // `[cmd]` **Tom hat das am 2026-09-08 ausdruecklich umgedreht:**
  // *„oder wir gehen nochmal logisch ueber die darstellung, wenn
  // details geoeffnet sind, und bauen das wie bei supplements mit
  // subnav, dann muss man nicht mehr soviel runternavigieren"* —
  // **und nennt vier Reiter** (Ueberblick, Anwendung, Hinweise,
  // Etikett).
  //
  // `[read]` **Die alte Begruendung war nicht falsch, sie war
  // ueberholt:** G-453 kannte nur zwei moegliche Reiter, Tom nennt
  // jetzt vier — **zwei davon vorbereitet fuer C-527.**
  //
  // `[read]` **Die Zusicherung wird nicht geloescht, sondern
  // umgedreht** — sonst waere die Leiste ab jetzt unbewacht.
  assert.match(q, /role="tablist"|TafelReiterleiste/,
    'Die Produkt-Tafel hat keine Reiterleiste mehr (G-492/A11).')
})

test('A3: die Tafel benutzt kein `v2-dim` fuer Text, der gelesen werden soll', () => {
  const q = lies('produkt-tafel.tsx')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  // `[cmd]` **`--fg-dim` misst 2,88:1 auf Weiss** — unter WCAG AA
  // (4,5:1). **Genau das hat Tom als „kaum lesbar" gemeldet.**
  // `[read]` **`--fg-muted` misst 9,19:1** und traegt dieselbe Rolle.
  assert.doesNotMatch(q, /className="[^"]*\bv2-dim\b/,
    'In der Tafel steht wieder `v2-dim` — gemessen 2,88:1, WCAG AA '
    + 'verlangt 4,5:1. Fuer gedaempften Text gilt `v2-muted` (9,19:1).')
})

test('A3: die zwei geerbten Farben sind NUR in der Tafel ueberschrieben', () => {
  const css = fs.readFileSync(path.join(V2, 'supplements.css'), 'utf8')
  // `[read]` **Der Geltungsbereich IST die Zusage** — ohne den
  // Vorsatz `.v2-supp-prod-tafel` waere es eine Aenderung an jedem
  // Modul, das `v2-eyebrow` benutzt.
  // `[cmd]` **Zwei Orte, seit die Filterleiste dazugekommen ist**
  // (2026-09-15): dort standen die Gruppenueberschriften wieder bei
  // 2,88:1. `[read]` **Ein neuer Baustein erbt die Berichtigung
  // nicht, er erbt den Fehler** — deshalb nennt die Regel beide
  // einzeln, und diese Probe prueft beide.
  assert.match(css,
    /\.v2-supp-prod-tafel \.v2-eyebrow,\s*\n\.v2-supp-prod-filter \.v2-eyebrow \{[^}]*--fg-muted/,
    'Die Kontrastberichtigung fuer `v2-eyebrow` fehlt, deckt nicht '
    + 'beide Orte ab oder ist nicht auf sie begrenzt.')
  assert.match(css, /\.v2-supp-prod-tafel \.v2-pill-acc \{/,
    'Die Kontrastberichtigung fuer `v2-pill-acc` fehlt.')
  // `[cmd]` **Nicht global** — eine Regel ohne den Vorsatz traefe
  // jedes Modul.
  assert.doesNotMatch(css, /\n\.v2-eyebrow \{/,
    'Hier wird `.v2-eyebrow` global umdefiniert — das gehoert '
    + '`packages/ui` und gilt fuer alle Apps.')
})

test('A6: Einnahmehinweis und Firmen haben beide einen benannten Leerfall', () => {
  const q = lies('produkt-tafel.tsx')
  // `[read]` **Der Satz sagt, WO nichts steht** — nicht „keine
  // Einnahmeempfehlung". Letzteres waere eine Aussage ueber das
  // Produkt statt ueber das Etikett.
  assert.ok(q.includes('Das Etikett nennt keinen Einnahmehinweis'),
    'Der Leerfall des Einnahmehinweises fehlt (A7).')
  assert.ok(q.includes('Zu diesem Produkt ist keine Firma hinterlegt'),
    'Der Leerfall der Firmen fehlt (A7).')
  assert.ok(q.includes('Zu diesem Produkt sind keine Etikettzeilen erfasst'),
    'Der Leerfall des Etiketts fehlt (A7).')
  // `[cmd]` **`suggested_use` wird NICHT uebersetzt** (C-489) — es ist
  // ein Zitat vom Etikett.
  assert.match(q, /v2-supp-prod-zitat/,
    'Der Einnahmehinweis ist nicht mehr als Zitat ausgezeichnet.')
})

test('A4: der Kategoriefilter geht an die Datenbank, nicht an die geladene Seite', () => {
  const q = lies('tab-produkte.tsx')
  // ══ WARUM DIE BEDINGUNG GEPRUEFT WIRD, NICHT DIE ZEILE ═══════════
  //
  // `[cmd]` **Hier stand nur `assert.match(q, /p\.set\('kategorie'/)`
  // — und die Sabotageprobe blieb GRUEN:** `if (false) p.set(
  // 'kategorie', kategorie)` enthaelt die gesuchte Zeichenkette
  // weiterhin, tut aber nichts.
  //
  // `[read]` **Ein Waechter, der die Zeilenform sucht, misst die
  // Zeilenform.** Geprueft wird deshalb die ganze Bedingung: der Wert
  // wird gesetzt, WENN eine Kategorie gewaehlt ist.
  assert.match(q, /if \(kategorie\) p\.set\('kategorie', kategorie\)/,
    'Die Kategorie wird nicht (mehr) an die Abfrage gereicht — oder '
    + 'die Bedingung davor ist eine andere geworden.')
  // G-453/4: die Form geht denselben Weg.
  assert.match(q, /if \(form\) p\.set\('form', form\)/,
    'Die Darreichungsform wird nicht an die Abfrage gereicht.')
  // `[read]` **Und beide stehen im Schluessel, gegen den der Effekt
  // laeuft** — ein Filter, der keine neue Abfrage ausloest, ist ein
  // Regler ohne Wirkung (C-426).
  // `[cmd]` **G-455: `gewaehlteMarken` und `allergienAn` kamen dazu.**
  // `[read]` **`marken` heisst seit G-453 die Liste der VERFUEGBAREN
  // Marken** — die AUSWAHL heisst `gewaehlteMarken`, damit nicht zwei
  // Listen einen Namen teilen.
  assert.match(q,
    /\[frage, gewaehlteMarken, status, seite, kategorie, form, allergienAn\]/,
    'Ein Kategorie-, Form- oder Markenwechsel loest keine neue Abfrage aus.')
  // `[read]` **Ein Filterwechsel faengt das Fenster neu an** — sonst
  // haette man 1.500 Zeilen geladen und saehe die ersten 500 einer
  // ganz anderen Menge.
  // ══ DIE SACHE, NICHT DIE ZEILENFORM ══════════════════════════════
  //
  // `[cmd]` **Hier stand die Abhaengigkeitsliste woertlich** — und sie
  // fiel, als G-455 sie durch einen abgeleiteten Schluessel ersetzte.
  //
  // `[cmd]` **Der Grund war ein FEHLER, den diese Liste verursacht
  // hat:** ein Array als Abhaengigkeit ist bei jedem Anstrich ein
  // neues Objekt, der Effekt lief endlos und brach seine eigene
  // Anfrage ab (gemessen 2026-09-15).
  //
  // `[read]` **Die Zusage ist *„ein Filterwechsel setzt das Fenster
  // zurueck"*, nicht *„die Liste sieht so aus"*.** **Geprueft wird
  // deshalb, dass ein Schluessel aus ALLEN Filtern gebildet wird und
  // der Effekt an ihm haengt.**
  assert.match(q, /const filterSchluessel = \[/,
    'Der Filterschluessel fehlt.')
  // `[read]` **Der Block wird herausgeschnitten und darin gesucht** —
  // ein `RegExp` mit `{0,260}` ueber Zeilen hinweg ist schwerer zu
  // lesen als zwei `indexOf`.
  // `[cmd]` **Bis `].join`, nicht bis zur ersten `]`** — die erste
  // gehoert zum Spread `[...gewaehlteMarken]`, und der Block waere
  // nach zwei Eintraegen zu Ende.
  const blockVon = q.indexOf('const filterSchluessel = [')
  const block = q.slice(blockVon, q.indexOf('].join', blockVon))
  for (const teil of ['frage', 'gewaehlteMarken', 'status', 'kategorie',
    'form', 'allergienAn']) {
    assert.ok(block.includes(teil),
      `\`${teil}\` geht nicht in den Filterschluessel ein — ein Wechsel `
      + 'setzt das Fenster dann nicht zurueck.')
  }
  assert.match(q, /setSeite\(0\) \}, \[filterSchluessel\]\)/,
    'Ein Filterwechsel setzt das Fenster nicht zurueck — dann stuenden '
    + 'nachgeladene Zeilen einer anderen Filtermenge in der Liste.')
})

// ══ 2 — die Leiste wie in foodsdb ═══════════════════════════════════

test('A1: die Leiste hat die foodsdb-Bauform in ihrer Reihenfolge', () => {
  // **Tom, 2026-09-15:** *„Suchfeld und Filter wie in foodsdb:
  // Sucheingabe, daneben ,Filter ein-/ausblenden', dann die Aktion
  // ,Custom Supplement'."*
  const q = lies('tab-produkte.tsx')
  assert.match(q, /className="v2-train-lib-filter"/,
    'Die geteilte Leistenklasse aus `packages/ui` fehlt.')
  assert.match(q, /Custom Supplement/, 'Die Aktion fehlt.')
  // `[read]` **`InEntwicklungKnopf`, kein toter Knopf** — der Weg ist
  // nicht gebaut, und einer, der nichts tut, waere schlechter (G-182).
  assert.match(q, /<InEntwicklungKnopf titel="Custom Supplement"/,
    'Die Aktion ist ein normaler Knopf — sie fuehrt nirgendwohin.')

  // ══ DIE REIHENFOLGE IST DIE ZUSAGE ═══════════════════════════════
  // `[read]` **Tom nennt sie ausdruecklich** — Suche, dann Filter,
  // dann Aktion. `[cmd]` Ein Waechter, der nur das Vorhandensein
  // prueft, bliebe gruen, wenn die Aktion vor die Suche rutscht.
  const leiste = q.slice(q.indexOf('className="v2-train-lib-filter"'))
  const iSuche = leiste.indexOf('aria-label="Produkt suchen"')
  const iFilter = leiste.indexOf('aria-controls="v2-supp-prod-filter"')
  const iAktion = leiste.indexOf('titel="Custom Supplement"')
  assert.ok(iSuche >= 0 && iFilter >= 0 && iAktion >= 0, 'Ein Teil fehlt.')
  assert.ok(iSuche < iFilter && iFilter < iAktion,
    `Reihenfolge verdreht: Suche ${iSuche}, Filter ${iFilter}, Aktion ${iAktion}.`)
})

test('A1: der Filterknopf zeigt die Zahl der gesetzten Filter', () => {
  const q = lies('tab-produkte.tsx')
  // `[read]` **Ohne sie waere ein zugeklappter Filter ein unsichtbarer
  // Filter.**
  assert.match(q, /aktiveFilter > 0 && \(/,
    'Die Zahl am Filterknopf fehlt.')
  // `[cmd]` **Der Marktstatus zaehlt NUR mit, wenn er von der Vorgabe
  // abweicht** — sonst stuende beim Oeffnen schon eine 1 da, und die
  // Zahl hiesse nichts.
  assert.match(q, /status === STANDARD_STATUS \? 0 : 1/,
    'Der Standard-Marktstatus zaehlt als aktiver Filter — dann steht '
    + 'beim Oeffnen des Reiters schon eine 1 am Knopf.')
})

// ══ 3 — nicht blaetterbar ═══════════════════════════════════════════

test('A1: die Ergebnisse sind NICHT blaetterbar', () => {
  // **Tom, 2026-09-15:** *„Ergebnisse NICHT blaetterbar."*
  const q = lies('tab-produkte.tsx')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  // `[cmd]` **Hier standen `Zurück · Seite N · Weiter`.**
  assert.doesNotMatch(q, /Seite \{seite \+ 1\}/,
    'Die Seitenzahl ist zurueck — Tom will keine Blaetterei.')
  assert.doesNotMatch(q, /setSeite\(s => Math\.max\(0, s - 1\)\)/,
    'Der Zurueck-Knopf ist zurueck.')
  // `[read]` **Was stattdessen dasteht:** ein Knopf, der anhaengt.
  assert.match(q, /weitere laden/, 'Der Nachladeknopf fehlt.')
})

test('A1: das Fenster WAECHST, es wandert nicht', () => {
  const read = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/supplements/produkte-read.ts'), 'utf8')
  // `[cmd]` **Hier stand `.range(seite * SEITE, seite * SEITE + SEITE
  // - 1)`** — ein wanderndes Fenster haette die geladenen Zeilen
  // ERSETZT, und der Nutzer haette beim Nachladen seine Stelle
  // verloren.
  assert.match(read, /\.range\(0, bis\)/,
    'Das Fenster faengt nicht mehr bei 0 an — dann ersetzt „mehr '
    + 'laden" die Liste, statt sie zu verlaengern.')
  assert.match(read, /const bis = \(seite \+ 1\) \* SEITE - 1/,
    'Die Fenstergrenze waechst nicht mit `seite`.')
  // ══ DIE ZAHL WIRD GEPRUEFT, NICHT IHR QUELLTEXT ══════════════════
  //
  // `[cmd]` **Hier stand `/export const SEITE = 500/`** — und die
  // Probe fiel, als der WERT nach `produkt-etikett.ts` wanderte
  // (A-30: der Reiter braucht ihn, und ein Wert-Import aus
  // `produkte-read` zieht `next/headers`).
  //
  // `[read]` **Die Zusage ist die gemessene Groesse, nicht die Zeile,
  // in der sie steht.** Deshalb wird der importierte Wert geprueft.
  assert.equal(FENSTER, 500,
    `Das Fenster traegt ${FENSTER} Zeilen statt der gemessenen 500 — `
    + 'dann gehoert die Messung im Kopf nachgezogen (1.000 kosteten '
    + '6.002 DOM-Knoten und 140 ms).')
  // Und `produkte-read` rechnet mit derselben Zahl, nicht mit einer
  // zweiten — eine Zahl an zwei Orten waere Drift.
  assert.match(read, /export const SEITE = FENSTER/,
    'Die Abfrage fuehrt eine eigene Fenstergroesse — dann rechnet der '
    + 'Reiter mit einer anderen als die Datenbank.')
})
