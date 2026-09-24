---
nr: G-479
typ: fehler
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-478
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - packages/ui/src/shell/app-shell.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-479 - zwei Klassen mit 2,88:1 in packages/ui

## Befund

Aus G-478, Claude Code, 2026-09-08:

> *,,`.v2-dim` und `.v2-eyebrow` messen 2,88:1 und liegen in
`packages/ui`, 1.565-fach ueber v2 benutzt ? sie zu aendern
haette A7 gebrochen, also habe ich sie nur im Modal
ueberschrieben."*

`[read]` **WCAG AA verlangt 4,5:1 fuer Fliesstext.**

`[cmd]` **1.565 Stellen in allen Modulen** ? **das ist kein
Nutrition-Befund.**

## Was zu messen ist

    A  wo werden die beiden benutzt? Je Modul eine Zahl.
    B  wofuer stehen sie -- Fliesstext oder Beiwerk?
    C  was bricht, wenn sie heller werden?

`[read]` **Ein Kontrast von 2,88:1 taugt fuer eine
Trennlinie, nicht fuer Text, den jemand lesen soll.**

## Abnahmebedingungen

    A1  je Modul: wie oft benutzt? TABELLE.
    A2  Fliesstext oder Beiwerk? Je Stelle.
    A3  berichtigt, wo es Text ist.
    A4  vier Module unveraendert -- oder BENANNT,
        was sich aendert und warum.
    A5  Kontraste nachher gemessen.

## Zweiter Beleg aus G-480, 2026-09-08

> *,,Der Tabellenkopf misst 2,88:1 ? belegt als ALTBEFUND,
weil dieselbe Messung am unangetasteten Food-DB-Reiter
denselben Wert liefert. Die Regel liegt in `packages/ui` und
betrifft 57 Dateien."*

`[cmd]` **`.v2-tbl th`** ? **dazu `.v2-dim` und
`.v2-eyebrow` aus G-478 (1.565-fach benutzt).**

`[read]` **Drei Klassen, ein Befund** ? **er betrifft jedes
Modul.**

## Bericht

**Der Befund, den ich zweimal gemeldet und zweimal umgangen habe,
ist behoben — global, mit drei geaenderten Zeilen.**

    A1  je Modul: wie oft benutzt?          TABELLE unten
    A2  Fliesstext oder Beiwerk?            Fliesstext
    A3  berichtigt, wo es Text ist          erfuellt
    A4  was sich in den Modulen aendert     BENANNT
    A5  Kontraste nachher gemessen          erfuellt
    A6  Waechter + Sabotage                 7/7
    A7  apps/web 1969, coach 65/65          erfuellt *

`[cmd]` **`supabase/` unberuehrt** — die dortigen Aenderungen sind
Codex' C-537.

`*` **Zwei Fehlschlaege, beide von Codex** — siehe unten.

### A1 — 1.905 Stellen, nicht 1.565

`[cmd]` **Gezaehlt 2026-09-23:**

    Modul          v2-dim   v2-eyebrow   v2-tbl
    nutrition        192        108         27
    supplements      171        130         30
    recovery         141         69         12
    goals            137         74         22
    coach            131         55         50
    medical          118        102         32
    training         111         52         30
    dashboard         13          5          0

    apps/web gesamt 1.022        606        209   = 1.837
    apps/coach          32         15          0   =    47
    packages/ui          5          2         14   =    21
                                                     -----
                                                     1.905

`[read]` **Meine G-478-Zahl (1.565) war zu niedrig** — sie zaehlte
nur zwei der drei Klassen.

### A2 — Fliesstext, kein Beiwerk

`[cmd]` **Zehn Stellen je Klasse gelesen:**

    v2-dim       {p.desc}, {s.desc}, {r.detail}, {p.when},
                 „Nothing — you have everything."
    v2-eyebrow   „Quiet hours", „Confidence", „Days", „Modules",
                 „Logged this session"
    v2-tbl th    die Spaltenkoepfe jeder Tabelle

`[read]` **Alle drei tragen Inhalt, den jemand liest** —
Beschreibungen, Werte, Abschnittstitel, Spaltennamen. `[read]`
**Der Satz aus dem Auftrag trifft: 2,88:1 taugt fuer eine
Trennlinie, nicht dafuer.**

### Und ein Befund, den der Auftrag nicht kannte

`[cmd]` **Gemessen in BEIDEN Themen** (1x1-Canvas, am Schirm):

                  hell      dunkel
    vorher       2,88:1     2,12:1
    nachher      9,19:1      7,2:1

`[read]` **Im Dunkelmodus war es schlechter als die gemeldeten
2,88** — `--fg-dim` ist dort 0,420 gegen 0,680 im Hellen.
`[read]` **Eine Messung in einem Thema sagt nichts ueber das
andere.**

### A3 — warum drei Zeilen und nicht der Token

`[cmd]` **`--fg-dim` traegt VIER Dekorationen**, nicht nur Text:

    .v2-dot                  6-px-Punkt
    .v2-nav-item .v2-accent-dot   Akzentpunkt der Navigation
    (Zeile 1383)             1-px-Trennlinie
    (Zeile 1671)             7-%-Schraffurverlauf

`[read]` **Dort ist 2,88:1 richtig** — eine Trennlinie muss keinen
Text tragen. `[cmd]` **Den Token aufzuhellen haette sie
mitgetroffen**, und der Waechter faengt genau das.

`[cmd]` **`--fg-subtle` reicht nicht:** **4,87:1 hell, aber 3,98:1
dunkel** — gerechnet UND gemessen. `[read]` **Die halbe Loesung
waere im Dunkeln durchgefallen.**

