// G-492 — Hinzufuegen ist eine Aktion, keine Detailseite.
//
// **Tom, 2026-09-08:** *„es ist nicht die richtige richtung, dass man
// ein produkt oeffnen muss, dann runterscrollen, um irgendwo
// hinzuzufuegen. es ist eine aktion, und aktionen sollten wir mit
// modals loesen"*
//
// **Und:** *„in die auflistung als zweithinterste spalte action rein
// ... und wohin/wieviel etc gehoert ins modal"*
//
// `[cmd]` **Gemessen VOR dem Umbau** (`tools/_g492-vorher.mjs`):
//
//     Substanz  Leiste y=560   Knopf y=1228   -> 668 px darunter
//     Produkt   keine Leiste   Aktion y=1625  -> ausserhalb
//
// `[read]` **Beide Male musste man scrollen, um etwas hinzuzufuegen.**
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import {
  produktReiter, ersterProduktReiter, WARTET_AUF,
} from '../produkt-reiter-lage'
import { vorschauSatz } from '../produkt-aktion-lage'

const SRC = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

const TAFEL = 'app/v2/supplements/produkt-tafel.tsx'
const LISTE = 'app/v2/supplements/tab-produkte.tsx'
const SUBSTANZ = 'app/v2/supplements/substanz-tafel.tsx'
const AKTION = 'app/v2/supplements/produkt-aktion.tsx'
const LEISTE = 'app/v2/supplements/tafel-reiterleiste.tsx'

test('G-492/A15: vier Reiter, in Toms Reihenfolge', () => {
  // **Tom:** *„ueberblick und inhaltsstoffe auf den ersten reiter,
  // das ist was man sehen will"* — **und:** *„plus einen reiter fuer
  // die etikette"*.
  const r = produktReiter({ etikettZeilen: 25 })
  assert.deepEqual(r.map(x => x.id),
    ['ueberblick', 'anwendung', 'hinweise', 'etikett'])
  assert.deepEqual(r.map(x => x.titel),
    ['Überblick', 'Anwendung', 'Hinweise', 'Etikett'])
})

test('G-492/A15: alle vier stehen IMMER, auch die wartenden', () => {
  // `[read]` **Ein Reiter, der erst erscheint, wenn C-527 da ist,
  // verraet nicht, dass er kommt** — Tom verlangte *„einbauen und
  // ausdokumentieren"*, nicht *„einbauen, sobald"*.
  assert.equal(produktReiter({ etikettZeilen: 0 }).length, 4)
  assert.equal(produktReiter({ etikettZeilen: 999 }).length, 4)
})

test('G-492/A16: der erste Reiter ist der Ueberblick', () => {
  assert.equal(ersterProduktReiter(), 'ueberblick')
  // `[read]` **Er traegt die Zahl der Etikettzeilen** — die einzige
  // Menge, die man vorher wissen will.
  assert.equal(produktReiter({ etikettZeilen: 25 })[0].zahl, 25)
  // `[cmd]` **Ohne Zeilen KEINE Null** — eine hingeschriebene Null
  // saehe aus wie eine gemessene (C-107).
  assert.equal(produktReiter({ etikettZeilen: 0 })[0].zahl, null)
})

test('G-492/A17: Hinweise und Etikett sagen, WARUM sie leer sind', () => {
  // `[read]` **Die Lehre aus G-482 und G-486:** eine leere Flaeche
  // ohne Grund sieht aus wie ein Fehler — G-486 wurde VIERMAL
  // gemeldet.
  for (const w of ['hinweise', 'etikett'] as const) {
    const s = WARTET_AUF[w]
    assert.ok(s.satz.length > 20, `${w}: kein Satz`)
    assert.ok(/übernommen/.test(s.satz), `${w}: sagt nicht, dass etwas kommt`)
  }
})

test('G-492/A18: die Quelle und der Punkt sind dokumentiert', () => {
  for (const w of ['hinweise', 'etikett'] as const) {
    assert.equal(WARTET_AUF[w].punkt, 'C-527')
    assert.ok(WARTET_AUF[w].quelle.length > 10, `${w}: keine Quelle`)
  }
  // `[cmd]` **Die gemessenen Zahlen stehen dabei** — C-527 hat
  // `Precautions` 18.362 und `Formulation` 16.621 gezaehlt.
  assert.match(WARTET_AUF.hinweise.quelle, /Precautions/)
  assert.match(WARTET_AUF.etikett.quelle, /dsld\.od\.nih\.gov/)
})

