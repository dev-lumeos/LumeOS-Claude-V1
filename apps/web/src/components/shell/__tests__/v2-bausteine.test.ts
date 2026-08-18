// G-56: die Reste aus zwoelf Modulauftraegen.
//
// Zwoelf Punkte lagen herum, weil `packages/ui` bei jedem Modulauftrag
// gesperrt war. Jeder Agent hat gemeldet statt gebaut — richtig so,
// aber die Meldungen haben sich gestapelt: `shield` dreimal, `Pill`
// ohne `dot` zweimal nachgebaut, `v2-g-cols-5` einmal.
//
// Diese Pruefungen halten fest, dass die Bausteine jetzt ZENTRAL
// liegen. `[read]` Der Auftrag: *„Wer sie beim zweiten Modul nachbaut,
// baut sie falsch."* — und genau das war passiert: die zwei
// `PunktPill`-Nachbauten in `coach/` und `coach/ai/` waren bereits
// verschieden, der zweite hatte eine Farboption, der erste nicht.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.join(process.cwd(), '..', '..')
const ICONS = path.join(WURZEL, 'packages/ui/src/icons.tsx')
const PRIMITIVES = path.join(WURZEL, 'packages/ui/src/primitives.tsx')
const IN_ENTWICKLUNG = path.join(WURZEL, 'packages/ui/src/in-entwicklung.tsx')
const V2CSS = path.join(WURZEL, 'packages/ui/src/styles/v2.css')
const ERZEUGER = path.join(WURZEL, 'packages/ui/src/styles/klassen-uebernehmen.mjs')
const V2 = path.join(process.cwd(), 'src/app/v2')

test('die drei gemeldeten Symbole stehen in icons.tsx', () => {
  // `[cmd]` `shield` wurde DREIMAL gemeldet (G-36, G-40, G-42), jedes
  // Mal an einer Datenschutz- oder Sicherheitsueberschrift, und jedes
  // Mal durch `admin` ersetzt. `file` zweimal (durch `copy`),
  // `history` einmal (durch `refresh`).
  //
  // `[cmd]` Sie fehlen auch in der VORLAGE: `shared.jsx` definiert
  // keines der drei, die Modulvorlagen rufen sie 14-mal auf. Dort
  // rendert `<Icon name="shield"/>` still nichts.
  const q = fs.readFileSync(ICONS, 'utf8')
  for (const n of ['shield', 'history', 'file']) {
    assert.ok(new RegExp(`^  ${n}:`, 'm').test(q),
      `Das Symbol "${n}" fehlt in icons.tsx.`)
  }
})

test('arr_r bleibt draussen', () => {
  // `[cmd]` Tippfehler der Vorlage fuer `arrow_right`. In G-20, G-21,
  // G-36, G-40 und G-42 fuenfmal so entschieden. Ein Symbol dieses
  // Namens anzulegen hiesse, den Tippfehler zu segnen.
  const q = fs.readFileSync(ICONS, 'utf8')
  assert.ok(!/^\s+arr_r:/m.test(q),
    '`arr_r` ist ein Tippfehler der Vorlage — `arrow_right` ist gemeint.')
  assert.ok(/^  arrow_right:/m.test(q), '`arrow_right` fehlt.')
})

