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
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { katalogwerte } from '../../../../lib/goals/plan'

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
  // G-656: phase-echt.tsx ist geloescht; die Werte zeigt der Planer (`Werte` in plan-seite.tsx).
  const ECHT = () => lies(join(GOALS, 'plan-seite.tsx'))

  // `[cmd]` **G-645/3: Anlass ersetzt, Regel behalten.** Hier standen
  // Hoechstdauer und Protein als Strich in `phase-echt.tsx` — Grund damals:
  // `phase_rate_rules` hatte 0 Zeilen. **Seit G-541 fuehrt der Katalog beide**
  // (`protein_per_kg`, `max_duration_weeks`), der Planer zeigt sie in den
  // Details, und der Strich daneben widersprach ihnen. Die drei Felder stehen
  // jetzt im Planer: Tempo aus `katalogwerte`, die Rate mit Einheit hier.
  it('die drei Felder aus PHASE_MODELS.md stehen da', () => {
    assert.match(ECHT(), /return s \? katalogwerte\(s, p\.zielrate_pct_kg_woche\) : \[\]/, 'der Planer zeigt nicht die Katalogwerte mit der Zielrate')
    const labels = katalogwerte({ weight_change_target_percent: -0.5, protein_per_kg: 2, fat_percent: null, fett_g_kg: null,
      cardio_pro_woche: null, refeed_pro_woche: null, max_duration_weeks: 12, refeeds: null }, null).map(z => z.label)
    for (const feld of ['Tempo', 'Höchstdauer', 'Protein']) {
      assert.ok(labels.includes(feld), `das Feld „${feld}" fehlt im Planer`)
    }
  })

  it('der JSON-Inhalt wird nicht mehr ausgeschuettet', () => {
    const q = ECHT()
    // `[cmd]` **Hier stand `params.map(([k, v]) => <Row …>)`** — und
    // zeigte „Source GO-07 testdata · Calorie surplus kcal 250".
    assert.ok(q.length > 1000 && !/(params|parameters)\??\.map\(|JSON\.stringify\((p|plan|x)\.(parameters|eigene_werte)\)/.test(q),
      'die Kachel zeigt wieder die Rohform aus `parameters`')
  })

  it('wo ein Wert fehlt, steht ein Grund — und kein Strich gegen den Katalog', () => {
    // fehlt der Katalogwert, heisst die Zeile im Planer „keine Vorgabe" (G-629)
    const z = katalogwerte({ weight_change_target_percent: null, protein_per_kg: null, fat_percent: null, fett_g_kg: null,
      cardio_pro_woche: null, refeed_pro_woche: null, max_duration_weeks: null, refeeds: null }, null)
    assert.equal(z.find(x => x.label === 'Protein')?.wert, null)
    assert.equal(z.find(x => x.label === 'Höchstdauer')?.wert, null)
    assert.match(lies(join(GOALS, 'plan-seite.tsx')), /data-keine-vorgabe>keine Vorgabe</)
    assert.ok(!/label="H(oe|ö)chstdauer"|label="Protein"/.test(ECHT()),
      'plan-seite.tsx zeigt wieder einen eigenen Strich neben dem Katalogwert')
  })

  it('die Rate kommt aus der Spalte, nicht aus parameters', () => {
    assert.match(lies(join(LIB, 'plan-read.ts')), /zielrate_pct_kg_woche: zahl\(x\.zielrate_pct_kg_woche\) \?\?/,
      'die Rate wird nicht aus ihrer eigenen Spalte gelesen')
  })

  it('der Leseweg holt die Spalte', () => {
    const l = lies(join(LIB, 'lesen.ts'))
    assert.match(l, /zielrate_pct_kg_woche/,
      'lesen.ts liefert die Rate nicht — dann steht die Kachel leer')
  })
})

// ══ G-615: das Vorschaupanel und das Wechselraster sind weg ═════════
//
// Hier stand G-534/A7 (acht Proben auf `phase-vorschau.tsx` und das
// Raster in `phase-setzen.tsx`). Tom, G-615: der Reiter Phase engine wird
// der Planer — begonnen wird mit Ziel (Anlegemodal G-610, Planer).
// Die Zusage dreht sich um: beides kommt nicht zurueck.
describe('G-615 — kein Vorschaupanel, kein Wechselraster', () => {
  it('phase-vorschau.tsx ist weg und wird nirgends importiert', () => {
    assert.ok(!existsSync(join(GOALS, 'phase-vorschau.tsx')), 'phase-vorschau.tsx ist zurueck')
    assert.ok(!/phase-vorschau'/.test(lies(join(GOALS, 'plan-seite.tsx'))))
    assert.ok(!/phase-vorschau'/.test(lies(join(GOALS, 'ansicht.tsx'))))
  })
})

describe('G-534 — die Kachel „Phasenwechsel" zeigt sich nur mit Inhalt', () => {
  it('drei Striche sind kein Posten', () => {
    // G-656: die Kachel ist mit phase-echt.tsx geloescht; der Vorschlag steht unter
    // „Als nächstes" — und nur, wenn `recommended_next` einen Wert hat.
    assert.match(lies(join(LIB, 'plan-read.ts')), /empfohlen: phaseId && ende\.get\(phaseId\)\?\.next \? \{/,
      'der Vorschlag erscheint auch ohne recommended_next')
  })
})
