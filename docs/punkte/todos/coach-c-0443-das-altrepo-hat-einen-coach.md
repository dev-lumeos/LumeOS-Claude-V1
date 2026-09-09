---
nr: C-443
typ: befund
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [coach.relationships]
zahlen:
  gemessen: 2026-09-08
  altrepo_dateien: 120
  spec_zeilen: 3291
---

# C-443 — das Altrepo hat einen Coach, und zwar einen groesseren

## Befund

Tom, 2026-09-08: *,,auch zu all dem coachzeugs konsolidiere die
specs und altes repo."*

`[cmd]` **Erste Messung des Orchestrators war FALSCH:** `git grep`
**fand null Treffer fuer `coach_clients`, `CoachClient`,
`AUTONOMY`.**

`[read]` **Der Grund: `referenz/lumeos-2026/` ist nicht
getrackt** ? **`git grep` sieht es nicht.**

`[cmd]` **Mit dem Dateisystem gemessen: 120 Dateien mit *coach* im
Namen.**

    apps/coach/               eine eigene App
    src/api/coach/            119 Dateien
    src/modules/coach/         52
    src/api/human-coach/       32
    src/modules/human-coach/   30
    src/components/coach/       9
    docs/modules/human-coach/   7

## Was dort steht und hier fehlt

`[cmd]` **Die groessten Dateien:**

    61 KB  specs/coach-buddy-killer-feature.md
    55 KB  src/api/coach/routes/buddy.ts
    53 KB  src/api/coach/utils/executionEngine.ts
    50 KB  src/api/human-coach/routes/coach-actions.ts
    49 KB  src/modules/human-coach/components/ProgramBuilder.tsx
    39 KB  src/api/coach/utils/buddyWatcher.ts
    39 KB  src/modules/human-coach/components/ClientDetail.tsx
    37 KB  docs/modules/human-coach/COMPONENTS.md

`[read]` **`executionEngine` und `buddyWatcher` sind der Kern:**
**das Altrepo hatte einen Coach, der Handlungen AUSFUEHRT und
Buddy ueberwacht.**

`[cmd]` **LumeOS heute: `coach.pending_actions`,
`bestaetige_aktion`, `lehne_aktion_ab`** ? **ein Vorschlag wird
bestaetigt oder abgelehnt, mehr nicht.**

## Die Spec-Seite

`[cmd]` **`docs/specs/HumanCoach/`: 12 Dateien, 3.291 Zeilen.**

    SPEC_07_API.md              417
    SPEC_06_DATABASE_SCHEMA.md  355
    SPEC_04_FEATURES.md         339
    SPEC_08_IMPORT_PIPELINE.md  340
    SPEC_11_UI_DESIGN.md        327
    SPEC_02_ENTITIES.md         325
    SPEC_09_SCORING.md          271

`[cmd]` **Und `00-SPEC-ABGLEICH.md` sagt heute: `coach` hat die
meisten Eintraege unter *,,Spec nennt, Schema hat nicht"*.**

## Was zu tun ist

`[read]` **Drei Fragen, in dieser Reihenfolge:**

**1 ? Was ist gebaut?** `[cmd]` **14 Tabellen im `coach`-Schema,
`00-MODULTABELLEN.md` nennt sie.**

**2 ? Was nennt die Spec, das fehlt?** `[cmd]`
**`00-SPEC-ABGLEICH.md` hat die Liste** ? **je Eintrag pruefen, ob
er ungebaut oder umbenannt ist.**

**3 ? Was kann das Altrepo, das die Spec nicht nennt?**

`[read]` **Das ist die eigentliche Arbeit** ? **`executionEngine`
und `buddyWatcher` stehen in keiner Spec-Datei, die der
Orchestrator gesehen hat.**

`[read]` **Struktur ja, Code nie** ? **und nachsehen, WARUM es
ersetzt wurde.**

## Warum es zaehlt

`[cmd]` **C-426: sieben von acht Autonomieachsen ohne
Erlaubnisliste.**

`[cmd]` **Das Altrepo hat `AUTONOMY_ARCHITECTURE.md` (444 Zeilen),
`AUTONOMY_QUICK_REFERENCE.md` (434),
`AUTONOMY_INTEGRATION_CHECKLIST.md` (503) und
`src/api/human-coach/routes/autonomy.ts` (404).**

`[read]` **Die Antwort auf C-426 liegt dort vermutlich vollstaendig
vor** ? **fuer EINE Achse, aber ausgearbeitet.**

## Die Oberflaeche, gemessen 2026-09-08

Tom: *,,die coach plattform war sehr weit ausgebaut, auch die ui ?
und wenn ich bei unserer variante reinschaue wird mir uebel."*

`[cmd]` **Der Vergleich:**

    Altrepo   78 Bauteile, 428 KB
      src/modules/human-coach/components   27 Dateien
      src/modules/coach/components         42
      src/components/coach                  9

    LumeOS    23 Dateien, 75 KB (apps/coach)

`[cmd]` **Die groessten dort:**

    49 KB  ProgramBuilder.tsx
    39 KB  ClientDetail.tsx
    35 KB  BuddyDashboard.tsx
    30 KB  CoachRuleBuilder.tsx
    27 KB  CoachDashboard.tsx
    26 KB  KnowledgeManager.tsx
    24 KB  CoachRoutineBuilder.tsx
    23 KB  EnhancedCoachDashboard.tsx
    15 KB  CoachOverridePanel.tsx
    12 KB  CoachAutonomyConfig.tsx

`[cmd]` **Die groessten hier:**

    11 KB  src/lib/daten.ts
    10 KB  src/app/athlet/[id]/page.tsx
     7 KB  tab-checkins.tsx
     4 KB  tab-uebersicht.tsx
     4 KB  tab-autonomie.tsx
     3 KB  tab-alerts.tsx
     3 KB  tab-athleten.tsx

`[read]` **Ein Coach-Portal, dessen groesste Oberflaeche 10 KB
hat** ? **gegen einen 49-KB-Programmbauer.**

`[cmd]` **Und `apps/web/v2/coach` traegt 378 KB, davon 83 KB
Mockup-Referenzen** ? **Attrappen, keine Funktion.**

## Was dort war und hier fehlt

`[read]` **Nach Dateinamen, nicht nach Inhalt gelesen** ? **das ist
der naechste Schritt:**

    ProgramBuilder        ein Programm bauen
    CoachRoutineBuilder   Routinen bauen
    CoachRuleBuilder      Regeln bauen -- 30 KB, und in
                          apps/coach/app nochmal
    KnowledgeManager      Wissen verwalten
    CoachOverridePanel    Buddy uebersteuern
    BuddyCommandCenter    Buddy steuern
    BuddyWatcher          Buddy ueberwachen (39 KB API)
    executionEngine       Handlungen ausfuehren (53 KB API)

`[cmd]` **LumeOS hat davon: `pending_actions` mit
`bestaetige_aktion` und `lehne_aktion_ab`.**

`[read]` **Ein Coach kann heute zustimmen oder ablehnen** ? **er
kann nichts bauen.**

## Die Reihenfolge, die daraus folgt

`[read]` **Nicht: eine Kachel nach der anderen anbinden.**

`[read]` **Sondern: lesen, was dort steht, und entscheiden, was
davon bleibt.**

`[cmd]` **`docs/modules/human-coach/COMPONENTS.md` im Altrepo, 37
KB** ? **die Bauteile sind dort beschrieben.**

`[read]` **Und `specs/coach-buddy-killer-feature.md`, 61 KB** ?
**der groesste Text im ganzen Altrepo.**
