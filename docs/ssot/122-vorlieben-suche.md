# 121 - C-94: Die Suche wendet die Vorlieben an

Stand: 2026-08-19

## Wie die Rangfolge gerechnet wird

`[cmd]` Neuer Kettenschritt `075_preference_search_application.sql`: `nutrition.food_search` hat jetzt ein optionales `p_user_id uuid`. Ohne Nutzer bleibt die Suche unveraendert. Mit Nutzer werden `food_preferences` und `food_preference_items` gelesen und als `preference_score`, `preference_level`, `preference_match_type` und `preference_matches` in die Treffer geschrieben.

`[read]` Aus dem Mockup uebernommen wurde die Ordnung: spezifisch schlaegt allgemein. Deshalb haben direkte Lebensmittelvorlieben Prioritaet vor Kategorie, Kategorie vor Tag und Tag vor Preset.

| Ebene | Wirkung |
|---|---:|
| Allergen | hard exclude |
| Diet type | hard exclude, soweit sicher abbildbar |
| Food | `boost` +100, `soft` -100, `strong` -75 |
| Category | `boost` +50, `soft` -50, `strong` -40 |
| Tag | `boost` +30, `soft` -30, `strong` -25 |
| Exclusion preset | `boost` +30, `soft` -30, `strong` -25 |

`[cmd]` `hard_exclude` entfernt Treffer. `strong_avoid` entfernt nur ohne ausdrueckliche Suche; bei einer konkreten Anfrage bleibt der Treffer sichtbar und wird abgewertet. `soft_dislike` bleibt sichtbar und rutscht im Ranking nach unten, soweit nicht staerkere Textsignale dominieren. `boost` steigt.

`[annahme]` V1 setzt bei `diet_type` nur die belegbaren Faelle um: `vegan`, `vegetarian`, `pescatarian`. `keto`, `paleo`, `mediterranean` und `custom` bleiben ohne harte Suchwirkung, weil dafuer keine belastbare, nutzerbezogene Lebensmittelabbildung in der Datenbank steht.

## Was ein Ausschluss wegnimmt

`[cmd]` Live-Presets: `halal` trifft 761 Lebensmittel, `kosher` 689, `no_pork` 630. Zusammen als Union entfernen sie 808 von 7.140; 6.332 bleiben sichtbar.

`[cmd]` Auf `dev@lumeos.app` liegen Allergie `tree_nuts`, Intoleranz `lactose` und `general_exclusions = {ultra_processed}`. `walnuss` ohne Nutzer liefert 6 Treffer, erster `H120100`; als `dev@lumeos.app` liefert dieselbe Suche 0 Treffer. Als `test-user@lumeos.local` liefert sie wieder 6 Treffer, erster `H120100`.

`[read]` Der Allergen-Vorbehalt bleibt: Die Tags markieren `contains_nuts`, `contains_gluten`, `contains_lactose`. Ein harter Ausschluss blendet nur markierte Lebensmittel aus. Nicht markiert heisst ungeprueft, nicht sicher frei.

## Was die Bewertung kostet

`[cmd]` Laufzeitmessung Median aus 3 Laeufen, ohne Nutzer:

| Anfrage | vor C-94 | nach C-94 |
|---|---:|---:|
| leer | 238,0 ms | 363,4 ms |
| `spinat` | 122,1 ms | 254,1 ms |
| `reis` | 131,3 ms | 253,4 ms |
| `huhn` | 210,5 ms | 335,5 ms |
| `huehnerbrust` | 209,1 ms | 339,1 ms |
| `haehnchen brust roh` | 214,9 ms | 352,2 ms |

`[cmd]` Die Bewertung kostet also auch bei `p_user_id = NULL`, weil die Funktion die Preference-CTEs und Ausgabe-Metadaten mitfuehrt. Das ist der Preis der DB-seitigen Anwendung und muss beobachtet werden, bevor die UI sie bei jedem Tastendruck nutzt.

`[cmd]` Abdeckungsmessung nach dem Einspielen: 116 von 151 Sollwerten auf Platz 1, 138 in den ersten drei, 146 in den ersten zehn, 0 Nulltreffer. MealCam-Massstab: 34 von 37 auf Platz 1, unveraendert gegen den bekannten Stand.

## Ob `milch` jetzt traegt

`[cmd]` Nein. Ohne Nutzer liefert `milch` weiter `M111100` Magermilch frisch (0,1% Fett) auf Platz 1. Mit `dev@lumeos.app` bleiben wegen ausdruecklicher Suche 168 laktosebezogene Treffer sichtbar; Platz 1 bleibt `M111100` mit `preference_level = strong` und `preference_score = -25`.

`[cmd]` Im MealCam-Massstab bleibt `milch` FEHL: Gewinner ist `Joghurt (0,5% Fett)`, Sollwert ist `Vollmilch frisch 3,5 %`. C-94 loest das nicht; C-102 bleibt offen.

## Nachweis

`[cmd]` Kettenlauf ueber `kette-ausfuehren.ts --database c94_preferences_final`: 68 Schritte, Exit 0.

`[cmd]` `schema-vollstaendigkeit-pruefen.ts`: Exit 0, `SCHEMA VOLLSTAENDIG`.

`[cmd]` `testdaten-pruefen.ts`: Exit 0, C-82 Testdaten stimmen.

`[cmd]` `kette-readme-pruefen.ts`: Exit 1 wegen bestehender Abweichungen 018 und 032 in der README. Schritt 075 wird nicht beanstandet.

`[cmd]` Live eingespielt: Schritt 075 wurde idempotent gegen `postgres` ausgefuehrt; alte `food_search`-Overloads wurden entfernt, die neue 15-Argument-Signatur ist aktiv.
