---
nr: E-82
getroffen: 2026-09-08
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-487, G-438, G-440]
modul: training
---

# E-82 — die tiefste sinnvolle Ebene, mit Faktor an der Zuordnung

## Die Entscheidung

Tom, 2026-09-08:

> sollten wir da nicht eine table mit allen muskeln machen, daraus
> kann man untergruppen und gruppen bilden. allfaellig eine
> zuordnungstable, wo man sie braucht ? zb workout spricht gruppe
> mit faktor 1 und untergruppe mit faktor 0.5 etc

`[cmd]` **Beides existiert bereits:**

    training.muscle_groups   105 Zeilen, parent_id
      Ebene 1   7   Wurzeln    Back, Chest, Core, Legs
      Ebene 2  30   Gruppen    Quadriceps, Hamstrings, Triceps
      Ebene 3  51   Muskeln    Rectus Femoris, Biceps Femoris
      Ebene 4  17   Koepfe     Triceps Brachii Long Head
      76 Blaetter ohne Kinder

    training.exercise_muscles  6.588 Zeilen
      exercise_id, muscle_group_id, role

## 1 — der Faktor gehoert an die ZUORDNUNG

`[read]` **Nicht an die Rolle.**

    Kniebeuge -> Quadriceps      1,0
              -> Glutes          1,0
              -> Erector spinae  0,5
              -> Hamstrings      0,5

`[cmd]` **`role` (`primary | secondary`) bleibt als Etikett,
`faktor` traegt die Rechnung.**

`[read]` **Wenn eine Uebung 0,7 braucht, geht das** ? **ohne eine
dritte Rolle zu erfinden.**

`[cmd]` **Die Belegzahlen aus Pelland et al. 2026:** **direkt
1,0, indirekt 0,5** ? **Voreinstellung, nicht Fessel.**

## 2 — die tiefste SINNVOLLE Ebene

`[read]` **Eine Uebung zeigt auf die tiefste Ebene, die ein
Satzzaehlverfahren noch trennen kann.**

    Kniebeuge -> Quadriceps      (Gruppe, Ebene 2)
              NICHT -> Vastus Lateralis / Medialis /
                       Intermedius / Rectus Femoris

`[cmd]` **Begruendung, `docs/ssot/180`:** **kein Satzzaehlverfahren
trennt Vastus lateralis von medialis** ? **EMG kann es, die
Satzzaehlung nicht.**

`[read]` **Die Koepfe LEIHEN vom Elternteil** ? **G-438 hat das
gebaut:** `Wert von Quadriceps`.

`[read]` **Das ist die richtige Antwort, keine Notloesung.**

### Wo die Grenze liegt

`[read]` **Eine Zuordnung auf eine WURZEL ist unbrauchbar.**

`[cmd]` **1.105 Zuordnungen zeigen auf `Legs`** ? **das trifft
vierzig Muskeln gleichzeitig.**

`[read]` **Wurzeln sind fuer die Ansicht, nicht fuer die
Zuordnung.**

## 3 — und wenn bessere Daten kommen

Tom, 2026-09-08:

> wir koennten im hinterkopf behalten, dass wir recherchieren, ob
> es nicht irgendwo detailliertere daten als primary und secondary
> gibt ? sprich runter auf die muskeln pro uebung

`[read]` **Die Bauform traegt es schon:**

    faktor         eine Zahl, nicht zwei Stufen
    muscle_group_id  zeigt auf JEDE Ebene

`[cmd]` **Wenn eine Quelle sagt *,,Kniebeuge: Vastus lateralis
0,8, Vastus medialis 0,7, Rectus femoris 0,4"*** ? **drei Zeilen
auf Ebene 3 statt einer auf Ebene 2.**

`[read]` **Kein Umbau, nur mehr Zeilen.**

`[cmd]` **Und `source_id` plus `evidence_class` sagen, woher der
Faktor kommt** ? **geschaetzt oder gemessen.**

### Wo zu suchen waere

`[cmd]` **Aus der Recherche in `180`:**

    EMG-Sammlungen      ACE, JOSPT, PLOS One
                        je Uebung einzeln, nicht als Datensatz
    Muscle Atlas        Wikipedia/anatomische Datenbanken
                        Funktion, kein Anteil
    Trainingsapps       keine veroeffentlicht ihre Faktoren

`[read]` **Ein fertiger Datensatz *,,Uebung -> Muskel -> Anteil"*
wurde bei der Recherche NICHT gefunden.**

`[read]` **Das heisst nicht, dass es keinen gibt** ? **es heisst,
dass er nicht auf der ersten Seite steht.**
