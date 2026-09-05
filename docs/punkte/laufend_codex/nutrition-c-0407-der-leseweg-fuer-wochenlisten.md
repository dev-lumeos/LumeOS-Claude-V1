---
nr: C-407
typ: feature
modul: nutrition
schwere: hoch
angelegt: 2026-09-07
braucht: []
kind_von: G-344
entscheidung: E-64
agent: codex
beauftragt: 2026-09-07
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-07
  listen: 4
  posten: 17
---

# C-407 — der Leseweg fuer Wochenlisten

## Befund

Aus E-64, 2026-09-07.

`[cmd]` **`shopping_lists` und `shopping_list_items` sind gebaut und
gefuellt** — vier Listen, 17 Posten.

`[cmd]` **Keine API-Route nennt `shopping`.** `[cmd]` **In `apps/`
steht der Name nur in Tests.**

`[read]` **Dieselbe Klasse wie `meal_plan_slots` vor G-336:** gebaut,
gefuellt, kein Aufrufer.

## Was zu bauen ist

### 1 · Aus einer Planwoche eine Liste

`[cmd]` **`source_type = 'meal_plan'` verlangt
`meal_plan_week_id`** — der CHECK steht.

`[read]` **Die Posten werden zusammengefasst:** **sieben Tage
Huehnchen ergeben eine Zeile.**

`[cmd]` **`shopping_list_items` traegt `amount_g` und `quantity`
getrennt**, dazu `unit_display`.

`[read]` **Miss, wie das Zusammenfassen aussieht:** **gleiche
`food_id` addieren, oder auch gleiche `food_name` bei manuellen
Posten?**

### 2 · Der Leseweg

`[read]` **Eine Liste mit ihren Posten, sortiert nach
`sort_order`.**

`[cmd]` **`is_checked` je Posten** — **das Abhaken schreibt dorthin.**

### 3 · `status = 'archived'`

`[cmd]` **Der CHECK kennt `open`, `completed`, `archived`.**

`[read]` **Loeschen heisst archivieren** — **eine Einkaufsliste ist
ein Beleg, was man gekauft hat.**

## Was nicht dazugehoert

`[read]` **Die Oberflaeche ist ein UI-Auftrag** — **melde, was sie
braucht.**

`[read]` **Und der Vorrat kommt spaeter** (C-408) — **`supplement_
reorder` bleibt vorerst unbenutzt.**

## Auftrag — der Leseweg fuer Wochenlisten

**Mitbeauftragt: C-408.** Bericht in diese Datei.

**Beauftragt am 2026-09-07.**

### 1 · C-407 — aus einer Planwoche eine Liste

`[cmd]` **`shopping_lists` und `shopping_list_items` sind gebaut und
gefuellt** — vier Listen, 17 Posten auf `dev`.

`[cmd]` **Keine API-Route nennt `shopping`, in `apps/` steht der Name
nur in Tests.**

`[read]` **Dieselbe Klasse wie `meal_plan_slots` vor G-336.**

`[cmd]` **Der CHECK steht:** `source_type = 'meal_plan'` **verlangt
`meal_plan_week_id`.**

**Die Posten werden zusammengefasst.** `[read]` **Sieben Tage
Huehnchen ergeben eine Zeile, nicht sieben.**

`[cmd]` **`shopping_list_items` traegt `amount_g` und `quantity`
getrennt**, dazu `unit_display`.

`[read]` **Miss, wie das Zusammenfassen aussieht:** **gleiche
`food_id` addieren** — **und was mit gleichen `food_name` bei
manuellen Posten geschieht.**

### 2 · Loeschen heisst archivieren

`[cmd]` **`status` kennt `open`, `completed`, `archived`.**

`[read]` **Eine Einkaufsliste ist ein Beleg, was man gekauft hat** —
**deshalb archivieren.**

### 3 · C-408 — der Vorrat (E-65)

Tom: *,,wir mischen keine module durcheinander. jedes modul ist in
sich geschlossen."*

**Eine eigene Tabelle, kein Zugriff auf
`supplements.user_inventory`.**

    nutrition.user_inventory
      user_id
      food_id / custom_food_id   -- CHECK wie bei meal_items
      menge_g
      schwelle_g
      zuletzt_angepasst
      reorder_flag

`[cmd]` **Gramm, weil `meal_items` in `amount_g` rechnet** — **der
Abzug braucht keine Umrechnung.**

`[read]` **Kein Verpackungsmodell** — keine `purchased_at`- und
`expires_at`-Ketten je Packung.

**Der Abzug geschieht automatisch, der Wert bleibt editierbar.**

Tom: *,,wenn ein kumpel auch mit isst haben wir die daten nicht,
sprich das wird mehr oder weniger symbolischer wert als lager
haben."*

`[read]` **E-65: der Vorrat ist ein Anhaltspunkt, kein Bestand.**
`[read]` **Er wird nie stimmen** — **deshalb jederzeit editierbar,
ohne Begruendungszwang.**

`[cmd]` **Miss, wie Supplements den Abzug loesen** —
`apps/web/src/app/api/supplements/intake/route.ts` **liest
`user_inventory`.**

`[cmd]` **Und `shopping_lists.source_type` kennt
`supplement_reorder`** — **fuer Nutrition braucht es einen eigenen
Wert oder `manual` mit Vermerk.** **Entscheide und begruende.**

### Was nicht zu tun ist

**Kein Fremdschluessel ueber die Modulgrenze** — E-65.
**Keine Datenlogik in `migrations/`.**
`apps/` nicht anfassen — **die Oberflaeche ist G-345.**
Nicht committen, nicht stagen, nicht pushen.

### Der Dev-Server gehoert dir nicht

`[cmd]` **Kein `neustart`, kein `start`, kein `aufraeumen`.**

### Nachweis

    Wochenliste     aus einer Woche erzeugt, Posten gezaehlt
    Zusammenfassen  sieben Tage Huehnchen -> eine Zeile, belegt
    archivieren     status wechselt, Liste bleibt lesbar
    user_inventory  live, RLS in beide Richtungen
    Abzug           eine erfasste Mahlzeit senkt menge_g, gezaehlt
    editierbar      Handkorrektur ueberlebt den naechsten Abzug

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_
