// Die Draft-Fassung gegen ihre Vorlage — G-405.
//
// **Tom, 2026-09-10:** *„wie waers wenn du das nun als mockup
// erzeugen laesst und nicht irgend eine abhandlung davon. ich habe
// den direkten vergleich."*
//
// ══ WAS DIESE PROBEN MESSEN ════════════════════════════════════════
//
// `[read]` **Nicht, dass etwas gebaut ist** — das sieht man am
// Schirm. `[read]` **Sondern, dass es der VORLAGE entspricht** und
// beim naechsten Umbau nicht still davondriftet.
//
// `[cmd]` **Die Zahlen stehen NICHT in dieser Datei fest** — sie
// werden aus `module-coach-portal-shell.jsx` gelesen. **Aendert
// jemand die Vorlage, aendert sich die Erwartung mit.** `[read]`
// **Eine fest eingetragene 35 waere ein Gedaechtnis, kein Mass.**
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  DRAFT_NAV, alleBereiche, alleKinder, bereichVon,
} from '../../components/portal-draft-nav'
import { DRAFT_KONTEXT } from '../../components/portal-draft-kontext'
// G-407: das Verzeichnis der gebauten Kachel-Ansichten.
import { DRAFT_ANSICHTEN } from '../../components/draft/ansichten'
// G-409: der Linkhelfer und die Modale.
import {
  wegZuReiter, wegZuFilter, wegZuAthlet, wegZurueck,
} from '../../components/draft/wege'
import { MODALE } from '../../components/draft/modale' 

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..', '..', '..', '..', '..')
const DRAFT = join(WURZEL, 'docs', 'spezifikation', '10-plattform',
  'design-system', 'coach-portal-draft')

const SHELL = readFileSync(join(DRAFT, 'module-coach-portal-shell.jsx'), 'utf8')

/** Ein Abschnitt der Vorlage — die drei Listen liegen hintereinander. */
function abschnitt(von: string, bis: string): string {
  const a = SHELL.indexOf(von)
  const b = SHELL.indexOf(bis)
  assert.ok(a >= 0, `${von} nicht in der Vorlage gefunden`)
  assert.ok(b > a, `${bis} liegt nicht hinter ${von}`)
  return SHELL.slice(a, b)
}

test('die elf Bereiche stehen in der Reihenfolge der Vorlage', () => {
  // `[cmd]` **CP_NAV, Zeile 4-24** — vier Gruppen, elf Bereiche.
  const nav = abschnitt('const CP_NAV', 'const CP_META')
  const ausVorlage = [...nav.matchAll(/id:\s*"([\w-]+)"/g)].map(m => m[1])
  const gebaut = alleBereiche().map(b => b.id)

  assert.deepEqual(gebaut, ausVorlage,
    'Die Bereiche weichen von CP_NAV ab — Reihenfolge oder Bestand.')
})

test('die Gruppen heissen wie in der Vorlage', () => {
  const nav = abschnitt('const CP_NAV', 'const CP_META')
  const ausVorlage = [...nav.matchAll(/grp:\s*"([^"]+)"/g)].map(m => m[1])
  assert.deepEqual(DRAFT_NAV.map(g => g.grp), ausVorlage)
})

test('die Seitenleiste fuehrt NUR Eltern — die Regel aus Zeile 2', () => {
  // > *„Sidebar carries parents only; children live in the content
  // > sub-nav."*
  //
  // `[read]` **Die Probe misst die WIRKUNG, nicht das Wort:** kein
  // Kind darf als Bereich auftauchen. `[cmd]` **Wer einen
  // Unterpunkt in die Leiste zieht, faellt hier.**
  const bereiche = new Set(alleBereiche().map(b => b.id))
  const doppelt = alleKinder()
    .filter(k => bereiche.has(k.id) && k.bereich !== k.id)
    .map(k => `${k.id} (Kind von ${k.bereich})`)

  assert.deepEqual(doppelt, [],
    'Diese Unterpunkte stehen auch als Bereich in der Leiste.')
})

