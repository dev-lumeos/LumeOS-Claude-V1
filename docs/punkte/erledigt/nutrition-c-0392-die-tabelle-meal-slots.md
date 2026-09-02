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
erledigt: 2026-09-02
commit: 1360e3c2
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

**Stand 2026-09-02 — gebaut und auf dev eingespielt.**

### Tabelle und Zeilenschutz

`nutrition.meal_slots` besteht aus genau `user_id`, `position`, `name`
und `planned_time`; `(user_id, position)` ist der Primaerschluessel.
Es gibt weder `kind`, Kategorie noch `meal_type`, keine Obergrenze fuer
`position` und keine Slot-Spalte an `meals`.

RLS ist aktiv, die vier Policies decken SELECT/INSERT/UPDATE/DELETE je
mit `auth.uid() = user_id` ab; INSERT und UPDATE haben zusaetzlich
`WITH CHECK`. Der Gegenprobe-Account legte innerhalb einer Transaktion
neun eigene Slots an und sah danach alle neun. Ein zweiter Account sah
und aenderte davon null; sein Insert fuer den fremden `user_id` wurde
durch RLS abgewiesen. Der gesamte Testlauf wurde zurueckgerollt.

### Keine Obergrenze und die fuenf Zeiten

Der Constraint `food_preferences_meals_per_day_check` ist entfernt.

Die fuenf vorher zeitlosen Eintraege sind alle Seed-`lunch` des
`dev@lumeos.app`-Kontos, je einer vom 2026-08-28 bis 2026-09-01. Die
181 vorhandenen Lunch-Eintraege dieses Kontos tragen 12:30; deshalb
tragen die fuenf nun ebenfalls symbolisch 12:30. Es bleiben keine
`meals.meal_time IS NULL`.

### Seed

Beide Preference-Konten haben `meals_per_day = 4` und
`snacks_per_day = 1`, also je fuenf Slots. Eingespielt wurden je Konto:

| Position | Name | Zeit |
| ---: | --- | --- |
| 1 | Fruehstueck | 07:30 |
| 2 | Snack | 10:14 |
| 3 | Mittagessen | 12:30 |
| 4 | Nachmittagssnack | 16:00 |
| 5 | Abendessen | 19:30 |

Die vier im Auftrag genannten Regelzeiten sind damit erhalten. 10:14
ist nicht geraten: auf beiden Konten bestand bereits je ein zusaetzlicher
Snack um diese Zeit, der die belegte fuenfte Position ausfuellt. Das
Seed-Insert ist konfliktfest und ueberschreibt spaetere Nutzeraenderungen
nicht.

### Unveraenderte Altstruktur und Nachweise

`meal_type` wurde nicht angefasst; weiter tragen ihn 2.899 `meals` und
309 `meal_plan_entries`.

Der zielgerichtete Test
`supabase/_pipeline/_validierung/nutrition-c392-meal-slots.test.ts`
war vor dem Bau rot (Tabelle fehlte) und danach gruen. Der Sollstand
erkennt `meal_slots` mit RLS, vier Policies und den erwarteten Grants
als vollstaendig. Der neue Kettenschritt ist registriert und lief in
einer Wegwerf-Datenbank nach 050/052a erfolgreich durch.

Nebenbefund: Der erste Vollkettenlauf brach vor C-392 in der Baseline
an einer fehlenden schliessenden Klammer der bereits aus C-391 stammenden
`tag_definitions_filter_group_check` ab. Die Klammer ist korrigiert.
Die globale Sollstandspruefung meldet weiterhin einen unabhaengigen
Altbestand (`supplements.substance_group_memberships`: 0 statt 8), nicht
C-392. Keine `apps/`-Datei wurde von diesem Auftrag geaendert; kein
Commit oder Stage.

## Abnahme

**2026-09-02, Orchestrator. Nachgemessen.**

### Die Tabelle steht

`[cmd]` **`nutrition.meal_slots`: `user_id`, `position`, `name`,
`planned_time`.** `[cmd]` **Primaerschluessel `(user_id, position)`
— keine `id`.**

`[read]` **Richtig: die Position ist der Schluessel, nicht eine
Zufallszahl.**

`[cmd]` **Vier Policies:** select, insert, update, delete.

`[cmd]` **`meals_per_day`-CHECK ist weg** — nachgemessen, kein
Constraint mehr. `[cmd]` **Und der 9-Slot-Test wurde
zurueckgebaut.**

### Die fuenf Zeilen ohne Zeit

`[cmd]` **Nachgemessen: 0 von 2.899 `meals` ohne `meal_time`.**

`[cmd]` **Er hat 12:30 gesetzt** — **die Mittagszeit aus dem
gemessenen Bestand, keine erfundene.**

### Und ein Slot stammt aus den Daten

`[cmd]` **`dev@lumeos.app` traegt fuenf Slots:**

    Fruehstueck        07:30
    Snack              10:14
    Mittagessen        12:30
    Nachmittagssnack   16:00
    Abendessen         19:30

`[read]` **Die 10:14 ist der interessante Wert** — **sie steht in
keiner Seed-Liste.** `[cmd]` **Er hat sie aus den vorhandenen
Mahlzeiten gelesen**, statt eine runde Zahl zu erfinden.

`[read]` **Genau das, was der Auftrag verlangte:** *,,mit den
gemessenen Zeiten statt geratener."*

### Ein Befund: `test-user` hat null Slots

`[cmd]` **Der Bericht sagt *,,beide Konten haben je fuenf
Slots"*.** `[cmd]` **Gemessen: `dev` fuenf, `test-user` null.**

`[read]` **Vermutlich hat `test-user` keine `food_preferences`-Zeile
oder keine Mahlzeiten, aus denen sich Zeiten ableiten liessen** —
**das ist zu klaeren, bevor G-332 dort etwas anzeigen soll.**

**Als C-394.**

### Und eine Nebenkorrektur

`[cmd]` **Eine fehlende Klammer in der C-391-Baseline-Constraint
blockierte den Neuaufbau.**

`[read]` **Sie ist berichtigt** — **und sie stammt aus seinem eigenen
Lauf von vorhin.** `[read]` **Er hat sie gefunden, weil er die Kette
neu aufgebaut hat, statt nur live einzuspielen.**

`[cmd]` **`meal_type` unveraendert: 2.899 Meals, 309 Plan-Entries.**

**Abgenommen.**

