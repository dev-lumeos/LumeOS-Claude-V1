# supabase/

Alles, was die lokale Supabase-Instanz aufbaut.

**Stand:** 2026-08-02

---

## Warum es diesen Ordner in dieser Form gibt

`[cmd]` Das Migrations-Register der laufenden Datenbank
(`supabase_migrations.schema_migrations`) enthält genau **einen** Eintrag,
während 11 Nutrition-Tabellen mit rund 727.000 Zeilen existieren.
Die Dateien in `migrations/` beschreiben also **nicht**, wie diese Datenbank
entstanden ist.

Entstanden ist sie über eine Kette einzeln ausgeführter Skripte. Die lag
verstreut in `docs/project/p1-005/` und `tmp/`, war aber vollständig.
`_pipeline/` bündelt sie und macht die Reihenfolge sichtbar.

---

## Ordner

| Ordner | Inhalt | Wer nutzt ihn |
|---|---|---|
| `migrations/` | 7 Altdateien | **Supabase CLI** — was hier liegt, wird bei `db reset` angewendet |
| `_pipeline/` | Die reale Aufbaukette, nummeriert | Manuell, in Reihenfolge |
| `_data/` | BLS-Rohdaten als Archiv | Von `_pipeline/03_bls_import/` |
| `migrations-draft/` | Rückbau aus dem Container-Dump | Abgleich, nicht anwenden |
| `_archive/` | Ausrangiertes | niemand |
| `_snippets/` | Introspektionsabfragen | Diagnose |
| `.branches/`, `.temp/`, `config.toml` | CLI-eigen | Supabase CLI |

**Achtung:** `migrations/` gehört der CLI. Was dort liegt, läuft bei
`supabase db reset` automatisch — auch die drei Slice-Dateien, die im Kopf
`DO NOT EXECUTE` tragen. Solange O-6 offen ist, bleibt der Ordner unverändert.

---

## Die Aufbaukette

Reihenfolge ist verbindlich. Jeder Schritt hat eine Validierung unter
`_pipeline/_validierung/`.

| # | Datei | Erzeugt | Erwartet |
|---|---|---|---|
| 010 | `01_schema/010_schema_foundation.sql` | Schema `nutrition`, Basistabellen | – |
| 020 | `02_human_layer/020_food_human_layer.sql` | `food_categories`, `tag_definitions`, Spalten auf `foods`, Indizes, **Tag- und Alias-Ableitungen** | 518 Kategorien, 16 Tag-Definitionen |
| 021 | `02_human_layer/021_wild_category_apply.sql` | Kategoriezuweisung Nachtrag | – |
| 030 | `03_bls_import/030_apply_local.sql` | `foods`, `food_nutrients` aus CSV | 7.140 / 698.092 |
| 050 | `05_user_tabellen/050_preferences_foundation.sql` | `food_preferences`, `food_preference_items` inkl. RLS | 2 Policies |
| 051 | `05_user_tabellen/051_curation_persistence.sql` | `food_curation_candidates`, `_decisions` | 0 Zeilen |

**Wichtig zur Reihenfolge:** Die Tag-Ableitungen stehen **in** `020`, laufen
aber gegen `food_nutrients` — also gegen Daten, die erst `030` einspielt.
`020` legt die Struktur an, die Ableitungen greifen erst nach `030`.
`[annahme]` Ob `020` deshalb zweimal oder in Teilen laufen muss, ist ungeprüft
und beim ersten Durchlauf zu klären.

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
Die Migration `20240522_002` beschreibt einen abweichenden Weg über
denormalisierte Makro-Spalten und einen Trigger — `[cmd]` beides existiert
im Container nicht und ist nicht der reale Weg.

---

## Rohdaten

`_data/bls_4_0_local_import.zip` (4,1 MB) enthält:

| Datei | Zeilen | Ziel |
|---|---|---|
| `foods.csv` | 7.140 | `nutrition.foods` |
| `food_nutrients.csv` | 698.092 | `nutrition.food_nutrients` |

`[cmd]` Beide Zeilenzahlen stimmen exakt mit dem Container überein.
Jede Nährwertzeile trägt `data_source = bls_4_0_local_import`.

Nur das Archiv ist versioniert; die entpackten CSV sind über `_data/.gitignore`
ausgeschlossen (30 MB roh gegen 4 MB gepackt).

**Vor dem Import entpacken.** `030_apply_local.sql` erwartet die Dateien unter
`/tmp/p1-005-bls-local-import/` — Pfad im Skript, beim ersten Durchlauf
anpassen oder die Dateien dorthin legen.

### Herkunft

Ursprünglich lagen die CSV unter `tmp/nutrition/p1-005-bls-local-import/`.
Dieser Ordner war **untracked** und stand auf der Löschliste (TODO A-05).
Eine Löschung hätte die einzige Quelle der 705.232 Datenzeilen vernichtet.
Die Dateien dort bleiben vorerst liegen, bis ein Durchlauf aus `_data/`
bewiesen ist.

---

## Was noch offen ist

1. **Erster vollständiger Durchlauf gegen eine leere Datenbank.** Erst wenn
   dabei derselbe Zustand entsteht, ist Reproduzierbarkeit bewiesen statt
   behauptet. Siehe TODO D-12.
2. **O-6: Schicksal von `migrations/`.** Solange dort Dateien liegen, die nie
   liefen, ist `supabase db reset` nicht benutzbar.
3. **Schritt 040 fehlt.** `foods.category_id`, `processing_level`,
   `is_prepared_dish` und `sort_weight` sind im Container gefüllt; welcher
   Schritt sie setzt, ist `[annahme]` — vermutlich `020`/`021`.
4. **`food_aliases`** hat 21.420 Zeilen. `020` enthält 3 Alias-Blöcke;
   ob die vollständig sind, ist ungeprüft.
5. **Seed-Strategie (O-5).** Kataloge als Migration oder als Pipeline-Schritt?

---

## Regeln

- `migrations/` nicht anfassen, solange O-6 offen ist.
- Kein `supabase db reset` gegen die laufende Instanz — Deny-Regel in
  `.claude/settings.json`. Ein Durchlauf gehört in eine leere Testdatenbank.
- Ableitungsregeln nur an einer Stelle. Wer sie kopiert, erzeugt Drift.
- Vor jedem Schritt die zugehörige Validierung aus `_pipeline/_validierung/`.