test('Pill kennt dot, Empty gibt es', () => {
  // `[read]` Beide wurden modul-lokal nachgebaut (`coach/bausteine.tsx`,
  // `coach/ai/bausteine.tsx`) — und waren dabei schon verschieden.
  const q = fs.readFileSync(PRIMITIVES, 'utf8')
  assert.ok(/dot\?: boolean \| string/.test(q),
    'PillProps kennt kein `dot`.')
  assert.ok(/export function Empty\(/.test(q),
    'Der Baustein `Empty` fehlt.')
  // Der Punkt muss der Pille folgen, nicht grau bleiben: `v2-dot`
  // setzt in v2.css `background: var(--fg-dim)`.
  assert.ok(/currentColor/.test(q),
    'Der Punkt uebernimmt die Farbe der Pille nicht.')
})

test('die modul-lokalen Nachbauten sind weg', () => {
  // `[cmd]` Der Auftrag verlangt es ausdruecklich: *„Die modul-lokalen
  // Nachbauten sind weg — Pill, Empty, v2-g-cols-5 kommen aus
  // packages/ui."*
  for (const p of ['coach/bausteine.tsx', 'coach/ai/bausteine.tsx']) {
    assert.ok(!fs.existsSync(path.join(V2, p)),
      `${p} steht noch da — der Nachbau ist nicht aufgeloest.`)
  }

  // Und niemand ruft sie mehr auf.
  const treffer: string[] = []
  const lauf = (verz: string) => {
    for (const e of fs.readdirSync(verz, { withFileTypes: true })) {
      const p = path.join(verz, e.name)
      if (e.isDirectory()) lauf(p)
      else if (e.name.endsWith('.tsx')) {
        const roh = fs.readFileSync(p, 'utf8')
        const ohne = roh
          .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .split('\n').filter(z => !/^\s*\/\//.test(z)).join('\n')
        // NUR die Nachbauten der fehlenden Bausteine, nicht jede
        // `bausteine.tsx`: `[cmd]` Medical fuehrt eine eigene mit
        // `RangeIndicator` und `FlagPill` — das sind Fachbausteine des
        // Moduls, keine Ersatzteile fuer packages/ui. Die erste
        // Fassung dieser Pruefung hat sie mitgemeldet.
        if (/<PunktPill\b|<Leer\b|\bPunktPill\s*[,}]|\bLeer\s*[,}]/.test(ohne)) {
          treffer.push(path.relative(V2, p))
        }
      }
    }
  }
  lauf(V2)
  assert.deepEqual(treffer, [],
    `Diese Dateien benutzen noch den Nachbau: ${treffer.join(', ')}`)
})

test('InEntwicklungKnopf kann sperren', () => {
  // `[read]` Der Auftrag: *„Ein Knopf, der eine Grenze nicht
  // durchsetzt, sieht aus wie eine Sicherung und ist keine."*
  //
  // Wichtig ist die Reihenfolge: gesperrt schlaegt Fenster. Ein
  // gesperrter Knopf, der noch ein Attrappenfenster oeffnet, waere
  // genau die Sicherung, die keine ist.
  const q = fs.readFileSync(IN_ENTWICKLUNG, 'utf8')
  assert.ok(/disabled\?: boolean/.test(q), 'Der Knopf kennt kein `disabled`.')
  assert.ok(/disabled=\{disabled\}/.test(q), '`disabled` kommt nicht am <button> an.')
  assert.ok(/offen && !disabled/.test(q),
    'Ein gesperrter Knopf darf das Attrappenfenster nicht oeffnen.')
})

