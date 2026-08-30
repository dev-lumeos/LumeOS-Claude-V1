# C-305 — Codex, 2026-08-27

Bericht: `docs/berichte/c-305-codex.md`

**Deine C-300-Messung hat den Rest gefunden: `nutrition.meals` und
`meal_items` fuehren 62.461 `hat_sicht`-Aufrufe aus. Beide standen
nicht in C-299 — mein Fehler.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.**

## 1 · Warum die beiden gefehlt haben

`[cmd]` **`nutrition.daily_summary` ist eine VIEW mit
`{security_invoker=true}`.** Damit greifen die RLS-Policies der
Basistabellen beim Aufrufer. `rule_assessment` liest die View —
dahinter liegen `meals` und `meal_items`.

`[cmd]` **Die Groessenordnung passt:** `meals` 2.895 Zeilen, davon
**2.170 fremd**; `meal_items` **9.051**. Bei mehrfachen Scans ergeben
sich deine 62.461 Aufrufe zwanglos.

`[read]` **Mein Erhebungsfehler, benannt:** ich hatte die gelesenen
Tabellen mit einem Regex ueber `prosrc` gesucht, der `FROM` und `JOIN`
findet. **Der sieht `nutrition.daily_summary` — aber nicht, was hinter
der View liegt.** Ein Regex loest keine View auf. Deshalb standen fuenf
Tabellen im C-299-Auftrag statt sieben.

`[read]` **Und die Lehre daraus gehoert in diesen Auftrag:** wer die
Kosten einer Funktion abschaetzt, **muss die Views aufloesen.**

## 2 · Zu tun

**Dieselbe Umformung wie in C-299, fuer die dreizehn verbliebenen
Policies — `nutrition.meals` und `nutrition.meal_items` zuerst.**

`[cmd]` **Die vollstaendige Liste, gemessen aus `pg_policies`:**

    nutrition.meals              nutrition.meal_items
    nutrition.water_logs         medical.lab_reports
    training.workout_sessions    goals.user_goals
    goals.goal_phases            goals.goal_milestones
    goals.body_measurements      goals.body_circumferences
    goals.nutrition_targets      recovery.checkins
    recovery.scores              recovery.modality_log

`[cmd]` **Vier weitere tragen `hat_sicht` in einem `EXISTS`** —
`supplements.stack_items`, `training.workout_exercises`,
`training.workout_sets`. `[read]` **Bei `stack_items` hast du in C-299
belegt, dass der Unterplan einmalig materialisiert wird. Pruef die
anderen drei nach demselben Massstab** — und wenn sie schon einmalig
sind, **nicht anfassen und das sagen.**

`[read]` **Die Semantik muss gleich bleiben, nicht aehnlich.**
`expires_at`, das Modul und die `summary`/`full`-Stufe sind Teil der
Bedingung — je Tabelle ein anderes Modul (`nutrition`, `goals`,
`recovery`, `training`, `medical`). **Nicht eine Vorlage ueber alle
dreizehn ziehen, ohne das Modul je Tabelle zu pruefen.**

## 3 · WAS NICHT ZU TUN IST

**`coach.hat_sicht` nicht aendern** — sie wird anderswo aufgerufen.
**`rule_assessment` nicht anfassen**, weder Rumpf noch
`SECURITY INVOKER`.
**Die View `daily_summary` nicht auf `security_invoker=false`
stellen** — `[read]` **das waere eine stille Rechteausweitung**, keine
Optimierung.
`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — in beide Richtungen, je Modul

    Coach MIT Freigabe          sieht die Zeilen        Zahl
    Coach OHNE Freigabe         sieht keine             0
    Coach mit abgelaufener      sieht keine             0
      expires_at
    Coach mit 'summary' bei     sieht keine             0
      geforderter 'full'
    Eigene Zeilen               vorher = nachher        Zahl

`[read]` **Die dritte und vierte Probe sind die wichtigen** — eine
Vereinfachung, die `expires_at` oder die Stufe verliert, bliebe bei
den ersten beiden gruen. **Und die Module unterscheiden sich: eine
Freigabe fuer `nutrition` darf `goals` nicht oeffnen.** Das ist die
fuenfte Probe.

    rule_assessment authenticated   ms vorher / nachher
    rule_assessment service_role    ms, als Bezugsgroesse
    shared hit Bloecke              vorher / nachher
    hat_sicht-Aufrufe               vorher 62.461 / nachher

`[cmd]` **Ausgangslage, vom Orchestrator nach C-299 gemessen:**
`authenticated` 559,6 / 567,7 / 581,9 ms · `service_role` 164,4 /
170,4 / 164,9 ms · shared hit **128.666**.

`[read]` **Diesmal muss sich die Pufferzahl bewegen.** Nach C-299 tat
sie es um elf Bloecke von 128.000 — **das war der Beleg, dass die
Ursache woanders lag.** Bleibt sie erneut stehen, ist die Erklaerung
wieder unvollstaendig, und **das gehoert dann so in den Bericht statt
einer Aufrundung.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
Struktur gehoert in die Kette, nicht in eine Migration.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
