---
nr: C-334
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-239
entscheidung: null
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
