---
nr: G-532
typ: befund
modul: goals
schwere: hoch
angelegt: 2026-09-29

braucht: []
kind_von: null

quellen:
  - apps/web/src/app/v2/goals/ansicht.tsx
  - apps/web/src/app/v2/goals/daten.ts
  - docs/punkte/00-INDEX.md

beruehrt:
  tabellen: []
  dateien:
    - apps/web/src/app/v2/goals/ansicht.tsx
    - apps/web/src/app/v2/goals/daten.ts
    - apps/web/src/app/v2/goals/tab-phase.tsx
    - apps/web/src/app/v2/goals/tab-physique.tsx

zahlen:
  gemessen: 2026-09-29
  unternavigationen: 10
  dateien_die_daten_ts_lesen: 8
  dateien_mit_echten_quellen: 3
  attrappenmarken: 47
  tab_phase_karten: 17
  tab_phase_marken: 17
---

# G-532 - zehn Unternavigationen, eine Datei mit echter Quelle

## Der Anlass

`[read]` **Tom, 2026-09-29:** *,,und du hast im blick dass die ui bisher
unbrauchbar ist fuer phase engine oder allgemeine alle subnavigationen
von goals noch weit weg von brauchbar sind"*.

`[read]` **Der Orchestrator hatte es NICHT im Blick** — er hat punktweise
gearbeitet (G-519 das Ratenfeld, G-520 die Anpassung) und nie das Modul
als Ganzes gemessen. **Dieser Punkt ist die fehlende Messung.**

## Die zehn Unternavigationen

`[cmd]` **Aus `ansicht.tsx:114-125` gelesen:**

    goals · phase · tdee · cross · timeline
    metrics · measure · comp · physique · poses

## Wo die Zahlen herkommen

`[cmd]` **Gemessen ueber alle 25 Dateien in
`apps/web/src/app/v2/goals/`:**

    liest echte Quellen              ansicht.tsx           57x echt.*
                                     tab-composition.tsx    1x echt.*
                                     fehlende-kacheln.tsx   1x echt.*
    ---------------------------------------------------------------
    liest daten.ts                   ansicht.tsx
    (die erfundenen Zahlen)          fehlende-kacheln.tsx
                                     kontext.tsx
                                     mockup-referenz.tsx
                                     modale.tsx
                                     phase-editor.tsx
                                     tab-phase.tsx
                                     tab-physique.tsx

`[cmd]` **Und `daten.ts:20` sagt es selbst:** *,,DIE ZAHLEN SIND
ERFUNDEN — mit einer Ausnahme, die zaehlt: die Composition-Kachel rechnet
Mifflin-St Jeor."*

`[read]` **Eine Datei haelt die Anbindung.** `ansicht.tsx` reicht `echt.*`
an die Reiter durch; alles andere, was rechnet, rechnet aus `daten.ts`.

## Der Phase-engine-Reiter ist vollstaendig Attrappe

`[cmd]` **`tab-phase.tsx`: 17 `<Card>`, 17 Attrappenmarken**
(14x `ATTRAPPE`, 3x `attrappeAus()`).

`[cmd]` **Und diese eine Datei rendert DREI Reiter:**
`GoalsPhaseView` (phase), `GoalsTDEEView` (tdee),
`GoalsCrossModuleView` (cross) — alle drei aus `GOAL_PHASES`,
`PHASE_STATE`, `TDEE_STATE`, `CONTRIBUTIONS`, `CONTRIB_WEIGHTS`.

`[read]` **Damit sind drei der zehn Unternavigationen in einer Datei
gebuendelt, die keine echte Quelle liest.** Tom hat mit ,,Phase engine"
den sichtbarsten Fall genannt; gemessen sind es drei.

`[cmd]` **`tab-physique.tsx`: 12 `<Card>`, 9 Marken**, liest
`CIRCUMFERENCES` und `POSE_SETS` aus `daten.ts`.

