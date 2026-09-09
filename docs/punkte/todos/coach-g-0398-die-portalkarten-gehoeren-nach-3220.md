---
nr: G-398
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-391
entscheidung: null
beruehrt:
  dateien:
    - apps/coach/src/app/page.tsx
zahlen:
  gemessen: 2026-09-08
  reiter_3220: 9
  referenzen_3220: 0
---

# G-398 — die Portalkarten gehoeren nach 3220

## Befund

Tom, 2026-09-08:

> die coachplattform laeuft unter 127.0.0.1:3220, hier arbeitet der
> coach mit seinen users. `/v2/coach/human` ist der part, wo der
> user mit seinem coach arbeitet.

`[read]` **Der Orchestrator hat G-391 an die falsche Anwendung
gerichtet.**

`[cmd]` **Gemessen:**

    apps/web /v2/coach/human   die Klientensicht
                               "mein Coach", Rechte, Autonomie

    apps/coach  Port 3220      der Arbeitsplatz des Coaches
                               app/page.tsx 4,8 KB
                               app/athlet/[id]/page.tsx 10,2 KB
                               neun Reiter in components/

`[cmd]` **Und in `apps/coach`: NULL Mockup-Referenzen.**

## Was das fuer G-391 heisst

`[cmd]` **Die acht Vorlagen beschreiben ueberwiegend den
Arbeitsplatz:**

    PortalOverview, PortalAthletes, PortalPlans,
    PortalMessages, PortalRevenue, PortalAlerts,
    CoachPortalAnalytics, CoachPortalRules,
    CoachPortalAutonomy, CoachPortalSmartAlerts,
    CoachPortalTeam, PortalWorkflows,
    PortalClientOnboarding, PortalPrograms

`[cmd]` **Genau die 29, die Claude Code als `bekanntOffen`
uebersprungen hat** ? **weil das Werkzeug sagt: *,,gehoert zum
externen Arbeitsplatz."***

`[read]` **Das Werkzeug hatte recht** ? **aber der Schluss war
falsch.**

`[read]` **Sie sind nicht *offen und woanders*** ? **sie sind die
Aufgabe, nur in der anderen Anwendung.**

## Die neun Reiter, die es schon gibt

`[cmd]` **`apps/coach/src/components/`:**

    tab-uebersicht.tsx     4,4 KB
    tab-checkins.tsx       6,7 KB
    tab-autonomie.tsx      3,8 KB
    tab-consent.tsx        3,7 KB
    tab-alerts.tsx         2,9 KB
    tab-athleten.tsx       2,6 KB
    tab-nachrichten.tsx    2,4 KB
    tab-leer.tsx           2,1 KB
    tab-onboarding.tsx     1,6 KB

`[cmd]` **Zusammen 30 KB** ? **gegen 248 KB Vorlage.**

`[read]` **Und `tab-leer.tsx` sagt, was fehlt** ? **eine Kachel fuer
noch nicht Gebautes.**

## Was zu tun ist

`[read]` **Dasselbe wie G-391, aber in `apps/coach`:**

    je Vorlagenkarte  angebunden / baubar / blockiert
    die Referenz      unter der Linie, E-69
    nichts anbinden

`[cmd]` **Die drei strittigen aus G-397 loesen sich damit auch:**
`PatternAnalysisView`, `InterventionEngineView`,
`ConsentFlowView` ? **Reiter des Arbeitsplatzes, gehoeren nach
3220.**

`[read]` **Und was Claude Code in `/v2/coach/human` gebaut hat:**
**pruefen, ob es dorthin gehoert** ? **die zehn Karten waren die
ohne Gegenstueck, aber der Ort koennte falsch sein.**
