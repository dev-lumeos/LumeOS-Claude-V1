// G-421 — die Fotosession: Schreibweg, Posenart, Leseweg.
//
// **Der Auftrag:** *„Miss, ob das Modal schon dorthin zeigt — oder
// noch ins Leere schreibt."*
//
// ══ WAS GEMESSEN WURDE ═════════════════════════════════════════════
//
// `[cmd]` **Vorher: es schrieb ins Leere.** Der Knopf war ein
// `InEntwicklungKnopf` mit dem Vermerk *„Fotosessions brauchen eine
// Dateiablage — der Umsetzungsplan fuehrt sie unter ,Was nicht
// gebaut wird'."*
//
// `[cmd]` **C-463 hatte beides laengst gebaut**, gemessen
// 2026-09-11: `goals.progress_photos` (13 Spalten) und der private
// Bucket `goals-progress-photos` mit vier Owner-Policies.
//
// `[cmd]` **Nachher, mit einer Klickprobe belegt:**
//
//     Zeile   quarter_turns · Front · Pose 1 · is_private = t
//     Datei   <user>/2026-09-11/1-<zeit>.png   70 Bytes
//     Kachel  „1 session", ein Bild mit signierter Adresse
//
// `[read]` **Beide Enden gemessen** — eine Zeile ohne Datei waere ein
// toter Verweis, eine Datei ohne Zeile waere Ballast.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { POSE_ARTEN, pruefeSession, FOTO_BUCKET } from '../fotosession-write'

const HIER = dirname(fileURLToPath(import.meta.url))
const WEB = join(HIER, '..', '..', '..')
const GOALS = join(WEB, 'app', 'v2', 'goals')

const ohneKommentar = (p: string) => readFileSync(p, 'utf8').split('\n')
  .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
  .join('\n')

/** Eine Datei, die der Browser erzeugt haette. */
const bild = (name = 'front.png') =>
  new File([new Uint8Array([1, 2, 3])], name, { type: 'image/png' })

test('die Posenarten stammen aus dem CHECK, nicht aus dem Kopf', () => {
  // `[cmd]` **`progress_photos_pose_type_check`, gemessen gegen
  // `pg_constraint`:** `mandatory_8 | quarter_turns | detail | custom`.
  //
  // `[read]` **Eine Auswahlliste ist eine Zusage** — steht hier ein
  // fuenfter Wert, weist die Datenbank den Schreibvorgang ab, und die
  // Nutzerin sieht eine Datenbankmeldung statt eines Feldfehlers.
  assert.deepEqual([...POSE_ARTEN].sort(),
    ['custom', 'detail', 'mandatory_8', 'quarter_turns'])
})

test('das Modal schickt quarter_turns, nicht mandatory_8', () => {
  // `[read]` **Front · Side · Back sind Vierteldrehungen.**
  // `[cmd]` **`mandatory_8` sind die acht Pflichtposen des IFBB** —
  // und drei davon sind keine acht.
  const m = ohneKommentar(join(GOALS, 'modale.tsx'))
  assert.match(m, /daten\.set\('pose_type', 'quarter_turns'\)/,
    'Das Modal schickt nicht die Posenart der drei Ansichten')
})

test('ohne Datei kein Schreibvorgang', () => {
  // `[read]` **Zuerst pruefen, dann hochladen** — sonst liegen Bilder
  // im Bucket, zu denen es keine Zeile gibt.
  const felder = pruefeSession({
    session_date: '2026-09-11', pose_type: 'quarter_turns',
    posen: [], notes: '',
  })
  assert.ok(felder.some(f => f.feld === 'posen'),
    'Eine Session ohne Foto muss abgewiesen werden')
})

test('eine leere Datei wird abgewiesen', () => {
  const felder = pruefeSession({
    session_date: '2026-09-11', pose_type: 'quarter_turns',
    posen: [{ pose_name: 'Front', pose_number: 1, datei: new File([], 'x.png') }],
    notes: '',
  })
  assert.ok(felder.length > 0, 'Eine leere Datei darf nicht durchgehen')
})

test('ein gueltiger Satz kommt durch', () => {
  // `[read]` **Die Gegenprobe zu den beiden oben** — eine Pruefung,
  // die alles abweist, misst nichts.
  const felder = pruefeSession({
    session_date: '2026-09-11', pose_type: 'quarter_turns',
    posen: [{ pose_name: 'Front', pose_number: 1, datei: bild() }],
    notes: 'Morgens',
  })
  assert.deepEqual(felder, [], `Unerwartet abgewiesen: ${JSON.stringify(felder)}`)
})

test('ein unbekanntes Datum wird abgewiesen', () => {
  const felder = pruefeSession({
    session_date: 'heute', pose_type: 'quarter_turns',
    posen: [{ pose_name: 'Front', pose_number: 1, datei: bild() }],
    notes: '',
  })
  assert.ok(felder.some(f => f.feld === 'session_date'))
})

test('der Bucket ist der aus C-463', () => {
  // `[cmd]` **Gemessen: `goals-progress-photos`, `public = f`,
  // vier Owner-Policies.** `[read]` **Ein anderer Name schriebe in
  // einen Bucket, den es nicht gibt** — und der Fehler kaeme erst zur
  // Laufzeit.
  assert.equal(FOTO_BUCKET, 'goals-progress-photos')
})

