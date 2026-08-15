# Verlust der Einzelfettsäuren und Reparatur der Sollliste

`[cmd]` Erhoben am 2026-08-16 gegen die lokale Supabase-Instanz
`supabase_db_LumeOS-Claude-V1`.

---

## Ergebnis

`[cmd]` Vor dem Nachtrag trug `nutrition.food_nutrients` 698.092 Werte
über 108 Nährstoffcodes; `data_source` enthielt nur
`bls_4_0_local_import`.

`[cmd]` `031_fettsaeuren_nachtrag.sql` wurde ausgeführt. Der Schritt
kopierte 171.409 Werte aus
`supabase/_data/bls_4_0_fettsaeuren.zip` nach
`nutrition.food_nutrients`.

`[cmd]` Nach dem Lauf:

| Prüfung | Ist |
|---|---:|
| `nutrition.food_nutrients` | 869.501 |
| verschiedene Nährstoffcodes | 138 |
| Codes mit Doppelpunkt | 30 |
| `data_source = bls_4_0_local_import` | 698.092 |
| `data_source = bls_4_0_xlsx_nachtrag` | 171.409 |

`[cmd]` `_validierung/v031_fettsaeuren.sql` meldete alle acht
Zählprüfungen grün: 138 Codes mit Werten, 0 Codes ohne Werte, 171.409
Nachtragswerte, 698.092 unangetastete Bestandswerte, 869.501 gesamt,
0 Nachtragszeilen ohne Doppelpunkt, 0 Waisen und 0 Werte ausserhalb des
Bereichs.

---

## Ursache

`[cmd]` Die Schrittdatei
`supabase/_pipeline/03_bls_import/031_fettsaeuren_nachtrag.sql`
existierte bereits, ebenso die Quelle
`supabase/_data/bls_4_0_fettsaeuren.zip` und die Validierung
`supabase/_pipeline/_validierung/v031_fettsaeuren.sql`.

`[cmd]` `supabase/README.md` führte in der Kettentabelle `030`, aber vor
der Reparatur keinen Schritt `031`. Der Nachtrag war damit vorhanden,
wurde beim manuellen Kettenneuaufbau aber nicht abgearbeitet.

`[read]` `docs/ssot/46-bls-importluecke.md` beschreibt, dass die 30
fehlenden Codes alle einen Doppelpunkt tragen und beim CSV-Pfad aus der
amtlichen Arbeitsmappe ausgefallen waren.

---

## Was in der Kettentabelle sonst noch fehlt

`[cmd]` Nach der Ergänzung von `031` liegen weiterhin nummerierte
Schrittdateien in `supabase/_pipeline/`, die nicht in der README-
Kettentabelle stehen:

| Schritt | Datei |
|---|---|
| `062` | `06_zugriff/062_pruef_objektliste.sql` |
| `071` | `07_lesefunktionen/071_suchrelevanz.sql` |
| `080` | `08_bereinigung/080_public_bereinigen.sql` |
| `100` | `10_training/100_training_schema.sql` |
| `101` | `10_training/101_training_seed.sql` |
| `102` | `10_training/102_plural_merge.sql` |
| `103` | `10_training/103_calvicular_merge.sql` |
| `104` | `10_training/104_body_region.sql` |
| `105` | `10_training/105_mideus_merge.sql` |

`[annahme]` Nicht jede dieser Dateien muss Teil des Nutrition-Neuaufbaus
sein: `080` ist Bereinigung, `100` bis `105` gehören zum
Trainingsschema. Die Liste ist trotzdem ein Befund, weil die README
derzeit die einzige sichtbare Kettensteuerung ist.

---

## Reparatur der Sollliste

`[cmd]` `schema-vollstaendigkeit-pruefen.ts` meldete vorher
`food_nutrients 698092 / 698092 ok`. Der falsche Ist-Zustand war also
als Mindestwert in `supabase/_pipeline/daten/schema-sollstand.json`
übernommen worden.

`[cmd]` Die Sollliste wurde korrigiert:

