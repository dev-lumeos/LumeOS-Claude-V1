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

/* 5. Deckungszeile je Naehrstoff (G-03).
   Der Entwurf zeigt Naehrstoffe als Balken mit Prozentwert, aber immer
   in einer Leserichtung. [read] C-48 verlangt drei Faelle mehr:
   Untergrenze statt Prozent, Obergrenze statt Ziel, und "kein
   Einzelwert" statt eines leeren Balkens. Deshalb eine eigene Zeile. */
.v2-coverage-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(60px, 120px) 62px;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 6px 4px;
  border-bottom: 1px solid color-mix(in oklch, var(--border) 60%, transparent);
  font-size: 12px;
  text-align: left;
}
button.v2-coverage-row { cursor: pointer; }
button.v2-coverage-row:hover { background: var(--surface-hover); }
.v2-coverage-row:last-child { border-bottom: 0; }

.v2-coverage-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--fg-muted);
}
.v2-coverage-value { color: var(--fg); white-space: nowrap; }

.v2-coverage-bar {
  position: relative;
  height: 5px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}
.v2-coverage-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
}
/* Markierung der 100 % bei einer Obergrenze. */
.v2-coverage-limit {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 1px;
  background: var(--fg-dim);
}
.v2-coverage-pct { text-align: right; white-space: nowrap; font-size: 11px; }
.v2-coverage-missing {
  grid-column: 1 / -1;
  color: var(--warn);
  font-size: 10px;
}

/* 6. Trefferzeile der Lebensmittelsuche (G-03). */
.v2-hit {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 10px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
}
.v2-hit:hover {
  border-color: color-mix(in oklch, var(--acc) 30%, var(--border));
  background: var(--surface-hover);
}
.v2-hit[data-selected="true"] {
  border-color: color-mix(in oklch, var(--acc) 50%, var(--border));
  background: color-mix(in oklch, var(--acc) 8%, var(--surface));
}
.v2-hit-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--fg);
  font-size: 12.5px;
}
.v2-hit-meta {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: var(--fg-dim);
  font-size: 10.5px;
}
.v2-hit-kcal { color: var(--fg-muted); font-size: 11.5px; white-space: nowrap; }

/* 7. Eingabefeld im Inhaltsbereich (G-03).
   Der Entwurf hat nur das Feld in der Seitenleiste (.sidebar-search
   input) — mit Platz fuer ein Lupensymbol davor und auf 240px Breite
   gerechnet. Im Inhaltsbereich braucht es die volle Breite. */
.v2-feld {
  flex: 1;
  min-width: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 10px;
  color: var(--fg);
  font-size: 12.5px;
}
.v2-feld::placeholder { color: var(--fg-dim); }
.v2-feld:focus-visible { border-color: var(--acc); }
select.v2-feld { cursor: pointer; }

/* 9. Formularteile (GO-01).
   Der Entwurf hat ein Onboarding mit denselben Mustern
   (module-onboarding.jsx), aber ausschliesslich als Inline-Stile —
   Auswahlliste, Zahlenfeld mit Einheit, Aktivitaetsliste mit Faktor.
   Hier als Klassen, damit sie einmal beschrieben sind. Nur vorhandene
   Tokens. */

/* Einheit rechts im Zahlenfeld. */
.v2-feld-einheit {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: 11px;
  pointer-events: none;
}

/* Eine Zeile einer Auswahlliste (Aktivitaetsstufen). */
.v2-wahl {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  text-align: left;
  cursor: pointer;
}
.v2-wahl:hover { background: var(--surface-hover); }
.v2-wahl[data-on="true"] {
  border-color: color-mix(in oklch, var(--acc) 35%, var(--border));
  background: color-mix(in oklch, var(--acc) 10%, var(--surface));
}
.v2-wahl-punkt {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: 2px solid var(--border-strong);
  border-radius: 999px;
  background: transparent;
}
.v2-wahl[data-on="true"] .v2-wahl-punkt {
  border-color: var(--acc);
  background: var(--acc);
}
.v2-wahl-titel {
  display: block;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--fg);
}
.v2-wahl[data-on="true"] .v2-wahl-titel { font-weight: 600; }
.v2-wahl-hinweis {
  display: block;
  margin-top: 1px;
  font-size: 11px;
  color: var(--fg-muted);
}

