# C-150: Rezepte, Wochenplaene und Portionen

Stand: 2026-08-20

## Wie das Vorgaengerrepo es modelliert hat

[read] Gelesen wurden `referenz/lumeos-2026/supabase/migrations/006_portions_custom_foods_mealplans.sql`, `src/api/nutrition/routes/meal-plans.ts`, `src/api/nutrition/routes/recipes.ts`, `MealPlanView.tsx`, `RecipeBuilder.tsx`, `useMealPlans.ts` und `recipeStore.ts`.

[cmd] Das alte Modell hatte `meal_plans`, `meal_plan_days` und `meal_plan_items` gegen `public.foods` mit UUIDs. Planpositionen speicherten eigene Makro-Snapshots. RLS war teilweise hart auf eine Default-UUID gebaut und damit nicht uebernehmbar.

[read] Fuer dieses Repo passte das nicht direkt: `nutrition.foods` nutzt `bls_code` als fachlichen Schluessel, `foods_custom` ist getrennt, und `meal_items` friert Naehrwerte erst beim Erfassen ein. Deshalb wurde die Struktur uebernommen, aber nicht die zweite Naehrwert-Wahrheit aus dem alten Planmodell.

[annahme] Der Planner aus dem Mockup ist die Vorgabe. `MealPlansView` ist dort nicht definiert; der zweite Tab braucht deshalb eine eigene Produktklaerung statt einer stillen Tabellenentscheidung.

## Was die Tabellen tragen

[cmd] Neuer Kettenschritt: `supabase/_pipeline/05_user_tabellen/058b_recipes_meal_plans.sql`, eingetragen in `kette.json` und `supabase/README.md`.

[cmd] Neu sind sechs Tabellen: `nutrition.recipes`, `recipe_ingredients`, `meal_plans`, `meal_plan_weeks`, `meal_plan_days`, `meal_plan_entries`. Alle sechs tragen RLS mit Policies je Operation; `authenticated` sieht und schreibt nur eigene Zeilen.

[cmd] Funktionen: `food_nutrient_snapshot`, `recipe_nutrition`, `copy_meal_plan_week`, `meal_plan_day_to_diary`. Dazu vier Owner-Guard-Funktionen fuer die untergeordneten Tabellen.

[read] Rezepte speichern keine berechneten Naehrwerte als zweite Wahrheit. `recipe_nutrition()` rechnet aus den Zutaten. Zutaten koennen auf `foods` oder `foods_custom` zeigen. Beim Uebernehmen in das Tagebuch schreibt `meal_plan_day_to_diary()` normale `meals` und `meal_items` und friert erst dort `frozen_at`, Makros und `nutrients` ein.

[cmd] Testdaten live nach Kopie auf `dev@lumeos.app`: 3 Rezepte, 11 Rezeptzutaten, 1 Wochenplan, 3 Planwochen, 21 Plantage, 56 Planeintraege. `tom.seed@example.com` traegt dieselben Zahlen. `test-user@lumeos.local` traegt 0 Rezepte und 0 Plaene.

[cmd] RLS-Nachweis: als `dev@lumeos.app` sind 3 Rezepte und 1 Plan sichtbar; als `test-user@lumeos.local` sind 0 Rezepte und 0 Plaene sichtbar.

[cmd] Beispielrezept: `Huhn-Reis-Bowl` hat 4 Zutaten und rechnet auf 1.578,5 kcal sowie 132,7 g Protein fuer das ganze Rezept.

[read] Die G-72-Spalten werden teilweise bedient: `prep_time_max_min` kann gegen `recipes.prep_time_min` und `cook_time_min` filtern, `cooking_skill` gegen `recipes.cooking_skill`, `preferred_cuisines` gegen `recipes.cuisine_code`. Allergien, Intoleranzen, `diet_type`, Ausschluesse und Budget sind damit strukturell anschliessbar, aber noch nicht als Plan-/Rezeptbewertung gebaut.

## Wie eine Woche kopiert wird

[cmd] `copy_meal_plan_week(source_week_id, target_week_start)` kopiert eine Woche als Ganzes: Woche, sieben Tage und alle Planeintraege. Die Kopie schreibt `copied_from_week_id`, damit die Herkunft sichtbar bleibt.

[cmd] Nachweis live auf `dev@lumeos.app`: eine gefuellte Woche mit 28 Eintraegen, eine leere Woche mit 0 Eintraegen, eine kopierte Woche mit 28 Eintraegen.

[cmd] `meal_plan_day_to_diary()` wurde im Rollback getestet: ein geplanter Tag erzeugt 4 Mahlzeiten und 12 `meal_items`; alle 12 Positionen tragen `frozen_at` und eingefrorene Naehrwert-JSON.

[read] Damit geht die Uebernahme ohne Umbau an `meals` oder `meal_items`. Die neue Struktur schreibt in den bestehenden Tagebuchpfad, statt daneben einen zweiten Tagesbestand aufzubauen.

## Was der zweite Tab braeuchte

[cmd] Das Mockup ruft `window.MealPlansView`, aber diese Funktion ist dort nicht definiert. Der Planner selbst zeigt 7 Tage x 4 Slots, Wochennavigation, `Copy week` und `New recipe`; diese Faelle sind datenseitig gebaut.

[annahme] Der zweite Tab koennte eine Planbibliothek, eine Rezeptbibliothek, ein Archiv oder spaeter einen Generator meinen. Das sind verschiedene Lese- und Schreibpfade. Ohne Entscheidung wurde kein Generator gebaut.

[read] Ausdruecklich nicht gebaut: `meal-planner.ts` und `meal-plan-generator.ts` aus dem Vorgaengerrepo. Ein nutzergefuellter Plan ist ein Kalender; ein systemgenerierter Plan ist eine Ernaehrungsempfehlung und gehoert zu Buddy.

## Nachweis

[cmd] Kettenlauf auf Wegwerf-Datenbank `lumeos_kette_c150`: 75 Schritte, Exit 0. `schema-vollstaendigkeit-pruefen.ts`: Exit 0. `kette-readme-pruefen.ts`: ok mit 75 Schritten. `testdaten-pruefen.ts`: Exit 0.

[cmd] Live eingespielt: Schritt `058b`, danach `testdaten-einspielen.ts` und `eigenes-konto-fuellen.sql`. `schema-vollstaendigkeit-pruefen.ts` live: Exit 0. `testdaten-pruefen.ts` live: Exit 0.

[cmd] `pnpm gate` lief durch Encoding, Gruppenlabel, i18n und mehrere Paket-Tasks, scheiterte aber in `@lumeos/web:test` an zwei Frontend-Attrappen-Tests in `apps/web/src/components/shell/__tests__/v2-attrappen.test.ts`: Supplements erwartet 1 Attrappenmarke, findet 17; `TodayAttrappe` braucht laut Test eine Rueckfallmarke. Dieser Bereich wurde fuer C-150 nicht angefasst.

