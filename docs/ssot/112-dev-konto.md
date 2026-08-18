# C-77 — Seeds auf `dev@lumeos.app`

Stand: 2026-08-18.

## Ausgangslage

`[cmd]` `dev@lumeos.app` war anmeldbar, hatte aber nur die Nutrition-Mahlzeiten:
173 Mahlzeiten, 0 Körpermessungen, 0 Laborbefunde.

`[cmd]` `tom.seed@example.com` trug die vollständigen späteren Seeds, war aber
nicht anmeldbar: `auth.users.encrypted_password IS NOT NULL` lieferte `false`.

`[cmd]` `test-user@lumeos.local` ist anmeldbar und bleibt Prüfkonto. Die
Medical-Nachweisreste sind nach dem Lauf weg: 0 `medical.lab_reports`,
0 `medical.lab_result_values`.

## Was auf `dev@lumeos.app` liegt

`[cmd]` `supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql` wurde live
ausgeführt. Danach lagen auf `dev@lumeos.app` dieselben Modul-Seeds wie auf
`tom.seed@example.com`; `tom.seed` blieb unverändert.

| Bereich | Tabelle | `dev@lumeos.app` | `tom.seed@example.com` |
|---|---:|---:|---:|
| Nutrition | `meals` | 173 | 173 |
| Nutrition | `meal_items` | 536 | 536 |
| Nutrition | `water_logs` | 85 | 85 |
| Preferences | `food_preferences` | 1 | 1 |
| Preferences | `food_preference_items` | 3 | 3 |
| Goals | `nutrition_targets` | 1 | 1 |
| Goals | `user_goals` | 2 | 2 |
| Goals | `goal_phases` | 2 | 2 |
| Goals | `goal_milestones` | 3 | 3 |
| Body | `body_measurements` | 43 | 43 |
| Body | `body_circumferences` | 7 | 7 |
| Recovery | `checkins` | 36 | 36 |
| Training | `workout_sessions` | 9 | 9 |
| Training | `workout_exercises` | 18 | 18 |
| Training | `workout_sets` | 60 | 60 |
| Supplements | `user_stacks` | 1 | 1 |
| Supplements | `stack_items` | 4 | 4 |
| Supplements | `intake_logs` | 4 | 4 |
| Medical | `lab_reports` | 2 | 2 |
| Medical | `lab_result_values` | 6 | 6 |

`[cmd]` Herkunft am Dev-Konto: `meals`, `meal_items`, `water_logs`,
`recovery.checkins`, `training.workout_sessions`, `training.workout_sets`,
`supplements.intake_logs`, `medical.lab_reports` und `medical.lab_result_values`
tragen `seed` an der jeweiligen Herkunftsspalte.

`[cmd]` Ausnahme: `goals.body_measurements` und `goals.body_circumferences`
erlauben in ihrer Check-Constraint nur `manual`, `device`, `import`, `admin`.
Deshalb bleibt `measurement_source = 'manual'`; `source_detail` trägt
`Kopie aus tom.seed@example.com`.

## Wie der RLS-Nachweis künftig geführt wird

`[cmd]` Zwei anmeldbare Konten sind geeignet:

| Konto | Rolle | Zweck |
|---|---|---|
| `dev@lumeos.app` | Admin / Arbeitskonto | sieht die Demo-Daten |
| `test-user@lumeos.local` | Nicht-Admin | Gegenprobe für Zeilenschutz |

`[cmd]` RLS-Nachweis über `role authenticated` und `auth.uid()`:
`dev@lumeos.app` sieht 43 Körpermessungen, 36 Recovery-Check-ins und
9 Trainingssitzungen. `test-user@lumeos.local` sieht in denselben Tabellen
0 Zeilen.

`[cmd]` Browser-Login mit dem alten, im Vorgänger-/Altbestand genannten
Dev-Passwort `LumeOS2026!` lieferte `invalid_credentials`. Es wurde kein
Passwort gesetzt oder geändert. Der Browsernachweis als `dev@lumeos.app`
bleibt damit offen, bis Tom mit seinem echten lokalen Passwort prüft oder
eine erneute Auth-Freigabe gibt.

## Was `eigenes-konto-fuellen.sql` jetzt tut

`[read]` Das vorhandene Skript wurde erweitert, statt ein zweites Skript
daneben zu legen.

`[cmd]` Das Skript:

- räumt die Demo-Tabellen des Zielkontos und kopiert sie neu aus
  `tom.seed@example.com`;
- fasst `auth.users` nicht an;
- kopiert relationale Daten mit neuen UUIDs und Mapping-Tabellen:
  Mahlzeiten/Positionen, Goals/Phasen/Meilensteine,
  Trainingseinheiten/Übungen/Sätze, Supplement-Stacks/Positionen/Einnahmen
  und Laborbefunde/Werte;
- löscht idempotent Medical-Nachweisreste auf `test-user@lumeos.local`;
- lässt `tom.seed@example.com` unverändert.

`[cmd]` `testdaten-pruefen.ts`: Exit 0, unter anderem 513 Meals,
1.561 Items, 212 Water Logs, 43 Körpermessungen, 36 Check-ins,
9 Trainingssitzungen, 2 Befunde und 6 Laborwerte in den drei Seed-Nutzern.

`[cmd]` `pnpm gate`: grün, 8/8 Tasks erfolgreich.
