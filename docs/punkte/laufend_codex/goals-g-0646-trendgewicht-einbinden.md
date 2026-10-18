---
nr: G-646
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-16
agent: codex
beauftragt: 2026-10-18

braucht: [G-631]
kind_von: G-631

quellen:
  - supabase/_pipeline/11_goals/631_trendgewicht_ema.sql

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
    - apps/web/src/lib/goals
---

# Trendgewicht einbinden

## Was zu tun ist

`goals.trendgewicht_am` ist seit 16.10. live, aber noch nicht eingebunden.
- Codex: Startwert für Körperziele (Gewicht) und `ziel_grenzen_pruefen`/Wächter nehmen den Trend statt der letzten Messung, Quelle mitliefern.
- Claude Code: "Ziel setzen", Steuerungskarte und Messziel-Vorschau zeigen "Trend 84,7 kg (aus n Messungen)" bzw. "letzte Messung am …".

## Bestandsprüfung - 2026-10-18 (Codex)

`[read]` Fehlt noch im Startwert-Leser: Der dev-Trend ist 84,762 kg, die Vorschau zeigt weiterhin die Rohmessung 84,73 kg.

## Auftrag - Kopf

    AUFTRAG FUER codex - Goals-Rest aus der Abnahme (Sammelauftrag 18.10.: G-667/668/669/670/646/525)
    Bereich: supabase/_pipeline/ (Kette, Testdaten), Live dev nach A-105
    Fremd:   docs/ gehoert dem Orchestrator.
    Stand:   2026-10-18, HEAD 4f45fd2d

