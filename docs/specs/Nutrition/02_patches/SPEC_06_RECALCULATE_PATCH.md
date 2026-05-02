# SPEC_06 — Meal Item Snapshot / Recalculate / Audit Patch
# docs/specs/Nutrition/SPEC_06_RECALCULATE_PATCH.md
# Schließt CRIT-4 aus OPUS_REVIEW_NUTRITION_02_DATA_API.md

> Stand: Mai 2026 | Pass 2 Korrektur

---

## Kontext

Das Snapshot-Prinzip (meal_items.nutrients JSONB ist eingefroren beim Logging)
war bereits in SPEC_01 und SPEC_02 definiert, aber das Recalculate-Modell
und der zugehörige API-Endpoint fehlten.

---

## Regel: Snapshot-Stabilität

```
Einmal erstellt, ändert sich ein Meal Item Snapshot NIE automatisch.

Wenn sich Food-Daten in nutrition.foods oder nutrition.foods_custom ändern:
  → Bestehende meal_items.nutrients bleiben unverändert.
  → Alte Diary-Einträge bleiben stabil.
  → User kann explizit neu berechnen lassen (Recalculate).
```

Begründung: Historische Diary-Daten müssen stabil sein.
Ein Nährwert-Import-Update in BLS darf keine alten Tagebucheinträge rückwirkend ändern.

---

## Schema-Ergänzung: meal_items Audit-Spalten

Diese Spalten sind bereits in SPEC_06_V1_MIGRATION.sql unter FIX 4 enthalten:

```sql
ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS snapshot_version  INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS data_source        TEXT DEFAULT 'bls'
    CHECK (data_source IN ('bls','custom','mealcam','manual')),
  ADD COLUMN IF NOT EXISTS scan_id            UUID REFERENCES nutrition.mealcam_scans(id);
```

**Ergänzung:** Recalculate-History als JSON-Spalte:

```sql
ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS snapshot_history   JSONB DEFAULT '[]';
  -- Format:
  -- [
  --   {
  --     "version": 1,
  --     "nutrients": { "ENERCC": 52.3, ... },
  --     "recalculated_at": "2026-05-01T10:00:00Z",
  --     "reason": "initial"
  --   },
  --   {
  --     "version": 2,
  --     "nutrients": { "ENERCC": 54.1, ... },
  --     "recalculated_at": "2026-05-02T08:30:00Z",
  --     "reason": "user_recalculate",
  --     "food_data_version": "bls_import_2026_04"
  --   }
  -- ]
```

Die History enthält immer den vorherigen Snapshot bevor er überschrieben wird.
`snapshot_version` zählt hoch bei jedem Recalculate.

---

## API-Endpoint: Recalculate Meal Item

### `POST /api/nutrition/meal-items/:id/recalculate`

Berechnet den Nährstoff-Snapshot eines Meal Items neu auf Basis der aktuellen Food-Daten.

**Auth:** JWT des Users (muss Owner des Meal Items sein)

**Body:** leer (keine Parameter nötig)

**Was intern passiert:**

```
1. meal_item laden (mit food_id oder custom_food_id)
2. Aktuellen Nährstoffstand laden:
   - food_id → aus nutrition.food_nutrients
   - custom_food_id → aus nutrition.foods_custom Makro-Spalten
3. Neuen Nährstoff-Snapshot berechnen:
   value = food_nutrient.value × (amount_g / 100.0)
4. Alten Snapshot in snapshot_history sichern:
   history.push({ version: item.snapshot_version, nutrients: item.nutrients, ... })
5. meal_item.nutrients = neuer Snapshot
6. meal_item.snapshot_version += 1
7. meal_item.updated_at = now()
8. Makro-Direktspalten (enercc, prot625, ...) aktualisieren
9. Speichern
```

**Seiteneffekte:** Keine automatischen Folge-Updates. Tages-Aggregate werden
beim nächsten Read aus meal_items neu gebildet.

