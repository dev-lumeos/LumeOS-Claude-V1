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
const SUPP = path.join(process.cwd(), 'src/app/v2/supplements/tabs.tsx')
const SUPP_RAHMEN = path.join(process.cwd(), 'src/app/v2/supplements/ansicht.tsx')
const SUPP_DATEN = path.join(process.cwd(), 'src/app/v2/supplements/daten.ts')
const SUPP_MODALE = path.join(process.cwd(), 'src/app/v2/supplements/modale.tsx')
const SUPP_EXT = path.join(process.cwd(), 'src/app/v2/supplements/tab-extended.tsx')
const SUPP_COMP = path.join(process.cwd(), 'src/app/v2/supplements/tab-compliance.tsx')
const RECOVERY = path.join(process.cwd(), 'src/app/v2/recovery/ansicht.tsx')
const RECOVERY_MOTOR = path.join(process.cwd(), 'src/app/v2/recovery/motor.ts')
const GOALS = path.join(process.cwd(), 'src/app/v2/goals/ansicht.tsx')
const GOALS_DATEN = path.join(process.cwd(), 'src/app/v2/goals/daten.ts')
const MEDICAL = path.join(process.cwd(), 'src/app/v2/medical/ansicht.tsx')
const MEDICAL_DATEN = path.join(process.cwd(), 'src/app/v2/medical/daten.ts')
const COACH = path.join(process.cwd(), 'src/app/v2/coach/ansicht.tsx')
const COACH_DATEN = path.join(process.cwd(), 'src/app/v2/coach/daten.ts')
const COACH_RECHTE = path.join(process.cwd(), 'src/app/v2/coach/tab-rechte.tsx')
const COACH_AUTO = path.join(process.cwd(), 'src/app/v2/coach/tab-autonomie.tsx')
const COACH_ONBOARD = path.join(process.cwd(), 'src/app/v2/coach/tab-onboarding.tsx')
const COACH_MODALE = path.join(process.cwd(), 'src/app/v2/coach/modale.tsx')
const COACH_AI = path.join(process.cwd(), 'src/app/v2/coach/ai/page.tsx')

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

/**
 * Die neun Tabs der Vorlage (theme-v1/module-recovery-v2.jsx:32-42) —
 * in dieser Reihenfolge.
 *
 * `[cmd]` Uebernommen ist `-v2.jsx`, NICHT `module-recovery.jsx`:
 * `app.jsx:122` mountet `RecoveryModuleV2`, wenn es vorliegt, und der
 * alte Rahmen ist nur der Notnagel. Der alte fuehrt sieben andere Tabs
 * (Today, Sleep, Biometrics, Protocols, Body map, Stress, Insights).
 */
const VORLAGE_RECOVERY_TABS = [
  'Today', 'Check-in', 'Muscle map', 'HRV', 'Sleep',
  'Modalities', 'Overtraining', 'Protocols', 'Stress',
]

test('die neun Tabs der Vorlage stehen im Recovery-Modul', () => {
  const quelle = fs.readFileSync(RECOVERY, 'utf8')
  for (const tab of VORLAGE_RECOVERY_TABS) {
    assert.ok(quelle.includes(`'${tab}'`),
      `Der Tab "${tab}" fehlt. Die Vorlage (-v2.jsx) fuehrt neun.`)
  }
})

