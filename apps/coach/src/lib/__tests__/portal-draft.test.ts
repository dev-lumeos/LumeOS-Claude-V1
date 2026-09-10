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
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  DRAFT_NAV, alleBereiche, alleKinder, bereichVon,
} from '../../components/portal-draft-nav'
import { DRAFT_KONTEXT } from '../../components/portal-draft-kontext'
// G-407: das Verzeichnis der gebauten Kachel-Ansichten.
import { DRAFT_ANSICHTEN } from '../../components/draft/ansichten'

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
