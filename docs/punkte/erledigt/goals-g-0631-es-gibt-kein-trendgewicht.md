---
nr: G-631
typ: aufgabe
modul: goals
schwere: mittel
angelegt: 2026-10-08
agent: codex
beauftragt: 2026-10-10
erledigt: 2026-10-16
commit: 660cc131

braucht: []
kind_von: G-628

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/punkte/erledigt/goals-g-0628-ziel-setzen-nach-dem-entwurf.md

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals/631_trendgewicht_ema.sql
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


## Kette committet - 2026-10-10, Commit `660cc131` (nicht live, nicht eingebunden)

`[cmd]` 3 Dateien nur Kette, neu `631_trendgewicht_ema.sql` und die Probe. Gate grün.

`[read]` Codex: Probe 6/6. Ergebnisse: dev 09.10. = 84,709; Lückenfall 84,533; Rückfall bei 3 Messtagen und bei veralteten Daten; fremde Daten ausgeschlossen. Sabotage 2 rot. Kette 393 Schritte grün.

Offen: live einspielen (mit dem nächsten Paket). Einbinden in Startwert, `ziel_grenzen_pruefen` und die App wird ein eigener Schritt, wenn die App mitzieht.

## Live - 2026-10-16, Codex (Paket 611 → 638 → 631 → 642)

`[cmd]` Orchestrator nachgemessen: Die Funktionen `trendgewicht_am`, `g638_plan_resume_preflight`, `goal_delete` und `goal_list_at` sind live. Sicherung `backup/a105-paket-g611-nachher2.sql` hat 1.420.942 Byte.

`[read]` Codex:
- goal_list_at: 8 Ziele eingefroren, wie im korrigierten Soll.
- dev: kein Hindernis, 2.714 kcal.
- test-user: Ziele und Pläne konsistent, 0 Widersprüche.
- trendgewicht_am: dev `trend_ema` 84,739, test-user `letzte_messung` 81,40.
- goal_delete: ohne Verlauf gelöscht, mit Verlauf `G611_CONFIRM`.
- Rollen unverändert.
- G-642 per Hex C3 9C …
- Gate 18/18 grün, web 2844.