---
nr: G-363
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-357
entscheidung: E-54
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [goals.goal_phases]
zahlen:
  gemessen: 2026-09-07
  fragen: 4
---

# G-363 — wer schlaegt die naechste Phase vor?

## Befund

Aus G-357, Codex, 2026-09-07.

`[cmd]` **`recommended_next` bleibt bewusst leer.**

**Beim Anlegen wurden bereits beantwortet:**

`[cmd]` **Logik:** `00_MASTER_VISION.md`, Kernprinzip 3 —
*,,Rule-first, AI second."* **Die Regel schlaegt vor, das Modell
formuliert.**

`[cmd]` **Override:** **ja** (E-69) — **ein System, das eine Phase
erzwingt, waere ein Trainer, kein Werkzeug.**

**Offen bleibt eine Frage: woraus wird vorgeschlagen?**

## Die offene Frage: woraus wird vorgeschlagen?

`[cmd]` **`goal_phases` traegt `projected_end_date` und
`actual_end_date`** — **eine Phase, die laenger laeuft als geplant,
ist ein Anlass.**

`[cmd]` **Und `body_measurements` mit 362 Zeilen** — **wer sein Ziel
erreicht hat, braucht eine neue Phase.**

`[read]` **Welche der beiden ausloest, und ab welcher Abweichung, ist
zu messen.**

`[cmd]` **`transition_reason` ist seit G-357 Pflicht** — **ein
Vorschlag liefert einen mit.** `[read]` **Das ist keine eigene
Frage, sondern eine Bedingung an die Antwort.**

`[read]` **Dasselbe Muster wie MealCam** (SPEC_11): **die Datenbank
liefert Kandidaten, das Modell waehlt aus.**

## Auftrag

**Mitbeauftragt mit C-422 am 2026-09-07.** Der Auftragstext
und der Bericht stehen dort.
