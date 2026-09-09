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
erledigt: 2026-09-08
commit: 91181203
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

### Vorab: zwei Praemissen des Auftrags stimmten nicht mehr

**1 ? Die sechzehn Reiter gibt es schon.**

`[cmd]` **`apps/coach/src/app/page.tsx:20-37` fuehrt alle sechzehn**,
in der Reihenfolge der Vorlage. `[cmd]` **Am Schirm gemessen: alle
sechzehn erreichbar**, keiner fehlt.

`[read]` **Der Auftrag nennt neun** ? **das sind die neun
Komponenten-DATEIEN** in `components/`. **Die uebrigen sieben Reiter
rendern `TabLeer`**, mit je einem Grund. `[read]` **Neun Dateien,
sechzehn Reiter** ? gezaehlt wurde die Datei, gemeint war der Reiter.

**2 ? Der Testbestand ist 1545, nicht 1553.**

`[cmd]` **`fbc73a07` hat die acht Waechter aus G-391 mit
zurueckgebaut** ? sie standen in der Datei, die der Revert entfernt
hat (`__tests__/mockup-referenz-portal.test.ts`, 169 Zeilen).
`[read]` **Die 1553 im Auftrag ist der Stand VOR dem Ruecknahme.**

### A1 ? Sechzehn Reiter, alle vorhanden

    vorhanden mit eigener Komponente   8   overview, athletes, alerts,
                                           autonomy, consent, workflows,
                                           onboard, messages
    vorhanden als begruendeter Leer-   8   analytics, rules, patterns,
    zustand (TabLeer)                      intervene, plans, programs,
                                           revenue, team
    ------------------------------------
    neu anzulegen                      0

`[read]` **Nichts neu angelegt** ? es gab nichts anzulegen.
`[cmd]` **Was fehlte, war die Referenz:** null Mockup-Karten auf
3220, gemessen ueber alle sechzehn Reiter.

### A2 ? Je Reiter die Dreiteilung

    Reiter      Karten  angebunden  baubar  blockiert
    overview        3        1         1        1
    athletes        1        1         0        0
    analytics       3        1         0        2
    alerts          3        3         0        0
    rules           5        0         0        5
    autonomy        1        1         0        0
    patterns        4        2         0        2
    intervene       1        1         0        0
    consent         1        0         1        0
    plans           1        0         0        1
    workflows       3        0         0        3
    onboard         3        1         1        1
    programs        5        0         0        5
    messages        1        1         0        0
    revenue         2        0         0        2
    team            7        2         0        5
    ---------------------------------------------
    SUMME          44       14         3       27

`[cmd]` **Woher die 44 kommen:** die acht Vorlagen tragen **62 Karten
mit Namen** (`<Card|CMod … title=`), **44 davon gehoeren einem
Portalreiter**. `[cmd]` **Die Zuordnung Reiter -> Komponente steht in
`module-coach.jsx:941-957`** ? abgelesen, nicht geraten. **Die
uebrigen 18 sind Klientensicht** (`AthleteOverview`,
`AthleteAutonomy`, …) und stehen in `apps/web`.

`[cmd]` **Die Grenze zwischen *angebunden* und *baubar* ist
gemessen:** `lib/daten.ts` liest **zwoelf der fuenfzehn**
Coach-Tabellen ? elf direkt, `relationships` ueber die Funktion
`klienten()`. **Ungelesen: `client_consent_log`, `coach_profiles`,
`pending_invites`** ? genau die drei leeren.

`[cmd]` **Die Datenbank, gemessen 2026-09-09: 15 Tabellen, 58 Zeilen,
3 leer.** `[read]` **Der Auftrag nennt 55 und 5** ? die Zahl ist
gewandert, seit er geschrieben wurde.

#### Drei Einstufungen hat der Waechter berichtigt

