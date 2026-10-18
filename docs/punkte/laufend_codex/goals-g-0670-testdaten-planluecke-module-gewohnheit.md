---
nr: G-670
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-18
agent: codex
beauftragt: 2026-10-18

braucht: []
kind_von: G-648

quellen:
  - supabase/_pipeline/_testdaten/652_goals_design_seed.sql

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/_testdaten/652_goals_design_seed.sql
---
# Testdaten: Planlücke, leere linked_modules, Gewohnheitsserie

## Befund

`[read]` Claude Code (18.10.):
- Der Plan "Lean Bulk auf 88 kg" hat eine Lücke vom 19.07. bis 09.10. Der Kopf sagt 24 Wochen, der Zeitraum umfasst 34.
- `linked_modules` ist bei allen Messzielen leer, deshalb fehlen die Modul-Pillen.
- Die Gewohnheit zeigt 4 Wochen und Serie 0. Im Entwurf sind es 12 Wochen und Serie 6.

## Was zu tun ist (Codex)

- Testdaten nach Entwurf: Plan ohne Lücke oder die Lücke als Position "Halten".
- linked_modules wie im Entwurf: Kniebeuge mit Training, Ernährung und Recovery; Körperfett mit Messungen und Ernährung.
- Gewohnheit mit 12 Wochen Verlauf.
- Live auf dev nach A-105.

## Auftrag - Kopf

    AUFTRAG FUER codex - Goals-Rest aus der Abnahme (Sammelauftrag 18.10.: G-667/668/669/670/646/525)
    Bereich: supabase/_pipeline/ (Kette, Testdaten), Live dev nach A-105
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD 4f45fd2d

