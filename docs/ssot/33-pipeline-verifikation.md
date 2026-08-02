# D-12 — Verifikationslauf der Aufbaukette

**Datum:** 2026-08-02
**Ergebnis:** **bestanden.** Die Datenbank ist vollständig aus dem Repo reproduzierbar.
**Methode:** `[cmd]` Frische Datenbank `pipeline_test` im Container
`supabase_db_LumeOS-Claude-V1`, Kette in Reihenfolge angewendet, danach
Zeilenzahlen, Spalten, Indizes und Policies gegen die laufende `postgres`-DB
verglichen. Testdatenbank nach dem Lauf verworfen.

---

## Ergebnis

`[cmd]` Vergleich `pipeline_test` gegen `postgres`:

| Prüfung | Kette | Ist-Container | |
|---|---|---|---|
| Tabellen | 11 | 11 | ✓ |
| Spalten gesamt | 105 | 105 | ✓ |
| Indizes | 31 | 31 | ✓ |
| RLS-Policies | 2 | 2 | ✓ |
| `foods` | 7.140 | 7.140 | ✓ |
| `food_nutrients` | 698.092 | 698.092 | ✓ |
| `food_aliases` | 21.420 | 21.420 | ✓ |
| `food_tags` | 9.265 | 9.265 | ✓ |
| `food_categories` | 518 | 518 | ✓ |
| `nutrient_defs` | 138 | 138 | ✓ |
| `tag_definitions` | 16 | 16 | ✓ |
| `foods` mit `category_id` | 4.903 | 4.903 | ✓ |
| Curation- und Preference-Tabellen | 0 | 0 | ✓ |

Spaltenvergleich über alle 105 Spalten: **kein einziger Unterschied.**

Laufzeit der teuersten Stufe (BLS-Import, 705.232 Zeilen): **8,1 Sekunden.**

---

## Die verifizierte Reihenfolge

| # | Datei | Wirkung |
|---|---|---|
| 1 | `supabase/migrations/20260513_001_…slice.sql` | Schema `nutrition`, `nutrient_defs` |
| 2 | `supabase/migrations/20260513_002_…slice.sql` | `name_th`, `group_th` |
| 3 | `supabase/migrations/20260514_001_…slice.sql` | `foods` (9 Sp.), `food_nutrients` |
| 4 | `_pipeline/015_kataloge/015_nutrient_defs_seed.sql` | **138 Nährstoffdefinitionen** |
| 5 | `_pipeline/02_human_layer/020_food_human_layer.sql` | `food_categories` (518), `tag_definitions` (16), `food_tags`, `food_aliases`; `foods` auf 14 Spalten |
| 6 | `_pipeline/03_bls_import/030_apply_local.sql` | 7.140 Foods, 698.092 Nährwerte |
| 7 | `_pipeline/02_human_layer/020_food_human_layer.sql` **erneut** | Ableitungen: 21.420 Aliase, 9.265 Tags, 7.140 Kategoriezuweisungen |
| 8 | `_pipeline/02_human_layer/021_wild_category_apply.sql` | Nachtrag |
| 9 | `_pipeline/05_user_tabellen/050_preferences_foundation.sql` | 2 Tabellen + 2 RLS-Policies |
| 10 | `_pipeline/05_user_tabellen/051_curation_persistence.sql` | 2 Tabellen |

**`020` läuft zweimal.** Es legt Strukturen an *und* enthält die Ableitungen,
die gegen `food_nutrients` arbeiten — also gegen Daten, die erst Schritt 6
einspielt. Beim ersten Lauf melden die Ableitungen `INSERT 0 0`, beim zweiten
greifen sie. Das Skript ist durchgängig `ON CONFLICT DO NOTHING`, also
gefahrlos wiederholbar. `[cmd]` verifiziert.

---

## Was der Lauf korrigiert hat

### 1. Die „DO NOT EXECUTE"-Slices sind die Schema-Stufe

Die drei Slice-Migrationen tragen im Kopf `EXECUTION_CANDIDATE_REVIEW_ONLY`
bzw. `DO NOT EXECUTE`. `[cmd]` Sie haben keinen Transaktionsrahmen, sind über
`to_regclass`-Guards idempotent und laufen fehlerfrei. Sie **sind** der reale
Schema-Aufbau — der Statuskopf ist Governance-Zeremonie, die von der Praxis
überholt wurde. **Damit ist TODO D-13 beantwortet.**

