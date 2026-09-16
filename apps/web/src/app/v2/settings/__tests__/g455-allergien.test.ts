// G-455 — Allergien, Filter und der Daumen.
//
// ══ WAS HIER BEWACHT WIRD ══════════════════════════════════════════
//
// **Toms vier Oberflaechen**, je mit einer Probe, die rot wird:
//
//     1  Settings pflegt, alle Arten
//     2  nutrition/preferences zeigt DIESELBEN Zeilen
//     3  zwei Filter mit verschiedener HAERTE
//     4  der Daumen, gruene zuoberst
//
// `[read]` **Die Rechnung wird AUFGERUFEN, nicht gesucht** — dieselbe
// Lehre wie in G-428, G-452, G-453 und G-450.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  ARTEN, SCHWEREN, stoffCode, sortiere, pruefeEingabe,
  harteIds, gruende, meideBegriff, meideTreffer,
  QUELLE_SETTINGS, QUELLE_VORLIEBEN,
  type Allergie,
} from '../../../../lib/allergien/allergie-lage'
import {
  naechsterProduktDaumen, nachDaumen, daumenRang,
} from '../../../../lib/supplements/produkt-daumen-lage'

const WEB = process.cwd()
const lies = (p: string) => fs.readFileSync(path.join(WEB, 'src', p), 'utf8')

function a(x: Partial<Allergie> & { id: string }): Allergie {
  return {
    stoff_code: null, stoff_text: x.id, art: 'nahrung', schwere: 'allergie',
    quelle: QUELLE_SETTINGS, seit: null, notiz: null, ...x,
  }
}

// ══ 1 — die Auswahllisten sind eine Zusage ══════════════════════════

test('A1: Arten und Schweren sind genau die CHECKs der Datenbank', () => {
  // `[cmd]` **Gemessen 2026-09-15 an `public.user_allergies`:**
  //
  //     art_check     nahrung, supplement, medikament, umwelt, sonstiges
  //     schwere_check unvertraeglichkeit, allergie, anaphylaxie
  //
  // `[read]` **Eine Auswahlliste ist eine Zusage** — was angeboten
  // wird, muss die Datenbank annehmen. **Ein sechster Wert hier waere
  // ein Fehler, den erst der Nutzer sieht.**
  assert.deepEqual(ARTEN.map(x => x.code),
    ['nahrung', 'supplement', 'medikament', 'umwelt', 'sonstiges'])
  assert.deepEqual(SCHWEREN.map(x => x.code),
    ['unvertraeglichkeit', 'allergie', 'anaphylaxie'])

  // Und die Pruefung laesst nichts anderes durch.
  assert.equal(pruefeEingabe(
    { stoff_text: 'Soja', art: 'nahrung', schwere: 'allergie' }), null)
  assert.match(String(pruefeEingabe(
    { stoff_text: 'Soja', art: 'erfunden', schwere: 'allergie' })), /Art/)
  assert.match(String(pruefeEingabe(
    { stoff_text: '  ', art: 'nahrung', schwere: 'allergie' })), /Stoff/)
})

test('A1: der stoff_code folgt derselben Regel wie die Vorlieben', () => {
  // `[cmd]` **`food_preferences_write` bildet ihn als
  // `lower(btrim(value))`**, und der Anzeigetext ist derselbe Wert mit
  // `_` als Leerzeichen (gemessen im Funktionsrumpf).
  //
  // `[read]` **Sonst stuenden „Tree Nuts" und „tree_nuts" als ZWEI
  // Eintraege da** — und der Filter faende nur einen.
  assert.equal(stoffCode('Magnesium Stearate'), 'magnesium_stearate')
  assert.equal(stoffCode('  Tree Nuts  '), 'tree_nuts')
  assert.equal(stoffCode('Soja'), 'soja')
})

