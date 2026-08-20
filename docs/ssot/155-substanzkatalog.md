# C-134: Konsolidierter Substanzkatalog

**Stand:** 2026-08-20  
**Gilt fuer:** `supplements.substance_catalog`, `supplements.substance_catalog_sources`

---

## Wie die drei Bestaende zusammenkommen

`[read]` Grundlage sind drei Bestaende: der bestehende
`supplements.supplement_catalog` mit 44 Stack-Supplements, die F-05-Datei
`supabase/_pipeline/daten/substanz-katalog.json` mit 320 Kandidaten und
Kimi `crawl_022` mit 291 Substanzen aus
`backup/kimi-research/Kimi_Agent/supplement_performance_database/data/substances/`.

`[cmd]` Kimi `crawl_022` liefert 154 Supplements, 62 Peptide und 75
Performance-Substanzen. Alle 291 IDs sind eindeutig. Gemessen belegt sind
286 Zeilen mit `external_ids`, 243 mit CAS oder CAS-Kandidaten, 277 mit
UNII, 243 mit PubChem CID und 155 mit ChEMBL ID.

`[cmd]` Der neue Kettenschritt `134_substance_catalog.ts` erzeugt
konservativ 567 Eintraege:

| Herkunft im Katalog | Eintraege |
|---|---:|
| Kimi Supplements | 154 |
| Kimi Peptides | 62 |
| Kimi Performance | 75 |
| LumeOS lokal, ohne eindeutigen Kimi-Treffer | 28 |
| F-05 Kandidat, ohne eindeutigen Kimi-Treffer | 248 |
| **Summe** | **567** |

`[cmd]` Die Herkunft steht getrennt in
`supplements.substance_catalog_sources`: 667 Zeilen, davon 291 Kimi, 44
LumeOS, 320 F-05 und 12 Cross-Domain-Links aus
`cross_domain_substance_mapping.json`.

`[cmd]` Die 44 lokalen Supplements werden nicht ersetzt. Sie bleiben der
konkrete Stack-Katalog; der neue Katalog ist die fachliche Substanzebene.
16 lokale Supplements haben einen eindeutigen Kimi-Treffer, 28 bleiben
als eigene lokale Eintraege erhalten. Beim F-05-Bestand treffen 72
Kandidaten eindeutig auf Kimi, 248 bleiben eigene Kandidaten.

`[read]` Die Dosisfelder bleiben getrennt: `official_label_dose`,
`guideline_dose`, `tolerable_upper_intake_level`,
`studied_dose_ranges` und `anecdotal_dose_ranges`. Sie sind Massstaebe
und Quellenfelder, keine Empfehlung. `recommended_dose` wird nicht
erfunden.

---

## Was durch Auftrennung entsteht

`[read]` Kimi trennt chemische Formen bewusst: Magnesiumglycinat ist
nicht Magnesiumoxid; CJC-1295, CJC-1295 DAC und Mod GRF 1-29 sind nicht
dieselbe Substanz.

`[cmd]` Der konsolidierte Bestand waechst deshalb nicht durch
Verschmelzen, sondern durch getrennte Substanzformen: Aus 291 Kimi-,
44 LumeOS- und 320 F-05-Zeilen werden 567 Katalogeintraege. Die
Reduktion gegen 655 Quellzeilen entsteht nur dort, wo eine Quelle
eindeutig auf Kimi verweist: 16 lokale und 72 F-05-Zeilen.

`[cmd]` Kimi hat fuer die im Auftrag genannten Dubletten keine
Katalogdubletten erzeugt: DSIP, Kisspeptin, Elamipretide und Mecasermin
kommen je einmal vor; MGF ist von PEG-MGF getrennt. Im lokalen
44er-Katalog liegt keine dieser Kimi-Dubletten als zweite eigene
Substanz.

`[read]` Die Ancillaries aus dem Cross-Domain-Mapping werden nicht
doppelt angelegt. 16 medikamentendomaenen-eigene Links bleiben dort,
statt als Supplement-/Performance-Substanz dupliziert zu werden.

---

## Ob der Gap-Score jetzt rechnet

`[cmd]` Vorher trugen 11 von 44 lokalen Supplements
`nutrients_provided`. Nach C-134 tragen im konsolidierten Katalog
ebenfalls 11 Eintraege maschinenlesbare `nutrients_provided`.

