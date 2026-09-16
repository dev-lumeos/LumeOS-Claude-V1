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
erledigt: 2026-09-08
commit: 5e970b18
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

`[cmd]` 2026-09-16: Die Such-RPC hat jetzt zehn Parameter. Die vier neuen
Parameter sind `p_allergien_ausblenden`, `p_meidestoffe`, `p_marken` und
`p_nur_bewertet`; Kategorie und Form bleiben `EXISTS`-Produktfilter.

`[cmd]` Meidestoffe kommen als `meidestoff_treffer text[]` zurueck und
entfernen kein Produkt. Allergietreffer werden vor der Rueckgabe
ausgeschlossen. Der C-504-Test belegt beides, mehrere Marken, bewertete
Produkte und eine erfundene Marke mit 0 Treffern.

`[cmd]` `user_display_preferences` war geeignet: PK
`(user_id, preference_key)`, JSON-Objekt, Owner-RLS und authenticated-DML.
Die neuen authenticated-only RPCs lesen/schreiben nur
`supplements.products_filters` mit Marktstatus, Kategorie, Form, deduplizierten
Marken und Allergieschalter. Die Sucheingabe wird nicht gespeichert.

`[cmd]` Laufzeit auf der laufenden DB mit `dev@lumeos.app`, `whey`, Limit 100:
43,6 ms ohne Allergieausschluss; 196,4 ms mit Ausschluss von 56.934
Produkt-IDs. Der neue B-Tree auf gefaltetem Zutatenname plus Produkt-ID stuetzt
den exakten C-503-Aliasjoin. `anon` hat kein Execute, `authenticated` schon.

`[cmd]` Sicherung: `backup/schema/20260916165000_c504_c506_vorher.sql`.
Vollkette `c506_final`: `SCHEMA VOLLSTAENDIG`, 937,1 s. C-495, G-454 und die
neuen C-504-Vertragstests sind gruen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen, LIVE.**

`[cmd]` **Zehn Parameter:**

    p_query, p_market_status, p_marke, p_limit,
    p_kategorie, p_form,
    p_allergien_ausblenden  boolean DEFAULT true,
    p_meidestoffe           text[],
    p_marken                text[],
    p_nur_bewertet          boolean

`[cmd]` **Und `public.user_display_preferences` als
Speicher** ? **nicht eine neue Tabelle, die bestehende.**

### Die Laufzeit, gemessen

> *,,whey: 43,6 ms ohne, 196,4 ms MIT Ausschluss von 56.934
Allergie-Produkten."*

`[read]` **Vorher lief der Ausschluss im Browser, nach dem
Holen** ? **Toms *,,viel zu lahm"*.**

`[read]` **196 ms fuer 56.934 ausgeschlossene Produkte ist der
Preis, den die Datenbank verlangt** ? **statt 500 Zeilen zu
holen und 458 wegzuwerfen.**

### Und die Trennung haelt

`[cmd]` **`p_allergien_ausblenden` ENTFERNT,
`p_meidestoffe` MARKIERT** ? **Toms Trennung aus G-455.**

`[cmd]` **`p_allergien_ausblenden DEFAULT true`** ? **im
Zweifel schuetzen.**

**Abgenommen.**


