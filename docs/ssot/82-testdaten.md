# C-82 Testdaten

Stand: 2026-08-16

## Ausgangslage

`[cmd]` `nutrition.meals` und `nutrition.meal_items` hatten vor diesem Schritt 0 Zeilen. Damit waren Tagesbilanz, Referenzbewertung und Ziele mit Verlauf technisch vorhanden, aber ohne Tage, an denen sich Verhalten zeigen konnte.

`[read]` `docs/ssot/80-vorgaengerrepo-fundus.md` verweist auf 52 Seed-Dateien im Vorgängerrepo. Für diesen Zuschnitt relevant waren `supabase/seed-complete.sql`, `scripts/seed-complete-users.ts` und `SEED_DATA.md`.

`[read]` `SEED_DATA.md` beschreibt drei Testnutzer: Tom Miller, Max Schmidt und Sarah Johnson, jeweils mit Profil, Nutrition, Körpermesswerten mit Verlauf, Training, Supplements, Recovery, Abonnement und Prüfszenarien.

## Umsetzung

`[cmd]` Angelegt wurden zwei explizit aufzurufende Skripte unter `supabase/_pipeline/_testdaten/`: `testdaten-einspielen.ts` und `testdaten-entfernen.ts`. Sie stehen bewusst nicht in `kette.json`, weil die Kette den Sollzustand einer leeren Datenbank erzeugt und Testnutzer kein Sollbestand sind.

`[annahme]` Der Ort `_testdaten` ist passender als `scripts/`, weil die Skripte direkt an die Pipeline-Datenbank, `daily_summary`, `daily_reference_assessment` und die Validierung unter `_validierung` gekoppelt sind. Es ist Testbestand für die lokale Supabase-Kette, kein allgemeines Projektwerkzeug.

`[cmd]` Der Seed erzeugt drei feste Auth-Nutzer und Profile, drei Nutrition-Targets, 168 Mahlzeiten und 532 Mahlzeitenpositionen über 14 Tage. Die Positionen verwenden echte `bls_code`-Treffer aus `nutrition.foods` und frieren Nährwerte aus `nutrition.food_nutrients` so ein, wie der echte Schreibpfad es tut.

`[cmd]` Portionen werden dort gespeichert, wo die Eingabe über eine Portion erfolgt: 238 von 532 Positionen tragen `portion_name`, `portion_quantity` und `portion_amount_g`. Direkte Grammeingaben lassen diese drei Felder leer.

## Nachweis

`[cmd]` Wegwerf-Datenbank `lumeos_c82_testdaten` wurde mit `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --keep-database --database lumeos_c82_testdaten` aufgebaut. Ergebnis: 43 Schritte, 37,2 s, `SCHEMA VOLLSTAENDIG`.

`[cmd]` Nach dem Seed meldete `testdaten-pruefen.ts`: Nutzer/Profile/Ziele 3/3/3, Meals/Items 168/532, maximal 14 Tage je Nutzer, 238 portionierte Items, 42 `daily_summary`-Zeilen, `daily_reference_assessment` 45 Zeilen und 33 mit Prozentwert. Fehlzählersummen ENERCC/VITA/FE: 0/0/0.

`[cmd]` Direkte Tagesbilanz-Stichprobe: Tom 14 Tage mit durchschnittlich 2372,0 kcal, Max 14 Tage mit 2049,8 kcal, Sarah 14 Tage mit 1699,9 kcal. `enercc_missing` und `vita_missing` waren in der Stichprobe jeweils 0.

`[cmd]` Nach `testdaten-entfernen.ts` wurden 532 `meal_items`, 168 `meals`, 3 `nutrition_targets`, 3 `profiles` und 3 `auth.users` entfernt.

`[cmd]` Die Clean-Prüfung meldete danach Nutzer/Profile/Ziele 0/0/0, Meals/Items 0/0, `foods`/`food_nutrients` 7140/869501. Die Schemaprüfung meldete danach erneut `SCHEMA VOLLSTAENDIG`.

## Was aus dem Original nicht übernommen wurde

`[read]` Das Vorgängerrepo enthält Profil, Nutrition, Körpermesswerte mit Verlauf, Training, Supplements, Recovery, Abonnement und Guthaben.

`[cmd]` Übernommen wurden nur Profil, Nutrition-Targets, Mahlzeiten und Mahlzeitenpositionen. Nicht übernommen wurden Training, Supplements, Recovery, Medical, Abonnement, Wallet und Showcase-Szenarien, weil dieser Auftrag ausdrücklich nur Nutrition und Profil umfasst und mehrere dieser Module im heutigen Repo kein passendes Schema haben.

`[cmd]` Die alte Tabelle `daily_nutrition_aggregates` wurde nicht befüllt, weil sie im heutigen Schema nicht existiert. `nutrition.daily_summary` ist hier eine Sicht und rechnet aus `meals` und `meal_items`.

`[cmd]` Körpermesswert-Verläufe wurden nicht übernommen, weil im heutigen Schema kein passender Verlaufsspeicher gefunden wurde. Das Profil trägt nur den aktuellen Wert `body_weight_kg`. Damit sind zwei Wochen Kalorien vorhanden, aber kein zweiwöchiger Gewichtsverlauf.

`[cmd]` Alte `public.foods`-UUIDs wurden nicht übernommen. Jede Mahlzeitenposition wurde gegen heutige BLS-Codes gelegt; nicht zuordenbare alte Lebensmittel wurden nicht still ersetzt.

## Wofür diese Daten nicht taugen

`[annahme]` Die Daten sind realistisch, aber ausgedacht. Sie belegen Rechenwege, Constraints und Darstellbarkeit, nicht echte Nutzergewohnheiten.

`[read]` Die Abdeckungsmessung braucht echte Anfragen aus `nutrition.search_events`. Dieser Seed liefert plausible Mahlzeiten, aber keine belegten Suchbegriffe und keine Auswahlpfade.

`[cmd]` Für adaptive TDEE sind 14 Tage Mahlzeiten vorhanden, aber kein Gewichtsverlauf in einer passenden Tabelle. Der Seed macht Kalorienverläufe prüfbar, löst GO-13 fachlich aber noch nicht.

`[annahme]` Die eingefrorenen Nährwerte sind nur so gut wie die BLS-Zuordnung der Testmahlzeiten. Sie sind Testdaten, keine Ernährungsempfehlung und keine medizinische Aussage.

