---
nr: C-527
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-485
entscheidung: null
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
  arten: 10
---

# C-527 - die DSLD-Quelle traegt mehr als wir lesen

## Toms Befund

Tom, 2026-09-08:

> meine exceldaten von den supplements zeigen mir eine spalte
> URL und darin den pfad zu den etiketten, welche wir in den
> details anzeigen koennten. wieso haben wir das nicht in die
> db importiert?

> merken, da hat es noch mehr, wo wir brauchen. im reiter Label
> Statements hat es weitere wertvolle informationen pro produkt

## Gemessen

### Die URL

`[cmd]` **Erste Spalte JEDER Tafel:**
`https://dsld.od.nih.gov/label/542`

`[cmd]` **`485_dsld_import.ts`: 0 Treffer auf *url*.**

`[cmd]` **`supplier_products`: keine URL-Spalte.**

`[read]` **Nie gelesen** ? **kein Fehler, eine Auslassung.**

`[read]` **Und rekonstruierbar:** `label/` **plus** `dsld_id`,
**die Spalte steht schon.**

`[cmd]` **Drei Zeilen gemessen, alle nach dem Muster** ?
**drei von 121.959 sind kein Beleg. MISS es.**

### Die Tafel "Label Statements"

`[cmd]` **Zehn Arten, gezaehlt in batch1 von 14:**

    Suggested Use                 19.635   schon drin
    Statement of Identity         19.460
    Precautions                   18.362
    Other                         18.253
    Formulation                   16.621
    Product/Version Code          15.374
    Product Specific Information  14.948
    Seals/Symbols                 12.154
    Branding Statement(s)         11.944
    Formulation re: Organic          548

## Zwei davon sind mehr als Beiwerk

**1** ? `Formulation` **traegt Allergeninformation im
Klartext:**

    "No Artificial Color or Flavor, No Preservatives,
     No Sugar, No Starch, No Milk, No Lactose, ..."

`[read]` **Das raten wir heute ueber Textaliase (C-502).**

`[cmd]` **MISS, wie oft `No Milk`, `No Lactose`, `Gluten Free`
dort stehen** ? **und ob es mit `allergen_aliases`
uebereinstimmt.**

**2** ? `Precautions` **traegt Warnungen:**

    "WARNING: If you are pregnant, nursing or taking any
     medications, consult your doctor..."

`[read]` **Medikamentenwechselwirkungen** ? **ein Feld, das
LumeOS sonst nicht hat.**

`[cmd]` **`supplement_interactions` existiert** ? **miss, was
drinsteht.**

## Und die anderen Tafeln

`[cmd]` **`Company Information`: Company Name, Address, City,
State, ZIP, Country, Manufacturer, Distributor, Packager,
Reseller.**

`[read]` **MISS, ob davon etwas fehlt** ? **`marke` steht
schon, der Hersteller vielleicht nicht.**

## Was zu messen ist, VOR dem Bauen

    A  haelt das URL-Muster? Stichprobe ueber alle
       14 Dateien.
    B  je Art: wie viele Produkte, und was steht drin?
       Zehn Beispiele je Art.
    C  Formulation gegen allergen_aliases: stimmt es
       ueberein, widerspricht es?
    D  Precautions: laesst sich daraus etwas
       Auswertbares gewinnen, oder ist es Fliesstext?
    E  Company Information: was fehlt in der Datenbank?

`[read]` **MESSEN und EMPFEHLEN** ? **welche Felder importiert
werden, ist Toms Entscheidung.**

## Abnahmebedingungen

    A1  haelt das URL-Muster? Zahl.
    A2  je Art: Produktzahl und zehn Beispiele.
    A3  Formulation gegen allergen_aliases. Gemessen.
    A4  Precautions: auswertbar oder Fliesstext?
    A5  Company Information: was fehlt?
    A6  eine Empfehlung: welche Felder zuerst?
    A7  KEINE Umsetzung.
