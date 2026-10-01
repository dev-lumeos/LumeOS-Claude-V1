/**
 * G-568 — die Zielwerte brauchen ihr Ziel
 *
 * `[cmd]` **Der neue Vertrag, woertlich aus G-563:**
 *
 *     goals.berechne_zielwerte(
 *       p_user_id uuid, p_goal_id uuid,
 *       p_stichtag date DEFAULT CURRENT_DATE)
 *
 * **Das Ergebnis traegt zusaetzlich `goal_id uuid`.** Die alte
 * Zweiparameter-Fassung bleibt und **wirft bei mehreren aktiven
 * Zielphasen** (`23514`).
 *
 * `[cmd]` **Gemessen 2026-10-01: live steht die alte Signatur** —
 * `p_user_id uuid, p_stichtag date DEFAULT CURRENT_DATE`, aus
 * `pg_proc` gelesen. `[read]` **Heute still richtig, nach dem
 * Einspielen ein sichtbarer Fehler** — deshalb VOR dem Einspielen.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { hindernisSatz, type Hindernis } from '../zielwerte-hindernis'

const HIER = dirname(fileURLToPath(import.meta.url))
const WEB = join(HIER, '..', '..', '..')
const PIPELINE = join(WEB, '..', '..', '..', 'supabase', '_pipeline', '11_goals')

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
const lies = (p: string) => ohneKommentare(readFileSync(p, 'utf8'))
const R = () => lies(join(HIER, '..', 'zielwerte-read.ts'))

// ════════════════════════════════════════════════════════════════
// A5 — der Rueckfall ist verboten, an der WIRKUNG gemessen
// ════════════════════════════════════════════════════════════════

describe('G-568/A5 — kein Aufruf ohne p_goal_id', () => {
  /**
   * `[read]` **Diese Pruefung sucht kein WORT.** Sie schneidet den
   * Rumpf der Funktion heraus, die `berechne_zielwerte` ruft, und
   * prueft, was uebergeben wird.
   *
   * `[read]` **Die letzten drei Berichte haben genau diese Falle je
   * einmal gefunden** — ein Waechter, der `p_goal_id` irgendwo in
   * der Datei findet, bleibt gruen, wenn der AUFRUF es nicht nennt.
   */
  const rumpf = (): string => {
    const q = R()
    const i = q.indexOf('export async function getZielwertVorschlag')
    assert.ok(i > 0, 'getZielwertVorschlag gibt es nicht')
    const j = q.indexOf('\nexport ', i + 10)
    return q.slice(i, j > 0 ? j : q.length)
  }

  it('der Aufruf kann p_goal_id tragen', () => {
    const r = rumpf()
    assert.match(r, /p_goal_id: goalId/,
      'der Aufruf nennt kein p_goal_id — nach dem Einspielen bekommt '
      + 'ein Nutzer mit zwei offenen Phasen einen Fehler')
    assert.match(r, /\.rpc\('berechne_zielwerte', args\)/,
      'die Argumente werden nicht aus der Wahl gebaut')
  })

  it('ohne Ziel wird KEINES geraten', () => {
    // `[read]` **A2: „Wo die Ansicht keines zeigt, wird keines
    // geraten."** `[read]` **Dann faellt der Aufruf auf die alte
    // Fassung zurueck, und die Datenbank entscheidet** — eine Phase
    // geht durch, zwei werfen.
    const r = rumpf()
    assert.match(r, /goalId\s*\n?\s*\?\s*\{ p_user_id: userId, p_goal_id: goalId/,
      'ohne Ziel wird trotzdem eines uebergeben')
    assert.ok(!/p_goal_id: userId|p_goal_id: ''/.test(r),
      'ein Ziel wird erfunden — die Nutzerkennung ist kein Ziel')
  })

  it('die Signatur nimmt das Ziel entgegen', () => {
    assert.match(R(), /getZielwertVorschlag\(\s*stichtag: string, goalId\?: string \| null,\s*\)/,
      'getZielwertVorschlag kennt keinen Zielparameter — dann kann '
      + 'ihn kein Aufrufer nennen')
  })

  it('der Aufrufer, der ein Ziel kennt, nennt es', () => {
    // `[cmd]` **Die Goals-Seite laedt `offenePhasen` VOR dem
    // Vorschlag** (gemessen: Zeile 121 vor 128).
    const q = lies(join(WEB, 'app', 'v2', 'goals', 'page.tsx'))
    assert.match(q, /getZielwertVorschlag\(stichtag, einzigesZiel\)/,
      'die Goals-Seite reicht ihr Ziel nicht durch')
    assert.match(q, /offenePhasen\.length === 1\s*\n?\s*\? offenePhasen\[0\]\.goal_id/,
      'das Ziel wird nicht aus der EINEN offenen Phase genommen')
  })
})

