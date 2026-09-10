# HumanCoach: alle zwoelf Specs gelesen

**2026-09-08, dritte Fassung.** Die ersten beiden waren falsch.

Tom: *,,du sollst jede dieser specs jeden buchstaben lesen und
verstehen."*

`[cmd]` **3.291 Zeilen, vollstaendig gelesen.**

---

## Was gilt, und was nicht

Tom, 2026-09-08: *,,kein toggle. die einen daten sind was der user
in human coach sieht, das andere was der coach in seinem portal
sieht. wir arbeiten jetzt nur am portal."*

`[read]` **`SPEC_11:14` (Role-Toggle) gilt NICHT.**

`[read]` **`SPEC_01:53` (Microservice-Ports `training:5200`) gilt
nicht** ? **LumeOS ist ein Monorepo mit Supabase.**

`[read]` **`SPEC_10:10` (`apps/coach` auf 8502) gilt nicht** ?
**es ist 3220.**

`[cmd]` **`SPEC_06:3-18` traegt eine eigene Warnung:** **die
`FOR ALL`-Policies haben ein INSERT-Leck, verbindlich ist
`00-konventionen.md` Paragraph 12.**

---

## Die Routen: SPEC_10:17 nennt sieben

    /              Dashboard
    /clients       Client-Liste
    /clients/:id   Client-Detail, MULTI-TAB
    /alerts        Alert-Verwaltung
    /rules         Rule Builder
    /programs      Program Builder + Library
    /analytics     Performance Analytics

`[cmd]` **`apps/coach` hat heute: `/`, `/athlet/[id]`, `/login`,
`/auth/*`.**

`[read]` **Vier der sieben fehlen als Route** ? **sie sind Reiter
mit `?tab=`.**

---

## Das Klientendetail: SIEBEN Tabs (SPEC_10:48)

    ClientOverviewTab   Status, Phase, Autonomy, Billing,
                        letzter Kontakt
    TrainingTab         Sessions, Volume, PRs, Kraftkurve
    NutritionTab        Makros, Adhaerenz, Mikronaehrstoffe
    RecoveryTab         Score-Trend, HRV, Schlaf, Muskelkarte
    SupplementsTab      Stack, Compliance-Trend, Interaktionen
    MedicalTab          Systemwerte, Bloodwork
                        NUR bei permission = full
    GoalsTab            Phase, TDEE, Fortschritt, Engpass
    ChatTab             Chat, Notizverlauf, Check-in-Antworten

`[cmd]` **Plus `PermissionLock`:** *,,Overlay wenn permission:
none ? erklaert, fordert nicht auf."*

`[read]` **Das ist eine Haltung, keine Technik:** **wo der Coach
nichts sehen darf, wird es erklaert, nicht angebettelt.**

---

## Der Dashboard-Mock (SPEC_05:174), Feld fuer Feld gemessen

    Feld                        Quelle                  Stand
    ---------------------------------------------------------
    Autonomy Level 2            coach.client_autonomy   4 Z
    Program PPL Woche 6/12      -                       FEHLT
    STATUS: ATTENTION           SPEC_09:13 berechnet    FEHLT
    Compliance Training 85%     adherence_summary       FEHLT
    Compliance Nutrition 65%    dito                    FEHLT
    Compliance Supplements 40%  dito                    FEHLT
    Compliance Recovery 62%     dito                    FEHLT
    Trend stable/declining      SPEC_09:80              FEHLT
    Recovery Trend 71->52       recovery.scores       370 Z
    Schlaf 5.9h                 recovery.checkins     370 Z
    Body Weight 82.3kg          goals.body_measurements 362 Z
    Bench PR 100kg              training.workout_sets 258 Z
    Bloodwork Hct/VitD/ALT      medical.lab_result_values 280 Z
    Offene Alerts (2)           coach.alerts            6 Z
    Letzte Nachricht            coach.messages          6 Z
    Naechster Check-In          coach.checkins          6 Z

`[read]` **Zehn von sechzehn Feldern haben Daten.**

`[read]` **Sechs fehlen, und sie haengen an DREI Sachen:**
**Programme, Adhaerenz-Zusammenfassung, Status-Berechnung.**

---

## Was die Formeln verlangen (SPEC_09)

