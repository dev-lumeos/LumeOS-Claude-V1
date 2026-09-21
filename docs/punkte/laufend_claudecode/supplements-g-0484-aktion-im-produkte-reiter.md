---
nr: G-484
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: [C-519]
kind_von: E-83
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-484 - keine Aktion im Produkte-Reiter

## Toms Beanstandung

Tom, 2026-09-08:

> in supplements, wenn ich ein produkt suche und waehlen will,
> muss die funktion her, dass ich es einem stack zuweisen kann
> mit den noetigen angaben, oder einem meal hinzufuegen kann

## Gemessen

`[cmd]` **Der Produkte-Reiter (G-452, G-453) fuehrt nur zur
Tafel** ? **keine Aktion.**

`[cmd]` **Und die Felder stehen alle:** `stack_items.dose`,
`dose_unit`, `frequency`, `timing`, `cycling` **(E-83,
Frage E).**

    timing      morning | midday | evening | pre_workout
                post_workout | bedtime | with_meal | any
    frequency   daily | weekdays | training_days |
                custom | cycling

## Was zu bauen ist

`[read]` **Zwei Aktionen je Produkt:**

    In den Stack     Dosis, Einheit, Haeufigkeit,
                     Zeitpunkt, Zyklus
    In eine Mahlzeit nur wenn untermischbar
                     (Powder, Liquid, Bar, Gummy)

`[cmd]` **C-519 liefert den Schreibweg** ? **warte darauf.**

`[cmd]` **Und `stack_items` fuehrt SUBSTANZEN** ? **C-518
misst, ob eine Produktspalte noetig ist. MELDEN, wenn sie
fehlt.**

## Abnahmebedingungen

    A1  ein Produkt in den Stack, mit Dosis und
        Zeitpunkt. Foto.
    A2  ein Produkt in eine Mahlzeit. Foto.
    A3  eine Kapsel bietet NUR den Stack an. Foto.
    A4  ein Pulver bietet beides an. Foto.
    A5  Gegenprobe: was passiert bei einem Produkt
        ohne Naehrwerte?
    A6  die elf anderen Reiter unveraendert.

## Toms Praezisierung, 2026-09-08

> das muss natuerlich so gebaut werden, dass man waehlen
> kann, in welchen stack / in welches heutige meal

`[read]` **Nicht *,,in den Stack"*, sondern *,,in WELCHEN
Stack"*.**

`[cmd]` **MISS, ob ein Nutzer mehrere Stacks haben kann** ?
`supplements.stacks` **oder nur `stack_items`.**

`[read]` **Und *,,in welches heutige Meal"*** ? **die
Mahlzeiten des Tages stehen zur Wahl: Fruehstueck,
Mittagessen, Nachmittagssnack, Abendessen.**

`[cmd]` **`meal_items.meal_id` zeigt auf `nutrition.meals`,
`meal_type` traegt die Art** ? **miss, welche es heute
gibt.**

### Die Abnahmebedingungen dazu

    A+  die Stackwahl steht, wenn es mehrere gibt.
        Foto.
    A+  die Mahlzeitwahl zeigt die HEUTIGEN Mahlzeiten.
        Foto.

