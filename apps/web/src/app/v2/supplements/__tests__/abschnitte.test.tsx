// G-179: kein Block ohne Inhalt (Spezifikation §9, dritte Regel).
//
// ── WARUM DIESE PRUEFUNG NOETIG IST ─────────────────────────────────
//
// `[cmd]` **Der Normalfall ist der leere Abschnitt**, nicht der
// gefuellte: gemessen am 2026-08-25 ist `zu_wenig_de` bei **241 von
// 290** leer, `mythen_de` bei 30. Bei den Kacheln noch deutlicher —
// eine belegte Dosis haben **83 von 318**, eine Obergrenze **38**.
//
// `[read]` **Vorher stand dort „Sicherheit · 2 Felder", hinter denen
// zweimal `unknown` steckte.** Die Zahl versprach Inhalt, den es nicht
// gab (G-177). Jetzt entfaellt der Abschnitt — und diese Pruefung
// haelt fest, dass er wirklich verschwindet und nicht als leere
// Flaeche stehenbleibt.
//
// `[read]` **Geprueft wird das GERENDERTE Markup**, nicht der
// Quelltext: ein `null` im JSX ist erst dann bewiesen, wenn im
// Ergebnis nichts steht.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import * as React from 'react'

import {
  Abschnitt, AufgeteilterAbschnitt, Aussagen, inAussagen,
  Stichpunkte, Zwecke, DreiKacheln, Irreversibel,
  UeberwachungUndReinheit, Formen, Fragen,
} from '../substanz-abschnitte'

const TAFEL = path.join(process.cwd(), 'src/app/v2/supplements/substanz-tafel.tsx')

const r = (e: React.ReactElement) => renderToStaticMarkup(e)

test('ein Abschnitt ohne Text erzeugt gar kein Markup', () => {
  // `[read]` Nicht „leerer Absatz", sondern NICHTS — sonst bleibt im
  // Fenster eine Luecke mit Ueberschrift stehen.
  for (const leer of [null, undefined, '', '   ']) {
    assert.equal(r(React.createElement(Abschnitt, { titel: 'Zu wenig', text: leer })), '',
      `Text ${JSON.stringify(leer)} muss den Abschnitt entfallen lassen.`)
  }
})

test('ein Abschnitt mit Text zeigt Titel und Text', () => {
  const html = r(React.createElement(Abschnitt, {
    titel: 'Zu wenig',
    text: 'Mangel zeigt sich als Nachtblindheit.',
  }))
  assert.match(html, /Zu wenig/)
  assert.match(html, /Nachtblindheit/)
})

