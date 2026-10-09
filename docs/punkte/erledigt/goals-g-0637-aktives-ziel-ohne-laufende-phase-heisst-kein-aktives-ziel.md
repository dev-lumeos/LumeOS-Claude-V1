---
nr: G-637
typ: fehler
modul: goals
schwere: mittel
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-08
erledigt: 2026-10-09
commit: 5fc802b5

braucht: []
kind_von: G-622

quellen:
  - supabase/_pipeline/11_goals/622_goal_free_maintenance.sql
  - docs/punkte/erledigt/goals-g-0625-ein-plan-ist-der-inhalt-des-steuernden-ziels.md

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

## Live - 2026-10-09 09:35, Codex (Freigabe Teil C)

`[cmd]` 13 Schritte einzeln live (625 ×10, 633, 634, 637), NOTIFY pgrst. Sicherung vorher 1.317.123 Byte, nachher 1.392.386 Byte (Orchestrator nachgemessen).

`[cmd]` Orchestrator nachgemessen: 4 Pläne (3 aktiv, 1 pausiert), 6 Positionen; dev-Plan aktiv mit 2 beendeten Positionen. `berechne_zielwerte(dev)` = `ziel_ohne_laufende_phase`, recommended_next mini_cut, goal_id gesetzt. Funktionen `measurement_goal_start_preview`, `ziel_ohne_laufende_phase_am`, `g633_hinweis_zahlen_de` vorhanden. Aktive Ziele: 3 steuernd, 3 messend.

`[read]` Codex: Rollen und test-user-Tageswerte unverändert, pnpm gate grün.

dev-Neustart (Variante b) gestoppt: `ziel_grenzen_pruefen` sperrt `vorgehen_zu_langsam`. lean_bulk mit 0,25 %/Woche erreicht 85 → 88 kg bis 16.12. nicht. Das ist eine Datenentscheidung von Tom, kein Kettenfehler.
Der Satz in der App gehört zu G-618 Teil B (Steuerungskarte, Zustand "Ziel aktiv ohne laufende Phase"). Er ist mit diesem Auftrag an Claude Code raus.
