// Erzeugt packages/ui/src/styles/v2.css aus dem Entwurf:
// jede Klasse bekommt das Praefix v2-, die :root-Tokenbloecke fallen
// weg (die Tokens sind identisch mit dem Bestand und stehen dort).
//
// Erzeugt, nicht abgeschrieben: 1.142 Zeilen von Hand zu uebertragen
// waere fehleranfaellig, und der Entwurf bleibt die Quelle.
import fs from 'node:fs'
import path from 'node:path'

const QUELLE = 'docs/spezifikation/10-plattform/design-system/theme-v1/styles.css'
const ZIEL = 'packages/ui/src/styles/v2.css'
const PRAEFIX = 'v2-'

let css = fs.readFileSync(QUELLE, 'utf8')

// --- 1. Die Tokenbloecke entfernen ---------------------------------
// :root { ... } und :root[data-theme="light"] { ... } tragen die 32
// Tokens. Die stehen bereits in apps/web/src/styles/themes/lume.css und
// sind dort im Hellmodus REPARIERT (--pos/--warn/--neg, d19e651). Wer
// sie hier mitnaehme, holte den Fehler zurueck.
const entfernt = []
css = css.replace(/:root(\[data-theme="(?:light|dark)"\])?\s*\{[^{}]*\}/g, (m) => {
  // Nur die reinen Tokenbloecke entfernen, nicht :root-Regeln mit
  // Klassenbezug (die haben kein reines Deklarationsinneres).
  entfernt.push(m.split('{')[0].trim())
  return ''
})

// --- 1b. Den externen Font-Import entfernen -------------------------
// Der Entwurf laedt Inter und JetBrains Mono per @import von
// fonts.googleapis.com. [cmd] apps/web laedt heute KEINE externen
// Schriften. Ein Uebernehmen brauchte der Anwendung eine Abhaengigkeit
// zu einem fremden Host auf — beim Parsen des Stylesheets, also im
// kritischen Pfad. Das ist keine Klasse, sondern eine Aenderung am
// Laufzeitverhalten, und gehoert nicht in G-01.
// Die Schriftfamilien stehen ohnehin in den Tokens (--font-mono).
// ACHTUNG: nicht `@import[^;]*;` — die Google-Fonts-URL enthaelt selbst
// Semikolons (wght@400;500;600), der Ausdruck bricht dann mittendrin ab
// und laesst den Rest als Muell stehen. Bis zum Semikolon NACH der
// schliessenden Klammer bzw. dem Zeilenende greifen.
const importe = []
css = css.replace(/@import\s+(?:url\([^)]*\)|"[^"]*"|'[^']*')[^;]*;/g,
  (m) => { importe.push(m.trim()); return '' })

// --- 2. Klassen praefixen ------------------------------------------
// Nur in Selektoren, nie in Deklarationen: sonst wuerden Werte wie
// url(.foo) oder Dezimalzahlen getroffen.
let anzahl = 0
const gesehen = new Set()

function praefixeSelektor(sel) {
  return sel.replace(/\.(-?[_a-zA-Z][\w-]*)/g, (m, name) => {
    gesehen.add(name)
    anzahl++
    return `.${PRAEFIX}${name}`
  })
}

// Datei in Selektor/Block-Paare zerlegen. At-Rules (@media, @keyframes)
// behalten ihren Kopf, ihr Inneres wird rekursiv behandelt.
function verarbeite(text) {
  let out = ''
  let i = 0
  while (i < text.length) {
    const auf = text.indexOf('{', i)
    if (auf === -1) { out += text.slice(i); break }

    let kopf = text.slice(i, auf)
    // passende schliessende Klammer suchen
    let tiefe = 1, j = auf + 1
    while (j < text.length && tiefe > 0) {
      if (text[j] === '{') tiefe++
      else if (text[j] === '}') tiefe--
      j++
    }
    const koerper = text.slice(auf + 1, j - 1)

    const istAtRegel = /@[\w-]+\s*$|@[\w-]+[^;{]*$/.test(kopf.trim()) &&
                       /^\s*@/.test(kopf.trim().split(/\}|\n\s*\n/).pop() ?? '')

    if (/@(media|supports|layer|container)/.test(kopf)) {
      out += kopf + '{' + verarbeite(koerper) + '}'
    } else if (/@(keyframes|font-face|import|charset|property)/.test(kopf)) {
      out += kopf + '{' + koerper + '}'
    } else {
      out += praefixeSelektor(kopf) + '{' + koerper + '}'
    }
    i = j
  }
  return out
}

