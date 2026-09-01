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
erledigt: 2026-09-01
commit: OFFEN
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

## Ergebnis

**Gebaut in G-306, 2026-09-01. Roher Bericht dort.**

`[cmd]` **Alle drei Wege ueber die Oberflaeche geklickt:**

    Weg                            HTTP   Plan danach          Frage danach
    Denselben Plan neu starten     200    active, rollover 0->1   weg
    Einen anderen Plan aktivieren  200    completed               weg
    Ohne Plan weitermachen         200    completed               weg

`[read]` **`completed`, nicht `archived`** -- der Plan ist
abgeschlossen, nicht weggeraeumt; er bleibt waehlbar.

`[cmd]` **Ein Fehler kam erst im Browser heraus:** nach Weg 2 stand
der Plan auf `completed` und die Frage blieb stehen -- die Anzeige
rechnete nur die Laufzeit, nicht den Zustand. **Behoben und
nachgemessen.**

## Abnahme

**2026-09-01, mit G-306 abgenommen: gebaut.**

`[cmd]` **Die Meldung mit drei Wegen steht, jeder einmal gegangen.**
`[cmd]` **rollover: *neu starten*, `rollover_count` 0 auf 1.**
