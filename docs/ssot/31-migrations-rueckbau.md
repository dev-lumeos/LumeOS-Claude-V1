# Migrations-Rückbau (D-12) — Entwurf und Befund

**Stand:** 2026-08-02 (erste Fassung, autonome Sitzung)
**Ankerhash:** 76c8080
**Methode:** `[cmd]` Container `supabase_db_LumeOS-Claude-V1` read-only abgefragt
(pg_extension, pg_proc, pg_trigger, pg_indexes, pg_class.relrowsecurity,
pg_policies, information_schema, table_privileges, Zeilenzählungen);
`[read]` alle 7 Migrationsdateien, beide Backup-Dumps, p1-005-SQL-Dateien.
**Ergebnis:** 6 Entwurfsdateien in `supabase/migrations-draft/` — **nicht angewendet**.

---

## 1. Was rekonstruiert wurde

Ziel von D-12: Migrationsdateien, mit denen `supabase db reset` den heutigen
Datenbankzustand reproduziert. Die Draft-Sequenz bildet den **verifizierten
Container-Ist-Zustand** ab — nicht das, was die historischen Dateien beschreiben.
Wo beides abweicht, gewinnt der Container; jede Abweichung ist unten dokumentiert.

### Die Draft-Sequenz (Anwendungsreihenfolge)

| # | Datei | Inhalt |
|---|---|---|
| 1 | `20260802000100_nutrition_schema_foundation.sql` | Schema `nutrition`, pgcrypto. **Ohne** pg_trgm, **ohne** Grants (Container hat beides nicht) |
| 2 | `20260802000200_nutrition_eav_core_tables.sql` | Die 7 EAV-Tabellen exakt in Container-Gestalt, inkl. aller Indizes und FKs. **Ohne** RLS, Trigger, Funktion, Makro-Spalten |
| 3 | `20260802000300_nutrition_food_preferences.sql` | Verwaiste Tabellen 1+2: `food_preferences`, `food_preference_items` + die einzigen 2 RLS-Policies (`auth.uid()`) |
| 4 | `20260802000400_nutrition_food_curation.sql` | Verwaiste Tabellen 3+4: `food_curation_candidates`, `food_curation_decisions` |
| 5 | `20260802000500_control_plane_tables.sql` | Kopie der registrierten Governance-Migration (Enums, 4 Tabellen, RLS ohne Policies, Trigger) |
| 6 | `20260802000600_wo_classifier_fields.sql` | Kopie der Classifier-Felder (12 Spalten, 3 Indizes auf `workorders`) |

Jede Datei trägt einen kommentierten DOWN-Block (Regel aus `.claude/rules/database.md`).

**Daten sind nicht Teil der Drafts.** Die Seeds und der BLS-Bestand
(138 `nutrient_defs`, 16 `tag_definitions`, 518 Kategorien, 7.140 `foods`,
698.092 `food_nutrients`, 21.420 Aliase, 9.265 Tags) kommen aus
`backup/data/2026-08-01_nutrition_full.dump`. Ob Kernkataloge
(`nutrient_defs`, `tag_definitions`) stattdessen in eine Seed-Migration oder
`supabase/seed.sql` gehören, ist offene Frage O-5.

---

## 2. Neue Befunde aus der Container-Verifikation (2026-08-02)

Alle `[cmd]`, sofern nicht anders markiert:

1. **pg_trgm ist nicht installiert.** `pg_extension` enthält: pg_graphql,
   pg_net, pg_stat_statements, pgcrypto, plpgsql, supabase_vault, uuid-ossp.
   Damit lief `20240522_001` nicht (oder nicht vollständig) — die Datei
   installiert pg_trgm. Alle trgm-GIN-Indizes aus `20240522_002` fehlen folgerichtig.
2. **Keine Grants, keine Schema-ACL.** `pg_namespace.nspacl` für `nutrition`
   ist NULL; `information_schema.table_privileges` liefert **null Zeilen** für
   authenticated/service_role/anon auf nutrition-Tabellen. Die `GRANT`-Blöcke
   aus `20240522_001/_002` sind nirgends wirksam. Konsequenz: `authenticated`
   kann das Schema derzeit gar nicht benutzen — unabhängig von RLS.
