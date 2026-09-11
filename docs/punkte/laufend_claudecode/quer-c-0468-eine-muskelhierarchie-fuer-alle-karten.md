---
nr: C-468
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-425
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  tabellen: [training.muscle_groups]
zahlen:
  gemessen: 2026-09-08
  wurzeln: 7
  kinder: 88
---

# C-468 — eine Muskelhierarchie fuer alle Karten

## Toms Vorgabe

Tom, 2026-09-08:

> ich denke, wenn wir gruppieren, dann muessen wir mit
> parent/child arbeiten ? denn ein bodybuilder nutzt uebungen fuer
> einzelne muskeln sowie gebuendelt.

> das gilt auch fuer recovery, ueberall wo wir die maps
> einsetzen.

## Die Hierarchie EXISTIERT schon

`[cmd]` **`training.muscle_groups`: 95 Zeilen, 7 Wurzeln, 88
Kinder, mit `parent_id`.**

    Back, Chest, Core, Arms, Legs,
    Neck Muscles, Shoulders

`[cmd]` **Unter `Back` haengen NEUN:**

    Mid Back, Upper Back, Lower Back,
    Trapezius, Rhomboids, Teres Major,
    levator scapulae, erector spinae,
    latissimus dorsi

`[read]` **Genau die Muskeln, die `muskel-ebenen.ts` auf EINE
Flaeche wirft.**

## Drei Beschreibungen desselben Koerpers

    training.muscle_groups     7 Wurzeln, 88 Kinder
                               echte Hierarchie
    muskel-zuordnung.ts       18 Gruppen, 17 Teilstuecke
                               EINE Ebene
    koerperkarte-pfade.ts     21 Flaechen
                               flach

`[cmd]` **Und `muskel-zuordnung.ts` nennt `upper-back` woertlich
*,,Oberer Ruecken (mit Latissimus)"*** ? **der Name gibt zu, dass
er zwei Sachen zusammenfasst.**

## Wo die Karte ueberall steht

`[cmd]` **Gemessen, 19 Dateien:**

    packages/ui/koerperkarte-pfade.ts    64,8 KB
    packages/ui/koerperkarte.tsx         25,2
    recovery/motor.ts                    34,2
    recovery/mockup-referenz.tsx         63,6
    recovery/muskel-zuordnung.ts         12,2
    recovery/muskel-ebenen.ts             8,7
    recovery/koerperkarte.tsx             5,6
    recovery/tab-checkin.tsx             13,7
    supplements/tab-injektionen.tsx      31,8
    lib/medical/injektion-flaechen.ts     9,8
    lib/medical/koerperflaechen.ts        2,6
    coach/ai/orb.tsx                      2,8

`[read]` **Recovery, Supplements, Medical, Coach** ? **vier
Module an derselben Karte.**

## Was der Bodybuilder braucht

    "Ruecken trainiert"       -> Back            Elternteil
    "Latissimus trainiert"    -> latissimus dorsi  Kind
    "Rhomboiden verspannt"    -> Rhomboids         Kind

`[read]` **Mit `parent_id` geht beides aus derselben Quelle** ?
**die Karte faerbt das Kind, die Auswertung summiert ueber den
Elternteil.**

## Was fehlt: die Bruecke

`[cmd]` **`muscle_groups` hat keine Pfade.**
`[cmd]` **`koerperkarte-pfade.ts` hat keine Hierarchie.**

`[read]` **Jeder Pfad muesste auf eine `muscle_groups.id`
zeigen.**

`[cmd]` **G-425 liefert gerade, WELCHER Pfad welcher Muskel
ist** ? **danach ist die Zuordnung machbar.**

## Was zu entscheiden ist

**1** ? **Wo lebt die Hierarchie?**

`[cmd]` **`training.muscle_groups` traegt sie heute** ? **aber die
Karte gehoert `packages/ui`, und Recovery, Supplements und
Medical lesen sie auch.**

`[read]` **Ein Schema `training` als Quelle fuer Recovery ist ein
Modulbruch** (SPEC_01: Schema-Isolation).

`[read]` **Oder gehoert sie nach `public`?**

**2** ? **Wie tief?**

`[cmd]` **`muscle_groups` hat ZWEI Ebenen (Wurzel, Kind).**

