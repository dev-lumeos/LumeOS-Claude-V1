# C-131 + C-132: Substanzbruecke und fehlende Regel-Eingaenge

Stand: 2026-08-20

## Wie die drei Bestaende zueinander stehen

[read] Der Auftrag betrifft drei bestehende Substanzbestaende, ohne sie
zusammenzufuehren: `supplements.supplement_catalog`, die F-05-Recherche in
`supabase/_pipeline/daten/substanz-katalog.json` und den Kimi-Bestand unter
`backup/kimi-research/Kimi_Agent/supplement_performance_database/data/`.

[cmd] Gemessen vor dem Bau:

| Bestand | Eintraege | Rolle |
|---|---:|---|
| `supplements.supplement_catalog` | 44 | Live-Katalog fuer Stacks |
| F-05-Recherche | 320 | Kandidatenbestand |
| Kimi-Bestand | 237 | Substanzbestand fuer Regeln |

[cmd] Die Aliasdateien des Kimi-Bestands tragen als Bruecke:  
`data/indexes/aliases.json` mit 506 Alias-Schluesseln und
`data/indexes/ingredient_index.json` mit 237 Kimi-Substanzen.

[cmd] Nach dem Einspielen der Aliasbruecke:

| Paar | Treffer |
|---|---:|
| Kimi <-> LumeOS-Supplementkatalog | 27 |
| Kimi <-> F-05 | 100 |
| LumeOS-Supplementkatalog <-> F-05 | 23 |

[cmd] 58 der 237 Kimi-Substanzen treffen mindestens einen der beiden
anderen Bestaende. 179 Kimi-Substanzen bleiben ohne Entsprechung.
Stichprobe der Nichttreffer: Beta-carotene, Vitamin B1, Vitamin B2,
Vitamin B3 nicotinic acid, Vitamin B3 nicotinamide, Vitamin B5, Vitamin B6,
Vitamin B7, Vitamin B12 cyanocobalamin, Vitamin B12 methylcobalamin,
Vitamin C, Vitamin D2, Vitamin D3, Vitamin E, Vitamin K1.

[annahme] Diese Nichttreffer sind gemischt: ein Teil sind echte
Katalogluecken im LumeOS-Katalog, ein Teil sind feinere chemische Formen,
die der Kimi-Bestand bewusst getrennt fuehrt. Genau deshalb ist die
Bruecke eine Aliastabelle und kein Merge.

## Was die Aliastabelle traegt

[cmd] Neuer Kettenschritt:
`supabase/_pipeline/13_supplements/132_substance_alias_bridge.ts`.

[cmd] Neue Tabelle: `supplements.substance_aliases`, mit Herkunft je Zeile:
`catalog`, `entity_id`, `entity_label`, `alias`, `alias_folded`, `source`,
`source_ref`, `raw`.

[cmd] Zeilen nach Katalog:

| Katalog | Aliaszeilen | Entitaeten |
|---|---:|---:|
| `f05_substance_candidate` | 320 | 320 |
| `kimi_substance` | 743 | 237 |
| `lumeos_supplement_catalog` | 69 | 44 |
| **Summe** | **1.132** | |

[read] Die Form folgt `nutrition.food_aliases` und `medical.biomarker_aliases`:
Treffer werden ueber normalisierte Aliaswerte hergestellt, nicht durch
Umschreiben eines der Kataloge.

[cmd] Zwei Lesesichten liegen daneben:
`supplements.substance_alias_matches` fuer die Paarmessung und
`supplements.stack_item_substance_matches` fuer den spaeteren Regelpfad aus
Nutzer-Stacks auf Kimi-Substanzen.

[cmd] `stack_item_substance_matches` liefert live 8 Treffer. Bei
`dev@lumeos.app` sind 4 aktive Stack-Items vorhanden, davon 2 mit
Kimi-Bruecke. Das ist bewusst als `partial` sichtbar, nicht als stilles
Durchfallen.

[cmd] Zeilenschutz: `substance_aliases` ist Stammdatum mit RLS,
`authenticated SELECT`, `service_role ALL`. Die Tabelle steht in
`daten/schema-sollstand.json` mit Mindestzeilen 1.132 und Beleg.

[cmd] Beim Wegwerf-Kettenlauf fiel ein bestehender C-130-Waechter auf:
`146_medications_katalog.ts` erwartete exakt 56 Wirkstoffe, die Kimi-Quelle
traegt inzwischen 503. Der Waechter ist auf Untergrenze geaendert. Ergebnis
im Wegwerf-Kettenlauf: 503 Wirkstoffe, 456 Formulierungen, 451 Produkte.
Die Sollliste bleibt bei den belegten Mindestwerten 56/119/124.

