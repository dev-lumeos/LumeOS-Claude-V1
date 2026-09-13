---
nr: G-440
typ: fehler
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: abc0698f
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/motor.ts
zahlen:
  gemessen: 2026-09-08
  schluessel: 18
  namen: 105
---

# G-440 — MUSCLE_STATE ist eine Attrappe, die Kachel sagt „echte Daten"

## Toms Befund

Tom, 2026-09-08:

> oben steht echte daten und es korrespondiert von der grafik
> nicht in die liste, und zweidrittel der liste zeigt keine werte

> das ist alles dreck was hier geliefert wird und verarschend
> gegenueber mich. ich rackere mich hier ab und mir wird irgendwas
> serviert aus den haenden gezogen und als echte daten verkauft

`[read]` **Er hat recht.**

## Der Befund

`[cmd]` **`motor.ts:135`, im Code selbst dokumentiert:**

    // [cmd] module-recovery-engine.jsx:135-154
    export const MUSCLE_STATE: Record<string, MuscleState> = {
      chest: { hours: 38, sets: 14, soreness: 1,
               lastSession: 'Push B - Wed' },
      front_deltoids: { hours: 38, sets: 10, ... },
      ...
    }

`[read]` **Achtzehn FESTE Zeilen, abgeschrieben aus dem
Mockup.**

`[cmd]` **`Push B - Wed` ist kein Datum aus der Datenbank.**

`[cmd]` **Und die achtzehn Schluessel sind genau die ALTEN
Kartenflaechen vor G-430:**

    chest, front_deltoids, triceps, upper_back,
    back_deltoids, biceps, forearm, trapezius,
    quadriceps, hamstring, gluteal, calves,
    adductor, abductors, lower_back, abs,
    obliques, neck

`[read]` **`upper_back`, `gluteal`, `hamstring`, `quadriceps`,
`calves`, `adductor` gibt es auf der Karte seit G-430/G-431/G-434
nicht mehr.**

## Warum zwei Drittel leer sind

    Karte             43 Muskeln, einzeln anwaehlbar
    Hierarchie       105 Namen
    MUSCLE_STATE      18 feste Zeilen aus dem Mockup

`[read]` **Jeder Wert in der Liste kommt aus einer dieser 18
Zeilen** ? **direkt oder geliehen (G-438).**

`[read]` **Die restlichen 87 haben nichts, weil die Attrappe sie
nicht kennt.**

## Und das Etikett ist falsch

`[cmd]` **Die Kachel traegt `echte Daten`.**

`[cmd]` **Der Muskelkater kommt wirklich aus `recovery.checkins`**
? **die Stunden und Saetze NICHT.**

`[read]` **Ein gemischter Zustand, der sich als echt
ausgibt.**

`[cmd]` **Der Attrappenwaechter hat es nicht gesehen** ? **er
sucht `ATTRAPPE`-Marken in der Ansicht, nicht Datenquellen in der
Rechnung.**

## Was wirklich dasteht

`[cmd]` **Gemessen:**

    training.workout_sets        258 Saetze
    training.workout_sessions     66 Sitzungen
    training.exercise_muscles  6.588 Zuordnungen
                               auf 95 Muskeln

`[read]` **Daraus laesst sich je Muskel rechnen:**

    hours    Stunden seit der letzten Sitzung, die
             diesen Muskel traf
    sets     Saetze in dieser Sitzung, die auf ihn
             zeigten
    lastSession  die Sitzung selbst

`[cmd]` **Die Erholungsformel steht DARUEBER in derselben
Datei:**

    base(hours) x volume_mod x sleep_mod
                x nutrition_mod x soreness_mod

`[read]` **Sie ist echt. Sie bekommt nur Attrappenzahlen.**

## Was zu bauen ist

**1** ? **`MUSCLE_STATE` wird gerechnet, nicht geschrieben.**

`[read]` **Aus `workout_sets` x `exercise_muscles` je
`muscle_group_id`.**

`[cmd]` **`exercise_muscles` hat `role`:** `primary` **3.053,**
`secondary` **3.535.**

`[read]` **Wie die Rolle in die Saetze eingeht, ist C-487** ?
**bis dahin zaehlt ein Satz fuer jeden zugeordneten Muskel
gleich, UND DIE KACHEL SAGT ES.**

