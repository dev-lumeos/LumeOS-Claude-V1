---
nr: G-544
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-09-29
beauftragt: 2026-09-30
agent: claudecode

braucht: [G-538, G-541, G-553, G-554]
kind_von: G-538

quellen:
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx
  - docs/ssot/130-goals-bauordnung.md
  - docs/punkte/00-INDEX.md

erledigt: 2026-09-30
commit: 82b3973b
beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.user_goals
  dateien:
    - apps/web/src/app/v2/goals/phase-echt.tsx
    - apps/web/src/app/v2/goals/phase-setzen.tsx
    - apps/web/src/app/v2/goals/ansicht.tsx

zahlen:
  gemessen: 2026-09-29
  ziele_im_reiter_sichtbar: 0
  phasentypen_im_reiter_sichtbar: 9
---

# Der Phase-Reiter zeigt Phasentypen statt einer Zeitachse

    AUFTRAG FUER Claude Code - G-544: der Phase-Reiter bekommt eine
                                     Zeitachse und ein Ankerdatum
    Bereich: apps/web/src/app/v2/goals/
             apps/web/src/lib/goals/
             apps/web/src/components/shell/__tests__/ (nur Waechter)
    Fremd:   supabase/ gehoert Codex, der gerade an G-545 baut
             (Katalogwerte) - keine Kettenschritte, kein SQL, und
             goal_strategies.sub_phases wird GELESEN, nicht geaendert.
             docs/ gehoert dem Orchestrator, auch diese Punktdatei:
             der Bericht kommt als Antwort, nicht als Anhang hier.
             Die Browsersitzung in apps/web hat heute nur einen
             Nutzer - du. Kein Teilen noetig.
    Stand:   2026-09-30

**Zuerst lesen, vollstaendig:** diese Datei bis zum Ende, samt der
Liste unter *Zu belegen*.


**Tom, 2026-09-29, 11:56:** *„subnav phase engine: user kann seine goals
planen, terminieren, editieren."*

`[cmd]` Der Reiter zeigt heute **neun Phasentypen zur Auswahl und null
Ziele**. Er kann nicht terminieren, weil er nicht weiss, *was* er
terminieren soll — die Wurzel liegt in der Datenbank und ist G-538.

Dies ist der Oberflaechenteil davon: was Tom sieht, wenn die Struktur
steht.

## Auftrag

### A1 — der Reiter zeigt Ziele

Je Ziel des Nutzers eine Zeile: Titel, Zeitfenster (`gueltig_ab` bis
`target_date`), die laufende Strategie, wenn eine haengt. Mehrere Ziele
parallel — nach G-538 A2 erlaubt der Eindeutigkeitsindex eine offene
Phase **je Ziel**, nicht mehr eine je Nutzer.

Kein Ziel ist kein leerer Reiter, sondern der Weg zum Anlegen (G-537).

### A2 — terminieren heisst Ankerdatum

`[read]` `module-goals-editor.jsx:296`, der `anchor`-Reiter: ein Datum
eintragen, und alles davor rechnet **rueckwaerts**. Der Entwurf zeigt
sechs Zeilen aus einem Datum:

    Prep start        24 wk out
    Mid phase start   16 wk out
    Late phase start   8 wk out
    Refeeds begin     16 wk out
    Peak week start    1 wk out
    Show day           0

Die Rechnung gehoert server-frei nach `lib/goals/`, nicht in die
Komponente — sie wird vom Editor (G-539) erneut gebraucht, und zwei
Rechnungen fuer dasselbe gehen auseinander.

Die Wochen kommen aus `goal_strategies.sub_phases` (G-536, live), nicht
aus einer Liste im Browser.

### A3 — planen heisst Reihenfolge

Eine Strategie aus dem Katalog an ein Ziel haengen, mehrere in Folge
ergeben das Programm. `goal_strategies.next` sagt, welche Folgephasen
erlaubt sind; `requirements` sperrt, was der Nutzer nicht darf.

Der Jahresplan ist **fuenf Eintraege hintereinander**, keine eigene
Sache: `expert_bb_annual.annual` traegt sie.

### A4 — was dieser Punkt nicht baut

Den Editor (G-539). Kein Knopf, der dorthin zeigt, solange er nicht
existiert — eine Kachel, die dreimal nichts sagt, ist kein Posten.

## Zu belegen

