// Die Punktmarkierung der Auswahl-Kacheln (G-166).
//
// ── WARUM DIESE PRUEFUNG ────────────────────────────────────────
//
// `[cmd]` **Der Punkt haengt allein an `data-on`.** In `v2.css:1402`:
//
//     .v2-wahl[data-on="true"] .v2-wahl-punkt {
//       border-color: var(--acc); background: var(--acc);
//     }
//
// `[cmd]` **Der Erfahrungsgrad hatte es nicht** — er setzte einen
// eigenen Inline-Stil auf Rand und Hintergrund. Die Kachel sah
// gewaehlt aus, **der Punkt blieb leer.** `activity_level` daneben
// hat `data-on` seit jeher, und dort rastet er sichtbar ein.
//
// `[read]` Zwei Bauarten fuer dieselbe Sache — deshalb fiel es an der
// einen auf und an der anderen nie. Diese Pruefung schlaegt an, wenn
// eine Auswahl-Kachel `v2-wahl` benutzt und `data-on` weglaesst.
//
// `[read]` **Warum am Quelltext und nicht im Browser:** Die Regel ist
// „jeder `v2-wahl`-Knopf traegt `data-on`". Das ist eine Aussage ueber
// den Bauplan, nicht ueber einen Zustand — sie gilt fuer alle vier
// Stufen zugleich und braucht keine Sitzung.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const FORMULAR = path.join(process.cwd(), 'src/app/v2/settings/formular.tsx')

test('jeder v2-wahl-Knopf traegt data-on — sonst bleibt der Punkt leer', () => {
  const quelle = fs.readFileSync(FORMULAR, 'utf8')

  // `[read]` **Ein Fenster fester Laenge taugt nicht:** Beim Rueckbau
  // zur Gegenprobe hat es das `data-on` des NACHBARKNOPFES mitgelesen
  // und die Pruefung faelschlich gruen gemeldet. Deshalb wird je Knopf
  // genau bis zum naechsten `className="v2-wahl"` bzw. bis zum Ende
  // geschnitten — kein Block sieht in den anderen hinein.
  const stellen: number[] = []
  const suche = /className="v2-wahl"/g
  let m: RegExpExecArray | null
  while ((m = suche.exec(quelle)) !== null) stellen.push(m.index)

  assert.equal(stellen.length, 2,
    `Erwartet genau zwei v2-wahl-Knoepfe (Aktivitaet und Erfahrungsgrad), `
    + `gefunden ${stellen.length}. Kommt einer dazu, gehoert er hier hinein.`)

  const knoepfe = stellen.map((von, i) =>
    quelle.slice(von, stellen[i + 1] ?? quelle.length))

  knoepfe.forEach((block, i) => {
    // `[read]` **Ohne Kommentarzeilen pruefen.** Der erste Entwurf
    // suchte nur `data-on=` und fand es im eigenen Kommentar darueber
    // — die Pruefung bestaetigte sich selbst. Gegengeprobt am
    // 2026-08-22: sie blieb gruen, obwohl das Attribut weg war.
    const ohneKommentare = block.replace(/\/\/[^\n]*/g, '')
    assert.match(ohneKommentare, /\bdata-on=\{/,
      `v2-wahl-Knopf ${i + 1} hat kein \`data-on={…}\`. `
      + 'Ohne das faerbt `.v2-wahl[data-on="true"] .v2-wahl-punkt` nicht — '
      + 'die Kachel sieht gewaehlt aus, der Punkt bleibt leer (G-166).')
  })
})

test('der Erfahrungsgrad faerbt nicht mehr per Inline-Stil', () => {
  const quelle = fs.readFileSync(FORMULAR, 'utf8')
  // `[cmd]` Der frueherer Stil setzte `borderColor` mit `--acc` direkt
  // am Knopf. Faerbt jemand wieder so, ist der Punkt wieder aussen vor.
  const i = quelle.indexOf('EXPERIENCE_LEVELS.map')
  assert.ok(i > 0, 'Der Erfahrungsgrad-Block wurde nicht gefunden.')
  const block = quelle.slice(i, i + 1400)
  assert.ok(!/borderColor:\s*'color-mix\(in oklch, var\(--acc\)/.test(block),
    'Der Erfahrungsgrad faerbt wieder per Inline-Stil statt ueber `data-on`. '
    + 'Der Punkt bleibt dann leer (G-166).')
})

test('der Kommentar behauptet die Spalte nicht mehr als fehlend', () => {
  const quelle = fs.readFileSync(FORMULAR, 'utf8')
  // `[cmd]` Gemessen am 2026-08-22: `public.profiles` fuehrt 15 Spalten,
  // die fuenfzehnte ist `experience_level` (angelegt in C-140).
  assert.ok(!quelle.includes('DIE SPALTE GIBT ES NOCH NICHT'),
    'Der Kommentar behauptet wieder, `experience_level` fehle. '
    + 'Sie ist seit C-140 da (gemessen 2026-08-22: 15 Spalten).')
  assert.ok(!/`public\.profiles` fuehrt 14 Spalten/.test(quelle),
    'Der Kommentar nennt wieder 14 Spalten. Es sind 15.')
})
