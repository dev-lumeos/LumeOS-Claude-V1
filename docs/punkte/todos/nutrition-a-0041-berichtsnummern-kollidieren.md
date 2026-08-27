---
nr: A-41
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# A-41 - Berichtsnummern kollidieren

## Befund

(neu 2026-08-19).

  `[cmd]` **116, 117 und 118 sind doppelt belegt:** `116-food-db-tab` /
  `116-goals-anbindung` · `117-ausschluss-presets` /
  `117-zusammenhaengende-seeds` · `118-training-sitzungen` und der
  Daumen-Bericht, **der deshalb auf 120 verschoben wurde.**

  `[read]` **Die Ursache ist der Parallelbetrieb:** Fuenf Agenten
  vergeben Nummern gleichzeitig, **jeder nimmt die naechste freie, die er
  sieht.**

  **Zu klaeren:** Vergibt der Orchestrator die Nummer im Auftrag? `[cmd]`
  **Umbenennen der bereits committeten waere riskant** — sie stehen im
  Index und in Querverweisen.