/* Fehlermeldung am Feld. */
.v2-feldfehler {
  margin-top: 4px;
  color: var(--neg);
  font-size: 10.5px;
}

/* 10. Mahlzeiten und Positionen (C-03).
   Der Entwurf hat .tbl-meal und .meal-card, aber fuer eine ANZEIGE —
   ohne Eingabefelder, Mengenaenderung oder Entfernen. Hier eine
   eigene Zeile, weil sie Bedienelemente traegt. Nur vorhandene Tokens. */
.v2-meal {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 10px 12px;
}
.v2-meal-kopf {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}
.v2-meal-titel {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--fg);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}
.v2-meal-titel:hover { color: var(--acc); }

.v2-position {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 72px auto;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-top: 1px solid color-mix(in oklch, var(--border) 60%, transparent);
  font-size: 12px;
}
.v2-position-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--fg-muted);
}
.v2-position-kcal { text-align: right; color: var(--fg); font-size: 11.5px; }

/* Wertart neben dem Naehrstoffnamen (C-03). Ein Naehrstoff kann
   zweimal dastehen — einmal als Ziel (PRI/AI), einmal als Obergrenze
   (UL). Ohne die Marke sieht das nach einem Fehler aus. */
.v2-kind {
  margin-left: 6px;
  padding: 0 4px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: 9px;
  vertical-align: 1px;
}

