# C-153 - Recovery und Seeds

Datum: 2026-08-20

## Was `next_day_effect` zeigt

`[cmd]` Der Befund aus C-144 ist im aktuellen Stand bereits gebaut:
`recovery.modality_log` fuehrt `next_day_effect` und
`next_day_score_delta`. Der Kettenschritt
`121_recovery_scores_modalities.sql` rechnet die Deltas ueber
`recovery.refresh_modality_deltas(...)` gegen den Score des Folgetags.

`[cmd]` Live auf `dev@lumeos.app`: 89 von 89 Modalitaetszeilen haben
einen `next_day_score_delta`. Die Spanne liegt bei -33,7 bis +15,0
Punkten.

| Datum | Modalitaet | Sofort | Naechster Tag | Score am Tag | Score danach | Delta |
|---|---|---:|---:|---:|---:|---:|
| 2026-08-19 | `sauna` | 7 | 6 | 71,0 | 83,9 | +12,9 |
| 2026-08-19 | `stretching` | 6 | 5 | 71,0 | 83,9 | +12,9 |
| 2026-08-12 | `cold_plunge` | 6 | 7 | 79,4 | 83,9 | +4,5 |

`[read]` Das ist nur Arithmetik ueber zwei Tage. Es sagt, ob der
Folgetag hoeher oder tiefer lag; es sagt nicht, dass die Modalitaet die
Ursache war.

## Wie die Wochenstruktur aussieht

`[cmd]` Vor C-153 war der Ernaehrungsseed ein strenger Saegezahn: niedrig
und hoch wechselten sich ab. Der Erzeuger nutzt jetzt eine
Wochenstruktur statt einer alternierenden Tagesliste: Wochentagsfaktor,
Fuenf-Wochen-Blockfaktor, Trainingstag +8 %, Folgetag +4 %, dazu
deterministisches Hinzufuegen oder Weglassen einzelner Positionen.

`[cmd]` Fuenf aufeinanderfolgende Live-Tage auf `dev@lumeos.app`:

| Datum | Tag | Training | Positionen | Lebensmittel | Gramm | kcal |
|---|---:|---|---:|---:|---:|---:|
| 2026-08-16 | 7 | nein | 12 | 12 | 1.697,0 | 2.206,9 |
| 2026-08-17 | 1 | nein | 12 | 11 | 1.740,0 | 1.886,6 |
| 2026-08-18 | 2 | nein | 12 | 12 | 1.904,0 | 2.520,7 |
| 2026-08-19 | 3 | ja | 13 | 12 | 1.978,0 | 3.074,3 |
| 2026-08-20 | 4 | nein | 14 | 13 | 2.144,0 | 2.726,6 |

`[cmd]` Ueber den gesamten Dev-Zeitraum: Tagesgramm min/avg/max
95,0 / 1.841,0 / 2.299,0 g; Tageskalorien min/avg/max
291,5 / 2.404,6 / 3.812,0 kcal. Es gibt 147 verschiedene Tagesgrammwerte,
175 verschiedene Tageskalorienwerte und 9 verschiedene Positionszahlen.

`[cmd]` `goals.adaptive_tdee(dev@lumeos.app, current_date)` bleibt
`complete`: 14 von 14 Zufuhrtagen, 14 Gewichtsmessungen, 84,49 kg bis
84,41 kg. Durchschnittszufuhr 2.487,4 kcal, Formel 2.552,4 kcal,
adaptiv 2.534,8 kcal, Abstand -17,6 kcal.

## Was mit Glukose geschieht

`[cmd]` Es bleiben zwei Eintraege, weil der rohe Importfall keine sichere
Identitaet hat.

| Fall | Datum | LOINC | Status | Begruendung |
|---|---|---|---|---|
| Verlauf | 2025-12-06 bis 2026-06-05 | `1558-6` | `exact` | `Glucose (fasting)` ist als Nuechternglukose gesetzt. |
| Rohmarker | 2026-06-06 | leer | `ambiguous` | `Glukose` ohne System- und Nuechternkontext passt auf mehrere Tests. |

`[cmd]` Die Kandidaten des Rohmarkers sind `2345-7` Serum/Plasma,
`2339-0` Blut und `5792-7` Urin. `1558-6` waere nur dann richtig, wenn
der Befund ausdruecklich Nuechternglukose meint. Diese Information steht
am Rohmarker nicht.

`[read]` Deshalb wird nichts zusammengelegt. Eine Alias-Zeile auf
`1558-6` oder `2345-7` wuerde eine Laborentscheidung vorwegnehmen. Der
Rohmarker bleibt sichtbar, `needs_verification` bleibt die richtige
Folge.

## Was `rir` und `is_pr` jetzt hergeben

`[cmd]` C-147 hat den Satzbestand gefuellt. Live auf `dev@lumeos.app`:
101 von 101 Saetzen tragen `rir`; 41 Saetze sind `is_pr = true`, verteilt
ueber 6 Uebungen.

`[cmd]` Damit kann G-88 die Today-Sitzungskarte jetzt aus Daten speisen:
geplante Saetze/Wiederholungen/Gewicht aus `workout_exercises`,
tatsaechliche Wiederholungen/Gewicht/RPE/RIR aus `workout_sets` und die
PR-Markierung aus `is_pr`. Die frueher gemeldeten zwei leeren Spalten
sind nicht mehr leer.

## Nachweis

`[cmd]` Kettenlauf ueber
`pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --keep-database`:
Exit 0 auf Wegwerf-Datenbank `lumeos_kette_20260820101310`. Der
Schemalauf darauf war vollstaendig: Tabellen 28/28, Funktionen 28/28,
Mindestzeilen ok, `SCHEMA VOLLSTAENDIG`.

`[cmd]` Testdatenlauf auf der Wegwerf-Datenbank:
2.169 Mahlzeiten, 6.751 Positionen, 902 Wassereintraege,
30 Trainingssitzungen, 101 Saetze, 170 Recovery-Scores,
89 Recovery-Modalitaeten. `testdaten-pruefen.ts`: Exit 0.

`[cmd]` Live eingespielt und nach `dev@lumeos.app` kopiert:
725 Mahlzeiten, 2.298 Positionen, 361 Wassereintraege,
30 Trainingssitzungen, 101 Saetze, 170 Recovery-Scores,
89 Recovery-Modalitaeten, 5 Laborbefunde, 140 Laborwerte.
`test-user@lumeos.local` bleibt klein: 1 Mahlzeit, 2 Positionen,
1 Zielwert, keine Recovery-, Training-, Medical- oder Coach-Demozeilen.

`[cmd]` `pnpm gate`: Exit 0. Encoding-, Gruppenlabel-, Schemafreigabe-
und i18n-Pruefung liefen sauber; Turbo meldete 11 von 11 Tasks
erfolgreich.

`[cmd]` Live-Schemapruefung:
`schema-vollstaendigkeit-pruefen.ts` meldet weiter vier Abweichungen bei
den Training-Stammdatentabellen aus Schritt 100:
`training.muscle_groups`, `training.equipment`, `training.exercises` und
`training.exercise_muscles` fehlen die erwarteten INSERT/UPDATE/DELETE-
Policies. Die Wegwerf-Datenbank aus dem Kettenlauf hat diese Abweichung
nicht. Das ist kein C-153-Seedbefund und wurde nicht nebenbei repariert.
