# Coach-Portal: was fehlt

**Stand 2026-09-08, nach G-401.** Tom: *,,das ist ein anfang. da
fehlt aber noch tonnenweise zeugs."*

`[read]` **Er hat recht. Dies ist die Liste.**

---

## Was steht

`[cmd]` **`apps/coach/src`: 27 Dateien, 139 KB.**

`[cmd]` **Davon:**

    components/mockup-referenz.ts   25,9 KB   die 44 Vorlagenkarten
    components/feld-abgleich.ts     10,4 KB   die Messung
    lib/daten.ts                    11,6 KB   Lesewege
    app/athlet/[id]/page.tsx        10,3 KB
    app/page.tsx                     9,3 KB
    components/portal-schale.tsx     9,1 KB   NEU aus G-401
    components/portal-nav.ts         7,4 KB   NEU aus G-401

`[cmd]` **Die zehn Reiter zusammen: 956 Zeilen, 20 Karten.**

    tab-uebersicht      169 Zeilen   3 Karten
    tab-checkins        176          3
    tab-referenz        126          1
    tab-consent         100          2
    tab-autonomie        90          3
    tab-alerts           69          2
    tab-athleten         69          2
    tab-nachrichten      63          2
    tab-leer             50          1   <- bedient SIEBEN Reiter
    tab-onboarding       44          1

`[read]` **Sieben von sechzehn Bereichen zeigen `tab-leer`.**

---

## Was fehlt, gegen das Vorgaengerrepo

### Die Bauteile, die es nicht gibt

    ProgramBuilder.tsx        49,6 KB   Programme bauen
    ClientDetail.tsx          39,2      Klientendetail
    BuddyDashboard.tsx        34,8
    CoachDashboard.tsx        27,1      Uebersicht
    KnowledgeManager.tsx      25,8      Wissen
    CoachRoutineBuilder.tsx   23,7      Routinen
    CoachAI.tsx               22,3
    EnhancedProtocol.tsx      15,5
    DecisionsPanel.tsx        15,0
    CoachRuleBuilder.tsx      13,4      Regeln
    AutomationManager.tsx     13,4      Automatisierung
    ClientList.tsx            13,1
    RuleConditionBuilder.tsx  10,3
    CoachProfile.tsx          10,0
    AnalyticsView.tsx          9,4      Auswertung
    ClientAdherenceDashboard   8,9
    MessagesView.tsx           8,3      Nachrichten
    AlertsPanel.tsx            7,9
    AdherenceTrends.tsx        5,6

`[cmd]` **Plus 42 in `src/modules/coach/components/`** ?
`MyCoachView` 27,6 KB, `ProgramDetail` 20,9,
`CoachOverridePanel` 14,9, `CoachAutonomyConfig` 11,7.

`[read]` **LumeOS hat davon: nichts.**

### Der Kern, der ausfuehrt

    executionEngine.ts        53,2 KB
    buddyWatcher.ts           39,3
    actionExecutor.ts         18,8
    coach-actions.ts          50,4
    coach-ai.ts               39,8
    services/dashboard.ts     27,1
    services/adherence.ts     20,8
    meal-plan-generator.ts    21,0
    plan-templates.ts         20,8
    alertGenerator.ts         12,9

`[read]` **LumeOS hat: `bestaetige_aktion`, `lehne_aktion_ab`.**

---

## Die Reihenfolge, die daraus folgt

`[read]` **Nicht alles auf einmal. Je Bereich vollstaendig, in
dieser Reihenfolge:**

    1  Klienten      ClientList + ClientDetail
                     der Bereich, an dem ein Coach am
                     meisten arbeitet
                     -> braucht: nichts Neues in der DB

    2  Check-ins     CheckinList, Adherence
                     -> coach.checkins steht

    3  Alerts        AlertsPanel + alertGenerator
                     -> coach.alerts steht, der Erzeuger fehlt

    4  Nachrichten   MessagesView
                     -> messages-Tabelle FEHLT

    5  Regeln        CoachRuleBuilder, RuleConditionBuilder
                     -> coach.rules FEHLT

    6  Programme     ProgramBuilder, plan-templates
                     -> braucht training-Programmvorlagen
                        (C-452: fehlen auch dort)

    7  Auswertung    AnalyticsView, dashboard-Dienst
    8  Automatisierung  AutomationManager
    9  Wissen        KnowledgeManager
    10 Buddy         BuddyDashboard, buddyWatcher

`[read]` **Bereich 1 bis 3 gehen ohne neue Tabellen.**
`[read]` **Ab 4 braucht es Codex.**

---

## Was die Schale noch braucht

`[cmd]` **`cp-` steht noch an sechs Stellen im Quelltext** ?
`portal.css:52`, `referenz-trenner.tsx:4`, `tab-alerts.tsx:7`,
`tab-athleten.tsx:6`, `athlet/[id]/page.tsx:19`, `page.tsx:5`.

`[read]` **A3 hat *,,0 im DOM"* gemessen** ? **im Code sind sie
noch da.**

`[cmd]` **Und drei Doppelungen:** **Tokens, Referenz-Trenner,
Seitenleiste** ? **alle drei gehoeren nach `packages/ui`.**

`[cmd]` **Claude Codes Vorschlag:** `SidebarProps.gruppen` **und**
`marke` **einspeisbar machen.**

`[read]` **Sonst bleibt die 240-Zeilen-Kopie als dritte
Doppelung.**
