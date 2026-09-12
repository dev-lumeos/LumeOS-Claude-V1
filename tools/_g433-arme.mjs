// G-433 (Nachtrag) - triceps, forearm und neck aufteilen.
//
// **Tom, 2026-09-12:** *,,triceps, forearms, neck sind nicht
// getrennt."*
//
// `[read]` **Stimmt** - ich hatte sie in der ersten Runde
// uebersprungen. **Gemessen sind alle drei trennbar:**
//
//     triceps back    3 Straenge je Arm   die drei Koepfe
//     forearm front   3 Straenge je Arm   Beugerseite
//     forearm back    4 Straenge je Arm   Streckerseite
//     neck front      Kehlstueck + 2 je Seite
//
// `[read]` **Kein Pfad wird neu gezeichnet** - nur umgehaengt.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const ZIEL = path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts')
let text = fs.readFileSync(ZIEL, 'utf8')

const zaehle = (s) => [...s.slice(s.indexOf('export const MUSKELN'),
  s.indexOf('export const UMRISS_VORNE')).matchAll(/"(M[^"]{20,})"/g)].length
const VORHER = zaehle(text)

function bloecke(t2) {
  const aus = []
  const re = /\n {4}'?([a-z_-]+)'?:\s*\{/g
  let m
  while ((m = re.exec(t2)) !== null) {
    let tiefe = 1, i = m.index + m[0].length, inStr = null
    for (; i < t2.length && tiefe > 0; i++) {
      const c = t2[i]
      if (inStr) { if (c === '\\') i += 1; else if (c === inStr) inStr = null; continue }
      if (c === '"' || c === "'" || c === '`') inStr = c
      else if (c === '{') tiefe += 1
      else if (c === '}') tiefe -= 1
    }
    aus.push({ name: m[1], von: m.index + 1, bis: i, rumpf: t2.slice(m.index + m[0].length, i - 1) })
    re.lastIndex = i
  }
  return aus
}

function pfadeAus(rumpf, feld) {
  const g = rumpf.match(new RegExp(`${feld}:\\s*\\[([\\s\\S]*?)\\]`))
  if (!g) return null
  return [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[0])
}

function pruefe(was, teile, anzahl) {
  const benutzt = teile.flatMap(([, ix]) => ix).sort((a, b) => a - b)
  const erwartet = Array.from({ length: anzahl }, (_, i) => i + 1)
  if (JSON.stringify(benutzt) !== JSON.stringify(erwartet)) {
    throw new Error(`"${was}": Plan nennt [${benutzt}], Datei hat [${erwartet}].`)
  }
}

/**
 * Eine Flaeche mit ZWEI Pfadsaetzen aufteilen.
 *
 * `[cmd]` **Wer nur einen Satz bekommt, kriegt `paths`** - die
 * Komponente liest bei `side:'front'`/`'back'` ausschliesslich
 * dieses Feld. **Das war der Fehler, der drei Flaechen unsichtbar
 * machte.**
 */
function ersetze(plan) {
  const versatz = text.indexOf('export const MUSKELN')
  const blok = text.slice(versatz, text.indexOf('export const UMRISS_VORNE'))
  const b = bloecke(blok).find(x => x.name === plan.flaeche)
  if (!b) throw new Error(`Block "${plan.flaeche}" nicht gefunden.`)

  const einSatz = !/paths_front:/.test(b.rumpf)
  const vorne = einSatz ? pfadeAus(b.rumpf, 'paths') : pfadeAus(b.rumpf, 'paths_front')
  const hinten = einSatz ? null : pfadeAus(b.rumpf, 'paths_back')
  if (plan.front) pruefe(`${plan.flaeche}/front`, plan.front, vorne.length)
  if (plan.back && hinten) pruefe(`${plan.flaeche}/back`, plan.back, hinten.length)
  if (plan.back && einSatz) pruefe(`${plan.flaeche}`, plan.back, vorne.length)

  const codes = [...new Set([
    ...(plan.front ?? []).map(t => t[0]),
    ...(plan.back ?? []).map(t => t[0]),
  ])]
  const neu = codes.map(code => {
    const f = plan.front?.find(t => t[0] === code)?.[1] ?? []
    const h = plan.back?.find(t => t[0] === code)?.[1] ?? []
    // Ein einzelner Satz -> `paths`, zwei -> `paths_front`/`_back`.
    if (einSatz) {
      const ix = f.length ? f : h
      const seite = plan.front ? 'front' : 'back'
      return `    '${code}':{ side:'${seite}', paths:[\n`
        + ix.map(i => `      ${vorne[i - 1]}`).join(',\n') + '\n    ] }'
    }
    if (f.length && h.length) {
      return `    '${code}': {\n      side:'both',\n`
        + `      paths_front:[\n${f.map(i => `        ${vorne[i - 1]}`).join(',\n')}\n      ],\n`
        + `      paths_back:[\n${h.map(i => `        ${hinten[i - 1]}`).join(',\n')}\n      ],\n    }`
    }
    const ix = f.length ? f : h
    const quelle = f.length ? vorne : hinten
    const seite = f.length ? 'front' : 'back'
    return `    '${code}':{ side:'${seite}', paths:[\n`
      + ix.map(i => `      ${quelle[i - 1]}`).join(',\n') + '\n    ] }'
  }).join(',\n')

  text = text.slice(0, versatz + b.von) + neu + text.slice(versatz + b.bis)
  console.log(`  ${plan.flaeche.padEnd(10)} -> ${codes.join(', ')}`)
}

// ══ DIE ZUORDNUNG, am Bild bestimmt ═══════════════════════════════
const PLAENE = [
  // `[cmd]` **`triceps`: vorne 2 (der Rand, von vorn sichtbar),
  // hinten 6 (drei Koepfe je Arm).**
  //
  // `[cmd]` **Am Bild** (`tafel-triceps-back.png`), je Arm nach
  // Lage: **1/4 innen oben** (Caput longum, zieht zur Schulter),
  // **2/6 die breite Masse aussen** (Caput laterale),
  // **3/5 der schmale Streifen unten** (Caput mediale).
  {
    flaeche: 'triceps',
    front: [['triceps-lateralis', [1, 2]]],
    back: [
      ['triceps-longum', [1, 4]],
      ['triceps-lateralis', [2, 6]],
      ['triceps-mediale', [3, 5]],
    ],
  },
  // `[cmd]` **`forearm`: vorne 3 je Arm (Beuger), hinten 4 je Arm
  // (Strecker).** `[read]` **Die Ansicht trennt die zwei Gruppen
  // schon** - jetzt auch die Straenge darin.
  //
  // `[read]` **`muscle_groups` fuehrt `Forearm Flexors` und
  // `Forearm Extensors`** - die einzelnen Namen darunter zeichnet
  // die Vorlage nicht, also bleiben es zwei Flaechen je Ansicht.
  {
    flaeche: 'forearm',
    front: [
      ['forearm-flexors', [1, 4]],
      ['brachioradialis', [2, 3, 5, 6]],
    ],
    back: [
      ['forearm-extensors', [1, 2, 5, 6]],
      ['forearm-extensors-ulnar', [3, 4, 7, 8]],
    ],
  },
  // `[cmd]` **`neck`: vorne 5, hinten 2.**
  //
  // `[cmd]` **Am Bild** (`tafel-neck-front.png`): **Pfad 1 ist das
  // breite Kehlstueck mittig**, **2/3 der linke Strang**, **4/5 der
  // rechte.** `[read]` **Das sind die zwei Koepfe des
  // Sternocleidomastoideus je Seite** plus die Kehle dazwischen.
  {
    flaeche: 'neck',
    front: [
      ['sternocleidomastoid', [2, 3, 4, 5]],
      ['kehle', [1]],
    ],
    back: [['nacken', [1, 2]]],
  },
]

console.log('\n=== G-433 Nachtrag: triceps, forearm, neck ===\n')
// Von hinten nach vorn, sonst verschieben sich die Indizes.
PLAENE.sort((a, b) => text.indexOf(`\n    ${b.flaeche}`) - text.indexOf(`\n    ${a.flaeche}`))
for (const p of PLAENE) ersetze(p)

if (zaehle(text) !== VORHER) {
  throw new Error(`Pfadzahl geaendert: ${VORHER} -> ${zaehle(text)}`)
}
for (const p of PLAENE) {
  if (new RegExp(`\\n {4}'?${p.flaeche}'?:`).test(text)) {
    throw new Error(`"${p.flaeche}" steht noch in der Datei.`)
  }
}

fs.writeFileSync(ZIEL, text)
console.log(`\nGeschrieben. Pfade unveraendert: ${zaehle(text)}`)
