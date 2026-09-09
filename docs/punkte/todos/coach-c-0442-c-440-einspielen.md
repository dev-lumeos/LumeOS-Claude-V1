---
nr: C-442
typ: feature
modul: coach
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-440
entscheidung: null
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
