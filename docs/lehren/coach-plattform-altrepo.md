# Die Coaching-Plattform im Vorgaengerrepo

**Tom, 2026-09-08:** *,,du siehst das ausmass der coaching
plattform nicht, weder grafisch noch funktionell wie maechtig das
ist."*

`[read]` **Er hat recht. Dies ist die Messung.**

---

## In Zahlen

    src/api/coach              119 Dateien   1.130 KB
    src/modules/coach          42 Bauteile     354 KB
    src/api/human-coach         32 Dateien     377 KB
    src/modules/human-coach     30 Dateien     454 KB
    apps/coach                  40 Dateien     258 KB
    docs/modules/human-coach     7 Dateien     151 KB
    docs/modules/coach           7 Dateien      89 KB
    -----------------------------------------------
    zusammen                   277 Dateien   2.813 KB

`[cmd]` **LumeOS `apps/coach` heute: 23 Dateien, 75 KB.**

`[read]` **Faktor 37 in Dateien, Faktor 37 in Groesse.**

---

## Die App: 20 Routen mit Seitennavigation

`[cmd]` **`apps/coach/app/(portal)/`:**

    page.tsx          Dashboard
    clients/          Klienten + clients/[id]
    messages/         Nachrichten
    checkins/         Check-ins
    alerts/           Alerts
    programs/         Ernaehrung
    workouts/         Training
    feedback/         Feedback
    rules/            11 KB + CoachRuleBuilder 30 KB
    automations/      13 KB
    autonomy/         Autonomie
    analytics/        Auswertung
    knowledge/        Wissen
    ai/               KI
    buddy/            Buddy
    settings/         Einstellungen

`[cmd]` **Die Seitennavigation (`Sidebar.tsx`) traegt LIVE-ZAEHLER
in vier Gruppen:**

    Dashboard
    Kunden       Klienten (activeClients)
                 Nachrichten (unreadMsgs, warn wenn > 0)
                 Check-ins (pendingCheckins, warn)
                 Alerts (unreadAlerts, critical)
    Programme    Ernaehrung, Training, Feedback
    ...

`[cmd]` **Die Zahlen kommen aus `useCoachStats`, `useAlerts`,
`useAllThreads`** ? **drei Hooks, live.**

`[read]` **LumeOS hat sechzehn Reiter in einer Zeile, drei mit
Zaehler.**

---

## Die Bauteile: 72 in zwei Modulen

**`src/modules/human-coach/components/` ? 27 Stueck:**

    ProgramBuilder.tsx              49,6 KB
    ClientDetail.tsx                39,2
    BuddyDashboard.tsx              34,8
    CoachDashboard.tsx              27,1
    KnowledgeManager.tsx            25,8
    CoachRoutineBuilder.tsx         23,7
    EnhancedCoachDashboard.tsx      22,9
    CoachAI.tsx                     22,3
    BuddyOverview.tsx               15,8
    EnhancedProtocol.tsx            15,5
    DecisionsPanel.tsx              15,0
    CheckinList.tsx                 13,5
    CoachRuleBuilder.tsx            13,4
    AutomationManager.tsx           13,4
    ClientList.tsx                  13,1
    CoachRulesList.tsx              12,5
    RuleConditionBuilder.tsx        10,3
    CoachProfile.tsx                10,0
    AllClientsAdherenceOverview.tsx  9,5
    AnalyticsView.tsx                9,4
    ClientAdherenceDashboard.tsx     8,9
    MessagesView.tsx                 8,3
    AlertsPanel.tsx                  7,9
    RulePreview.tsx                  7,5
    AdherenceTrends.tsx              5,6
    PendingDecisionsWidget.tsx       4,2
    AdherenceCard.tsx                4,2

