// G-480 — eine Suche, zwei Quellen.
//
// `[read]` **Gemessen wird die REGEL, nicht ihr Name**: welche Formen
// durchkommen, und dass Filter und Pruefung aus derselben Liste
// stammen.
//
// `[cmd]` **Der Fallstrick, an dem E-83 fast gescheitert waere:**
// `produktform` traegt einen DSLD-Code — `Powder [E0162]`, nicht
// `Powder`. `[read]` **Ein Filter auf Gleichheit findet NULL Zeilen.**
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

import {
  FILTER, MEAL_FORMEN, STACK_FORMEN, NUR_UNTERMISCHBAR_SATZ,
  darfInMahlzeit, mealFormenFilter, zeigt,
} from '../such-quellen-lage'

const HIER = path.resolve(__dirname, '..', '..', '..')
const lies = (p: string) => readFileSync(path.join(HIER, p), 'utf8')

test('G-480/A3: der DSLD-Code bricht den Vergleich nicht', () => {
  // `[cmd]` **Gemessen am 2026-09-18:** so heissen die Formen wirklich.
  assert.equal(darfInMahlzeit('Powder [E0162]'), true)
  assert.equal(darfInMahlzeit('Liquid [E0165]'), true)
  assert.equal(darfInMahlzeit('Bar [E0164]'), true)
  assert.equal(darfInMahlzeit('Gummy or Jelly [E0176]'), true)
})

test('G-480/A3: was man schluckt, kommt NICHT in die Mahlzeit', () => {
  // **Tom:** *„der wird nicht eine tablette zerhacken."*
  assert.equal(darfInMahlzeit('Capsule [E0159]'), false)
  assert.equal(darfInMahlzeit('Tablet or Pill [E0155]'), false)
  assert.equal(darfInMahlzeit('Softgel Capsule [E0161]'), false)
  assert.equal(darfInMahlzeit('Lozenge [E0169]'), false)
})

test('G-480/A3: Other und Unknown fallen durch', () => {
  // `[cmd]` **E-83: 82 % der 3.569 `Other`-Produkte tragen im Namen
  // keinen Formhinweis** — wer sie anbietet, bietet Teebeutel zum
  // Unterruehren an.
  assert.equal(darfInMahlzeit('Other (e.g. tea bag) [E0172]'), false)
  assert.equal(darfInMahlzeit('Unknown'), false)
  assert.equal(darfInMahlzeit(null), false)
  assert.equal(darfInMahlzeit(''), false)
})

test('G-480: die Stackliste bleibt vollstaendig', () => {
  // `[cmd]` **Die Sabotageprobe fand hier ein Loch:** `'Capsule'` aus
  // `STACK_FORMEN` zu entfernen blieb GRUEN, weil `darfInMahlzeit`
  // nur `MEAL_FORMEN` liest und die Ueberschneidungspruefung bei einer
  // KUERZEREN Liste nichts findet.
  //
  // `[read]` **Die Liste ist eine Zusage ueber Toms Regel** — sie
  // benennt, was in den Stack gehoert. **Faellt eine Form still
  // heraus, behauptet der Quelltext etwas anderes als die Regel.**
  for (const f of ['Capsule', 'Tablet', 'Softgel', 'Lozenge']) {
    assert.ok(STACK_FORMEN.some(s => s === f),
      `${f} fehlt in STACK_FORMEN — Toms Regel nennt sie ausdruecklich`)
  }
  assert.equal(STACK_FORMEN.length, 4)
})

test('G-480: keine Form steht auf beiden Listen', () => {
  // `[read]` **Eine Form, die beides ist, waere eine stille
  // Doppeldeutung** — und die Regel entschiede dann nichts.
  for (const m of MEAL_FORMEN) {
    assert.ok(!STACK_FORMEN.some(s => s === (m as string)),
      `${m} steht auf beiden Listen`)
  }
})

test('G-480: Filterausdruck und Pruefung nennen dieselben Formen', () => {
  // `[cmd]` **Zwei Listen waeren zwei Wahrheiten** — dann filtert die
  // Abfrage anders, als die Pruefung behauptet.
  const f = mealFormenFilter()
  for (const m of MEAL_FORMEN) {
    assert.ok(f.includes(`produktform.like.${m}%`), `${m} fehlt im Filter`)
  }
  for (const s of STACK_FORMEN) {
    assert.ok(!f.includes(`like.${s}%`), `${s} steht im Mahlzeitfilter`)
  }
  // `[cmd]` **`like`, nicht `eq`** — sonst trifft nichts.
  assert.doesNotMatch(f, /produktform\.eq\./,
    'eq trifft den DSLD-Code nicht — es muss like ...% sein')
})

