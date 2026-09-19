---
nr: C-523
typ: befund
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-522
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [public.allergen_aliases]
zahlen:
  gemessen: 2026-09-08
---

# C-523 - welche Aliase fehlen noch?

## Der Anlass

`[cmd]` **Tom hat *,,brot"* in die Allergieeingabe getippt und
nichts bekommen (C-522):**

    "gluten"      -> contains_gluten, 622 Treffer
    "brot"        -> 0
    "weizen"      -> 0
    "glutenfrei"  -> 0

Tom, 2026-09-08:

> mach fuer codex einen messauftrag, welche aliasse sonst noch
> fehlen

## Der Bestand, gemessen

    nutrition.food_aliases           32.845  zu 7.140 Foods
    supplements.supplement_aliases    2.868  zu   617
    supplements.substance_aliases     1.541
    medical.biomarker_aliases           292
    nutrition.nutrient_aliases           98  zu   138
    nutrition.nutrient_search_aliases    50
    public.allergen_aliases              29  zu     6 Tags

    medical.medication_active_substances 498
      -- KEINE Aliastabelle

`[read]` **Lebensmittel: 4,6 Aliase je Eintrag. Naehrstoffe:
0,7. Medikamente: keine.**

## Zu messen

    A  welche Suchfunktion nutzt welche Aliastabelle?
       Am FUNKTIONSRUMPF messen, nicht am Namen.
    B  wie viele Ziele haben KEINEN Alias?
       Je Tabelle eine Zahl.
    C  welche Suchwege haben GAR KEINE Aliastabelle?
       Kandidat: allergy_catalog_suggestions mit
       art=medikament -- 498 Wirkstoffe, kein Alias.
    D  eine Stichprobe je Suchweg: fuenf Woerter, die
       ein Mensch tippen wuerde, und was sie treffen.
       "brot", "milch", "kopfschmerztablette",
       "eisen", "blutzucker".
    E  wo Aliase existieren: decken sie SUCHBEGRIFFE
       ab oder nur SCHREIBVARIANTEN?

`[read]` **Der Unterschied aus E ist der Kern:**

`[cmd]` **C-510 hat `Thiamin` neben `Thiamine` gesetzt** ?
**das ist eine VARIANTE.**

`[read]` **`Brot` fuer Gluten ist ein SUCHBEGRIFF** ? **ein
anderes Wort fuer dieselbe Sache, nicht dieselbe Schreibung.**

`[read]` **Miss, welche Art wo fehlt.**

## Was NICHT zu tun ist

**Keine Umsetzung** ? **welche Luecke zuerst geschlossen wird,
ist Toms Entscheidung.**

## Abnahmebedingungen

    A1  je Suchweg: welche Aliastabelle? TABELLE.
    A2  je Tabelle: wie viele Ziele ohne Alias?
    A3  welche Suchwege haben keine Tabelle?
    A4  fuenf Stichproben je Suchweg, mit Trefferzahl.
    A5  Varianten gegen Suchbegriffe getrennt gezaehlt.
    A6  eine Empfehlung: welche Luecke zuerst?
    A7  KEINE Umsetzung. git status supabase/ bleibt
        unveraendert.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

