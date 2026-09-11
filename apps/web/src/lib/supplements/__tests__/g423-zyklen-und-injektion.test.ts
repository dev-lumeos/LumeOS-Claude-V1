// G-423 — Zyklen, Protokolle und die Injektionskonfiguration.
//
// ══ WAS GEMESSEN WURDE ═════════════════════════════════════════════
//
// `[cmd]` **C-456 und C-455 haben die Tabellen und Funktionen
// gebaut** — und KEINER der fuenf Schreibwege hatte einen Aufrufer
// (gemessen per Suche ueber `apps/web`). **Gebaut und unerreichbar**,
// dieselbe Lage wie das `LogPhotoModal` vor G-421.
//
// `[cmd]` **Gegen die Datenbank belegt, 2026-09-11:**
//
//     start_supplement_cycle          -> active
//     set_supplement_cycle_status     -> paused -> active -> stopped
//     supplement_cycle_events         4 Zeilen
//     create_supplement_protocol_...  1 Protokoll, 4 Posten
//
// `[cmd]` **Und E-79, der Kern des Auftrags:**
//
//     eine konfigurierte Flaeche   -> (kein Vorschlag)
//     zwei konfigurierte Flaechen  -> abs (laenger geruht)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  ZYKLUS_STATUS, ZYKLUS_QUELLEN, VORSCHLAG_QUELLEN,
} from '../zyklus-write'
import {
  KOERPERFLAECHEN, pruefeKonfig,
} from '../../medical/injektion-konfig-write'
import { INJEKTIONSWEGE } from '../../medical/injektion-read'

const HIER = dirname(fileURLToPath(import.meta.url))
const WEB = join(HIER, '..', '..', '..')
const SUPP = join(WEB, 'app', 'v2', 'supplements')

const ohneKommentar = (p: string) => readFileSync(p, 'utf8').split('\n')
  .filter(z => !z.trim().startsWith('//') && !z.trim().startsWith('*'))
  .join('\n')

// ══ DIE WERTE KOMMEN AUS DEM CHECK ═════════════════════════════════

test('die drei Zyklusstaende stammen aus dem CHECK', () => {
  // `[cmd]` **`user_supplement_cycles_status_check`, gemessen gegen
  // `pg_constraint`:** `active | paused | stopped`.
  //
  // `[read]` **Eine Auswahlliste ist eine Zusage** — steht hier ein
  // vierter Wert, weist die Datenbank ab, und die Nutzerin sieht eine
  // Datenbankmeldung statt eines Feldfehlers.
  assert.deepEqual([...ZYKLUS_STATUS].sort(),
    ['active', 'paused', 'stopped'])
})

test('die Herkuenfte stammen aus dem CHECK', () => {
  assert.deepEqual([...ZYKLUS_QUELLEN].sort(),
    ['coach_suggested', 'confirmed_by_user'])
  assert.deepEqual([...VORSCHLAG_QUELLEN].sort(),
    ['ai_suggested', 'coach_recommendation', 'marketplace_product', 'user_manual'])
})

test('die zwei Injektionswege stammen aus dem CHECK', () => {
  // `[cmd]` **`route = ANY (ARRAY['injection_im','injection_subq'])`.**
  assert.deepEqual([...INJEKTIONSWEGE].sort(),
    ['injection_im', 'injection_subq'])
})

test('die 21 Koerperflaechen stammen aus dem CHECK', () => {
  // `[cmd]` **Gemessen gegen `pg_constraint`** — und gegen
  // `packages/ui/src/koerperkarte-pfade.ts`: **20 Flaechen kommen in
  // beiden vor.**
  assert.equal(KOERPERFLAECHEN.length, 21)
  for (const f of ['triceps', 'deltoids', 'gluteal', 'quadriceps', 'abs']) {
    assert.ok((KOERPERFLAECHEN as readonly string[]).includes(f),
      `Die Flaeche "${f}" fehlt in der Auswahlliste`)
  }
  // `[read]` **`latissimus` ist die gemeldete Luecke** — der CHECK
  // erlaubt ihn, die Karte hat keinen Pfad. **Er steht hier, weil die
  // Datenbank ihn kennt.**
  assert.ok((KOERPERFLAECHEN as readonly string[]).includes('latissimus'))
})

// ══ DIE PRUEFUNG ═══════════════════════════════════════════════════

test('eine unbekannte Flaeche wird abgewiesen', () => {
  const f = pruefeKonfig({
    substance_id: 'x', route: 'injection_subq',
    body_area_code: 'gibtesnicht', needle_gauge: '', needle_length_in: '',
  })
  assert.ok(f.some(x => x.feld === 'body_area_code'))
})

test('ein gueltiger Satz kommt durch', () => {
  // `[read]` **Die Gegenprobe** — eine Pruefung, die alles abweist,
  // misst nichts.
  const f = pruefeKonfig({
    substance_id: '8ae87382-7e70-50d8-6f69-8cb20c176fdb',
    route: 'injection_subq', body_area_code: 'triceps',
    needle_gauge: '29G', needle_length_in: '0.5',
  })
  assert.deepEqual(f, [], `Unerwartet abgewiesen: ${JSON.stringify(f)}`)
})

