# C-188: Alias-Bruecke nachgezogen

Stand: 2026-08-21

## Was die Kette blockiert hat

`[cmd]` `supabase/_pipeline/13_supplements/132_substance_alias_bridge.ts`
erwartete exakt `291` Kimi-Substanzen. Der aktuelle Bestand aus
`crawl_027` enthaelt:

| Datei | Zeilen | eindeutige IDs |
|---|---:|---:|
| `supplements.jsonl` | 154 | 154 |
| `peptides.jsonl` | 61 | 61 |
| `performance_compounds.jsonl` | 75 | 75 |
| **Summe** | **290** | **290** |

`[read]` Die Differenz ist keine stille Loeschung. `crawl_027_QA1_audit.md`
nennt das Duplikat explizit: `Melanotan I` wurde in
`Melanotan I (afamelanotide)` gemergt.

`[cmd]` Geaendert wurden die Kimi-Waechter in:

| Datei | vorher | jetzt |
|---|---|---|
| `132_substance_alias_bridge.ts` | exakt `291` | mindestens `290`, eindeutige IDs |
| `134_substance_catalog.ts` | exakt `291` und abgeleitete Summen `567/667` | mindestens `290`, Summen aus dem aktuellen Payload |
| `147_substance_lab_markers.ts` | exakt `291` | mindestens `290`, eindeutige IDs |
| `schema-sollstand.json` | `substance_catalog >= 567`, Quellen `>= 667` | `substance_catalog >= 566`, Quellen `>= 668` |

`[cmd]` Die Bruecke wurde neu eingelesen. Live stehen jetzt:

| Tabelle / Sicht | Zahl |
|---|---:|
| `supplements.substance_aliases` | 1.541 |
| Kimi-Substanzen in `substance_aliases` | 290 |
| `substance_alias_matches` LumeOS-Kimi | 30 |
| `substance_alias_matches` F05-Kimi | 125 |
| `substance_alias_matches` LumeOS-F05 | 23 |
| `supplements.substance_catalog` | 566 |
| `supplements.substance_catalog_sources` | 668 |
| `supplements.substance_lab_effects` | 222 |

`[cmd]` Der erste Kettenlauf nach der Skriptkorrektur kam durch die
Kettenschritte, fiel aber in der Schemapruefung, weil
`schema-sollstand.json` noch `567` Substanzen erwartete. Nach dem
Sollstand-Nachzug lief der Kettenlauf mit `87` Schritten und Exit 0.

## Was `crawl_027` an Identitaeten geaendert hat

`[cmd]` Vor dem Nachzug enthielt die Live-Bruecke noch alte
Identitaetsdaten im `raw`-Bestand:

| Substanz | alter Befund in der Bruecke | Matches auf diese Substanz |
|---|---|---:|
| `BPC-157` | `UNII = MCG77F8K54` im alten Raw | 2 |
| `KPV` | `UNII = OVF025LA77` im alten Raw | 0 |
| `PEG-MGF` | `UNII = HR39ELT2U8` im alten Raw | 2 |
| `CJC-1295 (no DAC)` | `PubChem_CID = 91971820` im alten Raw | 0 |
| `Melanotan I` | zweite Kimi-ID neben `Melanotan I (afamelanotide)` | 0 |

`[read]` Damit war der Nachzug von C-185 mit betroffen: Die Bruecke ordnet
ueber Namen und Kennungen zu, also duerfen falsche Kennungen nicht im
abgeleiteten Bestand bleiben.

`[cmd]` Nach dem Nachzug zeigen die aktuellen `external_ids`:

| Substanz | aktueller Stand |
|---|---|
| `KPV` | `UNII = null`, `PubChem_CID = 125672` |
| `BPC-157` | `UNII = null`, `PubChem_CID = 9941957` |
| `PEG-MGF` | `UNII = null` |
| `CJC-1295 (no DAC)` | `PubChem_CID = null`, Formel `C152H252N44O42` |
| `CJC-1295 with DAC` | `PubChem_CID = 91971820`, Formel `C165H269N47O46` |
| `Melanotan I (afamelanotide)` | eine ID, 10 Aliaszeilen |

`[cmd]` Eine Zuordnung auf eine vertauschte CJC-PubChem-ID lag vor dem
Nachzug nicht als Match vor (`0` Matches fuer `CJC-1295 (no DAC)`), aber
der Katalog enthielt die falsche Kennung im Raw. Nach dem Nachzug ist die
falsche Kennung nicht mehr aktueller `external_ids`-Wert. Die Matches auf
die betroffenen Identitaeten bleiben sichtbar, aber auf korrigiertem Raw:
`BPC-157` 2, `PEG-MGF` 2, `CJC-1295 with DAC` 2.

`[annahme]` C-185 ist damit fuer die Datenbankableitung geschlossen: Die
Kimi-Quelle ist korrigiert, die Alias-Bruecke ist nachgezogen, der
konsolidierte Substanzkatalog entfernt den gemergten Alt-Datensatz.

## Wo sonst feste Erwartungen stehen

`[cmd]` Die Suche nach festen Erwartungen zeigt drei Klassen:

| Klasse | Beispiele | Einschätzung |
|---|---|---|
| Feste Snapshots | `foods = 7140`, `nutrient_defs = 138`, `training.exercises = 1416`, `XLSX = 2343`, `LOINC = 11676` | Gleichheit ist richtig. Diese Schritte pruefen einen bekannten importierten Snapshot oder eine kuratierte Datei. Wenn sich die Quelle aendert, soll der Schritt sichtbar brechen. |
| Kurations-Zwischenschritte | Muskelgruppen `109 -> 108 -> 107 -> 96 -> 95`, `exercise_muscles = 6588/6624/6625`, konkrete Kinderzahlen | Gleichheit ist richtig. Diese Zahlen belegen, dass eine Kuration keine Zuordnungen verliert oder genau die erwartete Kollision beseitigt. |
| Wachsende Kataloge | Kimi-Substanzen, Medikamente, Aliaszeilen, `schema-sollstand` Mindestzeilen | Untergrenze ist richtig. Wachstum darf nicht brechen; Schrumpfen muss erklaert werden. C-188 hat die Kimi-Faelle auf diese Form gebracht. |

`[cmd]` In `schema-sollstand.json` sind die Zeilenzahlen Mindestzeilen.
Sie brechen nicht, wenn ein Bestand waechst. Angepasst wurden nur die
Mindestwerte, die durch den belegten Merge nicht mehr erreichbar waren:
`substance_catalog` von `567` auf `566`, `substance_catalog_sources` von
`667` auf `668`.

`[cmd]` Weiterhin bewusst hart bleiben unter anderem:

| Erwartung | Grund |
|---|---|
| `local.supplements = 44` | lokale Seed-Datei, nicht wachsender Kimi-Bestand |
| `F05 substances = 320` | lokale Recherchedatei, eigener Bestand |
| `rule_catalog = 64` | aktueller Regelbestand; eine neue Regel ist eine explizite Lieferung |
| `lab_marker_catalog = 66`, `substance_lab_effects = 222` | aktueller C-162-Bestand; neue Marker/Effekte brauchen Abgleich gegen LOINC |
| `food_nutrients.codes = 138` | BLS-Naehrstoffvokabular, kein variabler Crawl |

`[cmd]` Nachweis:

| Pruefung | Ergebnis |
|---|---|
| `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts` | Exit 0, `87` Schritte |
| `pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts` | Exit 0, `SCHEMA VOLLSTAENDIG` |
| `pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts` | Exit 0, `OK: C-82 Testdaten stimmen.` |
| `pnpm gate` | Exit 0 |

