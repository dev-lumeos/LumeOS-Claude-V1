---
nr: C-336
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-08-28
braucht: []
kind_von: G-246
entscheidung: null
beruehrt:
  tabellen: [nutrition.nutrient_details, nutrition.nutrient_defs]
zahlen:
  gemessen: 2026-08-28
  detailzeilen: 110
  ul_ohne_excess: 2
---

# C-336 — FD traegt den Text eines anderen Naehrstoffs

## Befund

Aus G-246, Claude Code, 2026-08-28. **Vom Orchestrator nachgemessen.**

`[cmd]`

    nutrient_defs.name_de           Fluorid, Einheit ug
    nutrient_details.function_de    "Trockenmassegehalt eines
                                     Lebensmittels"

`[read]` **Im Vorgaengerrepo hiess `FD` *dry matter*.** Beim Import
ist die Zeile ueber den gleichlautenden Schluessel am falschen
Naehrstoff gelandet.

`[read]` **Dieselbe Klasse wie `CLD`/`CL` aus G-239 — nur mit
Wirkung:** wer auf Fluorid klickt, liest ueber Trockenmasse.

## Die eigentliche Frage

**Wenn ein Schluessel kollidieren konnte, wie viele andere sind es?**

`[cmd]` **110 Detailzeilen, alle ueber `nutrient_code` verknuepft.**
`[read]` **Kein Eintrag haengt in der Luft** (0 ohne
`nutrient_defs`-Gegenstueck) — **aber ein Text am falschen Code
faellt dabei nicht auf.** Die Verknuepfung ist formal richtig und
inhaltlich falsch.

`[read]` **Zu pruefen ist der Inhalt gegen den Namen**, nicht die
Fremdschluesselbeziehung. `[cmd]` Bei 110 Zeilen ist das lesbar.

## Nebenbefund aus demselben Auftrag

`[cmd]` **Zwei Naehrstoffe mit `UL` haben keinen
Ueberdosierungstext:** `FOLAC` (Folsaeure, UL 1.000 ug) und `FD`
(Fluorid, UL 10.000 ug).

`[read]` **Bei `FD` ist der Grund vermutlich derselbe** — die falsche
Zeile bringt auch kein `excess_de` mit.
