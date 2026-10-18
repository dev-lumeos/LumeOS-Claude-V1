---
nr: G-649
typ: fehler
modul: goals
schwere: hoch
angelegt: 2026-10-16
agent: claudecode
beauftragt: 2026-10-16
erledigt: 2026-10-18
commit: d19da5b5

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

## Nachtrag Tom 16.10. 15:32

- "Bearbeiten" steht unter dem jeweiligen Plan, nicht als Aktion unten an der Seite. So zeigt es PhaseEngine.dc.html (edit je Plan).
- Die Seite muss wie der Entwurf aussehen. Die Abnahme läuft über Bildpaare.
- Die Seed-Pläne kommen aus G-652 (Codex).

## Stand 16.10. 16:45, Commit `62cf1bfb` (Gate grün, nicht abgenommen)

`[read]` Laut Claude Code entsprechen Kopf, Phasentabelle, Bearbeiten je Plan, Neuer Plan und Vorlagen dem Entwurf.
`[read]` Bild `g649-ist-dev-seite.png` (vor G-652):
- Unter dem aktiven Plan stehen weiterhin die alten G-645-Bauteile: Laufende Phase, Phase beenden, Wechselvorschlag, Ziele und ihre Zeitfenster. Im Entwurf gibt es sie nicht.
- Cardio steht auf "–", im Entwurf auf "1×".

Entscheidung (Entwurf ist verbindlich): Die alten Bauteile fallen weg. Hängt an einem davon eine Funktion, die im Entwurf woanders liegt (z. B. Phase beenden → Bearbeiten), dann dorthin verschieben, sonst melden.

## Feinschliff - 2026-10-16, Commit `0a960089` (Gate grün)

`[read]` Claude Code:
- Unter dem aktiven Plan stehen 0 alte Bauteile.
- Phase beenden liegt jetzt im Bearbeiten-Panel.
- Der Wechselvorschlag steht unter "Als nächstes".
- Cardio bleibt "–", weil `goal_strategies.cardio_pro_woche` in allen 22 Zeilen NULL ist (laut Spaltenkommentar gewollt).

Noch offen:
- Segmentbalken nach Programm färben, wie im Entwurf
- Plantyp, Neu starten, Löschen anbinden (G-644 Teil 2 ist jetzt live)
- Chip "Termin gehalten / erreicht" braucht ein Feld (G-655)
