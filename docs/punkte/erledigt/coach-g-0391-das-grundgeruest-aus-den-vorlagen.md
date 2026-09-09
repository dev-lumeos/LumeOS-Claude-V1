---
nr: G-391
typ: feature
modul: coach
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-443
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: a5e8b344
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

## Auftrag

Tom, 2026-09-08: *,,coach mockup erstellen, ueberlagernd mit dem
bestehenden was schon gebaut ist."*

**Beauftragt am 2026-09-08.**

### Was das heisst

`[read]` **Nicht ersetzen** ? **die 73 Vorlagenkarten neben das
legen, was heute steht.**

`[cmd]` **Heute: 85 Karten, 59 Attrappen** ? **69 Prozent.**

`[read]` **Nach dem Muster von E-69: die Mockup-Referenz unter der
Trennlinie** ? **die Karten der Vorlage sichtbar, mit der Frage,
ob es sie schon gibt.**

### 1 · Die acht Vorlagen lesen

`[cmd]` **`docs/spezifikation/10-plattform/design-system/theme-v1/`:**

    module-coach.jsx                    61 KB, 23 Karten
    module-coach-extras.jsx             48 KB, 10
    module-coach-gaps.jsx               35 KB, 14
    module-coach-athlete.jsx            31 KB, 10
    module-coach-portal-v2.jsx          23 KB,  6
    module-coach-portal-workflows.jsx   21 KB,  6
    module-coach-programs.jsx           13 KB,  4
    module-coach-meta.jsx               12 KB,  0

`[read]` **Der Orchestrator hat sie nie erwaehnt** ? **in keinem
Auftrag.**

### 2 · Je Karte die Dreiteilung

    angebunden    eine Tabelle traegt sie
    baubar        Tabelle da, Leseweg fehlt
    blockiert     keine Tabelle -- und WELCHE fehlt

`[cmd]` **Der Injektionsplaner hat gezeigt, dass diese Dreiteilung
die Arbeit ist** (G-388, A4).

`[cmd]` **`docs/ssot/00-MODULTABELLEN.md` sagt, was es gibt** ?
**15 Coach-Tabellen, 53 Zeilen, 5 leer.**

### 3 · Wo die Vorlage und das Altrepo sich decken

    Rule canvas                  -> CoachRuleBuilder.tsx  30 KB
    Plan library, Programs,
    Delivery, Live assignment    -> ProgramBuilder.tsx    49 KB
    Adherence forecast,
    Risk indicators,
    Active interventions         -> buddyWatcher.ts       39 KB
    The ladder,
    Athletes by autonomy level   -> AUTONOMY_ARCHITECTURE.md:165
    Coach efficiency,
    Business impact              -> research/b2b/  50 KB

`[read]` **Melde je Karte, ob das Altrepo etwas dazu hat** ?
**nicht uebernehmen, nur nennen.**

`[cmd]` **`docs/lehren/altrepo-karte.md` sagt, wo was liegt.**

### 4 · Was schon steht, bleibt

`[cmd]` **`apps/web/v2/coach`: 20 Dateien, 333 KB** ? **darunter
`rechte-echt.tsx` und `uebersicht-echt.tsx`.**

`[read]` **Die angebundenen Karten nicht anfassen** ? **die
Referenz kommt darunter.**

### Abnahmebedingungen

    A1  die 73 Karten der Vorlage, je zugeordnet:
        angebunden / baubar / blockiert. Zahlen.
    A2  je blockierter Karte: WELCHE Tabelle fehlt.
    A3  je Karte: hat das Altrepo etwas dazu? Mit Datei.
    A4  die Mockup-Referenz unter der Linie, E-69.
        Bildschirmfoto.
    A5  E-72: keine nackte Null in den bestehenden Karten.
    A6  was heute angebunden ist, bleibt angebunden.
        Zahl vorher/nachher.
    A7  1545 Tests bleiben gruen.

### Was nicht zu tun ist

