// G-417: der Score rechnet, und die Spalten sind unabhaengig.
//
// `[read]` **Die Wirkung pruefen, nicht das Wort** — wo eine reine
// Funktion dahintersteht, wird sie AUFGERUFEN.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { nutritionScore, STUFEN_FAKTOR } from '@lumeos/scoring'

const WURZEL = path.resolve(process.cwd(), '../..')
const lies = (rel: string) => fs.readFileSync(path.join(WURZEL, rel), 'utf8')
const ohneKommentare = (rel: string) => lies(rel)
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')

const NUT = 'apps/web/src/app/v2/nutrition'
const LIB = 'apps/web/src/lib'

// `[cmd]` **Die Zahlen von `dev@lumeos.app` am 2026-09-11**, gemessen
// per `psql`. `[read]` **Ein Waechter mit echten Zahlen faellt auch
// dann, wenn die Formel nur leicht verrutscht.**
const DEV_IST = { enercc: 2178, prot625: 178, cho: 256, fat: 36, fibt: 55 }
const DEV_ZIELE = { kcal: 2500, protein_g: 170, carbs_g: 313, fat_g: 75, fiber_g: 30 }

// ══ A1 + A3: DER SCORE IST EINE ZAHL ═══════════════════════════════

test('A1/A3: dev bekommt 86 auf vollem Gewicht', () => {
  // `[cmd]` **Am Schirm gemessen: 86, Gewicht 1,00 von 1,00.**
  // `[read]` **Vorher standen dort zwei Gruende.**
  const e = nutritionScore(DEV_IST, DEV_ZIELE, 'pro')
  assert.equal(e.score, 86, 'Der Score von dev hat sich geaendert')
  assert.equal(e.gewichtGerechnet, 1,
    'Das Gewicht ist nicht mehr voll — ein Anteil faellt aus')
  assert.equal(e.status, 'ok')
  assert.equal(e.faktor, 1.00, '`pro` hat nicht mehr den Faktor aus E-80')
})

test('A3: der Ballaststoffanteil rechnet wirklich mit', () => {
  // `[read]` **Die Gegenprobe zur Zeile oben:** ohne Ziel muss das
  // Gewicht auf 0,85 fallen. `[read]` **Bleibt es bei 1,00, zaehlt
  // der Waechter etwas anderes.**
  const ohne = nutritionScore(DEV_IST, { ...DEV_ZIELE, fiber_g: null }, 'pro')
  assert.ok(Math.abs(ohne.gewichtGerechnet - 0.85) < 1e-9,
    `Ohne Ballaststoffziel muesste das Gewicht 0,85 sein, ist ${ohne.gewichtGerechnet}`)
  const mit = nutritionScore(DEV_IST, DEV_ZIELE, 'pro')
  assert.equal(mit.gewichtGerechnet, 1)
  // `[cmd]` **0,85 -> 1,00** — die Zahl aus der Abnahmebedingung.
  assert.ok(mit.gewichtGerechnet > ohne.gewichtGerechnet)
})

test('A3: der Leseweg fuehrt fiber_g von der Datenbank bis zur Kachel', () => {
  // `[read]` **Drei Stellen, und eine fehlende reicht** — die Spalte
  // kam schon vor G-417 aus `goals.zielwerte_am()`, der Typ liess
  // sie fallen.
  const z = ohneKommentare(`${LIB}/profile/zielwerte-read.ts`)
  assert.match(z, /fiber_g: number \| null/, 'Der Typ fuehrt fiber_g nicht')
  assert.match(z, /fiber_g:\s*zahl\(r\.fiber_g\)/, 'zielwerte_am bildet fiber_g nicht ab')
  const s = ohneKommentare(`${LIB}/nutrition/score-read.ts`)
  assert.match(s, /fiber_g:\s*ziele\?\.fiber_g/, 'Der Score liest fiber_g nicht')
})

