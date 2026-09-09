// Die Beschriftung der Koerperkarte — G-396.
//
// **Tom, 2026-09-09:** *„ja karte ist da, aber nicht lesbar. ich hab
// gesagt: die beschriftung weiter ausserhalb lesbar und mit feinen
// linien auf den punkt zeigen."*
//
// `[cmd]` **Vorher stand der Text 28 px UNTER dem Punkt und mittig
// darauf** (`y + r + 28`, `textAnchor="middle"`) — Deltoid und
// Vastus lateralis ueberlappten, und `vg`/`glute` liegen nur 0.04
// auseinander.
//
// ══ WARUM DIESER TEST IN `apps/web` STEHT ═══════════════════════════
//
// `[read]` **`packages/ui` fuehrt keine Tests** — kein `__tests__`,
// keine Einbindung. **Einen Testlauf dort einzurichten waere ein
// eigener Auftrag**, also prueft dieser Test die Quelle von hier aus.
// `[read]` **Die Lage am Schirm ist getrennt gemessen** (10
// Beschriftungen, 10 Linien, 0 Ueberlappungen) — hier stehen die
// Eigenschaften, die still kippen koennen.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const QUELLE = readFileSync(
  join(HIER, '..', '..', '..', '..', '..', '..',
       'packages', 'ui', 'src', 'koerperkarte.tsx'), 'utf8')

function ohneKommentare(s: string): string {
  return s.split('\n').filter(z => !z.trimStart().startsWith('//')
                                && !z.trimStart().startsWith('*')
                                && !z.trimStart().startsWith('/*')).join('\n')
}

test('die Beschriftung steht aussen, nicht unter dem Punkt', () => {
  const q = ohneKommentare(QUELLE)
  assert.ok(!/y=\{y \+ r \+ 28\}/.test(q),
    'der Text sitzt wieder unter dem Punkt — dann ueberlappt er')
  assert.match(q, /textAnchor=\{linkeSeite \? 'start' : 'end'\}/,
    'der Text richtet sich nicht mehr nach der Seite')
})

test('je Beschriftung eine Fuehrungslinie', () => {
  const q = ohneKommentare(QUELLE)
  assert.match(q, /<polyline/,
    'keine Fuehrungslinie mehr — der Text zeigt auf nichts')
  assert.match(q, /vectorEffect="non-scaling-stroke"/,
    'die Linie skaliert mit und wird beim Herunterrechnen unsichtbar')
})

test('zwei Punkte auf aehnlicher Hoehe bekommen zwei Zeilen', () => {
  // `[cmd]` **`vg_l` 0.48 gegen `glute_l` 0.52** — bei 1448 Einheiten
  // Hoehe sind das 58, weniger als zwei Zeilen bei Schriftgroesse 34.
  // **Ohne Entzerrung ueberlappt der Text wieder, nur weiter aussen.**
  const q = ohneKommentare(QUELLE)
  assert.match(q, /letzte \+ 46/,
    'der Mindestabstand zwischen zwei Beschriftungen fehlt')
  assert.match(q, /sort\(\(a, b\) => a\.yPct - b\.yPct\)/,
    'ohne Sortierung nach Hoehe schiebt die Entzerrung den falschen Punkt')
})

test('nur eine Punktkarte oeffnet den Rahmen', () => {
  // `[cmd]` **Gemessen: `ErmuedungsKarte` und `AktivierungsKarte`
  // uebergeben `muskeln`, nie `punkte`** — und kein Aufrufer tut es.
  // **Ihre Ansicht bleibt 724 breit.**
  const q = ohneKommentare(QUELLE)
  assert.match(q, /const hatPunkte = punkte\.some/,
    'der Rahmen waechst ohne Bedingung — dann schrumpfen auch die '
    + 'Muskelkarten in Recovery und Training')
  assert.match(q, /hatPunkte\s*\?[\s\S]{0,160}BESCHRIFTUNGSRAND/,
    'der erweiterte Rahmen haengt nicht mehr an `hatPunkte`')
})

test('die Breite gilt der Figur, nicht dem Rahmen', () => {
  // `[cmd]` **Gemessen: ohne diese Rechnung war der Text 4 px hoch.**
  // Der Rahmen ging von 724 auf 1324 Einheiten, die Anzeige blieb bei
  // 200 px — Faktor 0,151.
  const q = ohneKommentare(QUELLE)
  assert.match(q, /maxWidth: hatPunkte/,
    'die erlaubte Breite waechst nicht mit dem Rahmen — dann zahlt '
    + 'die Figur fuer die Beschriftung')
})
