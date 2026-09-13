// G-440/A5 + A6 - keine feste Datentabelle im Rechenweg einer
// Kachel, die „echte Daten" behauptet.
//
// ══ WARUM DER ALTE WAECHTER ES NICHT SAH ════════════════════════
//
// `[cmd]` **`v2-attrappen.test.ts` sucht ATTRAPPE-Marken in der
// ANSICHT.** `[read]` **Es gab keine** — die Kachel trug ja
// „echte Daten". **Was fehlte, war die Frage nach der QUELLE der
// Zahlen im Rechenweg.**
//
// **Tom, 2026-09-13:** *„mir wird irgendwas serviert aus den
// haenden gezogen und als echte daten verkauft."*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const WEB = join(HIER, '..', '..', '..')

function lies(...teile: string[]): string {
  return readFileSync(join(WEB, ...teile), 'utf8')
}

/** Kommentare weg — sonst liest der Waechter seine eigene Begruendung. */
function ohneKommentare(roh: string): string {
  return roh
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
    .join('\n')
}

/**
 * Eine FESTE Datentabelle: ein exportiertes Objekt mit mehreren
 * Eintraegen, die Messwerte tragen.
 *
 * `[read]` **Nicht jede Konstante ist eine Attrappe** — eine Liste
 * von Kuerzeln oder Beschriftungen ist harmlos. `[cmd]` **Gesucht
 * sind Zahlen, die wie Messungen aussehen** (`hours`, `sets`,
 * `soreness`, `value`).
 */
const MESSFELDER = /\b(hours|sets|soreness|value|score|pct|kg|reps)\s*:\s*-?\d/

