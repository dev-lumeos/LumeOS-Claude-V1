# GO-11 + GO-01 Block C — Meilensteine und adaptive TDEE

Stand: 2026-08-18

## Ergebnis

[cmd] Neuer Kettenschritt `113`: `supabase/_pipeline/11_goals/113_goal_milestones_adaptive_tdee.sql`.

[cmd] Der Schritt erzeugt `goals.goal_milestones` sowie die Funktionen `goals.adaptive_tdee(user_id, stichtag, window_days)`, `goals.goal_progress_at(goal_id, stichtag)` und `goals.goal_milestone_status(milestone_id, stichtag)`.

[cmd] `goals.berechne_zielwerte` und `goals.zielwerte_am` wurden nicht umgebaut. Der adaptive TDEE steht daneben und fuehrt `formula_tdee_kcal` als Baseline mit.

[cmd] `kette.json` und `supabase/README.md` enthalten den Schritt `113`; `pnpm exec tsx supabase/_pipeline/_validierung/kette-readme-pruefen.ts` meldete `README/Kette: ok (60 Schritte dokumentiert)`.

[cmd] Live-Stand nach Einspielen: `goals.goal_milestones` 4 Zeilen, `goals.user_goals` 3 Zeilen, Toms `daily_summary` 43 Tage.

## Welche TDEE-Formel und warum

[read] `docs/specs/Goals/SCORING.md` formuliert die adaptive TDEE als Rueckrechnung aus Kalorienzufuhr und Gewichtsveraenderung: Koerpergewichtsdelta mal 7.700 kcal/kg, geglaettet mit `alpha = 0.3`.

[cmd] Das Vorgaengerrepo hatte in `src/api/goals/routes/nutrition-goals.ts` bereits einen 14-Tage-Endpunkt: `GET /api/goals/nutrition/tdee/adaptive`. Er berechnet `avgIntake - weightChange * 7700 / daysBetween` und stuft die Sicherheit ueber Loggingrate und Gewichtspunkte ein.

[cmd] Das Vorgaengerrepo hatte ausserdem eine UI mit 14-Tage-Beschriftung: `AdaptiveTDEESidebar` ruft `useAdaptiveTDEE(14)`.

[cmd] Uebernommen wurde deshalb das 14-Tage-Fenster und die Rueckrechnung. Erweitert wurde es um den Formelwert als Baseline und eine EMA-Glaettung gegen diese Baseline, weil es in diesem Repo noch keine TDEE-Historie gibt, die als `previousTDEE` dienen koennte.

[cmd] Toms Live-Wert am 2026-09-13:

| Wert | Ergebnis |
|---|---:|
| Fenster | 2026-08-31 bis 2026-09-13 |
| Vollstaendige Intake-Tage | 14 |
| Gewichtsmessungen | 14 |
| Gewicht | 84,79 kg → 85,00 kg |
| Durchschnittliche Zufuhr | 2.372,0 kcal |
| Formel-TDEE | 3.527,0 kcal |
| Roh-TDEE | 2.247,6 kcal |
| Adaptiver TDEE | 3.143,2 kcal |
| Abstand zur Formel | -383,8 kcal |
| Status | `complete`, `high` |

[cmd] Der aeltere Auftragswert 2.707,1 kcal ist nicht der aktuelle Live-Wert. `goals.berechne_zielwerte` liefert fuer Toms aktuelles Profil am 2026-09-13 `tdee = 3.527,0`.

## Ab wann der adaptive Wert belastbar ist

[cmd] Die Funktion verlangt standardmaessig 14 vollstaendige Intake-Tage, mindestens zwei Gewichtsmessungen und eine Gewichtsspanne ueber das gesamte Fenster. Fehlt eines davon, bleibt `adaptive_tdee_kcal` `NULL` und `status` nennt den Grund.

[cmd] `max.seed@example.com` liefert am 2026-09-13 keinen adaptiven Wert: `adaptive_tdee_kcal = NULL`, `status = insufficient_weight_measurements`, 14 Intake-Tage, 0 Gewichtsmessungen.

[cmd] `test-user@lumeos.local` hat 1 Mahlzeitentag und 0 Gewichtsmessungen. Die Funktion liefert keinen adaptiven Wert: `adaptive_tdee_kcal = NULL`, `status = insufficient_intake_days`.

[annahme] Die Glaettung gegen den Formelwert ist ein Startzustand. Sobald eine TDEE-Historie gebaut wird, sollte `previousTDEE` aus der letzten belastbaren adaptiven Messung kommen, nicht aus der Formel.

## Welche Zielarten messbar sind

[cmd] `goals.goal_progress_at` misst heute `body_composition` mit `target_unit = 'kg'` gegen `goals.body_measurements`.

[cmd] Beispiel Tom, 2026-09-13: Ziel `Lean Bulk bis September`, Zielwert 88 kg, Start 85 kg, aktuelle Messung 85,00 kg aus `goals.body_measurements`, `progress_status = measured`.

