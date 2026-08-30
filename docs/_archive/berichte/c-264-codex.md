# C-264 Codex-Bericht

## Auftrag

Kimis Nutzertexte und FAQ-Zeilen aus `docs/kimi_research/supplement_performance_database/data/substances/` ersetzen die C-257-Schablonen.

Quellen:

- `substance_user_texts.jsonl`: 290 Datensaetze
- `substance_faq.jsonl`: 1.279 Datensaetze

Zieltabellen:

- `supplements.supplement_user_texts`
- `supplements.supplement_faq`

## Umsetzung

Neuer Kettenschritt:

- `supabase/_pipeline/13_supplements/141a_supplement_kimi_nutzertexte.ts`
- in `supabase/_pipeline/kette.json` hinter `141_supplement_textkorrektur.sql` eingehangen
- Folgeabhaengigkeit `146a` von `141s` auf `141t` verschoben

Schema-Anpassung:

- `supplements.supplement_user_texts.sources jsonb not null default '[]'::jsonb`
- `supplements.supplement_faq.sources jsonb not null default '[]'::jsonb`

Die FAQ-Quelldatei traegt keine eigenen `sources`. Deshalb bekommt jede FAQ-Zeile die `sources` des passenden `entity_id` aus `substance_user_texts.jsonl`. Ohne diesen Join waeren die FAQ-Antworten nach dem Import unbelegt gewesen.

Die bestehenden Check-Constraints fuer `wofuer_de` und `wofuer_en` wurden von 2-4 Eintraegen auf 1-4 Eintraege erweitert. Grund: Kimi liefert fachlich gueltige Eintraege mit nur einem Punkt, z. B. Querverweise auf eine andere Form. Der erste Importversuch ist genau an dieser Stelle sauber in der Transaktion abgebrochen.

## Erwartung vor dem Lauf

- `supplement_user_texts`: 289 vorher, 290 nachher
- `supplement_faq`: 867 vorher, 1.279 nachher
- `sources`: in beiden Zieltabellen vorhanden und gefuellt
- `kurz_was_de` nach Herausrechnen des Namens: mindestens 285 verschiedene Texte
- FAQ-Antworten: mindestens 1.270 verschiedene Antworten

## Live-Einspielung

Vollsicherung vor dem Live-Eingriff:

- `backup/c264/20260825_065311_before_live.dump`
- Groesse: 20.779.308 Bytes

Live-Import:

- `DELETE 867` aus `supplement_faq`
- `DELETE 289` aus `supplement_user_texts`
- `INSERT 290` in `supplement_user_texts`
- `INSERT 1279` in `supplement_faq`
- zweiter Lauf nach FAQ-`sources`-Patch erneut erfolgreich und idempotent

## Nachher-Zahlen

Gemessen auf der laufenden Instanz:

| Messung | Zahl |
|---|---:|
| `supplement_user_texts` | 290 |
| `supplement_faq` | 1.279 |
| `supplement_user_texts` mit nichtleeren `sources` | 290 |
| `supplement_faq` mit nichtleeren `sources` | 1.279 |
| `zu_wenig_de` nichtleer | 49 |
| `mythen_de` nichtleer | 260 |

`tools/texte-pruefen.mjs` gegen DB-Export:

| Pruefung | Ergebnis |
|---|---:|
| Texte | 290 |
| FAQ-Zeilen | 1.279 |
| verschiedene `kurz_was_de` ohne Namen | 290 |
| verschiedene `antwort_de` | 1.279 |
| verschiedene `frage_de` | 1.276 |
| gemeinsamer Schluss | 0 Woerter |
| haeufigste 5-Wort-Folge | 3 |

Negativprobe:

- 10 Textzeilen absichtlich auf dieselbe Schablone gesetzt
- Pruefer wurde rot:
  - verschiedene `kurz_was_de`: 281 statt mindestens 285
  - haeufigste 5-Wort-Folge: 10 statt hoechstens 3

## Stichproben

| Probe | ID | Befund |
|---|---|---|
| Magnesium glycinate | `sub_10b90cdfbe` | Nutzertext und FAQ vorhanden |
| Kreatin | `sub_9f9bb8c160` | Nutzertext und FAQ vorhanden |
| Vitamin D3 | `sub_479964998b` | Nutzertext und FAQ vorhanden |
| Bromocriptin | `sub_b30d752d32` | Nutzertext und FAQ vorhanden |
| Peptid | `sub_dcb8ab1209` / BPC-157 | Nutzertext und FAQ vorhanden |

## Substanzen ohne Text

28 sichtbare LumeOS-Altzeilen haben weiterhin keinen Kimi-Text. Alle 28 stammen aus `lumeos_supplement_catalog`, nicht aus den 290 Kimi-Zeilen:

`ashwagandha-ksm66`, `bcaas`, `biotin`, `caffeine`, `calcium`, `collagen`, `curcumin-turmeric`, `electrolytes`, `fiber-psyllium-husk`, `folate-b9`, `glucosamine`, `iron`, `lions-mane`, `magnesium`, `nac`, `probiotics`, `spirulina`, `tongkat-ali`, `turkesterone`, `vitamin-a`, `vitamin-b12`, `vitamin-b6`, `vitamin-c`, `vitamin-d3`, `vitamin-e`, `vitamin-k2-mk7`, `whey-protein`, `zinc`.

Das ist kein Importfehler: diese 28 Zeilen haben keinen passenden Kimi-Datensatz in `substance_user_texts.jsonl`.

## Pruefungen

Live-Schemapruefung:

- `SCHEMA VOLLSTAENDIG`
- `supplement_user_texts`: 290 / 290
- `supplement_faq`: 1.279 / 1.279
- Spaltenlisten fuer beide Tabellen geprueft

Testdaten:

- `OK: C-82 Testdaten stimmen.`

Kettenlauf:

- Wegwerf-Datenbank: `lumeos_kette_20260825000731`
- C-264-Schritt `141t` lief erfolgreich: `OK 141t: 1.2s`
- C-264-Zahlen in der Wegwerf-Datenbank:
  - `supplement_user_texts`: 290
  - `supplement_faq`: 1.279
  - `texts_sources_nonempty`: 290
  - `faq_sources_nonempty`: 1.279
- Abschluss-Schemapruefung der Wegwerf-Datenbank brach mit 8 Abweichungen ab, nicht aus C-264:
  - `medical.biomarker_spec_enrichment` fehlt
  - `medical.biomarker_aliases` fehlt
  - `medical.biomarker_marker_candidates` fehlt
  - `medical.import_lab_report_rows` fehlt
  - dazu 3 Medical-LOINC-Slug-Eindeutigkeitsabweichungen

Die laufende Instanz ist nach dem Live-Einspielen schematisch gruen; der Kettenabbruch betrifft den frischen Aufbau im Medical-Bereich.

## Nachweisdateien

- `scratchpad/c264_inspect.json`
- `scratchpad/c264_schema_rerun.out.txt`
- `scratchpad/c264_testdaten_rerun.out.txt`
- `scratchpad/c264_verify_rerun.out.txt`
- `scratchpad/c264_kette.out.txt`
- `scratchpad/c264_kette_counts.out.txt`
- `backup/c264/texte-pruefen.json`
- `backup/c264/texte-pruefen-negativ.json`

Nicht committet, nicht gestaged, nicht gepusht.
