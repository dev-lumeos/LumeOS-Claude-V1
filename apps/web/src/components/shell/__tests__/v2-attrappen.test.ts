// Die Attrappenmarke ist der Fortschrittsbalken — sie darf nicht
// stillschweigend verschwinden.
//
// [read] Tom, 2026-08-16: "Jedes Feature traegt einen Hinweis, ob es
// Mockup ist; wenn es verdrahtet ist, faellt der Hinweis weg."
//
// ANLASS: G-05 hatte die neun Kacheln ohne Datenquelle WEGGELASSEN
// statt sie zu kennzeichnen. Das faellt nicht auf, solange niemand die
// Vorlage danebenlegt — eine fehlende Kachel sieht aus, als sei sie
// nicht vorgesehen. Diese Pruefung haelt zweierlei fest:
//
//   1. Die Vorlage-Kacheln stehen ALLE in der Datei (keine weggelassen).
//   2. Jede ohne Datenquelle traegt `attrappe`.
//
// Wer eine Kachel verdrahtet, entfernt `attrappe` und traegt sie unten
// bei ECHT ein. Wer eine Kachel loescht, faellt hier auf.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

// Wie in v2-akzente.test.ts: relativ zum Arbeitsverzeichnis (apps/web),
// weil `import.meta.dirname` unter tsx --test nicht gesetzt ist.
const DASHBOARD = path.join(process.cwd(), 'src/app/v2/dashboard/entwurf.tsx')
const NUTRITION = path.join(process.cwd(), 'src/app/v2/nutrition/ansicht.tsx')
const DIARY = path.join(process.cwd(), 'src/app/v2/nutrition/diary-entwurf.tsx')
const BAUM = path.join(process.cwd(), 'src/app/v2/nutrition/nutrient-baum.ts')
const TRAINING = path.join(process.cwd(), 'src/app/v2/training/ansicht.tsx')
const TRAINING_SPEC = path.join(process.cwd(), 'src/app/v2/training/tabs-spec.tsx')
const TRAINING_HR = path.join(process.cwd(), 'src/app/v2/training/tabs-offline-hr.tsx')

/**
 * Die zwoelf Kacheln der Vorlage (theme-v1/module-dashboard.jsx) —
 * mit den Namen, die dort stehen. Uebersetzt wird nicht: die Vorlage
 * ist englisch, und wer sie eindeutscht, kann sie nicht mehr
 * danebenlegen.
 */
const VORLAGE_DASHBOARD = [
  'Recovery', 'Training Load', 'Calories', 'Sleep · last',
  "Today's flow", 'Macros · today', 'Activity',
  'Readiness', 'Body battery', 'Tonight', 'PR watch',
]

/** Welche davon angebunden sind. Waechst mit der Anbindung. */
const ECHT_DASHBOARD = ['Macros · today']

test('alle Kacheln der Vorlage stehen im Dashboard', () => {
  const quelle = fs.readFileSync(DASHBOARD, 'utf8')
  for (const kachel of VORLAGE_DASHBOARD) {
    assert.ok(quelle.includes(kachel),
      `Die Kachel "${kachel}" steht in der Vorlage, aber nicht in dashboard.tsx. ` +
      'Nicht weglassen — kennzeichnen.')
  }
})

test('das Dashboard kennzeichnet so viele Kacheln, wie Quellen fehlen', () => {
  const quelle = fs.readFileSync(DASHBOARD, 'utf8')
  // `attrappe={ATTRAPPE}` an Karten plus die KPI-Huellen.
  const anKarten = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
  const anKpis = (quelle.match(/v2-kpi-huelle v2-attrappe/g) ?? []).length
  const markiert = anKarten + anKpis
  const erwartet = VORLAGE_DASHBOARD.length - ECHT_DASHBOARD.length

  assert.equal(markiert, erwartet,
    `${erwartet} Kacheln der Vorlage sind nicht angebunden, aber ${markiert} ` +
    'sind gekennzeichnet. Angebunden? Dann ECHT_DASHBOARD ergaenzen.')
})

test('die sieben Tabs der Vorlage stehen im Nutrition-Modul', () => {
  const quelle = fs.readFileSync(NUTRITION, 'utf8')
  // [cmd] module-nutrition.jsx Zeile 28-36, in dieser Reihenfolge.
  for (const tab of ['Diary', 'Insights', 'Nutrients', 'Food DB',
                     'Meal plans', 'Preferences', 'Planner']) {
    assert.ok(quelle.includes(`'${tab}'`),
      `Der Tab "${tab}" fehlt. Die Vorlage fuehrt sieben.`)
  }
})

test('die sieben Begleitkarten des Diary stehen da', () => {
  // [cmd] module-nutrition.jsx:227-289, in dieser Reihenfolge.
  const quelle = fs.readFileSync(DIARY, 'utf8')
  for (const karte of [
    'Smart suggestions', 'Nutrition score', 'Pending actions',
    'Pre-workout window', 'Hydration', 'Micronutrient snapshot', 'Below threshold',
  ]) {
    assert.ok(quelle.includes(karte), `Die Karte "${karte}" fehlt.`)
  }
})

test('der Nutrition score rechnet mit der Formel der Vorlage', () => {
  // [read] Der Auftrag: die Entwurfszahlen bleiben stehen. Die
  // Gewichtung steht in module-nutrition-spec.jsx:38-42 und wird
  // uebernommen, nicht erfunden — der frueher hier stehende leere Ring
  // war die Abweichung.
  const quelle = fs.readFileSync(DIARY, 'utf8')
  assert.ok(/c\.protein \* 0\.30/.test(quelle), 'Protein-Gewicht 0.30 fehlt')
  assert.ok(/c\.calorie \* 0\.25/.test(quelle), 'Kalorien-Gewicht 0.25 fehlt')
  assert.ok(/beginner: 0\.75/.test(quelle), 'Stufenfaktoren fehlen')
})