**Response:**

```json
{
  "ok": true,
  "data": {
    "meal_item_id": "uuid",
    "snapshot_version": 2,
    "previous_enercc": 52.3,
    "new_enercc": 54.1,
    "diff_enercc": 1.8,
    "recalculated_at": "2026-05-02T08:30:00Z"
  }
}
```

**Fehlerfall — food_id nicht mehr vorhanden:**

```json
{
  "ok": false,
  "error": "FOOD_NOT_FOUND",
  "message": "Das ursprüngliche Food existiert nicht mehr. Bitte Meal Item manuell anpassen."
}
```

**Fehlerfall — custom_food ohne Mikronährstoffe:**

```json
{
  "ok": true,
  "data": {
    "meal_item_id": "uuid",
    "snapshot_version": 2,
    "warning": "MICROS_UNAVAILABLE",
    "warning_message": "Custom Food hat keine Mikronährstoffe — nur Makros neu berechnet."
  }
}
```

---

## API-Endpoint: Recalculate alle Items eines Meal

### `POST /api/nutrition/meals/:id/recalculate`

Berechnet alle Meal Items eines Meals neu.

**Body:** leer

**Response:**

```json
{
  "ok": true,
  "data": {
    "meal_id": "uuid",
    "items_recalculated": 3,
    "items_failed": 0,
    "items_skipped": 0,
    "summary": {
      "previous_total_kcal": 650.2,
      "new_total_kcal": 657.8,
      "diff_kcal": 7.6
    }
  }
}
```

---

## Regeln

```
1. Recalculate ist IMMER explizit — keine automatische Neuberechnung.
2. Alte Snapshots werden in snapshot_history gesichert (keine Löschung).
3. snapshot_version zählt bei jedem Recalculate hoch.
4. Wenn food_id nicht mehr in foods vorhanden → Fehler, kein silent Drop.
5. Wenn Custom Food geändert wurde → neue Makros, aber nur wenn User explizit recalculated.
6. MealCam-Items (food_source='mealcam') können genauso recalculated werden wie BLS-Items.
7. Manual-Items (food_source='manual', kein food_id) → kein Recalculate möglich (no-op).
```

---

## Klärung: food_source vs. data_source Doppelung

In SPEC_06_V1_MIGRATION.sql FIX 4 wurden beiden Spalten hinzugefügt:

```sql
food_source   TEXT  -- Original-Spalte aus SPEC_06 Hauptschema
data_source   TEXT  -- Neue Spalte aus Pass 1 Migration
```

**Entscheidung (verbindlich):**

`food_source` ist die **primary** Spalte — bestimmt Herkunft des Foods:
```
'bls'    → BLS 4.0 Food (food_id referenziert nutrition.foods)
'custom' → User Custom Food (custom_food_id referenziert nutrition.foods_custom)
'mealcam'→ Via MealCam erkannt und bestätigt (scan_id gesetzt)
'manual' → Quick-Add ohne Food-Referenz (food_id und custom_food_id sind NULL)
```

`data_source` ist **redundant** und wird in Pass 2 NICHT weiter befüllt.
Grund: Ein MealCam-Item hat `food_source='mealcam'` UND `food_id` → BLS-Daten.
Der BLS-Datenstrang ist in `food_source` implizit. `data_source` wäre verwirrend.

**Konsequenz:** `data_source` Spalte existiert im Schema (Migration wurde ausgeführt),
wird aber nicht durch die API befüllt. Zukünftige Cleanup-WO kann sie entfernen.

---

## Offene Punkte

```
[ ] Recalculate-UI in Meal Item Editor ergänzen
    (SPEC_10: "Neu berechnen" Button wenn Food-Daten neuer als Snapshot)
[ ] Batch-Recalculate für gesamten Tag (optional V1)
[ ] data_source Spalte in zukünftiger Cleanup-WO entfernen (low priority)
```
