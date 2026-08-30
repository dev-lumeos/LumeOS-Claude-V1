# C-300 - Messung des RLS-Rumpfs von rule_assessment

Datum: 2026-08-27  
Auftrag: `docs/auftraege/c-300-codex.md`

## Ergebnis

Die angenommene RLS-Optimierungsbarriere ist in dieser Messung nicht
bestaetigt. Der innere Plan von
`nutrition.daily_reference_assessment()` behaelt unter beiden Rollen dieselbe
Struktur aus Sort, Hash Joins, Nested Loops und Sequenzscans. Es fallen keine
Index-Only-Scans weg und kein Hash Join wird zu einem Nested Loop.

Die Zeit entsteht stattdessen in den bestehenden direkten Coach-Policies auf
`nutrition.meals` und `nutrition.meal_items`: Im Nutzerlauf enthalten beide
Sequenzscans den RLS-Filter `owner OR coach.hat_sicht(...)`. Bei fremden
Zeilen ist der Owner-Teil falsch; die Funktion wird dann je Zeile ausgefuehrt.
Diese Nutrition-Policies waren nicht Teil von C-299 und wurden nicht
veraendert.

## Zahlen: Auftrag gegen Messung

| Messpunkt | Auftrag | Eigene Messung | Geltend |
|---|---:|---:|---:|
| service_role, drei Ausgangslaeufe | 164,4 / 170,4 / 164,9 ms | 165,937 ms (`pg_stat_statements`), 159,498 ms (`EXPLAIN`) | 159,498 bis 165,937 ms |
| authenticated, drei Ausgangslaeufe | 559,6 / 567,7 / 581,9 ms | 525,967 ms (`pg_stat_statements`), 527,845 ms (`EXPLAIN`) | 525,967 bis 527,845 ms |
| Differenz | rund 390 ms | 360,030 ms (Statistiklauf), 368,347 ms (`EXPLAIN`) | 360,030 bis 368,347 ms |
| Shared-Hit-Bloecke des aeusseren Aufrufs | 128.666 | service 16.642, authenticated 79.268 | diese Werte |
| verbliebene Policies mit `coach.hat_sicht` | 13 | 17 (16 direkte, plus `stack_items`-Sonderfall) | 17 |

`dev@lumeos.app` ist im Klon die UUID
`d15fb34f-62e6-43e5-9d1c-ec8bab6ae1a6`. Der Nutzer hat 725 von 2.895
Mahlzeiten und 2.298 von 9.051 Mahlzeitenpositionen. Diese Daten, nicht
`test-user`, wurden verwendet.

Die Zahlen des Auftrags sind damit in Richtung und Groessenordnung
bestaetigt, aber nicht exakt: Die aktuelle Differenz liegt je nach Messart
bei 360 bis 368 ms, nicht bei 390 ms. Auch die genannten 128.666
Pufferbloecke ergeben sich nicht aus dem Top-Level-Plan dieser Messung.

## Nicht ueberlappende Zeitzerlegung

Die verschachtelten Eintraege von `pg_stat_statements` duerfen nicht blind
aufsummiert werden: `platform_input_status` enthaelt sechs Aufrufe von
`daily_reference_assessment`; der siebte steht direkt im Rumpf. Die folgende
Zerlegung verwendet deshalb nur disjunkte Elternpfade eines einzelnen
`pg_stat_statements.track = all`-Laufs.

| Pfad | service_role ms / Aufrufe | authenticated ms / Aufrufe | Differenz ms |
|---|---:|---:|---:|
| `platform_input_status`-Aggregat | 126,753 / 1 | 437,444 / 1 | +310,691 |
| direkter `max(reference_pct)`-Aufruf | 25,099 / 1 | 74,454 / 1 | +49,355 |
| uebriger `rule_assessment`-Rumpf | 14,085 | 14,069 | -0,016 |
| **Summe / aeusserer Aufruf** | **165,937** | **525,967** | **+360,030** |

