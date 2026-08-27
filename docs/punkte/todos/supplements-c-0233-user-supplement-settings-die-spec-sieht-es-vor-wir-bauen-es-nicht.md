---
nr: C-233
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-23
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-233 - `user_supplement_settings` — die Spec sieht es vor, wir bauen es nicht

## Befund

(neu 2026-08-23). **Wartet auf Subscription und
  Tiers.**

  `[cmd]` `SPEC_06_DATABASE_SCHEMA.md`, Abschnitt 4:
  `enhanced_mode` · `enhanced_accepted_at` · `enhanced_age_verified` ·
  `reminder_morning`/`_evening`/`_pre_workout` · `low_stock_days`.

  **Tom, 2026-08-23:** *„wir sind am entwickeln und das werden wir noch
  ein jahr sein. wenn dann irgendwann mal das subscription modell und
  die tiers definiert sind … dann diskutieren wir ueber sachen wie
  alterspruefung."*

  `[read]` **Bis dahin entscheidet `experience_level`** (G-167,
  ausdruecklich als Provisorium beschriftet). Ein zweites Gate daneben
  waere derselbe Fehler wie zwei Kataloge.

  `[cmd]` **Die Auslassung steht im Kettenschritt 136 als Textblock**,
  mit Quelle und diesem Punkt — nicht stillschweigend weggelassen.
  Toms Regel vom 2026-08-23: *„sehe es vor und mach texteintraege da im
  code und verweise im todo darauf."*

  **Die Erinnerungszeiten sind davon unberuehrt** und koennten frueher
  kommen — sie haengen an keiner Tarifentscheidung. Wenn der
  Einnahme-Plan (`intake_schedule`) gebaut wird, gehoeren sie dazu.
