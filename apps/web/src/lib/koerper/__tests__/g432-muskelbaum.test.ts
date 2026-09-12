// G-432/A1–A6 — die Pfadnamen und der vollstaendige Muskelbaum.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **1 — alle 158 Pfade sind benannt** (A1). `[cmd]` **Der Auftrag
// nennt 160** — gemessen sind es 158, zweimal unabhaengig gezaehlt.
//
// **2 — die Deckung kommt aus `EBENEN`, nicht aus
// `MUSKEL_ZU_FLAECHE`** (A6). `[cmd]` **Die erste Fassung des Modals
// meldete *„95 von 95 gezeichnet, 0 Luecken"*** — weil jene Abbildung
// JEDEN Namen auf eine Flaeche legt, auch `Rhomboids`, der nicht
// gezeichnet ist. **Gemessen sind es 21 von 95.**
//
// **3 — die Luecken werden GENANNT, nicht weggelassen** (A6).
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSKELN } from '@lumeos/ui'

import { EBENEN } from '../ebenen'
import { PFADNAMEN, pfadSumme, nachArt } from '../pfadnamen'
import {
  baueBaum, wegZu, wurzelVon, deckung, type MuskelKnoten,
} from '../muskelbaum'

/** Ein kleiner Baum in der Form von `training.muscle_groups`. */
function baum(): MuskelKnoten[] {
  return [
    { id: '1', name: 'Legs', parent_id: null },
    { id: '2', name: 'Lower Legs', parent_id: '1' },
    { id: '3', name: 'Calves', parent_id: '2' },
    { id: '4', name: 'Soleus', parent_id: '3' },
    { id: '5', name: 'Quadriceps', parent_id: '1' },
    { id: '6', name: 'Rectus Femoris', parent_id: '5' },
    { id: '7', name: 'Back', parent_id: null },
  ]
}

test('G-432/A1: alle 158 Pfade sind benannt', () => {
  // `[cmd]` **Zweimal unabhaengig gezaehlt** — `_g431-zaehlen.mjs`
  // und eine Zaehlung der Zeichenketten. **Der Auftrag nennt 160.**
  assert.equal(pfadSumme(), 158,
    `Die Pfadtabelle traegt ${pfadSumme()} Pfade, die Karte 158. `
    + 'Eine Aufteilung verschiebt Pfade, sie erzeugt keine.')

  // Und die Summe stimmt mit der Karte ueberein.
  let ausKarte = 0
  for (const m of Object.values(MUSKELN)) {
    ausKarte += (m.paths?.length ?? 0)
      + (m.paths_front?.length ?? 0) + (m.paths_back?.length ?? 0)
  }
  assert.equal(pfadSumme(), ausKarte,
    `Tabelle ${pfadSumme()}, Karte ${ausKarte} — sie sind auseinandergelaufen.`)
})

test('G-432/A2: wo kein eigener Muskel, steht die Art', () => {
  // `[read]` **Der Auftrag verlangt es ausdruecklich:** *„Wo ein Pfad
  // KEINEN eigenen Muskel zeigt (Segment, Sehne, Schattierung), wird
  // das so benannt."*
  const erlaubt = ['muskel', 'seite', 'segment', 'sehne', 'schattierung', 'umriss']
  for (const p of PFADNAMEN) {
    assert.ok(erlaubt.includes(p.art),
      `"${p.flaeche}/${p.ansicht}" hat die unbekannte Art "${p.art}".`)
    assert.ok(p.bild && p.bild.length > 15,
      `"${p.flaeche}/${p.ansicht}" hat keine Begruendung aus dem Bild.`)
    // `[cmd]` **Ein Umriss traegt NIE einen Muskelnamen.**
    if (p.art === 'umriss') {
      assert.equal(p.name, null,
        `"${p.flaeche}" ist ein Umriss und darf keinen Muskelnamen tragen.`)
    }
  }
  const summe = nachArt()
  assert.ok(summe.umriss > 0, 'Kein einziger Umriss-Pfad — das kann nicht sein.')
  assert.ok(summe.segment > 0, 'Kein einziger Segment-Pfad — das kann nicht sein.')
})

test('G-432/A6: der Baum nennt die Luecken', () => {
  const k = baum()
  // Nur `Calves` ist gezeichnet — alles andere ist Luecke.
  const aeste = baueBaum(k, { Calves: 'calves' })
  const legs = aeste.find(a => a.name === 'Legs')
  assert.ok(legs, 'die Wurzel `Legs` fehlt')
  assert.equal(legs.flaeche, null, '`Legs` ist nicht gezeichnet — also eine Luecke.')

  const lower = legs.kinder.find(a => a.name === 'Lower Legs')
  assert.ok(lower, '`Lower Legs` fehlt unter `Legs`')
  const calves = lower.kinder.find(a => a.name === 'Calves')
  assert.equal(calves?.flaeche, 'calves', '`Calves` ist gezeichnet.')
  // `[read]` **Der Enkel steht drin, obwohl er nicht gezeichnet ist.**
  assert.equal(calves?.kinder[0]?.name, 'Soleus')
  assert.equal(calves?.kinder[0]?.flaeche, null,
    '`Soleus` ist nicht gezeichnet — er MUSS trotzdem im Baum stehen.')
})

