# C-157: Tagesbilanz in langer Form

Datum: 2026-08-20

## Warum 37 von 138

`[cmd]` `nutrition.daily_summary` ist eine breite Kompatibilitaetssicht.
Sie fuehrt 37 Naehrstoffe, aber 74 Spalten, weil jeder Naehrstoff als
Wert plus Fehlzaehler auftaucht. Fuer alle 138 Codes waeren das 276
Spalten, und jeder neue Code wuerde eine Migration plus Anpassungen in
Lesefunktionen erzwingen.

`[read]` Die eigentliche Datenform liegt bereits in
`nutrition.food_nutrients`: `food_id`, `nutrient_code`, `value`,
`data_source`. Diese Form traegt 869.501 Zeilen und 138 Codes. C-157
zieht die Tagesbilanz auf dieselbe Form, statt `meal_items` oder
`daily_summary` weiter zu verbreitern.

`[cmd]` Live auf `dev@lumeos.app`, `current_date = 2026-08-20`, 14
Positionen: Die neue Sicht liefert 138 Tageszeilen. Die elf
Kohlenhydrate sind alle sichtbar:

| Code | Wertpositionen | Positionen | Summe |
|---|---:|---:|---:|
| `STARCH` | 11 | 14 | 188,1 g |
| `SUGAR` | 14 | 14 | 56,9 g |
| `DISAC` | 14 | 14 | 32,4 g |
| `MNSAC` | 14 | 14 | 24,6 g |
| `SUCS` | 13 | 14 | 16,2 g |
| `FRUS` | 12 | 14 | 13,2 g |
| `GLUS` | 12 | 14 | 11,3 g |
| `LACS` | 11 | 14 | 11,2 g |
| `MALS` | 11 | 14 | 4,9 g |
| `GALS` | 9 | 14 | 0,0 g |
| `OLSAC` | 1 | 14 | 0,3 g |

`[cmd]` Auch Makro-Reste, die vorher nicht in `daily_summary` standen,
erscheinen: `ALC` 12/14 Positionen, 0,0 g; `FIBHMW` 31,2 g; `FIBINS`
19,0 g; `FIBSOL` 12,2 g. Die uebrigen Ballaststoff-Fraktionen sind
sichtbar, auch wenn sie an diesem Tag nur teilweise belegt sind.

## Wie die lange Form aussieht

`[cmd]` Neuer Kettenschritt:
`supabase/_pipeline/05_user_tabellen/059b_daily_nutrient_summary_long.sql`.
Er legt `nutrition.daily_nutrient_summary_long` als
`security_invoker`-Sicht an: eine Zeile je Nutzer, Tag und
Naehrstoffcode.

Die Sicht liefert je Naehrstoff:

| Feld | Bedeutung |
|---|---|
| `total_value` | Summe der vorhandenen Werte |
| `item_count` | Positionen des Tages |
| `value_count` | Positionen mit Wert fuer diesen Code |
| `missing_count` | Positionen ohne Wert fuer diesen Code |
| `value_complete` | `true`, wenn alle Positionen den Wert trugen |
| `nutrient_name_de`, `nutrient_unit`, `group_de`, `display_tier` | Metadaten aus `nutrient_defs` |

`[read]` Nullwerte zaehlen als vorhanden. Ein Lebensmittel mit
`GALS = 0,0` ist nicht dasselbe wie ein Lebensmittel ohne Galactose-Wert.

`[cmd]` Der Bewertungshorizont wird als Eigenschaft am Naehrstoff
vorbereitet: `assessment_horizon_days`, `assessment_horizon_source`,
`assessment_horizon_notes` in `nutrition.nutrient_defs`. Die Felder
bleiben leer. Ohne Quelle wird nicht geraten, ob Vitamin D ueber Wochen
oder Natrium ueber Tage zu bewerten ist; das gehoert in A-22.

`[cmd]` Zeilenschutz: Die Sicht hat keine eigene Policy, sondern liest
`nutrition.meals` und `nutrition.meal_items` mit deren RLS. Live belegt:
`dev@lumeos.app` sieht fuer den eigenen Tag 138 Zeilen;
`test-user@lumeos.local` sieht fuer denselben Nutzer und Tag 0 Zeilen.

