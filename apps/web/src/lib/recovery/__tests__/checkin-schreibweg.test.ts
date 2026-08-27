// G-122: Check-in und Erholungsanwendung — Regeln und Naht.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  pruefeCheckin, pruefeModalitaet, STIMMUNGEN, MODALITAETEN, BONUS_OFFEN,
  LEERER_CHECKIN, LEERE_MODALITAET,
  type CheckinEingabe, type ModalitaetEingabe,
} from '../checkin-regeln'

const CHECKIN: CheckinEingabe = {
  ...LEERER_CHECKIN, entry_date: '2026-08-27', mood: 'good',
  sleep_hours: '7.5', sleep_quality: '8', subjective_feeling: '7',
}
const MODAL: ModalitaetEingabe = {
  ...LEERE_MODALITAET, entry_date: '2026-08-27',
  modality_type: 'sauna', duration_min: '20', immediate_effect: '8',
}

// ── Check-in ─────────────────────────────────────────────────────

test('G-122: ein gueltiger Check-in hat keine Fehler', () => {
  assert.deepEqual(pruefeCheckin(CHECKIN), [])
})

test('G-122: die Stimmungen sind die des Schemas', () => {
  // `[cmd]` Aus `checkins_mood_check` gelesen, nicht erfunden.
  assert.deepEqual([...STIMMUNGEN],
    ['motivated', 'good', 'neutral', 'tired', 'sick'])
  assert.deepEqual(
    pruefeCheckin({ ...CHECKIN, mood: 'grossartig' }).map(f => f.feld),
    ['mood'])
})

test('G-122: Schlafstunden 0 bis 14', () => {
  // `[cmd]` `checkins_sleep_hours_check`.
  for (const s of ['-1', '15']) {
    assert.deepEqual(
      pruefeCheckin({ ...CHECKIN, sleep_hours: s }).map(f => f.feld),
      ['sleep_hours'], s)
  }
  assert.deepEqual(pruefeCheckin({ ...CHECKIN, sleep_hours: '14' }), [])
})

test('G-122: die Skalen sind ganze Zahlen von 1 bis 10', () => {
  // `[cmd]` **Sieben Spalten tragen dieselbe Grenze** —
  // sleep_quality, subjective_feeling, energy_level, motivation,
  // stress_level, work_stress, life_stress. `[read]` Eine Funktion,
  // nicht sieben Abschriften.
  for (const wert of ['0', '11', '7.5']) {
    assert.deepEqual(
      pruefeCheckin({ ...CHECKIN, energy_level: wert }).map(f => f.feld),
      ['energy_level'], wert)
  }
})

test('G-122: leere Skalen sind erlaubt', () => {
  // `[read]` **Alle Skalenspalten sind nullable.** Wer nur seine
  // Stimmung eintragen will, soll nicht zehn Regler bedienen muessen.
  assert.deepEqual(pruefeCheckin({
    ...LEERER_CHECKIN, entry_date: '2026-08-27', mood: 'neutral',
  }), [])
})

test('G-122: ohne Datum geht es nicht', () => {
  assert.deepEqual(
    pruefeCheckin({ ...CHECKIN, entry_date: '' }).map(f => f.feld),
    ['entry_date'])
})

// ── Modalitaet ───────────────────────────────────────────────────

test('G-122: eine gueltige Anwendung hat keine Fehler', () => {
  assert.deepEqual(pruefeModalitaet(MODAL), [])
})

test('G-122: die zwoelf Modalitaeten sind die des Schemas', () => {
  // `[cmd]` Aus `modality_log_modality_type_check`.
  assert.equal(MODALITAETEN.length, 12)
  assert.ok((MODALITAETEN as readonly string[]).includes('cold_plunge'))
  assert.deepEqual(
    pruefeModalitaet({ ...MODAL, modality_type: 'eisbaden' }).map(f => f.feld),
    ['modality_type'])
})

test('G-122: die Dauer ist nicht negativ und ganzzahlig', () => {
  for (const d of ['-5', '20.5']) {
    assert.deepEqual(
      pruefeModalitaet({ ...MODAL, duration_min: d }).map(f => f.feld),
      ['duration_min'], d)
  }
})

// ── Der dritte Zustand ───────────────────────────────────────────

test('G-122: der offene Bonus ist benannt', () => {
  // ══ DER DRITTE ZUSTAND DIESER TABELLE ═══════════════════════════
  //
  // `[cmd]` **`bonus_source` hat den Vorgabewert `pending_c124_e5`,
  // `bonus_value` steht auf 0 — bei ALLEN 178 Bestandszeilen**
  // (gemessen 2026-08-27).
  //
  // `[read]` **Die Tabelle sagt selbst, dass ihr Bonus nicht
  // entschieden ist.** Der Satz macht daraus eine Auskunft statt
  // einer stillen Null.
  assert.match(BONUS_OFFEN, /nicht.*entschieden/i)
  assert.match(BONUS_OFFEN, /C-124/)
  assert.match(BONUS_OFFEN, /trotzdem|gespeichert/i)
})

