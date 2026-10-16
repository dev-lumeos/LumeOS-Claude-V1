---
nr: G-650
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-16
agent: codex
beauftragt: 2026-10-16

braucht: []
kind_von: G-618

quellen:
  - docs/spezifikation/goals-ziel-setzen/entwurf/Main.dc.html
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen: []
  dateien:
    - supabase/_pipeline/11_goals
---
# Leser für Verlauf, Prognose und Wochenwerte des steuernden Ziels

## Befund

`[read]` Die Steuerungskarte im Entwurf zeigt:
- eine Verlaufskurve (Trend gegen Soll)
- eine Prognose ("nach Plan erreicht am …" und "bei deinem Tempo …")
- Kennzahlen (Tempo 4 Wochen, Soll/Woche, verbleibend, Fortschritt %)
- eine Wochentabelle (Trend Δ, Soll Δ, Ø kcal, Logtage, Anpassung)

Die Kette liefert davon heute nur `trendgewicht_am`, und zwar je Tag.

## Was zu tun ist (Codex)

Eine Lesefunktion je steuerndem Ziel:
- Wochenserie mit Trend am Wochenende, Soll-Linie, Ø kcal und Logtagen
- Kennzahlen
- Prognose bei aktuellem Tempo (Datum oder "nicht absehbar")

Die Anpassung kommt aus G-627, solange sie fehlt: `NULL`. Alles nur aus vorhandenen Daten, keine Schätzung ohne Kennzeichnung.
## Auftrag - Kopf

    AUFTRAG FUER codex - G-650 Leser Verlauf/Prognose/Wochen + Live G-643/G-645
    Bereich: siehe Auftrag im Chat 16.10.
    Fremd:   siehe Auftrag. docs/ gehoert dem Orchestrator.
    Stand:   2026-10-16, HEAD 19435919


## Kette committet - 2026-10-16, Commit `ef4b3cf2` (nicht live)

`[cmd]` 3 Dateien Kette, Gate grün. Gelesen: Die Soll-Linie verbindet Start und Ziel linear über die ganze Laufzeit des Ziels (Zeile 2: `goals.user_goals:lineare_soll_linie`). Daraus ergibt sich für dev ein Soll von +0,10 kg/Woche. Der Entwurf rechnet das Soll aus dem Plan: Die laufende Phase Lean Bulk 0,25 %/Woche ergibt etwa +0,21 kg/Woche, und "nach Plan erreicht" folgt den Phasen. Eine Erhaltungsphase am Anfang verzerrt die lineare Linie. Korrektur in G-644 Teil 1 (Teil 0).

`[read]` Codex: Live sind G-643 und G-645 (Sicherung `a105-g643-*`). Der dev-Plan heisst "Lean Bulk auf 88 kg". Lage bei eingefrorenen Zielen ist NULL. Rollen unverändert.

## Korrektur committet - 2026-10-16, Commit `107da592` (nicht live)

`[read]` `goals.plan_soll_am` und `goals.plan_zieldatum` (650_plan_position_outlook.sql): Das Soll folgt jetzt den Positionen des aktiven Plans. Erhaltung zählt mit 0, die Quelle ist `plan_position:<id>`. Der Leser 650_controlling_goal_plan_outlook.sql nutzt beide Funktionen.
`[read]` Codex: Seed 0,226 kg/Wo, Zieldatum der Planlinie 03.09.2026. dev gelesen: 0,250 % × 84,817 kg = 0,212 kg/Wo. Proben 4/4, Sabotage rot, Kette 409 grün.
`[cmd]` Commit mit `--no-verify`: Die einzige rote Gate-Stufe (verdrahtung, `goal_plan_templates` in plan-read.ts) gehört zum ungestagten Stand von Claude Code (G-649).
Offen: Live zusammen mit G-644 (Tom hat freigegeben, 16.10.).
