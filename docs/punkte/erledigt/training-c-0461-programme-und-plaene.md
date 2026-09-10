---
nr: C-461
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: bd8c7873
beruehrt:
  tabellen: [training.routines, training.routine_exercises, training.routine_schedule_days, training.programs, training.program_blocks, training.program_days, training.program_assignments, training.workout_sessions]
zahlen:
  gemessen: 2026-09-10
  uebungen: 1416
  sitzungen_vorher: 66
  sitzungen_nachher: 66
---

# C-461 - Programme und Plaene

## Bericht 2026-09-10

### A1 - Spec

`docs/specs/Training/SPEC_06_DATABASE_SCHEMA.md:283-425` nennt `routines`, `routine_exercises`, `routine_schedule_days` und die Sitzungsverbindung. `SPEC_03_USER_FLOWS.md:94,207` nennt Routine und Wochenplanung. HumanCoach `SPEC_05_COACH_WORKFLOWS.md:110-112` nennt Hypertrophy, Strength und Peaking; sie sind frei benannte `program_blocks` mit Wochenintervall, keine erfundene feste Vorlage. HumanCoach `SPEC_01_MODULE_CONTRACT.md:99` verlangt die bestaetigte Zuweisung.

### A2 - Altrepo

`referenz/lumeos-2026/src/api/marketplace/routes/activate.ts:10-11,74-139` teilt in vier Teile. Die Aufteilung traegt:

| Altrepo | Neuer Kern | Befund |
|---|---|---|
| `training_plans` | `programs` plus `program_assignments` | Vorlage und Nutzerzustand getrennt |
| `training_plan_days` | `program_days` | Woche, Wochentag und Routine |
| `routines` | `routines` | wiederverwendbarer Trainingstag |
| `routine_exercises` | `routine_exercises` | Uebung, Reihenfolge, Saetze, Wiederholungen, Gewicht oder Prozent-1RM |

Gegenueber dem Altrepo ist die Client-Zuweisung explizit und bestaetigbar. Direkte Marketplace-Aktivierung bleibt C-452.

### A3 - Schema

| Tabelle | Spaltenkern | FK und Index |
|---|---|---|
| `routines` | Nutzer, Quelle, Name, Beschreibung, Tage/Woche, aktiv | Nutzer; `(user_id, is_active)` |
| `routine_exercises` | Routine, Uebung, Reihenfolge, Saetze, Wiederholungen, Gewicht oder Prozent-1RM | Routine, Uebung; `(routine_id, exercise_order)` |
| `routine_schedule_days` | Routine, Wochentag, optionale Wochennummer | Routine; `(routine_id, week_number, day_of_week)` |
| `programs` | Nutzer, Quelle, Name, Beschreibung, Laufzeit | Nutzer; `(user_id, source)` |
| `program_blocks` | Programm, Wochenanfang/-ende, Label | Programm; `(program_id, week_start)` |
| `program_days` | Programm, Routine, Woche, Wochentag, Label | Programm, Routine; `(program_id, week_number, day_of_week)` |
| `program_assignments` | Programm, Nutzer, Status, Vorschlag/Bestaetigung/Start/Ende | Programm, Nutzer; `(user_id, status)` |

`workout_sessions.program_assignment_id` und `.program_day_id` sind nullable FKs. Ein Trigger verlangt beide zusammen und prueft Nutzer und Programm. Ein zweiter verbietet eine fremde Routine am eigenen Programmtag.

### A4/A5 - Nachweis und RLS

Rotprobe: ohne den zweiten Trigger wurde eine bekannte fremde Routine-ID akzeptiert (`false !== true`). `20260909251000_c461_program_day_owner_guard.sql` schliesst diese Luecke.

Final gegen `lumeos_c461_final2`, vollstaendig `ROLLBACK`:

- 1 Routine, 1 Programm, 1 Hypertrophy-Block, 1 Programmtag und 1 Routine-Uebung.
- Zuweisung `proposed -> confirmed -> running`; 1 Sitzung daran gehaengt.
- Fremder Nutzer sieht 0 Programme und 0 Zuweisungen; sein Routine-Link wird abgewiesen.
- Alle sieben Tabellen haben RLS und je eine `ALL`-Policy fuer eigene Zeilen.
- `authenticated` hat DML, `service_role` ALL; beide Triggerfunktionen haben fuer `anon` 0 EXECUTE.

Finaler Test: 1/1 gruen, Subtest **0,90 s**, gesamt **1,18 s** (`backup/c461-final-test.out`).

### A6 - historische Sitzungen

Live vorher/nachher: **66 / 66** Sitzungen. Alle 66 haben beide neuen Referenzen leer; **0** ist teilweise verknuepft. Freie und historische Sitzungen bleiben gueltig.

### A7 - Sicherung und Kette

Vor Haupt-Einspielen: `backup/schema/20260910155818_c461_training_programs_vor_einspielen.dump`, **27.279.483 B**, SHA-256 `D0E7BD7970B8E89D432F55DC6E9C4185C5950B2D15878A3D50A474E7E664C452`.

Vor Eigentums-Guard: `backup/schema/20260910161437_c461_program_day_guard_vor_einspielen.dump`, **27.218.227 B**, SHA-256 `CB380D5C7C61B1D60CB469A5A8EA7F861A41AA93FC8B0CA7DCEF50A5364C2B52`.

Frischer Aufbau `lumeos_c461_final2`: **187 Schritte**, `SCHEMA VOLLSTAENDIG`, **375,9 s** (`backup/c461-final-vollkette.out`). Punktelauf: **612 Punkte**, 25/25 erwartete Befunde, gruen (`backup/c461-punktelauf.out`).

```yaml
security_review:
  status: passed
  issues: []
```

## Nicht gebaut

Keine Marketplace-Auslieferung, keine Coach-Zuweisung und keine Wallet-Buchung. Die Tabellen tragen nur den belastbaren Vertrag dafuer.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **Sieben neue Tabellen in `training`:**

    programs               8 Spalten
    program_blocks         6
    program_days           7
    program_assignments   10
    routines               9
    routine_exercises     10
    routine_schedule_days  5

`[cmd]` **Die 66 historischen Sitzungen: 66 ohne Verknuepfung, 0
teilverknuepft.**

`[cmd]` **Vollkette 187 Schritte, SCHEMA VOLLSTAENDIG, 375,9 s.
Punktelauf gruen, 613 Punkte.**

### Die Aufteilung folgt dem Altrepo, aber nicht blind

`[cmd]` **Das Altrepo hatte vier:** `training_plans`,
`training_plan_days`, `routines`, `routine_exercises`.

`[cmd]` **Gebaut sind sieben** ? **mit `program_blocks`
dazwischen.**

`[read]` **`SPEC_05:120` nennt Bloecke:** *,,Woche 1-4
Hypertrophy, 5-8 Strength, 9-12 Peaking."*

`[read]` **Ohne eigene Tabelle waere der Blockname ein Feld an
jedem Tag** ? **und bei zwoelf Wochen zwoelfmal dasselbe.**

### `program_assignments` traegt den Zustand

`[cmd]` **`SPEC_01:99` (HumanCoach):** *,,Assignment = Vorschlag,
Client bestaetigt."*

`[read]` **Damit ist der Weg aus dem Marketplace offen** ?
**C-452 kann jetzt eine Programm-ID zurueckgeben.**

### Und die Sitzungen bleiben gueltig

`[read]` **Nullable** ? **wer frei trainiert, haengt an keinem
Programmtag.**

`[cmd]` **66 ohne Verknuepfung, keine halbe.**

**Abgenommen.**
