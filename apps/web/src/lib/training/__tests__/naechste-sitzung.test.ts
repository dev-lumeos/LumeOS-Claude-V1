// G-262 (Pre-workout), G-263 (Smart suggestions), G-277 (Coaches).
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  lageVon, abstandSatz, LAGE_SATZ, type NaechsteSitzung,
} from '../naechste-sitzung'
import { URTEIL } from '../../nutrition/vorschlags-lage'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const JETZT = new Date('2026-08-30T15:00:00')

const sitzung = (t: Partial<NaechsteSitzung> = {}): NaechsteSitzung => ({
  datum: '2026-08-30', startzeit: '17:30', name: 'Legs 6', ...t,
})

// ══ G-262 ══════════════════════════════════════════════════════════

test('G-262: geplant, ohne Uhrzeit und gar nichts sind drei Faelle', () => {
  // `[read]` **Dieselbe Dreiteilung wie C-48, G-239, G-251.** „Keine
  // Einheit geplant" ist etwas anderes als „geplant, ohne Uhrzeit".
  // **Wer beides zusammenwirft, zeigt im zweiten Fall nichts und
  // behauptet damit, es sei kein Training vorgesehen.**
  assert.equal(lageVon(sitzung()), 'geplant')
  assert.equal(lageVon(sitzung({ startzeit: null })), 'ohne_zeit')
  assert.equal(lageVon(null), 'keine')
  assert.notEqual(LAGE_SATZ.ohne_zeit, LAGE_SATZ.keine,
    'Beide Leerzustaende sagen dasselbe — dann tragen sie nichts bei (G-262).')
  assert.equal(LAGE_SATZ.geplant, '', 'Mit Zeit braucht es keinen Satz.')
})

test('G-262: der Abstand rechnet in beide Richtungen', () => {
  assert.equal(abstandSatz(sitzung(), JETZT), 'in 2 h 30 min')
  assert.equal(abstandSatz(sitzung({ startzeit: '15:20' }), JETZT), 'in 20 min')
  assert.equal(abstandSatz(sitzung({ startzeit: '14:00' }), JETZT), 'liegt zurück')
  assert.equal(abstandSatz(sitzung({ startzeit: null }), JETZT), '')
  // Eine kaputte Zeit ergibt keinen Satz, keinen NaN-Text.
  assert.equal(abstandSatz(sitzung({ startzeit: 'xx:yy' }), JETZT), '')
})

test('G-262: nur `planned`, nie `completed` oder `cancelled`', () => {
  // `[read]` **Eine abgeschlossene Einheit liegt hinter einem, eine
  // abgesagte findet nicht statt.** `[cmd]` dev hat 15 `completed` und
  // 1 `cancelled` — ein Fenster darauf waere eine Falschaussage.
  const s = ohneKommentare('src/lib/training/naechste-sitzung.ts')
  assert.match(s, /\.eq\('status', 'planned'\)/,
    'Der Leseweg filtert nicht mehr auf `planned` (G-262).')
  assert.match(s, /\.gte\('session_date', abDatum\)/,
    'Der Leseweg holt auch vergangene Einheiten (G-262).')
})

test('G-262: die Kachel gibt keine Empfehlung aus', () => {
  // `[cmd]` **C-108/F-02, ausdruecklich in C-113:** keine
  // Dosierungsempfehlung, kein Kombinationsvorschlag.
  //
  // `[read]` **Die Wirkung pruefen, nicht das Wort:** die Attrappe trug
  // einen Score, eine Essenszeit, Makrovorgaben und drei
  // Mahlzeitenkombinationen. **Keines davon darf zurueckkommen.**
  const s = ohneKommentare('src/app/v2/nutrition/pre-workout-echt.tsx')
  for (const [was, muster] of [
    ['ein Score', /\b68\b|optimal/],
    ['eine Essenszeit', /Eat by|iss bis|essen bis/i],
    ['Makrovorgaben', /Carbs.*\d+\s*g|Protein.*\d+-\d+\s*g/],
    ['Mahlzeitenvorschlaege', /Whey|Basmati|Oatmeal|Banana/i],
  ] as const) {
    assert.doesNotMatch(s, muster,
      `Die Kachel zeigt wieder ${was} — das ist eine Empfehlung (C-108/F-02).`)
  }
  // Und sie sagt, warum sie duenner ist als der Entwurf.
  assert.match(s, /C-108\/F-02/,
    'Ohne den Hinweis baut der naechste Auftrag die Empfehlung nach (G-262).')
})

// ══ G-263 ══════════════════════════════════════════════════════════

test('G-263: die Kachel ist entfernt, nicht abgeschaltet', () => {
  // `[read]` **A-59: was keinen Aufrufer hat, wird geloescht** — sonst
  // gilt es beim naechsten Auftrag als gebaut.
  const entwurf = lies('src/app/v2/nutrition/diary-entwurf.tsx')
  assert.doesNotMatch(entwurf, /export function SmartSuggestionsCard/,
    'Die Attrappe steht noch da (G-263/A-59).')
  const ansicht = ohneKommentare('src/app/v2/nutrition/ansicht.tsx')
  assert.doesNotMatch(ansicht, /<SmartSuggestionsCard/,
    'Die Kachel wird noch gerendert (G-263).')
})

