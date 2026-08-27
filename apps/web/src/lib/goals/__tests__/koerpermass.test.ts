// G-122: die Koerpermessung — Rechnung, Naht und der Snapshot.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  pruefeMessung, abgeleitet, LEERE_MESSUNG, BF_METHODEN, OHNE_GROESSE,
  type KoerpermassEingabe,
} from '../koerpermass-rechnung'

const GUELTIG: KoerpermassEingabe = {
  ...LEERE_MESSUNG,
  measurement_date: '2026-08-27',
  measurement_time: '07:30',
  weight_kg: '85',
  body_fat_pct: '15.13',
  bf_method: 'caliper_7',
}

// ── Die Formeln, gegen den Bestand geprueft ──────────────────────

test('G-122: BMI, Magermasse und Fettmasse wie im Bestand', () => {
  // `[cmd]` **Die Zahlen stammen aus einer echten Zeile**, gemessen
  // 2026-08-27: 85 kg, 185 cm, 15,13 % -> BMI 24,84 · lean 72,14 ·
  // fat 12,86. **Nicht ausgedacht** — ein Rechenfehler faellt damit
  // gegen den Bestand auf, nicht gegen eine Erfindung.
  const w = abgeleitet(85, 15.13, 185)
  assert.equal(w.bmi, 24.84)
  assert.equal(w.lean_mass_kg, 72.14)
  assert.equal(w.fat_mass_kg, 12.86)
})

test('G-122: FFMI ist NORMALISIERT, nicht roh', () => {
  // ══ DIE FALLE DIESES AUFTRAGS ═══════════════════════════════════
  //
  // `[cmd]` **Die naheliegende Formel `lean / m^2` ergibt 21,08 —
  // im Bestand steht 20,77.** Sie weicht bei **allen 362 Zeilen** ab.
  //
  // `[cmd]` **Der Bestand rechnet Kouri:** `+ 6.1 * (1.8 - m)`.
  // Damit: **0 Abweichungen bei 362.**
  //
  // `[read]` **Haette ich geraten, waere jede neue Zeile inkonsistent
  // zu den 362 vorhandenen gewesen** — und es waere erst
  // aufgefallen, wenn jemand zwei Messungen nebeneinander legt.
  const w = abgeleitet(85, 15.13, 185)
  assert.equal(w.ffmi, 20.77)
  const roh = 72.14 / (1.85 * 1.85)
  assert.ok(Math.abs(roh - 21.08) < 0.01, 'Die rohe Formel ergibt 21,08')
  assert.notEqual(w.ffmi, Math.round(roh * 100) / 100)
})

test('G-122: ohne Groesse gibt es kein BMI und kein FFMI', () => {
  // `[read]` **Aber Magermasse und Fettmasse schon** — eine Messung
  // ohne Groesse ist unvollstaendig, nicht wertlos.
  const w = abgeleitet(85, 15.13, null)
  assert.equal(w.bmi, null)
  assert.equal(w.ffmi, null)
  assert.equal(w.lean_mass_kg, 72.14)
  assert.equal(w.fat_mass_kg, 12.86)
})

test('G-122: ohne Koerperfett bleibt nur das BMI', () => {
  const w = abgeleitet(85, null, 185)
  assert.equal(w.bmi, 24.84)
  assert.equal(w.lean_mass_kg, null)
  assert.equal(w.ffmi, null)
})

test('G-122: der dritte Zustand ist benannt, nicht stillschweigend', () => {
  // `[cmd]` `profiles.height_cm` ist nullable — der Fall KANN
  // entstehen, anders als bei G-138. Heute betrifft er 0 von 362.
  assert.match(OHNE_GROESSE, /BMI und FFMI/)
  assert.match(OHNE_GROESSE, /trotzdem gespeichert/)
})

// ── Die Eingabepruefung ──────────────────────────────────────────

test('G-122: eine gueltige Messung hat keine Fehler', () => {
  assert.deepEqual(pruefeMessung(GUELTIG), [])
})