.v2-suchblock {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

/* Leiste unter dem Formular. */
.v2-formleiste {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

/* 8. Leerer Zustand und Hinweiszeile (G-03).
   Der Entwurf kennt beides nicht — in einer Vorfuehrung ist nie etwas
   leer und nie etwas unsicher. In der Anwendung ist genau das der
   Normalfall: [cmd] meals und meal_items haben 0 Zeilen. */
.v2-empty {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius);
  background: color-mix(in oklch, var(--surface) 70%, var(--bg));
  padding: 16px;
  color: var(--fg-muted);
  font-size: 12.5px;
  line-height: 1.55;
}
.v2-empty strong { color: var(--fg); }

.v2-hinweis {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  border-top: 1px solid color-mix(in oklch, var(--border) 60%, transparent);
  padding-top: 10px;
  color: var(--fg-dim);
  font-size: 11px;
  line-height: 1.5;
}
.v2-hinweis strong { color: var(--fg-muted); }

.v2-link {
  color: var(--acc);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ================================================================
   AB HIER: von Hand ergaenzt, NICHT aus dem Entwurf erzeugt.
   ================================================================
   [cmd] G-19 hat gemessen, dass ein Lauf dieses Erzeugers 164 Zeilen
   geloescht haette — die Klassen aus G-03 bis G-18 standen nur in
   v2.css und nicht hier. Wer eine Klasse ergaenzt, ergaenzt sie
   AB HIER, nicht in der erzeugten Datei.
   ================================================================ */
/* Attrappe — die Kachel steht, die Daten fehlen noch.
   [read] Tom, 2026-08-16: der Hinweis ist der Fortschrittsbalken. Er
   muss auf einen Blick vom verdrahteten Nachbarn zu unterscheiden sein,
   ohne die Anordnung zu veraendern — sonst springt das Bild, sobald
   eine Kachel fertig wird. Deshalb nur Rahmen und Deckkraft, keine
   andere Groesse und kein anderer Abstand.
   [cmd] Der Entwurf kennt diese Klasse nicht: er ist durchgehend
   Attrappe und braucht deshalb keine Kennzeichnung. */
.v2-card.v2-attrappe {
  border-style: dashed;
  border-color: color-mix(in oklch, var(--warn) 32%, var(--border));
  background: color-mix(in oklch, var(--warn) 3%, var(--surface));
}
/* Der Inhalt tritt zurueck, der Kopf mit der Marke bleibt lesbar. */
.v2-card.v2-attrappe > *:not(.v2-card-h):not(.v2-attrappe-grund) {
  opacity: 0.62;
}
.v2-attrappe-grund {
  margin: 0 0 10px;
  color: var(--fg-dim);
  font-size: 11px;
  line-height: 1.5;
}

/* Die Flaeche, die eine Attrappe statt Inhalt zeigt. Sie haelt die
   Hoehe, damit das Raster nicht springt, wenn die Kachel spaeter
   echten Inhalt bekommt. */
.v2-attrappe-flaeche {
  border: 1px dashed color-mix(in oklch, var(--border-strong) 70%, transparent);
  border-radius: var(--radius);
  background: repeating-linear-gradient(
    135deg,
    transparent 0 6px,
    color-mix(in oklch, var(--fg-dim) 7%, transparent) 6px 12px
  );
}

/* Eine Attrappe ohne Card braucht den Bezugspunkt fuer die Marke. */
.v2-card.v2-attrappe { position: relative; }

/* KPI bringt seinen eigenen Rahmen mit und nimmt keine \`attrappe\`-
   Requisite. Die Huelle traegt deshalb nur die Marke — ohne eigenen
   Rahmen, sonst stuende einer im anderen. */
.v2-kpi-huelle { position: relative; display: block; }
.v2-kpi-huelle.v2-attrappe .v2-kpi {
  border-style: dashed;
  border-color: color-mix(in oklch, var(--warn) 32%, var(--border));
  background: color-mix(in oklch, var(--warn) 3%, var(--surface));
}
.v2-attrappe-marke { position: absolute; top: 8px; right: 8px; z-index: 1; }

/* \`btn-sm\` benutzt die Vorlage in vier Kacheln (Smart suggestions,
   Pending actions, Pre-workout, „Why this?"), definiert sie aber
   [cmd] NIRGENDS in styles.css. Ohne Regel stuenden dort Knoepfe in
   voller Hoehe in einer Zeile mit 10.5px-Text. Die Werte sind aus dem
   Augenmass der umgebenden Zeilen abgeleitet, nicht aus der Vorlage —
   sie ist an dieser Stelle unvollstaendig. */
/* A-14: die Sprachliste in der Kopfzeile. Der Entwurf kennt keine
   Sprachwahl — er ist einsprachig englisch. Aufbau und Masse folgen
   dem Modus-Umschalter daneben, damit die Kopfzeile eine Zeile bleibt. */
.v2-sprachliste {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 40;
  min-width: 148px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  /* KEIN Schatten. Der Test friert die vorhandenen Festfarben ein, und
     fuer Schatten gibt es keinen Token — ein neuer waere eine
     Token-Entscheidung und gehoert Tom. Rahmen und Flaeche heben die
     Liste ausreichend ab. */
}
.v2-sprachwahl {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--fg-muted);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.v2-sprachwahl:hover { background: var(--surface-2); color: var(--fg); }
.v2-sprachwahl[data-on='true'] {
  background: color-mix(in oklch, var(--acc) 12%, var(--surface-2));
  color: var(--fg);
}

/* G-14: \`‹ Heute ›\` als Einheit, mittig im Modulkopf.
   Der Entwurf zeigt zwei blasse Pfeile am Rand der Aktionsleiste — eine
   Navigation, die man nicht als solche erkennt. Hier steht sie als
   Block zusammen, mit Rahmen, damit sie sich von den Aktionsknoepfen
   daneben abhebt. */
.v2-datumsnav {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.v2-datumsfeld {
  min-width: 140px;
  height: 26px;
  padding: 0 10px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--fg);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.v2-datumsfeld:hover:not(:disabled) { background: var(--surface-2); }
/* „Heute" ist kein Knopf — es gibt nichts anzuklicken. Deshalb ohne
   Zeigerwechsel und ohne die gedaempfte Schrift der Sperre. */
.v2-datumsfeld:disabled { cursor: default; opacity: 1; }

.v2-btn.v2-btn-sm {
  height: 22px;
  padding: 0 8px;
  font-size: 11px;
  flex-shrink: 0;
}

/* Das Hauptraster des Dashboards — Vorlage: gridTemplateColumns
   "1.4fr 1fr". [cmd] Der Entwurf hat null @media-Regeln; dass die
   Umsetzung welche braucht, ist eine erlaubte Anpassung (G-02). Unter
   1100px stapeln die Spalten, sonst wird die rechte Spalte unlesbar
   schmal. */
.v2-dash-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 1100px) {
  .v2-dash-grid { grid-template-columns: 1fr; }
}

/* Diary-Raster — Vorlage: gridTemplateColumns "1.5fr 1fr". */
.v2-diary-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 1100px) {
  .v2-diary-grid { grid-template-columns: 1fr; }
}
/* ================================================================
   9. Modul-Raster (G-19)
   ================================================================
   Die Vorlagen tragen ihre Raster inline als
   style={{gridTemplateColumns: …}}. Sie gehoeren hierher, nicht in
   eine Datei je Modul: [cmd] v2-train-grid-14 war Zeichen fuer
   Zeichen derselbe Zweispalter wie .v2-dash-grid.

   ZUSAMMENGEFASST statt eins zu eins uebernommen. Aus vier
   Trainings-Rastern plus zwei vorhandenen wurden DREI Verhaeltnisse:

     .v2-grid-14   1.4fr / 1fr   Dashboard, Training Today, Calendar,
                                 Offline sync, HR zones
     .v2-grid-15   1.5fr / 1fr   Diary, Progression, Standards
     .v2-grid-21   2fr / 1fr     History

   Das Verhaeltnis 1fr/1fr braucht kein eigenes Raster — dafuer gibt
   es .v2-g-cols-2 aus dem Entwurf. Damit fallen zwei der urspruenglich
   fuenf Trainings-Raster ganz weg.

   .v2-dash-grid und .v2-diary-grid bleiben als Aliasse stehen: sie
   stehen in Dashboard und Nutrition, und die durfte dieser Auftrag
   nicht anfassen.

   HALTEPUNKT 1100px — derselbe wie bisher, nicht neu erfunden. */
.v2-grid-14,
.v2-dash-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  align-items: start;
}
.v2-grid-15,
.v2-diary-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  align-items: start;
}
.v2-grid-21 {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  align-items: start;
}
.v2-span-2 { grid-column: span 2; }

