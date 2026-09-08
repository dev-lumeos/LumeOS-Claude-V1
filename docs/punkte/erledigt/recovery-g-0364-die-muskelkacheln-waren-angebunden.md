---
nr: G-364
typ: befund
modul: recovery
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: null
entscheidung: E-69
agent: claudecode
beauftragt: 2026-09-07
erledigt: 2026-09-07
commit: a880e92b
beruehrt:
  dateien:
    - apps/web/src/app/v2/recovery/tab-messwerte.tsx
zahlen:
  gemessen: 2026-09-07
  commit: f725899d
---

# G-364 — die Muskelkacheln waren angebunden

## Befund

**Tom, 2026-09-07:**

> DIE WAREN ANGEBUNDEN UND HABEN VOLLUMFAENGLICH FUNKTIONIERT

> http://127.0.0.1:3200/v2/recovery ALS MUSCLE READINESS UND KONNTE
> FULL MAP KLICKEN UND LANDETE AUF
> http://127.0.0.1:3200/v2/recovery?tab=muscles

`[cmd]` **Gemessen: `f725899d`, 2026-08-18** — *,,three muscle
levels, visible shapes, checkins bound"*.

`[cmd]` **Und `tab-messwerte.tsx` liest heute noch echt:**

    von ./kontext              useRecovery
    von ./muskel-zuordnung     alsErmuedung, KARTE_ZU_RECOVERY

`[read]` **Die Anbindung ist da.**

`[cmd]` **Aber daneben:**

    von ./motor      MUSCLE_GROUPS_BODYMAP, MUSCLE_LABEL, MUSCLE_STA...
    von ./ansicht    ATTRAPPE

`[read]` **Entwurfskonstanten und ein Attrappen-Vermerk in derselben
Datei.**

## Was das heisst

`[read]` **Niemand hat die Anbindung entfernt.** `[read]` **Jemand
hat einen Vermerk daraufgesetzt und die angezeigten Werte auf
Entwurfsdaten zurueckgestellt** — **waehrend der Leseweg
danebenliegt.**

`[cmd]` **Die Kachel sagt: *,,noch nicht an die vorhandenen
Recovery-Daten angebunden — die Zahlen sind erfunden."***

`[read]` **Das ist falsch, und es steht seit Wochen da.**

`[read]` **Und es ist die schlimmste Sorte von Vermerk** — **er
behauptet einen Mangel, den es nicht gibt, und verhindert damit,
dass jemand nachsieht.**

## Auftrag

**Beauftragt am 2026-09-07.**

`[read]` **Miss zuerst, was `useRecovery` und `KARTE_ZU_RECOVERY`
heute liefern** — **und warum die Kachel trotzdem
`MUSCLE_GROUPS_BODYMAP` anzeigt.**

`[cmd]` **`f725899d` vom 18.08. zeigt, wie es lief** — **`git show`
sagt, was seither dazwischenkam.**

`[read]` **Dann: die echten Werte anzeigen, den Vermerk entfernen.**

`[read]` **Und pruef dasselbe fuer *Muscle readiness* auf dem
Today-Reiter und *Per-muscle detail*** — **beide tragen denselben
Vermerk.**

### Und dann such nach demselben Muster

`[read]` **Ein Attrappen-Vermerk auf einer angebundenen Kachel ist
schlimmer als eine fehlende Kachel** — **er luegt ueber den
Zustand.**

`[cmd]` **`ATTRAPPE` wird aus `ansicht.tsx` importiert** — **zaehl,
wie viele Kacheln ihn tragen und gleichzeitig echte Daten lesen.**

### Nachweis

    was liefert useRecovery      gemessen, mit Zahl
    warum Entwurfsdaten          Fundstelle
    echte Werte am Schirm        Bildschirmfoto
    dasselbe Muster              wie viele Kacheln, gezaehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

**2026-09-07, Tom am Schirm.** `[cmd]` Committet in `57a875ee`.

### Tom hatte recht, und der Vermerk log