// ── Die Naht ─────────────────────────────────────────────────────

const roh = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
const ohneKommentare = (p: string) => roh(p)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

function alleQuellen(): string[] {
  const aus: string[] = []
  const geh = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) geh(p)
      else if (/\.tsx?$/.test(e.name) && !/__tests__/.test(p)) aus.push(p)
    }
  }
  geh(path.join(process.cwd(), 'src'))
  return aus
}

function schreiberAuf(tabelle: string): string[] {
  const aus: string[] = []
  for (const datei of alleQuellen()) {
    const s = fs.readFileSync(datei, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '')
    if (!new RegExp(`from\\('${tabelle}'\\)`).test(s)) continue
    if (/\.(insert|update|upsert|delete)\(/.test(s)) {
      aus.push(datei.replace(process.cwd(), '').replace(/\\/g, '/'))
    }
  }
  return aus
}

test('G-122: genau EINE Datei schreibt auf `checkins`', () => {
  assert.deepEqual(schreiberAuf('checkins'),
    ['/src/lib/recovery/checkin-write.ts'],
    'Soll: genau eine Schreibstelle (G-122).')
})

test('G-122: genau EINE Datei schreibt auf `modality_log`', () => {
  assert.deepEqual(schreiberAuf('modality_log'),
    ['/src/lib/recovery/checkin-write.ts'],
    'Soll: genau eine Schreibstelle (G-122).')
})

test('G-122: der Check-in ist ein upsert, die Anwendung ein insert', () => {
  // `[cmd]` **`checkins_user_id_entry_date_key` ist eindeutig** — ein
  // Zustand je Tag. `[cmd]` **`modality_log` hat keinen solchen
  // Schluessel**, und 32 Tage im Bestand tragen mehr als eine
  // Anwendung. `[read]` **Man hat einen Zustand pro Tag, kann aber
  // zweimal in die Sauna.**
  const s = ohneKommentare('src/lib/recovery/checkin-write.ts')
  assert.match(s, /from\('checkins'\)\s*\n\s*\.upsert\(/,
    'Der Check-in ist kein upsert — ein zweiter am selben Tag scheitert (G-122).')
  assert.match(s, /onConflict: 'user_id,entry_date'/,
    'Der upsert nennt den Schluessel nicht (G-122).')
  assert.match(s, /from\('modality_log'\)\s*\n\s*\.insert\(/,
    'Die Anwendung ist kein insert (G-122).')
})

test('G-122: `bonus_value` und `bonus_source` werden nie geschrieben', () => {
  // `[read]` **Wer `bonus_value: 0` schriebe, behauptete „geprueft,
  // kein Effekt"** — das ist etwas anderes als „noch nicht
  // entschieden". Derselbe Unterschied wie in G-208.
  // `[read]` **Geprueft werden die Schreibruempfe**, nicht die ganze
  // Datei: die Namen stehen dort auch im Rueckgabetyp und in der
  // Umwandlung der gelesenen Zeile. **Wer die ganze Datei prueft,
  // bekommt Rot fuer etwas, das nichts schreibt.**
  const s = ohneKommentare('src/lib/recovery/checkin-write.ts')
  // `[read]` `exec`-Schleife statt `matchAll`: das TS-Ziel dieses
  // Pakets erlaubt kein Durchlaufen des Iterators (wie in G-210).
  const ruempfe: string[] = []
  const re = /\.(insert|update|upsert)\(\{/g
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    const ab = m.index
    const bis = s.indexOf('.select(', ab)
    ruempfe.push(s.slice(ab, bis < 0 ? ab + 900 : bis))
  }
  assert.ok(ruempfe.length >= 3, `nur ${ruempfe.length} Schreibruempfe gefunden`)
  for (const r of ruempfe) {
    assert.doesNotMatch(r, /bonus_value:/,
      'Ein Schreibrumpf setzt `bonus_value` — der Bonus ist offen (C-124/G-122).')
    assert.doesNotMatch(r, /bonus_source:/,
      'Ein Schreibrumpf setzt `bonus_source` (C-124/G-122).')
  }
})

test('G-122: jeder Schreibzugriff prueft auf null Zeilen', () => {
  const s = ohneKommentare('src/lib/recovery/checkin-write.ts')
  const schreib = (s.match(/\.(insert|update|upsert)\(/g) ?? []).length
  const pruef = (s.match(/zeilen\.length === 0/g) ?? []).length
  assert.equal(pruef, schreib,
    `${schreib} Schreibaufrufe, ${pruef} Nullzeilenpruefungen (G-79/G-122).`)
})
