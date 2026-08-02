# supabase/

Alles, was die lokale Supabase-Instanz aufbaut.

**Stand:** 2026-08-02 (dritte Fassung — Schritt 060, 021-Befund, Archiv-Nachweis)

---

## Warum es diesen Ordner in dieser Form gibt

`[cmd]` Das Migrations-Register der laufenden Datenbank
(`supabase_migrations.schema_migrations`) enthielt genau **einen** Eintrag,
während 11 Nutrition-Tabellen mit rund 727.000 Zeilen existieren.
Die Datenbank entstand über eine Kette einzeln ausgeführter Skripte; die lag
verstreut in `docs/project/p1-005/` und `tmp/`, war aber vollständig.
`_pipeline/` bündelt sie und macht die Reihenfolge sichtbar.

`[cmd]` Dreifach verifiziert (2026-08-02, `docs/ssot/33-pipeline-verifikation.md`):
Die Kette erzeugt aus einer leeren Datenbank einen bitgenau identischen
Zustand — zuletzt vollständig aus dem versionierten Archiv
`_data/bls_4_0_local_import.zip`, ohne untracked Quellen.

---

## Ordner

| Ordner | Inhalt | Wer nutzt ihn |
|---|---|---|
| `migrations/` | **3 Slice-Dateien** (Schema-Stufe) | **Supabase CLI** — was hier liegt, wird bei `db reset` angewendet |
| `_pipeline/` | Die reale Aufbaukette, nummeriert, inkl. Zugriffsschicht `060` | Manuell, in Reihenfolge |
| `_data/` | BLS-Rohdaten als Archiv — **verifizierte Quelle** | Von `_pipeline/03_bls_import/` |
| `_archive/` | Ausrangiertes: 4 Alt-Migrationen, `migrations-draft/` | niemand (nicht mehr zitieren) |
| `_snippets/` | Introspektionsabfragen (Kopien der Studio-Snippets) | Diagnose |
| `snippets/` | untracked Studio-Reste — **steht auf der Löschliste** | niemand |
| `.branches/`, `.temp/`, `config.toml` | CLI-eigen | Supabase CLI |

**Hinweis zu den Slice-Köpfen:** Die drei Dateien in `migrations/` tragen
historisch `DO NOT EXECUTE`-Statusköpfe. `[cmd]` Sie sind die reale,
verifizierte Schema-Stufe (idempotent, `to_regclass`-Guards) — die Köpfe
sind Governance-Zeremonie (D-13, geklärt).

---

## Die Aufbaukette

Reihenfolge ist verbindlich. Validierungen unter `_pipeline/_validierung/`.

| # | Datei | Erzeugt | Erwartet |
|---|---|---|---|
| M1–M3 | `migrations/20260513_001`, `_002`, `20260514_001` | Schema `nutrition`, `nutrient_defs` (16 Sp.), `foods` (9 Sp.), `food_nutrients` | – |
| 015 | `015_kataloge/015_nutrient_defs_seed.sql` | 138 Nährstoffdefinitionen | 138 |
| 020 | `02_human_layer/020_food_human_layer.sql` | `food_categories`, `tag_definitions`, Spalten auf `foods`, Indizes, **Tag- und Alias-Ableitungen** | 518 Kategorien, 16 Tag-Definitionen |
| 030 | `03_bls_import/030_apply_local.sql` | `foods`, `food_nutrients` aus CSV | 7.140 / 698.092 |
| 020 **erneut** | dito | Ableitungen greifen jetzt: Aliase, Tags, Kategoriezuweisungen | 21.420 / 9.265 / 7.140 |
| 021 | `02_human_layer/021_wild_category_apply.sql` | **Kategoriezuweisung `V2%` → `wild`** | `affected_rows = 49` |
| 050 | `05_user_tabellen/050_preferences_foundation.sql` | `food_preferences`, `food_preference_items` inkl. RLS | 2 Policies |
| 051 | `05_user_tabellen/051_curation_persistence.sql` | `food_curation_candidates`, `_decisions` | 0 Zeilen |
| 060 | `06_zugriff/060_zugriffsschicht.sql` | pg_trgm, 2 Trigram-Indizes, Grants, RLS auf allen 11 Tabellen | v060: 22 Prüfungen, 33 Indizes, 15 Policies |

**`020` läuft zweimal:** Es legt Strukturen an *und* enthält die Ableitungen,
die gegen `food_nutrients` arbeiten — also gegen Daten, die erst `030`
einspielt. Erster Lauf `INSERT 0 0`, zweiter Lauf greift. Durchgängig
`ON CONFLICT DO NOTHING`, gefahrlos wiederholbar. `[cmd]` verifiziert.

