---
nr: C-535
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: [C-534]
kind_von: C-507
entscheidung: C-507
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-08
---

# C-535 - parent_id fuer nutrition.foods

## Die Frage

`[read]` **Wie traegt die Datenbank die Gruppierung?**

## Toms Entscheidung (C-507)

> da wird der PARENT, zb haehnchenbrust gegrillt, als vorgabe
> angezeigt, aber er kann die CHILD anwaehlen, wenn er will

`[read]` **Der Parent ist eine ECHTE Zeile, kein
Mittelwert.**

    Haehnchenbrust, gegrillt        <- Vorgabe, echt
      Brust ohne Haut, roh
      Brust ohne Haut, gebraten (Ofen)
      Brustfilet, gekocht
      ... 30 weitere

## Dieselbe Bauform wie anderswo

`[cmd]` **`public.koerperflaechen` und
`training.muscle_groups` haben beide `parent_id`.**

`[cmd]` **`nutrition.foods` hat sie NICHT.**

`[read]` **E-81 gilt: `parent_id` traegt die Tiefe, keine
Ebenenzahl.**

`[read]` **Und C-531 zeigt die Falle: ein Knoten ohne
Kennzeichnung sieht aus wie ein eigener Eintrag.**

## Braucht C-534

`[read]` **Ohne die Messung weiss niemand, welche Zeilen
zusammengehoeren.**

## Abnahmebedingungen

    A1  nutrition.foods.parent_id, optional.
    A2  die zehn gemessenen Gruppen gesetzt.
    A3  ein Lebensmittel ohne Gruppe bleibt
        unveraendert.
    A4  Gegenprobe: kein Kreis, keine Selbstreferenz.
    A5  Sicherung, Vollkette, ALLE Waechter.

## Eingegrenzt durch Toms MealCam-Entscheidung, 2026-09-08

`[read]` **Ein BILD braucht keinen Parent** ? **es braucht die
richtige Variante, und die Zubereitung steht im
Visionsergebnis: gegrillt, paniert, ohne Haut.**

`[cmd]` **`processing_level` traegt acht Werte (raw 3.247,
cooked 2.346, ...)** ? **ein Abgleich, keine Rangliste.**

`[read]` **Der Parent bleibt eine Frage der TEXTSUCHE** ?
**wer *,,haehnchenbrust"* tippt, sagt nichts ueber die
Zubereitung.**

`[cmd]` **Und C-534 hat gemessen: nicht ableitbar.**

`[read]` **Also bleibt: kurieren oder gar nicht** ? **und
C-538 sammelt erst die Lehrdaten, bevor entschieden wird.**

