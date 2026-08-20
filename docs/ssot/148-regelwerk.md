# C-133: Warn-, Gap- und Medikamentenregeln in der Datenbank

Stand: 2026-08-20

## Wie die Regeln gespeichert sind

[cmd] `supplements.rule_catalog` fuehrt 64 Katalogregeln aus dem Kimi-Bestand:

| Regelart | Zeilen |
|---|---:|
| `warning` | 29 |
| `nutrient_gap` | 15 |
| `medication` | 20 |

[read] Die Regeln bleiben Daten, nicht Anwendungscode. Je Zeile bleiben `rule_id`, `rule_type`, Bedingungen, Effekte, `message_key`, deutscher Meldetext, benoetigte Eingabepfade, statischer Auswertungsstatus, fehlende Eingaben, Herkunftsdatei und das rohe JSON erhalten. Damit ist nachvollziehbar, welche Kimi-Zeile zu welchem Datenbankeintrag wurde.

[cmd] Die Auswertung liegt daneben als `supplements.rule_assessment(user_id, entry_date)`. Sie liefert je Regel genau einen von drei Zustaenden:

| Zustand | Bedeutung |
|---|---|
| `fulfilled` | Bedingungen treffen auf die vorhandenen Daten zu |
| `not_fulfilled` | Daten sind vorhanden, Bedingungen treffen nicht zu |
| `missing_input` | mindestens ein benoetigter Eingang fehlt oder ist nur teilweise aufloesbar |

[cmd] Die Funktion ist `SECURITY INVOKER` und prueft `auth.uid()`: Ein angemeldeter Nutzer darf nur die eigenen Regeln auswerten. Der Katalog selbst ist Stammdatenbestand; `authenticated` bekommt `SELECT`, Nutzerdaten entstehen erst in der Auswertung. Der RLS-Nachweis: `dev@lumeos.app` bekommt 64 Zeilen fuer sich, `test-user@lumeos.local` bekommt 64 eigene Zeilen, aber der Aufruf auf Toms Nutzer bricht mit `rule_assessment darf nur eigene Regeln auswerten` ab.

[cmd] Die neue Kimi-Lieferung ist importierbar. `medical.medication_active_substances` fuehrt jetzt 498 Wirkstoffe; ATC ist weiter nur bei 56 gesetzt, aber `rule_trait_mapping.json` schliesst die Regel-Luecke. Die sieben Traits aus dem Feldvertrag kommen vor:

| Trait | Wirkstoffe |
|---|---:|
| `anticoagulant:warfarin` | 1 |
| `SSRI` | 10 |
| `RAAS_inhibitor` | 10 |
| `CYP3A4_substrate` | 8 |
| `sedative` | 9 |
| `antidiabetic` | 22 |
| `MAOI` | 15 |

[read] CYP-Regel-Traits werden nicht aus Klassennamen abgeleitet. Sie kommen nur aus den tatsaechlichen `cyp`-Feldern des Wirkstoffs.

## Wie `missing_input` aussieht

[cmd] `kimi-rule-input-audit.ts` misst nach C-130/C-131/C-132 weiter dieselben Werte:

| Regelart | auswertbar | teilweise | blockiert |
|---|---:|---:|---:|
| `warning_rules` | 22 | 3 | 4 |
| `nutrient_gap_rules` | 2 | 3 | 10 |
| `medication_rules` | 18 | 2 | 0 |
| **Gesamt** | **42** | **8** | **14** |

[cmd] Beispiel: `wr_lab_biotin` liefert `missing_input` mit `supplements.daily_total_mg` und `medical.lab_draw_scheduled_within_days`. Die Regel faellt dadurch nicht stumm durch; sie sagt, welche Daten fehlen.

[cmd] Auf `dev@lumeos.app` ergeben die 64 Regeln am 2026-08-20: 1 `fulfilled`, 50 `not_fulfilled`, 13 `missing_input`.

## Was den 14 blockierten fehlt

