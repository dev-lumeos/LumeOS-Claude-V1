---
nr: G-365
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-364
entscheidung: E-69
agent: claudecode
beauftragt: 2026-09-07
beruehrt:
  dateien:
    - apps/web/src/app/v2/training/ansicht.tsx
zahlen:
  gemessen: 2026-09-07
  verdaechtig: 23
---

# G-365 — vier Schritte je Kachel

## Anlass

`[cmd]` **G-364: drei Kacheln trugen einen Attrappen-Vermerk und
lasen echte Daten** — **`<RecMuscleMap />` wurde ohne Prop gerufen,
der Leseweg lag ungenutzt daneben.**

`[cmd]` **Und 23 weitere Kacheln tragen denselben moeglicherweise
falschen Vermerk.**

Tom, 2026-09-07: *,,und jetzt laesst claude jedes modul / jeden
subnavigationspunkt sauber pruefen."*

## Die vier Schritte, je Kachel

    1  Ist die Mockup-Kachel oben ueberhaupt vorhanden?
    2  Wenn angebunden: steht die Mockup-Kachel unten als Soll?
    3  Wenn Attrappe: war sie schon mal angebunden?
    4  Wenn Attrappe: was fehlt zum Anbinden?

`[read]` **Schritt 3 ist der wichtige** — **G-364 hat gezeigt, dass
ein Vermerk luegen kann.**

`[cmd]` **`git log -S` mit dem Kachelnamen oder der Lesefunktion
sagt es in Sekunden.**

## Je Modul, je Reiter — die Liste

`[cmd]` **Gemessen 2026-09-07, `apps/web/src/app/v2/`:**

    Nr  Modul          Dateien  Reiter  Stand
    --  -----------    -------  ------  --------------------------
     1  training            10      10  fertig -- 1 falsche Marke
     2  recovery            13       9  laeuft -- 23 Kandidaten
     3  supplements         18      11
     4  goals               15      10
     5  nutrition           42       9
     6  medical             14       6
     7  dashboard            4       0  keine Reiter
     8  settings             2       0  keine Reiter
     9  coach               18      10  eigene App, Port 3220

`[read]` **In dieser Reihenfolge, eins nach dem anderen.**

`[cmd]` **`training` ist fertig:** **elf markierte Kacheln geprueft,
eine falsche Marke gefunden** — die Today-Sitzungskarte rechnete aus
einem festen Objekt, waehrend `verlauf.sitzungen` daneben lag.

`[read]` **Dasselbe Muster wie `<RecMuscleMap />` ohne Prop**
(G-364).

`[cmd]` **Vier Marken waren richtig bedingt, sechs gehoeren zu den
Entwurfsansichten** — **also nicht jede Marke luegt.**

### Zu 7 und 8

`[cmd]` **`dashboard` und `settings` haben keine Reiter** —
**trotzdem Kacheln pruefen.**

### Zu 9

`[cmd]` **`coach` ist eine eigene App auf Port 3220** — **die Regeln
gelten dort genauso** (E-71). `[read]` **Aber erst nach `apps/web`,
und mit eigener Abnahme** (G-361).

## Was das Ergebnis sein soll

**Eine Tabelle je Modul:**

    Kachel | oben? | unten? | war angebunden? | was fehlt

`[read]` **Damit kann Tom entscheiden, was er anpackt** — **statt
zu messen, ob ein Vermerk stimmt.**

## Nach jedem Modul melden

`[read]` **Nicht am Ende.** `[cmd]` **Tom nimmt einzeln ab.**

`[read]` **Und nicht auf Bestaetigung warten, um weiterzumachen** —
**melden und weiterarbeiten.** `[read]` **Wenn Tom etwas
zurueckweist, kommt es als eigener Auftrag.**

## Was nicht zu tun ist

`[read]` **Wo etwas anbindbar ist und der Leseweg danebenliegt:
anbinden** — **das war G-364.**

`[read]` **Wo ein Leseweg fehlt: melden, nicht bauen.**

**Nichts auf `dev@lumeos.app` schreiben.**
Nicht committen, nicht stagen, nicht pushen.

### Nachweis je Modul

    Tabelle         alle vier Spalten, je Kachel
    falsche Marken  gezaehlt und entfernt
    angebunden      wie viele, Bildschirmfoto
    fehlt           was genau, je Kachel

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Bericht — training

**Claude Code, 2026-09-06.** **Erstes Modul, elf Marken geprueft.**

