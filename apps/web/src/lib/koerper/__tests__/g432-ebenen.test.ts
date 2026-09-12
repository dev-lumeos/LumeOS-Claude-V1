// G-432 — welche EBENE zeigt eine Kartenflaeche?
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **1 — die berichtigte Regel.** `[cmd]` **G-425 formulierte
// *„EIN Muskel, mehrere Pfade -> zusammenlassen"* mit der Begruendung
// *„triceps hat drei Koepfe und bleibt EIN Muskel"*** — falsch, und
// dreimal weitergereicht.
//
// **2 — dass KEIN Name erfunden ist.** `[read]` **Jeder `name` in
// `EBENEN` muss in `training.muscle_groups` stehen** — die drei
// Vastus tun es nicht, also gibt es sie fuer LumeOS nicht.
//
// **3 — dass `art` den KINDERN folgt**, nicht der Tiefe. `[cmd]`
// **Die Probe `tools/_g432-pruefen.mjs` hat diese Verwechslung bei
// `calves` gefunden:** Kind von `Lower Legs` UND Gruppe ueber
// `Soleus` — zwei Fragen, zwei Felder.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { MUSKELN } from '@lumeos/ui'

import { EBENEN, gruppen, muskeln, ungezeichneteKinder } from '../ebenen'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..', '..')

/** Die Namen aus der Kettendatei — die Quelle, die Codex pflegt. */
function ausMuscleGroups(): string[] {
  const sql = readFileSync(join(WURZEL, 'supabase', '_pipeline', '10_training',
    '107_muscle_groups_hierarchy.sql'), 'utf8')
  // `[cmd]` **Die Namen stehen als `('Name', 'Anzeige'),`** —
  // erst der Schluessel, dann die Beschriftung.
  // `[read]` **`exec` in der Schleife statt `matchAll`** — das Ziel
  // dieses Projekts kennt den Iterator nicht (`TS2802`).
  const muster = /\(\s*'([^']+)'\s*,\s*'[^']*'\s*\)/g
  const aus: string[] = []
  let m: RegExpExecArray | null
  while ((m = muster.exec(sql)) !== null) aus.push(m[1])
  return aus
}

test('G-432: KEIN Name in EBENEN ist erfunden', () => {
  // ══ Der Kern des Auftrags ═════════════════════════════════════
  //
  // `[read]` **„Keinen Muskelnamen erfinden — die drei Vastus stehen
  // nicht in muscle_groups, also gibt es sie fuer LumeOS nicht."**
  const bekannt = ausMuscleGroups().map(n => n.toLowerCase())
  assert.ok(bekannt.length > 50,
    `nur ${bekannt.length} Namen geparst — das Muster passt nicht`)

  for (const [code, e] of Object.entries(EBENEN)) {
    if (e.name === null) continue
    assert.ok(bekannt.includes(e.name.toLowerCase()),
      `"${code}" nennt "${e.name}" — dieser Name steht NICHT in `
      + 'muscle_groups. Ein erfundener Name ist eine Falschaussage '
      + 'ueber den Koerper.')
    for (const kind of e.kinder) {
      assert.ok(bekannt.includes(kind.toLowerCase()),
        `"${code}" nennt das Kind "${kind}" — steht NICHT in muscle_groups.`)
    }
  }
})

test('G-432: die drei Vastus stehen NICHT in EBENEN', () => {
  // `[cmd]` **Die Gegenprobe zum Test darueber** — sie fangen
  // einander: der eine verbietet Erfundenes, dieser nennt die
  // konkreten Namen, um die es ging.
  const alle = JSON.stringify(EBENEN).toLowerCase()
  for (const erfunden of ['vastus lateralis', 'vastus medialis',
    'vastus intermedius']) {
    assert.ok(!alle.includes(erfunden),
      `"${erfunden}" steht in EBENEN — muscle_groups fuehrt ihn nicht, `
      + 'also gibt es ihn fuer LumeOS nicht.')
  }
})

test('G-432: `art` folgt den KINDERN, nicht der Tiefe', () => {
  // `[cmd]` **Die Verwechslung, die die Probe gefunden hat:**
  // `calves` ist Kind von `Lower Legs` (Ebene 3) UND Gruppe ueber
  // `Soleus`. **Beides wahr — `art` beantwortet nur die zweite Frage.**
  for (const [code, e] of Object.entries(EBENEN)) {
    if (e.art === 'umriss') {
      assert.equal(e.name, null,
        `"${code}" ist ein Umriss und darf keinen Muskelnamen tragen.`)
      assert.deepEqual(e.kinder, [],
        `"${code}" ist ein Umriss und kann keine Kinder haben.`)
      continue
    }
    if (e.name === null) continue // `flanke` — kein Name, aber ein Muskel
    const erwartet = e.kinder.length > 0 ? 'gruppe' : 'muskel'
    assert.equal(e.art, erwartet,
      `"${code}" hat ${e.kinder.length} Kinder, also muss art `
      + `"${erwartet}" sein, nicht "${e.art}".`)
  }
})