3. **Keine Funktionen, keine Trigger im Schema `nutrition`.** `pg_proc`/
   `pg_trigger` leer. `auto_tag_food()` und `trg_foods_auto_tag` aus
   `20240522_002` existieren nicht. Die 9.265 `food_tags`-Zeilen entstanden
   also nicht durch diesen Trigger, sondern anderweitig (`[annahme]` Import-Pipeline).
4. **`20260424_002` (Classifier-Felder) lief ebenfalls am Register vorbei.**
   `workorders` hat 37 Spalten (25 Basis + 12 Classifier), das Register enthält
   aber nur `20260423120000`. Bisher galt nur das Nutrition-Schema als
   außerhalb der Pipeline entstanden — es sind auch Teile von `public`.
5. **Herkunft der „fehlenden" foods-Spalten geklärt:**
   `docs/project/p1-005/P1-005-local-food-human-layer.sql` `[read]` enthält
   exakt die ALTERs (`name_display_en`, `name_display_th`, `category_id`,
   `processing_level`, `is_prepared_dish`), das CREATE für `food_categories`
   (mit `name_en DEFAULT ''` — die Abweichung zu `20240522_002`!),
   `tag_definitions`, `food_tags`, `food_aliases` und den Index
   `idx_food_aliases_food`, der in keiner Migrationsdatei steht.
6. **Thai-Spalten sind leer.** 0 von 138 `nutrient_defs` haben `name_th <> ''`.
   Die i18n-Slice legte nur Struktur an, kein Inhalt folgte.
7. **Duplikat-Index:** `foods_sort_weight_idx` und `idx_foods_sort_weight`
   existieren beide auf `foods(sort_weight DESC)`. In den Drafts reproduziert (O-4).
8. **Public-RLS bestätigt:** alle 4 Governance-Tabellen RLS an, 0 Policies.

### Die tatsächliche Entstehungskette des Containers

Aus 2.–5. ergibt sich (Struktur, nicht Register):

| Schritt | Quelle | Belegt durch |
|---|---|---|
| 1 | `20260423120000` Control-Plane | `[cmd]` einziger Registereintrag |
| 2 | `20260424_002` Classifier-Felder | `[cmd]` 37 Spalten, nicht registriert |
| 3 | Slice `20260513_001` (nutrient_defs) | `[cmd]` Tabelle + `nutrient_defs_group_sort_idx` vorhanden |
| 4 | Slice `20260513_002` (th-Spalten) | `[cmd]` `name_th`/`group_th` vorhanden, leer |
| 5 | Slice `20260514_001` (foods, food_nutrients) | `[cmd]` Basisspalten + die 4 Slice-Indizes vorhanden |
| 6 | `docs/project/p1-005/P1-005-local-food-human-layer.sql` | `[read]` DDL deckt exakt die restlichen Objekte; Anwendung `[annahme]` |
| 7 | `docs/project/p1-005/P1-005-local-preferences-foundation.sql` | `[annahme]` DDL-Deckung nicht zeilenweise geprüft; Tabellen + Policies vorhanden `[cmd]` |
| 8 | `docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql` | lt. `30-datenbank.md`; Tabellen vorhanden `[cmd]` |
| 9 | BLS-Import (Daten) | `[cmd]` Zeilenzahlen; Weg `[annahme]` |

**`20240522_001` und `20240522_002` liefen dagegen nie** — pg_trgm, Grants,
Makro-Spalten, Trigger, Funktion und die 7 SELECT-Policies fehlen sämtlich.

---

## 3. Abgleich: Container-Dump vs. die 7 bestehenden Migrationsdateien

Legende: ✓ deckt sich · ✗ fehlt im Container · ⚠ widerspricht sich · ➕ nur im Container.

### `20240522_001_nutrition_schema_foundation.sql`

| Objekt | Datei | Container | Status |
|---|---|---|---|
| `CREATE SCHEMA nutrition` | ja | vorhanden | ✓ |
| `CREATE EXTENSION pg_trgm` | ja | **fehlt** | ✗ |
| `CREATE EXTENSION pgcrypto` | ja | vorhanden (`[annahme]` evtl. Image-Default) | ✓ |
| `GRANT USAGE … authenticated, service_role` | ja | **keine ACL** | ✗ |

### `20240522_002_nutrition_food_core_tables.sql`