test('v2-g-cols-5 und v2-grid-13 stehen zentral', () => {
  // `[cmd]` Beide standen modul-lokal: `v2-g-cols-5` als
  // `v2-buddy-zustaende` (G-42), `1.3fr 1fr` gleich DREIMAL —
  // medical.css, recovery.css und buddy.css.
  const q = fs.readFileSync(V2CSS, 'utf8')
  assert.ok(/\.v2-g-cols-5 \{/.test(q), '`v2-g-cols-5` fehlt in v2.css.')
  assert.ok(/\.v2-grid-13 \{/.test(q), '`v2-grid-13` fehlt in v2.css.')
  // Beide brauchen den Haltepunkt — ohne ihn waeren sie kein Ersatz
  // fuer die modul-lokalen Fassungen, die einen hatten.
  const media = /@media \(max-width: 1100px\)[\s\S]*?\n\}/g
  const bloecke = q.match(media) ?? []
  assert.ok(bloecke.some(b => /v2-g-cols-5/.test(b)),
    '`v2-g-cols-5` hat keinen Haltepunkt.')
  assert.ok(bloecke.some(b => /v2-grid-13/.test(b)),
    '`v2-grid-13` hat keinen Haltepunkt.')
})

test('die Ergaenzungen stehen im Erzeuger, nicht nur in v2.css', () => {
  // `[read]` Der Auftrag: *„In den `zusatz`-Block von
  // `klassen-uebernehmen.mjs`, nicht von Hand in v2.css."*
  //
  // ANLASS: `[cmd]` In G-19 hat ein Erzeugerlauf 164 Zeilen geloescht —
  // darunter die Attrappenmarke, die Sprachwahl und die
  // Datumsnavigation. Wer von Hand in `v2.css` schreibt, verliert es
  // beim naechsten Lauf.
  const q = fs.readFileSync(ERZEUGER, 'utf8')
  for (const k of ['v2-g-cols-5', 'v2-grid-13', 'v2-empty', 'white-space: nowrap']) {
    assert.ok(q.includes(k),
      `"${k}" steht nicht im Erzeuger — der naechste Lauf loescht es.`)
  }
})

test('Knopfbeschriftungen brechen nicht innerhalb des Knopfes', () => {
  // `[cmd]` `.v2-btn` hat eine feste Hoehe von 26px, aber hatte kein
  // `white-space`. Eine zweizeilige Beschriftung brach INNERHALB des
  // Knopfes um, waehrend die Hoehe blieb — der Text stand halb
  // ausserhalb. Gemessen in G-23 an „Doctor export" und „Import lab".
  const q = fs.readFileSync(V2CSS, 'utf8')
  const regel = /\.v2-btn,[\s\S]{0,200}?white-space: nowrap;/
  assert.ok(regel.test(q), '`.v2-btn` hat kein `white-space: nowrap`.')
})

test('der Kartentitel schrumpft nicht vor dem Untertitel', () => {
  // `[cmd]` `.v2-card-h` ist eine Flexzeile ohne Schrumpfregel. Traf
  // ein langer `sub` auf die Attrappenmarke, schrumpfte der TITEL und
  // brach um — gemessen in G-40 an „Coaching balance" und „Trust
  // circle".
  const q = fs.readFileSync(V2CSS, 'utf8')
  assert.ok(/\.v2-card-title \{ flex-shrink: 0; \}/.test(q),
    'Der Kartentitel kann noch schrumpfen.')
})

test('JetBrains Mono wird geladen, nicht nur genannt', () => {
  // `[cmd]` Die Vorlage setzt `--font-mono: 'JetBrains Mono'`
  // (styles.css:8); hier stand die Systemkette. `v2.css` benutzt
  // `var(--font-mono)` an sechs Stellen — dort stehen die Kennzahlen.
  //
  // `[read]` Aus G-18: *„Die Messung kann die beiden nicht
  // unterscheiden, weil JetBrains Mono hier nicht installiert ist."*
  // Erst nach dem Laden laesst sich vergleichen.
  const layout = fs.readFileSync(path.join(process.cwd(), 'src/app/layout.tsx'), 'utf8')
  assert.ok(/JetBrains_Mono/.test(layout),
    'JetBrains Mono wird nicht ueber next/font geladen.')
  assert.ok(/--lumeos-mono/.test(layout), 'Die Schriftvariable fehlt.')

  const tokens = fs.readFileSync(
    path.join(process.cwd(), 'src/styles/themes/lume.css'), 'utf8')
  assert.ok(/--font-mono:\s*var\(--lumeos-mono\)/.test(tokens),
    '`--font-mono` benutzt die geladene Schrift nicht.')
  // Die Rueckfallkette bleibt: faellt die Schrift aus, steht trotzdem
  // etwas Nichtproportionales da.
  assert.ok(/ui-monospace/.test(tokens), 'Die Rueckfallkette fehlt.')
})