test('das Recovery-Modul kennzeichnet jede Kachel', () => {
  // Kein Schema heisst: jede Kachel traegt die Marke. Wer eine
  // anbindet, entfernt `attrappe` und zaehlt die Erwartung herunter.
  const dateien: Array<[string, number]> = [
    [RECOVERY, 5],
    [path.join(process.cwd(), 'src/app/v2/recovery/tab-checkin.tsx'), 4],
    [path.join(process.cwd(), 'src/app/v2/recovery/tab-messwerte.tsx'), 10],
    [path.join(process.cwd(), 'src/app/v2/recovery/tab-protokolle.tsx'), 17],
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

test('die Koerperkarte fuehrt alle 18 Muskelgruppen der Vorlage', () => {
  // [cmd] module-recovery-engine.jsx:5-10. Wer die Liste kuerzt, laesst
  // Flaechen der Figur ungefaerbt — das faellt am Bildschirm nicht auf.
  const quelle = fs.readFileSync(RECOVERY_MOTOR, 'utf8')
  for (const m of ['trapezius', 'upper_back', 'lower_back', 'chest',
                   'biceps', 'triceps', 'forearm', 'front_deltoids', 'back_deltoids',
                   'abs', 'obliques', 'adductor', 'hamstring',
                   'quadriceps', 'abductors', 'calves', 'gluteal', 'neck']) {
    assert.ok(quelle.includes(`'${m}'`), `Die Muskelgruppe "${m}" fehlt.`)
  }
  // Und jede braucht eine SVG-Geometrie, sonst bleibt sie unsichtbar.
  const pfade = (quelle.match(/^ {2}\w+: \{ view: '(front|back)'/gm) ?? []).length
  assert.equal(pfade, 18, `MUSCLE_PATHS hat ${pfade} Eintraege, die Vorlage 18.`)
})

test('die Formeln der Recovery-Vorlage sind uebernommen, nicht erfunden', () => {
  // [read] Dieselbe Regel wie beim Nutrition score und beim Training
  // score: die Gewichtung steht in der Vorlage.
  const q = fs.readFileSync(RECOVERY_MOTOR, 'utf8')
  // Schlafwert, wearable-Pfad — module-recovery-engine.jsx:261.
  assert.ok(/eff \* 0\.4 \+ dur \* 0\.4 \+ deep \* 0\.2/.test(q), 'Schlafgewichtung 0.4/0.4/0.2 fehlt')
  // Schlafwert, subjektiver Pfad — :265.
  assert.ok(/q \* 0\.6 \+ d \* 0\.4/.test(q), 'Subjektive Schlafgewichtung 0.6/0.4 fehlt')
  // HRV z-Wert — :230-231.
  assert.ok(/70 \+ z \* 15/.test(q), 'HRV-Ankerformel 70 + z × 15 fehlt')
  // Die vier Modifikatoren der Muskelerholung — :119-122.
  assert.ok(/s <= 6 \? 1\.10/.test(q), 'volumeMod fehlt')
  assert.ok(/q >= 8\.5 \? 1\.15/.test(q), 'sleepMod fehlt')
  assert.ok(/v === 0 \? 1\.1/.test(q), 'sorenessMod fehlt')
  // Uebertraining: die Schwere haengt an der Anzahl — :344.
  assert.ok(/n >= 7 \? 'critical' : n >= 5 \? 'high' : n >= 3 \? 'moderate'/.test(q),
    'Schwellen der Uebertrainings-Schwere fehlen')
  // Modalitaeten-Deckel — :187.
  assert.ok(/MAX_DAILY_BONUS = 5\.0/.test(q), 'Bonusdeckel 5.0 fehlt')
})

test('der Erholungswert kennt beide Modi mit den Gewichten der Vorlage', () => {
  // [cmd] module-recovery-engine.jsx:283-303. `manual` gewichtet
  // Schlafqualitaet mit 30 und kennt kein HRV; `hrv` nimmt 25 fuer HRV.
  // Beide Summen ergeben 100.
  const q = fs.readFileSync(RECOVERY_MOTOR, 'utf8')
  assert.ok(/w: 30, val: \(c\.sleep_quality \/ 10\) \* 30/.test(q),
    'manual-Modus: Schlafqualitaet mit Gewicht 30 fehlt')
  assert.ok(/w: 25, val: \(hrv\.score \/ 100\) \* 25/.test(q),
    'hrv-Modus: HRV mit Gewicht 25 fehlt')
  assert.ok(/MOOD_MULTIPLIER\[c\.mood\] \* 5/.test(q),
    'manual-Modus: Stimmung mit Gewicht 5 fehlt')
})

/**
 * Die zehn Tabs der Vorlage (theme-v1/module-goals.jsx:172-183) — in
 * dieser Reihenfolge.
 *
 * `[cmd]` EIN Rahmen, keine Weiche: `app.jsx:125` lautet
 * `case "goals": return <GoalsModule />;`. `-pro.jsx` liefert fuenf
 * dieser zehn Tabs zu, `-editor.jsx` zwei Modale fuer `-pro.jsx`.
 */
const VORLAGE_GOALS_TABS = [
  'Goals', 'Phase engine', 'Adaptive TDEE', 'Cross-module', 'Timeline',
  'Body metrics', 'Measurements', 'Composition', 'Physique ratios', 'Pose sessions',
]

test('die zehn Tabs der Vorlage stehen im Goals-Modul', () => {
  const quelle = fs.readFileSync(GOALS, 'utf8')
  for (const tab of VORLAGE_GOALS_TABS) {
    assert.ok(quelle.includes(`'${tab}'`),
      `Der Tab "${tab}" fehlt. Die Vorlage fuehrt zehn.`)
  }
})

test('das Goals-Modul kennzeichnet jede Kachel', () => {
  // `[cmd]` Goals hat als erstes Modul ECHTE Daten in Reichweite
  // (goals.zielwerte_am seit GO-03/04) — angebunden ist trotzdem
  // nichts: der Auftrag verlangt erst das Mockup. Wer eine Kachel
  // anbindet, entfernt `attrappe` und senkt die Erwartung hier.
  const dateien: Array<[string, number]> = [
    [GOALS, 16],
    [path.join(process.cwd(), 'src/app/v2/goals/tab-phase.tsx'), 16],
    [path.join(process.cwd(), 'src/app/v2/goals/tab-physique.tsx'), 7],
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

test('die fuenf Ansichten aus -pro.jsx stehen da', () => {
  // [cmd] module-goals.jsx:191-195 zeigt genau diese fuenf ueber
  // `window.Goals*View` an; definiert sind sie in -pro.jsx. Ohne sie
  // waeren fuenf von zehn Tabs leer — derselbe Aufbau wie bei Training.
  const phase = fs.readFileSync(path.join(process.cwd(), 'src/app/v2/goals/tab-phase.tsx'), 'utf8')
  const phys = fs.readFileSync(path.join(process.cwd(), 'src/app/v2/goals/tab-physique.tsx'), 'utf8')
  for (const view of ['GoalsPhaseView', 'GoalsTDEEView', 'GoalsCrossModuleView']) {
    assert.ok(phase.includes(`export function ${view}`), `${view} fehlt.`)
  }
  for (const view of ['GoalsPhysiqueView', 'GoalsPosesView']) {
    assert.ok(phys.includes(`export function ${view}`), `${view} fehlt.`)
  }
})

test('Goals fuehrt die sieben Phasen und 13 Umfaenge der Vorlage', () => {
  // [cmd] module-goals-pro.jsx:5-68 (sieben Phasen) und :164-178
  // (13 Umfaenge). Wer eine Phase kuerzt, laesst eine Kachel im
  // Zustandsautomaten verschwinden.
  const q = fs.readFileSync(GOALS_DATEN, 'utf8')
  for (const p of ['fat_loss', 'lean_bulk', 'maintenance', 'recomp',
                   'contest_prep', 'reverse_diet', 'expert_bb_annual']) {
    assert.ok(q.includes(`${p}: {`), `Die Phase "${p}" fehlt.`)
  }
  // Nur der CIRCUMFERENCES-Block: `MEASUREMENTS` hat dieselbe
  // Zeilenform, aber sechs statt zwei Zahlenfeldern.
  const block = q.slice(q.indexOf('export const CIRCUMFERENCES'))
  const umfaenge = (block.match(/\{ id: '[a-z_]+', label: '[^']+', v: /g) ?? []).length
  assert.equal(umfaenge, 13, `CIRCUMFERENCES hat ${umfaenge} Eintraege, die Vorlage 13.`)
})

test('die Formeln der Goals-Vorlage sind uebernommen, nicht erfunden', () => {
  // [read] Dieselbe Regel wie bei Nutrition, Training und Recovery.
  const q = fs.readFileSync(GOALS_DATEN, 'utf8')
  // Mifflin-St Jeor — module-goals.jsx:556-558. `[read]` Der
  // Umsetzungsplan (W-6) haelt fest, dass die Spec-Formel den
  // Aktivitaetsfaktor VERGISST; die Vorlage wendet ihn an.
  assert.ok(/10 \* p\.weight \+ 6\.25 \* p\.height - 5 \* p\.age \+ 5/.test(q),
    'Mifflin-St Jeor (maennlich) fehlt')
  assert.ok(/bmr \* p\.activityFactor/.test(q), 'Aktivitaetsfaktor wird nicht angewandt')
  // Gewichtung der Modulbeitraege — module-goals-pro.jsx:118.
  assert.ok(/training: 0\.35/.test(q), 'Gewicht training 0.35 fehlt')
  assert.ok(/nutrition: 0\.30/.test(q), 'Gewicht nutrition 0.30 fehlt')
  // Der goldene Schnitt — module-goals-pro.jsx:186.
  assert.ok(/goldenTarget: 1\.618/.test(q), 'Goldener Schnitt 1.618 fehlt')
  // Schwellen von calcGoalProgress — module-goals-pro.jsx:132.
  assert.ok(/overall >= 80 \? 'excellent'/.test(q), 'Schwellen des Gesamtwerts fehlen')
})

test('Goals wuerfelt seine Verlaufsdaten nicht', () => {
  // `[cmd]` module-goals.jsx:101-121 erzeugt die Gewichts- und
  // Koerperfettverlaeufe mit `Math.random()`. Serverseitig kommen
  // andere Zahlen heraus als im Browser — das ergibt bei jedem
  // Seitenaufruf eine Hydrations-Abweichung. Bei Recovery hat
  // dieselbe Klasse Fehler 32 Konsolenmeldungen erzeugt.
  // Kommentarzeilen erklaeren, WARUM es fehlt — sie zaehlen nicht.
  const q = fs.readFileSync(GOALS_DATEN, 'utf8')
    .split('\n')
    .filter(z => !/^\s*(\/\/|\*|\/\*)/.test(z))
    .join('\n')
  assert.ok(!/Math\.random\(\)/.test(q),
    'Math.random() in den Daten — das bricht die Hydration. Feste Pseudofolge benutzen.')
})

/**
 * Die fuenf Tabs der Vorlage (theme-v1/module-medical-v2.jsx:33-39).
 *
 * `[cmd]` Uebernommen ist `-v2.jsx`: `app.jsx:124` waehlt
 * `window.MedicalModuleV2 ? … : <MedicalModule/>`, und V2 liegt vor.
 */
const VORLAGE_MEDICAL_TABS = ['Dashboard', 'Biomarkers', 'Import', 'Tracking', 'Insights']

test('die fuenf Tabs der Vorlage stehen im Medical-Modul', () => {
  const quelle = fs.readFileSync(MEDICAL, 'utf8')
  for (const tab of VORLAGE_MEDICAL_TABS) {
    assert.ok(quelle.includes(`'${tab}'`),
      `Der Tab "${tab}" fehlt. Die Vorlage fuehrt fuenf.`)
  }
})

test('das Medical-Modul kennzeichnet jede Kachel', () => {
  const dateien: Array<[string, number]> = [
    [MEDICAL, 5],
    [path.join(process.cwd(), 'src/app/v2/medical/tab-biomarker.tsx'), 8],
    [path.join(process.cwd(), 'src/app/v2/medical/tab-tracking.tsx'), 8],
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

test('der Biomarker-Katalog ist vollstaendig uebernommen', () => {
  // [cmd] module-medical-data.jsx:28-96 fuehrt 48 Marker mit LOINC.
  // `-data.jsx` ist die erste reine Datendatei einer Modulvorlage —
  // wer den Katalog kuerzt, verliert stumm Zeilen in der Tabelle.
  const q = fs.readFileSync(MEDICAL_DATEN, 'utf8')
  const marker = (q.match(/\{ id: '[a-z0-9]+', loinc: /g) ?? []).length
  assert.equal(marker, 48, `BIOMARKERS hat ${marker} Eintraege, die Vorlage 48.`)
  // Die fuenf Systeme und ihre Gewichte.
  for (const s of ['liver', 'cardiovascular', 'kidney', 'hormonal', 'metabolic']) {
    assert.ok(q.includes(`${s}:`), `Das System "${s}" fehlt.`)
  }
})

test('die Formeln der Medical-Vorlage sind uebernommen, nicht erfunden', () => {
  // [read] Dieselbe Regel wie bei Nutrition, Training, Recovery, Goals.
  const q = fs.readFileSync(MEDICAL_DATEN, 'utf8')
  // Die sechs Flaggen und ihre Punkte — module-medical-data.jsx:5.
  assert.ok(/optimal: 100, normal: 75, low: 40, high: 40/.test(q),
    'FLAG_SCORE fehlt oder weicht ab')
  // Die Reihenfolge der Flaggenpruefung — :19-24. Kritisch schlaegt
  // optimal; wer sie umstellt, bekommt andere Flaggen.
  assert.ok(q.indexOf("return 'critical_low'") < q.indexOf("return 'optimal'"),
    'Die Reihenfolge der Flaggenpruefung ist vertauscht')
  // Systemgewichte — :120.
  assert.ok(/cardiovascular: 0\.25, metabolic: 0\.25, hormonal: 0\.20/.test(q),
    'SYSTEM_WEIGHTS fehlt oder weicht ab')
  // Die Schwellen des Systemwerts — :141.
  assert.ok(/avg >= 85 \? 'optimal' : avg >= 65 \? 'normal'/.test(q),
    'Schwellen von calcSystemScore fehlen')
  // Trend als lineare Regression — :165-166.
  assert.ok(/pct < 5 \? 'stable'/.test(q), 'Trendrichtung fehlt')
  assert.ok(/pct < 15 \? 'mild'/.test(q), 'Trendstaerke fehlt')
})

test('Medical uebernimmt den arr_r-Tippfehler der Vorlage nicht', () => {
  // `[cmd]` module-medical-v2.jsx:708 schreibt `name="arr_r"` — ein
  // Symbol, das es nicht gibt; dort zeichnet die Stelle nichts.
  // Derselbe Tippfehler stand in Training und Recovery.
  //
  // Kommentare werden vorher entfernt: der Vermerk, der die Abweichung
  // begruendet, zitiert die Vorlagenzeile woertlich und wuerde sonst
  // selbst als Fund gelten.
  const ohneKommentar = (s: string) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*\/\//.test(z)).join('\n')

  for (const d of ['ansicht.tsx', 'tab-biomarker.tsx', 'tab-tracking.tsx', 'modale.tsx', 'bausteine.tsx']) {
    const q = ohneKommentar(fs.readFileSync(path.join(process.cwd(), 'src/app/v2/medical', d), 'utf8'))
    assert.ok(!/name="arr_r"/.test(q), `${d}: arr_r als Symbolname uebernommen.`)
  }
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

/**
 * Die elf Tabs der Supplements-Vorlage
 * (theme-v1/module-supplements.jsx:240-253), in dieser Reihenfolge.
 */
const VORLAGE_SUPP_TABS = [
  'Today', 'Stack', 'Extended', 'Catalog', 'Stacks', 'Intelligence',
  'Inventory', 'Injections', 'Compliance', 'Interactions', 'Cost',
]

test('die elf Tabs der Vorlage stehen im Supplements-Modul', () => {
  const quelle = fs.readFileSync(SUPP_RAHMEN, 'utf8')
  for (const tab of VORLAGE_SUPP_TABS) {
    assert.ok(quelle.includes(`label: '${tab}'`),
      `Der Tab "${tab}" fehlt. Die Vorlage fuehrt elf.`)
  }
})

test('das Supplements-Modul kennzeichnet jede Kachel', () => {
  // Keine Quelle heisst: jede Kachel traegt die Marke. [cmd] Es gibt
  // kein `supplements`-Schema — wer eine Kachel anbindet, entfernt
  // `attrappe` und zaehlt die Erwartung herunter.
  //
  // G-33: die Erwartung steht je Datei. Extended und Compliance sind
  // seit dem Nachziehen eigene Dateien.
  const dateien: Array<[string, number]> = [
    [SUPP, 12],
    [SUPP_EXT, 6],
    [SUPP_COMP, 4],
  ]
  for (const [datei, erwartet] of dateien) {
    const quelle = fs.readFileSync(datei, 'utf8')
    const mitGrund = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    const ohneGrund = (quelle.match(/^\s+attrappe$/gm) ?? []).length
    assert.equal(mitGrund + ohneGrund, erwartet,
      `${path.basename(datei)}: ${mitGrund + ohneGrund} gekennzeichnet, erwartet ${erwartet}. ` +
      'Angebunden? Dann die Erwartung hier senken.')
  }
})

test('die Unterkomponenten der Vorlage sind alle da', () => {
  // [cmd] G-33: der erste Durchgang baute die Tab-RUEMPFE und liess elf
  // Unterkomponenten weg — 530 Zeilen Vorlage. Der Rumpf ist nicht das
  // Modul. Dieser Test haelt die Liste fest.
  const alles = [SUPP, SUPP_EXT, SUPP_COMP, SUPP_RAHMEN, SUPP_MODALE]
    .map(f => fs.readFileSync(f, 'utf8')).join(String.fromCharCode(10))
  for (const k of [
    'ExtendedGate', 'ExtendedHeader', 'ExtendedCompoundCard', 'CycleTimeline',
    'BloodworkPanel', 'SideEffectLog', 'HalfLifeChart', 'ExtendedDrawer',
    'ComplianceHeatmap', 'ComplianceStrip', 'CalendarView',
    'SlotCard', 'CheckCircle', 'StackMatrix', 'StackList',
  ]) {
    assert.ok(new RegExp(`function ${k}\\b`).test(alles),
      `Die Unterkomponente "${k}" der Vorlage fehlt.`)
  }
})

test('der Stack der Vorlage ist vollstaendig uebernommen', () => {
  // [cmd] module-supplements.jsx fuehrt neun Eintraege im STACK und
  // fuenfzehn in SUPPLEMENT_DB. Wer die Liste kuerzt, faellt hier auf —
  // wie beim Naehrstoffbaum in G-12.
  const daten = fs.readFileSync(SUPP_DATEN, 'utf8')
  const stack = daten.slice(daten.indexOf('export const STACK'),
                            daten.indexOf('export const SLOTS'))
  assert.equal((stack.match(/^\s{2}\{$/gm) ?? []).length, 9,
    'Der STACK der Vorlage hat neun Eintraege.')
  const db = daten.slice(daten.indexOf('export const SUPPLEMENT_DB'),
                         daten.indexOf('export const INTERACTIONS'))
  assert.equal((db.match(/\{ name: /g) ?? []).length, 15,
    'SUPPLEMENT_DB der Vorlage hat fuenfzehn Eintraege.')
})

// --- G-38: die nachgezogenen Nutrition-Tabs --------------------------
const NUT_PREFS = path.join(process.cwd(), 'src/app/v2/nutrition/tab-prefs.tsx')
const NUT_PLANS = path.join(process.cwd(), 'src/app/v2/nutrition/tab-plans.tsx')
const NUT_INSIGHTS = path.join(process.cwd(), 'src/app/v2/nutrition/tab-insights.tsx')
const NUT_PLANNER = path.join(process.cwd(), 'src/app/v2/nutrition/tab-planner.tsx')
const NUT_MODALE = path.join(process.cwd(), 'src/app/v2/nutrition/modale.tsx')

test('die nachgezogenen Nutrition-Tabs kennzeichnen jede Kachel', () => {
  // [cmd] G-38: vier Tabs standen bis dahin nur als Platzhalter da.
  // Gebaut ist die Oberflaeche, angebunden ist nichts — `plans`,
  // `prefs` und `planner` haben kein Schema, `insights` rechnet nicht
  // ueber Zeitraeume. Wer einen Tab anbindet, entfernt `attrappe` und
  // zaehlt hier herunter.
  const dateien: Array<[string, number]> = [
    [NUT_PREFS, 6],
    [NUT_PLANS, 8],
    [NUT_INSIGHTS, 3],
    [NUT_PLANNER, 1],
  ]
  for (const [datei, erwartet] of dateien) {
    const quelle = fs.readFileSync(datei, 'utf8')
    const mitGrund = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    assert.equal(mitGrund, erwartet,
      `${path.basename(datei)}: ${mitGrund} gekennzeichnet, erwartet ${erwartet}. ` +
      'Angebunden? Dann die Erwartung hier senken.')
  }
})

test('die vier Modale der Nutrition-Vorlage sind da', () => {
  // [cmd] Die Vorlage fuehrt vier (module-nutrition.jsx:68-71):
  // quickadd, customfood, nutsettings, mealcam. G-38 hat sie gebaut;
  // vorher zeigte der Kopf fuer alle nur „in Entwicklung".
  const quelle = fs.readFileSync(NUT_MODALE, 'utf8')
  for (const k of ['MealCamModal', 'CustomFoodModal', 'QuickAddModal', 'NutritionSettingsModal']) {
    // `\\b` mit zwei Zeichen: in einem Template-Literal waere `\b`
    // das Steuerzeichen Backspace, keine Wortgrenze. Dieselbe Falle
    // wie in G-33 — hier faellt sie auf, weil der Test zuerst
    // fehlgeschlagen ist.
    assert.ok(new RegExp(`function ${k}\\b`).test(quelle),
      `Das Modal "${k}" der Vorlage fehlt.`)
  }
})

test('kein Math.random in den v2-Modulen', () => {
  // [cmd] G-38: die Vorlage wuerfelt an zwei Stellen
  // (module-nutrition.jsx:405 Heatmap, :648 Planner-Kalorien). In
  // Next.js rendert der Server einmal und der Browser noch einmal —
  // mit `Math.random()` kommen zwei Bilder heraus und React bricht die
  // Hydration ab. Beide sind durch feste Formeln ersetzt. Dieser Test
  // haelt fest, dass niemand sie zurueckholt.
  const wurzel = path.join(process.cwd(), 'src/app/v2')
  const offen: string[] = []
  const lauf = (verz: string) => {
    for (const e of fs.readdirSync(verz, { withFileTypes: true })) {
      const p = path.join(verz, e.name)
      if (e.isDirectory()) lauf(p)
      else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) {
        // [cmd] NUR CODE, KEINE KOMMENTARE. Der erste Lauf meldete
        // goals/ansicht.tsx, goals/daten.ts und medical/daten.ts —
        // alle drei erklaeren in einem Kommentar, dass sie
        // `Math.random()` gerade NICHT benutzen. Ein Werkzeug, das
        // seine eigene Begruendung als Verstoss zaehlt, ist wertlos;
        // dieselbe Klasse Fehler wie beim rgba-Test (G-22).
        const roh = fs.readFileSync(p, 'utf8')
        const ohne = roh
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^[^\n]*?\/\/[^\n]*$/gm, '')
        if (/Math\.random\s*\(/.test(ohne)) offen.push(e.name)
      }
    }
  }
  lauf(wurzel)
  assert.deepEqual(offen, [],
    `Math.random() zerlegt die Hydration. Gefunden in: ${offen.join(', ')}`)
})

test('berechnete Stilwerte sind auf Engine-Genauigkeit gerundet', () => {
  // [cmd] G-38: DIESER TEST GAB ES NICHT, ALS DER FEHLER AUFTRAT.
  // `Math.random()` war ersetzt, der Test darauf war gruen — und der
  // Browser meldete trotzdem:
  //   Prop `style` did not match.
  //   Server: opacity:0.6199775584337404
  //   Client: opacity:0.6199775584345043
  //
  // `Math.sin` ist in ECMAScript nicht bitgenau festgelegt; Node und
  // das V8 im Browser weichen ab der zwoelften Stelle ab. Ein Wert,
  // der aus `Math.sin` kommt und ungerundet in ein `style` faellt,
  // zerlegt die Hydration genauso wie `Math.random()` — nur leiser.
  //
  // ABER NUR, WO ES WEHTUT. `[cmd]` Der erste Entwurf dieses Tests
  // schlug bei goals/daten.ts, nutrients-entwurf.tsx und modale.tsx an
  // — alle drei rechnen mit `Math.sin`, aber ihre Werte gehen in
  // Diagrammdaten (Sparkline, LineChart), nicht in ein `style`.
  // React vergleicht bei der Hydration die gerenderten Attribute;
  // eine Zahl, die nur die Hoehe einer SVG-Kurve bestimmt, taucht dort
  // nicht als Text auf. Ein Test, der sie trotzdem meldet, erzeugt
  // Laerm statt Sicherheit — und Laerm schaltet man irgendwann ab.
  //
  // Die Regel greift deshalb nur fuer Funktionen, deren Ergebnis in
  // einem `style` landet: `opacity:`, `width:`, `height:` und Co. im
  // selben Rumpf.
  const wurzel = path.join(process.cwd(), 'src/app/v2')
  const offen: string[] = []
  const lauf = (verz: string) => {
    for (const e of fs.readdirSync(verz, { withFileTypes: true })) {
      const p = path.join(verz, e.name)
      if (e.isDirectory()) lauf(p)
      else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) {
        const roh = fs.readFileSync(p, 'utf8')
        const ohne = roh
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^[^\n]*?\/\/[^\n]*$/gm, '')
        // `[cmd]` OHNE `matchAll`: das tsconfig-Ziel dieses Pakets
        // laesst das Iterieren eines RegExp-Iterators nicht zu
        // (TS2802), auch nicht per Spread. Die uebrigen Tests dieser
        // Datei benutzen deshalb `.match()` — hier dasselbe.
        const ungerundet: string[] = []
        const funktionen = ohne.match(/function\s+\w+[^{]*\{[\s\S]*?\n\}/g) ?? []
        for (const f of funktionen) {
          if (!/Math\.sin\s*\(/.test(f) || /Math\.round\s*\(/.test(f)) continue
          const name = /function\s+(\w+)/.exec(f)
          if (name) ungerundet.push(name[1])
        }
        if (ungerundet.length === 0) continue

        const stile = ohne.match(/style=\{\{[\s\S]*?\}\}/g) ?? []
        // Der Wert kann direkt im `style` stehen — `opacity: wert(i, j)` —
        // oder ueber eine Variable dorthin kommen: `const v = wert(i, j)`
        // und dann `opacity: 0.25 + v * 0.7`. Beides verfolgen.
        const zuweisungen = ohne.match(/const\s+\w+\s*=\s*\w+\s*\(/g) ?? []
        for (const fn of ungerundet) {
          const direkt = stile.some(s => new RegExp(`\\b${fn}\\s*\\(`).test(s))
          const ueberVariable = zuweisungen.some(z => {
            const t = new RegExp(`const\\s+(\\w+)\\s*=\\s*${fn}\\s*\\(`).exec(z)
            return t ? stile.some(s => new RegExp(`\\b${t[1]}\\b`).test(s)) : false
          })
          if (direkt || ueberVariable) offen.push(`${e.name} (${fn})`)
        }
      }
    }
  }
  lauf(wurzel)
  assert.deepEqual(offen, [],
    'Ein aus Math.sin berechneter Wert muss gerundet werden, sonst weichen '
    + `Server und Browser ab. Ungerundet in: ${offen.join(', ')}`)
})

// ── Coach · Human Coaches (G-40) ─────────────────────────────────────

/**
 * Die zehn Tabs der Vorlage (theme-v1/module-coach.jsx:183-194) — in
 * dieser Reihenfolge.
 *
 * `[cmd]` DER AUFTRAG NANNTE ELF. Gezaehlt sind es zehn. Wer die Zahl
 * aus dem Auftrag uebernimmt statt aus der Vorlage, sucht dauerhaft
 * einen Tab, den es nicht gibt. Steht so im Bericht.
 */
const VORLAGE_COACH_TABS = [
  'Overview', 'Coaches', 'Permissions', 'Proposals', 'Autonomy',
  'Check-ins', 'Messages', 'Notes', 'Invites', 'Onboarding',
]

test('die zehn Tabs der Vorlage stehen im Coach-Modul', () => {
  const quelle = fs.readFileSync(COACH, 'utf8')
  for (const tab of VORLAGE_COACH_TABS) {
    assert.ok(quelle.includes(`'${tab}'`),
      `Der Tab "${tab}" fehlt. Die Vorlage fuehrt zehn.`)
  }
})

test('das Coach-Modul kennzeichnet jede Kachel', () => {
  // Keine Quelle heisst: jede Kachel traegt die Marke. `[cmd]` Ein
  // `coach`-Schema gibt es nicht — der Begriff kommt in
  // `supabase/_pipeline/` in keiner SQL-Datei vor.
  const dateien: Array<[string, number]> = [
    [COACH, 11],
    [COACH_RECHTE, 5],
    [COACH_AUTO, 11],
    [COACH_ONBOARD, 6],
  ]
  for (const [datei, erwartet] of dateien) {
    const quelle = fs.readFileSync(datei, 'utf8')
    const mitGrund = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    const ohneGrund = (quelle.match(/\battrappe(?=>|\s*$)/gm) ?? []).length
    const markiert = mitGrund + ohneGrund
    assert.equal(markiert, erwartet,
      `${path.basename(datei)}: ${markiert} Kacheln gekennzeichnet, erwartet ${erwartet}. `
      + 'Angebunden? Dann die Erwartung hier senken.')
  }
})

test('jede Karte des Coach-Moduls traegt eine Marke', () => {
  // Schaerfer als die Zaehlung oben: nicht "so viele wie erwartet",
  // sondern "keine ohne". Wer eine Karte ergaenzt und die Marke
  // vergisst, faellt hier auf, ohne dass jemand eine Zahl pflegt.
  for (const datei of [COACH, COACH_RECHTE, COACH_AUTO, COACH_ONBOARD]) {
    const quelle = fs.readFileSync(datei, 'utf8')
    const karten = (quelle.match(/<Card\b/g) ?? []).length
    const marken = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    assert.equal(marken, karten,
      `${path.basename(datei)}: ${karten} Karten, aber ${marken} Marken.`)
  }
})

test('die fuenf Ansichten der Coach-Zulieferer stehen da', () => {
  // [cmd] module-coach-athlete.jsx:565 exportiert AthletePermissionsV2,
  // AthleteProposals, AthleteAutonomy, AthleteCheckins;
  // module-coach-meta.jsx:200 den CoachOnboardingWizard.
  const rechte = fs.readFileSync(COACH_RECHTE, 'utf8')
  const auto = fs.readFileSync(COACH_AUTO, 'utf8')
  const onboard = fs.readFileSync(COACH_ONBOARD, 'utf8')
  assert.ok(/export function AthletePermissionsV2/.test(rechte), 'AthletePermissionsV2 fehlt')
  assert.ok(/export function AthleteProposals/.test(rechte), 'AthleteProposals fehlt')
  assert.ok(/export function AthleteAutonomy/.test(auto), 'AthleteAutonomy fehlt')
  assert.ok(/export function AthleteCheckins/.test(auto), 'AthleteCheckins fehlt')
  assert.ok(/export function CoachOnboardingWizard/.test(onboard), 'CoachOnboardingWizard fehlt')
})

test('die Coach-Daten kommen aus der Vorlage, nicht aus dem Gedaechtnis', () => {
  // Stichproben aus allen drei Quelldateien. Zahlen, die jemand beim
  // Abschreiben verrutschen koennte.
  const quelle = fs.readFileSync(COACH_DATEN, 'utf8')
  // module-coach.jsx:3-84 — vier Trainer.
  assert.ok(/'c-train'/.test(quelle) && /'c-suppl'/.test(quelle), 'Trainer-Kennungen fehlen')
  assert.ok(/€180 \/ month/.test(quelle), 'Das Honorar des Trainingscoachs fehlt')
  // module-coach-athlete.jsx:92-110 — Autonomiestufe 4.
  assert.ok(/level: 4/.test(quelle), 'Die Autonomiestufe fehlt')
  assert.ok(/regressionRisk: 0\.12/.test(quelle), 'Das Rueckfallrisiko fehlt')
  // module-coach-meta.jsx:4-9 — Facharzttitel auf Deutsch.
  assert.ok(/Facharzt Endokrinologie/.test(quelle), 'Die Zulassung des Arztes fehlt')
})

test('die sieben Module der Rechtematrix sind vollzaehlig', () => {
  // [cmd] module-coach-athlete.jsx:6-14. Die Matrix ist der Kern des
  // Moduls: fehlt eine Zeile, sieht die Tabelle vollstaendig aus und
  // verschweigt genau die Freigabe, die niemand vergessen darf.
  const quelle = fs.readFileSync(COACH_DATEN, 'utf8')
  for (const m of ['training', 'nutrition', 'recovery', 'supplements',
    'medical', 'goals', 'body_metrics']) {
    assert.ok(new RegExp(`key: '${m}'`).test(quelle),
      `Das Rechtemodul "${m}" fehlt. Die Vorlage fuehrt sieben.`)
  }
})

test('das Coach-Modul uebernimmt den Tippfehler arr_r nicht', () => {
  // [cmd] module-coach.jsx:808 schreibt `<Icon name="arr_r">` — derselbe
  // Tippfehler wie in G-20, G-21 und G-36. `arrow_right` steht in
  // icons.tsx, `arr_r` nicht.
  //
  // Kommentare zaehlen nicht: die Dateien ZITIEREN den Tippfehler, um
  // die Ersetzung zu belegen. Wer das nicht herausrechnet, testet den
  // eigenen Beleg.
  const ohneKommentar = (s: string) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*\/\//.test(z)).join('\n')

  for (const datei of [COACH, COACH_RECHTE, COACH_AUTO, COACH_ONBOARD, COACH_MODALE]) {
    const quelle = ohneKommentar(fs.readFileSync(datei, 'utf8'))
    assert.ok(!/arr_r/.test(quelle),
      `${path.basename(datei)}: `
      + '`arr_r` ist ein Tippfehler der Vorlage — `arrow_right` benutzen.')
  }
})

test('das QR-Muster ist fest, nicht zufaellig', () => {
  // [cmd] module-coach.jsx:775 zeichnet das QR-Bild mit
  // `Math.random() > 0.5` ueber 64 Zellen. Auf dem Server faellt das
  // anders als im Browser — 64 Abweichungen in einem Modal.
  //
  // ANLASS: dieselbe Falle hat bei Goals zugeschlagen. Diese Pruefung
  // haelt fest, dass die Ersetzung steht UND dass sie 64 Zellen hat —
  // ein auf 32 gekuerztes Muster faellt sonst niemandem auf.
  const ohneKommentar = (s: string) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*\/\//.test(z)).join('\n')

  const quelle = ohneKommentar(fs.readFileSync(COACH_MODALE, 'utf8'))
  assert.ok(!/Math\.random/.test(quelle),
    'modale.tsx: `Math.random()` erzeugt eine Hydrationsabweichung.')
  assert.ok(/QR_MUSTER/.test(quelle), 'Das feste QR-Muster fehlt.')

  const block = /const QR_MUSTER[^=]*=\s*\[([\s\S]*?)\]/.exec(quelle)
  assert.ok(block, 'QR_MUSTER ist keine Liste.')
  const zellen = (block![1].match(/[01]/g) ?? []).length
  assert.equal(zellen, 64,
    `Das QR-Muster hat ${zellen} Zellen, die Vorlage zeichnet 8 × 8 = 64.`)
})

test('der AI Coach nennt seine zwanzig ungebauten Tabs', () => {
  // [read] G-29 hat den Umgang festgelegt: lieber ganze Tabs als halbe,
  // und was fehlt, steht in der Oberflaeche — nicht im Bericht allein.
  // Eine fehlende Kachel sieht sonst aus, als sei sie nicht vorgesehen.
  //
  // [cmd] module-buddy.jsx:26-45 fuehrt zwanzig Tabs. Der Auftrag nannte
  // zwoelf.
  const quelle = fs.readFileSync(COACH_AI, 'utf8')
  const VORLAGE_BUDDY_TABS = [
    'Chat', 'Insights feed', 'Memory', 'Decisions', 'Personality',
    'Avatar states', 'Plan & gate', 'Engines', 'Journey', 'Watcher',
    'BSS', 'Signature', 'Interventions', 'Safety', 'Butler',
    'Voice / Live', 'Knowledge', 'Rules', 'Coach overrides', 'Clone & Gym',
  ]
  assert.equal(VORLAGE_BUDDY_TABS.length, 20, 'Die Vorlage fuehrt zwanzig Tabs.')
  for (const tab of VORLAGE_BUDDY_TABS) {
    assert.ok(quelle.includes(`'${tab}'`),
      `Der ungebaute Tab "${tab}" wird nicht genannt. Weglassen ist keine Meldung.`)
  }
})
