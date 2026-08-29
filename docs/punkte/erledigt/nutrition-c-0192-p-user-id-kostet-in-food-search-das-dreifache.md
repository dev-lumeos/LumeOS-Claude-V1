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
agent: codex
beauftragt: 2026-08-28
erledigt: 2026-08-29
commit: OFFEN
beruehrt:
  dateien: [supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql]
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

## Auftrag

**Mitbeauftragt mit C-20 am 2026-08-28.** Der Auftragstext
und der Bericht stehen dort.

## Bericht

Ueberholt gemessen am 2026-08-29. `p_user_id = dev@lumeos.app` kostet im Live-Snapshot +3,3 %, nicht das Dreifache. Vollstaendige Messreihe in C-20, `docs/punkte/laufend_codex/nutrition-c-0020-treffer-am-wortanfang-schlagt-treffer-in-der-wortmitte.md`.

## Abnahme

**2026-08-29, mit C-20 abgenommen.** Messung und Begruendung
stehen dort.
