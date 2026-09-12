// G-436 - die drei Zustaende, gezaehlt statt geschaetzt.
//
// ══ WARUM DAS EINE PROBE IST UND KEIN SKRIPT ════════════════════
//
// `[cmd]` **`KARTE_ZU_RECOVERY` wird zur LAUFZEIT gerechnet**
// (`muskel-zuordnung.ts:292`, eine IIFE ueber `flaechenFuer`).
// `[read]` **Ein Regex darueber liest 0 Eintraege** — genau das
// passierte beim ersten Anlauf, und die Zaehlung darunter war
// Unsinn (0 / 13 / 92).
//
// `[read]` **Also importieren statt lesen** — und dann bleibt die
// Zaehlung gleich als Waechter stehen.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { MUSCLE_STATE, MUSCLE_GROUPS_BODYMAP } from '../../../app/v2/recovery/motor'
import { KARTE_ZU_RECOVERY } from '../../../app/v2/recovery/muskel-zuordnung'
import { EBENEN } from '../ebenen'

const HIER = dirname(fileURLToPath(import.meta.url))

test('G-436: die drei Zustaende sind gezaehlt, nicht geschaetzt', () => {
  // Name -> Flaechencode, aus EBENEN (die Lehre aus G-432: `EBENEN`
  // sagt, welchen Muskel eine Flaeche WIRKLICH zeigt).
  const nachName: Record<string, string> = {}
  for (const [code, e] of Object.entries(EBENEN)) {
    if (e.name) nachName[e.name.toLowerCase()] = code
  }

  const gezeichnet = Object.keys(nachName).length
  const mitWert = Object.values(nachName)
    .filter(code => MUSCLE_STATE[KARTE_ZU_RECOVERY[code] ?? '']).length
  const striche = Object.entries(nachName)
    .filter(([, code]) => !MUSCLE_STATE[KARTE_ZU_RECOVERY[code] ?? ''])
    .map(([n, code]) => `${n} (${code})`)
  // `[read]` **Die Zahlen gehoeren in den Bericht** — deshalb
  // stehen sie hier, nicht in einem Wegwerfskript.
  console.log(`  gezeichnet ${gezeichnet} · mit Wert ${mitWert} · „--" ${striche.length}`)
  console.log(`  „--": ${striche.join(', ')}`)

  // `[cmd]` **Gemessen 2026-09-12** — wer diese Zahlen aendert,
  // aendert die Ansicht.
  assert.equal(gezeichnet, 22,
    `${gezeichnet} Muskelnamen sind gezeichnet, erwartet 22. `
    + 'Neue Flaeche in `ebenen.ts`? Dann hier nachziehen.')
  assert.ok(mitWert > 0,
    'KEIN gezeichneter Muskel faellt auf ein Kuerzel mit Wert — '
    + 'dann zeigte die ganze Ansicht nur Striche.')
  assert.equal(MUSCLE_GROUPS_BODYMAP.length, 18)
  assert.equal(Object.keys(MUSCLE_STATE).length, 18,
    'Jedes Kuerzel traegt einen Entwurfswert.')
})

