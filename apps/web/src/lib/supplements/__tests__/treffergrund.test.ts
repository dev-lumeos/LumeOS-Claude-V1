// G-281 (Treffergrund), G-102 (SVG-Pfade), A-50 (gefallene Spalten).
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

import {
  trifftSuche, treffergrund, GRUND_TEXT,
} from '../substanz-kategorien'

const WURZEL = path.resolve(process.cwd(), '../..')
const lies = (rel: string) => fs.readFileSync(path.join(WURZEL, rel), 'utf8')
const ohneKommentare = (rel: string) => lies(rel)
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

/** Der gemessene Fall aus G-214. */
const PTERO = {
  name: 'Pterostilbene',
  description: 'Pterostilbene is a plant compound from blueberries '
    + 'related to resveratrol that reaches the body far better.',
  zwecke: ['Zellschutz'],
}
const MAG = {
  name: 'Magnesium bisglycinate',
  description: 'chelatiertes Magnesium',
  zwecke: ['Schlaf', 'Muskelentspannung'],
}

// ══ G-281 ══════════════════════════════════════════════════════════

test('G-281: der Grund nennt den Zweig, der zugeschlagen hat', () => {
  // `[cmd]` **Der Anlass, in G-214 gemessen und hier nachgeprueft:**
  // *Pterostilbene* trifft bei *Resveratrol*, weil
  // `supplement_user_texts.kurz_was_en` es sagt — und dieser Text
  // steht als `description` in der Zeile (`substanz-read.ts:418`).
  assert.equal(treffergrund(PTERO, 'resveratrol'), 'description')
  assert.equal(treffergrund(PTERO, 'pterostilbene'), 'name')
  assert.equal(treffergrund(MAG, 'Schlaf'), 'zwecke')
  assert.equal(treffergrund(MAG, 'kreatin'), null, 'Was nicht passt, passt nicht.')
  assert.equal(treffergrund(MAG, ''), 'alle', 'Leere Suche trifft alles.')
})

test('G-281: die Reihenfolge ist unveraendert', () => {
  // `[read]` **Der Auftrag: keine Rangregel aendern.** Die Funktion
  // gibt nur zurueck, was sie ohnehin schon wusste.
  //
  // `[read]` **Die Wirkung pruefen, nicht das Wort:** ein Eintrag, auf
  // den ZWEI Zweige passen, muss den frueheren nennen.
  const beides = {
    name: 'Magnesium', description: 'enthaelt Magnesium', zwecke: ['Magnesium'],
  }
  assert.equal(treffergrund(beides, 'magnesium'), 'name',
    'Der Name muss vor der Beschreibung kommen (G-281).')
  const zweiUndDrei = {
    name: 'Zink', description: 'gut fuer Schlaf', zwecke: ['Schlaf'],
  }
  assert.equal(treffergrund(zweiUndDrei, 'schlaf'), 'description',
    'Die Beschreibung muss vor den Zwecken kommen (G-281).')
})

test('G-281: `trifftSuche` bleibt mit `treffergrund` verdrahtet', () => {
  // `[read]` **Sonst laufen zwei Regeln auseinander** — die Filterung
  // saehe andere Treffer als die Begruendung. `[cmd]` Genau das
  // Muster, das G-186 fuer die Zwecke festgehalten hat.
  const s = ohneKommentare('apps/web/src/lib/supplements/substanz-kategorien.ts')
  assert.match(s, /return treffergrund\(e, frage\) !== null/,
    'trifftSuche rechnet wieder selbst — dann koennen Filter und Grund '
    + 'auseinanderlaufen (G-281).')
  // Gegenprobe: beide sagen ueber dieselben Faelle dasselbe.
  for (const [e, f] of [
    [PTERO, 'resveratrol'], [PTERO, 'xyz'], [MAG, 'Schlaf'], [MAG, ''],
  ] as const) {
    assert.equal(trifftSuche(e, f), treffergrund(e, f) !== null,
      `Filter und Grund weichen ab bei "${f}".`)
  }
})

