---
nr: C-503
typ: feature
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

# C-503 - die Vorschlaege kommen aus den Katalogen

## Toms Befund und seine Loesung

Tom, 2026-09-08, beim Ansehen der Settings:

> wie wird der abgleich aus menschlicher eingabe gegen reale
> eintraege in der db gemacht, sprich der match auf unsere id?

`[cmd]` **Der Befund stimmt:** `stoff_code` **ist NULL-faehig,
`allergen_aliases` zeigt auf Codes, die nirgends definiert
sind.**

`[cmd]` **Beleg aus G-455:** `lactose` **hat 418 woertliche
Zutatzeilen und trifft null.**

### Und sein Loesungsweg

> user gibt ein, ob es um nahrung/supplement/medikament geht,
> dementsprechend wissen wir, welche produktkataloge SSOT sind.
> also koennen wir anhand der eingabe gezielt auf die richtigen
> punkte leiten

> produktkatalog sollte doch in allen modulen entweder direkt
> in den eintraegen allergien etc haben oder zumindest
> verlinkung zu einer allergie table, dann koennen wir auch
> laut eingabe matches fuer den user generieren, die er
> anwaehlen kann

`[read]` **Keine neue Stoffliste** ? **die KATALOGE sind die
Stoffliste.**

`[read]` **Mein erster Vorschlag war eine neue
`public.allergens`-Tabelle** ? **ohne zu messen, was die
Kataloge tragen. Toms Weg ist besser.**

## Was die drei Kataloge tragen, gemessen

**NAHRUNG** ? `[cmd]` **`nutrition.tag_definitions`, 14 Tags:**

    high_protein, low_carb, low_fat, high_fiber,
    whole_food, ultra_processed, vegan, vegetarian,
    contains_nuts, contains_gluten, contains_lactose,
    thai_food, halal, kosher

`[cmd]` **Spalten:** `code`, `name_de`, `name_en`, `name_th`,
`tag_type`, `is_exclusion_relevant`, `icon`, `filter_group`.

`[read]` **`is_exclusion_relevant` sagt schon, welcher Tag zum
Ausschliessen taugt.**

`[cmd]` **`food_tags`: 7.109 von 7.140 Lebensmitteln
getaggt.**

**SUPPLEMENT** ? `[cmd]` **`supplements.supplement_warnings`,
`supplement_interactions`, und `product_contents` selbst.**

`[cmd]` **Die haeufigsten Zutaten: `Magnesium Stearate`
56.903, `Sucralose` 11.674.**

**MEDIKAMENT** ? `[cmd]` **NICHTS.**

`[read]` **Eine Penicillin-Allergie kann heute nirgends gegen
etwas geprueft werden.**

## Was zu bauen ist

**1** ? **Eine Vorschlagsfunktion je Art.**

    vorschlaege(art, eingabe)

      art = nahrung
        -> tag_definitions WHERE is_exclusion_relevant
        -> plus die Tags, die auch getaggt SIND

      art = supplement
        -> product_contents, haeufigste ingredient_name
        -> plus supplement_warnings

      art = medikament
        -> MELDEN, dass nichts da ist

`[read]` **Ein Tag ohne getaggte Lebensmittel wird gar nicht
angeboten.**

`[cmd]` **Mit `pg_trgm`, wie `search_supplier_products`
(C-495)** ? `laktose`, `milchzucker`, `nuesse` **muessen
treffen.**

**2** ? **`allergen_aliases` wird die Bruecke.**

`[read]` **Heute zeigt `stoff_code` ins Leere** ? **er soll auf
den KATALOGEINTRAG zeigen.**

    stoff_code = "nutrition:contains_lactose"
    stoff_code = "supplements:magnesium_stearate"

`[read]` **MISS, ob ein Praefix taugt oder eine eigene Spalte
besser ist** ? **die Entscheidung begruenden.**

**3** ? **Die drei bestehenden Allergien anbinden.**

`[cmd]` **`dev@lumeos.app`: `lactose` (nahrung),
`magnesium_stearate` (supplement), `soja` (nahrung).**

`[read]` **Sie sollen danach treffen** ? **`lactose` gegen
`contains_lactose` (7.109 getaggte Lebensmittel).**

## Zwei Befunde, die dabei herauskommen

`[cmd]` **`nutrition.foods` hat KEINE Allergenspalte** ? **nur
`foods_custom.custom_allergens`.**

`[read]` **Die Tags haengen an `food_tags`, nicht am
Lebensmittel** ? **miss, ob die 31 ohne Tag wirklich keins
brauchen.**

`[cmd]` **Und `medical` hat nichts** ? **das ist ein eigener
Punkt, nicht dieser.**

`[read]` **MELDEN, nicht bauen.**

## Der Freitext bleibt

`[read]` **Wer etwas hat, das in keinem Katalog steht, traegt
es ein.**

`[cmd]` **`stoff_text` bleibt** ? **aber die Oberflaeche sagt,
dass es dann NICHT gegen Produkte prueft.**

`[read]` **Der Unterschied zwischen *,,ich habe es notiert"*
und *,,LumeOS schuetzt mich davor"*.**

## Abnahmebedingungen

    A1  je Art: welcher Katalog, wie viele Eintraege
        taugen als Vorschlag? TABELLE.
    A2  eine Vorschlagsfunktion, die "laktose",
        "milchzucker", "nuesse" trifft. Drei Belege.
    A3  ein Tag ohne getaggte Lebensmittel wird NICHT
        vorgeschlagen. Belegt.
    A4  allergen_aliases zeigt auf Katalogeintraege.
        Die Form begruendet.
    A5  die drei Allergien von dev treffen danach.
        Zahl je Allergie.
    A6  medikament: gemeldet, dass nichts da ist.
    A7  Gegenprobe: ein erfundener Code faellt auf.
    A8  Sicherung, Vollkette, ALLE Waechter.

## Was nicht zu tun ist

**KEINE neue Stoffliste** ? **die Kataloge sind sie.**

**KEINEN Alias raten** ? **C-502 hat die Grenze gezogen:
`Milk Protein Isolate` enthaelt Laktose, `Whey Protein
Isolate` weitgehend nicht.**

**`medical` NICHT bauen** ? **melden.**

**`apps/` nicht anfassen** ? **G-459 baut die Oberflaeche.**

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

