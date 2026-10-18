---
nr: G-669
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-18
agent: codex
beauftragt: 2026-10-18
erledigt: 2026-10-18
commit: 07f91713

braucht: []
kind_von: G-648

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/PhaseEngine.dc.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
---
# "Als nächstes" ohne Datum, Dauer und Grund

## Befund

`[read]` Entwurf: "Empfohlen ab 18.12.26: Mini Cut 4 Wochen. Grund: Körperfett steigt im Überschuss auf ~17 %. Übernehmen = Phase im Plan ergänzen." App: nur eine Liste der möglichen Programme, weil die Kette kein Datum, keine Dauer und keinen Grund liefert.

## Was zu tun ist (Codex)

- Ein Leser für die Empfehlung nach der laufenden Phase: Startdatum (Ende der laufenden Position), Programm, Dauer und Grund aus den vorhandenen Regeln (Wachen, Übergangsregeln).
- Ohne Regel keine Empfehlung, also nichts raten.

## Auftrag - Kopf

    AUFTRAG FUER codex - Goals-Rest aus der Abnahme (Sammelauftrag 18.10.: G-667/668/669/670/646/525)
    Bereich: supabase/_pipeline/ (Kette, Testdaten), Live dev nach A-105
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD 4f45fd2d


## Abnahme - 2026-10-18 (Orchestrator, commit 07f91713)

`[cmd]` goals.goal_als_naechstes(Lean Bulk) als dev: leer. Der Leser steht. Ohne gespeicherte Empfehlung und ohne belegte Regel erzeugt er nichts. Was der Entwurf dann zeigt, regelt G-677.

Gate gruen beim Commit; Sicherung vorher 5.076.337 / nachher 5.088.755 Byte.