test('G-492/A5: die Vorschau rechnet die Anzahl mit', () => {
  // `[cmd]` **Gemessen am Schirm:** Anzahl 1 -> *„ergibt 130 kcal,
  // 24 g Protein"*, Anzahl 2 -> *„260 kcal, 48 g Protein"*.
  const p = { enercc: 130, prot: 24 }
  assert.equal(vorschauSatz(p, '1'), 'ergibt 130 kcal, 24 g Protein')
  assert.equal(vorschauSatz(p, '2'), 'ergibt 260 kcal, 48 g Protein')
  // `[read]` **Komma als Dezimaltrenner** — die Oberflaeche ist
  // deutsch.
  assert.equal(vorschauSatz(p, '0,5'), 'ergibt 65 kcal, 12 g Protein')
})

test('G-492/A5: ohne Naehrwert keine hingeschriebene Null', () => {
  // `[read]` **Eine Null saehe aus wie ein gemessener Wert** — die
  // Lehre aus C-107: 258 Zeilen trugen das Literal `null`.
  assert.equal(vorschauSatz(null, '1'), null)
  assert.equal(vorschauSatz({ enercc: null, prot: null }, '1'), null)
  // `[cmd]` **Fehlt EIN Wert, fehlt er im Satz** — der andere bleibt.
  assert.equal(vorschauSatz({ enercc: 130, prot: null }, '1'), 'ergibt 130 kcal')
  assert.equal(vorschauSatz({ enercc: null, prot: 24 }, '1'), 'ergibt 24 g Protein')
})

test('G-492/A5: eine unbrauchbare Anzahl ergibt nichts', () => {
  const p = { enercc: 130, prot: 24 }
  for (const a of ['', '0', '-1', 'abc']) {
    assert.equal(vorschauSatz(p, a), null, `„${a}" ergibt einen Satz`)
  }
})

test('G-492/A1: der Knopf steht in der zweithintersten Spalte', () => {
  const q = ohneKommentare(lies(LISTE))
  // `[cmd]` **Gemessen am Schirm: 7 Spalten, Add an Index 5** —
  // zweithinterste. `[read]` **Hier wird die REIHENFOLGE geprueft:**
  // die Aktionszelle muss VOR der Detailzelle stehen.
  const add = q.indexOf('data-probe="zeile-add"')
  const detail = q.indexOf("{istOffen ? 'Zu' : 'Details'}")
  assert.ok(add > 0, 'Die Liste hat keinen Add-Knopf.')
  assert.ok(detail > 0, 'Die Liste hat keinen Details-Knopf.')
  assert.ok(add < detail,
    'Der Add-Knopf steht NACH dem Details-Knopf — nicht zweithinterste Spalte.')
})

test('G-492/A2: der Knopf oeffnet das Modal, nicht die Zeile', () => {
  const q = ohneKommentare(lies(LISTE))
  // `[read]` **`setAddZeile` statt `schalteZeile`** — ein Klick, der
  // die Tafel aufklappt, waere genau der Umweg, den Tom
  // abgeschafft haben will.
  assert.match(q, /data-probe="zeile-add"[\s\S]{0,220}setAddZeile/,
    'Der Add-Knopf klappt die Zeile auf, statt das Modal zu oeffnen.')
  // `[cmd]` **`stopPropagation`** — sonst klappte die Zeile mit auf.
  assert.match(q, /<td onClick=\{e => e\.stopPropagation\(\)\}>\s*<button[^>]*data-probe="zeile-add"/,
    'Der Klick schlaegt auf die Zeile durch.')
})

