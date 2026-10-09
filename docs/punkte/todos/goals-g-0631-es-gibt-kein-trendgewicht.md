---
nr: G-631
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-08

braucht: []
kind_von: G-628

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/punkte/erledigt/goals-g-0628-ziel-setzen-nach-dem-entwurf.md

beruehrt:
  tabellen: []
  dateien: []
---

# Es gibt kein Trendgewicht

## Befund

`[read]` Claude Code, G-628 Teil 2: Ein Trendgewicht gibt es weder als Funktion noch als Spalte noch in der App. „Ziel setzen“ nimmt die letzte Messung als Startwert und nennt die Quelle („letzte Messung am …“ bzw. „kein Trendwert vorhanden“).

Der Entwurf (Dossier 8.x) rechnet Start und Tempo vom Trendgewicht aus. Eine einzelne Messung schwankt um Wasser und Salz, das verzerrt Startwert, Tempo und die Prüfungen aus G-626.

## Was zu tun ist (Codex)

Eine Trendfunktion in der Kette (z. B. gleitender oder exponentiell geglätteter Mittelwert über `body`-Messungen, mit Mindestanzahl Messungen und Fallback auf die letzte Messung), die zurückgibt, welche Quelle sie benutzt hat. Die Formel legt Codex vor; Tom entscheidet vor dem Bau. Danach liest Claude Code sie in „Ziel setzen“ und Fortschritt.
