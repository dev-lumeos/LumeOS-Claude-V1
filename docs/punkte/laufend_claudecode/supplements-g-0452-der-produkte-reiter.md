---
nr: G-452
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: [C-495]
kind_von: C-485
entscheidung: null
agent: claudecode
beauftragt: 2026-09-08
beruehrt:
  dateien:
    - apps/web/src/app/v2/supplements/ansicht.tsx
zahlen:
  gemessen: 2026-09-08
  produkte: 214780
---

# G-452 — der Produkte-Reiter

## Toms Vorgabe

Tom, 2026-09-08, mit Tobias (IFBB-Profi):

> die supplier produkte inklusive details in supplements links
> neben katalog, einen neuen navigationspunkt namens
> supplements, und soll aussehen wie die mockupvorlage von
> katalog inkl aller details als pulldown

## Was dasteht

`[cmd]` **`supplements.supplier_products`: 214.780 Zeilen.**

    On Market    121.959
    Off Market    92.821
    6.012 Marken

`[cmd]` **KEIN Leseweg in `apps/`** ? **C-467 hat die Tabelle
gebaut, C-485 gefuellt, niemand zeigt sie.**

`[cmd]` **Die Reiter heute, in `ansicht.tsx`:**

    today, stack, extended, catalog, stacks, intel,
    inventory, injection, compliance, interactions

`[read]` **Der neue steht LINKS NEBEN `catalog`.**

## Toms Antworten auf meine Fragen

    Marktstatus   nur "On Market" als Standard
    Marke/Firma   filterbar
    Suche         SMARTSUCHE, versteht Fehleingaben
    Sprache       name_en reicht, Uebersetzungen spaeter
    Rest          Standard, optimieren spaeter

## Was C-495 liefert

`[read]` **Codex baut die Datenseite** ? **warte auf seinen
Bericht.**

    eine Suchfunktion mit pg_trgm
    eine Sicht/Funktion, die ein Produkt vollstaendig liefert
    eine Markenliste fuer den Filter

`[read]` **Du rufst sie, du baust sie nicht nach.**

## Was ein Produkt traegt

`[cmd]` **Beleg: `Dr. Mercola Miracle Whey`
(`7bd745e2-6822-42d5-bbd9-8e5820b7e36a`), 18 Zeilen:**

    Kopf     marke, name_en
             Portion 40 g [2 scoops]
             Packung 1 lb; 454 g
             market_status, gtin

    Inhalt   Calories 160 | Protein 32 g
             Total Fat 2 g | Total Carbohydrates 2 g
             Sugar 2 g | Sodium 80 mg
             Potassium 130 mg | Cholesterol 90 mg
             Saturated Fat 2 g
             ... plus Zeilen ohne Menge
               (amount_qualifier = not_stated)

    Firmen   product_suppliers -> suppliers
             name, land, rolle

`[cmd]` **Tom hat das Etikett eines Optimum Nutrition Gold
Standard gegen unsere Daten geprueft:** *,,exakt die daten auf
der verpackung, kontrolliert und bestaetigt."*

## Drei Sachen, die die Anzeige tragen muss

**1** ? **Zeilen OHNE Menge.**

`[cmd]` **`amount_qualifier = not_stated`** ? `Vitamin A`,
`Iron`, `Whey Protein concentrate` **stehen auf dem Etikett,
ohne Zahl.**

`[read]` **Sie gehoeren gezeigt** ? **der Hersteller nennt sie,
also sind sie drin.**

**2** ? **Mischungen.**

`[cmd]` **`blend_id` und `reihenfolge`** ? **eine Mischung
traegt die Gesamtmenge, die Zutaten folgen OHNE Menge, in
Etikettreihenfolge (C-485).**

`[read]` **Eingerueckt unter der Mischung, wie auf der
Packung.**

**3** ? **Was LumeOS NICHT kennt.**

`[cmd]` **`supplement_id` ist null bei 1,7 Mio Zeilen
(C-485)** ? **die Zutat ist ein Kandidat, keine bekannte
Substanz.**

`[read]` **Das gehoert sichtbar** ? **wer ein Produkt ansieht,
soll wissen, welche Zutaten LumeOS auswerten kann.**

