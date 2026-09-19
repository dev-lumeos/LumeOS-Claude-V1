---
nr: G-486
typ: fehler
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-482
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-486 - erfuellte Ghostentries bleiben stehen

## Toms Befund, zum vierten Mal

Tom, 2026-09-08:

> die ghostentries sind schon wieder verschwunden

> zuerst mal: das haben wir heute schonmal messen und beheben
> lassen!!

`[read]` **Er hat recht** ? **G-482 war heute, und ich habe
*,,kein Anzeigefehler"* abgenommen, ohne zu pruefen, ob die
Flaeche sich erklaert.**

`[cmd]` **Der eigentliche Befund stand in Claude Codes
Bericht:** *,,Tom sah einen leeren Tag und wusste nicht,
warum."*

## Dreimal derselbe Eindruck, dreimal ein anderer Grund

    1. Mal   "0 heute, 4 morgen"   falsch gemessen
    2. Mal   status=active         Plan begann erst morgen
    3. Mal   alle erfuellt         Mahlzeiten schon erfasst

`[read]` **Dreimal an derselben Stelle nichts gesehen** ?
**die Flaeche erklaert sich nicht selbst.**

## Gemessen, heute (2026-09-19)

    PLAN (aktiv)                 ERFASST
    breakfast  Banane-Joghurt    breakfast  5 Posten
    lunch      Huhn-Reis-Bowl    lunch      3
    snack      Magerquark        snack      2
    dinner     Lachs             dinner     4

`[read]` **Alle vier erfuellt, also alle vier Ghosts weg.**

## Toms Entscheidung

> ja die sollen einen gruenen rahmen kriegen und abgehakt
> stehenbleiben als erfuellt

`[read]` **Ein erfuellter Ghost verschwindet nicht** ? **er
zeigt, dass der Plan gemacht ist.**

## Und der zweite Befund: drei Plaene auf demselben Tag

`[cmd]` **Gemessen, heute:**

    Lean bulk 3100      assigned   4 Eintraege
    Cut 4-Meal 2200     paused     4
    Aufbau-Wochenplan   active     4

Tom, 2026-09-08:

> nur ein aktiver plan ist ssot. assigned ist ein geplanter
> zukuenftiger plan, der laufen soll/wird, paused ist wie der
> name sagt pausierend

> es obliegt dem user, welcher plan aktiv ist und wie er sich
> die durchplant. der job der software ist, den aktiven
> anzuzeigen und die planung so zu gestalten, dass es keine
> ueberlappungen gibt

`[read]` **Die Anzeige bleibt richtig: nur der aktive.**

`[read]` **Aber die UEBERLAPPUNG ist ein Befund** ? **drei
Plaene decken denselben Tag ab, und `Cut 4-Meal 2200` beginnt
am selben Tag wie der aktive.**

`[cmd]` **MISS, ob es eine Ueberlappungspruefung gibt.**

## Abnahmebedingungen

    A1  ein erfuellter Ghost bleibt stehen, gruener
        Rahmen, abgehakt. Foto.
    A2  ein offener Ghost sieht anders aus als ein
        erfuellter. Foto beide.
    A3  woran wird "erfuellt" erkannt? Gemessen --
        Mahlzeitart, Rezept, oder Bestaetigung?
    A4  ein Tag ohne Plan sagt WARUM. Foto.
    A5  gibt es eine Ueberlappungspruefung? Gemessen.
        Wenn nein: GEMELDET, nicht gebaut.
    A6  vier Module unveraendert.
    A7  apps/web 1887 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