### Die Tabelle

    Kachel                    oben  unten  war angebunden  was fehlt
    ------------------------------------------------------------------
    Sitzungskachel (Today)    JA    --     NEIN            NICHTS
                                                           -> ANGEBUNDEN
    This week                 JA    --     ja, bedingt     nichts
    Training readiness        JA    --     ja, bedingt     nichts
    Weekly volume             JA    --     ja, bedingt     nichts
    Streak                    JA    --     ja, bedingt     nichts
    Mesocycle · Block 3       JA    --     nie             Blockplanung,
                                                           kein Schema
    Routines                  JA    --     nie             Vorlagen,
                                                           kein Schema
    Recent sessions           JA    --     nie             nichts, aber
                                                           doppelt *
    Volume by muscle · 4 wks  JA    --     nie             nichts, aber
                                                           doppelt *
    Plan-Kachel (ohne Titel)  JA    --     nie             Blockplanung
    History-Kachel (o. Titel) JA    --     nie             siehe *

    * Diese Kacheln stehen in `TrainingHistory`/`TrainingPlan` — den
      ENTWURFSANSICHTEN, die seit G-359 UNTER der echten stehen. Ihre
      Marke ist richtig: sie SIND die Referenz.

### Was gefunden wurde: eine falsche Marke

`[cmd]` **Die Sitzungskachel des Today-Reiters trug
`attrappe={ATTRAPPE}` und rechnete mit einem fest verdrahteten
Objekt** (`Push B`, `6.2 t`, `~74m`).

`[cmd]` **Daneben lag `verlauf.sitzungen` seit G-69 als Prop an** —
**die Kachel nahm es nur nicht.** **Genau die Sache aus G-364.**

`[cmd]` **Gemessen: `dev@lumeos.app` hat 14 Sitzungen mit
`status='planned'`**, die naechste ist *Push 7*, 2026-09-06, 17:30,
75 min geplant.

**Angebunden.** `[cmd]` **Am Schirm: die Kachel zeigt *Push 7 ·
Gym · planned · 2026-09-06 · 0 sets · ~75m* mit der Pille *echte
Daten*.** **Attrappen im Today-Reiter: 1** (die Uebungsliste).

`[cmd]` **Bildschirmfoto: `backup/g359b-training-g365-today.png`.**

### Was dabei fast schiefgegangen waere

`[cmd]` **Erster Versuch filterte `!s.absolviert`** — **und
uebersprang damit die HEUTIGE Sitzung**, weil `absolviert` aus dem
Datum kommt.

`[cmd]` **Die Kachel zeigte *Pull 7* vom 12.09., waehrend die
Wochenzeile darunter *Push 7* als heute markierte** — **zwei
Aussagen auf einem Schirm, die sich widersprachen.**

`[read]` **Am Schirm aufgefallen, nicht im Test.** **Behoben: die
naechste Sitzung ist die erste ab dem Stichtag, einschliesslich
heute.**

### Was Entwurf bleibt, und warum

`[cmd]` **Die Uebungsliste der Sitzung.**
`[cmd]` **`ladeSitzungsUebungen` gibt es** (`sitzungen-read.ts`),
**wird an diese Ansicht aber nicht durchgereicht.**

`[read]` **Gemeldet, nicht gebaut** — der Auftrag sagt: wo ein
Leseweg fehlt, melden. **Hier fehlt er nicht, er ist nur nicht
verdrahtet** — das waere Leseweg-Arbeit und damit ausserhalb.

`[cmd]` **`total_sets` und `total_volume_kg` sind bei geplanten
Sitzungen `0`** — **kein Messwert, sondern ein Training, das noch
nicht stattgefunden hat.** **Die Kachel zeigt einen Strich statt
einer erfundenen Tonnage** (C-378).

### Vier Marken sind bedingt und damit richtig

`[cmd]` **`This week`, `Training readiness`, `Weekly volume`,
`Streak` stehen im SONST-Zweig eines Ternaers** — sie erscheinen
nur ohne Daten.

`[cmd]` **Auf `dev` laufen alle vier echt:** am Schirm belegt
*,,Training readiness · aus recovery.scores · 2026-11-06"* und
*,,Saetze je Muskelgruppe · 19 absolvierte Sitzungen"*.

`[read]` **Das ist der Unterschied, den G-364 gelehrt hat:** **eine
bedingte Marke luegt nicht, eine unbedingte kann es.**

### Sechs Marken sitzen in den Entwurfsansichten