test('eine als Text gespeicherte Liste wird nicht als JSON gezeigt', () => {
  // `[cmd]` **Gemessen 2026-08-25: 127 von 290 `mythen_de` beginnen
  // mit `[`** — ein JSON-Array in einer `text`-Spalte. 133 sind
  // normaler Fliesstext. Andere Felder sind nicht betroffen.
  //
  // `[read]` **Ohne Behandlung stand im Fenster woertlich:**
  // `["Mythos: '1-Testosteron ist nur ein Prohormon.' Korrektur: …"]`
  // — mit Klammern und Anfuehrungszeichen. **Genau der Fall, vor dem
  // der Auftrag warnt:** bei Schablonentext sah die Kachel gut aus,
  // bei echtem Text brach sie.
  const html = r(React.createElement(Abschnitt, {
    titel: 'Mythen',
    text: '["Mythos: nur ein Prohormon.", "Korrektur: selbst aktiv."]',
  }))
  assert.equal(/\[&quot;|\["/.test(html), false, 'Keine JSON-Klammern im Markup.')
  assert.match(html, /Mythos: nur ein Prohormon/)
  assert.match(html, /Korrektur: selbst aktiv/)
  assert.equal((html.match(/<p /g) ?? []).length, 2,
    'Zwei Eintraege werden zu zwei Absaetzen, nicht zu einer Zeile.')
})

test('G-182: ein Array AUS OBJEKTEN ergibt kein [object Object]', () => {
  // ══ DER FEHLER ══════════════════════════════════════════════════
  //
  // `[cmd]` Auf Toms Bild 5 stand unter MYTHEN zweimal woertlich
  // `[object Object]`.
  //
  // `[cmd]` **Gemessen 2026-08-25: 50 der 260 gefuellten `mythen_de`
  // sind Arrays AUS OBJEKTEN** — je mit `mythos_de` und
  // `korrektur_de`. G-180 las Zeichenkette und Array, **aber nicht das
  // Objekt darin**, und `String({…})` ergibt `[object Object]`.
  const html = r(React.createElement(Abschnitt, {
    titel: 'Mythen',
    text: JSON.stringify([
      { mythos_de: 'Mod GRF 1-29 sei dasselbe wie CJC-1295.',
        korrektur_de: 'CJC-1295 trägt zusätzlich einen Anhang (DAC).' },
    ]),
  }))
  assert.equal(/\[object Object\]/.test(html), false,
    'Das ist genau der Fehler von Bild 5 (G-182).')
  assert.match(html, /Mod GRF 1-29 sei dasselbe/)
  assert.match(html, /trägt zusätzlich einen Anhang/)
  assert.equal((html.match(/<p /g) ?? []).length, 2,
    'Mythos und Korrektur stehen getrennt, nicht verklebt.')
})

test('G-182: ein Objekt ohne bekannte Schluessel zeigt die erste Zeichenkette', () => {
  // `[read]` Lieber irgendein lesbarer Text als `[object Object]` —
  // aber nur, wenn wirklich einer drinsteht.
  const html = r(React.createElement(Abschnitt, {
    titel: 'Mythen', text: JSON.stringify([{ irgendwas: 'Ein lesbarer Satz.' }]),
  }))
  assert.match(html, /Ein lesbarer Satz/)
  assert.equal(/\[object Object\]/.test(html), false)
})

test('G-182: Objekte ganz ohne Text erzeugen keinen leeren Absatz', () => {
  const html = r(React.createElement(Abschnitt, {
    titel: 'Mythen', text: JSON.stringify([{ zahl: 5 }, {}]),
  }))
  assert.equal(html, '', 'Nichts Lesbares drin heisst: kein Abschnitt.')
})

test('G-182: „Mythos: … – Korrektur" wird getrennt gezeigt', () => {
  // `[cmd]` **30 Eintraege tragen dieses Muster** als Zeichenkette im
  // Array — ohne Ueberschneidung mit den 50 Objekt-Arrays (gemessen
  // 2026-08-25).
  const html = r(React.createElement(Abschnitt, {
    titel: 'Mythen',
    text: JSON.stringify([
      'Mythos: „Man nimmt damit nur Wasser ab." – In Studien ging vor allem Fettmasse verloren.',
    ]),
  }))
  assert.equal((html.match(/<p /g) ?? []).length, 2,
    'Mythos und Korrektur gehoeren in zwei Absaetze.')
  assert.match(html, /In Studien ging vor allem Fettmasse/)
  assert.equal(/Mythos:/.test(html), false,
    'Das Praefix „Mythos:" ist Formatierung, kein Inhalt.')
})

// ══ G-183: die Aufschluesselung an Satzgrenzen ══════════════════════
//
// **Tom, 2026-08-25** zum 6-OXO-Absatz: *„so schreibt und liest kein
// mensch."*
//
// `[cmd]` **Gemessen VOR dem Bau**, bezogen auf die gefuellten Felder:
// `rechtslage_klartext_de` **135 von 136** · `ueberwachung_de` **63
// von 96** · `nicht_im_blut_de` **67 von 134** · `reinheit_de` **118
// von 134** · `irreversibel_de` **90 von 112**.

test('G-183: der Mythos bekommt genau EIN Paar Anfuehrungszeichen', () => {
  // `[cmd]` **Auf dem Bild von Retatrutid stand `„24 Prozent … .""`**
  // — die Texte tragen ihre Anfuehrungszeichen selbst, und die
  // Anzeige setzte ein zweites Paar darum (mein Fehler aus G-182).
  for (const text of [
    JSON.stringify(['Mythos: „24 Prozent sind bewiesen." – Die Zahl stammt aus Phase 2.']),
    JSON.stringify([{ mythos_de: '„24 Prozent sind bewiesen."',
      korrektur_de: 'Die Zahl stammt aus Phase 2.' }]),
  ]) {
    const html = r(React.createElement(Abschnitt, { titel: 'Mythen', text }))
    assert.equal(/[„“"]{2}|[”"]{2}/.test(html), false,
      `Doppelte Anfuehrungszeichen im Markup: ${html.slice(0, 160)}`)
    assert.match(html, /24 Prozent sind bewiesen/)
    assert.match(html, /Die Zahl stammt aus Phase 2/)
  }
})

test('G-183: der Doppelpunkt trennt NICHT', () => {
  // ══ DER GRUND, WARUM DIE REGEL NICHT AM DOPPELPUNKT GREIFT ══════
  //
  // `[cmd]` **5 Texte tragen „WADA-Kategorie …:"** (gemessen
  // 2026-08-25). *„WADA-Kategorie S2: jederzeit verboten"* ist EINE
  // Aussage — eine Regel am Doppelpunkt haette daraus zwei gemacht,
  // von denen keine fuer sich steht.
  const teile = inAussagen('WADA-Kategorie S2: jederzeit verboten.')
  assert.deepEqual(teile, ['WADA-Kategorie S2: jederzeit verboten.'],
    'Ein Doppelpunkt mitten im Satz darf nicht umbrechen (G-183).')
})

test('G-183: Satzgrenze und Semikolon trennen — der Fall Retatrutid', () => {
  // `[cmd]` Der Text von `sub_a69c95e352`, gekuerzt: drei Aussagen,
  // getrennt durch Punkt und Semikolon.
  const teile = inAussagen(
    'Nirgendwo zugelassen (Datenstand: August 2026). In den USA ist der '
    + 'Verkauf illegal; in Thailand trägt der Import Zollrisiko. '
    + 'Die WADA verbietet Retatrutid (Kategorie S0).')
  assert.equal(teile.length, 3, `Erwartet 3 Aussagen, bekam ${teile.length}`)
  assert.match(teile[0], /^Nirgendwo zugelassen/)
  assert.match(teile[1], /^In den USA/)
  assert.match(teile[2], /^Die WADA/)
  // `[read]` Das Semikolon INNERHALB der zweiten Aussage trennt nicht
  // — dort folgt ein Kleinbuchstabe.
  assert.match(teile[1], /Zollrisiko\.$/)
})

test('G-183: ein Semikolon vor Grossbuchstabe trennt', () => {
  const teile = inAussagen(
    'In den USA ist die Verteilung eine Straftat; In Thailand nur über Krankenhäuser.')
  assert.equal(teile.length, 2)
})

test('G-183: ein einteiliger Absatz bleibt ein Absatz', () => {
  // `[cmd]` **Der Fall `Stanozolol`** — die EINE einteilige Zeile von
  // 136. `[read]` Sie traegt Semikolon UND Doppelpunkt und bleibt
  // trotzdem eine Aussage: das Semikolon steht vor Kleinschreibung,
  // der Doppelpunkt trennt nie, und ein Satzende gibt es nur am Schluss.
  const text = 'Der Datensatz bestätigt keinen amtlichen Zulassungsstatus; '
    + 'praktisch heißt das: In Deutschland ist der Stoff verschreibungspflichtig.'
  const teile = inAussagen(text)
  assert.equal(teile.length, 1,
    'Weder das Semikolon vor Kleinschreibung noch der Doppelpunkt trennen.')

  const einer = inAussagen('Weltweit verschreibungspflichtiges Arzneimittel.')
  assert.deepEqual(einer, ['Weltweit verschreibungspflichtiges Arzneimittel.'])
})

test('G-183: Abkuerzungen und Zahlen mit Punkt trennen nicht', () => {
  // `[read]` Der Grossbuchstabe hinter dem Trennzeichen schuetzt
  // „21 USC 333(e); in Thailand …" und „z. B. 5 mg".
  assert.equal(inAussagen('Erlaubt bis 21 USC 333(e); in Thailand verboten.').length, 1)
  assert.equal(inAussagen('Studien mit z. B. 5 mg täglich.').length, 1)
})

test('G-183: ein einzelner Teil wird KEINE Liste', () => {
  // `[read]` Eine Liste mit einem Punkt waere schlimmer als der
  // Absatz — deshalb faellt `AufgeteilterAbschnitt` dort auf
  // `Abschnitt` zurueck.
  const html = r(React.createElement(AufgeteilterAbschnitt, {
    titel: 'Rechtslage', text: 'Weltweit verschreibungspflichtig.',
  }))
  assert.equal(/<ul/.test(html), false, 'Ein Teil ist keine Aufzaehlung.')
  assert.match(html, /Weltweit verschreibungspflichtig/)
})

test('G-183: mehrere Teile werden eine Liste', () => {
  const html = r(React.createElement(AufgeteilterAbschnitt, {
    titel: 'Rechtslage',
    text: 'Nirgendwo zugelassen. In den USA illegal. Die WADA verbietet es.',
  }))
  assert.match(html, /<ul class="v2-supp-aussagen"/)
  assert.equal((html.match(/<li/g) ?? []).length, 3)
})

test('G-183: `inAussagen` gibt bei einem Teil den ganzen Absatz zurueck', () => {
  // `[read]` **Die Ruecknahme auf `[roh]` ist die eigentliche Zusage**
  // — sie verhindert die Liste mit einem Punkt. `[cmd]` Ohne sie blieb
  // die Negativprobe gruen (gegengeprobt 2026-08-25), weil alle
  // anderen Tests mehrteilige Texte pruefen.
  const einer = inAussagen('Weltweit verschreibungspflichtiges Arzneimittel.')
  assert.equal(einer.length, 1)
  assert.equal(einer[0], 'Weltweit verschreibungspflichtiges Arzneimittel.',
    'Der Teil muss der ganze Absatz sein, nicht eine Scheibe davon.')

  // Und ohne Satzzeichen am Ende ebenso.
  assert.deepEqual(inAussagen('Ein Satz ohne Punkt'), ['Ein Satz ohne Punkt'])
})

test('G-183: Rechtslage und „Nicht im Blut" laufen ueber die Zerlegung', () => {
  // `[read]` **Die Verdrahtung gehoert bewacht, nicht nur die Regel.**
  // `[cmd]` Ein Rueckbau auf `<Abschnitt>` liess alle Tests gruen —
  // die Funktion war geprueft, ihre Verwendung nicht.
  const quelle = fs.readFileSync(TAFEL, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  for (const titel of ['Rechtslage', 'Nicht im Blut nachweisbar']) {
    const stelle = new RegExp(
      `<AufgeteilterAbschnitt[^>]*titel="${titel}"`, 's')
    assert.ok(stelle.test(quelle),
      `„${titel}" muss ueber \`AufgeteilterAbschnitt\` laufen — sonst `
      + 'bleibt der Absatz Fliesstext (G-183).')
  }
  // Der Rumpf der Warnkacheln nutzt `Aussagen`.
  assert.match(quelle, /<Aussagen\s/,
    '`ueberwachung_de` und `reinheit_de` brauchen die Zerlegung im '
    + 'Kachelrumpf (G-183).')
})

test('G-183: ein leerer Text erzeugt nichts', () => {
  assert.equal(r(React.createElement(AufgeteilterAbschnitt, {
    titel: 'Rechtslage', text: null,
  })), '')
  assert.deepEqual(inAussagen('   '), [])
})

test('ein Text, der nur mit Klammer beginnt, bleibt unveraendert', () => {
  // `[read]` Kein gueltiges JSON — dann ist es eben Text. Sonst
  // verschwaende ein Satz, der zufaellig mit `[` anfaengt.
  const html = r(React.createElement(Abschnitt, {
    titel: 'Mythen', text: '[nicht wirklich JSON',
  }))
  assert.match(html, /\[nicht wirklich JSON/)
})

test('leere Stichpunktlisten entfallen, auch bei leeren Eintraegen', () => {
  assert.equal(r(React.createElement(Stichpunkte, { titel: 'X', punkte: null })), '')
  assert.equal(r(React.createElement(Stichpunkte, { titel: 'X', punkte: [] })), '')
  assert.equal(r(React.createElement(Stichpunkte, { titel: 'X', punkte: ['', '  '] })), '',
    'Eine Liste aus Leerstrings ist eine leere Liste.')
})

test('die Zwecke-Chips entfallen ohne Inhalt', () => {
  assert.equal(r(React.createElement(Zwecke, { punkte: [] })), '')
  assert.match(r(React.createElement(Zwecke, { punkte: ['Mehr Kraft'] })), /Mehr Kraft/)
})

test('die Kachelzeile entfaellt, wenn alle drei Werte fehlen', () => {
  // `[cmd]` Der Fall von 143 der 318: `dosing.status = 'unbekannt'`.
  assert.equal(r(React.createElement(DreiKacheln, {
    menge: null, obergrenze: null, einnahme: null,
  })), '')
})

test('einzelne Kacheln entfallen einzeln — nicht die ganze Zeile', () => {
  // `[cmd]` **Der haeufigste Fall:** Menge 83, Obergrenze 38,
  // Einnahme 19 — eine Substanz hat oft nur eine der drei.
  const html = r(React.createElement(DreiKacheln, {
    menge: '3-5 g/Tag', obergrenze: null, einnahme: null,
  }))
  assert.match(html, /Übliche Menge/)
  assert.match(html, /3-5 g\/Tag/)
  assert.equal(/Obergrenze/.test(html), false,
    'Eine fehlende Obergrenze darf keine leere Kachel erzeugen.')
  assert.equal(/Einnahme/.test(html), false)
})

test('„Was nicht zurueckkommt" entfaellt ohne Text', () => {
  // `[cmd]` **Betrifft heute ALLE:** nach dem C-264-Import ist
  // `irreversibel_de` bei 0 von 290 gefuellt (gemessen 2026-08-25).
  // Der Abschnitt darf deshalb nicht als leerer Rahmen dastehen.
  assert.equal(r(React.createElement(Irreversibel, { text: null })), '')
  const html = r(React.createElement(Irreversibel, { text: 'Die eigene Produktion erholt sich unterschiedlich.' }))
  assert.match(html, /Was nicht zurückkommt/)
  assert.match(html, /erholt sich unterschiedlich/)
})

test('Ueberwachung und Reinheit entfallen einzeln', () => {
  assert.equal(r(React.createElement(UeberwachungUndReinheit, {
    ueberwachung: null, reinheit: null,
  })), '')
  const nurRein = r(React.createElement(UeberwachungUndReinheit, {
    ueberwachung: null, reinheit: 'In Stichproben wurden andere Wirkstoffe gefunden.',
  }))
  assert.match(nurRein, /Reinheit/)
  assert.equal(/Überwachung/.test(nurRein), false)
})

test('die Formen entfallen, wo es keine gibt', () => {
  // `[cmd]` 15 von 318 Eintraegen haben Formen; 303 haben keine.
  assert.equal(r(React.createElement(Formen, { formen: [], onOeffnen: () => {} })), '')
  assert.equal(r(React.createElement(Formen, { formen: null, onOeffnen: () => {} })), '')
})

test('die Formen zeigen Name, Grad und den unterscheidenden Satz', () => {
  // `[cmd]` Der Fall Magnesium: sieben Formen, jede mit eigenem Grad.
  const html = r(React.createElement(Formen, {
    formen: [{ id: 'a', slug: 'mg-citrat', name: 'Magnesium citrate',
      hinweis: 'Citrat; gut löslich.', grad: 'B' }],
    onOeffnen: () => {},
  }))
  assert.match(html, /Magnesium citrate/)
  assert.match(html, /Citrat; gut löslich/)
  assert.match(html, /B</, 'Der eigene Grad der Form gehoert dazu.')
  assert.match(html, /Die Formen · 1/)
})

test('Fragen entfallen ohne Inhalt und filtern halbe Paare', () => {
  assert.equal(r(React.createElement(Fragen, { fragen: [] })), '')
  assert.equal(r(React.createElement(Fragen, {
    fragen: [{ frage: 'Und?', antwort: '' }],
  })), '', 'Eine Frage ohne Antwort ist kein Eintrag.')
  assert.match(r(React.createElement(Fragen, {
    fragen: [{ frage: 'Muss ich laden?', antwort: 'Nötig ist es nicht.' }],
  })), /Muss ich laden/)
})