css = verarbeite(css)

const kopf = `/* ============================================================
   Oberflaeche v2 — Klassen aus dem Entwurf, unter Praefix "${PRAEFIX}".

   ERZEUGT, NICHT ABGESCHRIEBEN. Quelle:
   ${QUELLE}
   Erzeugt am 2026-08-15 fuer G-01.

   WARUM EIN PRAEFIX
   Der Entwurf benennt seine Bausteine so allgemein, wie ein
   eigenstaendiges Dokument es darf: .card, .sidebar, .topbar, .btn,
   .pill, .row, .grid, .tabs, .avatar. In apps/web tragen die
   bestehenden Klassen das Praefix "lume-", aber Tailwind erzeugt
   Utilities im selben globalen Namensraum, und die zwoelf Modulseiten
   duerfen sich durch diesen Auftrag NICHT veraendern.
   [cmd] Eine Namensgleichheit besteht heute schon: .num steht in
   beiden Dateien.
   Mit "${PRAEFIX}" kann keine Regel von hier eine bestehende Seite
   treffen — die Trennung ist am Namen ablesbar und beim Umschalten
   (G-07) durch ein Suchen-und-Ersetzen aufloesbar.

   WARUM "${PRAEFIX}" UND NICHT "lume2-" ODER "ui-"
   "${PRAEFIX}" bindet die Klassen an die Route /v2 und an den
   TODO-Punkt. Wer in einem Jahr "${PRAEFIX}" sieht, findet den
   Zusammenhang; "ui-" waere nach dem Umschalten sinnlos, "lume2-"
   dauerhaft.

   KEINE TOKENS HIER
   Die 32 Tokens des Entwurfs sind [cmd] identisch mit denen in
   apps/web/src/styles/themes/lume.css. Sie werden NICHT mitgenommen.
   Grund: im Hellmodus des Entwurfs fehlen --pos, --warn und --neg;
   im Repo ist das am 2026-08-15 repariert (d19e651, L 0,50-0,55 statt
   0,72-0,82). Ein Mitnehmen holte den Fehler zurueck.
   Entfernte Bloecke: ${entfernt.join(', ') || '(keine)'}

   KEIN EXTERNER FONT-IMPORT
   Der Entwurf laedt Inter und JetBrains Mono von fonts.googleapis.com.
   [cmd] apps/web laedt heute keine externen Schriften; das Uebernehmen
   brauchte eine Abhaengigkeit zu einem fremden Host im kritischen Pfad
   auf. Entfernt: ${importe.length} @import-Regel(n).
   ============================================================ */

`

// --- 3. Eine Klasse, die der Entwurf nicht hat -----------------------
// .v2-root ist die Wurzel der Parallelroute. Der Entwurf kennt sie
// nicht, weil er als ganze Seite gedacht ist: dort ist .app die
// Wurzel — ein dreispaltiges Raster, das Sidebar und Kontextspalte
// erwartet. Solange die (G-02) fehlen, braucht /v2 eine Wurzel, die
// nur den Grund setzt und nichts erzwingt.
const zusatz = `
/* ---- Ergaenzung, nicht aus dem Entwurf ----------------------------
   Wurzel der Route /v2. Setzt Grund und Schriftfarbe aus den geteilten
   Tokens, ohne ein Raster zu erzwingen. .v2-app (dreispaltig) kommt
   zum Einsatz, sobald G-02 Sidebar und Kontextspalte liefert. */
.v2-root {
  min-height: 100dvh;
  background: var(--bg);
  color: var(--fg);
}
`

fs.mkdirSync(path.dirname(ZIEL), { recursive: true })
fs.writeFileSync(ZIEL, kopf + css.trimStart() + zusatz, 'utf8')

console.log(`Quelle : ${QUELLE}`)
console.log(`Ziel   : ${ZIEL}`)
console.log(`Tokenbloecke entfernt: ${entfernt.length} (${entfernt.join(', ')})`)
console.log(`Klassenvorkommen praefixt: ${anzahl}`)
console.log(`verschiedene Klassen     : ${gesehen.size}`)
