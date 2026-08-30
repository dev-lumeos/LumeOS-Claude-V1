---
nr: C-357
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: A-37
entscheidung: null
erledigt: 2026-08-30
commit: 3ff91754
beruehrt:
  dateien: [docs/specs/Nutrition/04_adrs]
zahlen:
  gemessen: 2026-08-30
  adrs_gesamt: 12
  gelten: 7
  teilweise_abgeloest: 4
  archiviert: 1
---

# C-357 — vier ADRs widersprechen neueren Entscheidungen

## Befund

Aus A-37, Codex, 2026-08-30.

`[cmd]` **12 ADRs in `docs/specs/Nutrition/04_adrs/`: 7 gelten weiter,
4 sind teilweise abgeloest, 1 ist selbst archiviert.**

    ADR_COACH_PERMISSIONS_V1      E-11 legt Permissions je Modul und
                                  zweiwertig fest, E-29 verlangt eine
                                  Funktion fuer Coach-Zugriffe
    ADR_MEALCAM_CONSENT           E-20 verlangt zwei getrennte Zwecke
                                  statt eines `training_consent`
    ADR_NUTRITION_PREFERENCES_V1  E-16 und E-30 behandeln generelle
                                  Ausschluesse als Rangfolge
    ADR_SUPPLEMENTS_API_BOUNDARY  E-35 verlangt je Modul eine eigene
                                  Tagesbilanz

`[cmd]` **Kein ADR widerspricht einem anderen ADR.**

## Warum es eine Entscheidung ist

`[read]` **Weder die ADRs noch die E-Entscheidungen tragen eine
formale `loest_ab`-Verknuepfung.** `[cmd]` **Codex hat inhaltlich
gemessen und ausdruecklich nichts gesetzt** — das war die Vorgabe.

`[read]` **`docs/specs/` wird prueferisch gelesen** (CLAUDE.md).
**Zwei Dokumente, die dieselbe Frage verschieden beantworten, sind
schlimmer als eines.**

`[read]` **Zu entscheiden: bekommen die vier einen
`abgeloest_durch`-Vermerk, oder wandern sie ins Archiv?** **Und wer
traegt ihn ein** — die ADRs liegen in `docs/specs/`, die
Entscheidungen in `docs/entscheidungen/`.

## Abnahme

**2026-08-30, erledigt statt vorgelegt.**

**Tom, 2026-08-30:** *,,entscheidungen sind gefallen was soll denn nun
noch dazu sagen? umsetzen und ablegen oder was? ich sehe den punkt
nicht was du von mir willst?"*

`[read]` **Er hat recht, und der Punkt war falsch gestellt.**

`[cmd]` **Die Sachfragen sind entschieden** — E-11, E-16, E-20, E-29,
E-30, E-35. `[read]` **Was fehlte, war der Vermerk, und `docs/`
gehoert dem Orchestrator.**

`[read]` **Ich habe eine Aufraeumarbeit als Entscheidung vorgelegt.**

### Was gemacht wurde

`[cmd]` **Vier ADRs tragen jetzt einen Kopfvermerk** unter der
Statuszeile:

    ADR_COACH_PERMISSIONS_V1      E-11, E-29
    ADR_MEALCAM_CONSENT           E-20
    ADR_NUTRITION_PREFERENCES_V1  E-16, E-30
    ADR_SUPPLEMENTS_API_BOUNDARY  E-35

`[read]` **Jeder Vermerk sagt auch, was weiter gilt** — das war der
Grund gegen das Archivieren. `[cmd]` **`ADR_COACH_PERMISSIONS_V1`
regelt Suggestions, und dazu sagt keine E-Entscheidung etwas.**

`[cmd]` **`docs/specs/` wird prueferisch gelesen, nicht als Archiv**
(CLAUDE.md) — **ein ADR mit Vermerk ist brauchbar, ein verschwundener
ist nur weg.**

**Geschlossen.**
