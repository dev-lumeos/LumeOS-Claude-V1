// A-29: kann der Attrappen-Test die gerenderte Seite zaehlen?
//
// ══ DIE ANTWORT: NEIN, UND ZWAR AUS ZWEI GRUENDEN ═══════════════════
//
// **Der Auftrag:** *„ein Test, der nicht im Gate laeuft, ist eine
// Zusage ohne Deckung."*
//
// `[cmd]` **Grund 1 — der Gate hat nichts davon.** Alle 20
// Gate-Schritte sind reine Dateipruefungen; **keiner startet einen
// Server, keiner spricht mit der Datenbank.** `tools/schuss.mjs`
// braucht **alle vier**: laufender Dev-Server (3200), Datenbank mit
// Seed-Daten, Anmeldung (`tools/konten.mjs`), Chromium.
//
// `[cmd]` **Gemessen am 2026-08-30:** ein Schuss kostet **11,7 s im
// Mittel** (11,8 / 9,0 / 14,2 s ueber drei Routen). **12 v2-Seiten =
// 2,3 min; mit den rund 40 Reitern 7,8 min** — der ganze uebrige Gate
// liegt bei etwa 1 min.
//
// `[cmd]` **Und der Server traegt es nicht:** er ist am 2026-08-30
// mehrfach waehrend langer Laeufe gestorben und musste je neu
// gestartet werden (`ERR_CONNECTION_REFUSED`, Befund aus G-277).
// **Ein Gate-Schritt, der daran haengt, ist rot, wenn nichts kaputt
// ist.**
//
// `[cmd]` **Grund 2 — es gibt keine EINE richtige Quelltextzahl.**
// `app/v2/supplements/tabs.tsx` traegt **17 Marken im Quelltext**;
// am Schirm sind es **1 (today), 7 (intel), 1 (spec)** — je nachdem,
// welcher Reiter offen ist.
//
// `[read]` **Damit ist die Ueberschaetzung nicht herausrechenbar.**
// Sie kommt nicht nur aus `daten ? <Echt/> : <Attrappe/>`, sondern
// daraus, dass eine Datei mehrere Reiter traegt und immer nur einer
// rendert. **Eine Quelltextzahl kann das nicht wissen.**
//
// ══ WAS STATTDESSEN BLEIBT ══════════════════════════════════════════
//
// `[read]` **Die Quelltextzaehlung bleibt, was sie ist: eine
// Obergrenze.** `[cmd]` 234 Marken in v2 gegen 24 am Schirm (A-59).
// **Sie taugt fuer „jede Karte traegt eine Marke", nicht fuer „so
// viele sind sichtbar".**
//
// `[read]` **Und die Schirmzahl bleibt, was sie ist: eine Messung je
// Bericht.** `schuss.mjs` liefert sie in einem Aufruf; **sie gehoert
// in den Nachweis eines Auftrags, nicht in den Gate.**
//
// `[read]` **Was hier gesichert wird, ist die Zaehlweise selbst** —
// damit die zwei Zahlen vergleichbar bleiben und niemand sie
// verwechselt.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const WURZEL = path.resolve(process.cwd(), '../..')
const lies = (rel: string) => fs.readFileSync(path.join(WURZEL, rel), 'utf8')

test('A-29: schuss.mjs meldet Attrappen und Konsolenfehler als Zahl', () => {
  // `[read]` **Die Zahl liegt vor** — sie steht nur in keinem Gate,
  // und das ist eine Entscheidung, kein Versaeumnis. **Faellt sie aus
  // der Ausgabe, verliert jeder Bericht seinen Nachweis.**
  const s = lies('tools/schuss.mjs')
  assert.match(s, /attrappen:\s*marken/,
    'schuss.mjs meldet die Attrappenzahl nicht mehr (A-29).')
  assert.match(s, /konsolenfehler:\s*fehler\.length/,
    'schuss.mjs meldet die Konsolenfehler nicht mehr (A-29).')
  // Und die Zaehlweise selbst: das Wort irgendwo im Text, nicht die
  // CSS-Klasse. `[cmd]` A-29 mass 6 sichtbare Marken gegen 10
  // `v2-attrappe`-Klassen — die Klasse haengt auch an Unterelementen.
  assert.match(s, /locator\('text=\/Attrappe\/i'\)\.count\(\)/,
    'Die Zaehlweise hat sich geaendert — dann sind die Zahlen aller '
    + 'frueheren Berichte nicht mehr vergleichbar (A-29).')
})

