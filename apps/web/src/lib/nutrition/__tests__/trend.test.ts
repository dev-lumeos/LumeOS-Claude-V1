// G-249: der Trend — Linie, Luecken, Skala, Richtung.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  fensterbreite, gleitend, richtungVon, RICHTUNG_TEXT, RICHTUNG_SCHWELLE,
  sparklinePfad, bezugsY, bulletVon, zeigtTrend,
  type Tagespunkt,
} from '../trend'

const p = (tag: string, wert: number | null): Tagespunkt => ({ tag, wert })

// ── Regel 1: Luecken ueberbruecken, nicht erfinden ───────────────

test('G-249: der gleitende Mittelwert ueberbrueckt einen fehlenden Tag', () => {
  // **Tom:** „selbst wenn mal tage fehlen kann man einen trend
  // darstellen." `[read]` Der fehlende Tag bekommt einen Wert aus
  // seinen Nachbarn — das ist eine Aussage ueber den Zeitraum, keine
  // erfundene Tagesmessung.
  const g = gleitend([p('1', 10), p('2', null), p('3', 20)], 3)
  assert.equal(g[1].wert, 15, 'Die Luecke wird nicht uebersprungen (G-249).')
  assert.equal(g.length, 3)
})

test('G-249: ein Tag ohne jeden Nachbarn bleibt ohne Wert', () => {
  // `[read]` **Die Grenze der Ueberbrueckung:** wo nichts ist, wird
  // nichts erfunden.
  const g = gleitend([p('1', null), p('2', null), p('3', null)], 3)
  assert.deepEqual(g.map(x => x.wert), [null, null, null])
})

test('G-249: die Fensterbreite waechst mit dem Zeitraum', () => {
  // `[read]` Sonst zappelt die 90-Tage-Linie wie die 7-Tage-Linie.
  assert.equal(fensterbreite(7), 3)
  assert.equal(fensterbreite(30), 7)
  assert.equal(fensterbreite(90), 14)
})

// ── Regel 2: nicht bei Null beginnen ─────────────────────────────

test('G-249: die Sparkline beginnt nicht bei Null', () => {
  // `[cmd]` **Vitamin A schwankt auf dev zwischen 9,6 und 5.865 µg.**
  // `[read]` Mit Nullbasis laegen zehn von zwoelf Tagen im untersten
  // Zehntel — die Bewegung waere unsichtbar.
  const nah = [p('1', 1000), p('2', 1010), p('3', 1005)]
  const pfad = sparklinePfad(nah, 100, 20, null)
  // `[cmd]` `matchAll` faellt auf dem TS-Ziel dieses Pakets durch
  // (G-122, G-210) — deshalb eine `exec`-Schleife.
  const ys: number[] = []
  const muster = /[ML][\d.]+,([\d.]+)/g
  let t: RegExpExecArray | null
  while ((t = muster.exec(pfad)) !== null) ys.push(Number(t[1]))
  const spanne = Math.max(...ys) - Math.min(...ys)
  assert.ok(spanne > 5,
    `Die Linie ist flachgedrueckt (Spanne ${spanne}) — Nullbasis? (G-249)`)
})

test('G-249: eine flache Reihe teilt nicht durch null', () => {
  const pfad = sparklinePfad([p('1', 5), p('2', 5), p('3', 5)], 100, 20, null)
  assert.ok(pfad.length > 0)
  assert.doesNotMatch(pfad, /NaN|Infinity/)
})

test('G-249: das Ziel gehoert ins Bild, wenn es eines gibt', () => {
  // `[read]` Sonst zeigt die Linie eine Bewegung ohne Bezug.
  const y = bezugsY([{ wert: 10 }, { wert: 20 }], 20, 15)
  assert.ok(y !== null && y >= 0 && y <= 20)
  assert.equal(bezugsY([{ wert: 10 }, { wert: 20 }], 20, null), null)

  // `[read]` **Der Kern: ein Ziel AUSSERHALB der Werte muss die
  // Skala dehnen** — sonst laege die Ziellinie ausserhalb des
  // Bildes, und der Betrachter haelt den hoechsten Punkt fuer das
  // Ziel. Erste Fassung prueste nur `0 <= y <= hoehe`, und das gilt
  // auch ohne Dehnung.
  const ohneZiel = sparklinePfad([p('1', 10), p('2', 20)], 100, 20, null)
  const mitZiel = sparklinePfad([p('1', 10), p('2', 20)], 100, 20, 200)
  assert.notEqual(ohneZiel, mitZiel,
    'Ein Ziel weit ueber den Werten aendert die Skala nicht (G-249).')
  const yWeit = bezugsY([{ wert: 10 }, { wert: 20 }], 20, 200)
  assert.ok(yWeit !== null && yWeit >= 0 && yWeit <= 20,
    'Die Ziellinie liegt ausserhalb des Bildes (G-249).')
})

