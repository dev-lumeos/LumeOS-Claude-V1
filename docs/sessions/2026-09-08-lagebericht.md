# Lagebericht 2026-09-08

**Alle Zahlen in dieser Datei sind an diesem Tag gemessen.**
`[read]` **Keine stammt aus einem Bericht oder einer Erinnerung.**

---

## 1 · Der Stand in Zahlen

### Die Datenbank

    Schema        Tabellen   Zeilen      leer
    nutrition          45   1.039.991      21
    supplements        57      28.017      13
    medical            29       7.283       5
    wissen             10       5.090       0
    recovery            7         949       0
    training            8         456       5
    goals               7         450       1
    coach              15          53       5
    public              2           9       0
    ----------------------------------------
    gesamt            178   1.082.298      50

`[read]` **50 von 178 Tabellen sind leer** ? **28 Prozent.**

`[read]` **Und die Verteilung ist schief:** **`nutrition` traegt 96
Prozent aller Zeilen.**

### Was leer ist, und was das heisst

**`training`: 5 von 8 leer** ? `exercises`, `exercise_muscles`,
`muscle_groups`, `equipment`, `exercise_catalog_enrichment`.

`[read]` **Das Trainingsmodul hat keinen Uebungskatalog.**
`[read]` **456 Zeilen sind Sitzungen und Saetze ? auf was sie sich
beziehen, steht nirgends.**

**`coach`: 5 von 15 leer** ? `coach_profiles`, `pending_invites`,
`pending_actions`, `action_log`, `client_consent_log`.

`[read]` **Alle fuenf sind Schreibziele** ? **die Beziehung
existiert, aber niemand hat je etwas getan.**

**`supplements`: 13 von 57** ? darunter `supplement_protocols`,
`user_supplement_cycles`, `user_inventory`, `intake_schedule`.

**`medical`: 5** ? `injection_logs`, `user_conditions`,
`biomarker_catalog`, `biomarker_aliases`,
`injection_site_conditions`.

### Die Oberflaeche

    Modul         Dateien    KB   Karten  Attrappen  Anteil
    nutrition          44   796       92         15     16%
    supplements        20   415      102         63     61%
    coach              20   333       85         59     69%
    medical            16   317       54         17     31%
    goals              17   294       92         33     35%
    training           12   278       79         43     54%
    recovery           13   233       64         36     56%
    dashboard           5    58        9          0      0%
    settings            2    26        4          0      0%

`[read]` **Nutrition ist zu 84 Prozent angebunden, Coach zu 31.**

`[cmd]` **Insgesamt 581 Karten, 266 davon Attrappen** ? **46
Prozent der Oberflaeche zeigt Vorlagenzahlen.**

### Die Lesewege

    Modul         Dateien  from()  rpc()     KB
    nutrition          57     120     24   1.048
    supplements        20      40      2     218
    medical            17      39      1     152
    training            8      38      0      93
    goals               7      12      5      60
    coach               5      12      5      31
    recovery            5       6      0      40
    dashboard           1      10      0      21

`[read]` **`training` hat 38 Lesewege auf 8 Tabellen, von denen 5
leer sind.**

---

## 2 · Der Vergleich mit dem Vorgaengerrepo

    Modul         Alt-Code   Alt-Docs   Heute-UI
    training        964 KB      59 KB     278 KB
    nutrition       723 KB      77 KB     798 KB
    coach           399 KB      89 KB     333 KB
    goals           263 KB     142 KB     294 KB
    supplements     224 KB     109 KB     431 KB
    medical         208 KB     140 KB     317 KB
    recovery         85 KB      69 KB     233 KB
    marketplace      78 KB     121 KB       0 KB

**Und vier Module ohne jedes Gegenstueck:**

    human-coach     454 KB, 30 Dateien
    dashboard       127 KB, 10
    intelligence     77 KB,  8
    onboarding       75 KB,  9

`[read]` **`training` ist die groesste Luecke** ? **964 KB dort,
278 hier, und der Uebungskatalog ist leer.**

`[read]` **`human-coach` ist die zweitgroesste** ? **454 KB, und
LumeOS hat `apps/coach` mit 75 KB.**

`[read]` **`intelligence` und `onboarding` haben nicht einmal
einen Namen bei uns.**

### Was das Altrepo an Dokumentation traegt

`[cmd]` **`docs/modules/<modul>/`, zehn Module, je sieben Dateien
nach gleichem Schema:**

    API.md  COMPONENTS.md  DATABASE.md  FEATURES.md
    MIGRATION.md  README.md  RESEARCH.md

`[cmd]` **Zusammen 1.126 KB.** `[cmd]` **Plus `research/` mit 259
Dateien und 2.679 KB.**

`[read]` **`RESEARCH.md` je Modul hat kein Gegenstueck in unseren
Specs** ? **dort steht, WARUM etwas so gebaut wurde.**

---

