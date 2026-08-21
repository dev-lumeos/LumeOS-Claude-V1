# C-189: Regelwerk-Laufzeit

Stand: 2026-08-21

## Was 8 Sekunden verbraucht hat

`[cmd]` Der langsame Tabwechsel im Supplements-Modul hing an genau einer
Abfrage: `supplements.rule_assessment`. Die anderen Datenquellen lagen in
derselben Messreihe bei rund 200 ms und enthielten vor allem den
`docker exec`-Aufwand:

| Abfrage | Laufzeit |
|---|---:|
| `supplements.substance_catalog` | 217 ms |
| `supplements.substance_lab_effects` | 215 ms |
| `supplements.rule_catalog` | 229 ms |
| `supplements.intake_logs` | 214 ms |
| `supplements.rule_assessment` | 8.120 ms |

`[cmd]` Die lokale Vorher-Messung mit
`EXPLAIN (ANALYZE, BUFFERS)` auf `rule_assessment` fuer
`dev@lumeos.app` und `CURRENT_DATE` ergab:

| Kennzahl | vorher |
|---|---:|
| Execution Time | 7.343,554 ms |
| shared hit | 1.353.687 |
| temp read | 529.592 |
| temp written | 529.592 |

`[cmd]` `supplements.platform_input_status` allein lag bei:

| Kennzahl | einzeln |
|---|---:|
| Execution Time | 115,113 ms |
| shared hit | 24.412 |
| temp read | 8.106 |
| temp written | 8.106 |

`[read]` Die Ursache war damit eindeutig: `rule_assessment` rief
`platform_input_status` in der Schleife einmal je Regel auf. Bei 64 Regeln
ergibt das denselben Bestand 64-mal gelesen. Die Rechnung passte zur
Messung: `529.592 / 8.106 = 65`, also die Groessenordnung von 64
Wiederholungen plus Overhead.

`[cmd]` Geaendert wurde `supabase/_pipeline/13_supplements/133_kimi_rules.ts`.
`platform_input_status` wird jetzt einmal vor der `FOR v_rule`-Schleife als
JSONB-Menge materialisiert und in der Schleife per `jsonb_to_recordset`
gelesen. Die beiden vorher getrennten Aufrufe von
`nutrition.daily_reference_assessment` fuer `VITD` und `MG` wurden zu einem
aggregierten Aufruf zusammengezogen.

`[read]` Das ist nicht nur schneller, sondern konsistenter: Die
Eingangspfade koennen sich waehrend eines Bewertungsdurchlaufs nicht je
Regel unterscheiden.

## Was jetzt gemessen wird

`[cmd]` Nach der Aenderung und dem Einspielen des Kettenschritts auf die
laufende Datenbank:

| Kennzahl | nachher |
|---|---:|
| Execution Time | 136,372 ms |
| shared hit | 28.924 |
| shared read | 2 |
| temp read | 9.457 |
| temp written | 9.457 |

`[cmd]` Die Temp-Dateien fallen damit von `529.592` auf `9.457`
Bloecke. Das liegt in der Groessenordnung eines einzelnen
`platform_input_status`-Laufs statt 64 Laeufen.

`[cmd]` Die drei Bewertungszustaende sind unveraendert:

| Zustand | Anzahl |
|---|---:|
| `fulfilled` | 1 |
| `not_fulfilled` | 50 |
| `missing_input` | 13 |

`[cmd]` Die drei Beispielregeln sind unveraendert:

| Regel | Zustand | Effekt | fehlende Eingaenge |
|---|---|---|---|
| `wr_anticoag_stack` | `fulfilled` | `physician_referral` | `{}` |
| `wr_warfarin_vitk` | `not_fulfilled` | `physician_referral` | `{}` |
| `wr_lab_biotin` | `missing_input` | `lab_context` | `medical.lab_draw_scheduled_within_days`, `supplements.daily_total_mg` |

