---
nr: G-649
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-16
agent: claudecode
beauftragt: 2026-10-16

braucht: []
kind_von: G-618

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
---
# Phase Engine weicht vom freigegebenen Entwurf ab

## Befund

`[read]` Tom 2026-10-16: "neuer plan sehe ich nur in Phase engine und auch da sehe ich nichts das wie die vorgabe aussieht".

`[cmd]` Vergleich `entwurf/PhaseEngine.dc.html` mit `backup/orch-stand-phase.png`. In der App fehlen:
- Planliste als Tabelle (Phase, Wochen, Beginn, Ende, Defizit/Überschuss, Cardio, Status)
- "Wachen der aktuellen Phase" und "Als nächstes"
- Tabelle der wöchentlichen Anpassung
- Bearbeiten im Plan mit Terminen und Phasenliste (Programmwahl einschliesslich early/mid/late und Eigene Werte)
- "Neuer Plan" als Dialog (Name, Ausgangspunkt)
- Aktivieren mit Coach-Freigabe
- Vorlagen

Statt der Tabelle gibt es nur einen Zeitbalken. Darunter stehen die alten Phasen-Bauteile.

## Was zu tun ist

Claude Code baut die Seite nach `PhaseEngine.dc.html` um, Abnahme wie G-648 mit Bildpaar je Abschnitt. Was die Kette nicht liefert (G-644), bleibt sichtbar als "kommt".
## Auftrag - Kopf

    AUFTRAG FUER claudecode - G-648 + G-649: Goals und Phase Engine 1:1 nach Entwurf
    Bereich: siehe Auftrag im Chat 16.10.
    Fremd:   siehe Auftrag. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-16, HEAD 19435919
