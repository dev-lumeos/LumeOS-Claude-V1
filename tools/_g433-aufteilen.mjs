// G-433 - alles aufteilen, was die Grafik hergibt.
//
// **Tom, 2026-09-12:** *,,ja alles trennen was unsere grafik
// hergibt."*
//
// ══ DIE ZUORDNUNG ═══════════════════════════════════════════════════
//
// `[cmd]` **Je Pfad am Bild bestimmt** (`docs/bilder/g431/`), die
// Reihenfolge aus der Lage (`tools/_g433-lage.mjs`).
//
// **Tom hat `abs` und `obliques` selbst zugeordnet:**
//
//     abs       die unteren 2   Rectus abdominis
//               die oberen 6    Tendinous Inscriptions
//     obliques  die oberen 3    Serratus anterior
//               die unteren 5   External Oblique
//
// `[read]` **Und die Sehnen werden eigene Flaechen** - *,,sehnen
// brauchen wir dann anwaehlbar fuer painpoints."*
//
// `[read]` **Kein Pfad wird neu gezeichnet** - nur umgehaengt.
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(import.meta.dirname, '..')
const ZIEL = path.join(WURZEL, 'packages/ui/src/koerperkarte-pfade.ts')

/**
 * Der Plan. Je Flaeche: welche neuen Schluessel, welche Pfade.
 *
 * `front`/`back` nennt den Pfadsatz. Flaechen mit `side:'both'`
 * tragen zwei - beide muessen bedient werden.
 */
const PLAN = [
  // ── Beine, vorne ───────────────────────────────────────────────
  //
  // `[cmd]` **Drei Straenge je Schenkel**, nach x: aussen, mitte,
  // innen. **Am Bild: eine grosse Masse und zwei schmale Raender.**
  { flaeche: 'quadriceps', satz: 'front', teile: [
    ['vastus-lateralis', [2, 5]],
    ['rectus-femoris', [1, 4]],
    ['vastus-medialis', [3, 6]],
  ] },
  // ── Bauch: Toms Zuordnung ──────────────────────────────────────
  //
  // `[cmd]` **Pfad 4 (y=713) und 8 (y=585) sind die langen unteren
  // Bahnen** - am Bild rot/orange. **Der Rectus abdominis.**
  // `[cmd]` **Die sechs Kaestchen darueber sind Sehnenzwischen-
  // stuecke** - Tendinous Inscriptions.
  { flaeche: 'abs', satz: 'front', teile: [
    ['rectus-abdominis', [4, 8]],
    ['tendinous-inscriptions', [1, 2, 3, 5, 6, 7]],
  ] },
  // ── Flanke: Toms Zuordnung ─────────────────────────────────────
  //
  // `[cmd]` **Nach y je Seite sortiert.** **Die oberen drei sind die
  // kleinen Zacken** - Serratus anterior. **Die unteren fuenf die
  // breiteren Keile** - External Oblique.
  { flaeche: 'obliques', satz: 'front', teile: [
    ['serratus-anterior', [1, 4, 2, 9, 12, 10]],
    ['external-oblique', [3, 5, 6, 7, 8, 11, 13, 14, 15, 16]],
  ] },
]

/**
 * `calves` traegt BEIDE Ansichten (`side:'both'`).
 *
 * `[cmd]` **Hinten 8 Pfade:** 1/7 und 3/5 sind die zwei
 * Gastrocnemius-Koepfe, **2/4/6/8 die schmalen Laeufer zur Ferse** -
 * am Bild als Sehne bestaetigt (`calves-back-2.png`).
 *
 * `[cmd]` **Vorne 4 Pfade:** die Raender, die von vorn sichtbar
 * bleiben - je Kopf einer.
 */
/**
 * `adductors` traegt ebenfalls BEIDE Ansichten.
 *
 * `[cmd]` **Vorne 6 Pfade (drei je Seite), hinten 2 (einer je
 * Seite).** `[read]` **Die Rueckansicht zeigt die Innenseite als
 * EINEN Streifen** - dort trennt die Vorlage nicht. **Er gehoert
 * zum magnus**, der hinten am weitesten reicht.
 */
