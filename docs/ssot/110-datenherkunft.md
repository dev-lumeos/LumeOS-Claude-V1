# A-17: Datenherkunft vor Geraeteanbindungen

Stand: 2026-08-18.

## Ergebnis

[cmd] Neuer Kettenschritt: `supabase/_pipeline/00_querschnitt/017_datenherkunft.sql`.

[cmd] `kette.json` und `supabase/README.md` fuehren den Schritt. `kette-readme-pruefen.ts` meldete danach `README/Kette: ok (59 Schritte dokumentiert)`.

[cmd] Der Kettenlauf gegen die Wegwerf-Datenbank `lumeos_a17_datenherkunft` lief vollstaendig durch. `schema-vollstaendigkeit-pruefen.ts` meldete dort Exit 0 und `SCHEMA VOLLSTAENDIG`.

[cmd] Live eingespielt: `017_datenherkunft.sql` meldete `OK: A-17 Datenherkunft gesetzt; keine User-Messzeile ohne Herkunft.`

[cmd] Live-Zeilzahlen nach dem Einspielen:

| Tabelle | Zeilen | `manual` | ohne Herkunft |
|---|---:|---:|---:|
| `nutrition.meals` | 687 | 687 | 0 |
| `nutrition.meal_items` | 2.099 | 2.099 | 0 |
| `nutrition.water_logs` | 299 | 299 | 0 |
| `recovery.checkins` | 36 | 36 | 0 |
| `training.workout_sessions` | 9 | 9 | 0 |
| `training.workout_sets` | 60 | 60 | 0 |
| `supplements.intake_logs` | 4 | 4 | 0 |

[cmd] Die Zeilzahlen blieben gegen die Vorabmessung unveraendert: 687 Meals, 2.099 Meal-Items, 299 Water-Logs, 36 Recovery-Check-ins, 9 Trainingseinheiten, 60 Saetze, 4 Supplement-Einnahmen.

[cmd] `schema-vollstaendigkeit-pruefen.ts` meldete live nach Nachzug von `schema-sollstand.json` Exit 0 und `SCHEMA VOLLSTAENDIG`, ohne Spaltenhinweise.

[cmd] `testdaten-pruefen.ts` meldete live Exit 0: `OK: C-82 Testdaten stimmen.`

## Welche Form die bestehenden zwei benutzen

[cmd] `goals.body_measurements` und `goals.body_circumferences` fuehren `measurement_source text NOT NULL DEFAULT 'manual'` und `source_detail text`. Erlaubt sind `manual`, `device`, `import`, `admin`.

[cmd] `goals.body_composition_navy()` weist den berechneten Wert als `source = 'derived_navy'` aus und gibt `input_source` sowie `input_source_detail` der verwendeten Umfangsmessung mit.

[cmd] `medical.lab_reports` und `medical.lab_result_values` fuehren `source` beziehungsweise `value_source` mit `source_detail`. Erlaubt sind dort importnaehere Werte: `manual`, `pdf_upload`, `photo_ocr`, `lab_import`, `seed`. `lab_result_values` hat zusaetzlich `entry_confidence` und `needs_verification`.

[annahme] Fuer A-17 traegt das Goals-Muster besser als das Medical-Muster: Die betroffenen Tabellen sind Mess- oder Ereigniszeilen, aber noch keine Import-Pipeline mit OCR-Konfidenz. Deshalb wurde `measurement_source` plus `source_detail` verwendet.

[cmd] Ausnahme: `nutrition.meals` ist ein Container, keine Messung. Die Tabelle bekam `entry_source` plus `source_detail`.

[cmd] Bestehende Fachfelder wurden nicht umgedeutet: `meal_items.food_source` beschreibt das Ziel-Lebensmittel (`bls`, `manual`, `custom`), `water_logs.source` die Eingabemethode (`manual`, `quick_add`), `workout_sets.logged_via` den Bedienweg (`manual`, `voice`, `auto`).

## Welche Tabellen sie bekommen haben

[cmd] Neu gesetzt:

