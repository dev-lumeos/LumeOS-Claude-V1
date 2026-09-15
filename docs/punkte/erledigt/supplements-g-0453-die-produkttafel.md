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
erledigt: 2026-09-08
commit: 09541b5e
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

**Claude Code, 2026-09-14.**

### Der Stand in einem Satz

`[read]` **Alle neun Abnahmebedingungen erfuellt** ? **und C-495 ist
waehrend des Auftrags eingespielt worden, was drei Sachen aus G-452
berichtigt.**

### Die Rueckfrage und ihre Antwort

**Tom, 2026-09-14:** *,,Kategorienfilter: auf PRODUKTE. Trefferliste
einschraenken, Tafel zeigt weiter ALLE Zeilen. Der Filter ist ein
Suchwerkzeug. Wer ein Produkt aufmacht, will das ganze Etikett ?
Koffein neben Kreatin, Fuellstoffe neben Wirkstoffen. Die Gruppierung
macht es lesbar, nicht das Ausblenden."*

`[read]` **So gebaut.** Der Filter oben engt die Liste ein, die Tafel
zeigt unveraendert alles.

### Toms zweite Vorgabe in derselben Antwort

*,,MISS, welche Kategorien als Filter taugen ? wenn eine Kategorie
fast alles trifft, ist sie kein Filter."*

`[cmd]` **Gemessen 2026-09-14, DISTINCT PRODUKTE gegen die 121.959
On-Market-Produkte** ? **nicht Zeilen:** ein Produkt mit vierzig
Botanicals ist EIN Treffer, und die Zeilenzahl aus dem Auftrag
(980.854) beantwortet die Filterfrage nicht.

    other ingredient            111.522   91,4 %   <- kein Filter
    botanical                    66.013   54,1 %   <- kaum einer
    mineral                      39.960   32,8 %
    vitamin                      39.523   32,4 %
    non-nutrient/non-botanical   38.887   31,9 %
    other                        33.620   27,6 %
    blend                        33.203   27,2 %
    sugar                        22.795   18,7 %
    fat                          18.954   15,5 %
    amino acid                   13.718   11,2 %
    protein                      11.813    9,7 %
    fiber                        11.445    9,4 %
    fatty acid                    6.707    5,5 %
    enzyme                        6.168    5,1 %
    bacteria                      5.794    4,8 %
    animal part or source         3.669    3,0 %
    hormone                       2.277    1,9 %
    complex carbohydrate          1.550    1,3 %
    TBD                             572    0,5 %

`[read]` **Zwei taugen nicht** ? und sie werden **angeboten UND
beschriftet**, nicht versteckt: die Pille traegt den Zusatz *,,fast
alle"* und im `title` den Satz, dass sie kaum einengt.

`[read]` **Stumm weglassen waere dieselbe Falle, nur andersherum** ?
wer nach Pflanzenstoffen sucht, soll `botanical` finden.

### C-495 ist waehrend des Auftrags eingekommen

`[cmd]` **Beim Start 0 Byte, um 15:31 Uhr eingespielt.** **Gemessen:**

    search_supplier_products('gold standart wey')     50 Treffer
    supplier_product_brands                        4.907 Zeilen

`[read]` **Damit ist A3 aus G-452 nachtraeglich erfuellt** ? die
Smartsuche findet die Fehleingabe. **Kein Codeeingriff noetig, wie im
G-452-Bericht angekuendigt.**

**Aber drei Befunde kamen mit:**

**1** ? `[cmd]` **Das Detail wurde mit dem falschen Argumentnamen
gerufen und ist NIE durchgegangen.**

    mein Aufruf   supplier_product_detail(p_id => ...)
    die Funktion  supplier_product_detail(p_product_id uuid)

`[cmd]` **Postgres meldet *,,No function matches the given name and
argument types"*, der `catch` schluckte es, und gelesen wurde immer
der Tabellenweg darunter.** `[read]` **Die Anzeige war richtig, der
Grund war falsch** ? die Art Fehler, die erst in Monaten auffaellt.

**2** ? `[cmd]` **Den Namen zu berichtigen haette zwei
Abnahmebedingungen gebrochen.** **Gemessen, was C-495 liefert:**

    contents   amount_per_serving, amount_qualifier, blend_id,
               ingredient_category, ingredient_name, reihenfolge,
               supplement_name_en, unit      -> KEIN `id`
    header     gtin, marke, market_status, name_en, packungs*,
               portions*                     -> KEIN `suggested_use`

`[cmd]` **`blend_id` zeigt auf die `id` der Kopfzeile (G-452)** ?
**C-495 liefert das `blend_id`, aber nicht die `id`, auf die es
zeigt.** **28 von 54 Zeilen bei `21cfe048` tragen einen Zeiger ohne
Ziel** ? **die Einrueckung waere nicht herstellbar (A5).** **Und
`suggested_use` fehlt, das A6 verlangt.**