test('A1: schwerste zuerst, dann nach Stoff', () => {
  // `[read]` **Eine Anaphylaxie oben** — sie ist die, die zaehlt.
  const s = sortiere([
    a({ id: 'b', stoff_text: 'Milch', schwere: 'unvertraeglichkeit' }),
    a({ id: 'c', stoff_text: 'Soja', schwere: 'anaphylaxie' }),
    a({ id: 'a', stoff_text: 'Nuss', schwere: 'allergie' }),
    a({ id: 'd', stoff_text: 'Ei', schwere: 'anaphylaxie' }),
  ])
  assert.deepEqual(s.map(x => x.stoff_text), ['Ei', 'Soja', 'Nuss', 'Milch'])
})

// ══ 2 — ein Baustein, zwei Orte ═════════════════════════════════════

test('A2: Settings UND Preferences zeigen dieselbe Kachel', () => {
  // **Tom:** *„dargestellt kann es ja trotzdem zusaetzlich in
  // foods/preferences bleiben und auch da editierbar."*
  //
  // `[read]` **Eine ZWEITE Fassung waere die Drift, die Tom vermeiden
  // wollte** — dieselbe Linie wie die Mahlzeiten-Slots (G-332).
  const settings = lies('app/v2/settings/page.tsx')
  const prefs = lies('app/v2/nutrition/tab-vorlieben.tsx')
  assert.match(settings, /<AllergienKachel/, 'Settings zeigt sie nicht.')
  assert.match(prefs, /<AllergienKachel/, 'Preferences zeigt sie nicht.')
  // `[cmd]` **Und BEIDE aus derselben Datei** — nicht kopiert.
  assert.match(prefs, /from '\.\.\/settings\/allergien-kachel'/,
    'Preferences hat eine eigene Fassung bekommen — dann driften sie.')
})

test('A3: eine Settings-Zeile ueberlebt das Speichern in Preferences', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **`nutrition.food_preferences_write` loescht und schreibt
  // neu** — aber NUR `art='nahrung' AND quelle='nutrition_preferences'`
  // (gemessen 2026-09-15 im Funktionsrumpf).
  //
  // `[read]` **Deshalb schreibt Settings eine ANDERE Quelle.** `[cmd]`
  // **Ohne diese Trennung loeschte ein Klick in Preferences jede
  // Medikamentenallergie.**
  assert.equal(QUELLE_SETTINGS, 'settings')
  assert.equal(QUELLE_VORLIEBEN, 'nutrition_preferences')
  assert.notEqual(QUELLE_SETTINGS, QUELLE_VORLIEBEN)

  const read = lies('lib/allergien/allergie-read.ts')
  assert.match(read, /quelle: QUELLE_SETTINGS/,
    'Der Schreibweg setzt eine andere Quelle — dann loescht '
    + '`food_preferences_write` die Zeile beim naechsten Speichern.')
})

test('A3: eine Aenderung wirkt an BEIDEN Orten', () => {
  const akt = lies('app/v2/settings/allergie-aktionen.ts')
  // `[read]` **Ohne den zweiten `revalidatePath` saehe der Nutzer in
  // Preferences einen alten Stand.**
  assert.match(akt, /revalidatePath\('\/v2\/settings'\)/)
  assert.match(akt, /revalidatePath\('\/v2\/nutrition'\)/)
  // `[cmd]` **Und die Produkte** — der harte Filter liest dieselbe
  // Tabelle, und eine geloeschte Allergie muss dort sofort ausfallen.
  assert.match(akt, /revalidatePath\('\/v2\/supplements'\)/,
    'Eine geloeschte Allergie wirkt nicht sofort im Produktfilter (A8).')
})

// ══ 3 — zwei Filter, zwei Haerten ═══════════════════════════════════

