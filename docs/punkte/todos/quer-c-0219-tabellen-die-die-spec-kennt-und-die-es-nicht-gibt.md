---
nr: C-219
typ: befund
modul: quer
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

# C-219 - Tabellen, die die Spec kennt und die es nicht gibt

## Befund

(neu 2026-08-22).

  `[cmd]` **recovery:** `protocols`, `hrv_measurements`, `baselines`,
  `sleep_data`, `overtraining_alerts`, `training_load_logs`,
  `user_protocol_assignments`
  `[cmd]` **training:** `volume_landmarks`, `strength_standards`,
  `exercise_progression_configs`, `post_workout_feedback`, `routines`,
  `blocks` — alle in SPEC_06 spezifiziert, keine gebaut (17 Marken in
  `tabs-spec`)
  `[cmd]` **medical:** `user_symptoms`, `medical_alerts`,
  `biomarker_results` (Schreibweg fuer Werte ohne Laborbericht)
  `[cmd]` **goals:** `goal_adjustments`, `weekly_reports`,
  `goal_contributions`, `tdee_settings`, `progress_photos`
  `[cmd]` **supplements:** `stack_templates`/`items`, Injektionstabellen
  (14 Marken, korrekt markiert)
  `[cmd]` **nutrition:** `mealcam_scans`, `shopping_lists`,
  `meal_plan_logs`, `micro_flags`, `coach_nutrition_suggestions`

  **Reihenfolge nach Marken je fehlender Tabelle** — `tabs-spec`
  (training, 17) und die Injektionen (14) sind die dichtesten.
  `shopping_lists` ist bereits C-175 in C-187.