**`021` ist notwendig (D-16, geklärt 2026-08-02):** Die frühere Annahme
„ohne sichtbaren Effekt, durch `020` abgedeckt" ist **widerlegt**.
`[cmd]` `020` legt den `wild`-Kategoriebaum nur an; die Zuweisung der
BLS-Präfixe `V2%` macht ausschliesslich `021` — `affected_rows = 49`
im Kettenlauf, Container: 49 von 49 `V2%`-Foods in `wild`, 0 ohne
Kategorie. 49 der 4.903 Kategoriezuweisungen stammen aus `021`.

### Die Ableitungen

`[read]` Deterministisch aus `food_nutrients`, je 100 g, Konfidenz fest 1.0:

| Tag | Regel | Zeilen im Container |
|---|---|---|
| `high_protein` | `PROT625 >= 20` | 1.400 |
| `low_carb` | `CHO <= 10` | 4.659 |
| `low_fat` | `FAT <= 3` | 2.648 |
| `high_fiber` | `FIBT >= 6` | 558 |

Die übrigen 12 Tag-Definitionen (`vegan`, `gluten_free`, `lactose_free` …)
sind angelegt, aber nie angewendet — sie bräuchten eine Namens-Heuristik.

**Diese Regeln existieren nur an einer Stelle: in `020`.** Nicht kopieren.
Die archivierte Migration `20240522_002` beschreibt einen abweichenden Weg
über denormalisierte Makro-Spalten und einen Trigger — `[cmd]` beides
existiert im Container nicht und ist nicht der reale Weg.

### Die Zugriffsschicht (`060`)

Neu seit 2026-08-02 (M1 Teil A): pg_trgm + 2 Trigram-GIN-Indizes
(`foods.name_display`, `food_aliases.alias`), Grants (USAGE; SELECT auf die
7 Stammdatentabellen für `authenticated`; DML auf die 2 Preference-Tabellen;
ALL für `service_role`), RLS auf allen 11 Tabellen (Stammdaten: 1
SELECT-Policy; Nutzerdaten: 4 Policies je Operation mit `auth.uid()`;
Curation: RLS an, keine Policy — keine `user_id`-Spalte, offene Frage).
Validierung: `_pipeline/_validierung/v060_zugriff.sql` (Soll/Ist, 22 Prüfungen).
**Auf die laufende `postgres`-DB noch nicht angewendet — Toms Entscheidung.**
Dazu gehört `config.toml`: `[api].schemas` enthält `nutrition`; wirksam erst
nach `supabase stop && supabase start`.

---

## Rohdaten

`_data/bls_4_0_local_import.zip` (4,1 MB) enthält:

| Datei | Zeilen | Ziel |
|---|---|---|
| `foods.csv` | 7.140 (+ Kopf) | `nutrition.foods` |
| `food_nutrients.csv` | 698.092 (+ Kopf) | `nutrition.food_nutrients` |

`[cmd]` 2026-08-02: Archiv-Inhalt ist **byte-identisch** (MD5) mit der
historischen Container-Kopie, und ein vollständiger Kettenlauf aus dem
entpackten Archiv erzeugte den identischen Endzustand
(`docs/ssot/33-pipeline-verifikation.md`, dritter Lauf). Damit ist das
Archiv die verifizierte Quelle; `tmp/nutrition/p1-005-bls-local-import/`
ist entbehrlich (Löschliste A-05).

Nur das Archiv ist versioniert; entpackte CSV sind über `_data/.gitignore`
ausgeschlossen. **Vor dem Import entpacken:** `030_apply_local.sql` erwartet
die Dateien unter `/tmp/p1-005-bls-local-import/` (Pfad im Skript;
im Docker-Setup per `docker cp` in den DB-Container legen).

---

## Was noch offen ist

1. **Registrierung (D-17):** Keine Kettenstufe steht in
   `supabase_migrations.schema_migrations`; das Register ist nach der
   Archivierung faktisch leer. Kette in reguläre Migrationen überführen
   oder als dokumentierter Ablauf belassen — Toms Entscheidung.
2. **`060` auf `postgres` anwenden + Neustart** (M1) — Toms Entscheidung.
3. **Seed-Strategie (O-5):** Kataloge als Migration oder Pipeline-Schritt?
4. **Curation-Tabellen ohne `user_id`:** Policies erst möglich, wenn die
   Spalte kommt — oder bewusst Service-Role-only lassen.

---

## Regeln

- Kein `supabase db reset` gegen die laufende Instanz — Deny-Regel in
  `.claude/settings.json`. Jeder Test gehört in eine Wegwerf-Datenbank.
- Ableitungsregeln nur an einer Stelle (`020`). Wer sie kopiert, erzeugt Drift.
- `021` gehört zur Kette — nicht überspringen (49 Zuweisungen).
- Vor jedem Schritt die zugehörige Validierung aus `_pipeline/_validierung/`.
- `_archive/` ist tot: nicht zitieren, nicht ausführen.
