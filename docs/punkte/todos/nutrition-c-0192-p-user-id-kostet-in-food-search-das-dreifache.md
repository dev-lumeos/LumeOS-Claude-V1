---
nr: C-192
typ: befund
modul: nutrition
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-192 - `p_user_id` kostet in `food_search` das Dreifache

## Befund

(neu
  2026-08-22). **Laeuft bei Codex.**

  `[cmd]` `EXPLAIN (ANALYZE)`: ohne 414,7 ms, mit `dev@lumeos.app`
  1.172,6 ms. Claude Code misst unabhaengig 360,4 / 383,2 / 1.160,2 ms.
  **Kein temp read/written** — also die Preference-CTEs, kein
  Kreuzprodukt.

  `[read]` **Seit G-154 laedt der Katalog immer mit `prefs=1`**, weil
  der ADR es verlangt. Aus dem Randfall ist der Normalfall geworden.
  **Die Regel bleibt, nur ihre Kosten sind zu senken.**
