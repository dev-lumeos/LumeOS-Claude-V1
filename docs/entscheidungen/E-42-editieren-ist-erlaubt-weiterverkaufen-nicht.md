---
nr: E-42
getroffen: 2026-08-31
von: Tom
status: gueltig
loest_ab: ADR_IMPROVEMENTS_PACKAGE#17
abgeloest_durch: null
betrifft: [G-306, C-375, C-376, C-373]
modul: nutrition
---

# E-42 — Editieren ist erlaubt, Weiterverkaufen nicht

## Entscheidung

Tom, 2026-08-31:

> ich meine wenn ich einen plan kaufe dann ist das mein plan, aber was
> wir abgrenzen muessen ist: coach baut einen mealplan, verkauft den
> auf marketplace, dass der nicht wiederverkaufbar wird. das meinte ich
> mit dem log.
>
> betreffs normalem user, wenn wir den einschraenken dass er nicht
> editieren kann dann bescheisst er sich ja selber im sinne: ach ich
> kann nicht editieren dann melde ich einfach etwas anderes das ich
> gegessen habe

## Zwei Dinge, die ich verwechselt habe

    Weiterverkauf   ein gekaufter Plan darf nicht weiterverkauft
                    werden -- ein Lizenzthema
    Editieren       darf nie gesperrt werden -- der Nutzer besitzt
                    seinen Plan

`[read]` **Der Kaeufer darf seinen Plan aendern. Er darf ihn nur
nicht weiterverkaufen.**

`[read]` **Mein `darf_bearbeiten` aus C-375 war das falsche Flag** —
**gemeint ist ein Weiterverkaufsschutz, kein Editierschutz.**

## Das Argument gegen jede Editiersperre

Tom: *,,wenn wir den einschraenken dass er nicht editieren kann dann
bescheisst er sich ja selber."*

`[read]` **Eine Sperre, die sich umgehen laesst, macht die Daten
schlechter.** **Wer den Plan nicht aendern darf, traegt beim Loggen
etwas Falsches ein** — **und dann steht im Protokoll eine Abweichung,
die keine war.**

`[read]` **Die Auswertung, die Tom will — *welche Mahlzeit wechselt er
immer* — braucht ehrliche Daten.** **Eine Sperre erzeugt unehrliche.**

## Was `ADR_IMPROVEMENTS_PACKAGE` #17 richtig sah

`[cmd]` **Der ADR sperrt Positionen, sobald der Plan `active` ist.**
`[cmd]` **Begruendung: `MealPlanLog` referenziert `plan_item_id`.**

`[read]` **Die Sorge ist berechtigt, die Folgerung zu grob.**

    geloggt           eingefroren -- das ist Vergangenheit
    nicht geloggt     frei, auch zukuenftige Plantage

`[cmd]` **Und der `resolution_check` an `meal_plan_logs` erzwingt es
bereits:** ein `pending`-Log hat kein `actual_meal_id`, kein
`confirmed_at`. **Es gibt nichts zu verfaelschen.**

`[read]` **Also: 409 nur, wenn diese Position ein Log mit
`status <> 'pending'` traegt** — nicht fuer den ganzen Plan.

`[read]` **Und damit braucht es auch keinen *Kopie bearbeiten*-Ausweg
mehr** — er war die Antwort auf eine Sperre, die es so nicht geben
soll.

## Was gilt

    Plan kaufen        er gehoert dem Kaeufer, er darf ihn aendern
    weiterverkaufen    nein -- Flag am Plan
    Position aendern   ja, solange sie nicht geloggt ist
    geloggte Position  eingefroren, wie im Tagebuch
    Zielerreichung     Sache des Nutzers, nicht unsere

`[read]` **Tom: *,,das obliegt bei dem user und seiner verantwortung
und ist nicht unser job einfach zu blockieren."***

## Was das Protokoll dafuer schon kann

`[cmd]` **`meal_plan_logs` traegt vier Zustaende:** `pending`,
`confirmed`, `deviated`, `skipped` — **mit `deviation_kcal`,
`deviation_pct`, `plan_entry_id`.**

`[read]` **Damit ist die Auswertung vorgesehen:** *welche Mahlzeit
wurde immer gewechselt* ist eine Abfrage ueber `status = 'deviated'`
je `plan_entry_id`.

`[cmd]` **Heute traegt die Tabelle 0 Zeilen** — der Bestaetigungsweg
schreibt noch nicht hinein.