`[cmd]` **`Recent sessions`, `Volume by muscle`, `Mesocycle`,
`Routines` und zwei Kacheln ohne Titel stehen in
`TrainingHistory`** (Z818) **und `TrainingPlan`** (Z713).

`[cmd]` **Schritt 3 nachgemessen:** `git log -S "Recent sessions"`
**nennt nur `1bb38876 add the training module as a marked
mockup`** — **nie angebunden.**

`[read]` **Und sie sollen es nicht sein:** **seit G-359 stehen
diese Ansichten UNTER der echten** (`Sitzungen`, `Kennzahlen` in
`tab-verlauf.tsx`). **Sie sind die Referenz, nicht der Ist-Stand.**

### Zahlen

    Marken in ansicht.tsx        11
      bedingt (richtig)           4
      Entwurfsansicht (richtig)   6
      FALSCH                      1  -> angebunden
    Attrappen Today-Reiter    3 -> 1

### Ein Waechter musste nachziehen

`[cmd]` **`v2-attrappen.test.ts:219`: TRAINING 11 -> 10.**

`[read]` **Nicht abgeschwaecht** — der Kommentar dort sieht genau
das vor: *,,wer eine anbindet, entfernt `attrappe` und zaehlt die
Erwartung herunter."*

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    next lint       keine Warnung, kein Fehler
    Tests           1500 / 1500 gruen, 0 Fehler
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

**Naechstes Modul: recovery** (die restlichen Kandidaten aus G-364).

## Abnahme

_(vom Orchestrator)_

## Bericht — recovery

**Claude Code, 2026-09-06.** **21 unbedingte Marken geprueft, vier
angebunden.**

### Die Tabelle

    Kachel                  oben  unten  war angebunden  was fehlt
    ------------------------------------------------------------------
    Logged today            JA    --     NEIN            NICHTS -> AN
    Best next-day rating    JA    --     NEIN            NICHTS -> AN
    Awaiting rating         JA    --     NEIN            NICHTS -> AN
    Effectiveness log       JA    --     NEIN            NICHTS -> AN
    Belegte Modalitaeten    JA    --     nie             nichts *
    Modality catalog        JA    --     nie             Wirkung je Art
                                                          (Register, kein
                                                          Nutzerbezug)
    Pending actions         JA    --     nie             Aufgabenquelle
    Overtraining watch      JA    --     nie             8 Signale, kein
                                                          Schema
    Signal panel            JA    --     nie             dito
    Severity                JA    --     nie             dito
    Alert lifecycle         JA    --     nie             dito
    Protocol library        JA    --     nie             Protokolltabelle
    When to run which       JA    --     nie             dito
    Contributors            JA    --     nie             Score-Beitraege
                                                          je Modul
    14 days                 JA    --     nie             dito
    Log stress              JA    --     nie             Stresstabelle
    What helps you          JA    --     nie             dito
    Morning check-in        JA    --     nie             Formular, kein
                                                          Schreibweg hier
    Readiness levels        JA    --     nie             Stufen sind
                                                          Urteilssprache
    Why check in daily      JA    --     nie             Erklaertext
    Phone camera HRV        JA    --     nie             Geraetefunktion
    Score paths             JA    --     nie             Erklaertext

    * zaehlt das Evidenzregister, nicht Nutzerdaten — die Marke ist
      richtig und bleibt.

### Was gefunden wurde: vier falsche Marken

`[cmd]` **`<RecModalities />` wurde OHNE Prop gerufen** — **zum
dritten Mal dasselbe Muster** (G-364 Muskelkacheln, G-365 training
Sitzungskachel).

`[cmd]` **Daneben: `recovery.modality_log` mit 178 Zeilen**, gelesen
von `scores-read.ts` samt `jeArt` und dem GEMESSENEN
Folgetagsunterschied (C-153).

**Angebunden:**

    Logged today          heute erfasst · 89 gesamt
    Best next-day rating  8/10 · massage · 2026-10-15
    Awaiting rating       aus next_day_effect
    Effectiveness log     89 Zeilen, echte Daten

`[cmd]` **Am Schirm belegt** (`backup/g359b-recovery-g365m-modalities.png`):
**Attrappen im Reiter 7 -> 3**, die Liste zeigt *Stretching 13 min ·
11-03*, *Sauna 26 min · 10-30*, *Cold plunge 4 min · Eisbad nach
Training* — mit Sofort- und Folgetagsurteil.

### Was Entwurf bleibt, und warum

