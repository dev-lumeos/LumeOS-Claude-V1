---
nr: G-679
typ: aufgabe
modul: plattform
schwere: mittel
angelegt: 2026-10-19

braucht: [G-675]
kind_von: G-676

quellen:
  - docs/punkte/erledigt/plattform-g-0676-papierkorb-ueber-alle-module.md

beruehrt:
  tabellen: []
  dateien:
    - docs/spezifikation
---
# Zentraler Papierkorb unter Einstellungen und Ausrollen in die übrigen Module

## Befund

`[read]` G-676 hat inventarisiert, wo Nutzer etwas löschen können, und die Mechanik festgelegt: `deleted_at` am Wurzelobjekt und eine restriktive Policy.
Goals und die Phase Engine kommen zuerst mit G-675.

Danach fehlen noch drei Dinge:
- die zentrale Seite unter Einstellungen
- ein "Rückgängig" für die Einzelbuchungen
- der Papierkorb für die Supplements-Stack-Position und den Medical-Befund-Anhang mit der Storage-Datei

`[read]` Heute löst das harte Löschen einer Stack-Position den Bezug von Einnahmen und Injektionslogs (SET NULL).

## Was zu tun ist

1. Orchestrator: die zentrale Seite im Entwurf, mit Filter nach Modul, "Wiederherstellen", "Endgültig löschen" und Konfliktmeldung.
2. Danach Aufträge je Modul an Codex (Kette) und Claude Code (UI und "Rückgängig").
