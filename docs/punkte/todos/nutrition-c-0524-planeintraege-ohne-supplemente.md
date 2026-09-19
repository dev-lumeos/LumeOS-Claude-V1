---
nr: C-524
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-483
entscheidung: E-84
beruehrt:
  tabellen: [nutrition.meal_plan_entries]
zahlen:
  gemessen: 2026-09-19
---

# C-524 - Planeintraege koennen keine Supplemente

## Befund

`nutrition.meal_plan_entries` trägt kein Supplementfeld. Sein
`entry_type_check` erlaubt ausschließlich `recipe`, `bls` und `custom`; der
`target_check` verlangt dazu jeweils genau ein Rezept, BLS-Food oder Custom
Food. Ein Supplement kann daher heute weder als eigener Planeintrag noch als
zulässiges Ziel gespeichert werden.

Live: 756 Planeinträge, 7 Rezepte, ein Supplement-Rezeptbestandteil und eine
`recipe_product_references`-Zeile. Es gibt acht Planlogs und drei Einnahmen
mit Mahlzeitenbezug.

## Messung der zwei Bauformen

| Bauform | Semantik | Befund für den Plan |
|---|---|---|
| `meal_items.supplement_intake_log_id` | erfolgte Einnahme mit historischem Snapshot | ungeeignet: ein Planeintrag ist nur Absicht; ein Intake vor der Bestätigung würde die Einnahme behaupten |
| `recipe_ingredients` + `supplements.recipe_product_references` | Produktabsicht mit Menge, noch ohne Einnahme | passend als Vorbild |

Die vorhandene Referenztabelle kann nicht direkt wiederverwendet werden: ihr
pflichtiger und eindeutiger Fremdschlüssel ist
`recipe_ingredient_id -> nutrition.recipe_ingredients(id)`. Sie hat keinen
Bezug zu `meal_plan_entries`.

## Empfehlung, keine Umsetzung

Die passende Form ist eine parallele Absichts-Referenz im Supplements-Schema,
zum Beispiel `supplements.meal_plan_product_references`, mit einem eindeutigen
Verweis auf `nutrition.meal_plan_entries` sowie Produkt, Portion und Anzahl.
Sie folgt der Rezept-Bauform, erzeugt aber bis zur Bestätigung keinen
`intake_logs`-Satz. Das hält das Produkt im Supplements-Schema und vermeidet
eine vorgetäuschte Einnahme.

Diese Messung baut keine Tabelle und ändert keine Daten.

## Ghost-Bestätigung heute

Der aktuelle Weg bestätigt nur Lebensmittel:

1. `planEintragBestaetigen` liest bei direkten Positionen `food_id` und
   `amount_g`; bei Rezepten liest es aus `recipe_ingredients` ebenfalls nur
   `food_id, amount_g`.
2. Es erstellt bzw. nutzt die Mahlzeit und schreibt jeden Lebensmittelposten
   mit `addMealItem`.
3. Danach schreibt es `nutrition.meal_plan_logs` mit `actual_meal_id`.

Der Weg liest keine `supplements.recipe_product_references` und ruft weder
`supplements.record_supplier_product_intake` noch eine äquivalente
Einnahmefunktion auf. Ein künftiger Supplement-Planeintrag würde deshalb
heute weder im Ghost erscheinen noch beim Bestätigen einen `intake_log`
erzeugen. Genau diese zwei Erweiterungen wären mit der späteren Umsetzung
nötig; die Reihenfolge bleibt: tatsächliche Mahlzeit, tatsächlicher Intake mit
`meal_id`, dann Planlog.

`nutrition.meal_plan_day_to_diary` ist keine Alternative: Die Funktion ist
ein Seed-Werkzeug ohne Aufrufer aus `apps/`, schreibt nur BLS/Custom-Foods und
setzt `entry_source = 'seed'`.

## Kapsel-Gegenprobe

Der Bestand kennt am Planeintrag keine Supplementform. Auch
`supplements.add_supplier_product_to_recipe` akzeptiert jedes
`supplier_product_id`; die gemessenen Constraints enthalten keine Formregel.
Eine Kapsel kann daher heute nicht als Planeintrag auftreten, und die Regel
„nur untermischbare“ ist datenseitig noch nicht entscheidbar. Sie darf bei der
späteren Umsetzung nicht still geraten werden; dafür braucht es eine von Tom
festgelegte, überprüfbare Formregel.

## Abnahmebedingungen

| Kriterium | Stand |
|---|---|
| A1 | Absichts-Referenz als passende Bauform gemessen und begründet |
| A2 | offen, benötigt Toms Entscheidung und Umsetzung |
| A3 | offen; heutiger Ghost kennt keine Supplemente |
| A4 | offen; heutige Bestätigung erzeugt keinen Intake für Supplemente |
| A5 | heutiger Lebensmittelplan unverändert gemessen |
| A6 | keine Formregel im Datenmodell; gemeldet, nicht geraten |
| A7 | nicht ausgelöst: Messauftrag ohne Schemaänderung |

## Bericht

**2026-09-19. Gemessen und empfohlen, nicht gebaut.**
