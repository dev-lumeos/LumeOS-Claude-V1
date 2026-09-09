// Injektionsorte auf Muskelflaechen — G-396.
//
// **Tom, 2026-09-09:** *„die injektionsorte sollen auch anwaehlbar
// sein wie in muscle soreness, und ein modal mit all den werten
// betreffs punkt und daten dazu."*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  ORT_ZU_FLAECHE, ORT_ZU_NADELART, seiteVonOrt,
  ortZustand, zustandsFarbe, flaechenGruppen,
  type OrtFuerFlaeche, type ProtokollZeile,
} from '../injektion-flaechen'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..', '..')

function ort(id: string, route = 'im'): OrtFuerFlaeche {
  return {
    id, route, display_name: id,
    minimum_rest_days: null,
    minimum_rest_days_reason: 'E-57: Keine wissenschaftlich validierte Mindest-Ruhezeit',
  }
}

test('alle 16 Orte haben eine Flaeche', () => {
  // `[cmd]` **Gemessen: `medical.injection_sites` fuehrt 16 Zeilen**,
  // und jede muss eine Flaeche einfaerben — sonst verschwindet ein Ort
  // stillschweigend von der Karte, wie die sechs SubQ-Punkte vorher.
  const ids = ['delt_l', 'delt_r', 'sq_delt_l', 'sq_delt_r',
    'quad_l', 'quad_r', 'thigh_sq_l', 'thigh_sq_r',
    'glute_l', 'glute_r', 'vglute_l', 'vglute_r',
    'abd_l', 'abd_r', 'lat_l', 'lat_r']
  assert.equal(Object.keys(ORT_ZU_FLAECHE).length, 16,
    'die Zuordnung fuehrt nicht mehr genau 16 Orte')
  for (const id of ids) {
    assert.ok(ORT_ZU_FLAECHE[id], `"${id}" hat keine Flaeche — er faerbt nichts ein`)
  }
})

test('jede genannte Flaeche gibt es wirklich', () => {
  // ══ EINE ERFUNDENE FLAECHE FAERBT NICHTS ═══════════════════════
  //
  // `[cmd]` **Der Auftrag fragt nach `latissimus`** — und `MUSKELN`
  // fuehrt ihn nicht. **Ohne diese Probe zeigte die Karte zwei Orte
  // weniger, ohne Fehler und ohne Meldung.**
  const pfade = readFileSync(
    join(WURZEL, 'packages', 'ui', 'src', 'koerperkarte-pfade.ts'), 'utf8')
  for (const flaeche of Array.from(new Set(Object.values(ORT_ZU_FLAECHE)))) {
    assert.ok(new RegExp(`^\\s*${flaeche}:`, 'm').test(pfade),
      `"${flaeche}" steht nicht in MUSKELN — diese Orte faerben nichts ein`)
  }
})

test('latissimus gibt es nicht, und lat_l weicht bewusst aus', () => {
  const pfade = readFileSync(
    join(WURZEL, 'packages', 'ui', 'src', 'koerperkarte-pfade.ts'), 'utf8')
  assert.ok(!/^\s*latissimus:/m.test(pfade),
    'latissimus ist da — dann gehoert lat_l/lat_r darauf, nicht auf trapezius')
  assert.equal(ORT_ZU_FLAECHE.lat_l, 'trapezius',
    'die Naeherung fuer lat_l hat sich geaendert, ohne dass latissimus existiert')
})

test('die Seite kommt aus der Id', () => {
  assert.equal(seiteVonOrt('delt_l'), 'links')
  assert.equal(seiteVonOrt('delt_r'), 'rechts')
  assert.equal(seiteVonOrt('irgendwas'), undefined)
})

