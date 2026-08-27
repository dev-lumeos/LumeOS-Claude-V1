// G-211: die Eingaberegeln, der dritte Zustand — und die eine
// Schreibstelle.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  pruefeEingabe, bindungVon, zaehleOhneBindung, absetzenGueltig,
  LEERE_EINGABE, OHNE_BINDUNG_FOLGE, OHNE_BINDUNG_GRUND,
  type MedikamentEingabe,
} from '../medikament-eingabe'

const GUELTIG: MedikamentEingabe = {
  ...LEERE_EINGABE,
  name: 'Scemblix',
  active_substance_id: 'drug_0642bd1e2f',
  start_date: '2026-08-01',
}

// ── Die Pflichtfelder ────────────────────────────────────────────

test('G-211: ein gueltiger Eintrag hat keine Fehler', () => {
  assert.deepEqual(pruefeEingabe(GUELTIG), [])
})

test('G-211: ohne Namen geht es nicht', () => {
  // `[cmd]` **Die Datenbank haelt es auch** —
  // `user_medications_name_check` (`btrim(name) <> ''`), gegengeprobt
  // am 2026-08-27. `[read]` **Diese Pruefung ersetzt sie nicht, sie
  // kommt ihr zuvor:** ein Constraint-Fehler ist eine englische
  // Postgres-Meldung, ein Mensch braucht einen Satz am Feld.
  const f = pruefeEingabe({ ...GUELTIG, name: '   ' })
  assert.equal(f.length, 1)
  assert.equal(f[0].feld, 'name')
})

test('G-211: ohne Startdatum geht es nicht', () => {
  // `[cmd]` `start_date` ist `NOT NULL`.
  const f = pruefeEingabe({ ...GUELTIG, start_date: '' })
  assert.deepEqual(f.map(x => x.feld), ['start_date'])
})

test('G-211: eine Menge muss groesser als null sein', () => {
  // `[cmd]` `user_medications_dose_amount_check`.
  for (const wert of ['0', '-5']) {
    const f = pruefeEingabe({ ...GUELTIG, dose_amount: wert })
    assert.deepEqual(f.map(x => x.feld), ['dose_amount'], wert)
  }
})

test('G-211: ein leeres Mengenfeld ist erlaubt', () => {
  // `[read]` **Die Spalte ist nullable, und das ist richtig:** wer
  // nicht weiss, wie viel Milligramm seine Tablette hat, soll den
  // Eintrag trotzdem anlegen koennen.
  assert.deepEqual(pruefeEingabe({ ...GUELTIG, dose_amount: '' }), [])
})

test('G-211: Komma als Dezimaltrennzeichen', () => {
  // `[read]` Deutsche Tastatur, deutsche Oberflaeche.
  assert.deepEqual(pruefeEingabe({ ...GUELTIG, dose_amount: '2,5' }), [])
})

test('G-211: Buchstaben in der Menge sind ein Fehler', () => {
  const f = pruefeEingabe({ ...GUELTIG, dose_amount: 'viel' })
  assert.deepEqual(f.map(x => x.feld), ['dose_amount'])
})

test('G-211: mehrere Fehler kommen zusammen zurueck', () => {
  // `[read]` **Nicht der erste.** Wer drei Felder falsch hat, soll
  // nicht dreimal absenden muessen.
  const f = pruefeEingabe({ ...LEERE_EINGABE, doses_per_day: '0' })
  assert.deepEqual(f.map(x => x.feld).sort(),
    ['doses_per_day', 'name', 'start_date'])
})

// ── Der dritte Zustand ───────────────────────────────────────────

test('G-211: mit Wirkstoff ist zugeordnet', () => {
  assert.equal(bindungVon('drug_0642bd1e2f'), 'zugeordnet')
})

test('G-211: ohne Wirkstoff ist NICHT zugeordnet', () => {
  // **Auftrag: *„Dann traegt der Eintrag keine `active_substance_id`,
  // und das muss sichtbar sein."***
  assert.equal(bindungVon(null), 'nicht_zugeordnet')
  assert.equal(bindungVon(undefined), 'nicht_zugeordnet')
})

test('G-211: Leerzeichen sind keine Bindung', () => {
  // `[read]` Dieselbe Vorsicht wie in `feld()` (G-208): technisch
  // gefuellt, inhaltlich leer.
  assert.equal(bindungVon('   '), 'nicht_zugeordnet')
  assert.equal(bindungVon(''), 'nicht_zugeordnet')
})