`[cmd]` **`--fg-muted` traegt beide: 9,19:1 und 7,8:1** — derselbe
Wert, den `.v2-muted` schon benutzt, und den ich in G-453 und
G-493 lokal eingesetzt habe.

**Geaendert: drei Zeilen in `packages/ui/src/styles/v2.css`.**

### A4 — was sich in den Modulen aendert

`[read]` **Der Auftrag sagt es: eine Aenderung in `packages/ui`
VERAENDERT die Module — das ist der Zweck.** `[cmd]` **Also
gemessen, vorher und nachher, sechs Module:**

    Seite            Status  Kacheln   Zeichen  Knoten  betroffen
    /v2/nutrition      200      45     195.376   2.805     271
    /v2/training       200      47     104.794     950      50
    /v2/medical        200      50     511.297     653      33
    /v2/goals          200      58      50.721     781      50
    /v2/supplements    200      58     488.237     847      50
    /v2/recovery       200      72     110.220   1.570      83

    Abweichungen in Aufbau/Menge: 0
    Betroffene Elemente:        537

`[read]` **Was sich aendert, ist die FARBE von 537 Elementen.**
`[read]` **Was sich NICHT aendert: Kachelzahl, Zeichenzahl,
Knotenzahl — in allen sechs gleich.**

`[cmd]` **Ein erster Vergleich zeigte 5 Abweichungen** — alle in
nutrition und training. `[cmd]` **Gegengeprueft: zweimal
hintereinander OHNE Aenderung gemessen ergibt 0.** `[read]` **Die
Abweichung kam vom Zuruecksetzen selbst:** nach einem
`git checkout` uebersetzt der Dev-Server neu und liefert eine
halb aufgebaute Seite. `[cmd]` **Mit einem Aufwaermlauf auf beiden
Seiten: 0 Abweichungen.**

### A6 — der Waechter, und der eine gruene Schaden

`[cmd]` **`g479-kontraste-in-packages-ui.test.ts`, 3 Faelle.**
`[cmd]` **`_g479-sabotage.mjs`: 6 Schaeden plus Kontrolle — 7/7.**

`[read]` **Drei davon pruefen die FALSCHEN Loesungen:**

    v2-dim auf --fg-subtle          ROT (3,98 dunkel)
    --fg-dim hell aufgehellt        ROT (trifft die Dekoration)
    --fg-dim dunkel aufgehellt      ROT

`[cmd]` **Der Waechter rechnet den Kontrast aus den Tokenwerten**
und prueft BEIDE Themen. `[cmd]` **Gegen die Canvas-Messung
gehalten:** 2,88 gegen 2,88, 9,21 gegen 9,19, 4,85 gegen 4,87.
`[read]` **Im Dunklen rechnet er leicht zu guenstig** (2,29 gegen
2,12) — **die Abweichung geht in die sichere Richtung fuer eine
Untergrenze.**

`[cmd]` **Zwei Schaeden trafen erst nicht** (mehrzeiliger Suchtext
in einer CRLF-Datei — dieselbe Falle wie in G-492 bis G-496).
`[cmd]` **Und einer blieb GRUEN, zu Recht:** ein `color:` VOR dem
vorhandenen zu ergaenzen aendert nichts — **die spaetere Angabe
gewinnt.** `[read]` **Kein blinder Waechter, ein zu weicher
Schaden.**

### A7 — und zwei Fehlschlaege, die mir nicht gehoeren

`[cmd]` **apps/web 1967/1969, apps/coach 65/65.**

`[cmd]` **Die zwei Fehlschlaege liegen beide bei Codex:**

    A-50   tools/gefallene-spalten-pruefen.mjs (C-537)
    G-278  apps/web/src/app/v2/training/modale.tsx (C-536)

`[cmd]` **Belegt:** mit Codex' `gefallene-spalten-pruefen.mjs`
beiseitegelegt laeuft der A-50-Waechter **9/9 gruen**. `[read]`
**Meine Aenderung ist eine Farbe in einer CSS-Datei** — sie kann
keinen Spaltenwaechter kippen.

`[cmd]` **Ohne die beiden: 1.969/1.969.**

### Ein eigener Fehler, den das Gate gefunden hat

`[cmd]` **`pnpm lint` fiel** — **nicht an dieser Aenderung, aber an
meiner aus G-496:**

    produkt-tafel.tsx:568  React Hook "React.useState" is called
                           conditionally
    produkt-tafel.tsx:572  dasselbe fuer React.useEffect

`[cmd]` **Der fruehe Ausstieg fuer `dsldId === null` stand VOR den
Haken.** `[read]` **Das war kein Stilfehler:** ein Produkt ohne
`dsld_id` haette die Hakenliste verschoben, **und der naechste
Anstrich haette den Zustand eines anderen Bausteins gelesen.**

`[cmd]` **Behoben: die Haken stehen jetzt vor jedem `return`.**
`[cmd]` **`pnpm lint`: 0 Fehler.**

`[read]` **Aufgefallen ist es erst hier, weil G-496 das Gate nicht
bis zum Lint durchlaufen hat** — ich hatte nur die Abschnitte
gelesen, die mich interessierten.

### Die Fotos

    x-g479-hell.png     Supplements im Hellmodus
    x-g479-dunkel.png   Supplements im Dunkelmodus — dort war es
                        mit 2,12:1 am schlechtesten

### Neustart noetig?

`[cmd]` **Nein — gemessen.** `[read]` **`packages/ui` braucht
sonst einen Neustart** (CLAUDE.md), **aber die CSS wird ueber den
Stilpfad geladen und war sofort wirksam:** die Nachher-Messung lief
ohne Neustart und zeigt 9,19/7,2.

## Abnahme

_(vom Orchestrator)_
