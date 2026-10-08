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