`[read]` **Die Karte braucht eine dritte: links und rechts.**

`[cmd]` **`lat_l`/`lat_r` sind heute Punkte, keine Flaechen.**

**3** ? **Was wird aus den 21 Flaechen?**

`[read]` **`hair`, `head`, `hands`, `feet`, `ankles` sind keine
Muskeln** ? **sie stehen in der Karte fuer Muskelkater, nicht
fuer Training.**

`[read]` **Eine Hierarchie mit einem Merkmal *,,ist Muskel"*
traegt beides.**

## G-425 hat gemessen, was in `upper-back` steckt

`[cmd]` **Sechs Pfade, DREI Muskeln je Seite:**

    Pfad 1 / 4    Teres major        klein, unter dem Deltoid
    Pfad 2 / 5    Teres minor /      Sichel, seitlich
                  oberer Lat-Rand
    Pfad 3 / 6    Latissimus dorsi   gross, Achsel bis Taille

`[cmd]` **Und die Rhomboiden, die `muskel-ebenen.ts` darauf
wirft, sind in KEINEM der sechs.**

`[read]` **Die Gruppe ist nicht anatomisch** ? **sie fasst drei
Muskeln zusammen und behauptet zwei weitere, die sie nicht
zeichnet.**

## Die Unterscheidung, die G-425 gefunden hat

`[cmd]` **Sieben Flaechen haben mehrere Pfade, in drei
Faellen:**

    EIN Muskel, mehrere Pfade
      trapezius, triceps, lower-back
      -> zusammenlassen

    Spiegelpaare desselben Muskels
      gluteal
      -> links/rechts trennen

    VERSCHIEDENE Muskeln
      upper-back
      -> aufteilen

`[read]` **Ein Pfad ist eine Zeichenebene, kein Muskel** ?
**`triceps` hat drei Koepfe und bleibt EIN Muskel.**

`[read]` **Das ist der Massstab fuer die Hierarchie: nicht *,,wie
viele Pfade"*, sondern *,,wie viele Muskeln"*.**

## Und `lower-back` hat denselben Fehler

> *,,Vier Pfade, die zusammen den Bereich zwischen Lat und
> Gesaess zeichnen ? anatomisch der Erector spinae, aber die
> Karte nennt ihn nach der Region."*

`[cmd]` **`training.muscle_groups` fuehrt `erector spinae` als
eigenes Kind von `Back`.**

`[read]` **Die Hierarchie kennt den Muskel, die Karte nennt die
Region.**

## Toms Entscheidungen, 2026-09-08

**1** ? **Wo lebt die Hierarchie?**

> ja, das ist eine public komponente, wenn sie von mehreren
> modulen benutzt wird

`[read]` **Schema `public`** ? **nicht `training`.**

**2** ? **Wie tief?**

> ok, eine dritte

`[read]` **Drei Ebenen:**

    Wurzel   Back
    Muskel   latissimus dorsi
    Seite    links / rechts

**3** ? **Was wird aus `hair`, `head`, `hands`, `feet`,
`ankles`?**

> brauchen wir, dass wir einen mensch erkennen

`[read]` **Sie bleiben** ? **als Umriss, nicht als Muskel.**

`[read]` **Ein Merkmal unterscheidet sie** ? **`ist_muskel` oder
eine Art (`muskel | umriss`).**

## ALLE 23 Flaechen, gemessen

`[cmd]` **`koerperkarte-pfade.ts`, `MUSKELN`:**

    Flaeche        side    front  back
    ---------------------------------
    chest          front       2     -
    abs            front       8     -
    obliques       front      16     -
    biceps         front       2     -
    triceps        both        2     6
    deltoids       both        2     2
    trapezius      both        2     2
    neck           both        5     2
    forearm        both        6     8
    adductors      both        6     2
    quadriceps     front       6     -
    knees          front       4     -
    tibialis       front       2     -
    calves         both        4     8
    upper-back     back        -     6
    lower-back     back        -     4
    gluteal        back        -     4
    hamstring      back        -     8
    head           both        1     1
    hair           both        1     1
    hands          both       12    11
    ankles         both        4     2
    feet           both        4     2

