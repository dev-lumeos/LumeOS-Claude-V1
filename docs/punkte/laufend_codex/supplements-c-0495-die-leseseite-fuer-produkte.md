---
nr: C-495
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-485
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
  produkte: 214780
---

# C-495 — die Leseseite fuer 214.780 Produkte

## Der Anlass

Tom, 2026-09-08, mit Tobias (IFBB-Profi):

> die supplier produkte inklusive details in supplements

`[cmd]` **C-467 hat die Tabelle gebaut, C-485 gefuellt** ?
**kein Leseweg in `apps/`.**

## Gemessen

    supplier_products   214.780
      On Market         121.959
      Off Market         92.821
    6.012 Marken
      BulkSupplements    5.595
      NOW                4.977
      Hawaii Pharm       4.726

    Indizes   marke, market_status: vorhanden
    pg_trgm, fuzzystrmatch: installiert

## Toms Vorgaben

    Marktstatus   nur "On Market" als Standard
    Marke/Firma   filterbar
    Suche         SMARTSUCHE, versteht Fehleingaben
    Sprache       name_en reicht
    Rest          Standard, optimieren spaeter

## Zu bauen

**1** ? **Eine Suchfunktion mit `pg_trgm`.**

`[read]` **`optimum nutriton gold standart` muss `Optimum
Nutrition Gold Standard Whey` finden.**

`[cmd]` **Miss, welche Schwelle (`similarity`) taugt.**

`[read]` **Marke UND Produktname durchsuchen, ein GIN-Index auf
beiden.**

`[cmd]` **MISS die Laufzeit bei 214.780 Zeilen.**

**2** ? **Eine Sicht oder Funktion, die ein Produkt
VOLLSTAENDIG liefert.**

    Kopf     marke, name_en, portionsgroesse,
             portionseinheit, packungsgroesse,
             packungseinheit, market_status, gtin
    Inhalt   product_contents mit ingredient_name,
             amount_per_serving, unit, amount_qualifier,
             ingredient_category, blend_id, reihenfolge
             plus supplements.name_en wo zugeordnet
    Firmen   product_suppliers + suppliers
             (name, land, rolle)

`[cmd]` **BELEG: `Dr. Mercola Miracle Whey`
(`7bd745e2-6822-42d5-bbd9-8e5820b7e36a`) hat 18 Zeilen,
Portion 40 g [2 scoops], Calories 160, Protein 32 g.**

`[cmd]` **Tom hat das Etikett eines Optimum Nutrition Gold
Standard gegen unsere Daten geprueft:** *,,exakt die daten auf
der verpackung, kontrolliert und bestaetigt."*

**3** ? **Eine Markenliste fuer den Filter.**

`[read]` **6.012 sind zu viele fuer ein Pulldown** ? **miss,
wie viele davon On-Market-Produkte haben.**

## Abnahmebedingungen

    A1  die Suche findet "gold standart wey" -> Gold
        Standard Whey. Drei Fehleingaben belegt.
    A2  Laufzeit bei 214.780 Zeilen. Gemessen.
    A3  ein Produkt vollstaendig, mit Dr. Mercola als
        Beleg.
    A4  Marken mit On-Market-Produkten: Zahl.
    A5  RLS und Rechte: authenticated SELECT, anon nichts.
    A6  Gegenprobe: eine Eingabe, die NICHTS finden darf.
    A7  Struktur nach migrations/, Daten in _pipeline/.
    A8  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**`apps/` nicht anfassen** ? **Claude Code baut den Reiter
(G-452).**

Nicht committen, nicht stagen, nicht pushen.

## Der Dev-Server

`[cmd]` **3200 und 3220 laufen. NICHT anfassen.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

