// GO-01: die Pruefbedingungen des Profils.
//
// `[read]` Die Datenbank bleibt die letzte Instanz — diese Regeln
// spiegeln ihre CHECK-Constraints, sie ersetzen sie nicht. Geprueft
// wird hier, dass die Spiegelung stimmt und dass ein leeres Feld kein
// Fehler ist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  ACTIVITY_LEVELS,
  ACTIVITY_LEVEL_INFO,
  BIOLOGICAL_SEXES,
  EXPERIENCE_LEVELS,
  NUTRITION_GOALS,
  EMPTY_PROFILE,
  hasReferenceProfile,
  hasTdeeProfile,
  parseStoredProfile,
  profileCompleteness,
  profileWriteSchema,
} from '../profile-model'

// ══ G-501: „leer" heisst nicht mehr „alles leer" ═════════════════
//
// `[cmd]` **Seit C-541 ist `public.profiles.experience_level` NOT
// NULL** — und `handle_new_user` setzt beim Anlegen `'beginner'`.
// **Ein Profil ohne Grad gibt es nicht** (gemessen 2026-09-25: 0
// Zeilen mit NULL).
//
// `[read]` **Deshalb traegt auch das leere Formular einen Grad.**
// `[cmd]` Diese sechs Proben wurden rot, als
// `experience_level` streng wurde — **richtig so:** sie behaupteten
// *,,nichts anzugeben muss erlaubt sein"*, und fuer dieses eine
// Feld stimmt das nicht mehr.
//
// `[read]` **Die uebrigen zehn Felder bleiben leer** — sie sind
// nullable in der Datenbank, und *,,nicht angegeben"* ist dort
// weiterhin ein gueltiger Zustand.
const LEER = {
  birth_date: '', biological_sex: '', height_cm: '', body_weight_kg: '',
  activity_level: '', nutrition_goal: '',
  experience_level: 'beginner',
  pregnancy_started_on: '', pregnancy_ended_on: '',
  lactation_started_on: '', lactation_ended_on: '',
}

// --- Leer ist kein Fehler ----------------------------------------

test('ein komplett leeres Formular ist gueltig', () => {
  const r = profileWriteSchema.safeParse(LEER)
  assert.equal(r.success, true, 'nichts anzugeben muss erlaubt sein')
  if (r.success) {
    assert.equal(r.data.birth_date, null)
    assert.equal(r.data.height_cm, null, 'leer wird null, nicht 0')
  }
})

test('leere Zahl wird null und nicht 0', () => {
  // Der wichtigste Einzelfall: 0 kg waere ein Wert, keine Luecke.
  const r = profileWriteSchema.safeParse({ ...LEER, body_weight_kg: '' })
  assert.equal(r.success, true)
  if (r.success) assert.equal(r.data.body_weight_kg, null)
})

// --- Die Grenzen der Datenbank -----------------------------------

test('Groesse und Gewicht halten sich an die CHECK-Grenzen', () => {
  assert.equal(profileWriteSchema.safeParse({ ...LEER, height_cm: '79' }).success, false)
  assert.equal(profileWriteSchema.safeParse({ ...LEER, height_cm: '261' }).success, false)
  assert.equal(profileWriteSchema.safeParse({ ...LEER, height_cm: '180' }).success, true)

  assert.equal(profileWriteSchema.safeParse({ ...LEER, body_weight_kg: '19' }).success, false)
  assert.equal(profileWriteSchema.safeParse({ ...LEER, body_weight_kg: '401' }).success, false)
  assert.equal(profileWriteSchema.safeParse({ ...LEER, body_weight_kg: '82.5' }).success, true)
})

test('ein Geburtsdatum in der Zukunft wird abgelehnt', () => {
  const morgen = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  assert.equal(profileWriteSchema.safeParse({ ...LEER, birth_date: morgen }).success, false)
  assert.equal(profileWriteSchema.safeParse({ ...LEER, birth_date: '1990-05-17' }).success, true)
})