`[cmd]` **Alle Algorithmen sind AUSGESCHRIEBEN, nicht
beschrieben:**

    calcClientStatus     Zeile 13
      critical wenn: critical-Alert > 0 ODER
                     adherence7d < 0.40 ODER recovery < 40
      attention wenn: high >= 2 ODER < 0.60 ODER < 55
      good wenn:      high >= 1 ODER < 0.75 ODER < 65
      sonst excellent

    calcRiskLevel        Zeile 35
    calcWeightedAdherence Zeile 59
      nutrition 0.35, training 0.35,
      recovery 0.20, supplements 0.10

    calcTrendDirection   Zeile 80
      lineare Regression, pctChange < 3 = stable

    recommendAutonomyLevel Zeile 110
      consistency 0.35, knowledge 0.25,
      selfCorrection 0.25, communication 0.15
      >= 0.90 -> 5, >= 0.75 -> 4,
      >= 0.60 -> 3, >= 0.40 -> 2, sonst 1

    evaluateCondition    Zeile 134  acht Operatoren
    calcCoachPerformanceScore Zeile 170
    priorityToSeverity   Zeile 190
    typeToPriority       Zeile 200  neun Typen

`[cmd]` **Und Zeile 239-269: Unit-Tests mit erwarteten Werten.**

`[read]` **`calcWeightedAdherence(0.5, 1, 1, 1)` muss 0.825
ergeben** ? **das ist pruefbar, nicht Auslegungssache.**

`[cmd]` **Ziel:** `packages/scoring/src/human-coach.ts`
(SPEC_09:9).

---

## Die zehn Regelvorlagen (SPEC_05:210)

    Protein Alert          protein_adherence < 70
                           UND training.session_today      MEDIUM
    Uebertraining          recovery.score_trend_down (7d)
                           UND training.volume_trend_up    HIGH
    Recovery Kritisch      recovery.score_7d_avg < 50      HIGH
    Schlaf-Alarm           sleep_hours < 6, 3+ Tage        MEDIUM
    Supplement Abfall      compliance < 50, 5+ Tage        MEDIUM
    Streak Achievement     consecutive_days >= 7           INFO
    Adherence Drop         daily_score_trend_down (5d)
                           UND unter 70                    MEDIUM
    Medical weiterleiten   medical.critical_flag = true    CRITICAL
    Missed Check-In        missed UND days_since > 3       LOW
    Inaktivitaet           days_since_last_session > 7     MEDIUM

`[read]` **Das ist der Seed fuer `coach_rule_templates`** ?
**fertig, mit Bedingung und Schweregrad.**

---

## Was in der Datenbank WIRKLICH fehlt

`[read]` **Die Tabellen heissen anders als in der Spec** ?
`coach_clients` **ist** `relationships`, `coach_messages` **ist**
`messages`. `[read]` **Das ist kein Fehlen.**

`[read]` **Und an drei Stellen ist LumeOS REICHER:**

`[cmd]` **`client_permissions`: je Modul ZWEI Achsen** ?
`*_visibility` **und** `*_auto_apply` **fuer sieben Module.**
**Die Spec kennt nur drei Stufen.**

`[cmd]` **`client_autonomy`: ACHT Achsen** ? **die Spec kennt
eine.**

`[cmd]` **`relationships`: der ganze Verlauf** ? `invited_by`,
`invite_note`, `withdrawn_at`, `withdraw_reason`,
`coach_display_name`.

### Es fehlen DREI Tabellen

    coach_rules                 der Regelbauer
    coach_rule_templates        die zehn Vorlagen oben
    client_adherence_summary    die taegliche Adhaerenz

### Und Spalten in zwei Tabellen

`[cmd]` **`coach_profiles`:** `bio`, `title`, `avatar_url`,
`certifications[]`, `specializations[]`, `years_experience`,
`phone`, `timezone`, `role` (vier Stufen), `max_clients`,
`current_client_count`, `working_hours`,
`notification_preferences`, `is_accepting_clients`,
`last_active_at`.

`[cmd]` **`alerts`:** `type` (neun Werte), `category`, `priority`
(1-5), `severity` (fuenf Stufen), `recommended_actions[]`,
`rule_id`, `confidence`, `false_positive`, `expires_at`,
`acknowledged_at`, `dismissal_reason`.

`[cmd]` **`relationships`:** `autonomy_level`,
`intervention_threshold`, `coach_notes` (privat), `tags[]`,
`hourly_rate`, `billing_cycle`, `satisfaction_rating`,
`goal_completion_rate`, `last_contact_at`.

---

## Und was ausserhalb von `coach` fehlt

`[cmd]` **Eine Programmtabelle in `training`** ? **`programs`,
`routines`, `plans`: keine davon existiert.**

`[cmd]` **`workout_sessions`, `workout_exercises`, `workout_sets`
sind Protokolle** ? **kein Platz fuer einen Plan.**

`[read]` **Das ist derselbe Befund wie C-452** ? **und es
blockiert `Program: PPL Woche 6/12` im Dashboard.**
