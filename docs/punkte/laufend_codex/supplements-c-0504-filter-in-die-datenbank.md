---
nr: C-504
typ: fehler
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: G-454
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [supplements.supplier_products]
zahlen:
  gemessen: 2026-09-08
---

# C-504 - die Filter gehoeren in die Datenbank

## Toms Befund

Tom, 2026-09-08:

> die filter gehoeren in supabase rein und nicht in die ui,
> die ui fuehrt nur aus

> dann hats einen initialfehler: wenn ich ctrl f5 mache, sind
> meine allergien ausgewaehlt und er sucht sich dumm und
> daemlich fuer resultate, das ist alles viel zu lahm
> also werden meine filtereinstellungen nicht gespeichert

`[read]` **Und mein Auftragsschnitt war schuld:** **G-454 hat
zwei Parameter gebaut, aber Allergien und Meidestoffe filtern
weiter im Browser.**

## Gemessen

`[cmd]` **`tab-produkte.tsx` filtert an drei Stellen selbst:**
**Z221 (Marken), Z295, Z931.**

`[cmd]` **Und KEINE Speicherung:** **kein `localStorage`, kein
`user_display_preferences`, nichts.**

`[read]` **Nach `Strg-F5` sind die Allergien aktiv, weil sie aus
`user_allergies` kommen** ? **aber die Suche laeuft mit dem
Vorgabefilter und wird dann im Browser nachgefiltert.**

## Was in die Datenbank gehoert

`[cmd]` **`search_supplier_products` hat heute sechs
Parameter:**

    p_query, p_market_status, p_marke, p_limit,
    p_kategorie, p_form

`[read]` **Es fehlen:**

    p_allergien_ausblenden   boolean
      -> EXISTS-Ausschluss ueber
         supplier_product_allergy_matches
    p_meidestoffe            text[]
      -> markieren, nicht entfernen (Toms Trennung)
    p_marken                 text[]
      -> heute EINE Marke (p_marke text)
    p_nur_bewertet           boolean
      -> die Daumen aus C-497

`[cmd]` **`supplier_product_allergy_matches` existiert schon
(C-498)** ? **sie wird heute im Browser gelesen und dort
angewandt.**

`[read]` **Das ist die Ursache fuer *,,viel zu lahm"*: die
Oberflaeche holt Treffer und wirft sie dann weg.**

## Und die Filtereinstellungen speichern

`[cmd]` **`public.user_display_preferences` existiert** ?
**miss, was drinsteht und ob es taugt.**

`[read]` **Was zu speichern ist: Marktstatus, Kategorie, Form,
Marken, ob Allergien ausgeblendet sind.**

`[read]` **Nicht die Sucheingabe** ? **die ist
augenblicklich.**

## Abnahmebedingungen

    A1  alle Filter als Parameter. Keiner mehr im
        Browser.
    A2  Laufzeit vorher/nachher, mit Allergiefilter.
        Gemessen.
    A3  die Einstellungen ueberleben Strg-F5.
    A4  mehrere Marken gleichzeitig.
    A5  Meidestoffe MARKIEREN, Allergien ENTFERNEN.
        Toms Trennung aus G-455.
    A6  Gegenprobe: ein Filter, der nichts findet.
    A7  Sicherung, Vollkette, ALLE Waechter.

## Was nicht zu tun ist

**`apps/` nicht anfassen** ? **die Oberflaeche zieht nach,
wenn die Funktion steht.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

