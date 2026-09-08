---
nr: C-269
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-08-25
braucht: []
kind_von: G-185
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 0e8cdc8f
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-269 - Eine Einladung laesst sich nicht zuruecknehmen

## Befund

(neu
  2026-08-25). Aus G-185, von Claude Code beim eigenen Rueckbau
  gefunden.

  `[cmd]` **Der AFTER-DELETE-Trigger `relationships_change_log`
  schreibt die `relationship_id` ins Log, und der Fremdschluessel
  dorthin verbietet genau das Loeschen.**

  `[cmd]` **Zwei Agenten sind unabhaengig darauf gestossen** — Fable in
  C-225, Claude Code in G-185. **Beide haben den Trigger kontrolliert
  abgeschaltet statt ihn zu umgehen.**

  `[read]` **Die Folge ist konkret:** die Oberflaeche kann eine
  Einladung nicht zuruecknehmen. Claude Code hat deshalb **keinen
  solchen Knopf gebaut — statt einen zu bauen, der scheitert.**

  `[cmd]` Heute zwei Zeilen mit `status='invited'`, beide bei
  `sarah.seed@example.com`.

  `[read]` **Drei Wege, und der dritte ist vermutlich richtig:**
  `ON DELETE SET NULL` · `ON DELETE CASCADE` · **Statuswechsel statt
  Loeschen.** Ein Aenderungsprotokoll, das beim Loeschen verschwindet,
  ist kein Protokoll — und eine zurueckgenommene Einladung ist ein
  Vorgang, kein Nichts.

## Auftrag

**Mitbeauftragt mit A-33 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-01

`[cmd]` **Die Datenbankseite steht:** der Widerruf setzt Status und
Auditfelder und schreibt ins Aenderungslog. **Rueckbau-Gegenprobe
bestanden.**

`[cmd]` **Ein sichtbarer Aufrufer fehlt.**

`[read]` **Damit ist es UI-Arbeit geworden, kein Schemabefund** —
**und gehoert an einen UI-Agenten, wenn der Coach-Bereich dran ist.**

## Auftrag

**Mitbeauftragt mit G-324 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Abnahme

**2026-09-08, mit G-324 abgenommen.**

`[cmd]` **`coach.withdraw_relationship_invite`, `withdrawn_at` und
`withdrawn_by` sind live.**

`[cmd]` **`invited -> withdrawn`, `relationship_change_log` +1.**

`[read]` **Zuruecknehmen heisst nicht loeschen** — **dieselbe
Machart wie `withdraw_stack_template`** (C-423) **und das
Archivieren der Einkaufslisten** (E-64).