test('G-122: die Grenzen kommen aus dem Schema', () => {
  // `[cmd]` `body_measurements_weight_ck`: 20 bis 400.
  for (const g of ['19', '401']) {
    const f = pruefeMessung({ ...GUELTIG, weight_kg: g })
    assert.deepEqual(f.map(x => x.feld), ['weight_kg'], g)
  }
  // `[cmd]` `body_measurements_body_fat_ck`: 2 bis 70.
  for (const b of ['1', '71']) {
    const f = pruefeMessung({ ...GUELTIG, body_fat_pct: b })
    assert.deepEqual(f.map(x => x.feld), ['body_fat_pct'], b)
  }
})

test('G-122: die Uhrzeit ist Pflicht — sie steht im Schluessel', () => {
  // `[cmd]` `measurement_time` ist NOT NULL und Teil von
  // `body_measurements_user_date_time_uq`. `[read]` Ohne sie kaeme
  // ein Konflikt statt einer Meldung.
  const f = pruefeMessung({ ...GUELTIG, measurement_time: '' })
  assert.deepEqual(f.map(x => x.feld), ['measurement_time'])
})

test('G-122: Koerperfett ohne Methode ist eine Zahl ohne Herkunft', () => {
  // `[read]` **Dieselbe Regel wie A-51:** eine Zahl braucht ihre
  // Herkunft. Caliper und DEXA unterscheiden sich um Prozentpunkte.
  const f = pruefeMessung({ ...GUELTIG, bf_method: '' })
  assert.deepEqual(f.map(x => x.feld), ['bf_method'])
})

test('G-122: ohne Koerperfett braucht es keine Methode', () => {
  assert.deepEqual(
    pruefeMessung({ ...GUELTIG, body_fat_pct: '', bf_method: '' }), [])
})

test('G-122: die Methoden sind die des Schemas', () => {
  // `[cmd]` Aus `body_measurements_method_ck` gelesen.
  assert.equal(BF_METHODEN.length, 10)
  assert.ok((BF_METHODEN as readonly string[]).includes('dexa'))
  assert.deepEqual(
    pruefeMessung({ ...GUELTIG, bf_method: 'augenmass' }).map(x => x.feld),
    ['bf_method'])
})

test('G-122: Komma als Dezimaltrennzeichen', () => {
  assert.deepEqual(pruefeMessung({ ...GUELTIG, weight_kg: '85,4' }), [])
})

// ── Die Naht und der Snapshot ────────────────────────────────────

const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
const ohneKommentare = (p: string) => roh(p)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

function alleQuellen(): string[] {
  const aus: string[] = []
  const geh = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) geh(p)
      else if (/\.tsx?$/.test(e.name) && !/__tests__/.test(p)) aus.push(p)
    }
  }
  geh(path.join(process.cwd(), 'src'))
  return aus
}