test('G-440/A5: die Muskelkacheln rechnen NICHT aus einer festen Tabelle', () => {
  // ══ Der Kern des Auftrags ═════════════════════════════════════
  const kachel = ohneKommentare(
    lies('app', 'v2', 'recovery', 'tab-messwerte.tsx'))

  // `MUSCLE_STATE` ist die feste Tabelle aus dem Mockup.
  assert.ok(!/MUSCLE_STATE\s*\[/.test(kachel),
    'Die Kachel liest wieder aus `MUSCLE_STATE` — das sind 18 FESTE '
    + 'Zeilen aus `module-recovery-engine.jsx:135-154`, mit '
    + '„Push B · Wed" als letzter Sitzung. Der Zustand kommt aus '
    + '`workout_sets` (G-440).')

  // Und sie muss die gerechnete Quelle wirklich benutzen.
  assert.match(kachel, /muskelzustand\?\.zustaende\[/,
    'Die Kachel liest den gerechneten Zustand nicht — dann zeigt '
    + 'sie entweder nichts oder wieder Entwurfszahlen.')
})

test('G-440/A3: keine Kachel behauptet „echte Daten"', () => {
  // `[read]` **Die Marke selbst ist das Problem** — solange Schlaf
  // und Ernaehrung aus dem Entwurf kommen, ist sie unwahr.
  const kachel = ohneKommentare(
    lies('app', 'v2', 'recovery', 'tab-messwerte.tsx'))
  assert.ok(!/>echte Daten</.test(kachel),
    'Eine Kachel traegt wieder die Marke „echte Daten". Solange '
    + 'ein Teil der Rechnung geschaetzt ist, ist das unwahr — '
    + '`datenEtikett()` sagt, was gemessen ist.')
  assert.match(kachel, /datenEtikett\(/,
    'Das Etikett kommt nicht mehr aus einer Stelle — dann driften '
    + 'die beiden Kacheln auseinander.')
})

test('G-440/A4: das Etikett NENNT, was geschaetzt ist', () => {
  const kachel = lies('app', 'v2', 'recovery', 'tab-messwerte.tsx')
  // Jede Einschraenkung, die gilt, muss als Text vorkommen.
  for (const pflicht of [
    'aus workout_sets gerechnet',
    'primary wie secondary',      // die Rolle, C-487
    'Schlaf und Ernährung aus dem Entwurf',
  ]) {
    assert.ok(kachel.includes(pflicht),
      `Das Etikett nennt „${pflicht}" nicht mehr. Was geschaetzt `
      + 'ist, steht dran (Tom, G-440).')
  }

  // ══ Der blinde Fleck, den die Gegenprobe fand ═══════════════
  //
  // `[cmd]` **Die Sabotage liess den TEXT stehen und leerte nur
  // den `teile.push(…)`-Aufruf** — der Waechter suchte die
  // Zeichenkette und blieb gruen.
  //
  // `[read]` **Also die WIRKUNG pruefen:** der Satz muss an den
  // Teilen HAENGEN, nicht irgendwo im Quelltext stehen.
  const ohne = ohneKommentare(kachel)
  const rollenZweig = /if\s*\(deckung\.rollenUngewichtet\)\s*\{\s*teile\.push\(\s*'ein Satz zählt/
  assert.match(ohne, rollenZweig,
    'Der Hinweis auf die ungewichtete Rolle haengt nicht mehr am '
    + '`rollenUngewichtet`-Zweig — dann steht er zwar in der '
    + 'Datei, kommt aber nie ins Etikett (C-487).')
})

test('G-440/A6: wo sonst noch feste Messtabellen im Rechenweg stehen', () => {
  // ══ Die Liste, die der Auftrag verlangt ═══════════════════════
  //
  // `[read]` **`motor.ts` ist 34 KB** — und sie ist nicht die
  // einzige Datei mit Entwurfszahlen. `[cmd]` **Diese Probe
  // ZAEHLT sie**, damit keine unbemerkt dazukommt.
  const verzeichnis = join(WEB, 'app', 'v2', 'recovery')
  const treffer: string[] = []
  for (const datei of readdirSync(verzeichnis)) {
    if (!datei.endsWith('.ts') && !datei.endsWith('.tsx')) continue
    const code = ohneKommentare(readFileSync(join(verzeichnis, datei), 'utf8'))
    // Exportierte Konstanten mit Messfeldern.
    // `[cmd]` **`Array.from` statt Spread** — die Ziel-Version
    // erlaubt keine Iterator-Spreizung (TS2802).
    for (const m of Array.from(
      code.matchAll(/export const (\w+)[^=]*=\s*[[{]/g))) {
      const ab = code.slice(m.index ?? 0, (m.index ?? 0) + 1200)
      if (MESSFELDER.test(ab)) treffer.push(`${datei}:${m[1]}`)
    }
  }

  // `[cmd]` **Gemessen 2026-09-13.** `[read]` **Die Liste steht im
  // Bericht** — wer eine neue feste Tabelle anlegt, faellt hier
  // auf und muss sie begruenden.
  const erwartet = [
    'motor.ts:CHECKIN',
    'motor.ts:HRV_BASELINE',
    'motor.ts:MUSCLE_STATE',
    'motor.ts:NUTRITION_INPUT',
    'motor.ts:SLEEP_DATA',
    'motor.ts:TODAY_MODALITIES',
    'motor.ts:ACTIVE_PROTOCOL',
    'motor.ts:PROTOCOLS',
    'motor.ts:STRESS_DATA',
    'motor.ts:STRESS_TODAY',
  ]
  for (const t of treffer) {
    assert.ok(erwartet.includes(t),
      `Neue feste Messtabelle: ${t}. Entweder sie wird gerechnet, `
      + 'oder die Kachel sagt, dass sie geschaetzt ist — und dann '
      + 'gehoert sie hier in die Liste.')
  }
  // `[read]` **`MUSCLE_STATE` steht noch in `motor.ts`** — die
  // Datei bleibt unangetastet (Auftrag). **Aber die Kachel liest
  // sie nicht mehr**, das haelt die Probe oben fest.
  assert.ok(treffer.includes('motor.ts:MUSCLE_STATE'),
    'MUSCLE_STATE ist aus motor.ts verschwunden — der Auftrag sagt '
    + '„motor.ts nicht umbauen". Wenn sie bewusst entfernt wurde, '
    + 'gehoert diese Erwartung nachgezogen.')
})
