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
