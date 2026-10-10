---
nr: G-631
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-10

braucht: []
kind_von: G-628

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/punkte/erledigt/goals-g-0628-ziel-setzen-nach-dem-entwurf.md

beruehrt:
  tabellen: []
  dateien: []
---

# Es gibt kein Trendgewicht

## Befund

`[read]` Claude Code, G-628 Teil 2: Ein Trendgewicht gibt es weder als Funktion noch als Spalte noch in der App. „Ziel setzen“ nimmt die letzte Messung als Startwert und nennt die Quelle („letzte Messung am …“ bzw. „kein Trendwert vorhanden“).

Der Entwurf (Dossier 8.x) rechnet Start und Tempo vom Trendgewicht aus. Eine einzelne Messung schwankt um Wasser und Salz, das verzerrt Startwert, Tempo und die Prüfungen aus G-626.

## Was zu tun ist (Codex)

Eine Trendfunktion in der Kette (z. B. gleitender oder exponentiell geglätteter Mittelwert über `body`-Messungen, mit Mindestanzahl Messungen und Fallback auf die letzte Messung), die zurückgibt, welche Quelle sie benutzt hat. Die Formel legt Codex vor; Tom entscheidet vor dem Bau. Danach liest Claude Code sie in „Ziel setzen“ und Fortschritt.


## Vorschlag Codex - 2026-10-09

`[read]` Gemessen bis 09.10.:
- dev: 143 Messungen an 143 Tagen, ohne Lücke. Mittlere Tagesänderung 0,131 kg, Median 0,090 kg, 95. Perzentil 0,320 kg.
- tom.seed: identische Reihe.
- test-user: 1 Messung am 19.05.

Kandidaten:
- EMA mit α = 0,25. Mindestens 4 Messungen in 14 Tagen, bei Lücken gilt α_k = 1 − 0,75^k.
- 7-Tage-Mittel. Mindestens 3 Messtage.
- 14-Tage-Regression. Mindestens 5 Messungen über mindestens 7 Tage.

Rückfall für alle drei: die letzte Messung mit Datum, ausdrücklich gekennzeichnet, wenn zu wenige Daten vorliegen oder seit mehr als 7 Tagen keine Messung kam.

Auf dev am 09.10.: Messung 84,75, EMA 84,709, 7-Tage-Mittel 84,716, Regression 84,724.

Empfehlung: EMA mit α = 0,25 und ausgewiesener Quelle (`trend_ema` | `letzte_messung`), Datum und Anzahl der Messungen. Entscheidung Tom offen.

## Entschieden - 2026-10-10 07:34, Tom

EMA mit alpha = 0,25 (Vorschlag Codex), Quelle ausgewiesen (trend_ema | letzte_messung), Datum und Anzahl Messungen.

## Auftrag - Kopf

    AUFTRAG FUER Codex - dev Lean Bulk B (live) + G-631 Trendgewicht EMA (Kette)
    Bereich: Teil A Live-Daten dev (Freigabe Tom), Teil B supabase/_pipeline/
    Fremd:   apps/, packages/, tools/. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-10, HEAD 2e9e2906
