# GO-06/GO-07 Ziele und Phasen

Stand: 2026-08-17

## Ausgangslage

[cmd] Block A ist vorhanden: `goals.nutrition_targets`, `goals.berechne_zielwerte` und `goals.zielwerte_am` liefern für Toms Profil Zielwerte; die Nutrition-Ringe rechnen bereits gegen diese Zahlen.

[cmd] In `public.profiles` erlaubt `profiles_nutrition_goal_check` sechs Werte: `lose_weight`, `maintain`, `gain_muscle`, `recomposition`, `performance`, `health`.

[read] Der Umsetzungsplan `docs/spezifikation/30-module/core/goals/00-umsetzungsplan.md` benennt W-3 als Blocker: vier Zielvokabulare ohne Abbildung.

## Gebaut

[cmd] GO-06 liegt als Datendatei vor: `supabase/_pipeline/daten/zielvokabular.json`. Sie bildet die sechs live erlaubten `nutrition_goal`-Werte auf Zieltyp, Standardphase und Kalorienrichtung ab, oder markiert die Lücke ausdrücklich.

[cmd] GO-08 wurde nur als Datendatei vorbereitet: `supabase/_pipeline/daten/zielphasen-parameter.json`. Die neun Phasenparameter aus `PHASE_MODELS.md` werden noch nicht eingespielt.

[cmd] Neuer Kettenschritt `111`: `supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql`.

[cmd] Der Schritt erzeugt `goals.user_goals`, `goals.goal_phases`, Trigger für `updated_at` und die Funktion `goals.phase_am(user_id, stichtag)`.

[cmd] `goals.user_goals` erzwingt höchstens drei aktive Ziele über aktive Prioritätsplätze `1` bis `3`; je Nutzer kann genau ein aktives Ziel `is_primary = true` tragen.

[cmd] `goals.goal_phases.goal_id` ist nullable. Damit bleibt die Phase unabhängig vom konkreten Ziel wählbar, wie in `OPEN_ITEMS.md` festgelegt.

[cmd] Zeilenschutz ist auf beiden Tabellen aktiv. `authenticated` hat `SELECT`, `INSERT`, `UPDATE`, `DELETE` auf eigene Zeilen; `service_role` hat `ALL`.

[cmd] `kette.json`, `supabase/README.md` und `daten/schema-sollstand.json` enthalten Schritt 111. `kette-readme-pruefen.ts` meldet: `README/Kette: ok (50 Schritte dokumentiert)`.

## Wie die vier Vokabulare abgebildet werden

[read] `PHASE_MODELS.md` führt neun Phasen: `fat_loss`, `lean_bulk`, `maintenance`, `reverse_diet`, `contest_prep`, `recomp`, `expert_bb_annual`, `mini_cut`, `peak_week`.

[read] `DATABASE.md` trennt Zieltyp und Phase. `goal_type` ist die grobe Klasse, `phase_type` die aktuelle Ernährungs- oder Trainingsphase.

[read] Das Vorgängerrepo enthält mindestens drei weitere Vokabulare: `goalModifiers` in `calculateTDEE.ts`, UI-Werte in `Step4Goal.tsx` und einfache Klassen wie `lose` / `maintain` / `gain` in den Goal-Definitionen.

[cmd] Die Abbildung in `zielvokabular.json` lautet:

| Profilwert | Zieltyp | Standardphase | Status |
|---|---|---|---|
| `lose_weight` | `body_composition` | `fat_loss` | abgebildet |
| `maintain` | `lifestyle` | `maintenance` | abgebildet |
| `gain_muscle` | `body_composition` | `lean_bulk` | abgebildet |
| `recomposition` | `body_composition` | `recomp` | abgebildet |
| `performance` | `performance` | offen | nur für Zielwerte abgebildet |
| `health` | `health` | offen | offen |

[read] `performance` hat im Vorgängerrepo einen Kalorienzuschlag, aber im Phasenmodell keine eigene Phase. Deshalb bekommt es keinen geratenen `phase_type`.

[read] `health` hat weder im Phasenmodell noch in den GO-02-Zuschlägen eine tragfähige Entsprechung. Es bleibt `OFFEN`, statt still als `maintenance` behandelt zu werden.

[cmd] Damit hat jeder der sechs live erlaubten Profilwerte entweder eine Entsprechung oder eine ausdrückliche offene Markierung.