`[read]` **Die uebrigen 17 sind ehrlich markiert** — **fuer keine
gibt es einen Leseweg:**

    Uebertraining (5 Kacheln)   die 8 Signale haben kein Schema
    Protokolle (2)              keine Protokolltabelle
    Stress (2)                  keine Stresstabelle
    Beitraege (2)               Score je Modul wird nicht gefuehrt
    Check-in (3)                Formular, Erklaertext, Urteilsstufen
    HRV/Sleep (2)               Geraetefunktion, Erklaertext
    Modality catalog (1)        Register ohne Nutzerbezug

`[cmd]` **Schritt 3 nachgemessen fuer zwei davon:**
`git log -S "Signal panel"` und `-S "Protocol library"` **nennen nur
`e274735b add the recovery module as a marked mockup`** — **nie
angebunden.**

`[read]` **Gemeldet, nicht gebaut**, wie beauftragt.

### Zahlen

    unbedingte Marken           21
      FALSCH                     4  -> angebunden
      ehrlich (kein Leseweg)    17
    Attrappen Modalities     7 -> 3
    Marken tab-protokolle   17 -> 13

### Ein Waechter musste nachziehen

`[cmd]` **`v2-attrappen.test.ts`: tab-protokolle 17 -> 13.**

`[cmd]` **Gegengeprueft, warum nicht 16:** der Waechter zaehlt
`attrappe={ATTRAPPE}` (12) und das blosse `attrappe` (1) — **die
vier bedingten Formen zaehlt er nicht mehr mit, und das ist
richtig.**

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    next lint       keine Warnung, kein Fehler
    Tests           1500 / 1500 gruen, 0 Fehler
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

**Naechstes Modul: supplements** (18 Dateien, 11 Reiter).

## Abnahme

_(vom Orchestrator)_

## Bericht — supplements

**Claude Code, 2026-09-06.** **35 unbedingte Marken geprueft, KEINE
falsch.** **Nichts geaendert.**

### Die Tabelle

    Kachelgruppe (Datei)      oben  unten  war angebunden  was fehlt
    ------------------------------------------------------------------
    Compliance (4)            JA    JA *   nie             nichts *
    Extended (6)              JA    --     nie             user_supplement_
                                                            cycles: 0 Zeilen
    Injektionen (14)          JA    --     nie             medical.injection_
                                                            logs: 0 Zeilen,
                                                            kein Leseweg
    Intelligence (11)         JA    --     nie             GAP_ROWS ist
                                                            Entwurf; Sitzung
                                                            fehlt im Kontext

    * `ComplianceEcht` rendert DARUEBER (G-359). Die vier Marken
      gehoeren der Entwurfsfassung, die als Referenz darunter steht —
      sie SIND das Soll.

### Warum keine falsch ist

`[read]` **Anders als in training und recovery liegt hier kein
ungenutzter Leseweg daneben.** **Je Gruppe nachgemessen:**

`[cmd]` **Injektionen:** `medical.injection_logs` hat **0 Zeilen**,
`injection_site_conditions` **0**. `[cmd]` **Und es gibt keinen
Leseweg** — `grep` ueber `apps/web/src/lib` findet keine Datei, die
`injection_logs` liest. **14 Marken, alle ehrlich.**

`[cmd]` **Extended:** `supplements.user_supplement_cycles` hat **0
Zeilen**. **6 Marken, alle ehrlich.**

`[cmd]` **Intelligence:** die Zahlen kommen aus `GAP_ROWS` und
`CATALOG` — **Entwurfskonstanten in `daten.ts`, keine Tabelle.**
`[cmd]` **Und *Session today · Push B* haette einen Leseweg**
(`verlauf.sitzungen`, gerade in training angebunden) — **aber der
Supplements-Kontext fuehrt keine Sitzung.** `[read]` **Das waere
Leseweg-Arbeit und ist ausserhalb dieses Auftrags** — gemeldet.

`[cmd]` **Compliance:** `supplements.intake_logs` hat **810 Zeilen**,
und **`ComplianceEcht` liest sie bereits** (`ansicht.tsx:331`).
**Die vier Marken sitzen in `SuppCompliance`, der Entwurfsfassung
darunter.**

### Ein Fehlalarm im eigenen Vorgehen

`[cmd]` **`Redundancy detection` sah zuerst wie ein Fund aus:** die
Kachel rechnet aus `doppelt`, also aus einer Variablen — **nicht aus
einer festen Zahl.**

