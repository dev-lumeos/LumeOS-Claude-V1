# C-34: Eigene Lebensmittel

`[cmd]` Erhoben am 2026-08-15 gegen den lokalen Container
`supabase_db_LumeOS-Claude-V1`.

---

## Ergebnis

`[cmd]` Neuer Kettenschritt:
`supabase/_pipeline/05_user_tabellen/058_custom_foods.sql`.

`[cmd]` Der Schritt erzeugt `nutrition.foods_custom`, erweitert
`nutrition.meal_items` um `custom_food_id`, erlaubt
`food_source='custom'` und legt
`nutrition.custom_food_energy_plausibility(...)` an.

`[cmd]` `supabase/_pipeline/kette.json` enthaelt jetzt 38 Schritte.
`058` laeuft nach `057` und vor `060`; `060` haengt nun auch von `058`
ab. Die README-Kettentabelle ist synchron:

```
README/Kette: ok (38 Schritte dokumentiert)
```

`[cmd]` Backup vor dem Runner-Lauf:

```
backup/schema/20260815055234_c43_vor_kettenlauf.sql
```

`[cmd]` Der Runner-Lauf gegen die Wegwerf-Datenbank
`lumeos_kette_20260815055234` war gruen:

```
KETTE OK: 31.1s
```

---

## Tabelle und Rechte

`[read]` `ADR_CUSTOM_FOODS_V1.md` und
`SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md` verlangen eine vollstaendig von
`nutrition.foods` getrennte Tabelle. Deshalb gibt es keinen FK von
`foods_custom` nach `foods` und keinen Merge in den BLS-Bestand.

`[cmd]` `foods_custom` existierte nach dem Kettenlauf und war nach dem
Test-Cleanup leer:

| Pruefung | Ergebnis |
|---|---|
| `to_regclass('nutrition.foods_custom')` | `true` |
| `count(*) from nutrition.foods_custom` | `0` |

`[cmd]` Policies auf `foods_custom`:

| Operation | Policy |
|---|---|
| `SELECT` | `foods_custom_select` |
| `INSERT` | `foods_custom_insert` |
| `UPDATE` | `foods_custom_update` |
| `DELETE` | `foods_custom_delete` |

`[cmd]` `authenticated` hat `SELECT`, `INSERT`, `UPDATE`, `DELETE` auf
`foods_custom`; die RLS-Bedingung ist jeweils `auth.uid() = user_id`.
`service_role` hat Vollrechte.

`[read]` `is_public` und `shared_by` sind angelegt, aber werden in V1
nicht benutzt. Das entspricht der ADR: Public Sharing ist Phase 2.

---

## Meal Items

`[cmd]` `meal_items` traegt nach `058`:

| Constraint | Inhalt |
|---|---|
| `meal_items_custom_food_id_fkey` | `custom_food_id -> nutrition.foods_custom(id) ON DELETE RESTRICT` |
| `meal_items_food_source_check` | `food_source IN ('bls','manual','custom')` |
| `meal_items_source_target_check` | genau einer der Zustaende `bls`, `custom`, `manual` |

`[cmd]` Die Zielregel lautet:

```
bls    -> food_id gesetzt, custom_food_id leer
custom -> food_id leer, custom_food_id gesetzt
manual -> beide leer
```

`[cmd]` Der Test hat ein Custom Food, eine Mahlzeit und ein Meal Item mit
`food_source='custom'` eingefuegt. Das Meal Item trug die eingefrorenen
Werte fuer 50 g:

| Feld | Wert |
|---|---:|
| `enercc` | 185.0000 |
| `prot625` | 10.0000 |
| `fat` | 5.0000 |
| `cho` | 25.0000 |
| `fibt` | 1.5000 |

`[cmd]` `frozen_at` wurde gesetzt. Damit bleibt das bestehende
Snapshot-Prinzip erhalten: spaetere Korrekturen am Custom Food aendern
alte Tagebuchpositionen nicht rueckwirkend.

---

## Plausibilitaet

`[read]` Die Regel aus dem Entwurf wurde als Funktion umgesetzt, nicht
als Constraint: Protein und Kohlenhydrate je 4 kcal/g, Fett 9 kcal/g,
Alkohol 7 kcal/g, Warnschwelle 10 Prozent.

`[cmd]` Die Funktion blockiert nicht, sondern liefert ein Ergebnis:

| Fall | Eingabe | berechnet | Abweichung | plausibel |
|---|---|---:|---:|---|
| passend | `370, 20, 10, 50` | 370.00 | 0.0000 | `true` |
| falsch | `100, 20, 10, 50` | 370.00 | 0.7297 | `false` |

