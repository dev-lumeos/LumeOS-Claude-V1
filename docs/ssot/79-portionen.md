# C-50 Portionsgrößen

Stand: 2026-08-16

## Ergebnis

`[cmd]` `supabase/_pipeline/daten/portionen.json` enthält seit C-51 27 Portionssets. Der Kettenschritt `029_portionen-einspielen.ts` erzeugt daraus weiterhin 23.402 Zeilen in `nutrition.foods_portions`.

`[cmd]` Die Live-Prüfung meldet:

```text
Portionszeilen: 23402
Foods mit Portion: 7048
Foods ohne Portion: 92
Mehrfach-Defaults: 0
Fehlende Defaults: 0
OK: Pflichtfaelle und Struktur stimmen.
```

`[cmd]` Der Runnerlauf gegen die Wegwerf-Datenbank `lumeos_kette_20260816094926` lief mit 43 Schritten in 37,5 s durch. Schritt `029` meldete `OK: 23402 Portionszeilen fuer 7048 Foods; 92 Foods ohne Portion`.

`[cmd]` `kette-readme-pruefen.ts` meldet `README/Kette: ok (43 Schritte dokumentiert)`.

`[cmd]` `schema-vollstaendigkeit-pruefen.ts` meldet Exit 0. `foods_portions` steht seit C-50 in der Sollliste; C-51 ergänzt zusätzlich eine Spaltenliste für `meal_items`, damit die neuen Portions-Snapshot-Spalten geprüft werden.

## Herkunft

`[read]` Der Vorgängerbestand liegt in `referenz/lumeos-2026/scripts/seed-portions.py`, `referenz/lumeos-2026/supabase/migrations/002_create_nutrition_tables.sql` und `referenz/lumeos-2026/src/modules/nutrition/hooks/useFoodPortions.ts`.

`[cmd]` Das alte Seed-Skript ist 8.363 Byte groß und beschreibt universelle Portionen plus kategoriespezifische Portionen.

`[read]` Die Grammwerte im Vorgängerrepo tragen keine Quellenangabe. `[annahme]` Sie sind haushaltsübliche Schätzwerte. Deshalb steht in der neuen Datendatei `legacy_household` als Herkunft, und `meal_items.amount_g` bleibt die kanonische Rechengröße.

`[cmd]` Eine Repo-Suche fand keinen belastbaren BLS-Haushaltsmaß-Datensatz, aus dem diese Grammwerte direkt belegt werden könnten.

## Zuordnung

Entscheidung: Die Zuordnung läuft nicht über das alte Namensmuster, sondern über BLS-Warengruppen plus gezielte BLS-Code- und Namensselektoren.

`[cmd]` Gemessene Reichweite im aktuellen Bestand:

| Variante | Treffer |
|---|---:|
| Gesamtbestand | 7.140 |
| `nutrition.food_categories` vorhanden | 4.903 |
| alte Namensmuster aus dem Vorgängerrepo | 4.168 |
| BLS-Gruppenbasis ohne `R` | 7.043 |
| neue Portionszuordnung gesamt | 7.048 |

`[cmd]` Die Kategoriezuordnung ist für `N`, `X` und `Y` vollständig leer und bei `U`/`V` unvollständig. Genau diese Gruppen wären über Kategorien verloren gegangen: `N` 0/114, `X` 0/1.165, `Y` 0/885, `U` 668/685, `V` 406/462.

## Was aus dem Vorgängerrepo nicht passte

`[read]` Das alte Schema hängt an `public.foods` und einer UUID. Dieses Repo verwendet `nutrition.foods` mit `bls_code` als fachlichem Schlüssel.

`[read]` Das alte Seed-Skript ordnet über Namensmuster und Kategorien zu. `[cmd]` Diese Muster erreichen im aktuellen Bestand nur 4.168 von 7.140 Lebensmitteln.

`[read]` Das alte Skript schreibt direkt per `INSERT`. Der neue Stand trennt die kuratierte Datendatei (`portionen.json`) vom Kettenschritt (`029_portionen-einspielen.ts`).

`[read]` Das alte Schema hatte keine Herkunftsspalte. Der neue Schritt speichert `source`, `source_note` und `selector_id`, weil die Grammwerte nicht quellenbelegt sind.

## Welche Lebensmittel keine Portion bekommen

`[cmd]` 92 Lebensmittel haben keine Portion. Alle liegen in Warengruppe `R`.

`[cmd]` Beispiele: Speisesalz, Jodsalz, Essig, Senf, Ketchup, Sojasauce, Würzpasten, Tomatenmark, Glutamat, getrocknete Kräuter.

