# backup/

Sicherungen der lokalen Supabase-Datenbank `supabase_db_LumeOS-Claude-V1`.

**Angelegt:** 2026-08-01
**Anlass:** Das Live-Schema `nutrition` ist ausserhalb der Migrationspipeline
entstanden. `[cmd]` Das Migrations-Register `supabase_migrations.schema_migrations`
enthält genau einen Eintrag (`20260423120000_control_plane_tables`), während
11 Nutrition-Tabellen mit rund 727.000 Zeilen existieren.
Vier davon stehen in gar keiner Migrationsdatei.

**Konsequenz:** Es gibt keinen Weg von `git clone` zu dieser Datenbank.
Ein `supabase db reset` würde den Datenbestand unwiederbringlich löschen.
Deshalb steht `supabase db reset` in `.claude/settings.json` unter `deny`.

---

## Ordner

| Ordner | Inhalt | In Git? |
|---|---|---|
| `schema/` | Reine DDL-Dumps je Schema, klein, diff-bar | ja |
| `data/` | Vollständige Dumps inkl. Daten (`--format=custom`) | **nein**, siehe `.gitignore` |
| `rescue/` | DDL der Tabellen ohne Migrationsdatei — Vorlage für Rückbau | ja |
| `rollen/` | Rollen- und Grant-Dumps (noch leer) | ja |

## Namensschema

`JJJJ-MM-TT_bereich_art.sql` bzw. `.dump`

---

## Bestand 2026-08-01

| Datei | Grösse | Inhalt |
|---|---|---|
| `schema/2026-08-01_nutrition_schema.sql` | 21 KB | DDL Schema `nutrition`, 11 Tabellen |
| `schema/2026-08-01_public_schema.sql` | 17 KB | DDL Schema `public`, Control-Plane |
| `data/2026-08-01_nutrition_full.dump` | 5,8 MB | Vollsicherung `nutrition`, custom format |
| `rescue/2026-08-01_verwaiste_tabellen.sql` | 10 KB | DDL der 4 Tabellen ohne Migration |

`[cmd]` Integrität geprüft mit `pg_restore --list`: alle 11 Tabellen im Dump lesbar.

### Die vier verwaisten Tabellen

Existieren in der DB, aber in keiner Datei unter `supabase/migrations/`:

- `nutrition.food_preferences` (14 Spalten)
- `nutrition.food_preference_items` (13 Spalten)
- `nutrition.food_curation_candidates` (12 Spalten)
- `nutrition.food_curation_decisions` (6 Spalten)

`food_preferences` und `food_preference_items` sind laut `docs/todo/TODO.md`
Punkt C-02.1 noch zu bauen — sie sind aber bereits vorhanden. Die Entscheidung
zu ADR-002 (Tabellendesign) wurde faktisch in der Datenbank getroffen und
nirgends dokumentiert.

---

## Wiederherstellung

```
docker cp backup/data/JJJJ-MM-TT_nutrition_full.dump supabase_db_LumeOS-Claude-V1:/tmp/r.dump
docker exec supabase_db_LumeOS-Claude-V1 pg_restore -U postgres -d postgres --clean --if-exists /tmp/r.dump
```

**Ungeprüft.** Ein Dump, der nie zurückgespielt wurde, ist kein Backup —
nur eine Datei. Der Restore-Test in eine leere Datenbank steht aus
(`docs/todo/TODO.md`, D-11).