| Objekt | Datei | Container | Status |
|---|---|---|---|
| `nutrient_defs` 14 Spalten | ja | 16 (＋`name_th`, `group_th`) | ⚠ Container = Datei + Slice `20260513_002` |
| `nutrient_defs`-Seed (138) | ja | 138 Zeilen, Spot-Check ENERCJ/ENERCC/WATER/PROT625/FAT in Reihenfolge | ✓ Inhalt `[annahme]` nicht feldweise diffgeprüft |
| `food_categories` | `name_en TEXT NOT NULL` ohne Default | `name_en DEFAULT ''` | ⚠ Container folgt p1-005-DDL, nicht dieser Datei |
| `foods` mit 11 Makro-Spalten (`enercc`…`alc`) | ja | **keine Makro-Spalte** | ✗ Container-`foods` stammt aus Slice `20260514_001` + p1-005-ALTERs |
| `food_nutrients` `data_source` ohne Default | ja | `DEFAULT 'bls_4_0'` | ⚠ Container = Slice-Version |
| `food_aliases` (PK, Source-Check) | ja | identisch | ✓ |
| `tag_definitions` + Seed (16) | ja | identisch, 16 Zeilen | ✓ Inhalt `[annahme]` |
| `food_tags` | ja | identisch | ✓ |
| trgm-GIN-Indizes (`idx_foods_name_de_trgm`, `idx_foods_name_display`, `idx_food_aliases_alias_trgm`) | ja | **fehlen alle** | ✗ |
| `idx_foods_bls_code` | ja | fehlt (stattdessen `foods_bls_code_idx` aus Slice) | ⚠ |
| `idx_foods_sort_weight`, `idx_foods_category`, `idx_food_categories_*`, `idx_food_tags_*` | ja | vorhanden | ✓ (via p1-005-DDL, das dieselben Namen nutzt) |
| `auto_tag_food()` + Trigger | ja | **fehlen** | ✗ |
| RLS + 7 SELECT-Policies (`FOR SELECT TO authenticated USING (true)`) | ja | **RLS aus, 0 Policies** | ✗ |
| Grants (SELECT/ALL) | ja | **keine** | ✗ |

### `20260423120000_control_plane_tables.sql` (registriert)

| Objekt | Datei | Container | Status |
|---|---|---|---|
| 3 Enums, 4 Tabellen, 12 Indizes | ja | vorhanden (`workorders` 37 statt 25 Spalten) | ✓ (+ Classifier-Felder obendrauf) |
| RLS an, keine Policies | ja | RLS an, 0 Policies | ✓ |
| `update_updated_at()` + Trigger | ja | `[annahme]` nicht einzeln geprüft | — |

### `20260424_002_wo_classifier_fields.sql`

| Objekt | Datei | Container | Status |
|---|---|---|---|
| 12 Spalten + 3 Indizes auf `workorders` | ja | vorhanden | ✓ — aber **nicht im Register** ➕ Befund |

### `20260513_001` (Slice, „DO NOT EXECUTE")

| Objekt | Datei | Container | Status |
|---|---|---|---|
| `nutrient_defs` (14 Spalten, Drift-Guards) | ja | vorhanden (+ th) | ✓ angewendet |
| `nutrient_defs_group_sort_idx` | ja | vorhanden | ✓ |

### `20260513_002` (Slice, „DO NOT EXECUTE")

| Objekt | Datei | Container | Status |
|---|---|---|---|
| `name_th`, `group_th` auf `nutrient_defs` | ja | vorhanden, inhaltlich leer | ✓ angewendet (D-13 bleibt offen: *wie*) |

### `20260514_001` (Slice, „LOCAL_EXECUTION_CANDIDATE")

| Objekt | Datei | Container | Status |
|---|---|---|---|
| `foods` (9 Basisspalten) | ja | vorhanden (+ 5 p1-005-Spalten) | ✓ angewendet |
| `food_nutrients` (`data_source DEFAULT 'bls_4_0'`) | ja | vorhanden | ✓ |
| 4 Indizes (`foods_bls_code_idx`, `foods_sort_weight_idx`, `food_nutrients_food_idx`, `food_nutrients_nutrient_code_idx`) | ja | vorhanden | ✓ |

### Nur im Container, in keiner Migrationsdatei ➕

