---
nr: C-346
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: C-336
entscheidung: null
beruehrt:
  tabellen: [nutrition.nutrient_details]
zahlen:
  gemessen: 2026-08-29
  falsch_zugeordnet: 2
  geprueft: 110
---

# C-346 — zwei Detailtexte neu verknuepfen

## Befund

Aus C-336, Claude Code, 2026-08-29. **Alle 110 Zeilen geprueft, genau
zwei falsch.**

    FD      Fluorid       traegt den Text von *dry matter*
    CHORL   Cholesterin   traegt den Text von Chlorid

`[read]` **`CHORL` ist medizinisch irrefuehrend:** Mangel *,,gestoerte
Verdauung, metabolische Alkalose"*, Quellen *,,Salz, Tomaten,
Oliven"*. `[cmd]` **Beide tragen auf `dev` an allen 90 Tagen echte
Werte** — der falsche Text steht live.

## Die Reparatur braucht kein Schreiben

`[cmd]` **Die richtigen Texte liegen in
`referenz/lumeos-2026/.../nutrientDetails.ts` unter `F`
(*,,Zahnschutz/Karies"*) und `CHOL` (*,,Hormone,
Zellmembranen"*)** — zwei Schluessel, die dieses Repo nicht
verwendet, **und beide wurden nie importiert** (`source_key` zeigt
null Treffer).

`[read]` **Also: neu verknuepfen, nicht neu schreiben.**

## Warum es passiert ist

`[read]` **Der Import glich auf Schluesselgleichheit ab.** `F` fand
keinen Partner und fiel weg, **`FD` fand einen und ging durch,
obwohl er etwas anderes bedeutet.** **Kein Fremdschluessel faengt
das** — die Zeile zeigt auf einen Code, den es gibt.

`[cmd]` **`nutrient_defs` ist unberuehrt und korrekt.**
