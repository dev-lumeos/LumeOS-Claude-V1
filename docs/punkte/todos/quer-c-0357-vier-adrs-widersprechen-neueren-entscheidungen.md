---
nr: C-357
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-08-30
braucht: []
kind_von: A-37
entscheidung: null
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