test('G-249: unter zwei Punkten gibt es keine Linie', () => {
  assert.equal(sparklinePfad([p('1', 5)], 100, 20, null), '')
  assert.equal(sparklinePfad([], 100, 20, null), '')
})

// ── Regel 3: gleiche Skalierung ueber die Zeilen ─────────────────

test('G-249: der Bullet skaliert relativ zum Ziel, nicht absolut', () => {
  // `[read]` **So bedeutet dieselbe Position in jeder Zeile
  // dasselbe** — bei Vitamin A in µg wie bei Protein in g. Eine
  // geteilte ABSOLUTE Achse waere hier unbrauchbar: die Gruppen
  // mischen µg und g.
  const a = bulletVon(50, 100, null)   // halbes Ziel
  const b = bulletVon(5000, 10000, null)
  assert.ok(a && b)
  assert.ok(Math.abs(a.wert - b.wert) < 1e-9,
    'Halbes Ziel muss in jeder Groessenordnung gleich aussehen (G-249).')
})

test('G-249: ein Wert ueber der Obergrenze laeuft nicht aus dem Bild', () => {
  const b = bulletVon(5000, 750, 3000)
  assert.ok(b)
  assert.ok(b.wert <= 1, 'Der Balken laeuft ueber den Rand (G-249).')
  assert.ok(b.obergrenze !== null && b.obergrenze < b.wert,
    'Die Obergrenze muss vor dem Wert liegen (G-249).')

  // `[read]` **Der Deckel muss auch greifen, wenn der Wert die Skala
  // sprengt.** Erste Fassung kam durch, weil `max` aus dem Wert
  // selbst gebildet wird — der Deckel wurde nie geprueft. Hier ist
  // die Obergrenze der groesste Kandidat, der Wert liegt darunter.
  const knapp = bulletVon(2999, 750, 3000)
  assert.ok(knapp && knapp.wert <= 1 && knapp.wert > 0)
  // Und ein Wert, der ueber ALLEM liegt, bleibt im Rahmen.
  const drueber = bulletVon(99999, 750, 3000)
  assert.ok(drueber && drueber.wert <= 1,
    'Ein extremer Wert sprengt den Balken (G-249).')
})

test('G-249: ohne Wert kein Bullet', () => {
  assert.equal(bulletVon(null, 100, 200), null)
  assert.equal(bulletVon(0, 0, 0), null)
})

// ── Die Richtung ─────────────────────────────────────────────────

test('G-249: die Richtung kommt aus Haelften, nicht aus Endpunkten', () => {
  // `[read]` **Ein Ausreisser am Rand darf die Richtung nicht
  // umdrehen.** Die erste Fassung prueste nur `!== 'faellt'` — und
  // eine Endpunkt-Rechnung liefert hier zufaellig `steigt`. Deshalb
  // zwei Reihen, die sich in den ENDPUNKTEN gleichen und in den
  // HAELFTEN unterscheiden.
  const steigend = richtungVon([p('1', 10), p('2', 10), p('3', 40), p('4', 40), p('5', 20)])
  const fallend = richtungVon([p('1', 10), p('2', 40), p('3', 40), p('4', 10), p('5', 20)])
  assert.equal(steigend, 'steigt')
  assert.equal(fallend, 'faellt')
  assert.notEqual(steigend, fallend,
    'Beide Reihen beginnen mit 10 und enden mit 20 — nur die Haelften '
    + 'unterscheiden sie (G-249).')
})

test('G-249: steigt, faellt, steht', () => {
  assert.equal(richtungVon([p('1', 10), p('2', 10), p('3', 30), p('4', 30)]), 'steigt')
  assert.equal(richtungVon([p('1', 30), p('2', 30), p('3', 10), p('4', 10)]), 'faellt')
  assert.equal(richtungVon([p('1', 20), p('2', 20), p('3', 20), p('4', 20)]), 'steht')
})

test('G-249: unter vier Tagen keine Richtung', () => {
  // `[read]` Drei Punkte ergeben keine Aussage ueber einen Trend.
  assert.equal(richtungVon([p('1', 10), p('2', 20), p('3', 30)]), 'unbekannt')
  assert.equal(RICHTUNG_TEXT.unbekannt, 'zu wenige Tage')
})