**Nichts anbinden** ? **dieser Auftrag zeigt, was es braucht.**
**Nichts in `packages/ui`** ? **melden.**
**Nichts in `supabase/`** ? **Codex arbeitet an C-456.**
**Nachweise auf `test-user@lumeos.local`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server

`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

### Vorab: die Zahl 73 ist aus den Dateien nicht reproduzierbar

`[cmd]` **Der Auftrag nennt 73 Karten. Nachgezaehlt sind es 62.**

    <Card                          125   jedes Element, auch Statistikkacheln
    <Card title=                    55   nur benannte Karten
    <Card|CMod title=               62   benannte Karten UND Modale   <- gezaehlt
    Auftrag                         73   keine Regel ergibt das

`[cmd]` **Auch je Datei geht es nicht auf:** der Auftrag nennt fuer
`gaps` 14 und fuer `module-coach.jsx` 23 ? gemessen sind es 12 und
17. **Kein festes Delta**, also kein anderer Zaehler mit gleichem
Muster.

`[read]` **Gezaehlt ist, was einen Namen traegt** ? `<Card title=`
und `<CMod title=`. **Die 63 uebrigen `<Card`-Elemente sind
Statistikkacheln INNERHALB einer Karte** (`card-tight`, meist vier
nebeneinander); sie einzeln zu zaehlen machte aus einer Kachel
fuenf.

`[cmd]` **Ein Waechter haelt die 62 fest** ? aendert jemand die
Vorlagen, faellt er.

### A1 ? Die 62 Karten, je zugeordnet

    angebunden   18    eine Tabelle traegt sie UND ein Leseweg liest sie
    baubar       16    Tabelle da, kein Leseweg
    blockiert    28    keine Tabelle
    ------------------
    Summe        62

`[cmd]` **Grundlage, gemessen 2026-09-09 gegen die laufende
Instanz:** 15 Tabellen im Schema `coach`, **58 Zeilen, 3 leer**.

`[read]` **Der Auftrag sagt 53 Zeilen und 5 leer** ? und nennt
`action_log` und `pending_actions` unter den leeren. `[cmd]`
**Beide tragen inzwischen Zeilen** (1 und 2). **Leer sind heute
`client_consent_log`, `coach_profiles`, `pending_invites`.**

`[cmd]` **Neun der 15 Tabellen haben einen Leseweg**, sechs nicht:
`action_log`, `alerts`, `client_consent_log`, `coach_profiles`,
`pending_invites`, `relationship_change_log`. **Genau diese Grenze
trennt *angebunden* von *baubar*.**

### A2 ? Je blockierter Karte die fehlende Tabelle

**28 Karten, 12 verschiedene Gruende ? keine ohne:**

     6x  keine Tabelle fuer Plaene/Programme
     4x  keine Tabelle fuer Coach-Regeln
     4x  keine Tabelle fuer Ablaeufe
     3x  keine Tabelle fuer Umsatz
     3x  keine Tabelle fuer Coach-Teams
     2x  keine Tabelle fuer Coach-Einstellungen
     1x  keine Tabelle fuer Assessments
     1x  keine Tabelle fuer Zeit/Aufwand je Coach
     1x  keine Tabelle fuer Vorhersagen
     1x  keine Tabelle fuer Lebensereignisse
     1x  keine Tabelle fuer Kosten/Abrechnung
     1x  keine Tabelle fuer Erfolge/Meilensteine

#### Die Gegenprobe hat zwei Verdachtsfaelle widerlegt

`[read]` **,,Es gibt keine Tabelle" ist eine Abwesenheitszusage** ?
sie kippt still. **Also im ganzen Schema gesucht, nicht nur in
`coach`:**

`[cmd]` **`training.workout_sessions` GIBT es, 66 Zeilen.**
**,,Today's sessions logged" ist damit nicht blockiert, sondern
baubar** ? die Einheiten sind da, es fehlt der Weg vom Coach zum
Klienten.

`[cmd]` **`wissen.rule_engine_rules` gibt es auch, 64 Zeilen** ?
**aber das sind Substanz-Wechselwirkungen** (`substance_ids`,
`effect`), keine Coach-Automatisierung. **Gleicher Name, andere
Sache.** Der Vermerk sagt das jetzt ausdruecklich, damit niemand
zweimal nachsieht.

### A3 ? Was das Altrepo dazu hat

`[cmd]` **Alle fuenf im Auftrag genannten Dateien liegen vor**,
Groessen gemessen:

    CoachRuleBuilder.tsx      27.865 B   4 Karten
    ProgramBuilder.tsx        49.640 B   6 Karten
    buddyWatcher.ts           36.957 B   7 Karten
    AutonomyLevelConfig.tsx   10.736 B   4 Karten
    CoachOverridePanel.tsx    14.879 B   2 Karten
    research/b2b/             51.720 B   4 Karten
    AUTONOMY_ARCHITECTURE.md:165          3 Karten
                                        --------
                                         30 Karten

`[cmd]` **`AUTONOMY_ARCHITECTURE.md:165` ist die
,,Permission Matrix Flow"** ? die Stelle stimmt.

**32 der 62 Karten haben nichts im Altrepo.** `[read]` **Das ist
selbst eine Aussage:** wo nichts liegt, ist auch nichts zu
portieren.

### A4 ? Die Referenz unter der Linie

`[cmd]` **Am Schirm gemessen, alle zehn Reiter, vorher gegen
nachher:**

    Reiter mit Trennlinie      8 -> 10
    Karten unter der Linie    29 -> 42
    Karten ueber der Linie    38 -> 36

`[cmd]` **Bildschirmfotos:** `backup/g391-nachher.png` (die Linie
mit dem Gebauten darueber), `backup/g391-ohne-gegenstueck.png`
(der neue Abschnitt).

#### Was gebaut ist ? und was NICHT

`[cmd]` **Von 62 Vorlagenkarten haben 23 bereits ein
Gegenstueck** in `mockup-referenz.tsx` und `ai/mockup-referenz.tsx`
(G-365). **Von den uebrigen 39 stehen 29 in
`tools/vollstaendigkeit.mjs` unter `coach.bekanntOffen`** ? mit
Begruendung, je Posten.

`[read]` **Das ist der Trainerarbeitsplatz.** `[cmd]`
`module-coach.jsx:137` verdrahtet `const side = "athlete"` fest;
der Portalzweig ist ueber diese Weiche **nie erreichbar**. Er
laeuft seit G-02 als eigene App unter `coach.lumeos.app`
(`apps/coach`, 14 Dateien) ? **und `human/page.tsx:33` sagt es
ebenso.**

`[read]` **Ihn hier nachzubauen hiesse, eine Trennung
rueckgaengig zu machen, die zweimal begruendet ist.**

**Gebaut sind deshalb die zehn, die in KEINER der beiden Listen
stehen:**

    VisualRuleBuilder        Building blocks         blockiert
                             Rule canvas             blockiert
    PatternAnalysisView      Adherence forecast      blockiert
                             Risk indicators         baubar
                             Day-of-week pattern     angebunden
                             Event impact analysis   blockiert
    InterventionEngineView   Active interventions    baubar
    ConsentFlowView          Client consent          baubar
    AlertBatching            Batched                 angebunden
    AuditLogV2               Audit log               baubar

`[cmd]` **Je Karte die Stufe als Marke, der Grund im
Attrappenvermerk, die Tabelle mit Namen.** `[read]` **Sie liegen
auf `overview`**, weil sie sechs Ansichten betreffen und zusammen
EINE Aussage tragen. **Einzeln ueber die Reiter gestreut waere der
Befund in zehn Teile zerlegt.**

### Zwei Befunde, die keiner Zaehlung auffallen

**1 ? Zwei Vorlagen kennt das Zaehlwerkzeug nicht.**

`[cmd]` **`module-coach-portal-v2.jsx` und
`-portal-workflows.jsx` stehen in KEINER Zeile von
`vollstaendigkeit.mjs`** ? das Werkzeug fuehrt sechs der acht
Vorlagen. `[read]` **Elf Karten, die noch keine Zaehlung gesehen
hat**, und sie melden sich auch nicht: **was nicht im Verzeichnis
steht, kann nicht fehlen.**

**2 ? SSOT und Werkzeug widersprechen sich.**

`[cmd]` **`docs/ssot/102-coach-mockup.md:175/176/179` fuehrt
`PatternAnalysisView`, `InterventionEngineView` und
`ConsentFlowView` als ,,Portal"** ? **`bekanntOffen` fuehrt sie
nicht.** `[read]` **Zwei Verzeichnisse desselben Sachverhalts, mit
verschiedenem Inhalt.**

`[read]` **Gemeldet, nicht aufgeloest** ? welches gilt, ist eine
Entscheidung: **stehen sie im Portal, gehoeren sie in
`bekanntOffen`; stehen sie im Athletenzweig, sind sie eine echte
Luecke.** `[cmd]` **Ich habe sie als Luecke behandelt** (sie stehen
jetzt unter der Linie) ? **das ist die vorsichtigere Richtung: sie
sichtbar zu machen kostet nichts, sie zu verschweigen schon.**

### A5 ? E-72: keine nackte Null

`[cmd]` **Am Schirm gemessen, alle zehn Reiter, vorher UND
nachher: 0 nackte Nullen.**

`[read]` **Gezaehlt wurde jede `.v2-num` mit dem Inhalt `0`, deren
Karte kein benennendes Wort traegt** (,,kein", ,,leer", ,,noch",
,,nicht", ,,ohne"). `[cmd]` **Der Kopf zeigt `0 active` und
`0 unread`** ? beide mit Bezeichner daneben, also keine nackte
Zahl.

### A6 ? Was angebunden war, ist es geblieben

`[cmd]` **Titel gegen Titel gemessen, nicht Zahl gegen Zahl** ?
eine Gesamtzahl liesse eine verschwundene Kachel durch:

    overview      7 -> 7    Your coaches, Latest from your coaches,
                            Coaching balance, Trust circle,
                            Coach activity, Pending invites
    coaches       2 -> 2    Your coaches
    permissions   3 -> 3    Coach-Rechte, Historie der Freigaben
    proposals     2 -> 2    Wartet auf dich
    autonomy      6 -> 6    Autonomy, Historie der Einstufungen,
                            The ladder, Assessment scores, What this means
    checkins      3 -> 3    Check-ins, Next check-in
    messages      3 -> 3    Threads
    notes         6 -> 6
    invites       3 -> 2    Offene Einladungen  (bleibt oben)
    onboard       3 -> 2    Assistent           (bleibt oben)

`[cmd]` **Die zwei Aenderungen sind gewollt:** auf `invites` und
`onboard` ist die Karte ,,Kein Mockup-Gegenstueck" **unter die
Linie gewandert**, wo sie hingehoert ? **sie ist Referenz, nicht
gebaute Ware.** `[read]` **Keine einzige angebundene Kachel ist
verschwunden.**

### Der Vermerk auf `invites` und `onboard` war falsch

`[cmd]` **Dort stand:** *,,`invites`/`onboard` steht in keiner
theme-v1-Datei, es gibt keinen Soll-Stand zum Vergleich."*
**Zweimal widerlegt:**

    onboard   module-coach-meta.jsx:77-147   ONBOARD_STEPS und
              CoachOnboardingWizard -- die QUELLE des Reiters,
              genannt im Kopf von tab-onboarding.tsx
    invites   module-coach.jsx:249  "Pending invites"
              module-coach.jsx:475  "Invites"

`[read]` **Ein Vermerk mit falschem Grund ist selbsterhaltend** ?
er sagt, es gebe nichts nachzusehen. **Und in einer Suche zaehlt er
als Deckung.**

`[cmd]` **Was stimmte: unter der Linie stand nichts** ?
`CoachOhneMockup` setzte eine Karte, aber **keinen
`ReferenzTrenner`**. **Gemessen: `Trenner=NEIN` auf beiden
Reitern**, waehrend die anderen acht ihn haben. `[read]` **Ohne
Linie gibt es kein Oben und Unten** ? und genau die verlangt E-69.

**Beides berichtigt:** der Vermerk nennt jetzt die Fundstelle, die
Linie steht.

### A7 ? 1545 -> 1553 Tests gruen

`[cmd]` **tsc sauber, `next lint` sauber, 1553 pass / 0 fail** ?
acht neue Waechter.

**Sabotageprobe, je Waechter einzeln:**

    Trennlinie im neuen Abschnitt weg     -> ROT
    eine der zehn Karten entfernt         -> ROT
    erfundene Tabelle im Vermerk          -> ROT
    Falschaussage auf invites zurueck     -> ROT
    Trennlinie auf invites/onboard weg    -> ROT
    Vorlage geaendert (ONBOARD_STEPS)     -> ROT
    neunte Vorlage angelegt               -> ROT (Verzeichnis, nicht Liste)

**Alle zurueckgenommen, 1553/1553 gruen.**

`[cmd]` **Ein Waechter hat sich selbst gemeldet:** die Probe
*,,die genannten Tabellen gibt es wirklich"* fiel ueber
`coach.bekanntOffen` ? **ein Schluessel in `vollstaendigkeit.mjs`,
keine Tabelle.** `[read]` **Das Muster war zu grob**, und die
Berichtigung hat es genauer gemacht, statt die Probe zu
entschaerfen.

### Was nicht angefasst ist

**1 ? Nichts angebunden.** `[cmd]` **Kein neuer Leseweg, keine
neue Abfrage** ? der Auftrag sagt es ausdruecklich.

**2 ? Nichts in `packages/ui`, nichts in `supabase/`.**

**3 ? Die 29 Portal-Karten** bleiben, wo sie sind ?
in `bekanntOffen`, mit Begruendung. `[read]` **Sie hierher zu holen
hiesse, den Trainerarbeitsplatz in den Athletenbereich zu
kopieren.**

**4 ? Die zwei ungezaehlten Vorlagen** stehen weiterhin in keiner
Zeile von `vollstaendigkeit.mjs`. `[read]` **`tools/` gehoert nicht
zu diesem Auftrag** ? gemeldet, damit es ein eigener wird.

### Neustart

`[read]` **Nicht noetig** ? nur `apps/web/src`, das laedt heiss
nach.

### Anhang: die 62 Karten einzeln

    Vorlage           Karte                                    Stufe       Tabelle / fehlender Grund                      Altrepo
    ------------------------------------------------------------------------------------------------------------------------------------------------------
    athlete           Permission matrix                        angebunden  client_permissions                             AutonomyLevelConfig.tsx
    athlete           Consent log                              baubar      client_consent_log                             CoachOverridePanel.tsx
    athlete           The ladder                               angebunden  client_autonomy                                AUTONOMY_ARCHITECTURE.md:165
    athlete           History                                  angebunden  autonomy_change_log+permission_change_log      -
    athlete           Assessment scores                        blockiert   keine Tabelle fuer Assessments                 -
    athlete           What this means                          angebunden  client_autonomy                                AUTONOMY_ARCHITECTURE.md:165
    athlete           Templates                                angebunden  checkin_templates                              -
    athlete           History                                  angebunden  autonomy_change_log+permission_change_log      -
    athlete           Next check-in                            angebunden  checkins                                       -
    extras            Coach efficiency                         blockiert   keine Tabelle fuer Zeit/Aufwand je Coach       research/b2b/
    extras            Business impact                          blockiert   keine Tabelle fuer Umsatz                      research/b2b/
    extras            Adherence per dimension · across all a   angebunden  checkins                                       buddyWatcher.ts
    extras            Building blocks                          blockiert   keine Tabelle fuer Coach-Regeln                CoachRuleBuilder.tsx
    extras            Rule canvas                              blockiert   keine Tabelle fuer Coach-Regeln                CoachRuleBuilder.tsx
    extras            Settings                                 blockiert   keine Tabelle fuer Coach-Einstellungen         -
    extras            Rule fire history · 30 days              blockiert   keine Tabelle fuer Coach-Regeln                CoachRuleBuilder.tsx
    extras            Athletes by autonomy level               angebunden  client_autonomy                                AUTONOMY_ARCHITECTURE.md:165
    extras            Team                                     blockiert   keine Tabelle fuer Coach-Teams                 -
    extras            Permission matrix                        angebunden  client_permissions                             AutonomyLevelConfig.tsx
    extras            Audit log · last 30 days                 baubar      action_log                                     -
    gaps              Athletendetail (Modal)                   baubar      relationships+checkins+alerts                  buddyWatcher.ts
    gaps              Alarmdetail (Modal)                      baubar      alerts                                         buddyWatcher.ts
    gaps              Coach settings                           blockiert   keine Tabelle fuer Coach-Einstellungen         -
    gaps              Regel bearbeiten (Modal)                 blockiert   keine Tabelle fuer Coach-Regeln                CoachRuleBuilder.tsx
    gaps              Adherence forecast · 30 days             blockiert   keine Tabelle fuer Vorhersagen                 -
    gaps              Risk indicators                          baubar      alerts                                         buddyWatcher.ts
    gaps              Day-of-week pattern                      angebunden  checkins                                       -
    gaps              Event impact analysis                    blockiert   keine Tabelle fuer Lebensereignisse            -
    gaps              Active interventions                     baubar      pending_actions+action_log                     buddyWatcher.ts
    gaps              Invite team member                       blockiert   keine Tabelle fuer Coach-Teams                 -
    gaps              Teammitglied (Modal)                     blockiert   keine Tabelle fuer Coach-Teams                 -
    gaps              Client consent · per module sharing      baubar      client_consent_log                             CoachOverridePanel.tsx
    portal-v2         Batched                                  angebunden  pending_actions                                -
    portal-v2         Audit log                                baubar      action_log                                     -
    portal-workflows  Steps                                    blockiert   keine Tabelle fuer Ablaeufe                    -
    portal-workflows  Peak-week protocol                       blockiert   keine Tabelle fuer Ablaeufe                    -
    portal-workflows  Recent runs                              blockiert   keine Tabelle fuer Ablaeufe                    -
    portal-workflows  Client onboarding                        blockiert   keine Tabelle fuer Ablaeufe                    -
    portal-workflows  Pending invites                          baubar      pending_invites                                -
    portal-workflows  What the client controls                 angebunden  client_permissions                             AutonomyLevelConfig.tsx
    programs          Programs                                 blockiert   keine Tabelle fuer Plaene/Programme            ProgramBuilder.tsx
    programs          Programmdetail                           blockiert   keine Tabelle fuer Plaene/Programme            ProgramBuilder.tsx
    programs          Delivery                                 blockiert   keine Tabelle fuer Plaene/Programme            ProgramBuilder.tsx
    programs          Live assignment                          blockiert   keine Tabelle fuer Plaene/Programme            ProgramBuilder.tsx
    programs          Delivery log                             blockiert   keine Tabelle fuer Plaene/Programme            ProgramBuilder.tsx
    coach             Your coaches                             baubar      relationships+coach_profiles                   -
    coach             Latest from your coaches                 angebunden  messages                                       -
    coach             Pending invites                          baubar      pending_invites                                -
    coach             Coaching balance                         blockiert   keine Tabelle fuer Kosten/Abrechnung           -
    coach             Trust circle                             angebunden  client_autonomy+client_permissions             -
    coach             Coach activity · 30d                     baubar      action_log+messages                            -
    coach             Per-coach permissions matrix             angebunden  client_permissions                             AutonomyLevelConfig.tsx
    coach             Threads                                  angebunden  messages                                       -
    coach             Invites                                  baubar      pending_invites                                -
    coach             Athletes needing attention               baubar      alerts                                         buddyWatcher.ts
    coach             Today's sessions logged                  baubar      training.workout_sessions+relationships        -
    coach             Recent achievements                      blockiert   keine Tabelle fuer Erfolge/Meilensteine        -
    coach             Plan library                             blockiert   keine Tabelle fuer Plaene/Programme            ProgramBuilder.tsx
    coach             Recent messages · all athletes           angebunden  messages                                       -
    coach             Revenue · 12 months                      blockiert   keine Tabelle fuer Umsatz                      research/b2b/
    coach             Revenue split                            blockiert   keine Tabelle fuer Umsatz                      research/b2b/
    coach             All open alerts                          baubar      alerts                                         buddyWatcher.ts


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  18 angebunden / 16 baubar / 28 blockiert
    A2  28 blockierte mit Grund, 12 verschiedene
    A3  30 Karten mit Altrepo-Bezug, 32 ohne
    A4  Reiter mit Linie 8 -> 10, Karten darunter 29 -> 42
    A5  0 nackte Nullen, vorher wie nachher
    A6  Titel gegen Titel: keine angebundene Kachel weg
    A7  1545 -> 1553 gruen

### Er hat meine Zahl widerlegt, und er hat recht

`[read]` **Ich schrieb 73 Karten in den Auftrag.**

`[cmd]` **Selbst nachgezaehlt, drei Zaehlweisen:**

    <Card                       125
    <Card ... title=             55
    <Card|CMod ... title=        62

`[cmd]` **62** ? **keine Regel ergibt 73.**

`[read]` **Und er hat es nicht uebernommen** ? *,,die Zahl als
Tatsache zu behandeln haette eine falsche Zahl durch die ganze
Einordnung getragen."*

`[cmd]` **Auch meine Datenbankzahlen waren alt:** **ich schrieb 53
Zeilen und 5 leere, er misst 58, ich messe jetzt 55** ? **beides
neuer als der Auftrag.**

### Der Befund, der die Aufgabe verkleinert hat

`[cmd]` **Von 62 haben 23 schon ein Gegenstueck (G-365).**

`[cmd]` **Und 29 stehen in `tools/vollstaendigkeit.mjs` unter
`coach.bekanntOffen`** ? **der Trainerarbeitsplatz.**

`[cmd]` **Selbst nachgelesen, der Grund steht dort:**

> *,,`module-coach.jsx:137` verdrahtet `const side = "athlete"`
> fest; ueber diese Weiche ist der Portalzweig im Athletenbereich
> NIE erreichbar. Er steht seit G-02 unter WORKSPACES als externer
> Link."*

> *,,Ihn hierher zu holen hiesse, eine zweimal begruendete Trennung
> rueckgaengig zu machen."*

`[read]` **Er hat die zehn gebaut, die in KEINER der beiden Listen
stehen** ? **statt 62 Karten anzulegen, von denen 52 falsch
waeren.**

### A2 — zwei Verdachtsfaelle widerlegt

`[cmd]` **`training.workout_sessions` gibt es (66 Zeilen)** ?
*,,Today's sessions"* **ist baubar, nicht blockiert.**

`[cmd]` **`wissen.rule_engine_rules` gibt es auch** ? **aber es
ist Substanz-Wechselwirkung, nicht Coach-Regel.**

`[read]` **Er hat eine Tabelle nicht gezaehlt, nur weil der Name
passt.**

### A6 — die richtige Messung

> *,,Titel gegen Titel, nicht Zahl gegen Zahl."*

`[read]` **Eine Zahl kann gleich bleiben, waehrend eine Kachel
verschwindet und eine andere dazukommt.**

### Zwei Falschaussagen berichtigt

`[cmd]` **Auf `invites` und `onboard` stand *,,steht in keiner
theme-v1-Datei"*.**

`[cmd]` **`module-coach-meta.jsx:77-147` IST die Quelle des
Onboarding-Reiters, `module-coach.jsx:249/475` fuehrt die
Invites.**

`[cmd]` **Und was stimmte: dort fehlte die Trennlinie ganz** ?
**E-69 war auf zwei Reitern nicht erfuellt.**

**Abgenommen.**

