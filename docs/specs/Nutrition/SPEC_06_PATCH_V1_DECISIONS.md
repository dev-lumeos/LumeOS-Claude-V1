# SPEC_06 — Korrektur-Patch April 2026
# Datei: SPEC_06_DATABASE_SCHEMA.md — Korrektur-Notizen

## Status: EINGEARBEITET in SPEC_06_DATABASE_SCHEMA.md

Dieser Patch dokumentiert die Korrekturen die in SPEC_06 eingearbeitet wurden:

---

## Fix 1 — food_categories.name_th ergänzt ✅

```sql
CREATE TABLE nutrition.food_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name_de     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  name_th     TEXT,           -- NEU: Thai-Name, darf leer sein
  parent_id   UUID REFERENCES nutrition.food_categories(id),
  level       INTEGER NOT NULL CHECK (level IN (1,2,3,4)),
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0,
  bls_hint    TEXT
);
```

---

## Fix 2 — foods_custom.source: openfoodfacts entfernt ✅

Alt (falsch):
```sql
source TEXT DEFAULT 'user' CHECK (source IN ('user','mealcam','openfoodfacts'))
```

Neu (korrekt):
```sql
source TEXT DEFAULT 'user' CHECK (source IN ('user','manual','import','admin'))
```

Begründung: OpenFoodFacts ist nicht Teil von V1. Barcode-basierter Import ist Phase 2.
Neue Werte: user (manuell erstellt), manual (direkte Eingabe), import (Import-Pipeline), admin (Admin-gepflegt).

---

## Fix 3 — Shopping Lists Tabellen als Schema-only ✅

shopping_lists und shopping_list_items Tabellen existieren in SPEC_06.
V1: Nur Schema. Keine V1-Pflicht für UI oder API.

---

## Neue Tabellen hinzugefügt ✅

### nutrient_reference_values

Speichert RDA/AI/UL pro Nährstoff, Alter, Geschlecht.
V1 aktiv: Alter + Geschlecht.
V1 schema-vorbereitet aber nicht aktiv: Schwangerschaft, Stillzeit.

Warum: Micronutrient Review braucht per-Nährstoff-Logik mit UL.
Keine Hardcoding im Scoring-Code.

### food_portions

Portionsgrößen pro Food (Stück, Scheibe, Glas etc.).
User recent portions.
Custom food portions.

Warum: V1 braucht gram-based canonical calculation mit Portionsgrößen-Support.

### mealcam_scans

MealCam ist V1. Scans brauchen eigene Tabelle für:
- Originalbild
- Erkannte Items mit Confidence
- User-Korrekturen
- Training-Freigabe (Opt-in)

---

## Nicht-Fixes (bewusst offen gelassen)

- Rezepte source 'buddy' fehlt noch in recipe.source CHECK → wird separat in ADR_RECIPE_SOURCE_BUDDY.md behandelt
