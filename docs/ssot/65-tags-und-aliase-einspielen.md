# Tags und Reis-Aliase einspielen

`[cmd]` Erhoben am 2026-08-16 gegen die lokale Supabase-Instanz
`supabase_db_LumeOS-Claude-V1`.

---

## Ergebnis

`[cmd]` C-17 war committet (`4093642`), aber vor diesem Lauf noch nicht
live eingespielt: `suche-laufzeit-messen.ts` lag bei
`huehnerbrust` 494,6 ms und `spinat` 263,9 ms.

`[cmd]` Schritt `027_lebensmittel-tags.ts` wurde ausgeführt. Er las
`supabase/_pipeline/daten/lebensmittel-tags.jsonl` mit 5.150 Foods und
8.702 kuratierten Tagzuordnungen.

`[cmd]` Schritt `028_kuratierte-aliase.ts` wurde ausgeführt. Er las
`supabase/_pipeline/daten/reis-alias-kuration.json` mit 13
Suchbegriff-Zuordnungen; 1 war bereits vorhanden, 12 wurden mit
`food_aliases.source='curated_suchbegriff'` eingefügt.

`[cmd]` Schritt `073_suchfilter.sql` wurde danach live ausgeführt. Damit
ist die C-17-Suchlaufzeitänderung in der lokalen Datenbank wirksam.

---

## Tags

`[read]` Toms Entscheidung zur Umkehrung der Allergentags bleibt
leitend: `contains_nuts`, `contains_gluten` und `contains_lactose`
markieren belegtes Enthaltensein. Ein unmarkierter Eintrag ist
ungeprüft, nicht sicher frei.

`[cmd]` `020_food_human_layer.sql` enthält kein `TRUNCATE` und kein
`DELETE` auf `nutrition.food_tags`; es fügt die vier Makro-Tags per
`INSERT ... ON CONFLICT DO NOTHING` ein.

`[cmd]` `027_lebensmittel-tags.ts` löscht nur die verwalteten
C-44-Tags (`whole_food`, `ultra_processed`, `vegan`, `vegetarian`,
`contains_nuts`, `contains_gluten`, `contains_lactose`, `thai_food`,
`halal`, `kosher`) und ersetzt sie aus der Datendatei. Die vier
Makro-Tags aus `020` bleiben erhalten.

`[cmd]` Tagbestand nach dem Lauf:

| Tag | Zeilen |
|---|---:|
| `low_carb` | 4.659 |
| `low_fat` | 2.648 |
| `high_protein` | 1.400 |
| `high_fiber` | 558 |
| `whole_food` | 2.884 |
| `vegetarian` | 1.751 |
| `vegan` | 1.377 |
| `contains_lactose` | 1.021 |
| `ultra_processed` | 927 |
| `contains_gluten` | 622 |
| `contains_nuts` | 120 |

`[cmd]` Gesamt `nutrition.food_tags`: 17.967.

`[cmd]` `lebensmittel-tags-pruefen.ts` meldete Exit 0:
5.150 Zeilen mit Tags, 1.990 bewusst unmarkiert, Pflichtfälle und
NOVA-Konsistenz grün.

---

## Aliase

`[cmd]` Vorher trug `nutrition.food_aliases`:

| Herkunft | Zeilen |
|---|---:|
| `editorial` | 21.420 |
| `derived` | 11.102 |
| `curated_nebenname` | 283 |

`[cmd]` `028_kuratierte-aliase.ts` erweitert den `source`-Check um
`curated_suchbegriff`. Diese Herkunft trennt Sorten- und Suchbegriff-
Zuordnungen von mechanisch abgeleiteten Aliasen und von
`curated_nebenname`.

`[cmd]` `sushireis` wurde als zwei Aliaszeilen behandelt:
`C352000` für rohe Zutat und `X8A1100` für das Grundrezept.

`[cmd]` Nachher:

| Herkunft | Zeilen |
|---|---:|
| `editorial` | 21.420 |
| `derived` | 11.102 |
| `curated_nebenname` | 283 |
| `curated_suchbegriff` | 12 |

`[cmd]` Gesamt `nutrition.food_aliases`: 32.817.