`[cmd]` **Nachgesehen: `doppelt` filtert `GAP_ROWS`**
(`tab-spec.tsx:192`), **eine Entwurfskonstante.** `[read]` **Eine
Rechnung ueber erfundene Zahlen bleibt erfunden** — **die Marke ist
richtig.**

`[read]` **Die Lehre: „rechnet statt fest verdrahtet" ist kein
Beleg fuer Anbindung.** **Die Frage ist, woher die Eingabe kommt.**

### Schritt 3, nachgemessen

`[cmd]` `git log -S` **fuer drei Kacheln:**

    Rotation map          5d5bdffb  complete the supplements mockup
    Active protocols      f4199db8  fill the supplements sub components
    Redundancy detection  5d5bdffb  complete the supplements mockup

`[read]` **Alle drei kamen als Mockup herein und waren nie
angebunden.**

### Am Schirm, alle elf Reiter

    Reiter       Attrappen  Kacheln     Reiter      Attrappen  Kacheln
    today             10       16       intel             7        8
    stack              2        3       injection         7       11
    inventory          6       11       extended          7        8
    compliance         4        7       cost             10       10

`[cmd]` **`stack` mit 2 von 3 und `compliance` mit 4 von 7 zeigen,
dass die echten Fassungen oben laufen** — die Attrappen darunter
sind die Referenz aus G-359.

### Zahlen

    unbedingte Marken     35
      FALSCH               0
      ehrlich             35
    geaendert              nichts

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    next lint       keine Warnung, kein Fehler
    Tests           1500 / 1500 gruen, 0 Fehler
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

**Naechstes Modul: goals** (15 Dateien, 10 Reiter).

## Abnahme

_(vom Orchestrator)_

## Auftrag 2 — E-72: anbinden heisst mit Daten

**Beauftragt am 2026-09-07.**

Tom: *,,wenn wir was anbinden sollen auch daten dafuer da sein um es
anzuzeigen und nicht einfach verschwinden und jeder vergisst es."*

`[cmd]` **Supplements-Heute zeigt `TODAY'S ADHERENCE 0 / 9`,
`TAKEN 0`.**

`[read]` **Die Anbindung steht, der Bestand fehlt** — **und die
Kachel zeigt Null, als waere das ein Ergebnis.**

### Ein fuenfter Schritt

    1  Ist die Mockup-Kachel oben vorhanden?
    2  Wenn angebunden: setz die Mockup-Kachel UNTEN als Soll
    3  Wenn Attrappe: war sie schon mal angebunden?
    4  Wenn Attrappe: was fehlt zum Anbinden?
    5  Wenn angebunden: LIEGEN DATEN VOR?           <-- neu

`[read]` **Bei 5 nein: melde es, mit Tabelle und Zeilenzahl.**

`[read]` **Und setz einen benannten Leerhinweis statt einer Null** —
**nicht *,,0 von 9"*, sondern *,,keine Einnahmen erfasst"*.**

`[cmd]` **`dev@lumeos.app` traegt echte Daten** — **eine Kachel, die
dort leer bleibt, ist ein Befund.**

### Rueckwirkend

`[read]` **Fuer `training`, `recovery` und `supplements`
nachziehen** — **die drei Module sind geprueft, aber ohne Schritt
5.**

## Bericht — goals, und die Trennlinie nachgezogen

**Claude Code, 2026-09-06.**

### Zuerst: Tom hat recht, Schritt 2 fehlte

**Tom, 2026-09-07:** *,,es hat 4 kacheln angebunden aber keine
originale nach der linie respektive es hat gar keine linie"*.

`[cmd]` **Nachgemessen: die PAARE standen ueberall** (echt oben,
Entwurf darunter, seit G-359) — **die LINIE dazwischen stand nur in
`v2/recovery`.**

`[read]` **Ohne sie sind es zwei Fassungen derselben Kachel ohne
Zuordnung** — genau das, was er gesehen hat.

**Neu: `components/shell/referenz-trenner.tsx`**, einmal fuer alle
Module. **Zwoelf Linien eingesetzt:**

    supplements   5   today, stack (2x), database, cost
    ansicht       2   compliance, inventory
    training      5   history, exercises, progression,
                      standards, calendar
    nutrition     3   pre-workout, mikro, planner
    goals         3   phase, physique, timeline

`[cmd]` **Am Schirm gegengeprueft, alle zwoelf Reiter tragen die
Marke *Mockup-Referenz*.**

