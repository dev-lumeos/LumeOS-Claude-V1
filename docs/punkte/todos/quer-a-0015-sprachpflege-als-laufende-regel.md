---
nr: A-15
typ: messung
modul: quer
schwere: mittel
angelegt: 2026-08-17
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["tools/encoding-pruefen.mjs"]
zahlen: null
---

# A-15 - Sprachpflege als laufende Regel

## Befund

(neu 2026-08-17). Folgt
  auf A-14.

  **Jeder Auftrag, der Text erzeugt, füllt Englisch und Deutsch.** Thai
  bleibt leer, bis ein Übersetzungsauftrag läuft.

  **Eine Prüfung, die das hält:** `[cmd]` Nach dem Muster von
  `tools/encoding-pruefen.mjs` — ein Schlüssel, der in `de` fehlt oder
  in `en` fehlt, lässt das Gate fehlschlagen. Thai wird gezählt, nicht
  erzwungen.

  `[read]` Ohne die Prüfung verlässt es sich auf Disziplin — und daran
  ist in diesem Projekt schon dreimal etwas gescheitert.


## B — Entwicklungsumgebung & Absicherung
