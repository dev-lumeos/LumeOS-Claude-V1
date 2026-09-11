// G-389 — der Schreibweg fuer Injektionen.
//
// ══ DER BEFUND ═════════════════════════════════════════════════════
//
// `[cmd]` **`medical.injection_logs`: 0 Zeilen, und NIEMAND schrieb
// hinein.** Der Knopf existierte seit G-45, das Fenster zeigte neun
// Felder — **und der Speichern-Knopf war ein `InEntwicklungKnopf`.**
//
// `[read]` **Dieselbe Klasse dreimal an einem Tag:** `logPhoto`
// (Modal ohne Ausloeser, G-421), `messungAnlegenAktion` (Funktion
// ohne Aufrufer), `logInjection` (Modal ohne Schreibweg).
//
// ══ MIT EINER KLICKPROBE BELEGT ════════════════════════════════════
//
//     vorher   injection_logs  0 Zeilen
//     Klick    Compound, Notes, Speichern
//     nachher  1 Zeile: gluteal | im | 21G | 1.50 | Schmerz 1
//     Karte    „Noch keine Injektion erfasst" ist WEG
//     Zeile geloescht -> der Satz ist wieder da
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { pruefeInjektion } from '../injektion-write'
import {
  INJEKTIONSWEGE_LOG, INJEKTIONSWEGE_KONFIG, KOMPLIKATIONEN,
  wegFuerProtokoll, wegFuerKonfig,
} from '../injektion-vokabular'

const HIER = dirname(fileURLToPath(import.meta.url))
const WEB = join(HIER, '..', '..', '..')
const SUPP = join(WEB, 'app', 'v2', 'supplements')

const ohneKommentar = (p: string) => readFileSync(p, 'utf8').split('\n')
  .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
  .join('\n')

/** Eine Eingabe, die durchgehen muss. */
const gut = () => ({
  body_area_code: 'gluteal',
  datum: '2026-09-11',
  uhrzeit: '07:15',
  ort_id: 'glute_l',
  route: 'im' as const,
  substanz_name: 'Testosterone Cypionate',
  substance_id: '',
  volume_ml: '0.6',
  dose_amount: '150',
  dose_unit: 'mg',
  needle_gauge: '21G',
  needle_length_in: '1.5',
  pain_score: '1',
  komplikationen: [],
  notes: '',
})

// ══ DIE WERTE KOMMEN AUS DEM CHECK ═════════════════════════════════

test('injection_logs.route kennt nur im und sc', () => {
  // `[cmd]` **`injection_logs_route_check`, gemessen gegen
  // `pg_constraint`:** `route = ANY (ARRAY['im','sc'])`.
  //
  // `[read]` **Eine Auswahlliste ist eine Zusage** — steht hier ein
  // dritter Wert, weist die Datenbank ab.
  assert.deepEqual([...INJEKTIONSWEGE_LOG].sort(), ['im', 'sc'])
})

test('ZWEI Vokabulare fuer denselben Weg — die Umrechnung stimmt', () => {
  // `[cmd]` **Gemessen: `injection_logs.route` erlaubt `im | sc`,
  // `user_injection_site_selections.route` erlaubt
  // `injection_im | injection_subq`** (G-423).
  //
  // `[read]` **Wer die eine Schreibweise in die andere Spalte
  // schreibt, bekommt einen CHECK-Fehler.**
  assert.deepEqual([...INJEKTIONSWEGE_KONFIG].sort(),
    ['injection_im', 'injection_subq'])
  assert.equal(wegFuerProtokoll('injection_im'), 'im')
  assert.equal(wegFuerProtokoll('injection_subq'), 'sc')
  assert.equal(wegFuerKonfig('im'), 'injection_im')
  assert.equal(wegFuerKonfig('sc'), 'injection_subq')
  // `[read]` **Hin und zurueck muss dasselbe ergeben** — sonst
  // verliert die Vorbelegung aus G-423 unterwegs ihren Weg.
  for (const w of INJEKTIONSWEGE_LOG) {
    assert.equal(wegFuerProtokoll(wegFuerKonfig(w)), w)
  }
})

test('die sieben Komplikationen stammen aus dem CHECK', () => {
  assert.deepEqual([...KOMPLIKATIONEN].sort(), [
    'bleeding', 'leakage', 'lump', 'nerve_sensation',
    'none', 'redness', 'swelling',
  ])
})

// ══ DIE PRUEFUNG ═══════════════════════════════════════════════════

test('ein gueltiger Satz kommt durch', () => {
  // `[read]` **Die Gegenprobe zu allen Abweisungen** — eine Pruefung,
  // die alles abweist, misst nichts.
  assert.deepEqual(pruefeInjektion(gut()), [])
})

test('ohne Koerperflaeche kein Schreibvorgang', () => {
  // `[cmd]` **`body_area_code` ist NOT NULL** — ohne sie weist die
  // Datenbank ab, und die Meldung gehoert ans Feld.
  const f = pruefeInjektion({ ...gut(), body_area_code: '' })
  assert.ok(f.some(x => x.feld === 'body_area_code'))
})

test('der Schmerzwert liegt zwischen 0 und 3', () => {
  // `[cmd]` **`pain_score >= 0 AND <= 3`.**
  assert.ok(pruefeInjektion({ ...gut(), pain_score: '4' })
    .some(x => x.feld === 'pain_score'))
  assert.ok(pruefeInjektion({ ...gut(), pain_score: '-1' })
    .some(x => x.feld === 'pain_score'))
  // Und die Gegenprobe: 0 und 3 gehen.
  assert.deepEqual(pruefeInjektion({ ...gut(), pain_score: '0' }), [])
  assert.deepEqual(pruefeInjektion({ ...gut(), pain_score: '3' }), [])
})