**2** ? **Das Etikett wird ehrlich.**

`[read]` **Solange ein Teil geschaetzt ist, steht das dran** ?
**nicht `echte Daten`.**

`[cmd]` **`C-466` macht es vor:** `unmapped_taken_log_count`
**zaehlt, was fehlt.**

**3** ? **Ein Waechter fuer Datenquellen.**

`[read]` **Eine Kachel, die `echte Daten` traegt, darf keine
feste Tabelle im Rechenweg haben.**

`[cmd]` **Miss, wo es sonst noch so ist** ? **`motor.ts` ist
34 KB, `MUSCLE_STATE` ist vielleicht nicht die einzige.**

## Abnahmebedingungen

    A1  MUSCLE_STATE gerechnet, nicht geschrieben.
        Je Muskel: hours, sets, lastSession aus
        workout_sets.
    A2  wie viele der 105 haben jetzt einen EIGENEN
        Wert? Vorher 18. Gemessen.
    A3  das Etikett sagt die Wahrheit. Foto.
    A4  was noch geschaetzt ist, steht dran.
    A5  ein Waechter: keine feste Datentabelle im
        Rechenweg einer "echte Daten"-Kachel.
        GRUEN.
    A6  wo es sonst noch so ist: Liste.
    A7  Gegenprobe: eine feste Tabelle eingebaut
        -> faellt sie?
    A8  vier Module unveraendert.
    A9  apps/web 1689 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**KEINE Zahl erfinden** ? **wo kein Satz auf einen Muskel zeigt,
hat er keinen Wert.**

**Das Etikett NICHT auf `echte Daten` lassen, solange es nicht
stimmt.**

**Nichts in `supabase/`** ? **Codex arbeitet an C-489.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

**Erledigt.** `MUSCLE_STATE` ist aus dem Rechenweg raus, die Werte
kommen aus `workout_sets`, und das Etikett sagt `teilweise
gemessen` statt „echte Daten".

**Tom hat recht gehabt, und ich habe es vier Auftraege lang nicht
gefragt.** Ich habe auf `MUSCLE_STATE` gerechnet (G-435, G-436,
G-438) und das Etikett nie gegen seine Quelle gehalten.

### Vorher gemessen — alle Auftragszahlen stimmen

`[cmd]` `tools/_g440-quellen.mjs`:

    workout_sets        258   (Auftrag nennt 258)
    workout_sessions     66   (66)
    exercise_muscles  6.588   (6.588)
    role: primary     3.053   (3.053)
          secondary   3.535   (3.535)

**Ein Befund zur Kette:** `[cmd]` **`workout_sets` hat KEIN
`exercise_id` und KEIN `session_id`** — die erste Messung
verknuepfte ins Leere und meldete *„0 von 105"*. `[read]` **Die
Zwischentabelle `workout_exercises` (132 Zeilen) traegt beides.**

    workout_sets.workout_exercise_id
      -> workout_exercises.exercise_id
         -> exercise_muscles.muscle_group_id
      -> workout_exercises.workout_session_id
         -> workout_sessions.session_date, .name, .user_id

### A1 — gerechnet, nicht geschrieben

`lib/training/muskelzustand.ts` — reine Rechnung, kein Import, so
dass sie ueber die `'use client'`-Grenze kann und pruefbar bleibt.

**Von Hand nachgerechnet** (`g440-muskelzustand.test.ts`, 10
Waechter):

    Sitzung A (01.09.): Bank 3 Saetze
    Sitzung B (10.09.): Bank 2 Saetze, Klimmzug 4

    brust.hours        48   (12.09. minus 10.09.)
    brust.sets          2   NICHT 5 — die Erholung fragt nach dem
                            LETZTEN Reiz, nicht nach der Summe
    brust.lastSession  „Pull 2"  aus workout_sessions.name

**Entscheidungen, die ich begruendet habe:**

`[read]` **`sets` zaehlt NUR die juengste Sitzung** — die
Erholungsformel fragt, was zuletzt anlag.

`[read]` **`rollen` zaehlt ueber ALLE Sitzungen** — das ist der
Ausweis fuer C-487, nicht die Satzzahl. **Meine erste Testfassung
verwechselte die beiden**; die Probe haelt den Unterschied jetzt
fest.

