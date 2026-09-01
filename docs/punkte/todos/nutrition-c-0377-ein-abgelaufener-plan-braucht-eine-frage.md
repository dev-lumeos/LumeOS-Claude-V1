---
nr: C-377
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-08-31
braucht: []
kind_von: C-373
entscheidung: E-42
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  tabellen: [nutrition.meal_plans]
zahlen: null
---

# C-377 — ein abgelaufener Plan braucht eine Frage

## Befund

Tom, 2026-08-31: *,,ist ein kompletter plan abgelaufen muss eine
meldung kommen und geklaert werden wie es weiter geht, renew/anderen
wochenplan/manuelle erfassung etc."*

`[cmd]` **Heute steht *,,aktiv · abgelaufen"* und sonst nichts.**
`[cmd]` **Der Bestandsplan endete vor 47 Tagen.**

## Drei Wege, und der Nutzer waehlt

    denselben Plan neu starten     rollover
    einen anderen aktivieren       sequence oder Bibliothek
    ohne Plan weitermachen         manuelle Erfassung

`[cmd]` **`meal_plans.status` kennt die Zustaende** — es fehlt der
Weg dorthin.

## Und damit klaert sich C-373

`[cmd]` **Die Lebenszykluswahl wird gespeichert und nie
ausgefuehrt** — kein Zeitplaner, `rollover_count` auf 0.

`[read]` **Die Meldung beim Ablauf ist die Ausfuehrung.** `[read]`
**`rollover` heisst dann: der Vorschlag lautet *neu starten*.**
**`sequence`: der Vorschlag nennt den Folgeplan.** **`once`: der
Vorschlag ist die Bibliothek.**

`[read]` **Kein Hintergrundlauf noetig** — dieselbe Antwort wie bei
C-358.

## Auftrag

**Mitbeauftragt mit G-306 am 2026-08-31.** Bericht dort.