`[cmd]` Die Seitenmessung wurde angemeldet mit
`node tools/schuss.mjs "/v2/supplements?tab=catalog" backup/c189-catalog-2.png`
gegen die laufende App ausgefuehrt. Der Gesamtlauf inklusive Login,
Navigation, Wartezeit und Screenshot lag bei `5,14 s`. Das ist nicht
identisch mit der urspruenglichen Tabwechsel-Messung von `9,2 s`, aber es
zeigt, dass der 8-Sekunden-Serveranteil aus `rule_assessment` nicht mehr in
derselben Form anliegt.

`[cmd]` `pnpm exec tsx supabase/_pipeline/_validierung/schema-vollstaendigkeit-pruefen.ts`
lief mit Exit 0. `pnpm exec tsx supabase/_pipeline/_validierung/testdaten-pruefen.ts`
lief mit Exit 0. `pnpm gate` lief mit Exit 0.

`[cmd]` Der Kettenlauf ueber `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts`
bricht weiterhin vor diesem Schritt ab:

```text
supabase/_pipeline/13_supplements/132_substance_alias_bridge.ts
Kimi crawl_022: 290 Kimi-Substanzen, erwartet 291
```

`[read]` Das ist ein bestehender Kimi-Bestands-/Erwartungs-Blocker und
nicht durch C-189 verursacht. Weil der Lauf vor `133_kimi_rules.ts`
stoppt, kann der komplette Kettennachweis fuer C-189 erst nach dieser
Korrektur gruen werden. Der betroffene Kettenschritt wurde separat auf
die laufende Datenbank eingespielt.

## Wo dasselbe Muster sonst steht

`[cmd]` Geprueft wurden die Pipeline-Fundstellen mit Schleifen und den
betroffenen Unterfunktionen:

| Fundstelle | Befund |
|---|---|
| `13_supplements/133_kimi_rules.ts` | `platform_input_status`, `daily_summary`, `stack_item_substance_matches`, `user_medications` und `daily_reference_assessment` liegen jetzt vor der Regel-Schleife. In der Schleife wird kein invariant schwerer Unteraufruf mehr je Regel ausgefuehrt. |
| `13_supplements/132a_rule_input_status.sql` | Ruft `nutrition.daily_reference_assessment` mehrfach fuer verschiedene Eingangspfade. Nach C-189 passiert das nur noch einmal je `rule_assessment`-Lauf, nicht mehr 64-mal. Das bleibt ein moeglicher eigener Optimierungspunkt, falls `platform_input_status` selbst zum Engpass wird. |
| `12_recovery/121_recovery_scores_modalities.sql` | `refresh_scores_for_user` ruft `recalculate_score` je Check-in-Tag. Das ist ein Neuaufbau je Datum, kein identischer Unteraufruf je Regel ueber denselben Bestand. |
| `11_goals/113_goal_milestones_adaptive_tdee.sql` | `refresh_user_goals_progress_for_user` ruft Fortschrittsberechnung je aktivem Ziel. Das ist zielabhaengig und nicht dasselbe Muster. |
| `14_medical/142_laborimport_matching.sql` | `import_lab_report_rows` matched jede Importzeile gegen Kandidaten. Das ist zeilenabhaengig; kein invarianter Bestand wird blind wiederholt. |
| `05_user_tabellen/058b_recipes_meal_plans.sql` | Die Schleifen materialisieren Meal-Plan-Slots und Zutaten in Diary-Zeilen. Das ist Kopierlogik je Slot/Zutat, kein wiederholter Status-Scan. |

`[annahme]` Die naechste sinnvolle Laufzeitpruefung liegt nicht in einer
zweiten Schleifen-Korrektur, sondern in `platform_input_status` selbst:
Dort werden mehrere Nährstoff-Eingangspfade jeweils ueber
`daily_reference_assessment` geprueft. Das ist heute nach C-189 nur noch
einmal pro Bewertungsaufruf sichtbar, kann aber spaeter isoliert gemessen
und gebuendelt werden.
