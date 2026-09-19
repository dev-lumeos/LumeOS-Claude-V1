---
nr: C-525
typ: feature
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-523
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [public.allergen_aliases]
zahlen:
  gemessen: 2026-09-08
  tags: 6
---

# C-525 - ein Suchwortschatz fuer die Ausschluss-Tags

## Toms Entscheidung

Tom, 2026-09-08, zu C-523:

> ja das passt so fuer mich, arbeite den auftrag aus

`[cmd]` **Codex Empfehlung:** *,,Einen getrennten, kuratierten
Suchwortschatz fuer die sechs Nahrungsausschluss-Tags schaffen
? NICHT Food-Aliase umwidmen."*

## Der Anlass

`[cmd]` **Tom tippte *,,brot"* und bekam nichts:**

    "gluten"      -> contains_gluten, 622 Treffer
    "brot"        -> 0
    "weizen"      -> 0
    "glutenfrei"  -> 0

`[cmd]` **Gemessen, je Ausschluss-Tag:**

    contains_gluten      0 Aliase
    vegan                0
    vegetarian           0
    contains_lactose     6
    contains_soy         7
    contains_nuts       13

`[read]` **`contains_gluten` ist der, den Tom getippt hat.**

## Was zu bauen ist

`[read]` **Suchbegriffe je Tag, KURATIERT** ? **nicht aus den
Food-Aliasen abgeleitet.**

`[cmd]` **MISS, welche Woerter in `nutrition.foods` wirklich
stehen** ? **7.140 Namen, plus `food_aliases` mit 32.845
Eintraegen.**

`[read]` **Die Messung liefert Kandidaten, die Kuratierung
entscheidet.**

### Die sechs Tags

    contains_gluten    Brot, Weizen, Roggen, Gerste,
                       Dinkel, Nudeln, Mehl, Zoeliakie
    contains_lactose   Milch, Kaese, Joghurt, Sahne,
                       Butter, Milchzucker
    contains_nuts      Nuss, Mandel, Walnuss, Haselnuss,
                       Cashew, Pistazie
    contains_soy       Soja, Tofu, Edamame, Sojasauce
    vegan              ?
    vegetarian         ?

`[read]` **Diese Liste ist ein ANHALTSPUNKT, keine Vorgabe** ?
**messen, was vorkommt.**

`[cmd]` **Und `vegan`/`vegetarian` sind keine Allergene** ?
**MISS, ob sie ueberhaupt in die Allergiesuche gehoeren.**

### Zwei Grenzen

**1** ? **`Erdnuss` ist botanisch KEINE Nuss.**

`[cmd]` **Die EU fuehrt sie getrennt** ? **entscheiden und
begruenden.**

**2** ? **Die Verneinung.**

`[read]` **`glutenfrei` MEINT Gluten, sucht aber das
Gegenteil** ? **MISS, ob die Suche damit umgehen kann.**

`[cmd]` **C-502 hat die Grenze gezogen:** *,,Milk Protein
Isolate enthaelt Laktose, Whey Protein Isolate weitgehend
nicht."*

## Was NICHT zu tun ist

**Die Food-Aliase NICHT umwidmen** ? **sie sagen, wie ein
Lebensmittel noch heisst, nicht welches Allergen darin
steckt.**

**Die Medikamentenbruecke NICHT bauen** ? **eigener Punkt,
Codex nennt sie *,,nicht zu ratend"*.**

**Die 88 Naehrstoffe ohne Alias NICHT anfassen** ? **eigener
Punkt.**

## Abnahmebedingungen

    A1  "brot", "weizen", "milch", "nuss", "soja"
        treffen. Fuenf Belege mit Trefferzahl.
    A2  je Begriff eine Quelle.
    A3  MISS, welche Woerter in nutrition.foods
        vorkommen. TABELLE je Tag.
    A4  Erdnuss: getrennt oder unter nuts? Begruendet.
    A5  "glutenfrei": trifft es oder nicht? Entschieden
        und begruendet.
    A6  vegan/vegetarian: gehoeren sie in die
        Allergiesuche? Gemessen.
    A7  Gegenprobe: ein erfundenes Wort -> 0.
    A8  Sicherung, Vollkette, ALLE Waechter.

## Bericht

_(vom Agenten anzuhaengen)_

## Abnahme

_(vom Orchestrator)_