`[read]` **Deshalb: Such- und Markenweg nutzen C-495, das Detail liest
die drei Tabellen.** **Das ist kein Nachbauen** ? es ist dieselbe
Leseart wie vorher, und sie bleibt, bis die Funktion `id` und
`suggested_use` mitliefert.

**3** ? `[cmd]` **PostgREST deckelte die Markenliste bei 1.000.** Der
Reiter zeigte *,,1.000 Marken"*, waehrend die Sicht 4.907 hat.
`[read]` **`.limit()` hebt die Grenze nicht auf** ? geblaettertes
Lesen mit `range` schon. **Jetzt 4.907, gemessen im Browser.**

### Die Abnahmebedingungen

    A1  erfuellt   backup/x-g453-a1-marke-tippen.png
                   backup/x-g453-a1-marke-gewaehlt.png
    A2  erfuellt   x-g453-a2-vorher.png / -nachher.png
    A3  erfuellt   0 von 11 unter der Schwelle, Tabelle unten
    A4  erfuellt   backup/x-g453-a4-kategorie.png
    A5  erfuellt   backup/x-g453-a5-mischung.png
    A6  erfuellt   backup/x-g453-a6-firmen.png
    A7  erfuellt   x-g453-a7-ohne-zeilen.png / -ohne-hinweis.png
    A8  erfuellt   elf Reiter zeichengleich
    A9  erfuellt   web 1751, coach 65

**A1** ? `[cmd]` **Das `<select>` ist raus, ein Eingabefeld filtert
tippend.** **Gemessen:**

    getippt „optimum"   6 Marken von 4.907, ohne Scrollen
                        Greenleaf Optimum Health
                        ON OPtimum Nutrition
                        ON Optimum Nutrition
                        Optimum
                        Optimum Health Nutrition
                        Optimum Nutrition
    gewaehlt            50 von 210 Treffern
    Datenbank dazu      210                   stimmt ueberein

`[cmd]` **Gefiltert wird mit `includes`, nicht `startsWith`** ?
**gemessen: `Optimum Nutrition` (49), `ON Optimum Nutrition` (210), `ON
OPtimum Nutrition` (2).** `[read]` **Mit `startsWith` faende
*,,optimum"* nur die erste, und die groesste Marke waere
unerreichbar.** **Das ist zugleich der Grund gegen `<datalist>`**, das
nur auf den Wortanfang filtert.

`[cmd]` **Eine Falle beim Messen selbst:** die erste Klickprobe traf
`ON OPtimum Nutrition` (2 Produkte) statt `ON Optimum Nutrition` (210)
? **die Zahl auf dem Schirm sah nach einem kaputten Filter aus.**
**Der Filter war richtig, der Selektor war es nicht** (`hasText` statt
`^…$`).

**A2** ? **Vorher und nachher am SELBEN Produkt gemessen**
(`#Shatter SX-7 Black Onyx Ripped Cherry`, 28 Zeilen, 1.600 px):

    Bauform                         breiteste Zeile
    G-452  Vierspaltentabelle             934 px
    G-453  Buendel                        301 px

`[read]` **Das ist die Zahl hinter Toms Satz** ? der Augenweg je Zeile
auf ein Drittel.

`[cmd]` **Uebernommen aus `medical/wirkstoff-tafel.tsx`:** Kacheln
fester Breite nebeneinander, die Bilanzzeile *,,3 von 3 Feldern
gefuellt"*, Abschnitte mit `v2-eyebrow`, Fuss mit Trennlinie.

`[cmd]` **NICHT uebernommen: die Reiterleiste** ? der Auftrag
verbietet sie, und ein Waechter prueft es (`role="tablist"` darf nicht
vorkommen).

**A3** ? **GEMESSEN, nicht geschaetzt** ? `tools/_g453-kontrast.mjs`.

`[read]` **Die Messung selbst musste erst berichtigt werden.** `[cmd]`
**Ein erster Entwurf las die Farbe mit einem `[\d.]+`-Muster** ? die
Farben stehen aber als `oklch(0.68 0.005 270)` da, und daraus wurde
`rgb(0.68, 0.005, 270)`; **der Hintergrund kam als reines Rot heraus,
sieben von sieben Proben fielen durch, und keine Zahl war echt.**

`[read]` **Jetzt rechnet der Browser um:** die Farbe wird auf ein
1x1-Canvas gemalt und als Bildpunkt ausgelesen. **Halbdurchsichtige
Hintergruende werden ueberblendet**, sonst maesse eine Pille gegen
Weiss statt gegen ihre eigene Tinte.