[cmd] Die 14 blockierten Regeln sind keine Ja/Nein-Faelle, sondern fehlende Eingangsdaten:

| Regel | Fehlender Eingang |
|---|---|
| `wr_lab_biotin` | `supplements.daily_total_mg`, `medical.lab_draw_scheduled_within_days` |
| `wr_lab_zinc_copper` | `supplements.daily_total_mg` |
| `wr_lab_b6_neuropathy` | `supplements.daily_total_mg` |
| `wr_stimulant_stack_total` | `supplements.computed.stimulant_load_mg_caffeine_equiv` |
| `gap_omega3_fish` | `nutrition.daily.fish_servings_week` |
| `gap_vegan_b12` | `nutrition.diet_type` |
| `gap_vegan_iron` | `nutrition.diet_type` |
| `gap_calcium_dairy` | `nutrition.daily.dairy_servings_day` |
| `gap_electrolytes_endurance` | `training.endurance_duration` |
| `gap_sleep_onset` | `sleep.sleep_latency_min` |
| `gap_joint_loading` | `training.high_impact`, `medical.symptoms` |
| `gap_creatine_strength` | `training.strength_focus` |
| `gap_eye_screen_time` | `profile.high_screen_time` |
| `gap_immune_winter` | `season.winter`, `training.load_high` |

[annahme] `fish_servings_week` und `dairy_servings_day` sind wahrscheinlich aus `meal_items` ableitbar, aber noch nicht als Leseschicht gebaut. Der Pfad ist strukturell vorhanden: `foods.category_id -> food_categories.food_group_code -> food_groups`. Bei `dev@lumeos.app` haben 2.241 von 2.311 `meal_items` eine Gruppe ueber diese Bruecke.

[cmd] Die Allergie-Notiz aus dem Auftrag erzeugt heute keine Kimi-Regel: In den drei Plattformdateien gibt es keine Regel, die `contains_nuts` oder Allergien referenziert. Das vorhandene Allergenwissen bleibt dadurch wichtig fuer Suche/Preferences, aber C-133 kann daraus keine Warnregel ableiten.

## Welche Regel bei Tom feuert

[cmd] Fuer `dev@lumeos.app` feuert `wr_anticoag_stack`: Warfarin plus Omega-3 im Stack ergibt `fulfilled`, Effekt `physician_referral`.

| Regel | Zustand | Effekt |
|---|---|---|
| `wr_anticoag_stack` | `fulfilled` | `physician_referral` |
| `wr_warfarin_vitk` | `not_fulfilled` | `physician_referral` |
| `wr_lab_biotin` | `missing_input` | `lab_context` |

[read] Das folgt Toms Policy: Risikoregeln warnen und verweisen aerztlich, sie dosieren nicht und empfehlen keine Rx/enhanced/illegalen Substanzen.

## Nachweis und offene Fremdblocker

[cmd] Der Kettenlauf auf der Wegwerf-Datenbank `lumeos_kette_20260820091600` ist nach erneuter Schemapruefung vollstaendig: 28 Tabellen, 2 Sichten, 28 Funktionen, `supplements.rule_catalog` 64/64, `medical.medication_active_substances` 498/56 Mindestzeilen.

[cmd] `kette-readme-pruefen.ts` meldet: `README/Kette: ok (80 Schritte dokumentiert)`.

[cmd] `testdaten-pruefen.ts` ist auf der laufenden Datenbank vor den C-133-Faellen abgebrochen, weil parallel erwartete Coach-Tabellen live noch fehlen: `coach.relationships` existiert dort nicht. Das ist kein C-133-Befund; die direkte C-133-Auswertung und der Kimi-Audit sind gruen.

[cmd] `pnpm gate` ist nicht am Regelwerk gescheitert. Der Lauf bricht bei `@lumeos/coach#build` ab: `apps/coach` liegt im Workspace, aber nicht im Lockfile; dadurch fehlt dort `next`. Das ist ein paralleler Arbeitsstand ausserhalb von C-133.
