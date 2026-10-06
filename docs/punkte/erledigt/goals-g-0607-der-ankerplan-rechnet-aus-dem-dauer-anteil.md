---
nr: G-607
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-06
agent: claudecode
beauftragt: 2026-10-06
erledigt: 2026-10-06
commit: 638397cd

braucht: [G-562]
kind_von: G-562

quellen:
  - docs/punkte/erledigt/goals-g-0562-die-teilphasen-haben-keine-zeitachse-mehr.md
  - docs/entscheidungen/E-85-ein-programm-ist-eine-eigene-tabelle.md

beruehrt:
  tabellen:
    - goals.goal_strategies
  dateien:
    - apps/web/src/lib/goals/anker.ts
---

# Der Ankerplan rechnet aus dem Dauer-Anteil

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-607: der Ankerplan rechnet aus dem Dauer-Anteil
    Bereich: apps/web/src/lib/goals, apps/web/src/app/v2/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-06

## Befund

`[cmd]` Seit G-562 (`fff8a82a`, in der Kette, NICHT live) traegt
`goals.goal_strategies.sub_phases` fuer `contest_prep` je Stufe
`dauer_anteil` 4 / 8 / 6 (Summe 18), kein `weeks`. Tom, E-85: der Nutzer
bekommt einen Vorschlag aus dem Verhaeltnis und editiert ihn im Programm.

`[read]` Codex, G-562: `sub_phases` kommt ueber `strategie-read.ts` in
Vorschau, Phasen-Editor und Zeitachse; Editor und Zeitachse reichen noch
`weeks` an `anker.ts` weiter - das es nicht mehr gibt.

`[cmd]` **Reines Runden traegt nicht:** 16 Wochen -> 4/7/5 und 20 -> 4/9/7
stimmen, 17 Wochen -> 4/8/6 = 18. Die Verteilung braucht eine Restregel,
sodass die Summe immer die Gesamtdauer ist.

## Was zu tun ist

1. Messen: alle Leser von `sub_phases` und `weeks` in `apps/`, je Stelle
   was sie heute zeigt (Bild vorher).
2. Eine reine Funktion: Gesamtwochen + Anteile -> Wochen je Stufe, Summe
   immer = Gesamtwochen, jede Stufe >= 1 (Restregel begruenden, z. B.
   groesster Rest). Tests: 16 -> 4/7/5, 20 -> 4/9/7, 17 -> Summe 17.
3. `anker.ts`, Editor und Zeitachse rechnen daraus den Vorschlag; der
   Nutzer kann ihn im Programm aendern (wo das heute gespeichert wird,
   messen und nennen - nicht neu erfinden).
4. Nachweis am Schirm auf `test-user@lumeos.local` mit einer lokalen
   Wegwerf-Kette ODER erst nach dem Live-Einspielen von G-562 - melden,
   welcher Weg; nichts auf `dev`.
5. Sabotage beidseitig, Gate gruen mit Testzahl. Kein Commit.

## Abnahme - 2026-10-06, Commit `638397cd`

`[cmd]` **Diff:** `anker.ts` (+75, `stufenwochen`), `strategie-read.ts`,
Editor, Zeitachse, Vorschau; neuer Test `g607-dauer-anteil.test.ts` (13),
Fremdtest `g539-editor` auf ,Dauer-Anteil" umgestellt. Gate gruen, web
2672.

`[cmd]` **Restregel nachgerechnet:** 17 Wochen -> 3,78/7,56/5,67, abgerundet
3/7/5 = 15, die zwei Restwochen an die groessten Reste (,78 early, ,67
late) -> 4/7/6 = 17. Richtig.

`[read]` Gesamtdauer kommt aus dem vorhandenen Override
`max_duration_weeks` in `goal_phases.parameters` (`phasenOverrideSetzen`),
der Anker-Reiter zeigt dafuer ,Gesamtdauer". Sabotage 6/6 rot.

**Offen, nicht Teil dieser Abnahme:**
- Schirmnachweis - G-562 und G-560 sind live nicht da (A-104). Bis dahin
  sagt der Editor live, dass der Dauer-Anteil fehlt.
- Wochen je Stufe aendern: Speicherort laut E-85
  `goal_program_positions.duration_weeks` (G-560), live nicht vorhanden,
  in `apps/` kein Leser oder Schreiber. Folgepunkt nach A-104.