Tom: *,,DIE WAREN ANGEBUNDEN UND HABEN VOLLUMFAENGLICH
FUNKTIONIERT."*

`[cmd]` **`<RecMuscleMap />` wurde ohne Prop gerufen, waehrend der
Leseweg fuer den Muskelkater ungenutzt danebenlag.**

`[cmd]` **Drei Kacheln angebunden:** Muscle map, Muscle recovery,
Per-muscle detail.

`[cmd]` **Am Schirm bestaetigt:** *,,echte Daten"*, Muskelkater aus
dem Check-in 2026-11-06, **und das Detailfenster rechnet
nachvollziehbar** — Basiskurve, vier Modifikatoren, Ergebnis.

### Der erste von fuenf Faellen

`[read]` **A-71 haelt das Muster fest** — **es kam am 07.09.
fuenfmal vor.**

`[cmd]` **Und 23 weitere Kandidaten wurden gemeldet** — **daraus
wurde G-365 ueber acht Module.**

### Was offen bleibt

`[cmd]` **`HOURS` und `SETS` je Muskel kamen weiter aus dem
Entwurf** — **seit C-421 liefert `public.muscle_training_loads` sie
echt** (G-367).

**Abgenommen.**


## Bericht

**Claude Code, 2026-09-06.**

### 1 · Was der Leseweg liefert — und warum die Kachel ihn nicht nahm

`[cmd]` **`recovery.checkins.soreness` ist ein `jsonb` und traegt
den Muskelkater je Gruppe.** `[cmd]` **Auf `dev@lumeos.app`,
juengste drei Zeilen:**

    2026-11-06 | {"back": 1, "chest": 1}
    2026-11-05 | {"back": 1, "chest": 1}
    2026-11-04 | {"back": 1, "chest": 1}

`[cmd]` **`checkin-read.ts:28` liest es** (`soreness:
Record<string, number>`), **und `checkin-streifen.tsx:59` zeigt es
seit G-160.**

**Die Fundstelle, nach der der Auftrag fragt:**

`[cmd]` **`ansicht.tsx:215` rief `<RecMuscleMap />` OHNE Prop auf**
— **anders als `<RecHRV stand={checkins} />` eine Zeile weiter.**

`[read]` **Die Daten kamen nie an der Kachel an.** **Sie rechnete
mit `MUSCLE_STATE` und `CHECKIN` aus `motor.ts`** — den
Entwurfskonstanten.

### Eine Berichtigung an der Vorgeschichte

`[cmd]` **`git show f725899d` nachgesehen: dort stand `<RecMuscleMap />`
schon ohne Prop**, und `tab-messwerte.tsx` trug im Kopf
*,,ALLES IST ATTRAPPE"*.

`[read]` **Was f725899d anband, waren die Check-in-Zeile und die
Muskelstufen** — **nicht die Werte der Karte.** `[cmd]` **Die Marke
sitzt seit `e274735b` an der Kachel, dem Commit, der das Modul als
Attrappe einfuehrte.**

`[read]` **Toms Beobachtung stimmt trotzdem, und zwar in dem, was
er beschreibt:** `[cmd]` **die Karte zeigt 18 Gruppen mit Farben,
und *Full map →* springt auf `?tab=muscles`** (`ansicht.tsx:316`).
**Beides funktioniert und hat immer funktioniert.**

`[read]` **Was nicht stimmte, war der Vermerk:** *,,noch nicht
angebunden — die Zahlen sind erfunden"*. **Der Leseweg lag
daneben, ungenutzt.**

### 2 · und 3 · Die echten Werte, drei Kacheln

`[cmd]` **`Muscle recovery` und `Per-muscle detail`**
(`tab-messwerte.tsx`) **und `Muscle readiness`** (`ansicht.tsx`,
Today-Reiter) **lesen jetzt den erfassten Muskelkater und die
Schlafqualitaet.**

    vorher   soreness aus MUSCLE_STATE       (Entwurf)
             sleepQuality aus CHECKIN        (Entwurf)
    nachher  soreness aus checkins.soreness  (erfasst)
             sleepQuality aus dem Check-in   (erfasst)