`[read]` **`jetzt` wird hereingereicht**, nicht aus `Date.now()`
genommen — sonst haenge die Stundenzahl davon ab, wann die Probe
laeuft.

### A2 — wie viele haben jetzt einen EIGENEN Wert?

    vorher   18   feste Zeilen aus dem Mockup
    jetzt    17   aus workout_sets gerechnet

`[read]` **Das ist ehrlicher, nicht mehr** — und die Zahl ist der
eigentliche Befund dieses Auftrags.

`[cmd]` **Der Grund, gemessen:**

    verschiedene Uebungen in den Sitzungen:      6
    Uebungen mit Muskelzuordnung im Katalog: 1.411

`[read]` **Die Seed-Daten decken einen Bruchteil ab.** **Nicht die
Rechnung ist duenn, die Daten sind es.**

**Und von den 17 zeichnet die Karte nur 5** — die anderen zwoelf
sind Gruppen (`Shoulders`, `Triceps`, `Quadriceps`), deren Kinder
gezeichnet werden, nicht sie selbst. `[cmd]` **Am Schirm: 9 von 105
mit Wert** (5 gezeichnete + 4 Gruppen mit Schnitt).

`[read]` **Die 18 vorher waren KEINE Deckung** — sie waren
erfunden. **17 gemessene sind weniger Zahlen und mehr Wahrheit.**

### A3 — das Etikett sagt die Wahrheit

    vorher   „echte Daten"        (gruen, an `echterKater` gehaengt)
    jetzt    „teilweise gemessen" (gelb)

`[cmd]` **Am Schirm** (`tools/_g440-schirm.mjs`): beide Kacheln
tragen die neue Marke, und die Unterzeile nennt die Einschraenkungen.

`docs/bilder/g440/a3-nachher.png`

`[read]` **Das alte Etikett haengte ALLEIN am Muskelkater** —
`echterKater ? 'echte Daten' : undefined`. **Der Kater war echt,
Stunden und Saetze nicht. Die Kachel behauptete trotzdem „echte
Daten".**

### A4 — was noch geschaetzt ist, steht dran

    9 von 105 Muskeln aus workout_sets gerechnet ·
    ein Satz zählt für jeden zugeordneten Muskel gleich
    (primary wie secondary — C-487) ·
    Schlaf und Ernährung aus dem Entwurf

`[read]` **Jede Einschraenkung einzeln benannt**, nicht als
Sammelvermerk. `[cmd]` **Und aus EINER Stelle** (`datenEtikett()`),
damit die beiden Kacheln nicht auseinanderdriften.

### Und die KARTE, die niemand im Auftrag genannt hat

**Tom:** *„es korrespondiert von der grafik nicht in die liste."*

`[cmd]` **Der A5-Waechter fand es:** `MUSCLE_STATE[slug]` stand
noch in `rows` — **die Koerperkarte faerbte weiter aus den 18
Attrappenzeilen, waehrend die Liste daneben aus `workout_sets`
rechnete.** **Zwei Quellen, ein Bild.**

