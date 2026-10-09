---
nr: G-637
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-08

braucht: []
kind_von: G-622

quellen:
  - supabase/_pipeline/11_goals/622_goal_free_maintenance.sql
  - docs/punkte/laufend_codex/goals-g-0625-ein-plan-ist-der-inhalt-des-steuernden-ziels.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/622_goal_free_maintenance.sql
    - apps/web/src/app/v2/kein-ziel-warnung.tsx
---

# Ein aktives Ziel ohne laufende Phase heisst "kein aktives Ziel"

## Befund

`[cmd]` dev, 2026-10-08: Das Ziel "Lean Bulk bis September" ist active/controlling, seine letzte Phase endete am 29.09. `goals.berechne_zielwerte(dev, heute)` gibt `hindernis = kein_aktives_ziel` zurück, goal_id ist leer. Seit G-630 zeigt die App deshalb "Kein aktives Ziel – du läufst auf Erhaltung". Das stimmt nicht: Das Ziel ist aktiv, nur ohne laufende Phase.

## Was zu tun ist

Codex: ein eigenes Hindernis, z. B. `ziel_ohne_laufende_phase`, mit goal_id und der Empfehlung (recommended_next). Erhaltung bleibt die Rechnung.
Claude Code: eigener Satz, z. B. "„Lean Bulk bis September“ ist aktiv, hat aber seit 29.09. keine laufende Phase – du läufst auf Erhaltung. Nächste Phase wählen." Der Weg führt in die Phase Engine.
## Auftrag - Kopf

    AUFTRAG FUER Codex - G-625 Backfill B + G-637 (Kette), danach Live
    Bereich: supabase/_pipeline/ (Kette). Live erst nach Pruefung durch den Orchestrator.
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08, HEAD 54f39567


## Backfill B + G-637 committet - 2026-10-09, Commit `5fc802b5`

`[cmd]` 5 Dateien nur Kette. Backfill gelesen: alle Phasen je Ziel per row_number nach gueltig_ab, Planstatus active→aktiv, on_hold/paused→pausiert, sonst abgeschlossen; Prüfung Positionen = Phasen der steuernden Ziele. Live gemessen: 6 Phasen an steuernden Zielen (fat_loss 1, lean_bulk 3, maintenance 2) → 6 Positionen, dev 2. Richtung über phase_type (fat_loss/mini_cut→abnehmen, lean_bulk→aufbauen, sonst halten); für die Live-Typen korrekt, contest_prep/reverse_diet wären "halten" – nur für diesen Einmal-Backfill, kommt live nicht vor. 637 gelesen: `ziel_ohne_laufende_phase_am`; `berechne_zielwerte` als Hülle über `_g637_basis` mit drei zusätzlichen Spalten. Gate grün.

Hinweis: `ziel_grenzen_pruefen` und `berechne_zielwerte` sind jetzt umbenannte Basis + Hülle (G-633, G-637). Beim nächsten Umbau zusammenführen.