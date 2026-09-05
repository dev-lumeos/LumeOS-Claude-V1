/**
 * G-345 — die Einkaufsliste an drei Orten, ein Fenster.
 *
 * **E-64, 2026-09-07.** `[cmd]` **C-407 hat den Leseweg gebaut**,
 * **und niemand zeigte ihn:** drei Listen mit 11 Posten lagen auf
 * `dev`, alle aus Rezepten.
 *
 * ── Was die Datenbank vorgibt, gemessen am 2026-09-07 ───────────────
 *
 *     shopping_lists        SELECT, INSERT, UPDATE   — KEIN DELETE
 *     shopping_list_items   SELECT, INSERT, UPDATE, DELETE
 *
 * `[read]` **Das Fehlen von DELETE ist die Entscheidung:** *„Loeschen
 * heisst archivieren — eine Einkaufsliste ist ein Beleg, was man
 * gekauft hat."* **Die Datenbank setzt sie durch, nicht die
 * Oberflaeche.**
 *
 * `[cmd]` **`status` kennt DREI Werte** (`open`, `completed`,
 * `archived`) — der Auftrag nannte zwei.
 *
 * `[read]` **Die Waechter messen die Wirkung, nicht das Wort**
 * (CLAUDE.md, G-343): wo es geht, laeuft ein Aufruf mit Werten.
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

// `[cmd]` **Pfad aus der Lage DIESER Datei** — mit `process.cwd()`
// gruen aus der Wurzel und rot im Gate (G-291, A-63).
const WURZEL = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '../../../../../..',
)
const lies = (f: string) => fs.readFileSync(path.join(WURZEL, f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const LESEN = 'apps/web/src/lib/nutrition/einkaufsliste-lesen.ts'
const AKTIONEN = 'apps/web/src/app/v2/nutrition/einkaufsliste-aktionen.ts'
const MODAL = 'apps/web/src/app/v2/nutrition/einkaufsliste-modal.tsx'
const REITER = 'apps/web/src/app/v2/nutrition/tab-einkauf-echt.tsx'
const PLANNER = 'apps/web/src/app/v2/nutrition/tab-planner-echt.tsx'
const SEITE = 'apps/web/src/app/v2/nutrition/page.tsx'

test('die Dateiproben finden ihre Dateien — unabhaengig vom Startort', () => {
  for (const f of [LESEN, AKTIONEN, MODAL, REITER, PLANNER, SEITE]) {
    assert.ok(fs.existsSync(path.join(WURZEL, f)), `${f} nicht gefunden`)
    assert.ok(lies(f).length > 400, `${f} ist verdaechtig kurz`)
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'pnpm-workspace.yaml')),
    `WURZEL zeigt nicht auf das Repo: ${WURZEL}`)
})

// ══ 1 · Loeschen heisst archivieren ══════════════════════════════════

test('G-345/E-64: es gibt keinen Loeschweg fuer eine Liste', () => {
  // `[cmd]` **`authenticated` hat kein DELETE auf `shopping_lists`**
  // — ein Loeschknopf liefe ins Leere und meldete einen Fehler, den
  // niemand versteht.
  //
  // `[read]` **Die Wirkung, nicht das Wort:** in den Aktionen darf
  // `.delete()` NUR auf den Posten stehen.
  const a = ohneKommentare(AKTIONEN)
  // `[read]` **`match` statt `matchAll`** — der Zielstand liegt
  // unter ES2015, und ein Spread ueber den Iterator faellt im
  // Typecheck (TS2802).
  const loeschStellen = (a.match(/\.from\('\w+'\)[\s\S]{0,80}?\.delete\(\)/g) ?? [])
    .map(z => (z.match(/\.from\('(\w+)'\)/) ?? [])[1] ?? '?')
  assert.deepEqual(loeschStellen, ['shopping_list_items'],
    `.delete() steht auf ${loeschStellen.join(', ')} — auf shopping_lists `
    + 'gibt es kein DELETE (E-64: eine Liste ist ein Beleg)')

  // `[cmd]` **Archiviert wird ueber die Funktion aus C-407.**
  assert.match(a, /rpc\('shopping_list_archive'/,
    'archiviert wird nicht ueber shopping_list_archive')
})

test('G-345: das Fenster bietet Archivieren an, kein Loeschen', () => {
  const m = ohneKommentare(MODAL)
  assert.match(m, /data-probe="liste-archivieren"/, 'Archivieren fehlt')
  assert.doesNotMatch(m, /Liste löschen|listeLoeschen/,
    'ein Loeschknopf ist zurueck — E-64 sagt archivieren')

  // `[read]` **Und der Satz sagt, warum** — sonst wirkt das fehlende
  // Loeschen wie eine Luecke.
  assert.match(lies(MODAL), /Beleg, was du gekauft hast/,
    'die Begruendung fuer das Archivieren fehlt')
})

// ══ 2 · Der Wert-Import, der die Seite killt ═════════════════════════

test('G-345: kein Wert-Import aus dem Leseweg in Client-Dateien', () => {
  // `[cmd]` **`einkaufsliste-lesen.ts` importiert
  // `createSessionClient`** und damit `next/headers`.
  //
  // `[read]` **Ein WERT-Import daraus in eine `'use client'`-Datei
  // ergibt HTTP 500 auf der ganzen Seite — bei gruenem Typecheck.**
  // **Dreimal gemessen: G-74, G-79, G-97.**
  //
  // `[cmd]` **Beim Bau von G-345 einmal passiert und behoben** —
  // deshalb steht der Waechter hier.
  for (const f of [MODAL, REITER, PLANNER]) {
    const t = ohneKommentare(f)
    assert.ok(t.includes("'use client'"), `${f} ist keine Client-Datei mehr`)
    const werte = t.match(
      /import \{[^}]*\} from '[^']*einkaufsliste-lesen'/g) ?? []
    for (const z of werte) {
      assert.match(z, /import type \{/,
        `${f} importiert WERTE aus einkaufsliste-lesen — das zieht `
        + 'next/headers ins Browserbuendel (HTTP 500 bei gruenem Typecheck)')
    }
  }
})

// ══ 3 · Die drei Orte ════════════════════════════════════════════════

test('G-345/E-64: der Planner traegt den Knopf an der Woche', () => {
  // **E-64:** *„wer eine Woche plant, kauft fuer die Woche."*
  //
  // `[cmd]` **Dort steht bereits *28 Eintraege · Copy week*** —
  // daneben gehoert die Einkaufsliste.
  const p = ohneKommentare(PLANNER)
  assert.match(p, /data-probe="wochenliste"/, 'der Knopf fehlt')

  // `[read]` **Er heisst verschieden, je nachdem ob es die Liste
  // schon gibt** — ein Knopf, der zweimal dasselbe tut, legt zwei
  // Listen an.
  assert.match(p, /listen\[w\.id\] \? 'Einkaufsliste öffnen' : 'Einkaufsliste'/,
    'der Knopf unterscheidet nicht zwischen anlegen und oeffnen')

  // `[cmd]` **Und er erzeugt ueber die Funktion aus C-407.**
  assert.match(p, /wochenlisteErzeugen\(wocheId\)/,
    'der Knopf ruft die Erzeugerfunktion nicht')
})

test('G-345/E-64: es gibt einen eigenen Reiter, und er kennt das Archiv', () => {
  // `[read]` **Der dritte Ort:** wo man ALLE Listen sieht.
  const s = ohneKommentare(SEITE)
  assert.match(s, /'rezepte', 'einkauf'/,
    'der Reiter `einkauf` ist nicht erlaubt — die Route faellt auf diary zurueck')

  const r = ohneKommentare(REITER)
  assert.match(r, /data-probe="archiv-umschalten"/,
    'der Reiter kann das Archiv nicht zeigen')

  // `[cmd]` **Die Trennung ist eine Filterung, keine zweite Abfrage**
  // — archivierte kommen mit und werden hier aussortiert.
  assert.match(r, /l\.status !== 'archived'/, 'die offenen werden nicht getrennt')
  assert.match(r, /l\.status === 'archived'/, 'die archivierten fehlen')
})

test('G-345: alle drei Orte benutzen DASSELBE Fenster', () => {
  // `[read]` **Drei Orte, eine Ansicht** — sonst driften sie
  // auseinander, und das Abhaken sieht dreimal anders aus.
  for (const f of [REITER, PLANNER]) {
    assert.match(ohneKommentare(f), /<EinkaufslisteModal/,
      `${f} rendert ein eigenes Fenster statt EinkaufslisteModal`)
  }

  // `[cmd]` **Auf der gemeinsamen Huelle** (G-320/321/336/340) —
  // keine fuenfte Ziehlogik.
  assert.match(ohneKommentare(MODAL), /<ZiehModal/,
    'das Fenster haelt eine eigene Huelle')
})

// ══ 4 · Was die Liste kann ═══════════════════════════════════════════

test('G-345/E-64: abhaken, bearbeiten, teilen', () => {
  const m = ohneKommentare(MODAL)
  for (const [was, probe] of [
    ['abhaken', 'posten-haken'],
    ['Posten entfernen', 'posten-entfernen'],
    ['Posten hinzufuegen', 'posten-anlegen'],
    ['teilen', 'liste-teilen'],
  ] as const) {
    assert.ok(m.includes(`data-probe="${probe}"`), `${was} fehlt`)
  }

  // `[cmd]` **Ein freier Posten traegt `item_source = 'manual'`** —
  // dieselbe Trennung wie bei `meal_items` (G-340).
  assert.match(ohneKommentare(AKTIONEN), /item_source: 'manual'/,
    'ein freier Posten bekommt keine eigene Herkunft')

  // `[read]` **Abgehakt heisst durchgestrichen, nicht weg** — wer im
  // Laden zurueckblaettert, will sehen, was er schon hat.
  assert.match(m, /textDecoration: gehakt\[p\.id\] \? 'line-through' : 'none'/,
    'abgehakte Posten verschwinden — dann sieht man nicht, was man hat')
})

test('G-345: eine archivierte Liste laesst sich nicht mehr aendern', () => {
  // `[read]` **Sie ist ein Beleg** — wer sie nachtraeglich abhakt,
  // aendert eine Aussage ueber die Vergangenheit.
  const m = ohneKommentare(MODAL)
  assert.match(m, /disabled=\{laeuft \|\| liste\.status === 'archived'\}/,
    'archivierte Listen lassen sich weiter abhaken')
  assert.match(m, /liste\.status !== 'archived' && \(/,
    'die Bearbeitungsknoepfe stehen auch bei archivierten Listen')
})

// ══ 5 · Die Postenzahl kommt ohne Schleife ═══════════════════════════

test('G-345: kein await je Liste', () => {
  // `[cmd]` **G-252: ein `await` je Zeile kostet je Durchlauf voll.**
  // `[read]` **Bei drei Listen faellt es nicht auf, bei dreissig
  // schon** — deshalb EINE Abfrage fuer alle Posten.
  const l = ohneKommentare(LESEN)
  const i = l.indexOf('export async function ladeEinkaufslisten')
  assert.ok(i > 0, 'ladeEinkaufslisten fehlt')
  const block = l.slice(i, l.indexOf('\n}', l.indexOf('return koepfe.map', i)))

  assert.match(block, /\.in\('shopping_list_id', ids\)/,
    'die Posten werden nicht in EINER Abfrage geholt')
  // Die Wirkung: kein `await` innerhalb einer Schleife.
  assert.doesNotMatch(block, /for \([^)]*\)[\s\S]{0,120}await /,
    'es steht ein await in einer Schleife (G-252)')
})
