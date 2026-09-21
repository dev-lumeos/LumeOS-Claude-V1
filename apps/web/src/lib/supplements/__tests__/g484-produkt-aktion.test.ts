// G-484 — was man mit einem Produkt tun kann.
//
// **Tom, 2026-09-19:** *„in supplements, wenn ich ein produkt suche
// und waehlen will, muss die funktion her, dass ich es einem stack
// zuweisen kann mit den noetigen angaben, oder einem meal hinzufuegen
// kann"* — **und:** *„das muss natuerlich so gebaut werden, dass man
// waehlen kann, in welchen stack / in welches heutige meal"*.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import {
  FREQUENZEN, NUR_STACK_SATZ, TIMINGS,
  dosisEinheitVorgabe, pruefeStackEingabe, stackName, zieleFuer,
} from '../produkt-aktion-lage'

const SRC = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(SRC, p), 'utf8')
const ohneKommentare = (q: string) => q
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

test('G-484/A5: eine Kapsel bietet NUR den Stack', () => {
  // **Tom:** *„pillen/tablet/capsule gehoeren nicht in meals."*
  for (const f of ['Capsule [E0159]', 'Tablet or Pill [E0155]',
    'Softgel Capsule [E0161]', 'Lozenge [E0169]']) {
    assert.deepEqual(zieleFuer(f), ['stack'], `${f} bietet die Mahlzeit an`)
  }
})

test('G-484/A6: ein Pulver bietet BEIDES', () => {
  for (const f of ['Powder [E0162]', 'Liquid [E0165]',
    'Gummy or Jelly [E0176]', 'Bar [E0164]']) {
    assert.deepEqual(zieleFuer(f), ['stack', 'mahlzeit'],
      `${f} bietet nicht beides`)
  }
})

test('G-484: unbekannte Form -> nur Stack', () => {
  // `[cmd]` **E-83: 82 % der `Other`-Produkte tragen keinen
  // Formhinweis.** `[read]` **Im Zweifel nicht in die Mahlzeit** —
  // lieber eine Wahl zu wenig als einen Teebeutel zum Unterruehren.
  assert.deepEqual(zieleFuer('Other (e.g. tea bag) [E0172]'), ['stack'])
  assert.deepEqual(zieleFuer('Unknown'), ['stack'])
  assert.deepEqual(zieleFuer(null), ['stack'])
})

test('G-484/A5: der Grund steht da, nicht nur die Abwesenheit', () => {
  // `[read]` **G-486 hat gezeigt, was ein wortloses Fehlen kostet** —
  // viermal gemeldet.
  assert.match(NUR_STACK_SATZ, /untermischen/)
  assert.match(NUR_STACK_SATZ, /Stack/)
  const q = ohneKommentare(lies('app/v2/supplements/produkt-aktion.tsx'))
  // `[cmd]` **Die Sabotageprobe fand hier ein Loch:** `NUR_STACK_SATZ`
  // aus der Anzeige zu entfernen blieb GRUEN, weil der Import
  // stehenblieb. `[read]` **Geprueft wird die ANZEIGE, nicht der
  // Import** — `{NUR_STACK_SATZ}` im JSX.
  assert.match(q, /\{NUR_STACK_SATZ\}/,
    'der Satz wird nicht angezeigt — dann fehlt die Wahl wortlos')
  assert.doesNotMatch(q, /lässt sich nicht untermischen/,
    'der Satz steht abgeschrieben in der Kachel')
})

test('G-484/A1: die Angaben decken die CHECKs', () => {
  // `[cmd]` **Gemessen an `stack_items`:** `timing` und `frequency`
  // haben je einen CHECK. `[read]` **Eine Auswahl, die einen Wert
  // anbietet, den die Datenbank ablehnt, ist eine Zusage, die bricht.**
  assert.deepEqual([...TIMINGS], ['morning', 'midday', 'evening',
    'pre_workout', 'post_workout', 'bedtime', 'with_meal', 'any'])
  assert.deepEqual([...FREQUENZEN], ['daily', 'weekdays',
    'training_days', 'custom', 'cycling'])
})

