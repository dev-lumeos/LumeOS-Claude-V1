---
nr: C-347
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-08-29
braucht: []
kind_von: G-116
entscheidung: null
beruehrt:
  dateien: [supabase/_pipeline/07_lesefunktionen/075_preference_search_application.sql]
zahlen:
  gemessen: 2026-08-29
  schokolade_vorher: 162
  schokolade_nachher: 0
  ultra_processed: 162
  contains_nuts: 10
---

# C-347 — generelle Ausschluesse in `food_search`

## Befund

Aus G-116, Claude Code, 2026-08-29. **Vom Orchestrator ueber die Tags
nachgemessen.**

`[cmd]` **`schokolade` 162 → 0. `cola` 243 → 42. `wurst` 206 → 42.**

`[cmd]` **Und die Ursache ist der generelle Ausschluss, nicht die
Allergie:** 162 Schokoladen-Treffer tragen `ultra_processed`, nur 10
tragen `contains_nuts`.

`[read]` **Was hier passiert, ist eine dritte Art von Null:** der
Treffer existiert, wird bewertet, **und wird nicht gezeigt.** **Kein
gemessener Wert, keine fehlende Aussage — eine unterdrueckte.**

## Die Stufe existiert bereits

`[cmd]` **Starke Filter wirken nur ohne Suchbegriff und ranken sonst
ab.** `[cmd]` **Generelle Ausschluesse sind hart zugewiesen.**

`[read]` **Wer *schokolade* eintippt, hat eine Absicht** — und
bekommt nichts, weil er einmal *ultra_processed* abgewaehlt hat.

## Die Entscheidung

**Sollen generelle Ausschluesse dieselbe Stufe bekommen wie starke
Filter?**

`[read]` **Dann wirken sie ohne Suchbegriff und ranken mit Suchbegriff
nur ab.** `[cmd]` **Laut G-116 ein einzeiliger Eingriff in
`food_search`** — Codex' Bereich.

`[read]` **Dagegen spricht: wer *ultra_processed* ausschliesst, will
es vielleicht wirklich nie sehen.** **Dafuer spricht: eine leere
Trefferliste erklaert sich nicht selbst.**
