# C-299 — Codex, 2026-08-27

Bericht: `docs/berichte/c-299-codex.md`

**Vier Policies rufen eine Funktion je Zeile auf. Als Unterabfrage
geschrieben kostet dieselbe Prüfung ein Sechzigstel.**

---

## Vorweg: die Zahlen sind Ausgangsvermutungen

`[read]` **Pruef sie zuerst. Weicht deine ab, gilt deine — und du
nennst beide.**

## Der Befund

`[cmd]` **Gemessen auf `supplements.intake_logs`, 744 Zeilen, je drei
Laeufe unter `authenticated`:**

    coach.hat_sicht(l.user_id, ...)        6,59 / 6,22 / 6,39 ms
    user_id IN (SELECT client_id ...)      0,33 / 0,11 / 0,11 ms

**Faktor 60 bei gleicher Semantik.** `[read]` Postgres wertet die
Unterabfrage einmal als InitPlan aus statt je Zeile.

`[cmd]` **Warum es je Zeile passiert:** die Tabellen tragen zwei
PERMISSIVE SELECT-Policies. `(( SELECT auth.uid()) = user_id)` ist
fuer **fremde** Zeilen falsch, also muss das `OR` weiterlaufen und
`hat_sicht` aufrufen. `intake_logs` hat 744 Zeilen, **384 davon
fremd.**

`[cmd]` **Die Rechnung geht auf:** `rule_assessment` unter
`authenticated` kostet 553 ms gegen 166 ms unter `service_role`, bei
25.022 gegen 128.655 Pufferzugriffen. **Die Differenz von 103.633
Bloecken entspricht rund 33.000 `hat_sicht`-Aufrufen zu je drei
Bloecken** — 64 Regeln mal die fremden Zeilen mehrerer Tabellen.

`[cmd]` **`coach.client_permissions` hat 5 Zeilen.** `[read]` **Die
Funktion ist nicht teuer. Sie ist nur zu oft.**

`[cmd]` **Die eigene Policy ist bereits optimal** —
`(SELECT auth.uid())` statt `auth.uid()` steht ueberall. **Der
einfache Verdacht faellt aus.**

## Zu tun

**Die vier `*_coach_read`-Policies umschreiben**, von
`coach.hat_sicht(user_id, modul, stufe)` auf eine
`user_id IN (SELECT ...)`-Form mit derselben Semantik:

    supplements.intake_logs
    supplements.user_stacks
    medical.user_medications
    medical.user_conditions
    medical.lab_result_values

`[cmd]` **`supplements.stack_items` ist der Sonderfall** — dort steht
`hat_sicht` in einem `EXISTS` ueber `user_stacks`. **Pruef, ob dort
dieselbe Umformung greift oder ob die Verschachtelung sie schon
einmalig macht. Wenn sie schon einmalig ist: nicht anfassen und das
sagen.**

`[read]` **Die Semantik muss gleich bleiben, nicht ähnlich.**
`expires_at`, die Modul-Fallunterscheidung und die
`summary`/`full`-Stufe sind Teil der Bedingung. `[read]` **Wenn eine
davon in der Unterabfrage-Form nicht sauber abbildbar ist: melden,
nicht vereinfachen.**

## WAS NICHT ZU TUN IST

**Kein SECURITY DEFINER.** `rule_assessment` bleibt SECURITY INVOKER.
`[read]` **Der Grund ist die Reichweite:** SECURITY DEFINER repariert
eine Funktion, der Policy-Umbau repariert jede Abfrage auf diese
Tabellen. **Und ein Fehler in einer Policy ist ein Anzeigefehler, ein
Fehler in einer DEFINER-Funktion ein Datenleck.**

**Keine Policy loeschen und durch eine gleichnamige ersetzen, ohne
vorher die alte Definition zu sichern.**
**`coach.hat_sicht` nicht aendern** — sie wird anderswo aufgerufen.
`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

## NACHWEIS — in beide Richtungen

    Coach MIT Freigabe          sieht die Zeilen        Zahl
    Coach OHNE Freigabe         sieht keine             0
    Coach mit abgelaufener      sieht keine             0
      expires_at
    Coach mit 'summary' bei     sieht keine             0
      geforderter 'full'
    Eigene Zeilen               unveraendert            Zahl vorher = nachher

`[read]` **Alle fuenf einzeln belegt.** Die dritte und vierte sind die
wichtigen — **eine Vereinfachung, die `expires_at` oder die Stufe
verliert, wuerde bei den ersten beiden Proben gruen bleiben.**

    rule_assessment authenticated   ms vorher / nachher
    shared hit Bloecke              vorher / nachher
    rule_assessment service_role    unveraendert, als Bezugsgroesse

`[read]` **Erwartung: die 553 ms naehern sich den 166 ms.** Wenn ein
Rest bleibt, ist der Rest der naechste Befund — **nicht wegrunden.**
C-300 nennt 270-360 ms, die auch mit RLS nicht erklaert sind; **ob
dieser Umbau sie mit erledigt, ist offen und wird gemessen, nicht
vermutet.**

## REGELN

`tools/lauf.py` fuer jeden Befehl, keine Konsolenfenster.
**Wegwerf-Datenbank, nie gegen die laufende testen.**
**Vollsicherung vor jedem Live-Eingriff nach `backup/`.**
Struktur gehoert in die Kette, nicht in eine Migration —
`tools/migration-datenlogik-pruefen.mjs` bewacht das seit C-291.

**Wenn eine Vorgabe nicht aufgeht: melden, nicht passend machen.**