### goals — die vier Schritte

    Kachel                oben  unten  war angebunden  was fehlt
    ------------------------------------------------------------------
    Calculation trace     JA    --     NEIN            NICHTS -> AN
    Phase engine (12)     JA    JA     nie             Phasen-Schreibweg
    Physique (7)          JA    JA     nie             PhysiqueEcht
                                                        laeuft darueber
    Goal timeline (1)     JA    JA     nie             ZeitachseTab
                                                        laeuft darueber

`[cmd]` **Eine falsche Marke: `Calculation trace`.**

`[cmd]` **Die Prop `tdee` lag an** — `TdeeKopf` benutzt sie seit
GO-16 — **die Kachel daneben rechnete mit `TDEE_STATE`.**

`[cmd]` **Gemessen ueber `goals.adaptive_tdee(dev, current_date)`:**
14 Tage, Zufuhr 2.379,2 kcal, Delta 0,330 kg, roher TDEE 2.183,7,
`alpha` 1,0, Vertrauen **high**.

`[cmd]` **Am Schirm nachher:**

    Calculation trace
    14 Tage · Vertrauen high        [echte Daten]
    Δweight        = 0.33 kg
    caloricDelta   = 0.33 × 7700 = 2541 kcal
    rawTDEE        = 2,184 kcal/day
    EMA (α = 1)     = 2,183.7 kcal/day
    Formel-Grundlage 3,202.1 kcal/day

`[read]` **Die modeluebergreifenden Korrekturen bleiben Entwurf** —
`adaptive_tdee` liefert sie nicht. **Sie stehen weiter im markierten
Block darunter.**

### E-72, Schritt 5 — und der Befund faellt anders aus

**Tom, 2026-09-07:** *,,Supplements-Heute zeigt TODAY'S ADHERENCE
0 / 9, TAKEN 0."*

`[cmd]` **Nachgemessen: `dev@lumeos.app` hat 360 Einnahmezeilen** —
**von 2026-05-22 bis 2026-08-19.**

`[cmd]` **Und am Schirm zeigt die ANGEBUNDENE Kachel `4 / 4`, LOGGED
`2026-08-19`.** `[cmd]` **Die `0 / 9` steht in der
ENTWURFSFASSUNG darunter** — die jetzt hinter der Trennlinie liegt
und als Referenz gekennzeichnet ist.

`[read]` **Der Befund war also die fehlende Linie, nicht eine leere
Anbindung.** **Mit der Linie ist ablesbar, welche Zahl gilt.**

`[cmd]` **Trotzdem nachgezogen, weil E-72 es verlangt:** die echte
Kachel sagt jetzt *,,Letzter erfasster Tag"* statt *,,Today's
adherence"*, wenn der juengste Eintrag nicht der Stichtag ist —
**und bei null Zeilen steht *,,Keine Einnahmen erfasst. Zuletzt am
…"* statt einer Null.**

`[read]` **Eine Null liest sich wie ein Ergebnis. Der Satz sagt, was
sie bedeutet.**

### Zwei Waechter mussten nachziehen

`[cmd]` **`v2-attrappen.test.ts`: goals/tab-phase 15 -> 14** (die
angebundene Kachel).

`[cmd]` **`stack-lage.test.ts` G-253 fiel mit *,,Zweig nicht
gefunden"*** — **nicht wegen einer zweiten Ansicht, sondern weil das
Suchfenster 300 Zeichen betrug und die Trennlinie den Zweig
verlaengert hat.**

`[read]` **Zwei Berichtigungen, keine Abschwaechung:** das Fenster
auf 600, und `<ReferenzTrenner` faellt aus der Ansichtszaehlung —
**er traegt keine Daten.** `[read]` **Die Zusage *,,genau zwei
Ansichten"* gilt unveraendert.**

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    next lint       keine Warnung, kein Fehler
    Tests           1500 / 1500 gruen, 0 Fehler
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

**Bildschirmfoto:** `backup/e72-supplements-today.png` — oben die
angebundene Kachel mit `4 / 4`, darunter die Linie, darunter der
Entwurf mit `0 / 9`.

**Offen: nutrition, medical, dashboard, settings** — dort noch keine
vier Schritte gelaufen.

## Abnahme

_(vom Orchestrator)_

## Bericht — recovery gegen A1 bis A5 (Zwischenstand)

**Claude Code, 2026-09-06.** **Gemessen, nicht fertiggebaut** — die
Machart gehoert abgenommen, bevor die uebrigen 119 Kacheln folgen.

