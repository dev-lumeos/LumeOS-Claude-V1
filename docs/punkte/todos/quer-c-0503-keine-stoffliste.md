---
nr: C-503
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-498
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [public.allergen_aliases]
zahlen:
  gemessen: 2026-09-08
---

# C-503 - es gibt keine Stoffliste hinter stoff_code

## Toms Befund

Tom, 2026-09-08, beim Ansehen der Settings:

> wie wird der abgleich aus menschlicher eingabe gegen reale
> eintraege in der db gemacht, sprich der match auf unsere id?
> ich denke, das sollte eine smartsearch mit vorschlaegen im
> pulldown sein, live bei der eingabe, dass der user auch das
> richtige eintraegt

## Der Befund stimmt

`[cmd]` **`public.user_allergies.stoff_code` ist NULL-faehig.**

`[cmd]` **`allergie-read.ts:85`:**

    Zweig 1   stoff_code -> allergen_aliases
    Zweig 2   stoff_code IS NULL -> stoff_text

`[cmd]` **Und es gibt KEINE Stoffliste** ? **nur
`allergen_aliases`, die auf Codes zeigt, die nirgends definiert
sind.**

`[read]` **Der Nutzer tippt Freitext, und ob er trifft,
entscheidet der Zufall.**

`[cmd]` **Beleg aus G-455: `lactose` hat 418 woertliche
Zutatzeilen und trifft null** ? **weil kein Alias existiert.**

## Zwei Sachen fehlen

**1** ? **Eine Stoffliste.**

    public.allergens
      code, name_de, name_en, name_th,
      art, hinweis, quelle

`[read]` **`allergen_aliases.stoff_code` bekommt einen
Fremdschluessel darauf** ? **heute zeigt er ins Leere.**

**2** ? **Eine Suchfunktion fuer die Eingabe.**

`[read]` **Wie `search_supplier_products` (C-495):
`pg_trgm`, Fehleingaben verstehen.**

`[cmd]` **`laktose`, `lactoseintoleranz`, `milchzucker` muessen
alle `lactose` finden.**

`[read]` **Und die deutschen Namen** ? **ein Nutzer tippt
*,,Nuesse"*, nicht `tree_nuts`.**

## Was in die Liste gehoert

`[read]` **Die 14 EU-Kennzeichnungspflichtigen sind der
Anfang:**

    glutenhaltiges Getreide, Krebstiere, Eier, Fische,
    Erdnuesse, Soja, Milch (Laktose), Schalenfruechte,
    Sellerie, Senf, Sesam, Schwefeldioxid/Sulfite,
    Lupinen, Weichtiere

`[read]` **Dazu die Supplementfaelle aus der Messung:**

`[cmd]` **`magnesium_stearate` 56.903 Zeilen, `Titanium
Dioxide`, `Sucralose`, `FD&C`-Farbstoffe, `Gelatine`.**

`[read]` **Und Medikamentenallergien** ? **Penicillin,
Sulfonamide, NSAR.**

`[cmd]` **MISS, welche Stoffe in `product_contents` und
`nutrition.foods` ueberhaupt vorkommen** ? **eine Liste ohne
Treffer nuetzt nichts.**

## Und der Freitext bleibt

`[read]` **Wer etwas hat, das nicht in der Liste steht, muss es
trotzdem eintragen koennen.**

`[cmd]` **`stoff_text` bleibt** ? **aber die Oberflaeche sagt,
dass es dann NICHT gegen Produkte prueft.**

`[read]` **Das ist der Unterschied zwischen *,,ich habe es
notiert"* und *,,LumeOS schuetzt mich davor"*.**

## Abnahmebedingungen

    A1  public.allergens mit den 14 EU-Allergenen
        plus den gemessenen Supplementfaellen.
    A2  je Eintrag name_de, name_en, name_th leer
        (Sprachregel).
    A3  allergen_aliases bekommt den Fremdschluessel.
    A4  eine Suchfunktion: "laktose", "milchzucker",
        "nuesse" finden das Richtige. Drei Belege.
    A5  MISS, welche Stoffe in product_contents und
        nutrition.foods vorkommen. Je Allergen die
        Trefferzahl.
    A6  die drei bestehenden Allergien von dev
        bekommen ihren Code.
    A7  Gegenprobe: ein erfundener Code faellt auf.
    A8  Sicherung, Vollkette, ALLE Waechter.

## Was nicht zu tun ist

**KEINEN Alias raten** ? **C-502 hat die Grenze gezogen:
`Milk Protein Isolate` enthaelt Laktose, `Whey Protein Isolate`
weitgehend nicht.**

**`apps/` nicht anfassen** ? **G-459 baut die Oberflaeche.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

