---
nr: G-122
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: G-123
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["training.exercises", "goals.body_measurements", "recovery.checkins", "medical.lab_result_values", "recovery.modality_log"]
  dateien: []
zahlen: null
---

# G-122 - Fuenf Tabellen mit Daten haben keinen Schreibweg

## Befund

(neu 2026-08-20, aus G-123).

  `[cmd]` **Gemessen: gelesen ja, geschrieben nie.**

  | Tabelle | Zeilen | gesperrter Knopf |
  |---|---|---|
  | `training.exercises` | **1.416** | „Eigene Uebung" |
  | `goals.body_measurements` | **362** | Gewicht, Umfaenge |
  | `recovery.checkins` | **340** | „Check-in" |
  | `medical.lab_result_values` | **280** | „Eigener Messwert" |
  | `recovery.modality_log` | **178** | „Log modality" |

  `[read]` **Zwei brauchen vorher eine Entscheidung:** Bei der eigenen
  Uebung die Abgrenzung (der Katalog ist geteilt, eine eigene waere es
  nicht), beim eigenen Messwert die Unterscheidung von einem
  Laborbefund.
