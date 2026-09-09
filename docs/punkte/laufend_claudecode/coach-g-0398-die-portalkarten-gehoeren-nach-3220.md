---
nr: G-398
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-391
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
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

## Auftrag

Tom, 2026-09-08: *,,korrigier das und lass das komplett auf
127.0.0.1:3220 und das andere wieder wegmachen. mit allen ansichten
das komplette portal will ich morgen sehen ? mit schon angebundenen
sachen die schon vorhanden sind, und die mockups."*

**Beauftragt am 2026-09-08.**

### Was schon geschehen ist

`[cmd]` **`a5e8b344` ist zurueckgebaut** (`fbc73a07`) ?
**`/v2/coach/human` ist wieder wie vorher.**

`[read]` **Nichts davon war falsch gebaut** ? **es lag am falschen
Ort.**

### 1 · Die zwei Anwendungen

    apps/web /v2/coach/human   die KLIENTENSICHT
                               "mein Coach", Rechte, Autonomie
                               bleibt, wie sie ist

    apps/coach  Port 3220      der ARBEITSPLATZ des Coaches
                               hier ist die Arbeit

`[cmd]` **`apps/coach` hat heute neun Reiter, 30 KB, und NULL
Mockup-Referenzen.**

### 2 · Was gebaut werden soll

`[read]` **Das komplette Portal** ? **alle Ansichten, mit dem was
schon angebunden ist UND den Vorlagen daneben.**

`[cmd]` **Die Reiterliste steht in
`theme-v1/module-coach.jsx:923-940`:**

    overview   athletes   analytics   alerts
    rules      autonomy   patterns    intervene
    consent    plans      workflows   onboard
    programs   messages   revenue     team

`[cmd]` **Sechzehn Reiter.** `[cmd]` **`apps/coach` hat neun:**
uebersicht, athleten, checkins, autonomie, consent, alerts,
nachrichten, onboarding, leer.

`[read]` **Sieben fehlen ganz:** **analytics, rules, patterns,
intervene, plans, workflows, programs, revenue, team.**

### 3 · Je Reiter dieselbe Dreiteilung

    angebunden   was heute Daten zieht -- BLEIBT
    baubar       Tabelle da, Leseweg fehlt
    blockiert    keine Tabelle, und WELCHE fehlt

`[cmd]` **`docs/ssot/00-MODULTABELLEN.md`: 15 Coach-Tabellen, 55
Zeilen, 5 leer.**

`[read]` **Und die Mockup-Referenz unter der Linie, je Reiter** ?
**E-69, wie in `apps/web`.**

`[cmd]` **`apps/coach` hat das Muster noch nicht** ? **miss, ob
`MockupReferenz` aus `apps/web` wiederverwendbar ist oder ob es
eine eigene Fassung braucht.**

### 4 · Die acht Vorlagen

`[cmd]` **`docs/spezifikation/10-plattform/design-system/theme-v1/`:**

    module-coach.jsx                    61 KB
    module-coach-extras.jsx             48 KB
    module-coach-gaps.jsx               35 KB
    module-coach-athlete.jsx            31 KB
    module-coach-portal-v2.jsx          23 KB
    module-coach-portal-workflows.jsx   21 KB
    module-coach-programs.jsx           13 KB
    module-coach-meta.jsx               12 KB

`[read]` **Der Portalzweig ist der GROESSTE Teil davon** ?
**genau die 29, die du in G-391 als `bekanntOffen` uebersprungen
hast.**

`[read]` **Das war richtig gemessen und falsch geschlossen** ?
**sie sind nicht *woanders offen*, sie sind die Aufgabe.**

### 5 · Was das Altrepo dazu hat

    ProgramBuilder.tsx        49 KB   plans, programs
    CoachRuleBuilder.tsx      30 KB   rules
    KnowledgeManager.tsx      26 KB
    ClientDetail.tsx          39 KB   athletes
    CoachDashboard.tsx        27 KB   overview
    buddyWatcher.ts           39 KB   alerts, intervene

`[read]` **Melden, nicht uebernehmen** ? **Struktur ja, Code
nie.**

`[cmd]` **`docs/lehren/altrepo-karte.md` sagt, wo was liegt.**

### Abnahmebedingungen

    A1  sechzehn Reiter in apps/coach. Zahl: vorhanden /
        neu / je mit Namen.
    A2  je Reiter: angebunden / baubar / blockiert. Zahlen.
    A3  je blockierter Karte: WELCHE Tabelle fehlt.
    A4  die Mockup-Referenz unter der Linie, je Reiter.
        Zahl: Reiter / davon mit Linie.
    A5  was heute angebunden ist, bleibt es.
        Titel gegen Titel, nicht Zahl gegen Zahl.
    A6  E-72: keine nackte Null.
    A7  Bildschirmfotos: je Reiter eines, auf Port 3220.
    A8  je Karte: hat das Altrepo etwas dazu? Mit Datei.
    A9  1553 Tests bleiben gruen.

### Was nicht zu tun ist

**`apps/web` NICHT anfassen** ? **die Klientensicht bleibt.**
**Nichts anbinden, was heute nicht angebunden ist** ? **dieser
Auftrag zeigt, was es braucht.**
**Nichts in `packages/ui`** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-456.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **Port 3220 ist `apps/coach`** ? **Tom startet ihn.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
