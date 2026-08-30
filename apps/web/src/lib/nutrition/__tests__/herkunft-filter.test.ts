// G-276 / G-251: der MealCam-Modus und die drei Filter.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  FILTER_LAGE, LEER_SATZ, vortagLageVon, VORTAG_SATZ,
} from '../herkunft-filter'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

// ── G-276: kein falscher Absender ────────────────────────────────

test('G-276: keine Oberflaeche schreibt mealcam ohne Foto', () => {
  // `[cmd]` **Gemessen am 2026-08-30:** der Knopf aus G-274 schrieb
  // `confirmation_mode: 'mealcam'`, **ohne dass fotografiert wurde.**
  // `[cmd]` **Einen Fotoweg gibt es nirgends** — `MealCamModal` ist
  // eine Attrappe („MealCam hat kein Modell").
  //
  // `[read]` **Ein Feld, das die Herkunft benennt, muss die Wahrheit
  // sagen** — sonst ist es schlimmer als keins.
  for (const datei of [
    'src/app/v2/nutrition/plan-eintraege.tsx',
    'src/app/v2/nutrition/mahlzeiten.tsx',
  ]) {
    assert.doesNotMatch(ohneKommentare(datei), /confirmation_mode: 'mealcam'/,
      `${datei} schreibt mealcam ohne Fotoweg (G-276).`)
  }
})

test('G-276: der Schreibweg kennt den Modus weiter', () => {
  // `[read]` **Die Spalte ist richtig, nur hatte sie keinen ehrlichen
  // Absender.** `[cmd]` Der CHECK erlaubt `mealcam` und `manual`;
  // **sobald der Fotoweg steht, wird der Wert gebraucht.**
  const s = ohneKommentare('src/lib/nutrition/plan-log-write.ts')
  assert.match(s, /z\.enum\(\['mealcam', 'manual'\]\)/,
    'Der Modus ist aus dem Schreibweg entfernt — dann fehlt er, wenn '
    + 'der Fotoweg kommt (G-276).')
})

// ── G-251: gemessen, nicht gebaut ────────────────────────────────

test('G-251: je Filter steht die Quelle fest', () => {
  // `[cmd]` **BERICHTIGT AM 2026-08-30 — A-62.** Dieser Waechter
  // verlangte je Filter ein Feld `fehlt` („keine Luecke benannt") und
  // prueft jetzt die Quelle. **Er war richtig, solange keiner der drei
  // baubar war;** seit C-355 kennt `food_search` zwei davon, und ein
  // Waechter, der eine Luecke ERZWINGT, haelt den Bau auf.
  for (const k of ['bevorzugt', 'wie_gestern', 'eigene'] as const) {
    assert.ok(FILTER_LAGE[k].quelle.length > 0, `${k}: keine Quelle.`)
    assert.ok(FILTER_LAGE[k].label.length > 0, `${k}: keine Beschriftung.`)
    assert.ok(FILTER_LAGE[k].hinweis.length > 0, `${k}: kein Hinweis.`)
  }
  // `[cmd]` **Zwei laufen ueber `food_search`, einer nicht** — und das
  // ist keine Luecke, sondern seine Natur.
  assert.match(FILTER_LAGE.bevorzugt.quelle, /food_search/)
  assert.match(FILTER_LAGE.eigene.quelle, /food_search/)
  assert.doesNotMatch(FILTER_LAGE.wie_gestern.quelle, /food_search/,
    '„Wie gestern" ist kein Suchfilter — meals/meal_items sind eine '
    + 'eigene Liste (G-251).')
})

test('G-251: die Pille heisst nicht „Favoriten"', () => {
  // `[cmd]` **Gemessen am 2026-08-30 fuer dev@lumeos.app:**
  // `{"favorites": true}` liefert **total 4.098** von 4.970 — nicht 1.
  // Die Funktion setzt `is_favorite = bool_or(constraint_level =
  // 'boost')`, **und ein `boost` entsteht auch aus einem gemochten
  // TAG** (5.557 Ziele gegen 1 Lebensmittel).
  //
  // `[read]` **Eine Beschriftung, die 1 verspricht und 4.098 zeigt,
  // waere die Falschaussage — nicht die Zahl.**
  assert.doesNotMatch(FILTER_LAGE.bevorzugt.label, /Favorit/i,
    'Die Pille verspricht Favoriten, zeigt aber alles zu gemochten '
    + 'Tags (G-251).')
  assert.match(FILTER_LAGE.bevorzugt.hinweis, /nicht nur/i,
    'Der Hinweis sagt nicht, dass mehr als die Favoriten erscheinen (G-251).')
})