`[annahme]` Für diese Gruppe ist Gramm oder eine konkrete Rezeptmenge oft richtiger als eine pauschale Haushaltsportion.

`[cmd]` Vor C-51 hatten fünf `R`-Einträge Portionen, aber keine Vorgabe: `Vanillinzucker`, `Puddingpulver Vanille`, `Puddingpulver Schokolade`, `Tortenguss klar` und `Zucker-Butter-Zimt-Füllung`. Sie bekommen jetzt über das Set `r_zucker_backzutaten` die Vorgabe `1 Portion = 20 g`. Die Gesamtzahl der Portionszeilen bleibt gleich; nur die Default-Markierung ist ergänzt.

## Prüfskript

`[cmd]` `portionen-pruefen.ts` prüft die Pflichtfälle:

- `B101000` trägt `1 Scheibe`.
- `Q120000` trägt `1 EL`.
- `X912033` trägt `100 g`.
- `E111100` trägt `1 Ei (Größe M)`.
- `C352000` trägt `1 Portion roh`.
- Kein Food trägt zwei Vorgabeportionen.
- Jedes Food mit Portion trägt mindestens eine Vorgabeportion.
- Keine Portion hat `amount_g <= 0`.
- Keine Portion zeigt auf ein fehlendes Food.

## Schema-Sollstand

`[cmd]` `foods_portions` ist in `daten/schema-sollstand.json` eingetragen. C-51 trägt zusätzlich die Spaltenliste für `meal_items` ein.

| Bereich | Eintrag |
|---|---|
| Tabelle | `nutrition.foods_portions`, erzeugt durch Schritt `029` |
| Zeilenschutz | aktiviert |
| Policy-Bedingung | `oeffentlich` |
| Policies | `SELECT` für `authenticated` |
| GRANTs | `authenticated: SELECT`, `service_role: ALL` |
| Fremdschlüssel | `foods_portions.food_id -> nutrition.foods.id` |
| Mindestzeilen | 23.402, Beleg: `[cmd]` Schritt `029` und `portionen-pruefen.ts` |

## Was beim Einfrieren entschieden wurde

`[cmd]` C-51 ergänzt `nutrition.meal_items` um `portion_name`, `portion_quantity` und `portion_amount_g`. `amount_g` bleibt die kanonische Menge; die drei neuen Felder protokollieren die Eingabe.

Entscheidung: Es gibt keinen Fremdschlüssel von `meal_items` auf `foods_portions`. Der Kettenschritt `029` baut die Portionszeilen aus der Datendatei neu auf, und eine korrigierte Portionsdefinition darf alte Mahlzeiten nicht rückwirkend ändern. Deshalb wird die gewählte Portion als Snapshot gespeichert: Name, Anzahl und Gramm je Portion.

`[cmd]` Testfall in einer Rollback-Transaktion: `2 × 1 Scheibe` für `B101000` speicherte `amount_g=60`, `portion_quantity=2`, `portion_amount_g=30`. Nach einer temporären Änderung der Portionsdefinition `1 Scheibe` von 30 g auf 35 g blieb der Mahlzeiteneintrag bei `amount_g=60` und `portion_amount_g=30`; nur die Definitionszeile zeigte 35 g. Die Transaktion wurde zurückgerollt.

`[cmd]` Direkte Grammeingabe bleibt gültig: ein zweiter Testeintrag mit `amount_g=150` hatte alle drei Portionsfelder leer und erfüllte dieselbe Mengenprüfung.

`[read]` `foods_custom` führt eigene `serving_size_g` und `serving_name`. Für `meal_items` wird trotzdem dasselbe Snapshot-Feldpaar verwendet, weil die Herkunft bereits über `food_source`, `food_id` und `custom_food_id` feststeht. Eine getrennte Portionen-Herkunft würde die eingefrorene Menge nicht genauer machen.

`[read]` Die Schätzunsicherheit von MealCam ist nicht modelliert. Sie gehört zu `ADR_MEALCAM_V1` und entscheidet nicht darüber, welche Menge am Ende eingefroren wird.

## Was dieser Schritt nicht tut

`[read]` Portionen sind eine Eingabehilfe. Sie ändern keine Nährwerte und keine Mahlzeitenlogik.

`[cmd]` `meal_items.amount_g` bleibt unverändert die gespeicherte Menge. `foods_custom.serving_size_g` und `serving_name` wurden nicht angefasst.

`[annahme]` Eine spätere Oberfläche sollte die Portion anzeigen, aber beim Speichern weiterhin Gramm in `meal_items.amount_g` schreiben.