[cmd] `performance` liefert heute `not_implemented_workout_sets`. Der Bestand hat `training.workout_sets`, aber es ist noch nicht entschieden, ob Fortschritt ueber `estimated_1rm`, Volumen, Best Set oder eine konkrete Uebungs-ID gemessen wird.

[cmd] `health` und `lifestyle` liefern keinen geratenen Fortschritt. Ohne explizite Messquelle bleiben sie `not_measurable`.

[annahme] Kalorienziele koennten ueber `nutrition.daily_summary` messbar werden, sind aber in `user_goals` noch nicht als eigene Zielart modelliert. Das wurde nicht gebaut.

## Meilensteine

[cmd] `goal_milestones` speichert gesetzte Meilensteine. Die Tabelle ist nutzerbezogen, RLS-geschuetzt und traegt `source`; Testdaten verwenden `source = seed`.

[cmd] Live-Nachweis am 2026-09-13:

| Meilenstein | Status | Messwert | Quelle |
|---|---|---:|---|
| 85 kg erreicht | `achieved` | 85,00 kg | `goals.body_measurements` |
| 86,5 kg offen | `open` | 85,00 kg | `goals.body_measurements` |
| 86 kg bis 20. August | `missed` | 85,00 kg | `goals.body_measurements` |
| Trainingsleistung stabilisieren | `not_implemented_workout_sets` | NULL | keine Messquelle |

[cmd] RLS-Nachweis: Mit Rolle `authenticated` und Toms JWT-Sub sieht Tom 3 Meilensteine; mit Sarahs JWT-Sub sieht Sarah 0. Ein Insert von Sarah auf Toms `user_id` bricht mit `new row violates row-level security policy for table "goal_milestones"` ab.

## Was `calcGoalProgress` falsch macht

[read] Der Umsetzungsplan nennt W-8: `calcGoalProgress` teilt durch `totalWeight`, obwohl die Gewichte in der Vorlage bereits auf 1 summieren.

[read] In `docs/specs/Goals/SCORING.md` ist der eigentliche Schaden nicht die Division selbst, sondern der Umgang mit fehlenden Beitragswerten: Ein fehlendes Modul wird als 0-Beitrag gerechnet, wenn es keinen Wert liefert. Das ist eine Bewertung, keine Messung.

[cmd] Dieser Schritt baut deshalb keine Gesamtbewertung und keine Beitragsaggregation. Er liefert nur Messwerte und Status: `measured`, `not_implemented_workout_sets`, `not_measurable` oder ein konkreter TDEE-Fehlerstatus.

## Testdaten

[cmd] `supabase/_pipeline/_testdaten/testdaten-einspielen.ts` legt jetzt 4 Meilensteine an: erreicht, offen, verfehlt und nicht messbar.

[cmd] `supabase/_pipeline/_testdaten/testdaten-register.json` enthaelt den neuen Fall `Adaptive TDEE und Meilensteine`.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts` meldete: 3 Nutzer, 3 Goals, 3 Phasen, 4 Meilensteine, 43 Koerpermessungen, 7 Umfangsmessungen; `OK: C-82 Testdaten stimmen.`

## Nachweis

[cmd] Der neue Schritt lief live per `psql -v ON_ERROR_STOP=1` durch und meldete `OK: goals.goal_milestones und adaptive TDEE-Funktionen angelegt`.

[cmd] Vollstaendiger Kettenlauf in der Wegwerf-Datenbank `lumeos_go11_tdee`: Exit 0, 60 Schritte, 65,7 s. Der Runner legte vorher `backup/schema/20260818041041_c43_vor_kettenlauf.sql` an.

[cmd] `pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`: Exit 0, `SCHEMA VOLLSTAENDIG`, Tabellen 22/22, Funktionen 20/20, Fremde Tabellen 20/20, Fremde Funktionen 22/22.

[cmd] `pnpm gate`: Exit 0, 8/8 Tasks erfolgreich.

## Was noch fehlt

[annahme] Es gibt keine TDEE-Historie. Der adaptive Wert ist aktuell eine Tagesabfrage, kein append-only Verlauf.

[annahme] Die EMA nutzt mangels Historie den Formel-TDEE als Vorgaengerwert. Das ist stabil als Startzustand, aber keine echte adaptive Historie.

[annahme] Performance-Fortschritt braucht eine Entscheidung, welcher `workout_sets`-Wert zaehlt: `estimated_1rm`, Volumen, Best Set, eine bestimmte Uebung oder ein Ziel-spezifischer Satz davon.

[annahme] Gesundheits- und Lifestyle-Ziele brauchen eigene Messquellen, bevor Fortschritt angezeigt werden darf.

[annahme] Es gibt keine Oberflaeche und keine automatische Statuspersistenz. `goal_milestone_status` berechnet den Status am Stichtag; die gespeicherte Zeile wird dadurch nicht auf `achieved` oder `missed` aktualisiert.
