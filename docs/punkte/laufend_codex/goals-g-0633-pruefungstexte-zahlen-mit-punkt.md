---
nr: G-633
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-08

braucht: []
kind_von: G-626

quellen:
  - supabase/_pipeline/11_goals/626_experience_goal_limits.sql

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/626_experience_goal_limits.sql
---

# Prüfungstexte schreiben Zahlen mit Punkt

## Befund

`[read]` Claude Code, G-628 Teil 2 am Schirm: "Diät über 20.0 Wochen am Stück …", "Ziel-BMI 16.8 liegt unter 18.5." Die Hinweistexte aus `ziel_grenzen_pruefen` formatieren Zahlen mit Punkt und unnötiger Nachkommastelle.

## Was zu tun ist (Codex)

Zahlen in den Hinweistexten deutsch formatieren: Komma als Dezimalzeichen, ganze Wochen ohne ",0" ("20 Wochen", "BMI 16,8 … unter 18,5"). Schlüssel unverändert. Mit dem nächsten Live-Paket (G-625).
## Auftrag - Kopf

    AUFTRAG FUER Codex - G-625 Teil 2 + G-633
    Bereich: supabase/_pipeline/ (Kette)
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08, HEAD aa28c51d


## Kette committet - 2026-10-08, Commit `72ca5fb3` (mit G-625 Teil 2, G-633, G-634)

`[cmd]` 7 Dateien nur supabase/_pipeline, neue Schritte 625_goal_plan_position_revision, 633_goal_limit_german_numbers, 634_measurement_goal_start_preview (+ je Probe). Gelesen: 634 – der Snapshot-Trigger `g617_measurement_goal_snapshot` ruft `measurement_goal_start_preview` (eine Abfrage, `auth.uid()`, Kennung `erst_messen`). 633 – Wrapper um `ziel_grenzen_pruefen` (Basis umbenannt), Regex nur auf den Hinweistext, Schlüssel gleich. 625 Teil 2 – Position mit `FOR UPDATE` nur für `auth.uid()`. Gate grün.

`[read]` Codex: 385 Schritte grün, Proben G-625 2/2, G-633 1/1 (Hex 31 36 2c 38 = "16,8"), G-634 1/1 (Gewicht, Umfang, e1RM, Gewicht×Wdh, Training, Schlaf, eigener Wert), testdaten-pruefen 186/0, Sabotage 3/3 rot. Katalog: 17 Programme mit NULL in den neuen Spalten, Rechnung mit fat_percent belegt. Erledigt erst nach Live.