test('G-436/A1: die Kachel zeigt EINE Liste, und die ist die Hierarchie', () => {
  // ══ Die Wirkung, nicht das Wort ═══════════════════════════════
  //
  // `[cmd]` **Hier standen ZWEI Listen** — eine flache Tabelle mit
  // 18 Kuerzeln und darunter der Notbehelf aus G-435.
  // `[read]` **Ein Waechter, der nur „baueBaum wird gerufen" prueft,
  // bliebe gruen, wenn die alte Tabelle danebenstehen bliebe.**
  const roh = readFileSync(
    join(HIER, '..', '..', '..', 'app', 'v2', 'recovery', 'tab-messwerte.tsx'), 'utf8')
  const ohneJsx = roh.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  const code = ohneJsx.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')
    .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
    .join('\n')

  // Die Kachel `Per-muscle detail` — von ihrem Titel bis zum Ende.
  const von = code.indexOf('title="Per-muscle detail"')
  assert.ok(von > 0, 'Die Kachel `Per-muscle detail` gibt es nicht mehr.')
  const bis = code.indexOf('</Card>', von)
  const kachel = code.slice(von, bis)

  assert.match(kachel, /mitWerten\(/,
    'Die Kachel rechnet Schnitt und Engpass nicht — dann ist sie '
    + 'wieder eine blosse Liste.')
  assert.ok(!/<table/.test(kachel),
    'Die flache Tabelle steht wieder in der Kachel — Tom wollte '
    + 'EINE Liste, nicht zwei.')
  assert.match(kachel, /paddingLeft:\s*\(a\.ebene - 1\)/,
    'Die Zeilen sind nicht nach Tiefe eingerueckt — dann ist es '
    + 'keine Hierarchie.')
  // `[read]` **Der Notbehelf aus G-435 hatte eine eigene
  // Ueberschrift** — die darf nicht zurueckkommen.
  assert.ok(!/Hierarchie · \{d\.gezeichnet\}/.test(code),
    'Die zweite Liste aus G-435 ist zurueck.')
})

test('G-436/A5: eine GRUPPE ist anwaehlbar, nicht nur ein Muskel', () => {
  // `[cmd]` **Gemessen:** ein Klick auf `Arms` oeffnete NICHTS —
  // die Gruppe hat kein Recovery-Kuerzel. `[read]` **Ohne diesen
  // Waechter faellt der Gruppenfall lautlos wieder heraus.**
  const kachel = readFileSync(
    join(HIER, '..', '..', '..', 'app', 'v2', 'recovery', 'tab-messwerte.tsx'), 'utf8')
  assert.match(kachel, /typ:\s*'muskelgruppe'/,
    'Die Kachel oeffnet fuer eine Gruppe kein Fenster — ein Klick '
    + 'auf `Arms` bliebe wirkungslos.')

  const modale = readFileSync(
    join(HIER, '..', '..', '..', 'app', 'v2', 'recovery', 'modale.tsx'), 'utf8')
  // ══ Die WIRKUNG, nicht die Schreibform ════════════════════════
  //
  // `[cmd]` **Die erste Fassung suchte nur `case 'muskelgruppe':`**
  // — und blieb GRUEN, als die Sabotage daraus
  // `case 'muskelgruppe': return null && <GruppenDetailModal …`
  // machte. `[read]` **Gesucht ist der Fall, der die Komponente
  // WIRKLICH zurueckgibt** — also der Zweig ohne davorgesetzte
  // Abschaltung.
  const zweig = /case 'muskelgruppe':\s*return\s*<GruppenDetailModal/.exec(modale)
  assert.ok(zweig,
    'Die Verteilung gibt fuer eine Gruppe kein `GruppenDetailModal` '
    + 'zurueck — das Fenster bliebe leer. (Steht ein `null &&` oder '
    + 'eine andere Bedingung davor? Dann ist der Fall abgeschaltet.)')
  assert.match(modale, /function GruppenDetailModal/,
    'Das Gruppenfenster gibt es nicht.')
  // `[read]` **Und es muss Schnitt UND Engpass zeigen** — Tom:
  // *„wieso waehlen wenn man beides haben kann?"*
  assert.match(modale, /Schwächstes Glied/,
    'Das Gruppenfenster zeigt den Engpass nicht.')
  assert.match(modale, /mitWerten\(baueBaum\(/,
    'Das Gruppenfenster rechnet nicht — dann stuenden dort andere '
    + 'Zahlen als in der Liste.')
})

test('G-436: KARTE_ZU_RECOVERY ist zur Laufzeit gefuellt', () => {
  // `[read]` **Die Gegenprobe zum Messfehler oben** — waere die
  // Abbildung leer, saehe die Ansicht genauso aus wie „kein Wert
  // zugeordnet", ohne dass es auffiele.
  const n = Object.keys(KARTE_ZU_RECOVERY).length
  assert.ok(n >= 29,
    `KARTE_ZU_RECOVERY hat ${n} Eintraege, erwartet mindestens 29. `
    + 'Eine leere Abbildung sieht am Schirm aus wie „kein Wert".')
})
