/**
 * G-537 — ein Ziel laesst sich anlegen
 *
 * `[cmd]` **`lib/goals/schreiben.ts` kannte `zielAendern` und
 * `reihenfolgeSetzen` — kein `zielAnlegen`.** `[read]` **Man konnte
 * in LumeOS kein Ziel erstellen;** die Zeilen in der Datenbank sind
 * Seed.
 *
 * `[cmd]` **Die vier Regeln gegen die laufende Datenbank geprueft,
 * 2026-09-29** — je einmal abgewiesen:
 *
 *     Titel leer            user_goals_title_check
 *     Deadline vor Start    user_goals_check
 *     Prioritaet 4 aktiv    user_goals_check1
 *     Zielart erfunden      user_goals_goal_type_check
 *     Prioritaet doppelt    uq_user_goals_active_slot (23505)
 *
 * `[read]` **Hier stehen sie nur frueher** — damit die Nutzerin
 * einen Satz sieht und keine Postgres-Meldung.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  ZIELARTEN, pruefeNeuesZiel, PRIO_MIN_AKTIV, PRIO_MAX_AKTIV,
  type ZielNeu,
} from '../ziel-regeln'

const HIER = dirname(fileURLToPath(import.meta.url))

/** Ein gueltiges Ziel — je Fall gezielt verstellt. */
const GUELTIG: ZielNeu = {
  goal_type: 'body_composition',
  title: 'Auf 12 % Koerperfett',
  gueltig_ab: '2026-09-29',
  priority: 1,
}

const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

describe('G-537/A2 — die vier Regeln, von beiden Seiten', () => {
  it('die Wurzelmarke stimmt — sonst misst der Rest nichts', () => {
    assert.deepEqual(pruefeNeuesZiel(GUELTIG), [],
      'ein gueltiges Ziel wird abgewiesen')
  })

  // ── 1 · Die vier Arten aus dem CHECK ────────────────────────────
  //
  // `[read]` **Ausgeschrieben, nicht aus ZIELARTEN abgeleitet** —
  // sonst prueft sich die Liste gegen sich selbst.
  it('genau die vier Arten aus user_goals_goal_type_check', () => {
    assert.deepEqual([...ZIELARTEN.map(a => a.id)].sort(),
      ['body_composition', 'health', 'lifestyle', 'performance'],
      'die Artenliste weicht vom CHECK ab')
  })

  it('eine erfundene Art wird abgewiesen', () => {
    // `[cmd]` **Der Entwurf zeigt sechs** (`module-goals.jsx:696`:
    // weight, strength, habit, custom) — **die Datenbank vier.**
    const f = pruefeNeuesZiel({ ...GUELTIG, goal_type: 'strength' as never })
    assert.equal(f.length, 1, '„strength" geht durch — es ist ein subtype')
    assert.equal(f[0].feld, 'goal_type')
  })

  // ── 2 · Titel ───────────────────────────────────────────────────
  it('ein Titel aus Leerzeichen zaehlt als leer', () => {
    // [cmd] user_goals_title_check: btrim(title) <> ''
    assert.equal(pruefeNeuesZiel({ ...GUELTIG, title: '   ' }).length, 1,
      'ein Titel aus Leerzeichen geht durch — der CHECK trimmt')
    assert.equal(pruefeNeuesZiel({ ...GUELTIG, title: 'A' }).length, 0,
      'ein Zeichen reicht dem CHECK')
  })

  // ── 3 · Deadline ────────────────────────────────────────────────
  it('die Deadline darf nicht vor dem Start liegen', () => {
    // [cmd] user_goals_check: target_date IS NULL OR >= gueltig_ab
    const davor = pruefeNeuesZiel({ ...GUELTIG, target_date: '2026-09-28' })
    assert.equal(davor.length, 1, 'eine Deadline vor dem Start geht durch')
    assert.equal(davor[0].feld, 'target_date')

    assert.equal(pruefeNeuesZiel({ ...GUELTIG, target_date: '2026-09-29' }).length, 0,
      'der Starttag selbst wird abgewiesen — der CHECK erlaubt >=')
    assert.equal(pruefeNeuesZiel({ ...GUELTIG, target_date: null }).length, 0,
      'ohne Deadline wird abgewiesen — der CHECK erlaubt NULL')
  })

  // ── 4 · Prioritaet ──────────────────────────────────────────────
  it('ein aktives Ziel traegt 1 bis 3', () => {
    // [cmd] user_goals_check1
    for (const p of [PRIO_MIN_AKTIV, 2, PRIO_MAX_AKTIV]) {
      assert.equal(pruefeNeuesZiel({ ...GUELTIG, priority: p }).length, 0,
        `Prioritaet ${p} wird abgewiesen`)
    }
    for (const p of [0, 4, 10]) {
      const f = pruefeNeuesZiel({ ...GUELTIG, priority: p })
      assert.equal(f.length, 1, `Prioritaet ${p} geht durch`)
      assert.equal(f[0].feld, 'priority')
    }
  })

  it('eine gebrochene Prioritaet wird abgewiesen', () => {
    assert.equal(pruefeNeuesZiel({ ...GUELTIG, priority: 1.5 }).length, 1,
      '1,5 geht durch — die Spalte ist ganzzahlig')
  })

  it('ein Startdatum ist Pflicht', () => {
    // [cmd] gueltig_ab NOT NULL
    assert.equal(pruefeNeuesZiel({ ...GUELTIG, gueltig_ab: '' }).length, 1,
      'ohne Startdatum geht es durch — die Spalte ist NOT NULL')
  })

  it('mehrere Fehler kommen einzeln zurueck', () => {
    // `[read]` **Ein Sammelsatz liesse sich nicht am Feld anzeigen.**
    const f = pruefeNeuesZiel({
      ...GUELTIG, title: '', priority: 9, target_date: '2026-01-01',
    })
    assert.equal(f.length, 3, `drei Fehler erwartet, ${f.length} gekommen`)
    assert.deepEqual(f.map(x => x.feld).sort(),
      ['priority', 'target_date', 'title'])
  })
})

