---
nr: G-472
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-512
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/lib/supplements/produkt-etikett.ts
zahlen:
  gemessen: 2026-09-08
  produkte: 3273
---

# G-472 - die Tafel zeigt die Portionswahl nicht

## Befund

`[cmd]` **C-512 hat gemessen: 3.273 Produkte haben MEHRERE
DSLD-Portionsgroessen.**

`[cmd]` **Die Standardsicht zeigt dafuer
`luecken.multiple_serving_sizes`** ? **keine Summe mehr.**

`[cmd]` **Und `supplier_product_nutrient_serving_options`
liefert die Werte je Portion.**

`[read]` **Die Tafel liest keine davon.**

## Was zu bauen ist

`[cmd]` **Beleg: Mary Ruths Vegan Liquid Iron (DSLD 327737):**

     5 mL   10 kcal,  6 mg Eisen
    10 mL   15 kcal, 12 mg
    15 mL   20 kcal, 18 mg

`[read]` **Der Nutzer waehlt die Portion, und die Werte
folgen.**

`[read]` **Bei einem Produkt mit EINER Portion aendert sich
nichts.**

## Abnahmebedingungen

    A1  ein Produkt mit mehreren Portionen: die Wahl
        steht. Foto.
    A2  die Werte folgen der Wahl. Zahl je Portion.
    A3  ein Produkt mit EINER Portion: unveraendert.
        Foto.
    A4  Gegenprobe: ein Produkt ohne Portionsangabe.
    A5  vier Module unveraendert.
    A6  apps/web 1830 oder mehr, apps/coach 65.

## Ist er durch G-492 ueberholt? 2026-09-08

`[cmd]` **G-492 hat ein Modal mit Portionswahl gebaut:**

    PORTIONSGROESSE  [33 Gram(s) - 130 kcal v]
    ANZAHL           [2]
                     ergibt 260 kcal, 48 g Protein

`[read]` **Das ist die Wahl beim HINZUFUEGEN.** **Dieser
Punkt meint die TAFEL: was steht da, bevor man etwas tut?**

`[cmd]` **MISS das ZUERST** ? **wenn das Modal reicht, ist
der Punkt erledigt und wird geschlossen, nicht gebaut.**

`[cmd]` **Beleg aus C-512: Mary Ruths Vegan Liquid Iron
(DSLD 327737) traegt 5/10/15 mL mit 6/12/18 mg Eisen** ?
**pruefe an genau dem, was die Tafel heute zeigt.**


## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