**VORHER ? 3 von 7 unter WCAG AA:**

    v2-eyebrow      10 px    2,88:1   Soll 4,5:1
    th              10 px    2,88:1   Soll 4,5:1
    v2-dim        10,5 px    2,88:1   Soll 4,5:1
    v2-pill-acc     10 px    4,68:1   ok
    v2-pill         10 px    9,19:1   ok
    v2-muted        12 px    9,19:1   ok
    span          12,5 px   18,11:1   ok

`[cmd]` **Alle drei sind dieselbe Farbe:** `--fg-dim` =
`oklch(0.68 0.005 270)`. **Das ist genau, was Tom gesehen hat.**

**NACHHER ? 0 von 11 unter der Schwelle:**

    v2-pill-acc                  10 px    4,94:1
    v2-supp-prod-bilanz        10,5 px    8,79:1
    v2-eyebrow                   10 px    8,79:1
    v2-muted (Saetze)          12,5 px    8,79:1
    v2-pill                      10 px    9,19:1
    v2-supp-prod-kachel-label   9,5 px    9,19:1
    v2-supp-prod-name            15 px   17,34:1
    v2-supp-prod-zutat-name      12 px   17,34:1
    v2-supp-prod-zutat-menge     12 px   17,34:1
    v2-supp-prod-firma-name    11,5 px   17,34:1
    v2-supp-prod-kachel-wert     13 px   18,11:1

`[read]` **`--fg-dim` wurde NICHT geaendert** ? der Wert steht in
`styles/themes/lume.css` und gilt fuer jedes Modul. **In der Tafel
traegt jeder Fliesstext `--fg-muted`** (9,19:1, dieselbe Rolle).

`[cmd]` **Zwei Farben kommen aus `packages/ui` und liessen sich nicht
so umgehen** ? `v2-eyebrow` (2,76:1) und `v2-pill-acc` (4,49:1, knapp
unter 4,5). **Sie sind NUR innerhalb `.v2-supp-prod-tafel`
ueberschrieben.** `[read]` **Der Geltungsbereich ist die Zusage**, und
ein Waechter prueft, dass der Vorsatz dasteht ? eine globale Regel
traefe jedes Modul.

**A4** ? `[cmd]` **In beide Richtungen gemessen:**

    ON Optimum Nutrition                50 von 210 Treffern
    + Kategorie `amino acid`            50 von  84 Treffern
    Datenbank dazu                      84            stimmt ueberein

`[cmd]` **Gefiltert wird in der DATENBANK** (`product_contents!inner`),
nicht auf der geladenen Seite. `[read]` **G-133:** clientseitig blieben
die Ausgefilterten auf Seite 2 stehen, und `gesamt` waere gelogen.

`[cmd]` **Die C-495-Suchfunktion nimmt vier Argumente** (`p_query,
p_market_status, p_marke, p_limit`) ? **eine Kategorie ist nicht
darunter.** **Also: Kategorie gewaehlt ? der Tabellenweg**, und die
Fusszeile sagt es.

**A5** ? `[cmd]` **Die Mischungen bleiben, gemessen an `21cfe048`:**

    Etikettzeilen                54
    davon eingerueckt            28      per getComputedStyle
    Mischungskoepfe               8
    Buendel                      8 + 2 + 36 + 8 = 54

`[read]` **Zwei Ebenen, nicht eine** ? **eine Mischungszutat folgt
ihrem KOPF, nicht ihrer eigenen Kategorie.** `[cmd]` **Die 28
eingerueckten Zeilen tragen Kategorien von `amino acid` bis `other
ingredient`** ? **nach Kategorie verteilt waere die Mischung
zerrissen**, und die 3000 mg haetten keine Zutaten mehr unter sich.
**Ein Waechter prueft genau das**, und die Sabotage (`massgeblich = z`)
laesst ihn fallen.

**A6** ? `[cmd]` **Am Belegprodukt `#Shatter SX-7`:**

    Einnahmehinweis   „DIRECTIONS: To assess individual tolerance…"
    Firmen            Iovate Health Sciences U.S.A. Inc.
                      · distributor · 19801

`[read]` **Der Hinweis steht als ZITAT** (Linie links, woertlich,
englisch) ? **es ist ein Etikettentext, keine Empfehlung von LumeOS**,
und **keine Uebersetzung erfunden** (C-489).

**A7** ? **Zwei Gegenproben, beide an der echten Oberflaeche:**

    ohne Etikettzeilen   Ascorbic Acid (Vitamin C) Powder
                         0 Zeilen -> „Zu diesem Produkt sind keine
                         Etikettzeilen erfasst."
                         Hinweis und Firmen stehen weiter

    ohne Hinweis         Suntheanine L-Theanine 150 mg
                         3 Zeilen, suggested_use NULL ->
                         „Das Etikett nennt keinen Einnahmehinweis."

