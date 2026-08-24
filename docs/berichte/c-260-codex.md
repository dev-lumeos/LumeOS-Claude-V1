# C-260 - Report/data Abgleich

## Umfang

[cmd] Geoeffnet wurden die 14 Arbeitsverzeichnisse unter
`backup/kimi-research/Kimi_Agent/supplement_performance_database/reports/`.

Die Auftragszahl `390` geht im aktuellen Baum nicht auf:

| Messung | Dateien |
|---|---:|
| Top-level Dateien in den 14 Verzeichnissen | 384 |
| Rekursiv geoeffnete Dateien | 1.251 |

Grund: `crawl_038_ws` hat 102 Top-level Dateien, aber 969 Dateien
rekursiv. Der Lauf hat rekursiv geoeffnet, damit keine Datei aus den
Arbeitsverzeichnissen ausgelassen wird.

## Ergebnisdateien

Alle Artefakte liegen unter `docs/kimi-ingestion/konsolidierung/`.

| Datei | Inhalt |
|---|---|
| `REPORT_DATA_ABGLEICH.jsonl` | 330.397 Vergleichszeilen, eine Zeile je extrahiertem Report-Wert |
| `REPORT_FILE_STATUS.jsonl` | 1.251 geoeffnete Dateien mit Parserstatus |
| `FEHLENDE_WERTE.md` | fehlende Werte nach Entitaet gruppiert |
| `ABWEICHUNGEN.md` | abweichende Werte, beide Seiten ohne Entscheidung |
| `FEHLENDE_ENTITAETEN.md` | Entitaeten ohne Treffer ueber die Namensbruecke |
| `KONSOLIDIERUNG_ZUSAMMENFASSUNG.md/json` | Summen und Gegenproben |

[cmd] Parserstatus: 1.062 JSON, 5 JSONL, 2 JSONL-mit-`.json`,
112 Textdateien, 67 unbekannte Textdateien, 3 Binary-Metadaten.
Parserfehler: 0.

## Vergleich

[cmd] Gesamt ueber alle extrahierten Werte:

| Zustand | Zeilen |
|---|---:|
| `UEBERNOMMEN` | 13.502 |
| `FEHLT` | 293.559 |
| `ABWEICHEND` | 23.336 |

[read] Diese Zahlen sind kein Importentscheid. Sie zeigen nur, welche
Report-Werte im aktuellen `data/`-Stand vorhanden, fehlend oder
abweichend sind.

## Gegenprobe `crawl_027_ws/A.json`

Die bekannte Gegenprobe aus dem Auftrag liefert gegen den aktuellen
Baum nicht mehr die Anlasszahlen `19 / 37 / 17`.

| Messpunkt | Auftrag | Gemessen |
|---|---:|---:|
| fehlende CAS | 19 | 2 |
| fehlende Aliaswerte | 37 | 5 |
| Entitaeten ohne Gegenstueck | 17 | 1 |

[cmd] Fehlende CAS im aktuellen Stand:

| Entitaet | Feld | Wert | Aufgeloest zu |
|---|---|---|---|
| Sermorelin | `identity.CAS` | `86168-78-7` | `drug_85c8d4ddec` |
| Ibutamoren (MK-677) | `identity.CAS` | `159634-47-6` | `sub_ecff0befbf` |

[cmd] Einzige Entitaet ohne Gegenstueck:
`5-Amino-1MQ (NOT in dataset - evaluate)`.

[read] Grund der Abweichung: Die normalisierte Bruecke
`data/admin/_canonical_id_lookup.json` loest im aktuellen Bestand fast
alle Namen auf. Der Anlassbefund war damit richtig fuer den damals
gemessenen Stand, aber nicht mehr fuer den heutigen Quellbaum.

## Negativprobe

[cmd] Kopie:
`scratchpad/c260_negative/A_pubchem_mutiert.json`.

Mutation: `BPC-157 identity.PubChem_CID` wurde von `9941957` auf
`999999` gesetzt.

Ergebnis: Die Pruefung meldete `PubChem_CID` als `ABWEICHEND`
(2 Zeilen, weil der Reportwert in der Struktur doppelt extrahiert wird).
Die Negativprobe ist damit rot, wenn ein uebernommener Wert veraendert
wird.

## Grenzen

[annahme] Text-, Code- und unbekannte Textdateien werden geoeffnet und
im File-Status gezaehlt. Fuer den maschinellen Wertabgleich werden dort
nur identitaetsnahe Zeilen mit Tokens wie `CAS`, `UNII`, `PubChem`,
`ChEMBL`, `InChIKey`, `sequence`, `alias`, `compound` oder `substance`
als Report-Werte ausgegeben.

[cmd] Es wurde nichts nach `data/` zurueckgeschrieben und nichts
importiert.
