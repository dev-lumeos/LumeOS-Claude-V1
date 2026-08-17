# Trainingssitzungen und Saetze

**Stand:** 2026-08-17

## Ausgang

`[cmd]` Vor C-66 enthielt `training` nur Stammdaten: `exercises`, `equipment`, `muscle_groups` und `exercise_muscles`. Nutzer-Training fehlte vollstaendig; deshalb konnten die 38 Kacheln unter `/v2/training` nur Attrappen bleiben.

`[read]` `docs/specs/Training/SPEC_06_DATABASE_SCHEMA.md` fuehrt als Kern einer absolvierten Einheit `training.workout_sessions`, `training.workout_exercises` und `training.workout_sets`. Darauf aufbauend nennt die Spec Routinen, Wochenplaene, Progression, PRs und Feedback.

`[read]` `docs/specs/Training/SPEC_02_ENTITIES.md` beschreibt Satzdaten als Snapshot: Gewicht, Wiederholungen und RPE gehoeren zum geloggten Satz und duerfen spaeter nicht durch Stammdatenpflege verschoben werden.

`[read]` Das Vorgaengerrepo hatte denselben Kern in `003_create_training_tables.sql`, aber unter anderem Schema: `public.exercises` mit UUID statt `training.exercises` im aktuellen Repo. Die RLS-Policies dort waren fuer eine direkte Uebernahme zu grob.

## Umsetzung

`[cmd]` Neuer Kettenschritt `106_workout_sessions.sql` erzeugt drei Tabellen:

| Tabelle | Zweck |
|---|---|
| `training.workout_sessions` | Sitzung eines Nutzers mit lokalem Datum, Startzeit, Endzeit und aggregierten Summen |
| `training.workout_exercises` | Uebung innerhalb einer Sitzung, inklusive eingefrorenem `exercise_name` |
| `training.workout_sets` | Satz mit Wiederholungen, Gewicht, RPE/RIR, Satztyp, Volumen und geschaetztem 1RM |

`[cmd]` Der Schritt erzeugt vier Funktionen: Snapshot des Uebungsnamens, Satz-Metriken, Aggregation der Session-Summen und Trigger-Wrapper. RLS ist fuer alle drei Tabellen aktiv; `authenticated` hat DML nur ueber Owner-Policies, `service_role` hat Vollzugriff.

`[cmd]` `kette.json` und `supabase/README.md` enthalten Schritt 106. `kette-readme-pruefen.ts` meldet `README/Kette: ok (48 Schritte dokumentiert)`.

## Zeit und Zeitzone

`[cmd]` `nutrition.meals` arbeitet seit `052a` mit `entry_date` plus lokaler `meal_time`. C-66 uebernimmt dieselbe Form: `session_date`, `started_time`, `ended_time`.

`[annahme]` Eine reine `timestamptz`-Loesung aus der Spec wuerde fuer Thailand/UTC wieder dieselbe Frage aufmachen wie bei Mahlzeiten: Der lokale Trainingstag ist fachlich der relevante Tag. Deshalb wird V1 lokal gespeichert; eine spaetere globale Zeitzonenlogik muss repo-weit entschieden werden, nicht nur fuer Training.

## Einfrieren

`[cmd]` Satzwerte werden in `training.workout_sets` gespeichert und nicht aus Stammdaten abgeleitet. `volume_kg` und `estimated_1rm` werden beim Schreiben berechnet.

`[cmd]` `training.workout_exercises.exercise_name` wird beim Einfuegen aus `training.exercises.name` gefuellt. Der FK auf `exercise_id` bleibt erhalten, damit Muskelzuordnungen und Stammdaten weiter erreichbar sind; der angezeigte historische Uebungsname bleibt dennoch stabil.

## Testdaten

`[cmd]` `_testdaten/testdaten-einspielen.ts` legt live und in der Wegwerf-Datenbank neun Trainingssitzungen fuer Tom an: drei Wochen mit Push, Pull und Legs, zusammen 18 Uebungen in Sitzungen und 60 Saetze.

`[cmd]` `_testdaten/testdaten-register.json` enthaelt den Fall `Trainingssitzungen mit mehreren Wochen Verlauf` fuer `2026-08-03 bis 2026-09-06`.

`[cmd]` `_validierung/testdaten-pruefen.ts` prueft jetzt zusaetzlich die drei Trainingstabellen, den Mehrwochenfall und die Verbindung zu den Stammdaten. Live-Ergebnis: `Training Sessions/Exercises/Sets: 9/18/60`, `OK: C-82 Testdaten stimmen`.

