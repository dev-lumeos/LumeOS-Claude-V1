// G-459 — die Allergiekachel aufgeraeumt.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **Toms drei Punkte**, je mit einer Probe, die rot werden kann:
//
//     1  eine kleinere Kachel LINKS NEBEN dem Erfahrungsgrad
//     2  Smartsearch mit Vorschlaegen, DIE ART ZUERST
//     3  tabellarisch, alles in DERSELBEN SPALTE
//
// **Und der Satz, der den Auftrag traegt:**
//
// > *„Der Unterschied zwischen ‚ich habe es notiert' und ‚LumeOS
// > schuetzt mich davor'."*
//
// `[read]` **Was eine Probe hier NICHT leisten kann:** ob die Kachel
// auf dem Schirm wirklich links steht. **Das ist gemessen worden**
// (`tools/_g459-lage.mjs`: x 264–744 gegen 756–1236, 407 px
// Hoehenueberschneidung) **und steht im Bericht** — hier steht, was
// eine Datei belegen kann.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  prueftProdukte, reichweiteSatz,
  QUELLE_SETTINGS, type Allergie,
} from '../../../../lib/allergien/allergie-lage'

const WEB = process.cwd()
const lies = (p: string) => fs.readFileSync(path.join(WEB, 'src', p), 'utf8')

/**
 * Kommentare weg, bevor gesucht wird.
 *
 * `[cmd]` **G-455 und G-166:** eine Probe fand ihren eigenen
 * Erklaertext im Dateikopf und blieb gruen, obwohl die Sache fehlte.
 */
function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
}

function a(x: Partial<Allergie> & { id: string }): Allergie {
  return {
    stoff_code: null, stoff_text: x.id, art: 'nahrung', schwere: 'allergie',
    quelle: QUELLE_SETTINGS, seit: null, notiz: null, ...x,
  }
}

// ══ 1 — die Rechnung, nicht die Anzeige ═════════════════════════════

test('A1: prueftProdukte trennt Katalogcode von Freitext', () => {
  // **Der Auftrag:** *„stoff_text bleibt moeglich, aber die
  // Oberflaeche sagt, dass er NICHT gegen Produkte prueft."*
  //
  // `[cmd]` **Die Datenbank zieht dieselbe Grenze** — der Trigger
  // `validate_user_allergy_catalog_code` (C-503) laesst
  // `stoff_code IS NULL` durch und weist einen erfundenen Code ab
  // (beide 2026-09-16 gemessen).
  assert.equal(prueftProdukte(a({ id: '1', stoff_code: 'nutrition:contains_lactose' })), true)
  assert.equal(prueftProdukte(a({ id: '2', stoff_code: null })), false)
  // `[read]` **Leerzeichen sind kein Code** — sonst versprache eine
  // Zeile mit einem Leerzeichen einen Schutz, den es nicht gibt.
  assert.equal(prueftProdukte(a({ id: '3', stoff_code: '   ' })), false)
})

test('A2: der Satz zum Freitext nennt die Grenze, nicht nur den Zustand', () => {
  // `[read]` **„Freitext" allein ist keine Auskunft** — der Nutzer
  // muss erfahren, was ihm dadurch FEHLT.
  const frei = reichweiteSatz(a({ id: '1', stoff_code: null }))
  assert.match(frei, /nicht|kein/i,
    'Der Freitext-Satz sagt nicht, dass etwas NICHT geprueft wird.')
  assert.match(frei, /Produkt/i,
    'Der Freitext-Satz nennt nicht, WOGEGEN nicht geprueft wird.')

  const katalog = reichweiteSatz(a({ id: '2', stoff_code: 'nutrition:contains_lactose' }))
  assert.notEqual(katalog, frei,
    'Katalog und Freitext bekommen denselben Satz — dann sagt er nichts.')
})

// ══ 2 — C-503 wird GERUFEN, nicht nachgebaut ════════════════════════