## Die Bauform

`[cmd]` **`tab-foods.tsx` hat die Filterleiste fuer 7.140
Lebensmittel** ? **miss, ob sie fuer 214.780 taugt.**

`[cmd]` **Und der Katalog-Reiter zeigt 412 Substanzen** ?
**Toms Vorgabe:** *,,soll aussehen wie die mockupvorlage von
katalog"*.

`[read]` **Sieh dir beide an, bevor du baust.**

## Abnahmebedingungen

    A1  der Reiter steht links neben "catalog". Foto.
    A2  Standard: nur On Market. Zahl in der Kachel.
    A3  Suche findet "gold standart wey". Foto.
    A4  Markenfilter. Foto.
    A5  ein Produkt aufgeklappt, mit allen Zeilen:
        Makros, Mikros, Zeilen ohne Menge, Mischungen
        eingerueckt. Foto von Dr. Mercola Miracle Whey.
    A6  was LumeOS nicht kennt, ist erkennbar.
    A7  Gegenprobe: eine Suche ohne Treffer -> was
        steht da?
    A8  die zehn anderen Reiter unveraendert. Foto.
    A9  vier Module unveraendert.
    A10 apps/web 1728 oder mehr, apps/coach 65.

## Was nicht zu tun ist

**KEINE Suchfunktion nachbauen** ? **C-495 liefert sie.**

**Nichts in `supabase/`.**

**Keine Uebersetzung erfinden** ? `name_de` **und** `name_th`
**sind leer, und das ist so gewollt (C-489).**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen.**
`[cmd]` **NIE `start`, `neustart`, `aufraeumen`.**

## Bericht

**Claude Code, 2026-09-14.**

### Der Stand in einem Satz

`[read]` **Der Reiter steht, liest die 214.780 echt und zeigt ein
Produkt vollstaendig** ? **A3 ist NICHT erfuellt, und das liegt nicht
an der Oberflaeche.**

### Das Wichtigste zuerst: C-495 liegt nicht vor

`[cmd]` **Gemessen 2026-09-14, 15:20 Uhr:**

    supabase/migrations/20260914080541_c495_...read.sql    0 Byte
    supplements.search_supplier_products                   fehlt
    supplements.supplier_product_detail                    fehlt
    supplements.supplier_product_brands                    fehlt

`[cmd]` **`pg_proc` kennt in `supplements` genau eine Funktion mit
`supplier` im Namen:** `create_supplier_product` **aus C-467** ? den
Schreibweg.

`[cmd]` **Die Testdatei ist da** (`supplements-c495-supplier-product-
catalog.test.ts`, 5.051 Byte) ? **die Migration ist leer.** Codex
schreibt noch.

`[read]` **Aus der Testdatei steht die Schnittstelle fest**, und genau
gegen sie ist gebaut:

    search_supplier_products(p_query, p_marke, p_market_status, p_limit)
    supplier_product_detail(p_id uuid) -> {header, contents, suppliers}
    supplier_product_brands                          (Sicht/Tabelle)

`[read]` **Die drei werden GERUFEN. Nachgebaut ist nichts.** Fehlt die
Funktion, laeuft ein `ILIKE`-Rueckfall ueber die Tabelle ? **er kann
genauen Text, keine Fehlertoleranz**, und er verschwindet ohne
Codeaenderung in dem Moment, in dem C-495 eingespielt wird.

`[cmd]` **Der Unterschied steht in der Fusszeile der Oberflaeche:**
*,,Textsuche ? Smartsuche noch nicht eingespielt (C-495)"* gegen
*,,Smartsuche (pg_trgm, C-495)"*.

`[read]` **Das ist Absicht.** **Ohne diesen Satz haelt der naechste
Leser eine fehlende Funktion fuer ein fehlendes Produkt** ? und genau
diese Verwechslung macht A7 sonst unlesbar.

### Was gemessen wurde, bevor gebaut wurde

