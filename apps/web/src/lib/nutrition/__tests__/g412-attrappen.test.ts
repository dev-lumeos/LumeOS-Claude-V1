/**
 * G-412 — die letzten Attrappen in Nutrition
 *
 * **Tom, 2026-09-08:** *„aus meiner sicht, was ich in der ui noch
 * nicht angebunden sehe: Nutrition score, Pre-workout window,
 * Micronutrient snapshot, Below threshold."*
 *
 * `[read]` **Die Proben messen nicht, DASS etwas gebaut ist** — das
 * steht am Schirm. **Sondern dass die Entscheidungen halten:** keine
 * erfundene Zahl, kein Rueckfall auf einen Vorgabewert, und die
 * sieben uebrigen Referenzbloecke bleiben.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { stufenFaktor, stufeGilt, nutritionScore }
  from '../stufenfaktor'
import { flaecheMitLuecken } from '../insights-lage'

const HIER = dirname(fileURLToPath(import.meta.url))
const WEB = join(HIER, '..', '..', '..')
const NUT = join(WEB, 'app', 'v2', 'nutrition')

const ohneKommentar = (p: string) => readFileSync(p, 'utf8').split('\n')
  .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
  .join('\n')

test('die vier Attrappen sind entfallen', () => {
  // `[cmd]` **Score angebunden, die anderen drei doppelt.**
  const t = ohneKommentar(join(NUT, 'ansicht.tsx'))
  for (const name of ['NutritionScoreCard', 'PreWorkoutOptimizer',
    'MicronutrientSnapshot', 'BelowThreshold']) {
    assert.ok(!t.includes(`<${name}`), `${name} wird noch gerendert`)
  }
  // Und die echte Kachel steht da.
  assert.match(t, /<ScoreEcht\b/)
})

test('sechs Referenzbloecke bleiben, Diary und Insights fallen', () => {
  // **Tom, 2026-09-08:** *,,und dann kann die mockup-referenz-linie
  // und alles darunter weg."* ? `[cmd]` **zuerst NUR im Diary-Block
  // (G-412).**
  //
  // **Tom, spaeter am selben Tag:** *,,ok insights kann die
  // mockuplinie und das darunter weg."* ? `[cmd]` **G-419.**
  //
  // `[read]` **Ein Block faellt, wenn Tom ihn ABGENOMMEN hat** ?
  // nicht, wenn der Orchestrator ihn fuer fertig haelt.
  const t = ohneKommentar(join(NUT, 'ansicht.tsx'))
  for (const weg of ['NutritionDiaryReferenz', 'NutritionInsightsReferenz']) {
    assert.ok(!t.includes(`<${weg}`), `${weg} steht noch`)
  }
  const uebrig = ['NutritionNutrientsReferenz',
    'NutritionPlansReferenz', 'NutritionPrefsReferenz',
    'NutritionPlannerReferenz', 'EinkaufReferenz', 'NutritionFoodsReferenz']
  for (const n of uebrig) {
    assert.ok(t.includes(`<${n}`), `${n} fehlt ? die sechs bleiben`)
  }
  assert.equal(uebrig.length, 6)
})

test('der Score raet keinen Stufenfaktor', () => {
  // `[cmd]` **Ein Rueckfall auf 0,90 gab `pro` den Wert von
  // `intermediate`** — kein Absturz, nur eine falsche Zahl (G-283).
  //
  // `[cmd]` **G-417: `pro` hat seit E-80 einen Faktor (1,00).**
  // `[read]` **Die Zusage war nie „`pro` bleibt leer", sondern
  // „nichts raten"** — ein UNBEKANNTER Name ist der echte Fall.
  assert.equal(stufenFaktor('pro'), 1.00)
  assert.equal(stufeGilt('pro'), true)
  assert.equal(stufenFaktor('gibtesnicht'), null)
  assert.equal(stufeGilt('gibtesnicht'), false)
  // Ohne Faktor kein Score.
  const voll = { protein: 1, calorie: 1, carbs: 1, fat: 1, fiber: 1 }
  assert.equal(nutritionScore(voll, 'gibtesnicht'), null,
    'Ein unbekannter Name bekommt wieder einen Score (G-283)')
  assert.equal(nutritionScore(voll, 'advanced'), 0.90)
})

test('der Stufenfaktor liegt ausserhalb der Client-Grenze', () => {
  // `[cmd]` **Am Schirm gemessen:** die Tabelle stand in
  // `diary-entwurf.tsx` (`'use client'`), die Score-Kachel ist eine
  // Server-Komponente — **`stufenFaktor is not a function`, 0
  // Karten.** `[read]` **`tsc` blieb gruen.**
  // `[cmd]` **G-417: die Tabelle ist nach `packages/scoring`
  // gezogen** — `SPEC_09_SCORING.md:11` nennt den Ort.
  // `[read]` **Die ZUSAGE ist dieselbe geblieben:** die Kachel darf
  // ihren Faktor nicht aus einer `'use client'`-Datei holen. **Nur
  // der Ort hat sich geaendert, nicht die Gefahr.**
  const lib = join(WEB, '..', '..', '..', 'packages', 'scoring', 'src', 'nutrition.ts')
  assert.ok(existsSync(lib), 'packages/scoring/src/nutrition.ts fehlt')
  const ersteZeile = readFileSync(lib, 'utf8').trimStart().slice(0, 40)
  assert.ok(!ersteZeile.includes('use client'),
    'Die Tabelle darf keine Client-Datei sein')
  // Und die Kachel holt sie von dort, nicht aus dem Entwurf.
  const karte = ohneKommentar(join(NUT, 'score-echt.tsx'))
  assert.match(karte, /from '@lumeos\/scoring'/,
    'Die Kachel muss den Faktor aus dem Paket holen')
  assert.ok(!/from '.*diary-entwurf'/.test(karte),
    'Kein Wert-Import aus dem Entwurf — der traegt `use client`')
})

test('das Ballaststoffziel wird GELESEN, nicht erfunden', () => {
  // ══ DIESE ZUSAGE WURDE UMGEDREHT (G-417) ═══════════════════════
  //
  // `[cmd]` **G-412 verlangte `zielFeld: null`** — damals richtig:
  // gemessen ueber alle Spalten mit „fib" gab es nur Zufuhr.
  //
  // `[cmd]` **Seit C-464 gibt es `goals.nutrition_targets.fiber_g`**
  // — fuenf Nutzer haben einen Wert, `dev@lumeos.app` 30,0 g.
  //
  // `[read]` **Die alte Fassung haette den neuen Wert verboten.**
  // `[read]` **Die Zusage dahinter bleibt aber dieselbe:** nichts
  // erfinden. **Nur heisst das jetzt LESEN statt offenlassen.**
  const t = ohneKommentar(join(WEB, 'lib', 'nutrition', 'score-read.ts'))
  assert.match(t, /fiber_g:\s*ziele\?\.fiber_g/,
    'Der Ballaststoffanteil muss `fiber_g` aus den Zielen lesen')
  // `[cmd]` **Und der Leseweg muss die Spalte ueberhaupt fuehren** —
  // `goals.zielwerte_am()` gibt sie zurueck, der Typ liess sie fallen.
  const z = ohneKommentar(join(WEB, 'lib', 'profile', 'zielwerte-read.ts'))
  assert.match(z, /fiber_g:\s*zahl\(r\.fiber_g\)/,
    'zielwerte-read muss fiber_g abbilden')
  // `[read]` **Kein geratener Ersatzwert** — waere hier eine Zahl
  // eingetragen, waere es eine Aussage ueber den Nutzer.
  assert.ok(!/fiber_g:\s*\d/.test(t) && !/fiber_g:\s*\d/.test(z),
    'Kein fest verdrahtetes Ballaststoffziel')
})

test('die Verlaufsgrafik ist die der Vorlage', () => {
  // `[cmd]` **`module-charts-pro.jsx:115`:** geglaettet (`Q`),
  // Verlauf 0,22 -> 0, Flaeche nur bei `si === 0`, Punkte nur bis 16,
  // zweite Reihe gestrichelt `"3 3"`.
  // `[cmd]` **`WEB` zeigt auf `apps/web/src`** — von dort sind es
  // vier Ebenen zur Wurzel, nicht zwei.
  const t = ohneKommentar(
    join(WEB, '..', '..', '..', 'packages', 'ui', 'src', 'primitives.tsx'))
  assert.match(t, /const glatt = /, 'Die Glaettung fehlt')
  // `[cmd]` **G-416: 0,22 war am Schirm unsichtbar** (gemessen:
  // 26 RGB-Stufen ueber dem Grund). `[read]` **Die Zusage ist,
  // DASS ein Verlauf da ist** — nicht welche Zahl er traegt.
  assert.match(t, /stopOpacity="0\.\d+"/, 'Der Verlauf fehlt')
  assert.match(t, /strokeDasharray=\{gestrichelt \? '3 3'/, 'Die Strichelung fehlt')
  assert.match(t, /pts\.length <= 16/, 'Die Punktgrenze fehlt')
})

test('die Waermekarte erfindet keine Zellen', () => {
  // `[cmd]` **Die Vorlage fuellt sie mit `Math.random()`**
  // (`module-nutrition.jsx:399`). `[read]` **Hier kommen die Werte
  // aus `micronutrient_snapshot`**, und eine Luecke bleibt leer.
  const t = ohneKommentar(join(NUT, 'mikro-trend.tsx'))
  assert.ok(!t.includes('Math.random'), 'Die Waermekarte wuerfelt')
  assert.match(t, /anteil === null/, 'Leere Zellen brauchen einen eigenen Fall')
  const read = ohneKommentar(join(WEB, 'lib', 'nutrition', 'mikro-trend-read.ts'))
  assert.match(read, /Promise\.all/,
    'Dreissig Aufrufe muessen gleichzeitig laufen, nicht nacheinander')
})

test('die Tagesdeckung ist auf zwei Drittel begrenzt', () => {
  // `[cmd]` **Am Schirm gemessen: 616 px vorher, 411 nachher.**
  // `[read]` **Die Hoehe steht INLINE** — eine Regel in
  // `nutrition.css` blieb wirkungslos, weil ein Inline-Stil gewinnt.
  const t = ohneKommentar(join(NUT, 'ansicht.tsx'))
  // `[cmd]` **G-416 hat die Liste um 30 % erhoeht** (255 -> 332).
  // `[read]` **Die Zusage bleibt: die Liste ist BEGRENZT und
  // scrollt** — die Kachel darf nicht wieder ins Kraut schiessen.
  // **Die genaue Zahl steht in der G-416-Probe.**
  const m = /maxHeight: (\d+), overflowY: 'auto'/.exec(t)
  assert.ok(m, 'Der Scrollkasten der Tagesdeckung fehlt')
  assert.ok(Number(m[1]) <= 400,
    `Die Liste ist mit ${m[1]} px wieder ungedeckelt`)
})

test('Macro split traegt die drei Zeilen der Vorlage', () => {
  // `[cmd]` **`module-nutrition.jsx:386-390`**, nach der Trennlinie:
  // hoechster Tag, niedrigster Tag, Tage am Ziel ±100.
  //
  // `[read]` **Alle drei aus `d.reihe`** — derselben Tagesreihe, die
  // die Verlaufsgrafik zeichnet. **Kein zweiter Leseweg**, sonst
  // koennten die beiden verschiedene Zahlen zeigen.
  const t = ohneKommentar(join(NUT, 'insights-echt.tsx'))
  assert.match(t, /Hoechster Tag/)
  assert.match(t, /Niedrigster Tag/)
  assert.match(t, /Tage am Ziel/)
  // `[cmd]` **Die Toleranz steht in der Vorlage: ±100.**
  assert.match(t, /<= 100/, 'Die Toleranz ±100 fehlt')
  // `[read]` **Ohne Ziel keine Quote** — sonst behauptete die Zeile
  // „0 von 14", wo in Wahrheit das Ziel fehlt.
  assert.match(t, /kein Kalorienziel hinterlegt/)
})

test('die Verlaufsgrafik zeigt das Ziel gestrichelt', () => {
  // `[cmd]` **Die Vorlage ruft `LineChart` mit ZWEI Reihen:** Zufuhr
  // in `--acc-nutri`, Ziel flach in `--fg-dim`.
  // `[cmd]` **`range={[1500, 3200]}`, `h={180}`** — feste Grenzen.
  const t = ohneKommentar(join(NUT, 'insights-echt.tsx'))
  assert.match(t, /range=\{\[1500, 3200\]\}/, 'Die festen Grenzen fehlen')
  assert.match(t, /h=\{180\}/, 'Die Hoehe 180 fehlt')
  assert.match(t, /dashed: true/, 'Die Ziellinie ist nicht gestrichelt')
  // `[read]` **Ohne Ziel nur EINE Reihe** — eine flache Linie auf
  // einem geratenen Wert waere eine Aussage ueber den Nutzer.
  assert.match(t, /zielKcal === null/)
})

// ══ G-416: Hoehen, Flaechen, Deckkraft ═════════════════════════════

test('die Flaeche unter der Kurve ist sichtbar', () => {
  // **Tom, 2026-09-11:** *„bei Calorie balance ist die Linie da …
  // aber KEIN Farbverlauf darunter."*
  //
  // `[cmd]` **Gemessen war sie da** — Bildpunkte unter der Kurve
  // rgb(48,43,39) gegen rgb(22,23,26) Grund. **26 Stufen auf dunklem
  // Grund: nicht zu sehen.**
  //
  // `[read]` **Die Vorlage nennt 0,22, zeichnet aber auf hellerem
  // Grund.** `[cmd]` **Hier 0,45 auf 0,02.**
  const t = ohneKommentar(
    join(WEB, '..', '..', '..', 'packages', 'ui', 'src', 'primitives.tsx'))
  const m = /stopOpacity="([\d.]+)"/.exec(t)
  assert.ok(m, 'Der Verlauf hat keine Deckkraft')
  assert.ok(Number(m[1]) >= 0.4,
    `Die Flaeche ist mit ${m[1]} zu blass — gemessen unsichtbar bei 0.22`)
})

test('LineChart kann eckig zeichnen', () => {
  // **Tom:** *„die grafik auch abbilden wie in calorie balance, aber
  // nicht geglaettet."*
  //
  // `[read]` **Ein Schalter, keine zweite Komponente** — sonst
  // laufen zwei Diagramme auseinander.
  const t = ohneKommentar(
    join(WEB, '..', '..', '..', 'packages', 'ui', 'src', 'primitives.tsx'))
  assert.match(t, /smooth\?: boolean/, 'Der Schalter fehlt in den Requisiten')
  assert.match(t, /smooth = true/, 'Die Vorgabe muss `true` sein (wie die Vorlage)')
  assert.match(t, /smooth \? glatt\(pts\) : eckig\(pts\)/,
    'Der Schalter wird nicht angewandt')
})

test('der Verlauf traegt eine Flaeche, ohne Luecken zu ueberziehen', () => {
  // `[read]` **Je zusammenhaengendem Stueck eine eigene Flaeche** —
  // dieselbe Regel wie beim Pfad. **Sonst behauptet sie Tage, die es
  // nicht gibt.**
  // ══ GEGENPROBE WAR GRUEN ════════════════════════
  //
  // `[cmd]` **Die Sabotage „die Flaeche zieht ueber Luecken“
  // (`schliessen()` bei `null` entfernt) blieb GRUEN** — die Probe
  // pruefte nur, DASS es die Funktion gibt.
  //
  // `[read]` **Jetzt wird die WIRKUNG gerufen:** eine Reihe mit
  // einer Luecke muss ZWEI geschlossene Stuecke ergeben, nicht
  // eines ueber die Luecke hinweg.
  const lage = ohneKommentar(join(WEB, 'lib', 'nutrition', 'insights-lage.ts'))
  assert.match(lage, /export function flaecheMitLuecken/)
  {
    const d = flaecheMitLuecken([1, 2, null, 4, 5], i => i * 10, v => 100 - v, 100)
    const stuecke = (d.match(/Z/g) ?? []).length
    assert.equal(stuecke, 2,
      `Eine Luecke muss die Flaeche teilen — ${stuecke} Stueck(e) statt 2`)
    // Und ohne Luecke bleibt es EIN Stueck.
    const ganz = flaecheMitLuecken([1, 2, 3], i => i * 10, v => 100 - v, 100)
    assert.equal((ganz.match(/Z/g) ?? []).length, 1)
  }
  const k = ohneKommentar(join(NUT, 'insights-kacheln.tsx'))
  assert.match(k, /flaecheMitLuecken\(werte, zuX, zuY/,
    'Der Verlauf zeichnet keine Flaeche')
})

test('die Kacheln gleichen ihre Hoehe nicht mehr ab', () => {
  // **Tom:** *„die sollen nicht mit den anderen kacheln daneben auf
  // die hoehe abgeglichen werden."*
  //
  // `[cmd]` **Gemessen: 461/461, 514/514, 733/733** — paarweise
  // gleich, weil `align-items` im Raster `stretch` ist.
  //
  // ══ G-417 HAT DIESE ZUSAGE VERSCHAERFT ═════════════════════════
  //
  // **Tom, 2026-09-11:** *„das sind zwei unabhaengige spalten."*
  //
  // `[cmd]` **`align-items: start` (G-416) reichte nicht** — am
  // Schirm endeten Calorie balance und Macro split weiter gleich
  // hoch. `[read]` **Der Grund ist die RASTERZEILE:** Zeile 2 beginnt
  // erst, wenn beide Kacheln der Zeile 1 fertig sind.
  //
  // `[read]` **Deshalb keine Rasterzeilen mehr, sondern zwei
  // Stapel** — und der Waechter prueft die neue Mechanik.
  //
  // `[read]` **NICHT `.v2-grid` geaendert** — 217 Aufrufer im Haus.
  const css = readFileSync(join(NUT, 'nutrition.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  // Die Saeule ist ein eigener Stapel, keine Rasterzeile.
  assert.match(css, /\.v2-saeule\s*\{[^}]*flex-direction:\s*column/,
    'Eine Saeule muss ihre Kacheln untereinander stapeln')
  assert.match(css, /\.v2-zwei-saeulen\s*\{[^}]*grid-template-columns:\s*1fr 1fr/,
    'Zwei Saeulen nebeneinander')

  const t = ohneKommentar(join(NUT, 'ansicht.tsx'))
  assert.ok(t.includes('v2-zwei-saeulen'),
    'Der Insights-Reiter benutzt die zwei Saeulen nicht')
  // `[cmd]` **Zwei Saeulen, nicht eine** — sonst stuenden alle
  // Kacheln untereinander.
  const saeulen = t.match(/className="v2-saeule"/g) ?? []
  assert.equal(saeulen.length, 2,
    `Genau zwei Saeulen erwartet, ${saeulen.length} gefunden`)
  // `[read]` **Und KEINE Kachel mehr im alten Zweierraster** — sonst
  // kaeme die Zeilenbindung durch die Hintertuer zurueck.
  assert.ok(!/v2-g-cols-2 v2-eigene-hoehe/.test(t),
    'Die Insights-Kacheln duerfen nicht mehr im Zweierraster stehen')
})

test('die Waermekarten tragen die Deckkraft der Vorlage', () => {
  // `[cmd]` **`module-nutrition.jsx:422`: `opacity: 0.25 + v * 0.7`.**
  // `[read]` **Sie haengt am WERT** — G-412 setzte pauschal 0,85,
  // und deshalb wirkten die Farben schrill.
  const trend = ohneKommentar(join(NUT, 'mikro-trend.tsx'))
  assert.match(trend, /0\.25 \+ Math\.min\(1, anteil\) \* 0\.7/,
    'Micronutrient trend hat nicht die Deckkraft der Vorlage')
  const kacheln = ohneKommentar(join(NUT, 'insights-kacheln.tsx'))
  assert.match(kacheln, /0\.25 \+ Math\.min\(1, pct \/ 100\) \* 0\.7/,
    'Tagesdeckung hat nicht die Deckkraft der Vorlage')
  // `[cmd]` **Und die Zellhoehe 16** (`:420`) statt `aspectRatio`.
  assert.match(kacheln, /height: 16,/, 'Die Zellhoehe 16 fehlt')
  assert.ok(!kacheln.includes("aspectRatio: '1'"),
    'Das Feld waechst wieder mit der Kachelbreite')
})

test('Micronutrient trend zeigt den Schnitt je Zeile', () => {
  // **Tom:** *„rechts fehlt durchschnittsprozentangabe, siehe mockup
  // referenz."*
  //
  // `[read]` **Schnitt ueber die BELEGTEN Tage** — eine Luecke zaehlt
  // nicht als null, sonst zoege sie den Wert nach unten.
  // ══ GEGENPROBE WAR GRUEN ════════════════════════
  //
  // `[cmd]` **Die Sabotage „die Schnittspalte faellt weg“
  // (Funktion umbenannt) blieb GRUEN** — die Probe suchte die
  // Filterzeile, und die ueberlebt jede Umbenennung.
  //
  // `[read]` **Jetzt wird der AUFRUF geprueft**, nicht die
  // Definition — eine Funktion, die niemand ruft, zeigt nichts.
  const t = ohneKommentar(join(NUT, 'mikro-trend.tsx'))
  assert.match(t, /function zeilenSchnitt\(/, 'Die Funktion fehlt')
  assert.match(t, /zeilenSchnitt\(r\.zellen\)/,
    'Der Schnitt wird nicht gerendert — die Spalte bliebe leer')
  assert.match(t, /z\.anteil\).filter\(\(n\): n is number => n !== null\)/,
    'Der Schnitt muss Luecken ausschliessen, nicht als 0 zaehlen')
})

test('die Deckung je Naehrstoff zeigt mehr Zeilen', () => {
  // **Tom:** *„dass ein bisschen mehr direkt sehbar sind."*
  //
  // `[cmd]` **Am Schirm gemessen: 8 -> 10 von 154 Naehrstoffen**,
  // Liste 255 -> 332 px (+30 %).
  // `[read]` **Mehr Hoehe, NICHT kleinere Zeilen.**
  const t = ohneKommentar(join(NUT, 'ansicht.tsx'))
  assert.match(t, /maxHeight: 332/,
    'Die Liste ist nicht um 30 % gewachsen')
})