## Zeit und Zeitzone

[cmd] Ziele und Phasen verwenden `gueltig_ab date`. Ein Tag vor dem ersten `gueltig_ab` liefert über `goals.phase_am` keine Zeile.

[annahme] Das folgt dem Muster der Nutrition-Ziele und der Mahlzeitenlogik: fachlich zählt der lokale Kalendertag. Eine Uhrzeit wurde nicht eingeführt, weil Phasen Tageszustände sind und keine Ereignisse wie Mahlzeiten.

## Was aus den Specs nicht übernommen wurde

[read] Nicht übernommen wurden Meilensteine, Beitragswerte, automatische Anpassungen, Körpermessungen, Körperumfänge, Progress-Fotos, Wochenberichte, Dashboard-Materialisierungen und adaptive TDEE.

[annahme] Der Grund ist der Zuschnitt: GO-07 sollte speichern, welches Ziel und welche Phase seit wann gelten. Fortschritt, Beiträge, Messwerte und automatische Zielkorrekturen bauen darauf auf.

[read] Beitragswerte sind laut `OPEN_ITEMS.md` append-only. Eine Beitragstabelle wurde nicht gebaut, weil sie zu GO-10/GO-11 und der späteren Progressionslogik gehört.

[cmd] Die Spec-Form `UNIQUE (user_id) WHERE (is_active = true)` wurde nicht kopiert, weil PostgreSQL partielle Eindeutigkeit als Index ausdrückt. Gebaut sind partielle Unique-Indexes.

[cmd] `nutrition_targets`, `berechne_zielwerte` und `zielwerte_am` wurden nicht verändert.

## Was ein Ziel noch nicht kann

[annahme] Es gibt noch keine Oberfläche, kein Onboarding-Schreiben, keine Nutzerbestätigung, keine Meilensteine, keine Beitragswerte, keine automatische Fortschrittsberechnung, keine adaptive TDEE und keine automatische Phasenumschaltung.

[annahme] Ziele und Phasen erzeugen noch keine neuen Nutrition-Zielwerte. Block A rechnet weiter aus Profil und bestehenden Inputs; GO-07 schafft nur die persistente Ziel- und Phasenebene daneben.

[annahme] `performance` und `health` können als Zieltyp gespeichert werden, aber ihre konkrete Phasenlogik ist noch nicht entschieden.

## Nachweis

[cmd] Kettenlauf in Wegwerf-Datenbank `lumeos_kette_go06_go07`: `Kette: 50 Schritte`, Schritt 111 meldet `OK: goals.user_goals und goals.goal_phases mit RLS und je 4 Policies`.

[cmd] `schema-vollstaendigkeit-pruefen.ts` gegen die Wegwerf-Datenbank: `SCHEMA VOLLSTAENDIG`, fremde Tabellen `7/7`, fremde Funktionen `9/9`.

[cmd] Testdaten in der Wegwerf-Datenbank: `3 Ziele, 3 Phasen`; `testdaten-pruefen.ts` meldet `OK: C-82 Testdaten stimmen.`

[cmd] Stichtage für Tom: `2026-08-02` liefert keine Phase, `2026-08-10` liefert `maintenance`, `2026-08-18` liefert `lean_bulk`.

[cmd] RLS in der Wegwerf-Datenbank: Tom sieht 2 Ziele und 2 Phasen; Sarah sieht 0 Ziele und 0 Phasen. Ein Insert von Sarah auf Toms `user_id` scheitert mit `new row violates row-level security policy for table "user_goals"`.

[cmd] Live wurde Schritt 111 eingespielt. Danach meldet `schema-vollstaendigkeit-pruefen.ts`: `SCHEMA VOLLSTAENDIG`.

[cmd] Live-Testdaten: `3 Ziele, 3 Phasen`; `testdaten-pruefen.ts` meldet `OK: C-82 Testdaten stimmen.`

[cmd] Live-Stichtage für Tom: `2026-08-02` keine Phase, `2026-08-10` `maintenance`, `2026-08-18` `lean_bulk`.

[cmd] `pnpm gate`: 8 von 8 Tasks erfolgreich. Der vorher erwartete Fehler in `apps/web/src/app/v2/supplements/daten.ts` ist nicht mehr vorhanden.