// ════════════════════════════════════════════════════════════════
// A3 — das Ergebnis traegt sein Ziel
// ════════════════════════════════════════════════════════════════

describe('G-568/A3 — die Zahl nennt ihr Ziel', () => {
  it('goal_id kommt aus der Antwort', () => {
    const q = R()
    assert.match(q, /goal_id: text\(zeile\.goal_id\)/,
      'das Ziel wird nicht aus der Antwort genommen — dann ist die '
      + 'Zahl bei zwei Zielen keine Aussage')
    assert.match(q, /goal_id: string \| null/,
      'der Typ traegt das Ziel nicht')
  })

  it('die Anzeige nennt es erst ab ZWEI Phasen', () => {
    // `[read]` **Bei einer waere es Laerm** — dieselbe Abwaegung wie
    // beim Phasenkopf aus G-564.
    const q = lies(join(WEB, 'app', 'v2', 'goals', 'tab-composition.tsx'))
    assert.match(q, /vorschlag\?\.goal_id && d\.laufendePhasen > 1 && \(/,
      'das Ziel wird immer oder nie genannt')
    assert.match(q, /data-zielwerte-ziel=\{vorschlag\.goal_id\}/,
      'die Kennung ist am Schirm nicht nachzaehlbar')
  })

  it('die Zahl der Phasen kommt aus der ungedeckelten Quelle', () => {
    // `[cmd]` **Dieselbe Wahl wie in G-564:** `offenePhasen` liest
    // die Tabelle, `phasen` kommt aus `phase_am` mit seinem
    // `LIMIT 1`. `[read]` **Die Tabelle stimmt heute UND nach dem
    // Einspielen.**
    const q = lies(join(WEB, 'app', 'v2', 'goals', 'ansicht.tsx'))
    assert.match(q, /laufendePhasen: echt\.offenePhasen\.length/,
      'die Zahl kommt aus der gedeckelten Quelle — dann nennt die '
      + 'Anzeige bei zwei Phasen kein Ziel')
  })

  it('der Titel wird nicht geraten', () => {
    const q = lies(join(WEB, 'app', 'v2', 'goals', 'ansicht.tsx'))
    assert.match(q, /zielTitel: echt\.vorschlag\?\.goal_id/,
      'der Titel haengt nicht am gerechneten Ziel')
    assert.match(q, /\?\?\s*null/,
      'ein unbekannter Titel wird erfunden')
  })
})

// ════════════════════════════════════════════════════════════════
// A4 — der Fehler ist ein Zustand
// ════════════════════════════════════════════════════════════════

describe('G-568/A4 — Mehrdeutigkeit als Zustand, nicht als 500', () => {
  it('die Ausnahme wird erkannt und nicht geworfen', () => {
    const q = R()
    assert.match(q, /if \(istMehrdeutig\(error\)\) \{/,
      'die Mehrdeutigkeitsmeldung faellt durch — dann sieht der '
      + 'Nutzer HTTP 500 statt eines Satzes')
    assert.match(q, /hindernis: 'mehrere_phasen'/,
      'sie wird nicht als Hindernis gefuehrt')
  })

  it('erkannt wird der SATZ, nicht nur der Code', () => {
    // `[read]` **`23514` ist ein CHECK-Verstoss** und kann auch von
    // einer Spaltenbedingung kommen. `[cmd]` **Der Satz steht in
    // `563_target_scoped_calculation.sql:285`.**
    const q = R()
    const i = q.indexOf('function istMehrdeutig')
    const r = q.slice(i, i + 400)
    assert.match(r, /mehrere aktive phasen/,
      'erkannt wird nur der Code — dann gilt jeder CHECK-Verstoss '
      + 'als Mehrdeutigkeit')
    assert.match(r, /zielbezug fehlt/,
      'der zweite Teil des Satzes wird nicht geprueft')
  })

  it('der Satz sagt, was zu tun ist', () => {
    const s = hindernisSatz('mehrere_phasen')
    assert.match(s, /Waehle das Ziel/,
      'der Satz nennt die Handlung nicht')
    assert.ok(!/Fehler|fehlgeschlagen|500/.test(s),
      'der Satz klingt nach einem technischen Fehler')
  })

  it('jedes Hindernis hat seinen eigenen Satz', () => {
    // `[read]` **Fuenf Hindernisse, fuenf Saetze** — vorher standen
    // zwei Saetze fuer vier Faelle in `tab-composition.tsx`.
    const alle: Hindernis[] = ['profil_unvollstaendig',
      'zielrichtung_ohne_faktor', 'keine_aktive_phase',
      'phasenparameter_fehlt', 'mehrere_phasen']
    const saetze = alle.map(h => hindernisSatz(h))
    assert.equal(new Set(saetze).size, alle.length,
      'zwei Hindernisse teilen sich einen Satz — dann sagt er nicht, '
      + 'was zu tun ist')
  })

  it('die Anzeige nutzt hindernisSatz, nicht eigene Texte', () => {
    const q = lies(join(WEB, 'app', 'v2', 'goals', 'tab-composition.tsx'))
    assert.match(q, /hindernisSatz\(vorschlag\.hindernis, vorschlag\.fehlende_felder\)/,
      'die Anzeige baut eigene Saetze — dann driften zwei Kopien, '
      + 'und neue Hindernisse bekommen den falschen Text')
    assert.ok(!/hindernis === 'profil_unvollstaendig'\s*\n?\s*\?/.test(q),
      'der alte Zweisatz-Zweig steht wieder da — er gab allem ausser '
      + 'profil_unvollstaendig den Satz ueber den Kalorienfaktor')
  })
})

// ════════════════════════════════════════════════════════════════
// A-30 — der Satz steht server-frei
// ════════════════════════════════════════════════════════════════

describe('G-568 — hindernisSatz zieht keinen Server-Baum', () => {
  it('die Datei hat kein I/O', () => {
    // `[cmd]` **Der Composition-Reiter ist `'use client'`** und
    // braucht den Satz. `[read]` **Ein Wert-Import aus
    // `zielwerte-read.ts` zoege `next/headers` ins Buendel** —
    // dieselbe Klasse wie G-74, G-412, G-537.
    const q = lies(join(HIER, '..', 'zielwerte-hindernis.ts'))
    assert.ok(!/@lumeos\/shared\/session|next\/headers|createSessionClient/.test(q),
      'zielwerte-hindernis.ts zieht den Server-Baum')
  })

  it('der Reiter importiert aus der server-freien Datei', () => {
    const q = lies(join(WEB, 'app', 'v2', 'goals', 'tab-composition.tsx'))
    assert.match(q, /from '\.\.\/\.\.\/\.\.\/lib\/profile\/zielwerte-hindernis'/,
      'der Reiter holt den Satz aus zielwerte-read — das gaebe '
      + 'HTTP 500 (A-30)')
    assert.ok(!/^import \{[^}]*hindernisSatz[^}]*\} from '.*zielwerte-read'/m.test(q),
      'der Wert-Import aus zielwerte-read steht wieder da')
  })
})

