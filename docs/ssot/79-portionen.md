# C-50/C-51/C-60 Portionsgrößen

Stand: 2026-08-17

## Ergebnis

`[cmd]` `supabase/_pipeline/daten/portionen.json` enthält 27 Portionssets. Der Kettenschritt `029_portionen-einspielen.ts` erzeugt daraus 23.402 Zeilen in `nutrition.foods_portions` für 7.048 Lebensmittel; 92 Lebensmittel haben keine Portion.

`[cmd]` Vor C-60 waren die Vorgaben praktisch wertlos: 7.043 von 7.048 Lebensmitteln hatten `100 g` als Default, nur 5 eine andere Vorgabe.

`[cmd]` Nach C-60 meldet `portionen-pruefen.ts`:

```text
Portionszeilen: 23402
Foods mit Portion: 7048
Foods ohne Portion: 92
Vorgabe ungleich 100 g: 5009
Vorgabe 100 g: 2039
Mehrfach-Defaults: 0
Fehlende Defaults: 0
OK: Pflichtfaelle und Struktur stimmen.
```

`[cmd]` Die vier Pflichtbeispiele stehen live so:

| Lebensmittel | Vorgabe | Gramm |
|---|---:|---:|
| `B101000` Vollkornbrot | 1 Scheibe | 30 g |
| `E111100` Ei (roh) | 1 Ei (Größe M) | 58 g |
| `F503100` Banane | 1 Stück (mittel) | 120 g |
| `Q120000` Olivenöl | 1 EL | 10 g |

`[cmd]` Der Runnerlauf gegen die Wegwerf-Datenbank `lumeos_kette_c63_c60` lief mit 47 Schritten in 41,4 s durch. Die Abschlussprüfung meldete `SCHEMA VOLLSTAENDIG`.

`[cmd]` Live nach dem Einspielen: `schema-vollstaendigkeit-pruefen.ts` Exit 0, `testdaten-pruefen.ts` Exit 0, `pnpm gate` 8/8.

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

## Welche Kategorie welche Vorgabe bekommt

`[read]` C-60 ändert nicht die Grammwahrheit, sondern die logische Vorauswahl. `100 g` bleibt kanonische Eingabehilfe, aber nicht mehr pauschaler Default.

`[cmd]` Die Default-Auswahl läuft je Lebensmittel über alle passenden Portionssets. Zuerst werden alle Kandidaten aus der Datendatei gesammelt; wenn ein kategoriespezifischer Default vorhanden ist, schlägt er `basis_100g`. So bleibt genau eine Vorgabe je Lebensmittel erhalten.

| Portionsset | Default |
|---|---|
| `brot` | 1 Scheibe |
| `backwaren_stueck` | 1 Stück |
| `obst_frucht` | 1 Stück (mittel) |
| `obst_saft` | 1 Glas |
| `gemuese` | 1 Stück (mittel) |
| `nuesse_samen` | 1 Handvoll |
| `getreide_roh` | 1 Portion Müsli |
| `reis` | 1 Portion roh |
| `getreidedrinks` | 1 Glas |
| `eier` | 1 Ei (Größe M) |
| `teigwaren` | 1 Portion roh |
| `kartoffeln` | 1 Stück (mittel) |
| `pilze` | 1 Portion |
| `milch_joghurt_quark` | 1 Glas |
| `kaese` | 1 Scheibe Käse |
| `fleisch` | 1 Portion |
| `gefluegel` | 1 Portion |
| `wurst` | 1 Scheibe |
| `fisch` | 1 Filet |
| `getraenke` | 1 Glas (200 ml) |
| `oele` | 1 EL |
| `butter_margarine_fette` | 1 Portion (dünn) |
| `zucker_sirup_honig` | 1 TL |
| `schokolade_suesswaren` | 1 Stück |
| `mehl_staerke` | 1 EL |
| `r_zucker_backzutaten` | 1 Portion |
| `basis_100g` | 100 g |

`[cmd]` 2.039 Lebensmittel behalten `100 g` als Vorgabe. `[annahme]` Das sind vor allem Fälle, bei denen eine pauschale Haushaltsportion zu viel behaupten würde: gemischte Zutaten, Halbfertigprodukte, Saucen/Würzmittel ohne besseres Set und Lebensmittel, bei denen Gramm die genauere Eingabe ist.

## Was aus dem Vorgängerrepo nicht passte

`[read]` Das alte Schema hängt an `public.foods` und einer UUID. Dieses Repo verwendet `nutrition.foods` mit `bls_code` als fachlichem Schlüssel.

`[read]` Das alte Seed-Skript ordnet über Namensmuster und Kategorien zu. `[cmd]` Diese Muster erreichen im aktuellen Bestand nur 4.168 von 7.140 Lebensmitteln.