test('A2: die Formel steht im Paket, nicht in der Kachel', () => {
  // **Codex, C-464:** *„Die Faktoren sind reine Score-Regeln …
  // `SPEC_09_SCORING.md:9-13` … nennt `packages/scoring/src/
  // nutrition.ts`. Eine Modultabelle waere falsch."*
  assert.ok(fs.existsSync(path.join(WURZEL, 'packages/scoring/src/nutrition.ts')),
    'packages/scoring/src/nutrition.ts fehlt')
  const k = ohneKommentare(`${NUT}/score-echt.tsx`)
  // `[read]` **Die Kachel darf nicht selbst rechnen** — zwei Orte
  // fuer eine Formel heissen zwei Formeln.
  assert.doesNotMatch(k, /roh \* faktor/,
    'Die Kachel rechnet den Score wieder selbst (G-417)')
  assert.doesNotMatch(k, /0\.30|0\.25/,
    'Die Gewichte stehen wieder in der Kachel (G-417)')
  const r = ohneKommentare(`${LIB}/nutrition/score-read.ts`)
  assert.match(r, /from '@lumeos\/scoring'/,
    'Der Leseweg holt die Formel nicht aus dem Paket')
})

test('A2: es gibt nur EINE Faktortabelle', () => {
  // `[read]` **Der alte Weg lebt noch fuer den Entwurf** — aber er
  // muss AUS DEM PAKET kommen. `[cmd]` **Sonst stehen zwei Tabellen
  // da, die sich widersprechen** (`advanced 1,00` gegen `0,90`),
  // **und die tote konserviert die alte Regel.**
  const alt = ohneKommentare(`${LIB}/nutrition/stufenfaktor.ts`)
  assert.match(alt, /from '@lumeos\/scoring'/,
    'Die alte Datei holt die Faktoren nicht aus dem Paket')
  assert.doesNotMatch(alt, /beginner:\s*0\.75/,
    'Die alte Datei traegt wieder eine eigene Faktortabelle (G-417)')
  assert.doesNotMatch(alt, /pro:\s*null/,
    '`pro: null` ist zurueck — E-80 hat den Faktor entschieden')
})

// ══ A4 + A5: ZWEI UNABHAENGIGE SPALTEN ═════════════════════════════

test('A4: zwei Stapel, keine Rasterzeilen', () => {
  // **Tom, 2026-09-11:** *„das sind zwei unabhaengige spalten."*
  //
  // `[read]` **Der Unterschied ist die Mechanik, nicht die Optik:**
  // ein Raster bindet seine ZEILE — Zeile 2 beginnt erst, wenn beide
  // Kacheln der Zeile 1 fertig sind. **`align-items: start` aendert
  // daran nichts.**
  const css = lies(`${NUT}/nutrition.css`).replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(css, /\.v2-saeule\s*\{[^}]*flex-direction:\s*column/,
    'Eine Saeule stapelt ihre Kacheln nicht')
  // `[read]` **Der Stapel darf kein Raster sein** — sonst ist die
  // Zeilenbindung wieder da.
  const saeuleBlock = css.match(/\.v2-saeule\s*\{[^}]*\}/)?.[0] ?? ''
  assert.ok(!/display:\s*grid/.test(saeuleBlock),
    'Die Saeule ist wieder ein Raster — dann binden ihre Zeilen (G-417)')
})

