# HumanCoach: Spec gegen Live

**2026-09-08, BERICHTIGT.** Tom: *,,deine fehlliste ist absoluter
quatsch. wenn ich nur schon das im anhang anschaue, weiss ich dass
du mich anluegst."*

`[read]` **Er hat recht. Die erste Fassung dieser Datei war
falsch.**

---

## Was der Orchestrator falsch gemacht hat

`[read]` **Er hat Spec-Spaltennamen gegen Live-Spaltennamen
gehalten und JEDE Abweichung als *fehlt* gezaehlt** ? **ohne zu
pruefen, ob dieselbe Sache anders heisst.**

**Drei Beispiele:**

    Spec `content`      -> live heisst es `body`
    Spec `message`      -> live heisst es `detail`
    Spec `context_data` -> live heisst es `metric`

`[read]` **Daraus wurde *,,messages: 2 von 6"*** ? **eine Zahl, die
nichts misst.**

---

## Was live wirklich steht

    coach_profiles   id, user_id, display_name, email,
                     is_active, created_at, updated_at

    relationships    coach_id, client_id, status,
                     invited_by, invite_note,
                     started_at, ended_at, ended_by,
                     end_reason, withdrawn_at, withdrawn_by,
                     withdraw_reason, coach_display_name,
                     changed_by

    alerts           coach_id, client_id, module, title,
                     detail, metric, status, read_at,
                     done_at, created_by

    client_autonomy  nutrition_level, training_level,
                     recovery_level, goals_level,
                     supplements_level, medical_level,
                     buddy_level, safety_level,
                     coach_note, changed_by

    client_permissions  je Modul ZWEI Spalten:
                     *_visibility  und  *_auto_apply
                     fuer nutrition, training, recovery,
                     goals, supplements, medical, buddy
                     plus client_note, expires_at

    messages         coach_id, client_id, sender_id,
                     body, sent_at, read_at

    checkins         template_id, due_date, status,
                     auto_data, client_data, client_note,
                     coach_feedback, coach_notes,
                     submitted_at, reviewed_at

---

## Und wo LumeOS WEITER ist als die Spec

`[cmd]` **`client_permissions`: die Spec kennt drei Stufen
(`full | summary | none`).**

`[cmd]` **Live gibt es je Modul ZWEI Achsen:** **was der Coach
SIEHT (`visibility`) und ob seine Vorschlaege AUTOMATISCH
greifen (`auto_apply`).**

`[read]` **Das ist ein reicheres Modell** ? **die Spec hat es
nicht.**

`[cmd]` **`client_autonomy`: die Spec kennt EINE Stufe je
Beziehung.**

`[cmd]` **Live gibt es ACHT Achsen** ? **je Modul eine, plus
`safety_level`.**

`[read]` **Ebenfalls reicher** (C-71, C-435).

`[cmd]` **`relationships`: die Spec kennt `status` mit drei
Werten.**

`[cmd]` **Live gibt es den ganzen Verlauf** ? `invited_by`,
`invite_note`, `withdrawn_at`, `withdrawn_by`,
`withdraw_reason`, `end_reason`, `coach_display_name`
**als Snapshot.**

`[read]` **Der Orchestrator hat das als *,,3 von 19 Spalten"*
gemeldet.**

---

## Was WIRKLICH fehlt

`[cmd]` **Drei Tabellen, unter keinem Namen vorhanden:**

    coach_rules                 der Regelbauer
    coach_rule_templates        die zehn Systemvorlagen
                                aus SPEC_05, Abschnitt 8
    client_adherence_summary    die taegliche Adhaerenz

`[cmd]` **Und in `coach_profiles` fehlen die Profilfelder:**
`bio`, `certifications[]`, `specializations[]`, `max_clients`,
`role` **(vier Stufen).**

`[read]` **Das ist die ganze Liste** ? **nicht die fuenfzig
Spalten, die ich vorher gemeldet habe.**

---

## Was in dieser Datei NICHT mehr steht

`[read]` **Die *,,sechs offenen Fragen"* der ersten Fassung waren
groesstenteils Scheinwidersprueche:**

`[read]` **Drei Stufen gegen vier** ? **live gibt es ein anderes
Modell, das beide ueberholt.**

`[read]` **Eine Achse gegen acht** ? **live sind es acht, und das
ist entschieden** (C-71).

`[read]` **Die Microservice-Ports aus SPEC_01** ? **LumeOS ist ein
Monorepo, das ist bekannt und kein offener Punkt.**