`[cmd]` Die Datendatei enthielt einen internen Widerspruch:
Der Eintrag `griechischer joghurt` zeigte mit Begründung auf
`M148500`, die Abnahmeliste erwartete aber noch `M141100`. Die
Abnahmeliste wurde auf `M148500` korrigiert.

---

## Was sich messbar geändert hat

| Messung | Vorher | Nachher | Befund |
|---|---:|---:|---|
| `mealcam-zutaten-messen.ts` Platz 1 | 34/37 | 34/37 | unverändert |
| MealCam Top 3 | 35/37 | 35/37 | unverändert |
| `reis-alias-kuration-messen.ts` Platz 1 | 4/7 | 7/7 | verbessert |
| Reis-Alias gar keine Treffer | 3 | 0 | behoben |
| `lebensmittel-tags-pruefen.ts` | Exit 0 | Exit 0 | unverändert grün |
| `suche-abdeckung-messen.ts` Platz 1 | 120/151, 79,5 % | 120/151, 79,5 % | unverändert |
| Suche Top 3 | 139/151, 92,1 % | 139/151, 92,1 % | unverändert |
| Suche Top 10 | 147/151, 97,4 % | 147/151, 97,4 % | unverändert |
| `schema-vollstaendigkeit-pruefen.ts` | Exit 0 | Exit 0 | unverändert grün |
| `food_tags` Mindestzeilen | 9.265/9.000 | 17.967/17.967 | nachgezogen |
| `food_aliases` Mindestzeilen | 32.805/30.000 | 32.817/32.817 | nachgezogen |

`[cmd]` Schemaprüfung nach dem Lauf: 18/18 Tabellen, 2/2 Sichten,
11/11 Funktionen, 18/18 Zeilenschutz, 18/18 Policies, 20/20
GRANT-Objekte, 15/15 Fremdschlüssel, `food_nutrients` 869.501/869.501,
138/138 Codes und 2/2 Quellen.

`[cmd]` Die Schemaprüfung meldete zusätzlich den Hinweis:
`such_alias_treffer` steht in der Datenbank, aber nicht in der
Sollliste. Das ist die durch C-17 eingeführte Hilfsfunktion.

---

## Suchlaufzeit live

`[cmd]` Vorher, live vor `073`:

| Anfrage | Median ms | Treffer |
|---|---:|---:|
| `(leer)` | 219,9 | 7.140 |
| `spinat` | 263,9 | 41 |
| `reis` | 292,2 | 145 |
| `huhn` | 516,7 | 136 |
| `huehnerbrust` | 494,6 | 31 |
| `haehnchen brust roh` | 492,6 | 3 |

`[cmd]` Nachher, live nach `073`:

| Anfrage | Median ms | Treffer |
|---|---:|---:|
| `(leer)` | 251,0 | 7.140 |
| `spinat` | 127,6 | 41 |
| `reis` | 142,0 | 145 |
| `huhn` | 230,4 | 136 |
| `huehnerbrust` | 233,8 | 31 |
| `haehnchen brust roh` | 227,1 | 3 |

`[read]` `docs/ssot/63-suchlaufzeit.md` erwartete aus der
Wegwerf-Datenbank `huehnerbrust` bei 199 ms und `spinat` bei 129 ms.

`[cmd]` Live trifft `spinat` die Erwartung praktisch, `huehnerbrust`
bleibt mit 233,8 ms langsamer als die Wegwerf-Messung, ist aber etwa
halb so langsam wie vorher. Trefferzahlen blieben unverändert.

---

## Kettentabelle

`[cmd]` `supabase/README.md` wurde um `027` und `028` ergänzt.

`[cmd]` Weiterhin nicht in der README-Kettentabelle stehen:

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

`[annahme]` Diese Einordnung gehört zu C-43 und wurde hier nicht
nebenbei entschieden.

---

## Was dieser Schritt nicht tut

`[cmd]` `name_de`, `name_en` und `food_nutrients` wurden nicht verändert.

`[cmd]` Die phonetischen Varianten wurden nicht eingespielt. Sie bleiben
ein Nulltreffer-Fallback auf der Anfrageseite.

`[annahme]` `thai_food`, `halal` und `kosher` bleiben definiert und leer;
das gehört zu C-34 beziehungsweise zu einer eigenen Kuration.