`[read]` **Jede Tafel zeigt NUR ihren eigenen Leerfall** ? gemessen,
nicht angenommen: beim ersten steht `satzOhneHinweis: false`, beim
zweiten `satzOhneZeilen: false`. **Die Tafel faellt abschnittsweise
aus, nicht als Ganzes.**

`[cmd]` **Dazu ein dritter Leerfall, ungeplant gefunden:** die
GTIN-Kachel bei `21cfe048` traegt *,,im Etikett nicht angegeben"* mit
gestricheltem Rahmen, und die Bilanz sagt *,,2 von 3 Feldern
gefuellt"*.

`[cmd]` **Eine Falle beim Messen:** die erste Gegenprobe tippte nur
den Namen ? **und die Smartsuche lieferte ein AEHNLICHES Produkt MIT
Zeilen, das genauso hiess.** `[read]` **Die Gegenprobe haette das
Gegenteil dessen gezeigt, was sie belegen soll.** **Jetzt wird die
getroffene Zeile gegen die erwartete id geprueft.**

**A8** ? `[cmd]` **Elf Reiter, zeichengleich mit dem G-452-Stand:**
today 4.113/17, stack 1.235/2, extended 21.254/15, catalog 66.942/2,
stacks 2.500/8, intel 3.119/12, inventory 2.002/10, injection
7.433/17, compliance 1.865/6, interactions 3.720/10, cost 5.767/17.

`[read]` **Das neue CSS ist auf `.v2-supp-prod-*` begrenzt**, und die
zwei geerbten Farben auf `.v2-supp-prod-tafel`.

**A9** ? `[cmd]` **apps/web 1751 (Grundstand 1739, +12), apps/coach 65
(unveraendert), `tsc --noEmit` ohne Meldung.**

### Sabotage ? sieben Proben, und eine hat den Waechter berichtigt

    Mischung nach eigener Kategorie zerrissen      11/1  ROT
    blend landet bei den Naehrwerten               11/1  ROT
    jede Kategorie gilt als brauchbarer Filter     11/1  ROT
    Markensuche nur auf den Wortanfang             11/1  ROT
    v2-dim zurueck in die Tafel                    11/1  ROT
    Kontrastberichtigung global statt in der Tafel 11/1  ROT
    Kategorie geht nicht an die Datenbank          12/0  GRUEN  <-
    ----------------------------------------------------------
    nach dem Nachziehen, dieselbe Sabotage         11/1  ROT

`[cmd]` **Die siebte blieb gruen**, und das war ein echter blinder
Fleck: der Waechter suchte die Zeichenkette `p.set('kategorie',
kategorie)`, **und die steht in `if (false) p.set('kategorie',
kategorie)` weiterhin da.**

`[read]` **Ein Waechter, der die Zeilenform sucht, misst die
Zeilenform.** **Jetzt wird die ganze Bedingung geprueft** ?
`if (kategorie) p.set(…)` ? **plus der Abhaengigkeitsschluessel**,
gegen den die Abfrage neu laeuft.

### Ein Fehler, der die Seite umgeworfen hat

`[cmd]` **`KATEGORIEN` stand zuerst in `produkte-read.ts`, und die
Seite gab 500 zurueck:** *,,You're importing a component that needs
next/headers."*

`[read]` **`KATEGORIEN` ist ein WERT, kein Typ** ? der Reiter
importiert ihn, und ein Wert-Import zieht die ganze Datei ins
Browserbuendel, samt `createSessionClient`.

`[cmd]` **Das ist A-30, und die Warnung steht seit G-180 im Kopf von
`substanz-tafel.tsx`** ? **im eigenen Dateikopf von `produkt-etikett.ts`
stand sie sogar auch.** `[read]` **Die Zahlen liegen jetzt in der
serverfreien Datei**, wo sie ohnehin hingehoeren: sie sind Messwerte,
kein I/O.

### Was gebaut wurde

    NEU  apps/web/src/app/v2/supplements/produkt-tafel.tsx
         apps/web/src/app/v2/supplements/__tests__/
           g453-produkttafel.test.ts                    12 Proben
         tools/_g453-kontrast.mjs    A3, wiederholbar
         tools/_g453-tafel.mjs       A5/A6
         tools/_g453-a1a4.mjs        A1/A4
         tools/_g453-a7.mjs          A7
         tools/_g453-breite.mjs      A2, die 934 -> 301 px
         tools/_g453-check.mjs       Rauchprobe

    GEAENDERT
         apps/web/src/app/v2/supplements/tab-produkte.tsx
         apps/web/src/app/v2/supplements/supplements.css
         apps/web/src/lib/supplements/produkt-etikett.ts
         apps/web/src/lib/supplements/produkte-read.ts
         apps/web/src/app/api/supplements/produkte/route.ts

`[cmd]` **Nichts in `supabase/`. Nichts committet, nichts gestaged.**
`[cmd]` **Der Dev-Server wurde nicht angefasst.**

### Was offen bleibt