test('nur die erlaubten Listenwerte gehen durch', () => {
  assert.equal(profileWriteSchema.safeParse({ ...LEER, biological_sex: 'divers' }).success, false)
  assert.equal(profileWriteSchema.safeParse({ ...LEER, activity_level: 'extrem' }).success, false)
  assert.equal(profileWriteSchema.safeParse({ ...LEER, nutrition_goal: 'bulk' }).success, false)

  for (const s of BIOLOGICAL_SEXES) {
    assert.equal(profileWriteSchema.safeParse({ ...LEER, biological_sex: s }).success, true)
  }
  for (const a of ACTIVITY_LEVELS) {
    assert.equal(profileWriteSchema.safeParse({ ...LEER, activity_level: a }).success, true)
  }
  for (const g of NUTRITION_GOALS) {
    assert.equal(profileWriteSchema.safeParse({ ...LEER, nutrition_goal: g }).success, true)
  }
})

// --- Zeitraeume ---------------------------------------------------

test('ein Zeitraum darf nicht rueckwaerts laufen', () => {
  const r = profileWriteSchema.safeParse({
    ...LEER,
    pregnancy_started_on: '2026-05-01',
    pregnancy_ended_on: '2026-04-01',
  })
  assert.equal(r.success, false)
})

test('ein offener Zeitraum ist gueltig', () => {
  // Ende leer heisst: laeuft noch.
  const r = profileWriteSchema.safeParse({ ...LEER, lactation_started_on: '2026-03-01' })
  assert.equal(r.success, true)
})

test('ein Ende ohne Beginn wird abgelehnt', () => {
  // Die Datenbank laesst das durch — ihr CHECK prueft nur die
  // Reihenfolge. Fachlich ist es ein halber Datensatz.
  const r = profileWriteSchema.safeParse({ ...LEER, pregnancy_ended_on: '2026-04-01' })
  assert.equal(r.success, false)
})

// --- Lesen --------------------------------------------------------

test('numeric als String kommt als Zahl an', () => {
  // PostgREST liefert numeric als String.
  const p = parseStoredProfile({ height_cm: '182.5', body_weight_kg: '78.400' })
  assert.equal(p.height_cm, 182.5)
  assert.equal(p.body_weight_kg, 78.4)
})

test('unbekannte Listenwerte aus der Datenbank werden zu null', () => {
  const p = parseStoredProfile({ activity_level: 'unfug', biological_sex: 'x' })
  assert.equal(p.activity_level, null)
  assert.equal(p.biological_sex, null)
})

test('eine fehlende Zeile ergibt ein leeres Profil', () => {
  assert.deepEqual(parseStoredProfile(null), EMPTY_PROFILE)
  assert.deepEqual(parseStoredProfile('kaputt'), EMPTY_PROFILE)
})

// --- Vollstaendigkeit --------------------------------------------

test('die Zeitraeume zaehlen nicht zur Vollstaendigkeit', () => {
  // Sonst bliebe der Balken bei 6 von 10 stehen, weil jemand nicht
  // schwanger ist.
  const p = { ...EMPTY_PROFILE, pregnancy_started_on: '2026-01-01' }
  assert.equal(profileCompleteness(p).gesamt, 6)
  assert.equal(profileCompleteness(p).gesetzt, 0)
})

test('Referenzwerte brauchen Geburtsdatum und Geschlecht', () => {
  // `[cmd]` daily_reference_assessment setzt profile_complete genau so.
  assert.equal(hasReferenceProfile(EMPTY_PROFILE), false)
  assert.equal(hasReferenceProfile({ ...EMPTY_PROFILE, birth_date: '1990-01-01' }), false)
  assert.equal(
    hasReferenceProfile({ ...EMPTY_PROFILE, birth_date: '1990-01-01', biological_sex: 'male' }),
    true,
  )
})

test('die TDEE-Formel braucht fuenf Angaben', () => {
  const fast = {
    ...EMPTY_PROFILE,
    birth_date: '1990-01-01', biological_sex: 'male' as const,
    height_cm: 180, body_weight_kg: 80,
  }
  assert.equal(hasTdeeProfile(fast), false, 'ohne Aktivitaetsstufe fehlt der Faktor')
  assert.equal(hasTdeeProfile({ ...fast, activity_level: 'moderate' }), true)
})

// --- Die Faktoren -------------------------------------------------

test('jede Aktivitaetsstufe hat einen Faktor aus der Spec', () => {
  // `[read]` ACTIVITY_MULTIPLIER aus docs/specs/Goals/SCORING.md.
  const soll: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  }
  for (const stufe of ACTIVITY_LEVELS) {
    assert.equal(ACTIVITY_LEVEL_INFO[stufe].factor, soll[stufe],
      `Faktor fuer ${stufe} weicht von der Spec ab`)
  }
})

