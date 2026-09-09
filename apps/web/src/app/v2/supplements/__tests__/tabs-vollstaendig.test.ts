// Alle zwoelf Tabs der Vorlage sind gebaut (G-45).
//
// `[read]` Tom, 2026-08-18: „Supplements ist nicht fertig als Mockup
// erstellt worden … In Supplements nochmal an den Subnavigationen
// checken und das Mockup duplizieren."
//
// WARUM ALS TEST: `[cmd]` Ein Tab, der in der Leiste steht und nichts
// rendert, sieht aus wie ein leerer Tab — nicht wie ein fehlender.
// Genau so standen fuenf Tabs seit G-29 da. Dieser Test haelt fest,
// dass zu jedem Eintrag der Leiste auch eine Weiche existiert.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const V2 = path.join(process.cwd(), 'src/app/v2/supplements')
const lies = (f: string) => fs.readFileSync(path.join(V2, f), 'utf8')

/** Die zwoelf Tabs der Vorlage (module-supplements.jsx:240-253). */
const TABS = [
  'today', 'stack', 'extended', 'catalog', 'stacks', 'intel',
  'inventory', 'injection', 'compliance', 'interactions', 'cost',
]

test('jeder Tab der Leiste hat eine Weiche', () => {
  const ansicht = lies('ansicht.tsx')
  for (const t of TABS) {
    assert.ok(ansicht.includes(`{ id: '${t}'`),
      `Der Tab "${t}" fehlt in der Leiste.`)
    assert.ok(new RegExp(`tab === '${t}'`).test(ansicht),
      `Der Tab "${t}" steht in der Leiste, wird aber nicht gerendert. `
      + 'Ein leerer Tab sieht aus wie ein leerer Tab, nicht wie ein fehlender.')
  }
})

test('die Platzhalter-Tabelle ist weg', () => {
  // `[cmd]` `NOCH_NICHT` fuehrte die fuenf ungebauten Tabs. Sie ist
  // entfallen, weil alle gebaut sind. Wer sie wieder einfuehrt, hat
  // einen Tab zurueckgebaut — das soll auffallen.
  const ansicht = lies('ansicht.tsx')
  assert.ok(!ansicht.includes('const NOCH_NICHT'),
    'NOCH_NICHT ist zurueck — ist ein Tab wieder ungebaut?')
})

test('der Injections-Tab bringt seine Rotationskarte mit', () => {
  const inj = lies('tab-injektionen.tsx')
  for (const k of ['ortZustand', 'SuppInjections']) {
    assert.ok(new RegExp(`function ${k}\\b`).test(inj), `"${k}" fehlt.`)
  }
  // ══ G-388: DIESELBE FIGUR, KEINE ZWEITE ═══════════════════════════
  //
  // `[cmd]` **Hier stand `function InjKarte`** — der Name der lokalen
  // Zweitzeichnung. **Der Waechter verlangte damit genau das, was
  // G-388 entfernen sollte:** eine eigene Silhouette neben der aus
  // `packages/ui`.
  //
  // `[read]` **Tom, 2026-09-09:** *„da will ich dieselbe grafik wie
  // recovery/muscle map."* **Also auf die SACHE pruefen, nicht auf
  // den Namen:** die Kachel zeichnet aus `@lumeos/ui`, und es steht
  // kein zweiter Umriss mehr in der Datei.
  //
  // ══ G-396: DER NAME WAR NIE DIE BEDINGUNG ════════════════
  //
  // `[cmd]` **Hier stand `/<InjektionsKarte\s/`** — und der Waechter
  // fiel, als die Kachel von Punkten auf Flaechen umgestellt wurde.
  // **`InjektionsKarte` baut PUNKTE** (`koerperkarte.tsx:604`);
  // anwaehlbare Flaechen brauchen die Grundkarte mit `muskeln`.
  //
  // `[read]` **Beide zeichnen dieselbe Figur aus denselben Pfaden**,
  // und genau das war gemeint. **Ein Namensverbot altert zur
  // Blockade** — die Sabotage bleibt dieselbe: eine lokale Silhouette
  // macht rot.
  assert.match(inj, /<(Koerperkarte|InjektionsKarte|ErmuedungsKarte)\s/,
    'die Kachel zeichnet die Figur nicht aus `@lumeos/ui` — zeichnet sie wieder selbst?')
  assert.ok(!/const SILHOUETTE\b/.test(inj),
    'eine zweite Silhouette ist zurueck — zwei Figuren sind zwei Wahrheiten')
  assert.ok(!/\bd="M\s*\d/.test(inj),
    'in der Kachel stehen wieder Pfaddaten — die Figur gehoert in `packages/ui`')
  // Die vier Unter-Tabs der Vorlage (Zeile 108).
  for (const t of ['rotation', 'schedule', 'log', 'guide']) {
    assert.ok(inj.includes(`'${t}'`), `Unter-Tab "${t}" fehlt.`)
  }
})