**1** ? `[cmd]` **C-495 liefert im Detail weder `id` noch
`suggested_use`.** `[read]` **Solange das so ist, liest das Detail die
drei Tabellen** ? die Funktion koennte es sonst in EINER Antwort.
**Ein Satz an Codex genuegt.**

**2** ? `[cmd]` **Die Kategorie kann die C-495-Suche nicht.** `[read]`
**Wer eine Kategorie waehlt UND eine Fehleingabe tippt, bekommt keine
Fehlertoleranz** ? die Fusszeile sagt es. **Ein fuenfter Parameter
`p_ingredient_category` wuerde beides zusammenbringen.**

**3** ? `[cmd]` **Die 19 Kategoriezahlen sind fest eingetragen**, mit
Stichtag. `[read]` **`count(DISTINCT product_id)` ueber 3.000.982
Zeilen kostet Sekunden**, und die Verteilung aendert sich erst mit dem
naechsten DSLD-Import ? **wer den faehrt, misst neu.**

**4** ? `[cmd]` **Zwei Konsolenmeldungen je Seitenaufruf**, beide
*,,Extra attributes from the server: data-mode"* aus `RootLayout` ?
**nicht von diesem Reiter**, sie stehen auf jeder Seite des Moduls.

---

# Nachtrag — die vier Punkte vom 2026-09-15

**Claude Code, 2026-09-15.**

### Der Stand in einem Satz

`[read]` **Drei der vier Punkte gebaut, der vierte
(Daumen) auf Toms Weisung NICHT** — er haengt an C-497.

### 1 — die Daumen: nicht gebaut, aber gemessen

**Tom, 2026-09-15 (Korrektur):** *„Das war falsch aufgeteilt. Die
Frage ist eine DATENfrage, sie liegt jetzt bei Codex als C-497. Bau
die Daumen NOCH NICHT."*

`[read]` **Nicht gebaut. Keine Attrappe, kein freigehaltener Platz**
— Tom hat ihn erlaubt, aber ein leerer Spaltenkopf ohne Funktion ist
eine Zusage, die niemand eingeloest hat. **Wenn C-497 durch ist,
kostet die Spalte fuenf Zeilen.**

`[cmd]` **Was VOR der Korrektur schon gemessen war, gehoert nach
C-497** — es beantwortet genau die Frage, die dort ansteht:

**Die nutrition-Bauform kann es NICHT tragen.** Gemessen gegen die
laufende Instanz:

    nutrition.food_preference_items
      food_id -> FOREIGN KEY nutrition.foods(id)

    INSERT ... food_id = '6ef78e94...' (ein supplier_product)
    ERROR: insert or update on table "food_preference_items"
           violates foreign key constraint
           "food_preference_items_food_id_fkey"
    DETAIL: Key (food_id)=(6ef78e94-...) is not present
            in table "foods".

`[cmd]` **Die id liegt in `supplements.supplier_products` (1 Zeile),
nicht in `nutrition.foods` (0 Zeilen).**

`[cmd]` **Und `supplements` hat keine Tabelle, die es koennte:**

    supplement_aas_ratings        supplement_id
    user_supplement_settings      supplement_id
      -> FK supplements.supplements(id), NICHT supplier_products

`[cmd]` **Fuenf Tabellen zeigen ueberhaupt auf `supplier_products`** —
`intake_logs`, `product_contents`, `product_content_candidates`,
`product_suppliers`, `supplement_field_sources`. **Keine davon traegt
eine Nutzerbewertung.**

`[read]` **Damit ist die C-497-Frage entschiedener, als sie
aussieht:** `target_type = 'supplement_product'` allein genuegt
nicht — **der `food_id`-FK zeigt auf `nutrition.foods` und muesste
mitgeaendert werden** (eigene Spalte oder gelockerter CHECK).

### 2 — die Leiste wie in foodsdb

`[cmd]` **Die Bauform ist `tab-foods.tsx:661-700`** —
`.v2-train-lib-filter` aus `packages/ui`, also geteilt und nicht
kopiert:

    [ Suche ]  [ Filter (N) ]  [ + Custom Supplement ]
    KATEGORIE  Alle · mineral 39.960 · vitamin 39.523 · …
    ┌ Filter ──────────────────────────────────────────┐
    │ MARKT              DARREICHUNGSFORM      MARKE   │
    └──────────────────────────────────────────────────┘

`[cmd]` **Gemessen: die drei Teile in Toms Reihenfolge** (Suche,
Filter, Aktion) — **ein Waechter prueft die Reihenfolge, nicht nur
das Vorhandensein**, sonst bliebe er gruen, wenn die Aktion nach vorn
rutscht.

`[read]` **`Custom Supplement` ist ein `InEntwicklungKnopf`** — der
Weg ist nicht gebaut, und ein Knopf, der nichts tut, waere schlechter
als einer, der es sagt (G-182).

