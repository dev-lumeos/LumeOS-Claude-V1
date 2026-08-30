# C-270 — Dosis-Anreicherung

Stand: 2026-08-25

## Erwartung vor dem Lauf

Quelle: `docs/kimi_research/supplement_performance_database/data/evidence/supplement_dosing_enrichment.jsonl`

Kimi liefert 290 Dosis-Anreicherungen. Die Werte stehen unter `fields.*`; C-262 hat diese Datei nicht in `supplement_dosing` gehoben.

Gemessen vor dem Import, auf die 290 Kimi-Zeilen bezogen:

| Feld | vorher DB | Quelle Feldobjekte | Quelle echte Werte | Erwartung Import |
|---|---:|---:|---:|---:|
| `guideline_dose` | 0 | 290 | 18 | 290 |
| `official_label_dose` | 1 | 290 | 40 | 290 |
| `upper_limit` | 38 | 252 | 3 | 252 |
| `studied_dose_ranges` | 83 | 206 | 120 | 206 |
| `dose_unit` | 2 | 61 | 58 | 58 |
| `frequency` | kein Feld | 61 | 58 | 58 |
| `duration_studied` | kein Feld | 61 | 58 | 58 |
| `status = 'unbekannt'` | 115 | 143 ohne echten Dosiswert | - | sinkt |

Die Differenz 61 zu 58 ist kein Importfehler: Bei L-Arginine, Alpha-GPC und Apple cider vinegar steht das Feldobjekt, aber `value = null` mit `missing_reason = "Quelle bei Verifikation falsifiziert (CRAWL_037 QA_1)"`. Diese drei bekommen keine Einheit, Frequenz oder Studiendauer.

## Änderung

Neuer Kettenschritt: `141v` hinter `141u`:

`supabase/_pipeline/13_supplements/141c_supplement_dosing_enrichment.ts`

Ergänzte Spalten an `supplements.supplement_dosing`:

`frequency_de`, `frequency_en`, `frequency_th`, `duration_studied_de`, `duration_studied_en`, `duration_studied_th`, `provenance_note`, `integration_note`, `sources`.

Der Import verbindet `entity_id` aus Kimi mit `supplements.supplements.slug`. Die bisherige C-262-Stelle konnte die Dosisdaten nicht treffen, weil dort sinngemäß UUID gegen `sub_*` verglichen wurde und außerdem nicht unter `fields.*` gelesen wurde.

Importlog live:

```text
UPDATE 290
OK: C-270 Dosis-Enrichment 290, guideline 290, upper 252, studied 206, unit 58, frequency 58, duration 58, unknown 0
```

## Nachher

Auf die 290 Kimi-Zeilen bezogen:

| Feld | nachher |
|---|---:|
| `status = 'bekannt'` | 290 |
| `status = 'unbekannt'` | 0 |
| `guideline_dose` | 290 |
| `official_label_dose` | 290 |
| `upper_limit` | 252 |
| `studied_dose_ranges` | 206 |
| `dose_unit` | 58 |
| `frequency_en` | 58 |
| `duration_studied_en` | 58 |
| `provenance_note` | 290 |
| `integration_note` | 290 |
| `sources` nicht leer | 147 |

Auf die ganze Tabelle mit 566 Zeilen bezogen bleiben 276 Nicht-Kimi-Zeilen `status = 'unbekannt'`. Das ist gewollt: 248 F-05-Kandidaten und 28 lokale Altzeilen haben keinen Kimi-Datensatz.

## Gegenproben

Namentliche Stichproben:

| Substanz | Ergebnis |
|---|---|
| Creatine monohydrate (`sub_9f9bb8c160`) | `guideline_dose.value = "3-5 g/day maintenance (or 0.1 g/kg/day); loading 20 g/day (4x5 g) 5-7 days optional - ISSN position stand 2017"` |
| Vitamin A (retinol) (`sub_d370f8f2d6`) | `studied_dose_ranges.value` enthält `750-3000 mcg RAE/day`, Quelle NIH ODS Fact Sheet, `dose_unit = "mcg RAE/day"`, Frequenz und Studiendauer gefüllt |
| L-Arginine (`sub_c010daebb9`) | `status = 'bekannt'`, aber Dosiswerte leer, weil Kimi die Quelle in QA falsifiziert hat |
| Vitamin A Sammelname (`vitamin-a`) | bleibt `status = 'unbekannt'`, weil Kimi Retinol und Beta-Carotin beschreibt, nicht den Sammelnamen |

Negativprobe:

Mit `C270_EXPECT_GUIDELINE_DOSE=291` bricht der Schritt rot ab:

```text
ERROR: C-270: guideline_dose 290, erwartet 291
```

## Lauf und Sicherung

Live-Sicherung vor Einspielung:

`backup/vollsicherung/20260825_132545_c270_before_live.dump`

Kettenlauf auf Wegwerf-Datenbank:

```text
Kette: supabase/_pipeline/kette.json (101 Schritte)
OK 141v: 1.0s
SCHEMA VOLLSTAENDIG
KETTE OK: 226.9s
```

Validierung nach Live-Einspielung:

```text
SCHEMA VOLLSTAENDIG
OK: C-82 Testdaten stimmen.
```

`pnpm gate` ist nicht grün. Es bricht am Nummern-Wächter vor Typecheck/Test/Build ab:

```text
[nummern] auftrag-ohne-punkt: docs/auftraege/c-270-codex.md traegt C-270 -- angelegt ist die Nummer weder in TODO.md noch in ERLEDIGT.md.
[nummern] auftrag-ohne-punkt: docs/auftraege/g-187-claude-code.md traegt G-187 -- angelegt ist die Nummer weder in TODO.md noch in ERLEDIGT.md.
```

Ich habe `docs/todo/` und `docs/ssot/` nicht angepasst.
