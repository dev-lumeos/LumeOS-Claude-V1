---
nr: G-250
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-28
braucht: []
kind_von: G-249
entscheidung: null
agent: claudecode
beauftragt: 2026-08-29
erledigt: 2026-08-29
commit: 7017e5e3
beruehrt:
  tabellen: [goals.nutrition_targets]
zahlen: null
---

# G-250 — die vier Zustaende fehlen in der Ordnung

## Befund

Aus G-249, Claude Code, 2026-08-28. **Als Verlust gemeldet, nicht
versteckt.**

`[read]` **Die Ordnung bildet ihren Status aus `goals.nutrition_targets`**
— dem persoenlichen Ziel aus den Goals. `[read]` **Die vier Zustaende
aus G-239 stammen aus `daily_reference_assessment`** — der
wissenschaftlichen Referenz.

    gedeckt · zu wenig · ueber der Obergrenze · kein Richtwert

`[read]` **Beides in einer Zeile zu mischen haette zwei Wahrheiten
ergeben:** *,,unter Ziel"* nach deinem Goal und *,,gedeckt"* nach EFSA
koennen gleichzeitig gelten.

`[cmd]` ***,,Kein Richtwert"* als eigene Aussage steht jetzt nur noch
im Modal.**

## Die Entscheidung

**Soll die Ordnung beide Achsen fuehren?**

`[read]` **Das ist dieselbe Frage wie bei den Regeln in G-218** —
`severity` und `recommended_action_type` sind zwei Achsen, und die
Messung ergab: **innerhalb `critical` redundant, ueber den Katalog
nicht.**

`[read]` **Hier waere zu messen, wie oft die beiden Aussagen
auseinandergehen.** `[read]` **Wenn selten: eine Achse reicht, mit
Vermerk beim Rest. Wenn oft: beide, und die Zeile muss sagen, welche
sie meint.**

`[cmd]` **Und die Datenlage traegt es:** 60 Naehrstoffe haben ein
persoenliches Ziel, die uebrigen 78 nur die Referenz. **Bei diesen 78
gibt es gar keinen Widerspruch.**

## Auftrag

**Mitbeauftragt mit G-108 am 2026-08-29.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-08-29, mit G-108 abgenommen.** Messung und Urteil stehen
dort.
