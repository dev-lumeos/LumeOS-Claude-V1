// G-469 — 7,7 Sekunden, und die Daten sind es nicht.
//
// ══ WAS DIESE REIHE BEWACHT ═════════════════════════════════════════
//
// `[read]` **Dieser Auftrag war ein MESSauftrag, und das Ergebnis
// ist: es gibt nichts zu reparieren.** **Die Zeit ist der
// Entwicklungsserver.**
//
// `[cmd]` **Gemessen 2026-09-17:**
//
//     Dev, erster Aufruf  /v2/coach      9.764 ms
//     Dev, weitere        /v2/coach      1.224 ms
//     Produktionsbau, erster Aufruf         65 ? 203 ms
//     Produktionsbau, weitere                51 ?  88 ms
//
// `[read]` **Eine Probe kann das nicht nachmessen** ? sie laeuft
// nicht gegen einen Server. `[cmd]` **Was sie BEWACHEN kann, ist die
// Mechanik, die den Befund traegt** ? und die Zusagen, die G-465 und
// G-467 hinterlassen haben. **Faellt eine davon, ist der Befund
// ueberholt und muss neu gemessen werden.**
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const WEB = process.cwd()
const lies = (p: string) => fs.readFileSync(path.join(WEB, 'src', p), 'utf8')

function ohneKommentare(q: string): string {
  return q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
}

// ══ 1 — der Gate-Bau bleibt getrennt vom Dev-Server ═════════════════

test('A1: der Bau schreibt NICHT in .next des Dev-Servers', () => {
  // ══ DER GEMESSENE GRUND ══════════════════════════════════════════
  //
  // `[cmd]` **B-18 (2026-08-06):** `next dev` und der Bau teilten
  // sich `apps/web/.next`. **Der Bau raeumt das Verzeichnis beim
  // Start ab, waehrend der Dev-Server dieselben Dateien
  // fortschreibt.**
  //
  // `[read]` **Dieser Auftrag hat den Bau gebraucht** (A2: Dev gegen
  // Produktion) ? **und er war nur messbar, WEIL die Trennung
  // steht.** `[cmd]` **Ohne sie haette die Messung Toms laufenden
  // Server zerschossen.**
  const w = fs.readFileSync(
    path.join(WEB, 'scripts', 'gate-build.js'), 'utf8')
  assert.match(w, /LUMEOS_DIST_DIR\s*\|\|\s*'\.next-gate'/,
    'Der Bau schreibt nicht mehr nach .next-gate — dann raeumt er '
    + 'das Verzeichnis des laufenden Dev-Servers ab.')

  const cfg = fs.readFileSync(path.join(WEB, 'next.config.js'), 'utf8')
  assert.match(cfg, /process\.env\.LUMEOS_DIST_DIR \|\| '\.next'/,
    'Der Dev-Server nimmt nicht mehr `.next` als Vorgabe.')
})

test('A2: .next-gate ist von git ausgeschlossen', () => {
  // `[cmd]` **Der Bau ist 1,1 GB gross** (gemessen 2026-09-17).
  // `[read]` **Ein einziges `git add -A` ohne diese Zeile, und das
  // Verzeichnis liegt im Verlauf.**
  const ign = fs.readFileSync(
    path.join(WEB, '..', '..', '.gitignore'), 'utf8')
  assert.match(ign, /^\.next-gate\/?$/m,
    '.next-gate steht nicht in .gitignore — 1,1 GB Bauartefakt.')
})

// ══ 2 — die Zusagen, auf denen der Befund steht ═════════════════════

test('A3: die Suche wartet auf die gespeicherten Filter (G-467)', () => {
  // `[read]` **Ohne diese Sperre laeuft die Suche ZWEIMAL** — einmal
  // ungefiltert ueber 214.780 Produkte. `[cmd]` **Dann waere die
  // Messung dieses Auftrags falsch**, weil der erste Aufruf eine
  // Arbeit mitschleppt, die es nicht geben muesste.
  // `[cmd]` **`if (!geladen) return` steht ZWEIMAL in der Datei** —
  // einmal im Speichereffekt, einmal im Sucheffekt. `[read]` **Eine
  // Probe auf die blosse Zeile war BLIND:** die Sabotage entfernte
  // die eine, die andere hielt die Zusicherung gruen (gemessen
  // 2026-09-17). **Deshalb wird die Stelle im SUCHEFFEKT geprueft,
  // nicht irgendeine.**
  // `[cmd]` **`if (!geladen) return` steht ZWEIMAL in der Datei** —
  // im Speichereffekt und im Sucheffekt. `[read]` **Zwei Entwuerfe
  // dieser Probe waren BLIND:** die Sabotage entfernte die eine
  // Stelle, die andere hielt die Zusicherung gruen (gemessen
  // 2026-09-17, zweimal).
  //
  // `[read]` **Was die Stelle eindeutig macht, ist ihre NACHBARSCHAFT
  // zum Suchaufruf** — die Sperre muss unmittelbar vor dem
  // `setTimeout` stehen, das `produkte?` ruft. **Das kann der
  // Speichereffekt nicht erfuellen.**
  const q = ohneKommentare(lies('app/v2/supplements/tab-produkte.tsx'))
  assert.match(
    q,
    /if\s*\(!geladen\)\s*return\s+const zeit = setTimeout\(async/,
    'Der SUCHEFFEKT wartet nicht mehr auf die Filter — dann laeuft '
    + 'die Suche ungefiltert ueber 214.780 Produkte los.')
  // Und das ist wirklich der Sucheffekt.
  const nachDerSperre = q.slice(q.search(
    /if\s*\(!geladen\)\s*return\s+const zeit = setTimeout\(async/))
  assert.match(nachDerSperre.slice(0, 600), /api\/supplements\/produkte/,
    'Die gepruefte Stelle ruft nicht die Produktsuche.')
})

test('A4: die Allergietreffer werden gebuendelt geholt (G-465)', () => {
  // `[cmd]` **Vor G-465: 57 Anfragen nacheinander, 15.804 ms.**
  // `[read]` **Faellt das zurueck, misst niemand mehr den
  // Dev-Server** — dann ist wieder die Anwendung langsam, und dieser
  // Befund waere ueberholt.
  const q = ohneKommentare(lies('lib/allergien/allergie-read.ts'))
  assert.match(q, /Promise\.all\(\s*dieseRunde\.map/,
    'Die Runden laufen wieder nacheinander — der 15-Sekunden-Weg.')
  assert.match(q, /TREFFER_SPEICHER\.get\(userId\)/,
    'Der Kurzspeicher je Nutzer ist weg.')
})

test('A5: die Trefferzahl sagt weiter, was sie bedeutet (G-467)', () => {
  const q = ohneKommentare(lies('lib/supplements/produkt-filter-lage.ts'))
  assert.match(q, /export function trefferSatz/,
    'Der erklaerende Satz ist weg.')
})

// ══ 3 — die Kontrollprobe ═══════════════════════════════════════════

test('A6: KONTROLLE — das blosse Wort macht keine Probe rot', () => {
  // `[read]` **Ohne sie misst die Reihe nur, dass jemand die Datei
  // angefasst hat** (Lehre aus G-460).
  assert.ok(
    ohneKommentare('// Promise.all(dieseRunde.map\ncode')
      .indexOf('Promise.all') === -1,
    'ohneKommentare entfernt Zeilenkommentare nicht.')
  assert.ok(
    ohneKommentare('{/* if (!geladen) return */}\ncode')
      .indexOf('geladen') === -1,
    'ohneKommentare entfernt JSX-Kommentare nicht.')
})