| Objekt | Vermutliche Quelle |
|---|---|
| `food_preferences`, `food_preference_items` + 2 `auth.uid()`-Policies | `[annahme]` p1-005 preferences-foundation |
| `food_curation_candidates`, `food_curation_decisions` | p1-005 curation-persistence (lt. `30-datenbank.md`) |
| foods-Spalten `name_display_en/…_th`, `category_id`, `processing_level`, `is_prepared_dish` | `[read]` p1-005 food-human-layer |
| `idx_food_aliases_food` | `[read]` p1-005 food-human-layer |
| Duplikat `idx_foods_sort_weight` neben `foods_sort_weight_idx` | Slice + p1-005 legten je einen an |

---

## 4. Welche Reihenfolge gilt

Für die Drafts: strikt 000100 → 000600 (Dateien 2–4 hängen per FK an 000200;
000600 hängt an 000500). Die Sequenz ist eigenständig — sie setzt keine der
7 Altdateien voraus.

**Nebenbefund zur Alt-Nummerierung:** Die Bestandsdateien verletzen das
CLI-Namensschema. `20240522_001…` und `20240522_002…` teilen sich den
Versionspräfix `20240522`; die Supabase-CLI liest die führende Ziffernfolge
als Version — zwei Dateien mit derselben Version sind bei `db reset`
mindestens reihenfolge-ambig `[annahme]` (Verhalten nicht getestet).
Die Drafts verwenden deshalb volle 14-stellige, eindeutige Timestamps.

---

## 5. Was Tom entscheiden muss (keine Entscheidung getroffen)

- **O-1 — pg_trgm:** Container hat die Extension nicht; die Suche in `apps/web`
  läuft heute ohne trgm. Drafts bilden den Ist ab (ohne). Wieder einführen —
  ja/nein/später?
- **O-2 — Grants:** `authenticated`/`service_role` haben keinerlei Rechte auf
  `nutrition`. Solange `apps/web` als `postgres` via `docker exec` zugreift,
  fällt das nicht auf; mit supabase-js (D-08) bräche alles. Grants in die
  Migrationen aufnehmen — welche?
- **O-3 — RLS-Strategie:** Drafts übernehmen den Container-Zustand (Vorgabe):
  2 `auth.uid()`-Policies, 9 Tabellen offen ohne RLS. Migration `20240522_002`
  wollte SELECT-RLS auf allen 7 EAV-Tabellen. Was ist das Zielbild?
  (Hängt an ADR-002/ADR-003, D-08, D-14.)
- **O-4 — Duplikat-Index** auf `foods(sort_weight DESC)`: einen droppen oder
  Ist behalten?
- **O-5 — Seed-Strategie:** `nutrient_defs`/`tag_definitions`-Kataloge als
  Seed-Migration (wie in `20240522_002`), als `supabase/seed.sql`, oder rein
  über den Backup-Dump?
- **O-6 — Schicksal der 7 Altdateien:** Bei Übernahme der Drafts nach
  `supabase/migrations/` müssen die Altdateien weichen (Archiv?), sonst
  entstünde ein Doppel. Zwei von ihnen (`20240522_*`) beschreiben einen
  Zustand, der nie existiert hat; vier liefen am Register vorbei.
  Zudem: Register-Reparatur nötig (der Eintrag `20260423120000` passt nicht
  zur neuen Sequenz) — `db reset` baut das Register neu, ein Repair am
  laufenden Container wäre ein Schreibvorgang und wurde nicht ausgeführt.
- **O-7 — Control-Plane behalten?** Drafts reproduzieren die 4 Governance-
  Tabellen, weil sie im Container existieren. Wenn die Altlast fällt
  (A-03/50-governance-rest), entfallen Draft 000500/000600.
- **O-8 — Makro-Spalten & Auto-Tagging:** `20240522_002` sah 11 denormalisierte
  Makro-Spalten und deterministisches Auto-Tagging vor; der Container hat
  beides nicht, `food_tags` ist trotzdem gefüllt. Soll das Konzept
  wiederkommen oder ist es tot?

---

## 6. Verifikation der Drafts

Nicht ausgeführt — `supabase db reset` wäre ein Schreibvorgang und ist in
dieser Sitzung untersagt. Die Drafts sind gegen Dump + Live-Introspektion
abgeglichen, aber **nicht lauffähig getestet** `[annahme]`. Empfohlener Test
(nach Freigabe): Drafts in ein Wegwerf-Projekt kopieren, `db reset`,
dann Schema-Diff gegen `backup/schema/2026-08-01_nutrition_schema.sql`.