`[read]` **G-425 hat nur `upper-back`, `lower-back`, `gluteal`,
`trapezius` und `triceps` angesehen.**

`[read]` **ACHTZEHN Flaechen sind ungeprueft** ? **darunter
`obliques` mit 16 Pfaden, `hands` mit 23, `hamstring` mit 8,
`calves` mit 12.**

`[cmd]` **`obliques`: 16 Pfade auf EINER Flaeche** ? **die
schraegen Bauchmuskeln sind zwei Muskeln je Seite (externus,
internus), nicht sechzehn.**

`[cmd]` **`hamstring`: 8 Pfade** ? **drei Muskeln je Seite
(biceps femoris, semitendinosus, semimembranosus).**

`[cmd]` **`calves`: 12 Pfade** ? **zwei Muskeln je Seite
(gastrocnemius, soleus).**

`[read]` **Jede Flaeche mit mehr als zwei Pfaden je Ansicht ist
zu pruefen.**

## Der Massstab aus G-425

    EIN Muskel, mehrere Pfade     zusammenlassen
    Spiegelpaare                  links/rechts trennen
    VERSCHIEDENE Muskeln          aufteilen

`[read]` **Ein Pfad ist eine Zeichenebene, kein Muskel.**

## Was gebaut wird

`[read]` **Eine Tabelle in `public`, drei Ebenen, mit
`parent_id`.**

`[cmd]` **`training.muscle_groups` traegt heute 7 Wurzeln und 88
Kinder** ? **die Namen stehen schon, samt `latissimus dorsi`,
`Rhomboids`, `Teres Major`, `erector spinae`.**

`[read]` **Miss, ob sie uebernommen oder ersetzt wird.**

`[read]` **Und je Eintrag ein Merkmal, ob es ein Muskel ist oder
Umriss.**

## Was NICHT gebaut wird

`[read]` **Keine Pfadzuordnung** ? **welcher Pfad zu welchem
Muskel gehoert, ist G-425 und ein UI-Auftrag.**

`[read]` **`koerperkarte-pfade.ts` bleibt unberuehrt** ? **sie
gehoert `packages/ui` und allen vier Modulen.**

## Abnahmebedingungen

    A1  alle 23 Flaechen gemessen: wie viele MUSKELN
        stecken darin? TABELLE mit Begruendung.
    A2  die Tabelle in public, drei Ebenen, parent_id.
    A3  wird training.muscle_groups uebernommen oder
        ersetzt? Gemessen, begruendet.
    A4  je Eintrag: Muskel oder Umriss.
    A5  die 95 Zeilen in training.muscle_groups bleiben
        gueltig, oder der Umzug ist belegt.
    A6  RLS beide Richtungen, anon ohne EXECUTE.
    A7  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**`packages/ui` NICHT anfassen.**
**Keine Oberflaeche.**
**Keinen Muskel erfinden** ? **was die Karte nicht zeigt, wird
gemeldet.**
Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

## Nachtrag 2026-09-08 — ein VIERTER Ort

`[cmd]` **`public.muscle_training_loads`, 43 Zeilen:**

    user_id, muscle_group, session_id,
    last_trained_date, last_trained_time,
    hours_since_trained, sets, volume_kg

`[cmd]` **`muscle_group` ist FREIER TEXT** ? **keine
Fremdschluessel auf die Tabelle.**

`[read]` **Also vier Orte mit Muskelnamen:**

    training.muscle_groups        95 Zeilen, parent_id
    training.exercise_muscles   6.588, FK auf muscle_group_id
    public.muscle_training_loads   43, FREIER TEXT
    muskel-zuordnung.ts            35 Eintraege
    koerperkarte-pfade.ts          23 Flaechen

`[read]` **`exercise_muscles` zeigt richtig** ? `muscle_group_id`
**als Fremdschluessel, 6.588 Zuordnungen.**

`[read]` **`muscle_training_loads` nicht** ? **ein Tippfehler dort
faellt niemandem auf.**

`[cmd]` **Miss, welche Werte in `muscle_group` stehen** ?
**passen sie zu `muscle_groups.name`?**

`[read]` **Wenn die Hierarchie nach `public` zieht, sollte diese
Spalte ein Fremdschluessel werden.**
