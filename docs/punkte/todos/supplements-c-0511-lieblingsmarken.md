---
nr: C-511
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-504
entscheidung: null
beruehrt:
  tabellen: [public.user_display_preferences]
zahlen:
  gemessen: 2026-09-08
  marken: 4907
---

# C-511 - Lieblingsmarken statt einer Suche

## Toms Vorgabe

Tom, 2026-09-08:

> betreffs marken: da muss eine sinnvollere art hin, im sinne
> von user kann seine bevorzugten marken setzen, sprich das
> koennen mehrere sein und nicht nur eine suche und
> willkuerlich 25 im pulldown

## Gemessen

`[cmd]` **4.907 On-Market-Marken.**

`[cmd]` **Die Leiste zeigt: *,,im Pulldown die 25 haeufigsten,
alle uebrigen ueber das Eingabefeld"*.**

`[read]` **Die 25 sind die haeufigsten im KATALOG, nicht die,
die der Nutzer nimmt.**

`[cmd]` **`BulkSupplements` 5.595, `NOW` 4.977, `Hawaii
Pharm` 4.726** ? **wer davon kauft, ist nicht gefragt worden.**

`[cmd]` **Und es gibt KEINE Tabelle fuer Lieblingsmarken.**

## Was zu bauen ist

`[read]` **Der Nutzer setzt seine Marken, MEHRERE.**

`[cmd]` **`food_preference_items` traegt schon `preference`
(`liked`, `disliked`, `hard_exclude`) und `target_type`** ?
**miss, ob ein `brand` dazupasst.**

`[read]` **Dieselbe Frage wie in C-497** ? **er hat dort
`catalog_item` gemessen (0 Zeilen) und die Tabelle erweitert,
statt eine zweite zu bauen.**

### Was der Pulldown dann zeigt

    meine Marken        zuoberst, was der Nutzer gesetzt hat
    ---
    haeufigste          die 25 aus dem Katalog
    Eingabefeld         fuer alle 4.907

`[read]` **Nicht *,,willkuerlich 25"*** ? **erst meine, dann
die anderen.**

## Und die Suche

`[cmd]` **`search_supplier_products` hat `p_marken text[]`
(C-504)** ? **mehrere gehen schon.**

`[read]` **Was fehlt, ist die Vorauswahl** ? **und ein
Schalter *,,nur meine Marken"*.**

## Abnahmebedingungen

    A1  passt brand in food_preference_items?
        Gemessen und begruendet.
    A2  mehrere Marken setzbar.
    A3  eine Funktion liefert sie, sortiert:
        meine zuerst.
    A4  RLS: nur die eigenen.
    A5  Gegenprobe: ein Nutzer ohne Lieblingsmarken
        sieht die 25 haeufigsten.
    A6  Sicherung, Vollkette, ALLE Waechter.

## Was nicht zu tun ist

**`apps/` nicht anfassen** ? **G-467 baut die Oberflaeche.**

