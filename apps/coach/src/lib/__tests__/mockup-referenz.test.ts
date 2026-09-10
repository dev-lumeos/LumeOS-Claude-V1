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
import { ABGLEICH, abgleichZahlen } from '../../components/feld-abgleich'
import { PORTAL_NAV, alleEintraege, bereichFuerReiter } from '../../components/portal-nav'

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

test('die Trennlinie kommt aus dem Paket — EINE Fassung', () => {
  // ══ G-402/A6: DIE DOPPELUNG IST AUFGELOEST ═════════════════════
  //
  // `[cmd]` **G-399 meldete sie, G-401 liess sie stehen** (die
  // eigene Fassung, 30 Zeilen), **G-402 zieht sie ins Paket.**
  // `[read]` **Jetzt gibt es sie einmal**, und beide Anwendungen
  // koennen dieselbe benutzen.
  const t = lies(WURZEL, 'packages', 'ui', 'src', 'referenz-trenner.tsx')
  assert.match(t, /data-referenz-trenner=/,
    'die Marke fehlt — dann misst kein Werkzeug mehr, wo die Linie liegt')

  // `[cmd]` **Und die Kopie in `apps/coach` ist weg.**
  let kopieDa = true
  try {
    lies(HIER, '..', '..', 'components', 'referenz-trenner.tsx')
  } catch {
    kopieDa = false
  }
  assert.equal(kopieDa, false,
    'die eigene Fassung in `apps/coach` ist zurueck — dann steht die '
    + 'Linie wieder zweimal im Haus')

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

// ══════════════════════════════════════════════════════════════════
// G-400: Kopf, Zaehler, Tokens, Felder
// ══════════════════════════════════════════════════════════════════

test('der Kopf nutzt v2-module-header aus @lumeos/ui', () => {
  // ══ A2: DIE KLASSEN SIND DA, GEMESSEN ══════════════════════════
  //
  // `[cmd]` **`packages/ui/src/styles/v2.css` fuehrt alle sieben**,
  // und `layout.tsx:3` laedt genau diese Datei als
  // `@lumeos/ui/styles.css`. `[read]` **Es fehlte nichts** — das
  // Portal hat sie nur nie benutzt.
  const v2 = lies(WURZEL, 'packages', 'ui', 'src', 'styles', 'v2.css')
  for (const k of ['v2-module-header', 'v2-module-title-block',
    'v2-module-title-row', 'v2-module-title', 'v2-module-sub',
    'v2-module-actions', 'v2-module-hero-lite']) {
    assert.ok(new RegExp(`\\.${k}\\b`).test(v2),
      `\`${k}\` steht nicht mehr in v2.css — dann traegt der Kopf eine `
      + 'Klasse ohne Regel')
  }

  // `[cmd]` **G-401: der Modulkopf ist in die Schale gezogen** —
  // er braucht den Bereich, die Athletenzahl und die Alerts.
  // `[read]` **Der Waechter folgt dem Code**, statt auf `page.tsx`
  // zu zeigen, wo er nicht mehr steht.
  const seite = lies(HIER, '..', '..', 'components', 'portal-schale.tsx')
  assert.match(seite, /className="v2-module-header v2-module-hero-lite"/,
    'der Kopf ist wieder eine eigene Fassung — dann sieht das Portal '
    + 'anders aus als jedes andere Modul')
  assert.ok(!/className="cp-kopf"/.test(seite), '`cp-kopf` ist zurueck')

  // `[cmd]` **Die Vorlage traegt VIER Pills und ZWEI Aktionen**
  // (`module-coach.jsx:910-920`).
  // `[cmd]` **Am Ende der Funktion schneiden** — die erste Fassung
  // las bis zum Dateiende und zaehlte den Abmeldeknopf mit, der in
  // G-402 dazukam. `[read]` **Sie mass drei Aktionen statt zwei** und
  // meldete einen Fehler, den es nicht gab.
  const anfang = seite.indexOf('function Modulkopf')
  // `[cmd]` **Bis zur naechsten Funktion schneiden** — die erste
  // Fassung nahm die erste schliessende Klammer und traf damit eine
  // INNERE Verzweigung: der Ausschnitt war leer, die Probe meldete
  // null Pills.
  const naechste = seite.indexOf('function Reiterleiste', anfang)
  const kopf = seite.slice(anfang, naechste > 0 ? naechste : undefined)
  assert.equal((kopf.match(/<Pill\b/g) ?? []).length, 4,
    'der Kopf traegt nicht mehr vier Pills wie die Vorlage')
  assert.equal((kopf.match(/<button\b/g) ?? []).length, 2,
    'der Kopf traegt nicht mehr zwei Aktionen (Broadcast, New plan)')
  assert.match(kopf, /v2-module-sub/,
    'der Untertitel fehlt — die Vorlage hat ihn')
})

test('Knoepfe ohne Ziel sind abgeschaltet und nennen den Grund', () => {
  // `[read]` **C-426: kein Bedienelement ohne Wirkung.** `[cmd]`
  // **Broadcast und New plan haben kein Ziel** — es gibt weder einen
  // Schreibweg fuer Rundnachrichten noch eine Plantabelle.
  // `[cmd]` **G-401: der Modulkopf ist in die Schale gezogen** — er
  // braucht Bereich, Athletenzahl und Alerts. `[read]` **Der
  // Waechter folgt dem Code**, statt auf eine Datei zu zeigen, in
  // der die Sache nicht mehr steht.
  const kopf = lies(HIER, '..', '..', 'components', 'portal-schale.tsx')
  // `[cmd]` **Am JSX ankern, nicht am Kommentar** — die erste
  // Fassung schnitt beim ERSTEN Vorkommen von `v2-module-actions`,
  // und das steht in der Begruendung darueber. **Sie mass den
  // Kommentar und fand null Knoepfe.**
  const block = kopf.slice(kopf.indexOf('<div className="v2-module-actions">'))
    .slice(0, 1600)
  assert.equal((block.match(/\bdisabled\b/g) ?? []).length, 2,
    'ein Knopf ohne Ziel ist wieder anklickbar — er sieht dann aus, '
    + 'als taete er etwas')
  // `[cmd]` **Beide Schreibweisen zulassen** — `title="…"` und
  // `title={'…'}`. `[read]` **Die erste Fassung prueft die
  // SCHREIBWEISE, nicht die Sache:** sie fiel, als der Text zu lang
  // fuer eine Zeile wurde und in geschweifte Klammern wanderte.
  assert.equal((block.match(/title=[{"]'?Attrappe —/g) ?? []).length, 2,
    'ein abgeschalteter Knopf nennt seinen Grund nicht mehr')
})

test('die Zaehler sind rechenbar, nicht erfunden', () => {
  // ══ A3: EIN ZAEHLER OHNE DATEN BLEIBT WEG ══════════════════════
  //
  // `[cmd]` **Die Vorlage traegt sieben** (Athletes, Smart alerts,
  // Rules, Plans, Workflows, Programs, Messages). `[cmd]` **Gebaut
  // sind acht** — vier aus G-398, vier neu, alle aus Zeilen der
  // laufenden Datenbank.
  //
  // `[read]` **Regeln, Plaene und Programme bleiben ohne Zahl** —
  // fuer sie gibt es keine Tabelle.
  //
  // `[cmd]` **G-401: die Schluessel sind jetzt MENGEN, nicht
  // Reiter-Ids** (`klienten` statt `athletes`) — die Seitenleiste
  // fragt nach der Sache, nicht nach dem Reiter. **Der Waechter
  // prueft weiter dieselbe Sache.**
  const seite = lies(HIER, '..', '..', 'app', 'page.tsx')
  const anfang = seite.indexOf('const zaehler: PortalZaehler')
  const block = seite.slice(anfang, seite.indexOf('return (', anfang))
  for (const tot of ['regeln', 'plaene', 'programme', 'umsatz', 'team',
    'analytics', 'muster']) {
    assert.ok(!new RegExp(`^\\s+${tot}:`, 'm').test(block),
      `"${tot}" hat einen Zaehler bekommen — es gibt keine Tabelle, `
      + 'aus der er faellt')
  }
  for (const da of ['klienten', 'ungelesen', 'checkins', 'alerts',
    'rechte', 'autonomie', 'einladungen', 'vorschlaege']) {
    assert.ok(new RegExp(`^\\s+${da}:`, 'm').test(block),
      `der rechenbare Zaehler "${da}" fehlt`)
  }
})

test('die Tokens laufen nicht auseinander', () => {
  // ══ A4: DREI UNTERSCHIEDE, GEMESSEN ════════════════════════════
  //
  // `[cmd]` **`v2.css:574` und `:2184` setzen
  // `transition: … var(--kurve-aus)`.** `[read]` **Ohne das Token
  // faellt der Uebergang stumm auf den Vorgabewert zurueck.**
  const tok = lies(HIER, '..', '..', 'app', 'tokens.css')
  const v2 = lies(WURZEL, 'packages', 'ui', 'src', 'styles', 'v2.css')
  const gebraucht = new Set(
    Array.from(v2.matchAll(/var\((--kurve-[a-z]+)\)/g), m => m[1]))
  assert.ok(gebraucht.size > 0, 'v2.css benutzt keine Kurven mehr')
  for (const k of gebraucht) {
    assert.ok(new RegExp(`^\\s*${k}\\s*:`, 'm').test(tok),
      `v2.css benutzt \`${k}\`, tokens.css definiert es nicht — der `
      + 'Uebergang faellt stumm auf den Vorgabewert zurueck')
  }

  // `[cmd]` **Die elf Modul-Akzenttokens aus G-384, vollstaendig.**
  const lume = lies(WURZEL, 'apps', 'web', 'src', 'styles', 'themes', 'lume.css')
  const akzente = Array.from(lume.matchAll(/^\s*(--acc-[a-z]+)\s*:/gm), m => m[1])
  assert.ok(akzente.length >= 11,
    `lume.css fuehrt nur ${akzente.length} Akzenttokens`)
  for (const a of akzente) {
    assert.ok(new RegExp(`^\\s*${a}\\s*:`, 'm').test(tok),
      `das Akzenttoken \`${a}\` fehlt im Portal — dann faerbt ein Modul `
      + 'dort anders als in apps/web')
  }
})

test('der Abgleich zaehlt Felder, nicht Karten', () => {
  // ══ A1: DER MASSSTAB DIESES AUFTRAGS ═══════════════════════════
  //
  // `[read]` **G-391 und G-398 haben Karten gezaehlt** — eine Karte
  // mit richtigem Titel und falscher Form galt als „angebunden".
  const z = abgleichZahlen()
  assert.ok(z.vorlage > 50,
    `der Abgleich fuehrt nur ${z.vorlage} Felder — zu wenig fuer 14 Karten`)
  assert.equal(z.gebaut + z.fehlt, z.vorlage, 'die Zahlen gehen nicht auf')
  for (const k of ABGLEICH) {
    assert.ok(k.felder.length > 0, `"${k.titel}" fuehrt keine Felder`)
    assert.match(k.quelle, /module-coach[\w-]*\.jsx:\d+/,
      `"${k.titel}" nennt keine Fundstelle mit Zeilennummer`)
    for (const f of k.felder) {
      if (f.da) {
        assert.ok(!f.grund,
          `"${k.titel}" / "${f.name}" ist gebaut UND traegt einen Grund`)
      } else {
        assert.ok(f.grund,
          `"${k.titel}" / "${f.name}" fehlt ohne Grund — das ist die `
          + 'Angabe, um die es in diesem Auftrag geht')
        if (f.grund === 'keine-daten') {
          assert.ok(f.fehlt && f.fehlt.length > 10,
            `"${k.titel}" / "${f.name}" nennt keine fehlende Tabelle`)
        }
      }
    }
  }
})

// ══════════════════════════════════════════════════════════════════
// G-401: die Schale — Seitenleiste, Modulkopf, Reiterleiste
// ══════════════════════════════════════════════════════════════════

test('alle sechzehn Reiter haben einen Bereich', () => {
  // ══ A2/A4: KEIN REITER DARF VERLOREN GEHEN ═════════════════════
  //
  // `[read]` **Die Navigation hat eine Ebene bekommen** — sechzehn
  // Reiter liegen jetzt in elf Bereichen. **Wer dabei einen
  // vergisst, macht eine Ansicht unerreichbar**, ohne dass etwas
  // rot wird.
  const seite = lies(HIER, '..', '..', 'app', 'page.tsx')
  const tabs = Array.from(seite.matchAll(/\{ id: '(\w+)', label: '/g), m => m[1])
  assert.equal(tabs.length, 16, `page.tsx fuehrt ${tabs.length} Reiter, nicht 16`)

  // `[read]` **`?? []` wegen der Aussenlinks aus G-404** — sie
  // fuehren keine Reiter, und `flatMap` faellt sonst ueber sie.
  const inNav = new Set(alleEintraege().flatMap(e => (e.reiter ?? []).map(r => r.id)))
  for (const t of tabs) {
    assert.ok(inNav.has(t),
      `der Reiter "${t}" steht in keinem Bereich — er waere nicht mehr `
      + 'erreichbar')
  }
  // `[cmd]` **G-404: siebzehn** — die sechzehn der Vorlage plus
  // `settings`, das die Vorlage NICHT fuehrt (A5). `[read]` **Die
  // Bedingung bleibt dieselbe:** kein Vorlagenreiter darf fehlen.
  assert.equal(inNav.size, 17,
    `die Navigation fuehrt ${inNav.size} Reiter, erwartet 17 `
    + '(16 aus der Vorlage + settings)')
  assert.ok(inNav.has('settings'),
    'der Bereich `settings` ist weg — G-404 hat ihn angelegt')
})

test('die Gruppen folgen dem Altrepo, die Eintraege dem Portal', () => {
  // `[cmd]` **Das Altrepo fuehrte fuenf Gruppen**
  // (`Sidebar.tsx:22-48`). `[read]` **Struktur uebernommen, kein
  // Code** — die Eintraege sind die des Portals.
  // `[cmd]` **G-404: sieben Gruppen** — die fuenf des Altrepos, dazu
  // `System` (Einstellungen) und `Workspaces` (drei Wege hinaus).
  assert.equal(PORTAL_NAV.length, 7,
    `die Seitenleiste fuehrt ${PORTAL_NAV.length} Gruppen, nicht sieben`)
  assert.equal(alleEintraege().length, 15,
    `die Seitenleiste fuehrt ${alleEintraege().length} Eintraege, nicht 15 `
    + '(11 Bereiche + Einstellungen + drei Aussenlinks)')
  for (const g of PORTAL_NAV) {
    assert.ok(g.eintraege.length > 0,
      `die Gruppe "${g.label ?? '(ohne Titel)'}" ist leer — dann steht dort `
      + 'eine Beschriftung ohne Inhalt')
  }
})

test('ein Zaehler ist rechenbar oder er fehlt', () => {
  // ══ A2: KEINE ERFUNDENE ZAHL IN DER LEISTE ═════════════════════
  //
  // `[cmd]` **Sieben Eintraege tragen einen Zaehler**, und jeder
  // nennt eine Menge, die `PortalZaehler` kennt. `[read]` **Ein
  // Zaehler ohne Daten waere schlimmer als keiner.**
  const ERLAUBT = new Set(['klienten', 'ungelesen', 'checkins', 'alerts',
    'vorschlaege', 'rechte', 'autonomie', 'einladungen'])
  let mit = 0
  for (const e of alleEintraege()) {
    // `[read]` **Ein Aussenlink zaehlt nichts** — er fuehrt aus dem
    // Portal heraus, also gibt es keine Menge dahinter.
    if (e.extern) {
      assert.ok(!e.zaehler,
        `"${e.label}" ist ein Aussenlink UND traegt einen Zaehler`)
      continue
    }
    if (!e.zaehler) {
      assert.ok(!e.stufe,
        `"${e.label}" hat keine Zahl, aber eine Stufe — die faerbt nichts`)
      continue
    }
    mit++
    assert.ok(ERLAUBT.has(e.zaehler!),
      `"${e.label}" zaehlt "${e.zaehler}" — diese Menge gibt es nicht`)
  }
  // `[cmd]` **Sechs, nicht sieben** — mein erster Zaehlversuch las die
  // Typunion in Zeile 79 als Eintrag mit. **Der Waechter hat den
  // Rechenfehler gemeldet**, bevor er in den Bericht kam.
  assert.equal(mit, 6, `${mit} Eintraege tragen einen Zaehler, nicht sechs`)

  // `[cmd]` **Und die Seite liefert genau diese Schluessel.**
  // `[read]` **Der erste Anlauf benutzte Reiter-Ids** (`athletes`
  // statt `klienten`) — **sechs von sieben Zaehlern blieben leer**,
  // obwohl alle Zeilen da waren. **Am Schirm gezaehlt, nicht im
  // Quelltext, sonst waere es nicht aufgefallen.**
  const seite = lies(HIER, '..', '..', 'app', 'page.tsx')
  const block = seite.slice(seite.indexOf('const zaehler: PortalZaehler'))
    .slice(0, 1200)
  for (const e of alleEintraege()) {
    if (!e.zaehler) continue
    assert.ok(new RegExp(`^\\s+${e.zaehler}:`, 'm').test(block),
      `"${e.label}" zaehlt "${e.zaehler}", aber page.tsx liefert den `
      + 'Schluessel nicht — die Zahl bliebe leer')
  }
})

test('die Schale nutzt die Klassen aus @lumeos/ui, nicht eigene', () => {
  // ══ A3: KEIN cp-kopf MEHR ══════════════════════════════════════
  //
  // `[cmd]` **`v2-app`, `v2-sidebar`, `v2-nav-group`, `v2-nav-item`,
  // `v2-tabs` stehen in `v2.css`** — der Datei, die `layout.tsx:3`
  // laedt. `[read]` **Gleiche Struktur, gleiche Optik.**
  const v2 = lies(WURZEL, 'packages', 'ui', 'src', 'styles', 'v2.css')
  for (const k of ['v2-app', 'v2-sidebar', 'v2-sidebar-nav', 'v2-nav-group',
    'v2-nav-group-label', 'v2-nav-item', 'v2-main', 'v2-tabs', 'v2-tab']) {
    assert.ok(new RegExp(`\\.${k}\\b`).test(v2),
      `\`${k}\` steht nicht mehr in v2.css — dann traegt die Schale eine `
      + 'Klasse ohne Regel')
  }

  // ══ G-402: Raster und Seitenleiste kommen aus `AppShell` ══════
  //
  // `[cmd]` **G-401 baute sie selbst nach** (`v2-app`,
  // `v2-sidebar` von Hand). `[read]` **Jetzt ruft die Schale
  // `AppShell`** — dieselbe Komponente wie `apps/web`. **Der
  // Waechter prueft den AUFRUF, nicht den Nachbau.**
  // `[read]` **Ohne Kommentare** — der Dateikopf erklaert, warum die
  // eigene `v2-sidebar` entfallen ist, und NENNT sie dabei. **Ein
  // Waechter, der seine eigene Begruendung liest, urteilt falsch.**
  // `[read]` **Zwei Sichten auf dieselbe Datei:** `roh` fuer das,
  // was DA sein muss, `schaleOhne` fuer das, was WEG sein muss.
  // **Sonst findet die Probe ihre eigene Begruendung** -- der
  // Dateikopf nennt `v2-sidebar`, um zu erklaeren, warum es die
  // eigene Leiste nicht mehr gibt.
  const roh = lies(HIER, '..', '..', 'components', 'portal-schale.tsx')
  const schaleOhne = roh
    .split(String.fromCharCode(10))
    .filter(zeile => !zeile.trimStart().startsWith('//'))
    .join(String.fromCharCode(10))
  assert.match(roh, /<AppShell/,
    'die Schale ruft AppShell nicht mehr - dann baut sie das Raster '
    + 'wieder selbst nach (vierte Doppelung)')
  assert.match(roh, /@lumeos/,
    'die Schale holt nichts mehr aus dem Paket')
  assert.ok(!/className="v2-sidebar"/.test(schaleOhne),
    'die Seitenleiste wird wieder von Hand gebaut - sie kommt aus '
    + 'Sidebar im Paket')
  assert.match(roh, /className="v2-module-header v2-module-hero-lite"/,
    'der Modulkopf ist keine v2-Fassung mehr')

  // `[cmd]` **Und nirgends mehr `cp-kopf` oder `cp-tabs`** — A3
  // verlangt es ohne Ausnahme, auch auf dem Fehlerweg.
  const seite = lies(HIER, '..', '..', 'app', 'page.tsx')
  const ohneKommentar = seite.split('\n')
    .filter(z => !z.trimStart().startsWith('//')).join('\n')
  for (const alt of ['cp-kopf', 'cp-tabs', 'cp-shell']) {
    assert.ok(!new RegExp(`className="[^"]*${alt}\\b`).test(ohneKommentar),
      `\`${alt}\` ist zurueck — dann sieht das Portal wieder anders aus `
      + 'als jedes andere Modul')
  }
})

test('das Raster schaltet die dritte Spalte ab', () => {
  // `[cmd]` **`v2-app` ist ein Raster mit drei Spalten**
  // (`v2.css:92-97`: `240px 1fr 340px`). `[cmd]` **Das Portal hat
  // keine Kontextspalte**, und `[data-rightpanel="hidden"]`
  // (`v2.css:102-104`) macht daraus `240px 1fr`.
  //
  // `[read]` **Ohne das Attribut blieben 340 px leer** — und eine
  // leere Spalte sieht aus wie ein Fehler.
  const v2 = lies(WURZEL, 'packages', 'ui', 'src', 'styles', 'v2.css')
  assert.match(v2, /\[data-rightpanel="hidden"\]/,
    'das Paket kennt `data-rightpanel` nicht mehr — dann steht im Portal '
    + 'eine leere 340-px-Spalte')
  // `[read]` **Ohne Kommentare pruefen** — die Begruendung ueber der
  // Zeile NENNT `data-rightpanel`, und ein Waechter, der seine eigene
  // Erklaerung liest, ist immer gruen. `[cmd]` **Gemessen: die
  // Sabotage (Attribut aus dem JSX entfernt) blieb gruen**, bis die
  // Probe am Element ankerte.
  const schale = lies(HIER, '..', '..', 'components', 'portal-schale.tsx')
    .split('\n').filter(z => !z.trimStart().startsWith('//')).join('\n')
  // `[cmd]` **G-402: die Spalte ist GEFUELLT, nicht abgeschaltet.**
  // `AppShell` setzt `data-rightpanel` selbst, je nachdem ob
  // `context` uebergeben wird. **Der Waechter prueft die
  // UEBERGABE**, nicht das Attribut.
  assert.match(schale, /context=\{\{/,
    'die Schale uebergibt keinen Kontext mehr — dann blendet AppShell '
    + 'die dritte Spalte aus, und „rechts buddy" fehlt wieder')
})

test('ein Bereich mit einem Reiter zeigt keine Reiterleiste', () => {
  // `[read]` **Eine Leiste mit genau einem Eintrag ist ein
  // Bedienelement ohne Wahl** — C-426 im Kleinen.
  const schale = lies(HIER, '..', '..', 'components', 'portal-schale.tsx')
  // `[cmd]` **G-404: die Bedingung liest jetzt `reiter`** -- eine
  // oertliche Groesse mit `?? []`, weil ein Aussenlink keine Reiter
  // fuehrt. `[read]` **Die SACHE ist dieselbe:** unter zwei
  // Eintraegen keine Leiste.
  assert.match(schale, /reiter\.length < 2\) return null/,
    'die Reiterleiste erscheint wieder bei einem einzigen Reiter')

  // `[cmd]` **Gemessen: vier Bereiche haben mehr als einen Reiter.**
  const mehrere = alleEintraege().filter(e => (e.reiter?.length ?? 0) > 1)
  // `[cmd]` **Unveraendert vier** — `settings` fuehrt genau einen
  // Reiter, die drei Aussenlinks keinen.
  assert.equal(mehrere.length, 4,
    `${mehrere.length} Bereiche fuehren mehrere Reiter, nicht vier`)
})

test('ein altes ?tab= findet weiter seinen Bereich', () => {
  // `[read]` **Die Navigation hat eine Ebene bekommen** — ein
  // Lesezeichen auf `?tab=patterns` darf davon nichts merken.
  for (const [tab, bereich] of [
    ['overview', 'uebersicht'], ['patterns', 'alerts'],
    ['revenue', 'auswertung'], ['programs', 'plaene'],
    ['onboard', 'klienten'], ['team', 'einstellungen'],
  ] as const) {
    const e = bereichFuerReiter(tab)
    assert.ok(e, `der Reiter "${tab}" findet keinen Bereich`)
    assert.equal(e.id, bereich,
      `"${tab}" landet in "${e.id}", erwartet "${bereich}"`)
  }
  assert.equal(bereichFuerReiter('gibtsnicht'), null,
    'ein unbekannter Reiter liefert einen Bereich — dann faellt niemand auf')
})

test('die Schale speist Marke und Gruppen wirklich ein', () => {
  // ══ G-402/A5: DIE VIERTE DOPPELUNG IST AUFGELOEST ══════════════
  //
  // `[cmd]` **`SidebarProps` nimmt seit G-402 `gruppen`, `marke` und
  // `ohneSuche`** — vorher rendert sie `MODULES.map(...)` fest, und
  // das Portal bekam die Module des Athleten.
  //
  // `[read]` **Ohne diese Probe koennte jemand die Requisiten
  // weglassen**, und die Leiste zeigte wieder Nutrition und
  // Training — ohne dass etwas rot wird.
  const roh = lies(HIER, '..', '..', 'components', 'portal-schale.tsx')
  assert.match(roh, /marke=\{\{ kuerzel: 'C', name: 'LumeOS Coach' \}\}/,
    'die Marke ist weg — dann steht im Portal wieder „LumeOS"')
  assert.match(roh, /gruppen=\{alsGruppen\(/,
    'die Gruppen werden nicht mehr eingespeist — dann zeigt die '
    + 'Leiste die Module von apps/web')
  assert.match(roh, /ohneSuche/,
    'die Attrappensuche ist zurueck — sie verspricht eine '
    + 'Befehlspalette, die es nicht gibt')

  // `[cmd]` **Und das Paket kann es wirklich** — sonst waere die
  // Uebergabe wirkungslos.
  const sb = lies(WURZEL, 'packages', 'ui', 'src', 'shell', 'sidebar.tsx')
  // `[read]` **Schlichte Textsuche statt Regex** — die erste Fassung
  // baute das Muster aus einem Schablonenliteral, und der
  // Rueckstrich ueberlebte den Weg nicht. **Sie meldete `gruppen`
  // als fehlend, obwohl es in Zeile 93 steht.**
  for (const p of ['gruppen?:', 'marke?:', 'ohneSuche?:']) {
    assert.ok(sb.includes(p),
      `\`SidebarProps.${p}\` fehlt — dann ist die Uebergabe wirkungslos`)
  }
})

test('apps/web bekommt die Vorgabe, nicht die Portalfassung', () => {
  // ══ DIE GEGENPROBE, ALS WAECHTER ═══════════════════════════════
  //
  // `[read]` **Der Auftrag verlangt sie** — `packages/ui` ist
  // geteilt, und eine Aenderung dort darf `apps/web` nicht
  // verschieben.
  //
  // `[cmd]` **Am Schirm gemessen: „LumeOS", Suchfeld da,
  // Modules/Workspaces/System, 12 Eintraege, 0 eingespeiste
  // Zahlen.** `[read]` **Hier steht die Bedingung, die das
  // sicherstellt:** beide Requisiten sind WAHLFREI und haben die
  // heutige Anzeige als Vorgabe.
  const sb = lies(WURZEL, 'packages', 'ui', 'src', 'shell', 'sidebar.tsx')
  assert.match(sb, /marke\?:/,
    '`marke` ist Pflicht geworden — dann muesste apps/web sie setzen')
  assert.match(sb, /gruppen\?:/,
    '`gruppen` ist Pflicht geworden — dann bricht apps/web')
  assert.match(sb, /marke\?\.kuerzel \?\? 'L'/,
    'die Vorgabe „L" ist weg — apps/web zeigte dann etwas anderes')
  assert.match(sb, /marke\?\.name \?\? 'LumeOS'/,
    'die Vorgabe „LumeOS" ist weg')
  assert.match(sb, /\{gruppen \?/,
    'der Zweig ohne `gruppen` ist weg — dann verliert apps/web seine '
    + 'Modulnavigation')
})

// ══════════════════════════════════════════════════════════════════
// G-404: Workspaces und Settings
// ══════════════════════════════════════════════════════════════════

test('drei Wege hinaus, keiner auf sich selbst', () => {
  // ══ A1: EIN VERWEIS AUF SICH IST EIN KREIS ═════════════════════
  //
  // `[cmd]` **`packages/ui/src/shell/nav.ts` fuehrt „Coach Portal"
  // in `WORKSPACES`** — aus dem Portal heraus waere das ein Verweis
  // auf sich selbst. `[read]` **Genau deshalb blieb die Gruppe in
  // G-402 weg.**
  const extern = alleEintraege().filter(e => e.extern)
  assert.equal(extern.length, 3,
    `${extern.length} Aussenlinks, erwartet drei (LumeOS, Marketplace, Admin)`)

  for (const e of extern) {
    assert.ok(e.href, `"${e.label}" ist extern, nennt aber kein Ziel`)
    assert.ok(!e.reiter?.length,
      `"${e.label}" fuehrt Reiter — ein Aussenlink verlaesst das Portal, `
      + 'da gibt es nichts zu gliedern')
    // `[cmd]` **3220 ist das Portal selbst.**
    assert.ok(!e.href!.includes('3220'),
      `"${e.label}" zeigt auf 3220 — das ist das Portal selbst, ein Kreis`)
    assert.ok(!/coach\.lumeos\.app/.test(e.href!),
      `"${e.label}" zeigt auf coach.lumeos.app — dasselbe im Fernen`)
  }
  assert.deepEqual(extern.map(e => e.label), ['LumeOS', 'Marketplace', 'Admin'])
})

test('ein Aussenlink traegt target und rel', () => {
  // `[cmd]` **Gemessen an `sidebar.tsx:214-229`**, der
  // Workspaces-Gruppe von `apps/web`: schlichtes `<a>`,
  // `target="_blank"`, `rel="noopener noreferrer"`, Akzentpunkt.
  //
  // `[read]` **Ohne `noopener` kann die Zielseite auf
  // `window.opener` zugreifen** — deshalb ist es keine Kosmetik.
  const sb = lies(WURZEL, 'packages', 'ui', 'src', 'shell', 'sidebar.tsx')
  const zweig = sb.slice(sb.indexOf('return e.extern ? ('))
    .slice(0, 700)
  assert.ok(zweig.length > 100,
    'der Zweig fuer Aussenlinks ist weg — dann rendert `next/link` einen '
    + 'fremden Server')
  assert.match(zweig, /target="_blank"/, '`target` fehlt am Aussenlink')
  assert.match(zweig, /rel="noopener noreferrer"/,
    '`rel="noopener noreferrer"` fehlt — die Zielseite kaeme an '
    + '`window.opener`')
})

test('Settings sitzt in einer eigenen Gruppe, nicht als Reiter', () => {
  // ══ A5: DIE BEGRUENDUNG, ALS BEDINGUNG ═════════════════════════
  //
  // `[cmd]` **Der Auftrag nimmt einen `settings`-Reiter an** — den
  // gibt es nicht: die sechzehn aus `module-coach.jsx:923-940`
  // enden bei `team`. `[read]` **Die sechzehn sind die ARBEIT am
  // Klienten; die eigenen Stammdaten sind keine.**
  const q = lies(VORLAGEN, 'module-coach.jsx')
  const anker = q.indexOf('CoachPortalStandalone')
  const ids = Array.from(q.slice(anker).matchAll(/\{\s*id:\s*"(\w+)",\s*label:/g),
    m => m[1])
  assert.ok(!ids.includes('settings'),
    'die Vorlage fuehrt jetzt einen `settings`-Reiter — dann waere ein '
    + 'siebzehnter Bereich neu zu beurteilen')

  const gruppe = PORTAL_NAV.find(g => g.label === 'System')
  assert.ok(gruppe, 'die Gruppe „System" fehlt')
  assert.deepEqual(gruppe.eintraege.map(e => e.id), ['settings'],
    'die Systemgruppe fuehrt nicht genau die Einstellungen')
})

test('elf Felder, acht ohne Spalte — und jede nennt ihre', () => {
  // ══ A2: DREI MIT DATEN, ACHT ALS ATTRAPPE ══════════════════════
  //
  // `[cmd]` **`coach.coach_profiles` fuehrt sieben Spalten**, davon
  // drei anzeigbar. `[cmd]` **`CoachProfile.tsx:8-14` nennt sieben
  // Formularfelder plus `tier`** — acht ohne Zuhause.
  const t = lies(HIER, '..', '..', 'components', 'tab-settings.tsx')

  // Die acht fehlenden Spalten, je mit Namen.
  for (const s of ['business_name', 'bio', 'contact_email', 'website',
    'specialties[]', 'certifications[]', 'max_clients', 'tier']) {
    assert.ok(t.includes(s),
      `die fehlende Spalte \`${s}\` wird nicht genannt — dann sucht der `
      + 'naechste Leser den Fehler im Code')
  }

  // `[read]` **Kein Schreibweg** — Tom: „noch gar nichts mit db".
  // `[cmd]` **Ohne Kommentare pruefen:** der Dateikopf NENNT
  // `formAction`, um zu erklaeren, dass es keinen gibt. **Ein
  // Waechter, der seine eigene Begruendung liest, urteilt falsch.**
  const ohneKommentar = t.split(String.fromCharCode(10))
    .filter(zeile => !zeile.trimStart().startsWith('//'))
    .join(String.fromCharCode(10))
  for (const verboten of ['use server', 'formAction', 'revalidatePath']) {
    assert.ok(!ohneKommentar.includes(verboten),
      `\`${verboten}\` steht in den Einstellungen — der Auftrag verbietet `
      + 'jeden Schreibweg')
  }
  assert.match(t, /readOnly/,
    'die Felder sind nicht mehr `readOnly` — dann sehen sie aus, als '
    + 'liesse sich etwas speichern')
})

test('die Demo-Listen sagen, dass nichts gespeichert wird', () => {
  // ══ A3: TOMS VORGABE, WOERTLICH ════════════════════════════════
  //
  // **Tom:** *„deklarier Demo, das wird spaeter definiert."*
  const t = lies(HIER, '..', '..', 'components', 'tab-settings.tsx')
  assert.match(t, /nichts wird gespeichert/,
    'der Vermerk „nichts wird gespeichert" fehlt — dann haelt jemand '
    + 'die Demo-Eintraege fuer Daten')
  assert.match(t, /werte\.includes\(w\)/,
    'der doppelte Eintrag wird nicht mehr abgewiesen')
  assert.match(t, /setWerte\(werte\.filter/,
    'das Entfernen ist weg')
})

test('subscription_plans taugen nicht als Anzeige — und das steht da', () => {
  // ══ A4: GEMESSEN, NICHT GERATEN ════════════════════════════════
  //
  // `[cmd]` **Gemessen: drei Zeilen** — `Lumeos Basic` (999 ct),
  // `Plus` (1999), `Pro` (2999), je Monat, mit `ai_credits_included`
  // 20/50/100. `[read]` **Das sind Abonnements des ENDNUTZERS**, nicht
  // die Stufen eines Coaches (`starter` bis `enterprise`).
  //
  // `[read]` **Sie zu zeigen hiesse, dem Coach einen Preis zu nennen,
  // der fuer ihn nicht gilt.**
  const t = lies(HIER, '..', '..', 'components', 'tab-settings.tsx')
  assert.match(t, /subscription_plans/,
    'die Messung zu den Plaenen fehlt — A4 verlangt die Antwort')
  assert.match(t, /Keine Rechnung, keine Zahlung/,
    'der Vermerk zur Abrechnung fehlt')
  // `[read]` **Und sie werden NICHT gelesen** — kein Leseweg dorthin.
  const daten = lies(HIER, '..', 'daten.ts')
  assert.ok(!daten.includes('subscription_plans'),
    'das Portal liest `subscription_plans` — sie gelten aber dem '
    + 'Endnutzer, nicht dem Coach')
})
