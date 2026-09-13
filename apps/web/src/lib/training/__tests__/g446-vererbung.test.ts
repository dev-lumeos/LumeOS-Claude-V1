// G-446 — die Vererbung laeuft in BEIDE Richtungen.
//
// **Tom, 2026-09-13:** *„schau zuerst selber, was die liste betrifft,
// vorallem child vom triceps."*
//
// WARUM ALS TEST: `[cmd]` Die vier Schritte sehen am Bildschirm alle
// nach „100 %" aus — **nur die Herkunft trennt sie.** `[read]` Kippt
// die REIHENFOLGE, sieht niemand eine Zahl sich aendern: ein Muskel
// leiht dann, wo er selbst rechnen muesste, und das faellt erst auf,
// wenn jemand die Zeile daneben liest.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  muskelLage, sippen, type Muskelzustand,
} from '../muskelzustand'

const TRICEPS: Muskelzustand = {
  hours: 607, sets: 7, lastSession: 'Push 6', datum: '2026-08-19',
  rollen: { primary: 5, secondary: 2 },
}
const PECT: Muskelzustand = {
  hours: 607, sets: 7, lastSession: 'Push 6', datum: '2026-08-19',
  rollen: { primary: 7, secondary: 0 },
}

/** Eltern `p`, Kinder `k1`/`k2` — die Form aus der Liste. */
const KNOTEN = [
  { id: 'p', parent_id: null },
  { id: 'k1', parent_id: 'p' },
  { id: 'k2', parent_id: 'p' },
]
const SIPPE = sippen(KNOTEN)

test('G-446/1: eigene Saetze schlagen alles', () => {
  // ══ BEFUND 2 ════════════════════════════════════════════════
  //
  // `[cmd]` **`erector spinae` hat 204 Zuordnungen und 77 Saetze**,
  // sein Elternteil `Lower Back` hat NULL. `[read]` **Er lieh
  // trotzdem** — „Wert von Lower Back", von einem Elternteil ohne
  // Wert.
  const lage = muskelLage('k1', { k1: TRICEPS, p: PECT },
    new Set(['k1', 'p']), SIPPE.k1)
  assert.equal(lage.herkunft, 'gerechnet',
    'Wer eigene Saetze hat, leiht NIE — sonst verdeckt der '
    + 'Elternteil eine echte Messung.')
  assert.deepEqual(lage.zustand, TRICEPS)
})

test('G-446/2: ohne eigene Saetze vom Elternteil leihen', () => {
  // ══ BEFUND 1 ════════════════════════════════════════════════
  //
  // `[cmd]` **Die drei Trizepskoepfe zeigten „-- keine Uebung trifft
  // ihn", waehrend `Triceps` 109 Saetze trug.**
  const lage = muskelLage('k1', { p: TRICEPS }, new Set(['p']), SIPPE.k1,
    { p: 'Triceps' })
  assert.equal(lage.herkunft, 'geliehen')
  assert.equal(lage.quelle, 'Triceps',
    'Der Name des Elternteils gehoert AN DIE ZEILE (G-438).')
  assert.deepEqual(lage.zustand, TRICEPS)
})

test('G-446/2b: ein Elternteil OHNE Wert vererbt keinen', () => {
  // `[read]` **Der Kern von Befund 2** — `Lower Back` hatte selbst
  // nichts und gab trotzdem etwas weiter.
  const lage = muskelLage('k1', {}, new Set(['k1', 'p']), SIPPE.k1,
    { p: 'Lower Back' })
  assert.notEqual(lage.herkunft, 'geliehen',
    'Aus einem Elternteil ohne Wert darf nichts geliehen werden — '
    + 'das waere ein Wert aus dem Nichts.')
  assert.equal(lage.herkunft, 'unbelastet')
})

test('G-446/3: ohne Eltern-Wert aus den Kindern verdichten', () => {
  // ══ BEFUND 3 ════════════════════════════════════════════════
  //
  // `[cmd]` **`Chest` galt als „unbelastet", waehrend `Pectoralis
  // Major` darunter 109 Saetze trug.**
  const lage = muskelLage('p', { k1: PECT }, new Set(['k1']), SIPPE.p)
  assert.equal(lage.herkunft, 'verdichtet',
    'Ein Elternteil mit trainiertem Kind ist nicht unbelastet.')
  assert.equal(lage.ausKindern, 1)
  assert.equal(lage.zustand?.hours, 607)
})

test('G-446/3b: verdichten nimmt den JUENGSTEN Reiz', () => {
  // `[read]` **Die Begruendung der Formel, als Zusicherung** — wer
  // ein Kind vor zwei Stunden trainiert hat, ist als Gruppe nicht
  // erholt, auch wenn ein anderes seit Wochen ruht.
  const frisch: Muskelzustand = { ...PECT, hours: 2, sets: 20 }
  const alt: Muskelzustand = { ...PECT, hours: 900, sets: 3 }
  const lage = muskelLage('p', { k1: frisch, k2: alt },
    new Set(['k1', 'k2']), SIPPE.p)
  assert.equal(lage.herkunft, 'verdichtet')
  assert.equal(lage.ausKindern, 2)
  assert.equal(lage.zustand?.hours, 2,
    'Der juengste Reiz bestimmt die Stunden — ein Maximum liesse '
    + 'die Gruppe erholt aussehen, obwohl gerade trainiert wurde.')
  assert.equal(lage.zustand?.sets, 23,
    'Saetze sind eine MENGE und werden summiert, nicht gemittelt.')
})

