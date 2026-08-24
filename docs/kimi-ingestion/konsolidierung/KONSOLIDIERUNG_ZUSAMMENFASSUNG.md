# Konsolidierung Zusammenfassung

## Dateizählung

- Arbeitsverzeichnisse: 14
- Top-level Dateien im aktuellen Baum: 384 (Auftrag nennt 390; aktueller Baum liefert 384).
- Rekursiv geöffnete Dateien: 1251

| Verzeichnis | Top | Rekursiv | Geöffnet | Entitäten | Übernommen | Fehlt | Abweichend | Fehler |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| crawl_025_ws | 16 | 16 | 16 | 173 | 0 | 1396 | 0 | 0 |
| crawl_027_profiles | 37 | 37 | 37 | 37 | 885 | 5796 | 2326 | 0 |
| crawl_027_ws | 11 | 11 | 11 | 39 | 401 | 3430 | 1278 | 0 |
| crawl_028_ws | 12 | 12 | 12 | 166 | 1 | 5726 | 157 | 0 |
| crawl_029_ws | 22 | 22 | 22 | 356 | 46 | 10552 | 284 | 0 |
| crawl_030_ws | 12 | 12 | 12 | 279 | 46 | 16280 | 372 | 0 |
| crawl_031_ws | 19 | 19 | 19 | 216 | 27 | 34851 | 523 | 0 |
| crawl_032_ws | 30 | 30 | 30 | 219 | 40 | 73019 | 527 | 0 |
| crawl_033_ws | 19 | 19 | 19 | 19 | 0 | 1132 | 0 | 0 |
| crawl_034_ws | 26 | 26 | 26 | 212 | 159 | 8031 | 181 | 0 |
| crawl_035_ws | 19 | 19 | 19 | 44 | 0 | 1991 | 0 | 0 |
| crawl_036_ws | 17 | 17 | 17 | 158 | 0 | 1115 | 0 | 0 |
| crawl_037_ws | 42 | 42 | 42 | 993 | 3547 | 43935 | 5525 | 0 |
| crawl_038_ws | 102 | 969 | 969 | 660 | 8350 | 86305 | 12163 | 0 |

## Gegenprobe crawl_027_ws/A.json

- Fehlende CAS: 2 (Auftrag: 19).
- Fehlende Aliaswerte: 5 (Auftrag: 37).
- Entitäten ohne Gegenstück: 1 (Auftrag: 17).
- Grund der Abweichung: Im aktuellen `data/admin/_canonical_id_lookup.json` und `data/substances/` lösen mehr Namen auf als im Auftrag beschrieben; die Datenlage ist reicher als der gemessene Anlass.

## Negativprobe

- Mutierte Datei: `D:\GitHub\LumeOS-Claude-V1\scratchpad\c260_negative\A_pubchem_mutiert.json`
- `PubChem_CID`-Abweichungen erkannt: 2
- Ergebnis: PASS

## Ausgabedateien

- `REPORT_DATA_ABGLEICH.jsonl`
- `REPORT_FILE_STATUS.jsonl`
- `FEHLENDE_WERTE.md`
- `ABWEICHUNGEN.md`
- `FEHLENDE_ENTITAETEN.md`
- `KONSOLIDIERUNG_ZUSAMMENFASSUNG.json`
