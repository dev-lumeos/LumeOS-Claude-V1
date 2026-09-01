/**
 * G-319 — die Bedienung der Plaene, sieben Befunde.
 *
 * **Tom, 2026-09-02:** *„planner: die bedienung macht keinen sinn in
 * alle plaene."*
 *
 * `[read]` **Jeder Waechter hier misst die WIRKUNG, nicht das Wort** —
 * CLAUDE.md nennt vier Faelle (G-216, G-247, G-246, G-108), in denen
 * ein Waechter gruen blieb, waehrend die Sache kaputt war.
 */
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { test } from 'node:test'

/**
 * Die Wurzel — aus dem Ort DIESER Datei, nicht aus `cwd`.
 *
 * `[cmd]` **Sonst ist der Waechter gruen aus der Wurzel und faellt im
 * Gate** (A-63): Node laeuft dort mit `cwd` = `apps/web`.
 */
const WURZEL = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')),
  '../../../../../..',
)

function lies(rel: string): string {
  const p = path.join(WURZEL, rel)
  assert.ok(fs.existsSync(p), `${rel} fehlt — der Waechter misst nichts`)
  return fs.readFileSync(p, 'utf-8')
}

/** Kommentare weg — sonst zaehlt der eigene Text mit (G-186). */
function ohneKommentare(rel: string): string {
  return lies(rel)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const PLANNER = 'apps/web/src/app/v2/nutrition/tab-planner-echt.tsx'
const WERKBANK = 'apps/web/src/app/v2/nutrition/plan-werkbank-ui.tsx'
const ANSICHT = 'apps/web/src/app/v2/nutrition/ansicht.tsx'
const SCHREIB = 'apps/web/src/lib/nutrition/plan-write.ts'

/**
 * Den Rumpf einer FUNKTION herausschneiden — geklammert gezaehlt.
 *
 * `[cmd]` **G-319/S6: `[\s\S]*?` suchte ueber den Block hinaus** — ein
 * Treffer aus einem ganz anderen Baustein hielt den Waechter gruen.
 * **Erst schneiden, dann suchen.**
 */
function rumpf(quelle: string, kopf: RegExp): string {
  const m = quelle.match(kopf)
  assert.ok(m?.index !== undefined, `Funktion nicht gefunden: ${kopf}`)
  const start = m.index as number
  // `[cmd]` **BERICHTIGT: die erste `{` ist die DESTRUKTURIERUNG**,
  // nicht der Rumpf — `function X({ a, b }: {...}) {`. Sie schliesst
  // vor dem Koerper, und der Schnitt endete in der Typangabe.
  //
  // `[read]` **Also die Klammer NACH der Argumentliste** — die erste,
  // die auf `) {` folgt. Bei einem JSX-Ausdruck (`actions={(`) gibt es
  // keine, dann gilt die erste.
  const nachArg = quelle.slice(start).search(/\)\s*\{/)
  const i = nachArg >= 0
    ? quelle.indexOf('{', start + nachArg)
    : quelle.indexOf('{', start)
  assert.ok(i > 0, `kein Rumpf: ${kopf}`)
  let tiefe = 0
  for (let j = i; j < quelle.length; j += 1) {
    if (quelle[j] === '{') tiefe += 1
    else if (quelle[j] === '}') {
      tiefe -= 1
      if (tiefe === 0) return quelle.slice(start, j + 1)
    }
  }
  assert.fail(`Rumpf nicht geschlossen: ${kopf}`)
}

/**
 * Das JSX-Element UM eine Fundstelle herum.
 *
 * `[read]` **Fuer JSX taugt die Klammerzaehlung nicht** — ein
 * Knopftext steht MITTEN im Element, nicht davor. **Also rueckwaerts
 * bis zum oeffnenden Tag, vorwaerts bis zum schliessenden.**
 *
 * `[cmd]` **Und die Spanne wird geprueft, nicht geraten:** faende der
 * Schnitt kein Tag, waere das Fenster die ganze Datei — genau der
 * Fehler, den S6 ausgenutzt hat.
 */
function element(quelle: string, wort: string, tag = 'button'): string {
  const i = quelle.indexOf(wort)
  assert.ok(i > 0, `„${wort}" steht nicht in der Datei`)
  const a = quelle.lastIndexOf(`<${tag}`, i)
  const b = quelle.indexOf(`</${tag}>`, i)
  assert.ok(a >= 0 && b > i,
    `„${wort}" steht in keinem <${tag}> — der Schnitt griffe die `
    + 'ganze Datei')
  return quelle.slice(a, b + tag.length + 3)
}

// ══ 1. Anwaehlen zeigt die Werkbank ══════════════════════════════════

test('G-319/1: die Kachel waehlt an, sie bearbeitet nicht', () => {
  // **Tom:** *„prinzipiell anwaehlen zeigt unten die werkbank
  // davon, darin bearbeiten button auf der rechten oberen seite."*
  //
  // `[read]` **Zwei Schritte, zwei Woerter.** Ein Knopf, der
  // *„Bearbeiten"* heisst und nur umschaltet, verspricht mehr als er
  // tut.
  // ══ BERICHTIGT, Tom 2026-09-02 ══════════════════════════════
  //
  // *„anstatt diesen anwaehlbutton einfach die kachel anwaehlbar
  // machen."*
  //
  // `[read]` **Der Knopf ist weg — die Kachel IST der Knopf.**
  const u = ohneKommentare(WERKBANK)
  assert.doesNotMatch(u, /Anwählen\s*<\/button>/,
    'der Anwaehlknopf ist zurueck — die Kachel soll selbst waehlen')

  // `[cmd]` **Die Wirkung: die `Card` traegt den Klick.**
  const kachel = element(u, 'aria-label={offen ? undefined', 'Card')
  assert.match(kachel, /onClick=\{offen \? undefined : \(*\(\) => onWaehlen\(p\.id\)\)*\}/,
    'die Kachel waehlt nicht an')

  // `[cmd]` **Und sie ist mit der Tastatur bedienbar** — ein
  // `onClick` auf einem `div` ist es sonst nicht.
  assert.match(kachel, /role=\{offen \? undefined : 'button'\}/,
    'die Kachel hat keine Rolle — Screenreader lesen sie als Text')
  assert.match(kachel, /tabIndex=\{offen \? undefined : 0\}/,
    'die Kachel ist nicht anspringbar')
  assert.match(kachel, /e\.key === 'Enter' \|\| e\.key === ' '/,
    'die Kachel reagiert auf keine Taste')

  // `[read]` **Der offene Plan traegt eine Marke statt eines
  // Klicks** — ein Klick, der nichts tut, ist ein defekter Knopf.
  assert.match(u, /<Pill variant="acc">In der Werkbank<\/Pill>/,
    'der offene Plan ist nicht als solcher gekennzeichnet')

  // `[cmd]` **Und die Knoepfe IN der Kachel halten den Klick auf.**
  // `[read]` **Ohne das loeste *Aktivieren* beides aus** — die Frage
  // und den Wechsel in die Werkbank.
  const aktKnopf = element(u, 'Aktivieren\n')
  assert.match(aktKnopf, /e\.stopPropagation\(\)/,
    '„Aktivieren" waehlt die Kachel mit an')
  const gekapselt = (u.match(/onClick=\{e => e\.stopPropagation\(\)\}/g) ?? []).length
  assert.equal(gekapselt, 2,
    `${gekapselt} von 2 Dialogen sind gekapselt (Ablauf, Aktivieren) — `
    + 'ein Klick auf „Abbrechen" waehlte die Kachel sonst mit an')
})

// ══ 2. Bearbeiten oben rechts, gesperrt sichtbar ═════════════════════

test('G-319/2: Bearbeiten steht oben rechts in der Werkbank', () => {
  const p = ohneKommentare(PLANNER)
  // `[cmd]` **`actions` ist die obere rechte Ecke der `Card`** —
  // gemessen in `packages/ui/src/primitives.tsx`.
  const karte = rumpf(p, /actions=\{\(/)
  assert.match(karte, /Bearbeiten/,
    'der Bearbeiten-Knopf steht nicht in der Kopfzeile der Karte')
})

test('G-319/3: ein gesperrter Plan ist ausgewiesen und nicht anwaehlbar', () => {
  // **Tom:** *„falls ein plan nicht bearbeitbar ist weil gesperrt
  // muss das ausgewiesen werden und der bearbeiten button nicht
  // anwaehlbar sein."*
  //
  // **Tom, praezisiert:** *„also schlossmarke und grund in beiden
  // ansichten."*
  const p = ohneKommentare(PLANNER)

  // `[read]` **Die Wirkung, nicht das Wort:** der Knopf traegt
  // `disabled`, und zwar an derselben Bedingung wie die Marke.
  const knopf = rumpf(p, /actions=\{\(/)
  assert.match(knopf, /disabled=\{!bearbeitbar\}/,
    'der Bearbeiten-Knopf ist bei Sperre trotzdem anwaehlbar')
  assert.match(knopf, /!bearbeitbar && <Pill>gesperrt<\/Pill>/,
    'die Schlossmarke fehlt — die Sperre waere unsichtbar')

  // `[cmd]` **Der Grund steht da, nicht nur das Schloss.** `[read]`
  // Eine Sperre ohne Begruendung ist die Sackgasse aus G-311.
  assert.match(p, /\{!bearbeitbar && \([\s\S]{0,200}?\{sperrGrund\}/,
    'der Sperrgrund wird nicht angezeigt')

  // `[cmd]` **Und er kommt aus `bearbeitbarkeit()`** — je Herkunft ein
  // eigener Satz, nicht ein selbstgeschriebener.
  assert.match(p, /bearbeitbarkeit\(herkunftVon\(herkunft\), false\)/,
    'der Sperrgrund ist erfunden statt aus plan-lage.ts gelesen')
})

// ══ 4. Vier Kacheln in der Breite ════════════════════════════════════

test('G-319/4: die Plaene stehen nebeneinander, nicht in voller Breite', () => {
  // **Tom:** *„die plaene oben nehmen die ganze breite fuer nichts,
  // das koennen 4 kacheln in der breite sein und nach unten
  // aufbauend."*
  //
  // **Tom, praezisiert:** *„vergiss 1440 in meal plans hast unten 3
  // nebeneinander mit allem drin, wir haben eine webapplikation und
  // genug platz."*
  const u = ohneKommentare(WERKBANK)
  // `[cmd]` **Die Wirkung ist das Raster, nicht der Klassenname
  // allein** — ein `v2-grid` ohne Spaltenzahl ist eine Spalte.
  assert.match(u, /v2-grid v2-g-cols-3/,
    'die Kacheln stehen untereinander statt nebeneinander')
  // `[read]` **Und die Beschreibung ist raus** — sie machte jede
  // Kachel unterschiedlich hoch und das Raster unruhig.
  const liste = element(u, 'v2-g-cols-3', 'div')
  assert.doesNotMatch(liste, /\{p\.description\}/,
    'die Beschreibung steht wieder in der Kachel')
})

// ══ 5. New recipe ist weg ════════════════════════════════════════════

test('G-319/5: „New recipe" gibt es im Planner nicht', () => {
  // **Tom:** *„+new recipe gibt es nicht in planner."*
  //
  // `[cmd]` **A-59: entfernt, nicht auskommentiert** — deshalb sucht
  // der Waechter im Quelltext MIT Kommentaren nicht, sondern ohne:
  // ein auskommentierter Knopf ist trotzdem weg.
  const p = ohneKommentare(PLANNER)
  assert.doesNotMatch(p, /New recipe/,
    '„New recipe" steht wieder im Planner')
})

// ══ 6. Copy week kopiert ═════════════════════════════════════════════

test('G-319/6: „Copy week" ist ein Knopf mit Funktion', () => {
  // **Tom:** *„copy week braucht eine funktion."*
  const p = ohneKommentare(PLANNER)

  // `[cmd]` **Die Wirkung: kein `InEntwicklungKnopf` mehr.**
  const knopf = element(p, 'Copy week')
  assert.doesNotMatch(knopf, /InEntwicklungKnopf/,
    '„Copy week" ist wieder eine Attrappe')
  assert.match(knopf, /onClick=\{\(\) => setKopieren\(w\.id\)\}/,
    '„Copy week" oeffnet die Zielfrage nicht')
  // `[read]` **Ein gesperrter Plan kopiert auch nicht** — sonst waere
  // die Kopie der Ausweg um die Sperre herum (C-372).
  assert.match(knopf, /disabled=\{!bearbeitbar\}/,
    'ein gesperrter Plan laesst sich kopieren')

  // `[cmd]` **Die drei Wege, die Tom genannt hat.**
  const ziel = rumpf(p, /function KopierZiel\(/)
  for (const weg of ['anschluss', 'ende', 'datum']) {
    assert.ok(ziel.includes(`'${weg}'`), `der Weg „${weg}" fehlt`)
  }
  // `[cmd]` **Der Kalender zeigt belegte Wochen rot** — Toms Wort:
  // *„dann muss aber ein kalender oeffnen der schon geplante tage
  // anzeigt zb rot zur info."*
  assert.match(ziel, /istBelegt \? 'var\(--neg\)'/,
    'belegte Wochen sind nicht rot')
  assert.match(ziel, /disabled=\{istBelegt\}/,
    'eine belegte Woche laesst sich waehlen — der Fehler kaeme erst '
    + 'beim Speichern (UNIQUE plan_id, week_start)')

  // `[cmd]` **Und der Schreibweg existiert.** `[read]` Ein Dialog
  // ohne Gegenstueck ist eine Attrappe mit Kalender.
  const s = ohneKommentare(SCHREIB)
  assert.match(s, /export async function wocheKopieren\(/,
    'der Schreibweg zum Kopieren fehlt')
  assert.match(s, /rpc\('copy_meal_plan_week'/,
    'die Kopie geht nicht ueber die DB-Funktion aus C-150')
})

// ══ 7. Die Trennung ══════════════════════════════════════════════════

test('G-319/7: zwischen „Alle Plaene" und der Werkbank steht eine Trennung', () => {
  // **Tom:** *„zwischen alle plaene und der werrkbank darunter muss
  // eine klare trennung kommen."*
  const a = lies(ANSICHT)
  const i = a.indexOf('<PlanWerkbank')
  const j = a.indexOf('<PlannerEchtTab')
  assert.ok(i > 0 && j > i,
    'die Reihenfolge stimmt nicht — Werkbank steht nicht ueber dem Planner')
  // `[cmd]` **Die Wirkung: zwischen beiden steht eine Ueberschrift.**
  // `[read]` **Gemessen im Abschnitt DAZWISCHEN**, nicht in der Datei
  // — sonst faende der Waechter jede Ueberschrift irgendwo (S6).
  const dazwischen = a.slice(i, j)
  assert.match(dazwischen, /v2-eyebrow">Werkbank</,
    'zwischen Bibliothek und Planner steht keine Trennung')
})

// ══ 8. Die Bibliothek aktiviert ══════════════════════════════════════

test('G-319/8: die Plaene unten lassen sich aktivieren', () => {
  // **Tom:** *„meal plans: wenn unten plaene stehen muessen die auch
  // aktivierbar sein, da geht nichts."*
  //
  // `[cmd]` **Die Ursache war kein fehlender Knopf, sondern ein
  // verworfenes Argument:** `onAktivieren={() => setAktivieren(true)}`
  // — der Dialog oeffnete fuer den AKTIVEN Plan.
  const b = ohneKommentare('apps/web/src/app/v2/nutrition/plans-echt.tsx')
  const bib = rumpf(b, /export function PlanBibliothekEcht\(/)
  assert.match(bib, /aktiviert === p\.id && \(/,
    'die Frage haengt nicht an der Kachel')
  assert.match(bib, /plan=\{p\}/,
    'die Frage bekommt nicht den Plan DIESER Kachel')

  // `[read]` **Und der Aufrufer reicht keinen Rueckruf mehr durch,
  // der die `id` verlieren koennte.**
  const t = ohneKommentare('apps/web/src/app/v2/nutrition/tab-plans.tsx')
  assert.doesNotMatch(t, /(?<![a-zA-Z0-9_])onAktivieren(?![a-zA-Z0-9_])/,
    'der Rueckruf lebt weiter — er war die Ursache')
  assert.doesNotMatch(t, /(?<![a-zA-Z0-9_])MealPlanActivationModal(?![a-zA-Z0-9_])/,
    'das Modal mit dem falschen Plan lebt weiter (A-59)')
})
