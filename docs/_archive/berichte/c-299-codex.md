# C-299 - Coach-Lesepolicies als InitPlan

Datum: 2026-08-27  
Auftrag: `docs/auftraege/c-299-codex.md`

## Ergebnis

Die fuenf im Auftrag aufgelisteten direkten `*_coach_read`-Policies lesen
`coach.client_permissions` nun als `IN (SELECT ...)`-Unterabfrage. Die
Unterabfrage erhaelt `expires_at` sowie die jeweilige
`*_visibility = 'full'`-Bedingung. Sie ist weiterhin invoker-basiert; weder
`coach.hat_sicht()` noch `supplements.rule_assessment()` wurden geaendert und
es wurde kein `SECURITY DEFINER` eingefuehrt.

Neuer Kettenschritt:
`supabase/_pipeline/15_coach/299_coach_read_policy_initplan.sql`.

Der Auftrag nennt an zwei Stellen vier Policies, listet aber fuenf Tabellen
auf. Gemessen und umgesetzt wurden fuenf: `supplements.intake_logs`,
`supplements.user_stacks`, `medical.user_medications`,
`medical.user_conditions` und `medical.lab_result_values`.

## Zahlen: Auftrag gegen Messung

| Messpunkt | Auftrag | Eigene Messung | Geltend |
|---|---:|---:|---:|
| `intake_logs` gesamt | 744 | 744 | 744 |
| davon fuer den Testnutzer fremd | 384 | 384 | 384 |
| `client_permissions` | 5 | 5 | 5 |
| direkte Ziel-Policies | 4 genannt, 5 aufgelistet | 5 | 5 |
| alte `intake_logs`-Policy, drei Laeufe | 6,59 / 6,22 / 6,39 ms | 6,155 / 6,250 / 5,889 ms | Median 6,155 ms |
| neue `intake_logs`-Policy, drei Laeufe | 0,33 / 0,11 / 0,11 ms | 0,240 / 0,263 / 0,234 ms | Median 0,240 ms |
| Beschleunigung | Faktor 60 | Faktor 25,6 | Faktor 25,6 |
| `rule_assessment` authenticated | 553 ms | 549,239 ms vorher, 536,792 ms nachher | 536,792 ms |
| `rule_assessment` service_role | 166 ms | 162,098 ms vorher, 157,073 ms nachher | 157,073 ms |

Die `intake_logs`-Messung bestaetigt die Form des Befunds, aber nicht den
Faktor 60. `EXPLAIN (ANALYZE, BUFFERS)` sinkt von 951 auf 29 Shared-Hit-
Bloecke. Damit ist die einzelne Tabellenabfrage deutlich schneller, aber der
faktische Faktor in diesem Klon ist 25,6.

Bei `rule_assessment` bleibt der erwartete grosse Effekt aus: der
authenticated-Lauf sinkt nur um 12,447 ms (2,3 Prozent) und naehrt sich nicht
der Service-Referenz an. Die Top-Level-Shared-Hit-Bloecke liegen bei
79.187 vorher und 79.192 nachher; Service liegt bei 16.570 bzw. 16.571.
Die im Auftrag genannten 25.022 bzw. 128.655 Pufferzugriffe wurden damit
nicht bestaetigt. Das ist ein Restbefund fuer C-300 oder eine eigene
Profiling-Aufgabe, nicht etwas, das dieser Policy-Umbau verdeckt erledigt.

## Sicherheitsnachweis

Alle Proben liefen gegen `lumeos_c299_verify`, eine Kopie der laufenden
Datenbank. Fuer die direkte Rollenabfrage erhielt allein diese Wegwerf-
Datenbank temporaere `USAGE`, `SELECT` und `EXECUTE`-Grants; RLS blieb aktiv.
Die laufende Datenbank erhielt keine solchen Grants und wurde nicht getestet.

Testklient: `10000000-0000-0000-0000-000000000101`.

| Akteur | intake_logs | user_stacks | user_medications | user_conditions | lab_result_values | Ergebnis |
|---|---:|---:|---:|---:|---:|---|
| Eigentuemer, vorher und nachher | 360 | 1 | 1 | 1 | 140 | unveraendert |
| Coach mit `full` | 360 | 1 | 1 | 1 | 140 | sieht alle freigegebenen Zeilen |
| Coach ohne Freigabe | 0 | 0 | 0 | 0 | 0 | gesperrt |
| Coach mit abgelaufenem `expires_at` | 0 | 0 | 0 | 0 | 0 | gesperrt |
| Coach mit `summary` statt `full` | 0 | 0 | 0 | 0 | 0 | gesperrt |

Damit sind insbesondere Ablauf und Freigabestufe nicht aus der Bedingung
verloren gegangen. Die Policy-Inspektion in beiden Wegwerf-Datenbanken ergab
fuenf Ziel-Policies, null direkte `coach.hat_sicht`-Aufrufe und fuenfmal
`expires_at` plus `full`.

`supplements.stack_items` wurde nicht angefasst. Sein bestehendes `EXISTS`
wird im Plan als gehashter SubPlan mit `Actual Loops: 1` materialisiert; die
Verschachtelung wertet ihn nicht je `stack_items`-Zeile aus.

## Kette und Live-Einspielung

- `node tools/migration-datenlogik-pruefen.mjs`: gruen. Keine Migration wurde
  angelegt oder geaendert.
- `kette.json`: gueltig; Schritt 299 haengt von 152 ab.
- Frischer Kettenlauf in `lumeos_c299_chain`: 123 Schritte, 174,8 Sekunden,
  Abschlusspruefung gruen. Die fuenf Ziel-Policies sind dort vorhanden, ohne
  Funktionsaufruf und mit Ablauf- und Stufenpruefung.
- Vor dem einzigen Live-Eingriff entstand die Vollsicherung
  `backup/c299/20260827122839_c299_vor_live.dump` (25.237.957 Bytes). Sie
  enthaelt auch die vorherigen Policy-Definitionen. Danach wurde nur Schritt
  299 erfolgreich gegen die laufende Datenbank ausgefuehrt.

Kein `apps/`-Pfad wurde veraendert. Kein Commit, Staging oder Push.
