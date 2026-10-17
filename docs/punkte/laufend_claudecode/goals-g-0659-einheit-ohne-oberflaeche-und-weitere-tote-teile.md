---
nr: G-659
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-17
agent: claudecode
beauftragt: 2026-10-17

braucht: []
kind_von: G-656

quellen:
  - apps/web/src/app/v2/goals

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---
# Einheit ohne Oberfläche und weitere Teile ohne Aufrufer

## Befund

`[read]` Claude Code (17.10.): Nach G-656 haben diese Teile keinen Aufrufer mehr:
- EinheitenSchalter, inEinheit/ausEinheit
- große Teile von editor-rechnungen.ts
- einheitSetzenAktion/speichereEinheit
- phasenOverrideAktion/phasenOverrideSetzen
- phaseStartenAktion

Die Werte, die sie schreiben, werden weiter gelesen. Die Einheit (kg/lb) lässt sich in der Oberfläche nicht mehr einstellen.

## Was zu tun ist (Claude Code)

- **Einheit:** Die Wahl gehört in die Einstellungen, weil sie für die ganze App gilt und nicht nur für Goals. Dort mit dem vorhandenen Schreibweg anbinden. Hat Settings dafür keinen Ort, melden.
- **Der Rest ohne Aufrufer:** wie in G-656 vorgehen. Aufrufer belegen, löschen, gültige Regeln umziehen. Das Löschen führt der Orchestrator aus, falls die Sperre greift.
- Das Gate bleibt grün.

## Auftrag - Kopf

    AUFTRAG FUER claudecode - G-659 Einheit in Settings, Teile ohne Aufrufer, Konsolenfehler
    Bereich: apps/web
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-17, HEAD 52b3f1bf

