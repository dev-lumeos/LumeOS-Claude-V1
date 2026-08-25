# C-266 Codex-Bericht

## Auftrag

Zwei Luecken aus C-264 pruefen und schliessen, soweit die Quelle es traegt:

1. Die fuenf Enhanced-Felder in `supplements.supplement_user_texts`.
2. Die 28 sichtbaren Sammelnamen ohne Nutzertext.

Quelle:

- `docs/kimi_research/supplement_performance_database/data/substances/substance_user_texts.jsonl`

## Enhanced-Felder

Die Quelle traegt die Felder. Der Import aus C-264 hat sie fallen gelassen.

Quellmessung vor dem Lauf:

| Feld | Quelle |
|---|---:|
| `irreversibel_de` | 112 |
| `ueberwachung_de` | 96 |
| `reinheit_de` | 134 |
| `nicht_im_blut_de` | 134 |
| `rechtslage_klartext_de` | 136 |

Live vor C-266:

| Feld | Live vorher |
|---|---:|
| `irreversibel_de` | 0 |
| `ueberwachung_de` | 0 |
| `reinheit_de` | 0 |
| `nicht_im_blut_de` | 0 |
| `rechtslage_klartext_de` | 0 |

Umsetzung:

- Neuer Kettenschritt `141u`
- Datei: `supabase/_pipeline/13_supplements/141b_supplement_kimi_enhanced_textfelder.ts`
- Eingehangen hinter `141t`
- `146a` haengt jetzt an `141u`
- Der Schritt liest dieselbe Kimi-Datei und aktualisiert nur die 15 Enhanced-Sprachspalten.
- Keine Texte werden erzeugt oder geraten.

Live nach C-266:

| Feld | Live nachher |
|---|---:|
| `irreversibel_de` | 112 |
| `ueberwachung_de` | 96 |
| `reinheit_de` | 134 |
| `nicht_im_blut_de` | 134 |
| `rechtslage_klartext_de` | 136 |

Vollsicherung vor Live-Eingriff:

- `backup/c266/20260825_072841_before_live.dump`

## Sammelnamen

Gemessen: 28 sichtbare Eintraege haben weiterhin keinen Text. Alle 28 stammen aus `lumeos_supplement_catalog`.

Von diesen 28 haben 15 Unterformen mit Text:

- `caffeine`: 2 Kinder, 2 mit Text
- `calcium`: 2 Kinder, 2 mit Text
- `collagen`: 1 Kind, 1 mit Text
- `iron`: 2 Kinder, 2 mit Text
- `lions-mane`: 1 Kind, 1 mit Text
- `magnesium`: 7 Kinder, 7 mit Text
- `tongkat-ali`: 1 Kind, 1 mit Text
- `vitamin-a`: 1 Kind, 1 mit Text
- `vitamin-b12`: 2 Kinder, 2 mit Text
- `vitamin-b6`: 1 Kind, 1 mit Text
- `vitamin-c`: 1 Kind, 1 mit Text
- `vitamin-d3`: 1 Kind, 1 mit Text
- `vitamin-e`: 1 Kind, 1 mit Text
- `whey-protein`: 3 Kinder, 3 mit Text
- `zinc`: 3 Kinder, 3 mit Text

13 haben keine Unterformen mit Text:

- `ashwagandha-ksm66`
- `bcaas`
- `biotin`
- `curcumin-turmeric`
- `electrolytes`
- `fiber-psyllium-husk`
- `folate-b9`
- `glucosamine`
- `nac`
- `probiotics`
- `spirulina`
- `turkesterone`
- `vitamin-k2-mk7`

Entscheidung:

- Weg a, Vererben, traegt nicht: Bei Magnesium, Calcium, Iron, Zinc, Whey und Caffeine unterscheiden sich die Formen fachlich.
- Weg b, Zusammenfuehren, traegt nicht als Codex-Import: Ein Sammeltext waere eine neue redaktionelle Fassung und bei 13 Eintraegen ohne Kinder nicht moeglich.
- Gewaehlt: Weg c, melden und an Kimi geben. Die 28 Sammelnamen brauchen eigene Sammeltexte mit Quellen. Ich habe keine Sammeltexte synthetisiert.

## Gegenproben

SARM mit `irreversibel_de`:

- `sub_a4deb37c4d` / Ostarine hat nach C-266 `irreversibel_de`, `ueberwachung_de`, `reinheit_de`, `nicht_im_blut_de` und `rechtslage_klartext_de`.

Magnesium als Sammelname:

- `magnesium` bleibt ohne Text.
- Grund: Sammelname, 7 Unterformen mit Text. Vererbung waere fachlich falsch.

Electrolytes als Sammelname ohne Kinder:

- `electrolytes` bleibt ohne Text.
- Grund: keine Unterformen mit Text; Quelle liefert keinen Sammeltext.

Negativprobe:

- In einer Rollback-Transaktion wurde eine gefuellte `rechtslage_klartext_de`-Zelle geleert.
- Zaehler fiel von 136 auf 135.
- Danach `ROLLBACK`, live unveraendert.

## Pruefungen

Live:

- `schema-vollstaendigkeit-pruefen.ts`: `SCHEMA VOLLSTAENDIG`
- `testdaten-pruefen.ts`: `OK: C-82 Testdaten stimmen.`

Wegwerf-Kette:

- Wegwerf-Datenbank: `lumeos_kette_20260825003147`
- `141u` lief: `OK 141u: 0.9s`
- Enhanced-Zaehler in der Wegwerf-Datenbank:
  - `irreversibel_de`: 112
  - `ueberwachung_de`: 96
  - `reinheit_de`: 134
  - `nicht_im_blut_de`: 134
  - `rechtslage_klartext_de`: 136
- Abschluss-Schemapruefung blieb wegen C-265 rot:
  - `medical.biomarker_spec_enrichment` fehlt
  - `medical.biomarker_aliases` fehlt
  - `medical.biomarker_marker_candidates` fehlt
  - `medical.import_lab_report_rows` fehlt
  - Medical LOINC-Slug-Eindeutigkeit: 3 Abweichungen

Das ist nicht durch C-266 verursacht.

## Nachweisdateien

- `scratchpad/c266_messen.out.txt`
- `scratchpad/c266_messen_after.out.txt`
- `scratchpad/c266_live_import.out.txt`
- `scratchpad/c266_negativprobe.out.txt`
- `scratchpad/c266_schema.out.txt`
- `scratchpad/c266_testdaten.out.txt`
- `scratchpad/c266_kette.out.txt`
- `scratchpad/c266_kette_counts.out.txt`

Nicht committet, nicht gestaged, nicht gepusht.
