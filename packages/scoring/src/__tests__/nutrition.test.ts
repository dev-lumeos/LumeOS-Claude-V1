// Der Nutrition-Score — G-417/A2.
//
// `[read]` **Eine reine Funktion laesst sich aufrufen** — hier wird
// nicht der Quelltext durchsucht, sondern gerechnet.
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  STUFEN_FAKTOR, GEWICHT, istStufe, stufenFaktor, nutritionScore,
} from '../nutrition'

/** Ein Tag, der jedes Ziel genau trifft. */
const ZIELE = {
  kcal: 2500, protein_g: 170, carbs_g: 313, fat_g: 75, fiber_g: 30,
}

test('E-80: vier Stufen, vier Faktoren', () => {
  // `[cmd]` **Der CHECK auf `public.profiles.experience_level`
  // erlaubt `beginner | advanced | pro | elite`.**
  assert.deepEqual(Object.keys(STUFEN_FAKTOR).sort(),
    ['advanced', 'beginner', 'elite', 'pro'])
  assert.equal(STUFEN_FAKTOR.beginner, 0.75)
  assert.equal(STUFEN_FAKTOR.advanced, 0.90)
  assert.equal(STUFEN_FAKTOR.pro, 1.00)
  assert.equal(STUFEN_FAKTOR.elite, 1.10)
})

test('kein intermediate — die Spec ist aelter als E-80', () => {
  // `[cmd]` **`SPEC_09:441-445` nennt `intermediate 0,90`**, die
  // Datenbank kennt den Wert nicht. `[read]` **Ein Faktor dafuer
  // waere einer fuer etwas, das niemand haben kann.**
  assert.equal(istStufe('intermediate'), false)
  assert.equal(stufenFaktor('intermediate'), null)
})

test('kein geratener Faktor fuer unbekannte Namen', () => {
  // `[read]` **G-283: der alte Rueckfall `?? 0.90` gab einem
  // `pro`-Nutzer den Faktor von `intermediate`** — kein Absturz, nur
  // eine falsche Zahl.
  assert.equal(stufenFaktor('gibtesnicht'), null)
  assert.equal(stufenFaktor(null), null)
  assert.equal(stufenFaktor(undefined), null)
})

test('die Gewichte summieren sich auf 1,00', () => {
  // `[cmd]` **`SPEC_09:53-59`.** `[read]` **Summieren sie sich
  // nicht, ist der Score keine Prozentzahl mehr.**
  const summe = Object.values(GEWICHT).reduce((s, g) => s + g, 0)
  assert.ok(Math.abs(summe - 1) < 1e-9, `Summe ${summe}, erwartet 1`)
})

test('ein perfekter Tag auf pro gibt 100', () => {
  // `[cmd]` **`pro` hat Faktor 1,00** — die Ziele bleiben, wie sie
  // sind, und ein Tag, der sie trifft, ist voll erfuellt.
  const e = nutritionScore(
    { enercc: 2500, prot625: 170, cho: 313, fat: 75, fibt: 30 },
    ZIELE, 'pro')
  assert.equal(e.score, 100)
  assert.equal(e.status, 'ok')
  assert.equal(e.gewichtGerechnet, 1)
  assert.equal(e.faktor, 1)
})

test('der Faktor skaliert das ZIEL, nicht den Score', () => {
  // `[cmd]` **`SPEC_09:33-40`: `adj = ziel * faktor`.**
  //
  // `[read]` **Der Unterschied ist keine Feinheit:** ein `beginner`
  // bekommt ein leichteres Ziel und kann es VOLL erfuellen. **Die
  // alte Fassung multiplizierte den fertigen Score — dort war sein
  // Hoechstwert 0,75.**
  const werte = {
    enercc: 2500 * 0.75, prot625: 170 * 0.75, cho: 313 * 0.75,
    fat: 75 * 0.75, fibt: 30 * 0.75,
  }
  const e = nutritionScore(werte, ZIELE, 'beginner')
  assert.equal(e.score, 100,
    'Ein beginner, der sein eigenes Ziel trifft, muss 100 bekommen')
  // Und das angepasste Ziel steht in den Anteilen.
  const protein = e.anteile.find(a => a.makro === 'protein')
  assert.equal(protein?.ziel, 170 * 0.75)
})

test('Kalorien zaehlen beidseitig, die anderen nicht', () => {
  // `[cmd]` **`SPEC_09:48-51`:** Ueber- UND Unteressen sind
  // Abweichung. `[read]` **Bei Protein ist mehr kein Fehler.**
  const zuViel = nutritionScore(
    { enercc: 5000, prot625: 170, cho: 313, fat: 75, fibt: 30 },
    ZIELE, 'pro')
  const kalorien = zuViel.anteile.find(a => a.makro === 'calorie')
  assert.equal(kalorien?.erfuellung, 0,
    'Doppelte Kalorien muessen die Erfuellung auf 0 druecken')

  const vielProtein = nutritionScore(
    { enercc: 2500, prot625: 340, cho: 313, fat: 75, fibt: 30 },
    ZIELE, 'pro')
  const protein = vielProtein.anteile.find(a => a.makro === 'protein')
  assert.equal(protein?.erfuellung, 1,
    'Mehr Protein als Ziel ist erfuellt, nicht uebererfuellt')
})

test('ein fehlendes Ziel zieht den Score nicht nach unten', () => {
  // `[read]` **Sonst saehe eine Datenluecke aus wie schlechtes
  // Essen.** `[cmd]` **Das Gewicht sinkt, der Score bleibt.**
  const ohneFiber = nutritionScore(
    { enercc: 2500, prot625: 170, cho: 313, fat: 75, fibt: 30 },
    { ...ZIELE, fiber_g: null }, 'pro')
  assert.equal(ohneFiber.score, 100)
  assert.ok(Math.abs(ohneFiber.gewichtGerechnet - 0.85) < 1e-9,
    `Gewicht ${ohneFiber.gewichtGerechnet}, erwartet 0.85`)
  const fiber = ohneFiber.anteile.find(a => a.makro === 'fiber')
  assert.equal(fiber?.erfuellung, null)
  assert.equal(fiber?.grund, 'kein Ziel hinterlegt')
})

test('ohne Stufenfaktor gibt es keinen Score', () => {
  const e = nutritionScore(
    { enercc: 2500, prot625: 170, cho: 313, fat: 75, fibt: 30 },
    ZIELE, null)
  assert.equal(e.score, null)
  assert.equal(e.status, 'offen')
  assert.equal(e.gewichtGerechnet, 0)
  for (const a of e.anteile) assert.equal(a.grund, 'kein Stufenfaktor')
})

test('die Schwellen der Vorlage', () => {
  // `[cmd]` **`SPEC_09:66`: ok >= 80, warn 50-79, block < 50.**
  const mit = (anteil: number) => nutritionScore(
    { enercc: 2500, prot625: 170 * anteil, cho: 313 * anteil,
      fat: 75 * anteil, fibt: 30 * anteil },
    ZIELE, 'pro').status
  assert.equal(mit(1), 'ok')
  assert.equal(mit(0.6), 'warn')
  assert.equal(mit(0.1), 'block')
})