test('ein Volumen von 0 wird abgewiesen, ein leeres nicht', () => {
  // `[cmd]` **CHECK: `volume_ml IS NULL OR > 0`.**
  // `[read]` **Leer heisst „nicht angegeben"**, und die Spalte ist
  // nullable — das ist etwas anderes als null Milliliter.
  assert.ok(pruefeInjektion({ ...gut(), volume_ml: '0' })
    .some(x => x.feld === 'volume_ml'))
  assert.deepEqual(pruefeInjektion({ ...gut(), volume_ml: '' }), [])
})

test('ein unbekannter Weg wird abgewiesen', () => {
  const f = pruefeInjektion({
    ...gut(), route: 'injection_im' as unknown as 'im',
  })
  assert.ok(f.some(x => x.feld === 'route'),
    'Die Konfigurationsschreibweise darf nicht in injection_logs')
})

test('eine unbekannte Komplikation wird abgewiesen', () => {
  const f = pruefeInjektion({
    ...gut(), komplikationen: ['gibtesnicht' as never],
  })
  assert.ok(f.some(x => x.feld === 'complication'))
})

// ══ DER WEG IST ANGEBUNDEN ═════════════════════════════════════════

test('der Schreibweg prueft auf null Zeilen', () => {
  // `[cmd]` **G-79: PostgREST meldet `ok`, wenn der Zeilenschutz
  // leergefiltert hat.**
  const w = ohneKommentar(join(WEB, 'lib', 'medical', 'injektion-write.ts'))
  assert.match(w, /zeilen\.length === 0/,
    'Die Nullzeilenpruefung fehlt — ein leerer Schreibvorgang saehe wie Erfolg aus')
  // `[read]` **Die Kennung kommt aus der SITZUNG**, nie aus der
  // Anfrage.
  assert.match(w, /user_id: userId/)
  assert.ok(!/service/i.test(w), 'Kein Service-Client in einem Nutzerschreibweg')
})

test('das Fenster speichert wirklich, statt In-Entwicklung zu zeigen', () => {
  // `[cmd]` **Hier stand ein `InEntwicklungKnopf`** mit dem Grund
  // *„ohne Schema"* — die Tabelle gibt es seit C-429.
  const m = ohneKommentar(join(SUPP, 'modale.tsx'))
  assert.match(m, /injektionAnlegenAktion\(/,
    'Das Fenster ruft den Schreibweg nicht')
  // `[read]` **Und die SPERRE bleibt** — sie ist der Kern des
  // Fensters: ueber der Ortsgrenze oder im Ruhefenster wird nicht
  // gespeichert.
  assert.match(m, /disabled=\{gesperrt \|\| laeuft\}/,
    'Die Validierungssperre ist weg')
})

test('A3: die Nadel kommt aus der Konfiguration, wenn es eine gibt', () => {
  // `[cmd]` **Am Schirm gemessen:** ohne Konfiguration steht
  // `23G × 1.25"` (Entwurf), mit Konfiguration `21G × 1.5"` und die
  // Beschriftung wechselt auf „konfiguriert".
  const m = ohneKommentar(join(SUPP, 'modale.tsx'))
  assert.match(m, /konfiguriert \? 'konfiguriert' : 'recommended'/,
    'Die Herkunft der Nadel steht nicht dran')
  assert.match(m, /k\.body_area_code === flaeche && k\.route === wegKonfig/,
    'Die Konfiguration wird nicht nach Flaeche UND Weg gesucht')
  // `[read]` **Wer von Hand tippt, behaelt seinen Wert** — sonst
  // ueberschriebe ein Ortswechsel die Eingabe.
  assert.match(m, /if \(nadelBeruehrt\) return/,
    'Die Vorbelegung ueberschreibt die Handeingabe')
})

test('die Konstanten liegen serverfrei', () => {
  // `[cmd]` **Die Lehre aus C-468: HTTP 500 auf JEDER Seite**, weil
  // eine `'use client'`-Kachel eine Konstante aus einem Servermodul
  // holte. **`tsc` blieb dabei gruen.**
  // `[read]` **Kommentarzeilen WEG, bevor gesucht wird** - beide
  // Dateien ERKLAEREN die Gefahr, und der erste Anlauf dieser Probe
  // fand genau die Erklaerung. **Gesucht wird die IMPORT-Zeile.**
  const v = ohneKommentar(join(WEB, 'lib', 'medical', 'injektion-vokabular.ts'))
  assert.ok(!/^\s*import .*(createSessionClient|next\/headers)/m.test(v),
    'Das Vokabular zieht Serverimporte in den Browser')
  const m = ohneKommentar(join(SUPP, 'modale.tsx'))
  assert.ok(!/^\s*import .*lib\/medical\/injektion-write/m.test(m),
    'Das Fenster importiert den Schreibweg direkt statt die Serveraktion')
  // `[read]` **Und die Serveraktion IST der Weg** - sonst waere die
  // Probe nur ein Verbot ohne Gegenstueck.
  assert.match(m, /^\s*import \{ injektionAnlegenAktion \} from '\.\/injektion-aktionen'/m,
    'Die Serveraktion wird nicht importiert')
})
