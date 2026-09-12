// G-430 — die Muskelhierarchie und die Aufteilung des Ruecken.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **1 — die Rechnung auf dem Baum** (`kinderVon`, `pfadZu`,
// `elternteilMitAufteilung`). `[read]` **Sie wird AUFGERUFEN, nicht
// im Quelltext gesucht** — ein Waechter, der `parent_id` als Wort
// findet, bleibt gruen, wenn die Schleife falsch herum laeuft.
//
// **2 — dass die Karte die fuenf neuen Flaechen fuehrt** und die zwei
// alten nicht mehr.
//
// **3 — dass KEIN Pfad verloren ging.** `[cmd]` **Die Aufteilung hat
// 10 Pfade umgehaengt** (6 aus `upper-back`, 4 aus `lower-back`) —
// **jeder muss genau einmal vorkommen.**
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSKELN } from '@lumeos/ui'

import {
  kinderVon, pfadZu, elternteilVon, elternteilMitAufteilung,
  nameVon, LUECKEN, AUS_AUFTEILUNG, type Flaeche,
} from '../hierarchie'

/** Ein kleiner Baum — dieselbe Form wie `public.koerperflaechen`. */
function baum(): Flaeche[] {
  const f = (id: string, code: string, parent: string | null,
    de: string, art = 'muskel'): Flaeche => ({
    id, code, parent_id: parent, name_de: de, name_en: code,
    ebene: null, art, seite: null, muscle_group_id: null,
  })
  return [
    f('1', 'wurzel-ruecken', null, 'Rücken'),
    f('2', 'upper-back', '1', 'Oberer Rücken'),
    f('3', 'upper-back-l', '2', 'Oberer Rücken links'),
    f('4', 'lower-back', '1', 'Unterer Rücken'),
    f('5', 'trapezius', '1', 'Trapezmuskel'),
    // `[cmd]` **G-431: `gluteal` und `hamstring`** — die Tabelle
    // fuehrt sie weiter, die Karte hat sie aufgeteilt.
    f('7', 'gluteal', '1', 'Gesaess'),
    f('8', 'hamstring', '1', 'Beinbeuger'),
    f('6', 'wurzel-umriss', null, 'Umriss', 'umriss'),
  ]
}

test('G-430: kinderVon liefert ALLE Nachfahren, nicht nur die erste Ebene', () => {
  const b = baum()
  const kinder = kinderVon(b, 'wurzel-ruecken').map(f => f.code).sort()
  // `[cmd]` **G-431: `gluteal` und `hamstring` kamen im Probenbaum
  // dazu** — sie haengen dort ebenfalls an der Wurzel.
  assert.deepEqual(kinder,
    ['gluteal', 'hamstring', 'lower-back', 'trapezius',
      'upper-back', 'upper-back-l'],
    'Ein Klick auf den Elternteil muss auch die ENKEL faerben — '
    + '`upper-back-l` haengt an `upper-back`, nicht an der Wurzel.')

  // `[read]` **Die Gegenrichtung:** ein Blatt hat keine Kinder.
  assert.deepEqual(kinderVon(b, 'trapezius'), [])
  // Und ein unbekannter Code liefert leer, nicht alles.
  assert.deepEqual(kinderVon(b, 'gibtesnicht'), [])
})

test('G-430: kinderVon haengt sich an einem Zyklus nicht auf', () => {
  // `[read]` **`parent_id` ist ungeprueft** — zeigen zwei Zeilen
  // aufeinander, liefe eine naive Schleife ewig und die Seite bliebe
  // weiss.
  //
  // `[cmd]` **Die erste Fassung dieser Probe war BLIND:** sie baute
  // EINEN Knoten, der auf sich selbst zeigt — `aus.some(...)` fing
  // ihn schon in der zweiten Runde ab, und die Sabotage
  // *„die Zyklensperre faellt weg"* blieb GRUEN.
  //
  // `[read]` **Jetzt zeigen ZWEI Knoten aufeinander** und ein DRITTER
  // haengt daran — so wird der Zaehler wirklich gebraucht, und die
  // Probe misst ihre Laufzeit statt nur das Ergebnis.
  const b = baum()
  const k = (id: string, parent: string): Flaeche => ({
    id, code: `ring-${id}`, parent_id: parent, name_de: 'Ring',
    name_en: 'ring', ebene: null, art: 'muskel', seite: null,
    muscle_group_id: null,
  })
  b.push(k('91', '92'), k('92', '91'), k('93', '91'))

  const kinder = kinderVon(b, 'ring-91')
  assert.ok(kinder.length <= 3,
    `${kinder.length} Nachfahren bei drei Zeilen — ein Zyklus darf `
    + 'nicht dieselbe Zeile mehrfach liefern.')
})