`[cmd]` **Alle Auftragszahlen selbst nachgezaehlt, 2026-09-14,
gegen die laufende Instanz ? alle bestaetigt:**

    supplier_products            214.780
      On Market                  121.959
      Off Market                  92.821
      Marken (alle)                6.012
      Marken (On Market)           4.907   NEU GEMESSEN

    product_contents           3.000.982
      not_stated               1.591.063   53,0 %
      exact                    1.394.584
      less_than                   14.598
      greater_than                   737
      supplement_id IS NULL    2.698.689   89,9 %

`[read]` **Die 4.907 sind neu und tragen eine Aussage:** die
Markenliste des Rueckfalls liest On-Market-Zeilen. **Sie gegen 6.012
zu stellen behauptete eine Fehlmenge, die es so nicht gibt** ? zwei
Zahlen aus verschiedenen Grundgesamtheiten.

### Drei Befunde, die der Auftrag nicht kennen konnte

**1** ? `[cmd]` **Dr. Mercola Miracle Whey ist `Off Market`.**

    7bd745e2-6822-42d5-bbd9-8e5820b7e36a
      marke          Dr. Mercola
      name_en        Miracle Whey Protein Powder Original
      market_status  Off Market

`[read]` **A2 und A5 stehen damit in Spannung:** der Reiter oeffnet
auf *,,nur On Market"*, und unter diesem Standard ist das Belegprodukt
**nicht zu finden**. **Beides ist erfuellbar, aber nicht in EINEM
Foto** ? das A5-Foto zeigt den Reiter mit umgestelltem Marktfilter.

**2** ? `[cmd]` **`blend_id` zeigt auf die `id` der KOPFZEILE**, nicht
auf eine eigene Mischungstabelle.

    Gemessen an 21cfe048 (MRI N.O. Black Powder), 54 Zeilen:
      13  Proprietary Blend for Size & Recovery   3000 mg   blend_id NULL
      14  L-Arginine Alpha-Ketoglutarate          ohne      blend_id = id(13)
      15  L-Arginine Hydrochloride                ohne      blend_id = id(13)

`[read]` **Damit braucht die Einrueckung keine Heuristik** ? sie steht
in den Daten: **ein Kopf ist, worauf gezeigt wird.** Und weil C-485 in
Etikettreihenfolge geschrieben hat, **stellt die Sortierung nach
`reihenfolge` allein die Packung her** ? kein Baum noetig.

**3** ? `[cmd]` **`Calories` traegt die Einheit `{Calories}`**, mit
geschweiften Klammern, so wie DSLD sie liefert. **Sie werden entfernt**
? sonst stuende `160 {Calories}` auf dem Schirm.

### Die Bauform ? was uebernommen wurde und was nicht

`[read]` **Toms Vorgabe:** *,,soll aussehen wie die mockupvorlage von
katalog"*. **Uebernommen aus `substanz-detail.tsx`:** Pillenreihe,
EINE Suche mit dem X darin, `v2-tbl` im `v2-supp-tbl-wrap`, Klick
klappt eine zweite `<tr>` auf, Fusszeile *,,N von M"*, benannter Grund
bei null Treffern. **Kein Modal** (G-180).

`[cmd]` **NICHT uebernommen: die Datenbeschaffung.** Der Katalog haelt
566 Zeilen im Browser und filtert dort. **G-176 hat das gemessen
(4.713 DOM-Knoten, 3.270?3.494 ms) und ausdruecklich dazugeschrieben:**
*,,Wenn der Katalog einmal Tausende traegt, ist die Messung zu
wiederholen."*

`[cmd]` **214.780 ist das 380-fache.** `[read]` **Also: Aussehen ja,
Mechanik nein.** Gesucht, gefiltert und geblaettert wird in der
Datenbank.

`[cmd]` **`tab-foods.tsx` gemessen, wie verlangt** ? **taugt hier nur
halb.** Seine Filterleiste bietet Facetten mit Zaehlern je Kategorie;
**bei 6.012 Marken waeren das 6.012 Pillen.** **Deshalb steht die
Marke als Auswahlliste**, nicht als Pillenreihe. **Was uebernommen
wurde, ist seine Sucharchitektur** (`food-suche-hook.ts`, G-320):
Entprellen 180 ms und `AbortController` ? `[cmd]` **ohne Abbruch
ueberholt eine langsame aeltere Antwort die neuere.**

