// C-254: der Sprachrueckfall, kontofrei geprueft.
//
// ── WARUM KEIN BROWSERNACHWEIS ──────────────────────────────────────
//
// `[read]` Ein Browsernachweis haengt an genau einem Konto. `[cmd]` Am
// 2026-08-23 war `test-user@lumeos.local` einen halben Tag nicht
// anmeldbar (Passwort getauscht waehrend einer fremden Messung, G-175)
// — jeder Beleg, der daran hing, war in dieser Zeit nicht zu fuehren.
//
// `[read]` **Der Rueckfall ist reine Rechnung.** Er braucht weder
// Sitzung noch Datenbank, und dann soll ihn auch nichts davon pruefen.
// Der Auftrag nennt das den besseren Weg.
//
// ── DIE GEGENPROBE, NAMENTLICH ──────────────────────────────────────
//
// `[cmd]` **Gemessen am 2026-08-23:**
//   `supplements.supplements.name_de`      0 von 566 deutsch
//   `supplements.supplements.name_en`    566 von 566
//   `nutrition.foods.name_de`           7.140 von 7.140 deutsch
//
// Die erste Zeile braucht den Rueckfall, die dritte nicht. Beide
// Faelle stehen unten.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { text } from '../substanz-luecken'

test('deutsch fehlt, englisch traegt — der Fall aller 566 Substanzen', () => {
  // `[cmd]` Creatine monohydrate: `name_de` NULL, `name_en` gesetzt.
  assert.equal(text(null, 'Creatine monohydrate'), 'Creatine monohydrate')
})

test('deutsch da — es gewinnt, auch wenn englisch danebensteht', () => {
  // `[cmd]` Der Fall der drei Gruppenlabels: `label_de` = 'Peptid',
  // `label_en` = 'Peptide'. Deutsch muss vorgehen.
  assert.equal(text('Peptid', 'Peptide'), 'Peptid')
})

test('NULL und Leerstring zaehlen beide als fehlend', () => {
  // `[cmd]` **Der Grund, warum `NULLIF(x,'')` allein nicht genuegt:**
  // `supplements.name_de` ist NULL, nicht Leerstring — gemessen
  // 2026-08-23: 566 NULL, 0 Leerstring. Andere Spalten machen es
  // umgekehrt, deshalb faengt `text()` beides.
  assert.equal(text(null, 'Zinc'), 'Zinc')
  assert.equal(text('', 'Zinc'), 'Zinc')
  assert.equal(text('   ', 'Zinc'), 'Zinc', 'Nur Leerraum ist auch leer.')
})

test('beides leer ergibt null — kein Strich, keine Leerstelle', () => {
  // `[read]` **Nicht `'—'` und nicht `''`.** Der Aufrufer entscheidet,
  // was eine fehlende Angabe heisst; ein hier erfundener Strich saehe
  // in der Oberflaeche aus wie ein gemessener Wert.
  assert.equal(text(null, null), null)
  assert.equal(text('', ''), null)
})

test('Nicht-Zeichenketten gelten als fehlend, nicht als Wert', () => {
  // `[read]` Aus der Datenbank kommt gelegentlich eine Zahl oder ein
  // Objekt, wo Text erwartet wird. `String(x)` daraus zu machen ergaebe
  // `[object Object]` in der Oberflaeche.
  assert.equal(text(42, 'Zinc'), 'Zinc')
  assert.equal(text({}, 'Zinc'), 'Zinc')
  assert.equal(text(undefined, undefined), null)
})
