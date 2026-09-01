---
nr: G-311
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-01
braucht: []
kind_von: G-310
entscheidung: null
agent: claudecode
beauftragt: 2026-09-02
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/tab-planner-echt.tsx
zahlen: null
---

# G-311 — drei Sackgassen im Planner

## Befund

Tom, 2026-09-01, am Schirm.

### 1 · *In der Werkbank* tut nichts

`[cmd]` **Der Knopf steht in der Planliste, der Sprung fehlt.**
`[cmd]` **Das ist G-307, halb gebaut.**

### 2 · Ein Rezept im Raster laesst sich nicht oeffnen

Tom: *,,eingetragene recipes sind ja ok, aber mindestens bei klick
drauf will man sehen was darin ist an lebensmittel und details."*

`[cmd]` **`RecipeDetail` ist gebaut — im Rezepte-Reiter.** `[cmd]`
**Im Planner ist sie nicht verdrahtet.**

### 3 · Die Rezepte-Auflistung unter dem Raster

Tom: *,,darunter rezepte auflistung? fuer was ist das zeigt nur
irgendwelche daten an."*

`[cmd]` **Sie steht in keiner Spec und in keinem Mockup.**
`[read]` **Sie stammt aus dem Entwurf, aus der Zeit vor dem
Rezepte-Reiter** — **und ist seit G-289 doppelt.**

## Auftrag

**Vorbereitet mit G-310 am 2026-09-01.** Der Auftragstext
und der Bericht stehen dort.


## Auftrag — die Bibliothek verdrahten, dann die drei Sackgassen

**Beauftragt am 2026-09-02.**

### 1 · Die "Alle Plaene"-Liste in den Plans-Reiter

**Ja, verdrahten.** `[read]` **Drei Quellen sagen dasselbe:**

`[cmd]` **Die Attrappe zeigt unten sechs Plankarten.** `[cmd]`
**E-41: *Meal plans ist die Bibliothek — alle Plaene, aktivieren.***
`[cmd]` **Und `SPEC_03` Flow 3 Schritt 1: *Uebersicht zeigt alle
verfuegbaren Plaene*.**

`[cmd]` **`allePlaene` ist geladen, `MealPlanCard` gebaut** — **es ist
Verdrahtung, kein Neubau.** `[read]` **Du hast recht, dass es dein
Auftrag nicht ausdruecklich nannte.** **Es ist die Voraussetzung
dafuer, die vier Herkunfts-Badges ueberhaupt zu belegen.**

`[read]` **Und der gekippte Kommentar *,,der zweite gehoert
tom.seed"* faellt damit auch** — er begruendete genau die Luecke, die
du gefunden hast.

### 2 · *Lifecycle types* heisst heute *Lebenszyklus*

`[cmd]` **Noch ein erfundener Titel.** `[read]` **Die Attrappe nennt
ihn *Lifecycle types* und zeigt drei Zeilen mit Folgesatz.**

`[read]` **Nimm ihn mit** — es ist dieselbe Klasse wie die sieben,
die du entfernt hast.

### 3 · G-311 — drei Sackgassen im Planner

`[cmd]` **1. *In der Werkbank* tut nichts** — der Sprung fehlt
(G-307).

`[cmd]` **2. Ein Rezept im Raster laesst sich nicht oeffnen.**
`RecipeDetail` ist gebaut, im Planner nicht verdrahtet.

`[cmd]` **3. Die Rezepte-Auflistung unter dem Raster steht in keiner
Spec und keinem Mockup** — seit dem Rezepte-Reiter doppelt.

### Was nicht zu tun ist

**Nichts erfinden, was weder in der Attrappe noch in der Spec
steht.**
**Nichts auf `dev@lumeos.app`.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir

`[cmd]` **`server.py start` bevorzugen.**

### Nachweis

    Alle Plaene       vier Plaene sichtbar, vier Badges belegt
    Lifecycle types   Titel aus der Attrappe
    Werkbank-Knopf    fuehrt in den Planner
    Rezept im Raster  oeffnet das Detail
    Rezepte-Liste     entfernt
    Buehne            rueckwaerts datiert, wie du korrigiert hast
    Bildschirmfoto    vorher / nachher

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