test('A5: die Anordnung ist die beauftragte', () => {
  // `[cmd]` **Der Auftrag nennt sie namentlich:**
  //
  //     links    Calorie balance / Verlauf / Makros im Detail
  //     rechts   Macro split / Auffaellige Naehrstoffe / Tagesdeckung
  // `[read]` **Vom Beginn des Blocks bis zur Kachel danach** — ein
  // `)}` als Ende faende die erste Bedingung IM Block, nicht sein
  // Ende. **Der Verlauf steht als naechstes und ist die Grenze.**
  const t = ohneKommentare(`${NUT}/ansicht.tsx`)
  const von = t.indexOf('v2-zwei-saeulen')
  assert.ok(von > 0, 'Der Zwei-Saeulen-Block wurde nicht gefunden')
  const bis = t.indexOf('MikroTrendKachel', von)
  assert.ok(bis > von, 'Hinter den Saeulen steht kein Verlauf mehr')
  const block = t.slice(von, bis)

  // `[read]` **Die REIHENFOLGE zaehlt, nicht das Vorkommen** — beide
  // Spalten enthalten dieselben sechs Namen, nur anders sortiert.
  // `[read]` **`exec`-Schleife statt `matchAll`** — `matchAll` liefert
  // einen Iterator, den das Ziel dieses Pakets nicht ausbreiten kann.
  const folge: string[] = []
  const muster = /<(\w+Kachel)\b/g
  let treffer: RegExpExecArray | null
  while ((treffer = muster.exec(block)) !== null) folge.push(treffer[1])
  assert.deepEqual(folge, [
    'KalorienbilanzKachel', 'TrendKachel', 'MakroDetailKachel',
    'MakroschnittKachel', 'WarnungenKachel', 'HeatmapKachel',
  ], 'Die Kacheln stehen nicht in der beauftragten Anordnung (G-417/3)')
})

test('A6: Micronutrient trend steht ausserhalb der Saeulen', () => {
  // `[cmd]` **Die Vorlage setzt `gridColumn: "span 2"`**
  // (`module-nutrition.jsx:393`) — **volle Breite ist die Vorlage.**
  //
  // `[read]` **Hier steht die Kachel NEBEN den Saeulen** — dann
  // braucht sie keine Spannweite, sie hat die Breite schon.
  // `[cmd]` **Am Schirm gemessen: 1052 px gegen 518 je Saeule.**
  const t = ohneKommentare(`${NUT}/ansicht.tsx`)
  assert.match(t, /MikroTrendKachel/, 'Der Verlauf fehlt ganz')
  // `[read]` **Die letzte Saeule endet vor dem Verlauf** — steht er
  // dahinter, ist er kein Kind einer Spalte.
  const letzteSaeule = t.lastIndexOf('className="v2-saeule"')
  const verlauf = t.indexOf('<MikroTrendKachel')
  assert.ok(letzteSaeule > 0 && verlauf > letzteSaeule,
    'Der Verlauf steht vor der letzten Saeule')
  // `[cmd]` **Und zwischen beiden schliesst das Raster** — sonst
  // stuende er doch darin.
  assert.ok(t.slice(letzteSaeule, verlauf).includes('</div>'),
    'Der Verlauf steht in einer Saeule — dann ist er halb so breit (G-417/A6)')
})

test('A7: .v2-grid bleibt unberuehrt', () => {
  // `[cmd]` **217 Aufrufer im Haus.** `[read]` **Eine gemeinsame
  // Hoehe ist anderswo gewollt** — die Ausnahme gehoert an die
  // Stelle, die sie braucht.
  const css = lies(`${NUT}/nutrition.css`)
  assert.ok(!/^\s*\.v2-grid\s*\{/m.test(css.replace(/\/\*[\s\S]*?\*\//g, '')),
    'Die Nutrition-CSS definiert `.v2-grid` um (G-417/A7)')
})

// ══ DIE STUFEN ═════════════════════════════════════════════════════

test('E-80: vier Stufen, vier Faktoren, kein intermediate', () => {
  assert.deepEqual(Object.keys(STUFEN_FAKTOR).sort(),
    ['advanced', 'beginner', 'elite', 'pro'])
  // `[read]` **Die Wirkung, nicht die Tabelle:** ein `beginner`, der
  // sein eigenes (leichteres) Ziel trifft, muss 100 bekommen.
  const werte = {
    enercc: 2500 * 0.75, prot625: 170 * 0.75, cho: 313 * 0.75,
    fat: 75 * 0.75, fibt: 30 * 0.75,
  }
  assert.equal(nutritionScore(werte, DEV_ZIELE, 'beginner').score, 100,
    'Der Faktor skaliert wieder den Score statt der Ziele (SPEC_09:33-40)')
})