test('A3: die Vorschlaege kommen aus allergy_catalog_suggestions', () => {
  // **Der Auftrag woertlich:** *„KEINE Vorschlagsfunktion nachbauen —
  // C-503 liefert sie."*
  const q = ohneKommentare(lies('lib/allergien/vorschlaege-read.ts'))
  assert.match(q, /rpc\(\s*'allergy_catalog_suggestions'/,
    'Die Funktion von C-503 wird nicht gerufen.')

  // `[read]` **Und es gibt keine zweite Liste hier** — kein
  // Wortschatz, keine Synonymtabelle, keine Uebersetzung. `[cmd]`
  // **`milchzucker` findet `Enthält Laktose`, weil die DATENBANK es
  // kann** (gemessen 2026-09-16, 1.021 Treffer ueber beide Woerter).
  assert.doesNotMatch(q, /contains_lactose|milchzucker|laktose/i,
    'Hier steht ein eigener Wortschatz — das ist die nachgebaute '
    + 'Vorschlagsfunktion, die der Auftrag verbietet.')
})

test('A4: die Kataloglucke wird durchgereicht, nicht hier formuliert', () => {
  // **Tom:** *„Medikament meldet die Kataloglueke — sag es dem
  // Nutzer, statt ins Leere zu suchen."*
  //
  // `[cmd]` **C-503 liefert den Wortlaut selbst** (`notice`):
  // *„Kein Medikamentenkatalog mit Allergie-Verknuepfung vorhanden…"*
  // — **gemessen auf dem Schirm 2026-09-16.**
  //
  // `[read]` **Ein zweiter Wortlaut in der Oberflaeche waere Drift** —
  // wer ihn aendern will, aendert C-503.
  const q = ohneKommentare(lies('lib/allergien/vorschlaege-read.ts'))
  assert.match(q, /notice/,
    'Der Hinweis der Funktion wird nicht gelesen.')
  assert.doesNotMatch(q, /Medikamentenkatalog/,
    'Der Lueckentext steht hier ausgeschrieben — dann driftet er '
    + 'gegen C-503.')
})

test('A5: eine Zeile ohne Code ist kein leerer Eintrag', () => {
  // `[cmd]` **Bei `medikament` kommt EINE Zeile ohne `catalog_code`,
  // aber mit `notice`.** `[read]` **Wuerde sie als Vorschlag
  // gelistet, koennte man eine Abwesenheit anklicken** — und der
  // Trigger von C-503 wiese sie ab.
  const q = ohneKommentare(lies('lib/allergien/vorschlaege-read.ts'))
  assert.match(q, /if\s*\(!code\)\s*return\s*\[\]/,
    'Zeilen ohne Katalogcode werden nicht ausgesondert.')
})

// ══ 3 — der Code wird gewaehlt, nicht gebildet ══════════════════════

test('A6: legeAllergieAn bildet den stoff_code NICHT mehr selbst', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **Hier stand `stoff_code: stoffCode(text)`.** Seit C-503
  // prueft ein Trigger die Spalte gegen den Katalog der Art:
  //
  //     stoff_code IS NULL                   -> geht durch
  //     stoff_code aus dem Katalog           -> geht durch
  //     stoff_code 'nutrition:gibt_es_nicht' -> EXCEPTION
  //
  // `[cmd]` **„Enthält Laktose" waere zu `enthält_laktose` geworden**
  // — also genau der dritte Fall, und die Zeile haette die Datenbank
  // nicht mehr angenommen.
  const q = ohneKommentare(lies('lib/allergien/allergie-read.ts'))
  assert.doesNotMatch(q, /stoff_code:\s*stoffCode\(/,
    'Der Code wird wieder aus dem Text gebildet — der Trigger von '
    + 'C-503 weist solche Zeilen ab.')
  assert.match(q, /stoff_code:\s*e\.stoff_code/,
    'Der gewaehlte Katalogcode wird nicht durchgereicht.')
})

test('A7: der Schreibweg reicht den Code von der Kachel bis zur Tabelle', () => {
  // `[read]` **Drei Stationen, und eine Luecke reicht** — faellt der
  // Code unterwegs weg, wird jede Auswahl still zu Freitext, und die
  // Kachel verspricht einen Schutz, den die Zeile nicht hat.
  const kachel = ohneKommentare(lies('app/v2/settings/allergien-kachel.tsx'))
  const aktion = ohneKommentare(lies('app/v2/settings/allergie-aktionen.ts'))
  const schreib = ohneKommentare(lies('lib/allergien/allergie-read.ts'))

  assert.match(kachel, /stoff_code:\s*gewaehlt\?\.code/,
    'Die Kachel schickt den gewaehlten Code nicht mit.')
  assert.match(aktion, /stoff_code\?:\s*string\s*\|\s*null/,
    'Die Serveraktion nimmt keinen Code entgegen.')
  assert.match(schreib, /stoff_code\?:\s*string\s*\|\s*null/,
    'Der Schreibweg nimmt keinen Code entgegen.')
})

test('A8: die Art wechselt den Katalog — und loest die Auswahl', () => {
  // **Tom:** *„user gibt ein, ob es um nahrung/supplement/medikament
  // geht, dementsprechend wissen wir, welche produktkataloge SSOT
  // sind."*
  //
  // `[read]` **Ein `nutrition:`-Code unter `supplement` waere ein
  // Code der falschen Art** — der Trigger von C-503 wiese ihn ab.
  const q = ohneKommentare(lies('app/v2/settings/allergien-kachel.tsx'))
  const beiArtwechsel = q.slice(q.indexOf('setArt(e.target.value'))
    .slice(0, 400)
  assert.match(beiArtwechsel, /setGewaehlt\(null\)/,
    'Beim Wechsel der Art bleibt der Code der alten Art stehen.')

  // Und die Art geht an die Funktion — sonst waere die Frage adresslos.
  assert.match(q, /art=\$\{encodeURIComponent/,
    'Die Art wird nicht mitgefragt.')
})

// ══ 4 — tabellarisch, eine Spalte ═══════════════════════════════════

test('A9: das Anlegen ist ein Raster, keine flex-Reihe', () => {
  // **Tom:** *„kann man tabellarisch schoener machen, dass die
  // eingabe schoen alles in derselben spalte erfolgt."*
  //
  // `[cmd]` **Gemessen auf dem Schirm 2026-09-16:** alle fuenf Felder
  // beginnen bei x=379. **Hier wird die Mechanik bewacht, die das
  // leistet** — eine feste Beschriftungsspalte und `1fr` daneben.
  const css = fs.readFileSync(
    path.join(WEB, 'src', 'app', 'globals.css'), 'utf8')
  const regel = css.slice(css.indexOf('.v2-allergie-zeile-neu {'))
    .slice(0, 400)
  assert.match(regel, /grid-template-columns:\s*\d+px\s+1fr/,
    'Die Zeile hat keine feste Beschriftungsspalte — dann bestimmt '
    + 'das laengste Wort die Kante.')

  // `[read]` **Und die alte flex-Reihe ist WEG** — nicht
  // ueberschrieben, sondern ersetzt.
  const form = css.slice(css.indexOf('.v2-allergie-form {')).slice(0, 300)
  assert.match(form, /display:\s*grid/,
    'Das Anlegen ist wieder eine flex-Reihe.')
})

test('A10: kein <form> im <form>', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **Seit A1 steht die Kachel in der Spalte des
  // Profilformulars** — also INNERHALB von dessen `<form>`.
  // **Ein `<form>` im `<form>` ist ungueltiges HTML:** der Browser
  // zieht das innere beim Einlesen heraus, der Server liefert es
  // verschachtelt.
  //
  // `[cmd]` **Gemessen: neun `Hydration failed` je Seitenaufruf**,
  // danach null.
  const q = ohneKommentare(lies('app/v2/settings/allergien-kachel.tsx'))
  assert.doesNotMatch(q, /<form/,
    'Die Kachel baut wieder ein <form> — im Profilformular ist das '
    + 'verschachtelt, und die Seite verliert die Hydration.')

  // `[read]` **Was das `<form>` geleistet hat, muss ersetzt sein** —
  // sonst verliert die Kachel die Eingabetaste.
  assert.match(q, /e\.key\s*!==\s*'Enter'|e\.key\s*===\s*'Enter'/,
    'Ohne <form> und ohne Enter-Behandlung ist die Eingabetaste weg.')
})

// ══ 5 — die Zahlen kommen aus der Datenbank ═════════════════════════

test('A11: die Trefferzahlen werden nicht herueberkopiert', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **Ein erster Entwurf blaetterte 57 Runden a 1.000 Zeilen**
  // (`magnesium_stearate` trifft 56.948 Produkte) **und zaehlte sie
  // im Javascript:**
  //
  //     mit den Zahlen        27.677 / 27.696 / 27.775 ms
  //     Gegenprobe ohne sie      774 /    728 /    718 ms
  //     danach                 2.076 /  2.166 /  3.340 ms
  //
  // `[read]` **`head: true` schickt keine Zeilen, `count: 'exact'`
  // gibt die Zahl** — gezaehlt wird dort, wo die Zeilen liegen.
  const q = ohneKommentare(lies('lib/allergien/vorschlaege-read.ts'))
  assert.match(q, /head:\s*true/,
    'Die Zahlen werden wieder mit den Zeilen herueberkopiert.')
  assert.match(q, /count:\s*'exact'/,
    'Ohne exakte Zaehlung ist die Zahl geraten.')

  // `[read]` **Und kein Blaettern mehr** — `range` waere der
  // Rueckfall in die 27 Sekunden.
  assert.doesNotMatch(q, /\.range\(/,
    'Es wird wieder geblaettert — das war der 27-Sekunden-Weg.')
})

test('A12: eine fehlende Zahl ist keine Null', () => {
  // `[read]` **Eine `0` saehe aus wie *„trifft nichts"*** — und das
  // ist eine andere Aussage als *„nicht gemessen"* (E-72).
  const q = ohneKommentare(lies('lib/allergien/vorschlaege-read.ts'))
  assert.doesNotMatch(q, /zahlen\[[^\]]+\]\s*=\s*0\b/,
    'Eine fehlende Zahl wird auf 0 gesetzt — das behauptet '
    + '„trifft nichts".')

  const kachel = ohneKommentare(lies('app/v2/settings/allergien-kachel.tsx'))
  assert.match(kachel, /typeof\s+treffer\[[^\]]+\]\s*===\s*'number'/,
    'Die Kachel unterscheidet nicht zwischen „keine Zahl" und 0.')
})

// ══ 6 — die Kontrollprobe ═══════════════════════════════════════════

test('A13: KONTROLLE — das blosse Wort macht keine Probe rot', () => {
  // `[read]` **Ohne diese Probe misst die Reihe oben nur, dass jemand
  // die Datei angefasst hat** (Lehre aus G-460).
  //
  // **Hier steht `<form`, `stoffCode(`, `.range(` und
  // `Medikamentenkatalog` als blosser Text** — in einer Zeichenkette,
  // nicht als Mechanik. **Die Proben oben duerfen davon nichts
  // merken, weil sie die DATEIEN lesen, nicht diese.**
  const harmlos = '<form stoffCode( .range( Medikamentenkatalog'
  assert.ok(harmlos.includes('<form'),
    'Die Kontrollprobe selbst ist kaputt.')
  assert.ok(ohneKommentare('// <form\ncode').indexOf('<form') === -1,
    'ohneKommentare entfernt Zeilenkommentare nicht — dann finden '
    + 'die Proben ihre eigenen Erklaertexte.')
  assert.ok(ohneKommentare('{/* <form */}\ncode').indexOf('<form') === -1,
    'ohneKommentare entfernt JSX-Kommentare nicht.')
})
