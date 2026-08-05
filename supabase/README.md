# supabase/

Alles, was die lokale Supabase-Instanz aufbaut.

**Stand:** 2026-08-05 (vierte Fassung — Baseline „Weg B", Rollenteilung
migrations/↔_pipeline/, Kette vollständig bis 090)

---

## Rollenteilung: `migrations/` gegen `_pipeline/`

Seit 2026-08-05 (D-17, Weg B) gilt:

| Ort | Rolle |
|---|---|
| `migrations/` | **Deploybare Struktur.** Eine Baseline-Migration stellt den vollständigen Strukturzustand her (Schemas, Tabellen, Constraints, Indizes, Funktionen, Trigger, Policies, Grants). Läuft gegen jede Umgebung — lokal wie Cloud. **Keine Daten.** |
| `_pipeline/` | **Lokale Aufbaukette und lokale Wahrheit.** Nummerierte Schritte inkl. Katalog-Seeds, CSV-Import und Ableitungen. Wird NICHT deployt. |

Künftige Strukturänderungen entstehen als neue Migration in `migrations/`
**und** — wo sie zur Kette gehören — als Pipeline-Schritt; Stammdaten und
Seeds bleiben ausschliesslich in `_pipeline/`.

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

`[cmd]` 2026-08-05 (D-17): Der eine Registereintrag war ein **Geist**
(Datei archiviert, Tabellen gedroppt), die drei Slice-Dateien waren nicht
registriert, `public.profiles` stammte aus keiner Migration. Antwort ist die
**Baseline** `migrations/20260805120000_baseline_structure.sql` — erzeugt per
`pg_dump --schema-only` aus dem verifizierten Ist-Zustand, strukturgleich
belegt (0 Abweichungen in der Wegwerf-DB-Gegenprobe).

---

## Ordner

| Ordner | Inhalt | Wer nutzt ihn |
|---|---|---|
| `migrations/` | **1 Baseline-Migration** (Struktur, Stand 2026-08-05) | **Supabase CLI** — was hier liegt, wird bei `db reset`/`db push` angewendet |
| `_pipeline/` | Die lokale Aufbaukette, nummeriert, inkl. `060`–`090` | Manuell, in Reihenfolge |
| `_data/` | BLS-Rohdaten als Archiv — **verifizierte Quelle** | Von `_pipeline/03_bls_import/` |
| `_archive/` | Ausrangiertes: 7 Alt-Migrationen (inkl. der 3 Slices, seit 2026-08-05), `migrations-draft/` | niemand (nicht mehr zitieren) |
| `_snippets/` | Introspektionsabfragen (Kopien der Studio-Snippets) | Diagnose |
| `snippets/` | untracked Studio-Reste — **steht auf der Löschliste** | niemand |
| `.branches/`, `.temp/`, `config.toml` | CLI-eigen | Supabase CLI |

---

## Lokaler Neubau (frische Datenbank)

Reihenfolge ist verbindlich. Validierungen unter `_pipeline/_validierung/`.

| # | Datei | Erzeugt | Erwartet |
|---|---|---|---|
| B | `migrations/20260805120000_baseline_structure.sql` | **Gesamte Struktur**: Schema `nutrition` (11 Tabellen), `public.profiles` + Trigger, alle Funktionen/Indizes/Policies/Grants, pg_trgm | v060 22, v070 18, v090 14 Prüfungen |
| 015 | `015_kataloge/015_nutrient_defs_seed.sql` | 138 Nährstoffdefinitionen | 138 |
| 020 | `02_human_layer/020_food_human_layer.sql` | Kategorien-/Tag-Seeds, **Tag- und Alias-Ableitungen** (Strukturteile: durch Baseline bereits da, Guards greifen) | 518 Kategorien, 16 Tag-Definitionen |
| 030 | `03_bls_import/030_apply_local.sql` | `foods`, `food_nutrients` aus CSV | 7.140 / 698.092 |
| 020 **erneut** | dito | Ableitungen greifen jetzt: Aliase, Tags, Kategoriezuweisungen | 21.420 / 9.265 / 7.140 |
| 021 | `02_human_layer/021_wild_category_apply.sql` | **Kategoriezuweisung `V2%` → `wild`** | `affected_rows = 49` |

**Herkunft der Baseline-Struktur** (historische Kettenschritte, bleiben als
Referenz und für Weiterentwicklung):