test('der Schreibweg prueft auf null Zeilen', () => {
  // `[cmd]` **G-79: PostgREST meldet `ok`, wenn der Zeilenschutz
  // leergefiltert hat.** `[read]` **Ohne diese Pruefung saehe ein
  // abgewiesener Schreibvorgang wie Erfolg aus.**
  const w = ohneKommentar(join(WEB, 'lib', 'goals', 'fotosession-write.ts'))
  assert.match(w, /roh\.length === 0/,
    'Die Nullzeilenpruefung fehlt — ein leerer Schreibvorgang saehe wie Erfolg aus')
  // `[read]` **Und die Kennung kommt aus der SITZUNG**, nie aus der
  // Anfrage — sonst schriebe man in fremde Ablagen.
  assert.match(w, /user_id: userId/)
  assert.ok(!/service/i.test(w), 'Kein Service-Client in einem Nutzerschreibweg')
})

test('die Kachel liest die Sessions und hat einen Ausloeser', () => {
  // `[cmd]` **Das `LogPhotoModal` war gebaut und UNERREICHBAR** —
  // nichts schickte `{ typ: 'logPhoto' }`. **Die Vorlage hat den
  // Knopf** (`module-goals.jsx:516`), die Attrappe hatte ihn nicht
  // mitkopiert.
  const k = ohneKommentar(join(GOALS, 'fehlende-kacheln.tsx'))
  assert.match(k, /open\(\{ typ: 'logPhoto' \}\)/,
    'Ohne Ausloeser ist das Modal unerreichbar')
  assert.match(k, /sessions\.length/,
    'Die Kachel zeigt die gelesenen Sessions nicht')
  // `[read]` **Und KEINE Attrappenmarke mehr** — sie liest jetzt.
  const block = k.slice(k.indexOf('Photo progression'), k.indexOf('Photo progression') + 700)
  assert.ok(!/attrappe=/.test(block),
    'Photo progression traegt noch eine Attrappenmarke, obwohl sie liest')
})

test('der Leseweg signiert, statt eine oeffentliche Adresse zu bauen', () => {
  // `[read]` **Der Bucket ist privat** — eine dauerhafte URL gaebe es
  // gar nicht. `[cmd]` **`createSignedUrls` in EINEM Aufruf**, nicht
  // je Pfad einer (die Lehre aus G-179).
  const l = ohneKommentar(join(WEB, 'lib', 'goals', 'lesen.ts'))
  assert.match(l, /createSignedUrls\(/,
    'Ohne Signatur bleibt jedes Bild leer — der Bucket ist privat')
  assert.ok(!/getPublicUrl/.test(l),
    'Eine oeffentliche Adresse fuer einen privaten Bucket ist immer leer')
})

// ══ DIE ZWEI METRIK-KACHELN ════════════════════════════════════════

test('Body fat trend und Lean mass lesen die Messreihe', () => {
  // `[cmd]` **Der Vermerk sagte:** *„wartet auf eine
  // Verlaufsfunktion — `body_composition_navy` liefert einen Wert je
  // Stichtag, keine Reihe"*.
  //
  // `[cmd]` **Gemessen 2026-09-11:** `body_fat_pct` und
  // `lean_mass_kg` sind SPALTEN auf `goals.body_measurements` — 362
  // von 362 Zeilen gefuellt. **`ladeMessungen()` gibt die ganze
  // Reihe.** `[read]` **Der Leseweg lag daneben.**
  const k = ohneKommentar(join(GOALS, 'fehlende-kacheln.tsx'))
  assert.match(k, /export function FehlendeMetrikKacheln\(\{ messungen \}/,
    'Die Kacheln nehmen die Messreihe nicht entgegen')
  assert.match(k, /m\[feld\]/,
    'Die Reihe wird nicht aus den Messungen gebildet')
  // `[read]` **Und KEINE Entwurfszahlen mehr** — `BODY_METRICS` ist
  // die Attrappentabelle aus `daten.ts`.
  const block = k.slice(k.indexOf('FehlendeMetrikKacheln'))
    .slice(0, k.slice(k.indexOf('FehlendeMetrikKacheln')).indexOf('export function') || 6000)
  assert.ok(!/BODY_METRICS/.test(block),
    'Die Kacheln rechnen wieder mit Entwurfszahlen statt mit Messungen')
})

test('keine erfundene Ziellinie im Koerperfettverlauf', () => {
  // `[cmd]` **Die Vorlage zeigt eine Linie bei 12,0 %.** `[read]`
  // **Ein Koerperfettziel steht in `goals.user_goals` nur als
  // Zielwert EINES Ziels** — welches gemeint ist, sagt niemand.
  // **Eine feste 12 waere eine Aussage ueber den Nutzer.**
  const k = ohneKommentar(join(GOALS, 'fehlende-kacheln.tsx'))
  const von = k.indexOf('Body fat trend')
  const block = k.slice(von, von + 1400)
  assert.ok(!/fill\(12\)|data: Array\(/.test(block),
    'Die erfundene Ziellinie bei 12 % ist zurueck')
})
