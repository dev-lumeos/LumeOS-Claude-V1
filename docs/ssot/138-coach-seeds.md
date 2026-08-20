# C-147 — Coach-Seeds, Phasenspalten und Trainingssatz-Metadaten

Stand: 2026-08-20

## Was die Coach-Tabellen jetzt enthalten

[cmd] Vorher waren die sechs Tabellen aus C-119 leer: `client_permissions`,
`client_autonomy`, `pending_actions`, `action_log`,
`permission_change_log`, `autonomy_change_log` jeweils 0 Zeilen.

[cmd] Der Testdaten-Erzeuger legt jetzt `coach.seed@example.com` an und
verknuepft ihn mit `tom.seed@example.com`. `eigenes-konto-fuellen.sql`
baut dieselbe Beziehung fuer `dev@lumeos.app` neu auf. `test-user@lumeos.local`
bleibt ohne Coach-Beziehung.

Live-Stand nach dem Einspielen:

| Konto | Permissions | Autonomy | Pending | Action log | Permission-Historie | Autonomy-Historie |
|---|---:|---:|---:|---:|---:|---:|
| `tom.seed@example.com` | 1 | 1 | 1 | 1 | 2 | 2 |
| `dev@lumeos.app` | 1 | 1 | 1 | 1 | 2 | 2 |
| `test-user@lumeos.local` | 0 | 0 | 0 | 0 | 0 | 0 |

[cmd] Die Permissions unterscheiden sich bewusst: Nutrition `full`,
Training `full`, Recovery `summary`, Goals `full`, Supplements
`summary`, Medical `none`, Buddy `summary`. `training_auto_apply=true`,
`nutrition_auto_apply=false`, damit der Pending-Action-Pfad sichtbar ist.

[cmd] RLS-Gegenprobe live mit `SET ROLE authenticated`: Coach sieht fuer
`dev@lumeos.app` 1/1/1/1 Zeilen in Permissions/Autonomy/Pending/Action,
`dev@lumeos.app` sieht dieselben 1/1/1/1, `test-user@lumeos.local` sieht
0/0/0/0.

## Wie die Historie aussieht

[read] Permissions und Autonomy bleiben getrennt: Permissions setzt der
Klient, Autonomy setzt der Coach.

[cmd] Die Historie wird nicht direkt geschrieben. Der Seed fuegt einen
Ausgangszustand ein und aktualisiert ihn danach. Die bestehenden Trigger
erzeugen dadurch je Beziehung zwei Logzeilen: `insert` mit nur
`new_value`, danach `update` mit `old_value` und `new_value`.

[cmd] Das Action-Beispiel liegt als Training-Aktion mit `undo_data` vor.
Die offene Pending Action liegt im Modul Nutrition und laeuft ueber den
Bestaetigungspfad, nicht ueber Auto-Apply.

## Was `phase_am()` liefert

[cmd] `goals.phase_am()` liefert jetzt 14 Rueckgabespalten statt 8:
`phase_id`, `user_id`, `goal_id`, `phase_type`, `variant`, `parameters`,
`gueltig_ab`, `projected_end_date`, `actual_end_date`,
`transitioned_from`, `recommended_next`, `transition_reason`,
`created_at`, `updated_at`.

[cmd] Beispiel live fuer Tom am gueltigen Lean-Bulk-Tag:
`transitioned_from=maintenance`, `recommended_next=mini_cut`,
`transition_reason=Phasenwechsel im Testzeitraum`.

[cmd] Die UI-Begruendungen sind fachlich veraltet, wurden aber nicht
geaendert, weil sie in `apps/web/` liegen: `medical/tab-tracking.tsx`
nennt beim Knopf `Add medication` noch eine fehlende Medikations-Tabelle,
obwohl `medical.user_medications` seit C-130 existiert. `goals/tab-phase.tsx`
und `goals/phase-editor.tsx` nennen `goals.goal_phases` als fehlend,
obwohl die Tabelle seit GO-07 existiert.

## Was `rir` und `is_pr` zeigen

[cmd] `workout_sets` hatte die Spalten bereits, aber die Seeds liessen sie
leer. Nach dem Seedlauf sind 101 von 101 Satzzeilen mit `rir` gefuellt.
`is_pr=true` steht auf 41 Satzzeilen ueber 6 Uebungen.

[cmd] PR-Beispiele fuer `tom.seed@example.com`: Bench Press 95,3 -> 99,3
e1RM, Deadlift 129,7 -> 138,0, Squat 116,7 -> 126,0. `rir` wird aus RPE
abgeleitet (`round(10 - rpe)`) und bleibt Satzmetadatum, nicht
Trainingsbewertung.

[cmd] Nachweis: Kettenlauf auf Wegwerf-Datenbank gruen, Testdatenlauf auf
Wegwerf-Datenbank gruen, `schema-vollstaendigkeit-pruefen.ts` Exit 0,
`kette-readme-pruefen.ts` ok, `testdaten-pruefen.ts` Exit 0.
