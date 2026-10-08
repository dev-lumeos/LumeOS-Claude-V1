---
nr: G-615
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-07
agent: claudecode
beauftragt: 2026-10-08

braucht: [G-610, G-614]
kind_von: G-612

quellen:
  - docs/punkte/todos/goals-g-0612-drei-auswahlen-und-keine-ordnung.md
  - docs/punkte/erledigt/goals-g-0608-die-stufenwochen-sind-im-programm-editierbar.md
  - docs/spezifikation/10-plattform/design-system/theme-v1/module-goals-editor.jsx

beruehrt:
  tabellen:
    - goals.goal_programs
    - goals.goal_program_positions
  dateien: []
---

# Der Planer legt Plaene vom Termin rueckwaerts an

## Bauart (Recherche 07.10., Tom: direkt bauen)

Werkzeug (B) neben ,Ziel setzen" (G-610): eigener Reiter ,Planer", ab
`pro`. Contest Prep (Peak Week als letzte Stufe), Expert BB Jahreszyklus
und Custom sind mehrphasige PLAENE, keine Einzelstrategien
(`goal_strategies.auswahl_gruppe = plan`, G-614). Einstieg ist ein
Termin (Wettkampf oder Zieldatum); der Planer legt die Phasen rueckwaerts
an - Vorbild TrainingPeaks Annual Training Plan; Mockup
`module-goals-editor.jsx` (,Weeks-out are anchored to your show date",
Jahreszyklus-Editor). Jede Phase ist verschiebbar und verlaengerbar, das
Enddatum folgt (Tom 07.10.). Bausteine sind dieselben Strategien wie in
(A). Vorhanden: Dauer-Anteile (G-562), Stufenwochen (G-608),
Ankerplan (G-607), `goal_programs`.

Auftrag folgt nach G-610.

## Praezisiert - 2026-10-07 14:12, Tom

Der Planer IST der **Reiter Phase engine** - dort sitzen heute die Strategie-Reiter (fest codiert, Hybrid = hybrid+recovery), die Phasenarten-Auswahl und die Attrappe ,Phase state machine'. G-615 macht daraus den Planer: Termin -> Phasen rueckwaerts, Zeitachse, Plaene aus `auswahl_gruppe = plan`, die Karte ,Phase state machine' als Anzeige (aktuell / empfohlen).


## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-615: der Reiter Phase engine wird der Planer
    Bereich: apps/web/src/lib/goals, apps/web/src/app/v2/goals
    Fremd:   supabase/_pipeline/ (Codex, G-613/G-617 laufen). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08

Siehe Block im Chat 08.10.; Grundlage ,Praezisiert 14:12'.