`[read]` **Und das ist der Punkt einer Probe, die die Sache misst.**

    Athletes needing attention   baubar -> angebunden
      `coach.alerts` STEHT im Leseweg (daten.ts, elfte Abfrage).
      Der Reiter "Alerts" zeigt sie heute schon.

    Athletendetail (Modal)       baubar -> angebunden
      Alle drei Tabellen werden gelesen, und `/athlet/[id]` zeigt
      sie. Die Daten fehlen nicht -- die Bauform ist eine andere,
      Seite statt Fenster.

    Today's sessions logged      Tabellenliste geschaerft
      Ich hatte `coach.relationships` mitgenannt; sie wird gelesen
      und haette die Karte faelschlich als angebunden ausgewiesen.
      Tragend ist `training.workout_sessions` -- und die liest das
      Portal nur JE ATHLET (`.eq('user_id', clientId)`), nicht ueber
      alle Klienten eines Tages.

`[read]` **Der Unterschied liegt im Filter, nicht im Tabellennamen**
? und den kann ein Namensvergleich nicht sehen. **Deshalb steht die
Ausnahme benannt im Waechter**, mit einer zweiten Zusicherung, die
faellt, wenn jemand den Filter entfernt.

### A3 ? Je blockierter Karte die fehlende Tabelle

**27 Karten, elf verschiedene Gruende ? keine ohne:**

     5x  keine Tabelle fuer Programme
     4x  keine Tabelle fuer Coach-Regeln
     4x  keine Tabelle fuer Ablaeufe
     4x  keine Tabelle fuer Coach-Teams
     3x  keine Tabelle fuer Umsatz
     2x  keine Tabelle fuer Coach-Einstellungen
     1x  keine Tabelle fuer Plaene
     1x  keine Tabelle fuer Vorhersagen
     1x  keine Tabelle fuer Lebensereignisse
     1x  keine Tabelle fuer Erfolge oder Meilensteine
     1x  keine Tabelle fuer Zeit oder Aufwand je Coach

`[cmd]` **Ein Waechter prueft, dass jede blockierte Karte einen Grund
traegt und KEINE Tabelle nennt** ? und umgekehrt, dass jede
angebundene oder baubare Karte Tabellen nennt und nichts Fehlendes.
**Beides zugleich waere ein Widerspruch.**

#### Zwei Gegenproben zu „es gibt keine Tabelle"

`[read]` **Eine Abwesenheitszusage kippt still** ? also im ganzen
Schema gesucht, nicht nur in `coach`:

`[cmd]` **`wissen.rule_engine_rules` gibt es (64 Zeilen)** ? **das
sind aber Substanz-Wechselwirkungen** (`substance_ids`, `effect`),
keine Coach-Automatisierung. **Gleicher Name, andere Sache**, und der
Vermerk sagt das ausdruecklich.

`[cmd]` **`medical.health_events` gibt es** ? **traegt aber
medizinische Ereignisse**, nicht Urlaub oder Umzug. Fuer „Event
impact analysis" fehlt weiterhin die Tabelle.

### A4 ? Die Mockup-Referenz unter der Linie

`[cmd]` **Am Schirm gemessen, alle sechzehn Reiter, vorher gegen
nachher:**

    Reiter mit Trennlinie      0 -> 16
    Karten unter der Linie     0 -> 44
    Karten ueber der Linie    27 -> 27

`[cmd]` **Bildschirmfotos je Reiter: `backup/g398-<reiter>.png`**,
sechzehn Stueck (A7).

#### Der Trenner ist eine eigene Fassung ? gemessen, warum

**Der Auftrag fragt es ausdruecklich.**

`[cmd]` **`apps/web/src/components/shell/referenz-trenner.tsx` haengt
an genau EINEM Baustein:** `import { Pill } from '@lumeos/ui'`.
`[cmd]` **Den hat `apps/coach` auch** (`layout.tsx:3`), samt der
v2-Klassen ? das Portal nutzt `v2-eyebrow` und `v2-pill` schon.
**Technisch waere er wiederverwendbar.**

`[cmd]` **Aber die Datei liegt in `apps/web/src/`, nicht in
`packages/`.** `[cmd]` **`apps/coach/tsconfig.json` loest `@/*` auf
`./src/*` und `@lumeos/*` auf `packages/*`** ? **fuer `apps/web` gibt
es keinen Alias.** `[read]` **Einen anzulegen hiesse, zwei
Anwendungen aneinanderzubinden, die sonst nur ueber `packages/`
verbunden sind.**

