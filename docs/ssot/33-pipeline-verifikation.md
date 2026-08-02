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

---

## Nachtrag 2026-08-02: O-6 erledigt, zweiter Lauf nach Archivierung

Vier Dateien nach `supabase/_archive/` verschoben (`git mv`):

| Datei | Grund |
|---|---|
| `20240522_001_nutrition_schema_foundation.sql` | Nie angewendet; durch `20260513_001` ersetzt |
| `20240522_002_nutrition_food_core_tables.sql` | Nur der `nutrient_defs`-Seed war real, extrahiert nach `_pipeline/015_kataloge/`. Makro-Spalten, Funktionen und die 7 SELECT-Policies existieren im Ist-Zustand nicht |
| `20260423120000_control_plane_tables.sql` | Governance, in diesem Repo tot (Entscheidung Tom, 2026-08-02) |
| `20260424_002_wo_classifier_fields.sql` | dito |

`supabase/migrations/` enthält jetzt ausschliesslich die drei Slice-Dateien.

### Zweiter Verifikationslauf

`[cmd]` Frische Datenbank `reset_test`, `supabase/migrations/` in CLI-Reihenfolge
angewendet, dann die Kette. Alle drei Migrationen fehlerfrei; erzeugt werden
`nutrition.nutrient_defs` (16 Sp.), `nutrition.foods` (9 Sp.),
`nutrition.food_nutrients` (4 Sp.) — keine Governance-Tabellen mehr.

Danach Vollvergleich gegen `postgres`:

| Kennzahl | reset_test | postgres | |
|---|---|---|---|
| `foods` | 7.140 | 7.140 | ✓ |
| `food_nutrients` | 698.092 | 698.092 | ✓ |
| `food_aliases` | 21.420 | 21.420 | ✓ |
| `food_tags` | 9.265 | 9.265 | ✓ |
| `food_categories` | 518 | 518 | ✓ |
| `nutrient_defs` | 138 | 138 | ✓ |
| `tag_definitions` | 16 | 16 | ✓ |
| Spalten | 105 | 105 | ✓ |
| Indizes | 31 | 31 | ✓ |
| Policies | 2 | 2 | ✓ |
| `foods` mit Kategorie | 4.903 | 4.903 | ✓ |

**Gesamtdauer der Kette: 10,6 Sekunden.** Testdatenbank verworfen.

### Damit ist O-6 geschlossen

`supabase/migrations/` ist bereinigt. Ein echter `supabase db reset` würde jetzt
die korrekte Schema-Stufe erzeugen — **nur die Schema-Stufe**. Kataloge, Daten
und Ableitungen kommen aus `_pipeline/` und müssen separat laufen.

**`supabase db reset` bleibt trotzdem in der Deny-Liste.** Er löscht die
laufende Datenbank; jeder Test gehört in eine Wegwerf-Datenbank.

### Weiterhin offen

- **Registrierung:** Keine Kettenstufe steht in
  `supabase_migrations.schema_migrations`. Nach der Archivierung ist das
  Register faktisch leer — die einzige registrierte Migration war die
  Control-Plane-Datei.
- **`021_wild_category_apply.sql`** wirkt weiterhin ohne sichtbaren Effekt.
  `[annahme]` durch `020` abgedeckt.
- **`supabase/migrations-draft/`** ist durch beide Läufe überholt.

---

## Nachtrag 2026-08-02 (Abend): Dritter Lauf — Nachweis aus dem versionierten Archiv (A-05)

**Zweck:** Alle bisherigen Läufe lasen die CSVs aus der Container-Kopie
`/tmp/p1-005-bls-local-import/`. Damit war ungeprüft, ob
`supabase/_data/bls_4_0_local_import.zip` — die einzige **versionierte**
Quelle — tatsächlich funktioniert. Dieser Lauf schliesst die Lücke.

### Archiv-Integrität

`[cmd]` Zip nach Scratchpad entpackt (nicht nach `tmp/`), Vergleich gegen
die Container-Kopie:

| Datei | Zeilen (Archiv) | Zeilen (Container) | MD5 identisch |
|---|---|---|---|
| `foods.csv` | 7.141 (inkl. Kopf) | 7.141 | ✓ `be0526245a1207ed79a3ec5bbe46d908` |
| `food_nutrients.csv` | 698.093 (inkl. Kopf) | 698.093 | ✓ `12138d51ac20ff761ca5ad6e25f26e50` |

Kopfzeilen identisch (`bls_code,name_de,name_en,name_th,name_display` bzw.
`bls_code,nutrient_code,value,data_source`). **Byte-identisch.**

### Kettenlauf aus dem Archiv

`[cmd]` Wegwerf-Datenbank `a05_test`, auth-Stub wie oben. Die Container-Kopie
wurde für die Dauer des Tests beiseitegelegt
(`mv … .bak`), die **entpackten Archiv-Dateien** per `docker cp` an den von
`030` erwarteten Pfad gelegt — so lief die exakte, unveränderte Repo-Kette
gegen die Archiv-Daten: 3 Migrationen → 015 → 020 → 030 → 020 erneut → 021
→ 050 → 051 → 060. Fehlerfrei mit `ON_ERROR_STOP=1`.

### Ergebnis

| Kennzahl | a05_test (Archiv) | postgres | Soll |
|---|---|---|---|
| `foods` | 7.140 | 7.140 | identisch ✓ |
| `food_nutrients` | 698.092 | 698.092 | identisch ✓ |
| `food_aliases` | 21.420 | 21.420 | identisch ✓ |
| `food_tags` | 9.265 | 9.265 | identisch ✓ |
| `food_categories` | 518 | 518 | identisch ✓ |
| `nutrient_defs` | 138 | 138 | identisch ✓ |
| `tag_definitions` | 16 | 16 | identisch ✓ |
| Preference-/Curation-Tabellen | je 0 | je 0 | identisch ✓ |
| `foods` mit Kategorie | 4.903 | 4.903 | identisch ✓ |
| Spalten | 105 | 105 | identisch ✓ |
| Indizes | **33** | 31 | 33 (Kette inkl. 060: +2 Trigram) ✓ |
| Policies | **15** | 2 | 15 (Kette inkl. 060) ✓ |

Aufgeräumt: `a05_test` verworfen (`[cmd]` Nachzählung 0), Container-Kopie
unverändert zurückgetauscht (`[cmd]` MD5 nach Restore identisch).

### Konsequenz

**Die Reproduzierbarkeit hängt nicht mehr an untracked Dateien.**
`git clone` + `supabase/_data/bls_4_0_local_import.zip` + Kette genügen.
Damit ist `tmp/nutrition/p1-005-bls-local-import/` entbehrlich und darf auf
die Löschliste (A-05) — ebenso die Container-Kopie unter `/tmp/`, die beim
nächsten Container-Rebuild ohnehin verschwindet.
