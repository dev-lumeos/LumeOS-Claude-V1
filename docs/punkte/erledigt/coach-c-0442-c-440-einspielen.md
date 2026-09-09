---
nr: C-442
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-440
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 03e0bfe0
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
---

# C-442 — C-440 einspielen

## Befund

`[cmd]` **C-440 ist gebaut und gruen** ? **Vollkette 422,3 s,
`SCHEMA VOLLSTAENDIG`, 9 Zusicherungen.**

`[cmd]` **Nicht live: `coach.onboard_coach` gibt es auf `dev`
nicht.**

`[read]` **Erfasst, nicht beauftragt** ? **Codex arbeitet an
C-441.**

## Was einzuspielen ist

`[cmd]` **`supabase/migrations/20260909160000_c440_coach_onboarding.sql`**

`[cmd]` **Und der Seed:** **zwei historische Beziehungen verlieren
ihren Snapshot, eine behaelt ihn.**

`[read]` **Das ist eine Aenderung an bestehenden Zeilen** ?
**Sicherung vorher, wie immer.**

## Zu messen beim Einspielen

    A1  onboard_coach live, anon ohne EXECUTE
    A2  ein Profil angelegt, danach eine Einladung
    A3  die drei Seed-Beziehungen: 1 / 2 / 0
    A4  Sicherung: Pfad, Groesse, Pruefsumme
    A5  Punktelauf gruen

## Was danach offen bleibt

`[cmd]` **`SPEC_07:10` verlangt Coach-Rolle PLUS aktives Profil.**

`[cmd]` **Live: 0 Nutzer mit Coach-Rolle, 0 Funktionen mit
Rollenpruefung.**

`[cmd]` **`061_rollen_admin.sql:52`: Rollen werden bewusst nur
ausserhalb der Anwendung vergeben.**

`[read]` **Damit ist die halbe Bedingung unerfuellbar, solange
niemand eine Rolle setzt** ? **eigener Punkt, eigene
Entscheidung.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  onboard_coach live, anon ohne EXECUTE
    A2  Profil 0->1, Invite 0->1, nach ROLLBACK 0/0
    A3  1 benannte offene Einladung, 2 historische leer
    A4  Sicherung 27.105.760 B, SHA-256
    A5  Punktelauf gruen, 577 Punkte

`[cmd]` **Selbst gemessen: `onboard_coach` live, `coach_profiles`
0, `pending_invites` 0** ? **der Rollback war vollstaendig.**

### A3 — er hat nur die eine Zeile angefasst

> *,,Nur die fehlende offene Seed-Zeile wurde geaendert."*

`[read]` **Nicht der ganze Seed** ? **die zwei historischen
behalten ihren leeren Snapshot, wie in C-439 entschieden.**

`[read]` **Die Dreiteilung aus C-439 ist damit gebaut UND
eingespielt:** **eine offene Einladung traegt einen Namen, zwei
historische nicht.**

### Und beim Nachmessen ein Befund

`[cmd]` **Es gibt eine ZWEITE offene Einladung, ohne Namen:**

    28fe3790-...-c3f  invited  (leer)  2026-08-20

`[cmd]` **Und die Bedingung ist `NOT VALID`** ?
`convalidated = false`.

`[read]` **Sie greift nur bei neuen Zeilen** ? **die vom 20.08.
rutscht durch.**

`[read]` **Und sie ist offen: jemand koennte sie annehmen, und der
Coach haette keinen Namen.**

**Als C-449.**

### Die Rollenluecke blieb unberuehrt

`[cmd]` **`SPEC_07:10` verlangt Rolle PLUS Profil, live gibt es
null Rollen.**

`[read]` **Er hat sie nicht ueberfahren** ? **zum zweiten Mal, und
das ist die Haltung, die zaehlt.**

**Abgenommen.**
