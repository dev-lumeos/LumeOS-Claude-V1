---
nr: E-25
getroffen: 2026-08-29
von: Tom
status: gueltig
loest_ab: null
abgeloest_durch: null
betrifft: [C-324, C-323]
modul: nutrition
---

# E-25 — der Nutrition-Tagesscore rechnet nach NRF9.3

## Frage

Tom, 2026-08-29: *,,ein tagesscore ob fuer nutrition oder recovery
muss doch sicher eine formel haben die wissenschaftlich belegbar ist?
solche scores zeigen dem user in einem modul praktisch seinen
modulgesamtstatus an das ist doch sehr hilfreich."*

## Entscheidung

**Nutrition bekommt einen Tagesscore nach NRF9.3.** Tom: *,,ok
nutrition. fuer recovery und training vorsehen in den todos."*

## Die Formel

**Nutrient Rich Foods Index 9.3**, entwickelt von Drewnowski,
validiert gegen den Healthy Eating Index:

    NRF9.3 = (Protein/50g + Ballaststoffe/25g + VitA/5000IU
            + VitC/60mg + VitE/30IU + Calcium/1000mg + Eisen/18mg
            + Magnesium/400mg + Kalium/3500mg
            - gesaettigte Fette/20g - Zucker/50g - Natrium/2400mg)
            x 100

**Neun Naehrstoffe, die zaehlen, minus drei, die begrenzt werden.**
`[read]` **Je Naehrstoff bei 100 Prozent des Tagesbedarfs
gedeckelt** — damit ein Uebermass eines einzelnen den Score nicht
hochzieht.

## Warum diese und keine andere

`[read]` **Sie ist belegt, nicht gesetzt.** NRF9.3 erklaert **45,3
Prozent der Varianz des HEI je 100 kcal** — der beste Wert aller
getesteten Varianten von NRF6.3 bis NRF15.3.

`[read]` **Und sie ist mehrfach unabhaengig geprueft:** validiert in
den USA gegen HEI-2005, in den Niederlanden gegen den Dutch Healthy
Diet Index, in Japan gegen HEI-2015, in China gegen 24-Stunden-Recall.

`[cmd]` **Alle zwoelf Naehrstoffe stehen in
`nutrition.daily_summary`:** `prot625`, `fibt`, `vita`, `vitc`,
`vite`, `ca`, `fe`, `mg`, `k`, `fasat`, `sugar`, `na`. **Die Formel
ist rechenbar, ohne dass eine Spalte fehlt.**

## Drei Einschraenkungen, die mitgeschrieben werden

**Die Referenzwerte sind US-amerikanisch.** `[read]` Wir rechnen sonst
gegen EFSA. **Ersetzt man sie, ist es nicht mehr die validierte
Fassung** — die Studienlage gilt fuer die Originalwerte. **Also:
NRF9.3 in der Originalfassung, und als solche benannt.**

**,,Added sugars" gibt es nicht**, nur Gesamtzucker. `[read]` **Die
Autoren haben diese Variante selbst getestet** — sie ist zulaessig
und gehoert vermerkt.

**Validiert ist NRF fuer die Allgemeinbevoelkerung, nicht fuer
Sportler.** `[read]` Bei 170 g Protein taeglich ist Protein laengst
gedeckelt und traegt nichts mehr bei. `[read]` **Praezedenz fuer eine
Anpassung gibt es:** die E-NRF7.3-Variante fuer aeltere Erwachsene
zeigt den Weg — Naehrstoffe austauschen, Referenzen aendern, **dann
gegen einen unabhaengigen Massstab neu validieren.**

`[read]` **Eine Sportler-Variante waere unsere Formel, nicht die
belegte.** Sie ist moeglich, aber sie kommt danach und traegt einen
anderen Namen.

## Recovery und Training

`[read]` **Vorgesehen, nicht gebaut.** `[cmd]` **Bei Recovery liefern
zwei Rechnungen heute 36 gegen 35,3** (C-143/C-218), und **G-106
warnt vor einem zweiten Gesamtwert daneben.** **Erst muss klar sein,
welche der beiden richtig ist.**

## Quellen

Drewnowski A. *Defining Nutrient Density: Development and Validation
of the Nutrient Rich Foods Index.* J Am Coll Nutr.
Fulgoni VL, Keast DR, Drewnowski A. *Development and Validation of
the Nutrient-Rich Foods Index.* J Nutr 2009.