### Die Abnahmebedingungen

    A1   erfuellt    Foto backup/x-g452-a1-reiter.png
    A2   erfuellt    Foto ebenda
    A3   NICHT       fehlt C-495 -- siehe unten
    A4   erfuellt    Foto backup/x-g452-a4-markenfilter.png
    A5   erfuellt    zwei Fotos, siehe unten
    A6   erfuellt    Foto backup/x-g452-a5-mercola.png
    A7   erfuellt    Foto backup/x-g452-a3-suche.png
    A8   erfuellt    vorher/nachher gemessen, Zahlen unten
    A9   erfuellt    fuenf Module, alle 200
    A10  erfuellt    web 1739, coach 65

**A1** ? `[cmd]` **Die Leiste, aus `ansicht.tsx` gelesen:**

    today stack extended PRODUKTE catalog stacks intel
    inventory injection compliance interactions cost

`[read]` **Der Waechter prueft `p === c - 1`, nicht `p < c`** ?
*,,links neben"* ist eine Nachbarschaft, keine Rangfolge. `[cmd]`
**Gegengeprobt: mit `<` bliebe er gruen, wenn jemand den Reiter an den
Anfang schoebe.**

**A2** ? `[cmd]` **Die Kachel traegt `On Market ? 121.959`**, und sie
ist beim Oeffnen ausgewaehlt. Daneben `Off Market ? 92.821` und
`Alle ? 214.780`.

`[cmd]` **Die Zahl steht NICHT an der Reiterleiste**, und das ist eine
Berichtigung: ein erster Versuch trug `count: 121959` und stand als
**`121959`** im Foto ? ohne Tausenderpunkte. **`Tabs` rendert `count`
roh** (`packages/ui/src/primitives.tsx:701`). `[read]` **Das Paket
gehoert allen Apps, und eine sechsstellige Zahl ist ein Problem dieses
einen Reiters** ? alle uebrigen Zaehler liegen unter 566. **Also keine
Zahl an der Leiste statt einer unlesbaren;** formatiert steht sie
dreimal im Reiter selbst.

**A3** ? **NICHT ERFUELLT.** `[cmd]` **`gold standart wey` gibt 0
Treffer**, und die Seite sagt warum:

> *,,Kein Produktname enthaelt ,gold standart wey'. Die Smartsuche, die
> Fehleingaben versteht, ist noch nicht eingespielt (C-495) ? bis dahin
> wird auf genauen Text gesucht."*

`[read]` **Der Leseweg selbst ist belegt**, nur die Fehlertoleranz
fehlt: `[cmd]` **`Gold Standard 100% Whey` findet die Produkte**, die
Tom gegen das Etikett geprueft hat ? **Foto
`backup/x-g452-a3b-suche-korrekt.png`**, elf ON-Optimum-Nutrition-
Zeilen.

`[read]` **Zu beheben ist hier nichts** ? sobald C-495 eingespielt
ist, greift der erste Zweig ohne Codeaenderung. **Der Nachweis ist
dann in einer Minute nachzuholen.**

**A4** ? `[cmd]` **In beide Richtungen gemessen, nicht nur betrachtet:**

    ohne Filter        50 von 121.959 Treffern
    'Merica Labz       50 von 60 Treffern
    Datenbank dazu     60                        stimmt ueberein
    Marken der Zeilen  ['Merica Labz']           genau eine

**A5** ? **Zwei Fotos, weil ein Produkt nicht beides zeigt.**

`[cmd]` **`backup/x-g452-a5-mercola.png`** ? Dr. Mercola, Marktfilter
auf `Off Market`. **Im DOM gezaehlt:**

    Etikettzeilen                18
    davon ohne Menge              8
    "1 von 18 Zutaten kennt LumeOS"

`[read]` **Das deckt sich Zeile fuer Zeile mit dem Auftrag:** Calories
160, Protein 32 g, Total Fat 2 g, Total Carbohydrates 2 g, Sugar 2 g,
Sodium 80 mg, Potassium 130 mg, Cholesterol 90 mg, Saturated Fat 2 g
? **und Trans Fat, Dietary Fiber, Vitamin A, Vitamin C, Calcium, Iron,
Whey Protein concentrate, Sunflower Lecithin ohne Menge.**