`[read]` **Also eine eigene Fassung, 30 Zeilen** ? **mit DERSELBEN
Marke `data-referenz-trenner`.** `[cmd]` **Die Marke ist der
Messpunkt**, nicht das Wort „Mockup-Referenz": wer beide Anwendungen
misst, braucht nur einen Selektor.

`[read]` **Der richtige Ort waere `packages/ui`** ? dann haetten
beide Anwendungen einen Baustein statt zwei. **Das verbietet der
Auftrag**, also steht es hier: **ein Punkt fuer spaeter.**

### A5 ? Was angebunden war, ist es geblieben

`[cmd]` **Titel gegen Titel gemessen, nicht Zahl gegen Zahl:**

    overview    3 -> 3   Anstehende Arbeit | Athleten | Offene Vorschlaege
    athletes    1 -> 1   Athleten
    analytics   1 -> 1   Analytics (Leerzustand)
    alerts      1 -> 1   Alerts
    rules       1 -> 1   Rules (Leerzustand)
    autonomy    3 -> 3   Max Schmidt | dev | Historie
    patterns    1 -> 1   Patterns (Leerzustand)
    intervene   1 -> 1   Interventions (Leerzustand)
    consent     3 -> 3   Freigaben je Athlet | Rechte- | Beziehungs-Historie
    plans       1 -> 1   Plans (Leerzustand)
    workflows   4 -> 4   drei Check-ins + Anlegen
    onboard     1 -> 1   Onboarding
    programs    1 -> 1   Programs (Leerzustand)
    messages    3 -> 3   dev | Max Schmidt | Sarah Johnson
    revenue     1 -> 1   Revenue (Leerzustand)
    team        1 -> 1   Team & Audit (Leerzustand)
    ----------------------------------------------------
    SUMME      27 -> 27

`[read]` **Keine Kachel verschoben, keine ersetzt, keine
angebunden.** **Die Referenz kommt darunter, nicht davor.**

### A6 ? E-72: keine nackte Null

`[cmd]` **Am Schirm gemessen, alle sechzehn Reiter, vorher UND
nachher: 0 nackte Nullen.** `[cmd]` **0 Konsolenfehler.**

`[read]` **Gezaehlt wurde jede `.v2-num` mit dem Inhalt `0`, deren
Karte kein benennendes Wort traegt** („kein", „leer", „noch",
„nicht", „ohne"). `[cmd]` **Die Zaehler in der Reiterleiste zeigen
eine Zahl nur, wenn sie groesser null ist** (`page.tsx:99`) ? eine
Null erscheint dort gar nicht erst.

### A7 ? Sechzehn Bildschirmfotos

    backup/g398-overview.png    1148 px    backup/g398-consent.png     1634 px
    backup/g398-athletes.png     622 px    backup/g398-plans.png        641 px
    backup/g398-analytics.png    957 px    backup/g398-workflows.png   2122 px
    backup/g398-alerts.png       961 px    backup/g398-onboard.png     1070 px
    backup/g398-rules.png       1247 px    backup/g398-programs.png    1131 px
    backup/g398-autonomy.png    1766 px    backup/g398-messages.png     890 px
    backup/g398-patterns.png    1192 px    backup/g398-revenue.png      804 px
    backup/g398-intervene.png    641 px    backup/g398-team.png        1376 px

`[cmd]` **Alle auf Port 3220, angemeldet als `coach@lumeos.app`**
(drei Klienten). `[read]` **`test-user` fuehrt keine
Coach-Beziehung** und saehe nur die Absage ? das Portal laesst nur
herein, wer mindestens einen Klienten hat (`page.tsx:63`).

`[cmd]` **Das Passwort steht in `docs/todo/TODO.md:775`** und im Seed
`supabase/_pipeline/_testdaten/coach-portal-fuellen.sql`. `[cmd]`
**`coach.seed@example.com` hat KEIN Passwort** (`encrypted_password`
leer) ? mit ihm waere kein Nachweis moeglich gewesen.

### A8 ? Was das Altrepo dazu hat

