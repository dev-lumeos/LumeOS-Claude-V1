---
nr: E-20
getroffen: 2026-08-27
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-320, C-321]
modul: nutrition
---

# E-20 — Cam: zwei Zwecke, zwei Einwilligungen, gebaut erst vor Produktiv

## Frage

C-320: Aufbewahrung nach Thai PDPA und DSGVO?
C-321: wie wird die Einwilligung gefuehrt?

## Der Konflikt

`[read]` **Tom will spaeter ein Learning mit den Ernaehrungsdaten.**
`[read]` **Wer Bilder dafuer behaelt, kann sich nicht auf
Datenminimierung berufen.** Loeschen nach der Analyse waere der
einfache Weg — **und macht das Learning unmoeglich.**

## Entscheidung

**Zwei getrennte Zwecke mit zwei getrennten Einwilligungen:**

    Zweck 1   Analyse        Bild bleibt, bis der Nutzer es loescht
    Zweck 2   Verbesserung   Bild darf fuer Modelltraining dienen

`[read]` **Zweck 2 ist optional und standardmaessig aus.** Wer nicht
zustimmt, bekommt MealCam trotzdem. **Das ist das einzige Modell, bei
dem ein Nutzer widersprechen kann, ohne die Funktion zu verlieren.**

**Kein Kopieren in einen Trainingsordner, sondern ein Filter auf der
Einwilligung.** `[read]` **Wer Zweck 2 widerruft, dessen Bilder
muessen aus dem Trainingsbestand verschwinden** — das geht nur, wenn
der Bestand die Herkunft je Bild kennt.

## Zeitpunkt: vorsehen, nicht bauen

Tom, 2026-08-27: *,,auch hier sicherheit interessiert mich erst wenn
wir aus der entwicklungsphase rauskommen, vorsehen"*.

`[read]` **Die Trennlinie liegt zwischen Schema und Ablauf.**

**Jetzt vorsehen — kostet nichts und spart spaeter Tage:**

    Bucket privat, nicht public
    Bild und Analyse in getrennten Tabellen (E-19)
    Spalte je Zweck auf der Einwilligung, unbenutzt
    `modell` und `modell_version` je Erkennung
    Herkunft je Bild, damit ein Widerruf greifen kann

**Nicht jetzt bauen:**

    Einwilligungsdialog und Textfassung
    Loeschfristen je Rechtsraum
    Unterscheidung Thai PDPA gegen DSGVO
    Ausleitung fuer das Training

`[read]` **Der Unterschied:** ein fehlendes Feld kostet spaeter eine
Migration mit Ausfallzeit, ein fehlender Dialog kostet einen
Nachmittag.

## Wann es faellig wird

`docs/todo/SICHERHEIT.md`, vier Kippbedingungen — **die erste ist der
erste Nutzer, der nicht wir ist.**

`[read]` **Und Cam verschaerft sie:** ein Foto einer Mahlzeit traegt
mehr als Essen. Kueche, Wohnung, Gesichter im Hintergrund,
Medikamentenpackungen auf dem Tisch. **Das ist nicht dieselbe
Datenklasse wie ein Gewichtseintrag.**
