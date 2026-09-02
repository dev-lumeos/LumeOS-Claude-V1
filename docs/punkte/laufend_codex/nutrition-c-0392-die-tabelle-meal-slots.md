---
nr: C-392
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: G-72
entscheidung: E-58
agent: codex
beauftragt: 2026-09-02
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

## Auftrag — die Tabelle und drei Nebenarbeiten

**Beauftragt am 2026-09-02.**

### 1 · Die Tabelle

    nutrition.meal_slots
      user_id       uuid    RLS wie ueberall
      position      int     die Reihenfolge, KEINE Obergrenze
      name          text    frei
      planned_time  time
      UNIQUE (user_id, position)

`[read]` **Kein `kind`, keine Kategorie.** Tom: *,,das ist doch
scheissegal ob main oder snack, die nutrients darin aendern sich
deswegen nicht. die summen der nutrients sind das target."*

`[cmd]` **Gemessen: niemand rechnet nach `meal_type`** — **die zwei
Codetreffer sind Zuordnungen, keine Auswertungen.**

### 2 · Die Obergrenze faellt

`[cmd]` **`food_preferences.meals_per_day` hat CHECK 2-6.**

`[read]` **Toms Beispiel sprengt das:** sechs volle Mahlzeiten plus
Pre- und Post-Workout plus Snacks. **Es gibt keine Grenzen.**

### 3 · Fuenf Zeilen ohne Zeit

`[cmd]` **2.894 von 2.899 `meals` tragen `meal_time`.**

`[cmd]` **Die fuenf ohne bekommen eine symbolische** — Tom: *,,zeiten
symbolisch nachtragen dass die reihenfolgen bleiben."*

`[read]` **Miss, was diese fuenf sind, bevor du eine Zeit
waehlst** — **die Reihenfolge im Tag soll bleiben.**

### 4 · Seed fuer die zwei Konten

`[cmd]` **Aus `meals_per_day` und `snacks_per_day`.**

`[cmd]` **Mit den gemessenen Zeiten 07:30 / 12:30 / 16:00 / 19:30** —
**nicht mit geratenen.**

### Was nicht zu tun ist

`[read]` **`meal_type` nicht anfassen.** `[cmd]` **2.899 + 309 Zeilen
tragen es, ein CHECK-Umbau waere Aufwand ohne Gewinn.** **Es hoert
auf, eine Bedeutung zu haben — mehr nicht.**

`[read]` **Und `meals` bekommt keine Slot-Spalte** — **die Zuordnung
macht die Zeit.** `[read]` **Wer die Slot-Zeit spaeter verschiebt,
sieht alte Eintraege anders gruppiert, aber kein gespeicherter Wert
aendert sich.**

`apps/` nicht anfassen. Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Tabelle          live, RLS geprueft in beide Richtungen
    Obergrenze       CHECK weg, ein Konto mit 9 Slots angelegt
                     und zurueckgebaut
    fuenf Zeilen     Zeit nachgetragen, Reihenfolge belegt
    Seed             zwei Konten, Slots mit gemessenen Zeiten
    meal_type        unveraendert, gezaehlt

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
