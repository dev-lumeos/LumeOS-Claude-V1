---
nr: A-105
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-10-06
agent: codex
beauftragt: 2026-10-06
erledigt: 2026-10-07
commit: 91c4d766

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

## Freigabe - 2026-10-06, 18:18

**Tom:** *,ja gib mir das fuer codex'* - eine Freigabe fuer alle sieben Schritte, jeder einzeln nach dem Muster oben.


## Abnahme - 2026-10-07, live, Orchestrator nachgemessen

`[cmd]` **Live gemessen 07.10. 07:05:**

    C-417  recipe_curation_catalog + _catalog_ingredients da,
           decide_recipe_curation_candidate 1; Spalten nur name_de
    G-524  record_adaptive_tdee 1, tdee_history 234 Zeilen (vorher 0)
    G-561  17 Strategien, 6 mit relativen Guards
    G-558  goal_phase_start genau 1 Signatur, 8 Argumente
    G-560  goal_programs, goal_program_positions da (0/0 Zeilen)
    G-562  contest_prep: 3 Stufen mit dauer_anteil, Summe 18
    C-551  muscle_role_volume_rules 2, exercise_muscles 6.726
    C-546  anatomy_sources 5, origins 20, insertions 21, innervations 23
    Kontrolle  supplements 617, stack_templates 6 - unveraendert

`[read]` Sicherungen je Schritt vorher/nachher in `backup/a105-*` (Groessen
im Bericht), Zwischensicherungen fuer Backfill und die Datenteile von C-551
und C-546. `g562_baseline` geloescht. Nichts ausserhalb der sieben
angefasst.

**Damit sind live:** C-417 (bis auf Sprachspalten), G-524, G-558, G-560,
G-561, G-562, C-551, C-546.

**Offen:** C-417 - `recipe_curation_catalog` hat live nur `name_de`;
`488_sprachspalten` legt `name_en`/`name_th` an, wurde wie beauftragt nur
geprueft. -> A-107. Die uebrigen Abweichungen: A-106.