### Die Tabelle, am Schirm gemessen

    Reiter         Kacheln  angeb.  Attr.  Referenz   A1
    -----------------------------------------------------------
    today               14       6      6         2   6 vs 2
    checkin              6       3      3         0   3 vs 0
    muscles              3       3      0         0   3 vs 0
    hrv                 12       4      5         3   4 vs 3
    sleep               10       4      4         2   4 vs 2
    modalities           7       5      2         0   5 vs 0
    overtraining         4       1      3         0   1 vs 0
    protocols            4       1      3         0   1 vs 0
    stress               6       1      5         0   1 vs 0
    -----------------------------------------------------------
    SUMME               66      28     31         7   28 vs 7

`[cmd]` **Kein Reiter erfuellt A1.** `[read]` **Das ist der ehrliche
Stand** — ich hatte je Reiter EINE Linie gebaut, nicht je Kachel
eine Referenz.

### Warum die Quelltextzaehlung nicht taugt

`[cmd]` **Vier Reiter teilen sich `tab-protokolle.tsx`** —
modalities, overtraining, protocols, stress. `[cmd]` **Eine Zaehlung
je Datei meldet fuer alle vier dieselben 17 Kacheln.**

`[read]` **Deshalb sind die Zahlen oben am SCHIRM gemessen**, je
Reiter einzeln: `.v2-card` gezaehlt, Attrappen an der Pille erkannt,
Referenzen am Grundtext (*„Soll zu …"*).

### A3 — die Marken tragen keinen Grund

`[cmd]` **24 Attrappen in `v2/recovery`, davon 0 mit
`attrappeAus(...)`.**

`[read]` **Sie tragen alle die pauschale Marke `ATTRAPPE`** — den
Satz *,,noch nicht angebunden, die Zahlen sind erfunden"*. **E-68
verlangt Quelle und Grund je Kachel.**

`[cmd]` **Die Liste steht in `backup/` und umfasst u. a.:** Pending
actions, Overtraining watch, Morning check-in, Readiness levels,
Phone camera HRV, Score paths, Modality catalog, Signal panel,
Severity, Alert lifecycle, Protocol library, Contributors, 14 days,
Log stress, What helps you.

### A4 — vier falsche Marken gefunden und behoben

`[cmd]` **In diesem und den vorigen Durchgaengen:**

    G-364  Muscle recovery / Per-muscle detail / Muscle readiness
           -> recovery.checkins.soreness, {"back":1,"chest":1}
    G-365  Logged today / Best next-day / Awaiting rating /
           Effectiveness log
           -> recovery.modality_log, 178 Zeilen

`[read]` **Immer dieselbe Form: die Komponente wurde ohne Prop
gerufen**, waehrend eine Schwesterkomponente daneben sie bekam.

### A5 — keine nackte Null gefunden

`[cmd]` **Die angebundenen Kacheln zeigen Werte:** Score 74,9,
30 Check-ins, 89 Modalitaeten, Muskelkater aus dem Check-in
2026-11-06.

`[cmd]` **Der E-72-Fall lag in supplements, nicht hier** — und war
die Entwurfsfassung unter der Linie (`0 / 9`), waehrend die echte
`4 / 4` zeigte.

### Was ich gebaut habe, und was fehlt

`[cmd]` **Gebaut: 7 Referenzen mit Zuordnung.** **Neu ist die
Zuordnung selbst** — jede Referenz nennt ihre Kachel:

    Attrappe — theme-v1/module-recovery-v2.jsx · wartet auf:
    nichts — Referenz zum Vergleich · Soll zu „Messprotokoll"

`[read]` **Ohne sie stehen unten Titel, die es oben nicht gibt** —
`HRV score` gegen `HRV`, `Measurement log` gegen `Messprotokoll`.
**Genau die Uebersetzung, die C-418 gemessen hat.**

**Es fehlen 21 Referenzen in recovery:**

    today          4   Score, Modalitaeten, Check-in-Streifen,
                       Verlauf
    checkin        3   Vorschau + zwei
    muscles        3   Muscle recovery, Per-muscle detail, Karte
    hrv            1   die vierte angebundene Kachel
    sleep          2
    modalities     5   die vier neu angebundenen + Katalog
    overtraining   1
    protocols      1
    stress         1

### Eine Frage, bevor ich weiterbaue

`[read]` **Bei `modalities` sind fuenf Kacheln angebunden, aber der
Mockup-Reiter hat dafuer keine fuenf Gegenstuecke** — die vier
Zahlenkacheln sind im Mockup ein einziger Block.

**Tom sagte:** *,,wo eine Mockup-Kachel keine eigene Entsprechung
hat, weil sie im Mockup anders geschnitten ist: melde es, statt
eine zu erfinden."*

`[read]` **Also gemeldet:** fuer die vier Zahlenkacheln
(`Logged today`, `Best next-day rating`, `Belegte Modalitaeten`,
`Awaiting rating`) **gibt es im Mockup EINE Zeile, keine vier
Kacheln.** **Soll dort eine Referenz mit dem Hinweis stehen, oder
gar keine?**

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    Tests           1500 / 1500 gruen
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

## Abnahme

_(vom Orchestrator)_

## Bericht — recovery, je Kachel eine Referenz (Zwischenstand 2)

**Claude Code, 2026-09-06.**

### Die Tabelle, am Schirm gemessen

    Reiter         Kacheln  angeb.  Attr.  Referenz   A1
    -----------------------------------------------------------
    today               15       6      6         3   6 vs 3
    checkin              6       3      3         0   3 vs 0
    muscles              3       3      0         0   3 vs 0
    hrv                 12       4      5         3   4 vs 3
    sleep               11       4      4         3   4 vs 3
    modalities           7       5      2         0   5 vs 0 *
    overtraining         4       1      3         0   1 vs 0
    protocols            4       1      3         0   1 vs 0
    stress               6       1      5         0   1 vs 0
    -----------------------------------------------------------
    SUMME               68      28     32         9   28 vs 9

`[cmd]` **Von 7 auf 9 Referenzen** — und jede nennt jetzt ihre
Kachel.

### Was in diesem Durchgang dazukam

    Erholungswert       -> Mockup-Score-Kachel (Z110, ohne Titel)
    Muscle readiness    -> Muscle readiness (Z170)
    Schlafhygiene       -> Sleep hygiene inputs (Z632)

`[cmd]` **`Sleep hygiene inputs` war in C-418/3 als Selbstreferenz
entfernt worden** — **falsch: die gebaute `Schlafhygiene` liest den
Check-in, ist also angebunden und braucht ihr Gegenstueck.**
**Zurueckgenommen.**

### Die Zuordnung, wie Tom sie verlangt hat

`[cmd]` **Jede Referenz traegt jetzt den Titel ihrer Kachel:**

    Attrappe — theme-v1/module-recovery-v2.jsx · wartet auf:
    nichts — Referenz zum Vergleich · Soll zu „Messprotokoll"

`[read]` **Ohne sie stehen unten Titel, die es oben nicht gibt** —
`HRV score` gegen `HRV`, `Measurement log` gegen `Messprotokoll`.

### Benannte Ausnahmen

    modalities | 4 oben | 1 unten | A1 Ausnahme: das Mockup hat
                                    EINE Zeile fuer vier
                                    Zahlkacheln (Z200)

`[cmd]` **Und zwei Kacheln haben ueberhaupt kein Gegenstueck:**

    Morning check-ins  (checkin-streifen.tsx)  kein Mockup
    Verlauf (Score)    (score-kachel.tsx)      kein Mockup

`[read]` **Beide sind nach dem Mockup gebaut worden, aber als
eigene Kachel** — **im Mockup steht der Check-in als Formular
(Z258), nicht als Streifen, und der Score-Verlauf gar nicht.**
**Gemeldet, nicht erfunden.**

### Was noch fehlt: 14 Referenzen in recovery

    checkin         3   Vorschau + zwei titellose
    muscles         3   Muscle recovery, Per-muscle detail, Karte
    today           3   Morning check-ins*, Verlauf*, eine titellose
    hrv             1   eine titellose
    sleep           1   eine titellose
    modalities      1   (die Ausnahme oben)
    overtraining    1
    protocols       1
    stress          1

    * ohne Mockup-Gegenstueck, siehe Ausnahmen

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    next lint       keine Warnung, kein Fehler
    Tests           1500 / 1500 gruen, 0 Fehler
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

`[read]` **recovery ist noch nicht fertig** — 14 von 28 Referenzen
fehlen. **Ich baue weiter, nach der bestaetigten Machart, und melde
das Modul, wenn A1 fuer alle neun Reiter steht oder als benannte
Ausnahme dasteht.**

## Abnahme

_(vom Orchestrator)_
