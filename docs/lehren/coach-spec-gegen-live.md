# HumanCoach: die Spec gegen den Live-Stand

**2026-09-08, alle zwoelf Spec-Dateien gelesen.** Tom: *,,lies die
komplette dokumentation und dann sag mir was noch unklar ist."*

`[cmd]` **`docs/specs/HumanCoach/`, 3.291 Zeilen.**

---

## Was Tom entschieden hat

Tom, 2026-09-08: *,,kein toggle. die einen daten sind was der user
in human coach sieht, und das andere was der coach in seinem
portal sieht. wir arbeiten jetzt nur am portal."*

`[read]` **`SPEC_11:14` nennt einen Role-Toggle** ? **das gilt
NICHT.**

    apps/web /v2/coach/human   was der Nutzer sieht
    apps/coach auf 3220        was der Coach sieht

`[read]` **Zwei Anwendungen, kein Umschalter.**

---

## Die Tabellen: andere Namen, teils da

    Spec                        LIVE                    Spalten
    ----------------------------------------------------------
    coach_profiles          ->  coach_profiles           4/19
    coach_clients           ->  relationships            3/19
    coach_client_permissions -> client_permissions      22 Sp
    coach_alerts            ->  alerts                   5/23
    client_autonomy_levels  ->  client_autonomy          2/16
    client_autonomy_history ->  autonomy_change_log      9 Sp
    coach_messages          ->  messages                 2/6

    FEHLEN GANZ
    coach_rules                 -
    coach_rule_templates        -
    client_adherence_summary    -

`[read]` **Die Namen weichen ab, weil LumeOS im Schema `coach`
liegt** ? `coach.relationships` **statt** `coach_clients`.

`[read]` **Aber die SPALTEN fehlen wirklich.**

### `coach_profiles`: 4 von 19

`[cmd]` **Da: `user_id`, `display_name`, `email`, `is_active`.**

`[cmd]` **Fehlt:** `title`, `bio`, `avatar_url`, `certifications[]`,
`specializations[]`, `years_experience`, `phone`, `timezone`,
`role` (vier Stufen), `max_clients`, `current_client_count`,
`working_hours`, `notification_preferences`,
`is_accepting_clients`, `last_active_at`.

`[read]` **`role` ist der wichtigste:** `trainee_coach | coach |
senior_coach | head_coach` ? **das ist die Team-Matrix aus
SPEC_11.**

### `relationships`: 3 von 19

`[cmd]` **Fehlt:** `is_active`, `assignment_type`,
`coaching_style`, `communication_frequency`, `start_date`,
`end_date`, `billing_cycle`, `hourly_rate`, `autonomy_level`,
`intervention_threshold`, `alert_preferences`, `coach_notes`,
`tags[]`, `satisfaction_rating`, `goal_completion_rate`,
`last_contact_at`.

`[read]` **`coach_notes` ist privat** ? **der Klient sieht sie
nicht** (SPEC_02:90).

### `alerts`: 5 von 23

`[cmd]` **Fehlt u.a.:** `type` (neun Werte), `category`,
`priority` (1-5), `severity` (fuenf Stufen), `context_data`,
`recommended_actions[]`, `rule_id`, `confidence`,
`false_positive`.

`[read]` **Genau das, was Claude Code in G-402 fuer den Erzeuger
verlangt hat** ? **es steht seit Mai in SPEC_02:124.**

### `client_autonomy`: 2 von 16

`[cmd]` **Fehlt:** `current_level`, `level_name`, die vier
Bewertungen (`consistency`, `knowledge`, `self_correction`,
`communication`), `overall_score`, `check_in_frequency`,
`intervention_threshold`, `next_assessment_date`,
`regression_risk`.

`[read]` **C-426 fragte nach der Erlaubnisliste** ? **die Spec hat
stattdessen BEWERTUNGEN, aus denen sich die Stufe ergibt.**

### `messages`: 2 von 6

`[cmd]` **Fehlt:** `coach_client_id`, `content`, `message_type`
(fuenf Werte), `attachment_url`.

---

## Was in SPEC_06 als Warnung steht

`[cmd]` **Zeile 3-18, ein Kasten:**