test('A4/A5: hart entfernt, weich markiert — die Haerte ist die Sache', () => {
  // **Tom:** *„Eine Nussallergie gilt ueberall. ‚Keine Farbstoffe' ist
  // eine Haltung, keine Diagnose."*
  const treffer = [
    { product_id: 'p1', ingredient_name: 'Magnesium Stearate', stoff_text: 'ms' },
    { product_id: 'p1', ingredient_name: 'Vegetable Magnesium Stearate', stoff_text: 'ms' },
    { product_id: 'p2', ingredient_name: 'Magnesium Stearate', stoff_text: 'ms' },
  ]
  // `[read]` **Je Produkt EINE Id**, auch bei zwei Treffern.
  assert.deepEqual(harteIds(treffer), ['p1', 'p2'])
  // `[read]` **Der erste Grund gewinnt** — zwei Marken an einer Zeile
  // waeren Rauschen.
  assert.equal(gruende(treffer).p1, 'Magnesium Stearate')

  // Der WEICHE Filter markiert, er entfernt nicht.
  const tafel = lies('app/v2/supplements/produkt-tafel.tsx')
  assert.match(tafel, /Meidestoff: \{gemieden\}/,
    'Die Meidestoff-Marke fehlt.')
  // `[cmd]` **Kein `return null` bei einem Meidestoff** — das waere
  // der harte Filter, und den hat Tom fuer Allergien reserviert.
  assert.doesNotMatch(tafel, /if \(gemieden\)\s*return null/,
    'Ein Meidestoff entfernt das Produkt — er soll es markieren.')
})

test('A5: der Meidebegriff wird aus dem Code abgeleitet, nicht verglichen', () => {
  // `[cmd]` **Die Codes sind Nahrungs-Tags** (`contains_lactose`),
  // **die Zutaten sind Text** (`Lactose`) — gemessen 2026-09-15.
  assert.equal(meideBegriff('contains_lactose'), 'lactose')
  assert.equal(meideBegriff('contains_nuts'), 'nuts')
  assert.equal(meideBegriff('ultra_processed'), 'ultra processed')

  // Und der Abgleich trifft die Zutat.
  assert.equal(
    meideTreffer(['Whey Protein', 'Lactose', 'Sucralose'], ['contains_lactose']),
    'Lactose')
  assert.equal(
    meideTreffer(['Whey Protein'], ['contains_lactose']), null)
  // `[read]` **Ohne Meidestoffe wird nichts markiert** — kein
  // Vorgabewert, keine Ableitung.
  assert.equal(meideTreffer(['Lactose'], []), null)
})

test('A4: der harte Filter geht an die Datenbank, nicht an die Seite', () => {
  const read = lies('lib/supplements/produkte-read.ts')
  // `[cmd]` **`not in` in der Abfrage** — die Lehre aus G-133:
  // clientseitig blieben die Ausgefilterten beim Nachladen stehen.
  assert.match(read, /f\.not\('id', 'in', `\(\$\{harteIds\.join\(','\)\}\)`\)/,
    'Der harte Filter laeuft nicht mehr in der Datenbank.')
  // `[cmd]` **Und die Deckelung ist benannt** (G-64: `.in()` kippt um
  // 200 Ids mit *„URI too long"*, gemeldet als LEERE Liste).
  assert.match(read, /const HART_GRENZE = 150/,
    'Die gemessene Deckelung fehlt.')
  assert.match(read, /gesamtUnscharf/,
    'Ueber der Deckelung ist `gesamt` eine Obergrenze — das muss '
    + 'sichtbar sein.')
})

test('A4: die Allergie-Kennung kommt aus der SITZUNG, nie aus der Anfrage', () => {
  const route = lies('app/api/supplements/produkte/route.ts')
  // `[read]` **Allergien sind Gesundheitsdaten** — dieselbe Regel wie
  // `p_user_id` in `food-search.ts`. **Wer sie durchreichen liesse,
  // koennte aus der Differenz der Trefferzahlen fremde Allergien
  // ablesen.**
  assert.match(route, /await c\.auth\.getUser\(\)/,
    'Die Kennung kommt nicht mehr aus der Sitzung.')
  assert.doesNotMatch(route, /searchParams\.get\('user'\)|p\.get\('user_id'\)/,
    'Die Nutzerkennung kommt aus der ANFRAGE — dann kann man fremde '
    + 'Allergien ablesen.')
})

// ══ 4 — der Daumen ══════════════════════════════════════════════════