test('G-492/A7: das Modal baut den Schreibweg NICHT nach', () => {
  const q = ohneKommentare(lies(AKTION))
  const modal = q.slice(q.indexOf('export function ProduktAktionModal'))
  assert.ok(modal.length > 100, 'Das Modal fehlt.')
  // `[read]` **Die Huelle rendert `ProduktAktion`** — sie enthaelt
  // keine eigene Schreiblogik. `[cmd]` **Die Lehre aus G-478:**
  // zweimal derselbe Rest heisst, den Fehler zweimal zu pflegen.
  assert.match(modal, /<ProduktAktion\b/,
    'Das Modal rendert `ProduktAktion` nicht — der Schreibweg ist nachgebaut.')
  assert.doesNotMatch(modal, /fetch\(/,
    'Das Modal schreibt selbst — der Schreibweg ist doppelt.')
})

test('G-492/A12: die Aktion steht IN der Reiterleiste', () => {
  // `[read]` **Nicht unten, nicht im Abschnitt** — sichtbar, egal
  // welcher Reiter offen ist. `[cmd]` **Gemessen: in allen vier
  // Reitern `addSichtbar: true`.**
  //
  // ══ WAS DIESE ZUSICHERUNG PRUEFT ══════════════════════════════
  //
  // `[cmd]` **Ein erster Entwurf suchte nur die NAEHE:**
  // `<TafelReiterleiste[\s\S]{0,600}substanz-add`. `[cmd]` **Die
  // Sabotageprobe blieb gruen**, weil `substanz-add` ein PRAEFIX von
  // `substanz-addX` ist — **und weil Naehe im Quelltext nichts
  // ueber die Verschachtelung sagt.**
  //
  // `[read]` **Gemessen wird deshalb der PROP:** der Knopf muss im
  // `aktion={…}` der Leiste stehen. **Nimmt ihn jemand da heraus,
  // faellt die Zusicherung** — egal, wo er danach landet.
  //
  // ══ G-493/N5: DIE PRODUKT-TAFEL TRAEGT IHN NICHT MEHR ═══════
  //
  // **Tom, 2026-09-08:** *„dann erweitert gleich darunter derselbe
  // button? dann kann man es gleich weglassen"*
  //
  // `[cmd]` **Gemessen: die Tafel klappt DIREKT unter ihrer Zeile
  // auf**, und die Zeile traegt den Knopf seit G-492/A1 — **zwei
  // gleiche Knoepfe untereinander.**
  //
  // `[read]` **Die Zusicherung gilt weiter fuer die SUBSTANZ-Tafel**
  // (A13: der Knopf wanderte dort von unten nach oben). `[read]`
  // **Fuer die Produkt-Tafel ist sie umgedreht** — und das wird
  // ebenfalls geprueft, sonst kaeme der zweite Knopf still zurueck.
  for (const [datei, probe] of [[SUBSTANZ, 'substanz-add']]) {
    const q = ohneKommentare(lies(datei))
    const i = q.indexOf('<TafelReiterleiste')
    assert.ok(i >= 0, `${datei}: keine geteilte Reiterleiste.`)
    // `[read]` **Von `aktion={` bis zum Ende des Aufrufs** — dazwischen
    // muss die Marke liegen.
    const block = q.slice(i, q.indexOf('/>', i))
    const j = block.indexOf('aktion={')
    assert.ok(j >= 0, `${datei}: die Leiste bekommt keine Aktion.`)
    assert.ok(block.slice(j).includes(`data-probe="${probe}"`),
      `${datei}: „${probe}" steht nicht in der Aktion der Reiterleiste.`)
  }

  // `[cmd]` **G-493/N5: und die Produkt-Tafel traegt KEINEN.**
  const t = ohneKommentare(lies(TAFEL))
  assert.doesNotMatch(t, /data-probe="produkt-add"/,
    'Die Produkt-Tafel hat wieder einen eigenen Knopf — er steht schon in der Zeile (N5).')
})

test('G-492/A13: die Substanz-Aktion steht NICHT mehr am Fuss', () => {
  const q = ohneKommentare(lies(SUBSTANZ))
  // `[cmd]` **Gemessen: der Knopf lag bei y=1228, die Leiste bei
  // y=560** — 668 px darunter, ausserhalb des Schirms.
  //
  // `[read]` **Die Fusszeile ist GELOESCHT, nicht kopiert** — stuende
  // der Knopf an beiden Stellen, waere die untere weiter der Grund
  // zum Scrollen.
  assert.doesNotMatch(q, /borderTop: '1px solid var\(--border\)'[\s\S]{0,300}Zum Stack hinzuf/,
    'Die alte Fusszeile mit dem Knopf steht wieder da.')
  const treffer = q.match(/Zum Stack hinzuf/g) ?? []
  assert.equal(treffer.length, 1,
    `„Zum Stack hinzufuegen" steht ${treffer.length}-mal — er soll genau einmal stehen.`)
})

test('G-492/A14: beide Tafeln nutzen DIESELBE Bauform', () => {
  for (const datei of [TAFEL, SUBSTANZ]) {
    const q = ohneKommentare(lies(datei))
    assert.match(q, /import \{ TafelReiterleiste \} from '\.\/tafel-reiterleiste'/,
      `${datei}: benutzt die geteilte Reiterleiste nicht.`)
  }
  // `[read]` **Und die alte Abschrift ist weg** — ein Rueckfall
  // laedt dazu ein, die eine zu aendern und die andere zu vergessen
  // (G-163). `[cmd]` **So sind drei Abschriften entstanden.**
  const q = ohneKommentare(lies(SUBSTANZ))
  assert.doesNotMatch(q, /export function Reiterleiste\b/,
    'Die alte Abschrift der Reiterleiste steht wieder in `substanz-tafel.tsx`.')
})

test('G-492/A12: die Leiste zeigt sich auch mit EINEM Reiter', () => {
  const q = ohneKommentare(lies(LEISTE))
  // `[cmd]` **Die Abschriften trugen `reiter.length <= 1 -> null`.**
  // `[read]` **Mit der Aktion in der Leiste waere sie damit bei
  // einem einzigen Reiter unsichtbar** — genau der Fehler, den der
  // Auftrag behebt.
  assert.doesNotMatch(q, /reiter\.length <= 1/,
    'Die Leiste verschwindet bei einem Reiter — dann fehlt die Aktion.')
  assert.match(q, /reiter\.length === 0 && !aktion/,
    'Die Leiste prueft nicht, ob sie eine Aktion traegt.')
})
