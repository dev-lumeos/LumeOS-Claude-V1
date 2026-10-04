---
nr: G-601
typ: fehler
modul: recovery
schwere: mittel
angelegt: 2026-10-04
agent: claudecode
beauftragt: 2026-10-04
erledigt: 2026-10-04
commit: 824d6ad4

braucht: [G-598]
kind_von: G-598

quellen:
  - docs/punkte/erledigt/recovery-g-0598-der-entwurf-steht-noch-an-drei-stellen.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/recovery/ansicht.tsx
---

# „Nicht geladen" steht da, wo die Daten nur leer sind

## Auftrag — Kopf

    AUFTRAG FUER Claude Code - G-601: leer und nicht geladen sind zwei
                                     Zustaende
    Bereich: apps/web/src/app/v2/recovery/  apps/web/src/lib/recovery/
    Fremd:   supabase/ gehoert Codex. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-04

## Der Befund — aus deinem G-598-Bericht

`[read]` **`ansicht.tsx:508`:** die Kachel „Today's modalities" titelt
„Nicht geladen", wenn test-user einfach keine Zeilen hat; der Untertitel
sagt „kam leer zurueck". **`ansicht.tsx:428` (Erholungswert) hat dieselbe
Form.** Das ist die Vermischung, die G-553 beseitigen sollte, und die
G-598 fuer die Protokolle schon richtig gemacht hat.

## Was zu tun ist

Beide Stellen unterscheiden drei Zustaende wie die Protokollkachel:
**Ladefehler** („Nicht geladen: …"), **leer** (benannter Leerhinweis),
**Daten**. Danach kein weiterer Ort in `v2/recovery/`, der „Nicht geladen"
fuer ein leeres Ergebnis sagt — suchen und Zahl nennen.

## Nachweise

Gerenderte Probe je Zustand und Stelle (`renderToStaticMarkup`), Sabotage
in beide Richtungen, am Schirm auf test-user der Leerzustand. Gate gruen
(Tests ungecacht). Kein Commit, Dev-Server nicht selbst starten.

## Abnahme — 2026-10-04, Commit `824d6ad4`

`[cmd]` Gate gruen, Tests ungecacht: `web:test # tests 2641`, `# fail 0`
(2635 + 6). Vier Stellen statt der zwei im Auftrag — HRV und Sleep in
`tab-messwerte.tsx` hatten dieselbe Form; eine gemeinsame Kachel
`lade-hinweis.tsx` statt vier Abschriften.
