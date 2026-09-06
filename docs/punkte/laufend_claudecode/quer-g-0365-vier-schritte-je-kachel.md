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
