// C-49/C-324 (Nutrition-Score) und A-36 (drei Module als Attrappe).
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

import {
  VOLLSTAENDIGE_TAGE, BLOCKER, istBaubar, OFFENE_FRAGE,
} from '../score-lage'

const WURZEL = path.resolve(process.cwd(), '../..')
const lies = (rel: string) => fs.readFileSync(path.join(WURZEL, rel), 'utf8')

// ══ C-49 / C-324 ═══════════════════════════════════════════════════

test('C-324: der Score ist nicht baubar, und zwar nicht knapp', () => {
  // `[cmd]` **Gemessen am 2026-08-30, dev@lumeos.app, 30 Tage:**
  // VITC 0/30 (98 fehlende Posten), Vitamin A 0/30 (je 2 von 3
  // Komponenten). **Zwei von neun positiven Naehrstoffen an KEINEM
  // Tag vollstaendig.**
  //
  // `[read]` **E-25 verbietet ausdruecklich, die Luecke als Mangel
  // auszugeben** — ein Score, der eine Datenluecke als Mangel
  // ausgibt, ist schlimmer als keiner (C-48 Regel 1).
  assert.equal(istBaubar(), false,
    'Die Datenlage traegt den Score angeblich — dann ist C-324 neu zu '
    + 'pruefen und diese Datei nachzumessen (C-49).')
  assert.deepEqual(BLOCKER.slice().sort(), ['VITA_IU', 'VITC'],
    'Die Blocker haben sich geaendert (C-49).')
  assert.equal(VOLLSTAENDIGE_TAGE.VITC, 0)
  assert.equal(VOLLSTAENDIGE_TAGE.VITA_IU, 0)
  // Und die Gegenrichtung: der Rest der Formel traegt.
  for (const n of ['PROT625', 'CA', 'FE', 'MG', 'K', 'FASAT', 'SUGAR'] as const) {
    assert.equal(VOLLSTAENDIGE_TAGE[n], 30,
      `${n} ist nicht mehr an allen 30 Tagen vollstaendig (C-49).`)
  }
})

test('C-324: die offene Frage ist fachlich, nicht technisch', () => {
  // `[read]` **Der Unterschied entscheidet, wer sie beantwortet.**
  // Waere es eine Rechnung, koennte ein Auftrag sie schliessen; so
  // braucht es eine Entscheidung ueber die Datensemantik.
  assert.match(OFFENE_FRAGE, /als 0 zählen/,
    'Die offene Frage nennt den Kern nicht mehr (C-49).')
  assert.match(OFFENE_FRAGE, /nicht als 0/,
    'Der BLS-Befund fehlt in der Frage (C-49).')
})

test('C-324: keine Sportler-Variante, keine erfundene Zahl', () => {
  // `[cmd]` **E-25 ausdruecklich:** *„Eine Sportler-Variante waere
  // unsere Formel, nicht die belegte."* `[read]` **Und der Auftrag
  // sagt es noch einmal.** Der Waechter prueft, dass hier keine
  // Formel steht — die Datei haelt eine Messung fest, sie rechnet
  // nicht.
  // `[read]` **Ohne Kommentare pruefen.** Die erste Fassung las die
  // Datei roh und fiel an ihrer EIGENEN Begruendung — der Satz
  // *„Keine Sportler-Variante"* steht im Kopf der Datei. **G-186 zum
  // dritten Mal:** ein Waechter, der seinen Namen im eigenen
  // Kommentar findet, prueft nichts.
  const s = lies('apps/web/src/lib/nutrition/score-lage.ts')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  assert.doesNotMatch(s, /\/\s*50\b|\/\s*25\b|\/\s*5000\b|\/\s*2400\b/,
    'Hier steht eine NRF-Rechnung — die Datei haelt die Datenlage fest, '
    + 'sie baut den Score nicht (C-49/E-25).')
  assert.doesNotMatch(s, /sportler|athlet/i,
    'Eine Sportler-Variante ist angelegt — E-25 verbietet sie (C-49).')
})

// ══ A-36 ═══════════════════════════════════════════════════════════

test('A-36: Marketplace und Admin sind eigene Produkte, keine Attrappen', () => {
  // `[cmd]` **Gemessen am 2026-08-30:** die Navigation verweist auf
  // `https://marketplace.lumeos.app` und `https://admin.lumeos.app`;
  // **`/v2/marketplace` und `/v2/admin` antworten mit 404.**
  //
  // `[read]` **Damit ist es NICHT der Fall des Coaches-Reiters.** Dort
  // stand die echte Komponente daneben und bekam kein Prop. **Hier
  // gibt es keine Komponente, die verdrahtet werden koennte** — die
  // Module leben ausserhalb dieser Anwendung.
  const s = lies('apps/web/src/components/shell/app-shell.tsx')
  for (const [was, ziel] of [
    ['Marketplace', 'https://marketplace.lumeos.app'],
    ['Admin', 'https://admin.lumeos.app'],
  ] as const) {
    assert.ok(s.includes(ziel),
      `Der ${was}-Eintrag zeigt nicht mehr auf ${ziel} — dann ist A-36 `
      + 'neu zu messen (ist daraus eine Route in dieser App geworden?).')
  }
})

test('A-36: das Admin-Modul ist gebaut, nur woanders', () => {
  // `[cmd]` **`AdminFoodDB` aus A-36 heisst heute `curation`:**
  // `apps/admin/src/app/curation/page.tsx`, 314 Zeilen, mit
  // Anmeldung, Middleware und Tests daneben.
  //
  // `[read]` **Ein Punkt, der es als Attrappe fuehrt, ist um eine
  // ganze App herum veraltet.**
  const dateien = execFileSync('git', ['ls-files', '--', 'apps/admin/src/'],
    { cwd: WURZEL, encoding: 'utf8' }).split('\n').filter(Boolean)
  assert.ok(dateien.some(f => f.includes('curation/page.tsx')),
    'Die Kurationsseite ist weg — dann stimmt die A-36-Abnahme nicht mehr.')
  assert.ok(dateien.some(f => f.includes('middleware.ts')),
    'Die Admin-Middleware ist weg (A-36).')
})

test('A-36: der Mockup traegt die drei Module, der Code zieht nichts daraus', () => {
  // `[cmd]` **`module-stubs-replacement.jsx` liegt unter
  // `docs/spezifikation/`** — als Entwurf, nicht als Code.
  // `[cmd]` **Kein `apps/`- oder `packages/`-Import zeigt darauf.**
  //
  // `[read]` **Der Punkt beschreibt eine Quelle, kein Bauteil.** Was
  // daraus wird, ist eine Produktentscheidung — Marketplace und
  // Onboarding sind in dieser App nicht gebaut, und das ist Absicht.
  // `[read]` **`git grep -l` endet mit 1, wenn es nichts findet** —
  // und das ist hier der Erfolgsfall. Die erste Fassung liess den
  // Wurf durch und meldete „Command failed" statt „sauber".
  let treffer: string[] = []
  try {
    treffer = execFileSync('git', ['grep', '-l', 'module-stubs',
      '--', 'apps/', 'packages/'], { cwd: WURZEL, encoding: 'utf8' })
      .split('\n').filter(Boolean)
  } catch (e) {
    const status = (e as { status?: number }).status
    // 1 = kein Treffer. Alles andere ist ein echter Fehler.
    if (status !== 1) throw e
  }
  assert.deepEqual(treffer, [],
    'Jetzt zieht Code aus dem Mockup — dann ist A-36 neu zu bewerten:\n  '
    + treffer.join('\n  '))
})
