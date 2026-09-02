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
agent: codex
beauftragt: 2026-09-02
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

## Auftrag — was die Spec kennt und was es gibt

**Mitbeauftragt: C-187, C-216.** Bericht in diese Datei.

**Beauftragt am 2026-09-02.**

### 1 · C-219 — Tabellen, die die Spec kennt und die es nicht gibt

`[read]` **Du hast gerade fuenf Regelpfade gefunden, die ins Leere
zeigen** (C-159) — **und dass `medical.symptoms` inzwischen
existiert.**

`[read]` **C-219 fragt dasselbe breiter:** **welche Tabellen nennt
die Spec, die es nicht gibt?**

`[cmd]` **Seit heute sind vier dazugekommen:** `meal_slots`,
`meal_plan_slots`, `injection_sites`, `food_tags_kuriert`.

`[read]` **Miss den Stand neu** — **die Liste im Punkt ist alt.**

`[read]` **Und trenne zwei Faelle:** **was fehlt, weil es noch nicht
gebaut ist** — **und was fehlt, weil die Spec sich geirrt hat.**

### 2 · C-187 — fuenf kleine Datenluecken

`[read]` **Lies den Punkt und miss, welche noch bestehen.**

`[cmd]` **Der Punkt sagt selbst: als ein Auftrag** — **also nicht
fuenf Meldungen, sondern eine.**

### 3 · C-216 — `backup/` waechst ungebremst

`[cmd]` **Miss die Groesse und was drinliegt.**

`[read]` **Und beachte A-39:** `backup/` **wird nicht geraeumt,
solange Agenten laufen** — **jemand koennte gerade
hineinschreiben.**

`[cmd]` **Heute liegen dort Bildschirmfotos von G-329, G-331, G-332
und Proben-Skripte.**

`[read]` **Vorschlagen, nicht loeschen.**

### Was nicht zu tun ist

**Nichts in `backup/` loeschen** — A-39, und der Name allein sagt
nichts.
**Keine Tabelle anlegen** — dieser Auftrag misst.
`apps/` nicht anfassen.
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    C-219   welche fehlen, getrennt nach ungebaut / Spec-Irrtum
    C-187   welche der fuenf bestehen
    C-216   Groesse, Inhalt, Vorschlag

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
