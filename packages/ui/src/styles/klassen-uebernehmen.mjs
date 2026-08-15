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

// --- 3. Eine feste Farbe, fuer die es einen Token gibt --------------
// [cmd] Der Entwurf traegt fuenf rgba()-Werte. Genau einer laesst sich
// ohne Erfindung ersetzen: rgba(255,255,255,0.75) auf .mh-stat steht
// unter [data-theme="light"] fuer "helle Flaeche" — und dafuer gibt es
// --surface, im Hellmodus oklch(1 0 0), also genau Weiss.
// Die uebrigen vier (drei Schatten, ein Modal-Schleier) haben KEINEN
// passenden Token; sie bleiben und stehen im Bericht. Einen
// Schattentoken zu erfinden waere eine Token-Entscheidung, und die
// gehoert Tom.
const vorher = (css.match(/rgba?\(/g) || []).length
css = css.replace(
  /(:root\[data-theme="light"\]\s*\.v2-mh-stat\s*\{[^}]*?background:\s*)rgba\(255,\s*255,\s*255,\s*0\.75\)/,
  '$1var(--surface)')
const nachher = (css.match(/rgba?\(/g) || []).length
if (nachher !== vorher - 1) {
  throw new Error(`Ersetzung der hellen Flaeche griff nicht: ${vorher} -> ${nachher}`)
}

const zusatz = `
/* ============================================================
   ERGAENZUNGEN — nicht aus dem Entwurf.
   Jede mit Grund, damit spaeter unterscheidbar bleibt, was von
   Codex' Entwurf stammt und was hier entstanden ist.
   ============================================================ */

/* 1. Modus-Umschalter in der Kopfzeile.
   Der Entwurf baut ihn aus Inline-Stilen (shell.jsx, Topbar). Als
   Klasse ist er einmal beschrieben statt zweimal gesetzt. Nur
   vorhandene Tokens. */
.v2-mode-switch {
  display: flex;
  gap: 1px;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
}
.v2-mode-switch button {
  display: grid;
  place-items: center;
  width: 24px;
  height: 22px;
  border-radius: 4px;
  color: var(--fg-muted);
  cursor: pointer;
}
.v2-mode-switch button[data-on="true"] {
  background: var(--fg);
  color: var(--bg);
}

/* 2. Ein deaktiviertes Bedienelement muss als solches erkennbar sein.
   Der Entwurf kennt keinen disabled-Zustand, weil in einer Vorfuehrung
   nichts deaktiviert ist. In der Anwendung schon: Suche, Commands und
   Benachrichtigungen gibt es noch nicht. */
.v2-btn:disabled,
.v2-icon-btn:disabled,
.v2-sidebar-search input:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 3. Sichtbarer Tastaturfokus.
   [cmd] Der Entwurf setzt nirgends :focus-visible — bei Bedienung per
   Tastatur ist dann nicht erkennbar, wo man steht. Die bestehende
   Oberflaeche hat dasselbe Problem; hier wird es nicht uebernommen. */
.v2-app :focus-visible {
  outline: 2px solid var(--acc);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* 4. Schmale Fenster.
   [cmd] Der Entwurf hat NULL @media-Regeln — er ist fuer den
   Schreibtisch gezeichnet. Die bestehende Oberflaeche hat zwei
   Haltepunkte (1279px, 1023px). Uebernommen wird deren Verhalten,
   damit v2 sich nicht anders verhaelt als das, was Tom kennt.
   Begruendung im Bericht, Abschnitt "Die Kontextspalte". */
@media (max-width: 1279px) {
  .v2-app,
  .v2-app[data-rightpanel="hidden"] {
    grid-template-columns: 56px minmax(0, 1fr);
  }
  /* Die Kontextspalte verschwindet zuerst: sie traegt Begleitung,
     nicht den Inhalt selbst. */
  .v2-context { display: none; }

  .v2-sidebar { padding: 0.75rem 0.5rem; }
  .v2-sidebar-brand .v2-brand-name,
  .v2-sidebar-brand .v2-brand-meta,
  .v2-sidebar-search,
  .v2-nav-group-label,
  .v2-nav-item kbd,
  .v2-nav-sub-group,
  .v2-user-meta {
    display: none;
  }
  .v2-nav-item {
    justify-content: center;
    padding-right: 0.35rem;
    padding-left: 0.35rem;
  }
}

@media (max-width: 1023px) {
  /* Eine Spalte. Die Seitenleiste wird zur Kopfleiste ueber dem
     Inhalt; das Fenster scrollt wieder normal. */
  .v2-app,
  .v2-app[data-rightpanel="hidden"] {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }
  .v2-sidebar {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    width: auto;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
  }
  .v2-sidebar-nav {
    flex-direction: row;
    gap: 0.35rem;
    /* Nicht umbrechen, sondern schieben: drei Zeilen Navigation ueber
       dem Inhalt kosten mehr Hoehe als ein Wischen kostet. */
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .v2-nav-group {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 0.35rem;
  }
  .v2-nav-item {
    flex: 0 0 auto;
    white-space: nowrap;
  }
  .v2-sidebar-user { margin-top: 0; margin-left: auto; }
  .v2-main { overflow: visible; }
}
`

fs.mkdirSync(path.dirname(ZIEL), { recursive: true })
fs.writeFileSync(ZIEL, kopf + css.trimStart() + zusatz, 'utf8')

console.log(`Quelle : ${QUELLE}`)
console.log(`Ziel   : ${ZIEL}`)
console.log(`Tokenbloecke entfernt: ${entfernt.length} (${entfernt.join(', ')})`)
console.log(`Klassenvorkommen praefixt: ${anzahl}`)
console.log(`verschiedene Klassen     : ${gesehen.size}`)
