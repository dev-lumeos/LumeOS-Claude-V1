---
nr: G-363
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-09-07
braucht: []
kind_von: G-357
entscheidung: E-54
beruehrt:
  tabellen: [goals.goal_phases]
zahlen:
  gemessen: 2026-09-07
  fragen: 4
---

# G-363 — wer schlaegt die naechste Phase vor?

## Befund

Aus G-357, Codex, 2026-09-07.

`[cmd]` **`recommended_next` bleibt bewusst leer** — **vier Fragen
sind offen:**

    Eingaben        woraus wird vorgeschlagen?
    Logik           Regel oder Modell?
    Begruendung     was steht in transition_reason?
    Override        darf der Nutzer widersprechen?

## Die zweite ist halb beantwortet

`[cmd]` **`00_MASTER_VISION.md`, Kernprinzip 3:** *,,Rule-first, AI
second — deterministische Regeln zuerst, AI fuer Packaging."*

`[read]` **Also: die Regel schlaegt vor, das Modell formuliert.**

`[read]` **Dasselbe Muster wie MealCam** (SPEC_11): **die Datenbank
liefert Kandidaten, das Modell waehlt aus.**

## Die anderen drei

`[read]` **Eingaben:** `[cmd]` **`goal_phases` traegt
`projected_end_date` und `actual_end_date`** — **eine Phase, die
laenger laeuft als geplant, ist ein Anlass.**

`[cmd]` **Und `body_measurements` mit 362 Zeilen** — **wer sein Ziel
erreicht hat, braucht eine neue Phase.**

`[read]` **Begruendung:** `[cmd]` **`transition_reason` ist seit
G-357 Pflicht** — **ein Vorschlag muss also einen mitliefern.**

`[read]` **Override:** `[read]` **die Antwort ist ja** — **E-69:
Tom entscheidet.** `[read]` **Ein System, das eine Phase erzwingt,
waere ein Trainer, kein Werkzeug.**