Damit bleibt gegen die im Auftrag genannten 390 ms ein Rest von 29,970 ms;
er wird nicht geglaettet. Der siebteilige, aber ueberlappende Unterpfad
`daily_reference_assessment` lag bei 116,007 ms als Service-Rolle und
485,689 ms als Nutzer. Die ebenfalls verschachtelte
`coach.hat_sicht`-SQL-Abfrage lief unter authenticated 62.461-mal und
kumuliert 88,648 ms. Sie ist ein Teil der `daily_reference`-Zeit, nicht ein
zusaetzlicher Summand.

## Planvergleich des Ausreissers

Isoliert gegen dieselben `dev@lumeos.app`-Daten kostet
`daily_reference_assessment` 26,288 ms und 3.792 Shared-Hit-Bloecke als
Service-Rolle, gegen 81,889 ms und 12.884 als authenticated. `auto_explain`
zeichnete fuer den inneren CTE-Plan 21,218 beziehungsweise 87,273 ms auf.

Beide Plaene verwenden dieselbe Join-Reihenfolge. Der Unterschied liegt an
den zwei RLS-Filtern:

| Planstelle | service_role | authenticated |
|---|---|---|
| `Seq Scan nutrition.meal_items` | 9.051 Reihen, 1.632 Hits, kein RLS-Filter | 2.298 sichtbare Reihen, 8.499 Hits, `auth.uid() = user_id OR coach.hat_sicht(...)` |
| `Seq Scan nutrition.meals` | 2.895 Reihen, 62 Hits, kein RLS-Filter | 725 sichtbare Reihen, 2.232 Hits, derselbe RLS-Filter |

Die Zeilenzahlen im authenticated-Plan sind die Reihen nach dem Filter. Als
Sequenzscans besuchen beide Plaene weiterhin den gesamten Bestand; fuer die
fremden Reihen wird der Owner-Ausdruck falsch und `coach.hat_sicht` ausgefuehrt.
Genau das erklaert die 62.461 Aufrufe und die zusaetzlichen Pufferzugriffe.

Der Befund ist damit enger als die Annahme im Auftrag: nicht eine geaenderte
Planform, sondern die verbliebenen direkten Nutrition-Policies selbst
verursachen die RLS-Kosten. Ihre Anpassung bleibt absichtlich ausserhalb
dieses Messauftrags und bei C-305.

## Messumgebung und Rueckbau

Gemessen wurde ausschliesslich in `lumeos_c300_verify`, einer frischen Kopie
der laufenden Datenbank. Die Kopie erhielt fuer die reine Rollenmessung
temporare `USAGE`, `SELECT` und `EXECUTE`-Grants; RLS blieb aktiv. Die
laufende Datenbank wurde weder getestet noch veraendert.

Vorher im Klon: `pg_stat_statements.track = top`,
`auto_explain.log_nested_statements = off`, `auto_explain.log_analyze = off`
und `auto_explain.log_min_duration = 10000`. Fuer die Statistik wurde
`track = all` sitzungsgebunden gesetzt und pro Rolle zurueckgesetzt.
`auto_explain` lief sitzungsgebunden mit verschachtelten Plaenen nur ab 20
bzw. 1 ms fuer die Ausreisserplaene.

Ein Versuch mit `auto_explain.log_min_duration = 0` wurde verworfen: Er
protokollierte zehntausende verschachtelte Aufrufe und verlangsamte den
authenticated-Lauf auf 22.762,722 ms. Das ist Mess-Overhead und keine
Produktionszeit. Danach wurden die gezielten Schwellen verwendet.

Jede Messsitzung endete mit `RESET ALL`; die Abschlussabfrage bestaetigte
wieder `top`, `off`, `off` und `10000`. `pg_stat_statements` wurde im Klon
anschliessend zurueckgesetzt. Es gab keine Code-, Funktions- oder
Policy-Aenderung, keine `apps/`-Aenderung, kein Staging, keinen Commit und
keinen Push.
