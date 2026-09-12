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

test('G-433: wo der Name fehlt, steht der GRUND', () => {
  // ══ Die Sabotage, die gruen blieb ═════════════════════════════
  //
  // `[cmd]` **`grund:` zu `ungenutzt:` umbenannt — alle Proben
  // blieben GRUEN.** `[read]` **Eine Luecke ohne Begruendung ist
  // eine Falschaussage in Wartestellung:** am Schirm steht dann
  // „kein Name", ohne dass jemand weiss warum.
  for (const [code, e] of Object.entries(EBENEN)) {
    if (e.name !== null) continue
    if (e.art === 'umriss') continue // Umrisse brauchen keinen
    assert.ok(e.grund && e.grund.length > 20,
      `"${code}" hat keinen Namen in muscle_groups und KEINEN Grund. `
      + 'Wo der Katalog schweigt, muss die Einordnung sagen warum.')
  }
})

test('G-438: nur Namen, die `muscle_groups` WIRKLICH fuehrt', () => {
  // ══ G-438: die Zusage ist umgedreht, nicht gestrichen ═════════
  //
  // `[cmd]` **Hier stand: „die drei Vastus stehen NICHT in
  // EBENEN"** — mit der Begruendung *„muscle_groups fuehrt ihn
  // nicht, also gibt es ihn fuer LumeOS nicht."*
  //
  // `[cmd]` **C-482 hat `Vastus Lateralis` und `Vastus Medialis`
  // geliefert** (gemessen `tools/_g438-zuordnung.mjs`,
  // 2026-09-12). **Die Begruendung stimmt fuer sie nicht mehr** —
  // und solange sie `name: null` trugen, waren ihre Flaechen
  // gefaerbt und in der Liste leer. **Das war Toms Befund.**
  //
  // `[read]` **Die Regel dahinter gilt weiter und wird schaerfer:**
  // **in `EBENEN` steht ein Name genau dann, wenn `muscle_groups`
  // ihn fuehrt.** `[read]` **Der dritte Vastus zeigt, dass die
  // Zusage noch beisst** — ihn gibt es dort NICHT.
  const alle = JSON.stringify(EBENEN).toLowerCase()

  // Diese beiden MUESSEN jetzt dastehen.
  assert.equal(EBENEN['vastus-lateralis']?.name, 'Vastus Lateralis',
    'C-482 fuehrt den Namen — ohne ihn ist die Flaeche gefaerbt '
    + 'und hat keine Listenzeile.')
  assert.equal(EBENEN['vastus-medialis']?.name, 'Vastus Medialis')

  // Dieser NICHT — `muscle_groups` kennt ihn nicht.
  assert.ok(!alle.includes('vastus intermedius'),
    '"Vastus Intermedius" steht in EBENEN — `muscle_groups` fuehrt '
    + 'ihn NICHT (gemessen 2026-09-12), also waere er erfunden.')
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

test('G-433: quadriceps ist in seine Straenge zerlegt', () => {
  // ══ Das Urteil aus G-432 ist widerrufen ═══════════════════════
  //
  // **Tom:** *„ja alles trennen was unsere grafik hergibt."*
  //
  // `[cmd]` **G-432 liess `quadriceps` ganz**, weil `muscle_groups`
  // die drei Vastus nicht fuehrt. **Das war der alte Denkfehler:**
  // ob die Grafik trennt, entscheidet das BILD — ob es einen Namen
  // gibt, die DATENBANK.
  //
  // `[cmd]` **Am Bild: drei Straenge je Schenkel.**
  for (const neu of ['rectus-femoris', 'vastus-lateralis', 'vastus-medialis']) {
    assert.ok(MUSKELN[neu], `Die Flaeche "${neu}" fehlt in der Karte.`)
  }
  assert.ok(!MUSKELN.quadriceps,
    '`quadriceps` steht noch als eine Flaeche da — sie ist in G-433 '
    + 'in ihre drei Straenge zerlegt worden.')
  // `[read]` **Nur der Rectus femoris hat einen Namen** — die zwei
  // Vastus sind ausgewiesene Luecken, keine erfundenen Namen.
  assert.equal(EBENEN['rectus-femoris']?.name, 'Rectus Femoris')
  // `[cmd]` **G-438: hier stand `null`** — C-482 hat den Namen
  // geliefert, und ohne ihn blieb die gefaerbte Flaeche ohne
  // Listenzeile (Toms Befund).
  assert.equal(EBENEN['vastus-lateralis']?.name, 'Vastus Lateralis',
    'Vastus lateralis steht NICHT in muscle_groups — der Name darf '
    + 'nicht erfunden werden.')
  assert.ok(EBENEN['vastus-lateralis']?.grund,
    'Wo der Name fehlt, gehoert der Grund dazu.')
})

test('G-433: calves ist in zwei Koepfe plus Sehne zerlegt', () => {
  for (const neu of ['gastrocnemius-lateralis', 'gastrocnemius-medialis',
    'achillessehne']) {
    assert.ok(MUSKELN[neu], `Die Flaeche "${neu}" fehlt in der Karte.`)
  }
  assert.ok(!MUSKELN.calves,
    '`calves` steht noch als eine Flaeche da — sie ist in G-433 zerlegt.')
  // `[read]` **Die Sehne ist KEIN Muskel** — Tom: *„sehnen brauchen
  // wir dann anwaehlbar fuer painpoints."*
  assert.equal(EBENEN.achillessehne?.art, 'sehne',
    'Die Achillessehne ist eine Sehne, kein Muskel.')
})


test('G-433: der Trizeps ist in seine drei Koepfe zerlegt', () => {
  // ══ Das Urteil aus G-425/G-432 ist widerrufen ═════════════════
  //
  // **Tom, 2026-09-12:** *„triceps, forearms, neck sind nicht
  // getrennt."*
  //
  // `[cmd]` **G-425 nahm `triceps` als Beleg fuer die falsche
  // Regel** (*„drei Koepfe und bleibt EIN Muskel"*), **G-432 liess
  // ihn zusammen, weil `muscle_groups` die Koepfe nicht fuehrt.**
  //
  // `[cmd]` **Am Bild sind es drei getrennte Straenge je Arm** —
  // und der fehlende Name ist eine Luecke im Katalog, kein Grund.
  // ══ G-438: die Zusage ist umgedreht ═════════════════════════
  //
  // `[cmd]` **Hier stand `name: null`** mit der Begruendung
  // *„muscle_groups fuehrt `Triceps` als Blatt."* **C-482 hat die
  // drei Koepfe geliefert** — seither hat `Triceps` drei Kinder
  // (gemessen 2026-09-12).
  //
  // `[read]` **Solange sie namenlos waren, faerbte die Karte sie
  // und die Liste hatte keine Zeile dafuer** — genau Toms Befund
  // *„arms triceps ist orange, zeigt aber keine werte"*.
  const KOEPFE: Record<string, string> = {
    'triceps-longum': 'Triceps Brachii Long Head',
    'triceps-lateralis': 'Triceps Brachii Lateral Head',
    'triceps-mediale': 'Triceps Brachii Medial Head',
  }
  for (const [neu, name] of Object.entries(KOEPFE)) {
    assert.ok(MUSKELN[neu], `Die Flaeche "${neu}" fehlt in der Karte.`)
    assert.equal(EBENEN[neu]?.name, name,
      `"${neu}" traegt nicht den Namen aus muscle_groups — dann ist `
      + 'die Flaeche gefaerbt und hat keine Listenzeile.')
    assert.ok(EBENEN[neu]?.grund, 'Der Grund gehoert weiterhin dazu.')
    assert.ok((EBENEN[neu]?.weg ?? []).includes('Triceps'),
      `"${neu}" haengt im Baum nicht unter \`Triceps\`.`)
  }
  assert.ok(!MUSKELN.triceps,
    '`triceps` steht noch als eine Flaeche da — sie ist in G-433 zerlegt.')
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
