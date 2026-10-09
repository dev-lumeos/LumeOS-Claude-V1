# Goals: Ziel, Plan und Phase – das Modell nach G-610 bis G-637

**Stand:** 2026-10-09 · **Orchestrator** · **Zweig:** `dev`

Herkunftsmarker: `[cmd]` gemessen · `[read]` gelesen · `[annahme]` angenommen.

Vorlage: `docs/spezifikation/goals-ziel-setzen/` (README, Dossier Kap. 8/9, Entwurf). Freigabe Tom 2026-10-08 12:16.
Vorgänger: `130-goals-bauordnung.md`, `131-fachwissen-phasen-und-rechenwege.md`.

---

## 1. Zwei Rollen von Zielen

`[cmd]` `goals.user_goals.goal_role` ist `controlling` oder `measurement` (G-617).
- **Steuernd** ist ein Ziel genau dann, wenn es eine Phase oder einen Plan trägt (Tom 08.10. 08:18, Variante B). Trigger `a617_phase_role_sync` und `a617_program_role_sync` führen die Rolle nach.
- **Genau ein** steuerndes Ziel ist aktiv: `uq_user_goals_one_active_controlling`.
- Messende Ziele sind unbegrenzt. Sie haben keine Strategie, keine Phase und keine Wirkung auf Kalorien. Arten: Körper, Kraft (mit `exercise_id`), Gewohnheit, Eigenes (G-617 erweitert).
- Der Startwert eines Messziels kommt aus `measurement_goal_start_preview`. Der Snapshot-Trigger ruft dieselbe Funktion (G-634).
- Das alte Drei-Plätze-Modell ist weg, in der Datenbank (G-617) und in der App (G-618).

`[cmd]` Live am 09.10.: aktive Ziele steuernd 3, messend 3.

## 2. Plan = Inhalt des steuernden Ziels

`[cmd]` G-625:
- `goal_programs` hat einen Plan je Ziel (`UNIQUE(goal_id)`) und Status `entwurf/aktiv/pausiert/abgeschlossen`. Je Nutzer ist ein Plan aktiv (Unique-Index).
- `goal_program_positions` trägt entweder ein Katalogprogramm oder eigene Werte (CHECK auf genau eines davon). Eigene Werte gibt es ab Pro.
- Termine haben die Arten A, B, S und X.
- Eine laufende Position ändert sich atomar zusammen mit ihrer Phase ab einem Stichtag (`625_goal_plan_position_revision`).
- Backfill (Tom 08.10. 18:19, B): Alle Phasen eines Ziels werden zu Positionen in zeitlicher Reihenfolge, der Planstatus folgt dem Ziel. Eine Lücke ohne laufende Phase ist gültig.

`[cmd]` Live am 09.10.: 4 Pläne (3 aktiv, 1 pausiert), 6 Positionen.

Katalog (Tom 08.10. 17:40):
- `fat_percent` (Anteil an den kcal) und `refeeds` bleiben die Wahrheit.
- Fett g/kg, Cardio/Woche und Refeed/Woche sind im Katalog NULL. Diese Werte gelten nur für eigene Werte.

## 3. Grenzen nach Erfahrungsgrad

`[cmd]` G-626:
- Die Grenzen stehen als Daten in `goals.experience_goal_limits` (4 Zeilen).
- Die Prüfung `ziel_grenzen_pruefen(...)` liefert `(schluessel, art sperre|warnung, hinweis)`. Die Hinweise haben echte Umlaute (G-632) und Zahlen in deutscher Schreibweise (G-633).
- Wächter `g626_guard_controlling_phase` und `..._goal_update`: Bestätigte Warnungen stehen in `parameters.g626_confirmed_warnings`, die Fehler kommen als `G626_BLOCK:` / `G626_CONFIRM:`.
- Regel (Tom): Beginner sperrt alles, was vom Standard abweicht. Advanced öffnet stufenweise und warnt. Pro/Elite werden nur gewarnt.
- Ausnahme: Die **Folgerichtigkeit** der drei Grössen sperrt für alle Grade. Wer Programm, Zielgewicht und Datum festlegt, die sich widersprechen, bekommt `vorgehen_zu_langsam`. Das folgt Toms Regel: Zwei Grössen setzt der Nutzer, die dritte rechnet das System.

## 4. Tagesziele und Hindernisse

`[cmd]` `goals.berechne_zielwerte(user, tag)` liefert ein `hindernis`:
- `kein_aktives_ziel`: Kein Ziel ist aktiv. Gerechnet wird Erhaltung, mit Warnung (G-622, Tom: „der user muss wissen dass er planlos laeuft“).
- `ziel_ohne_laufende_phase`: Ein Ziel ist aktiv, aber keine Phase läuft. Gerechnet wird Erhaltung. Mitgeliefert werden `goal_id`, die letzte Phase, ihr Ende und `recommended_next` (G-637).
- `erhaltung_nicht_berechenbar`: Die Erhaltung lässt sich nicht berechnen.
- Die Phase eines pausierten Ziels läuft nicht (G-613).

Die App zeigt alle Zustände in Today, Nutrition und Goals (G-630, G-618).

## 5. App

`[cmd]` Commits:
- „Ziel setzen“: G-628 Teil 1–3, Commits `3ddd99ac`, `f48d8b0f`, `6240bcd1`.
- Reiter Goals nach Entwurf: G-618/G-636 (Steuerungskarte mit vier Zuständen, Messziel-Kacheln, Abgeschlossen).
- `abandoned` heisst in der Anzeige „beendet“ (Tom 08.10. 15:57).

## 6. Offen

- G-611: Einfrieren, Archivieren, Löschen (Codex).
- G-628 Teil 4: Startwert-Vorschau, „Schnitt + 1“, Widerspruchshinweis G-621.
- G-629: die Phase Engine als Planer.
- G-631: Trendgewicht.
- G-627: Anpassungsprotokoll.
- Technische Schuld: `ziel_grenzen_pruefen` und `berechne_zielwerte` bestehen aus einer umbenannten Basis plus Hülle (G-633, G-637). Beim nächsten Umbau zusammenführen.