test('G-430: die Rundensperre begrenzt die Tiefe wirklich', () => {
  // ══ Warum diese Probe SO aussieht ═════════════════════════════
  //
  // `[cmd]` **Zwei Fassungen der Zyklusprobe blieben BLIND**, und die
  // Sabotage *„die Zyklensperre faellt weg"* (`runden < 10000`) kam
  // beide Male durch:
  //
  //     1. ein Knoten, der auf sich selbst zeigt
  //        -> `aus.some(...)` faengt ihn in Runde 2, die Sperre
  //           wird nie gebraucht
  //     2. eine Zeitmessung
  //        -> bei neun Zeilen sind auch 10.000 Runden in
  //           Millisekunden durch
  //
  // `[read]` **Die Sperre wirkt auf die TIEFE, nicht auf Zyklen** —
  // also wird eine Kette gebaut, die tiefer ist als sie.
  const kette: Flaeche[] = Array.from({ length: 15 }, (_, i) => ({
    id: String(i), code: `n${i}`, parent_id: i === 0 ? null : String(i - 1),
    name_de: null, name_en: null, ebene: null, art: 'muskel',
    seite: null, muscle_group_id: null,
  }))

  const kinder = kinderVon(kette, 'n0')
  // `[cmd]` **10 Runden = hoechstens 10 Ebenen** — bei 14 moeglichen
  // Nachfahren bleiben also 10 uebrig. **Ohne Sperre waeren es 14.**
  assert.equal(kinder.length, 10,
    `${kinder.length} Nachfahren — erwartet 10, weil die Rundensperre `
    + 'bei 10 Ebenen abschneidet. Sind es 14, ist sie weg; sind es '
    + 'weniger, schneidet sie zu frueh.')
})

test('G-430: pfadZu geht von der Wurzel bis zur Flaeche', () => {
  const b = baum()
  assert.deepEqual(pfadZu(b, 'upper-back-l').map(f => f.code),
    ['wurzel-ruecken', 'upper-back', 'upper-back-l'],
    'Der Pfad muss die ganze Kette nennen, in dieser Reihenfolge.')
  assert.deepEqual(pfadZu(b, 'wurzel-ruecken').map(f => f.code),
    ['wurzel-ruecken'])
})

test('G-430: elternteilVon nennt den DIREKTEN Elternteil', () => {
  const b = baum()
  assert.equal(elternteilVon(b, 'upper-back-l')?.code, 'upper-back',
    'Nicht die Wurzel — der direkte Elternteil.')
  assert.equal(elternteilVon(b, 'wurzel-ruecken'), null,
    'Eine Wurzel hat keinen Elternteil.')
})

test('G-430: die fuenf neuen Flaechen erben ihren Elternteil', () => {
  // ══ Der Kern von A5 ═══════════════════════════════════════════
  //
  // `[cmd]` **Gemessen 2026-09-12: `latissimus` & Co. stehen NICHT
  // in `public.koerperflaechen`** — die Tabelle fuehrt weiter
  // `upper-back`. **Ohne die Bruecke zeigt „Per-muscle detail" fuer
  // genau die Muskeln nichts, um die es in G-430 geht.**
  const b = baum()
  for (const [neu, alt] of Object.entries(AUS_AUFTEILUNG)) {
    const r = elternteilMitAufteilung(b, neu)
    assert.ok(r.eltern,
      `"${neu}" bekommt keinen Elternteil — dann bleibt das Detail leer.`)
    // `[cmd]` **G-431: der Elternteil ist der der ALTEN Flaeche** —
    // im Probenbaum haengen `upper-back`, `lower-back`, `gluteal` und
    // `hamstring` alle an `wurzel-ruecken`. **Der Test prueft die
    // BRUECKE, nicht die echte Anatomie** — die steht in der Tabelle.
    assert.equal(r.eltern?.code, 'wurzel-ruecken',
      `"${neu}" muss ueber "${alt}" an dessen Elternteil kommen.`)
    assert.equal(r.ueberBruecke, true,
      `"${neu}" wird geerbt — das MUSS als solches gemeldet werden, `
      + 'sonst sieht es aus wie eine Zeile in der Datenbank.')
  }
})

test('G-430: eine Flaeche AUS der Tabelle wird nicht geerbt', () => {
  // `[read]` **Die Gegenrichtung** — sonst wuerde die Bruecke auch
  // dort greifen, wo die Tabelle die Antwort hat, und `ueberBruecke`
  // waere immer wahr.
  const b = baum()
  const r = elternteilMitAufteilung(b, 'trapezius')
  assert.equal(r.eltern?.code, 'wurzel-ruecken')
  assert.equal(r.ueberBruecke, false,
    '`trapezius` steht in der Tabelle — das darf nicht als geerbt gelten.')
})