`[cmd]` **`backup/x-g452-a5-mischung-eingerueckt.png`** ? MRI N.O.
Black Powder, weil **Dr. Mercola keine Mischung hat** (gemessen: 0
Zeilen mit `blend_id`). **Im DOM gezaehlt:**

    Etikettzeilen                54
    davon eingerueckt            28      per getComputedStyle
    "5 von 54 Zutaten kennt LumeOS"

`[read]` **Gemessen wurde die WIRKUNG, nicht der Klassenname** ?
`parseFloat(getComputedStyle(td).paddingLeft) > 20`. **Ein Waechter,
der nach `paddingLeft` im Quelltext sucht, bliebe gruen, wenn eine
Regel daneben ihn ueberschriebe.**

**A6** ? `[read]` **Markiert wird das BEKANNTE, nicht das Unbekannte.**
`[cmd]` **Bei 89,9 % ohne `supplement_id` waere eine Marke auf neun von
zehn Zeilen kein Hinweis mehr, sondern Rauschen.** Im Foto: `Vitamin A`
traegt **auswertbar**, die uebrigen siebzehn `nicht im Katalog`, und
oben steht *,,1 von 18 Zutaten kennt LumeOS"*.

`[read]` **Zwei Zahlen, keine Quote** ? *,,6 %"* sagt nicht, ob von
achtzehn oder von achtzehnhundert die Rede ist.

**A7** ? `[cmd]` **Eine Suche ohne Treffer zeigt einen benannten
Grund und einen Knopf zurueck** (Foto `x-g452-a3-suche.png`),
**nicht eine leere Flaeche.** `[read]` Der Grund wird in der
Reihenfolge geprueft, in der ein Filter greift: Fehler ? Suchbegriff
mit Rueckfallhinweis ? Suchbegriff ? Marke.

**A8** ? `[cmd]` **VORHER und NACHHER gemessen**, nicht nur nachher:
`git checkout HEAD -- ansicht.tsx`, elf Reiter aufgerufen, Zeichen und
Kacheln im `.v2-tabinhalt` gezaehlt, dann zurueckgespielt.

    Reiter        Zeichen   Kacheln   (vorher == nachher)
    today            4.113        17
    stack            1.235         2
    extended        21.254        15
    catalog         66.942         2
    stacks           2.500         8
    intel            3.119        12
    inventory        2.002        10
    injection        7.433        17
    compliance       1.865         6
    interactions     3.720        10
    cost             5.767        17

`[read]` **Zeichengleich in allen elf.** `[cmd]` **`git stash` wurde
NICHT benutzt** ? `git checkout HEAD -- <pfad>` auf die eine Datei,
mit Kopie davor.

**A9** ? `[cmd]` **Fuenf Module, alle `200`:** nutrition 194.952
Zeichen / 20 Kacheln, training 104.993 / 11, medical 509.701 / 11,
goals 49.769 / 18, recovery 109.358 / 17.

**A10** ? `[cmd]` **apps/web 1739 (Grundstand 1728, +11), apps/coach
65 (unveraendert), `tsc --noEmit` ohne Meldung.**

### Ein fremder Waechter musste nachgezogen werden

`[cmd]` **`deutsch-und-scroll.test.ts` fiel:** *,,Erwartet elf
uebersetzte Tab-Beschriftungen, gefunden 12."*

`[read]` **Die Zusage der Probe ist ,,JEDER Reiter uebersetzt", nicht
,,es gibt elf"** ? und die Beschriftung des neuen Reiters kommt
ordentlich aus `messages/`. **Eine feste Zahl altert nur nach oben:
sie wird bei jedem neuen Reiter rot, und wer sie nachzieht, prueft
nichts, er passt an.**

`[cmd]` **Gezaehlt wird jetzt gegen die Reiter statt gegen eine Elf:**
`treffer.length === reiter.length`, plus die Untergrenze `>= 11`.

`[cmd]` **Eine gelockerte Zusicherung braucht einen Beleg ? hier ist
er:** ein `label: 'Produkte'` statt `t('tabProdukte')` laesst die Probe
fallen (12 `id:` gegen 11 `t(`). **Gegengeprobt 2026-09-14: 11 pass /
1 fail, danach wieder 12 / 0.**