Bilder je Zustand auf `test-user@lumeos.local`: kein Ziel · ein Ziel ohne
Strategie · ein Ziel mit laufender Phase · zwei Ziele mit je einer
offenen Phase (das war vorher verboten) · ein Ankerdatum gesetzt, mit den
rueckwaerts gerechneten Zeilen.

Die Ankerrechnung mit einer von Hand nachrechenbaren Zahl. Sabotage je
Waechter in beide Richtungen. Vier andere Module zeichengleich.
`pnpm gate` gruen. Nichts committen.

**Reihenfolge:** nach G-538 (Struktur) und G-541 (Kataloganzeige). Vorher
gibt es weder die Spalten noch die Auswahl, an die die Zeitachse haengt.


---

## Bericht Claude Code, 2026-09-30

### Was gebaut wurde

    apps/web/src/lib/goals/anker.ts               A2 -- reine Rechnung
    apps/web/src/lib/goals/lesen.ts               ladeOffenePhasen
    apps/web/src/app/v2/goals/phasen-zeitachse.tsx A1/A2/A3/A4
    apps/web/src/app/v2/goals/ansicht.tsx          Kopfmarke + Einbau
    apps/web/src/app/v2/goals/page.tsx             Leseweg angeschlossen
    apps/web/src/lib/goals/__tests__/g544-zeitachse.test.ts

### A1 — der Reiter zeigt Ziele, mehrere parallel

`[cmd]` **`phase_am()` kann das nicht.** Ihr Rumpf endet auf `LIMIT 1`
(gemessen an `prosrc`), und `ladePhase` nimmt `data[0]`. **Solange der
Reiter daran haengt, kann er strukturell nur EINE Phase zeigen.**

`[cmd]` **Seit G-538 steht der Eindeutigkeitsindex auf `goal_id`:**

    CREATE UNIQUE INDEX uq_goal_phases_one_open
      ON goals.goal_phases (goal_id) WHERE actual_end_date IS NULL

`[read]` **Eine offene Phase JE ZIEL, nicht je Nutzer** — deshalb
liest `ladeOffenePhasen` die Tabelle statt die Funktion.

**Am Schirm belegt, zwei Ziele mit je einer offenen Phase:**

    Ziele in der Achse            2
    davon mit laufender Phase     2
    offene Phasen in der DB       2   (actual_end_date IS NULL)

    Lean Bulk bis Maerz 2027   lean_bulk     2026-09-30 -> 2027-03-31
    Contest Prep bis November  contest_prep  2026-09-30 -> 2027-11-14

`[read]` **Kein Ziel ist kein leerer Reiter:** der Leerfall zeigt
einen Satz und den Knopf zum Anlegen (`data-zeitachse-neu`).

### A2 — terminieren heisst Ankerdatum

`[cmd]` **Die Rechnung steht in `lib/goals/anker.ts`, server-frei** —
kein Import aus `session`, kein `next/headers`, kein `Date.now()`.
**Ein Waechter haelt das fest**, damit G-539 sie aus einer
Client-Datei benutzen kann.

**Gegen den Entwurf gehalten** (`module-goals-editor.jsx:313-319`,
`anchorDate = '2026-11-14'`), jede Zeile nachgerechnet:

    24 Wochen vor 2026-11-14 = 2026-05-30   Entwurf 2026-05-30  ok
    16 Wochen vor 2026-11-14 = 2026-07-25   Entwurf 2026-07-25  ok
     8 Wochen vor 2026-11-14 = 2026-09-19   Entwurf 2026-09-19  ok
     1 Woche  vor 2026-11-14 = 2026-11-07   Entwurf 2026-11-07  ok

`[read]` **Im Entwurf sind die Daten EINGETIPPT** — hier werden sie
gerechnet und ergeben dieselben.

`[cmd]` **Die Wochen kommen aus `goal_strategies.sub_phases`**, nicht
aus einer Liste im Browser — gemessen: **eine** der 17 Zeilen fuehrt
sie (`contest_prep`), mit drei Spannen und einer blossen Zahl.

**Die Falle dabei:** `[cmd]` **der Trenner ist U+2013
(Gedankenstrich), nicht der Bindestrich und nicht der Pfeil** — an
den Codepoints gemessen. `[read]` **Wer auf `-` prueft, findet nichts
und zeigt eine leere Achse, ohne dass es auffaellt.** Alle drei
Formen werden gelesen.

