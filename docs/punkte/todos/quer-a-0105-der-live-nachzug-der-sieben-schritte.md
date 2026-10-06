---
nr: A-105
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-06

braucht: [A-104]
kind_von: A-104

quellen:
  - docs/punkte/erledigt/quer-a-0104-live-hinkt-der-kette-hinterher.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - supabase/_pipeline/kette.json
---

# Der Live-Nachzug der sieben Schritte

## Auftrag - Kopf

    AUFTRAG FUER Codex - A-105: sieben abgenommene Schritte kommen live an
    Bereich: Live-Datenbank, nur die genannten Objekte
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-06

## Grundlage

A-104 (`backup/a104/a104-bericht.md`): sieben abgenommene Schritte fehlen
live. Tom, 06.10.: *erledigt heisst live*. Eine Freigabe fuer den ganzen
Nachzug, aber **jeder Schritt einzeln** nach dem Muster G-602 bis G-605.

## Reihenfolge (aus A-104)

1. C-417 - Schritt `417` (nach `411`, `061`); danach `488_sprachspalten`
   nur pruefen, nicht blind wiederholen.
2. G-524 - `524_tdee_history_writer`; Backfill erst nach Vergleich mit Live.
3. G-561 - NUR die sechs Guard-Zellen aus `536_goal_strategies_seed`,
   nicht den Seed.
4. G-558 - `558_goal_phase_start_strategy`; vorher Aufrufer der
   7-Argument-Fassung live und in `apps/` zaehlen.
5. G-560 dann G-562 - `560_goal_programs`, `562_goal_subphase_duration_ratio`.
6. C-551 - `551_role_measurement_separation_schema`, dann `_data`.
7. C-546 - `546_muscle_anatomy_schema`, dann `_data`.

## Je Schritt

a) Sicherung vorher `backup/a105-<punkt>-vorher.sql` (betroffenes Schema +
   betroffene Tabellen-Daten). b) Nur der genannte Schritt. c) `NOTIFY
   pgrst`. d) Nachweis live gegen die A-104-Soll-Werte (Objekt da,
   Signatur, Zeilenzahl/Hash). e) Sicherung nachher.

## Harte Regeln

- **Stopp und melden**, sobald ein Schritt etwas anderes antrifft als A-104
  beschreibt, Daten loeschen oder ueberschreiben wuerde, die nur live
  existieren (Supplements, Kandidaten, Stack-Vorlagen), oder fehlschlaegt.
  Dann keine weiteren Schritte.
- Keine Funktions-, Policy- oder Grant-Abweichung ausserhalb dieser sieben
  anfassen (das ist A-106).
- Danach eine A-104-Kurzmessung: welche der sieben Abweichungen sind weg.
- Kein Commit.