## 3 · Der Arbeitsvorrat

    todos                206
    laufend_codex          1   C-445
    laufend_claudecode     2   G-389, G-390
    erledigt             362

    Modul          hoch  mittel  niedrig  summe
    quer              2      56        4     62
    supplements       1      30        2     33
    medical           0      30        1     31
    nutrition         0      20        9     29
    training          0      13        3     16
    coach             3      12        0     15
    recovery          0      13        1     14
    goals             0       4        0      4
    market            2       0        0      2

`[read]` **`quer` ist der groesste Posten** ? **62 Punkte, die
kein Modul betreffen.**

`[read]` **Und `market` hat zwei Punkte, beide hoch** ? **das
Wallet ist gebaut und nicht eingespielt.**

### Sechzehn offene Entscheidungen

    A-43   coach        Coach-Permissions pro Subfunktion
    A-64   quer         der Schirmlauf ausserhalb des Gates
    A-72   quer         eine Leser-Deklaration im Code
    E-10   quer         RLS neu bewerten
    G-377  quer         ein gemeinsames Bauteil fuer den Modulkopf
    C-167  recovery     MODALITY_BONUS: elf gegen vier
    C-218  recovery     zwei Normierungen des Recovery-Score
    G-106  recovery     der Readiness-Komposit
    C-199  supplements  medication_regulatory als Entitaet
    C-341  supplements  gemeldete Community-Beitraege
    G-150  supplements  Volltextsuche ueber Erklaertexte
    GO-24  supplements  "Mineralstoffe" als Gruppenbegriff
    E-07   training     weibliche Darstellungen
    G-88   training     die Sitzungskarte auf Today
    G-219  training     LiveWorkout ohne Aufrufer

`[read]` **Drei davon sind seit dem 21.08. offen.**

---

## 4 · Das Muster des Tages: A-71

`[cmd]` **In 23 Punkten erwaehnt.** `[cmd]` **Vierzehn Faelle heute
gefunden:**

    RecMuscleMap ohne Prop                  3 Kacheln
    Today-Sitzung aus festem Objekt         1
    Modalitaeten, modality_log ungenutzt    4
    Rechenweg las TDEE_STATE                1
    ladeSitzungsUebungen nicht durchgereicht 1
    vorlagenLageVon(0) fest verdrahtet      1
    ergaenzePosition ohne Aufrufer          3
    activity_stream ohne Leser              1
    TodayEcht rechnete eigenes Heute        1
    frozen_at wird geschrieben, nie gelesen 1  <- Spaltenebene
    injection_logs: vier Policies, kein Weg 1
    medical_originals_delete_own ohne Weg   1
    InjektionsKarte ohne Aufrufer           1
    health_events ohne Oberflaeche          1

`[read]` **Die Klasse hat drei Formen:**

**a** ? **ein Leseweg liegt da, niemand ruft ihn.**
**b** ? **eine Kachel rechnet aus einer Konstante, waehrend der
Leseweg danebenliegt.**
**c** ? **eine Erlaubnis steht, der Weg dazwischen fehlt.**

`[read]` **Form c ist die haeufigste bei Codex-Arbeit** ? **er baut
Schema und Policy, der Weg gehoert nach `apps/`.**

---

## 5 · Was heute geschah

`[cmd]` **80 Commits am 08.09., 43 am 09.09.**

    docs/punkte              223 Dateien
    apps/web                  77
    supabase/_pipeline        43
    docs/ssot                 21
    docs/lehren               14
    CLAUDE.md                 12
    supabase/migrations       10
    tools/                     6

`[read]` **Die Halbtagesbilanz ist ehrlich:** **mehr
Dokumentation als Produkt.**

### Was dabei entstand

**Vier Erzeuger, die vorher nicht existierten:**

    ssot-modultabellen.mjs   168 Tabellen, 2.367 Spalten
    ssot-schema.mjs          173 Funktionen, 414 Policies,
                             575 CHECKs
    ssot-nachtragen.mjs      326 abgenommene Punkte
    spec-abgleich.mjs        57 Spec-ohne-Schema,
                             129 Schema-ohne-Spec

`[read]` **Vorher wurde jede dieser Fragen einzeln gemessen.**

**Und `CLAUDE.md` von 1817 auf 350 Zeilen**, Belege nach
`docs/lehren/`.

---

## 6 · Die Befunde, die zaehlen

### a) Die SSOT lag zwoelf Tage zurueck

`[cmd]` **112 Commits ohne Nachtrag** (A-74). `[cmd]` **Fuenf
Aussagen behaupteten, eine Tabelle sei nicht gebaut, die es
gibt.**

`[read]` **Die schlimmste trug einen `[cmd]`-Marker** ? **ein
gemessener Beleg, der falsch geworden war.**

**Behoben.** `[cmd]` **`ssot-alter-pruefen.mjs` steht im Gate.**

### b) Das Vorgaengerrepo wird nicht genutzt

