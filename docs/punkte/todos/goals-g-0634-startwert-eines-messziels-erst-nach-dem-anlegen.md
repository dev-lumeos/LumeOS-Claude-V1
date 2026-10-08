---
nr: G-634
typ: frage
modul: goals
schwere: mittel
angelegt: 2026-10-08

braucht: []
kind_von: G-628

quellen:
  - supabase/_pipeline/11_goals/617_measurement_goal_expansion.sql
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/617_measurement_goal_expansion.sql
---

# Startwert eines Messziels erst nach dem Anlegen sichtbar

## Befund

`[read]` Claude Code, G-628 Teil 3: Den Startwert hält der Trigger beim Anlegen fest. Der Dialog zeigt ihn erst danach. Eine Vorschau vorher müsste die Trigger-Abfrage im Code nachbauen, und das ist verboten (eine Quelle).

## Vorschlag (Orchestrator)

Codex zieht die Startwertermittlung aus dem Trigger in eine Lesefunktion (z. B. `measurement_goal_start_preview(art, quelle, uebung, stelle, messart, wdh)` → Wert, Datum, Quelle). Trigger und Vorschau rufen dieselbe Funktion. Danach zeigt Claude Code den Startwert vor "Anlegen".

## Entscheidung Tom

Offen: bauen ja/nein.