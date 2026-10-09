---
nr: G-628
typ: aufgabe
modul: goals
schwere: hoch
angelegt: 2026-10-08
agent: claudecode
beauftragt: 2026-10-08
erledigt: 2026-10-09
commit: ef94fc37

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


## Teil 2 Schirm + Teil 3 committet - 2026-10-08, Commit `6240bcd1`

`[cmd]` 11 Dateien nur apps/web goals. Neu messziel-setzen.tsx, messziel.ts, messziel-io.ts (Anlegen nur per RPC `measurement_goal_create`, danach Rücklesen), g628-messziel.test.ts. Kein Grenzwert im Code. Gate grün, web 2771. test-user nachgemessen: G-559 Abbauziel active/controlling/Prio 1/primär/1 Phase, Aufbauziel on_hold; 0 Ziele mit "G-628" im Titel.

`[read]` Claude Code: Teil 2 am Schirm sauber/Warnung/Sperre ("Frei ab pro"), Wächter in DB und UI als Satz, Umlaute richtig; Fotos backup/g628-t2live-*.png. Teil 3: je Kategorie ein Messziel (Gewicht 81,4 kg; Bench 1RM 105,41 kg; Trainings/Woche 0; eigene Einheit 1,5 l), alle measurement/0 Phasen; KFA ohne Wert -> "Erst messen". Unterwegs behoben: Tempo-Rundung (vorgehen_zu_langsam), Ziel-Editor schickte unveränderte Felder (G626_BLOCK beim Reaktivieren).

Teil 4 (offen, Dossier 8.2): Messung direkt bei "erst messen", Vorschlag "Schnitt + 1" bei Gewohnheiten, Widerspruchshinweis (G-621), Anzeige "beendet". Startwert-Vorschau vor dem Anlegen: G-634. Zahlen mit Punkt in den G-626-Texten: G-633. Rohe Einheit/Quelle im Reiter: G-618.

## Teil 4 committet - 2026-10-09, Commit `ef94fc37` - erledigt

`[cmd]` 6 Dateien nur apps/web goals. Gate grün, web 2801. test-user nachgemessen: 0 Messziele, 1 Messung, Abbauziel active, Aufbauziel on_hold.

`[read]` Claude Code:
- Die Vorschau kommt aus `measurement_goal_start_preview` und wird nach jeder Eingabe neu gelesen.
- "Erst messen" führt über den vorhandenen Messweg zu "jetzt messen".
- Gewohnheiten bekommen den Vorschlag "Schnitt + 1".
- Der Widerspruchshinweis aus G-621 ist gelb und sperrt nicht. Die Richtung kommt aus der Phase des Steuerziels.
- In 6 von 6 Fällen war die Vorschau gleich dem festgehaltenen Startwert.
- 24 Tests, Gegenprobe 7/7 rot. Fotos `backup/g628-t4-*.png`.

Damit ist G-628 vollständig (Teil 1-4). Nebenbefund Farbmischung: G-641.