test('die 35 Unterpunkte stimmen mit CP_SECTIONS ueberein', () => {
  // `[cmd]` **CP_SECTIONS, Zeile 42-96.** Die Kinder tragen dort
  // `{id, label}` — die Eltern tragen `title`/`sub`.
  // `[cmd]` **Der Abschnitt endet an `const CoachPortalPlatform`**
  // (`:98`) — die vier obersten Namen der Datei sind `CP_NAV`,
  // `CP_META`, `CP_SECTIONS`, `CoachPortalPlatform`. **`CoachCtx`
  // steht in einer ANDEREN Datei des Drafts**, und mit dem falschen
  // Anker fiel die Probe, statt zu messen.
  const sec = abschnitt('const CP_SECTIONS', 'const CoachPortalPlatform')
  const ausVorlage = [...sec.matchAll(/\{\s*id:\s*"([\w-]+)",\s*label:/g)]
    .map(m => m[1])
  const gebaut = alleKinder().map(k => k.id)

  assert.equal(gebaut.length, ausVorlage.length,
    `Vorlage ${ausVorlage.length} Unterpunkte, gebaut ${gebaut.length}.`)
  assert.deepEqual(gebaut, ausVorlage)
})

test('jede Attrappe nennt die fehlende Tabelle', () => {
  // `[read]` **„Noch nicht angebunden" sagt nichts** — es verhindert
  // sogar, dass jemand nachsieht. `[cmd]` **Der Vermerk muss die
  // Tabelle nennen**, wie in G-398.
  const ohne = alleKinder()
    .filter(k => k.art === 'attrappe')
    .filter(k => !k.fehlt || k.fehlt.trim().length < 20)
    .map(k => k.id)

  assert.deepEqual(ohne, [],
    'Diese Attrappen tragen keinen brauchbaren Grund.')

  // Dasselbe fuer die Bereiche ohne Kinder — dort traegt kein Kind
  // den Vermerk, also muss der Bereich ihn tragen.
  const bereicheOhne = alleBereiche()
    .filter(b => !b.kinder?.length)
    .filter(b => b.art !== 'gebaut')
    .filter(b => !b.fehlt || b.fehlt.trim().length < 20)
    .map(b => b.id)

  assert.deepEqual(bereicheOhne, [],
    'Diese Bereiche ohne Unterpunkte wuerden einen leeren Schirm '
    + 'ohne Grund zeigen (E-72).')
})

test('jeder Bereich ohne Kinder ist eingeordnet', () => {
  // `[read]` **Weder gebaut noch Attrappe ist kein Zustand** — dann
  // rendert die Seite nichts und sagt auch nicht, warum.
  const unklar = alleBereiche()
    .filter(b => !b.kinder?.length && !b.art)
    .map(b => b.id)
  assert.deepEqual(unklar, [])
})

test('die Pills und Aktionen stimmen in der Zahl mit CP_META', () => {
  const meta = abschnitt('const CP_META', 'const CP_SECTIONS')
  // `pills: [[...]]` und `actions: [[...]]` — je Paar ein Eintrag.
  const zaehle = (feld: string) => {
    const teil = meta.split(new RegExp(`${feld}:`)).slice(1)
    return teil.reduce((s, t) => {
      const ende = t.indexOf(']]')
      return s + (t.slice(0, ende).match(/\["/g)?.length ?? 0)
    }, 0)
  }

  const pillsVorlage = zaehle('pills')
  const aktVorlage = zaehle('actions')
  const pillsGebaut = alleBereiche().reduce((s, b) => s + b.pills.length, 0)
  const aktGebaut = alleBereiche().reduce((s, b) => s + b.aktionen.length, 0)

  assert.equal(pillsGebaut, pillsVorlage,
    `Pills: Vorlage ${pillsVorlage}, gebaut ${pillsGebaut}.`)
  assert.equal(aktGebaut, aktVorlage,
    `Aktionen: Vorlage ${aktVorlage}, gebaut ${aktGebaut}.`)
})

test('die vier Badges tragen die Zahlen der Vorlage', () => {
  // `[read]` **Hier steht die Vorlagenzahl** — am Schirm wird sie
  // durch die gemessene ersetzt (`portal-draft-seite.tsx`). **Die
  // Struktur behaelt die vier Stellen**, damit auffaellt, wenn eine
  // verschwindet.
  const nav = abschnitt('const CP_NAV', 'const CP_META')
  const ausVorlage = [...nav.matchAll(/badge:\s*"(\d+)"/g)].map(m => m[1])
  const gebaut = alleBereiche().filter(b => b.badge).map(b => b.badge)

  assert.deepEqual(gebaut, ausVorlage)
  assert.equal(gebaut.length, 4)
})

test('die Kontextspalte kennt jeden Bereich', () => {
  // `[cmd]` **`PortalContextPanel({ section })`** — sie bekommt den
  // Bereich. `[read]` **Fehlt einer, faellt die Spalte auf
  // `overview` zurueck und zeigt fremde Zahlen**, ohne dass jemand
  // es merkt.
  const fehlen = alleBereiche()
    .map(b => b.id)
    .filter(id => !DRAFT_KONTEXT[id])
  assert.deepEqual(fehlen, [])
})

test('bereichVon findet jeden Bereich und nichts sonst', () => {
  for (const b of alleBereiche()) {
    assert.equal(bereichVon(b.id)?.id, b.id)
  }
  assert.equal(bereichVon('gibtesnicht'), null)
})

test('die Schale traegt das Raster der Vorlage', () => {
  // `[cmd]` **`module-coach-portal-shell.jsx:112-117`:**
  // `gridTemplateColumns: rightOpen ? "222px 1fr 306px" : "222px 1fr"`
  //
  // `[read]` **Die Probe liest die CSS-Datei**, nicht den
  // Bildschirm — am Schirm ist es in `_g405-schirm.mjs` gemessen
  // (`222px 1072px 306px` bei 1600 px Fenster).
  const css = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'app', 'portal.css'), 'utf8')
  // Kommentarzeilen raus — sonst findet die Probe ihre eigene
  // Begruendung und ist fuer immer gruen.
  const ohneKommentar = css.replace(/\/\*[\s\S]*?\*\//g, '')

  assert.match(ohneKommentar, /\.dp-app\s*\{[^}]*grid-template-columns:\s*222px\s+1fr\s+306px/,
    'Das Raster der Schale weicht von :112 ab.')
  assert.match(ohneKommentar, /\.dp-app\[data-rechts='zu'\]\s*\{[^}]*grid-template-columns:\s*222px\s+1fr/,
    'Die abgeschaltete Kontextspalte ergibt nicht 222px 1fr.')
})

test('der Schalter der Kontextspalte hat eine sichtbare Wirkung', () => {
  // `[read]` **C-426: kein Bedienelement ohne Wirkung.** `[cmd]`
  // **`dp-an` muss eine Regel haben** — sonst sieht man dem Knopf
  // nicht an, in welchem Zustand er steht.
  const css = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'app', 'portal.css'), 'utf8')
  const ohneKommentar = css.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(ohneKommentar, /\.dp-icon-knopf\.dp-an\s*\{[^}]*\w/)
})

// ══ G-407: die Kacheln der Vorlage ═════════════════════════════════

test('jede der 28 Attrappen hat eine gebaute Ansicht', () => {
  // **Tom, 2026-09-08:** *„bau den draft fertig."*
  //
  // `[read]` **Die Probe zaehlt aus dem Verzeichnis, nicht aus einem
  // Muster** — ein `if`-Turm liesse sich nur mit einem Muster zaehlen,
  // und ein Muster altert.
  const attrappen = alleKinder().filter(k => k.art === 'attrappe').map(k => k.id)
  const bereicheOhne = alleBereiche()
    .filter(b => !b.kinder?.length && b.art === 'attrappe')
    .map(b => b.id)
  const alle = [...attrappen, ...bereicheOhne]

  const ohne = alle.filter(id => !DRAFT_ANSICHTEN[id])
  assert.deepEqual(ohne, [],
    'Diese Attrappen zeigen nur einen Vermerk statt der Kacheln der Vorlage.')
  assert.equal(alle.length, 28, `Attrappen: ${alle.length}, erwartet 28.`)
})

test('keine Ansicht ueberlagert einen angebundenen Unterpunkt', () => {
  // `[read]` **`record` liest echte Zeilen.** `[cmd]` **Waere eine
  // Attrappen-Ansicht dafuer registriert, stuenden gemessene Daten
  // und Vorlagenzahlen untereinander** — und niemand saehe, welche
  // welche sind.
  const gebaut = alleKinder().filter(k => k.art === 'gebaut').map(k => k.id)
  const kollision = gebaut.filter(id => DRAFT_ANSICHTEN[id])
  assert.deepEqual(kollision, [])
})

test('die Zahlen der Kacheln stammen aus der Vorlage', () => {
  // `[cmd]` **Stichprobe ueber drei Dateien:** die Werte muessen in
  // der Vorlage stehen, nicht nur im erzeugten TypeScript.
  //
  // `[read]` **Sonst waere „aus der Vorlage" eine Behauptung** — und
  // genau die soll der Vermerk am Schirm belegen.
  const daten = ['daten-assistent.ts', 'daten-portal.ts', 'daten-auswertung.ts']
    .map(f => readFileSync(join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', f), 'utf8'))
    .join('\n')

  const proben: Array<[string, string]> = [
    ['module-coach-clone.jsx', '"Vocabulary"'],
    ['module-coach-clone.jsx', '1,240 messages'],
    ['module-coach-extras.jsx', 'retention90d'],
    ['module-coach-programs.jsx', '12-Week Powerbuilding'],
    ['module-coach-client-record.jsx', 'Lukas Bauer'],
  ]
  for (const [datei, wert] of proben) {
    const vorlage = readFileSync(join(DRAFT, datei), 'utf8')
    assert.ok(vorlage.includes(wert), `${wert} steht nicht in ${datei}`)
    assert.ok(daten.includes(wert), `${wert} fehlt in den erzeugten Daten`)
  }
})

test('jede Kachel einer Attrappen-Ansicht traegt einen Vermerk', () => {
  // `[cmd]` **Je Kachel, nicht je Ansicht** (E-69) — sonst liesse
  // sich nicht zaehlen, WELCHE Kachel woran haengt.
  //
  // `[read]` **Die Probe zaehlt `<Card` gegen `V(`/`<Attrappe`** in
  // denselben Dateien. **Kommentarzeilen fallen vorher weg**, sonst
  // findet sie ihre eigene Begruendung.
  for (const f of ['ansichten-assistent.tsx', 'ansichten-portal.tsx', 'ansichten-auswertung.tsx']) {
    const roh = readFileSync(
      join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', f), 'utf8')
    const t = roh.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')
    const karten = (t.match(/<Card\b/g) ?? []).length
    const vermerke = (t.match(/\{V\(/g) ?? []).length
    assert.ok(karten > 0, `${f} hat keine Kacheln`)
    assert.equal(vermerke, karten,
      `${f}: ${karten} Kacheln, aber ${vermerke} Vermerke.`)
  }
})

test('die Unterreiter scrollen, statt zu brechen', () => {
  // `[cmd]` **Die Vorlage benutzt `tabs-rail`** (`shared.jsx:197`),
  // und `styles.css:1040` gibt ihr `overflow-x: auto`.
  //
  // `[read]` **Die Probe misst die KLASSE an der Schale** — die
  // Regel selbst liegt im Paket und wird dort geprueft.
  const schale = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'portal-draft-schale.tsx'), 'utf8')
  const t = schale.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')
  assert.match(t, /className="v2-tabs v2-tabs-rail"/)

  const css = readFileSync(join(WURZEL, 'packages', 'ui', 'src', 'styles', 'v2.css'), 'utf8')
  const ohneKommentar = css.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(ohneKommentar, /\.v2-tabs-rail\s*\{[^}]*overflow-x:\s*auto/)
  assert.match(ohneKommentar, /\.v2-tabs-rail \.v2-tab\s*\{[^}]*white-space:\s*nowrap/)
})

test('der Leerzustand traegt zwei Namen fuer zwei Absichten', () => {
  // `[cmd]` **Tom, G-407:** *„.v2-empty im Paket beheben."*
  //
  // `[cmd]` **`:1598` ist die ZEILE** (Symbol links, Text rechts) —
  // vier rohe `div.v2-empty` in apps/web bauen darauf.
  // `[cmd]` **`.v2-leer` ist der BLOCK** — 56 Aufrufer von `Empty`.
  //
  // `[read]` **Ein `display: block` auf `.v2-empty` haette die vier
  // Zeilen in apps/web zerlegt.**
  const css = readFileSync(join(WURZEL, 'packages', 'ui', 'src', 'styles', 'v2.css'), 'utf8')
  const ohneKommentar = css.replace(/\/\*[\s\S]*?\*\//g, '')

  assert.match(ohneKommentar, /\.v2-empty\s*\{[^}]*display:\s*flex/,
    '.v2-empty muss die Zeile bleiben — apps/web haengt daran.')
  assert.match(ohneKommentar, /\.v2-leer\s*\{[^}]*display:\s*block/,
    '.v2-leer muss der Block sein.')
  // Und die Komponente muss den Block rufen, nicht die Zeile.
  const prim = readFileSync(join(WURZEL, 'packages', 'ui', 'src', 'primitives.tsx'), 'utf8')
  const p = prim.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')
  assert.match(p, /className="v2-leer"/)
})

// ══ G-409: die Tiefe und jeder Klick ═══════════════════════════════

test('kein Reiter schreibt sein Klickziel fest', () => {
  // **Tom, 2026-09-08:** *„dann hat es diverse klicks die in
  // `?bereich=` zurueckspringen."*
  //
  // `[read]` **Die Reiter laufen in ZWEI Fassungen** — sie duerfen
  // ihr Ziel deshalb nicht festschreiben, sondern fragen den
  // Linkhelfer. `[cmd]` **Die Probe misst die Abwesenheit fester
  // Ziele**, nicht die Anwesenheit des Helfers: ein neuer fester
  // Verweis faellt auch dann auf, wenn er den Helfer daneben
  // importiert.
  const REITER = ['tab-uebersicht', 'tab-athleten', 'tab-checkins',
    'tab-alerts', 'tab-autonomie', 'tab-nachrichten']
  const fest: string[] = []
  for (const r of REITER) {
    const roh = readFileSync(
      join(WURZEL, 'apps', 'coach', 'src', 'components', `${r}.tsx`), 'utf8')
    const t = roh.split('\n').filter(z => !z.trim().startsWith('//')
      && !z.trim().startsWith('*')).join('\n')
    // `[cmd]` **Drei Formen, nicht zwei.** `[cmd]` **Die Gegenprobe
    // „ein Reiter schreibt sein Ziel wieder fest" blieb GRUEN**, als
    // `/athlet/${id}` zurueckgeschrieben wurde: das Muster kannte
    // nur `?bereich=` und `?tab=`. `[read]` **Ein Waechter, der eine
    // Schreibform nicht kennt, gilt nur so weit wie sein Muster.**
    for (const m of t.matchAll(/["'`]\/\?(?:bereich|tab)=/g)) {
      fest.push(`${r}: ${t.slice(m.index, m.index + 34)}`)
    }
    for (const m of t.matchAll(/["'`]\/athlet\//g)) {
      fest.push(`${r}: ${t.slice(m.index, m.index + 34)}`)
    }
  }
  assert.deepEqual(fest, [],
    'Diese Stellen schreiben ihr Ziel fest und fuehren aus dem Draft.')
})

test('der Linkhelfer laesst die alte Fassung unveraendert', () => {
  // `[cmd]` **Tom: „`?bereich=` NICHT anfassen."**
  //
  // `[read]` **Ohne Lage kommt heraus, was vorher dastand** — das
  // ist die eine Eigenschaft, an der die alte Fassung haengt.
  assert.equal(wegZuReiter(null, 'alerts'), '/?bereich=alerts')
  assert.equal(wegZuReiter(null, 'workflows', '&stand=offen'),
    '/?bereich=workflows&stand=offen')
  assert.equal(wegZuAthlet(null, 'abc'), '/athlet/abc')
  assert.equal(wegZurueck(null), '/?bereich=klienten')
})

test('im Draft fuehrt jeder Weg in den Draft', () => {
  const lage = { bereich: 'athletes', kind: 'record' }
  for (const weg of [
    wegZuReiter(lage, 'alerts'),
    wegZuReiter(lage, 'gibtesnicht'),
    wegZuFilter(lage, 'klienten', '&stand=aktiv'),
    wegZuAthlet(lage, 'abc'),
    wegZurueck(lage),
  ]) {
    assert.ok(weg.includes('draft='), `fuehrt hinaus: ${weg}`)
  }
})

test('ein unbekannter Reiter bleibt, wo er ist', () => {
  // `[read]` **Kennt der Draft den Reiter nicht, waere ein Sprung in
  // die alte Fassung genau der Fehler**, den G-409 behebt.
  const lage = { bereich: 'analytics', kind: 'patterns' }
  assert.equal(wegZuReiter(lage, 'gibtesnicht'),
    '/?draft=analytics&kind=patterns')
})

test('die Akte traegt die Klientenkarte der Vorlage', () => {
  // `[cmd]` **`client-record.jsx:101-135`:** Name, drei Pills,
  // Zielzeile, DREI Coach-Pills, SECHS Access-Pills, drei Knoepfe.
  const roh = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', 'ansicht-akte.tsx'), 'utf8')
  const t = roh.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')

  // Die Felder der Vorlage, die auf der Karte stehen muessen.
  for (const feld of ['FCR_CLIENT.av', 'FCR_CLIENT.name', 'FCR_CLIENT.tier',
    'FCR_CLIENT.since', 'FCR_CLIENT.goal', 'FCR_CLIENT.phase',
    'FCR_CLIENT.age', 'FCR_CLIENT.height', 'FCR_CLIENT.coaches',
    'FCR_CLIENT.granted']) {
    assert.ok(t.includes(feld), `${feld} fehlt auf der Klientenkarte`)
  }
  assert.match(t, /full access granted/)
  assert.match(t, /revocable any time/)

  // Und die acht Untertabs, in der Reihenfolge der Vorlage.
  const vorlage = readFileSync(join(DRAFT, 'module-coach-client-record.jsx'), 'utf8')
  const ausVorlage = [...vorlage.matchAll(/\["(overview|training|nutrition|recovery|supplements|body|medical|timeline)","/g)]
    .map(m => m[1])
  const gebaut = [...t.matchAll(/\['(\w+)', '[A-Z]/g)].map(m => m[1])
  assert.equal(ausVorlage.length, 8, `Vorlage: ${ausVorlage.length} Untertabs`)
  assert.deepEqual(gebaut, ausVorlage)
})

test('die dreizehn Modale der Vorlage sind gebaut', () => {
  // `[cmd]` **Nachgezaehlt ueber alle Vorlagendateien: DREIZEHN** —
  // `KModal` und `CMod` sind die Huelle, kein Modal.
  //
  // `[read]` **Der Auftrag nennt fuenfzehn** — die Zahl stammt aus
  // meinem eigenen G-407-Bericht und zaehlte die Huellen mit.
  const dateien = readdirSync(DRAFT).filter(f => f.endsWith('.jsx'))
  const ausVorlage = new Set<string>()
  for (const f of dateien) {
    const t = readFileSync(join(DRAFT, f), 'utf8')
    for (const m of t.matchAll(/^(?:const|window\.)\s*(\w+Modal)\b/gm)) {
      if (m[1] !== 'KModal') ausVorlage.add(m[1])
    }
  }
  assert.equal(ausVorlage.size, 13,
    `Vorlage fuehrt ${ausVorlage.size} Modale: ${[...ausVorlage].join(' ')}`)
  assert.equal(Object.keys(MODALE).length, 13,
    `gebaut sind ${Object.keys(MODALE).length}`)
})

test('kein Knopf im Modal taeuscht einen Schreibweg vor', () => {
  // `[read]` **C-426: kein Bedienelement ohne Wirkung.** `[cmd]`
  // **Es gibt keinen Schreibweg** — also ist jeder handelnde Knopf
  // `disabled` und sagt im Titel, warum.
  const roh = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', 'modale.tsx'), 'utf8')
  const t = roh.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')
  assert.match(t, /disabled\s*\n?\s*title="Attrappe/,
    'Der handelnde Knopf muss disabled sein und seinen Grund nennen.')
})

// ══ G-410: der Kalender und das Athletendetail ═════════════════════

test('der Kalender ist ein Monatsraster, keine Liste', () => {
  // **Tom, 2026-09-08:** *„die Vorlage zeigt ein Monatsraster
  // -> ein Monatsraster."*
  //
  // `[cmd]` **G-409 baute hier eine Liste mit neun Ueberschriften.**
  // `[cmd]` **Die Masse stehen in `portal-tools.jsx:44-81`** und
  // werden hier gegen die CSS geprueft.
  const css = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'app', 'portal.css'), 'utf8')
  const ohneKommentar = css.replace(/\/\*[\s\S]*?\*\//g, '')

  // `:44` — zwei Spalten 1.5fr / 1fr
  assert.match(ohneKommentar, /\.dk-kal\s*\{[^}]*grid-template-columns:\s*1\.5fr\s+1fr/)
  // `:52` — sieben Spalten
  assert.match(ohneKommentar, /\.dk-kal-raster\s*\{[^}]*grid-template-columns:\s*repeat\(7,\s*1fr\)/)
  // `:60` — minHeight 62
  assert.match(ohneKommentar, /\.dk-kal-zelle\s*\{[^}]*min-height:\s*62px/)
  // `:67` — Strichhoehe 3
  assert.match(ohneKommentar, /\.dk-kal-strich\s*\{[^}]*height:\s*3px/)
})

test('das Zellenraster stimmt mit dem September 2026 ueberein', () => {
  // `[cmd]` **Die Vorlage rechnet es mit `new Date(2026, 8, 1)`**
  // (`:33-37`). `[cmd]` **Hier steht das Ergebnis fest** (G-390: kein
  // `new Date()` im Browser).
  //
  // `[read]` **Die Probe rechnet nach** — driftet die Liste, faellt
  // sie. **Sonst waere die feste Liste ein Gedaechtnis, kein Mass.**
  const quelle = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', 'ansicht-kalender.tsx'), 'utf8')
  const m = /const ZELLEN: Array<number \| null> = \[([\s\S]*?)\]/.exec(quelle)
  assert.ok(m, 'ZELLEN nicht gefunden')
  const gebaut = m[1].split(',').map(s => s.trim()).filter(Boolean)
    .map(s => s === 'null' ? null : Number(s))

  const first = new Date(2026, 8, 1)
  const startDow = (first.getDay() + 6) % 7
  const days = new Date(2026, 9, 0).getDate()
  const soll: Array<number | null> = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]
  while (soll.length % 7) soll.push(null)

  assert.deepEqual(gebaut, soll,
    `Raster weicht ab: ${gebaut.length} Zellen gegen ${soll.length}`)
})

test('CAL_EVENTS ist vollstaendig uebernommen', () => {
  // `[cmd]` **Neun Tage, vierzehn Termine** — der Auftrag nennt beide
  // Zahlen, und sie stehen in der Vorlage.
  const vorlage = readFileSync(join(DRAFT, 'module-coach-portal-tools.jsx'), 'utf8')
  const block = vorlage.slice(vorlage.indexOf('const CAL_EVENTS'),
    vorlage.indexOf('const CAL_KIND'))
  const tageVorlage = (block.match(/"2026-09-\d\d":/g) ?? []).length
  const termineVorlage = (block.match(/\{ t: "/g) ?? []).length

  const daten = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', 'daten-portal.ts'), 'utf8')
  const dBlock = daten.slice(daten.indexOf('export const CAL_EVENTS'),
    daten.indexOf('export const CAL_KIND'))
  const tageGebaut = (dBlock.match(/"2026-09-\d\d":/g) ?? []).length
  const termineGebaut = (dBlock.match(/\bt:\s*"/g) ?? []).length

  assert.equal(tageGebaut, tageVorlage, `Tage: ${tageGebaut} statt ${tageVorlage}`)
  assert.equal(termineGebaut, termineVorlage,
    `Termine: ${termineGebaut} statt ${termineVorlage}`)
  assert.equal(tageVorlage, 9)
  assert.equal(termineVorlage, 14)
})

test('kein Spaltenname steht in der Akte', () => {
  // **Tom, 2026-09-08:** *„Was heute dort steht — kcal_schnitt,
  // tage_mit_eintrag, fat_g_schnitt — faellt weg."*
  //
  // `[read]` **Die Probe misst den QUELLTEXT der Akte** — am Schirm
  // ist es in `tools/_g410-akte.mjs` gemessen (0 Treffer). `[cmd]`
  // **Beides zusammen**: hier faellt auf, wer einen Spaltennamen
  // einbaut, dort faellt auf, wenn einer aus den Daten kommt.
  const akte = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', 'ansicht-akte.tsx'), 'utf8')
  const t = akte.split('\n').filter(z => !z.trim().startsWith('//')
    && !z.trim().startsWith('*')).join('\n')
  for (const muster of ['_schnitt', 'tage_mit', 'letzter_eintrag']) {
    assert.ok(!t.includes(muster), `Spaltenname „${muster}" steht in der Akte`)
  }
})

test('die Akte fuehrt die acht Reiter der Vorlage', () => {
  const vorlage = readFileSync(join(DRAFT, 'module-coach-client-record.jsx'), 'utf8')
  const ausVorlage = [...vorlage.matchAll(/mod === "(\w+)"/g)].map(m => m[1])
  const akte = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', 'ansicht-akte.tsx'), 'utf8')
  const gebaut = [...akte.matchAll(/mod === '(\w+)'/g)].map(m => m[1])
  assert.equal(ausVorlage.length, 8)
  assert.deepEqual(gebaut, ausVorlage)
})

test('die Woche zeigt eine Balkenreihe, keine Kurve', () => {
  // `[cmd]` **Die Vorlage ruft `BarSeries … highlight={5}`**
  // (`client-record.jsx:238`) — Samstag ist hervorgehoben.
  // `[cmd]` **G-409 zeigte hier eine `Sparkline`.**
  const akte = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', 'ansicht-akte.tsx'), 'utf8')
  const t = akte.split('\n').filter(z => !z.trim().startsWith('//')).join('\n')
  const woche = t.slice(t.indexOf('FCR_NUTRITION.week'))
  assert.match(t, /<Balkenreihe[\s\S]{0,200}FCR_NUTRITION\.week/)
  assert.match(woche.slice(0, 400), /highlight=\{5\}/,
    'Samstag muss hervorgehoben sein, wie in der Vorlage')
})

test('die Beschriftungen sind uebersetzt, die Werte nicht', () => {
  // **Tom:** *„Die SPRACHE ist frei, die FORM nicht."*
  //
  // `[read]` **Ein Wort darf deutsch werden, ein WERT nicht.**
  //
  // `[cmd]` **Der erste Anlauf verbot jede Ziffer im Schluessel**
  // und fiel ueber `Sessions - 7d`, `Adherence - 7d`,
  // `Sleep - 7d avg`. `[read]` **Das sind Beschriftungen, keine
  // Werte:** die 7d sagt, WORUEBER gezaehlt wird, nicht WIE VIEL.
  //
  // `[cmd]` **Die Probe misst jetzt die richtige Sache:** ein
  // uebersetzter WERT waere einer, der in der Vorlage als zweites
  // Glied eines Paares steht.
  const akte = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', 'ansicht-akte.tsx'), 'utf8')
  const m = /const WORT: Record<string, string> = \{([\s\S]*?)\n\}/.exec(akte)
  assert.ok(m, 'WORT nicht gefunden')
  const schluessel = [...m[1].matchAll(/'([^']+)':/g)].map(x => x[1])

  // Die Werte der Vorlage - zweites Glied jedes Paares.
  const daten = readFileSync(
    join(WURZEL, 'apps', 'coach', 'src', 'components', 'draft', 'daten-portal.ts'), 'utf8')
  const werte = new Set([...daten.matchAll(/\["[^"]+",\s*"([^"]+)"\]/g)].map(x => x[1]))
  const uebersetzteWerte = schluessel.filter(s => werte.has(s))
  assert.deepEqual(uebersetzteWerte, [],
    'Diese Eintraege uebersetzen einen WERT, nicht eine Beschriftung.')
  assert.ok(m[1].includes("'Calories today': 'Kalorien heute'"))
})
