---
nr: G-634
typ: frage
modul: goals
schwere: mittel
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-08
erledigt: 2026-10-09
commit: 72ca5fb3

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

Tom 2026-10-08 17:40: ja, bauen.
## Auftrag - Kopf

    AUFTRAG FUER Codex - G-634: Startwert-Vorschau fuer Messziele (Nachtrag zu G-625 Teil 2)
    Bereich: supabase/_pipeline/ (Kette)
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08


## Kette committet - 2026-10-08, Commit `72ca5fb3` (mit G-625 Teil 2, G-633, G-634)

`[cmd]` 7 Dateien nur supabase/_pipeline, neue Schritte 625_goal_plan_position_revision, 633_goal_limit_german_numbers, 634_measurement_goal_start_preview (+ je Probe). Gelesen: 634 – der Snapshot-Trigger `g617_measurement_goal_snapshot` ruft `measurement_goal_start_preview` (eine Abfrage, `auth.uid()`, Kennung `erst_messen`). 633 – Wrapper um `ziel_grenzen_pruefen` (Basis umbenannt), Regex nur auf den Hinweistext, Schlüssel gleich. 625 Teil 2 – Position mit `FOR UPDATE` nur für `auth.uid()`. Gate grün.

`[read]` Codex: 385 Schritte grün, Proben G-625 2/2, G-633 1/1 (Hex 31 36 2c 38 = "16,8"), G-634 1/1 (Gewicht, Umfang, e1RM, Gewicht×Wdh, Training, Schlaf, eigener Wert), testdaten-pruefen 186/0, Sabotage 3/3 rot. Katalog: 17 Programme mit NULL in den neuen Spalten, Rechnung mit fat_percent belegt. Erledigt erst nach Live.

## Live - 2026-10-09 09:35, Codex (Freigabe Teil C)

`[cmd]` 13 Schritte einzeln live (625 ×10, 633, 634, 637), NOTIFY pgrst. Sicherung vorher 1.317.123 Byte, nachher 1.392.386 Byte (Orchestrator nachgemessen).

`[cmd]` Orchestrator nachgemessen: 4 Pläne (3 aktiv, 1 pausiert), 6 Positionen; dev-Plan aktiv mit 2 beendeten Positionen. `berechne_zielwerte(dev)` = `ziel_ohne_laufende_phase`, recommended_next mini_cut, goal_id gesetzt. Funktionen `measurement_goal_start_preview`, `ziel_ohne_laufende_phase_am`, `g633_hinweis_zahlen_de` vorhanden. Aktive Ziele: 3 steuernd, 3 messend.

`[read]` Codex: Rollen und test-user-Tageswerte unverändert, pnpm gate grün.

dev-Neustart (Variante b) gestoppt: `ziel_grenzen_pruefen` sperrt `vorgehen_zu_langsam`. lean_bulk mit 0,25 %/Woche erreicht 85 → 88 kg bis 16.12. nicht. Das ist eine Datenentscheidung von Tom, kein Kettenfehler.