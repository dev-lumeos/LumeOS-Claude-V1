---
nr: C-468
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-425
entscheidung: null
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