`[cmd]` **Die Zahl am Filterknopf zaehlt den Standard-Markt NICHT
mit** — sonst stuende beim Oeffnen schon eine 1 da, und die Zahl
hiesse nichts.

### 2b — fuenf Kategorien raus

**Tom:** *„WEG: diese Kategorien ganz raus, sie sagen nichts aus."*

`[cmd]` **Von 19 auf 14.** `[read]` **Drei der fuenf hatte die
G-453-Messung NICHT auffaellig gefunden** — `other` (27,6 %),
`non-nutrient/non-botanical` (31,9 %), `animal part or source`
(3,0 %).

`[read]` **Der Grund ist nicht die Trennschaerfe, sondern die
Aussage.** **Eine Kategorie namens `other` beantwortet keine Frage,
auch wenn sie nur jedes vierte Produkt trifft.** `[read]`
**Trennschaerfe ist notwendig, nicht hinreichend** — das ist die
Lehre, und sie steht jetzt im Code.

`[cmd]` **Damit sind der Zusatz *„fast alle"* und die 50-%-Schwelle
gegenstandslos und entfernt** (G-163: keine Notloesung stehen
lassen). **Keine der verbliebenen 14 liegt ueber einem Drittel.**

`[cmd]` **Die fuenf bleiben in den DATEN** — ein Waechter prueft, dass
`other ingredient` weiter im Buendel *Hilfsstoffe* landet. **Kein
Filter heisst nicht kein Inhalt.**

### 3 — nicht blaetterbar

**Tom:** *„Ergebnisse NICHT blaetterbar. Miss, was stattdessen
traegt."*

`[cmd]` **In der Datenbank** (`EXPLAIN ANALYZE`, On Market nach
`name_en`):

    LIMIT 50                    17,4 ms
    LIMIT 500                   23,0 ms
    OFFSET 100.000 LIMIT 50    113,1 ms

`[cmd]` **Im Browser** (echte Zeilenform, fuenf Zellen je Zeile):

    Zeilen   DOM-Knoten   Anstrich      Hoehe
        50          302      20 ms    1.849 px
       200        1.202      27 ms    7.399 px
       500        3.002      68 ms   18.499 px
     1.000        6.002     140 ms   36.999 px
     2.000       12.002     273 ms   73.999 px

`[read]` **Zwei Befunde, die zusammen die Bauform bestimmen:**

**1** — **500 Zeilen kosten in der Datenbank kaum mehr als 50** (23
gegen 17 ms), **im Browser 3.002 Knoten** — **unter den 4.713, die
G-176 gemessen und als unauffaellig eingestuft hat.** `[read]` **Die
dort verlangte Wiederholung der Messung ist damit erbracht.**

**2** — **Teuer ist das TIEFE BLAETTERN, nicht die Menge:**
`OFFSET 100.000` kostet das Sechsfache. `[read]` **Genau der Weg
faellt weg.**

`[cmd]` **Gebaut: ein WACHSENDES Fenster, kein wanderndes.**
`.range(0, (seite+1)*SEITE-1)` statt `.range(seite*SEITE, …)`.

`[cmd]` **Gemessen, dass es anhaengt statt zu ersetzen:**

    vorher    500 Zeilen, erste „.30-06",     500 von 121.959
    Klick     „500 weitere laden"
    nachher 1.000 Zeilen, erste „.30-06",   1.000 von 121.959
    Seitenzahl im Text: keine

`[read]` **Die erste Zeile bleibt** — ein wanderndes Fenster haette
sie ersetzt, und der Nutzer haette seine Stelle verloren.

### 4 — Form- und Markenfilter

**FORM, ohne E-Codes.** `[cmd]` **Die Spalte traegt den Code IM
Text** (`Capsule [E0159]`). `[read]` **Gefiltert wird MIT Code,
angezeigt ohne** — zwei Felder, nicht eines.

`[cmd]` **Gemessen: 0 E-Codes auf dem Schirm**, weder in der
Filterleiste noch in der Trefferliste noch in der Tafel. **Drei
Stellen mussten berichtigt werden**, nicht eine — die Listenspalte und
die Tafelpille zeigten `Capsule [E0159]` weiter.

`[cmd]` **Die runde Klammer bleibt:** `Other (e.g. tea bag) [E0172]`
wird zu `Other (e.g. tea bag)`, nicht zu `Other`. **Ein
`replace(/\(.*\)/)` haette daraus `Other` gemacht** — und `Other` gab
es als Kategorie schon. **Eine Sabotageprobe bewacht genau das.**

`[cmd]` **Zwei Zahlensaetze, beide richtig:** der Auftrag nennt
`Capsule 79.822` (alle Marktstatus), **On Market sind es 43.301**.
`[read]` **Der Reiter oeffnet auf On Market** — die Facetten tragen
beide Zahlen, und die Anzeige nimmt die zum eingestellten Status.
**Dieselbe Falle wie 6.012 gegen 4.907 Marken in G-452.**

