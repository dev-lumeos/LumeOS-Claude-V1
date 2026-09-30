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