@media (max-width: 1100px) {
  .v2-grid-14, .v2-dash-grid,
  .v2-grid-15, .v2-diary-grid,
  .v2-grid-21 { grid-template-columns: 1fr; }
  .v2-span-2 { grid-column: auto; }
}

/* Breite Tabellen scrollen in sich statt die Seite aufzuschieben.
   Der Entwurf setzt Tabellen mit festen Spaltenbreiten in Karten, die
   auf dem Telefon 320px breit sind. */
.v2-tbl-wrap { overflow-x: auto; }

/* --- Raster, die nur das Training braucht -----------------------
   Sie bleiben eigenstaendig: ihre Spaltenbreiten kommen aus der
   jeweiligen Vorlagenstelle und wiederholen sich nirgends sonst. */

/* Wochenleiste (Today). [cmd] module-training.jsx:216 — sieben
   Spalten; unter 700px waere eine 40px breit, dann zwei Reihen. */
.v2-train-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
@media (max-width: 700px) {
  .v2-train-week { grid-template-columns: repeat(4, 1fr); }
}

/* Sitzungskopf (Today). [cmd] module-training.jsx:86. */
.v2-train-session-kopf {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}
@media (max-width: 640px) {
  .v2-train-session-kopf { flex-wrap: wrap; }
}