test('G-211: ein Freitexteintrag ist GUELTIG, nicht fehlerhaft', () => {
  // `[read]` **Das ist der Kern des dritten Zustands.** Wer Concor
  // nimmt, muss es eintragen koennen — `[cmd]` der Katalog fuehrt
  // keine deutschen Handelsnamen (`DE` bei 0 von 448 Produkten,
  // G-210). **Keine Zuordnung ist kein Eingabefehler.**
  const freitext = { ...GUELTIG, name: 'Concor', active_substance_id: null }
  assert.deepEqual(pruefeEingabe(freitext), [])
  assert.equal(bindungVon(freitext.active_substance_id), 'nicht_zugeordnet')
})

test('G-211: die Folge wird benannt, nicht nur der Zustand', () => {
  // **Auftrag: *„Diese Folge gehoert benannt: ein Medikament ohne
  // Wirkstoffbindung wird von keiner Regel gesehen. Nicht als
  // Fehlermeldung, sondern als ehrlicher Hinweis."***
  assert.match(OHNE_BINDUNG_FOLGE, /keiner Wechselwirkungsregel/i)
  assert.match(OHNE_BINDUNG_FOLGE, /bleibt in deiner Liste/i)
  // `[cmd]` **Die Ueberschrift steht im Bauteil, nicht im Satz.** Im
  // ersten Browserlauf stand „Ohne Wirkstoff aus dem Katalog." zweimal
  // hintereinander — einmal als `<strong>`, einmal am Satzanfang.
  assert.doesNotMatch(OHNE_BINDUNG_FOLGE, /^Ohne Wirkstoff aus dem Katalog/)
  // Der Ton: kein Vorwurf.
  assert.match(OHNE_BINDUNG_GRUND, /nicht.*falsch gemacht/i)
  assert.match(OHNE_BINDUNG_GRUND, /keine deutschen Handelsnamen/i)
})

test('G-211: unzugeordnete Eintraege werden gezaehlt', () => {
  assert.equal(zaehleOhneBindung([
    { active_substance_id: 'drug_a' },
    { active_substance_id: null },
    { active_substance_id: '  ' },
  ]), 2)
})

// ── Absetzen ist kein Loeschen ───────────────────────────────────

test('G-211: Absetzen braucht ein Datum', () => {
  assert.deepEqual(absetzenGueltig('2026-08-01', '').map(f => f.feld),
    ['end_date'])
})

test('G-211: das Absetzdatum darf nicht vor dem Beginn liegen', () => {
  // `[cmd]` **Die Datenbank haelt es auch:** `user_medications_check`
  // (`end_date >= start_date`), gegengeprobt am 2026-08-27.
  const f = absetzenGueltig('2026-08-10', '2026-08-01')
  assert.equal(f.length, 1)
  assert.match(f[0].text, /vor dem Beginn/i)
})

test('G-211: derselbe Tag ist erlaubt', () => {
  // `[read]` `>=`, nicht `>` — wer ein Medikament am selben Tag
  // absetzt, an dem er es begonnen hat, hat es genommen.
  assert.deepEqual(absetzenGueltig('2026-08-01', '2026-08-01'), [])
})

// ── Die eine Schreibstelle ───────────────────────────────────────

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

