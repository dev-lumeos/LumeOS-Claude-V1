---
nr: C-530
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-528
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [training.muscle_groups]
zahlen:
  gemessen: 2026-09-08
  muskeln: 105
---

# C-530 - die Muskelhierarchie bereinigen und vervollstaendigen

## Toms Entscheidung

Tom, 2026-09-08:

> die zeichnung ist eine visuelle kontrolle, ob da detailliert
> jeder muskel verfuegbar ist bis ins detail ist momentan nicht
> relevant. ich sehe die grafik eh in absehbarer zukunft durch
> eine detailliertere zu ersetzen, der brustmuskel ist mir
> zuwenig detailliert

> momentan in der grafik, wenn der ort passt, die muskeln
> zusammenfassen. wichtig ist die auflistung parent/child, dass
> die detailliert ist

    Zeichnung       fasst zusammen, wird ersetzt
    parent/child    geht ins DETAIL -- das ist der Auftrag

## Was C-528 gemessen hat

### Eine echte Doppelzaehlung

    Bodyweight standing calf raise
      Fibularis Muscles : secondary
      Peroneus Brevis   : secondary

### Drei Kurationskandidaten

    Peroneals  /  Fibularis Muscles   Synonym, FIPAT TA2
    Abductors  /  Hip Abductors
    Adductors  /  Hip Adductors

### Acht fehlende Muskeln

`[cmd]` **Selbst nachgemessen, vier davon:** `Vastus
Intermedius`, `Supraspinatus`, `Fibularis Longus`, `Gracilis`.

## Und was ich zusaetzlich gemessen habe

`[cmd]` **Chest, ganz:**

    Chest
      Pectoralis Major
        Clavicular Head
        Sternal Head
      Upper Chest

`[read]` **`Upper Chest` IST der `Clavicular Head`** ? **als
Geschwister von `Pectoralis Major` doppelt gefuehrt.**

`[read]` **Es fehlen `Pectoralis Minor` und der `Abdominal
Head`** ? **Tom: *,,der brustmuskel ist mir zuwenig
detailliert"*.**

`[cmd]` **Shoulders, ganz:**

    Shoulders
      Deltoids
        Front Shoulders
        Rear Deltoids
      Rotator Cuff
        Infraspinatus
        Subscapularis
        Teres Minor
      Serratus Anterior

`[read]` **Der SEITLICHE Deltamuskel fehlt** ? **der Kopf, den
jedes Seitheben trainiert.**

`[read]` **`Front Shoulders` ist ein Alltagsname neben
Fachnamen** ? **`Anterior Deltoid`.**

`[cmd]` **`Supraspinatus` fehlt in der Rotatorenmanschette**
? **vier Muskeln, LumeOS kennt drei.**

## Was zu bauen ist

**1** ? **Doppelungen zusammenfuehren.**

`[read]` **Wo zwei Namen dasselbe meinen: einer bleibt, der
andere wird zum Alias** ? **nicht loeschen, die
Fremdschluessel haengen dran.**

`[cmd]` **Die `exercise_muscles`-Zeilen ziehen mit** ? **und wo
dann zwei Zeilen auf denselben Muskel zeigen (die
Wadenheben-Kollision), bleibt EINE.**

**2** ? **Falsche Eltern korrigieren.**

`[read]` **`Upper Chest` wird Alias von `Clavicular Head`,
`Tibialis Posterior` Kind von `Tibialis`, usw.**

**3** ? **Fehlende Muskeln ergaenzen.**

`[read]` **Je Muskel eine anatomische Quelle** ? **FIPAT TA2,
NCBI, wie in C-528.**

`[cmd]` **Mindestens: Vastus Intermedius, Supraspinatus,
Fibularis Longus, Gracilis, Pectoralis Minor, der Abdominal
Head, der laterale Deltamuskel.**

**4** ? **Alltagsnamen anzeigen, Fachnamen fuehren.**

`[cmd]` **`name_display_en` existiert** ? **`Front Shoulders`
kann dort stehen, `Anterior Deltoid` im Namen.**

## Die Zeichnung

`[read]` **Nicht anfassen, ausser eine Flaeche verliert ihren
Muskel durch eine Zusammenfuehrung** ? **dann auf den
ueberlebenden umhaengen.**

`[cmd]` **`flanke` bleibt offen** ? **Tom ersetzt die Grafik.**

## Abnahmebedingungen

    A1  je Zusammenfuehrung: welcher bleibt, welcher
        wird Alias? TABELLE mit Quelle.
    A2  exercise_muscles gezogen, keine Uebung zaehlt
        einen Muskel doppelt. Gegenprobe: das
        Wadenheben.
    A3  falsche Eltern korrigiert. Je Fall begruendet.
    A4  fehlende Muskeln ergaenzt, je mit Quelle.
    A5  Chest und Shoulders nachher, ganz. Baum.
    A6  muscle_recovery_profiles: jeder neue Muskel
        hat eines oder erbt es vom Elternteil.
        Gemessen.
    A7  koerperflaechen: keine Flaeche verliert ihren
        Muskel.
    A8  Sicherung, Vollkette, ALLE Waechter.

## Was NICHT zu tun ist

**Keine neue Tabelle** ? **sechs Fremdschluessel.**

**Nichts loeschen** ? **Doppelungen werden Aliase.**

**Die Zeichnung nicht verfeinern** ? **sie wird ersetzt.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