test('die drei verbliebenen Spec-Tabs sind da', () => {
  // `[cmd]` **G-172: `SuppCatalog` ist geloescht** — der Katalog-Tab
  // zeigt jetzt `SuppDatabase` mit den 566 Substanzen aus
  // `substance_catalog` (C-229). Der Entwurf trug die Marke *„Es gibt
  // keine Tabelle dafuer"* und stand neben der echten Datenbank, die
  // am `Database`-Knopf hing.
  //
  // `[read]` **Diese Pruefung hat den Wechsel gemeldet, wie sie soll.**
  // Sie zaehlt jetzt drei statt vier — und `deutsch-und-scroll.test.ts`
  // haelt fest, dass `SuppCatalog` nicht zurueckkommt.
  const spec = lies('tab-spec.tsx')
  for (const k of ['SuppStacks', 'SuppIntelligence', 'SuppInventory']) {
    assert.ok(new RegExp(`export function ${k}\\b`).test(spec), `"${k}" fehlt.`)
  }
})

test('SuppCost fuehrt alle fuenf Kacheln der Vorlage', () => {
  // `[cmd]` G-33 hatte zwei gebaut, die Vorlage fuehrt fuenf
  // (module-supplements.jsx:963, 971, 1020, 1029, 1042). Der Tab sah
  // beim Klicken vollstaendig aus — dieselbe Klasse Luecke wie bei
  // `SuppExtended`.
  const tabs = lies('tabs.tsx')
  for (const t of [
    'Cost · 12 months trend',
    'Spend per supplement · this month',
    'Category split',
    'If you removed…',
    'Cost optimization · suggestions',
  ]) {
    assert.ok(tabs.includes(t), `Die Kachel "${t}" fehlt in SuppCost.`)
  }
})

test('die neuen Tabs kennzeichnen jede Kachel', () => {
  // Keine Quelle heisst: jede Kachel traegt die Marke. Wer eine
  // anbindet, entfernt `attrappe` und zaehlt hier herunter.
  // `[cmd]` **G-172: `tab-spec.tsx` von 18 auf 16.** Die zwei Marken
  // gehoerten dem geloeschten `SuppCatalog` — der Katalog-Tab zeigt
  // jetzt die echte Substanzdatenbank (C-229), die keine traegt.
  // `[cmd]` **G-253: von 16 auf 12.** Die vier Marken gehoerten
  // `SuppStacks`; der Reiter liest jetzt `user_stacks` und
  // `stack_items`. **Am Schirm gezaehlt: 4 Attrappen vorher,
  // 0 nachher** (A-59).
  // `[cmd]` **G-275: von 12 auf 11.** Die Marke gehoerte „Gap
  // analysis" — die Kachel liest jetzt
  // `supplement_nutrient_intake_for_day` und traegt die Trennung
  // belegt / Untergrenze / unbekannt. **Am Schirm gezaehlt: 7
  // Attrappen im `intel`-Reiter vorher, 6 nachher** (A-59).
  // `[cmd]` **G-388: von 14 auf 13.** Die Marke gehoerte „Rotation
  // map" — die Kachel liest jetzt `medical.injection_sites` und
  // zeichnet mit `InjektionsKarte` dieselbe Figur wie recovery.
  // **Am Schirm gezaehlt: 6 Punkte mit `data-punkt`, Untertitel
  // „4 Orte aus medical.injection_sites".**
  const dateien: Array<[string, number]> = [
    ['tab-injektionen.tsx', 13],
    ['tab-spec.tsx', 11],
  ]
  for (const [datei, erwartet] of dateien) {
    const quelle = lies(datei)
    const n = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    assert.equal(n, erwartet,
      `${datei}: ${n} gekennzeichnet, erwartet ${erwartet}. `
      + 'Angebunden? Dann die Erwartung hier senken.')
  }
})
