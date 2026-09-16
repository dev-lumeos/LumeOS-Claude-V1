---
nr: C-507
typ: entscheidung
modul: nutrition
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  tabellen: [nutrition.foods]
zahlen:
  gemessen: 2026-09-08
  varianten: 31
---

# C-507 - die Suchtiefe nach Erfahrungsgrad

## Die Idee

Tom, 2026-09-08, nach einem Gespraech mit Tobias (IFBB-Profi):

> die problematik liegt in der TIEFE der produkte, sprich
> haehnchenbrust in 30 varianten

> das macht sinn fuer pro und hoeher, da kommt es auf plus
> minus 5% an

> aber zb fuer einen anfaenger ist das absolut irrelevant und
> der ist auch ueberfordert damit. also wieso definieren wir
> nicht anhand erfahrungsgrad, was der user fuer auswahlen
> kriegt? zb beginner kriegt EINE haehnchenbrust (mittelwert
> aus allen resultaten) praesentiert und advanced vielleicht
> oben drauf die zubereitung und/oder mit oder ohne haut usw

## Die Zahl stimmt

`[cmd]` **31 Varianten mit *Haehnchen* und *Brust*.**

`[cmd]` **Die ersten vierzehn:**

    Huehnchen Brust, ohne Haut, roh
    Huehnchen Brust, ohne Haut, gegrillt
    Huehnchen Brust, ohne Haut, gebraten ohne Fett (Ofen)
    Huehnchen Brust, ohne Haut, gebraten ohne Fett (Pfanne)
    Huehnchen Brust, ohne Haut, geschmort ohne Fett
    Huehnchen Brustfilet, gekocht
    Huehnchen Brustfilet, gegrillt
    Huehnchen Brustfilet, mariniert, gegrillt
    ... plus Fertiggerichte (Clubsandwich, chinesische Suppe)

`[read]` **DREI Achsen:**

    Zubereitung   roh | gegrillt | gebraten (Ofen) |
                  gebraten (Pfanne) | geschmort | gekocht
    Haut          mit | ohne
    Zuschnitt     Brust | Brustfilet

## Was dafuer schon da ist

`[cmd]` **`public.profiles.experience_level`, CHECK mit VIER
Stufen:**

    beginner | advanced | pro | elite

`[cmd]` **Heute: 2 Nutzer auf `pro`, 5 ohne Angabe.**

`[cmd]` **Und `nutrition.foods.processing_level`, acht
Werte:**

    raw                  3.247
    cooked               2.346
    ultra_processed        927
    minimally_processed    258
    canned                 185
    dried                   77
    fermented               63
    smoked                  37

`[read]` **Die Zubereitungsachse steht schon** ? **als Spalte,
nicht nur im Namen.**

## Was zu klaeren ist

### 1 - woher kommt die Gruppe?

`[read]` **Damit *,,eine Haehnchenbrust"* gezeigt werden kann,
muss klar sein, welche 31 zusammengehoeren.**

    a  aus dem Namen     "Huehnchen Brust*"
       -> brechen bei "Clubsandwich mit Huehnchenbrustfilet"
    b  aus category_id   miss, wie fein sie ist
    c  eine neue Spalte  grundlebensmittel_id

`[cmd]` **`foods` hat `category_id` und `is_prepared_dish`** ?
**MISS, ob sie die Fertiggerichte schon trennen.**

### 2 - was ist "der Mittelwert"?

`[read]` **Tobias sagt *,,mittelwert aus allen resultaten"*** ?
**aber roh und gegrillt unterscheiden sich stark: beim Braten
verliert Fleisch Wasser, die Naehrwerte je 100 g steigen.**

`[read]` **Ein Mittelwert ueber roh UND gegart ist eine Zahl,
die kein Lebensmittel hat.**

    a  Mittelwert ueber alle
       -> einfach, aber physikalisch falsch
    b  die haeufigste Zubereitung als Vorgabe
       -> "gegrillt", weil das die meisten essen
    c  roh als Vorgabe
       -> die BLS-Grundform, und der Nutzer waehlt
          die Zubereitung dazu

`[read]` **MESSEN, wie weit die 31 auseinanderliegen** ? **wenn
es 5 % sind, ist der Mittelwert vertretbar; bei 40 % nicht.**

### 3 - was heisst "advanced kriegt mehr"?

    beginner   eine Zeile, die haeufigste Form
    advanced   plus Zubereitung
    pro        plus Haut, Zuschnitt, Fertiggerichte
    elite      alles, wie heute

`[read]` **Oder: alle sehen dasselbe, aber beginner sieht die
Varianten EINGEKLAPPT.**

`[read]` **Der Unterschied ist wichtig** ? **Wegnehmen ist
etwas anderes als Zusammenfassen.**

### 4 - und wenn der Grad fehlt?

`[cmd]` **5 von 7 Nutzern haben keinen.**

`[read]` **Vorgabe? Oder beim ersten Suchen fragen?**

## Was das sonst noch beruehrt

`[cmd]` **Dieselbe Frage stellt sich bei den 214.780
Supplementprodukten** ? **ein Anfaenger braucht nicht 4.907
Marken.**

`[read]` **Und bei den 1.416 Uebungen.**

`[read]` **Wenn der Erfahrungsgrad die Suchtiefe steuert, gilt
das modulweit** ? **das ist eine Entscheidung, kein
Nutrition-Feature.**

## Was zu messen ist, bevor entschieden wird

    A  wie weit liegen die 31 auseinander? Je
       Naehrwert die Spanne.
    B  trennt is_prepared_dish die Fertiggerichte?
    C  wie fein ist category_id?
    D  wie viele Suchbegriffe haben ueberhaupt so
       viele Varianten? Die zehn groessten Gruppen.