## Welche Regeln jetzt auswertbar sind

[read] C-132 importiert keine Regel. Der neue Stand misst nur, ob die
Eingaenge aus `module_field_spec.json` auf der heutigen Datenbank
auflosbar sind.

[cmd] Validierung:
`supabase/_pipeline/_validierung/kimi-rule-input-audit.ts`.

[cmd] Ergebnis nach C-130 und C-131:

| Regeldatei | auswertbar | teilweise | blockiert |
|---|---:|---:|---:|
| `warning_rules.jsonl` | 22 | 3 | 4 |
| `nutrient_gap_rules.jsonl` | 2 | 3 | 10 |
| `medication_rules.jsonl` | 18 | 2 | 0 |
| **Summe** | **42** | **8** | **14** |

[cmd] Die zwanzig Medikamentenregeln sind nicht mehr strukturell blockiert:
`medical.user_medications` und `drug_class` existieren seit C-130. Zwei sind
weiter nur teilweise, weil nicht jeder Nebenpfad der jeweiligen Regel als
Datenquelle steht.

[cmd] Blockierende oder teilweise fehlende Eingaenge bleiben unter anderem:
`sleep.sleep_latency_min`, `medical.symptoms`,
`medical.lab_draw_scheduled_within_days`,
`nutrition.daily.fish_servings_week`,
`profile.athlete_tested_pool`, `lifestyle.indoor_dominant`,
`location.low_sun` und
`supplements.computed.stimulant_load_mg_caffeine_equiv`.

[cmd] Die Nahrungs- und Trainingspfade sind gemischt: Protein ist aus
`nutrition.daily_summary` aufloesbar, `fish_servings_week` wird aus
`meal_items` noch nicht abgeleitet. `training.load_spike` ist ueber
`recovery.acwr_for_day()` aufloesbar; Schlaf existiert als Schema noch nicht.

## Wie `missing_input` aussieht

[cmd] Neuer Kettenschritt:
`supabase/_pipeline/13_supplements/132a_rule_input_status.sql`.

[cmd] Neue Funktion:
`supplements.platform_input_status(user_id, date)`.

[read] Die Funktion ist die Bruecke fuer C-133: Eine Regel bekommt nicht nur
`true` oder `false`, sondern den Eingangsstatus. Fehlende Eingaben sind ein
Zustand, kein Nichtereignis.

[cmd] Live-Beispiel fuer `dev@lumeos.app` am `current_date`:

| Pfad | Status | Grund |
|---|---|---|
| `sleep.sleep_latency_min` | `missing_input` | Sleep-Schema ist nicht gebaut |
| `medical.symptoms` | `missing_input` | Symptome-Tabelle ist nicht gebaut |
| `medical.lab_draw_scheduled_within_days` | `missing_input` | Modell fuer geplante Laborabnahme fehlt |
| `nutrition.daily.fish_servings_week` | `missing_input` | Fish-Servings werden nicht aus `meal_items` abgeleitet |
| `supplements.daily_totals` | `partial` | 2 von 4 aktiven Stack-Items haben eine Kimi-Bruecke |
| `supplements.stack_item.substance_id` | `partial` | 2 von 4 aktiven Stack-Items haben eine Kimi-Bruecke |

[cmd] Beispiel aus der Regelvalidierung:
`wr_lab_biotin` braucht `supplements.daily_total_mg` und
`medical.lab_draw_scheduled_within_days`. Der erste Eingang ist bei
`dev@lumeos.app` nur teilweise aufloesbar, der zweite ist `missing_input`.
Eine spaetere Regel darf daraus also nicht "nicht erfuellt" machen.

[cmd] Nachweis:

| Pruefung | Ergebnis |
|---|---|
| Kettenlauf ueber `kette-ausfuehren.ts` | Exit 0 |
| `schema-vollstaendigkeit-pruefen.ts` | Exit 0, `supplements.substance_aliases` 1.132 / 1.132 |
| `testdaten-pruefen.ts` | Exit 0, Substanzaliase 1.132, LumeOS-Kimi-Treffer 27 |
| `kette-readme-pruefen.ts` | ok, 74 Schritte dokumentiert |

[annahme] Was weiter offen bleibt: C-133 kann Regeln importieren, aber muss
`missing_input`, `partial` und `no_data` als eigene Resultate fuehren. C-134
kann danach entscheiden, ob LumeOS-, F-05- und Kimi-Kataloge fachlich
zusammengefuehrt oder getrennt weitergefuehrt werden.
