// G-436/A2 + A7 - Schnitt und Engpass.
//
// **Tom:** *„wieso waehlen wenn man beides haben kann? schnitt von
// kindern mit werten und daneben schwaechstes glied."*
//
// ══ DIE REGEL, DIE DIESE PROBE HAELT ════════════════════════════
//
// `[cmd]` **Der Schnitt rechnet NUR ueber Kinder MIT Wert.**
// `[read]` **Ein Kind ohne Volumen zieht ihn NICHT herunter** —
// sonst saehe eine Gruppe schlechter aus, als sie ist, nur weil ein
// Muskel noch keine Zuordnung hat (C-487).
//
// `[read]` **Und `--` ist die Antwort, nicht `0`** — eine Null saehe
// aus wie „voellig unerholt".
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { baueBaum, mitWerten, type MuskelKnoten } from '../muskelbaum'

/** Toms Beispiel aus dem Auftrag, als Baum. */
function baum(): MuskelKnoten[] {
  return [
    { id: '1', name: 'Arms', parent_id: null },
    { id: '2', name: 'Biceps', parent_id: '1' },
    { id: '3', name: 'Brachialis', parent_id: '1' },
    { id: '4', name: 'Forearms', parent_id: '1' },
    { id: '5', name: 'Brachioradialis', parent_id: '4' },
    { id: '6', name: 'Wrist Flexors', parent_id: '4' },
  ]
}

/** Die Werte aus Toms Beispiel. */
const WERTE: Record<string, number> = {
  Biceps: 31, Brachioradialis: 37,
  // `Brachialis` und `Wrist Flexors` haben KEINEN Wert — das ist
  // der Kern der Probe.
}

function gerechnet() {
  const aeste = baueBaum(baum(), {})
  return mitWerten(aeste, a => WERTE[a.name] ?? null)
}

test('G-436/A2: der Schnitt rechnet NUR ueber Kinder mit Wert', () => {
  const [arms] = gerechnet()
  assert.equal(arms.name, 'Arms')

  // ══ Von Hand nachgerechnet ════════════════════════════════════
  //
  //   Forearms: Brachioradialis 37, Wrist Flexors --
  //             -> Schnitt aus EINEM Kind = 37
  //   Arms:     Biceps 31, Brachialis --, Forearms (37)
  //             -> Schnitt aus ZWEI = (31 + 37) / 2 = 34
  //
  // `[read]` **Die beiden Kinder OHNE Wert zaehlen nicht mit.**
  // **Mit ihnen als 0 waere es (31+0+37+0)/4 = 17** — die Gruppe
  // saehe halb so erholt aus, wie sie ist.
  const forearms = arms.kinder.find(k => k.name === 'Forearms')!
  assert.equal(forearms.schnitt, 37, 'Forearms: nur Brachioradialis hat einen Wert.')
  assert.equal(forearms.schnittAus, 1)

  assert.equal(arms.schnitt, 34,
    'Arms: (31 + 37) / 2 = 34. Mit den wertlosen Kindern als 0 '
    + 'waere es 17 — das waere eine Falschaussage.')
  assert.equal(arms.schnittAus, 2,
    'Zwei Kinder gehen ein: Biceps (eigener Wert) und Forearms '
    + '(ueber seinen Schnitt).')
})

test('G-436/A2: der Engpass ist das schwaechste Glied UNTERHALB', () => {
  const [arms] = gerechnet()
  assert.deepEqual(arms.engpass, { name: 'Biceps', wert: 31 },
    'Biceps 31 ist schwaecher als Brachioradialis 37.')

  const forearms = arms.kinder.find(k => k.name === 'Forearms')!
  assert.deepEqual(forearms.engpass, { name: 'Brachioradialis', wert: 37 })
})

test('G-436/A2: der Engpass findet auch einen ENKEL', () => {
  // `[read]` **Die Gegenrichtung** — ohne sie waere eine Fassung
  // gruen, die nur die direkten Kinder ansieht. **Ein Engpass zwei
  // Ebenen tiefer ist derselbe Engpass.**
  const aeste = baueBaum(baum(), {})
  const w: Record<string, number> = { Biceps: 90, Brachioradialis: 12 }
  const [arms] = mitWerten(aeste, a => w[a.name] ?? null)
  assert.deepEqual(arms.engpass, { name: 'Brachioradialis', wert: 12 },
    'Der Brachioradialis haengt unter Forearms, also zwei Ebenen '
    + 'unter Arms — er muss trotzdem als Engpass erscheinen.')
})

test('G-436/A3: ohne Wert steht null, NICHT 0', () => {
  // ══ „-- ist die Antwort, nicht 0" ═════════════════════════════
  const aeste = baueBaum(baum(), {})
  const [arms] = mitWerten(aeste, () => null)
  assert.equal(arms.schnitt, null,
    'Kein Kind hat einen Wert — dann gibt es keinen Schnitt. '
    + '`0` waere eine erfundene Zahl.')
  assert.equal(arms.engpass, null)
  assert.equal(arms.schnittAus, 0)

  const brachialis = arms.kinder.find(k => k.name === 'Brachialis')!
  assert.equal(brachialis.wert, null, 'Kein Wert heisst null, nicht 0.')
})

test('G-436: ein Blatt mit Wert traegt ihn selbst, ohne Schnitt', () => {
  const [arms] = gerechnet()
  const biceps = arms.kinder.find(k => k.name === 'Biceps')!
  assert.equal(biceps.wert, 31)
  assert.equal(biceps.schnitt, null, 'Ein Blatt hat keine Kinder — kein Schnitt.')
  assert.equal(biceps.engpass, null, 'Und keinen Engpass unter sich.')
})

test('G-436/A7: ein erfundenes Kind aendert den Schnitt', () => {
  // ══ Die Gegenprobe, die der Auftrag verlangt ══════════════════
  //
  // **A7:** *„der Schnitt mit einem erfundenen Kind -> faellt sie?"*
  //
  // `[read]` **Diese Probe ist die Umkehrung**: sie zeigt, dass die
  // Rechnung ueberhaupt auf die Menge der Kinder reagiert. **Waere
  // der Schnitt fest verdrahtet, bliebe er hier gleich.**
  const k = baum()
  k.push({ id: '99', name: 'Erfunden', parent_id: '1' })
  const [ohne] = mitWerten(baueBaum(baum(), {}), a => WERTE[a.name] ?? null)
  const [mit] = mitWerten(baueBaum(k, {}),
    a => (a.name === 'Erfunden' ? 7 : WERTE[a.name] ?? null))

  assert.equal(ohne.schnitt, 34)
  assert.equal(mit.schnitt, 25,
    '(31 + 37 + 7) / 3 = 25. Bleibt der Schnitt bei 34, rechnet '
    + 'die Funktion nicht ueber die Kinder.')
  assert.deepEqual(mit.engpass, { name: 'Erfunden', wert: 7 },
    'Das erfundene Kind ist mit 7 das schwaechste Glied.')
})
