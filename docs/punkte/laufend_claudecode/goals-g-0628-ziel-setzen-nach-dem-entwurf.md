---
nr: G-628
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-08
agent: claudecode
beauftragt: 2026-10-08

braucht: [G-626, G-617]
kind_von: G-610

quellen:
  - docs/spezifikation/goals-ziel-setzen/README.md
  - docs/spezifikation/goals-ziel-setzen/dossier.html

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals
    - apps/web/src/lib/goals
---

# Ziel setzen nach dem Entwurf

## Entschieden

`[read]` Tom 08.10.2026 12:16: „dieser stand ist fuer mich vertretbar kannst umsetzen“. Vorlage: `docs/spezifikation/goals-ziel-setzen/` (Dossier Kapitel 8/9 gilt vor dem Entwurf).

Vorlage: `entwurf/ZielSetzen.dc.html` und `entwurf/MesszielSetzen.dc.html`, Dossier 8.1–8.3. Ersetzt das heutige Modal „New goal“ vollständig. Nimmt G-619 auf (Tempo nur in %: entfällt, Eigene Werte ersetzen das).

## Auftrag - Kopf

    AUFTRAG FUER Claude Code - G-628: Ziel setzen nach dem Entwurf
    Bereich: apps/web/src/app/v2/goals, apps/web/src/lib/goals
    Fremd:   supabase/_pipeline/ (Codex). docs/ gehoert dem Orchestrator.
    Stand:   2026-10-08


## Teil 1 committet - 2026-10-08, Commit `3ddd99ac`

`[cmd]` 15 Dateien nur apps/web (ziel-setzen.tsx, zielrechnung.ts, g628-Test neu); keine Grenzwerte im Code (rg auf 18,5/17,5/0,75/1500/1200 leer); test-user zurückgebaut (Grad pro, 2 Ziele, 2 Phasen, keine Messung von heute). Gate grün, web 2733.

`[read]` Claude Code: Schirm beginner/advanced/pro wie Entwurf; Ziel angelegt und zurückgebaut. Offen in Teil 1: „später starten“ fehlt; Startwert = letzte Messung statt Trend; „beenden“ setzt `abandoned` (Anzeige „abgebrochen“) – Frage an Tom. Bis Teil 3 lassen sich in der App keine Messziele anlegen.

Teil 2 (Prüfungen aus G-626) ist frei: G-626 steht in der Kette (`11cb4e44`).


## Teil 2 committet - 2026-10-08, Commit `f48d8b0f`

`[cmd]` 11 Dateien nur `apps/web/src/app/v2/goals` und `apps/web/src/lib/goals`. Neu: `zielpruefung.ts`, `zielpruefung-read.ts`, `g628-pruefung.test.ts`. Kein Grenzwert im Code: einziger Treffer `ziel-setzen.tsx:193` ist eine Rundung. Gate grün.

`[read]` Claude Code: Die Prüfung ruft `goals.ziel_grenzen_pruefen` mit den Eingaben des Wächters (Profil, `tdee_basis_am`). Sperre rot mit „frei ab“, Warnung mit Pflicht-Haken, Weiter erst ohne Sperre. Bestätigte Schlüssel gehen als `g626_confirmed_warnings` bis `goal_phase_start`. „Später starten“ ist gebaut (Startdatum = `gueltig_ab`), die Startquelle ist genannt. g628-pruefung 19 Tests, Sabotage 10/10 rot, web 2752.

Offen bis Live (613/617/622/626): Schirmnachweis mit echten Befunden, „frei ab“, Haken, Abweisung durch den Wächter. Trendgewicht fehlt: G-631. Texte ohne Umlaute: G-632.


## Teil 2 Schirm + Teil 3 frei - 2026-10-08

Live seit 15:51: 613/617/617-Erweiterung/622/626 (G-613, G-617, G-622, G-626, G-632 abgenommen). Teil 3 = Weg B "Messziel setzen" nach `entwurf/MesszielSetzen.dc.html` und Dossier 8.2, gegen `617_measurement_goal_expansion.sql`.

## Entschieden - 2026-10-08 15:57, Tom: beenden

Kein neuer Status. `abandoned` heisst in der Anzeige "beendet" statt "abgebrochen" (Liste, Details, Verlauf).