`[annahme]` Das faengt vor allem den Eingabefehler "je Portion statt je
100 g" ab. Es entscheidet nicht, ob ein Nutzer speichern darf.

---

## Tagesbilanz

`[read]` `053_daily_summary.sql` wurde nicht angefasst.

`[cmd]` Der Test-Meal-Item-Snapshot erschien in `daily_summary`:

| Feld | Wert |
|---|---:|
| `meal_count` | 1 |
| `item_count` | 1 |
| `enercc` | 185.0000 |
| `prot625` | 10.0000 |
| `fat` | 5.0000 |
| `cho` | 25.0000 |
| `enercc_missing` | 0 |
| `prot625_missing` | 0 |
| `fat_missing` | 0 |
| `cho_missing` | 0 |
| `sugar_missing` | 1 |

`[cmd]` Das bestaetigt den Entwurf: Die Tagesbilanz muss BLS-EAV und
Custom-Flat nicht direkt zusammenfuehren, solange der Logging-Pfad die
Snapshot-Spalten auf `meal_items` setzt.

`[annahme]` Was damit noch nicht geloest ist: optionale Mikronaehrstoffe
aus `foods_custom` werden nicht in einer Mikro-Tagesbilanz aggregiert.
Dafuer braucht es spaeter eine JSONB- oder Spalten-Aggregation mit
Abdeckungsgrad.

---

## Schemapruefung und Sollliste

`[cmd]` `schema-vollstaendigkeit-pruefen.ts` gegen die Wegwerf-Datenbank:
Exit 0, `SCHEMA VOLLSTAENDIG`.

`[cmd]` Erwartete Hinweise, weil `daten/schema-sollstand.json` laut
Auftrag nicht angefasst wurde:

```
Tabellen: foods_custom steht da, aber NICHT in der Sollliste
Funktionen: custom_food_energy_plausibility steht da, aber NICHT in der Sollliste
```

`[annahme]` In `daten/schema-sollstand.json` waere nachzutragen:

| Art | Eintrag |
|---|---|
| Tabelle | `foods_custom`, Schritt `058`, RLS `true`, Policies `SELECT/INSERT/UPDATE/DELETE`, Bedingungsart `eigene_zeilen` |
| Grants | `authenticated: SELECT/INSERT/UPDATE/DELETE`; `service_role: ALL` |
| Funktion | `custom_food_energy_plausibility`, Schritt `058` |
| Trigger | `foods_custom.foods_custom_touch_updated_at`, Schritt `058` |
| Fremdschluessel | `meal_items_custom_food_id_fkey`, Schritt `058` |

`[cmd]` Die Sollliste selbst wurde nicht geaendert.

---

## Cleanup

`[cmd]` Die Testdaten wurden geloescht:

| Tabelle | Rest fuer Test-User |
|---|---:|
| `foods_custom` | 0 |
| `meals` | 0 |
| `meal_items` | 0 |

`[cmd]` Die Wegwerf-Datenbank `lumeos_kette_20260815055234` wurde nach
dem Test verworfen.

---

## Was noch fehlt, bis ein Nutzer etwas anlegen kann

`[annahme]` Es fehlt zuerst ein Schreibpfad in `apps/web`: Formular,
Validierung und Supabase-Insert nach `nutrition.foods_custom`.

`[annahme]` Der Logging-Pfad muss Custom Foods laden, auf `amount_g`
skalieren und dieselben `meal_items`-Snapshot-Spalten setzen wie bei BLS.
Der Datenbanktest zeigt, dass die Bilanz dann funktioniert; gebaut ist
dieser Pfad noch nicht.

`[annahme]` Die Food-Suche muss BLS-Foods und eigene Custom Foods
gemeinsam anzeigen und Custom Foods als eigene Eintraege kennzeichnen.
Der aktuelle Schritt aendert `food_search` nicht.

`[annahme]` Die Plausibilitaetsfunktion muss in der Oberflaeche oder im
spaeteren Admin-Review aufgerufen werden. Heute existiert sie nur als
DB-Funktion.

`[annahme]` Admin-Freigabe ist weiter offen: entweder Sichtbarkeit in
`foods_custom` oder Kopie in einen zentralen Bestand. `is_public` und
`shared_by` halten Phase 2 offen, entscheiden sie aber nicht.

`[annahme]` `thai_food` bleibt leer. Eigene Lebensmittel koennen spaeter
der erste Ort sein, an dem Thai-Eintraege entstehen, aber dieser Schritt
legt keine Tag-Achse fuer Custom Foods an.
