/**
 * G-534/A2+A4+A7 — feste Felder, atomarer Schreibweg, Vorschaupanel
 *
 * `[cmd]` **G-531 ist live, gemessen 2026-09-29:**
 * `goal_phase_start` hat sieben Parameter, der letzte ist
 * `p_zielrate_pct_kg_woche`, **und es gibt GENAU EINE Signatur.**
 * **Alle drei Funktionen lesen `auth.uid()`.**
 *
 * `[read]` **Damit faellt der zweigeteilte Schreibweg aus G-519** —
 * ein Umweg im Anwendungscode war einmal vertretbar, zweimal waere
 * es eine Architektur.
 *
 * `[cmd]` **Gegen die Datenbank belegt:** `fat_loss` (-0,5),
 * `lean_bulk` (+0,25) und `peak_week` (ohne Rate) legen alle drei
 * ueber die Funktion an, und der Doppelstart wirft weiterhin
 * *,,zuerst die laufende Phase beenden"*.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const GOALS = join(HIER, '..')
const LIB = join(HIER, '..', '..', '..', '..', 'lib', 'goals')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))

describe('G-534/A4 — der Umweg ist weg', () => {
  const WRITE = () => lies(join(LIB, 'phase-write.ts'))

  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.ok(WRITE().length > 1000, 'phase-write.ts nicht gefunden')
  })

  it('kein eigener INSERT-Weg mehr', () => {
    const q = WRITE()
    assert.ok(!q.includes('startMitRate'),
      'der zweigeteilte Schreibweg ist zurueck — die Sperrpruefung '
      + 'im Anwendungscode ist kein Ersatz fuer 23505')
    assert.ok(!/\.from\('goal_phases'\)[\s\S]{0,120}\.insert\(/.test(q),
      'die Oberflaeche legt wieder selbst eine Zeile an')
  })

  it('die Rate geht als Parameter an die Funktion', () => {
    assert.match(WRITE(), /p_zielrate_pct_kg_woche:/,
      'die Rate wird nicht mitgeschickt — dann scheitert fat_loss '
      + 'am CHECK')
  })

  it('es bleibt EIN Aufruf, kein Ternaer', () => {
    const q = WRITE()
    const aufrufe = (q.match(/rpc\('goal_phase_start'/g) ?? []).length
    assert.equal(aufrufe, 1,
      `goal_phase_start wird ${aufrufe}x gerufen — genau einmal, sonst `
      + 'gibt es wieder zwei Wege')
  })
})

describe('G-534/A2 — feste Felder statt JSON-Inhalt', () => {
  const ECHT = () => lies(join(GOALS, 'phase-echt.tsx'))

  it('die drei Felder aus PHASE_MODELS.md stehen da', () => {
    const q = ECHT()
    for (const feld of ['Zielrate', 'Hoechstdauer', 'Protein']) {
      assert.ok(q.includes(feld), `das Feld „${feld}" fehlt`)
    }
  })

  it('der JSON-Inhalt wird nicht mehr ausgeschuettet', () => {
    const q = ECHT()
    // `[cmd]` **Hier stand `params.map(([k, v]) => <Row …>)`** — und
    // zeigte „Source GO-07 testdata · Calorie surplus kcal 250".
    assert.ok(!/params\.map\(/.test(q),
      'die Kachel zeigt wieder die Rohform aus `parameters`')
  })

  it('wo ein Wert fehlt, steht ein Grund', () => {
    const q = ECHT()
    assert.match(q, /data-grund="baender"/,
      'der Strich bei Hoechstdauer und Protein traegt keinen Grund')
    assert.match(q, /noch nicht hinterlegt/,
      'der Grund nennt nicht, dass die Werte fehlen')
  })

  it('die Rate kommt aus der Spalte, nicht aus parameters', () => {
    assert.match(ECHT(), /phase\.zielrate_pct_kg_woche/,
      'die Rate wird nicht aus ihrer eigenen Spalte gelesen')
  })

  it('der Leseweg holt die Spalte', () => {
    const l = lies(join(LIB, 'lesen.ts'))
    assert.match(l, /zielrate_pct_kg_woche/,
      'lesen.ts liefert die Rate nicht — dann steht die Kachel leer')
  })
})

describe('G-534/A7 — das Vorschaupanel', () => {
  const V = () => lies(join(GOALS, 'phase-vorschau.tsx'))
  const S = () => lies(join(GOALS, 'phase-setzen.tsx'))

  it('es gibt das Panel und den Wechselknopf', () => {
    const q = V()
    assert.match(q, /data-phase-vorschau/, 'kein Vorschaupanel')
    assert.match(q, /data-vorschau-wechseln/, 'kein Wechselknopf')
    assert.match(q, /data-vorschau-schliessen/, 'kein Schliessen-Knopf')
  })

  // ── ANGEBUNDEN: was eine Quelle hat ─────────────────────────────
  it('die Uebergaenge kommen aus der Regel, nicht aus dem Entwurf', () => {
    const q = V()
    assert.match(q, /UEBERGAENGE\[art\]/,
      'die Folgephasen sind nicht aus UEBERGAENGE — dann sind sie '
      + 'abgetippt')
    assert.match(q, /uebergangErlaubt\(/,
      'die Pille „empfohlener Uebergang" ist nicht gerechnet')
  })

  it('die Ratenregel kommt aus den CHECKs', () => {
    const q = V()
    assert.match(q, /RATENPFLICHT\[art\]/,
      'das Vorzeichen ist nicht aus dem CHECK gelesen')
    assert.match(q, /RATE_MIN|RATE_MAX/,
      'die Aussengrenze ist nicht aus dem CHECK gelesen')
  })

  // ── ATTRAPPE: was keine Quelle hat ──────────────────────────────
  //
  // `[cmd]` **G-541 hat diese zwei Pruefungen umgeschrieben.** Sie
  // fragten, ob die VARIANTENKACHEL eine Marke traegt. `[cmd]` **Die
  // Kachel gibt es nicht mehr** — `aggressive_cut`, `moderate_cut`
  // und `conservative_cut` sind drei Zeilen in
  // `goals.goal_strategies` und stehen als eigene Karten in der
  // Auswahl. `[read]` **Eine Attrappe weniger, nicht eine Attrappe
  // besser** — die Frage nach ihrer Marke ist damit beantwortet und
  // nicht mehr stellbar.
  //
  // `[read]` **Was BLEIBT, ist die eigentliche Frage:** es darf
  // keine Spanne dastehen, die keine Quelle hat. `[cmd]`
  // **`goals.phase_rate_rules` hat weiterhin 0 Zeilen**, gemessen
  // 2026-09-29 — die Zahlen der Spec sind also nach wie vor
  // unbelegt.
  it('im Panel steht keine unbelegte Spanne', () => {
    const q = V()
    assert.ok(!/-400|-600|\+200|\+400|1\.8|2\.4/.test(q),
      'im Panel steht eine Spanne aus der Spec — `phase_rate_rules` '
      + 'ist leer, sie hat keine Quelle')
  })

  it('die Variantenkachel ist aufgeloest, nicht entmarkt', () => {
    const q = V()
    // `[read]` **Die Gegenprobe zur Loeschung:** waere die Kachel
    // ohne Marke wiedergekommen, faellt das hier auf.
    assert.ok(!/conservative|Varianten/.test(q),
      'die Variantenkachel steht wieder im Panel — die drei Varianten '
      + 'sind eigene Katalogzeilen (G-541)')
  })

  // ── Das Raster ──────────────────────────────────────────────────
  it('das Wechselraster zeigt alle neun Arten', () => {
    assert.match(S(), /data-wechselwahl=\{ph\.id\}/,
      'das Raster ist nicht ueber PHASENARTEN gebaut')
  })

  it('die laufende Art laesst sich nicht anklicken', () => {
    assert.match(S(), /disabled=\{laeuftGerade\}/,
      'die laufende Phase ist waehlbar — ein Wechsel auf sich selbst '
      + 'ist kein Wechsel')
  })

  it('der Wechsel fuehrt zum Beenden, nicht zu einem erfundenen Weg', () => {
    const q = S()
    assert.match(q, /onWechseln=\{onBeenden\}/,
      'der Wechselknopf ruft etwas anderes als den Beenden-Weg — '
      + 'die Datenbank kennt keinen Direktwechsel (23505)')
  })
})

describe('G-534 — die Kachel „Phasenwechsel" zeigt sich nur mit Inhalt', () => {
  it('drei Striche sind kein Posten', () => {
    const q = lies(join(GOALS, 'phase-echt.tsx'))
    assert.match(q,
      /\(phase\.transitioned_from \|\| phase\.recommended_next[\s\S]{0,60}\) && \(/,
      'die Kachel erscheint auch, wenn alle drei Felder leer sind')
  })
})
