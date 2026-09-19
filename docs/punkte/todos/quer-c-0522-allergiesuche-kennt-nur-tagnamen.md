---
nr: C-522
typ: fehler
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-503
entscheidung: null
beruehrt:
  tabellen: [nutrition.tag_definitions]
zahlen:
  gemessen: 2026-09-08
  tags: 6
---

# C-522 - die Allergiesuche kennt nur den Tagnamen

## Toms Befund

Tom, 2026-09-08:

> miss, wieso bei allergieeingabe nichts kommt, wenn man brot
> eingibt, stichwort gluten etc

## Gemessen

`[cmd]` **`public.allergy_catalog_suggestions('nahrung', ...)`,
selbst getestet:**

    "gluten"      -> contains_gluten, 622 Treffer
    "brot"        -> 0
    "weizen"      -> 0
    "glutenfrei"  -> 0
    "nuesse"      -> contains_nuts, 120 Treffer

`[read]` **Die Suche trifft nur, wenn der Nutzer den TAGNAMEN
selbst tippt.**

`[cmd]` **Sechs Tags mit `is_exclusion_relevant`:**

    contains_gluten    Enthaelt Gluten
    contains_lactose   Enthaelt Laktose
    contains_nuts      Enthaelt Nuesse
    contains_soy       Enthaelt Soja
    vegan              Vegan
    vegetarian         Vegetarisch

`[read]` **Jeder hat GENAU EINEN Namen** ? **keine Aliase.**

## Dieselbe Luecke wie C-502

`[cmd]` **Dort hatte `lactose` keine Aliase und traf null** ?
**Codex hat drei gebaut, und jetzt trifft es 714 Produkte.**

`[cmd]` **Hier gibt es `public.allergen_aliases`** ? **aber sie
traegt Aliase fuer die PRODUKTSUCHE, nicht fuer die
EINGABESUCHE.**

`[read]` **MISS, ob dieselbe Tabelle beide bedienen kann.**

## Was zu bauen ist

`[read]` **Suchbegriffe je Tag.**

    contains_gluten    Brot, Weizen, Roggen, Gerste,
                       Dinkel, Nudeln, Mehl, Zoeliakie,
                       glutenfrei
    contains_lactose   Milch, Kaese, Joghurt, Sahne,
                       Butter, Milchzucker, laktosefrei
    contains_nuts      Nuss, Mandel, Walnuss, Haselnuss,
                       Cashew, Erdnuss, Pistazie
    contains_soy       Soja, Tofu, Edamame, Sojasauce

`[read]` **MISS, welche Begriffe wirklich vorkommen** ? **nicht
aus dieser Liste abschreiben.**

`[cmd]` **`nutrition.foods` hat 7.140 Namen** ? **messen,
welche Woerter dort stehen.**

### Und eine Grenze

`[read]` **`Erdnuss` ist botanisch KEINE Nuss** ? **die EU
fuehrt sie getrennt.**

`[cmd]` **C-502 hat die Grenze schon gezogen:** *,,Milk Protein
Isolate enthaelt Laktose, Whey Protein Isolate weitgehend
nicht."*

`[read]` **Wo es unsicher ist: MELDEN, nicht aufnehmen.**

## Abnahmebedingungen

    A1  "brot" schlaegt contains_gluten vor. Foto.
    A2  "milch", "weizen", "nuss" treffen. Drei Belege.
    A3  je Begriff eine Quelle.
    A4  MISS, welche Woerter in nutrition.foods
        vorkommen. TABELLE.
    A5  Erdnuss: getrennt oder unter nuts? Begruendet.
    A6  Gegenprobe: ein erfundenes Wort -> 0.
    A7  Sicherung, Vollkette, ALLE Waechter.
