---
nr: C-493
typ: feature
modul: training
schwere: hoch
angelegt: 2026-09-08
braucht: [G-445]
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [training.workout_sessions]
zahlen:
  gemessen: 2026-09-08
  sitzungen: 66
  uebungen: 6
---

# C-493 — Seed-Sitzungen, die die Karte fuellen

## Toms Vorgabe

Tom, 2026-09-08:

> wir brauchen seeddaten mit mehr uebungen und anderen
> belastungen, dass wir auch was ableiten koennen und sehen,
> dass es funktioniert. wir koennen ja dayswitcher oben nutzen
> und schauen, was sich aendert

`[read]` **Die Pruefung ist eingebaut: der Tageswechsler zeigt,
ob die Erholung ueber die Zeit stimmt.**

## Was heute dasteht

`[cmd]` **66 Sitzungen, 2026-05-21 bis 2026-11-11.**

`[cmd]` **Je Tag GENAU ZWEI Sitzungen, alle sechs Tage** ?
**11-11, 11-05, 10-30, 10-24, 10-18 ...**

`[read]` **Ein Muster, kein Trainingsplan.**

`[cmd]` **Und nur SECHS verschiedene Uebungen:**

    Barbell Bench Press                  26 Saetze
    Barbell bench press incline          20
    Barbell bent over row pronated grip  26
    band kneeling lat pulldown           20
    Barbell squat back POV               20
    Band Deadlift                        20

`[cmd]` **Sie treffen 11 Muskeln, davon haben 3 eine
Kartenflaeche.**

`[cmd]` **Je Nutzer: tom.seed 30, dev@lumeos.app 30,
test-user 6.**

`[cmd]` **Und rpe und rir sind in ALLEN 258 Saetzen gefuellt**
? **die Grundlage fuer den Failure-Faktor aus C-492 liegt
vor.**

## Was zu bauen ist

### Mehr Uebungen

`[read]` **Ein Plan, der den ganzen Koerper abdeckt.**

`[cmd]` **`training.exercises` hat 1.416** ? **waehle die, die
eine Kartenflaeche treffen.**

`[cmd]` **Miss zuerst:**

    select e.name, count(distinct k.code)
    from training.exercises e
    join training.exercise_muscles em on em.exercise_id=e.id
    join public.koerperflaechen k
      on k.muscle_group_id=em.muscle_group_id
    group by 1 order by 2 desc

`[read]` **Die obersten dreissig fuellen die Karte.**

### Verschiedene Belastungen

Tom: *,,mehr uebungen UND ANDEREN BELASTUNGEN"*

`[read]` **Nicht zwei Sitzungen alle sechs Tage** ? **ein Plan
mit:**

    unterschiedliche Abstaende  1, 2, 3, 7 Tage
    unterschiedliche Saetze     3 bis 20 je Muskel
    unterschiedliche rpe/rir    RIR 0 bis 5
    frische und alte Reize      heute, gestern, vor 10 Tagen

`[read]` **Damit die Karte ALLE DREI Farben zeigt** ? Ready,
Caution, Rest.

### Und die Tage muessen NEBENEINANDER liegen

`[cmd]` **Der Tageswechsler geht Tag fuer Tag.**

`[read]` **Wenn zwischen zwei Sitzungen sechs Tage liegen,
zeigt er fuenf leere.**

`[read]` **Die letzten vierzehn Tage brauchen Sitzungen an den
meisten Tagen** ? **sonst ist der Wechsler stumpf.**

## Was zu messen ist, nachher

    A  wie viele der 43 Flaechen tragen einen
       gerechneten Wert? (heute 3)
    B  zeigt die Karte alle drei Farben?
    C  aendert sich das Bild beim Tagwechsel?
       -> ein Muskel von Rest zu Caution zu Ready

## Was nicht zu tun ist

**KEINE Uebung erfinden** ? **1.416 stehen im Katalog.**

**Die bestehenden 66 Sitzungen NICHT loeschen** ? **ergaenzen,
oder messen, ob sie im Weg sind.**

`[cmd]` **G-420 hat gemessen, dass Kettenlaeufe Testdaten
zuruecksetzen** ? **die neuen Sitzungen gehoeren in den
Kettenschritt, nicht von Hand in die Datenbank.**

**Nur test-user@lumeos.local** ? **Laeufe auf dev
ueberschreiben Toms gespeicherte Einstellungen.**

## Abnahmebedingungen

    A1  wie viele Uebungen treffen eine Kartenflaeche?
        TABELLE, absteigend.
    A2  der neue Plan: Uebungen, Tage, Saetze, rpe/rir.
        Als Kettenschritt.
    A3  wie viele der 43 Flaechen tragen danach einen
        Wert? Vorher 3.
    A4  die Karte zeigt alle drei Farben. Foto.
    A5  der Tageswechsler zeigt eine Veraenderung.
        Drei Fotos: Tag 1, Tag 3, Tag 7.
    A6  nur test-user, dev und tom.seed unveraendert.
    A7  Sicherung, Vollkette, Punktelauf.