test('eine Nadellaenge von 0 wird abgewiesen', () => {
  // `[cmd]` **CHECK: `needle_length_in IS NULL OR > 0`.**
  const f = pruefeKonfig({
    substance_id: 'x', route: 'injection_subq', body_area_code: 'triceps',
    needle_gauge: '', needle_length_in: '0',
  })
  assert.ok(f.some(x => x.feld === 'needle_length_in'))
})

test('eine leere Nadellaenge ist erlaubt', () => {
  // `[read]` **Die Spalte ist nullable** — wer die Nadel nicht kennt,
  // soll die Flaeche trotzdem waehlen koennen.
  const f = pruefeKonfig({
    substance_id: 'x', route: 'injection_subq', body_area_code: 'triceps',
    needle_gauge: '', needle_length_in: '',
  })
  assert.ok(!f.some(x => x.feld === 'needle_length_in'))
})

// ══ DIE SCHREIBWEGE WERDEN GERUFEN ═════════════════════════════════

test('die fuenf Schreibwege haben jetzt einen Aufrufer', () => {
  // `[cmd]` **Vorher: keiner.** `[read]` **Eine gebaute Funktion ohne
  // Aufrufer ist wie eine fehlende** — nur teurer, weil sie gepflegt
  // werden muss.
  const w = ohneKommentar(join(WEB, 'lib', 'supplements', 'zyklus-write.ts'))
  assert.match(w, /rpc\('start_supplement_cycle'/)
  assert.match(w, /rpc\('set_supplement_cycle_status'/)
  assert.match(w, /rpc\('create_supplement_protocol_from_template'/)
  const r = ohneKommentar(join(WEB, 'lib', 'medical', 'injektion-read.ts'))
  assert.match(r, /rpc\('suggest_configured_injection_area'/)
  const k = ohneKommentar(join(WEB, 'lib', 'medical', 'injektion-konfig-write.ts'))
  assert.match(k, /from\('user_injection_site_selections'\)/)
})

test('die Karten sind eingehaengt, nicht nur gebaut', () => {
  // `[cmd]` **Die Lehre aus G-421:** ein Bauteil kann vollstaendig
  // dastehen und keinen Ausloeser haben. **Zaehler melden es als OK.**
  const a = ohneKommentar(join(SUPP, 'ansicht.tsx'))
  assert.match(a, /<ZyklusKarte\b/, 'Die Zyklen sind nicht eingehaengt')
  assert.match(a, /<ProtokollKarte\b/, 'Die Protokolle sind nicht eingehaengt')
  assert.match(a, /<InjektionsKonfigKarte\b/,
    'Die Injektionskonfiguration ist nicht eingehaengt')
})

test('der Schreibweg prueft auf null Zeilen', () => {
  // `[cmd]` **G-79: PostgREST meldet `ok`, wenn der Zeilenschutz
  // leergefiltert hat.**
  const k = ohneKommentar(join(WEB, 'lib', 'medical', 'injektion-konfig-write.ts'))
  assert.match(k, /zeilen\.length === 0/,
    'Die Nullzeilenpruefung fehlt beim Anlegen')
  assert.match(k, /\.length === 0\) \{\s*throw new KonfigFehler\('NOT_FOUND', 'Nichts entfernt/,
    'Die Nullzeilenpruefung fehlt beim Entfernen')
  // `[read]` **Die Kennung kommt aus der SITZUNG**, nie aus der
  // Anfrage.
  assert.match(k, /user_id: userId/)
  assert.ok(!/service/i.test(k), 'Kein Service-Client in einem Nutzerschreibweg')
})

// ══ E-79: DIE REGEL ════════════════════════════════════════════════

test('E-79: die Rotationsregel steht in der Datenbank, nicht daneben', () => {
  // **Tom:** *„wenn er triceps waehlt weil er lokal ein tendonproblem
  // hat, dann zeigen wir den triceps und keinen rotationsvorschlag,
  // weil nur triceps vorhanden ist."*
  //
  // `[cmd]` **`suggest_configured_injection_area` traegt
  // `WHERE (SELECT count(*) FROM selected) > 1`** — gemessen im
  // Funktionsrumpf.
  //
  // `[read]` **Diese Datei darf die Regel NICHT noch einmal
  // nachbauen** — zwei Orte fuer eine Regel heissen zwei Regeln.
  const r = ohneKommentar(join(WEB, 'lib', 'medical', 'injektion-read.ts'))
  assert.match(r, /rpc\('suggest_configured_injection_area'/,
    'Der Vorschlag wird nicht von der Datenbank geholt')
  // `[read]` **Kein `length > 1` im Leseweg** — das waere die
  // nachgebaute Regel.
  const block = r.slice(r.indexOf('ladeKonfiguration'))
  assert.ok(!/flaechen\.length > 1|\.length >= 2/.test(block),
    'Die Rotationsregel ist im Leseweg nachgebaut — sie gehoert in die Funktion')
})

test('E-79: die Kachel sagt, warum kein Vorschlag dasteht', () => {
  // `[read]` **Ein fehlender Vorschlag ohne Erklaerung sieht aus wie
  // ein Fehler** — dieselbe Lehre wie G-413.
  const k = ohneKommentar(join(SUPP, 'zyklus-karten.tsx'))
  assert.match(k, /Kein Rotationsvorschlag/,
    'Der Leerfall hat keinen Satz')
  assert.match(k, /mindestens zwei/,
    'Der Satz nennt die Bedingung nicht')
})
