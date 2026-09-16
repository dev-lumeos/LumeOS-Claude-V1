---
nr: G-459
typ: feature
modul: quer
schwere: mittel
angelegt: 2026-09-08
braucht: [C-503]
kind_von: G-455
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/settings/formular.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-459 - die Allergiekachel aufraeumen

## Toms drei Punkte

Tom, 2026-09-08:

> 1. das kann eine kleinere kachel links neben erfahrungsgrad
>    sein

> 2. smartsearch mit vorschlaegen im pulldown, live bei der
>    eingabe

> 3. kann man tabellarisch schoener machen, dass die eingabe
>    schoen alles in derselben spalte erfolgt

## 1 - der Platz

`[cmd]` **`apps/web/src/app/v2/settings/formular.tsx` traegt
`experience_level`.**

`[read]` **Die Allergiekachel soll kleiner werden und LINKS
daneben.**

## 2 - die Smartsuche

`[read]` **Wartet auf C-503** ? **heute gibt es keine
Stoffliste, gegen die man suchen koennte.**

`[cmd]` **C-503 baut `public.allergens` und eine Suchfunktion
mit `pg_trgm`** ? **wie `search_supplier_products` (C-495).**

`[read]` **Du rufst sie, du baust sie nicht nach.**

`[read]` **Und der Freitext bleibt** ? **wer etwas hat, das
nicht in der Liste steht, traegt es ein, und die Oberflaeche
sagt, dass es dann NICHT gegen Produkte prueft.**

## 3 - tabellarisch

`[read]` **Alle Eingaben in derselben Spalte** ? **Stoff, Art,
Schwere untereinander ausgerichtet, nicht ueber die Breite
verteilt.**

`[cmd]` **Dieselbe Falle wie in G-453** ? **Tom hat sie dort
schon benannt:** *,,nicht so verstreut auf die breite"*.

## Abnahmebedingungen

    A1  kleinere Kachel, links neben Erfahrungsgrad.
        Foto vorher/nachher.
    A2  Smartsuche mit Vorschlaegen, live. Foto beim
        Tippen.
    A3  "laktose" schlaegt das Richtige vor. Foto.
    A4  Freitext moeglich, und die Oberflaeche sagt,
        dass er nicht prueft. Foto.
    A5  tabellarisch, eine Spalte. Foto.
    A6  Kontraste gemessen, nicht geschaetzt.
    A7  die drei bestehenden Allergien bleiben.
    A8  apps/web 1780 oder mehr.

## Berichtigt 2026-09-08 - die Vorschlaege kommen aus den Katalogen

`[read]` **Mein erster C-503 wollte eine neue Stoffliste** ?
**Tom hat widersprochen:**

> user gibt ein, ob es um nahrung/supplement/medikament geht,
> dementsprechend wissen wir, welche produktkataloge SSOT sind

`[cmd]` **Gemessen:**

    NAHRUNG     tag_definitions, 14 Tags
                contains_nuts, contains_gluten,
                contains_lactose
                7.109 von 7.140 getaggt
    SUPPLEMENT  product_contents, supplement_warnings
    MEDIKAMENT  nichts

`[read]` **Die Oberflaeche fragt ZUERST die Art, dann schlaegt
sie aus dem passenden Katalog vor.**

`[read]` **Bei `medikament` sagt sie, dass es noch keinen
Katalog gibt** ? **statt ins Leere zu suchen.**

