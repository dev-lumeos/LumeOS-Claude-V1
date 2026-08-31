---
nr: G-293
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-08-31
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-08-31
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/insights-echt.tsx
zahlen: null
---

# G-293 — MacroDetail — die Fetthierarchie fehlt

## Befund

`[cmd]` **`SPEC_10` nennt `MacroDetail`:** *,,Parent/Child Hierarchie
(Fette: Gesaettigt/Ungesaettigt/Omega-3)"*.

`[cmd]` **Gebaut ist sie nicht.** `[cmd]` **Die Makrokachel zeigt
Protein, Kohlenhydrate, Fett als drei Balken** — **ohne Aufteilung.**

## Die Daten stehen

`[cmd]` **`FASAT`, `FAMS`, `FAPU`, `FAPUN3`, `FAPUN6` sind als
Naehrstoffe definiert und gefuellt.**

`[cmd]` **Und der Supplement-Bericht vom 30.08. hat mit `FAPUN3`
gerechnet** — die Kette traegt.

`[read]` **Was fehlt, ist die Anzeige:** Fett aufklappen und sehen,
woraus es besteht.

`[read]` **`SPEC_04` fuehrt 36 Fettsaeuren einschliesslich
Einzelfettsaeuren.** **Die Hierarchie ist die Frage, nicht die
Datenlage.**

## Auftrag

**Mitbeauftragt mit G-291 am 2026-08-31.** Der Auftragstext
und der Bericht stehen dort.