**Alle sieben genannten Dateien liegen vor, Groessen nachgemessen:**

    ProgramBuilder.tsx        49.635 B    6 Karten  (plans, programs)
    ClientDetail.tsx          38.249 B    1 Karte   (athletes)
    buddyWatcher.ts           36.957 B    6 Karten  (alerts, intervene,
                                                     patterns, overview)
    CoachDashboard.tsx        33.499 B    2 Karten  (overview)
    CoachRuleBuilder.tsx      27.865 B    4 Karten  (rules)
    CoachOverridePanel.tsx    14.879 B    1 Karte   (consent)
    AutonomyLevelConfig.tsx   10.736 B    2 Karten  (autonomy, onboard)
    research/b2b/             51.720 B    4 Karten  (analytics, revenue)
    AUTONOMY_ARCHITECTURE.md:165          1 Karte   (autonomy)

`[cmd]` **Zwei Groessen weichen vom Auftrag ab:** `CoachDashboard`
ist **33 KB, nicht 27**, `ClientDetail` **38 KB, nicht 39**. **Die
gemessenen stehen in der Referenz.**

**18 der 44 Karten haben nichts im Altrepo.** `[read]` **Das ist
selbst eine Aussage** ? wo nichts liegt, ist auch nichts zu
portieren.

### A9 ? Tests

`[cmd]` **`apps/web`: 1545 pass / 0 fail** ? **unveraendert, keine
Datei angefasst.** `[cmd]` **`apps/coach`: 13 pass / 0 fail** ? neun
neue Waechter (vorher vier). `[cmd]` **tsc sauber.**

`[read]` **Die 1553 des Auftrags ist der Stand vor `fbc73a07`** ?
der Revert hat die acht G-391-Waechter mit entfernt.

**Sabotageprobe, je Waechter einzeln:**

    ein Reiter aus der Referenz entfernt   -> ROT
    eine Karte wirklich entfernt           -> ROT
    blockiert ohne fehlende Tabelle        -> ROT
    erfundene Tabelle im Vermerk           -> ROT
    angebunden ohne Leseweg                -> ROT
    Marke am Trenner entfernt              -> ROT
    Trennlinie aus der Referenz entfernt   -> ROT
    Leseweg der Klienten entfernt          -> ROT
    Fundstelle in der Vorlage verschoben   -> ROT

**Alle zurueckgenommen, 13/13 gruen.**

`[cmd]` **Zwei erste Sabotageversuche liefen ins Leere** ? ein
umbenanntes Feld entfernt keine Karte, und ein anderer Titel als der
gepruefte trifft die Stichprobe nicht. `[read]` **Das war mein
Messfehler, nicht ein blinder Waechter** ? mit der richtigen
Sabotage wurden beide rot.

### Der Streit aus G-397 ist entschieden

`[cmd]` **`module-coach.jsx:948, 949, 950`:**

    {tab === "patterns"  && <window.PatternAnalysisView/>}
    {tab === "intervene" && <window.InterventionEngineView/>}
    {tab === "consent"   && <window.ConsentFlowView/>}

`[read]` **Sie sind Portalreiter** ? die Vorlage sagt es woertlich.
**Der SSOT hatte recht, `bekanntOffen` hatte recht, und der Schluss
in G-391 war falsch:** sie sind nicht *woanders offen*, sie sind
diese Aufgabe. **Alle drei tragen jetzt ihre Referenz.**

### Was nicht angefasst ist

**1 ? `apps/web`** ? keine Datei geaendert, 1545 Tests unveraendert.

**2 ? Nichts angebunden.** `[cmd]` **Kein neuer Leseweg, keine neue
Abfrage** ? `lib/daten.ts` ist unberuehrt.

**3 ? Nichts in `packages/ui`, nichts in `supabase/`.**

**4 ? Die acht begruendeten Leerzustaende** (`tab-leer.tsx`) stehen
unveraendert ueber der Linie. `[read]` **Sie sind kein Mangel,
sondern eine Angabe** ? und die Referenz darunter zeigt jetzt, WIE
die Ansicht aussaehe.

### Ein Punkt fuer spaeter