test('G-281: bei Namenstreffern steht keine Auskunft', () => {
  // `[read]` **Wer „Magnesium" sucht und Magnesium findet, braucht
  // keine Erklaerung** — ein Hinweis an jeder Zeile waere Rauschen.
  assert.equal(GRUND_TEXT.name, '')
  assert.equal(GRUND_TEXT.alle, '')
  assert.ok(GRUND_TEXT.description.length > 0)
  assert.ok(GRUND_TEXT.zwecke.length > 0)
  assert.notEqual(GRUND_TEXT.description, GRUND_TEXT.zwecke,
    'Beide Gruende sagen dasselbe — dann tragen sie nichts bei (G-281).')
})

test('G-281: die Zeile zeigt den Grund', () => {
  // `[read]` **Die Wirkung, nicht das Wort:** nicht „kommt
  // `GRUND_TEXT` vor", sondern — haengt die Anzeige an der Zuordnung?
  const s = ohneKommentare('apps/web/src/app/v2/supplements/substanz-detail.tsx')
  // `[read]` **Der Ausdruck steht ZWEIMAL** — einmal als Bedingung,
  // einmal im Rumpf. `[cmd]` **Die Sabotage hat genau das ausgenutzt:**
  // sie ersetzte die Bedingung durch `false &&`, der Rumpf blieb, und
  // ein Waechter mit `assert.match` blieb gruen. **Deshalb gezaehlt,
  // nicht gesucht** — dieselbe Lehre wie G-274 (`onConflict` weg,
  // `.upsert(` blieb).
  const n = (s.match(/GRUND_TEXT\[treffer\.gruende\.get\(s\.id\) \?\? 'alle'\]/g) ?? []).length
  assert.equal(n, 2,
    `Die Beschriftung haengt nicht mehr an beiden Stellen (Bedingung `
    + `und Rumpf), gefunden: ${n} (G-281).`)
  // Und die Bedingung darf nicht abgeschaltet sein.
  assert.doesNotMatch(s, /\{false && \(/,
    'Der Grund ist per `false &&` abgeschaltet (G-281).')
})

// ══ A-50 ═══════════════════════════════════════════════════════════

test('A-50: der Waechter fuer gefallene Spalten laeuft im Gate', () => {
  // `[read]` **Die Gegenrichtung zu `abwesenheit-pruefen`:** dort ist
  // etwas Fehlendes wieder da, hier war etwas da und ist weg.
  const pkg = JSON.parse(lies('package.json')) as {
    scripts?: Record<string, string>
  }
  assert.match(pkg.scripts?.gate ?? '',
    /(?<![a-z0-9_-])tools\/gefallene-spalten-pruefen\.mjs(?![a-z0-9_-])/,
    'gefallene-spalten-pruefen.mjs steht nicht mehr in der Gate-Kette (A-50).')
})

test('A-50: die Kernregel — DROP zaehlt nur ohne spaeteres ADD', () => {
  // `[read]` **Die Wirkung messen, nicht den Quelltext lesen.** Eine
  // frühere Fassung dieses Waechters prueste nur Textmuster in
  // `gefallene-spalten-pruefen.mjs` — **zwei Sabotagen ueberlebten**,
  // weil sie Zeilen entfernten, die kein Muster traf.
  //
  // `[read]` **Und ein Test, der `node` als Kindprozess startet, ist
  // hier nicht zu haben:** unter `tsx --test` faellt der Aufruf sofort
  // aus (gemessen 2026-08-31, `duration_ms: 1.4`, leeres stderr) —
  // **ein Test, der aus dem falschen Grund gruen oder rot wird, ist
  // schlimmer als keiner.**
  //
  // **Also die REGEL selbst hier nachbilden und gegen die echten
  // Dateien laufen lassen.** Sie ist kurz genug, dass beide Fassungen
  // dasselbe sagen — und sie faellt, sobald die Pipeline eine Spalte
  // wirft, die ein Leseweg noch braucht.
  const RX_DROP = /drop\s+column\s+(?:if\s+exists\s+)?([a-z_][a-z0-9_]*)/gi
  const RX_ADD = /add\s+column\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi
  const wurzel = path.resolve(process.cwd(), '../..')
  const sql = execFileSync('git', ['ls-files', '--', 'supabase/**/*.sql',
    'supabase/**/*.ts'], { cwd: wurzel, encoding: 'utf8' })
    .split('\n').map(z => z.trim()).filter(Boolean).sort()

  const stand = new Map<string, string>()
  for (const rel of sql) {
    let t = ''
    try { t = fs.readFileSync(path.join(wurzel, rel), 'utf8') } catch { continue }
    const ev: Array<{ pos: number; sp: string; art: string }> = []
    // `Array.from` statt Spread — sonst TS2802 ohne downlevelIteration.
    for (const m of Array.from(t.matchAll(RX_DROP))) ev.push({ pos: m.index ?? 0, sp: m[1], art: 'drop' })
    for (const m of Array.from(t.matchAll(RX_ADD))) ev.push({ pos: m.index ?? 0, sp: m[1], art: 'add' })
    ev.sort((a, b) => a.pos - b.pos)
    for (const e of ev) stand.set(e.sp, e.art)
  }
  const gefallen = Array.from(stand.entries())
    .filter(([, a]) => a === 'drop').map(([s]) => s)

  // `[cmd]` **Gemessen 2026-08-31: 20 gefallene Spalten.**
  assert.ok(gefallen.length > 0,
    'Keine gefallene Spalte gefunden — dann prueft die Regel nichts (A-50).')
  // `[cmd]` **`acwr_used` MUSS darunter sein** — der gemessene Fall.
  assert.ok(gefallen.includes('acwr_used'),
    '`acwr_used` gilt nicht mehr als gefallen — dann ist der Fall aus '
    + 'G-160/C-215 nicht mehr abgedeckt (A-50).')
  // `[cmd]` **`im_katalog` darf NICHT darunter sein** — sie wird in
  // derselben Datei zwei Zeilen spaeter neu angelegt und steht live.
  assert.equal(gefallen.includes('im_katalog'), false,
    '`im_katalog` gilt als gefallen — sie wird in '
    + '144_kimi_wave3_name_bridge.ts:92 neu angelegt und steht live. '
    + 'Ein Waechter mit diesem Fehlalarm wird abgeschaltet (A-50).')
})

test('A-50: er unterscheidet Wiederkehr von echtem Verlust', () => {
  // `[cmd]` **`im_katalog` wird in `144_kimi_wave3_name_bridge.ts:91`
  // geworfen und zwei Zeilen weiter neu angelegt** — als GENERATED-
  // Spalte. `[cmd]` **Sie steht live.** `[read]` **Wer nur `DROP`
  // zaehlt, meldet das als Fehler** und wird abgeschaltet.
  const w = lies('tools/gefallene-spalten-pruefen.mjs')
  assert.match(w, /RX_ADD/,
    'Der Waechter kennt kein ADD COLUMN mehr — dann meldet er jede '
    + 'Neuanlage als Verlust (A-50).')
  assert.match(w, /ereignisse\.sort\(\(a, b\) => a\.pos - b\.pos\)/,
    'Die Reihenfolge innerhalb einer Datei wird nicht mehr beachtet — '
    + '`im_katalog` faellt und kommt zwei Zeilen spaeter wieder (A-50).')
  // Und Tests sind keine Lesepfade.
  assert.match(w, /__tests__/,
    'Der Waechter schliesst Tests nicht mehr aus — dann meldet er den '
    + 'G-173-Waechter, der `acwr_used` nur im Regex nennt (A-50).')
})

// ══ G-102 ══════════════════════════════════════════════════════════

test('G-102: der SVG-Waechter hat einen Selbsttest', () => {
  // `[cmd]` **Gemessen am 2026-08-31: 160 Pfade, 0 bemaengelt** — und
  // mit `--selbsttest-kaputt` faellt genau einer. **Der Waechter
  // misst also etwas.**
  //
  // `[read]` **Ohne diesen Schalter waere „0 bemaengelt" nicht von
  // „prueft nichts" zu unterscheiden** — genau die Frage, die G-102
  // an ihn gestellt hat.
  const w = lies('tools/svgpfade-pruefen.mjs')
  assert.match(w, /--selbsttest-kaputt/,
    'Der Selbsttest ist weg — dann ist „0 bemaengelt" nicht mehr '
    + 'von „misst nichts" zu unterscheiden (G-102).')
  assert.match(w, /getTotalLength\(\)/,
    'Der Waechter erzwingt das Parsen nicht mehr — der Browser meldet '
    + 'dann gar nichts (G-102).')
})
