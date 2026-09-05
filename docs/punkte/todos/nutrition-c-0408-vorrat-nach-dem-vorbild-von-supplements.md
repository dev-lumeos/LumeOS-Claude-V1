---
nr: C-408
typ: feature
modul: nutrition
schwere: mittel
angelegt: 2026-09-07
braucht: [C-407]
kind_von: null
entscheidung: E-64
beruehrt:
  tabellen: [nutrition.shopping_lists]
zahlen:
  gemessen: 2026-09-07
---

# C-408 — Vorrat nach dem Vorbild von Supplements

## Befund

Tom, 2026-09-07: *,,sehen wir dementsprechend gleich auch
stockverwaltung nutrition vor, macht ja sinn."*

`[cmd]` **`supplements.user_inventory` ist gebaut UND
angeschlossen** — eigener Reiter `tab-inventory-echt.tsx`.

    id, user_id, supplement_id, status
    quantity_remaining, quantity_unit
    purchased_at, expires_at
    supplier, cost_per_unit, total_cost
    reorder_flag, source

`[cmd]` **Und `stack_items` traegt `stock_remaining`,
`low_stock_threshold`, `stock_unit`** — **die Schwelle liegt am
Posten.**

`[read]` **Dasselbe Muster fuer Nutrition** — **kein neues Modell
erfinden.**

## Der Kreis

    Vorrat sinkt        beim Erfassen einer Mahlzeit
    Schwelle unter      reorder_flag wird gesetzt
    Einkaufsliste       nimmt es auf

`[cmd]` **`supplement_reorder` steht bereits als `source_type` im
CHECK von `shopping_lists`** — **die Absicht war vorgesehen.**

## Zwei Fragen zuerst

`[read]` **Vorrat je Lebensmittel oder je Verpackung?**

`[cmd]` **Supplements loesen es je Verpackung** — `user_inventory`
haengt an `supplement_id`, mit `purchased_at` und `expires_at`.

`[read]` **Ein Kilo Reis ist eine Packung, 200 g Huehnchen eine
Portion** — **die Frage ist, was der Nutzer zaehlt.**

`[read]` **Und ob der Abzug automatisch geschieht:** **wer eine
Mahlzeit erfasst, hat das Lebensmittel verbraucht** — **aber nicht
jeder erfasst alles.**

`[read]` **Ein automatischer Abzug, der nicht stimmt, ist schlimmer
als keiner.** `[read]` **Miss, wie Supplements es loesen** —
`intake/route.ts` liest `user_inventory`.