test('G-446/4: die Marke erst, wenn die ganze Sippe leer ist', () => {
  // `[cmd]` **Am Bildschirm gefunden:** `Calves` unbelastet, `Soleus`
  // unbelastet — **aber die zwei Gastrocnemius-Koepfe trugen „keine
  // Uebung trifft ihn".** `[read]` **Alle drei sind gleich
  // untrainiert.**
  const mitEltern = muskelLage('k1', {}, new Set(['p']), SIPPE.k1)
  assert.equal(mitEltern.herkunft, 'unbelastet',
    'Wessen Elternteil im Katalog steht, ist erreichbar — nur '
    + 'eben nicht trainiert.')

  const ganzLeer = muskelLage('k1', {}, new Set(), SIPPE.k1)
  assert.equal(ganzLeer.herkunft, 'nicht-im-katalog',
    'Erst wenn weder Muskel noch Eltern noch Kinder im Katalog '
    + 'stehen, gilt die Marke.')
})

// ══ A5: die Gegenprobe je Richtung ══════════════════════════════

test('G-446/A5: ein Kind OHNE Elternteil leiht nichts', () => {
  // `[read]` **Die Wurzel hat keinen Elternteil** — ein Leihen
  // „von oben" darf dort nicht ins Leere greifen.
  const wurzel = sippen([{ id: 'allein', parent_id: null }])
  const lage = muskelLage('allein', {}, new Set(['allein']),
    wurzel.allein)
  assert.equal(lage.herkunft, 'unbelastet')
  assert.equal(lage.quelle, undefined,
    'Ohne Elternteil darf keine Quelle genannt werden.')
})

test('G-446/A5: ein Elternteil OHNE Kinder verdichtet nichts', () => {
  // `[read]` **Ein Blatt hat keine Kinder** — `Math.min()` ueber
  // eine leere Liste ergaebe `Infinity`, und die Gruppe saehe
  // vollstaendig erholt aus, ohne dass irgendetwas gemessen waere.
  const blatt = sippen([{ id: 'blatt', parent_id: null }])
  const lage = muskelLage('blatt', {}, new Set(['blatt']),
    blatt.blatt)
  assert.equal(lage.herkunft, 'unbelastet')
  assert.equal(lage.zustand, null,
    'Ohne Kinder gibt es nichts zu verdichten — der Zustand muss '
    + 'null bleiben, nicht Infinity Stunden.')
  assert.equal(lage.ausKindern, undefined)
})

test('G-446/A5: ganz OHNE Sippe faellt nichts um', () => {
  // `[read]` **`sippe` ist optional** — die Karte ruft frueh, bevor
  // der Baum steht. **Dann gilt der alte Weg, ohne Absturz.**
  const lage = muskelLage('x', {}, new Set(['x']))
  assert.equal(lage.herkunft, 'unbelastet')
})

test('G-446: sippen() haengt NICHT an der Zeilenreihenfolge', () => {
  // `[read]` **Im Einzeldurchlauf bekaeme ein Knoten, der zuerst als
  // ELTERNTEIL auftaucht, `elternId: null`** — und behielte es, wenn
  // seine eigene Zeile spaeter kaeme. **Zwei Durchlaeufe heilen das.**
  const vorwaerts = sippen([
    { id: 'a', parent_id: null },
    { id: 'b', parent_id: 'a' },
    { id: 'c', parent_id: 'b' },
  ])
  const rueckwaerts = sippen([
    { id: 'c', parent_id: 'b' },
    { id: 'b', parent_id: 'a' },
    { id: 'a', parent_id: null },
  ])
  assert.deepEqual(rueckwaerts.b, vorwaerts.b)
  assert.equal(rueckwaerts.b.elternId, 'a',
    '`b` muss seinen Elternteil behalten, egal wann seine Zeile kommt.')
  assert.deepEqual(rueckwaerts.b.kinderIds, ['c'])
})

test('G-446: die Reihenfolge 1-2-3-4 ist die ganze Regel', () => {
  // `[read]` **Ein Fall, in dem ALLE VIER moeglich waeren** — nur
  // die Reihenfolge entscheidet, welcher gewinnt.
  const alles = muskelLage('k1',
    { k1: TRICEPS, p: PECT, k2: PECT },
    new Set(['k1', 'k2', 'p']), SIPPE.k1, { p: 'Eltern' })
  assert.equal(alles.herkunft, 'gerechnet',
    'Eigene Messung schlaegt Leihen, Verdichten und die Marke.')

  const ohneEigene = muskelLage('k1', { p: PECT },
    new Set(['k1', 'p']), SIPPE.k1, { p: 'Eltern' })
  assert.equal(ohneEigene.herkunft, 'geliehen',
    'Leihen schlaegt Verdichten und die Marke.')
})
