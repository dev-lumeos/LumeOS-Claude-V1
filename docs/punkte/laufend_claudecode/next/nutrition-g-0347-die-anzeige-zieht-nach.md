---
nr: G-347
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: C-405
entscheidung: E-63
beruehrt:
  dateien:
    - apps/web/src/lib/nutrition/naehrstoff-anzeige.ts
zahlen:
  gemessen: 2026-09-07
  stellen: 4
---

# G-347 — die Anzeige zieht nach

## Befund

Aus C-405, Codex, 2026-09-07, gemeldet statt geaendert.

### 1 · Zwei Gruppen in `naehrstoff-anzeige.ts`

`[cmd]` **`NT` liegt jetzt bei Makronaehrstoffen** — **die Anzeige
muss es dort zeigen.**

`[cmd]` **Und *Fettbegleitstoffe* ist neu** — **es gehoert direkt
nach *Fette*.**

`[cmd]` **`CHORL` traegt kein `parent_code`** (E-63) — **es
erscheint nicht in der Fettsumme.**

### 2 · Vier `strong_avoid`-Stellen unter `apps/`

`[cmd]` **Der CHECK kennt den Wert nicht mehr:**
`strength IN ('hard_exclude', 'soft_dislike', 'neutral', 'like',
'boost')`.

`[cmd]` **In `apps/` steht er noch:**

    vorlieben-aktionen.ts
    daumen-schreiben.ts
    food-search.ts
    daumen-schreiben.test.ts

`[read]` **Ein Wert, den die Datenbank ablehnt, im Code** — **beim
naechsten Schreibversuch faellt der CHECK.**

`[read]` **Die mittlere Stufe bleibt ueber `intolerances`** —
`[cmd]` **Laktose liefert weiterhin `strong / intolerance` mit Score
-25.**

## Auftrag

**Vorbereitet mit G-345 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.