test('G-251: „gestern war nichts" und „es gibt kein gestern"', () => {
  // **Der Auftrag fragt ausdruecklich danach.** `[cmd]` **Der Fall ist
  // real:** dev hat 180 Tage mit Posten ueber eine Spanne von 181 —
  // **eine Luecke.**
  //
  // `[read]` **Zwei verschiedene Aussagen.** Wer sie zusammenwirft,
  // behauptet am ersten Tag, der Nutzer habe gefastet.
  assert.equal(vortagLageVon(true, 12), 'posten')
  assert.equal(vortagLageVon(true, 0), 'leer')
  assert.equal(vortagLageVon(false, 0), 'kein_tag')
  assert.notEqual(VORTAG_SATZ.leer, VORTAG_SATZ.kein_tag)
  assert.match(VORTAG_SATZ.leer, /nichts erfasst/)
  assert.match(VORTAG_SATZ.kein_tag, /keinen Vortag/)
  assert.equal(VORTAG_SATZ.posten, '', 'Mit Posten braucht es keinen Satz.')
})

test('G-251: die zwei Filter gehen an die Suchfunktion', () => {
  // `[cmd]` **UMGEDREHT AM 2026-08-30 — A-62.** Dieser Waechter hiess
  // „kein Filter wurde gebaut" und verbot die Beschriftungen im Reiter.
  // **Er war vier Wochen richtig und ist es seit C-355 nicht mehr** —
  // er haette genau den Bau blockiert, den der Auftrag verlangt.
  //
  // `[read]` **Jetzt sichert er die Gegenrichtung:** der Filter muss an
  // `food_search` gehen, nicht an die geladene Seite. **Dieselbe Lehre
  // wie G-133** — clientseitig blieben die Ausgeschlossenen auf Seite 2
  // stehen, und `total` waere gelogen.
  const s = ohneKommentare('src/app/v2/nutrition/tab-foods.tsx')
  assert.match(s, /params\.set\('herkunft', herkunft\)/,
    'Die Herkunft geht nicht an die Suchfunktion (G-251).')
  // Und sie gehoert in die Abhaengigkeiten, sonst laedt nichts nach.
  const effekt = /\}, \[suche, kategorie, tags, seite, sortierung, ohne([^\]]*)\]\)/
    .exec(s)
  assert.ok(effekt, 'Der Ladeeffekt wurde nicht gefunden (G-251).')
  assert.match(effekt[1], /(?<![a-z0-9_])herkunft(?![a-z0-9_])/,
    '`herkunft` fehlt in den Abhaengigkeiten — der Filter wirkt dann '
    + 'erst beim naechsten Tastendruck (G-133/G-251).')
  // `[cmd]` **Kein clientseitiges Nachfiltern der geladenen Seite.**
  assert.doesNotMatch(s, /zeilen\.filter\([^)]*favorit/i,
    'Hier wird die geladene Seite nachgefiltert — dann luegt `total` (G-251).')
})

test('G-251: der Leerzustand nennt seinen Grund', () => {
  // `[cmd]` **`foods_custom` hat 0 Zeilen** (gemessen 2026-08-30).
  // `[read]` **Wer „Eigene" waehlt, bekommt garantiert nichts** — und
  // das liegt nicht an seinem Suchbegriff. **Ein allgemeines „passt
  // nichts" liesse ihn die Suche aendern, was nichts aendert.**
  // `[read]` **Auf die Aussage pruefen, nicht auf eine Beugung** — die
  // erste Fassung verlangte „eigene Lebensmittel" und fiel an
  // „keine eigenen Lebensmittel".
  assert.match(LEER_SATZ.eigene, /eigene[nr]? Lebensmittel/i)
  assert.match(LEER_SATZ.eigene, /legst du selbst an/i,
    'Der Satz sagt nicht, wie etwas hierher kaeme (G-251).')
  assert.notEqual(LEER_SATZ.eigene, LEER_SATZ.bevorzugt,
    'Beide Leerzustaende sagen dasselbe — dann tragen sie nichts bei (G-251).')
  const s = ohneKommentare('src/app/v2/nutrition/tab-foods.tsx')
  assert.match(s, /LEER_SATZ\[herkunft\]/,
    'Der Reiter zeigt den allgemeinen Satz auch bei gesetztem Filter (G-251).')
})
