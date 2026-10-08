---
nr: G-618
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-07
agent: claudecode
beauftragt: 2026-10-08

braucht: [G-617]
kind_von: G-617

quellen:
  - docs/punkte/laufend_codex/goals-g-0617-ein-kraftziel-findet-seine-uebung-nur-ueber-den-titel.md

beruehrt:
  tabellen:
    - goals.user_goals
  dateien:
    - apps/web/src/app/v2/goals
---

# Der Reiter Goals trennt das steuernde Ziel von den messenden

## Entschieden - 2026-10-07 16:39, Tom

Steuerndes Ziel (eines) oben, mit Strategie und Phase. Darunter die
messenden Ziele, grafisch nach Kategorie (`goal_type`/`subtype`:
Kraft, Kapazitaet, Cardio, Gewohnheit ...) getrennt. Keine
Eltern-Kind-Verknuepfung, keine Mischung mit Strategie oder Phasen.

## Was zu tun ist

Reiter Goals: Bereich ,Steuerung" (das eine aktive steuernde Ziel, Variante,
laufende Phase) und Bereich ,Messziele" nach Kategorie, je Ziel Messart,
Uebung, Ist/Ziel, Frist. Anlegen eines Messziels mit Uebungsauswahl (G-617).
Danach eigener Punkt: ,Ziel setzen" an der Uebung in Training, oeffnet
dasselbe Anlegen mit vorausgefuellter Uebung.

## Ergaenzt - 2026-10-08, aus G-617

`[read]` Codex: `priority`/`is_primary` werden in `apps/web/src/lib/goals/lesen.ts` und mehreren Zielansichten gelesen; die App prueft teils noch das alte Drei-Plaetze-Modell. Nach G-617 live gibt es in der Datenbank keine Platzgrenze mehr fuer Messziele - die App muss mitziehen.

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-618: Reiter Goals trennt Steuerung und Messziele, Messziel mit Uebung
    Bereich: apps/web/src/lib/goals, apps/web/src/app/v2/goals
    Fremd:   supabase/_pipeline/ (Codex, G-622 laeuft). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08

Block im Chat 08.10. Datengrundlage G-617 (Commit fb115173).
