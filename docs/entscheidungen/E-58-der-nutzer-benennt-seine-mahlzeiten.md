---
nr: E-58
getroffen: 2026-09-02
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-72, G-222, E-47]
modul: nutrition
---

# E-58 — der Nutzer benennt seine Mahlzeiten

## Entscheidung

Tom, 2026-09-02, im Anschluss an G-72:

> die mahlzeiten sollen nicht nur numerisch deklariert werden, auch
> namentlich und zeit, sprich der user gibt zb 6 an, dann werden 6
> mahlzeiten aufgelistet welche der user definiert wann die einnahme
> sein soll und wie die benannt werden sollen, logische initialwerte
> koennen generiert werden aber dann editierbar

Und im Brainstorming:

> das ist doch scheissegal ob main oder snack oder weiss nicht was,
> die nutrients darin aendern sich deswegen nicht. es gibt
> bodybuilder die essen 6 mal taeglich eine volle mahlzeit und dann
> einen preworkout meal und ein postworkoutmeal und bei belieben als
> snack 2 bananen etc. das ist alles irrelevant, die summen der
> nutrients sind das target.

> es gibt keine grenzen. bestehende brauchen nur mit zeit angereichert
> zu werden.

## Was daraus folgt

    nutrition.meal_slots
      user_id       uuid
      position      int    die Reihenfolge, keine Obergrenze
      name          text   frei
      planned_time  time
      UNIQUE (user_id, position)

`[read]` **Kein `kind`, keine Kategorie.**

`[cmd]` **Gemessen 2026-09-02: niemand rechnet nach `meal_type`.**
`[cmd]` **Die zwei Treffer im Code sind Zuordnungen** — *welche
Mahlzeit gehoert in diese Zeile* — **keine Auswertungen.**

`[read]` **`meal_type` war nur der Schluessel fuer die Zeile.**
**Genau das kann der Slot besser: er hat Position, Namen und Zeit.**

`[cmd]` **`meal_type` bleibt im Schema** — 2.899 Zeilen tragen es,
ein CHECK-Umbau waere Aufwand ohne Gewinn. `[read]` **Aber es hoert
auf, eine Bedeutung zu haben.**

## Die Zuordnung macht die Zeit

`[cmd]` **2.894 von 2.899 `meals` tragen `meal_time`** — **sie sind
fertig, ohne dass jemand sie anfasst.**

`[cmd]` **Die fuenf ohne Zeit bekommen eine symbolische**, damit die
Reihenfolge bleibt.

`[read]` **Damit braucht `meals` keine Slot-Spalte.** `[read]` **Und
es folgt der Regel: die Anzeige ordnet, die Buchung ist die
Wahrheit.**

`[read]` **Wer die Slot-Zeit spaeter verschiebt, sieht alte Eintraege
anders gruppiert** — **aber kein gespeicherter Wert aendert sich.**

## Keine Obergrenze

`[cmd]` **`food_preferences.meals_per_day` hat heute CHECK 2-6.**

`[read]` **Toms Beispiel sprengt das:** sechs volle Mahlzeiten plus
Pre- und Post-Workout plus Snacks. **Die Grenze faellt.**

## Der Weg fuer den Nutzer

> kuenftig sagt man wieviele mahlzeiten man hat und dann definiert
> man jede einzelne mit zeit und namen (namen koennen wir ja die
> gaengigsten als pulldown zur verfuegung stellen plus manuelle
> eingabe)

**Zwei Schritte:** Anzahl nennen, **dann jede Zeile mit Zeit und
Namen.**

`[read]` **Namen als Vorschlagsliste plus Freitext** — **die
gaengigsten sind sieben Woerter, der Rest ist Eingabe.**

## Drei Orte

> das soll alles in preferences nimm es auf die linke seite unten und
> es soll in settings sowie spaeter in das onboarding

    Preferences   linke Seite unten
    Settings      /v2/settings
    Onboarding    spaeter (G-222)

`[read]` **Und die Kollision aus G-72 faellt weg:** `[cmd]`
**`/v2/settings` schreibt nach `user_profiles`, die
Mahlzeitenstruktur lag in `food_preferences`** — **deshalb stand dort
eine Verweiskachel.**

`[cmd]` **Mit `meal_slots` als eigener Tabelle kann Settings direkt
darauf schreiben** — **ohne mit `food_preferences` zu kollidieren.**

## Der Planner

`[cmd]` **`meal_plan_entries.planned_time` ist die Slot-Zeit**, bis
jemand die Position bestaetigt.

`[read]` **Dort gibt es keine tatsaechliche Zeit** — **erst mit dem
Bestaetigen entsteht eine `meals`-Zeile mit `meal_time`.**
