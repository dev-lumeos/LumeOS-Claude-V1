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