test('A6: gruene zuoberst, und die Sortierung ist stabil', () => {
  // **Tom:** *„Der Daumen je Produkt, gruene zuoberst."*
  assert.equal(daumenRang('liked'), 0)
  assert.equal(daumenRang(undefined), 1)
  assert.equal(daumenRang('disliked'), 2)

  const zeilen = [
    { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' },
  ]
  const s = nachDaumen(zeilen, { c: 'liked', a: 'disliked' })
  assert.deepEqual(s.map(x => x.id), ['c', 'b', 'd', 'e', 'a'])

  // ══ DIE STABILITAET IST DIE ZUSAGE ═══════════════════════════════
  //
  // `[read]` **Innerhalb einer Gruppe bleibt die Reihenfolge der
  // Datenbank** (Aehnlichkeit bzw. Name). `[cmd]` **Ohne sie sprangen
  // die Zeilen bei jedem Klick**, und man verlöre seine Stelle.
  assert.deepEqual(
    nachDaumen(zeilen, {}).map(x => x.id), ['a', 'b', 'c', 'd', 'e'])
})

test('A6: ein zweiter Klick hebt auf', () => {
  // `[read]` **Sonst gaebe es keinen Weg zurueck** ausser ueber den
  // anderen Knopf — dieselbe Mechanik wie in `nutrition/daumen.tsx`.
  assert.equal(naechsterProduktDaumen('neutral', 'liked'), 'liked')
  assert.equal(naechsterProduktDaumen('liked', 'liked'), 'neutral')
  assert.equal(naechsterProduktDaumen('liked', 'disliked'), 'disliked')
  assert.equal(naechsterProduktDaumen('disliked', 'disliked'), 'neutral')
})

test('A6: der Daumen schreibt auf die EINE Zeile, nicht den ganzen Satz', () => {
  // `[cmd]` **Kommentare zaehlen NICHT** — die Datei ERKLAERT im Kopf,
  // warum sie die Sammel-RPC meidet, und eine Suche ueber den rohen
  // Text faende genau diese Erklaerung. `[read]` **Dieselbe Falle wie
  // in G-166: der Test bestaetigte sein eigenes Changelog.**
  const w = lies('lib/supplements/produkt-daumen.ts')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  // `[cmd]` **`food_preferences_write` loescht ALLE Zeilen einer
  // Nutzerin und schreibt neu** — fuer einen einzelnen Daumen waere
  // das fatal (die Lehre aus G-67).
  assert.doesNotMatch(w, /food_preferences_write/,
    'Der Daumen geht ueber die Sammel-RPC — ein Klick loeschte dann '
    + 'jede andere Vorliebe.')
  // `[cmd]` **Und mit dem Ziel aus C-497.**
  assert.match(w, /const ZIEL = 'supplement_product'/)
  assert.match(w, /supplement_product_id: produktId/)
  // `[cmd]` **Gestueckelt** — G-64: `.in()` kippt um 200 Ids, und die
  // Liste zeigt seit G-453 bis zu 500 Zeilen.
  assert.match(w, /const STUECK = 150/,
    'Die Stueckelung fehlt — bei 500 Zeilen kippt `.in()` still.')
})

test('A8: die Gegenprobe ist eingebaut — der Filter laesst sich abschalten', () => {
  const tab = lies('app/v2/supplements/tab-produkte.tsx')
  const route = lies('app/api/supplements/produkte/route.ts')
  assert.match(tab, /const \[allergienAn, setAllergienAn\] = React\.useState\(true\)/,
    'Der Allergiefilter ist nicht mehr per Vorgabe an.')
  assert.match(route, /p\.get\('allergien'\) !== '0'/,
    'Der Filter laesst sich nicht mehr abschalten — dann ist die '
    + 'Gegenprobe (A8) nicht messbar.')
  // `[cmd]` **„Alles zuruecksetzen" darf ihn NICHT abschalten** — er
  // ist ein Schutz, kein Suchfilter.
  assert.doesNotMatch(tab, /filterZuruecksetzen[\s\S]{0,200}setAllergienAn\(false\)/,
    'Das Zuruecksetzen schaltet den Allergiefilter ab.')
})
