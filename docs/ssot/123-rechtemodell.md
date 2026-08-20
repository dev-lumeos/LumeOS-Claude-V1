# C-119 — Permissions, Autonomy, Alpha und `progress_pct`

Stand: 2026-08-20

## Wie Permissions und Autonomy getrennt sind

`[read]` Tom, 2026-08-19: Permissions und Autonomy sind zwei verschiedene Sachen. Permissions setzt der Nutzer: was der Coach sehen darf und ob er je Modul ohne Bestaetigung aendern darf. Autonomy setzt der Coach: den Reifegrad seines Athleten.

`[cmd]` Gebaut ist Schritt `150_coach_permissions_autonomy.sql` mit Schema `coach` und sechs Tabellen:

| Tabelle | Zweck | wer schreibt |
|---|---|---|
| `coach.client_permissions` | Sichtbarkeit und Auto-Apply je Modul | Klient |
| `coach.client_autonomy` | Autonomy-Level 1-5 je Modul plus `safety_level` 1-3 | Coach |
| `coach.permission_change_log` | Append-only Historie der Permissions | Trigger |
| `coach.autonomy_change_log` | Append-only Historie der Autonomy | Trigger |
| `coach.pending_actions` | Vorschau, Payload, 10-Minuten-Verfall, Bestaetigung | Coach erstellt, Klient bestaetigt |
| `coach.action_log` | ausgefuehrte Aktion mit Undo-Snapshot | Ausfuehrungsschicht spaeter |

`[cmd]` Die sieben Module sind als Spalten bzw. Modulwerte gefuehrt: `nutrition`, `training`, `recovery`, `goals`, `supplements`, `medical`, `buddy`.

`[cmd]` RLS-Nachweis in rollback-sicherer Transaktion:

| Probe | Ergebnis |
|---|---:|
| Klient sieht eigene Permissions | 1 Zeile |
| Permission-Log nach Insert + Update | 2 Zeilen |
| Coach sieht Permission | 1 Zeile |
| Coach darf Permission nicht aendern | 0 Zeilen geaendert |
| Autonomy-Log nach Insert + Update durch Coach | 2 Zeilen |
| Dritter Nutzer sieht Permissions | 0 Zeilen |
| Dritter Nutzer sieht Autonomy | 0 Zeilen |

`[read]` Das Muster von `coach_pending_actions` aus dem Vorgaengerrepo wurde strukturell uebernommen: Vorschau, 10-Minuten-Verfall, `confirmed_at`, Log mit Undo. Die Tabelle selbst wurde nicht uebernommen.

`[read]` Der Grund, warum das Vorgaengerrepo scheiterte: Der Klient hatte keine Stimme — der Seed vergibt sogar Medical-Einwilligung per Skript. RLS war auf den Coach-Tabellen Attrappe (`USING (true)` oder fehlend). Und es gab keinen Mechanismus, der eine neue Antwort zwang, die alte abzuloesen.

## Was die Widerrufshistorie festhaelt

`[cmd]` `client_permissions` und `client_autonomy` setzen `changed_by` per Trigger aus `auth.uid()`. Jede `INSERT`, `UPDATE` und `DELETE` schreibt eine Logzeile mit:

| Feld | Bedeutung |
|---|---|
| `coach_id`, `client_id` | betroffene Beziehung |
| `changed_by`, `changed_at` | Akteur und Zeitpunkt |
| `change_kind` | `insert`, `update`, `delete` |
| `old_value`, `new_value` | vollstaendiger JSONB-Snapshot |

`[cmd]` Die beiden Logtabellen geben `authenticated` nur `SELECT` und `INSERT`, kein `UPDATE` und kein `DELETE`. Damit sind sie fuer normale Nutzer append-only. `service_role` bleibt fuer administrative Wartung voll berechtigt.

`[annahme]` Eine spaetere UI sollte nicht direkt in die Logtabellen schreiben. Der heutige direkte `INSERT`-Grant ist nur noetig, damit Trigger unter RLS sauber schreiben koennen und die Schemapruefung das Recht explizit sieht.