// ══════════════════════════════════════════════════════════════════
// G-501 — der Erfahrungsgrad ist aenderbar, nicht loeschbar
// ══════════════════════════════════════════════════════════════════
//
// **Tom (C-541):** *„dieser zustand kann gar nicht sein."*
//
// `[cmd]` **Gemessen am 2026-09-25:** der zweite Klick auf die
// gewaehlte Stufe leerte sie, und `PUT /api/profile` antwortete
// **HTTP 500 · `WRITE_FAILED`** — *„null value in column
// \"experience_level\" … violates not-null constraint"*.
//
// `[read]` **Die Grenze gehoert in den Schreibweg, nicht nur ins
// Formular** — wer die Serveraktion direkt ruft, kommt am Knopf
// vorbei.

test('G-501: ein leerer Erfahrungsgrad wird abgewiesen', () => {
  // `[read]` **Das ist die Sache selbst:** frueher machte
  // `leerZuNull` daraus ein NULL, und die Datenbank warf es zurueck.
  const r = profileWriteSchema.safeParse({ ...LEER, experience_level: '' })
  assert.equal(r.success, false,
    'Ein leerer Erfahrungsgrad muss abgewiesen werden — die Spalte ist '
    + 'seit C-541 NOT NULL, ein NULL ergibt HTTP 500 (G-501).')
})

test('G-501: ein fehlender Erfahrungsgrad wird abgewiesen', () => {
  // Nicht nur der Leerstring — auch das Weglassen.
  const ohne = { ...LEER } as Record<string, unknown>
  delete ohne.experience_level
  assert.equal(profileWriteSchema.safeParse(ohne).success, false,
    'Ohne Erfahrungsgrad darf der Schreibweg nicht durchlassen (G-501).')
})

test('G-501: null wird abgewiesen', () => {
  assert.equal(
    profileWriteSchema.safeParse({ ...LEER, experience_level: null }).success,
    false,
    'null ist genau der Wert, den die Datenbank zurueckweist (G-501).')
})

test('G-501: die vier gueltigen Stufen gehen weiter durch', () => {
  // `[read]` **Die Gegenprobe** — sonst waere „weist alles ab"
  // genauso gruen wie „weist das Richtige ab".
  for (const stufe of EXPERIENCE_LEVELS) {
    const r = profileWriteSchema.safeParse({ ...LEER, experience_level: stufe })
    assert.equal(r.success, true, `Die Stufe "${stufe}" muss durchgehen.`)
    if (r.success) assert.equal(r.data.experience_level, stufe)
  }
})

test('G-501: die UEBRIGEN Felder duerfen weiter leer sein', () => {
  // `[cmd]` **Gemessen 2026-09-25:** von den sieben Feldern mit
  // `leerZuNull` ist NUR `experience_level` NOT NULL. `[read]` **Die
  // anderen sechs behalten ihre Leere** — wer hier zu breit sperrt,
  // nimmt dem Nutzer sechs gueltige Zustaende weg.
  const r = profileWriteSchema.safeParse(LEER)
  assert.equal(r.success, true)
  if (r.success) {
    assert.equal(r.data.biological_sex, null, 'biological_sex darf leer sein')
    assert.equal(r.data.activity_level, null, 'activity_level darf leer sein')
    assert.equal(r.data.nutrition_goal, null, 'nutrition_goal darf leer sein')
    assert.equal(r.data.birth_date, null, 'birth_date darf leer sein')
    assert.equal(r.data.height_cm, null, 'height_cm darf leer sein')
    assert.equal(r.data.body_weight_kg, null, 'body_weight_kg darf leer sein')
  }
})

test('G-501: der Klick im Formular leert nicht mehr', () => {
  // `[read]` **Die zweite Haelfte der Sache** — der Schreibweg
  // sperrt, das Formular darf es gar nicht erst versuchen.
  const quelle = fs.readFileSync(
    path.join(process.cwd(), 'src/app/v2/settings/formular.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  assert.equal(
    /setze\('experience_level',\s*gewaehlt\s*\?\s*''/.test(quelle), false,
    'Der Ruecknahmeklick ist zurueck: `gewaehlt ? \'\' : stufe` schreibt '
    + 'wieder einen Leerstring (G-501).')
  assert.match(quelle, /if \(!gewaehlt\) setze\('experience_level', stufe\)/,
    'Der Klick muss nur UMwaehlen, nicht leeren (G-501).')
})
