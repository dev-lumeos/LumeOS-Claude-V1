---
nr: G-447
typ: befund
modul: training
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-491
entscheidung: null
beruehrt:
  tabellen: [training.exercise_muscles]
zahlen:
  gemessen: 2026-09-08
  muskeln: 15
---

# G-447 — vier gezeichnete Muskeln, die keine Uebung trifft

## Befund

`[cmd]` **G-445 hat gemessen: 15 von 105 Muskelgruppen kommen in
KEINER Uebung vor.**

`[cmd]` **Vier davon sind GEZEICHNET, haben also eine
Kartenflaeche:**

    serratus-anterior
    external-oblique
    nacken          (Posterior Neck Muscles)
    flanke

`[read]` **Sie bleiben grau, und das ist KORREKT** ? **aber es
ist eine Luecke in `exercise_muscles`, kein Anzeigefehler.**

## Warum sie zaehlen

`[cmd]` **`Serratus Anterior` und `External Oblique` sind echte
Trainingsmuskeln** ? **Pullover, Liegestuetz-Plus, Seitbeuge,
Russian Twist.**

`[cmd]` **C-491 hat 1.101 Wurzelzuordnungen aufgeloest** ?
**diese vier hat es nicht getroffen.**

`[read]` **Und `flanke` hat gar keinen Muskelnamen** (G-430,
G-432) ? **das ist ein eigener Fall.**

## Die uebrigen elf

`[read]` **Nicht gezeichnet, also unsichtbar** ? **aber
gemessen.**

`[cmd]` **G-445 meldet sie mit eigener Marke.**

`[read]` **Miss, welche davon echte Trainingsmuskeln sind** ?
`Grip Muscles` **braucht keine Uebung,** `Infraspinatus`
**schon.**

## Was zu tun ist

**1** ? **Je der 15: gibt es eine Uebung, die ihn trifft?**

`[cmd]` **1.416 Uebungen im Katalog** ? **`Pullover`,
`Side Bend`, `Russian Twist` sollten da sein.**

**2** ? **Die Zuordnung mit Faktor und Quelle** (C-490).

**3** ? **Wo KEINE Uebung passt: melden, nicht erfinden.**

`[read]` **`Grip Muscles` und `Foot Muscles` sind vermutlich
ohne** ? **das ist eine Antwort, kein Fehler.**

## Abnahmebedingungen

    A1  je der 15: Uebung gefunden oder nicht?
        TABELLE.
    A2  gefundene Zuordnungen mit faktor, source_id,
        evidence_class.
    A3  wie viele der 15 bleiben ohne? Begruendet.
    A4  die vier gezeichneten: wie viele sind danach
        gruen?
    A5  Sicherung, Vollkette, Punktelauf.