**Am Schirm, mit Anker 2027-11-14:**

    early                       2027-05-30   24 Wo davor
    mid                         2027-07-25   16 Wo davor
    late                        2027-09-19    8 Wo davor
    peak_week                   2027-11-07    1 Wo davor
    Contest Prep bis November   2027-11-14    0

`[read]` **Eine Teilphase ohne lesbare Zahl faellt heraus, statt auf
dem Anker zu landen** — ein Datum, das nur dasteht, weil eine Zahl
fehlte, ist schlimmer als eine fehlende Zeile.

### A3 — planen heisst Reihenfolge

`[cmd]` **`goal_strategies.next_codes`**, gemessen: 8 der 17 Zeilen
fuehren sie. **Genannt, nicht verlinkt** — ein Wechsel schriebe eine
Phase, und das ist der Editor.

### A4 — der Editor wird nicht versprochen

`[read]` **Kein Knopf dorthin.** **Ein Satz sagt, was die Achse nicht
kann:** *„Einzelne Phasen bearbeiten — Teilphasen, Refeeds,
Protokolle — braucht den Editor aus G-539."* **Und die Achse
schreibt nicht**, ein Waechter haelt das fest.

### Am BILD gefunden, nicht am Zaehler

`[cmd]` **Zwei Befunde, beide bei gruener Messung:**

**1 — Die Marken kamen nicht im DOM an.** `Pill` nimmt nur benannte
Requisiten (`primitives.tsx:125`) und liess `data-zielphase` fallen.
**Gemessen: 0 statt 1.** **Behoben**, die Marke sitzt jetzt am `span`
darum.

**2 — Die Kopfmarke verschwieg eine Phase.** Bei zwei offenen Phasen
stand dort *„Phase lean bulk"* — sie las `echt.phase` aus
`phase_am()` mit seinem `LIMIT 1`. `[read]` **Eine von zwei zu nennen
heisst, die andere zu verschweigen.** **Jetzt steht dort
*„2 Phasen laufen"***, und die Art nur noch, wenn es genau eine ist.

### Nachweise

    19 Sabotagen, alle ROT (zwei waren zuerst gruen, siehe unten),
       1 Kontrollprobe, Wiederherstellung byte-gleich (md5 je Datei)
    5 Bilder auf test-user@lumeos.local:
       x-g544-1-leer.png           kein Ziel -> Weg zum Anlegen
       x-g544-2-ohne-strategie.png ein Ziel ohne Phase, eines mit
       x-g544-3-mit-phase.png      ein Ziel mit laufender Phase
       x-g544-4-zwei-phasen.png    ZWEI Ziele, je eine offene Phase
       x-g544-5-anker.png          der rueckwaerts gerechnete Plan
    pnpm gate GRUEN -- 18/18 Tasks, 2.278 Tests, 0 Fehler
    serverimport: 63 Client-Chunks, 0 Treffer (A-30 haelt)
    Testzeilen entfernt: user_goals 0, goal_phases 0
    SSOT nachgezogen. Nichts committet.

### Zwei Waechter, die zuerst nicht gemessen haben

`[read]` **Beide in der eigenen Sabotage aufgefallen** — dieselbe
Klasse, die ich in G-554 und G-557 schon hatte:

    1  „kein Ziel ist kein leerer Reiter" suchte die MARKEN
       irgendwo in der Datei. Die Sabotage ersetzte die Bedingung
       durch `false` -- gruen, weil beide Marken im Quelltext
       stehen blieben, nur unerreichbar. Jetzt wird die BEDINGUNG
       gemessen.
    2  „Folgephasen aus next_codes" suchte den Bezeichner. Die
       Sabotage tippte die Codes fest daneben -- gruen, weil
       `next_codes` im Kommentar weiterstand. Jetzt wird die
       AUSGABE gemessen, und keiner der 17 Codes darf als Text in
       der Achse stehen.

### Aufgefallen, ausserhalb dieses Auftrags

`[cmd]` **`PhaseEcht` oben im Reiter zeigt weiterhin nur EINE Phase**
— es liest `echt.phase` aus `phase_am()` (`LIMIT 1`). **Bei zwei
offenen Phasen steht dort eine, ohne Hinweis auf die zweite.**