### Sabotage ? was die neuen Waechter wirklich messen

`[read]` **Jede der drei Auftragssachen hat eine Probe, und jede wurde
absichtlich gebrochen:**

    Einrueckung verdreht (=== statt !==)        10 pass  1 fail
    Zeilen ohne Menge herausgefiltert            8 pass  3 fail
    Reiter an den Anfang geschoben              10 pass  1 fail
    wiederhergestellt                           11 pass  0 fail

`[read]` **Der dritte Fall ist der, der die Probe geformt hat:** mit
`p < c` waere er gruen geblieben.

### Was gebaut wurde

    NEU  apps/web/src/lib/supplements/produkte-read.ts
         apps/web/src/lib/supplements/produkt-etikett.ts   serverfrei
         apps/web/src/app/v2/supplements/tab-produkte.tsx
         apps/web/src/app/api/supplements/produkte/route.ts
         apps/web/src/app/api/supplements/produkt/route.ts
         apps/web/src/app/api/supplements/marken/route.ts
         apps/web/src/app/v2/supplements/__tests__/
           g452-produkte-reiter.test.ts                    11 Proben
         tools/_g452-detail.mjs                            Foto-Helfer

    GEAENDERT
         apps/web/src/app/v2/supplements/ansicht.tsx       Reiter + Weiche
         apps/web/messages/{de,en}.json                    je 1 Zeile
         .../__tests__/deutsch-und-scroll.test.ts          Zaehlwaechter

`[read]` **`produkt-etikett.ts` ist bewusst serverfrei** (A-30) ?
`produkte-read.ts` zieht `next/headers` und liesse sich in einem Test
nicht laden. **Die tragende Rechnung steht deshalb getrennt und ist
ohne Datenbank pruefbar.**

`[cmd]` **Nichts in `supabase/`. Nichts committet, nichts gestaged.**
`[cmd]` **Keine Uebersetzung erfunden** ? gelesen wird `name_en`
(C-489). `[cmd]` **Der Dev-Server wurde nicht angefasst.**

### Zwei Helfer liegen in `tools/`

`[cmd]` **`tools/_g452-detail.mjs`** ? **`schuss.mjs` klickt ZUERST
und tippt DANN** (Zeile 197); **fuer A5 ist die Reihenfolge
umgekehrt.** Ein Klick vor dem Tippen traefe die erste Zeile einer
ungefilterten Liste, also irgendein Produkt.

`[cmd]` **`tools/_g452-a8.mjs` und `_g452-a9.mjs`** ? die Messungen zu
A8 und A9, wiederholbar. `[read]` **Tom entscheidet, ob sie bleiben**
? in `tools/` loescht der Agent nichts.

### Was offen bleibt

**1** ? `[cmd]` **A3 wartet auf C-495.** Danach: Reiter oeffnen, `gold
standart wey` tippen, Foto. **Kein Codeeingriff noetig** ? nur die
Fusszeile muss dann *,,Smartsuche (pg_trgm, C-495)"* sagen.

**2** ? `[cmd]` **Die Markenliste zeigt heute 62 von 4.907.** `[read]`
**PostgREST kann kein `DISTINCT`**, und 214.780 Zeilen zu holen, um
Marken zu falten, waere ein Missbrauch der Leitung. **Die Oberflaeche
benennt den Ausschnitt.** Mit `supplier_product_brands` ist er
vollstaendig.

**3** ? `[read]` **Das Blaettern ist `OFFSET`-basiert.** `[cmd]` **Je
Seite kostet es voll** ? bei 50 je Seite bis rund Seite 100 tragbar,
danach nicht. **Kein Befund, solange niemand so weit blaettert**; die
Zahl steht hier, damit sie vergleichbar ist, wenn es jemand tut.

**4** ? `[cmd]` **Zwei Konsolenmeldungen je Seitenaufruf**, beide
*,,Extra attributes from the server: data-mode"* aus `RootLayout`.
`[read]` **Nicht von diesem Reiter** ? sie stehen auf jeder Seite des
Moduls, auch im Vorher-Stand.

## Abnahme

_(vom Orchestrator)_

