# WO Template: Migration (DB Schema Änderung)

# NUR für human-initiierte WOs (created_by: human)

# Routing: → Spark B + DB-Check (Spark D wenn verfügbar)

# ACHTUNG: requires_schema_change: true — nur Tom darf das setzen

```yaml
id: "WO-<YYYYMMDD>-<NNN>"
title: "Add <beschreibung> to <tabelle>"

type: migration
module: <nutrition|training|...>
complexity: <low|medium|high>
risk: <low|medium>                  # high → geht zu Spark A für Review
requires_reasoning: false
requires_schema_change: true        # NUR human=true erlaubt das
db_access: migration
created_by: human                   # PFLICHT bei requires_schema_change

files_allowed:
  - "supabase/migrations/**"
  - "<services/die/geändert/werden/**>"

files_blocked:
  - "supabase/migrations/**/*.sql"  # Block löschen wenn Migration nötig — Classifier erlaubt explizit

acceptance_criteria:
  - "Migration läuft ohne Fehler: supabase db reset"
  - "Migration ist reversibel (DOWN migration vorhanden)"
  - "RLS Policies aktualisiert"
  - "Bestehende Daten nicht beschädigt"
  - "TypeScript Types aktualisiert"
```

## Wann nutzen?

- Neue Tabellen erstellen
- Spalten hinzufügen/ändern
- Enum-Werte hinzufügen
- RLS Policies ändern
- Indexes hinzufügen

## Wann NICHT nutzen?

- `DROP COLUMN` → Immer Human Review, kein WO
- `DROP TABLE` → Niemals via WO
- Produktionsdaten migrieren → Manuell

## Migration Naming Convention

```
supabase/migrations/
  YYYYMMDD_HHMMSS_<beschreibung>.sql

Beispiele:
  20260424_120000_add_meal_tags_to_meal_items.sql
  20260424_130000_add_training_session_notes.sql
```

## Migration Template (SQL)

```sql
-- Migration: YYYYMMDD_HHMMSS_<beschreibung>
-- Description: <was diese Migration macht>
-- Reversible: YES

-- UP
ALTER TABLE <tabelle>
  ADD COLUMN IF NOT EXISTS <spalte> <typ> <constraints>;

-- Index falls nötig
CREATE INDEX IF NOT EXISTS idx_<tabelle>_<spalte>
  ON <tabelle>(<spalte>);

-- DOWN (für Rollback dokumentieren)
-- ALTER TABLE <tabelle> DROP COLUMN IF EXISTS <spalte>;
```

## Beispiel

```yaml
id: "WO-20260501-001"
title: "Add meal_tags column to meal_items table"
type: migration
module: nutrition
complexity: low
risk: low
requires_reasoning: false
requires_schema_change: true
db_access: migration
created_by: human
files_allowed:
  - "supabase/migrations/**"
  - "packages/types/src/**"
  - "services/nutrition-api/src/**"
acceptance_criteria:
  - "Migration 20260501_*_add_meal_tags.sql erstellt"
  - "supabase db reset läuft sauber durch"
  - "meal_items Tabelle hat meal_tags TEXT[] Spalte"
  - "RLS Policy erlaubt Service-Role Zugriff"
  - "MealItem TypeScript Interface aktualisiert"
```
