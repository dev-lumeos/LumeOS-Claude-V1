---
nr: C-334
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: null
agent: codex
beauftragt: 2026-08-28
beruehrt:
  tabellen: [nutrition.nutrient_reference_values]
zahlen:
  gemessen: 2026-08-28
  vita_ul_orchestrator: 172
  vita_ul_agent: 164
  faktor: 1.05
---

# C-334 — die Tagesbewertung hat sich zwischen zwei Messungen verschoben

## Befund

`[cmd]` **Am selben Tag, auf denselben Daten, zwei verschiedene
Ergebnisse:**

    Naehrstoff   Agent (G-239)   Orchestrator
    VITA UL         164 %           172 %
    VITA PRI        654 %           689 %
    MG  UL          160,2 %         173 %
    NIA UL          130,7 %         178 %
    MN  UL          nicht genannt   105 %

`[cmd]` **Bei Vitamin A sind beide Werte um denselben Faktor 1,05
verschoben** — kein Rundungsfehler.

`[cmd]` **Meine Werte sind ueber drei Laeufe hintereinander stabil.**
`[cmd]` **`nutrition.meals` unveraendert bei 2.895**, es wurde nichts
geschrieben.

## Was dazwischen lag

`[cmd]` **Zwei vollstaendige Kettenlaeufe:** C-149 (Folat-Waechter,
128 Schritte) und G-221 (Tag-Set, 129 Schritte).

`[read]` **Wenn einer davon Naehrwerte neu berechnet hat, erklaert
das die Verschiebung** — aber keiner der beiden Auftraege sollte
Naehrwerte anfassen. **C-149 hat ausdruecklich nur Folat, Vitamin A
und E *ohne Zuordnung* gelassen.**

`[read]` **NIA weicht staerker ab als die anderen** (130,7 gegen 178,
Faktor 1,36). **Das passt nicht zu einem einheitlichen Faktor** und
gehoert getrennt betrachtet.

## Warum das ernst ist

`[read]` **Eine Bewertung, die sich zwischen zwei Messungen
verschiebt, ist nicht nachvollziehbar.** `[read]` **Und sie betrifft
Obergrenzen:** ob Vitamin A bei 164 oder 172 Prozent des `UL` liegt,
aendert nichts an der Warnung — **aber ein Wert, der wandert, laesst
sich niemandem erklaeren.**

## Zu klaeren

**Was hat sich geaendert, und war es Absicht?**

`[read]` **Zuerst zu pruefen:** hat einer der beiden Kettenlaeufe
`food_nutrients` oder `nutrient_reference_values` beruehrt?
`[cmd]` **Beide Auftraege sagten *,,nichts live geaendert"*** — dann
muesste die Ursache woanders liegen.

## Auftrag

### Vorweg

`[read]` **Die Zahlen misst du.** `[cmd]` Seit dem 27.08. traegt ein
Auftrag keine Zahlen mehr vom Orchestrator.

`[read]` **Und dieser Punkt ist eine Beobachtung, keine Diagnose.**
Ich weiss nur, dass zwei Messungen desselben Tages verschiedene Werte
ergaben. **Was daraus folgt, misst du.**

### Zu tun

**Herausfinden, was sich geaendert hat.**

`[read]` **Der naheliegende Verdacht ist der schwaechste:** ich
vermute die beiden Kettenlaeufe aus C-149 und G-221 — **aber beide
Auftraege sagten ausdruecklich, live sei nichts geaendert worden.**
**Pruef das, statt es zu glauben.**

`[read]` **Naeher liegt die Frage, ob die Bewertung ueberhaupt
deterministisch ist.** `[cmd]` Meine Werte waren ueber drei Laeufe
stabil, seine ueber einen. **Ein Wert, der von der Uhrzeit, einer
Reihenfolge oder einem Zwischenspeicher abhaengt, sieht genau so
aus.**

**Und Niacin gehoert getrennt betrachtet.** `[cmd]` Es weicht mit
Faktor 1,36 ab, die anderen mit 1,05. `[cmd]` **Niacin ist der
einzige Fall mit `NO_STANDALONE_REFERENCE + UL`** — **das passt zu
keinem einheitlichen Faktor.**

### Was nicht zu tun ist

**Nichts reparieren, bevor die Ursache steht.** `[read]` **Eine
Korrektur ohne Ursache verschiebt die Zahlen ein drittes Mal.**
**Keine Referenzwerte aendern.**
`apps/` nicht anfassen — Claude Code arbeitet dort an G-240.
Nicht committen, nicht stagen, nicht pushen.

### Nachweis

    Bewertung, dreimal              dieselben Werte?
    Kettenlaeufe                    haben sie live etwas beruehrt?
    Ursache                         benannt oder als unklar gemeldet
    Niacin                          eigener Befund oder derselbe

`[read]` **Wenn du die Ursache nicht findest, ist *unklar* das
Ergebnis** — mit der Angabe, was gemessen werden muesste. **Das ist
besser als eine plausible Erklaerung ohne Beleg.**

### Regeln

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Lesend gegen live ist in Ordnung.**
`[cmd]` **`dev@lumeos.app` nur lesen** — dort liegen Toms Daten.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
