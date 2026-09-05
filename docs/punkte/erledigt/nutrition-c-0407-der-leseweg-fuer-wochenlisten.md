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
erledigt: 2026-09-07
commit: f3675133
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

`[cmd]` 2026-09-05 lokal eingespielt und gegen die Datenbank geprueft.

### C-407

- `nutrition.shopping_list_from_meal_plan_week(week_id, name)` erzeugt
  eine Liste mit `source_type = 'meal_plan'` und der gebundenen
  `meal_plan_week_id`. Direkte Plan-Items und Rezeptzutaten werden je
  kanonischer `food_id` bzw. `custom_food_id` zusammengefasst; die
  Mengen addieren sich in `amount_g`, `quantity` bleibt leer und
  `unit_display` ist `g`.
- Gleiche freie Namen werden absichtlich nicht zusammengefasst: Sie
  haben keine kanonische Identitaet und blieben im Nachweis zwei eigene
  Freitextposten. Die Lesefunktion `shopping_list_read(id)` liefert sie
  zusammen mit `is_checked` stabil nach `sort_order`.
- `shopping_list_archive(id)` setzt den Status auf `archived`; direkte
  DELETE-Rechte auf Listen sind fuer `authenticated` entfernt. Die
  Positionen bleiben lesbar.
- Der Datenstand weicht vom Befundkopf ab: `dev@lumeos.app` hat aktuell
  3 Listen mit 11 Posten; die vierte Liste mit 6 Posten liegt bei
  `test-user@lumeos.local`. Die Dev-Planwochen enthalten beim
  Hähnchen derzeit jeweils 2 Eintraege, nicht 7. Der atomare Test baut
  deshalb sieben gleiche Tages-Items, misst eine aggregierte 700-g-Zeile
  und rollt sie wieder zurueck.

### C-408

- `nutrition.user_inventory` ist als eigene Nutrition-Tabelle live:
  BLS- oder Custom-Food (exklusiv), `menge_g`, `schwelle_g`,
  `zuletzt_angepasst` und berechnetes `reorder_flag`; RLS erlaubt nur
  eigene Zeilen. Es existiert kein Fremdschluessel zu `supplements` und
  kein Verpackungsmodell.
- Ein `AFTER INSERT`-Trigger auf `meal_items` reduziert eine bereits
  angelegte passende Vorratszeile in Gramm, nie unter 0. Eine manuelle
  Korrektur bleibt stehen und der naechste Meal-Item-Abzug zieht nur von
  diesem neuen Wert ab. Ohne Vorratszeile wird kein Bestand erfunden.
- Fuer Einkaeufe gibt es den eigenen Ursprung `nutrition_reorder`, nicht
  `manual`: Die fachliche Herkunft bleibt sichtbar, ohne die
  Supplements-Tabelle oder ihren `supplement_reorder`-Wert zu benutzen.
  Eine automatische Nachbestellliste wird noch nicht erzeugt, weil ohne
  Zielbestand bzw. Verpackungsmodell keine ehrliche Kaufmenge berechenbar
  ist.
- Die Supplements-Referenz loest keinen automatischen Abzug: Die
  Intake-Route schreibt `intake_logs`; Bestand wird dort manuell in
  `stack_items.stock_remaining` gesetzt. Ihre Kommentare, die das
  Fehlen einer `user_inventory`-Tabelle behaupten, sind auf das
  Supplements-Modul bezogen. `apps/` blieb unangetastet.

Nachweis: Red-Test vor dem Schritt (fehlende Wochenlistenfunktion und
fehlende Tabelle), danach C-407/C-408 2/2 gruen. Die
Schema-Vollstaendigkeitspruefung ist gruen (35 Tabellen, 41 Funktionen,
14 Trigger, RLS/Grants/FKs vollstaendig). `kette-readme-pruefen` bleibt
an 57 bereits vorhandenen README/Ketten-Abweichungen rot; der neue
Schritt 407 ist eingetragen. Keine Migration, keine App-Datei und kein
Dev-Server wurden angefasst; nichts wurde gestaged oder committed.

## Abnahme

**2026-09-07, Orchestrator. Nachgemessen.**

### Der Leseweg steht

`[cmd]` **DB-Funktionen zum Erzeugen, Lesen und Archivieren.**

`[cmd]` **Gleiche `food_id`/`custom_food_id` werden in Gramm
summiert, gleiche Freitextnamen bleiben getrennt.**

`[read]` **Die Trennung ist richtig:** **zwei Posten *Olivenoel* aus
verschiedenen Rezepten sind derselbe Einkauf, zwei Freitexte
vielleicht nicht.**

`[cmd]` **Und `authenticated` hat kein DELETE mehr** —
nachgemessen: **drei Policies, `select`, `insert`, `update`.**

`[read]` **Loeschen ist nicht mehr moeglich, nur archivieren** —
**die Regel steht in der Datenbank, nicht in der Oberflaeche.**

### Der Vorrat, mit eigener Tabelle

`[cmd]` **`nutrition.user_inventory` steht:** `user_id`, `food_id`,
`custom_food_id`, `menge_g`, `schwelle_g`, `zuletzt_angepasst`,
`reorder_flag`. `[cmd]` **Vier Policies.**

`[read]` **Keine Supplements-Kopplung** — E-65 gehalten.

`[cmd]` **Neue Meal-Items reduzieren vorhandenen Vorrat in
`amount_g`.** `[cmd]` **Manuelle Korrekturen bleiben Grundlage fuer
den naechsten Abzug.**

`[read]` **Genau E-65:** *,,der stock soll editierbar sein."*

### Und er hat einen Irrtum von mir berichtigt

`[read]` **Ich schrieb: *,,Supplements loesen den Abzug so und so."***

`[cmd]` **Gemessen: die Intake-Route schreibt nur `intake_logs`** —
**Bestand bleibt dort manuell auf `stack_items`.**

`[read]` **Supplements zieht gar nicht automatisch ab.** `[read]`
**Nutrition ist damit das erste Modul, das es tut.**

### Und meine Zahl war falsch

`[cmd]` **Ich sagte: vier Listen, 17 Posten.** `[cmd]` **Gemessen:
`dev` hat drei Listen, `test-user` eine.**

`[read]` **Zum vierten Mal `count(*)` ohne `user_id`.**

### Ein Befund: `nutrition_reorder` ist unerreichbar

`[cmd]` **Zwei CHECKs auf `source_type`:**

    shopping_lists_source_target_check   kennt nutrition_reorder
    shopping_lists_source_type_check     kennt ihn NICHT

`[cmd]` **Der zweite erlaubt nur `manual`, `recipe`, `meal_plan`,
`supplement_reorder`.**

`[read]` **Beide muessen halten** — **also faellt jeder Versuch, eine
`nutrition_reorder`-Liste anzulegen.**

`[cmd]` **Und es liegt keine im Bestand** — **der Weg wurde nie
begangen.**

**Als C-409.**

**Abgenommen.**

