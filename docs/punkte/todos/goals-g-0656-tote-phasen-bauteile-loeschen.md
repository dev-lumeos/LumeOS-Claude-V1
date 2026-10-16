---
nr: G-656
typ: aufgabe
modul: goals
schwere: niedrig
angelegt: 2026-10-16

braucht: []
kind_von: G-649

quellen:
  - apps/web/src/app/v2/goals/phase-echt.tsx

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---
# Tote Phasen-Bauteile nach G-649 löschen

## Befund

`[read]` Claude Code (16.10.): Diese Teile haben keinen Aufrufer mehr:
- 4 Dateien mit 1.678 Zeilen: phase-echt.tsx, phasen-zeitachse.tsx, phasen-editor-echt.tsx sowie PhaseBeenden/PhaseVorschlag in phase-setzen.tsx
- die Abfrage ladeProgrammwochen
- vorschlagBeantwortenAktion

Davon sind 12 Testdateien betroffen.

## Was zu tun ist (Claude Code)

- Ohne Aufrufer: löschen, Aufrufer zuvor mit `rg` belegen.
- Tests: Prüft ein Test eine Regel, die weiter gilt, wird er auf den neuen Ort umgezogen. Gilt die Regel nicht mehr, fällt er weg, mit Begründung.
- Das Gate bleibt grün.