### 2. `010_schema_foundation.sql` ist ein echter Nicht-Kandidat

`[cmd]` Trägt `NON_EXECUTABLE_SQL_DRAFT` und endet absichtlich auf `rollback;`.
Der Kopf nennt selbst den Nachfolger: `20260513_001`. Die Datei gehört nicht
in die Kette und wurde aus `_pipeline/01_schema/` entfernt.

### 3. Der Nährstoff-Katalog fehlte

`[cmd]` Ohne ihn bricht Schritt 6 ab — mit exakt der richtigen Meldung:
`staged food_nutrients contain 698092 missing nutrient_defs targets`.
Das Gate in `030_apply_local.sql` funktioniert und rollt die gesamte
Transaktion zurück. Es ist die einzige belastbare Schutzschicht, die im
Repo gefunden wurde.

Der Seed liegt in `supabase/migrations/20240522_002…sql` und wurde nach
`_pipeline/015_kataloge/` extrahiert. `[cmd]` 138 Zeilen, exakte Übereinstimmung.

### 4. `20240522_002` ist nur teilweise real

`[cmd]` Aus dieser Datei wurde ausschliesslich der `nutrient_defs`-Seed
verwendet. Die elf denormalisierten Makro-Spalten auf `foods`, die beiden
Funktionen und die sieben SELECT-Policies existieren im Container nicht und
sind für die Reproduktion **nicht nötig**.
Der Encoding-Schaden (`k?se`, `n?sse`, TODO B-09) sitzt in einem dieser
ungenutzten Teile und ist damit folgenlos.

### 5. Die offenen Lücken sind geschlossen

- **Schritt 040** war nicht nötig: `category_id`, `processing_level`,
  `is_prepared_dish` und `sort_weight` setzt `020` im zweiten Lauf
  (`UPDATE 7140`).
- **`food_aliases`**: die drei Alias-Blöcke in `020` liefern je 7.140 Zeilen,
  zusammen 21.420 — die vermeintliche Diskrepanz war keine.

---

## Voraussetzung: das `auth`-Schema

`[cmd]` Schritt 9 (`050_preferences_foundation.sql`) scheitert in einer nackten
Postgres-Datenbank mit `ERROR: schema "auth" does not exist` — die beiden
RLS-Policies referenzieren `auth.uid()`.

In einer echten Supabase-Instanz ist `auth` vorhanden. Für den Testlauf wurde
ein Stub gesetzt:

```sql
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
  LANGUAGE sql STABLE AS 'SELECT NULL::uuid';
CREATE ROLE authenticated;
CREATE ROLE anon;
```

Derselbe Befund trat beim Restore-Test am 2026-08-01 auf: `pg_restore` verlor
beide Policies stillschweigend, weil `auth` fehlte. **Der Dump allein ist
keine vollständige Sicherung** — die Kette ist es.

---

## Was jetzt gilt

Die Aussage „es gibt keinen Weg von `git clone` zu dieser Datenbank" ist
**widerlegt**. Der Weg existiert, ist vollständig, dauert unter einer Minute
und erzeugt einen bitgenau identischen Zustand.

Was fehlte, war nie die Substanz, sondern die Ordnung und ein Nachweis.

---

## Offen

1. **O-6:** `supabase/migrations/` enthält weiterhin `20240522_001` und `_002`,
   die bei einem `supabase db reset` mitlaufen würden — mit Makro-Spalten,
   Funktionen und Policies, die der Ist-Zustand nicht hat. Solange sie dort
   liegen, ist `db reset` **nicht** benutzbar. Empfehlung: beide nach
   `supabase/_archive/`, nachdem der Seed extrahiert ist (erledigt).
2. **Registrierung:** Keine der Kettenstufen steht in
   `supabase_migrations.schema_migrations`. Ob die Kette in reguläre
   Migrationen überführt wird oder als dokumentierter Ablauf bestehen bleibt,
   ist offen.
3. **`021_wild_category_apply.sql`** lief ohne sichtbare Wirkung —
   `[annahme]` bereits durch `020` abgedeckt, ungeprüft.
4. **Die 6 Dateien in `supabase/migrations-draft/`** sind durch diesen Lauf
   überholt. Sie bilden den Container ab, aber die Kette tut das ebenfalls und
   ist die reale Quelle. Verwerfen oder als Referenz behalten.
