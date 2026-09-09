// Die Mockup-Referenz des Portals — G-398.
//
// **Tom, 2026-09-08:** *„mit allen ansichten das komplette portal
// will ich morgen sehen — mit schon angebundenen sachen die schon
// vorhanden sind, und die mockups."*
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { REFERENZ, alleKarten } from '../../components/mockup-referenz'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..')
const VORLAGEN = join(WURZEL, 'docs', 'spezifikation', '10-plattform',
  'design-system', 'theme-v1')

function lies(...p: string[]): string {
  return readFileSync(join(...p), 'utf8')
}

/** Die sechzehn Reiter, in der Reihenfolge der Vorlage. */
const REITER = ['overview', 'athletes', 'analytics', 'alerts', 'rules',
  'autonomy', 'patterns', 'intervene', 'consent', 'plans', 'workflows',
  'onboard', 'programs', 'messages', 'revenue', 'team']

test('die Reiterliste stimmt mit der Vorlage ueberein', () => {
  // ══ DIE LISTE IST ABGELESEN, NICHT ERFUNDEN ════════════════════
  //
  // `[cmd]` **`module-coach.jsx:923-940`** fuehrt die sechzehn
  // Eintraege. `[read]` **Wer hier einen erfindet oder einen
  // vergisst, baut ein Portal, das die Vorlage nicht kennt.**
  // `[cmd]` **Die Datei fuehrt ZWEI Reiterlisten:** die des
  // Athletenzweigs (`:183-194`, zehn Eintraege) und die des Portals
  // (`:923-940`, sechzehn). `[read]` **Die erste Fassung dieser
  // Probe las beide und meldete 26** — richtig gemessen, falsche
  // Menge. **Also am Anker `CoachPortalStandalone` schneiden**, nicht
  // an einer Zeilennummer, die mit jeder Einfuegung wandert.
  const q = lies(VORLAGEN, 'module-coach.jsx')
  const anker = q.indexOf('CoachPortalStandalone')
  assert.ok(anker > 0, 'der Portalrahmen `CoachPortalStandalone` fehlt in der Vorlage')
  const ids = Array.from(q.slice(anker).matchAll(/\{\s*id:\s*"(\w+)",\s*label:/g),
    m => m[1])
  assert.deepEqual(ids, REITER,
    `die Vorlage fuehrt jetzt [${ids.join(', ')}] — die Referenz kennt `
    + `[${REITER.join(', ')}]`)
})

test('alle sechzehn Reiter haben eine Referenz', () => {
  // `[cmd]` **Gemessen am Schirm: vorher 0 von 16 Reitern mit
  // Trennlinie.** `[read]` **Ohne Linie gibt es kein Oben und
  // Unten** — und genau die verlangt E-69.
  for (const r of REITER) {
    assert.ok(REFERENZ[r], `der Reiter "${r}" hat keine Referenz`)
    assert.ok(REFERENZ[r].karten.length > 0,
      `der Reiter "${r}" hat eine leere Referenz — dann steht dort eine `
      + 'Linie ohne Inhalt, und E-72 verbietet den nackten Rahmen')
  }
  assert.equal(Object.keys(REFERENZ).length, 16,
    'die Referenz fuehrt nicht genau sechzehn Reiter')
})

test('44 Portalkarten, und jede nennt ihre Quelle', () => {
  // `[cmd]` **Gemessen 2026-09-09: die acht Vorlagen tragen 62 Karten
  // mit Namen, 44 davon gehoeren einem Portalreiter.** Die uebrigen
  // 18 sind Klientensicht und stehen in `apps/web`.
  const k = alleKarten()
  assert.equal(k.length, 44,
    `die Referenz fuehrt ${k.length} Karten, gemessen sind es 44`)
  for (const x of k) {
    assert.match(x.quelle, /module-coach[\w-]*\.jsx:\d+/,
      `"${x.titel}" nennt keine Fundstelle mit Zeilennummer — dann ist `
      + 'nicht nachpruefbar, woher die Kachel stammt')
  }
})

test('jede Karte traegt genau eine Stufe, und blockiert nennt die Tabelle', () => {
  // ══ A3: JE BLOCKIERTER KARTE DIE FEHLENDE TABELLE ══════════════
  //
  // `[read]` **Ein Vermerk ohne Grund ist eine Attrappe der
  // Attrappe** — er sagt „geht nicht", aber nicht, woran es liegt.
  for (const k of alleKarten()) {
    assert.ok(['angebunden', 'baubar', 'blockiert'].includes(k.stufe),
      `"${k.titel}" traegt die unbekannte Stufe "${k.stufe}"`)
    if (k.stufe === 'blockiert') {
      assert.ok(k.fehlt && k.fehlt.length > 10,
        `"${k.titel}" ist blockiert, nennt aber keine fehlende Tabelle`)
      assert.ok(!k.tabellen?.length,
        `"${k.titel}" ist blockiert UND nennt Tabellen — eines von beidem `
        + 'ist falsch')
    } else {
      assert.ok(k.tabellen && k.tabellen.length > 0,
        `"${k.titel}" ist ${k.stufe}, nennt aber keine Tabelle`)
      assert.ok(!k.fehlt,
        `"${k.titel}" ist ${k.stufe} und nennt trotzdem etwas Fehlendes`)
    }
  }
})

test('die genannten coach-Tabellen gibt es wirklich', () => {
  // ══ EINE ERFUNDENE TABELLE IST EINE FALSCHAUSSAGE ══════════════
  //
  // `[cmd]` **Gemessen: das Schema `coach` fuehrt 15 Tabellen.**
  // `[read]` **Wer eine nennt, die es nicht gibt, schickt den
  // naechsten Leser in die Irre** — und der Vermerk sieht dabei
  // genauso aus wie ein richtiger.
  const COACH = new Set([
    'action_log', 'alerts', 'autonomy_change_log', 'checkin_templates',
    'checkins', 'client_autonomy', 'client_consent_log', 'client_permissions',
    'coach_profiles', 'messages', 'pending_actions', 'pending_invites',
    'permission_change_log', 'relationship_change_log', 'relationships',
  ])
  let genannt = 0
  for (const k of alleKarten()) {
    for (const t of k.tabellen ?? []) {
      const [schema, name] = t.split('.')
      if (schema !== 'coach') continue
      genannt++
      assert.ok(COACH.has(name),
        `"${k.titel}" nennt \`${t}\` — die Tabelle gibt es im Schema coach nicht`)
    }
  }
  assert.ok(genannt >= 10,
    `nur ${genannt} coach-Tabellen genannt — nennt die Referenz noch, `
    + 'worauf jede Karte wartet?')
})

test('angebunden heisst: das Portal liest die Tabelle wirklich', () => {
  // ══ DIE GRENZE ZWISCHEN angebunden UND baubar ══════════════════
  //
  // `[cmd]` **Gemessen: `lib/daten.ts` liest elf Tabellen direkt und
  // `relationships` ueber die Funktion `klienten()`** — zusammen
  // zwoelf von fuenfzehn.
  //
  // `[read]` **Ohne diese Probe waere „angebunden" eine Behauptung.**
  // Sie prueft die Sache: steht die Tabelle im Leseweg?
  const daten = lies(HIER, '..', 'daten.ts')
  const gelesen = new Set(
    Array.from(daten.matchAll(/from\('(\w+)'\)/g), m => m[1]))
  // `relationships` kommt ueber die Funktion, nicht ueber `.from()`.
  assert.match(daten, /rpc\('klienten'\)/,
    'der Leseweg fuer die Klienten ist weg — dann ist `relationships` '
    + 'nicht mehr angebunden')
  gelesen.add('relationships')

  for (const k of alleKarten()) {
    if (k.stufe !== 'angebunden') continue
    for (const t of k.tabellen ?? []) {
      const [schema, name] = t.split('.')
      if (schema !== 'coach') continue
      assert.ok(gelesen.has(name),
        `"${k.titel}" gilt als angebunden, aber \`${t}\` steht in keinem `
        + 'Leseweg von `lib/daten.ts` — dann ist sie baubar, nicht angebunden')
    }
  }
})

test('baubar heisst: die Tabelle wird NICHT gelesen', () => {
  // `[read]` **Die Gegenrichtung** — sonst koennte alles „baubar"
  // heissen, auch was laengst angebunden ist. `[cmd]` **Gemessen
  // ungelesen: `client_consent_log`, `coach_profiles`,
  // `pending_invites`** — genau die drei leeren Tabellen.
  const daten = lies(HIER, '..', 'daten.ts')
  const gelesen = new Set(
    Array.from(daten.matchAll(/from\('(\w+)'\)/g), m => m[1]))
  gelesen.add('relationships')

  // ══ WAS DIESE PROBE PRUEFEN KANN -- UND WAS NICHT ══════════════
  //
  // `[read]` **Sie prueft das Schema `coach`**, wo „gelesen" gleich
  // „im Portal verfuegbar" heisst. `[cmd]` **Ausgenommen ist
  // `training.workout_sessions`**: die Tabelle steht im Leseweg, aber
  // nur je Athlet (`.eq('user_id', clientId)`, `daten.ts:282`) — die
  // Uebersicht ueber ALLE Klienten eines Tages gibt es nicht.
  //
  // `[read]` **Der Unterschied liegt im Filter, nicht im
  // Tabellennamen** — und den kann ein Namensvergleich nicht sehen.
  // **Also benannt statt stillschweigend uebergangen:** wer die
  // Ausnahme streicht, muss den Fall neu beurteilen.
  const NUR_JE_ATHLET = new Set(['workout_sessions'])
  for (const k of alleKarten()) {
    if (k.stufe !== 'baubar') continue
    const namen = (k.tabellen ?? [])
      .map(t => t.split('.').pop()!)
      .filter(n => !NUR_JE_ATHLET.has(n))
    if (namen.length === 0) continue
    assert.ok(namen.some(n => !gelesen.has(n)),
      `"${k.titel}" gilt als baubar, aber ALLE ihre Tabellen `
      + `(${namen.join(', ')}) werden gelesen — dann ist sie angebunden`)
  }
  // `[cmd]` **Die Ausnahme selbst belegen** — sonst altert sie zur
  // Blockade, wenn jemand den Filter entfernt.
  assert.match(daten, /workout_sessions'\)[\s\S]{0,200}?clientId/,
    '`workout_sessions` wird nicht mehr je Athlet gelesen — dann ist '
    + '"Today\'s sessions logged" neu zu beurteilen')
})

test('die Trennlinie steht in apps/coach, nicht importiert aus apps/web', () => {
  // ══ WARUM EINE EIGENE FASSUNG ══════════════════════════════════
  //
  // `[cmd]` **`apps/coach/tsconfig.json` loest `@/*` auf `./src/*`
  // und `@lumeos/*` auf `packages/*`** — fuer `apps/web` gibt es
  // keinen Alias. `[read]` **Ein Import aus einer fremden Anwendung
  // waere ein Weg, den der Compiler nicht kennt.**
  const t = lies(HIER, '..', '..', 'components', 'referenz-trenner.tsx')
  assert.match(t, /data-referenz-trenner=/,
    'die Marke fehlt — dann misst kein Werkzeug mehr, wo die Linie liegt')
  assert.ok(!/from '.*apps\/web/.test(t),
    'die Trennlinie importiert aus `apps/web` — zwei Anwendungen, die '
    + 'nur ueber `packages/` verbunden sein sollten')

  const ref = lies(HIER, '..', '..', 'components', 'tab-referenz.tsx')
  assert.match(ref, /<ReferenzTrenner\s/,
    'die Referenz setzt keine Trennlinie mehr')
})

test('die acht Vorlagen liegen vor, und die Fundstellen stimmen', () => {
  // `[read]` **Eine Zeilennummer altert** — faellt diese Probe, hat
  // jemand die Vorlagen geaendert, und die Referenz zeigt auf die
  // falsche Stelle.
  const stichprobe: Array<[string, number, string]> = [
    ['module-coach.jsx', 502, 'Athletes needing attention'],
    ['module-coach-extras.jsx', 331, 'Rule canvas'],
    ['module-coach-gaps.jsx', 243, 'Adherence forecast'],
    ['module-coach-programs.jsx', 82, 'Programs'],
    ['module-coach-portal-workflows.jsx', 239, 'Client onboarding'],
    ['module-coach-portal-v2.jsx', 360, 'Audit log'],
  ]
  for (const [datei, zeile, titel] of stichprobe) {
    const zeilen = lies(VORLAGEN, datei).split('\n')
    assert.ok(zeilen[zeile - 1]?.includes(titel),
      `${datei}:${zeile} traegt nicht mehr "${titel}" — die Fundstellen `
      + 'der Referenz sind veraltet')
  }
})
