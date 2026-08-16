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
const DASHBOARD = path.join(process.cwd(), 'src/app/v2/dashboard.tsx')
const NUTRITION = path.join(process.cwd(), 'src/app/v2/nutrition/ansicht.tsx')

/** Die zwoelf Kacheln der Vorlage (theme-v1/module-dashboard.jsx). */
const VORLAGE_DASHBOARD = [
  'Recovery', 'Training Load', 'Kalorien', 'Schlaf · zuletzt',
  'Tagesablauf', 'Makros · heute', 'Aktivitaet',
  'Readiness', 'Body battery', 'Tonight', 'PR watch',
]

/** Welche davon eine echte Datenquelle haben. Waechst mit den Modulen. */
const ECHT_DASHBOARD = ['Kalorien', 'Makros · heute']

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
  // `attrappe={...}` an Karten plus die drei KPI-Rahmen mit v2-attrappe.
  const anKarten = (quelle.match(/attrappe=\{/g) ?? []).length
  const anKpis = (quelle.match(/v2-card v2-attrappe/g) ?? []).length
  const markiert = anKarten + anKpis
  const erwartet = VORLAGE_DASHBOARD.length - ECHT_DASHBOARD.length

  assert.equal(markiert, erwartet,
    `${erwartet} Kacheln der Vorlage haben keine Datenquelle, aber ${markiert} ` +
    'sind gekennzeichnet. Verdrahtet? Dann ECHT_DASHBOARD ergaenzen.')
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

test('die drei Begleitkarten des Diary stehen da', () => {
  const quelle = fs.readFileSync(NUTRITION, 'utf8')
  for (const karte of ['Smart suggestions', 'Nutrition score', 'Pending actions']) {
    assert.ok(quelle.includes(karte), `Die Karte "${karte}" fehlt.`)
  }
})

test('der Nutrition score erfindet keinen Wert', () => {
  const quelle = fs.readFileSync(NUTRITION, 'utf8')
  // [read] Der Auftrag: "Als Attrappe zeigen, keinen Wert erfinden."
  // Der Entwurf zeigt dort eine 1 bei Schwelle "ok >= 80". Wer sie
  // uebernimmt, zeigt eine erfundene Messung.
  const abschnitt = quelle.slice(quelle.indexOf('Nutrition score'))
  const ring = abschnitt.slice(0, abschnitt.indexOf('</Card>'))
  assert.ok(/value=\{0\}/.test(ring),
    'Der Ring des Nutrition score muss auf 0 stehen, solange C-49 offen ist.')
  assert.ok(/label="—"/.test(ring),
    'Die Beschriftung muss "—" sein, keine Zahl.')
})
