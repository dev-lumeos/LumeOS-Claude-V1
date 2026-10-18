---
nr: G-646
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-16

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