test('G-432: quadriceps ist eine GRUPPE, kein Muskel', () => {
  // ══ Toms Befund, als Zusage ═══════════════════════════════════
  //
  // **„quadrizeps ist eine muskelgruppe und hat x muskeln."**
  const q = EBENEN.quadriceps
  assert.ok(q, 'die Flaeche `quadriceps` fehlt in EBENEN')
  assert.equal(q.art, 'gruppe',
    'quadriceps ist eine Muskelgruppe (Legs > Quadriceps), kein '
    + 'einzelner Muskel — das war der Fehler aus G-425/G-431.')
  assert.deepEqual(q.kinder, ['Rectus Femoris'],
    'muscle_groups fuehrt genau ein Kind unter Quadriceps.')
  assert.ok(q.grund && q.grund.length > 20,
    'Wo nicht geteilt wird, gehoert der Grund dazu (A4).')
  // `[cmd]` **Und die Flaeche ist NICHT geteilt** — der Pruefstein
  // traegt das Urteil, nur nicht die alte Begruendung.
  assert.ok(MUSKELN.quadriceps,
    'quadriceps ist aus der Karte verschwunden — die drei Vastus '
    + 'haben keinen Namen, also darf nicht geteilt werden.')
})

test('G-432: calves ist ein KIND von Lower Legs', () => {
  const c = EBENEN.calves
  assert.deepEqual(c.weg, ['Legs', 'Lower Legs', 'Calves'],
    'Der Weg muss die ganze Kette nennen — `Lower Legs` ist die Gruppe.')
  assert.equal(c.weg.length, 3, 'calves steht auf Ebene 3.')
  assert.deepEqual(c.kinder, ['Soleus'],
    'muscle_groups fuehrt Soleus unter Calves.')
  assert.ok(MUSKELN.calves,
    'calves ist aus der Karte verschwunden — Soleus liegt darunter '
    + 'und wird nicht gezeichnet, also wird nicht geteilt.')
})

test('G-432: triceps ist ein BLATT — richtig, aus dem richtigen Grund', () => {
  // `[read]` **Hier lag der Ursprung der falschen Regel.** `[cmd]`
  // **Das Urteil war richtig, die Begruendung nicht:** nicht weil ein
  // Muskel mit Koepfen ein Muskel bleibt, sondern **weil die Koepfe
  // keinen Namen haben.**
  const t = EBENEN.triceps
  assert.equal(t.art, 'muskel')
  assert.deepEqual(t.kinder, [],
    'muscle_groups fuehrt KEINE Kinder unter Triceps — genau deshalb '
    + 'wird nicht geteilt.')
})

test('G-432: jede gezeichnete Flaeche ist eingeordnet', () => {
  // `[read]` **Ohne diese Probe faellt eine neue Flaeche durch** —
  // sie waere gezeichnet, aber ohne Ebene, und das Modal zeigte
  // weder Marke noch Weg.
  const ohne = Object.keys(MUSKELN).filter(code => !EBENEN[code])
  assert.deepEqual(ohne, [],
    `Diese Flaechen der Karte haben keine Ebene: ${ohne.join(', ')}. `
    + 'Jede gezeichnete Flaeche gehoert in EBENEN.')
})

test('G-432: Gruppen nennen ihre ungezeichneten Kinder', () => {
  // ══ A3/A4: der Elternteil bleibt als Gruppe, mit Grund ════════
  for (const code of gruppen()) {
    const e = EBENEN[code]
    assert.ok(e.kinder.length > 0,
      `"${code}" gilt als Gruppe, nennt aber keine Kinder.`)
    assert.ok(e.grund && e.grund.length > 20,
      `"${code}" ist eine Gruppe ohne Grund — wo NICHT geteilt wird, `
      + 'muss stehen warum (A4).')
    assert.deepEqual(ungezeichneteKinder(code), e.kinder,
      'Die Oberflaeche muss dieselben Kinder nennen wie die Einordnung.')
  }
  // `[read]` **Die Gegenrichtung:** ein Blatt hat keine Kinder.
  for (const code of muskeln()) {
    assert.deepEqual(EBENEN[code].kinder, [],
      `"${code}" gilt als einzelner Muskel, nennt aber Kinder.`)
  }
})

test('G-432: die Umrisse haben keinen Namen', () => {
  // `[cmd]` **Gemessen: `muscle_groups` fuehrt keinen von ihnen.**
  for (const code of ['knees', 'hands', 'ankles', 'feet', 'head', 'hair']) {
    assert.equal(EBENEN[code]?.art, 'umriss',
      `"${code}" zeichnet die Figur und ist kein Muskel.`)
  }
})