`[cmd]` Das Entfernen-Skript loescht Training wieder rueckstandsfrei. Bei der Gegenprobe fiel auf, dass `water_logs` bisher nicht entfernt wurden; das wurde im selben Skript user-ID-begrenzt nachgezogen. Danach meldete `testdaten-pruefen.ts --clean`: `Meals/Items/Water: 0/0/0` und `Training Sessions/Exercises/Sets: 0/0/0`.

## Nachweis

`[cmd]` Voller Kettenlauf in `lumeos_kette_c66`: `KETTE OK: 43.8s`, Abschluss `SCHEMA VOLLSTAENDIG`.

`[cmd]` Live-Schemapruefung nach Einspielen: `Tabellen 22/22`, `Funktionen 20/20`, `Zeilenschutz 22/22`, `Policies 22/22`, `GRANTs 24/24`, `Fremde Tab. 4/4`, `Fremde Fkt. 6/6`, `SCHEMA VOLLSTAENDIG`.

`[cmd]` Konkreter Live-Fall: Tom, `2026-08-03`, `17:30-18:45`, `Push A`, Session-Summen `3307,50 kg`, `6` Saetze, `48` Wiederholungen. Die erste Uebung ist `Barbell Bench Press`, hat `4` Saetze, bestes geschaetztes 1RM `99,33 kg` und `3` Muskelzuordnungen.

`[cmd]` RLS-Gegenprobe in der Wegwerf-Datenbank: Tom sieht `9` Sessions und `60` Saetze; Max sieht `0` Sessions. Ein Insert als Max in Toms `user_id` scheitert mit `new row violates row-level security policy for table "workout_sessions"`.

`[cmd]` `pnpm gate` lief Encoding, i18n, Tests und mehrere Builds durch, scheiterte aber im Web-Build an einer parallelen UI-Datei: `apps/web/src/app/v2/recovery/ansicht.tsx` importiert `./modale`, die Datei fehlt. C-66 fasst `apps/web` nicht an.

## Was aus der Spec nicht uebernommen wurde

`[read]` Nicht uebernommen wurden `training.routines`, `routine_exercises` und `routine_schedule_days`. Grund: C-66 baut absolvierte Sitzungen, keinen Trainingsplan.

`[read]` Nicht uebernommen wurden `personal_records`, Progression-Konfigurationen und die Engine aus dem Vorgaengerrepo (`workout_events`, `exercise_prs`). Grund: PRs und Progression brauchen geloggte Sitzungen als Grundlage und sind Folgeauftraege.

`[read]` Nicht uebernommen wurden Post-Workout-Feedback, Volume-Landmarks, Wochen-Sichten und Scoring aus `SPEC_09_SCORING.md`. Grund: Sie bewerten oder planen Training; sie sind nicht noetig, um eine Sitzung mit Uebungen und Saetzen zu speichern.

`[annahme]` Eine Active-Session-Eindeutigkeit wie im Vorgaengerrepo wurde nicht gebaut. Sie gehoert zur spaeteren Live-Erfassung und Offline-/Event-Frage, nicht zur Datengrundlage fuer abgeschlossene Test-Sessions.

## Was eine Sitzung noch nicht kann

`[cmd]` Es gibt noch keine Oberflaeche und keinen Schreibpfad in `apps/web`; das war ausdruecklich nicht Teil von C-66.

`[cmd]` Es gibt noch keine Bestleistungstabelle und keine e1RM-Historienfunktion. Die Saetze speichern `estimated_1rm`, aber die Ableitung `Best set`/PR ist noch nicht gebaut.

`[cmd]` Es gibt keine Routinen, keinen Wochenplan, keine Progression und keinen Kopierpfad aus einer Routine in eine Sitzung.

`[annahme]` Dauer und Zeiten sind V1-Felder. Sie reichen fuer Anzeige und Sortierung, aber nicht fuer eine spaetere Auswertung ueber mehrere Zeitzonen oder fuer Gym-/Ort-Kontext.

`[annahme]` Satztypen sind bewusst klein gehalten: `working`, `warmup`, `dropset`, `failure`. Tempo, ROM, Assistenz, Maschinen-Settings und Notizen pro Uebung koennen spaeter folgen, wurden aber nicht fuer den ersten messbaren Trainings-Tab gebraucht.
