---
nr: G-622
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-08

braucht: [G-613]
kind_von: G-613

quellen:
  - docs/punkte/laufend_codex/goals-g-0613-ein-pausiertes-ziel-laesst-seine-phase-laufen.md

beruehrt:
  tabellen:
    - goals.goal_phases
    - goals.nutrition_targets
  dateien: []
---

# Ohne aktives Ziel gibt es keine Tagesziele

## Befund

`[read]` G-613 (Kette): ohne aktive Zielphase liefert `zielwerte_am` nichts;
Max verliert Tagesziele und die Goals-Fettsaeureziele
(`testdaten-pruefen`: `hindernis = 'keine_aktive_phase'`).

## Entschieden - 2026-10-08 08:18, Tom

*,erhaltung aktiv aber klare warnung dass kein goal aktiv ist, der user muss wissen dass er planlos laeuft"*

## Was zu tun ist

Daten (Codex): ohne aktive Phase liefern die Zielwerte Erhaltung
(vorhandene TDEE-Rechnung, keine zweite) mit einem ausdruecklichen
Kennzeichen ,kein aktives Ziel" - nicht leer, nicht stillschweigend.
Oberflaeche (Claude Code): sichtbare Warnung ueberall, wo Tagesziele stehen
(Today, Nutrition, Goals), mit Weg zum Ziel setzen bzw. Reaktivieren.
## Auftrag - Kopf (Datenhaelfte)

    AUFTRAG FUER Codex - G-622: ohne aktives Ziel gilt Erhaltung, ausdruecklich gekennzeichnet
    Bereich: supabase/_pipeline/ (Kette), danach Live nach Toms Freigabe
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08

Block im Chat 08.10. 08:18.