test('G-432/A6: die Deckung kommt aus EBENEN', () => {
  // ══ Der Fehler, den die Schirmprobe gefunden hat ══════════════
  //
  // `[cmd]` **Das Modal meldete *„95 von 95 gezeichnet"*** — weil es
  // `MUSKEL_ZU_FLAECHE` nahm. **Jene Abbildung legt JEDEN der 96
  // Namen auf eine Flaeche**, auch die, die nicht gezeichnet sind.
  const zeigt: Record<string, string> = {}
  for (const [code, e] of Object.entries(EBENEN)) {
    if (e.name) zeigt[e.name] = code
  }
  // `[cmd]` **Gemessen: 21 Namen** — `flanke` hat keinen.
  const anzahl = Object.keys(zeigt).length
  assert.ok(anzahl >= 20 && anzahl <= 24,
    `${anzahl} gezeichnete Namen — erwartet um 21. Weicht die Zahl `
    + 'stark ab, ist die Deckung falsch berechnet.')

  const k = baum()
  const d = deckung(k, zeigt)
  assert.equal(d.gesamt, k.length)
  assert.equal(d.gezeichnet + d.luecken, d.gesamt,
    'gezeichnet + Luecken muss die Gesamtzahl ergeben.')
  // `[read]` **Die Gegenprobe:** wer ALLE Namen als gezeichnet
  // meldet, hat die falsche Quelle genommen.
  assert.ok(d.luecken > 0,
    'Null Luecken bei sieben Namen und einer gezeichneten Flaeche — '
    + 'dann kommt die Deckung aus der falschen Abbildung.')
})

test('G-432/A5: die Zugehoerigkeit ist die WURZEL', () => {
  const k = baum()
  assert.equal(wurzelVon(k, 'Calves'), 'Legs',
    'Die Zugehoerigkeit ist die Wurzel des Weges, nicht der direkte Elternteil.')
  assert.equal(wurzelVon(k, 'Soleus'), 'Legs')
  assert.equal(wurzelVon(k, 'Back'), 'Back', 'Eine Wurzel gehoert zu sich selbst.')
  assert.equal(wurzelVon(k, 'gibtesnicht'), null)

  assert.deepEqual(wegZu(k, 'Soleus'),
    ['Legs', 'Lower Legs', 'Calves', 'Soleus'],
    'Der Weg muss die ganze Kette nennen — vier Ebenen.')
})

test('G-432: der Baum haengt sich an einem Zyklus nicht auf', () => {
  // `[read]` **`parent_id` ist ungeprueft** (die Lehre aus G-430).
  const k: MuskelKnoten[] = [
    { id: '1', name: 'A', parent_id: null },
    { id: '2', name: 'B', parent_id: '3' },
    { id: '3', name: 'C', parent_id: '2' },
  ]
  const aeste = baueBaum(k, {})
  assert.equal(aeste.length, 1, 'nur `A` ist eine Wurzel')
  // `[cmd]` **Und `wegZu` laeuft nicht endlos.**
  const weg = wegZu(k, 'B')
  assert.ok(weg.length <= 10, `${weg.length} Schritte — die Sperre greift nicht.`)
})

test('G-432: die Tiefensperre im Baum begrenzt WIRKLICH', () => {
  // ══ Warum diese Probe so aussieht ═════════════════════════════
  //
  // `[cmd]` **Die Zyklusprobe darueber blieb BLIND** — die Sabotage
  // `ebene >= 100000` kam durch. **Ein Zyklus zwischen zwei Knoten
  // endet von selbst**, weil keiner von beiden eine Wurzel ist und
  // `baueBaum` nur von Wurzeln startet.
  //
  // `[read]` **Die Sperre wirkt auf die TIEFE** — also eine KETTE,
  // die tiefer ist als sie. **Dieselbe Lehre wie in G-430.**
  const kette: MuskelKnoten[] = Array.from({ length: 12 }, (_, i) => ({
    id: String(i), name: `n${i}`, parent_id: i === 0 ? null : String(i - 1),
  }))
  const aeste = baueBaum(kette, {})
  // Wie tief reicht der Baum wirklich?
  function tiefe(a: { kinder: unknown[] }): number {
    const k = a.kinder as Array<{ kinder: unknown[] }>
    return k.length === 0 ? 1 : 1 + Math.max(...k.map(tiefe))
  }
  const t = tiefe(aeste[0])
  // `[cmd]` **`ebene >= 6` schneidet ab** — aus 12 Ebenen werden 6.
  assert.equal(t, 6,
    `Der Baum ist ${t} Ebenen tief — erwartet genau 6, weil die Sperre `
    + 'bei 6 abschneidet. Sind es 12, ist sie weg.')
})

test('G-432/A4: jede Kartenflaeche ist einzeln waehlbar', () => {
  // ══ Toms Satz, als Zusage ═════════════════════════════════════
  //
  // **„auf der grafik muss jeder angezeigte muskel anwaehlbar sein
  // (nicht die gruppe)."**
  //
  // `[cmd]` **Am Schirm belegt** (`tools/_g432-anwaehlbar.mjs`):
  // ein Klick auf `latissimus` hebt GENAU `["latissimus"]` hervor,
  // vorher waren es drei.
  //
  // `[read]` **Hier wird die Voraussetzung geprueft:** jede
  // gezeichnete Flaeche muss ihre eigene Id haben — sonst kann ein
  // Klick sie nicht treffen.
  const ids = Object.keys(MUSKELN)
  assert.equal(new Set(ids).size, ids.length,
    'Zwei Flaechen teilen sich eine Id — dann trifft ein Klick beide.')
  for (const id of ids) {
    assert.ok(EBENEN[id],
      `Die Flaeche "${id}" ist gezeichnet, aber nicht eingeordnet — `
      + 'ihr Detail zeigte weder Zugehoerigkeit noch Ebene.')
  }
})