> *,,Die `FOR ALL`-Policies in dieser Datei tragen ein INSERT-Leck
> und duerfen nicht uebernommen werden. Beim INSERT wertet Postgres
> `USING` nicht aus ? dafuer ist `WITH CHECK` da."*

`[cmd]` **17 solche Policies in 6 Dateien, keine mit
`WITH CHECK`.**

`[read]` **Verbindlich ist stattdessen
`docs/spezifikation/10-plattform/konventionen/00-konventionen.md`
Paragraph 12.**

`[read]` **Wer SPEC_06 abschreibt, baut das Leck nach.**

---

## Was SPEC_01 als Grenzen setzt

`[cmd]` **Zeile 18-23, sechs Prinzipien:**

    Client-Ownership   alle Daten gehoeren dem Klienten
    Read-only Coach    der Coach schreibt NIE direkt,
                       er schlaegt vor
    Permission-First   jeder Abruf prueft, keine Ausnahme
    Medical = sensitiv Vorgabe `none`, explizite Freigabe
    Schema-Isolation   Schema `coach`, Klientendaten nur
                       ueber die Permission-API,
                       NIE via direktem JOIN
    GDPR               Consent-Log, Widerruf jederzeit

`[cmd]` **Und Zeile 101-104: Human Coach BESITZT NICHT:**
**Nutzerdaten anderer Module, KI-Empfehlungen (das ist Buddy),
Bezahlung (das ist Marketplace).**

`[read]` **Die Zugriffsstufen sind DREI** (`full | summary |
none`) ? **SPEC_11:81 nennt VIER (`full | shared | summary |
off`).**

`[read]` **Das ist ein Widerspruch in der Spec selbst.**

---

## Was ich nach dem Lesen noch nicht weiss

**1** ? **Die Zugriffsstufen: drei oder vier?**

`[cmd]` **SPEC_01:30 und SPEC_02:112: `full | summary | none`.**
`[cmd]` **SPEC_11:81: `full | shared | summary | off`.**
`[cmd]` **LIVE: `client_permissions` hat 22 Spalten** ? **eine je
Modul und Unterbereich, keine Stufenliste.**

**2** ? **Die Autonomiestufen: Namen und Zahl.**

`[cmd]` **SPEC_02:203: `Novice | Developing | Intermediate |
Advanced | Expert`.**
`[cmd]` **SPEC_11:226: `Novice | Beginner | Intermediate |
Advanced | Expert`.**
`[cmd]` **Altrepo `AUTONOMY_ARCHITECTURE.md`: `Supervised |
Guided | Collaborative | Adaptive | Autonomous`.**

`[read]` **Drei Quellen, drei Namenslisten.**

**3** ? **Eine Achse oder acht?**

`[cmd]` **Die Spec: EINE `autonomy_level` je Beziehung, 1-5.**
`[cmd]` **LIVE: `client_autonomy` mit ACHT Achsen** (C-71).

`[read]` **Das ist keine Abweichung im Detail** ? **es ist ein
anderes Modell.**

**4** ? **Der Program Builder: was darf er?**

`[cmd]` **SPEC_01:99: *,,Program Builder (aber: Assignment =
Vorschlag, Client bestaetigt)"*.**
`[cmd]` **SPEC_11:279: Plans-Bibliothek mit Sold-Count und
Marketplace-Import.**

`[read]` **Verkaufen und Vorschlagen sind zwei Sachen** ? **und
Marketplace besitzt die Bezahlung (SPEC_01:104).**

**5** ? **Die Ziel-Endpunkte.**

`[cmd]` **SPEC_01:53: `POST http://training:5200/api/training/routines`.**

`[read]` **Das ist eine Microservice-Architektur mit Ports** ?
**LumeOS ist ein Monorepo mit Supabase.**

`[read]` **Miss, was davon uebersetzbar ist** ? **oder ob die
Endpunkte durch RPCs ersetzt werden.**

**6** ? **`coach_rules`: JSONB oder Tabellen?**

`[cmd]` **SPEC_02:175: `conditions JSONB`, `actions JSONB`.**
`[cmd]` **SPEC_11:203: ein visueller Bauer mit `WhenBlock`,
`OnlyIfBlock`, `ThenBlock`.**

`[read]` **Ein Bauer, der JSONB schreibt, ist machbar** ? **aber
dann kann niemand nach Regeln suchen, die ein bestimmtes Modul
betreffen.**
