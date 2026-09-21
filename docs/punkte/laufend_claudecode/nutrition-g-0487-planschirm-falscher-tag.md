---
nr: G-487
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-486
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/plan-eintraege.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-487 - der Tageswechsler steht auf einem alten Tag

## Toms Befund

Tom, 2026-09-08:

> ich hab den fehler gefunden: der daychooser war auf 18.9. und
> nicht heute, sprich das ist eine boesartige falle

> nach einem F5 oder neustart oder refresh muss initialisiert
> werden auf jetzt

`[cmd]` **Heute ist der 2026-09-21, der Schirm zeigte den
18.09.**

## Warum es eine Falle ist

`[read]` **Der Schirm zeigt einen alten Tag, und NICHTS sagt
es.**

`[cmd]` **Am 18.09. hat der aktive Plan null Eintraege, am
21.09. hat er vier** ? **Tom sah *,,kein Eintrag"* und hielt es
fuer einen Fehler.**

`[read]` **Und jede Messung auf diesem Schirm ist falsch,
ohne dass jemand es merkt** ? **das ist die Bosheit.**

`[cmd]` **Viermal hat Tom gemeldet, die Ghostentries seien
verschwunden** ? **mindestens einmal war es das.**

## Die Umkehrung von G-467

`[read]` **Dort war Speichern RICHTIG: ein Filter soll den
Neuaufbau ueberleben.**

`[read]` **Hier ist es FALSCH: ein Tag soll es nicht.**

`[cmd]` **Codex hat die Regel in C-511 formuliert:** *,,der
Filter ist eine ANSICHTSSACHE, die Lieblingsmarke eine
HALTUNG."*

`[read]` **Ein gewaehlter Tag ist noch weniger als eine
Ansichtssache** ? **er ist ein Moment.**

## Gemessen, wo er NICHT steht

    public.user_display_preferences   kein Tageseintrag
    localStorage / sessionStorage     0 Treffer in
                                      nutrition/
    Tageswechsler im Code             nur in
                                      supplements/page.tsx

`[read]` **Also kommt der Tag woanders her** ? **MISS es.**

`[cmd]` **Kandidaten: die URL, ein React-Zustand ueber die
Navigation, ein Elternbauteil.**

## Und die zwei anderen Widersprueche bleiben

`[cmd]` **Gemessen am selben Schirm:**

    Flaeche oben:    "Tag 3 von 35"
    Flaeche unten:   "Dauer 28 Tage"
    meal_plans:      days_count 28
    meal_plan_days:  63 Tage, 2026-06-18 bis 2026-10-23

`[cmd]` **Und `Laeuft bis 23.10.`** ? **19.09. + 28 Tage =
17.10.**

`[read]` **Drei Zahlen, keine zwei passen zusammen.**

## Abnahmebedingungen

    A1  woher kommt der Tag? Gemessen.
    A2  nach F5 steht er auf HEUTE. Foto vorher
        (alter Tag) und nachher.
    A3  das gilt fuer JEDEN Tageswechsler --
        miss, welche es gibt. Nutrition, Supplements,
        Recovery, Training.
    A4  "Tag 3 von 35" gegen "28 Tage": welche Zahl
        stimmt? Berichtigt.
    A5  63 Tage in der Datenbank gegen 28 im Plan:
        GEMELDET, wenn es ein Datenfehler ist.
    A6  "Laeuft bis": gerechnet oder gelesen?
    A7  ein Waechter faengt einen Tageswechsler, der
        nicht auf heute startet. Sabotageprobe.
    A8  vier Module unveraendert.
    A9  apps/web 1893 oder mehr, apps/coach 65.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

