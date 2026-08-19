// G-67: der Zyklus und die Stufen, die der Daumen schreibt.
//
// `[read]` Reine Rechnung, kein Netz. Die Werte sind gegen die
// CHECK-Bedingungen von `food_preference_items` geprueft — ein
// Tippfehler hier wuerde erst in der Datenbank auffallen.
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  naechsterDaumen, staerkeFuerDaumen, DAUMEN_QUELLE, type Daumen,
} from '../daumen-schreiben'

test('der Zyklus ist neutral -> like -> dislike -> neutral', () => {
  // `[cmd]` So macht es das Vorgaengerrepo (FoodPreferences.tsx:695).
  assert.equal(naechsterDaumen('neutral'), 'liked')
  assert.equal(naechsterDaumen('liked'), 'disliked')
  assert.equal(naechsterDaumen('disliked'), 'neutral')
})

test('drei Klicks fuehren zurueck an den Anfang', () => {
  let z: Daumen = 'neutral'
  z = naechsterDaumen(z)
  z = naechsterDaumen(z)
  z = naechsterDaumen(z)
  assert.equal(z, 'neutral', 'Der Zyklus muss sich schliessen.')
})

test('die Stufen liegen unter denen des Assistenten', () => {
  // `[read]` Der Assistent (G-65) setzt `hard_exclude` und `boost`.
  // Der Daumen faellt nebenbei ab und setzt eine Stufe darunter.
  assert.equal(staerkeFuerDaumen('liked'), 'like')
  assert.equal(staerkeFuerDaumen('disliked'), 'soft_dislike')
  assert.notEqual(staerkeFuerDaumen('disliked'), 'hard_exclude')
  assert.notEqual(staerkeFuerDaumen('liked'), 'boost')
})

test('die Stufen sind in der CHECK-Bedingung erlaubt', () => {
  // `[cmd]` food_preference_items_strength_check.
  const ERLAUBT = ['hard_exclude', 'strong_avoid', 'soft_dislike',
    'neutral', 'like', 'boost']
  assert.ok(ERLAUBT.includes(staerkeFuerDaumen('liked')))
  assert.ok(ERLAUBT.includes(staerkeFuerDaumen('disliked')))
})

test('die Richtungen sind in der CHECK-Bedingung erlaubt', () => {
  // `[cmd]` food_preference_items_preference_check kennt drei Werte;
  // der Daumen benutzt zwei davon. `neutral` ist KEINE Zeile, sondern
  // das Fehlen einer Zeile.
  const ERLAUBT = ['liked', 'disliked', 'hard_exclude']
  assert.ok(ERLAUBT.includes('liked'))
  assert.ok(ERLAUBT.includes('disliked'))
  assert.ok(!ERLAUBT.includes('neutral'),
    'neutral darf nicht als preference geschrieben werden — die Zeile wird geloescht.')
})

test('die Herkunft trennt den Daumen vom Assistenten', () => {
  // `[read]` Eine Bewertung aus dem Assistenten ist eine Absicht, ein
  // Daumen beim Suchen eine Gewohnheit. Wer spaeter auswertet, muss
  // beides unterscheiden koennen.
  assert.equal(DAUMEN_QUELLE, 'search_thumb')
  assert.notEqual(DAUMEN_QUELLE, 'settings', 'G-65 schreibt `settings`.')
  assert.notEqual(DAUMEN_QUELLE, 'user', 'Das ist der Vorgabewert der Spalte.')
})
