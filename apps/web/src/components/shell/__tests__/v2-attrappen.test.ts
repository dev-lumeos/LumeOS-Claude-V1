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
// G-110: das echte Gate von Extended (loest `ExtendedGate` ab).
const SUPP_GATE = path.join(process.cwd(), 'src/app/v2/supplements/extended-gate.tsx')
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

function konstante(quelle: string, name: string): string {
  const match = new RegExp(`(?:export\\s+)?const ${name} =([\\s\\S]*?)(?:\\r?\\n\\r?\\n|$)`).exec(quelle)
  assert.ok(match, `Konstante ${name} fehlt.`)
  return match[1]!
}

test('Attrappen-Gruende behaupten kein fehlendes Schema, wenn das Schema steht', () => {
  const pruefungen: Array<{ datei: string; konstante: string; verboten: RegExp[] }> = [
    { datei: RECOVERY, konstante: 'ATTRAPPE', verboten: [/`recovery` gibt es noch nicht/i, /recovery`? hat kein Schema/i] },
    { datei: MEDICAL, konstante: 'ATTRAPPE', verboten: [/`medical`-Schema gibt es noch nicht/i, /ein `medical`-Schema gibt es nicht/i] },
    { datei: COACH, konstante: 'ATTRAPPE', verboten: [/`coach`-Schema gibt es noch nicht/i, /ein `coach`-Schema gibt es nicht/i] },
    { datei: TRAINING, konstante: 'ATTRAPPE', verboten: [/training\.sessions/i, /training\.sets/i] },
    { datei: GOALS, konstante: 'ATTRAPPE', verboten: [/weder\s+Ziele\s+noch\s+Koerpermasse/i] },
    { datei: SUPP, konstante: 'ATTRAPPE', verboten: [/kein `supplements`-Schema/i] },
    { datei: SUPP_COMP, konstante: 'ATTRAPPE', verboten: [/kein `supplements`-Schema/i] },
    { datei: SUPP_EXT, konstante: 'ATTRAPPE', verboten: [/kein `supplements`-Schema/i] },
    { datei: SUPP_MODALE, konstante: 'OHNE_SCHEMA', verboten: [/kein `supplements`-Schema/i] },
    { datei: path.join(process.cwd(), 'src/app/v2/nutrition/tab-plans.tsx'), konstante: 'ATTRAPPE', verboten: [/kein Schema fuer Essensplaene/i] },
    // `tab-prefs.tsx` ist am 2026-08-23 entfernt (G-163) — er war der
    // Rueckfall des Vorlieben-Tabs und behauptete, die Vorlieben seien
    // nicht angebunden. `VorliebenTab` liest sie seit G-65.
  ]

  for (const p of pruefungen) {
    const quelle = fs.readFileSync(p.datei, 'utf8')
    const text = konstante(quelle, p.konstante)
    for (const verboten of p.verboten) {
      assert.ok(!verboten.test(text),
        `${path.basename(p.datei)}:${p.konstante} behauptet einen alten Schema-Stand.`)
    }
  }

  const nutrition = fs.readFileSync(NUTRITION, 'utf8')
  assert.ok(!/Ein Schema fuer Essensplaene - es gibt keines/.test(nutrition),
    'Nutrition-Platzhalter behauptet noch, Essensplaene haetten kein Schema.')
  assert.ok(!/Ernaehrungsvorlieben und Unvertraeglichkeiten am Profil - die Spalten fehlen/.test(nutrition),
    'Nutrition-Platzhalter behauptet noch, Vorlieben haetten keine Tabellen.')
})

/**
 * Die zwoelf Kacheln der Vorlage (theme-v1/module-dashboard.jsx) -
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
  // `[cmd]` **DIESE ZAHLEN AENDERN SICH SEIT G-69 NICHT MEHR, obwohl
  // fuenf Tabs echt sind.** Der Grund: die Entwurfskacheln bleiben als
  // RUECKFALL stehen (`verlauf ? <Echt/> : <Entwurf/>`) — dasselbe
  // Muster wie G-64 beim Exercises-Tab. Ohne Sitzungen zeigt die Seite
  // den Entwurf samt Marke, statt eine leere echte Kachel, die wie ein
  // Befund aussaehe und doch nur ein fehlendes Cookie waere.
  //
  // **Was tatsaechlich gerendert wird, prueft der Test darunter** —
  // diese Zaehlung allein wuerde die Anbindung nicht bemerken.
  //
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

// ── Training · Sitzungen angebunden (G-69) ───────────────────────────

const TRAIN_VERLAUF = path.join(process.cwd(), 'src/app/v2/training/tab-verlauf.tsx')
const TRAIN_LESEN = path.join(process.cwd(), 'src/lib/training/sitzungen-read.ts')

test('G-160: HRV und Sleep zeigen erfasste Werte, Entwurf nur als Rueckfall', () => {
  // Richtung 1: die Weichen und die Echt-Fassungen existieren.
  const q = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/recovery/tab-messwerte.tsx'), 'utf8')
  assert.ok(/stand && stand\.zeilen\.length > 0[\s\S]*?<HrvEcht/.test(q), 'Die HRV-Weiche fehlt.')
  assert.ok(/stand && stand\.zeilen\.length > 0[\s\S]*?<SleepEcht/.test(q), 'Die Sleep-Weiche fehlt.')
  // Richtung 2: die Echt-Fassungen rechnen KEINEN Entwurfsscore — die
  // z-Formel (70 + z×15) und der Wearable-Pfad bleiben im Entwurf.
  const hrvEcht = q.slice(q.indexOf('function HrvEcht'), q.indexOf('function PhoneCameraKachel'))
  assert.ok(!/calcHRVScore|calcSleepScore/.test(hrvEcht),
    'HrvEcht rechnet eine Entwurfsformel — die Messwerte-Regel (G-55) ist verletzt.')
  const sleepEcht = q.slice(q.indexOf('function SleepEcht'), q.indexOf('function ScorePathsKachel'))
  assert.ok(!/calcSleepScore|SLEEP_DATA/.test(sleepEcht),
    'SleepEcht nutzt Entwurfsdaten oder -formeln.')
  // Und der Rahmen reicht die Check-ins durch.
  const rahmen = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/recovery/ansicht.tsx'), 'utf8')
  assert.ok(/<RecHRV stand=\{checkins\}/.test(rahmen))
  assert.ok(/<RecSleep stand=\{checkins\}/.test(rahmen))
})

test('G-159: die fuenf Today/History-Weichen lesen echt, Entwurf nur als Rueckfall', () => {
  // `[cmd]` Der G-159-Befund („11 Marken, derselbe Stoff wie History")
  // beruhte auf der Code-Markenzahl — GERENDERT sind die Kacheln seit
  // G-69/G-86 echt, die Marken sitzen in den Rueckfallzweigen. Dieser
  // Waechter haelt die Weichen fest: verschwindet eine, rendert wieder
  // der Entwurf mit erfundenen Zahlen.
  const q = fs.readFileSync(TRAINING, 'utf8')
  const weichen: Array<[RegExp, string]> = [
    [/verlauf && verlauf\.woche\.some/, 'This week'],
    [/verlauf && verlauf\.muskelVolumen\.length > 0/, 'Weekly volume (Saetze je Muskelgruppe)'],
    [/<TrainingSerie d=\{verlauf\}/, 'Streak'],
    [/verlauf \? <TrainingVerlauf d=\{verlauf\}/, 'History (Recent sessions, Volume by muscle)'],
    [/readiness && readiness\.zeilen\.length > 0/, 'Training readiness'],
  ]
  for (const [muster, name] of weichen) {
    assert.ok(muster.test(q), `Die Weiche fuer "${name}" fehlt — der Entwurf wuerde immer rendern.`)
  }
})
const TRAIN_AUSW = path.join(process.cwd(), 'src/lib/training/auswertung.ts')

test('fuenf Training-Tabs zeigen echte Sitzungen', () => {
  // `[read]` Der Auftrag G-69: die Tabs, die Sitzungen brauchen.
  // Gebaut sind History, Progression, Standards, Kalender und die
  // Serie — je mit Rueckfall auf den Entwurf.
  const ansicht = fs.readFileSync(TRAINING, 'utf8')
  for (const [tab, echt] of [
    ['history', 'TrainingVerlauf'],
    ['progress', 'TrainingKraftverlauf'],
    ['standards', 'TrainingStandards'],
    ['calendar', 'TrainingKalender'],
  ] as Array<[string, string]>) {
    const muster = new RegExp(
      `tab === '${tab}'[\\s\\S]{0,200}verlauf \\? <${echt}`)
    assert.ok(muster.test(ansicht),
      `Der Tab "${tab}" zeigt ${echt} nicht mit Rueckfall.`)
  }
  // Die Serie sitzt im Today-Tab, nicht an einem eigenen.
  assert.ok(/verlauf \? \(\s*<TrainingSerie/.test(ansicht),
    'Die Serie ist nicht angebunden.')

  // Die angebundene Datei traegt keine Marke.
  const verlauf = fs.readFileSync(TRAIN_VERLAUF, 'utf8')
  assert.ok((verlauf.match(/<Card\b/g) ?? []).length > 0, 'Keine Karte gefunden.')
  assert.ok(!/attrappe=/.test(verlauf),
    'tab-verlauf.tsx traegt eine Attrappenmarke, ist aber angebunden.')
})

test('Training trennt absolviert von geplant — und nicht ueber status', () => {
  // `[cmd]` **`workout_sessions.status` taugt dafuer nicht:** die
  // Pruefbedingung erlaubt `planned|active|completed|cancelled`, aber
  // alle 30 Sitzungen stehen auf `completed` — auch die 15 in der
  // Zukunft (gemessen 2026-08-18). Massgeblich ist das Datum.
  //
  // `[read]` Tom zu G-69: *„Volumen, Streak, 1RM und Fortschritt
  // zaehlen nur bis heute. Kalender und Plan zeigen alle."*
  const lesen = fs.readFileSync(TRAIN_LESEN, 'utf8')
  assert.ok(/absolviert: datum !== '' && datum <= stichtag/.test(lesen),
    'absolviert wird nicht aus dem Datum abgeleitet.')
  // `status` kommt trotzdem mit — wer beide vergleicht, sieht die
  // Abweichung. Sie zu verschweigen waere die schlechtere Loesung.
  assert.ok(/status: text\(z\.status\)/.test(lesen),
    'Der status der Tabelle wird verschluckt statt mitgeliefert.')

  // Die Rechnungen filtern auf `absolviert`.
  const ausw = fs.readFileSync(TRAIN_AUSW, 'utf8')
  for (const fn of ['volumenJeMuskel', 'serie', 'kraftverlauf', 'kennzahlen']) {
    const rumpf = new RegExp(`export function ${fn}[\\s\\S]*?\\n\\}`).exec(ausw)
    assert.ok(rumpf, `${fn} nicht gefunden.`)
    assert.ok(/absolviert/.test(rumpf![0]),
      `${fn} rechnet ueber geplante Sitzungen mit — das behauptet Leistung.`)
  }

  // Und die Anzeige zeichnet den Unterschied eindeutig aus, nicht nur
  // ueber Helligkeit. `[read]` Tom: „nicht nur eine blassere Farbe."
  const verlauf = fs.readFileSync(TRAIN_VERLAUF, 'utf8')
  assert.ok(/geplant/.test(verlauf) && /absolviert/.test(verlauf),
    'Die Anzeige benennt geplant und absolviert nicht.')
})

test('Training erfindet keine Schwellen', () => {
  // `[read]` Der Auftrag: „Volume landmarks (MEV, MAV, MRV) sind
  // Schwellen aus der Literatur — wenn keine Quelle im Repo liegt,
  // bleibt die Kachel Attrappe." `[cmd]` Es liegt keine.
  const ansicht = fs.readFileSync(TRAINING, 'utf8')
  assert.ok(/tab === 'landmarks' && <TrainingLandmarksView \/>/.test(ansicht),
    'Volume landmarks ist angebunden — dafuer fehlt die Quelle.')

  // Dasselbe fuer die Einstufung in den Standards: die Vorlage vergibt
  // Beginner/Novice/Intermediate/Elite gegen eigene Schwellen. Das ist
  // eine Bewertung eines Menschen und kommt nicht mit.
  const ohneKommentar = (s: string) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*(\/\/|\*)/.test(z)).join('\n')

  const verlauf = ohneKommentar(fs.readFileSync(TRAIN_VERLAUF, 'utf8'))
    // Die Erklaerung, warum sie fehlen, nennt sie beim Namen.
    .replace(/Beginner<\/span>[\s\S]*?Elite<\/span>/g, '')
  for (const klasse of [/'Novice'/, /'Intermediate'/, /'Elite'/, /'Beginner'/]) {
    assert.ok(!klasse.test(verlauf),
      `${klasse.source} ist eine Einstufung ohne belegte Quelle.`)
  }

  const ausw = ohneKommentar(fs.readFileSync(TRAIN_AUSW, 'utf8'))
  for (const wort of [/\bMEV\b/, /\bMAV\b/, /\bMRV\b/]) {
    assert.ok(!wort.test(ausw),
      `${wort.source} steht in der Rechnung — ohne Quelle ist die Zahl erfunden.`)
  }
})

test('Training umgeht die zwei PostgREST-Fallen aus G-64', () => {
  // `[cmd]` **Falle 1:** PostgREST deckelt bei 1.000 Zeilen. Bei 200
  // Saetzen trifft das noch nicht — nach dem naechsten Seedlauf schon.
  // `[cmd]` **Falle 2:** `.in(...)` kippt ueber rund 200 IDs und
  // schweigt: leere Liste statt Fehler.
  const lesen = fs.readFileSync(TRAIN_LESEN, 'utf8')

  // Jede Abfrage begrenzt ausdruecklich.
  const abfragen = (lesen.match(/\.from\(/g) ?? []).length
  const limits = (lesen.match(/\.limit\(/g) ?? []).length
  assert.ok(limits >= abfragen - 1,
    `${abfragen} Abfragen, aber nur ${limits} Begrenzungen — PostgREST deckelt still.`)

  // Verbund statt ID-Liste bei Uebungen und Saetzen.
  assert.ok(/workout_sessions!inner/.test(lesen),
    'workout_exercises filtert nicht ueber den Verbund.')
  assert.ok(/workout_exercises!inner\(workout_sessions!inner/.test(lesen),
    'workout_sets filtert nicht ueber den Verbund.')

  // Und jeder Abfragefehler wirft — genau das hat den Fall in G-64
  // so lange verdeckt.
  const werfer = (lesen.match(/if \(error\) throw/g) ?? []).length
  assert.ok(werfer >= 5,
    `Nur ${werfer} Abfragen werfen bei Fehlern — ein Fehler darf nicht als „nichts gefunden" durchgehen.`)
})

test('Training rechnet das Koerpergewicht mit Stichtag', () => {
  // `[read]` Tom zu G-69: „Standards braucht das Koerpergewicht mit
  // Stichtag. Nimm den zum Sitzungsdatum, nicht den heutigen — sonst
  // verschiebt sich das Verhaeltnis rueckwirkend."
  const lesen = fs.readFileSync(TRAIN_LESEN, 'utf8')
  const fn = /export async function ladeGewichtAm[\s\S]*?\n\}/.exec(lesen)
  assert.ok(fn, 'ladeGewichtAm nicht gefunden.')
  assert.ok(/body_measurements/.test(fn![0]),
    'Das Gewicht kommt nicht aus dem Messverlauf.')
  assert.ok(/\.lte\('measurement_date', stichtag\)/.test(fn![0]),
    'Das Gewicht wird nicht am Stichtag geschnitten.')
  // NICHT aus profiles: das ist ein Stand ohne Datum.
  assert.ok(!/profiles/.test(fn![0]),
    'Das Gewicht kommt aus profiles — dieser Wert traegt kein Datum.')
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
    // G-163: die Rueckfallfassungen sind GELOESCHT (Tom, 2026-08-23:
    // „sie fliegen") — an ihrer Stelle steht eine Hinweis-Flaeche ohne
    // Marke. ansicht 5 -> 3 (Score- und Modalitaeten-Entwurf raus),
    // tab-messwerte 10 -> 4 (Hrv-/Sleep-Entwurf raus; Muscle map,
    // Phone camera und Score paths bleiben echte Attrappen).
    [RECOVERY, 3],
    [path.join(process.cwd(), 'src/app/v2/recovery/tab-checkin.tsx'), 3],
    [path.join(process.cwd(), 'src/app/v2/recovery/tab-messwerte.tsx'), 4],
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
  // C-124: die Modalitaets-Boni der Vorlage (:182-216, elf Werte plus
  // Deckel 5.0) sind ENTFERNT — alle 32 Registry-Zeilen sagen
  // REMOVE_NUMERIC_VALUE. Der Waechter steht jetzt andersherum: kein
  // Punktbonus darf zurueckkommen, an seiner Stelle stehen Richtung,
  // Endpunkt und Quelle.
  assert.ok(!/const MAX_DAILY_BONUS/.test(q), 'C-124: der Bonusdeckel ist entfernt und darf nicht zurueckkommen')
  assert.ok(!/const MODALITY_BONUS\b/.test(q), 'C-124: die Bonuswerte sind entfernt und duerfen nicht zurueckkommen')
  assert.ok(/MODALITY_EVIDENZ/.test(q), 'C-124: die Evidenzaussagen fehlen')
  assert.ok(/REC_SAUNA_ENDURANCE_HEAT/.test(q), 'C-124: Registry-IDs fehlen an den Aussagen')
  // C-181: ACWR ist ersatzlos entfernt — weder die Datenattrappe noch
  // die Kurve mit der „Safe-Zone" 0,8-1,3 duerfen zurueckkommen.
  assert.ok(!/const ACWR_DATA/.test(q), 'C-181: ACWR_DATA ist entfernt und darf nicht zurueckkommen')
  // Nur die Deklaration — die Kommentare, die die Entfernung
  // begruenden, duerfen den Namen nennen (wie beim C-124-Wächter).
  assert.ok(!/function calcTrainingLoadScore|const calcTrainingLoadScore/.test(q),
    'C-181: die ACWR-Kurve ist entfernt und darf nicht zurueckkommen')
  assert.ok(!/>= ?0\.8 && \w+ <= ?1\.3/.test(q), 'C-181: keine Safe-Zone 0.8-1.3 im Motor')
  assert.ok(!/key: 'training_load'/.test(q), 'C-181: der Training-load-Term ist aus dem Score entfernt')
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
  // `[cmd]` STAND SEIT GO-16: **23 Marken**, vorher 38.
  //
  // Fuenf Tabs tragen echte Daten und liegen in eigenen Dateien —
  // `ziel-karten.tsx`, `tab-koerper.tsx`, `tab-composition.tsx`,
  // `tdee-kopf.tsx`. Die Attrappenfassungen von Goals, Body metrics,
  // Measurements und Composition sind **geloescht**, nicht
  // auskommentiert; in `ansicht.tsx` bleibt genau eine Marke (der
  // Timeline-Tab), in `tab-phase.tsx` fiel die TDEE-Kopfkachel weg.
  //
  // Wer eine weitere Kachel anbindet, entfernt `attrappe` und senkt
  // die Erwartung hier.
  const dateien: Array<[string, number]> = [
    [GOALS, 1],
    [path.join(process.cwd(), 'src/app/v2/goals/tab-phase.tsx'), 15],
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

// ── Goals · das Mockup an den Daten (GO-16) ──────────────────────────

const GOALS_LESEN = path.join(process.cwd(), 'src/lib/goals/lesen.ts')
const GOALS_COMP = path.join(process.cwd(), 'src/app/v2/goals/tab-composition.tsx')
const GOALS_KARTEN = path.join(process.cwd(), 'src/app/v2/goals/ziel-karten.tsx')
const GOALS_TDEE = path.join(process.cwd(), 'src/app/v2/goals/tdee-kopf.tsx')
const GOALS_KOERPER = path.join(process.cwd(), 'src/app/v2/goals/tab-koerper.tsx')

test('die angebundenen Goals-Kacheln tragen keine Marke mehr', () => {
  // `[read]` Dieselbe Regel wie bei Medical (G-60): „Was angebunden
  // ist, verliert die Marke." Gegenstueck zur Zaehlung darueber: die
  // zaehlt, was BLEIBT, das hier haelt fest, was GEHT.
  for (const datei of [GOALS_COMP, GOALS_KARTEN, GOALS_TDEE, GOALS_KOERPER]) {
    const quelle = fs.readFileSync(datei, 'utf8')
    assert.ok((quelle.match(/<Card\b/g) ?? []).length > 0,
      `${path.basename(datei)}: keine Karte gefunden.`)
    assert.ok(!/attrappe=/.test(quelle),
      `${path.basename(datei)}: traegt eine Attrappenmarke, ist aber angebunden.`)
  }

  // Und die vier Attrappenfassungen sind GELOESCHT, nicht daneben
  // stehengelassen — toter Code, der wie eine Alternative aussieht,
  // ist die naechste falsche Faehrte.
  const ansicht = fs.readFileSync(GOALS, 'utf8')
  for (const tot of ['function CompTab', 'function MetricsTab',
                     'function MeasureTab', 'function GoalsTab']) {
    assert.ok(!ansicht.includes(tot),
      `${tot} steht wieder in ansicht.tsx — die Attrappenfassung ist ersetzt.`)
  }
})

test('Goals rechnet gegen das echte Heute, nicht gegen 2026-05-16', () => {
  // `[read]` Der Auftrag GO-16: „Das feste Heute wurde in G-28
  // uebernommen, weil Date.now() eine Hydrationsfalle ist. Sobald echte
  // Daten fliessen, muss es das echte Datum sein — lib/datum.ts rechnet
  // ueber Mittag, dieselbe Loesung, keine zweite."
  const seite = fs.readFileSync(path.join(process.cwd(), 'src/app/v2/goals/page.tsx'), 'utf8')
  assert.ok(/from '\.\.\/\.\.\/\.\.\/lib\/datum'/.test(seite),
    'Die Seite holt den Stichtag nicht aus lib/datum.')
  assert.ok(/heute\(\)/.test(seite), 'heute() wird nicht aufgerufen.')

  // Keine zweite Datumsloesung im Lesepfad und in den angebundenen Tabs.
  //
  // Kommentare werden vorher entfernt — dieselbe Falle wie beim
  // `arr_r`-Test: der Vermerk, der die Abwesenheit BEGRUENDET, zitiert
  // `Date.now()` woertlich und wuerde sonst selbst als Fund gelten.
  const ohneKommentar = (s: string) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*(\/\/|\*)/.test(z)).join('\n')

  for (const datei of [GOALS_LESEN, GOALS_COMP, GOALS_KARTEN, GOALS_TDEE, GOALS_KOERPER]) {
    const q = ohneKommentar(fs.readFileSync(datei, 'utf8'))
    assert.ok(!/Date\.now\(\)/.test(q),
      `${path.basename(datei)}: Date.now() — das ist die Hydrationsfalle aus G-28.`)
    assert.ok(!/HEUTE_DER_VORLAGE/.test(q),
      `${path.basename(datei)}: benutzt das feste Heute der Vorlage.`)
  }
})

test('Goals zeigt die Spanne am Koerperfettwert, nicht in einer Fussnote', () => {
  // `[read]` Der Auftrag: „Die Spanne gehoert an den Wert, nicht in
  // eine Fussnote — und der Vorbehalt steht in der Funktion. Zeig ihn."
  //
  // `[cmd]` `goals.body_composition_navy` liefert
  // `body_fat_pct_min`/`_max` und `caution` mit. Ein Wert ohne Spanne
  // saehe aus wie eine Messung; es ist eine Schaetzung mit ±3,5 Punkten.
  const comp = fs.readFileSync(GOALS_COMP, 'utf8')
  for (const feld of ['body_fat_pct_min', 'body_fat_pct_max', 'caution']) {
    assert.ok(comp.includes(feld), `Die Composition-Kachel zeigt "${feld}" nicht.`)
  }

  // Der Lesepfad fuehrt sie im selben Typ wie den Wert — wer
  // `body_fat_pct` anzeigt, hat die Spanne schon in der Hand.
  const lesen = fs.readFileSync(GOALS_LESEN, 'utf8')
  const typ = /export type Koerperzusammensetzung = \{[\s\S]*?\n\}/.exec(lesen)
  assert.ok(typ, 'Koerperzusammensetzung nicht gefunden.')
  for (const feld of ['body_fat_pct', 'body_fat_pct_min', 'body_fat_pct_max', 'caution']) {
    assert.ok(typ![0].includes(feld), `Der Typ fuehrt "${feld}" nicht.`)
  }
})

test('der adaptive TDEE zeigt seine Herkunft und verschleiert alpha nicht', () => {
  // `[read]` Der Auftrag: „Beide bleiben sichtbar, mit ihrer Herkunft."
  // Und: „alpha 0.3 macht den adaptiven Wert zu 70 % zur Formel — nicht
  // aendern, aber wenn die Anzeige es verschleiert, melden."
  const tdee = fs.readFileSync(GOALS_TDEE, 'utf8')
  assert.ok(/formula_tdee_kcal/.test(tdee), 'Die Formelgrundlage fehlt.')
  assert.ok(/adaptive_tdee_kcal/.test(tdee), 'Der adaptive Wert fehlt.')
  assert.ok(/alpha/.test(tdee), 'Der Glaettungsfaktor wird nicht gezeigt.')
  // Ausgeschrieben, nicht nur als Kuerzel: wer `α=0.3` nicht kennt,
  // liest sonst eine Eigenstaendigkeit, die die Zahl nicht hat.
  assert.ok(/1 - t\.alpha/.test(tdee),
    'Der Anteil, den der Vorwert behaelt, wird nicht ausgeschrieben.')

  // `[cmd]` Der Wert ist heute null (13 von 14 Zufuhrtagen). Statt einer
  // Ersatzzahl steht der Status da — eine Zahl saehe gemessen aus.
  assert.ok(/status/.test(tdee), 'Der Status der Funktion wird nicht gezeigt.')
  assert.ok(/complete_intake_days/.test(tdee),
    'Die Bedingung, an der es scheitert, wird nicht genannt.')
})

test('Goals bewertet nicht, es zeigt', () => {
  // `[read]` Der Auftrag: „Keine Bewertung. Ob jemand sein Ziel gut
  // verfolgt, ist eine Aussage ueber einen Menschen."
  //
  // `[cmd]` Die Attrappe fuehrt `pace: 'ahead' | 'on-track' | 'behind'`
  // (daten.ts) — drei Urteile ueber die Person. Die Datenbank fuehrt so
  // etwas nicht, und in den angebundenen Dateien kommt es nicht vor.
  const ohneKommentar = (s: string) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*(\/\/|\*)/.test(z)).join('\n')

  for (const datei of [GOALS_COMP, GOALS_KARTEN, GOALS_TDEE, GOALS_KOERPER]) {
    const q = ohneKommentar(fs.readFileSync(datei, 'utf8'))
    for (const urteil of [/'ahead'/, /'on-track'/, /'behind'/, /deltaVariant/]) {
      assert.ok(!urteil.test(q),
        `${path.basename(datei)}: ${urteil.source} ist ein Urteil ueber einen Menschen.`)
    }
  }
})

test('Goals erfasst nicht — die Uebersicht zeigt nur', () => {
  // `[read]` Der Umsetzungsplan: „Goals ist der Massstab, an dem Buddy
  // misst — keine eigenstaendige Dateneingabe."
  //
  // `[cmd]` Die 16 Eingabefelder des Mockups bleiben stehen und
  // markiert (Toms Entscheidung zu GO-16). Die ANGEBUNDENEN Dateien
  // duerfen keines haben — sonst entstuende genau der Erfassungspfad,
  // den die Vision ausschliesst.
  for (const datei of [GOALS_COMP, GOALS_KARTEN, GOALS_TDEE, GOALS_KOERPER]) {
    const q = fs.readFileSync(datei, 'utf8')
    assert.ok(!/<input|<textarea|<select/.test(q),
      `${path.basename(datei)}: hat ein Eingabefeld — Goals erfasst nicht.`)
  }
  // Und der Lesepfad hat keinen Schreibweg.
  const lesen = fs.readFileSync(GOALS_LESEN, 'utf8')
  for (const schreib of [/\.insert\(/, /\.update\(/, /\.upsert\(/, /\.delete\(/]) {
    assert.ok(!schreib.test(lesen),
      `lesen.ts: ${schreib.source} — der Lesepfad schreibt.`)
  }
})

test('Goals zeichnet keine Messungen, die es noch nicht gibt', () => {
  // `[cmd]` Von 43 Koerpermessungen tragen **26 ein Datum nach heute**
  // (bis 2026-09-13) — die Testdaten decken einen ganzen Zeitraum ab.
  // Eine Kurve, die sie mitzeichnet, behauptet Messungen, die es nicht
  // gibt. Der Lesepfad schneidet, und die Zahl der ausgelassenen wird
  // GENANNT, nicht verschwiegen.
  const lesen = fs.readFileSync(GOALS_LESEN, 'utf8')
  const laden = /export async function ladeMessungen[\s\S]*?\n\}/.exec(lesen)
  assert.ok(laden, 'ladeMessungen nicht gefunden.')
  assert.ok(/\.lte\('measurement_date'/.test(laden![0]),
    'ladeMessungen schneidet nicht am Stichtag — Zukunftsmessungen kaemen mit.')
  assert.ok(/export async function zaehleZukunftsmessungen/.test(lesen),
    'Die ausgelassenen Messungen werden nicht gezaehlt.')

  const koerper = fs.readFileSync(GOALS_KOERPER, 'utf8')
  assert.ok(/zukunft/.test(koerper),
    'Die Anzeige nennt die ausgelassenen Messungen nicht.')
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
  // `[cmd]` STAND SEIT G-60: **20 Marken**, vorher 21.
  //
  // Verschwunden ist die Entwurfstabelle in `tab-biomarker.tsx` (der
  // Satz `ENTWURFSKATALOG`) — nicht weil sie angebunden wurde, sondern
  // weil sie **geloescht** ist. `[read]` Ihre Begruendung war *„die
  // Tabelle zeigt Zeitreihe, Sparkline und Bereichsbalken —
  // `lab_result_values` fuehrt sechs Testwerte und keine Zeitreihe."*
  // Das gilt nicht mehr: 140 Werte, 5 Befunde, echter Verlauf. Ihre
  // Form traegt jetzt `marker-liste.tsx` mit echten Daten.
  //
  // Die uebrigen 20 stehen, weil ihre Tabs es sind: Dashboard,
  // Tracking, Insights und der Grossteil des Import-Tabs haben kein
  // Schema hinter sich.
  // `[cmd]` **G-135: `ansicht.tsx` von 5 auf 4.** Die Karte
  // „Health score" ist angebunden — die fuenf System-Scores rechnen
  // ueber `biomarker_spec_enrichment.system_groups` und die echten
  // Reihen, nicht mehr ueber `calcOverallHealthScore()` des Entwurfs.
  // `[read]` Die Alerts darunter bleiben markiert: sie stehen weiter
  // auf `generateAlerts()`.
  const dateien: Array<[string, number]> = [
    [MEDICAL, 4],
    [path.join(process.cwd(), 'src/app/v2/medical/tab-biomarker.tsx'), 7],
    // `[cmd]` **Von 8 auf 7** — die Medikationskachel traegt keine
    // Marke mehr; sie liest `user_medications`. Die Aenderung lag
    // beim G-135-Lauf bereits unversioniert im Arbeitsbaum und
    // stammt nicht aus diesem Auftrag.
    // `[cmd]` **G-207: von 7 auf 6.** Die Karte
    // „Symptom → Biomarker" traegt keine Marke mehr — sie liest
    // `medical.symptom_biomarker_map` (**102 Zuordnungen auf 32
    // Symptome**) statt der Konstante `SYMPTOM_BIOMARKER_MAP`
    // (7 Symptome, 28 Zuordnungen).
    //
    // `[read]` **Die Symptomkarten daneben bleiben markiert**, und das
    // ist kein Versaeumnis: `medical.symptoms` ist ein KATALOG von 34
    // Symptomarten. **Eine Tabelle fuer ERFASSTE Symptome gibt es
    // nicht** — `severity`, `onset`, `triggers` und `impact` haben
    // nirgends eine Spalte. Siehe Bericht G-207.
    [path.join(process.cwd(), 'src/app/v2/medical/tab-tracking.tsx'), 6],
  ]
  for (const [datei, erwartet] of dateien) {
    const quelle = fs.readFileSync(datei, 'utf8')
    // `[cmd]` NICHT nur `{ATTRAPPE}`: seit G-46 traegt die
    // Entwurfstabelle in `tab-biomarker.tsx` einen eigenen
    // Begruendungssatz (`{ENTWURFSKATALOG}`), weil ihr Grund ein
    // anderer ist — „Schema da, Spalten leer" statt „kein Schema".
    // Die alte Regel zaehlte sie nicht mit und meldete 7 statt 8.
    const mitGrund = (quelle.match(/attrappe=\{[A-Z_][A-Z_0-9]*\}/g) ?? []).length
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
// `[cmd]` **G-172: geprueft werden die IDs, nicht die Beschriftungen.**
// Die Beschriftungen kommen seither aus `messages/{de,en}.json`; ein
// `label: 'Today'` steht nicht mehr im Quelltext, und die Pruefung
// meldete deshalb alle elf Tabs als fehlend.
//
// `[read]` **Die Regel bleibt dieselbe** — kein Tab darf verschwinden.
// Die ID ist dafuer sogar der bessere Anker: sie steht in der Adresse
// (`?tab=`), waehrend die Beschriftung sich mit der Sprache aendert.
const VORLAGE_SUPP_TABS = [
  'today', 'stack', 'extended', 'catalog', 'stacks', 'intel',
  'inventory', 'injection', 'compliance', 'interactions', 'cost',
]

test('die elf Tabs der Vorlage stehen im Supplements-Modul', () => {
  const quelle = fs.readFileSync(SUPP_RAHMEN, 'utf8')
  for (const tab of VORLAGE_SUPP_TABS) {
    assert.ok(quelle.includes(`id: '${tab}'`),
      `Der Tab "${tab}" fehlt. Die Vorlage fuehrt elf.`)
  }
})

test('das Supplements-Modul kennzeichnet jede Kachel', () => {
  // Keine Quelle heisst: jede Kachel traegt die Marke. Wer eine Kachel
  // anbindet, entfernt `attrappe` und zaehlt die Erwartung herunter.
  //
  // G-33: die Erwartung steht je Datei. Extended und Compliance sind
  // seit dem Nachziehen eigene Dateien.
  //
  // **G-74: DIE ZAHL IN `tabs.tsx` IST JETZT ZWEIGETEILT.**
  //
  // `[cmd]` Bis G-73 stand hier pauschal 17 — und die Zahl blieb
  // gleich, obwohl vier Tabs echt lesen: die abgeloesten Fassungen
  // bleiben als Rueckfall stehen. **Der Zaehler zeigte damit eine Zahl,
  // die die Lage nicht mehr beschrieb.**
  //
  // `[read]` **Tom, 2026-08-19:** *„Im Code ausdokumentieren, sprich
  // den Code als alten Mockup-Code markieren, falls wir spaeter was
  // brauchen."* Die Rueckfallfassungen tragen deshalb seit G-74
  // `attrappe={RUECKFALL}` statt `{ATTRAPPE}` — maschinenlesbar, nicht
  // nur als Kommentar.
  //
  // **Was die zwei Zahlen bedeuten:**
  //   `attrappe`  — noch nie angebunden, die Zahlen sind erfunden.
  //   `RUECKFALL` — abgeloest, aber aufgehoben; daneben steht eine
  //                 angebundene Fassung.
  const dateien: Array<[string, number, number]> = [
    // Datei, echte Attrappen, Rueckfallfassungen
    // C-250: `CostEcht` liest echte Stackdaten, markiert aber die
    // Kostenbasis als Rueckfall, weil `supplements.supplements` keine
    // Preis- und Portionsquelle traegt.
    // G-187: die LETZTE echte Attrappe in `tabs.tsx` ist weg — 1 → 0.
    // `[cmd]` Der Wechselwirkungs-Block liest jetzt
    // `supplement_interactions` ueber den Stack statt der
    // Entwurfskonstante `INTERACTIONS`.
    [SUPP, 0, 17],
    [SUPP_EXT, 6, 0],
    [SUPP_COMP, 4, 0],
  ]
  for (const [datei, erwarteteAttrappen, erwarteteRueckfaelle] of dateien) {
    const quelle = fs.readFileSync(datei, 'utf8')
    const mitGrund = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    const ohneGrund = (quelle.match(/^\s+attrappe$/gm) ?? []).length
    const rueckfall = (quelle.match(/attrappe=\{RUECKFALL\}/g) ?? []).length

    assert.equal(mitGrund + ohneGrund, erwarteteAttrappen,
      `${path.basename(datei)}: ${mitGrund + ohneGrund} echte Attrappen, `
      + `erwartet ${erwarteteAttrappen}. Angebunden? Dann die Erwartung hier senken.`)
    assert.equal(rueckfall, erwarteteRueckfaelle,
      `${path.basename(datei)}: ${rueckfall} Rueckfallfassungen, `
      + `erwartet ${erwarteteRueckfaelle}. Geloescht? Dann die Erwartung hier senken.`)
  }
})

/**
 * G-74: Die Rueckfallmarke sitzt genau an den abgeloesten Fassungen.
 *
 * `[cmd]` Sonst waere die Trennung Kosmetik: wer `RUECKFALL` an eine
 * nie angebundene Kachel schriebe, behauptete, daneben stehe eine
 * echte Fassung. Und wer eine abgeloeste Fassung auf `ATTRAPPE`
 * zuruecksetzt, macht den Zaehler wieder blind.
 */
test('die Rueckfallmarke sitzt an den abgeloesten Fassungen', () => {
  const quelle = fs.readFileSync(SUPP, 'utf8')
  const grenzen: Array<{ name: string; start: number }> = []
  const muster = /^(?:export )?function (\w+)/gm
  let treffer: RegExpExecArray | null
  while ((treffer = muster.exec(quelle)) !== null) {
    grenzen.push({ name: treffer[1], start: treffer.index })
  }
  const block = (name: string) => {
    const i = grenzen.findIndex(g => g.name === name)
    assert.ok(i >= 0, `Die Fassung "${name}" fehlt.`)
    const ende = i + 1 < grenzen.length ? grenzen[i + 1].start : quelle.length
    return quelle.slice(grenzen[i].start, ende)
  }
  const zaehl = (s: string, re: RegExp) => (s.match(re) ?? []).length

  // Die sechs Rueckfallfassungen tragen NUR die Rueckfallmarke.
  for (const name of ['TodayAttrappe', 'SlotCard', 'StackMatrix', 'StackList',
                      'DatabaseAttrappe', 'CostAttrappe']) {
    const b = block(name)
    assert.ok(zaehl(b, /attrappe=\{RUECKFALL\}/g) > 0,
      `"${name}" ist eine abgeloeste Fassung und braucht die Rueckfallmarke.`)
    assert.equal(zaehl(b, /attrappe=\{ATTRAPPE\}/g) + zaehl(b, /^\s+attrappe$/gm), 0,
      `"${name}" traegt noch die alte Marke — der Zaehler kann dann nicht trennen.`)
  }

  // ── G-189: `SuppInteractions` ist ENTFERNT ────────────────
  //
  // `[cmd]` **Der Block war nicht erreichbar:** `ansicht.tsx` rief ihn
  // nur bei `regeln.length === 0`, und `supplements.rule_catalog`
  // traegt 64 Zeilen mit einer `{authenticated}`-Policy ohne
  // Nutzerfilter (`qual: true`, gemessen 2026-08-28).
  //
  // `[read]` **G-163-Beschluss:** Rueckfallfassungen bleiben nicht als
  // Notanzeige stehen. **Er war keine Attrappe** — er las echte
  // Zeilen; genau das machte ihn gefaehrlich, denn niemand pflegt
  // eine zweite Fassung, die niemand sieht.
  //
  // `[read]` **Die Zusage aus G-187 ist nicht verschwunden**, sie
  // steht jetzt in `tab-interactions-echt.tsx` — geprueft in
  // `stack-wechselwirkungen.test.ts`.
  assert.equal(/export function SuppInteractions\(/.test(quelle), false,
    'Der Rueckfallzweig `SuppInteractions` ist zurueck (G-189).')
  assert.equal(/INTERACTIONS/.test(quelle), false,
    'Die Entwurfskonstante `INTERACTIONS` ist zurueck (G-163-Beschluss).')

  // Und die Marke sagt, was sie bedeutet.
  assert.ok(/const RUECKFALL = /.test(quelle), 'Die Rueckfallmarke ist nicht definiert.')
  assert.ok(/Rueckfallfassung/.test(quelle),
    'Der Begruendungssatz nennt die Rueckfallfassung nicht beim Namen.')
})

/**
 * G-37: Die angebundenen Fassungen tragen keine Attrappenmarke.
 *
 * `[cmd]` Vier Tabs lesen aus `supplements` (C-68): Today, Stack,
 * Database und Cost. Wer einer dieser Fassungen eine Marke gibt,
 * behauptet, echte Daten seien erfunden — und wer eine Rueckfall-
 * fassung entmarkt, behauptet das Gegenteil. Beides faellt hier auf.
 */
test('die angebundenen Supplements-Fassungen tragen keine Marke', () => {
  const quelle = fs.readFileSync(SUPP, 'utf8')
  // Kein `matchAll`-Spread: das Ziel dieser Uebersetzung ist aelter
  // als es2015 und braeuchte `--downlevelIteration`.
  const grenzen: Array<{ name: string; start: number }> = []
  const muster = /^(?:export )?function (\w+)/gm
  let treffer: RegExpExecArray | null
  while ((treffer = muster.exec(quelle)) !== null) {
    grenzen.push({ name: treffer[1], start: treffer.index })
  }
  const block = (name: string) => {
    const i = grenzen.findIndex(g => g.name === name)
    assert.ok(i >= 0, `Die Fassung "${name}" fehlt.`)
    const ende = i + 1 < grenzen.length ? grenzen[i + 1].start : quelle.length
    return quelle.slice(grenzen[i].start, ende)
  }
  // `[cmd]` G-74: **beide** Marken zaehlen als „markiert". Die
  // Rueckfallfassungen tragen seither `{RUECKFALL}` statt `{ATTRAPPE}`;
  // welche von beiden wo sitzt, prueft der Test darunter. Hier geht es
  // nur darum, dass Erfundenes ueberhaupt gekennzeichnet ist.
  const marken = (s: string) =>
    (s.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    + (s.match(/attrappe=\{RUECKFALL\}/g) ?? []).length
    + (s.match(/^\s+attrappe$/gm) ?? []).length

  // Angebunden — keine Marke. C-229: `DatabaseEcht` (44er) ist raus,
  // der Database-Tab rendert die `SubstanzDatenbank` (566er) aus
  // substanz-detail.tsx; deren Markenfreiheit prueft der
  // C-227/C-229-Waechter in lib/supplements.
  for (const name of ['TodayEcht', 'StackMatrixEcht', 'StackListeEcht']) {
    assert.equal(marken(block(name)), 0,
      `"${name}" liest echte Daten und darf keine Attrappenmarke tragen.`)
  }
  const costEcht = block('CostEcht')
  assert.ok(/no price per serving and no serving size/.test(costEcht),
    'CostEcht muss den fehlenden Preis-/Portionspfad benennen.')
  assert.equal(marken(costEcht), 1,
    'CostEcht darf nur die fehlende Kostenbasis markieren, nicht den ganzen Lesepfad.')

  // Rueckfall - Marke muss bleiben, sonst gilt Erfundenes als echt.
  for (const name of ['TodayAttrappe', 'StackMatrix', 'StackList',
                      'DatabaseAttrappe', 'CostAttrappe']) {
    assert.ok(marken(block(name)) > 0,
      `"${name}" zeigt die Vorlage und muss eine Marke behalten.`)
  }
})

test('die Unterkomponenten der Vorlage sind alle da', () => {
  // [cmd] G-33: der erste Durchgang baute die Tab-RUEMPFE und liess elf
  // Unterkomponenten weg — 530 Zeilen Vorlage. Der Rumpf ist nicht das
  // Modul. Dieser Test haelt die Liste fest.
  const alles = [SUPP, SUPP_EXT, SUPP_COMP, SUPP_RAHMEN, SUPP_MODALE, SUPP_GATE]
    .map(f => fs.readFileSync(f, 'utf8')).join(String.fromCharCode(10))
  //
  // **G-110: `ExtendedGate` heisst jetzt `ExtendedGesperrt`.** `[cmd]`
  // Die alte Fassung war ein `useState`-Gate, das nichts schuetzte
  // (G-92: *„Wer klickt, sieht die Protokolle"*). Sie ist ERSETZT, nicht
  // weggelassen: das neue Gate steht in `extended-gate.tsx` und
  // entscheidet gegen `profiles.experience_level`.
  //
  // `[read]` Der Test bleibt streng — er prueft weiter, dass eine
  // Aufklaerungsflaeche existiert, nur unter ihrem neuen Namen.
  for (const k of [
    'ExtendedGesperrt', 'ExtendedHeader', 'ExtendedCompoundCard', 'CycleTimeline',
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
const NUT_PLANS = path.join(process.cwd(), 'src/app/v2/nutrition/tab-plans.tsx')
const NUT_INSIGHTS = path.join(process.cwd(), 'src/app/v2/nutrition/tab-insights.tsx')
const NUT_PLANNER = path.join(process.cwd(), 'src/app/v2/nutrition/tab-planner.tsx')
const NUT_MODALE = path.join(process.cwd(), 'src/app/v2/nutrition/modale.tsx')

test('die nachgezogenen Nutrition-Tabs kennzeichnen jede Kachel', () => {
  // [cmd] G-38: vier Tabs standen bis dahin nur als Platzhalter da.
  // Gebaut ist die Oberflaeche, angebunden ist nichts. Wer einen Tab
  // anbindet, entfernt `attrappe` und zaehlt hier herunter.
  //
  // `[cmd]` **`prefs` ist am 2026-08-23 ganz herausgefallen** (G-163):
  // die Datei war der Rueckfall und ist geloescht, der echte Zweig
  // `VorliebenTab` liest seit G-65. **Sechs Marken weniger.**
  //
  // `[cmd]` **`plans` bleibt bei 8** — die Datei ist KEIN Rueckfall.
  // Seit G-161 tragen drei ihrer Kacheln echte Zahlen aus `plan-lesen`;
  // die uebrigen fuenf bleiben Attrappe, weil `meal_plan_entries` keine
  // Statusspalte und `meal_plans` keine Lifecycle-Spalten hat.
  const dateien: Array<[string, number]> = [
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

// --- G-157 / G-163: die entfernten Entwuerfe bleiben entfernt --------
test('die Nutrition-Entwuerfe kommen nicht zurueck', () => {
  // `[cmd]` **Am 2026-08-23 entfernt** (G-157 / G-163):
  // `nutrients-entwurf.tsx` (585 Zeilen, 12 Kacheln, **null Marken**,
  // 79 erfundene Naehrstoffeintraege plus „Fake 14-day trend") und
  // `tab-prefs.tsx` (203 Zeilen, 6 Marken, **veralteter Text** — er
  // behauptete, die Vorlieben seien nicht angebunden, obwohl
  // `VorliebenTab` sie seit G-65 liest).
  //
  // `[read]` **Ohne diese Pruefung bewacht nichts die Entfernung.**
  // Gegengeprobt am 2026-08-23: `tab-prefs.tsx` wiederhergestellt, die
  // Zaehlung oben blieb gruen — sie kennt die Datei ja nicht mehr.
  // Erst diese Pruefung wird rot.
  for (const name of ['nutrients-entwurf.tsx', 'tab-prefs.tsx']) {
    const p = path.join(process.cwd(), 'src/app/v2/nutrition', name)
    assert.equal(fs.existsSync(p), false,
      `${name} ist wieder da. Der Entwurf zeigt erfundene Zahlen — `
      + 'wenn der echte Zweig nicht laedt, gehoert dorthin LeerHinweis.')
  }

  // Und der Rueckfall darf auch nicht ueber einen anderen Namen
  // zurueckkehren: der Tab-Ausdruck zeigt entweder echt oder leer.
  const quelle = fs.readFileSync(NUTRITION, 'utf8')
  for (const weg of [/NutrientAnalysisView/, /FoodPreferencesTab/]) {
    assert.equal(weg.test(quelle), false,
      `ansicht.tsx verweist wieder auf ${weg.source}.`)
  }
  // Beide Zweige muessen den Hinweis tragen — nutrients und prefs.
  assert.equal((quelle.match(/<LeerHinweis/g) ?? []).length, 2,
    'Beide Rueckfaelle (nutrients, prefs) zeigen LeerHinweis.')
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
    // G-163: die Rueckfallfassungen sind geloescht — ansicht 11 -> 9
    // (Your-coaches- und Threads-Entwurf raus), tab-rechte 5 -> 0
    // (beide Entwuerfe samt toter ProposalCard/-Modal raus),
    // tab-autonomie 11 -> 3 (Autonomie-Entwurf raus, die
    // Check-in-Attrappe bleibt).
    // G-185: die Einladungen sind angebunden — 9 -> 7.
    // `[cmd]` Raus sind die Kachel „Pending invites" (zaehlte
    // `PENDING_INVITES` und trug einen zweiten Knopf ins
    // Entwurfsmodal) und die Tabelle des Invites-Reiters (erfundene
    // Namen, dazu zwei Zeilen fest im JSX). Beide lesen jetzt
    // `coach.relationships` mit `status='invited'`.
    [COACH, 7],
    [COACH_RECHTE, 0],
    // G-169: die Check-in-Attrappe war mit dem neuen Lesepfad ein
    // Rueckfall und ist nach dem G-163-Beschluss raus — 3 -> 0.
    [COACH_AUTO, 0],
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
  //
  // G-163: Die Regel gilt nur noch fuer den Onboarding-Tab — die
  // uebrigen Dateien tragen jetzt echte Karten und Hinweis-Flaechen
  // ohne Marke. Fuer sie prueft der G-163-Waechter darunter, dass die
  // geloeschten Rueckfallfassungen nicht zurueckkommen.
  for (const datei of [COACH_ONBOARD]) {
    const quelle = fs.readFileSync(datei, 'utf8')
    const karten = (quelle.match(/<Card\b/g) ?? []).length
    const marken = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    assert.equal(marken, karten,
      `${path.basename(datei)}: ${karten} Karten, aber ${marken} Marken.`)
  }
})

test('G-149: der Einnahme-Haken bucht auf den angesehenen Tag', () => {
  // `[cmd]` Der Fehler: toggleTaken sendete `intake_date: stichtag`
  // (= echtes Heute), waehrend die Today-Kachel und die
  // takenToday-Initialisierung den juengsten Protokolltag
  // (einnahmen[0]) zeigen. Wer die Korrektur zurueckdreht, wird hier
  // rot — die Negativprobe des Auftrags.
  const q = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/supplements/ansicht.tsx'), 'utf8')
  const toggle = q.slice(q.indexOf('const toggleTaken'), q.indexOf('}, [daten, stichtag])'))
  assert.ok(/const ansichtsTag = daten\.einnahmen\[0\]\?\.intake_date/.test(toggle),
    'toggleTaken kennt den angesehenen Tag nicht mehr.')
  assert.ok(/intake_date: ansichtsTag/.test(toggle),
    'toggleTaken bucht nicht auf den angesehenen Tag.')
  assert.ok(!/intake_date: stichtag/.test(toggle),
    'toggleTaken bucht wieder auf heute statt auf den angesehenen Tag (G-149).')
})

test('G-158: der Coach-Kopf zaehlt aus dem Stand, nicht aus COACHES', () => {
  const q = fs.readFileSync(COACH, 'utf8')
  const kopf = q.slice(q.indexOf('v2-module-title-row'), q.indexOf('v2-module-sub'))
  assert.ok(!/COACHES/.test(kopf),
    'Der Kopf zaehlt wieder aus der Entwurfskonstante (G-158).')
  assert.ok(/aktiveBeziehungen/.test(kopf) && /ungeleseneNachrichten/.test(kopf))
  assert.ok(/Nicht geladen/.test(kopf), 'Ohne Stand fehlt der Hinweis — kein Strich, keine Null.')
})

test('G-185: der Invites-Reiter liest relationships, nicht PENDING_INVITES', () => {
  // ══ DER BEFUND ══════════════════════════════════════════════════
  //
  // `[cmd]` Bis G-185 kam die Reiterzahl aus `PENDING_INVITES`, einer
  // Entwurfskonstante mit erfundenen Namen und Ablaufdaten — waehrend
  // seit C-225 daneben `coach.relationships` liegt.
  //
  // `[read]` **G-163-Beschluss:** Entwurfskonstanten bleiben nicht als
  // Notfallanzeige stehen.
  const q = fs.readFileSync(COACH, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

  assert.equal(/PENDING_INVITES/.test(q), false,
    '`PENDING_INVITES` ist zurueck — die Entwurfskonstante zaehlt wieder '
    + 'erfundene Einladungen (G-185).')

  // Die Reiterzahl kommt aus dem Stand, mit dem Statusfilter.
  assert.match(q, /status === 'invited'/,
    'Die Zahl muss aus `relationships` mit `status=\'invited\'` kommen.')

  // Der Kopf-Knopf fuehrt nicht mehr ins Entwurfsmodal.
  const kopf = q.slice(q.indexOf('v2-module-actions'), q.indexOf('<Tabs'))
  assert.equal(/typ: 'invite'/.test(kopf), false,
    'Der Kopf-Knopf oeffnet wieder das Entwurfsmodal statt des echten '
    + 'Formulars (G-185).')
})

test('G-185: der Leerzustand traegt das Einladeformular', () => {
  // ══ FABLES FUND AUS C-225 ═══════════════════════════════════════
  //
  // `[read]` **Bei 0 Beziehungen rendete nur der Empty-Zweig, ohne
  // Formular — und genau dort entsteht die erste Beziehung.**
  //
  // `[cmd]` Gemessen 2026-08-25: `test-user@lumeos.local` sieht **0**
  // Einladungen (beide `invited`-Zeilen gehoeren
  // `sarah.seed@example.com`). **Der leere Fall ist der Normalfall.**
  const q = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/coach/uebersicht-echt.tsx'), 'utf8')

  const anfang = q.indexOf('export function EinladungenEcht(')
  assert.ok(anfang > 0, '`EinladungenEcht` fehlt.')
  const ende = q.indexOf('export function', anfang + 30)
  const rumpf = q.slice(anfang, ende > 0 ? ende : undefined)

  // Das Formular steht AUSSERHALB des Ternaers — also in beiden Zweigen.
  const ternaer = rumpf.indexOf('offen.length === 0')
  const formular = rumpf.indexOf('<InviteFormular')
  assert.ok(formular > 0, 'Der Reiter zeigt kein Einladeformular.')
  assert.ok(formular > rumpf.indexOf('</Card>') - 400,
    'Das Formular muss nach dem Ternaer stehen, damit es auch im leeren '
    + 'Zweig erscheint (G-185, Fables Fund aus C-225).')
  assert.ok(ternaer > 0 && ternaer < formular,
    'Das Formular darf nicht im gefuellten Zweig eingeschlossen sein.')

  // Und es ist DAS Formular aus C-225, kein zweiter Schreibweg.
  assert.equal(/from\('relationships'\)/.test(q), false,
    'Der Reiter darf nicht selbst schreiben — `ladeCoachEin` ist der Weg '
    + '(G-185).')
})

test('C-225/G-169: die drei Schreibwege und der Check-in-Lesepfad stehen', () => {
  // Richtung 1: die Wege existieren und die Oberflaeche ruft sie.
  const schreiben = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/coach/nachrichten-schreiben.ts'), 'utf8')
  assert.ok(/from\('messages'\)[\s\S]*?\.insert\(/.test(schreiben), 'Antworten fehlt.')
  assert.ok(/from\('relationships'\)[\s\S]*?\.insert\(/.test(schreiben), 'Einladen fehlt.')
  assert.ok(/status: 'invited'/.test(schreiben), 'Einladen setzt nicht invited.')
  assert.ok(/\.update\(\{ read_at/.test(schreiben), 'Als-gelesen fehlt.')
  // G-79: jeder Weg prueft auf null Zeilen.
  assert.equal((schreiben.match(/\.select\('id'\)/g) ?? []).length, 3,
    'Jeder der drei Wege braucht die Nullzeilenpruefung.')
  const ui = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/coach/uebersicht-echt.tsx'), 'utf8')
  assert.ok(/sendeNachricht\(/.test(ui) && /ladeCoachEin\(/.test(ui) && /markiereGelesen\(/.test(ui))
  // G-169: der Lesepfad und die echte Fassung.
  const read = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/coach/rechte-read.ts'), 'utf8')
  assert.ok(/from\('checkin_templates'\)/.test(read) && /from\('checkins'\)/.test(read),
    'Der Check-in-Lesepfad fehlt.')
  assert.ok(/<CheckinsEcht stand=/.test(fs.readFileSync(COACH_AUTO, 'utf8')))
})

test('G-163: die Rueckfallfassungen bleiben geloescht', () => {
  // Richtung 1: keine der entfernten Entwurfsfunktionen existiert
  // wieder. Richtung 2 (Negativprobe im Bericht): wer eine
  // zurueckbaut, laesst diesen Test rot werden — und die
  // Markenzaehlung oben steigt.
  // Nur CODE-Formen — Kommentare duerfen die Namen historisch nennen
  // (dieselbe Praezisierung wie beim C-181-Waechter).
  const faelle: Array<[string, RegExp[]]> = [
    [path.join(process.cwd(), 'src/app/v2/recovery/tab-messwerte.tsx'),
      [/function HrvEntwurf/, /function SleepEntwurf/, /HRV_LOG\.map/, /HRV_BASELINE\./]],
    [RECOVERY,
      [/TODAY_MODALITIES\.(map|length)/, /Score composition/]],
    [COACH_RECHTE,
      [/function PermissionsEntwurf/, /function ProposalsEntwurf/, /attrappe=\{ATTRAPPE\}/]],
    [COACH_AUTO, [/function AutonomyEntwurf/, /AUTONOMY_LADDER\.map/]],
    [COACH, [/function CoachCardMini/]],
  ]
  for (const [datei, muster] of faelle) {
    const quelle = fs.readFileSync(datei, 'utf8')
    for (const m of muster) {
      assert.ok(!m.test(quelle),
        `${path.basename(datei)}: ${m} ist zurueck — die Rueckfallfassung war geloescht (G-163).`)
    }
  }
  // Und an ihrer Stelle steht der Hinweis, nicht nichts.
  for (const datei of [RECOVERY, COACH_RECHTE, COACH_AUTO,
    path.join(process.cwd(), 'src/app/v2/recovery/tab-messwerte.tsx')]) {
    assert.ok(/Nicht geladen/.test(fs.readFileSync(datei, 'utf8')),
      `${path.basename(datei)}: die Hinweis-Flaeche „Nicht geladen" fehlt.`)
  }
})

test('G-158: Beziehungen und Nachrichten lesen echt, mit Rueckfall', () => {
  // Richtung 1: die echte Fassung existiert, liest aus dem Stand und
  // traegt KEINE Attrappenmarke.
  const echt = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/coach/uebersicht-echt.tsx'), 'utf8')
  assert.ok(/CoachesEcht/.test(echt) && /ThreadsEcht/.test(echt))
  assert.ok(/stand\.beziehungen/.test(echt) && /stand\.nachrichten/.test(echt))
  assert.ok(!/attrappe=/.test(echt),
    'uebersicht-echt.tsx liest echte Daten und darf keine Marke tragen.')

  // Richtung 2: der Leseweg fragt die beiden Tabellen wirklich ab —
  // faellt eine Abfrage weg, zeigt die Oberflaeche wieder Attrappen.
  const read = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/coach/rechte-read.ts'), 'utf8')
  assert.ok(/from\('relationships'\)/.test(read), 'relationships wird nicht mehr abgefragt.')
  assert.ok(/from\('messages'\)/.test(read), 'messages wird nicht mehr abgefragt.')

  // Und die Weichen im Rahmen: echte Fassung, Entwurf nur als Rueckfall.
  const rahmen = fs.readFileSync(COACH, 'utf8')
  assert.ok(/<CoachesEcht stand=/.test(rahmen), 'Die Overview-Weiche fehlt.')
  assert.ok(/<ThreadsEcht stand=/.test(rahmen), 'Die Messages-Weiche fehlt.')
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

test('die AI-Coach-Seite zeigt das Modul, nicht mehr den Platzhalter', () => {
  // GESCHICHTE DIESER PRUEFUNG: In G-40 stand hier das Gegenteil — die
  // Seite war ein Platzhalter, der seine zwanzig ungebauten Tabs
  // namentlich nannte, und die Pruefung hielt fest, dass er sie nennt
  // (G-29: „was fehlt, steht in der Oberflaeche, nicht im Bericht
  // allein").
  //
  // G-42 hat das Modul gebaut. Die alte Pruefung wurde damit
  // **falsch**, nicht ueberfluessig: sie suchte die Tabnamen in
  // `ai/page.tsx`, wo jetzt nur noch der Seitenkopf steht. Die
  // Tabnamen selbst prueft `die zwanzig Tabs der Vorlage stehen im
  // AI-Coach-Modul` weiter unten, gegen den echten Rahmen.
  //
  // Was hier bleibt: dass der Platzhalter wirklich weg ist. Eine Seite,
  // die beides zeigt — Modul UND Fehlmeldung —, waere schlimmer als
  // jede von beiden.
  const quelle = fs.readFileSync(COACH_AI, 'utf8')
  assert.ok(/BuddyAnsicht/.test(quelle),
    'ai/page.tsx rendert den Rahmen nicht.')
  assert.ok(!/fehlt noch|NOCH NICHT GEBAUT|Nicht uebernommen/.test(quelle),
    'ai/page.tsx traegt noch den Platzhaltertext aus G-40.')
})

// ── Coach · AI Coach / Buddy (G-42) ──────────────────────────────────

const AI_ANSICHT = path.join(process.cwd(), 'src/app/v2/coach/ai/ansicht.tsx')
const AI_DATEN = path.join(process.cwd(), 'src/app/v2/coach/ai/daten.ts')
const AI_MOTOREN = path.join(process.cwd(), 'src/app/v2/coach/ai/tab-motoren.tsx')
const AI_WISSEN = path.join(process.cwd(), 'src/app/v2/coach/ai/tab-wissen.tsx')
const AI_STIMME = path.join(process.cwd(), 'src/app/v2/coach/ai/tab-stimme.tsx')
const AI_OVERRIDES = path.join(process.cwd(), 'src/app/v2/coach/ai/tab-overrides.tsx')
const AI_ORB = path.join(process.cwd(), 'src/app/v2/coach/ai/orb.tsx')

/**
 * Die zwanzig Tabs der Vorlage (theme-v1/module-buddy.jsx:91-112) — in
 * dieser Reihenfolge.
 *
 * `[cmd]` DER AUFTRAG NANNTE ZWOELF. Gezaehlt sind es zwanzig. Wie bei
 * Human Coaches (G-40, elf genannt / zehn gezaehlt) gilt die Vorlage,
 * nicht der Auftragstext.
 */
const VORLAGE_BUDDY_TABS = [
  'Chat', 'Insights feed', 'Memory', 'Decisions', 'Personality',
  'Avatar states', 'Plan & gate', 'Engines', 'Journey', 'Watcher',
  'BSS', 'Signature', 'Interventions', 'Safety', 'Butler',
  'Voice / Live', 'Knowledge', 'Rules', 'Coach overrides', 'Clone & Gym',
]

test('die zwanzig Tabs der Vorlage stehen im AI-Coach-Modul', () => {
  const quelle = fs.readFileSync(AI_ANSICHT, 'utf8')
  assert.equal(VORLAGE_BUDDY_TABS.length, 20, 'Die Vorlage fuehrt zwanzig Tabs.')
  for (const tab of VORLAGE_BUDDY_TABS) {
    assert.ok(quelle.includes(`'${tab}'`),
      `Der Tab "${tab}" fehlt. Die Vorlage fuehrt zwanzig.`)
  }
})

test('jede Karte des AI-Coach-Moduls traegt eine Marke', () => {
  // Nicht "so viele wie erwartet", sondern "keine ohne" — wer eine
  // Karte ergaenzt und die Marke vergisst, faellt hier auf, ohne dass
  // jemand eine Zahl pflegt.
  //
  // `[cmd]` Ein Buddy-Schema gibt es nicht: weder `buddy` noch `coach`
  // kommt in `supabase/_pipeline/` in einem `CREATE TABLE` vor.
  for (const datei of [AI_ANSICHT, AI_MOTOREN, AI_WISSEN, AI_STIMME, AI_OVERRIDES]) {
    const quelle = fs.readFileSync(datei, 'utf8')
    const karten = (quelle.match(/<Card\b/g) ?? []).length
    const marken = (quelle.match(/attrappe=\{ATTRAPPE\}/g) ?? []).length
    assert.equal(marken, karten,
      `${path.basename(datei)}: ${karten} Karten, aber ${marken} Marken.`)
  }
})

test('die fuenfzehn Zulieferer des Buddy-Rahmens stehen da', () => {
  // [cmd] module-buddy.jsx:120-133 ruft fuenfzehn Namen ueber window.*.
  // Verteilt auf vier Vorlagendateien — und eine davon gehoert Human
  // Coaches: `BuddyCoachOverrides` ist in module-coach-meta.jsx:161
  // definiert, nicht in einer Buddy-Datei.
  const motoren = fs.readFileSync(AI_MOTOREN, 'utf8')
  const wissen = fs.readFileSync(AI_WISSEN, 'utf8')
  const stimme = fs.readFileSync(AI_STIMME, 'utf8')
  const overrides = fs.readFileSync(AI_OVERRIDES, 'utf8')

  for (const n of ['BuddyTiers', 'BuddyEngines', 'BuddyJourney', 'BuddyWatcher',
                   'BuddyBSS', 'BuddySignature', 'BuddyInterventions',
                   'BuddySafety', 'BuddyButler']) {
    assert.ok(new RegExp(`export function ${n}\\b`).test(motoren),
      `${n} fehlt in tab-motoren.tsx (Vorlage: module-buddy-engines.jsx).`)
  }
  for (const n of ['BuddyKnowledge', 'BuddyRules', 'BuddyClone']) {
    assert.ok(new RegExp(`export function ${n}\\b`).test(wissen),
      `${n} fehlt in tab-wissen.tsx (Vorlage: module-buddy-knowledge.jsx).`)
  }
  assert.ok(/export function BuddyVoice\b/.test(stimme),
    'BuddyVoice fehlt (Vorlage: module-buddy-voice.jsx).')
  assert.ok(/export function BuddyCoachOverrides\b/.test(overrides),
    'BuddyCoachOverrides fehlt (Vorlage: module-coach-meta.jsx:161).')
})

test('die Buddy-Daten kommen aus der Vorlage, nicht aus dem Gedaechtnis', () => {
  // Stichproben quer durch die Vorlagendateien. Zahlen, die jemand beim
  // Abschreiben verrutschen koennte.
  const quelle = fs.readFileSync(AI_DATEN, 'utf8')
  // module-buddy.jsx:3-9 — fuenf Persoenlichkeiten.
  assert.ok(/'scientist'/.test(quelle) && /'zen'/.test(quelle), 'Personas fehlen')
  // module-buddy-engines.jsx:104-122 — der BSS.
  assert.ok(/total: 71/.test(quelle), 'Der BSS-Gesamtwert fehlt')
  // `[cmd]` Die Vorlage schreibt das Malzeichen als × (U+00D7), nicht
  // als `*` — module-buddy-engines.jsx:107. Wer hier `\*` prueft,
  // testet eine Formel, die so nirgends steht.
  assert.ok(/stability_score × 0\.6/.test(quelle), 'Die BSS-Formel fehlt')
  // module-buddy-engines.jsx:125-140 — Signatur ab acht Wochen.
  assert.ok(/minWeeks: 8/.test(quelle), 'Die Mindestdauer der Signatur fehlt')
  assert.ok(/eventCount: 412/.test(quelle), 'Die Ereigniszahl fehlt')
  // module-buddy-engines.jsx:160 — die Obergrenze der Interventionen.
  assert.ok(/maxConfrontations: 2/.test(quelle), 'Die Konfrontationsgrenze fehlt')
})

test('die elf Motoren und die neun Sicherheitsregeln sind vollzaehlig', () => {
  // [cmd] module-buddy-engines.jsx:45-57 fuehrt elf Motoren,
  // :163-173 neun Regeln. Beide Zahlen stehen in der Oberflaeche
  // ("Engines · 11 · deterministic", "Immutable rules · 9") — fehlt
  // eine Zeile, widerspricht die Tabelle ihrer eigenen Ueberschrift.
  const quelle = fs.readFileSync(AI_DATEN, 'utf8')
  const motoren = /export const ENGINES[^=]*=\s*\[([\s\S]*?)\n\]/.exec(quelle)
  assert.ok(motoren, 'ENGINES nicht gefunden')
  assert.equal((motoren![1].match(/\{ id:/g) ?? []).length, 11,
    'Die Vorlage fuehrt elf Motoren.')

  const regeln = /export const SAFETY_RULES[^=]*=\s*\[([\s\S]*?)\n\]/.exec(quelle)
  assert.ok(regeln, 'SAFETY_RULES nicht gefunden')
  assert.equal((regeln![1].match(/\{ rule:/g) ?? []).length, 9,
    'Die Vorlage fuehrt neun Sicherheitsregeln.')
})

test('das AI-Coach-Modul uebernimmt den Tippfehler arr_r nicht', () => {
  // [cmd] module-buddy.jsx:229 schreibt `<Icon name="arr_r">` — derselbe
  // Tippfehler wie in G-20, G-21, G-36 und G-40. `arrow_right` steht in
  // icons.tsx, `arr_r` nicht.
  //
  // Kommentare zaehlen nicht: die Dateien ZITIEREN den Tippfehler, um
  // die Ersetzung zu belegen.
  const ohneKommentar = (s: string) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*\/\//.test(z)).join('\n')

  for (const datei of [AI_ANSICHT, AI_MOTOREN, AI_WISSEN, AI_STIMME, AI_OVERRIDES]) {
    const quelle = ohneKommentar(fs.readFileSync(datei, 'utf8'))
    assert.ok(!/arr_r/.test(quelle),
      `${path.basename(datei)}: `
      + '`arr_r` ist ein Tippfehler der Vorlage — `arrow_right` benutzen.')
  }
})

test('der Buddy-Orb vergibt eigene SVG-Kennungen', () => {
  // [cmd] module-buddy.jsx:146 vergibt feste Kennungen `borb-${state}`.
  // Der Tab „Avatar states" zeigt alle fuenf Zustaende gleichzeitig,
  // und der Chat zeigt `responding` erneut — zwei Elemente mit
  // derselben Kennung auf einer Seite.
  //
  // ANLASS: dieselbe Falle hat in G-21 die Koerperkarte getroffen
  // (`clipPath` mit fester Kennung, zwei Karten auf einer Seite).
  // Dieselbe Loesung, und diesmal von vornherein.
  const quelle = fs.readFileSync(AI_ORB, 'utf8')
  assert.ok(/useId\(\)/.test(quelle),
    'orb.tsx: ohne React.useId() kollidieren die Verlaufskennungen.')
  assert.ok(!/id="borb-/.test(quelle) && !/id="bblur-/.test(quelle),
    'orb.tsx: feste SVG-Kennungen kollidieren, sobald zwei Orbs '
    + 'denselben Zustand zeigen.')
})

test('im AI-Coach-Modul steht kein unberechenbarer Wert', () => {
  // [cmd] Gemessen ueber die vier Vorlagendateien (1.746 Zeilen): null
  // Math.random(), null Date.now(), null new Date(), null Math.sin.
  // Anders als bei Goals (32 Konsolenmeldungen) und bei Coach (64
  // QR-Zellen) war hier nichts zu entschaerfen — diese Pruefung haelt
  // fest, dass es so bleibt.
  //
  // `[read]` Der Auftrag: „Und Math.sin ist nicht bitgenau: fest heisst
  // in jeder Engine gleich, nicht bei jedem Aufruf gleich."
  const ohneKommentar = (s: string) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*\/\//.test(z)).join('\n')

  const dateien = [AI_ANSICHT, AI_DATEN, AI_MOTOREN, AI_WISSEN, AI_STIMME,
                   AI_OVERRIDES, AI_ORB]
  for (const datei of dateien) {
    const quelle = ohneKommentar(fs.readFileSync(datei, 'utf8'))
    for (const muster of [/Math\.random/, /Date\.now/, /new Date\(/, /Math\.sin/, /Math\.cos/]) {
      assert.ok(!muster.test(quelle),
        `${path.basename(datei)}: ${muster.source} weicht zwischen Server `
        + 'und Browser ab oder ist nicht bitgenau.')
    }
  }
})

test('der Befehlsparser der Sprachsitzung erkennt die Vorlagenbeispiele', () => {
  // [cmd] module-buddy-voice.jsx:16-26 fuehrt neun Muster, jedes mit
  // einem Beispiel. Der Parser ist das einzige Stueck echter Logik im
  // Modul — er laeuft im Browser gegen die Eingabe.
  //
  // Die Muster stehen in TypeScript doppelt gequotet (`\\d`), damit die
  // RegExp dasselbe sieht wie in der Vorlage. Wer beim Uebernehmen eine
  // Ebene verliert, bekommt ein Muster, das nichts mehr trifft — und
  // das faellt ohne diese Pruefung erst im Browser auf.
  const quelle = fs.readFileSync(AI_STIMME, 'utf8')
  const block = /GYM_COMMANDS[^=]*=\s*\[([\s\S]*?)\n\]/.exec(quelle)
  assert.ok(block, 'GYM_COMMANDS nicht gefunden')

  const muster: Array<[string, string]> = []
  for (const z of block![1].split('\n')) {
    const m = /intent: '([^']+)'[\s\S]*?pattern: '((?:[^'\\]|\\.)*)'/.exec(z)
    if (m) muster.push([m[1], m[2].replace(/\\\\/g, '\\')])
  }
  assert.equal(muster.length, 9, `Die Vorlage fuehrt neun Muster, gefunden ${muster.length}.`)

  const treffer = (eingabe: string) => {
    const t = muster.find(([, p]) => new RegExp(p, 'i').test(eingabe.trim().toLowerCase()))
    return t ? t[0] : null
  }
  assert.equal(treffer('fertig'), 'set_complete', '„fertig" muss den Satz abschliessen')
  assert.equal(treffer('117.5 kilo'), 'log_weight', 'Gewicht muss erkannt werden')
  assert.equal(treffer('11 reps'), 'log_reps', 'Wiederholungen muessen erkannt werden')
  assert.equal(treffer('rpe 8'), 'log_rpe', 'RPE muss erkannt werden')
  assert.equal(treffer('war schwer'), 'log_rpe', 'Die deutsche Umschreibung muss greifen')
  assert.equal(treffer('weiter'), 'next_exercise', '„weiter" muss weiterschalten')
  assert.equal(treffer('banane'), null, 'Unbekanntes darf nichts ausloesen')
})

// ── Medical · das Mockup an den Daten (G-46, G-60) ───────────────────
//
// `[read]` SEIT G-60 ist `befund-tabelle.tsx` weg. Der Auftrag: *„Die
// zwei gebauten Listen verschwinden."* An ihre Stelle tritt
// `marker-liste.tsx` — dieselben Pruefungen, dieselbe Grenze, aber in
// der Form der Attrappe: eine Zeile je Marker statt je Messung.

const MED_LISTE = path.join(process.cwd(), 'src/app/v2/medical/marker-liste.tsx')
const MED_MODAL = path.join(process.cwd(), 'src/app/v2/medical/marker-modal.tsx')
const MED_KATALOG = path.join(process.cwd(), 'src/app/v2/medical/katalog-suche.tsx')
const MED_LESEN = path.join(process.cwd(), 'src/lib/medical/lesen.ts')
const MED_LOGIK = path.join(process.cwd(), 'src/lib/medical/befund.ts')
const MED_REIHE = path.join(process.cwd(), 'src/lib/medical/reihe.ts')

test('die angebundenen Medical-Kacheln tragen keine Marke mehr', () => {
  // `[read]` Der Auftrag G-46: „Was angebunden ist, verliert die Marke.
  // Alles andere behaelt sie."
  //
  // Diese Pruefung ist das Gegenstueck zur Zaehlung darueber: dort wird
  // gezaehlt, was BLEIBT, hier wird festgehalten, was GEHT. Ohne sie
  // koennte jemand die Marke versehentlich wieder anbringen, und die
  // Zaehlung oben faende das gut, solange die Summe stimmt.
  // `[cmd]` SEIT G-60 sind es vier statt zwei: dazu kamen die
  // Markerliste, ihr Modal und die Zuordnungskachel des Import-Tabs.
  for (const datei of [
    MED_LISTE, MED_MODAL, MED_KATALOG,
    path.join(process.cwd(), 'src/app/v2/medical/import-zuordnung.tsx'),
  ]) {
    const quelle = fs.readFileSync(datei, 'utf8')
    const karten = (quelle.match(/<Card\b/g) ?? []).length
    assert.ok(karten > 0, `${path.basename(datei)}: keine Karte gefunden.`)
    assert.ok(!/attrappe=/.test(quelle),
      `${path.basename(datei)}: traegt eine Attrappenmarke, ist aber angebunden.`)
  }
})

test('die Medical-Anzeige bewertet nicht, sie verortet', () => {
  // `[read]` Der Auftrag: „Ob ein Wert gut ist, ist eine medizinische
  // Aussage. Die Anzeige sagt, wo er liegt — im Bereich, darueber,
  // darunter — nicht, was er bedeutet und schon gar nicht, was jemand
  // tun soll."
  //
  // `[cmd]` Die Attrappe fuehrte `Optimal`, `Critical low` und
  // `Critical high` (daten.ts:33-40). In den angebundenen Dateien
  // duerfen diese Urteile nicht vorkommen — dieselbe Grenze wie bei
  // C-49 und GO-14.
  const ohneKommentar = (s: string) => s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*\/\//.test(z)).join('\n')

  // `[cmd]` „Optimalband" ist KEIN Urteil, sondern der Name des
  // Bereichstyps aus dem Schema (`range_type = 'optimal'`,
  // `140_medical_schema.sql:99`). Der Urteilsfall waere „Optimal" als
  // Lage eines Werts — also allein stehend. Eine reine Textsuche nach
  // „Optimal" trifft beides und meldet die Spaltenueberschrift als
  // Verstoss; sie ist deshalb auf das allein stehende Wort begrenzt.
  // `[cmd]` SEIT G-60 auch fuer `marker-liste.tsx`, `marker-modal.tsx`
  // und `reihe.ts` — die drei Dateien, die die Form der Attrappe
  // tragen. Genau dort ist die Versuchung am groessten, ihre Woerter
  // gleich mitzunehmen.
  //
  // `[read]` Tom zu G-60: *„Die Attrappe zeigt `Optimal`, `High`, `Low`
  // — das sind Lagebezeichnungen, keine Urteile, solange sie sagen, WO
  // ein Wert liegt. Pruef, ob die Mockup-Begriffe dasselbe leisten."*
  // `In range` / `Above range` / `Below range` leisten es; `Optimal`
  // nicht — es benennt keine Lage, sondern spricht ein Guetesiegel aus,
  // und die Attrappe fuehrt dazu `Critical low`/`Critical high`.
  //
  // Ausgenommen bleibt `Optimal range`/`optimal band` als NAME des
  // Bereichstyps aus dem Schema (`range_type = 'optimal'`) — deshalb
  // ist das Muster auf das allein stehende Wort begrenzt.
  for (const datei of [MED_LISTE, MED_MODAL, MED_REIHE, MED_LOGIK]) {
    const quelle = ohneKommentar(fs.readFileSync(datei, 'utf8'))
      // `Optimal range` und `optimal band` sind Bereichsnamen, keine Lagen.
      .replace(/Optimal range|optimal band|optimal:/g, '')
    for (const urteil of [/critical_low/, /critical_high/, /\bCritical\b/, /\bOptimal\b/]) {
      assert.ok(!urteil.test(quelle),
        `${path.basename(datei)}: ${urteil.source} ist ein Urteil, keine Lage.`)
    }
  }

  // Und die Lagen selbst stehen da.
  const logik = fs.readFileSync(MED_LOGIK, 'utf8')
  for (const lage of ['im_bereich', 'darueber', 'darunter', 'unbekannt']) {
    assert.ok(logik.includes(`'${lage}'`), `Die Lage "${lage}" fehlt.`)
  }
})

test('der Befundbereich schlaegt den Katalogbereich', () => {
  // `[read]` Der Auftrag: „Der Befundbereich gewinnt. Jedes Labor fuehrt
  // eigene Bereiche, und sie stehen auf dem Ausdruck. Der
  // Katalogbereich ist der Rueckfall."
  //
  // `[cmd]` Die Vorrangregel steht in SQL
  // (`140_medical_schema.sql:240-252`, `COALESCE(v.lab_reference_*,
  // rr.*)`) und liefert `reference_source` mit. Der Lesepfad darf sie
  // NICHT ein zweites Mal entscheiden — sonst gaebe es zwei Wahrheiten,
  // die auseinanderlaufen koennen.
  const lesen = fs.readFileSync(MED_LESEN, 'utf8')
  assert.ok(/lab_result_values_read/.test(lesen),
    'Der Lesepfad ruft die Lesefunktion nicht auf.')
  assert.ok(!/COALESCE|coalesce/.test(lesen),
    'Der Lesepfad baut den Bereichsvorrang nach, statt ihn zu benutzen.')

  // Und die Faltung entscheidet ihn auch nicht neu: sie ruft
  // `gueltigerBereich` auf, statt `reference_low`/`reference_high`
  // selbst gegen den Katalog abzuwaegen.
  const reihe = fs.readFileSync(MED_REIHE, 'utf8')
  assert.ok(/gueltigerBereich/.test(reihe),
    'Die Faltung benutzt die Vorrangregel nicht.')
  assert.ok(!/COALESCE|coalesce/.test(reihe),
    'Die Faltung baut den Bereichsvorrang nach, statt ihn zu benutzen.')
})

test('der Katalog wird durchsucht, nicht geladen', () => {
  // `[read]` Der Auftrag: „Der Katalog ist die groesste Tabelle im Repo
  // nach `food_nutrients` — die Anzeige muss suchen, nicht laden."
  //
  // `[cmd]` 11.676 Zeilen. Wer sie ohne `limit` holt, merkt es auf einer
  // schnellen Maschine mit warmem Cache nicht — und auf einem Telefon
  // im Zug schon.
  const lesen = fs.readFileSync(MED_LESEN, 'utf8')
  const suche = /export async function sucheKatalog[\s\S]*?\n\}/.exec(lesen)
  assert.ok(suche, 'sucheKatalog nicht gefunden.')
  assert.ok(/\.limit\(/.test(suche![0]),
    'Die Katalogsuche hat keine Begrenzung — sie wuerde 11.676 Zeilen holen.')
  assert.ok(/common_test_rank/.test(suche![0]),
    'Ohne Sortierung nach Rang sind die 25 Treffer beliebig.')
})

test('ein unbekannter Marker verschwindet nicht', () => {
  // `[read]` Tom: „Wenn Daten importiert werden und wir die nicht in der
  // DB haben, kommt nichts." — der Marker steht trotzdem da, mit seinem
  // Rohtext.
  //
  // `[cmd]` Live belegt an den Testdaten: „Unbekannter Marker X",
  // 42 U/L, ohne LOINC, Confidence 0,00. Die Zeile muss in der Anzeige
  // ankommen; ein Filter, der sie wegliesse, waere ein Datenverlust,
  // den niemand bemerkt.
  const logik = fs.readFileSync(MED_LOGIK, 'utf8')
  const zuo = /export function zuordnung[\s\S]*?\n\}/.exec(logik)
  assert.ok(zuo, 'zuordnung() nicht gefunden.')
  assert.ok(!/return null/.test(zuo![0]),
    'zuordnung() gibt null zurueck — eine Zeile ohne Zuordnung faellt dann weg.')

  // `[cmd]` Die Faltung gruppiert nach LOINC — und faellt auf den
  // Namen zurueck, wenn keiner da ist. OHNE diesen Rueckfall lagen die
  // zwei codelosen Werte („Glucose [Mass/volume]…" und „Unbekannter
  // Marker X") in einem gemeinsamen `null`-Topf und erschienen als EIN
  // Marker mit zwei Namen — ein Datenverlust, den niemand bemerkt.
  const reihe = fs.readFileSync(MED_REIHE, 'utf8')
  assert.ok(/loinc_code \?\? `name:/.test(reihe),
    'Die Faltung hat keinen Rueckfall auf den Namen — codelose Marker fielen zusammen.')

  const liste = fs.readFileSync(MED_LISTE, 'utf8')
  assert.ok(/r\.name/.test(liste),
    'Der Rohtext des Markers wird nicht angezeigt.')

  // `[cmd]` Kein Filter der ANGEZEIGTEN Liste darf nach LOINC
  // aussortieren. Geprueft wird die Filterkette von `const liste =`
  // — nicht die ganze Datei: `reihen.filter(r => !r.loinc_code).length`
  // ZAEHLT die unzugeordneten Marker fuer den Hinweis darunter, es
  // entfernt sie nicht. Eine Textsuche ueber die Datei traefe beides.
  const kette = /const liste = reihen[\s\S]*?\n\n/.exec(liste)
  assert.ok(kette, 'Die Filterkette der Liste nicht gefunden.')
  assert.ok(!/loinc_code\)/.test(kette![0].replace(/r\.loinc_code \?\? ''/g, '')),
    'Die Anzeige filtert nach LOINC — unbekannte Marker verschwaenden.')

  // Und der Hinweis nennt sie, statt sie zu verschweigen.
  assert.ok(/keinem Katalogeintrag zugeordnet/.test(liste),
    'Die Anzeige sagt nicht, dass unzugeordnete Marker Rohtext sind.')
})

test('Medical zeigt EINE Liste, nicht drei', () => {
  // `[read]` Der Auftrag G-60: *„Drei Listen untereinander: 140 Werte
  // als Flachliste · 11.676 Katalogeintraege · die Attrappe — und nur
  // die letzte zeigt, wie es aussehen soll. Die zwei gebauten Listen
  // verschwinden."*
  //
  // `[cmd]` Diese Pruefung ist das Gedaechtnis dieser Entscheidung:
  // ohne sie kaeme beim naechsten Auftrag wieder eine Tabelle daneben,
  // und die Begruendung dafuer stuende nirgends.
  assert.ok(!fs.existsSync(path.join(process.cwd(), 'src/app/v2/medical/befund-tabelle.tsx')),
    'befund-tabelle.tsx ist zurueck — die Flachliste war der Fehler von G-46.')

  const tab = fs.readFileSync(path.join(process.cwd(), 'src/app/v2/medical/tab-biomarker.tsx'), 'utf8')
  const tab2 = /export function MedBiomarkers[\s\S]*?\n\}/.exec(tab)
  assert.ok(tab2, 'MedBiomarkers nicht gefunden.')
  assert.ok(!/<table/.test(tab2![0]),
    'Der Biomarker-Tab traegt wieder eine eigene Tabelle — es gibt genau eine Liste.')
  // Der Entwurfskatalog mit den 48 erfundenen Markern ist weg.
  assert.ok(!/BIOMARKERS/.test(tab2![0]),
    'Der Biomarker-Tab greift wieder auf die 48 erfundenen Marker zu.')
})

test('die Marker-Liste traegt die Form der Attrappe', () => {
  // `[read]` Der Auftrag: *„Das Mockup ist die Vorgabe. Was es zeigt,
  // bleibt — Panels, Filter, Verlauf, Balken, Popups."*
  //
  // `[cmd]` Gezaehlt wird nach Merkmalen, nicht nach Zeilen: dieselbe
  // Regel wie bei `vollstaendigkeit.mjs`. Wer eine Spalte still
  // weglaesst, faellt hier auf.
  const liste = fs.readFileSync(MED_LISTE, 'utf8')
  for (const [merkmal, muster] of [
    ['Panelfilter', /aria-pressed=\{klasse === k\.id\}/],
    ['Suchfeld', /Search \$\{reihen\.length\} biomarkers/],
    ['Non-optimal only', /Non-optimal only/],
    ['Bereichsbalken', /Bereichsbalken/],
    ['Sparkline', /<Sparkline/],
    ['Verlauf', /trendProzent/],
    ['klickbare Zeile', /onClick=\{\(\) => open\(\{ typ: 'markerReihe'/],
  ] as Array<[string, RegExp]>) {
    assert.ok(muster.test(liste), `Die Liste fuehrt "${merkmal}" nicht mehr.`)
  }

  // `[cmd]` Tom: *„Wir haben die Daten fuer diese Evidence nicht, also
  // weg."* — und `match_status` gehoert in den Import-Tab.
  const ohneKommentar = liste
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter(z => !/^\s*\/\//.test(z)).join('\n')
  assert.ok(!/\bev\b|evidence/i.test(ohneKommentar),
    'Die Liste zeigt einen Evidenzgrad — die Daten fuehren ihn nicht.')
  assert.ok(!/match_status|match_candidates/.test(ohneKommentar),
    'Die Liste zeigt match_status — der gehoert in den Import-Tab.')

  // Und dort steht er.
  const imp = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/medical/import-zuordnung.tsx'), 'utf8')
  assert.ok(/match_status/.test(imp) && /match_candidates/.test(imp),
    'Der Import-Tab zeigt die Zuordnung nicht.')
})

test('der Verlauf rechnet ueber gemessene Punkte, nicht ueber erfundene', () => {
  // `[cmd]` Die Attrappe rechnet eine Regression ueber SECHS erfundene
  // Punkte und beschriftet sie `Q1 25`…`Q2 26` (`daten.ts`,
  // `calcBiomarkerTrend`). Die Daten fuehren vier bis fuenf echte
  // Messungen zwischen 2026-02-18 und 2026-08-19.
  const reihe = fs.readFileSync(MED_REIHE, 'utf8')
  const trend = /export function trendProzent[\s\S]*?\n\}/.exec(reihe)
  assert.ok(trend, 'trendProzent nicht gefunden.')
  assert.ok(/zahlen\.length < 2/.test(trend![0]),
    'Ein Trend aus einem Punkt ist keiner — die Untergrenze fehlt.')
  assert.ok(/erst === 0/.test(trend![0]),
    'Bei Ausgangswert 0 ist die relative Aenderung nicht definiert.')

  // Kein hartkodiertes Quartalsraster aus der Attrappe.
  const modal = fs.readFileSync(MED_MODAL, 'utf8')
  assert.ok(!/'Q1 25'|Q1 26/.test(modal),
    'Das Modal beschriftet erfundene Quartale statt der echten Befunddaten.')
  assert.ok(/m\.datum/.test(modal),
    'Die Kurve beschriftet die Achse nicht mit den Befunddaten.')
})

test('die Lagerechnung stimmt an den Raendern', () => {
  // Reine Rechnung, ohne Datenbank — deshalb hier pruefbar.
  //
  // `[cmd]` Der belegte Fall aus dem Auftrag: Glucose 102 bei
  // Laborgrenze 70–99 liegt darueber; im Optimalband 70–85 erst recht.
  // Und: eine offene Grenze ist kein Ausschluss — `<5,7 %` sagt ueber
  // die Unterseite nichts.
  const logik = fs.readFileSync(MED_LOGIK, 'utf8')

  // Die Reihenfolge der Pruefungen ist wesentlich: erst `high`, dann
  // `low`, sonst meldet ein Bereich mit nur `low` alles als darunter.
  const lage = /export function lageImBereich[\s\S]*?\n\}/.exec(logik)
  assert.ok(lage, 'lageImBereich nicht gefunden.')
  const rumpf = lage![0]
  assert.ok(rumpf.indexOf('high != null') < rumpf.indexOf('low != null'),
    'Die Grenzpruefungen stehen in der falschen Reihenfolge.')
  assert.ok(/return 'unbekannt'/.test(rumpf),
    'Ohne Bereich muss die Lage `unbekannt` sein, nicht `im_bereich`.')

  // Der Textzerleger kennt die drei Schreibweisen des Bestands.
  const text = /export function bereichAusText[\s\S]*?\n\}/.exec(logik)
  assert.ok(text, 'bereichAusText nicht gefunden.')
  assert.ok(/–—-/.test(text![0]) || /\[.*–.*\]/.test(text![0]),
    'Der Halbgeviertstrich fehlt — 410 Bereichstexte benutzen ihn.')
})
