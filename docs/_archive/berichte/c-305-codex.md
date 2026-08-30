# C-305 - Restliche direkte Coach-Lesepolicies

Datum: 2026-08-27
Auftrag: `docs/auftraege/c-305-codex.md`

## Ergebnis

Der neue Kettenschritt
`supabase/_pipeline/15_coach/305_coach_read_policy_rest_initplan.sql`
ueberfuehrt die 14 verbliebenen direkten Coach-Lesepolicies in dieselbe
`client_permissions`-Unterabfrage wie C-299. Ablaufdatum, Modul und
ausschliesslich die Stufe `full` bleiben je Policy erhalten. `coach.hat_sicht`,
`rule_assessment` und `nutrition.daily_summary` wurden nicht veraendert; die
Sicht bleibt `security_invoker=true`.

## Zahlen: Auftrag gegen Messung

| Messpunkt | Auftrag | Eigene Messung | Geltend |
|---|---:|---:|---:|
| direkte Rest-Policies | 13 genannt, 14 aufgelistet | 14 | 14 |
| EXISTS-Sonderfaelle | 4 genannt, 3 aufgelistet | 3 | 3 |
| `nutrition.meals` gesamt / fremd | 2.895 / 2.170 | 2.895 / 2.170 | 2.895 / 2.170 |
| `nutrition.meal_items` gesamt | 9.051 | 9.051 | 9.051 |
| `hat_sicht`-Aufrufe in `rule_assessment` | 62.461 vorher | 62.461 vorher, 0 nachher | 0 nachher |

Die drei EXISTS-Sonderfaelle sind `supplements.stack_items`,
`training.workout_exercises` und `training.workout_sets`. Ihre aeusseren
Unterplaene haben jeweils `Actual Loops: 1`; sie wurden nicht umgeschrieben.
Bei `workout_sets` lief ein Kindscan 60-mal, dessen teure
`workout_sessions`-Berechtigung nun jedoch der neue einmalige InitPlan ist.

## Sicherheitsnachweis

Alle Proben liefen in `lumeos_c305_verify`, einer Kopie der laufenden
Datenbank. Die Kopie erhielt fuer die direkte Rollenprobe temporaere
Tabellen- und Funktionsgrants; RLS blieb aktiv. Testklient war
`dev@lumeos.app`.

| Probe | Ergebnis |
|---|---|
| Eigentuemer, vorher = nachher | Nutrition 725 / 2.298 / 361; Medical 5; Training 30 / 60 / 101; Goals 5 / 2 / 6 / 181 / 27 / 1; Recovery 170 / 170 / 89; Stack-Items 4 |
| Coach mit `full` in allen Modulen | exakt dieselben Zeilen |
| Coach ohne Freigabe | alle 17 geprueften Tabellen 0 |
| Coach mit abgelaufenem `expires_at` | alle 17 geprueften Tabellen 0 |
| Coach mit `summary` statt `full` | alle 17 geprueften Tabellen 0 |
| Coach nur mit Nutrition-`full` | Nutrition 725 / 2.298 / 361; Goals, Recovery, Training, Medical und Supplements jeweils 0 |

Die letzte Probe belegt die Modultrennung: Eine Nutrition-Freigabe oeffnet
keine Goals-Daten. Nach C-305 gibt es keine direkte
`coach.hat_sicht(user_id, ...)`-Policy mehr; nur die drei materialisierten
EXISTS-Formen enthalten die Funktion weiterhin.

## Leistung

`EXPLAIN (ANALYZE, BUFFERS)` gegen denselben Klon und dieselben
`dev@lumeos.app`-Daten, je drei Laeufe:

| Rolle | Vorher ms | Nachher ms | Median vorher -> nachher | Shared Hits vorher -> nachher |
|---|---|---|---:|---:|
| service_role | 164,963 / 171,279 / 159,749 | 178,494 / 185,259 / 192,753 | 164,963 -> 185,259 | 16.650 -> 16.653 |
| authenticated | 531,779 / 548,322 / 546,014 | 131,194 / 131,655 / 121,987 | 546,014 -> 131,194 | 79.276 -> 16.825 |

Der authenticated-Median sinkt um 414,820 ms (76,0 Prozent). Die
Shared-Hit-Bloecke sinken um 62.451 (78,8 Prozent) und bewegen sich damit
wie gefordert deutlich. Die Service-Rolle umgeht RLS; ihr um 20,296 ms
hoeherer Median bei nur drei zusaetzlichen Hits ist Messstreuung bzw.
Umgebungslast, nicht eine Policy-Wirkung. Er ist unveraendert berichtet,
nicht geglaettet.

Der Abstand zwischen den Medians lag vor C-305 bei 381,051 ms und danach
bei -54,065 ms; der authenticated-Lauf ist nach dem Umbau in dieser kleinen
Serie sogar schneller als der Service-Lauf. Das ist kein Sicherheitsbefund,
sondern ein Hinweis, die Service-Referenz bei einer spaeteren
Performanceaufgabe mit mehr Wiederholungen zu profilieren.

## Kette, Pruefer und Live

- `node tools/migration-datenlogik-pruefen.mjs`: gruen. Keine Migration
  wurde angelegt oder geaendert.
- `kette.json`: gueltig; Schritt 305 haengt von 299 ab.
- Frischer Kettenaufbau: 124 Schritte in 201,6 Sekunden. Alle Schritte
  liefen durch. Die anschliessende Abschlusspruefung fand zunaechst drei
  falsche Befunde fuer mehrzeilige Nutrition-Policies.
- Ursache war der Abschlusspruefer: Er teilte die mehrzeilige
  `pg_get_expr`-Ausgabe zeilenweise und verlor den `auth.uid()`-Teil der
  neuen Unterabfrage. Der Pruefer normalisiert `qual` und `with_check` jetzt
  in SQL auf Leerraum. Die Wiederholung gegen dieselbe Kettendatenbank ist
  vollstaendig gruen: 33/33 Policy-Bedingungen und `SCHEMA VOLLSTAENDIG`.
- Vor der Live-Einspielung entstand die Vollsicherung
  `backup/c305/20260827142401_c305_vor_live.dump` (25.242.001 Bytes). Danach
  wurde ausschliesslich Schritt 305 erfolgreich gegen die laufende
  Datenbank ausgefuehrt. Es gab keine nachtraegliche Live-Probe.

## Abweichung von der Messregel

Ein erster manueller Aufruf der Abschlusspruefung enthielt versehentlich
keine `PGDATABASE`-Umgebung und konnte deshalb die Standarddatenbank
adressieren. Er wurde nach 11 Sekunden ohne Ergebnis abgebrochen. Es gab
keine Schreiboperation und keine Ausgabe, aber schon der Aufruf verstoesst
gegen die Regel, nur im Klon zu testen. Die korrekte Wiederholung lief mit
`PGDATABASE=lumeos_c305_chain`.

Keine `apps/`-Datei wurde veraendert. Kein Staging, Commit oder Push.
