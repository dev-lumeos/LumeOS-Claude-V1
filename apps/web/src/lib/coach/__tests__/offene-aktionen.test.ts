// G-258 / E-29: die offenen Coach-Aktionen im Tagebuch.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  lageVon, fristSatz, LAGE_TEXT, type OffeneAktion,
} from '../offene-aktionen'
import { titelVon, untertitel } from '../../../app/v2/nutrition/pending-echt'

const lies = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8')
const ohneKommentare = (f: string) => lies(f)
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const JETZT = new Date('2026-08-30T12:00:00Z')

function aktion(teil: Partial<OffeneAktion> = {}): OffeneAktion {
  return {
    id: 'a1',
    module: 'nutrition',
    action_type: 'adjust_macro_targets',
    preview: null,
    payload: null,
    status: 'pending',
    expires_at: null,
    created_at: '2026-08-20T10:00:00Z',
    ...teil,
  }
}

// ══ Der Befund aus C-354: pending mit vergangener Frist ═════════════

test('G-258: abgelaufen ist weder offen noch erledigt', () => {
  // `[cmd]` **Der Befund aus dem Bau von C-354:** die beiden
  // `dev`-Zeilen tragen `status = 'pending'` UND einen vergangenen
  // `expires_at`. **Die Funktion gibt beides unveraendert aus, einen
  // Verfall-Schreibweg gibt es nicht.**
  //
  // `[read]` **Also entscheidet die Anzeige** — mit drei Zustaenden.
  // **„Abgelaufen" ist NICHT „erledigt":** niemand hat bestaetigt oder
  // abgelehnt, die Frist ist verstrichen. Wer beides zusammenwirft,
  // behauptet eine Entscheidung, die nie gefallen ist.
  assert.equal(
    lageVon(aktion({ expires_at: '2026-08-20T10:38:00Z' }), JETZT),
    'abgelaufen')
  assert.equal(
    lageVon(aktion({ expires_at: '2026-09-01T10:00:00Z' }), JETZT),
    'offen')
  assert.equal(
    lageVon(aktion({ status: 'confirmed', expires_at: '2026-08-20T10:38:00Z' }), JETZT),
    'erledigt')
  // Ohne Frist bleibt sie offen — eine fehlende Frist ist keine
  // abgelaufene.
  assert.equal(lageVon(aktion({ expires_at: null }), JETZT), 'offen')
  // Und die drei Saetze sind unterscheidbar.
  assert.notEqual(LAGE_TEXT.abgelaufen, LAGE_TEXT.erledigt)
  assert.match(LAGE_TEXT.abgelaufen, /nicht bestätigt und nicht abgelehnt/)
})

test('G-258: eine kaputte Frist macht die Aktion nicht abgelaufen', () => {
  // `[read]` **`NaN` ist keine Vergangenheit.** Wer die Pruefung
  // ungeschuetzt rechnet, bekommt `false` und damit „offen" — hier
  // steht es ausdruecklich, damit es nicht zufaellig stimmt.
  assert.equal(lageVon(aktion({ expires_at: 'kein datum' }), JETZT), 'offen')
  assert.equal(fristSatz(aktion({ expires_at: 'kein datum' }), JETZT), '')
})

test('G-258: der Untertitel zaehlt nicht falsch', () => {
  // `[cmd]` **Beide dev-Zeilen sind pending mit vergangener Frist.**
  // `[read]` **Ein Untertitel „2 open" waere damit falsch** — offen ist
  // keine. Genau diese Verwechslung soll der Text verhindern.
  const stand = { aktionen: [], fehler: null, gelesenUm: '' }
  assert.equal(untertitel(0, 2, stand), '2 abgelaufen')
  assert.equal(untertitel(1, 2, stand), '1 offen · 2 abgelaufen')
  assert.equal(untertitel(0, 0, stand), 'keine offenen')
  // `[read]` „Nicht geladen" ist nicht „keine offenen".
  assert.equal(
    untertitel(0, 0, { aktionen: [], fehler: 'kaputt', gelesenUm: '' }),
    'nicht geladen')
})

test('G-258: die Frist steht in Worten, in beide Richtungen', () => {
  assert.match(fristSatz(aktion({ expires_at: '2026-08-30T12:30:00Z' }), JETZT),
    /noch 30 min/)
  assert.match(fristSatz(aktion({ expires_at: '2026-08-30T11:30:00Z' }), JETZT),
    /vor 30 min abgelaufen/)
  assert.equal(fristSatz(aktion({ expires_at: null }), JETZT), '')
})