/* [cmd] module-training.jsx:87-92. */
.v2-train-medallion {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: color-mix(in oklch, var(--acc-train) 18%, transparent);
  border: 1px solid color-mix(in oklch, var(--acc-train) 35%, transparent);
  display: grid;
  place-items: center;
  color: var(--acc-train);
  flex-shrink: 0;
}

/* Volumen nach Muskel (History). [cmd] module-training.jsx:406. */
.v2-train-vol-tbl {
  display: grid;
  grid-template-columns: 120px 1fr 80px 80px 80px;
  gap: 8px;
  align-items: center;
}
@media (max-width: 760px) {
  .v2-train-vol-tbl { grid-template-columns: 90px 1fr 52px 62px 62px; }
}

/* Filterzeile der Uebungsliste. [cmd] module-training.jsx:455. */
.v2-train-lib-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

/* Pausenzaehler (Live workout). [cmd] module-training.jsx:602. */
.v2-train-rest {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* Eine Zeile der Volume landmarks. [cmd] module-training-spec.jsx:236. */
.v2-train-landmark-row {
  display: grid;
  grid-template-columns: 90px 1fr 90px 110px 120px;
  gap: 10px;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid color-mix(in oklch, var(--border) 45%, transparent);
}
@media (max-width: 900px) {
  .v2-train-landmark-row { grid-template-columns: 74px 1fr 70px 86px; }
  .v2-train-landmark-row > :last-child { grid-column: 2 / -1; text-align: left; }
}

/* Post-workout feedback. [cmd] module-training-spec.jsx:292. */
.v2-train-feedback-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}
.v2-train-score-btn { font: inherit; }

/* Eine Zeile der HR-Zonen. [cmd] module-training-offline-hr.jsx:218. */
.v2-train-hr-row {
  display: grid;
  grid-template-columns: 22px 96px 1fr 52px 46px;
  gap: 10px;
  align-items: center;
}
@media (max-width: 560px) {
  .v2-train-hr-row { grid-template-columns: 22px 80px 1fr 44px; }
  .v2-train-hr-row > :last-child { display: none; }
}

/* Kopf der Offline-Kachel. [cmd] module-training-offline-hr.jsx:42. */
.v2-train-offline-kopf {
  display: flex;
  align-items: center;
  gap: 13px;
  flex-wrap: wrap;
}

/* Uebungszeile im Routine-Editor. [cmd] module-training-extras.jsx:169. */
.v2-train-ex-row {
  display: grid;
  grid-template-columns: 20px 1fr 110px 70px 90px 80px;
  gap: 6px;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 5px;
}
@media (max-width: 720px) {
  .v2-train-ex-row { grid-template-columns: 20px 1fr 80px; }
  .v2-train-ex-row > :nth-child(4),
  .v2-train-ex-row > :nth-child(5) { display: none; }
}

/* Die vier Kopffelder des Block-Editors. [cmd] module-training-extras.jsx:331. */
.v2-train-block-felder {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 10px;
}
@media (max-width: 640px) {
  .v2-train-block-felder { grid-template-columns: 1fr 1fr; }
}
`

fs.mkdirSync(path.dirname(ZIEL), { recursive: true })
fs.writeFileSync(ZIEL, kopf + css.trimStart() + zusatz, 'utf8')

console.log(`Quelle : ${QUELLE}`)
console.log(`Ziel   : ${ZIEL}`)
console.log(`Tokenbloecke entfernt: ${entfernt.length} (${entfernt.join(', ')})`)
console.log(`Klassenvorkommen praefixt: ${anzahl}`)
console.log(`verschiedene Klassen     : ${gesehen.size}`)