test('E-57: keine Ruhezeitrechnung, nur benutzt oder nie', () => {
  // ══ WARUM NUR ZWEI ZUSTAENDE ═══════════════════════════════════
  //
  // `[cmd]` **Die Spec (`Injection Planner`:117-135) will vier:**
  // `fresh`, `ready`, `soon`, `resting` — die letzten drei aus
  // `site.rest_days - days_ago`. `[cmd]` **`minimum_rest_days` ist bei
  // allen 16 Orten NULL** (E-57, 18 Quellen). **Eine Zahl hier waere
  // erfunden.**
  const o = ort('delt_l')
  const nie = ortZustand(o, [], '2026-09-09')
  assert.equal(nie.status, 'fresh')
  assert.equal(nie.tageSeither, null)

  // `[cmd]` **Der Stichtag ist Mitternacht UTC** (`T00:00:00Z`), die
  // Injektion trug eine Uhrzeit. **Vom 04. 10:00 bis zum 09. 00:00
  // sind es 4,58 Tage, abgerundet 4** — nicht 5. `[read]` **Die
  // Uhrzeit im Protokoll verschiebt die Zahl**, deshalb steht sie hier
  // ausdruecklich, statt sie zu ueberlesen.
  const p: ProtokollZeile = { injection_site_id: 'delt_l', injected_at: '2026-09-04T10:00:00Z' }
  const benutzt = ortZustand(o, [p], '2026-09-09')
  assert.equal(benutzt.status, 'benutzt')
  assert.equal(benutzt.tageSeither, 4, 'die Tage seit der Injektion stimmen nicht')

  // `[read]` **Ohne Uhrzeit die glatte Zahl** — und das belegt, dass
  // gerechnet und nicht gerundet wird.
  const glatt = ortZustand(
    o, [{ injection_site_id: 'delt_l', injected_at: '2026-09-04T00:00:00Z' }], '2026-09-09')
  assert.equal(glatt.tageSeither, 5)

  // `[read]` **Nie negativ**: ein Eintrag in der Zukunft ergibt 0,
  // keine Minuszahl — die saehe am Schirm aus wie ein Datenfehler.
  const zukunft = ortZustand(
    o, [{ injection_site_id: 'delt_l', injected_at: '2026-09-20T00:00:00Z' }], '2026-09-09')
  assert.equal(zukunft.tageSeither, 0)

  // `[read]` **Die Zustandsnamen der Spec duerfen NICHT auftauchen** —
  // wer sie einfuehrt, hat eine Ruhezeit erfunden.
  const quelle = readFileSync(join(HIER, '..', 'injektion-flaechen.ts'), 'utf8')
  const rumpf = quelle.split('\n')
    .filter(z => !z.trimStart().startsWith('*') && !z.trimStart().startsWith('//'))
    .join('\n')
  for (const wort of ['resting', 'soon', 'ready']) {
    assert.ok(!new RegExp(`'${wort}'`).test(rumpf),
      `der Zustand "${wort}" ist zurueck — er braucht eine Ruhezeit, `
      + 'die E-57 ausdruecklich nicht gibt')
  }
})

test('die Spalte heisst injection_site_id, nicht site_id', () => {
  // `[cmd]` **Gemessen in `information_schema`.** `[read]` **Der
  // falsche Name findet nichts und meldet nichts** — jeder Ort staende
  // auf „nie benutzt", auch mit vollem Protokoll.
  const p = { injection_site_id: 'delt_l', injected_at: '2026-09-08T10:00:00Z' }
  const z = ortZustand(ort('delt_l'), [p], '2026-09-09')
  assert.equal(z.status, 'benutzt',
    'der Protokolleintrag wird nicht gefunden — falscher Spaltenname?')
})

test('zwei Orte auf einer Flaechenhaelfte werden zusammengefasst', () => {
  // `[cmd]` **`glute_l` und `vglute_l` faerben beide `gluteal` links**,
  // `delt_l` und `sq_delt_l` beide `deltoids` links. **Die Flaeche hat
  // eine Farbe, das Modal beide Orte** (A8).
  const gruppen = flaechenGruppen(
    [ort('glute_l'), ort('vglute_l'), ort('glute_r')], [], '2026-09-09')
  const links = gruppen.find(g => g.flaeche === 'gluteal' && g.seite === 'links')
  assert.ok(links, 'gluteal links fehlt')
  assert.deepEqual(links.orte.map(z => z.ort.id).sort(), ['glute_l', 'vglute_l'],
    'die zwei Orte auf gluteal links stehen nicht beide in der Gruppe — '
    + 'dann zeigt das Modal nur einen')

  // ══ DIE SEITE IST TEIL DES SCHLUESSELS ═════════════════════════
  //
  // `[cmd]` **Ohne sie faellt `glute_r` in dieselbe Gruppe** — die
  // Karte faerbte dann beide Haelften gleich, und das Modal zeigte
  // rechts die linken Orte mit. `[read]` **Eine Zaehlung allein merkt
  // das nicht** (zwei Orte links, zwei Orte gesamt): **also die Ids
  // vergleichen und die Haelften zaehlen.**
  const rechts = gruppen.find(g => g.flaeche === 'gluteal' && g.seite === 'rechts')
  assert.ok(rechts, 'gluteal rechts fehlt — wird die Seite im Schluessel ignoriert?')
  assert.deepEqual(rechts.orte.map(z => z.ort.id), ['glute_r'],
    'die rechte Haelfte traegt fremde Orte')
  assert.equal(gruppen.length, 2,
    'gluteal bildet nicht zwei Haelften — links und rechts sind zusammengefallen')
})

test('der zuletzt benutzte Ort gibt der Flaeche die Farbe', () => {
  // `[read]` **Dringlichkeit waere eine Ruhezeitrechnung** — die gibt
  // es nach E-57 nicht. **Also die Ordnung, die die Daten tragen.**
  const gruppen = flaechenGruppen(
    [ort('glute_l'), ort('vglute_l')],
    [{ injection_site_id: 'vglute_l', injected_at: '2026-09-07T10:00:00Z' }],
    '2026-09-09')
  const g = gruppen[0]
  assert.equal(g.orte[0].ort.id, 'vglute_l',
    'der benutzte Ort steht nicht oben — dann faerbt die Flaeche falsch')
  assert.equal(g.farbe, zustandsFarbe(g.orte[0]))
  assert.notEqual(g.farbe, zustandsFarbe(g.orte[1]),
    'benutzt und nie benutzt haben dieselbe Farbe — dann unterscheidet die Karte nichts')
})