| Tabelle | Neue Herkunftsfelder | Begruendung |
|---|---|---|
| `nutrition.meals` | `entry_source`, `source_detail` | Mahlzeit als Container |
| `nutrition.meal_items` | `measurement_source`, `source_detail` | erfasste Lebensmittelposition und Menge |
| `nutrition.water_logs` | `measurement_source`, `source_detail` | Wasserereignis |
| `recovery.checkins` | `measurement_source`, `source_detail` | subjektiver Check-in, spaeter Geraete- oder Importpfad |
| `training.workout_sessions` | `measurement_source`, `source_detail` | Trainingseinheit als Ereignis |
| `training.workout_sets` | `measurement_source`, `source_detail` | Satzwerte wie Gewicht, Wiederholungen, RPE |
| `supplements.intake_logs` | `measurement_source`, `source_detail` | Einnahmeprotokoll |

[cmd] Nicht ergaenzt wurden `training.workout_exercises` und `supplements.stack_items`. `workout_exercises` ist die Uebung innerhalb einer Sitzung; die eigentlichen Messwerte liegen in `workout_sets`, die Sitzung selbst in `workout_sessions`. `stack_items` ist Konfiguration; `supplements.user_stacks` hatte bereits ein eigenes `source`-Feld, und die tatsaechliche Einnahme liegt in `intake_logs`.

[cmd] Alle bestehenden Zeilen bekamen `manual`, nicht `NULL`.

[read] Der Grund aus dem Auftrag: Die vorhandenen Zeilen stammen aus manuellen Testdaten. Eine leere Herkunft waere spaeter nicht mehr von einem echten unbekannten Import zu unterscheiden.

## Abgeleitete Werte

[cmd] Ein Live-Aufruf von `goals.body_composition_navy('10000000-0000-0000-0000-000000000101', DATE '2026-08-18')` lieferte `source = derived_navy` und `input_source = manual`.

[cmd] Damit bleibt der abgeleitete Koerperfettwert als abgeleitet erkennbar, und der Ursprung der Eingabe wird mitgefuehrt.

[annahme] Fuer kuenftige abgeleitete Werte ist das Muster verbindlich genug: Der Ergebniswert braucht eine eigene abgeleitete Herkunft, und die Eingaben muessen ihre Herkunft behalten.

## Was der Mengeneffekt bedeutet

[cmd] Die aktuellen User-Messmengen sind klein: 36 Recovery-Check-ins, 9 Trainingseinheiten, 60 Saetze, 299 Water-Logs, 4 Supplement-Einnahmen.

[cmd] Eine Suche im Vorgaengerrepo nach `HRV`, `Readiness`, `RecoveryIntel`, `wearable` und `device` fand einschlaegige Fundstellen, unter anderem `src/api/training/routes/recovery-intel.ts`, `src/modules/training/hooks/useRecoveryIntel.ts`, `src/modules/recovery/components/RecoveryView.tsx` und mehrere Dashboard-/Intelligence-Komponenten.

[annahme] Diese Fundstellen zeigen Vorarbeit fuer HRV/Readiness-Auswertung, aber keine direkt uebernehmbare Rohdaten-Tabelle fuer Minutendaten in diesem Repo.

[read] A-17 beschreibt den Mengensprung ausdruecklich: Ein Check-in je Tag ist nicht dasselbe wie ein Wearable-HRV im Minutentakt.

[annahme] Wearable-Rohdaten gehoeren deshalb nicht in `recovery.checkins`. Sie brauchen spaeter eine eigene Rohdatentabelle mit Zeitstempel, Quelle, Geraetedetail und Indizes auf Nutzer/Zeit. Die Tagesansicht sollte dann eine Verdichtung lesen, nicht die Rohwerte.

[annahme] Betroffen waeren mindestens Recovery-HRV, Ruhepuls/Herzfrequenz, Schlafdaten, Trainingstracker-Sessions, Wasser aus Smart-Bottles und Supplement-/Medication-Reminder. A-17 baut dafuer nur die Herkunft an den heute vorhandenen Ereigniszeilen, nicht die Hochfrequenzspeicherung.

## Was dieser Schritt nicht tut

[cmd] Es wurde keine Geraeteanbindung gebaut.

[cmd] Es wurde keine Konfliktregel gebaut, welche Quelle gewinnt, wenn zwei Quellen denselben Tag oder dasselbe Ereignis liefern.

[cmd] Es wurde keine Umrechnung und keine Bewertung geaendert.

[cmd] Es wurde keine UI-Datei angefasst.

[annahme] Wenn spaeter zwei Quellen denselben Sachverhalt liefern, muss Tom entscheiden, ob beide angezeigt, zusammengefuehrt oder priorisiert werden. Die Herkunftsspalten machen diese Entscheidung moeglich, treffen sie aber nicht.
