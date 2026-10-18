---
nr: G-667
typ: befund
modul: goals
schwere: mittel
angelegt: 2026-10-18
agent: codex
beauftragt: 2026-10-18

braucht: []
kind_von: G-648

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
---
# Kraft-Messpunkte je Satz statt je Einheit

## Befund

`[read]` Claude Code (Abnahme 18.10.): `measurement_points` liefert für Kraftziele einen Punkt je Satz. Mehrere Sätze am selben Tag erzeugen Sprünge in der Kurve. Der Entwurf zeigt einen Punkt je Einheit.

## Was zu tun ist (Codex)

- Einen Punkt je Einheit und Tag liefern: den besten Wert nach der Messart (1RM/Wdh.).
- Quelle: die Einheit.
- Probe mit zwei Sätzen am selben Tag, Sabotage wird rot.

## Auftrag - Kopf

    AUFTRAG FUER codex - Goals-Rest aus der Abnahme (Sammelauftrag 18.10.: G-667/668/669/670/646/525)
    Bereich: supabase/_pipeline/ (Kette, Testdaten), Live dev nach A-105
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD 4f45fd2d

