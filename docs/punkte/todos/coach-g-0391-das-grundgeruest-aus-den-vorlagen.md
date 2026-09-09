---
nr: G-391
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-443
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/coach/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  vorlagen: 8
  karten: 73
---

# G-391 — das Coach-Grundgeruest aus den Vorlagen

## Befund

Tom, 2026-09-08: *,,coach koennte man anhand unseren grafischen
vorlagen und dem alten repo zumindest das grundgeruest aufbauen.
wir haben die spec, die daten aus dem alten repo und
grafikvorlagen. dann wuerde man sehen, was es ueberhaupt
braucht."*

`[cmd]` **Gemessen: ACHT Coach-Vorlagen in
`docs/spezifikation/10-plattform/design-system/theme-v1/`,
248 KB, 73 Karten.**

    module-coach.jsx                    61 KB, 23 Karten
    module-coach-extras.jsx             48 KB, 10
    module-coach-gaps.jsx               35 KB, 14
    module-coach-athlete.jsx            31 KB, 10
    module-coach-portal-v2.jsx          23 KB,  6
    module-coach-portal-workflows.jsx   21 KB,  6
    module-coach-programs.jsx           13 KB,  4
    module-coach-meta.jsx               12 KB,  0

`[read]` **Der Orchestrator hat sie nie erwaehnt** ? **in keinem
Auftrag, in keiner Analyse.**

## Die drei Quellen decken sich

**Die Vorlagen nennen Karten, das Altrepo hat den Code dazu:**

    Rule canvas                  -> CoachRuleBuilder.tsx  30 KB
    Plan library, Programs,
    Delivery, Live assignment    -> ProgramBuilder.tsx    49 KB
    Adherence forecast,
    Risk indicators,
    Active interventions         -> buddyWatcher.ts       39 KB
    Permission matrix (3x),
    Consent log, Audit log       -> AutonomyLevelConfig,
                                    CoachOverridePanel
    The ladder,
    Athletes by autonomy level   -> AUTONOMY_ARCHITECTURE.md:165
    Coach efficiency,
    Business impact              -> research/b2b/  50 KB

`[read]` **Und die Spec hat 12 Dateien, 3.291 Zeilen** ?
`docs/specs/HumanCoach/`.

`[cmd]` **Drei Quellen, die dasselbe beschreiben** ? **und ein
Modul, das zu 69 Prozent aus Attrappen besteht.**

## Was heute steht

`[cmd]` **`apps/coach`: 23 Dateien, 75 KB, groesste Oberflaeche
10 KB.**

`[cmd]` **`apps/web/v2/coach`: 20 Dateien, 333 KB, 85 Karten,
davon 59 Attrappen.**

`[cmd]` **Die Datenbank: 15 Tabellen, 53 Zeilen, 5 leer** ?
`coach_profiles`, `pending_invites`, `pending_actions`,
`action_log`, `client_consent_log`.

`[read]` **Alle fuenf leeren sind Schreibziele.**

## Was der Auftrag ist

`[read]` **NICHT anbinden.** `[read]` **Das Geruest bauen, wie bei
den anderen Modulen** ? **Karten mit Attrappenvermerk, Referenz
unter der Linie, und je Karte die Frage: gibt es eine Quelle?**

`[read]` **Toms Satz ist der Zweck:** *,,dann wuerde man sehen,
was es ueberhaupt braucht."*

### Die Dreiteilung je Karte

    angebunden    eine Tabelle traegt sie
    baubar        Tabelle da, Leseweg fehlt
    blockiert     keine Tabelle -- und WELCHE fehlt

`[read]` **Der Injektionsplaner hat gezeigt, dass diese Dreiteilung
die eigentliche Arbeit ist** (G-388, A4).

### Zu lesen, in dieser Reihenfolge

    1  die acht Vorlagen        was gezeigt werden soll
    2  docs/specs/HumanCoach/   was gewollt ist, 12 Dateien
    3  referenz/lumeos-2026/
       docs/modules/human-coach/  sieben Dateien, 151 KB
       src/modules/human-coach/   30 Dateien, 454 KB
    4  docs/ssot/00-MODULTABELLEN.md  was existiert

`[cmd]` **`docs/lehren/altrepo-karte.md` sagt, wo was liegt.**

## Warum es jetzt zaehlt

`[read]` **Ein Geruest zeigt die Luecke, ein leerer Reiter nicht.**

`[cmd]` **Und die Zahlen daraus beantworten die offene Frage aus
C-443:** **was vom Altrepo bleibt und was nicht.**