test('A-29: der Gate startet keinen Server — das ist die Grenze', () => {
  // `[read]` **Die Wirkung pruefen, nicht das Wort.** Nicht „steht
  // `schuss` im Gate", sondern: **braucht irgendein Gate-Schritt einen
  // Server?** Kaeme einer dazu, waere die Begruendung oben hinfaellig,
  // und A-29 gehoerte neu entschieden.
  const pkg = JSON.parse(lies('package.json')) as {
    scripts?: Record<string, string>
  }
  const gate = pkg.scripts?.gate ?? ''
  assert.ok(gate.length > 0, 'Es gibt kein Gate-Skript mehr (A-29).')
  for (const [was, muster] of [
    ['schuss.mjs', /schuss\.mjs/],
    ['server.py', /server\.py/],
    ['playwright', /playwright/i],
  ] as const) {
    assert.doesNotMatch(gate, muster,
      `Der Gate ruft ${was} — dann laeuft er nicht mehr ohne Server, `
      + 'und die Begruendung in dieser Datei gilt neu zu pruefen (A-29).')
  }
})

test('G-173: der Verweis auf den ACWR-Rueckbau nennt C-215', () => {
  // `[cmd]` **Gemessen am 2026-08-30, und der Befund galt noch:**
  // `scores-read.ts:42` sagte *„C-195 hat die Spalte entfernt"* —
  // **C-195 war der Substanzkatalog.**
  //
  // `[cmd]` **Beleg fuer C-215:**
  // `supabase/_pipeline/12_recovery/121_recovery_scores_modalities.sql:142-144`
  // — dasselbe `ALTER TABLE` setzt `algorithm_version` auf
  // `manual_v2_c215` und wirft `acwr_used` weg.
  //
  // `[read]` **Ein Kommentar hat keinen Waechter und kippt still
  // zurueck.** Die Sabotageprobe hat genau das gezeigt: der
  // berichtigte Verweis ueberlebte eine Ruecksetzung, weil ihn nichts
  // prueft. **Deshalb diese Zeile.**
  const s = lies('apps/web/src/lib/recovery/scores-read.ts')
  const stelle = /`acwr_used` ist raus[^\n]*\n/.exec(s)
  assert.ok(stelle, 'Die Stelle zu `acwr_used` wurde nicht gefunden (G-173).')
  assert.match(stelle[0], /(?<![A-Za-z0-9-])C-215(?![0-9])/,
    'Der Verweis nennt nicht C-215 (G-173).')
  assert.doesNotMatch(stelle[0], /(?<![A-Za-z0-9-])C-195(?![0-9])/,
    'Der falsche Verweis auf C-195 ist zurueck — C-195 war der '
    + 'Substanzkatalog, C-215 hat `acwr_used` entfernt (G-173).')
})

test('A-29: die Quelltextzahl ist eine Obergrenze, keine Schirmzahl', () => {
  // `[cmd]` **Der Beleg, warum keine Quelltextzahl stimmen kann:**
  // `supplements/tabs.tsx` traegt 17 Marken; am Schirm sind es 1, 7
  // oder 1 — je nach offenem Reiter.
  //
  // `[read]` **Der bestehende Waechter zaehlt Karten gegen Marken**
  // („keine ohne"), nicht Marken gegen eine erwartete Sichtbarkeit.
  // **Das ist die richtige Form** — und sie darf nicht in eine
  // Sichtbarkeitszusage umgebaut werden.
  const s = lies('apps/web/src/components/shell/__tests__/v2-attrappen.test.ts')
  assert.match(s, /Nicht "so viele wie erwartet", sondern "keine ohne"/,
    'Die Begruendung der Zaehlweise ist aus dem Attrappen-Waechter '
    + 'verschwunden (A-29).')
  // Eine Datei traegt mehrere Reiter — das ist der Kern der Sache.
  const tabs = lies('apps/web/src/app/v2/supplements/tabs.tsx')
  // `[cmd]` **Die Konstante heisst hier `RUECKFALL`, nicht `ATTRAPPE`.**
  // `[read]` Die erste Fassung suchte nur `attrappe={ATTRAPPE}` und
  // fand 0 — **ein Waechter, der den einen Namen kennt und den anderen
  // nicht, misst die Haelfte.** Deshalb auf die Requisite pruefen, nicht
  // auf den Namen der Konstante.
  const marken = (tabs.match(/attrappe=\{[A-Za-z_]+\}/g) ?? []).length
  assert.ok(marken > 7,
    `supplements/tabs.tsx traegt nur noch ${marken} Marken — die Datei `
    + 'war der Beleg, dass eine Quelltextzahl mehrere Reiter mischt. '
    + 'Faellt sie unter die Schirmzahl eines Reiters, ist der Beleg weg (A-29).')
})