| Objekt | Untergrenze | Herkunft |
|---|---:|---|
| `foods` | 7.140 | `[read]` `docs/ssot/30-datenbank.md` |
| `food_nutrients` | 869.501 | `[cmd]` `031` + `v031`: 698.092 + 171.409 |
| `food_aliases` | 30.000 | `[cmd]` gerundeter Ist-Stand 32.805 |
| `food_tags` | 9.000 | `[cmd]` gerundeter Ist-Stand 9.265 |
| `nutrient_defs` | 138 | `[read]` BLS-Katalog / `015` |
| `food_categories` | 500 | `[cmd]` gerundeter Ist-Stand 518 |
| `search_synonyms` | 4.800 | `[cmd]` gerundeter Ist-Stand 4.877 |
| `preparation_kinds` | 11 | `[read]` `023_zubereitung_ableitung.sql` |
| `food_groups` | 19 | `[read]` `023_zubereitung_ableitung.sql` |

`[cmd]` Zusätzlich prüft
`supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`
jetzt für `food_nutrients` exakt 138 verschiedene `nutrient_code` und
die beiden `data_source`-Werte
`bls_4_0_local_import` und `bls_4_0_xlsx_nachtrag`.

`[cmd]` Nach der Reparatur meldete die Schemaprüfung:
18/18 Tabellen, 2/2 Sichten, 11/11 Funktionen, 18/18 Zeilenschutz,
18/18 Policies, 20/20 GRANT-Objekte, 15/15 Fremdschlüssel,
`food_nutrients` 869.501/869.501, 138/138 Codes, 2/2 Quellen, Exit 0.

---

## Vergleich gegen `docs/ssot/30-datenbank.md`

`[read]` `docs/ssot/30-datenbank.md` nennt weiterhin
`nutrition.food_nutrients` mit 698.092 Zeilen. Das widerspricht dem
Nachtrag aus `031` und der Validierung `v031`.

`[cmd]` Vergleich der in `30-datenbank.md` genannten Tabellen:

| Tabelle | `30-datenbank.md` Zeilen | Ist nach Reparatur | Befund |
|---|---:|---:|---|
| `foods` | 7.140 | 7.140 | gleich |
| `food_nutrients` | 698.092 | 869.501 | +171.409 durch `031` |
| `food_aliases` | 21.420 | 32.805 | späterer Human-Layer-Zuwachs |
| `food_tags` | 9.265 | 9.265 | gleich |
| `food_categories` | 518 | 518 | gleich |
| `nutrient_defs` | 138 | 138 | gleich |
| `tag_definitions` | 16 | 16 | gleich |
| `food_preferences` | 0 | 0 | gleich |
| `food_preference_items` | 0 | 0 | gleich |
| `food_curation_candidates` | 0 | 0 | gleich |
| `food_curation_decisions` | 0 | 0 | gleich |

`[cmd]` Die Spaltenzahlen der dort genannten Tabellen stimmen mit dem
heutigen Bestand überein.

`[cmd]` Der heutige Bestand enthält zusätzlich Tabellen, die in
`30-datenbank.md` nicht in der Tabelle stehen: `food_groups`,
`preparation_kinds`, `meals`, `meal_items`, `water_logs`,
`search_events` und `search_synonyms`.

---

## Warum eine Woche lang nichts auffiel

`[cmd]` Gate und Schemaprüfung meldeten grün, weil sie den falschen
Sollwert `698092` prüften. Die Prüfung bestätigte damit genau den
Zustand, den sie hätte beanstanden müssen.

`[cmd]` Die alte Prüfung zählte nur Zeilen. Sie sah nicht, dass die
Codefamilie mit Doppelpunkt komplett fehlte: 108 statt 138 Codes und
nur eine statt zwei Datenquellen.

`[read]` `docs/ssot/53-kettenluecke.md` warnt selbst vor dieser
Fehlerklasse: Die Sollliste darf ihre Werte nicht aus der laufenden
Datenbank beziehen. Bei den Rechten wurde diese Regel umgesetzt, bei den
Mindestzeilen nicht.

`[cmd]` Die neue Schemaprüfung hätte den Verlust sofort gemeldet:
`food_nutrients.codes` wäre 108/138 und
`food_nutrients.sources` wäre 1/2 gewesen.

---

## Was dieser Schritt nicht repariert

`[annahme]` `docs/ssot/30-datenbank.md` ist als historischer
Ist-Zustand nicht in diesem Auftrag korrigiert worden. Der Bericht hier
hält den Widerspruch fest.

`[annahme]` Die weiterhin nicht in der README-Kettentabelle geführten
Schritte wurden nicht eingeordnet. Für `062`, `071`, `080` und
`100` bis `105` braucht es eine eigene Entscheidung, ob sie verbindliche
Aufbauschritte, Validierungen, Bereinigungen oder Training-Kette sind.