test('G-211: genau EINE Datei schreibt auf `user_medications`', () => {
  // ══ DIE VORLEISTUNG, DIE DEN SPAETEREN UMBAU KLEIN HAELT ═════════
  //
  // **Auftrag: *„Alle Schreibzugriffe durch genau eine Stelle
  // fuehren."***
  //
  // `[read]` **Der Grund steht in `docs/todo/SICHERHEIT.md`:** wenn
  // `name`, `indication` und `notes` verschluesselt werden, ist eine
  // gebuendelte Schreibstelle ein Umbau von Stunden — verstreute
  // Zugriffe einer von Tagen.
  //
  // **Dieser Test ist die Naht.** Wer daneben schreibt, faellt auf.
  const schreiber: string[] = []
  for (const datei of alleQuellen()) {
    // `alleQuellen` liefert absolute Pfade — `ohneKommentare` setzt
    // relative voraus. Hier direkt lesen.
    const s = fs.readFileSync(datei, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '')
    if (!/from\('user_medications'\)/.test(s)) continue
    // Nur Schreibzugriffe zaehlen — `select` ist erlaubt und noetig.
    if (/\.(insert|update|upsert|delete)\(/.test(s)) {
      schreiber.push(datei.replace(process.cwd(), '').replace(/\\/g, '/'))
    }
  }
  assert.deepEqual(schreiber, ['/src/lib/medical/medikament-write.ts'],
    `Es schreiben ${schreiber.length} Dateien auf user_medications. `
    + 'Soll: genau eine (G-211, SICHERHEIT.md).')
})

test('G-211: die Schreibstelle verweist auf SICHERHEIT.md', () => {
  // **Auftrag: *„Ein Kommentarblock am Buendelungspunkt verweist auf
  // `SICHERHEIT.md`."***
  //
  // `[read]` **Ohne den Verweis ist die Buendelung eine Formalie.**
  // Wer sie spaeter aufloest, muss lesen koennen, warum es sie gibt.
  const s = roh('src/lib/medical/medikament-write.ts')
  assert.match(s, /SICHERHEIT\.md/,
    'Die Schreibstelle nennt SICHERHEIT.md nicht (G-211).')
  assert.match(s, /C-285/, 'Der Verweis auf die Entscheidung fehlt (G-211).')
  for (const spalte of ['name', 'indication', 'notes']) {
    assert.ok(s.includes(spalte),
      `Die drei Freitextspalten sind nicht benannt: ${spalte} (G-211).`)
  }
})

test('G-211: der Schreibweg loescht nicht', () => {
  // **Auftrag: *„Absetzen ist kein Loeschen."***
  //
  // `[cmd]` **`authenticated` HAT das DELETE-Recht** und es gibt eine
  // `user_medications_delete`-Policy (gemessen 2026-08-27). `[read]`
  // **Der Schreibweg benutzt beides nicht** — nicht weil es unmoeglich
  // waere, sondern weil es die falsche Handlung ist.
  const s = ohneKommentare('src/lib/medical/medikament-write.ts')
  assert.doesNotMatch(s, /\.delete\(/,
    'Der Schreibweg loescht — Absetzen ist kein Loeschen (G-211).')
  assert.match(s, /is_active: false/,
    'Absetzen setzt `is_active` nicht (G-211).')
  assert.match(s, /end_date: end_date\.trim\(\)/,
    'Absetzen setzt `end_date` nicht (G-211).')
})

test('G-211: die Zuordnung holt drug_class und cyp_profile', () => {
  // `[read]` **Das ist der Kern des Auftrags, als Test.** `[cmd]` Die
  // 30 Regeln lesen NICHT `active_substance_id`, sondern
  // `medical.medications[].drug_class` (9) und `.cyp_profile` (1).
  // **Die Zuordnung wirkt mittelbar:** sie holt diese beiden Felder
  // aus dem Katalog auf die Zeile.
  const s = ohneKommentare('src/lib/medical/medikament-write.ts')
  assert.match(s, /from\('medication_active_substances'\)/,
    'Der Schreibweg liest den Katalog nicht (G-211).')
  assert.match(s, /drug_class: kat\.drug_class/,
    'Die Klasse wird nicht uebernommen — keine Regel kann greifen (G-211).')
  assert.match(s, /cyp_profile: kat\.cyp_profile/,
    'Das CYP-Profil wird nicht uebernommen (G-211).')
})

test('G-211: jeder Schreibzugriff prueft auf null Zeilen', () => {
  // `[cmd]` **G-79:** PostgREST meldet `ok` bei einem `update`, das
  // der Zeilenschutz leergefiltert hat.
  const s = ohneKommentare('src/lib/medical/medikament-write.ts')
  const schreibaufrufe = (s.match(/\.(insert|update)\(/g) ?? []).length
  const pruefungen = (s.match(/zeilen\.length === 0/g) ?? []).length
  assert.equal(pruefungen, schreibaufrufe,
    `${schreibaufrufe} Schreibaufrufe, aber ${pruefungen} Nullzeilenpruefungen `
    + '(G-79/G-211).')
})

test('G-211: `drug_class` wird nicht angezeigt (C-296)', () => {
  // `[cmd]` **Die Spalte fuehrt fallverdoppelte Tags** — `MAOI` (15)
  // UND `maoi` (15) — und sechs SSRI tragen gleichzeitig `MAOI`
  // (G-208). `[read]` **Sie wird weiter geschrieben**, weil 9 Regeln
  // sie lesen; **sie wird nur nicht als Auskunft gezeigt.**
  const s = ohneKommentare('src/app/v2/medical/tab-tracking.tsx')
  assert.doesNotMatch(s, /m\.drug_class\.map/,
    'Das Tracking zeigt `drug_class` — C-296 ist offen (G-211).')
})