`[cmd]` **Gegengeprobt:** Softgel Capsule schraenkt **121.959 ->
9.957** ein, Datenbank sagt **9.957**.

**MARKE: Pulldown UND Eingabefeld.** `[cmd]` **Das Pulldown traegt
die 25 haeufigsten** — gemessen, dass sie **28,6 % der 121.959
On-Market-Produkte** decken. `[read]` **Alle 4.907 waeren genau das
Scrollen, gegen das Punkt 1 gebaut wurde.** **Die Zeile darunter sagt
es**, und ein Waechter prueft, dass sie es sagt.

### Die Kontraste, noch einmal gemessen

`[cmd]` **Die neue Filterleiste hatte den Fehler geerbt:**

    v2-eyebrow („Markt", „Darreichungsform", „Marke")
      2,88:1   Soll 4,5:1

`[read]` **Die Berichtigung aus G-453 galt nur fuer
`.v2-supp-prod-tafel`** — die Leiste gab es damals nicht. **Ein neuer
Baustein erbt die Berichtigung nicht; er erbt den Fehler.**

`[cmd]` **Nach der Ergaenzung:**

    Tafel            0 von 11 unter der Schwelle
    Filterleiste     0 von  6 unter der Schwelle

`[cmd]` **Beide Orte einzeln benannt, nicht global** — die Klasse
gehoert `packages/ui`.

### Sabotage — vierzehn Proben, alle rot

    Mischung nach eigener Kategorie zerrissen        ROT
    blend landet bei den Naehrwerten                 ROT
    Markensuche nur auf den Wortanfang               ROT
    v2-dim zurueck in die Tafel                      ROT
    Kategorie geht nicht an die Datenbank            ROT
    gestrichene Kategorie wieder als Filter          ROT
    E-Code bleibt in der Anzeige                     ROT
    formLabel frisst auch die runde Klammer          ROT
    Fenster auf 50 verkleinert                       ROT
    Fenster wandert statt zu wachsen                 ROT
    Pulldown fuehrt alle 4.907 Marken                ROT
    Formfilter geht nicht an die Datenbank           ROT
    Standard-Markt zaehlt als aktiver Filter         ROT
    Kontrastberichtigung deckt die Leiste nicht      ROT

### Zweimal dieselbe Falle an einem Tag

`[cmd]` **Die Seite gab zweimal 500 zurueck** — *„You're importing a
component that needs next/headers."*

    gestern   KATEGORIEN aus produkte-read importiert
    heute     SEITE      aus produkte-read importiert

`[read]` **Beide Male ein WERT-Import aus der Serverdatei** (A-30).
**Die Warnung steht seit G-180 in `substanz-tafel.tsx`, seit gestern
im Kopf von `produkt-etikett.ts` — und ich bin trotzdem
hineingelaufen.**

`[read]` **Die Zahl liegt jetzt als `FENSTER` in der serverfreien
Datei, und `produkte-read` nimmt sie von dort** (`SEITE = FENSTER`).
**Nur EIN Ort** — eine Zahl an zwei Stellen waere Drift.

`[cmd]` **Und der Waechter dazu musste nachgezogen werden:** er
suchte `export const SEITE = 500` im Quelltext und fiel, als der Wert
umzog. **Jetzt prueft er den importierten WERT** — die Zusage ist die
gemessene Groesse, nicht die Zeile, in der sie steht.

### Die Zahlen

    apps/web     1759 (Grundstand 1751, +8)
    apps/coach     65 (unveraendert)
    tsc --noEmit   ohne Meldung
    elf Reiter     zeichengleich mit dem G-452-Stand

### Was gebaut wurde

    GEAENDERT
      apps/web/src/lib/supplements/produkt-etikett.ts
        KATEGORIEN 19 -> 14, KATEGORIEN_OHNE_AUSSAGE,
        FORMEN, formLabel, MARKEN_PULLDOWN, FENSTER
      apps/web/src/lib/supplements/produkte-read.ts
        Formfilter, wachsendes Fenster, SUCH_GRENZE
      apps/web/src/app/v2/supplements/tab-produkte.tsx
        foodsdb-Leiste, Filterpanel, mehr laden
      apps/web/src/app/v2/supplements/produkt-tafel.tsx
        Form ohne E-Code
      apps/web/src/app/v2/supplements/supplements.css
        Filterpanel, Kontrast auch fuer die Leiste
      .../__tests__/g453-produkttafel.test.ts   20 Proben

    NEU  tools/_g453b-leiste.mjs    Leiste + Kontrast
         tools/_g453b-mehr.mjs      der Nachladeknopf
         tools/_g453b-last.mjs      die DOM-Last je Zeilenzahl

`[cmd]` **Nichts in `supabase/`. Nichts committet, nichts gestaged.**
`[cmd]` **Der Dev-Server wurde nicht angefasst.**

### Was offen bleibt

**1** — `[cmd]` **Die Daumen warten auf C-497.** Die Messung oben
gehoert in diesen Auftrag: **der `food_id`-FK zeigt auf
`nutrition.foods`** und muesste mitgeaendert werden.

**2** — `[cmd]` **C-495 kennt weder Kategorie noch Form.** `[read]`
**Wer einen der beiden Filter setzt UND eine Fehleingabe tippt,
bekommt keine Fehlertoleranz** — die Fusszeile sagt es. **Zwei
Parameter mehr braechten beides zusammen.**

**3** — `[cmd]` **Die Zahlen der 14 Kategorien und 10 Formen sind
fest eingetragen**, mit Stichtag. `[read]` **Wer den DSLD-Import
wiederholt, misst neu** — die Abfragen stehen in den Dateikoepfen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`x-g453b-filter-offen.png` angesehen:**

    Suchfeld | Filter | + Custom Supplement
    KATEGORIE  14 Werte, die fuenf sind weg
    MARKT      On Market 121.959 | Off 92.821 | Alle
    DARREICHUNGSFORM  ohne E-Codes:
      Capsule 43.301 | Powder 24.074 | Liquid 20.534
      Tablet or Pill 16.798 | Softgel 9.957
      Other (e.g. tea bag) 3.569 | Gummy 3.007
      Lozenge 496 | Unknown 183 | Bar 40
    MARKE      Eingabefeld + Pulldown

`[cmd]` **Die ehrliche Zeile:** *,,4.907 Marken - im Pulldown
die 25 haeufigsten, alle uebrigen ueber das Eingabefeld."*

`[cmd]` **Proben: web 1759, coach 65, elf Reiter zeichengleich,
14 Sabotagen rot.**

### Punkt 1 nicht gebaut, und der Grund gehoert zu C-497

> *,,`food_preference_items.food_id` hat einen FK auf
`nutrition.foods`, und der INSERT einer `supplier_product`-id
faellt an der Datenbank. `target_type = supplement_product`
allein genuegt also nicht ? der FK muesste mit."*

`[cmd]` **Selbst nachgemessen:**
`food_preference_items_food_id_fkey: FOREIGN KEY (food_id)
REFERENCES nutrition.foods(id)`.

`[read]` **Er hat vor meiner Korrektur gemessen und das
Ergebnis WEITERGEGEBEN, statt es wegzuwerfen.**

### Mein Grund war ein anderer als seine Messung

> *,,Drei davon hatte meine G-453-Messung fuer brauchbar
gehalten ? dein Grund war ein anderer: sie sagen nichts aus.
Trennschaerfe ist NOTWENDIG, nicht hinreichend; damit fallen
auch *fast alle* und die 50-%-Schwelle weg."*

`[read]` **Ich hatte die Kategorien nach Haeufigkeit
aussortiert, Tom nach Aussagekraft** ? **er hat den Unterschied
benannt und seine eigene Regel verworfen.**

### Nicht blaetterbar, gemessen

> *,,`OFFSET 100.000` kostet 113 ms gegen 17 ms ? teuer ist das
TIEFE BLAETTERN, nicht die Menge."*

`[cmd]` **500 Zeilen sind 3.002 DOM-Knoten, unter den 4.713 aus
G-176** ? **die dort verlangte Wiederholung ist erbracht.**

`[read]` **Ein wachsendes Fenster, 500 -> 1.000** ? **die erste
Zeile bleibt `.30-06`.**

### Und zweimal dieselbe Falle

> *,,KATEGORIEN gestern, SEITE heute ? beide Male ein
Wert-Import aus der Serverdatei, beide Male 500. Die Warnung
stand im Kopf der eigenen Datei."*

`[read]` **Er hat den Fehler zweimal gemacht und beim zweiten
Mal das Muster erkannt.**

### Die Kontraste, mit einem geerbten Fehler

`[cmd]` **Tafel 0 von 11, Filterleiste 0 von 6.**

> *,,Die neue Leiste hatte den `--fg-dim`-Fehler GEERBT, weil
meine G-453-Berichtigung nur auf die Tafel zeigte."*

`[read]` **Eine Berichtigung, die zu eng gefasst war** ? **er
hat es beim Messen gefunden.**

### Was offen bleibt

`[cmd]` **`search_supplier_products(p_query, p_market_status,
p_marke, p_limit)`** ? **keine Parameter fuer Kategorie und
Form.**

> *,,Smartsuche und diese Filter schliessen sich heute noch
aus."*

`[cmd]` **Als G-454.**

**Abgenommen, Punkt 1 wartet auf C-497.**