test('G-249: kleine Schwankungen heissen „steht"', () => {
  // `[read]` Die Schwelle ist keine Bewertung, sondern die Grenze
  // zum Rauschen. Wer sie enger zieht, meldet jeden Tag eine neue
  // Richtung.
  assert.equal(RICHTUNG_SCHWELLE, 0.05)
  assert.equal(richtungVon([p('1', 100), p('2', 100), p('3', 102), p('4', 102)]), 'steht')
})

// ── Wann ueberhaupt ──────────────────────────────────────────────

test('G-249: ein Tag hat keinen Trend', () => {
  assert.equal(zeigtTrend(1), false)
  for (const z of [7, 30, 90]) assert.equal(zeigtTrend(z), true, String(z))
})

// ── Die Anzeige haelt sich daran ─────────────────────────────────

const ohneKommentare = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

test('G-249: der Reiter rendert nur noch EINE Ansicht', () => {
  // `[cmd]` **Der Kern des Auftrags.** Vorher standen `MikroAnsicht`
  // und `NaehrstoffOrdnungTab` uebereinander.
  //
  // `[read]` **Gezaehlt, nicht nach einem Namen gesucht** — die
  // erste Fassung prueste auf `<MikroAnsicht`, und ein beliebiger
  // anderer Platzhalter kam durch. Im `nutrients`-Zweig darf genau
  // EINE Ansichtskomponente stehen.
  const s = ohneKommentare('src/app/v2/nutrition/ansicht.tsx')
  // `[read]` **Anker auf `return`, nicht auf `if`** — eine Sabotage,
  // die einen Platzhalter VOR den Bedingungsblock setzt, laege sonst
  // ausserhalb des gemessenen Ausschnitts. Genau so ist sie beim
  // ersten Versuch durchgekommen.
  const zweig = /if \(tab === 'nutrients'\)[\s\S]*?return \(([\s\S]*?)\n {4}\)/.exec(s)
  assert.ok(zweig, 'Der nutrients-Zweig wurde nicht gefunden (G-249).')
  const komponenten = zweig[1].match(/<[A-Z][A-Za-z]+/g) ?? []
  // `[cmd]` **G-365: die Mockup-Referenz ist ausgenommen.**
  //
  // `[read]` **Sie ist keine zweite IST-Ansicht** — sie steht unter
  // der Trennlinie und traegt an jeder Kachel eine Attrappenmarke.
  // **Genau diese Gegenueberstellung verlangt E-69**; sie zu
  // verbieten hiesse, den Vergleich zu verbieten.
  //
  // `[read]` **Die Regel bleibt scharf:** ausgenommen ist EIN Name,
  // nicht ein Muster. Eine zweite echte Ansicht faellt weiter auf.
  const ansichten = komponenten.filter(
    k => !/^<(Leer|Icon|Card|Pill|Link)/.test(k)
      && k !== '<NutritionNutrientsReferenz')
  assert.deepEqual(ansichten, ['<NaehrstoffOrdnungTab'],
    `Der Reiter rendert ${ansichten.length} Ansichten statt einer: `
    + `${ansichten.join(', ')} (G-249).`)

  // `[read]` **Und kein zweiter Ansichtsblock daneben.** Ein
  // Platzhalter aus Kleinbuchstaben-Elementen (`<div>`) traegt keinen
  // Grossbuchstaben und rutscht durch die Komponentenzaehlung —
  // deshalb zusaetzlich gegen den bekannten Namen geprueft.
  assert.doesNotMatch(zweig[1], /MikroAnsicht|Mikro-?Platzhalter/,
    'Ein zweiter Ansichtsblock steht wieder im Zweig (G-249).')
})

test('G-249: der Trend erscheint nicht im Tagesmodus', () => {
  const s = ohneKommentare('src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx')
  assert.match(s, /zeigtTrend\(/,
    'Die Ordnung fragt nicht, ob ein Trend gezeigt wird (G-249).')
})

test('G-249: die Ordnung zeichnet keine Tagesbalken mehr', () => {
  // **Tom:** „es geht um trends und nicht einzelne tagesbalken."
  //
  // `[read]` **Am Einbau geprueft, nicht am Vorkommen der Funktion**
  // — die erste Fassung suchte `sparklinePfad(`, und das steht auch
  // in einer Komponente, die niemand rendert.
  const s = ohneKommentare('src/app/v2/nutrition/naehrstoff-ordnung-tab.tsx')
  assert.match(s, /sparklinePfad\(/, 'Die Sparkline fehlt (G-249).')
  assert.match(s, /<Sparkline\s+k=\{k\}\s+fenster=\{fenster\}/,
    'Die Sparkline wird nicht in die Zeile gerendert (G-249).')
})
