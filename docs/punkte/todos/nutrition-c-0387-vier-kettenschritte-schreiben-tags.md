---
nr: C-387
typ: befund
modul: nutrition
schwere: hoch
angelegt: 2026-09-02
braucht: []
kind_von: C-384
entscheidung: E-55
beruehrt:
  tabellen: [nutrition.food_tags]
zahlen:
  gemessen: 2026-09-02
  schritte: 4
---

# C-387 — vier Kettenschritte schreiben Tags

## Befund

Aus C-384, Codex, 2026-09-02.

    020   high_protein, low_carb, low_fat, high_fiber
          nur INSERT ... ON CONFLICT DO NOTHING
    027   whole_food, ultra_processed, vegan, vegetarian,
          contains_nuts, contains_gluten, contains_lactose,
          thai_food, halal, kosher
          loescht alle zehn, liest neu aus lebensmittel-tags.jsonl
    032   halal, kosher
          loescht und rechnet neu aus Ausschluss-Presets
    221   high_fat, gluten_free
          in der Kette, auf dev nicht eingespielt

`[cmd]` **Kein Trigger, kein `auto_tag_food`, 0 Trigger an der
Tabelle.**

## Was das fuer E-55 heisst

`[read]` Codex: *,,Die zweite Tabelle muss gegen alle
Kettenschreiber wirken. Sie darf insbesondere nicht annehmen, es gebe
nur einen Import."*

`[cmd]` **E-55 bleibt begruendet** — **aber der Umfang ist groesser
als gedacht.**

`[read]` **Und 032 ist der schwierige Fall:** **er loescht `halal`
und `kosher`, die 027 gerade gesetzt hat, und rechnet sie neu.**
`[read]` **Eine Kuration muesste beide Laeufe ueberleben.**

## Und 221 ist noch nicht da

`[cmd]` **`high_fat` und `gluten_free` liegen in der Kette, sind auf
`dev` nicht eingespielt.**

`[read]` **Sie braechten zwei neue Definitionen und eigene
Ersetzungen** — **die Zahl 14 waere dann 16.**
