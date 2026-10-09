---
nr: G-618
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-07
agent: claudecode
beauftragt: 2026-10-08
erledigt: 2026-10-09
commit: afd814d3

braucht: [G-617]
kind_von: G-617

quellen:
  - docs/punkte/erledigt/goals-g-0617-ein-kraftziel-findet-seine-uebung-nur-ueber-den-titel.md

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

## Neu gefasst - 2026-10-08

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Vorlage: `entwurf/Main.dc.html`, Dossier 8.4–8.6: Steuerungskarte (mit Plan dahinter), Diese Woche, Module, Messziele als Kacheln wie im Mockup (Symbol, Status voraus/im Plan/hinterher, Modul-Pillen), Details ▾ und Bearbeiten ✎ mit Löschen je Ziel, Abgeschlossen. Wartet auf G-617 (erweitert) und G-611; Auftrag wird neu gestellt, der alte Kopf gilt nicht mehr.


## Erledigt - 2026-10-09, Commit `afd814d3` (mit G-636)

`[cmd]` 34 Dateien, nur `apps/web/src` und `tools/verdrahtung-pruefen.mjs`. Neu: `reiter-goals.tsx`, `reiter.ts`, `reiter-read.ts`, `g618-reiter.test.ts`. Entfernt: `ziel-karten.tsx` und `g591`. Gate grün, web 2795. test-user nachgemessen: Abbauziel aktiv, Prio 1, primär, Plan aktiv; Aufbauziel `on_hold`, Plan pausiert; 0 Messziele.

`[read]` Claude Code: Die Steuerungskarte hat vier Zustände (läuft, kein Ziel, pausiert, ohne laufende Phase). Weiter: Diese Woche, Module aus `goal_contributions` (fehlende Werte als "kommt"), Messziel-Kacheln mit Details und Bearbeiten, Abgeschlossen (erreicht/verfehlt/beendet). Das Drei-Plätze-Modell ist entfernt. G-636: Der Kopf zählt `phase_am`. 21 Tests, Gegenprobe 11/11 rot. Fotos `backup/g618-*.png` (12).

Rest: G-639. Plan wird beim Fortsetzen nicht aktiv: G-638.