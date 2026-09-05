---
nr: E-64
getroffen: 2026-09-07
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [G-344, C-380]
modul: nutrition
---

# E-64 — Einkaufsliste und Vorrat

## Entscheidung

Tom, 2026-09-07:

> mal abgesehen davon dass man einkaufslisten anhand von plaenen
> macht und nicht einem rezeptbuch

> sehen wir dementsprechend gleich auch stockverwaltung nutrition
> vor, macht ja sinn

## Der Befund: beides existiert halb

`[cmd]` **`nutrition.shopping_lists` traegt `source_type` mit vier
Werten:** `manual`, `recipe`, `meal_plan`, `supplement_reorder`.
`[cmd]` **Der CHECK erzwingt: `meal_plan` verlangt
`meal_plan_week_id`.**

`[cmd]` **Aber `SPEC_03` Flow 8 und `SPEC_04` Feature 6 beschreiben
nur den Rezeptweg** — **kein Loeschen, kein Bearbeiten, kein Plan.**

`[cmd]` **Und in `apps/` liest die Tabellen niemand** — vier Listen,
17 Posten auf `dev`, ohne Aufrufer.

`[cmd]` **`supplements.user_inventory` ist gebaut UND
angeschlossen** — eigener Reiter `tab-inventory-echt.tsx`.

## Was gilt

### 1 · Die Wochenliste ist der Hauptfall

`[read]` **Wer eine Woche plant, kauft fuer die Woche** — **nicht
fuer ein einzelnes Rezept.**

`[cmd]` **`meal_plan_week_id` zeigt auf eine Woche, nicht auf einen
Plan** — **das passt: man kauft woechentlich, nicht fuer zwoelf
Wochen.**

`[read]` **Der Ort: im Planner, an der Woche** — dort steht bereits
*,,28 Eintraege · Copy week"*.

`[read]` **Und die Posten werden zusammengefasst:** **sieben Tage
Huehnchen ergeben eine Zeile, nicht sieben.** `[cmd]`
**`shopping_list_items` traegt `amount_g` und `quantity` getrennt.**

### 2 · Die Rezeptliste bleibt

`[cmd]` **Flow 8 funktioniert im Schema** — drei Listen liegen auf
`dev`.

`[read]` **Sie ist der Nebenfall:** ein Rezept, das nicht im Plan
steht.

### 3 · Die freie Liste

`[cmd]` **`source_type = 'manual'`** — Kaffee, Oel, was man nebenbei
braucht.

### 4 · Der Vorrat kommt, nach dem Vorbild von Supplements

`[cmd]` **`supplements.user_inventory` traegt fuenfzehn Spalten:**
`quantity_remaining`, `quantity_unit`, `purchased_at`, `expires_at`,
`supplier`, `cost_per_unit`, `total_cost`, `reorder_flag`.

`[cmd]` **Und `stack_items` traegt `stock_remaining`,
`low_stock_threshold`, `stock_unit`** — **die Schwelle liegt am
Posten, nicht am Nutzer.**

`[read]` **Dasselbe Muster fuer Nutrition** — **kein neues Modell
erfinden.**

`[read]` **Der Kreis schliesst sich:** **Vorrat sinkt beim Erfassen,
Unterschreiten der Schwelle setzt `reorder_flag`, die Einkaufsliste
nimmt es auf.**

`[cmd]` **`supplement_reorder` steht bereits als `source_type` im
CHECK** — **die Absicht war vorgesehen.**

## Was zuerst zu klaeren ist

`[read]` **Vorrat je Lebensmittel oder je Verpackung?** `[cmd]`
**Supplements loesen es je Verpackung** (`user_inventory` haengt an
`supplement_id`, mit `purchased_at` und `expires_at`).

`[read]` **Ein Kilo Reis ist eine Packung, 200 g Huehnchen eine
Portion** — **die Frage ist, was der Nutzer zaehlt.**

`[read]` **Und ob der Abzug automatisch geschieht:** **wer eine
Mahlzeit erfasst, hat das Lebensmittel verbraucht** — **aber nicht
jeder erfasst alles.**

`[read]` **Ein automatischer Abzug, der nicht stimmt, ist schlimmer
als keiner.**