test('G-122: genau EINE Datei schreibt auf `body_measurements`', () => {
  // **Die Naht, wie in G-211 gebaut und per Sabotage bewacht.**
  const schreiber: string[] = []
  for (const datei of alleQuellen()) {
    const s = fs.readFileSync(datei, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '')
    if (!/from\('body_measurements'\)/.test(s)) continue
    if (/\.(insert|update|upsert|delete)\(/.test(s)) {
      schreiber.push(datei.replace(process.cwd(), '').replace(/\\/g, '/'))
    }
  }
  assert.deepEqual(schreiber, ['/src/lib/goals/koerpermass-write.ts'],
    `Es schreiben ${schreiber.length} Dateien auf body_measurements. `
    + 'Soll: genau eine (G-122).')
})

test('G-122: der Snapshot wird beim ANLEGEN eingefroren', () => {
  // `[read]` **Die Groesse kommt aus dem Profil — einmal, beim
  // Schreiben.** Wer sie beim Lesen nachschlaegt, aendert rueckwirkend
  // jedes BMI der Vergangenheit.
  const s = ohneKommentare('src/lib/goals/koerpermass-write.ts')
  assert.match(s, /from\('profiles'\)[\s\S]{0,120}?height_cm/,
    'Die Groesse wird nicht aus dem Profil geholt (G-122).')
  assert.match(s, /height_cm_snapshot: hoehe/,
    'Der Snapshot wird nicht gesetzt (G-122).')
})

test('G-122: der Snapshot wird beim AENDERN NICHT neu geholt', () => {
  // ══ DER EIGENTLICHE NACHWEIS ════════════════════════════════════
  //
  // `[read]` **Das ist die Stelle, an der G-138 haette scheitern
  // koennen.** `messungAendern` liest die eingefrorene Groesse der
  // BESTEHENDEN Zeile und rechnet damit — es ruft
  // `groesseAusProfil` NICHT.
  const s = ohneKommentare('src/lib/goals/koerpermass-write.ts')
  const aendern = s.slice(s.indexOf('export async function messungAendern'))
  assert.doesNotMatch(aendern, /groesseAusProfil/,
    'Das Aendern holt die Groesse neu — damit aendert eine '
    + 'Profilkorrektur rueckwirkend alte Messungen (G-122).')
  assert.match(aendern, /height_cm_snapshot/,
    'Das Aendern liest den eingefrorenen Snapshot nicht (G-122).')

  // `[read]` **Geprueft wird der `.update({…})`-Rumpf, nicht die
  // ganze Funktion.** Der Name kommt dort auch im Lesezugriff und in
  // der Typzusicherung vor — ein blosses `doesNotMatch` ueber die
  // Funktion waere rot, obwohl nichts geschrieben wird.
  const rumpf = aendern.slice(aendern.indexOf('.update({'),
    aendern.indexOf('.eq(\'id\', id)'))
  assert.doesNotMatch(rumpf, /height_cm_snapshot/,
    'Das Aendern SCHREIBT den Snapshot — er muss unberuehrt bleiben (G-122).')
})

test('G-122: die generierten Spalten werden NIE geschrieben', () => {
  // ══ DER FUND, DER DEN BAU GEAENDERT HAT ═════════════════════════
  //
  // `[cmd]` **`bmi`, `ffmi`, `lean_mass_kg` und `fat_mass_kg` sind
  // `GENERATED ALWAYS`** — die Datenbank rechnet sie und **weist
  // einen Insert ab, der sie setzt.** Der erste Nachweislauf lief
  // genau darauf auf.
  //
  // `[read]` **Damit ist `height_cm_snapshot` das einzige Feld, das
  // eingefroren werden muss** — die vier folgen ihm automatisch.
  const s = ohneKommentare('src/lib/goals/koerpermass-write.ts')
  // `[read]` `exec`-Schleife statt `matchAll`: das TS-Ziel dieses
  // Pakets erlaubt kein Durchlaufen des Iterators (wie in G-210).
  const ruempfe: string[] = []
  const re = /\.(insert|update)\(\{/g
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    const ab = m.index
    const bis = s.indexOf('.select(', ab)
    ruempfe.push(s.slice(ab, bis < 0 ? ab + 900 : bis))
  }
  assert.ok(ruempfe.length >= 2, `nur ${ruempfe.length} Schreibruempfe`)
  for (const r of ruempfe) {
    for (const spalte of ['bmi', 'ffmi', 'lean_mass_kg', 'fat_mass_kg']) {
      assert.doesNotMatch(r, new RegExp(`\\b${spalte}:`),
        `Ein Schreibrumpf setzt \`${spalte}\` — die Spalte ist `
        + 'GENERATED ALWAYS, der Insert scheitert (G-122).')
    }
  }
})

test('G-122: jeder Schreibzugriff prueft auf null Zeilen', () => {
  // `[cmd]` **G-79:** PostgREST meldet `ok`, wenn RLS leerfiltert.
  const s = ohneKommentare('src/lib/goals/koerpermass-write.ts')
  const schreib = (s.match(/\.(insert|update)\(/g) ?? []).length
  const pruef = (s.match(/zeilen\.length === 0/g) ?? []).length
  assert.equal(pruef, schreib,
    `${schreib} Schreibaufrufe, ${pruef} Nullzeilenpruefungen (G-79/G-122).`)
})
