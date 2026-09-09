// Die zehn Vorlagenkarten ohne Gegenstueck — G-391.
//
// **Tom, 2026-09-08:** *„coach mockup erstellen, ueberlagernd mit dem
// bestehenden was schon gebaut ist."*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..', '..', '..')
const VORLAGEN = join(WURZEL, 'docs', 'spezifikation', '10-plattform',
  'design-system', 'theme-v1')

function lies(...p: string[]): string {
  return readFileSync(join(...p), 'utf8')
}

/** Karten mit Namen: `<Card …>` und `<CMod …>` mit `title=`. */
function karten(quelle: string): number {
  return (quelle.match(/<(?:Card|CMod)\b(?:[^>]|\n){0,400}?\btitle=/g) ?? []).length
}

test('es sind acht Coach-Vorlagen, nicht sieben und nicht neun', () => {
  // `[cmd]` **Gemessen 2026-09-09.** `[read]` **Eine neue Datei ist
  // fuer eine feste Liste unsichtbar** — deshalb das Verzeichnis
  // fragen, nicht eine Aufzaehlung pflegen.
  const dateien = readdirSync(VORLAGEN)
    .filter(d => /^module-coach.*\.jsx$/.test(d))
    .sort()
  assert.equal(dateien.length, 8,
    `es sind ${dateien.length} Coach-Vorlagen, nicht 8 — `
    + `die Zuordnung in G-391 deckt dann nicht mehr alles ab: ${dateien.join(', ')}`)
})

test('die acht Vorlagen tragen 62 Karten mit Namen', () => {
  // ══ DIE ZAHL IST GEMESSEN, NICHT UEBERNOMMEN ═══════════════════
  //
  // `[cmd]` **Der Auftrag nennt 73.** `[cmd]` **Nachgezaehlt sind es
  // 62** — und keine Zaehlregel ergibt 73: weder `<Card` allein
  // (125), noch `<Card title=` (55), noch Card+CMod mit Titel (62).
  // **Die 73 ist aus den Dateien nicht reproduzierbar.**
  //
  // `[read]` **Faellt diese Probe, hat jemand die Vorlagen geaendert**
  // — dann stimmt auch die Dreiteilung nicht mehr.
  const dateien = readdirSync(VORLAGEN).filter(d => /^module-coach.*\.jsx$/.test(d))
  const summe = dateien.reduce((n, d) => n + karten(lies(VORLAGEN, d)), 0)
  assert.equal(summe, 62,
    `die acht Vorlagen tragen ${summe} benannte Karten, nicht 62`)
})

test('module-coach-meta.jsx traegt keine benannte Karte', () => {
  // `[cmd]` **Der Auftrag sagt es (0 Karten), und es stimmt** — die
  // Datei liefert `CoachRelationshipCard` und `ONBOARD_STEPS`,
  // Bausteine ohne eigene `<Card title=`.
  assert.equal(karten(lies(VORLAGEN, 'module-coach-meta.jsx')), 0,
    'module-coach-meta.jsx traegt jetzt benannte Karten — dann fehlt '
    + 'sie in der Zuordnung')
})

