# C-164: Food-DB-Filter

Stand: 2026-08-21

## Wie mehrere Tags kombiniert werden

`[cmd]` `nutrition.food_search` behält die bestehende Signatur und bekommt am Ende `p_filters jsonb`. Die 15 bisherigen Argumente bleiben unverändert, damit bestehende Aufrufer weiterlaufen.

`[cmd]` `p_filters.tag_groups` ist eine Liste sichtbarer Filtergruppen. Innerhalb einer Gruppe gilt ODER, zwischen Gruppen gilt UND.

Beispiel:

```json
{
  "tag_groups": [
    ["vegan", "vegetarian"],
    ["high_protein"]
  ]
}
```

`[cmd]` Gemessen gegen SQL:

| Fall | `food_search.total` | SQL-Zählung |
|---|---:|---:|
| ohne Filter | 7.140 | 7.140 |
| `vegan` ODER `vegetarian` | 1.751 | 1.751 |
| (`vegan` ODER `vegetarian`) UND `high_protein` | 154 | 154 |

`[read]` `tag_type` reicht für die Oberfläche nicht: `diet` enthält Ernährungsform und Nährwert. Für G-134 bleibt deshalb die Neigung: eine eigene Gruppenspalte in `tag_definitions`, damit die Zuordnung in den Daten liegt und nicht in jeder Anzeige neu entsteht. C-164 baut das nicht vorweg; die Funktion nimmt Gruppen explizit aus `p_filters`.

## Wie der Ausschluss wirkt

`[cmd]` `p_filters.exclude_tag_codes` entfernt Treffer aus der Gesamtmenge, nicht nur aus der aktuellen Seite. Der Nachweis ist `total`, nicht `count(*)` auf dem JSON-Dokument.

| Fall | `total` | Seite 1 |
|---|---:|---:|
| ohne Filter | 7.140 | 25 |
| `exclude_tag_codes = ["contains_lactose"]` | 6.119 | 25 |

`[cmd]` Der Ausschluss passt zur SQL-Zählung: 1.021 Lebensmittel tragen `contains_lactose`, 7.140 - 1.021 = 6.119. `test-user@lumeos.local` hat 0 Preferences und bekommt mit `p_user_id` weiterhin 7.140 Treffer.

`[read]` Das ist kein gespeicherter Nutzerwunsch. Ein Tab-Schalter filtert diese Suche; Preferences aus C-94 bleiben davon getrennt.

## Was `processing_level` beiträgt

`[cmd]` `processing_level` ist Ergänzung zu Tags, kein Ersatz. Es ist auf allen 7.140 Lebensmitteln gesetzt und erschließt sechs Stufen, die keinen Tag haben.

| `processing_level` | Lebensmittel |
|---|---:|
| `raw` | 3.251 |
| `cooked` | 2.346 |
| `ultra_processed` | 927 |
| `minimally_processed` | 254 |
| `canned` | 185 |
| `dried` | 77 |
| `fermented` | 63 |
| `smoked` | 37 |

`[cmd]` `ultra_processed` ist deckungsgleich: Tag 927, Spalte 927. `whole_food` ist nicht deckungsgleich: Tag 2.884, `raw` + `minimally_processed` 3.505, Schnittmenge 1.224.

`[cmd]` Neue Filter:

| Fall | `food_search.total` | SQL-Zählung |
|---|---:|---:|
| `processing_levels = ["raw", "minimally_processed"]` | 3.505 | 3.505 |
| `exclude_processing_levels = ["ultra_processed"]` | 6.213 | 6.213 |

## Was die Laufzeit kostet

`[cmd]` Vor C-164 waren gemessen: ohne Filter 472,4 ms, ein Tag 195,0 ms, Suchwort `milch` 508,0 ms.

`[cmd]` Nach C-164 auf der laufenden lokalen DB (`EXPLAIN ANALYZE`, warme DB):

| Fall | Laufzeit |
|---|---:|
| ohne Filter | 357,7 ms |
| zwei Gruppen: (`vegan`/`vegetarian`) UND `high_protein` | 186,9 ms |
| Suchwort `milch` | 416,0 ms |
| Ausschluss `contains_lactose` | 343,7 ms |

`[cmd]` Ein erster Entwurf lag bei rund 6,8 s, weil die Facetten-Subqueries auch ohne aktive Filter je Food geprüft wurden. Die finale Fassung hat `filter_state` als aktive Grenze; leere Filter laufen dadurch wieder im erwarteten Bereich.

## Nachweis

`[cmd]` Die 14 Tag-Pillen zählen weiter gegen SQL richtig, darunter `high_protein` 1.400, `whole_food` 2.884, `contains_lactose` 1.021, `halal` 6.379 und `kosher` 6.451.

`[cmd]` `schema-vollstaendigkeit-pruefen.ts`: Exit 0.

`[cmd]` `testdaten-pruefen.ts`: Exit 0.

`[cmd]` `pnpm gate`: grün.

`[cmd]` Kettenlauf auf Wegwerf-Datenbank: nicht durch C-164 blockiert, aber derzeit nicht grün. Der Lauf bricht in `supabase/_pipeline/13_supplements/132_substance_alias_bridge.ts` ab: `Kimi crawl_022: 290 Kimi-Substanzen, erwartet 291`. Die Wegwerf-Datenbank blieb zur Prüfung erhalten: `lumeos_kette_20260821102730`.
