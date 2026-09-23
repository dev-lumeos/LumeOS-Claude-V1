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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
