// G-138: der Einnahme-Schreibweg — die Naht, die Snapshots und die
// zwei Wege in der Oberflaeche.
//
// `[read]` **Kein Netz, keine Datenbank.** Geprueft wird die Bauform:
// dass die Momentaufnahme beim SCHREIBEN aus dem Stack kommt und
// nicht beim Lesen nachgeschlagen wird, dass genau eine Datei
// schreibt, und dass beide Fenster erreichbar sind. **Die Wirkung
// selbst ist am laufenden System gemessen** — siehe Bericht.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

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

// ── Die Naht ─────────────────────────────────────────────────────

test('G-138: genau EINE Datei schreibt auf `intake_logs`', () => {
  // ══ EINE NAHT MIT ZWEI ENDEN, NICHT ZWEI NAEHTE ══════════════════
  //
  // **Auftrag: *„Hier gibt es bereits `stack-write.ts` UND eine
  // API-Route, die beide schreiben. Pruef, ob das zwei Naehte sind
  // oder eine mit zwei Enden."***
  //
  // `[cmd]` **Es ist eine Naht mit zwei Enden.** Die Route
  // (`api/supplements/intake/route.ts`) enthaelt keinen einzigen
  // Datenbankzugriff — sie uebersetzt HTTP und ruft
  // `erfasseEinnahme()` auf. **Der Zugriff liegt nur in
  // `stack-write.ts`.**
  //
  // `[read]` **Dieser Test ist die Naht** — dieselbe Bauform wie in
  // G-211. Wer daneben schreibt, faellt auf.
  const schreiber: string[] = []
  for (const datei of alleQuellen()) {
    const s = fs.readFileSync(datei, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '')
    if (!/from\('intake_logs'\)/.test(s)) continue
    if (/\.(insert|update|upsert|delete)\(/.test(s)) {
      schreiber.push(datei.replace(process.cwd(), '').replace(/\\/g, '/'))
    }
  }
  assert.deepEqual(schreiber, ['/src/lib/supplements/stack-write.ts'],
    `Es schreiben ${schreiber.length} Dateien auf intake_logs. `
    + 'Soll: genau eine (G-138).')
})

test('G-138: die Route enthaelt keinen Datenbankzugriff', () => {
  // `[read]` **Das ist der Beleg fuer „ein Ende, keine zweite
  // Naht".** Sobald die Route selbst `.from(` benutzt, ist sie eine
  // eigene Schreibstelle.
  const s = ohneKommentare('src/app/api/supplements/intake/route.ts')
  assert.doesNotMatch(s, /\.from\(/,
    'Die Route greift selbst auf die Datenbank zu — dann sind es zwei '
    + 'Naehte (G-138).')
  assert.match(s, /erfasseEinnahme\(/,
    'Die Route ruft den Schreibweg nicht auf (G-138).')
})

// ── Die vier Snapshots ───────────────────────────────────────────

test('G-138: die Snapshots kommen aus dem STACK, nicht aus der Eingabe', () => {
  // ══ DER EIGENTLICHE NACHWEIS ═════════════════════════════════════
  //
  // **Auftrag: *„Sie duerfen nicht beim Lesen nachgeschlagen, sondern
  // muessen beim Schreiben eingefroren werden."***
  //
  // `[read]` **Kaemen sie aus dem Formular, koennte eine Zeile einen
  // Namen tragen, der nie im Stack stand.** Kaemen sie beim Lesen aus
  // dem Stack, aenderte eine spaetere Dosisaenderung die Vergangenheit.
  //
  // `[cmd]` **Am laufenden System gegengeprobt:** Stack-Dosis von 5
  // auf 10 geaendert, beide Einnahmen behielten `dose_snapshot 5.000`.
  const s = ohneKommentare('src/lib/supplements/stack-write.ts')

  // Gelesen wird aus `stack_items` …
  assert.match(s, /from\('stack_items'\)[\s\S]{0,200}?dose, dose_unit/,
    'Der Schreibweg liest Dosis und Einheit nicht aus dem Stack (G-138).')
  // … und genau daraus werden die Snapshots gesetzt.
  assert.match(s, /dose_snapshot: Number\(p\.dose\)/,
    '`dose_snapshot` kommt nicht aus der Stack-Position (G-138).')
  assert.match(s, /dose_unit_snapshot: p\.dose_unit/,
    '`dose_unit_snapshot` kommt nicht aus der Stack-Position (G-138).')
  assert.match(s, /supplement_name_snapshot: name/,
    '`supplement_name_snapshot` kommt nicht aus der Stack-Position (G-138).')
})

test('G-138: kein Snapshot kommt aus der Eingabe', () => {
  // `[read]` **Die Gegenrichtung, und sie ist die wichtigere.** Ein
  // `supplement_name_snapshot: eingabe.name` waere genau der Fehler,
  // gegen den die Spalten gebaut sind — und er saehe im Test oben
  // trotzdem gruen aus, wenn er daneben stuende.
  const s = ohneKommentare('src/lib/supplements/stack-write.ts')
  for (const spalte of ['supplement_name_snapshot', 'dose_snapshot',
    'dose_unit_snapshot']) {
    assert.doesNotMatch(s, new RegExp(`${spalte}:\\s*eingabe\\.`),
      `${spalte} wird aus der Eingabe uebernommen statt eingefroren (G-138).`)
  }
})

test('G-138: `actual_dose_unit` folgt der Stack-Einheit', () => {
  // `[read]` **Sonst stuende eine Menge ohne Einheit da.** Wer 3
  // statt 5 nimmt, nimmt 3 **g** — die Einheit aendert sich nicht
  // mit der Menge.
  const s = ohneKommentare('src/lib/supplements/stack-write.ts')
  assert.match(s, /actual_dose_unit:\s*eingabe\.actual_dose != null \? p\.dose_unit : null/,
    'Die Einheit der abweichenden Menge kommt nicht aus dem Stack (G-138).')
})

// ── Die Eingabepruefung ──────────────────────────────────────────

test('G-138: eine unbrauchbare Id ist ein Eingabefehler, kein Serverfehler', () => {
  // `[cmd]` **Gemessen 2026-08-27, vor der Korrektur:** ein
  // `stack_item_id` von `"x"` ergab **HTTP 500** mit der rohen
  // Meldung *„invalid input syntax for type uuid"*.
  //
  // `[read]` **Falscher Code und ein Leck:** 500 heisst *„der Server
  // hat einen Fehler"*, hier hat der Aufrufer einen — und die
  // Datenbankmeldung verraet Typ und Spalte.
  const s = ohneKommentare('src/lib/supplements/stack-write.ts')
  assert.match(s, /stack_item_id muss eine UUID sein/,
    'Eine unbrauchbare Id wird nicht abgefangen (G-138).')
})

test('G-138: jeder Schreibzugriff prueft auf null Zeilen', () => {
  // `[cmd]` **G-79:** PostgREST meldet `ok` bei einem Schreibversuch,
  // den der Zeilenschutz leergefiltert hat.
  const s = ohneKommentare('src/lib/supplements/stack-write.ts')
  assert.match(s, /Insert lieferte keine Zeile zurueck/,
    'Der Insert prueft nicht auf null Zeilen (G-79/G-138).')
  assert.match(s, /Keine eigene Einnahme mit dieser id/,
    'Das Entfernen prueft nicht auf null Zeilen (G-79/G-138).')
})

// ── Beide Fenster sind erreichbar ────────────────────────────────

test('G-138: „Log dose" ist aus dem Today-Tab erreichbar', () => {
  // ══ DER FUND, DER DEN AUFTRAG TRAEGT ═════════════════════════════
  //
  // `[cmd]` **`LogDoseModal` existiert seit G-148 und war nur ueber
  // `tab-extended.tsx` erreichbar** — also erst ab Erfahrungsgrad
  // pro/elite (G-167). `[read]` **Wer Uhrzeit oder eine abweichende
  // Menge erfassen wollte, kam nicht hin.**
  const s = ohneKommentare('src/app/v2/supplements/tabs.tsx')
  assert.match(s, /open\('logDose'/,
    'Der Today-Tab oeffnet „Log dose" nicht — das Fenster bleibt hinter '
    + 'dem Extended-Gate (G-138).')
})

test('G-138: beide Fenster bekommen die Position mitgegeben', () => {
  // `[cmd]` **Hier stand `open('skip', { name: p.name })`** — ohne
  // `id`. `[read]` Das Fenster faellt dann auf seine Auswahlliste
  // zurueck, und der Nutzer muss die Position noch einmal suchen, die
  // er gerade angeklickt hat.
  const s = ohneKommentare('src/app/v2/supplements/tabs.tsx')
  for (const modal of ['logDose', 'skip']) {
    const m = new RegExp(`open\\('${modal}',\\s*\\{[^}]*id:\\s*p\\.id`)
    assert.match(s, m,
      `„${modal}" bekommt die Position nicht mitgegeben (G-138).`)
  }
})

test('G-138: die Fenster schreiben ueber die Route, nicht daneben', () => {
  const s = ohneKommentare('src/app/v2/supplements/modale.tsx')
  const treffer = (s.match(/\/api\/supplements\/intake/g) ?? []).length
  assert.ok(treffer >= 2,
    `Nur ${treffer} Aufrufe der Einnahme-Route in den Fenstern (G-138).`)
})

// ── Der dritte Zustand ───────────────────────────────────────────

test('G-138: inaktive Positionen erreichen die Fenster nicht', () => {
  // **Auftrag: *„Was passiert, wenn jemand eine Einnahme fuer ein
  // Stack-Item eintraegt, das inzwischen `is_active = false` ist?
  // Nicht verhindern, sondern benennen — falls es ueberhaupt
  // vorkommen kann."***
  //
  // `[cmd]` **Gemessen 2026-08-27: die Datenbank erlaubt es** (kein
  // Check dagegen), **die Oberflaeche nicht** — dieser Filter haelt
  // die Position aus `daten.positionen`, und beide Fenster waehlen
  // ausschliesslich daraus. **11 von 11 Positionen sind aktiv, 0
  // Einnahmen haengen an einer inaktiven.**
  const s = ohneKommentare('src/lib/supplements/stack-read.ts')
  assert.match(s, /\.eq\('is_active', true\)/,
    'Der Leseweg filtert inaktive Positionen nicht mehr — dann kann der '
    + 'dritte Zustand entstehen und braucht eine Anzeige (G-138).')
})