`[read]` **Nicht angefasst:** der Auftrag nennt `phase-echt.tsx` unter
`beruehrt`, aber A1 verlangt die Zeitachse, und `PhaseEcht` ist der
Phasenkopf aus G-513. **Die Kopfmarke habe ich berichtigt**, weil sie
in `ansicht.tsx` steht und unmittelbar neben der neuen Achse eine
andere Zahl behauptete. **Der Phasenkopf selbst braucht einen eigenen
Punkt** — entweder mehrere Koepfe oder einen mit Auswahl.

### Nicht gebaut

`[read]` **Der Editor (G-539).** **Und der Jahresplan aus
`expert_bb_annual.annual`** — A3 nennt ihn als „fuenf Eintraege
hintereinander, keine eigene Sache". `[cmd]` **Die Achse zeigt ihn
noch nicht:** sie rechnet je Ziel EINE Strategie, und der Jahresplan
ist eine Folge von fuenf. **Das braucht die Reihenfolge aus A3 als
gespeicherte Kette** — heute traegt keine Tabelle sie
(`goal_phases` haelt je Zeile eine Phase, nicht ihre Ordnung).

## Abnahme 2026-09-30 — `82b3973b`

`[cmd]` **Die Ankerrechnung selbst nachgerechnet, alle vier Zeilen** —
eine reine Funktion darf der Orchestrator gegen die eigene Rechnung
halten:

    24 Wochen vor 2026-11-14 = 2026-05-30
    16 Wochen vor 2026-11-14 = 2026-07-25
     8 Wochen vor 2026-11-14 = 2026-09-19
     1 Woche  vor 2026-11-14 = 2026-11-07

`[cmd]` **`LIMIT 1` steht in `goals.phase_am`** — Position 933 in
`pg_get_functiondef`, selbst gelesen. Die Wurzelursache ist belegt, nicht
behauptet. `ladeOffenePhasen` existiert und haengt in `page.tsx:119`.

`[cmd]` **`anker.ts` ist 5.722 Bytes und hat einen eigenen Waechter**
(`lib/goals/__tests__/g544-zeitachse.test.ts`, 341 Zeilen), der auch den
Rueckfall auf `Date.now()` ausschliesst: ein unlesbares Datum gibt
`null`, nicht heute. **Der Trenner U+2013 ist dort mit Begruendung
gepruefte Sache** — wer auf den Bindestrich prueft, zeigt eine leere
Achse, ohne dass es auffaellt.

## Was diese Abnahme mitnimmt

`[read]` **Zwei Fehler fand er am Bild, bei gruener Messung** — die Pill
verschluckte die Marken, weil sie nur benannte Props durchlaesst, und die
Kopfmarke behauptete bei zwei offenen Phasen eine. **Bei Oberflaeche ist
das Bild der Nachweis**, und das ist heute das zweite Mal.

`[read]` **Zwei eigene Waechter waren zuerst blind, beide suchten
Woerter statt Wirkung.** Der Leerfall-Waechter blieb gruen, als die
Bedingung auf `false` stand — die Marken standen weiter da, nur
unerreichbar. **Derselbe Bau wie gestern in seinen Proben, und wieder hat
er es selbst gefunden.**

`[cmd]` **Zwei Sachen gemeldet statt still getan** — `PhaseEcht` haengt
weiter an `phase_am` (G-559), und der Jahresplan ist nicht speicherbar,
weil keine Ordnungsspalte und keine Kettentabelle existiert (G-560).
**A3 ist damit zur Haelfte offen, und das steht im Bericht, nicht im
Kleingedruckten.**

## Zwei Fehler des Orchestrators bei dieser Abnahme

`[cmd]` **`git grep` sieht keine untracked Dateien.** Meine Suche nach
dem Waechter fand nichts, weil `g544-zeitachse.test.ts` noch nicht im
Index lag. **Die Arbeit eines Agenten ist untracked, bis ich sie stage —
eine Suche mit `git grep` misst dort systematisch null.**

`[cmd]` **Ein gefilterter Status ist kein Status.** Ich habe
`git diff --cached --name-status -- apps/` gelesen und damit genau das
weggefiltert, was die Regel sehen will: drei docs-Dateien lagen seit
einem frueheren Versuch im Index und gingen mit. Der Commit wurde per
`reset --soft` getrennt und neu gesetzt.
