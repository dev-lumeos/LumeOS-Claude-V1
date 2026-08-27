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
beruehrt:
  tabellen: []
  dateien: []
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
