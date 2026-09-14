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

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