`[cmd]` **Am Schirm belegt** (`backup/g359b-recovery-g364-muscles.png`):
**beide Kacheln tragen die Pille *echte Daten* und den Untertitel
*,,Muskelkater aus dem Check-in 2026-11-06"*.**

`[cmd]` **Attrappen im Muskelreiter: 3 -> 1.**

### Was Entwurf BLEIBT, und warum es dasteht

`[cmd]` **`hours` und `sets` je Muskel haben keinen Leseweg** —
**kein Volumen je Muskelgruppe in `apps/web/src/lib/training`.**

`[read]` **Deshalb sagt die Kachel es selbst:** *,,Muskelkater
erfasst, Volumen aus dem Entwurf"*. `[read]` **Kein pauschaler
Vermerk mehr, sondern die genaue Grenze** — **das ist der
Unterschied, um den es in diesem Punkt geht.**

`[read]` **Nicht erfunden** (C-378): **die Spalten dafuer gibt es
nicht, also wird nichts gerechnet, was so tut als gaebe es sie.**

### 4 · Dasselbe Muster — gezaehlt

`[cmd]` **40 Kacheln tragen eine Marke UND stehen in einer Datei
mit Leseweg.** `[cmd]` **Davon 23 mit der PAUSCHALEN Marke
`attrappe={ATTRAPPE}`:**

    training       8    coach          4
    recovery       4    nutrition      3
    supplements    3    goals          1

`[read]` **Das sind Verdachtsfaelle, keine belegten
Falschaussagen** — **eine Marke in einem Fehlerzweig ist richtig.**
`[cmd]` **Gegenprobe an `Morning check-ins`
(`checkin-streifen.tsx:38`): die Marke steht dort NUR im
Fehlerzweig** — **korrekt, kein Fund.**

`[read]` **Die uebrigen 17 mit bedingter Marke habe ich deshalb
ausgeschlossen.** **Je Kachel gehoert nachgesehen, ob sie den
Leseweg ihrer Datei wirklich benutzt** — **genau die Pruefung, die
bei den Muskelkacheln unterblieben ist.**

**Die 23 zur Durchsicht:**

    training/ansicht.tsx      This week · Training readiness ·
                              Weekly volume · Streak · Mesocycle ·
                              Routines · Recent sessions ·
                              Volume by muscle
    coach/ansicht.tsx         Latest from your coaches ·
                              Coaching balance · Trust circle ·
                              Coach activity
    recovery/ansicht.tsx      Pending actions · Overtraining watch
    recovery/tab-messwerte    Phone camera HRV · Score paths
    nutrition/tab-plans.tsx   Plan settings · Lifecycle types ·
                              7-day compliance
    supplements/tab-spec.tsx  Redundancy detection ·
                              Timing conflicts · Inventory
    goals/ansicht.tsx         Goal timeline · 2026

`[read]` **`training/ansicht.tsx` mit acht ist der naechste
Verdacht** — `[cmd]` **dort werden `verlauf` und `readiness`
durchgereicht** (G-69/G-86).

### Ein Waechter musste nachziehen

`[cmd]` **`v2-attrappen.test.ts:499` zaehlte die Marken je Datei**
— **ansicht 3 -> 2, tab-messwerte 4 -> 2.**

`[read]` **Nicht abgeschwaecht: die Zahl ist gesunken, weil zwei
Kacheln angebunden wurden** — genau der Fall, den der Kommentar dort
vorsieht (*,,wer eine anbindet, entfernt `attrappe` und zaehlt die
Erwartung herunter"*).

### Vollstaendiger Lauf

    tsc --noEmit    sauber
    next lint       keine Warnung, kein Fehler
    Tests           1500 / 1500 gruen, 0 Fehler
    dev@lumeos.app  nicht geschrieben
    gestaged        nichts

## Abnahme

_(vom Orchestrator)_