| # | Datei | Beitrag zur Struktur |
|---|---|---|
| Slices | `_archive/20260513_001`, `_002`, `20260514_001` | Schema `nutrition`, `nutrient_defs`, `foods`, `food_nutrients` (seit 2026-08-05 archiviert — durch die Baseline ersetzt) |
| 050 | `05_user_tabellen/050_preferences_foundation.sql` | `food_preferences`, `food_preference_items` inkl. RLS + `uq_food_pref_items_user_food` |
| 051 | `05_user_tabellen/051_curation_persistence.sql` | `food_curation_candidates`, `_decisions` |
| 060 | `06_zugriff/060_zugriffsschicht.sql` | pg_trgm, 2 Trigram-Indizes, Grants, RLS/Policies auf allen 11 Tabellen — **live seit 2026-08-02** |
| 070 | `07_lesefunktionen/070_lesefunktionen.sql` | 6 RPC-Funktionen (`search_fold`, `food_search`, `food_categories_tree`, `preference_search_preview` mit 14 Argumenten, `curation_overview`, `schema_debug`) — v070: 18 Prüfungen |
| 090 | `09_identitaet/090_profile.sql` | **`public.profiles` + Trigger `on_auth_user_created` auf `auth.users`** (die Anmeldung), 4 Policies — v090: 14 Prüfungen |

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

Seit 2026-08-02 (M1 Teil A) und **live auf der laufenden Instanz**:
pg_trgm + 2 Trigram-GIN-Indizes (`foods.name_display`,
`food_aliases.alias`), Grants (USAGE; SELECT auf die 7 Stammdatentabellen
für `authenticated`; DML auf die 2 Preference-Tabellen; ALL für
`service_role`; **anon hat kein USAGE**), RLS auf allen 11 Tabellen
(Stammdaten: 1 SELECT-Policy; Nutzerdaten: 4 Policies je Operation mit
`auth.uid()`; Curation: RLS an, keine Policy — keine `user_id`-Spalte,
offene Frage). Validierung: `_pipeline/_validierung/v060_zugriff.sql`
(Soll/Ist, 22 Prüfungen). `config.toml`: `[api].schemas` enthält
`nutrition` (aktiv).

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
im Docker-Setup per `docker cp` in den DB-Container legen —
die Container-Kopie ist flüchtig und nach Neustarts neu einzuspielen).

---

## Was noch offen ist

1. **Register-Umtrag (D-17, Schritt 5):** Die Baseline liegt und ist
   belegt; der Umtrag des Registers der laufenden DB (Geist-Eintrag raus,
   Baseline rein) ist **vorgelegt und wartet auf Toms Freigabe**.
2. **Seed-Strategie (O-5):** Kataloge als Migration oder Pipeline-Schritt?
3. **Curation-Tabellen ohne `user_id`:** Policies erst möglich, wenn die
   Spalte kommt — oder bewusst Service-Role-only lassen.

---

## Regeln

- Kein `supabase db reset` gegen die laufende Instanz — Deny-Regel in
  `.claude/settings.json`. Jeder Test gehört in eine Wegwerf-Datenbank.
- Ableitungsregeln nur an einer Stelle (`020`). Wer sie kopiert, erzeugt Drift.
- `021` gehört zur Kette — nicht überspringen (49 Zuweisungen).
- Vor jedem Schritt die zugehörige Validierung aus `_pipeline/_validierung/`.
- `_archive/` ist tot: nicht zitieren, nicht ausführen.

---

## Wiederholbarkeit — Einschränkung

`[cmd]` 2026-08-03 geprüft: Die Kettenschritte **015 bis 090** sind
wiederholbar, jeder zweite Lauf liefert dasselbe Ergebnis ohne Fehler.

Für die **Baseline** gilt das nicht und soll es nicht: sie ist eine
Einmal-Migration (`CREATE TABLE` ohne Guards), das Register führt sie genau
einmal aus. Von Hand nur gegen leere Datenbanken anwenden.

Für die drei **archivierten Slices** (bis 2026-08-05 in `migrations/`) galt:

| Datei (jetzt `_archive/`) | Lauf 1 | Lauf 2 |
|---|---|---|
| `20260513_001` | ok | Fehler |
| `20260513_002` | ok | Fehler |
| `20260514_001` | ok | ok |

Ursache in `001` ist ein falsch-positiver Textvergleich im eigenen
Drift-Wächter. Praktisch folgenlos, weil das CLI-Register jede Migration nur
einmal ausführt — aber wer die Dateien von Hand anwendet, muss es wissen.

Eine frühere Fassung dieser Datei nannte die Schema-Stufe „idempotent".
Das war aus der Existenz der Guards geschlossen, nicht getestet.
