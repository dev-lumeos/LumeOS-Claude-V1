# C-122 - TDEE-Abweichung Formel gegen Messung

## Was die beiden Seiten sagen

`[cmd]` Vor der Korrektur lieferte `goals.adaptive_tdee(..., current_date, 14)` fuer `tom.seed@example.com`: `status = complete`, 14 von 14 Zufuhrtagen, 14 Gewichtsmessungen, 2.450,0 kcal durchschnittliche Zufuhr, `weight_delta_kg = -0,080`, adaptiv 2.497,4 kcal gegen Formel 3.527,0 kcal. Der Abstand betrug -1.029,6 kcal.

`[cmd]` Die Messseite ist in sich konsistent: 2.450,0 kcal Zufuhr und -0,080 kg ueber 13 Messtage ergeben `2450 - (-0,080 * 7700 / 13) = 2.497,4` kcal. Wuerde der Verbrauch wirklich 3.527,0 kcal betragen, laege das Defizit bei rund 1.077 kcal pro Tag und die erwartete Gewichtsveraenderung bei etwa -1,82 kg, nicht -0,080 kg.

`[cmd]` Nach der Seed-Korrektur bleibt die Messung unveraendert: adaptiv 2.497,4 kcal, 14/14 Zufuhrtage, 14 Gewichtsmessungen, `status = complete`. Der Formelwert liegt jetzt bei 2.552,4 kcal; der Abstand ist -55,0 kcal.

## Woher der Faktor 1,9 kommt

`[read]` `docs/specs/Goals/SCORING.md` und `docs/specs/Goals/CONSOLIDATED_KNOWLEDGE.md` fuehren die Aktivitaetsfaktoren: `sedentary = 1.2`, `light = 1.375`, `moderate = 1.55`, `active = 1.725`, `very_active = 1.9`.

`[cmd]` `supabase/_pipeline/11_goals/110_goals_zielwerte.sql` nutzt genau diese fuenf Werte aus `public.profiles.activity_level`; `very_active` steht dort mit Faktor 1,900. Der Schritt sagt auch, warum: Die Spec kennt `trainingFrequency`, aber im gebauten Profil existiert `activity_level`, deshalb rechnet die Datenbank darueber.

`[cmd]` Toms Seed-Profil stand vorher auf `very_active`, die Seeds enthalten aber nur 30 Trainingssitzungen ueber 180 Tage, davon bis `current_date` 15 abgeschlossene Sitzungen. Das sind 1,15 abgeschlossene Sitzungen pro Woche, nicht taegliches hartes Training oder koerperliche Arbeit.

## Welche Seite nicht stimmt

`[cmd]` Die falsche Seite war der Seed-Faktor im Profil, nicht die adaptive Rechnung. Der gemessene Faktor liegt bei `2.497,4 / 1.856,3 = 1,345` und damit nahe an `light = 1,375`.

`[cmd]` Formelwerte fuer das gemessene Profil: `sedentary` 2.227,5 kcal, `light` 2.552,3 kcal, `moderate` 2.877,2 kcal, `active` 3.202,0 kcal, `very_active` 3.526,9 kcal. Bei 1,15 abgeschlossenen Trainings pro Woche traegt `light` am besten; `very_active` erklaert die 1.030-kcal-Luecke.

`[annahme]` Die Zufuhr-Seeds waren am Zielwert von etwa 2.500 kcal ausgerichtet, nicht an einem Formelverbrauch mit Faktor 1,9. Das passt zur Messung: 2.450 kcal Durchschnitt und fast stabiles Gewicht ergeben einen Verbrauch um 2.500 kcal.

## Was geaendert wurde und was nicht

`[cmd]` Geaendert wurde nur der Seed: `tom.seed@example.com` steht in `testdaten-einspielen.ts` jetzt auf `activityLevel: 'light'`. Die Korrektur wurde auf `dev@lumeos.app` kopiert; beide Konten liefern denselben Nachweis.

`[cmd]` Die Varianz aus C-101 bleibt erhalten: 180 Tage mit Mahlzeiten, 179 unterschiedliche Tageskalorien, 49 verschiedene Lebensmittel, Minimum 291,5 kcal, Mittel 2.417,3 kcal, Maximum 4.016,6 kcal.

`[cmd]` Die zwei kleinen Seed-Reste sind mitgezogen: Kreatin hat jetzt 150 g Bestand bei 5 g/Tag, also 30 Tage Reichweite; D3 liegt bei 4 Tagen, Omega-3 bei 14, Magnesium bei 24. Ausgelassene Supplementtage tragen Nutzergruende (`vergessen`, `unterwegs`, `keine Lust`, `nach spaetem Training ausgelassen`) statt interner Szenario-Marker.

`[cmd]` Nicht geaendert wurden `berechne_zielwerte`, `adaptive_tdee`, `alpha = 1,0`, die Gewichtsreihe, die Zufuhrwerte und die Trainingsplanung. Die Wasserpruefung wurde nur an das geaenderte Profil angepasst: 85 kg x 30 ml/kg x Aktivitaetsfaktor 1,0833 ergibt 2.762 ml statt 3.400 ml.

`[cmd]` Nachweis: Kettenlauf ueber `kette-ausfuehren.ts` Exit 0, `schema-vollstaendigkeit-pruefen.ts` Exit 0, `testdaten-pruefen.ts` Exit 0. `pnpm gate` bricht noch im Web-Build ab, aber an fremden Supplement-Dateien: `apps/web/src/app/v2/supplements/tab-inventory-echt.tsx` importiert ueber `auswertung.ts` eine Server-Client-Datei mit `next/headers`.