test('G-480/A1: der Filter zeigt, was er verspricht', () => {
  assert.equal(zeigt('alle', 'bls'), true)
  assert.equal(zeigt('alle', 'supplement'), true)
  assert.equal(zeigt('bls', 'supplement'), false)
  assert.equal(zeigt('supplement', 'bls'), false)
  assert.deepEqual([...FILTER], ['alle', 'bls', 'supplement'])
})

test('G-480/A1: die Suche traegt die Pillen und die Quelle je Zeile', () => {
  const q = lies(path.join('app', 'v2', 'nutrition', 'food-such-modal.tsx'))
  assert.match(q, /data-probe=\{`quelle-pille-\$\{f\}`\}/,
    'die Filterpillen fehlen (module-nutrition.jsx:557)')
  // `[cmd]` **Der Mockup zeigt die Quelle JE ZEILE** (Zeile 581:
  // `<Pill>{f.src}</Pill>`) — `[read]` **nicht als Sektionstitel:
  // wer sortiert, mischt die Sektionen.**
  assert.match(q, /<Pill>\{QUELLE_TEXT\.bls\}<\/Pill>/,
    'die BLS-Zeile nennt ihre Quelle nicht mehr aus der einen Liste')
  assert.match(q, /<Pill>\{QUELLE_TEXT\.supplement\}<\/Pill>/,
    'die Supplementzeile nennt ihre Quelle nicht')
  assert.doesNotMatch(q, /<Pill>BLS<\/Pill>/,
    'die Quelle steht wieder fest verdrahtet in der Zeile')
})

test('G-480/A3: die Regel steht am Schirm, nicht nur im Filter', () => {
  // `[read]` **Ohne den Satz sucht jemand seine Vitamin-D-Kapsel,
  // findet sie nicht und haelt die Suche fuer kaputt.**
  assert.match(NUR_UNTERMISCHBAR_SATZ, /untermischen/)
  assert.match(NUR_UNTERMISCHBAR_SATZ, /Stack/,
    'der Satz muss sagen, WOHIN die Kapseln gehoeren')
  const q = lies(path.join('app', 'v2', 'nutrition', 'food-such-modal.tsx'))
  assert.match(q, /NUR_UNTERMISCHBAR_SATZ/,
    'der Satz wird nicht angezeigt')
  assert.doesNotMatch(q, /Nur Formen, die sich untermischen/,
    'der Satz steht abgeschrieben im Modal')
})

test('G-480/A4: es gibt keinen zweiten Weg mehr', () => {
  // `[cmd]` **E-83: zwei Modale fuer Posten, die in derselben Zeile
  // landen.** `[read]` **Der Verteiler darf `supplement` nicht mehr
  // kennen** — sonst steht der zweite Weg wieder offen.
  const m = lies(path.join('app', 'v2', 'nutrition', 'modale.tsx'))
  assert.doesNotMatch(m, /import \{ SupplementModal \}/,
    'der Verteiler laedt das abgeloeste Modal noch')
  assert.doesNotMatch(m, /modal === 'supplement'/,
    'der Verteiler kennt den zweiten Weg noch')
  const k = lies(path.join('app', 'v2', 'nutrition', 'kopfknoepfe.tsx'))
  assert.doesNotMatch(k, /setModal\('supplement'\)/,
    'der zweite Knopf steht noch in der Kopfleiste')
  // `[read]` **Und die abgeloeste Datei traegt keinen Rumpf mehr.**
  const alt = lies(path.join('app', 'v2', 'nutrition', 'supplement-modal.tsx'))
  assert.doesNotMatch(alt, /export function SupplementModal/,
    'das abgeloeste Modal ist noch baubar')
  assert.match(alt, /food-such-modal/,
    'die abgeloeste Datei nennt ihren Nachfolger nicht')
})

test('G-480: nur der Mahlzeitweg schaltet Supplemente frei', () => {
  // `[cmd]` **`meal_plan_entries` hat kein `supplement_product_id`,
  // und `recipe_ingredients.food_source` erlaubt nur bls|custom**
  // (E-83). `[read]` **Eine Pille, die ins Leere fuehrt, waere
  // schlimmer als keine.**
  const q = lies(path.join('app', 'v2', 'nutrition', 'food-such-modal.tsx'))
  assert.match(q, /kannSupplement/,
    'die Quelle ist nicht freischaltbar — dann zeigen alle vier Aufrufer sie')
  const mahl = lies(path.join('app', 'v2', 'nutrition', 'mahlzeiten.tsx'))
  assert.match(mahl, /onSupplement=\{/,
    'der Mahlzeitweg reicht den Schreibweg nicht durch')
  for (const datei of ['plan-eintrag-editor.tsx', 'rezepte-echt.tsx', 'ghost-eintrag.tsx']) {
    const d = lies(path.join('app', 'v2', 'nutrition', datei))
    assert.doesNotMatch(d, /onSupplement=/,
      `${datei} bietet Supplemente an, kann sie aber nicht schreiben`)
  }
})
