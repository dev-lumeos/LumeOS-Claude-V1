# C-82 Testdaten

Stand: 2026-08-16

## Ausgangslage

`[cmd]` `nutrition.meals` und `nutrition.meal_items` hatten vor C-82 0 Zeilen. Damit waren Tagesbilanz, Referenzbewertung und Ziele mit Verlauf technisch vorhanden, aber ohne Tage, an denen sich Verhalten zeigen konnte.

`[read]` `docs/ssot/80-vorgaengerrepo-fundus.md` verweist auf 52 Seed-Dateien im Vorgängerrepo. Für diesen Zuschnitt relevant waren `supabase/seed-complete.sql`, `scripts/seed-complete-users.ts` und `SEED_DATA.md`.

`[read]` `SEED_DATA.md` beschreibt drei Testnutzer: Tom Miller, Max Schmidt und Sarah Johnson, jeweils mit Profil, Nutrition, Körpermesswerten mit Verlauf, Training, Supplements, Recovery, Abonnement und Prüfszenarien.

## Umsetzung

`[cmd]` Angelegt wurden zwei explizit aufzurufende Skripte unter `supabase/_pipeline/_testdaten/`: `testdaten-einspielen.ts` und `testdaten-entfernen.ts`. Sie stehen bewusst nicht in `kette.json`, weil die Kette den Sollzustand einer leeren Datenbank erzeugt und Testnutzer kein Sollbestand sind.

`[cmd]` Ergänzt wurde `supabase/_pipeline/_testdaten/testdaten-register.json`. Das Register beschreibt je Fall Nutzer, Datum, erwarteten Zustand und woran er zu erkennen ist.

`[annahme]` Der Ort `_testdaten` ist passender als `scripts/`, weil die Skripte direkt an die Pipeline-Datenbank, `daily_summary`, `daily_reference_assessment` und die Validierung unter `_validierung` gekoppelt sind. Es ist Testbestand für die lokale Supabase-Kette, kein allgemeines Projektwerkzeug.

`[cmd]` Der Seed erzeugt drei feste Auth-Nutzer und Profile, drei Nutrition-Targets, 512 Mahlzeiten und 1.560 Mahlzeitenpositionen über maximal 43 Tage. Die Positionen verwenden echte `bls_code`-Treffer aus `nutrition.foods` und frieren Nährwerte aus `nutrition.food_nutrients` so ein, wie der echte Schreibpfad es tut.

`[cmd]` Portionen werden dort gespeichert, wo die Eingabe über eine Portion erfolgt: 698 von 1.560 Positionen tragen `portion_name`, `portion_quantity` und `portion_amount_g`. Direkte Grammeingaben lassen diese drei Felder leer.

## Welcher Tag zeigt was

`[cmd]` Tom Miller, 2026-08-02: Tag ohne Ziel. `goals.zielwerte_am` liefert 0 Zeilen, `daily_summary` hat trotzdem Mahlzeiten und Positionen.

`[cmd]` Max Schmidt, 2026-08-04: Salz/Natrium deutlich über Referenz. `daily_reference_assessment` liefert `NA` 2.576,1 mg gegen 2.000 mg AI = 128,8 % und `NACL` 6,4406 g gegen 5 g FORMULA = 128,8 %. `[cmd]` Aktuell gibt es für `NA`/`NACL` keinen `UL`-Referenzwert; die Überschreitung ist deshalb als AI/FORMULA-Fall belegt, nicht als UL-Fall.

`[cmd]` Tom Miller, 2026-08-05: Vitamin A über UL. `VITA` liegt bei 5.579,8 µg; PRI 750 µg = 744,0 %, UL 3.000 µg = 186,0 %.

`[cmd]` Max Schmidt, 2026-08-06: lückenhafte Nährwerte. Apfelpektin erzeugt `reference_status = 'incomplete'`; mindestens AAE9, CA, FAPUN6, FASAT, FAT, FE, ID und weitere haben `missing_count = 1`.

`[cmd]` Tom Miller, 2026-08-07: Kalorien deutlich unter Ziel. `daily_summary` liefert 972,3 kcal gegen 2.500 kcal Ziel = 38,9 %.

`[cmd]` Max Schmidt, 2026-08-08: Tag ohne jede Mahlzeit. `nutrition.meals` liefert 0 Zeilen, `daily_summary` liefert 0 Zeilen.

`[cmd]` Max Schmidt, 2026-08-09: Mikronährstoffmangel. Calcium liegt bei 16,31577 mg gegen 950 mg PRI = 1,7 %, Eisen bei 1,28033 mg gegen 11 mg PRI = 11,6 %, Vitamin D bei 0 µg gegen 15 µg AI = 0,0 %.