/**
 * Die zehn Tabs der Vorlage (theme-v1/module-training.jsx:28-39) — in
 * dieser Reihenfolge. Anders als beim Dashboard ist hier KEINE Kachel
 * angebunden: `[cmd]` training.exercises hat 1.416 Zeilen Stammdaten,
 * aber `training.sessions` und `training.sets` gibt es nicht, und jede
 * Zahl des Moduls braucht Sitzungen.
 */
const VORLAGE_TRAINING_TABS = [
  'Today', 'Plan', 'History', 'Exercises', 'Progression',
  'Volume landmarks', 'Standards', 'Calendar', 'HR zones', 'Offline sync',
]

test('die zehn Tabs der Vorlage stehen im Training-Modul', () => {
  const quelle = fs.readFileSync(TRAINING, 'utf8')
  for (const tab of VORLAGE_TRAINING_TABS) {
    assert.ok(quelle.includes(`'${tab}'`),
      `Der Tab "${tab}" fehlt. Die Vorlage fuehrt zehn.`)
  }
})

test('das Training-Modul kennzeichnet jede Kachel', () => {
  // Keine Quelle heisst: jede Kachel traegt die Marke. Wer eine
  // anbindet, entfernt `attrappe` und zaehlt die Erwartung herunter —
  // dann faellt hier auf, dass es passiert ist.
  //
  // Gezaehlt werden BEIDE Schreibweisen: `attrappe={ATTRAPPE}` traegt
  // die Marke samt Begruendung, das blosse `attrappe` nur die Marke.
  // Letzteres steht an den kleinen Zahlenkacheln, wo der
  // Begruendungssatz laenger waere als die Kachel.
  const dateien: Array<[string, number]> = [
    [TRAINING, 11],
    [TRAINING_SPEC, 17],
    [TRAINING_HR, 9],
    [path.join(process.cwd(), 'src/app/v2/training/tabs-extras.tsx'), 1],
  ]
  for (const [datei, erwartet] of dateien) {
    const quelle = fs.readFileSync(datei, 'utf8')
    const mitGrund = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    const ohneGrund = (quelle.match(/\battrappe(?=>|\s*$)/gm) ?? []).length
    const markiert = mitGrund + ohneGrund
    assert.equal(markiert, erwartet,
      `${path.basename(datei)}: ${markiert} Kacheln gekennzeichnet, erwartet ${erwartet}. ` +
      'Angebunden? Dann die Erwartung hier senken.')
  }
})

test('die vier Ansichten der Spec-Vorlage stehen da', () => {
  // [cmd] module-training-spec.jsx definiert window.TrainingProgressionView,
  // TrainingLandmarksView, TrainingStandardsView, TrainingCalendarView.
  // module-training.jsx:48-51 zeigt genau diese vier in den Tabs 5-8.
  const quelle = fs.readFileSync(TRAINING_SPEC, 'utf8')
  for (const view of ['TrainingProgressionView', 'TrainingLandmarksView',
                      'TrainingStandardsView', 'TrainingCalendarView']) {
    assert.ok(quelle.includes(`export function ${view}`), `${view} fehlt.`)
  }
})

test('die Volume landmarks fuehren die zehn Muskelgruppen der Vorlage', () => {
  // [cmd] module-training-spec.jsx:174-185. Wer die Liste kuerzt,
  // faellt hier auf — wie beim Naehrstoffbaum.
  const quelle = fs.readFileSync(TRAINING_SPEC, 'utf8')
  for (const m of ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
                   'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs']) {
    assert.ok(quelle.includes(`m: '${m}'`), `Die Muskelgruppe "${m}" fehlt.`)
  }
})

test('die Formeln der Spec-Vorlage sind uebernommen, nicht erfunden', () => {
  // [read] Dieselbe Regel wie beim Nutrition score: die Gewichtung
  // steht in der Vorlage und wird uebernommen.
  const quelle = fs.readFileSync(TRAINING_SPEC, 'utf8')
  // Training score, module-training-spec.jsx:345.
  assert.ok(/adherence \* 0\.40/.test(quelle), 'Gewicht adherence 0.40 fehlt')
  assert.ok(/landmarks \* 0\.30/.test(quelle), 'Gewicht landmarks 0.30 fehlt')
  assert.ok(/strength \* 0\.20/.test(quelle), 'Gewicht strength 0.20 fehlt')
  assert.ok(/balance \* 0\.10/.test(quelle), 'Gewicht balance 0.10 fehlt')
  // Feedback loop, module-training-spec.jsx:195-196.
  assert.ok(/l\.pump >= 2\.5 && l\.sore <= 1\.5/.test(quelle), 'MAV-Regel fehlt')
  assert.ok(/l\.sore >= 2\.5 && l\.pump <= 1\.5/.test(quelle), 'MRV-Regel fehlt')
})

test('der Naehrstoffbaum ist vollstaendig uebernommen', () => {
  // [cmd] module-nutrition-nutrients.jsx fuehrt 79 Eintraege in acht
  // Gruppen. Wer den Baum kuerzt, faellt hier auf.
  const baum = fs.readFileSync(BAUM, 'utf8')
  const eintraege = (baum.match(/^\s{2}\{ id: "/gm) ?? []).length
  assert.equal(eintraege, 79,
    `Der Baum hat ${eintraege} Eintraege, die Vorlage 79.`)
  const gruppen = (baum.match(/^\s{2}"/gm) ?? []).length
  assert.equal(gruppen, 8, `GROUP_ORDER hat ${gruppen} Gruppen, die Vorlage 8.`)
})
