---
nr: C-536
typ: fehler
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: G-444
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - docs/ssot/93-trainingssitzungen.md
zahlen:
  gemessen: 2026-09-08
---

# C-536 - drei Abwesenheitsaussagen sind ueberholt

## Befund

`[cmd]` **Der Abwesenheitswaechter ist seit Tagen rot und
blockiert `pnpm gate`:**

    apps/web/src/app/v2/training/modale.tsx:202
      "training.routines" steht in der Pipeline
    docs/ssot/93-trainingssitzungen.md:66
      "training.routine_exercises" steht in der Pipeline
    docs/ssot/93-trainingssitzungen.md:67
      "training.routine_schedule_days" steht in der Pipeline

`[cmd]` **Selbst nachgemessen: ALLE DREI Tabellen existieren.**

`[read]` **Nicht die Daten sind falsch, die AUSSAGE ist es** ?
**dieselbe Klasse wie C-533, wo der Sollstand falsch war und
nicht die Rechte.**

`[cmd]` **Jeder Codex-Bericht nennt sie seit Tagen als
*,,bekannt"*** ? **ein Waechter, der immer rot ist, beweist
nichts mehr.**

## Was zu tun ist

> Der Waechter selbst: *,,Die Aussage nachfuehren, dann die
Marke entfernen oder umschreiben."*

`[read]` **Die Aussagen stammen aus der Zeit vor C-461** ?
**lies, was sie behaupten, und schreib hin, was gilt.**

`[cmd]` **Eine der drei liegt in `apps/`** ? **`modale.tsx:202`
ist ein Kommentar, kein Code. MISS es, bevor du ihn
anfasst** ? **Claude Code arbeitet dort.**

## Abnahmebedingungen

    A1  je Aussage: was behauptet sie, was gilt?
    A2  nachgefuehrt, nicht geloescht.
    A3  der Abwesenheitswaechter ist gruen.
    A4  Gegenprobe: eine erfundene Abwesenheit wird
        weiter rot.
    A5  wenn eine Aussage in apps/ liegt: mit Claude
        Code abgestimmt oder GEMELDET.
