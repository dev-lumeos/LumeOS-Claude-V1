---
nr: C-392
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-72
entscheidung: E-58
beruehrt:
  tabellen: [nutrition.food_preferences]
zahlen:
  gemessen: 2026-09-02
  meals: 2899
  ohne_zeit: 5
---

# C-392 — die Tabelle `meal_slots`

## Befund

Aus E-58, 2026-09-02.

`[cmd]` **Heute traegt `meal_type` einen CHECK mit sieben Werten, in
zwei Tabellen** — `meals` und `meal_plan_entries`.

`[cmd]` **Nur vier sind in Gebrauch:** breakfast 723, lunch 728,
dinner 723, snack 725. **`pre_workout`, `post_workout` und `other`
auf keinem Konto.**

`[read]` **Freie Namen passen da nicht hinein** — **und die Frage ist
nicht mehr Namen, sondern wem der Name gehoert.**

## Was zu bauen ist

    nutrition.meal_slots
      user_id       uuid    RLS wie ueberall
      position      int     die Reihenfolge, KEINE Obergrenze
      name          text    frei
      planned_time  time
      UNIQUE (user_id, position)

`[read]` **Kein `kind`, keine Kategorie** — Tom: *,,die summen der
nutrients sind das target."*

`[cmd]` **Gemessen: niemand rechnet nach `meal_type`** — die zwei
Codetreffer sind Zuordnungen, keine Auswertungen.

## Drei Nebenarbeiten

`[cmd]` **1. `food_preferences.meals_per_day` hat CHECK 2-6** —
**die Grenze faellt** (E-58).

`[cmd]` **2. Fuenf `meals` ohne `meal_time`** bekommen eine
symbolische, **damit die Reihenfolge bleibt.**

`[cmd]` **3. Seed fuer die zwei bestehenden Konten** — aus
`meals_per_day` und `snacks_per_day`, **mit den gemessenen Zeiten
07:30 / 12:30 / 16:00 / 19:30 statt geratener.**

## Was nicht zu tun ist

`[read]` **`meal_type` nicht anfassen.** `[cmd]` **2.899 + 309 Zeilen
tragen es, ein CHECK-Umbau waere Aufwand ohne Gewinn.** **Es hoert
auf, eine Bedeutung zu haben — mehr nicht.**

`[read]` **Und `meals` bekommt keine Slot-Spalte** — **die Zuordnung
macht die Zeit.**