// ════════════════════════════════════════════════════════════════
// Gegen die Funktion, die kommt
// ════════════════════════════════════════════════════════════════

describe('G-568 — gegen G-563 gehalten', () => {
  const SQL = () => readFileSync(
    join(PIPELINE, '563_target_scoped_calculation.sql'), 'utf8')

  it('die neue Fassung nimmt p_goal_id', () => {
    assert.match(SQL(), /p_user_id uuid,\s*\n\s*p_goal_id uuid,\s*\n\s*p_stichtag date DEFAULT CURRENT_DATE/,
      'die Signatur weicht von dem ab, was der Aufruf nennt')
  })

  it('das Ergebnis traegt goal_id', () => {
    assert.match(SQL(), /body_weight_kg numeric,\s*\n\s*goal_id uuid\s*\n\)/,
      'goal_id steht nicht am Ende der Rueckgabe — dann liest der '
      + 'Leseweg ein Feld, das es nicht gibt')
  })

  it('die alte Fassung wirft, statt still zu waehlen', () => {
    const q = SQL()
    assert.match(q, /RAISE EXCEPTION\s*\n\s*'nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag; Zielbezug fehlt'/,
      'die alte Fassung waehlt wieder still eine Phase')
    assert.match(q, /USING ERRCODE = '23514'/,
      'die Ausnahme traegt keinen Code')
  })

  it('der Satz im Code ist zeichengleich zur Ausnahme', () => {
    // `[read]` **Die Falle: zwei Schreibweisen desselben Satzes.**
    // **Dann erkennt `istMehrdeutig` ihn nicht, und der Nutzer sieht
    // HTTP 500.**
    const sql = SQL().toLowerCase()
    const q = R().toLowerCase()
    for (const teil of ['mehrere aktive phasen', 'zielbezug fehlt']) {
      assert.ok(sql.includes(teil),
        `die SQL-Ausnahme enthaelt „${teil}" nicht mehr`)
      assert.ok(q.includes(teil),
        `istMehrdeutig sucht „${teil}" nicht — die zwei driften`)
    }
  })
})
