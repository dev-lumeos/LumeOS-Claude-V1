---
nr: G-629
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-08
agent: claudecode
beauftragt: 2026-10-10

braucht: [G-625, G-626]
kind_von: G-615

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---

# Die Phase engine zeigt Pläne

## Entschieden - 2026-10-08 11:59 und 12:11, Tom

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Vorlage: `entwurf/PhaseEngine.dc.html`, Dossier 8.7. Ganze Seite ab Pro, darunter gesperrt mit Hinweis. Aktiver Plan (Zeitachse, Details, Bearbeiten mit Terminen, Phasen, Werten des Programms bzw. editierbaren eigenen Werten), + Neuer Plan, Weitere Pläne (Aktivieren mit Rückfrage und Zweiwege-Bestätigung), Abgeschlossene Pläne, Vorlagen. Nimmt G-623 (Phase verschieben) und G-624 (Vorschau Custom/Expert) auf.



## Ergänzt - 2026-10-10

`[read]` Claude Code, G-640: `phasen-zeitachse.tsx` (Phase Engine) rechnet die Lage noch selbst mit `berechnePace`. Mit dem Umbau auf die Kette umstellen.


## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-629: Phase Engine als Planer
    Bereich: apps/web/src/app/v2/goals, apps/web/src/lib/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-10, HEAD 00e7aea6