test('G-484/A1: die Eingabe wird geprueft, bevor sie geht', () => {
  assert.match(pruefeStackEingabe({}) ?? '', /Stack/)
  // `[cmd]` **Die uebrigen Felder MUESSEN gueltig sein** — sonst
  // faellt die Pruefung auf eine spaetere Regel durch, und die
  // Sabotage auf die Dosis bleibt gruen (gemessen).
  const sonstGueltig = {
    stack_id: 'x', dose_unit: 'Scoop',
    timing: 'morning' as const, frequency: 'daily' as const,
  }
  assert.match(pruefeStackEingabe({ ...sonstGueltig, dose: 0 }) ?? '', /Dosis/)
  assert.match(pruefeStackEingabe({ ...sonstGueltig, dose: -1 }) ?? '', /Dosis/)
  assert.match(pruefeStackEingabe({ ...sonstGueltig, dose: NaN }) ?? '', /Dosis/)
  assert.match(pruefeStackEingabe({ stack_id: 'x', dose: 1, dose_unit: ' ' }) ?? '',
    /Einheit/)
  assert.equal(pruefeStackEingabe({
    stack_id: 'x', dose: 1, dose_unit: 'Scoop',
    timing: 'post_workout', frequency: 'daily',
  }), null)
})

test('G-484: die Einheit kommt vom Produkt', () => {
  // `[cmd]` **`dose_unit` darf nicht leer sein** (CHECK).
  assert.equal(dosisEinheitVorgabe('Gram(s) [1 scoop]'), 'Gram(s) [1 scoop]')
  assert.equal(dosisEinheitVorgabe(null), 'Portion')
  assert.equal(dosisEinheitVorgabe('  '), 'Portion')
})

test('G-484/C-518: der Stack traegt den NAMEN, keine geratene Substanz', () => {
  // `[cmd]` **C-518:** *„fuer die sieben Stack-Stoffe gibt es jeweils
  // 1.478 bis 29.004 Produktkandidaten, nie genau einer."*
  //
  // `[read]` **Eine davon auszusuchen waere eine Behauptung.**
  // `[cmd]` **Der CHECK laesst `custom_name` zu.**
  assert.equal(stackName('Gold Standard Whey', 'Optimum Nutrition'),
    'Optimum Nutrition Gold Standard Whey')
  // `[read]` **Keine Dopplung, wenn der Name die Marke schon traegt.**
  assert.equal(stackName('Optimum Nutrition Whey', 'Optimum Nutrition'),
    'Optimum Nutrition Whey')

  const q = ohneKommentare(lies('app/v2/supplements/produkt-aktion.tsx'))
  assert.match(q, /supplement_id: null/,
    'der Schreibweg raet eine Substanz')
  assert.match(q, /custom_name: stackName\(/,
    'der Produktname geht nicht mit')
})

test('G-484/A2+A4: beides ist eine WAHL, kein fester Wert', () => {
  const q = ohneKommentare(lies('app/v2/supplements/produkt-aktion.tsx'))
  assert.match(q, /data-probe="stack-wahl"/, 'die Stackwahl fehlt')
  assert.match(q, /data-probe="mahlzeit-wahl"/, 'die Mahlzeitwahl fehlt')
  // `[cmd]` **Die Mahlzeiten sind die HEUTIGEN** — der Leseweg filtert
  // auf `entry_date`.
  const r = ohneKommentare(lies('lib/supplements/stack-read.ts'))
  assert.match(r, /\.eq\('entry_date', tag\)/,
    'die Mahlzeitliste ist nicht auf einen Tag begrenzt')
  // `[read]` **ALLE Stacks, nicht nur der aktive** — die Wahl ist der
  // Punkt (`uq_user_stacks_one_active` laesst nur einen aktiven zu).
  // `[cmd]` **In `ladeProduktZiele`, nicht in der ganzen Datei** —
  // `stack-read.ts` liest den aktiven Stack an anderer Stelle
  // zu Recht (die Stackansicht zeigt genau einen).
  const i = r.indexOf('export async function ladeProduktZiele')
  const block = r.slice(i, r.indexOf('const stacks =', i))
  assert.ok(i > 0, 'ladeProduktZiele fehlt')
  assert.doesNotMatch(block, /eq\('is_active', true\)/,
    'nur der aktive Stack wird geladen — dann gibt es nichts zu waehlen')
})

test('G-484/A7: ohne Naehrwerte keine Portionswahl', () => {
  // `[cmd]` **Der Trigger verlangt `serving_size = null`**, sonst
  // *„must remain visibly unknown"* (C-513).
  const q = ohneKommentare(lies('app/v2/supplements/produkt-aktion.tsx'))
  assert.match(q, /portionen\.length > 0 \? portion : null/,
    'ohne Portionen geht trotzdem eine Portionsgroesse mit')
  assert.match(q, /'no_nutrients_available'/,
    'der Stand ohne Naehrwerte fehlt')
})