## Was `alpha = 1` aendert

`[cmd]` Vorher: `alpha = 0.3`; Tom-Seed am `CURRENT_DATE` war `complete`, raw `2497,4` kcal, Formel `3527,0` kcal, ausgegeben `3218,1` kcal, Abstand `-308,9` kcal.

`[cmd]` Nachher: `alpha = 1.0`; gleicher Tag `complete`, raw `2497,4` kcal, Formel `3527,0` kcal, ausgegeben `2497,4` kcal, Abstand `-1029,6` kcal.

`[read]` Toms Entscheidung: Der adaptive Wert ist der gemessene Wert; der Formelwert bleibt daneben sichtbar. Dadurch ist die GO-16-UI-Formulierung falsch, die sinngemaess noch von "30 % aus der Messung" spricht. Sie muss auf "gemessener adaptiver Wert" oder aehnlich nachgezogen werden.

`[read]` Toms Ausblick bleibt offen: Wenn spaeter Querverbindungen aus allen Modulen und Buddy vorliegen, soll sich eine Autokorrektur aus effektiven Blutwerten gegen Mikros und Supplements ergeben. Das ist nicht Teil dieses Schritts; die Formel wird nur auf `alpha = 1` gesetzt.

## Wie `progress_pct` gepflegt wird

`[cmd]` Vorher: `Lean Bulk bis September` stand in `goals.user_goals.progress_pct` auf `40,00`, waehrend `goals.goal_progress_at()` fuer denselben Tag `0,0` berechnete. Das waren zwei Wahrheiten.

`[cmd]` Gebaut wurden:

| Objekt | Zweck |
|---|---|
| `goals.refresh_user_goal_progress(goal_id, date)` | aktualisiert einen messbaren Ziel-Snapshot aus `goal_progress_at()` |
| `goals.refresh_user_goals_progress_for_user(user_id, date)` | aktualisiert alle messbaren Auto-Update-Ziele eines Nutzers |
| Trigger auf `goals.body_measurements` | zieht Koerperziele nach |
| Trigger auf `training.workout_sets` | zieht Kraftziele nach |

`[cmd]` Nachher fuer `tom.seed@example.com`:

| Ziel | gespeicherter `progress_pct` | `goal_progress_at()` | Quelle |
|---|---:|---:|---|
| `Lean Bulk bis September` | 0,00 | 0,0 | `goals.body_measurements` |
| `Bankdruecken stabilisieren` | 0,00 | 0,0 | `training.workout_sets.estimated_1rm` |

`[annahme]` Performance-Ziele werden nur dort gemessen, wo eine konservative Zuordnung existiert. Heute ist das `Bankdruecken` -> `Barbell Bench Press`. Zielarten ohne messbare Quelle bleiben `not_measurable`, bekommen keinen geratenen Fortschritt und keine Prozentzahl.

## Nachweis

`[cmd]` Live eingespielt:

- `113_goal_milestones_adaptive_tdee.sql`
- `150_coach_permissions_autonomy.sql`

`[cmd]` Kettenlauf: `pnpm exec tsx supabase/_pipeline/kette-ausfuehren.ts --database lumeos_c119_chain`, 69 Schritte, Exit 0, Laufzeit 82,9 s, Wegwerf-Datenbank geloescht. Der Runner legte vorher ein Schema-Backup unter `backup/schema/20260820022546_c43_vor_kettenlauf.sql` an.

`[cmd]` Validierungen:

| Pruefung | Ergebnis |
|---|---|
| `schema-vollstaendigkeit-pruefen.ts` | Exit 0, Fremde Tab. 28/28, Fremde Fkt. 24/24 |
| `testdaten-pruefen.ts` | Exit 0 |
| `kette-readme-pruefen.ts` | Exit 0, 69 Schritte dokumentiert |
| `pnpm gate` | Exit 0 |

`[cmd]` Nebenbefund: `kette-readme-pruefen.ts` meldete vor der Bereinigung zwei bereits vorhandene README-Luecken (`018`, `032`). Die Zeilen wurden dokumentiert; die Kettendatei selbst war schon korrekt.