test('die Nadelart kommt aus der Ortsart, nicht aus der Id', () => {
  // `[cmd]` **C-445/A5: `injection_needle_recommendations` ist auf
  // `site` verschluesselt** — 8 Zeilen fuer 16 Orte.
  assert.equal(ORT_ZU_NADELART.quad_l, 'vastus_lateralis')
  assert.equal(ORT_ZU_NADELART.abd_r, 'subcutaneous')
  // `[cmd]` **Gemessen: fuer Gluteus und Latissimus gibt es KEINE
  // Zeile.** `[read]` **Sie duerfen deshalb auch keine Art tragen** —
  // eine erfundene Zuordnung zeigte fremde Werte als eigene.
  for (const id of ['glute_l', 'glute_r', 'lat_l', 'lat_r']) {
    assert.equal(ORT_ZU_NADELART[id], undefined,
      `"${id}" bekommt eine Nadelart, obwohl die Tabelle keine Zeile dafuer hat`)
  }
})

test('das Modal deckt zu und deckelt seine Tabelle nicht', () => {
  // ══ ZWEI FEHLER, AM SCHIRM GEFUNDEN ════════════════════════════
  //
  // `[cmd]` **1. `--surface-1` gibt es nicht.** Gemessen ergab die
  // Regel `rgba(0, 0, 0, 0)` — die Seite schien durch das Modal
  // hindurch. **`lume.css` fuehrt `--bg-elev` und `--surface-2`.**
  // `[read]` **Ein unbekanntes Token faellt stumm auf durchsichtig**:
  // kein Fehler, keine Warnung, nur ein Modal, das nichts zudeckt.
  //
  // `[cmd]` **2. `.v2-supp-tbl-wrap` traegt `min-height: 320px`.**
  // Gemessen: Nadeltabelle 135 px in einer 320-px-Huelle — 185 px
  // Leere mitten im Modal. **Die geteilte Regel ist fuer die langen
  // Listen richtig**, also braucht das Modal eine eigene.
  const css = readFileSync(
    join(WURZEL, 'apps', 'web', 'src', 'app', 'v2', 'supplements', 'supplements.css'), 'utf8')
  // `[read]` **Ohne Kommentare pruefen** — der Block ERKLAERT, warum
  // `--surface-1` falsch war, und nennt es dabei. **Ein Waechter, der
  // seine eigene Begruendung liest, faellt immer.**
  const block = css.slice(css.indexOf('.v2-inj-modal {'),
                          css.indexOf('.v2-inj-modal-kopf'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
  assert.ok(block.length > 20, 'die Regel `.v2-inj-modal` fehlt')
  assert.ok(!/--surface-1/.test(block),
    'das Modal nutzt `--surface-1` — das Token gibt es nicht, '
    + 'die Flaeche wird durchsichtig und die Seite scheint durch')
  assert.match(block, /background:\s*var\(--bg-elev\)/,
    'das Modal hat keine deckende Flaeche mehr')

  assert.match(css, /\.v2-inj-modal \.v2-supp-tbl-wrap[\s\S]{0,80}min-height:\s*0/,
    'die Nadeltabelle im Modal erbt wieder `min-height: 320px` — '
    + 'dann steht eine leere Flaeche unter zwei Zeilen')
})

test('die Flaechen sind per Tastatur erreichbar', () => {
  // `[cmd]` **Am Schirm gemessen: 34 Pfade mit `tabindex=0` und
  // `role=button`**, Enter oeffnet das Modal. **Die Karte kann das
  // seit G-55** — die Injektionskachel hat es nur nie benutzt
  // (fuenfzehnter A-71-Fall).
  const karte = readFileSync(
    join(WURZEL, 'packages', 'ui', 'src', 'koerperkarte.tsx'), 'utf8')
  const zweig = karte.slice(karte.indexOf('const klickbar'),
                            karte.indexOf('</g>', karte.indexOf('const klickbar')))
  assert.ok(zweig.length > 100, 'der Flaechenzweig ist nicht mehr auffindbar')
  assert.match(zweig, /tabIndex=\{klickbar \? 0 : undefined\}/,
    'die Flaechen sind nicht mehr per Tab erreichbar')
  assert.match(zweig, /role=\{klickbar \? 'button' : undefined\}/,
    'die Flaechen melden sich nicht mehr als Knopf')
  assert.match(zweig, /e\.key === 'Enter'/,
    'Enter oeffnet die Flaeche nicht mehr')
})
