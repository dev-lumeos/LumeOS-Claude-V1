# C-261 - Gefilterter Kimi-Abgleich

## Ausgangslage

[cmd] Rohzeilen aus C-260: 330397.
[cmd] Gefilterte Sachzeilen: 51391.
[cmd] Entfernt: 279006.

## Filter

| Regel | Entfernte Zeilen |
|---|---:|
| `ohne_entitaetszuordnung` | 94525 |
| `kein_sachfeld_hint` | 49666 |
| `pfad_cache` | 34910 |
| `pfad_backup_pre_merge` | 15073 |
| `pfad_apps` | 13167 |
| `pfad_stage` | 13091 |
| `feld_source_ids` | 9148 |
| `feld_rauschen_evidence` | 8083 |
| `entitaet_laufartefakt` | 7982 |
| `pfad_ckpt` | 7080 |
| `feld_entity_id` | 6088 |
| `pfad_baseline` | 5735 |
| `feld_enthaelt_.source_ids` | 1844 |
| `feld_domain` | 1723 |
| `feld_sections_used` | 1690 |
| `duplikat_gefiltert` | 1502 |
| `feld_rauschen_notes` | 1449 |
| `feld_source_relationship_ids` | 1100 |
| `feld_optional_context` | 1022 |
| `feld_generated_at` | 1007 |
| `feld_high_value_context` | 890 |
| `feld_mismatch_dimensions` | 819 |
| `feld_source_threshold` | 532 |
| `feld_source` | 444 |
| `feld_textzeile` | 294 |
| `feld_rauschen_queries` | 138 |
| `feld_enthaelt__hashes` | 4 |

## Zustände nach Filter

| Zustand | Zeilen |
|---|---:|
| `FEHLT` | 37886 |
| `ABWEICHEND` | 12110 |
| `UEBERNOMMEN` | 1395 |

## ABWEICHEND-Klassen

| Klasse | Zeilen |
|---|---:|
| `SACHKONFLIKT` | 10010 |
| `ZEITSTEMPEL` | 2097 |
| `FORMAT` | 3 |

## Gegenproben

[cmd] BPC-157 CAS bleibt nach dem Filter als `UEBERNOMMEN` erhalten: 3 Zeile(n).
[cmd] Negativprobe Cache-Pfad mit Sachfeld wird ausgeschlossen: `pfad_cache`.

## Ergebnis

[cmd] `NACHZUTRAGEN.md` gruppiert 955 Entitaeten mit gefilterten fehlenden Sachwerten.
[cmd] `SACHKONFLIKTE.md` enthaelt 10010 Sachkonflikte; Zeitstempel und Formatabweichungen sind getrennt.

[read] Der Rohstand `REPORT_DATA_ABGLEICH.jsonl` wurde nicht ueberschrieben.
