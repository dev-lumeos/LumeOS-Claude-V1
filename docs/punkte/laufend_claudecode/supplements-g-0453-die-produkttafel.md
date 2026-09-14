---
nr: G-453
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-452
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/tab-produkte.tsx
zahlen:
  gemessen: 2026-09-08
---

# G-453 — die Produkttafel

## Toms drei Punkte

Tom, 2026-09-08, nach dem Ansehen von G-452:

> 1. marken filter per eingabe oben, dass man nicht 2 meter
>    scrollen muss

> 2. das sind keine sauberen details, lass da eine
>    strukturierte detailansicht mit allen daten erstellen,
>    nicht so verstreut auf die breite und lesbar (check
>    kontraste), zb wie medical sauber strukturiert

> 3. auflistung: nach parent/child, sprich kategorie aus
>    product_contents als parent und produkte als child,
>    ebenfalls die kategorienfilters oben dran

## 1 — der Markenfilter

`[cmd]` **Heute ein Pulldown mit 62 Marken** ? **nach C-495
werden es 4.907.**

`[read]` **Ein Eingabefeld, das tippend filtert** ? **kein
Scrollen.**

`[cmd]` **`tab-foods.tsx` hat so etwas fuer 7.140
Lebensmittel** ? **sieh nach, bevor du baust.**

## 2 — die Detailansicht

`[cmd]` **Die Vorlage:
`apps/web/src/app/v2/medical/wirkstoff-tafel.tsx`** ? **Tom hat
sie als Beispiel gezeigt.**

`[read]` **Was sie richtig macht, am Bild von `Abacavir`:**

    Kopf        Name, ein Satz, ATC-Codes als Marken
    Reiter      Ueberblick | Einnahme | Sicherheit |
                Wechselwirkung | Rechtslage | ...
    Kacheln     CAS-NUMMER | ATC-CODE | WIRKMECHANISMUS
                nebeneinander, abgegrenzt
    "3 von 3 Feldern gefuellt"
    Abschnitte  WOFUER | WIE ES WIRKT | WAS ES BRINGT
    QUELLEN     unten

`[read]` **Und was die Produktansicht heute falsch macht:**

`[cmd]` **Die Tabelle zieht ueber die volle Breite** ? **`Zutat`
ganz links, `Menge` in der Mitte, `Art` und `LumeOS` ganz
rechts.**

`[read]` **Bei 22 Zeilen sind das zwei Meter Augenweg je
Zeile.**

`[cmd]` **Und die KONTRASTE:** **Tom nennt sie ausdruecklich.**

`[read]` **Im Bild sind `Art` und `LumeOS` so blass, dass sie
kaum lesbar sind** ? **miss sie, nicht schaetzen.**

### Was auf die Tafel gehoert

`[cmd]` **Am Beispiel `#Shatter SX-7 Black Onyx`, 22 Zeilen:**

    Kopf        Name, Marke, Marktstatus, Form
    Kacheln     Portion 12 g [2 scoops, 1 scoop SS]
                Packung 12.2 oz.; 346 g
                GTIN 631656708318
    Naehrwerte  Calories 20, Total Carbohydrates 3 g
    Wirkstoffe  CarnoSyn 1600 mg, Caffeine 200 mg,
                Niacin 30 mg ...
    Mischungen  Clinical Strength Performance Blend
                Extreme Neuro-Sensory Matrix
    Hilfsstoffe Maltodextrin, Citric Acid, Sucralose,
                FD&C Blue No. 1
    FIRMEN      Iovate Health Sciences U.S.A. Inc.
                19801, distributor
    HINWEIS     "Mix 2 servings (2 scoops) with 6 to 12 oz.
                 of water and consume 30 to 45 minutes
                 before your workout."

`[cmd]` **Der Einnahmehinweis steht schon da** ? **das ist
`suggested_use` aus DSLD.**

## 3 — nach Kategorie gruppiert

Tom: *,,kategorie aus `product_contents` als parent und produkte
als child"*

`[cmd]` **Die 19 Kategorien, gemessen:**

    other ingredient            980.854
    botanical                   468.405
    vitamin                     370.610
    mineral                     299.478
    non-nutrient/non-botanical  188.675
    blend                       109.861
    other                       101.869
    fat                          97.266
    sugar                        84.108
    amino acid                   69.888
    enzyme                       58.796
    bacteria                     49.926
    fatty acid                   40.425
    protein                      31.411
    fiber                        31.366
    animal part or source         9.674
    hormone                       4.281
    complex carbohydrate          3.042
    TBD                           1.047

`[read]` **Innerhalb eines Produkts gruppieren die Zutaten nach
Kategorie** ? **Naehrwerte, Wirkstoffe, Mischungen,
Hilfsstoffe.**

`[read]` **Und ein Kategorienfilter oben** ? **wer
*,,Kreatinprodukte"* sucht, filtert auf `amino acid`.**

`[cmd]` **MISS, ob der Filter auf PRODUKTE wirkt (zeige
Produkte, die diese Kategorie enthalten) oder auf ZEILEN
(zeige nur diese Zeilen im Detail)** ? **Toms Satz erlaubt
beides.**

`[read]` **Wenn unklar: frag, bevor du baust.**

## Die Mischungen bleiben

`[cmd]` **G-452 hat sie eingerueckt gebaut, ueber `blend_id` auf
die Kopfzeile** ? **das bleibt, auch wenn nach Kategorie
gruppiert wird.**

`[read]` **Eine Mischung IST eine Kategorie (`blend`) und hat
Kinder** ? **zwei Ebenen, nicht eine.**

## Abnahmebedingungen

    A1  Markenfilter per Eingabe. Foto mit Tippen.
    A2  die Tafel nach Medical-Vorbild. Foto
        vorher/nachher.
    A3  Kontraste GEMESSEN, nicht geschaetzt.
        Je Textfarbe das Verhaeltnis. WCAG AA = 4,5:1
        fuer Fliesstext.
    A4  nach Kategorie gruppiert, mit Filter. Foto.
    A5  Mischungen bleiben eingerueckt. Foto.
    A6  Einnahmehinweis und Firmen stehen. Foto.
    A7  Gegenprobe: ein Produkt ohne Kategorien,
        eines ohne Hinweis -> was steht da?
    A8  die zehn anderen Reiter unveraendert.
    A9  apps/web 1739 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**Die Reiterleiste der Medical-Tafel NICHT uebernehmen** ?
**ein Produkt hat keine Rechtslage und keine
Schwangerschaftshinweise.**

`[read]` **Das Aussehen, nicht die Gliederung.**

**Nichts in `supabase/`** ? **C-495 laeuft.**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen. NIE anfassen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