test('die zehn Karten stehen unter einer eigenen Linie', () => {
  // `[read]` **E-69: die Referenz gehoert unter die Trennlinie.**
  // **Ohne sie ist nicht ablesbar, was gebaut und was Entwurf ist.**
  const q = lies(HIER, '..', 'mockup-referenz-portal.tsx')
  assert.match(q, /<ReferenzTrenner\s/,
    'der Abschnitt hat keine Trennlinie mehr — dann steht die Referenz '
    + 'wie gebaute Ware da')
  const titel = (q.match(/<Card\b(?:[^>]|\n){0,400}?\btitle="/g) ?? []).length
  assert.equal(titel, 11,
    `der Abschnitt fuehrt ${titel} Karten, erwartet 11 `
    + '(zehn ohne Gegenstueck + die Erklaerkachel)')
})

test('jede der zehn nennt ihre Stufe und ihren Grund', () => {
  // ══ E-72: KEIN VERMERK OHNE GRUND ══════════════════════════════
  //
  // `[cmd]` **Neun der zehn tragen `attrappe=`** — die zehnte ist die
  // Erklaerkachel, die keine Attrappe IST, sondern sie beschreibt.
  // `[read]` **Und jeder Vermerk nennt, WORAUF gewartet wird** —
  // *„wartet auf: nichts"* ist auch eine Angabe, aber eine gemessene.
  const q = lies(HIER, '..', 'mockup-referenz-portal.tsx')
  const vermerke = (q.match(/attrappe=\{fehlt\(/g) ?? []).length
  assert.equal(vermerke, 10,
    `${vermerke} Karten tragen einen Attrappenvermerk, erwartet 10`)
  for (const stufe of ['angebunden', 'baubar', 'blockiert']) {
    assert.ok(new RegExp(`art="${stufe}"`).test(q),
      `die Stufe "${stufe}" kommt nicht mehr vor — die Dreiteilung `
      + 'ist der Zweck dieses Auftrags')
  }
})

test('die genannten Tabellen gibt es wirklich', () => {
  // ══ EINE ERFUNDENE TABELLE IST EINE FALSCHAUSSAGE ══════════════
  //
  // `[cmd]` **Gemessen: `coach` fuehrt 15 Tabellen.** `[read]` **Wer
  // eine nennt, die es nicht gibt, schickt den naechsten Leser in
  // die Irre** — und der Vermerk sieht dabei genauso aus wie ein
  // richtiger.
  const TABELLEN = new Set([
    'action_log', 'alerts', 'autonomy_change_log', 'checkin_templates',
    'checkins', 'client_autonomy', 'client_consent_log', 'client_permissions',
    'coach_profiles', 'messages', 'pending_actions', 'pending_invites',
    'permission_change_log', 'relationship_change_log', 'relationships',
  ])
  const q = lies(HIER, '..', 'mockup-referenz-portal.tsx')
  // `[cmd]` **Nur Kleinbuchstaben und Unterstriche** —
  // `coach.bekanntOffen` ist ein Schluessel in
  // `vollstaendigkeit.mjs`, keine Tabelle, und `coach.lumeos.app`
  // eine Adresse. **Beide fielen der ersten Fassung dieser Probe zum
  // Opfer**, und das war richtig: sie hat ihre eigene Ungenauigkeit
  // gemeldet. `[read]` **Ein Unterstrich zur Pflicht zu machen waere
  // die Ueberkorrektur gewesen** — `coach.checkins` und
  // `coach.alerts` haben keinen.
  const genannt = Array.from(q.matchAll(/`coach\.([a-z][a-z_]*)`/g), m => m[1])
  // `[cmd]` **Gemessen: 7 Nennungen, 5 verschiedene Tabellen**
  // (`checkins`, `action_log`, `pending_actions`, `client_consent_log`,
  // `alerts`). `[read]` **Untergrenze auf die VERSCHIEDENEN**, nicht
  // auf die Nennungen — sonst genuegte es, dieselbe siebenmal zu
  // schreiben.
  const verschieden = new Set(genannt)
  assert.ok(verschieden.size >= 5,
    `nur ${verschieden.size} verschiedene Tabellen genannt — nennt der `
    + 'Abschnitt noch, woran es je Karte liegt?')
  for (const t of genannt) {
    assert.ok(TABELLEN.has(t),
      `\`coach.${t}\` steht im Vermerk, aber nicht im Schema — `
      + 'ein Vermerk mit falschem Grund verhindert, dass jemand nachsieht')
  }
})

test('der Vermerk auf invites und onboard behauptet keinen Mangel mehr', () => {
  // ══ ZWEI FALSCHAUSSAGEN, BEIDE GEMESSEN WIDERLEGT ══════════════
  //
  // `[cmd]` **Hier stand:** *„steht in keiner theme-v1-Datei."*
  //
  //     onboard   module-coach-meta.jsx:77-147  -- die QUELLE des
  //               Reiters, genannt im Kopf von tab-onboarding.tsx
  //     invites   module-coach.jsx:249 und :475
  //
  // `[read]` **Ein Vermerk mit falschem Grund ist selbsterhaltend:**
  // er sagt, es gebe nichts nachzusehen.
  const q = lies(HIER, '..', 'mockup-referenz.tsx')
  assert.ok(!/steht in keiner theme-v1-Datei/.test(q),
    'die widerlegte Behauptung ist zurueck — beide Reiter HABEN eine '
    + 'Vorlage, gemessen 2026-09-09')

  // Und die Gegenprobe an der Quelle selbst.
  const meta = lies(VORLAGEN, 'module-coach-meta.jsx')
  assert.match(meta, /ONBOARD_STEPS/,
    'module-coach-meta.jsx fuehrt ONBOARD_STEPS nicht mehr — dann war '
    + 'die Berichtigung falsch')
  const coach = lies(VORLAGEN, 'module-coach.jsx')
  assert.match(coach, /title="Pending invites"/,
    'module-coach.jsx fuehrt "Pending invites" nicht mehr')
})

test('alle zehn Reiter tragen eine Trennlinie', () => {
  // `[cmd]` **Gemessen am Schirm: vorher 8 von 10.** `invites` und
  // `onboard` setzten eine Karte, aber keinen `ReferenzTrenner`.
  // `[read]` **Ohne Linie gibt es kein Oben und Unten** — genau die
  // verlangt E-69.
  const q = lies(HIER, '..', 'mockup-referenz.tsx')
  const block = q.slice(q.indexOf('export function CoachOhneMockup'))
    .slice(0, 1400)
  assert.match(block, /<ReferenzTrenner\s/,
    '`CoachOhneMockup` setzt keine Trennlinie — dann stehen `invites` '
    + 'und `onboard` ohne Grenze zwischen Gebautem und Referenz')
})