test('G-258: der Titel erfindet keine Struktur in preview', () => {
  // `[cmd]` **`preview` ist ein `jsonb`** — was darin steht, ist nicht
  // zugesichert. `[read]` **Deshalb ein Rueckfall auf `action_type`,
  // statt eine Struktur vorauszusetzen, die niemand garantiert.**
  assert.equal(titelVon(aktion({ preview: { title: 'Makros anpassen' } })),
    'Makros anpassen')
  assert.equal(titelVon(aktion({ preview: null })), 'Adjust macro targets')
  assert.equal(titelVon(aktion({ preview: { irgendwas: 42 } })),
    'Adjust macro targets')
  // Ein leerer Titel zaehlt nicht als Titel.
  assert.equal(titelVon(aktion({ preview: { title: '   ' } })),
    'Adjust macro targets')
})

// ══ E-29: die Naht ═════════════════════════════════════════════════

test('E-29: das Tagebuch liest nicht direkt in coach.*', () => {
  // **Entschieden in E-29:** ueber eine Funktion, nicht direkt.
  //
  // `[read]` **Die Wirkung pruefen, nicht das Wort:** nicht „kommt
  // `offene_aktionen` vor", sondern — greift hier irgendwo ein
  // `.from(...)` auf eine Coach-Tabelle zu?
  const s = ohneKommentare('src/lib/coach/offene-aktionen.ts')
  assert.match(s, /\.rpc\('offene_aktionen', \{ p_modul: modul \}\)/,
    'Der Leseweg ruft die Funktion nicht mehr (E-29/G-258).')
  assert.doesNotMatch(s, /\.from\(/,
    'Hier wird direkt auf eine Tabelle zugegriffen — E-29 verlangt die '
    + 'Funktion (G-258).')
  // Und keine fremde Kennung: der Klient kommt aus auth.uid().
  assert.doesNotMatch(s, /p_client|client_id:/,
    'Es wird eine Kennung mitgeschickt — die Funktion nimmt keine, und '
    + 'genau das ist die Naht (E-29).')
})

test('E-29: A-30 — die Browserdatei importiert keinen Leseweg', () => {
  // `[cmd]` **A-30:** kein Wertimport aus dem Leseweg in eine Datei,
  // die im Browser laeuft. `[read]` **Typen sind erlaubt, Aufrufe
  // nicht** — `createSessionClient` gehoert auf den Server.
  const s = ohneKommentare('src/app/v2/nutrition/pending-echt.tsx')
  assert.doesNotMatch(s, /createSessionClient|ladeOffeneAktionen/,
    'Die Kachel zieht den Leseweg in den Browser (A-30).')
  // Sie bekommt den Stand als Prop.
  assert.match(s, /stand: OffeneAktionenStand/,
    'Die Kachel nimmt den Stand nicht mehr als Prop (G-258).')
})

test('G-258: der Entwurf weicht dem echten Weg', () => {
  // `[read]` **Muster G-90:** der Entwurf bleibt nur, solange gar
  // nichts geladen wurde. **Sonst stuende eine Attrappe da, die drei
  // erfundene Aktionen zeigt, waehrend der Coach keine hat.**
  const s = ohneKommentare('src/app/v2/nutrition/ansicht.tsx')
  assert.match(s, /offeneAktionen\s*\n?\s*\?\s*<NutritionPendingEcht/,
    'Der echte Weg ersetzt den Entwurf nicht (G-258).')
})

test('G-258: die Zeit kommt als Prop, nicht aus der Kachel', () => {
  // `[read]` **Sonst rechnet der Server eine andere Minute als der
  // Browser und React bricht die Hydration ab** — derselbe Fehler, den
  // `tab-insights.tsx` mit `Math.random()` hatte.
  const s = ohneKommentare('src/app/v2/nutrition/pending-echt.tsx')
  assert.doesNotMatch(s, /Date\.now\(\)|new Date\(\)/,
    'Die Kachel holt sich die Zeit selbst (G-258).')
  assert.match(s, /jetzt: string/, 'Die Zeit kommt nicht als Prop (G-258).')
})
