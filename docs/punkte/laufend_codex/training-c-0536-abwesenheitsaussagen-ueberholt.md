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
    - apps/web/src/app/v2/training/modale.tsx
    - docs/ssot/93-trainingssitzungen.md
zahlen:
  gemessen: 2026-09-23
---

# C-536 - drei Abwesenheitsaussagen sind ueberholt

## Befund

Alle drei Tabellen existieren seit C-461. Falsch waren nicht die Daten,
sondern die Aussagen, die ihr Fehlen weiter als Begrundung verwendeten.

| Ort | Alte Aussage | Gemessener Ist-Zustand | Nachfuehrung |
|---|---|---|---|
| `training/modale.tsx` | `training.routines` fehle | Tabelle existiert | Der deaktivierte Knopf nennt jetzt wahr: Der Schreibweg dieses Editors ist noch nicht angebunden. |
| `93-trainingssitzungen.md` | `routine_exercises` fehle | Tabelle existiert | C-461 als Nachtrag von Routinen und Uebungen dokumentiert. |
| `93-trainingssitzungen.md` | `routine_schedule_days` fehle | Tabelle existiert | C-461 als Nachtrag des Wochenbezugs dokumentiert. |

Der App-Eingriff wurde vorher gegen den Arbeitsbaum gemessen: `training/modale.tsx`
war unveraendert; G-488 aendert `nutrition/plans-echt.tsx`, nicht diese Datei.
Der Eingriff beschraenkt sich auf Kommentar und Sperrgrund; kein Funktionscode
wurde veraendert.

## Ergebnis

`node tools/abwesenheit-pruefen.mjs` ist gruen: 19 markierte Aussagen
gelten noch.

Die Gegenprobe ist gefuehrt: Eine temporaer in `docs/ssot/93-trainingssitzungen.md`
gesetzte erfundene Marke `@abwesend training.routines` liess den Waechter mit
genau diesem Ort und einer geendeten Abwesenheit fehlschlagen. Die Marke wurde
anschliessend wieder entfernt.

## Abnahmebedingungen

    A1  je Aussage: was behauptet sie, was gilt? -- Tabelle oben.
    A2  nachgefuehrt, nicht geloescht. -- erfuellt.
    A3  der Abwesenheitswaechter ist gruen. -- erfuellt.
    A4  Gegenprobe: eine erfundene Abwesenheit wird weiter rot. -- erfuellt.
    A5  App-Kollision gemessen: G-488 beruehrt eine andere Datei. -- erfuellt.