**`src/modules/coach/components/` ? 42 Stueck, darunter:**

    CoachRuleBuilder.tsx            27,9
    MyCoachView.tsx                 27,6
    ProgramDetail.tsx               20,9
    BuddyAvatar.tsx                 18,9
    MiniCommandCenter.tsx           16,6
    BuddyCommandCenter.tsx          15,8
    CoachOverridePanel.tsx          14,9
    BuddyFloatingWidget.tsx         12,5
    CoachAutonomyConfig.tsx         11,7
    ChatInterface.tsx               11,6
    CoachOnboarding.tsx             11,6

`[read]` **Drei Regelbauer, zwei Programmbauer, ein
Routinenbauer** ? **es war eine Werkstatt, kein Betrachter.**

---

## Der Kern: eine Ausfuehrungsmaschine

**`src/api/coach/` ? 119 Dateien, 1,1 MB:**

    routes/buddy.ts                 55,4 KB
    utils/executionEngine.ts        53,2
    server.ts                       47,3
    utils/buddyWatcher.ts           39,3
    utils/insights.ts               23,3
    utils/intelligentResponseGenerator.ts  22,9
    security/buddySecurity.ts       20,8
    engines/coaching-intelligence.ts 20,0
    routes/buddy-data.ts            19,3
    utils/actionExecutor.ts         18,8
    utils/multiUserBuddy.ts         18,2
    tests/action-handlers-e2e.test.ts  23,4

`[read]` **`executionEngine` und `actionExecutor` FUEHREN AUS.**
`[read]` **`buddyWatcher` ueberwacht.**
`[read]` **`buddySecurity` und `multiUserBuddy` trennen Nutzer.**
`[read]` **Und es gab e2e-Tests fuer die Handler.**

**`src/api/human-coach/` ? 32 Dateien, 377 KB:**

    routes/coach-actions.ts         50,4 KB
    routes/coach-ai.ts              39,8
    services/dashboard.ts           27,1
    routes/meal-plan-generator.ts   21,0
    routes/plan-templates.ts        20,8
    services/adherence.ts           20,8
    routes/checkins.ts              16,5
    routes/rules.ts                 15,6
    routes/alerting.ts              13,6
    routes/clients.ts               13,4
    routes/alerts.ts                13,4
    services/alertGenerator.ts      12,9

`[read]` **Ein Mahlzeitenplan-Erzeuger, ein Alarm-Erzeuger, ein
Adhaerenz-Dienst.**

---

## Was LumeOS davon hat

    pending_actions        bestaetige_aktion, lehne_aktion_ab
    client_permissions     22 Spalten
    client_autonomy        8 Achsen
    relationships          6 Zeilen
    coach_profiles         0 Zeilen

`[read]` **Ein Coach kann heute zustimmen oder ablehnen.**

`[read]` **Er kann kein Programm bauen, keine Regel anlegen, keine
Automatisierung einrichten, kein Wissen verwalten, keinen
Mahlzeitenplan erzeugen, keine Routine schreiben, keinen Klienten
im Detail sehen.**

---

## Warum der Orchestrator es nicht gesehen hat

`[cmd]` **`git grep` findet in `referenz/lumeos-2026/` NICHTS** ?
**das Verzeichnis ist nicht getrackt.**

`[read]` **Und die Auftraege haben KARTEN gezaehlt, nicht
Faehigkeiten.**

`[cmd]` **G-391: *,,62 Karten, 23 haben ein Gegenstueck"*.**
`[cmd]` **G-398: *,,44 Portalkarten, 14 angebunden"*.**

`[read]` **Beide Zahlen sind richtig und beide sagen nichts** ?
**eine Karte namens *Rules* neben einem 30-KB-Regelbauer ist keine
Entsprechung.**

---

## Wo man weiterliest

    docs/modules/human-coach/    7 Dateien, 151 KB
      API.md  COMPONENTS.md  DATABASE.md  FEATURES.md
      MIGRATION.md  README.md  RESEARCH.md

    docs/modules/coach/          7 Dateien,  89 KB
    specs/coach-buddy-killer-feature.md  1591 Zeilen
    AUTONOMY_ARCHITECTURE.md              444 Zeilen

`[read]` **`COMPONENTS.md` beschreibt die 72 Bauteile** ?
**37 KB, ungelesen.**
