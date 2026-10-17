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

## Stand 2026-10-17, Commits `bf1a6826` und `a7366d89`

`[read]` Claude Code: Die Einheit ist keine kg/lb-Wahl, sondern die Einheit der Zielrate: % pro Woche oder kcal pro Tag (E-83, `goals.zielrate_einheit`). Settings hat keinen Ort dafür, und der Planer liest die Einheit nicht.
`[cmd]` Konsolenfehler data-mode behoben. Laut Claude Code steht er auf drei Routen jetzt 1 → 0.
`[cmd]` phaseStarten-, Override- und Phasenstart-Aktionen entfernt. Gate grün bei `bf1a6826`.
`[cmd]` `editor-rechnungen.ts` hat Tom gelöscht (`a7366d89`). Danach habe ich `tsc --noEmit` im Web laufen lassen, ohne Fehler.

## Entschieden - Tom 2026-10-17 11:25: Variante b

Die Zielrate bleibt in Prozent, wie im Entwurf. Die Wahl aus E-83 (%/kcal) fällt weg: Schalter, Umrechnung, Schreibweg und das Lesen in page.tsx. Die Einträge in `user_display_preferences` lässt Claude Code stehen, sie werden nicht mehr gelesen. Dazu kommt `gesamtdauer` in anker.ts, das keinen Aufrufer hat.