test('G-430: die Karte fuehrt die fuenf neuen Flaechen', () => {
  // ══ A1/A2, am Datenbestand der Karte ══════════════════════════
  for (const neu of ['latissimus', 'teres-major', 'teres-minor',
    'erector-spinae', 'flanke']) {
    assert.ok(MUSKELN[neu],
      `Die Flaeche "${neu}" fehlt in der Koerperkarte.`)
  }
  // `[cmd]` **Und die zwei alten sind WEG** — sonst stuenden beide
  // Fassungen nebeneinander und faerbten sich gegenseitig.
  for (const alt of ['upper-back', 'lower-back']) {
    assert.ok(!MUSKELN[alt],
      `Die Flaeche "${alt}" steht noch in der Karte — sie ist in `
      + 'G-430 aufgeteilt worden und darf nicht doppelt existieren.')
  }
})

test('G-430: kein Pfad ist verloren gegangen', () => {
  // ══ Die Gegenprobe zur Aufteilung ═════════════════════════════
  //
  // `[cmd]` **10 Pfade wurden umgehaengt** — 6 aus `upper-back`
  // (je 2 auf drei Muskeln), 4 aus `lower-back` (2 + 2).
  //
  // `[read]` **Ein verlorener Pfad ist ein nicht gezeichneter
  // Muskel, ein doppelter ein zweimal gezeichneter** — beides faellt
  // am Bildschirm kaum auf.
  const zaehlung: Record<string, number> = {
    latissimus: 2, 'teres-major': 2, 'teres-minor': 2,
    'erector-spinae': 2, flanke: 2,
  }
  let summe = 0
  for (const [code, erwartet] of Object.entries(zaehlung)) {
    const n = MUSKELN[code]?.paths?.length ?? 0
    assert.equal(n, erwartet,
      `"${code}" hat ${n} Pfade, erwartet ${erwartet} (links und rechts).`)
    summe += n
  }
  assert.equal(summe, 10,
    'Die Aufteilung muss genau die 10 Pfade von upper-back (6) und '
    + 'lower-back (4) tragen.')

  // `[cmd]` **Und keiner steht doppelt** — dieselbe Zeichenkette darf
  // nicht in zwei Flaechen vorkommen.
  const alle: string[] = []
  for (const code of Object.keys(zaehlung)) {
    alle.push(...(MUSKELN[code]?.paths ?? []))
  }
  const doppelt = alle.filter((d, i) => alle.indexOf(d) !== i)
  assert.deepEqual(doppelt, [],
    'Ein Pfad steht in zwei Flaechen — dann wird er zweimal gezeichnet.')
})

test('G-430/A6: die Luecken sind benannt, nicht erfunden', () => {
  // `[cmd]` **Rhomboids, Soleus, Internal oblique** stehen in
  // `training.muscle_groups`, die Karte zeichnet sie nicht.
  // `[cmd]` **G-431: 3 -> 5.** Beim Pruefen der zwoelf Buendel kamen
  // `Gluteus Minimus` und `Semimembranosus` dazu — beide stehen in
  // `training.muscle_groups` und haben keinen Pfad.
  assert.equal(LUECKEN.length, 5,
    `Erwartet sind fuenf Luecken, gefunden ${LUECKEN.length}: `
    + `${LUECKEN.map(l => l.muskel).join(', ')}. Kommt eine dazu, `
    + 'gehoert sie in den Bericht.')
  for (const l of LUECKEN) {
    assert.ok(l.muskel && l.elternteil && l.grund,
      `Die Luecke "${l.muskel}" hat keinen Grund — eine Abwesenheit `
      + 'ohne Begruendung ist eine Falschaussage in Wartestellung.')
    // `[cmd]` **Keine davon darf eine Flaeche der Karte sein** —
    // sonst waere sie keine Luecke mehr.
    const alsCode = l.muskel.toLowerCase().replace(/\s+/g, '-')
    assert.ok(!MUSKELN[alsCode],
      `"${l.muskel}" ist als Flaeche "${alsCode}" gezeichnet — dann `
      + 'ist es keine Luecke mehr und der Eintrag gehoert entfernt.')
  }
})

test('G-430: nameVon waehlt die Sprache, statt zu uebersetzen', () => {
  const b = baum()
  const f = b.find(x => x.code === 'wurzel-ruecken')!
  assert.equal(nameVon(f, 'de'), 'Rücken')
  assert.equal(nameVon(f, 'en'), 'wurzel-ruecken')
  // Faellt der deutsche Name aus, bleibt der Code — nie `undefined`.
  const ohne: Flaeche = { ...f, name_de: null, name_en: null }
  assert.equal(nameVon(ohne), 'wurzel-ruecken')
})