test('G-263: je Vorschlag steht das Urteil mit seiner Messung', () => {
  // `[read]` **Damit niemand dieselbe Frage ein zweites Mal stellt.**
  for (const k of ['wie_gestern', 'top_fruehstueck', 'post_workout', 'samstag'] as const) {
    assert.ok(URTEIL[k].gemessen.length > 20, `${k}: keine Messung genannt.`)
  }
  // `[cmd]` „Same as yesterday" ist gebaut — `wieGestern()`.
  assert.equal(URTEIL.wie_gestern.urteil, 'gebaut_woanders')
  assert.match(ohneKommentare('src/app/v2/nutrition/mahlzeiten.tsx'),
    /async function wieGestern\(\)/,
    'Der Weg, auf den sich G-263 beruft, ist weg — dann gilt das Urteil '
    + 'nicht mehr (A-62).')
  // `[cmd]` Das Samstagsmuster gibt es nicht.
  assert.equal(URTEIL.samstag.urteil, 'kein_muster')
  // `[cmd]` Zwei sind Bewertungen.
  assert.equal(URTEIL.post_workout.urteil, 'bewertung')
  assert.equal(URTEIL.top_fruehstueck.urteil, 'bewertung')
})

// ══ G-277 ══════════════════════════════════════════════════════════

test('G-277: der Coaches-Reiter zeigt echte Beziehungen', () => {
  // `[cmd]` **Gemessen am 2026-08-30:** dev hat EINE aktive Beziehung
  // in `coach.relationships` — der Reiter zeigte VIER erfundene
  // Personen aus `daten.ts`.
  //
  // `[read]` **Die Reiterleiste zaehlte dabei richtig** — Zahl und
  // Liste widersprachen sich auf demselben Schirm. **Die Ursache war
  // ein fehlendes Prop:** `AthleteCoaches` nahm `stand` nicht entgegen
  // und konnte den Entwurf nicht verlassen.
  const s = ohneKommentare('src/app/v2/coach/ansicht.tsx')
  assert.match(s, /function AthleteCoaches\(\{ stand \}/,
    'AthleteCoaches bekommt den Stand nicht — dann bleibt der Entwurf (G-277).')
  assert.match(s, /if \(echt\) return <CoachesEcht stand=\{stand!\} \/>/,
    'Der echte Zweig fehlt (G-277).')
  // `[cmd]` **G-365: die Prufform war zu eng.** Sie verlangte die
  // einzeilige Schreibweise `{tab === 'coaches' && <AthleteCoaches
  // stand={stand} />}`. **Sobald der Reiter eine zweite Komponente
  // bekam** (die Mockup-Referenz unter der Linie), **stand dort ein
  // Fragment — und der Waechter fiel, obwohl der Stand weiter
  // durchgereicht wird.**
  //
  // `[read]` **Geprueft wird jetzt die Sache:** im `coaches`-Zweig
  // steht `<AthleteCoaches` MIT `stand`. Die Zeilenform ist egal.
  const zweig = s.slice(s.indexOf("tab === 'coaches'"))
  const bis = zweig.indexOf("tab === '", 10)
  assert.match(bis > 0 ? zweig.slice(0, bis) : zweig,
    /<AthleteCoaches\s+stand=\{stand\}/,
    'Der Reiter reicht den Stand nicht durch (G-277).')
})

// ══ G-278 ══════════════════════════════════════════════════════════

test('G-278: die tragenden Gruende sind markiert', () => {
  // `[read]` **Der Mittelweg:** nicht alle 194 Aussagen markieren,
  // sondern die, die eine ANZEIGE begruenden — der Satz, den ein
  // Nutzer liest, wenn ein Knopf nichts tut.
  const paare: Array<[string, string]> = [
    ['src/app/v2/medical/modale.tsx', 'medical.biomarker_results'],
    ['src/app/v2/recovery/modale.tsx', 'recovery.hrv_readings'],
    ['src/app/v2/recovery/modale.tsx', 'recovery.protocols'],
    ['src/app/v2/training/modale.tsx', 'training.routines'],
    ['src/app/v2/training/modale.tsx', 'training.blocks'],
  ]
  for (const [datei, ziel] of paare) {
    const s = lies(datei)
    assert.ok(s.includes(`@abwesend ${ziel}`),
      `${datei}: der Grund fuer ${ziel} traegt keine Marke (G-278).`)
  }
})

test('G-278: medical.symptoms wird nicht mehr als fehlend behauptet', () => {
  // `[cmd]` **Gemessen am 2026-08-30:** die Tabelle hat 8 Spalten und
  // 34 Zeilen, und `lib/medical/lesen.ts:431` liest sie bereits.
  // **Der Knopf sagte trotzdem, es gebe sie nicht** — dieselbe Klasse
  // wie G-277.
  const s = lies('src/app/v2/medical/modale.tsx')
  assert.doesNotMatch(s, /Tabelle medical\.symptoms — die gibt es nicht/,
    'Der Grund behauptet weiter, medical.symptoms fehle (G-278/A-62).')
  // Was wirklich fehlt, ist ein Protokoll je Nutzer.
  assert.ok(s.includes('@abwesend medical.symptom_log'),
    'Die Marke zeigt nicht auf das, was tatsaechlich fehlt (G-278).')
})