`[read]` **Der Trenner steht zweimal im Haus** ? einmal in
`apps/web/src/components/shell/`, einmal in
`apps/coach/src/components/`. `[cmd]` **Beide 30 Zeilen, beide mit
derselben Marke.** **Der richtige Ort waere `packages/ui`** ? dann
gaebe es einen Baustein statt zwei, und die Marke koennte nicht
auseinanderlaufen.

### Neustart

`[read]` **Nicht noetig** ? nur `apps/coach/src`, das laedt heiss
nach. `[cmd]` **Keine Aenderung in `packages/`, keine neue
Abhaengigkeit, keine Umgebungsvariable.**

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  sechzehn Reiter -- standen schon
    A2  44 Portalkarten: 14 angebunden / 3 baubar / 27 blockiert
    A3  27 blockierte mit Grund, elf verschiedene
    A4  Reiter mit Linie 0 -> 16, Karten darunter 0 -> 44
    A5  ueber der Linie 27 -> 27, Titel gegen Titel
    A6  0 nackte Nullen, 0 Konsolenfehler
    A7  sechzehn Bildschirmfotos
    A8  je Karte der Altrepo-Bezug
    A9  apps/coach 13/13, apps/web 1545 unveraendert

`[cmd]` **Selbst gemessen: `page.tsx:26-42` fuehrt alle sechzehn,
`mockup-referenz.ts` traegt 44 Karten mit 14/3/27, Tests 13/13.**

### Zwei meiner Praemissen waren falsch

**1** ? `[read]` **Ich schrieb: *,,sieben Reiter fehlen ganz."***

`[cmd]` **Sie standen alle** ? **die sieben rendern `TabLeer` mit
je einem Grund.**

`[read]` **Ich hatte neun KOMPONENTENDATEIEN gezaehlt und daraus
neun Reiter geschlossen.**

**2** ? `[cmd]` **Der Testbestand ist 1545, nicht 1553** ?
**`fbc73a07` hat die acht G-391-Waechter mitgenommen, sie standen
in der entfernten Datei.**

`[read]` **Mein Rueckbau hat Tests geloescht, und ich habe die
alte Zahl in den Auftrag geschrieben.**

### Der Wächter hat drei Einstufungen berichtigt

`[cmd]` **Zwei Karten waren angebunden, nicht baubar** ?
*Athletes needing attention* **und** *Athletendetail*.

`[cmd]` **Und der dritte Fall ist der lehrreiche:**

> *,,Bei *Today's sessions logged* hatte ich `coach.relationships`
> mitgenannt ? sie wird gelesen und haette die Karte faelschlich
> als angebunden ausgewiesen. Tragend ist
> `training.workout_sessions`, und die liest das Portal nur je
> Athlet. Der Unterschied liegt im Filter, nicht im Namen."*

`[read]` **Eine Tabelle im Leseweg macht eine Karte nicht
angebunden** ? **es kommt darauf an, WELCHE sie traegt und mit
welchem Filter.**

`[read]` **Und die Ausnahme steht benannt im Waechter, nicht
stillschweigend.**

### A3 — zwei Gegenproben widerlegt

`[cmd]` **`wissen.rule_engine_rules` gibt es** ? **aber es sind
Substanz-Wechselwirkungen, keine Coach-Regeln.**

`[cmd]` **`medical.health_events` gibt es** ? **aber medizinisch,
nicht Urlaub oder Umzug.**

`[read]` **Zum zweiten Mal derselbe Reflex geprueft:** **ein
passender Name ist keine passende Tabelle.**

### G-397 ist damit entschieden

`[cmd]` **`module-coach.jsx:948-950` zeigt die drei als
Portalreiter.**

> *,,Der SSOT hatte recht, `bekanntOffen` hatte recht ? nur mein
> Schluss in G-391 war falsch."*

`[read]` **Beide Verzeichnisse stimmten** ? **es gab nie einen
Widerspruch, nur eine falsche Folgerung.**

### Und die Sabotageprobe, die log

> *,,Meine Sabotageproben meldeten zweimal GRUEN, obwohl die
> Sabotage selbst nicht angekommen war."*

`[read]` **Eine Probe, die den eingebauten Fehler nicht erreicht,
belegt nichts** ? **er hat es gemerkt und gemeldet.**

**Abgenommen.**