const ADDUCTORS = {
  flaeche: 'adductors',
  front: [
    ['adductor-longus', [1, 5]],
    ['adductor-brevis', [3, 6]],
    ['adductor-magnus', [2, 4]],
  ],
  back: [
    ['adductor-magnus', [1, 2]],
  ],
}

const CALVES = {
  flaeche: 'calves',
  back: [
    ['gastrocnemius-lateralis', [1, 7]],
    ['gastrocnemius-medialis', [3, 5]],
    ['achillessehne', [2, 4, 6, 8]],
  ],
  front: [
    ['gastrocnemius-lateralis', [1, 3]],
    ['gastrocnemius-medialis', [2, 4]],
  ],
}

function bloecke(text) {
  const aus = []
  const re = /\n {4}'?([a-z_-]+)'?:\s*\{/g
  let m
  while ((m = re.exec(text)) !== null) {
    let tiefe = 1, i = m.index + m[0].length, inStr = null
    for (; i < text.length && tiefe > 0; i++) {
      const c = text[i]
      if (inStr) { if (c === '\\') i += 1; else if (c === inStr) inStr = null; continue }
      if (c === '"' || c === "'" || c === '`') inStr = c
      else if (c === '{') tiefe += 1
      else if (c === '}') tiefe -= 1
    }
    aus.push({ name: m[1], von: m.index + 1, bis: i, rumpf: text.slice(m.index + m[0].length, i - 1) })
    re.lastIndex = i
  }
  return aus
}

let text = fs.readFileSync(ZIEL, 'utf8')
// `[cmd]` **Nur der MUSKELN-Block** — die zwei Umriss-Konstanten
// darunter sind auch `M`-Zeichenketten und haben die erste Zaehlung
// auf 160 gebracht, waehrend es 158 Muskelpfade sind.
const zaehle = (s) => [...s.slice(s.indexOf('export const MUSKELN'),
  s.indexOf('export const UMRISS_VORNE')).matchAll(/"(M[^"]{20,})"/g)].length
const VORHER = zaehle(text)

function pfadeAus(rumpf, feld) {
  const g = rumpf.match(new RegExp(`${feld}:\\s*\\[([\\s\\S]*?)\\]`))
  if (!g) return null
  return [...g[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[0])
}

/** Prueft, dass der Plan JEDEN Pfad genau einmal nennt. */
function pruefe(flaeche, teile, anzahl) {
  const benutzt = teile.flatMap(([, ix]) => ix).sort((a, b) => a - b)
  const erwartet = Array.from({ length: anzahl }, (_, i) => i + 1)
  if (JSON.stringify(benutzt) !== JSON.stringify(erwartet)) {
    throw new Error(`"${flaeche}": Plan nennt [${benutzt}], Datei hat [${erwartet}].`)
  }
}

/**
 * Ein Block. OHNE Komma am Ende.
 *
 * `[cmd]` **Die erste Fassung haengte eines an** - und der
 * Quellblock endet selbst auf `] },`. **Ergebnis: `] },,`** und
 * `TS1136: Property assignment expected`.
 *
 * `[read]` **`b.bis` zeigt hinter die schliessende Klammer, nicht
 * hinter das Komma** - das Komma der Quelle bleibt also stehen.
 */
function block(code, seite, zeilen) {
  return `    '${code}':{ side:'${seite}', paths:[\n${zeilen}\n    ] }`
}

/** Eine Flaeche mit EINEM Pfadsatz ersetzen. */
function ersetzeEinfach(flaeche, satz, teile) {
  const versatz = text.indexOf('export const MUSKELN')
  const blok = text.slice(versatz, text.indexOf('export const UMRISS_VORNE'))
  const b = bloecke(blok).find(x => x.name === flaeche)
  if (!b) throw new Error(`Block "${flaeche}" nicht gefunden.`)
  const pf = pfadeAus(b.rumpf, 'paths')
  if (!pf) throw new Error(`"${flaeche}" hat kein paths-Feld.`)
  pruefe(flaeche, teile, pf.length)
  const neu = teile.map(([code, ix]) =>
    block(code, satz, ix.map(i => `      ${pf[i - 1]}`).join(',\n'))).join(',\n')
  text = text.slice(0, versatz + b.von) + neu + text.slice(versatz + b.bis)
  console.log(`  ${flaeche.padEnd(12)} -> ${teile.map(([c]) => c).join(', ')}`)
}

/** Eine Flaeche mit ZWEI Pfadsaetzen ersetzen. */
function ersetzeBeide(plan) {
  const versatz = text.indexOf('export const MUSKELN')
  const blok = text.slice(versatz, text.indexOf('export const UMRISS_VORNE'))
  const b = bloecke(blok).find(x => x.name === plan.flaeche)
  if (!b) throw new Error(`Block "${plan.flaeche}" nicht gefunden.`)
  const vorne = pfadeAus(b.rumpf, 'paths_front')
  const hinten = pfadeAus(b.rumpf, 'paths_back')
  if (!vorne || !hinten) throw new Error(`"${plan.flaeche}" hat nicht beide Pfadsaetze.`)
  pruefe(`${plan.flaeche}/front`, plan.front, vorne.length)
  pruefe(`${plan.flaeche}/back`, plan.back, hinten.length)

  // Je Schluessel BEIDE Saetze zusammenfuehren.
  const codes = [...new Set([...plan.front.map(t => t[0]), ...plan.back.map(t => t[0])])]
  const neu = codes.map(code => {
    const f = plan.front.find(t => t[0] === code)?.[1] ?? []
    const h = plan.back.find(t => t[0] === code)?.[1] ?? []
    const teile = []
    if (f.length) teile.push(`      paths_front:[\n${f.map(i => `        ${vorne[i - 1]}`).join(',\n')}\n      ],`)
    if (h.length) teile.push(`      paths_back:[\n${h.map(i => `        ${hinten[i - 1]}`).join(',\n')}\n      ],`)
    const seite = f.length && h.length ? 'both' : (f.length ? 'front' : 'back')
    // `[read]` **Kein Komma am Ende** — das der Quelle bleibt stehen.
    return `    '${code}': {\n      side:'${seite}',\n${teile.join('\n')}\n    }`
  }).join(',\n')

  text = text.slice(0, versatz + b.von) + neu + text.slice(versatz + b.bis)
  console.log(`  ${plan.flaeche.padEnd(12)} -> ${codes.join(', ')}`)
}

console.log('\n=== G-433: aufteilen ===\n')
// `[read]` **Von hinten nach vorn** - jede Ersetzung verschiebt die
// folgenden Bloecke (die Lehre aus `verschieben-braucht-eine-richtung`).
const alle = [...PLAN.map(p => ({ ...p, art: 'einfach' })),
  { ...CALVES, art: 'beide' }, { ...ADDUCTORS, art: 'beide' }]
alle.sort((a, b) => text.indexOf(`\n    ${b.flaeche}`) - text.indexOf(`\n    ${a.flaeche}`))
for (const p of alle) {
  if (p.art === 'beide') ersetzeBeide(p)
  else ersetzeEinfach(p.flaeche, p.satz, p.teile)
}

// ── Die Gegenprobe VOR dem Schreiben ────────────────────────────
if (zaehle(text) !== VORHER) {
  throw new Error(`Pfadzahl geaendert: ${VORHER} -> ${zaehle(text)}`)
}
for (const p of alle) {
  if (new RegExp(`\\n {4}'?${p.flaeche}'?:`).test(text)) {
    throw new Error(`"${p.flaeche}" steht noch in der Datei.`)
  }
}

fs.writeFileSync(ZIEL, text)
console.log(`\nGeschrieben. Pfade unveraendert: ${zaehle(text)}`)
