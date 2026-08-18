// Jede ID der Koerperkarte ist eingeordnet (G-44).
//
// `[read]` Tom, 2026-08-18: „Es fehlen diverse Aktivierungen von Parts,
// dass man den ganzen Body erkennt. Recheck, ob alle Muskeln in der
// Grafik auch in der Liste auftauchen."
//
// WARUM DIESER TEST: `[cmd]` Der bestehende Test haelt eine
// LUECKENLISTE gegen eine feste Erwartung. Das faengt nur, was schon
// als Luecke bekannt ist — eine neue ID in der Karte faellt durch.
// Genau so ist `upper-back` in G-26 fast dauerhaft grau geblieben:
// mit Bindestrich geschrieben, von der Suche nicht getroffen, ohne
// Fehlermeldung.
//
// Dieser Test dreht die Richtung um: **er geht von den IDs der Karte
// aus** und verlangt fuer jede eine ausdrueckliche Einordnung. Wer
// eine hinzufuegt und nicht einordnet, faellt auf.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MUSKELN, INJEKTIONS_ORTE } from '@lumeos/ui'
import { EINORDNUNG, RECOVERY_ZU_KARTE } from '../muskel-zuordnung'

test('jede ID der Karte ist eingeordnet', () => {
  const alle = [...Object.keys(MUSKELN), ...Object.keys(INJEKTIONS_ORTE)]
  const fehlend = alle.filter(id => !(id in EINORDNUNG))
  assert.deepEqual(fehlend, [],
    `Diese IDs der Karte sind nicht eingeordnet: ${fehlend.join(', ')}. `
    + 'Jede ID braucht einen Eintrag in EINORDNUNG — Muskelgruppe, '
    + 'Teilstueck oder ausdruecklich Nicht-Muskel. Eine ID ohne '
    + 'Einordnung bleibt am Bildschirm grau, ohne Fehlermeldung.')
})

test('die Einordnung erfindet keine IDs', () => {
  // Die Gegenrichtung: ein Eintrag, den die Karte nicht kennt, ist
  // ein Tippfehler. `[cmd]` In G-26 stand `both` in der Zuordnung —
  // eine ID, die es nie gab.
  const alle = new Set([...Object.keys(MUSKELN), ...Object.keys(INJEKTIONS_ORTE)])
  const erfunden = Object.keys(EINORDNUNG).filter(id => !alle.has(id))
  assert.deepEqual(erfunden, [],
    `Diese Eintraege zeigen auf IDs, die die Karte nicht kennt: `
    + `${erfunden.join(', ')}. Vertippt?`)
})

test('jede Recovery-Zuordnung zeigt auf eine Gruppe, kein Teilstueck', () => {
  // `[cmd]` Ein Teilstueck wie `bicep_l` einzufaerben ergaebe einen
  // halben Muskel. Recovery darf nur auf `art: 'gruppe'` zeigen.
  for (const [slug, id] of Object.entries(RECOVERY_ZU_KARTE)) {
    if (id === null) continue
    const e = EINORDNUNG[id]
    assert.ok(e, `"${slug}" zeigt auf "${id}" — nicht eingeordnet.`)
    assert.equal(e.art, 'gruppe',
      `"${slug}" zeigt auf "${id}", das ist "${e.art}", keine Gruppe.`)
  }
})