`[cmd]` **Dreimal an einem Tag lag die Antwort dort bereit:**

    C-426  acht Achsen ohne Erlaubnisliste
           -> AUTONOMY_ARCHITECTURE.md:165 hat sie vollstaendig
    C-441  vier Injektionsorte statt sechzehn
           -> Injection Planner:48 hat alle sechzehn
    C-443  Coach kann nichts bauen
           -> ProgramBuilder, RuleBuilder, KnowledgeManager

`[read]` **Und die technische Ursache: `git grep` findet dort
nichts** ? **das Verzeichnis ist nicht getrackt.**

**Behoben.** `[cmd]` **`docs/lehren/altrepo-karte.md` und
`quellen-pflicht.md`.**

### c) Das Wallet ist nicht live

`[cmd]` **C-419 hat 13 Tabellen gebaut, abgenommen heute morgen** ?
**es gibt kein `market`-Schema.**

`[read]` **Der Orchestrator hat es mehrfach als vorhanden
gefuehrt.** `[read]` **`abgenommen` ist nicht `live`.**

**Als C-444.**

### d) Der Hydrationsfehler

`[cmd]` **`tab-injektionen.tsx:111` ruft `new Date()`.**
`[cmd]` **`ansicht.tsx:194` warnt woertlich davor** ? **G-74 hat
es schon einmal behoben.**

**Als G-390, laufend.**

---

## 7 · Wo wir stehen, in einem Satz je Modul

**`nutrition`** ? **das reifste Modul.** 1,04 Mio Zeilen, 84
Prozent angebunden, 57 Leseweg-Dateien. `[read]` **Offene Punkte
sind Feinarbeit, keine Luecken.**

**`supplements`** ? **breit gebaut, duenn angebunden.** 57
Tabellen, 13 leer, 61 Prozent Attrappen. `[read]` **Der
Injektionsplaner ist die groesste zusammenhaengende Luecke.**

**`medical`** ? **seit heute mit Ablage, Terminen, Zeitachse.**
`[read]` **E-74 ist die tragende Entscheidung: erfassen ist nicht
diagnostizieren.**

**`training`** ? **die groesste Luecke.** `[cmd]` **Uebungskatalog
leer, 964 KB im Altrepo, 54 Prozent Attrappen.**

**`recovery`** ? **klein und dicht.** 7 Tabellen, keine leer.
`[read]` **Aber 56 Prozent Attrappen** ? **die Daten sind da, die
Oberflaeche nicht.**

**`goals`** ? **seit heute mit atomarer Platzvergabe.** 7 Tabellen,
450 Zeilen.

**`coach`** ? **Neuland, und der Vergleich schmerzt.** `[cmd]` **69
Prozent Attrappen, 5 von 15 Tabellen leer, 0 Profile.**
`[read]` **Das Altrepo hatte 78 Bauteile und einen
`executionEngine`.**

**`market`** ? **gebaut, nicht eingespielt.** `[cmd]` **0
Tabellen live.**

---

## 8 · Was ich vorschlage

`[read]` **Drei Straenge, in dieser Reihenfolge.**

### Strang 1 ? aufraeumen, was halb ist

`[cmd]` **Drei Dinge sind gebaut und nicht live:**

    C-444  market: 13 Tabellen
    C-442  coach: onboard_coach
    C-445  supplements: 16 Injektionsorte

`[read]` **Das kostet Codex einen Vormittag** ? **und danach
stimmt der Stand mit der SSOT ueberein.**

### Strang 2 ? das Vorgaengerrepo lesen, je Modul

`[read]` **Nicht alles auf einmal.** `[read]` **Je Modul die sieben
Dateien, in einem Auftrag:**

    docs/modules/<modul>/README.md    was ist es
    DATABASE.md                        die Tabellen
    FEATURES.md                        was es kann
    RESEARCH.md                        warum es so ist

`[cmd]` **Und dagegen `00-MODULTABELLEN.md` halten.**

`[read]` **Ergebnis je Modul: eine Liste, was fehlt und warum.**

`[read]` **Anfangen mit `training`** ? **die groesste Luecke, und
der leere Uebungskatalog blockiert alles andere.**

### Strang 3 ? die Attrappen abbauen

`[cmd]` **266 von 581 Karten sind Attrappen.**

`[read]` **Aber nicht wahllos** ? **erst messen, welche eine
Datenquelle haben und welche nicht.**

`[cmd]` **Der Injektionsplaner ist der Beleg: elf Kacheln, eine
gebaut, vier baubar, sechs blockiert** ? **die Dreiteilung ist die
Arbeit, nicht das Anbinden.**

---

## 9 · Was ich NICHT vorschlage

`[read]` **Weiter Werkzeuge bauen.** `[cmd]` **Heute sind vier
entstanden** ? **das reicht, bis sie sich bewaehrt haben.**

`[read]` **Coach ausbauen, bevor `training` steht.** `[read]`
**Ein Coach ohne Uebungskatalog kann kein Programm bauen.**

`[read]` **Und Marketplace anfassen** ? **es ist Neuland, und die
Grundmodule sind nicht fertig.**
