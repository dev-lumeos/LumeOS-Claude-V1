---
nr: A-103
typ: fehler
modul: quer
schwere: niedrig
angelegt: 2026-10-05
agent: claudecode
beauftragt: 2026-10-05
erledigt: 2026-10-06
commit: dbb76215

braucht: [A-102]
kind_von: A-102

quellen:
  - docs/punkte/erledigt/quer-a-0102-verdrahtung-pruefen-ist-rot-und-steht-nicht-im-gate.md

beruehrt:
  tabellen: []
  dateien:
    - tools/verdrahtung-pruefen.mjs
---

# verdrahtung-pruefen sieht coach und packages nicht

## Befund

`[read]` Claude Code, Bericht A-102: `tools/verdrahtung-pruefen.mjs` liest
nur `apps/web/src`. `apps/coach` und `packages/` verdrahten ebenfalls
Tabellen und RPCs und sind unbewacht. `[annahme]` Erweitern bringt neue
unbewachte Namen.

## Was zu tun ist

Lesebereich auf `apps/coach/src` und `packages/*/src` erweitern, neue
Namen messen und einordnen wie in A-102, Restbestand einfrieren, Gate
gruen, Sabotage je Bereich.

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - A-103: verdrahtung-pruefen liest alle Apps
    Bereich: tools/, apps/, packages/
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-05

Nachweise: neue Namen je Bereich als Tabelle (Name, Datei, Einordnung),
Restbestand eingefroren wie in A-102, Sabotage je Bereich (coach,
packages), Gate gruen mit Testzahl. Kein Commit.

## Abnahme - 2026-10-06, Commit `dbb76215`

`[cmd]` **Diff:** nur `tools/verdrahtung-pruefen.mjs`, sucht jetzt in jedem
`apps/*/src` und `packages/*/src`. Gate gruen, `[verdrahtung] gruen` im
Log, web 2659.

`[read]` Neu: coach 21 Namen (6 nur dort, alle schon im Test), admin 1
(`curation_overview`, Test fehlt, eingefroren), packages 0. Drei Eintraege
veraltet - standen in einem Coach-Test, den die Pruefung bisher nicht las.
Soll 49 -> 47 Namen. Sabotage coach/packages/admin rot; die HEAD-Fassung
bleibt mit derselben Coach-Sabotage gruen - erst die Erweiterung sieht.
Wiederanlauf nach Freeze: Zwischenstand geprueft und uebernommen.