`[cmd]` Kimi `crawl_022` liefert keine direkten Felder
`nutrients_provided`, `nutrient_codes` oder `gap_codes`. Damit liefert
Kimi die vier fehlenden Gap-Codes, darunter `FAPUN3`, nicht in einer
Form, die der Gap-Score direkt lesen kann.

`[cmd]` Der Gap-Score ist dadurch fachlich besser vorbereitbar, aber
nicht voll rechenbar: Omega-3 ist als Kimi-Substanz
`sub_4480fcfa86` vorhanden und ueber die Aliasbruecke mit dem Stack
verbindbar; der fehlende Nährstoffcode am lokalen Supplement bleibt aber
eine Kurationsluecke.

`[cmd]` Der bestehende Stack bleibt unversehrt: In der Wegwerf-DB stehen
1 Stack, 4 Stack-Items und 360 Einnahmen; die 30-Tage-Compliance fuer
Tom liegt weiter bei 93,3 %. `stack_item_substance_matches` findet
Kreatin und Omega-3 eindeutig in Kimi. Vitamin D3 und Magnesium bleiben
im lokalen Katalog nutzbar, ohne eine chemische Form zu raten.

`[cmd]` `kimi-rule-input-audit.ts` laeuft weiter und meldet unveraendert:
42 Regeln auswertbar, 8 teilweise, 14 blockiert. C-134 aendert damit den
Katalog, nicht die Regelentscheidung.

---

## Was leer bleibt und warum

`[cmd]` `pharmacology.half_life` ist bei Kimi-Supplements und
Kimi-Performance in 0 Faellen belegt; 34 Peptid-Zeilen tragen eine
Halbwertszeit. F-05-Halbwertszeiten werden nicht als vertrauenswuerdiger
Wert importiert, sondern mit
`half_life_status = 'f05_value_not_imported_without_primary_source'`
markiert.

`[cmd]` CYP-Daten werden nur aus den Kimi-Feldern uebernommen: 30
Supplements, 1 Peptid und 10 Performance-Substanzen tragen CYP-Daten.
Es gibt keine klinische Inferenz aus Klassenbezeichnungen.

`[read]` Wechselwirkungen, Dosierungsempfehlungen, Zyklusaufbau und PCT
bleiben draussen. Der neue Katalog macht Herkunft und Identitaet
nachvollziehbar; er bewertet keine Substanz und empfiehlt keine Dosis.

---

## Nachweis

`[cmd]` Kettenlauf auf Wegwerf-Datenbank
`lumeos_kette_20260820115703`: Exit 0, 81 Schritte.

`[cmd]` `schema-vollstaendigkeit-pruefen.ts`: Exit 0,
`supplements.substance_catalog` 567/567,
`supplements.substance_catalog_sources` 667/667,
`supplements.substance_aliases` 1541/1132.

`[cmd]` `testdaten-einspielen.ts --today 2026-08-20` und
`testdaten-pruefen.ts`: Exit 0. Supplement-Nachweis:
44/1/4/360 fuer Katalog/Stacks/Items/Logs, Compliance 93,3 %.

`[cmd]` `kette-readme-pruefen.ts`: Exit 0.

`[cmd]` Live eingespielt auf `postgres`: `132_substance_alias_bridge.ts`
und `134_substance_catalog.ts` Exit 0. Live-Nachmessung:
`substance_catalog` 567, `substance_catalog_sources` 667,
`nutrients_provided` 11, `dev@lumeos.app` Stack-Items 4,
Einnahmen 360, Compliance 93,3 %.

`[cmd]` Live `schema-vollstaendigkeit-pruefen.ts`: Exit 0.
Live `testdaten-pruefen.ts`: Exit 0.

`[cmd]` `pnpm gate` nicht gruen: die Vorpruefer, Coach/Admin/API und
Builds liefen durch, aber `@lumeos/web` hat zwei rote Tests in
`apps/web/src/lib/nutrition/__tests__/vorlieben-tab.test.ts`
(`die Vorlieben werden immer vollstaendig geschrieben`,
`die Rangfolge verspricht keine Wirkung, die es nicht gibt`). Das liegt
im gesperrten Web-Arbeitsstand und wurde in C-134 nicht angefasst.
