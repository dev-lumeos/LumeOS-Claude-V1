---
nr: G-628
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-08
agent: claudecode
beauftragt: 2026-10-08

braucht: [G-626, G-617]
kind_von: G-610

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
    - apps/web/src/lib/goals
---

# Ziel setzen nach dem Entwurf

## Entschieden

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Vorlage: `entwurf/ZielSetzen.dc.html` und `entwurf/MesszielSetzen.dc.html`, Dossier 8.1–8.3. Ersetzt das heutige Modal „New goal“ vollständig. Nimmt G-619 auf (Tempo nur in %: entfällt, Eigene Werte ersetzen das).

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-628: Ziel setzen nach dem Entwurf
    Bereich: apps/web/src/app/v2/goals, apps/web/src/lib/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08


## Teil 1 committet - 2026-10-08, Commit `3ddd99ac`

`[cmd]` 15 Dateien nur apps/web (ziel-setzen.tsx, zielrechnung.ts, g628-Test neu); keine Grenzwerte im Code (rg auf 18,5/17,5/0,75/1500/1200 leer); test-user zurückgebaut (Grad pro, 2 Ziele, 2 Phasen, keine Messung von heute). Gate grün, web 2733.

`[read]` Claude Code: Schirm beginner/advanced/pro wie Entwurf; Ziel angelegt und zurückgebaut. Offen in Teil 1: „später starten“ fehlt; Startwert = letzte Messung statt Trend; „beenden“ setzt `abandoned` (Anzeige „abgebrochen“) – Frage an Tom. Bis Teil 3 lassen sich in der App keine Messziele anlegen.

Teil 2 (Prüfungen aus G-626) ist frei: G-626 steht in der Kette (`11cb4e44`).
