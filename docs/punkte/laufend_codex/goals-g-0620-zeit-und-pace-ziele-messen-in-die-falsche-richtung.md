---
nr: G-620
typ: fehler
modul: goals
schwere: niedrig
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-18

braucht: [G-617]
kind_von: G-617

quellen:
  - supabase/_pipeline/11_goals/617_measurement_goal_exercise_and_role.sql

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - supabase/_pipeline/11_goals/617_measurement_goal_exercise_and_role.sql
---

# Zeit- und Pace-Ziele messen in die falsche Richtung

## Befund

`[cmd]` `617_...sql` Zeile 196: `duration` nimmt `max(duration_seconds)`.
Fuer ,5 km unter 25 min" ist kleiner besser; max liefert den langsamsten Lauf.
Dauer ist ausserdem nicht an eine Distanz gebunden. `pace` nimmt `min` -
richtig, aber ob die Fortschrittsrechnung ,kleiner ist besser" kennt, ist
ungeprueft.

`[cmd]` `measured_at` ist das letzte Sessiondatum der Uebung, nicht das
Datum des besten Werts.

## Was zu tun ist

Vor dem Cardio-Modul: Richtung je Messart (hoeher/niedriger besser) festlegen,
Dauer optional an Distanz binden, Fortschritt bei ,niedriger besser" pruefen,
measured_at = Datum des gezaehlten Werts.

## Auftrag - Kopf

    AUFTRAG FUER codex - G-620 Richtung je Messart (Sammelauftrag 18.10. mit G-616/G-620/G-647 + Bestandspruefung G-643/G-646/G-525)
    Bereich: supabase/_pipeline/ (Kette), Live dev nach A-105 nur wo noetig
    Fremd:   apps/, packages/, tools/, docs/
    Stand:   2026-10-18, HEAD 2510f992