`[cmd]` Max Schmidt, 2026-08-10: Kalorien deutlich über Ziel. `daily_summary` liefert 3.778,3 kcal gegen 2.200 kcal Ziel = 171,7 %.

`[cmd]` Tom Miller, 2026-08-11: leere Mahlzeiten. `daily_summary` liefert `meal_count = 4`, `item_count = 0`, `enercc = NULL`.

`[cmd]` Tom Miller, 2026-08-13: viele Positionen und gemischte Mengenangaben. Der Tag hat 24 Positionen, davon 9 mit Portionseingabe und 15 mit direkter Grammeingabe.

`[cmd]` Sarah Johnson, 2026-08-16: Profil unvollständig. `birth_date` und `body_weight_kg` sind NULL; `daily_reference_assessment` liefert 33 Zeilen mit `reference_status = 'missing_profile'`.

## Nachweis

`[cmd]` Wegwerf-Datenbank `lumeos_c82_cases` wurde mit `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --keep-database --database lumeos_c82_cases` aufgebaut. Ergebnis im letzten Lauf: 43 Schritte, 37,0 s, `SCHEMA VOLLSTAENDIG`.

`[cmd]` Nach dem Seed meldete `testdaten-pruefen.ts`: Nutzer/Profile/Ziele 3/3/3, Meals/Items 512/1560, maximal 43 Tage je Nutzer, 698 portionierte Items, 128 `daily_summary`-Zeilen, `daily_reference_assessment` 45 Zeilen und 30 mit Prozentwert. Fehlzählersummen ENERCC/VITA/FE: 0/0/3.

`[cmd]` Das Gegenstück löschte 1.560 `meal_items`, 512 `meals`, 3 `nutrition_targets`, 3 `profiles` und 3 `auth.users`.

`[cmd]` Die Clean-Prüfung meldete danach Nutzer/Profile/Ziele 0/0/0, Meals/Items 0/0, `foods`/`food_nutrients` 7140/869501.

`[cmd]` Die Schemaprüfung meldete vor und nach dem Testdatenlauf `SCHEMA VOLLSTAENDIG`.

## Was aus dem Original nicht übernommen wurde

`[read]` Das Vorgängerrepo enthält Profil, Nutrition, Körpermesswerte mit Verlauf, Training, Supplements, Recovery, Abonnement und Guthaben.

`[cmd]` Übernommen wurden nur Profil, Nutrition-Targets, Mahlzeiten und Mahlzeitenpositionen. Nicht übernommen wurden Training, Supplements, Recovery, Medical, Abonnement, Wallet und Showcase-Szenarien, weil dieser Auftrag ausdrücklich nur Nutrition und Profil umfasst und mehrere dieser Module im heutigen Repo kein passendes Schema haben.

`[cmd]` Die alte Tabelle `daily_nutrition_aggregates` wurde nicht befüllt, weil sie im heutigen Schema nicht existiert. `nutrition.daily_summary` ist hier eine Sicht und rechnet aus `meals` und `meal_items`.

`[cmd]` Körpermesswert-Verläufe wurden nicht übernommen, weil im heutigen Schema kein passender Verlaufsspeicher gefunden wurde. Das Profil trägt nur den aktuellen Wert `body_weight_kg`. Damit sind Kalorienverläufe vorhanden, aber kein zweiwöchiger Gewichtsverlauf.

`[cmd]` Alte `public.foods`-UUIDs wurden nicht übernommen. Jede Mahlzeitenposition wurde gegen heutige BLS-Codes gelegt; nicht zuordenbare alte Lebensmittel wurden nicht still ersetzt.

## Wofür diese Daten nicht taugen

`[annahme]` Die Daten sind realistisch, aber ausgedacht. Sie belegen Rechenwege, Constraints und Darstellbarkeit, nicht echte Nutzergewohnheiten.

`[read]` Die Abdeckungsmessung braucht echte Anfragen aus `nutrition.search_events`. Dieser Seed liefert plausible Mahlzeiten und gezielte Falltage, aber keine belegten Suchbegriffe und keine Auswahlpfade.

`[cmd]` Für adaptive TDEE sind mehr als 14 Tage Mahlzeiten vorhanden, aber kein Gewichtsverlauf in einer passenden Tabelle. Der Seed macht Kalorienverläufe prüfbar, löst GO-13 fachlich aber noch nicht.

`[annahme]` Die eingefrorenen Nährwerte sind nur so gut wie die BLS-Zuordnung der Testmahlzeiten. Sie sind Testdaten, keine Ernährungsempfehlung und keine medizinische Aussage.