`[read]` **Umgestellt ueber `SCHLUESSEL_ZU_GRUPPE` aus G-438** —
Karte und Liste zeigen jetzt denselben Wert. **Am Schirm: 0
Mockup-Woerter** („Push B · Wed" usw.) gegen vorher.

### A5 — der Waechter fuer Datenquellen

`lib/koerper/__tests__/g440-datenquellen.test.ts`, 4 Waechter,
GRUEN.

`[read]` **Warum der alte Waechter es nicht sah:**
`v2-attrappen.test.ts` **sucht ATTRAPPE-Marken in der ANSICHT** —
es gab keine, die Kachel trug ja „echte Daten". `[cmd]` **Was
fehlte, war die Frage nach der QUELLE im Rechenweg.**

Der neue prueft:

    keine `MUSCLE_STATE[…]`-Lesung in der Kachel
    keine Marke „echte Daten"
    das Etikett nennt jede Einschraenkung
    keine NEUE feste Messtabelle im Modul

### A6 — wo es sonst noch so ist

`[cmd]` **Gemessen: zehn feste Messtabellen in
`app/v2/recovery/motor.ts`** — und keine sonst im Modul.

    CHECKIN            HRV_BASELINE      MUSCLE_STATE
    NUTRITION_INPUT    SLEEP_DATA        TODAY_MODALITIES
    ACTIVE_PROTOCOL    PROTOCOLS         STRESS_DATA
    STRESS_TODAY

`[read]` **Die Liste steht als Erwartung in der Probe** — wer eine
elfte anlegt, faellt auf und muss sie begruenden.

`[cmd]` **`MUSCLE_STATE` bleibt in `motor.ts` stehen** — der
Auftrag sagt *„motor.ts nicht umbauen"*. **Die Kachel liest sie
nicht mehr**, und genau das haelt der Waechter fest.

**Was davon noch in die Recovery-Rechnung eingeht:** `CHECKIN`
(Schlafguete als Rueckfall), `NUTRITION_INPUT` (Protein/Kalorien).
`[read]` **Beide stehen jetzt im Etikett.**

### A7 — Gegenprobe: 9 Sabotagen, alle rot

    ROT  die Kachel liest wieder aus MUSCLE_STATE
    ROT  eine NEUE feste Messtabelle wird angelegt
    ROT  die Marke „echte Daten" kommt zurueck
    ROT  das Etikett verschweigt die ungewichtete Rolle
    ROT  das Etikett verschweigt Schlaf und Ernaehrung
    ROT  der Datumsfilter faellt weg
    ROT  die Saetze zaehlen ueber ALLE Sitzungen
    ROT  die AELTESTE Sitzung gewinnt
    ROT  der Deckungsbericht behauptet gewichtete Rollen

**Drei blinde Flecken, die die Gegenprobe gefunden hat:**

**1.** Die Sabotage *„ein Muskel ohne Satz bekommt eine 0"* blieb
GRUEN. `[cmd]` **Der Zweig ist unerreichbar** — der Datumsfilter
oben laesst nur Sitzungen MIT Datum in den Sammler. `[read]` **Ein
stilles `return` sieht aus wie ein behandelter Fall.** **Jetzt ein
`throw`**, der laut faellt, falls der Filter je entfernt wird — und
die Sabotage zielt auf den Filter.

**2.** Die Sabotage *„das Etikett verschweigt die Rolle"* blieb
GRUEN — **sie liess den TEXT stehen und leerte nur den
`teile.push`-Aufruf.** `[read]` **Der Waechter suchte die
Zeichenkette.** **Jetzt prueft er, dass der Satz am
`rollenUngewichtet`-Zweig HAENGT.**

**3.** Die Proben oben gaben jeder Sitzung ein Datum — **also
wurde der datumslose Fall nie geprueft.** **Zwei Proben ergaenzt:**
ein Tagebuch ganz ohne Datum (leeres Ergebnis, keine Nullen) und
eines, in dem die datumslose Sitzung ihre Saetze NICHT in die
Zaehlung der aelteren schmuggelt.

### A8 — vier Module unveraendert

    recovery      Kacheln 17  Kartenflaechen 43  neu 9  alt 0  Fehler 0
    supplements   Kacheln 14  Kartenflaechen 43  neu 9  alt 0  Fehler 0
    medical       Kacheln 11  Kartenflaechen  0  neu 0  alt 0  Fehler 0
    coach         Kacheln 13  Kartenflaechen  0  neu 0  alt 0  Fehler 0

### A9 — Proben

    apps/web    1703 von 1707   (verlangt: 1689 oder mehr)
    apps/coach    65 von 65

**Die vier roten sind die bekannten aus G-435, keine neu:**

    2x  C-73 / Flaechenziel   C-482-Folge
    2x  Supplements-Attrappen meine C-484-Konfliktloesung

### Was ich NICHT gebaut habe

`[read]` **Die Rolle wird nicht gewichtet** — `primary` und
`secondary` zaehlen gleich. **Das ist C-487, und die Kachel sagt
es.**

`[read]` **Die Stunden sind auf den TAGESBEGINN bezogen** —
`session_date` traegt keine Uhrzeit. **Genauer geht es mit diesen
Daten nicht.**

`[read]` **`motor.ts` nicht umgebaut. Nichts in `supabase/`.**

### Geaendert

    lib/training/muskelzustand.ts       NEU — die Rechnung
    lib/training/muskelzustand-read.ts  NEU — der Leseweg
    v2/recovery/tab-messwerte.tsx       Kachel UND Karte, Etikett
    v2/recovery/page.tsx                Leseweg eingehaengt
    v2/recovery/ansicht.tsx             durchgereicht
    lib/training/__tests__/
      g440-muskelzustand.test.ts        NEU, 10 Waechter
    lib/koerper/__tests__/
      g440-datenquellen.test.ts         NEU, 4 Waechter

    tools/_g440-quellen.mjs    die Kette vermessen
    tools/_g440-schirm.mjs     A2/A3 am Schirm
    tools/_g440-sabotage.mjs   A7

**Nicht committet, nicht gestaget.**

### Neustart noetig?

`[read]` **Nein** — nur `apps/web/src`.


## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    A1  gerechnet aus workout_sets x exercise_muscles
    A2  18 erfunden -> 17 gemessen
    A3  "echte Daten" -> "teilweise gemessen"
    A5  4 Waechter, gruen
    A6  10 feste Messtabellen, alle in motor.ts
    A7  9 Sabotagen, alle rot
    A9  web 1703/1707, coach 65/65

`[cmd]` **Seine drei Werkzeuge selbst gelaufen:**

    _g440-quellen.mjs    exit 0
    _g440-sabotage.mjs   "ALLE SABOTAGEN ROT."
    _g440-schirm.mjs     "26 Flaechen, 23 gefaerbt"

### Die Kette war anders als mein Auftrag sagte

> *,,`workout_sets` hat weder `exercise_id` noch `session_id` ?
> es geht ueber `workout_exercises` (132 Zeilen). Meine erste
> Messung verknuepfte ins Leere und meldete *0 von 105*; ich habe
> die Zwischentabelle GESUCHT, statt die Null zu glauben."*

`[cmd]` **Selbst nachgemessen: 132 Zeilen, mit
`workout_session_id` und `exercise_id`.**

`[read]` **Mein Auftrag nannte `workout_sets x
exercise_muscles`** ? **die Kette hat drei Glieder.**

### Der eigentliche Befund: 6 von 1.416

`[cmd]` **Selbst gemessen:** **6 verschiedene Uebungen in ALLEN
Sitzungen, 1.416 im Katalog.**

> *,,Die Seed-Daten sind DUENN, nicht die Rechnung."*

`[read]` **Aus 18 werden 17, nicht 105** ? **weil niemand die
anderen Muskeln trainiert hat.**

`[read]` **Weniger Zahlen als vorher, aber keine erfundene
mehr.**

### Und er hat die Karte gefunden, die niemand genannt hat

> *,,Mein A5-Waechter fand `MUSCLE_STATE[slug]` noch in `rows`:
> die Koerperkarte faerbte weiter aus den Attrappenzeilen,
> waehrend die Liste daneben echt rechnete. Genau dein
> *korrespondiert von der Grafik nicht in die Liste*."*

`[read]` **Der Waechter hat den Rest des Problems gefunden, nicht
der Auftrag.**

### Ein Rest bleibt

`[cmd]` **`ansicht.tsx:354` `recoveryValues` rechnet weiter aus
`MUSCLE_STATE`** ? **und speist bei `:432` die
`ErmuedungsKarte`.**

`[cmd]` **Das ist die Kachel im Reiter `Today`, nicht `Muscle
map`** ? *,,18 groups - click for the calculation"*.

`[cmd]` **Und `muskelwerte()` bei `:519` hat KEINEN Aufrufer** ?
**tot.**

`[read]` **Sein Bericht stimmt fuer die Muscle-map-Kachel** ?
**die Today-Kachel hat er nicht genannt.**

`[cmd]` **Als G-441.**

### Drei blinde Flecken bei sich selbst

> *,,Ein unerreichbarer Zweig, der wie ein behandelter Fall
> aussah (jetzt ein `throw`), ein Waechter, der eine Zeichenkette
> statt ihrer Wirkung prueft, und Testdaten, in denen JEDE Sitzung
> ein Datum hatte, sodass der datumslose Fall nie geprueft
> wurde."*

`[read]` **Der dritte ist der feinste** ? **eine Gegenprobe, die
den Fehlerfall nie erreicht.**

**Abgenommen.**