## Was ein Zeitfenster kostet

`[cmd]` Neue Funktion:
`nutrition.nutrient_summary_window(p_user_id, p_end_date, p_days)`.
Sie nutzt dieselbe lange Form fuer 1/7/14/30/45/60/90 Tage und trennt
Summe von Schnitt:

| Feld | Aussage |
|---|---|
| `total_value` | Summe im Fenster |
| `avg_per_calendar_day` | Schnitt ueber alle Kalendertage |
| `avg_per_logged_day` | Schnitt ueber Tage mit Mahlzeiten |
| `avg_per_value_day` | Schnitt ueber Tage, an denen dieser Code vorkam |
| `logged_day_count`, `days_with_value`, `complete_day_count` | Vollstaendigkeit des Fensters |

`[cmd]` Erste Fassung ueber die lange Sicht war zu teuer: 30 Tage fuer
vier Codes liefen mit 6.407 ms, danach 5.300 ms. Die Funktion filtert
deshalb zuerst auf Nutzer und Zeitraum und packt erst dann die
Naehrstoffwerte aus.

`[cmd]` Live-Messung fuer `dev@lumeos.app`, 30 Tage bis 2026-08-20:
34,177 ms fuer `ALC`, `FE`, `STARCH`, `VITC`.

| Code | Summe | Schnitt/Kalendertag | Wertpositionen | Positionen | Fehlend |
|---|---:|---:|---:|---:|---:|
| `ALC` | 1,1 g | 0,04 g | 361 | 388 | 27 |
| `FE` | 510,9 mg | 17,03 mg | 388 | 388 | 0 |
| `STARCH` | 7.001,0 g | 233,37 g | 338 | 388 | 50 |
| `VITC` | 8.227,2 mg | 274,24 mg | 288 | 388 | 100 |

`[cmd]` Die Tagesabfrage fuer die elf Kohlenhydrate lief live mit
29,005 ms. Die Zaehlung aller 138 Tageszeilen lief mit 35,750 ms.

`[annahme]` Bei der aktuellen Seed-Groesse reicht eine Sicht plus
Fensterfunktion. Eine materialisierte Tabelle ist noch nicht begruendet;
der Engpass war die Abfrageform, nicht die Datenmenge.

## Wie die alten Leser weiterlaufen

`[cmd]` `nutrition.daily_summary` bleibt unveraendert. Damit bleiben
Diary, Dashboard, `daily_reference_assessment`, `hydration_summary` und
`goals.adaptive_tdee` stabil. C-157 fuegt einen zweiten Lesepfad hinzu,
statt bestehende Spaltennamen zu entfernen.

`[cmd]` `goals.adaptive_tdee(dev@lumeos.app, current_date, 14)` bleibt
`complete`: 14 von 14 Zufuhrtagen, Formel 2.552,4 kcal, adaptiv
2.534,8 kcal, Abstand -17,6 kcal.

`[read]` Der Uebergang ist damit zweistufig: Bestehende Verbraucher lesen
weiter die breite Sicht. Neue Oberflaechen, die alle 138 Naehrstoffe
oder ein Zeitfenster brauchen, lesen `daily_nutrient_summary_long` oder
`nutrient_summary_window`.

`[cmd]` Wegwerf-Kettenlauf `lumeos_kette_20260820121812`: Kette Exit 0,
`schema-vollstaendigkeit-pruefen.ts` Exit 0, `testdaten-pruefen.ts`
Exit 0. Live nach Einspielen von `059b`: Schemapruefung Exit 0 und
Testdatenpruefung Exit 0.

`[read]` Beim RLS-Test auf der Wegwerf-DB fiel eine bestehende
Simulationsabweichung auf: `authenticated` hat dort keine `USAGE` auf
Schema `auth`, waehrend der Live-Supabase-Stack diese Berechtigung hat.
Der Live-Nachweis oben ist deshalb der belastbare Zugriffsnachweis fuer
die neue Sicht.
