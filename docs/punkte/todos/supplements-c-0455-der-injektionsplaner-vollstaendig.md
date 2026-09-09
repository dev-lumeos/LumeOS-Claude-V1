---
nr: C-455
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-445
entscheidung: null
beruehrt:
  tabellen: [medical.injection_logs]
zahlen:
  gemessen: 2026-09-08
  fehlende_spalten: 17
  fehlende_tabellen: 1
---

# C-455 — der Injektionsplaner, vollstaendig

## Warum dieser Punkt

Tom, 2026-09-08: *,,bau fuer alles zuerst die grundlagen in der db
und nicht nur eine table, und dann fehlen dir beim anbinden weitere
zehn."*

`[read]` **C-441 und C-445 haben stueckweise nachgereicht.**
`[read]` **Dies ist die vollstaendige Liste, gegen die Spec
gemessen.**

## `injection_sites` — neun von dreizehn Spalten fehlen

`[cmd]` **`Injection Planner:27-46`:**

    vorhanden   id, route, display_name
    FEHLT       max_volume_ml       Hoechstmenge je Einstich
                rest_days           Ruhetage
                body_view           front | back
                x_pct, y_pct        Lage auf der Figur
                needle_gauge        z.B. 23G
                needle_length_in
                landmark_note       "2 cm lateral vom Nabel"
                difficulty          beginner | advanced
                is_active

`[read]` **`minimum_rest_days` ist NICHT `rest_days`** ? **C-441,
A2: E-57/C-385 erzwingt dort begruendetes NULL.**

`[read]` **Das ist zu entscheiden, nicht zu ueberschreiben.**

## `injection_logs` — sechs Spalten fehlen

`[cmd]` **`Injection Planner:80-101`:**

    FEHLT   substance_id      FK, verbindet mit dem Katalog
            dose_amount       Menge
            dose_unit         mg | IU | mcg | ml
            needle_gauge      wie tatsaechlich benutzt
            needle_length_in
            notes
            stack_item_id     FK, verbindet mit dem Stack

`[read]` **`stack_item_id` ist der wichtigste** ? **ohne ihn weiss
niemand, welcher Stack-Eintrag die Injektion geplant hat.**

`[cmd]` **Und Zeile 109:** *,,Computed on read from active stack
items where `route IN ('injection_im','injection_subq')"* ?
**genau dafuer.**

`[cmd]` **Indizes:** `(user_id, injected_at DESC)`,
`(user_id, site_id, injected_at DESC)`.

## `injection_site_overrides` — fehlt ganz

`[cmd]` **`Injection Planner:261`:**

    (user_id, site_id, max_volume_ml, rest_days,
     physician_note, set_by_coach_id, ...)

`[cmd]` **Live: 0 Tabellen.**

`[read]` **Bedingung laut Spec: aktive Medical-Coach-Beziehung mit
`full`-Sichtbarkeit auf Extended.**

`[cmd]` **Und der Eintrag erscheint im Medical-Auditlog.**

## Was NICHT als Tabelle gebaut wird

`[cmd]` **`injection_schedule`, Zeile 107-111:** *,,derived, not
stored ? no table needed."*

`[read]` **Aus aktiven Stack-Eintraegen berechnet** ? **nur
materialisieren, wenn die Geschwindigkeit es verlangt.**

## Die sieben Regeln aus 5.3

`[cmd]` **Drei sperren, vier warnen:**

    block   volume_limit         volume_ml > site.max_volume_ml
            rest_window          siteState = resting
            route_mismatch       substance.route != site.route
    warn    overuse_30d          >= 3 Einstiche in 30 Tagen
            advanced_site        difficulty = advanced,
                                 nicht zugestimmt
            complication_repeat  letzter Log hatte eine
            pain_trend           Mittel der letzten 3 >= 2

`[read]` **Sperren sind ueberschreibbar** ? **nur mit nichtleerem
`override_reason`, und die Ueberschreibung wird protokolliert.**

`[cmd]` **`advanced_site` braucht `difficulty`** ? **fehlt.**
`[cmd]` **`volume_limit` braucht `max_volume_ml`** ? **fehlt.**

`[read]` **Vier der sieben Regeln sind heute nicht rechenbar.**

## Der Widerspruch, den Tom entscheiden muss

`[cmd]` **`Injection Planner:363`:**

> *,,No user-created custom sites ? the 16 seeded sites cover
> standard practice."*

Tom, 2026-09-08: *,,ja wir kennen die ueblichen einstichstellen,
das heisst aber nicht dass ein user nicht andere waehlen kann.
wenn er triceps waehlt weil er lokal ein tendonproblem hat, dann
zeigen wir den triceps."*

`[read]` **Die Spec sagt nein, Tom sagt ja.**

`[cmd]` **Und BPC-157 an der Problemstelle ist derselbe Fall**
(C-453).

`[read]` **Das ist zu entscheiden, BEVOR gebaut wird** ? **es
aendert, ob `injection_sites` eine `user_id` braucht und ob die 16
eine geschlossene Liste sind.**

`[read]` **Und ebenso: C-454** ? **die Ebene *,,welche Punkte hat
dieser Nutzer fuer diese Substanz gewaehlt"* fehlt vollstaendig.**

## Die Reihenfolge

    1  Tom entscheidet: eigene Orte ja oder nein
    2  injection_sites vervollstaendigen
    3  injection_logs vervollstaendigen
    4  injection_site_overrides anlegen
    5  die Nutzerauswahl aus C-454
    6  DANN die Regeln aus 5.3
    7  DANN die Oberflaeche

`[read]` **Punkt 7 ist G-396 und wartet.**
