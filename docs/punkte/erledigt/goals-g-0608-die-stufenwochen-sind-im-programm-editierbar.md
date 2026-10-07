---
nr: G-608
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-07
agent: claudecode
beauftragt: 2026-10-07
erledigt: 2026-10-07
commit: 080cc8fc

braucht: [G-607, A-105]
kind_von: G-607

quellen:
  - docs/punkte/erledigt/goals-g-0607-der-ankerplan-rechnet-aus-dem-dauer-anteil.md
  - docs/punkte/erledigt/quer-a-0105-der-live-nachzug-der-sieben-schritte.md
  - docs/entscheidungen/E-85-ein-programm-ist-eine-eigene-tabelle.md

beruehrt:
  tabellen:
    - goals.goal_programs
    - goals.goal_program_positions
  dateien:
    - apps/web/src/lib/goals/anker.ts
---

# Die Stufenwochen sind im Programm editierbar - und am Schirm belegt

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-608: Stufenwochen editierbar, G-607 am Schirm
    Bereich: apps/web/src/lib/goals, apps/web/src/app/v2/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-07

## Befund

`[cmd]` Seit A-105 (07.10.) sind live: `goals.goal_programs`,
`goal_program_positions` (0/0 Zeilen), `contest_prep.sub_phases` mit
`dauer_anteil` 4/8/6. G-607 (`638397cd`) rechnet den Vorschlag
(`stufenwochen`, groesster Rest), sein Schirmnachweis fehlte, weil die
Daten live nicht da waren. Tom, E-85: der Nutzer bekommt einen Vorschlag
und editiert ihn; Speicherort der editierten Wochen ist
`goal_program_positions.duration_weeks`. Kein Code in `apps/` liest oder
schreibt die Programmtabellen.

Fachregel G-604: hoechstens ein aktives Kalorienziel; test-user hat ein
aktives Abbauziel. Ein contest_prep-Ziel fuer den Nachweis darf nur
geplant sein oder muss das bestehende ersetzen - messen, nicht umgehen.

## Was zu tun ist

1. Messen: Spalten, Policies und Validierungsfunktion der Programmtabellen
   live; wie ein Programm zu Ziel und Phase steht.
2. Lesen und Schreiben: Vorschlag aus `stufenwochen`, Aenderung je Stufe
   speichert nach `goal_program_positions.duration_weeks`; Summe weicht
   von der Gesamtdauer ab -> sichtbar, nicht still korrigiert.
3. Schirmnachweis auf `test-user@lumeos.local`: contest_prep-Phase mit
   Zieldatum (geplant, G-604 beachten), Zeitachse zeigt bei 16 Wochen
   4/7/5 mit Daten, Stufe aendern, neu laden, steht; Rueckbau ueber die
   Oberflaeche. Bilder vorher/nachher nach `backup/`.
4. Sabotage beidseitig, Gate gruen mit Testzahl. Kein Commit.

Hinweis: das Gate ist bis A-107 an `sprachspalten` rot (Live-Tabelle aus
C-417) - das ist nicht deins; alle uebrigen Stufen einzeln nachweisen.

## Abnahme - 2026-10-07, Commit `080cc8fc`

`[cmd]` Diff: `programm-write.ts`, `programm-aktionen.ts` neu, `anker.ts` (`stufenplan`), `lesen.ts` (`ladeProgrammwochen`), Editor, Zeitachse, Seite; Test `g608-stufenwochen.test.ts` (13), Fremdtests G-544/G-607 nur in der Form angepasst. Gate gruen, web 2693.

`[cmd]` Live nach dem Nachweis gemessen: test-user 2 Ziele, 2 Phasen; `goal_programs` 0, `goal_program_positions` 0 - Rueckbau vollstaendig.

`[read]` Schirm: 16 Wochen -> 4/7/5 mit Daten; mid = 8 gespeichert, steht nach Reload, Abweichungssatz ,17 statt 16'; ,Vorschlag wiederherstellen' -> 4/7/5, 0 Zeilen. `goal_phase_id` absichtlich nicht gesetzt (UNIQUE, drei Stufen teilen sich eine Phase). Das Testziel musste per SQL angelegt und entfernt werden.

Befunde daraus: G-609 (Strategie wird beim Phasenstart nicht durchgereicht), G-610 (contest_prep nicht anlegbar; Plan beginnt vor dem Ziel - Toms Frage), G-611 (kein Loeschweg fuer Ziele).

