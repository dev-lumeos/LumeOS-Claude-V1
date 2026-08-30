# C-246 / C-247 Codex-Bericht

Stand: 2026-08-23

## C-246: 058b-Shopping-Drift

### Ausgangspunkt

Live vor dem Eingriff:

- `backup/c246/live-vor-shopping-counts.log`

| Messpunkt | Zahl |
|---|---:|
| Tabellen `shopping%` | 0 |
| Policies `shopping%` | 0 |
| Guard-Funktionen `shopping%` | 0 |
| Trigger `shopping%` | 0 |
| FKs `shopping%` | 0 |

Die fehlenden Objekte stehen in:

- `supabase/_pipeline/05_user_tabellen/058b_recipes_meal_plans.sql`

Abgeleitete Erwartung aus 058b:

| Objektart | Erwartung |
|---|---:|
| Tabellen | 2 |
| Policies | 8 |
| Guard-Funktionen | 2 |
| Trigger | 4 |
| Fremdschluessel | 5 |

Die fuenf nicht-Shopping-Tabellen aus 058b existierten live bereits; nachgezogen wurde deshalb nur der Shopping-Teil.

### Wegwerfprobe

Nachzugsskript:

- `backup/c246/apply_058b_shopping_only.sql`

Wegwerfprobe:

- `backup/c246/wegwerf-apply-shopping-final.log`
- Ergebnis: `DO`, `COMMIT`

Die erste Wegwerfprobe war rot, weil `information_schema.triggers` Multi-Event-Trigger mehrfach zaehlt. Die Pruefung wurde auf `pg_trigger` umgestellt, damit echte Triggerobjekte gezaehlt werden.

### Live-Eingriff

Vollsicherung vor dem Live-Eingriff:

- `backup/vollsicherung/20260823_161554_c246_vor_live_lumeos_voll.dump`
- `backup/vollsicherung/20260823_161554_c246_vor_live_lumeos_voll.sql`

Live-Nachzug:

- `backup/c246/live-apply-shopping.log`
- Ergebnis: `DO`, `COMMIT`

Live nach dem Eingriff:

- `backup/c246/live-nach-shopping-counts.log`

| Messpunkt | Zahl |
|---|---:|
| Tabellen `shopping%` | 2 |
| Policies `shopping%` | 8 |
| Guard-Funktionen `shopping%` | 2 |
| Trigger `shopping%` | 4 |
| FKs `shopping%` | 5 |

### Negativprobe

Nachweisdatei:

- `backup/c246/apply_058b_shopping_only_negative.sql`
- `backup/c246/negative-shopping.log`

Die Erwartung wurde absichtlich von 2 auf 3 Tabellen verstellt. Die Probe wurde rot:

`C-246 shopping tables: 2`

Die Fehlermeldung selbst nennt noch den Originaltext `erwartet 2`; rot wurde sie durch die absichtlich falsche Bedingung.

## C-247: 564 gegen 566 Referenzbereiche

### Messung

Live:

- `medical.biomarker_reference_ranges`: 566
- Schemapruefung: `566 / 566 ok`
- `testdaten-pruefen.ts` erwartete vorher 564

Nachweisdateien:

- `backup/c246/c247-live-vor-messung.log`
- `backup/c246/c247-c191-rows.log`
- `backup/c246/c247-alias-range-rows.log`

Die zwei zusaetzlichen Bereichszeilen sind ApoB auf dem repo-validierten LOINC-Code `1884-6`:

| LOINC | Marker | Bereich | Sex | Min | Max | Einheit | Herkunft |
|---|---|---|---|---:|---:|---|---|
| `1884-6` | Apolipoprotein B | lab | all | 0 | 130 | mg/dL | Spec-Zeile von falschem `1869-7` auf belegten ApoB-Code gespiegelt |
| `1884-6` | Apolipoprotein B | optimal | all | 0 | 90 | mg/dL | Spec-Zeile von falschem `1869-7` auf belegten ApoB-Code gespiegelt |

`Prolactin` / `2842-3` ist ebenfalls C-191, aber nur als Enrichment-Marker:

| LOINC | Marker | Status | Bereich importiert |
|---|---|---|---|
| `2842-3` | Prolactin / Prolaktin | `repo_validated_c191` | nein |

### Entscheidung

Fall b: Die zwei Zeilen sind richtig.

Begruendung:

- `supabase/_pipeline/14_medical/144_biomarker_spec_enrichment.ts` erwartet bereits 566.
- `schema-sollstand.json` dokumentiert die Summe 566: C-140 ergaenzte 4 Bereichszeilen, C-191 ergaenzte 2 ApoB-Zeilen.
- Die zwei Differenzzeilen sind namentlich identifiziert und liegen auf dem belegten ApoB-Code `1884-6`, nicht auf der falschen Spec-Zeile `1869-7`.

Geaendert:

- `supabase/_pipeline/_validierung/testdaten-pruefen.ts`: Erwartung `medical.biomarker_reference_ranges` von 564 auf 566 in beiden Modi.

## Abschlusspruefungen

Finaler Kettenlauf:

- `backup/c246/kette-final.log`
- `SCHEMA VOLLSTAENDIG`
- `KETTE OK: 165.5s`

Live-Schemapruefung:

- `backup/c246/live-schema-final.log`
- `SCHEMA VOLLSTAENDIG`

Live-Testdaten:

- `backup/c246/live-testdaten-final.log`
- `OK: C-82 Testdaten stimmen.`

Nicht committet, nicht gestaged.