`[cmd]` **47 Attrappenmarken im Modul**, davon 16 in
`mockup-referenz.tsx` — die sind Absicht (G-365: die angebundenen Reiter
bekommen ihren Mockup-Reiter darunter).

## Was echt ist

`[cmd]` **Dateien ohne jede Marke und ohne `daten.ts`-Import:**

    phase-echt.tsx          5 Card   die Phase selbst (G-519)
    phase-setzen.tsx        3 Card   das Ratenfeld (G-519)
    physique-echt.tsx      12 Card
    tab-koerper.tsx         5 Card   metrics und measure
    tab-composition.tsx     4 Card   comp
    ziel-karten.tsx         5 Card   goals
    tdee-kopf.tsx           2 Card
    tab-timeline.tsx        1 Card

`[read]` **,,Keine Marke und kein `daten.ts`" ist noch kein Beweis fuer
echt** — die Bauteile bekommen ihre Werte als Eigenschaften von
`ansicht.tsx`, und ob die aus `echt.*` oder aus einer
`daten.ts`-Konstante stammen, entscheidet die Uebergabestelle.
**Das ist A1.**

`[cmd]` **Ein Gegenbeispiel steht schon fest:** `ansicht.tsx` importiert
selbst `ACTIVE_GOALS` und `COMPLETED_GOALS` aus `daten.ts`. **Die Datei
mit 57 echten Zugriffen liest auch erfundene Zahlen.**

## Nachweiszeilen

**A1** — **Je Reiter und je Kachel: welche Spalte speist sie?** Eine
Tabelle mit vier Spalten: Reiter, Kachel, Quelle (Tabelle.Spalte oder
`daten.ts`-Konstante), Marke ja/nein. **Der Anspruch ist Vollstaendigkeit,
nicht eine Stichprobe** — 25 Dateien und rund 130 `<Card>` sind endlich.
`docs/ssot/94-goals-mockup.md` haelt laut `daten.ts:24` schon einen Teil
der Zuordnung; **pruefend lesen, nicht uebernehmen.**

**A2** — **Die Marken gegen A1 halten.** Eine Kachel ohne Marke, die aus
`daten.ts` speist, ist ein Fehler derselben Art wie G-368
(Attrappenvermerke mit falschem Grund). **Jede Abweichung ist ein
Befund.**

**A3** — **Reihenfolge ableiten, nicht raten.** Aus A1 folgt, welche
Kacheln eine echte Quelle HABEN und nur nicht gelesen werden (billig),
welche auf eine gebaute, nicht eingespielte Struktur warten, und welche
gar keine Quelle haben. **Drei Klassen, drei verschiedene Auftraege.**

**A4** — **`tab-phase.tsx` traegt drei Reiter.** Zu entscheiden, nicht
anzunehmen: bleibt das so, oder bekommt jeder Reiter seine Datei wie
`phase-echt.tsx`? **Solange drei Reiter in einer Attrappendatei liegen,
kann keiner einzeln echt werden.**

**A5** — **Die Grenze zu G-515 und G-242 wahren.** G-515 haelt die acht
Zahlwiderspruech zwischen den drei Mockups, G-242 die Rechenwerke in
der Pro-Datei. **Dieser Punkt zaehlt Quellen, er bewertet keine Zahlen
und verschiebt keine Formeln.**

## Was dieser Punkt NICHT sagt

`[read]` **Nicht, dass die Attrappen falsch sind.** Sie tragen Marken mit
Quelle und Grund (E-68), und G-368 hat die falschen Gruende bereinigt.
**Eine markierte Attrappe ist eine ehrliche Luecke.**

`[read]` **Nicht, dass die Arbeit an G-519 und G-520 falsch aufgesetzt
war.** Die Phase brauchte ihre Spalte zuerst. **Was fehlt, ist die
Uebersicht, gegen die man die naechsten zehn Auftraege reiht** — und die
gab es bis heute nicht.