`[read]` Das alte Skript schreibt direkt per `INSERT`. Der neue Stand trennt die kuratierte Datendatei (`portionen.json`) vom Kettenschritt (`029_portionen-einspielen.ts`).

`[read]` Das alte Schema hatte keine Herkunftsspalte. Der neue Schritt speichert `source`, `source_note` und `selector_id`, weil die Grammwerte nicht quellenbelegt sind.

## Welche Lebensmittel keine Portion bekommen

`[cmd]` 92 Lebensmittel haben keine Portion. Alle liegen in Warengruppe `R`.

`[cmd]` Beispiele: Speisesalz, Jodsalz, Essig, Senf, Ketchup, Sojasauce, Würzpasten, Tomatenmark, Glutamat, getrocknete Kräuter.

`[annahme]` Für diese Gruppe ist Gramm oder eine konkrete Rezeptmenge oft richtiger als eine pauschale Haushaltsportion.

`[cmd]` Vor C-51 hatten fünf `R`-Einträge Portionen, aber keine Vorgabe: `Vanillinzucker`, `Puddingpulver Vanille`, `Puddingpulver Schokolade`, `Tortenguss klar` und `Zucker-Butter-Zimt-Füllung`. Sie bekommen über das Set `r_zucker_backzutaten` die Vorgabe `1 Portion = 20 g`.

## Prüfskript

`[cmd]` Vor C-60 lief `portionen-pruefen.ts` grün, obwohl Vollkornbrot, Hühnerei, Banane und Olivenöl alle `100 g` als Vorgabe hatten. Die Prüfung sah nur fehlende und doppelte Defaults, nicht ob der Default sinnvoll war.

`[cmd]` C-60 ergänzt deshalb zwei Dinge: die Kennzahl `Vorgabe ungleich 100 g` und konkrete Default-Erwartungen für Vollkornbrot, Hühnerei, Banane und Olivenöl.

`[cmd]` Das Skript prüft jetzt:

- `B101000` trägt `1 Scheibe` und nutzt sie als Vorgabe.
- `Q120000` trägt `1 EL` und nutzt sie als Vorgabe.
- `E111100` trägt `1 Ei (Größe M)` und nutzt sie als Vorgabe.
- `F503100` trägt `1 Stück (mittel)` als Vorgabe.
- `X912033` trägt `100 g`.
- `C352000` trägt `1 Portion roh`.
- Kein Food trägt zwei Vorgabeportionen.
- Jedes Food mit Portion trägt mindestens eine Vorgabeportion.
- Keine Portion hat `amount_g <= 0`.
- Keine Portion zeigt auf ein fehlendes Food.

## Schema-Sollstand

`[cmd]` `foods_portions` ist in `daten/schema-sollstand.json` eingetragen. C-51 trug zusätzlich die Spaltenliste für `meal_items` ein.

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

## Sprachspalte

`[cmd]` C-63 ergänzt `public.profiles.locale text` in Schritt `090_profile.sql`. Die Spalte hat keinen Default, ist nullable und wird durch `profiles_locale_check` auf `NULL`, `de`, `en` oder `th` begrenzt.

`[read]` `NULL` bedeutet: Die Person wurde noch nicht gefragt. Ein Default wie `de` würde eine nicht getroffene Wahl wie eine echte Entscheidung aussehen lassen.

`[cmd]` Live nach dem Einspielen: `public.profiles` hat 14 Spalten, `locale` ist `YES` nullable, `column_default` ist leer, fünf bestehende Profile haben `count(locale)=0`. Ein negativer Test mit `locale='fr'` wurde durch den Check abgewiesen.

`[cmd]` Der Trigger `public.handle_new_user()` wurde nicht erweitert. Er legt Profile weiter nur mit `id` an; dadurch bleibt `locale` automatisch `NULL`. Der Nachzug für bestehende Nutzer bleibt ebenfalls unverändert und setzt keine Sprache.

## Was dieser Schritt nicht tut

`[read]` Portionen sind eine Eingabehilfe. Sie ändern keine Nährwerte und keine Mahlzeitenlogik.

`[cmd]` `meal_items.amount_g` bleibt unverändert die gespeicherte Menge. `foods_custom.serving_size_g` und `serving_name` wurden nicht angefasst.

`[cmd]` `foods_portions` wurde nicht umgebaut; C-60 ändert nur, welche vorhandene Portion als `is_default` markiert wird.

`[annahme]` Eine spätere Oberfläche sollte die Portion anzeigen, aber beim Speichern weiterhin Gramm in `meal_items.amount_g` schreiben.
