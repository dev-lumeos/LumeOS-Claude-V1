// Die drei Ebenen: 96 Muskeln -> Flaechen (G-55).
//
// `[read]` Der Auftrag: „Jede der 96 braucht ein Ziel. Keine ohne
// Flaeche."
//
// WARUM ALS TEST: `[cmd]` Ein Muskel ohne Flaechenziel faellt am
// Bildschirm NICHT auf — sein Wert verschwindet stillschweigend aus
// der Mittelung, und die Flaeche zeigt einen Wert, der zu hoch oder zu
// niedrig ist. Dieselbe Klasse Fehler wie `upper-back` in G-26, nur
// leiser: dort blieb eine Flaeche grau, hier stimmt eine Zahl nicht.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { MUSKELN } from '@lumeos/ui'
import { EINORDNUNG } from '../muskel-zuordnung'
import {
  MUSKEL_ZU_FLAECHE, OHNE_FARBE, FLAECHEN,
  verdichte, gruppenZurFlaeche, muskelnZurFlaeche,
} from '../muskel-ebenen'

/** Die 96 Namen aus der Kettendatei — die Quelle, nicht die Kopie. */
function namenAusC73(): string[] {
  const p = path.join(process.cwd(), '../../supabase/_pipeline/10_training/107_muscle_groups_hierarchy.sql')
  const sql = fs.readFileSync(p, 'utf8')
  const a = sql.indexOf('INSERT INTO muscle_group_parent')
  const b = sql.indexOf(';', a)
  const namen: string[] = []
  const treffer = sql.slice(a, b).match(/\('[^']+',\s*'[^']+'\)/g) ?? []
  for (const paar of treffer) {
    const m = /\('([^']+)',\s*'([^']+)'\)/.exec(paar)
    if (!m) continue
    if (!namen.includes(m[1])) namen.push(m[1])
    if (!namen.includes(m[2])) namen.push(m[2])
  }
  return namen
}

test('C-73 fuehrt 96 Namen und 89 Beziehungen', () => {
  // [cmd] Die Zahlen aus dem Auftrag, hier gegen die Quelle geprueft.
  const p = path.join(process.cwd(), '../../supabase/_pipeline/10_training/107_muscle_groups_hierarchy.sql')
  const sql = fs.readFileSync(p, 'utf8')
  const a = sql.indexOf('INSERT INTO muscle_group_parent')
  const b = sql.indexOf(';', a)
  const paare = sql.slice(a, b).match(/\('[^']+',\s*'[^']+'\)/g) ?? []
  assert.equal(paare.length, 89, `${paare.length} Beziehungen statt 89`)
  assert.equal(namenAusC73().length, 96, 'Namen')
})

test('jede der 96 Gruppen hat eine Flaeche', () => {
  const ohne = namenAusC73().filter(n => !MUSKEL_ZU_FLAECHE[n])
  assert.deepEqual(ohne, [],
    `Ohne Flaechenziel: ${ohne.join(', ')}. Ein Muskel ohne Ziel `
    + 'verschwindet still aus der Mittelung — die Flaeche zeigt dann '
    + 'einen falschen Wert, ohne dass es auffaellt.')
})

test('jedes Flaechenziel gibt es in der Karte wirklich', () => {
  // [cmd] Ein Tippfehler wie `quadricep` faellt sonst nicht auf.
  for (const [name, id] of Object.entries(MUSKEL_ZU_FLAECHE)) {
    assert.ok(MUSKELN[id], `"${name}" zeigt auf "${id}" — gibt es nicht.`)
    const e = EINORDNUNG[id]
    assert.ok(e, `"${id}" ist nicht eingeordnet.`)
    assert.equal(e.art, 'gruppe',
      `"${name}" zeigt auf "${id}", das ist "${e.art}" — nur Gruppen `
      + 'lassen sich einfaerben.')
  }
})

test('die Zuordnung erfindet keine Muskelnamen', () => {
  const bekannt = new Set(namenAusC73())
  const erfunden = Object.keys(MUSKEL_ZU_FLAECHE).filter(n => !bekannt.has(n))
  assert.deepEqual(erfunden, [],
    `Diese Namen kennt C-73 nicht: ${erfunden.join(', ')}. Vertippt?`)
})

test('sechs Formen bekommen nie Farbe', () => {
  // [read] Der Auftrag: „sechs Eintraege bekommen nie Farbe … ausdruecklich
  // als Nicht-Muskel markiert."
  assert.deepEqual([...OHNE_FARBE].sort(),
    ['ankles', 'feet', 'hair', 'hands', 'head', 'knees'])
  for (const id of OHNE_FARBE) {
    assert.equal(EINORDNUNG[id]?.art, 'nicht-muskel',
      `"${id}" muss als Nicht-Muskel eingeordnet sein.`)
  }
  // Keine davon darf Ziel einer Zuordnung sein.
  const falsch = Object.entries(MUSKEL_ZU_FLAECHE)
    .filter(([, id]) => OHNE_FARBE.includes(id))
  assert.deepEqual(falsch, [],
    'Ein Muskel zeigt auf eine Flaeche, die nie Farbe bekommt.')
})

test('verdichtet wird gemittelt, nicht maximiert', () => {
  // [read] Tom: „dem Total/Anzahl zusammenfassender Muskeln die Farbe".
  //
  // DER UNTERSCHIED IST NICHT AKADEMISCH: Ein Maximum liesse die
  // Flaeche rot aussehen, weil EIN Muskel von zwoelf platt ist.
  const raus = verdichte({ Quadriceps: 90, 'Rectus Femoris': 10, Thighs: 50 })
  const quad = raus.find(r => r.id === 'quadriceps')
  assert.ok(quad, 'quadriceps fehlt')
  assert.equal(quad.fatigue, 50, '(90+10+50)/3 = 50, nicht 90')
  assert.equal(quad.anzahl, 3, 'drei Muskeln zusammengefasst')
})

test('unbekannte Namen fallen weg statt falsch zu landen', () => {
  const raus = verdichte({ GibtsNicht: 80 })
  assert.deepEqual(raus, [])
})

test('der Klick trennt Flaeche in Gruppen und Muskeln auf', () => {
  // [read] Der Auftrag: „Der Klick auf eine Flaeche zeigt ihre
  // Gruppen, der Klick auf eine Gruppe ihre Muskeln."
  const gruppen = gruppenZurFlaeche('deltoids')
  assert.deepEqual([...gruppen].sort(), ['back_deltoids', 'front_deltoids'],
    'Die Schulter fasst vorne und hinten zusammen.')

  const muskeln = muskelnZurFlaeche('deltoids')
  assert.ok(muskeln.includes('Rotator Cuff'), 'Rotatorenmanschette fehlt')
  assert.ok(muskeln.length >= 8, `${muskeln.length} Muskeln, erwartet mindestens 8`)
})

test('jede faerbbare Flaeche traegt mindestens einen Muskel', () => {
  // [cmd] Eine Flaeche ohne Muskel bliebe immer grau — dann waere sie
  // faelschlich als faerbbar eingeordnet.
  const leer = FLAECHEN.filter(f => muskelnZurFlaeche(f).length === 0)
  assert.deepEqual(leer, [],
    `Diese Flaechen haben keinen Muskel: ${leer.join(', ')}.`)
})