describe('G-537/A1 — der Schreibweg', () => {
  const S = () => ohneKommentare(
    readFileSync(join(HIER, '..', 'schreiben.ts'), 'utf8'))

  it('zielAnlegen gibt es', () => {
    assert.match(S(), /export async function zielAnlegen/,
      'der Anlegeweg fehlt wieder')
  })

  it('er zaehlt die Zeilen, die er getroffen hat', () => {
    const q = S()
    const i = q.indexOf('export async function zielAnlegen')
    const rumpf = q.slice(i, i + 1800)
    // `[read]` **Der Fehler aus G-79:** ohne `.select('id')` meldet
    // PostgREST auch dann Erfolg, wenn der Zeilenschutz alles
    // weggefiltert hat.
    assert.match(rumpf, /\.select\('id'\)/,
      'kein .select(id) — ein weggefiltertes INSERT kaeme als Erfolg '
      + 'zurueck (G-79)')
    assert.match(rumpf, /data\.length === 0/,
      'die Zeilenzahl wird nicht geprueft')
  })

  it('der belegte Platz wird ein Satz, kein Postgres-Fehler', () => {
    const q = S()
    const i = q.indexOf('export async function zielAnlegen')
    const rumpf = q.slice(i, i + 1800)
    assert.match(rumpf, /'23505'/, 'der Code wird nicht gefangen')
    assert.match(rumpf, /active_slot/, 'der Index wird nicht erkannt')
    assert.match(rumpf, /schon vergeben/,
      'der Satz aus G-79 fehlt — der Nutzer bekaeme eine '
      + 'Postgres-Meldung')
  })

  it('er nutzt die Pruefung aus ziel-regeln, nicht eine eigene', () => {
    assert.match(S(), /pruefeNeuesZiel\(/,
      'der Schreibweg prueft selbst — zwei Kopien driften')
  })

  it('ein neues Ziel ist aktiv', () => {
    const q = S()
    const i = q.indexOf('export async function zielAnlegen')
    assert.match(q.slice(i, i + 1800), /status: 'active'/,
      'der Status wird nicht gesetzt — dann greift user_goals_check1 '
      + 'nicht und die Prioritaet waere unbegrenzt')
  })
})

describe('G-537/A4 — der Dialog vermischt nichts', () => {
  const M = () => ohneKommentare(
    readFileSync(join(HIER, '..', '..', '..', 'app', 'v2', 'goals', 'modale.tsx'), 'utf8'))

  it('kein Ernaehrungsziel im Anlegedialog', () => {
    const q = M()
    const i = q.indexOf('function NewGoalModal')
    const rumpf = q.slice(i, q.indexOf('function GoalDetailModal'))
    // `[read]` **Ein `body_composition`-Ziel sagt WOHIN, eine
    // Strategie sagt WIE** — und nur die zweite aendert die
    // Tageswerte. **Der Dialog darf das nicht vermischen, auch
    // nicht durch einen Hinweis.**
    // ══ G-554/A1: „Strategie" ist hier nicht mehr verboten ════
    //
    // `[cmd]` G-537 schloss sie aus: **der Katalog war nicht live.**
    // `[cmd]` **`goal_strategies` hat seit G-536 siebzehn Zeilen**,
    // und G-554 bringt die Wahl in den Dialog — **aber nur bei
    // `body_composition` und freiwillig.**
    //
    // `[read]` **Was verboten BLEIBT, ist Schicht 2:** konkrete
    // Tageswerte. Ein Ziel sagt wohin, eine Strategie wie —
    // **Kalorien und Makros rechnet weiterhin niemand hier.**
    for (const wort of ['nutrition_targets', 'Kalorienziel', 'Tageswert',
      'kcal']) {
      assert.ok(!rumpf.includes(wort),
        `der Dialog nennt „${wort}" — das ist Schicht 2 (G-536)`)
    }
  })

  it('„Linked modules" traegt eine Marke, eine Zeile', () => {
    const q = M()
    assert.match(q, /attrappeAus\('theme-v1\/module-goals\.jsx',/,
      'die Marke fehlt — dann sieht der Platz echt aus')
    assert.match(q, /wartet auf: G-536/,
      'die Marke nennt den Punkt nicht, auf den sie wartet')
  })

  it('der Knopf ist gesperrt, solange die Eingabe nicht traegt', () => {
    assert.match(M(), /disabled=\{laeuft \|\| felder\.length > 0\}/,
      'der Knopf laesst sich druecken, obwohl die Pruefung faellt')
  })

  // ── Die Modulwahl ist BEDIENBAR ─────────────────────────────────
  //
  // `[read]` **Die verknuepften Module sind die Datenquelle:** der
  // Entwurf gibt jedem Ziel `history[]` und `pace`, `user_goals`
  // traegt `auto_update`. **Der Ist-Wert kommt aus den Modulen, er
  // wird nicht getippt.**
  //
  // `[read]` **Ein Feld, das man nicht anklicken kann, prueft
  // niemand** — deshalb ist die Wahl bedienbar, obwohl die Spalte
  // fehlt.
  it('die fuenf Module lassen sich anklicken', () => {
    const q = M()
    assert.match(q, /data-zielmodul=\{m\}/,
      'die Module sind keine Knoepfe — dann prueft die Wahl niemand')
    assert.ok(!/InEntwicklungKnopf key=\{m\}/.test(q),
      'die Module sind wieder Noch-nicht-Knoepfe')
  })

  it('die Wahl wird gehalten', () => {
    const q = M()
    assert.match(q, /const \[module, setModule\] = React\.useState/,
      'die Wahl wird nicht gehalten — sie waere nach einem Klick weg')
    assert.match(q, /aria-pressed=\{an\}/,
      'der gewaehlte Zustand ist nicht ablesbar')
  })

  it('es sind die fuenf aus dem Entwurf', () => {
    const q = M()
    assert.match(q,
      /const MODULE = \['nutrition', 'training', 'recovery', 'supplements', 'medical'\]/,
      'die Modulliste weicht vom Entwurf ab')
  })
})
