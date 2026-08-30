---
nr: C-191
typ: messung
modul: nutrition
schwere: mittel
angelegt: 2026-08-22
braucht: []
kind_von: G-154
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-08-30
erledigt: 2026-08-30
commit: c7837649
beruehrt:
  dateien:
    - supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql
zahlen: null
---

# C-191 - `p_user_id` kostet das Dreifache

## Befund

(neu 2026-08-22).
  Befund aus G-154. **Messung, keine Vermutung.**

  `[cmd]` **`explain (analyze, buffers)` auf der laufenden DB,
  leere Suche, `limit 50`:**

  | Aufruf | Laufzeit |
  |---|---:|
  | ohne `p_user_id` | **360,4 ms** |
  | `test-user` (0 Preferences) | 383,2 ms |
  | `dev` (3 Preferences) | **1.160,2 ms** |

  `[cmd]` **Kein `temp read/written`** — es ist kein Kreuzprodukt,
  sondern die Preference-CTEs selbst. **Und kein Kaltstart:** der
  zweite Seitenlauf misst dasselbe (4.498 / 4.779 ms, Suchaufruf
  1.232 ms).

  `[read]` **Das faellt jetzt jedem auf**, weil der Katalog seit G-154
  immer mit `prefs=1` laedt. **Vorher trug die Kosten nur der
  Erfassungsdialog.**

  `[cmd]` **Nicht `verborgeneTreffer`:** der zweite Aufruf ist auf
  kurze Trefferlisten begrenzt und laeuft bei 5.292 Treffern nicht.

## Auftrag

**Mitbeauftragt mit C-120 am 2026-08-30.** Der Auftragstext
und der Bericht stehen dort.

Ergebnis: [C-120 - Messbericht](nutrition-c-0120-drei-sperren-in-food-search.md#2026-08-30---c-120-c-191-c-27-und-c-177-nachgemessen):
derselbe dev-Aufruf liegt heute bei +5,6 %, nicht beim Dreifachen.

## Abnahme

**2026-08-30, mit C-120 abgenommen:** gebaut: kein Dreifach-Effekt mehr, +5,6 %.
**Die Messung steht dort.**
