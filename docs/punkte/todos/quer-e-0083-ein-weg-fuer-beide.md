---
nr: E-83
typ: entscheidung
modul: quer
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
beruehrt:
  dateien:
    - apps/web/src/app/v2/nutrition/food-such-modal.tsx
zahlen:
  gemessen: 2026-09-08
---

# E-83 - ein Weg fuer Lebensmittel UND Supplemente

## Toms Befund

Tom, 2026-09-08, mit Bildschirmfoto:

> verblueffend, wie einfach du dich reinlegen laesst. schaust
> ein foto an, wo irgendwas draufsteht, aber hinterfragst gar
> nichts

> wo kann der tom das eingeben? auf diesem laecherlichen modal?
> wo nicht mal fuer nutrition passt? lass dieses modal besser
> bauen (fooddb suche like) und supplement mit einbinden

`[read]` **Ich habe fuenf Fotos angesehen und keines gefragt:
kommt ein Mensch hier hin?**

## Gemessen: zwei Wege fuer dieselbe Sache

`[cmd]` **`food-such-modal.tsx`** ? **Suchfeld, Sortierleiste
(Relevanz, Name, Protein hoch/niedrig, Kalorien, Kohlenhydrate,
Fett), *,,Mindestens zwei Zeichen eingeben"*.**

`[cmd]` **`supplement-modal.tsx`** ? **ein Freitextfeld, kein
Suchergebnis, keine Sortierung.**

`[read]` **Zwei Modale, zwei Bedienweisen, fuer Posten, die in
derselben Zeile landen.**

## Gemessen: wo Supplemente NICHT hingehen

    plan-eintrag-editor.tsx    kennt supplement NICHT
    plan-eintraege.tsx         kennt supplement NICHT
    plan-werkbank-ui.tsx       kennt supplement NICHT
    rezepte-echt.tsx           kennt supplement NICHT

`[cmd]` **Und datenseitig:**

    meal_plan_entries    entry_type, recipe_id, food_id,
                         custom_food_id
                         KEIN supplement_product_id
    recipe_ingredients   food_source, food_id,
                         custom_food_id
                         food_source kennt supplement NICHT

`[read]` **Vier Orte, an denen Tom Supplemente braucht, und
keiner kann es** ? **weder oben noch unten.**

## Was Tom verlangt

**1** ? **Ein Modal statt zwei.**

> lass dieses modal besser bauen (fooddb suche like) und
> supplement mit einbinden

`[read]` **Die Suche kennt beide Quellen und sagt, welche es
ist** ? **so wie die Mahlzeitzeile es schon tut
(`Supplement - 31 Gram(s)`).**

**2** ? **Mahlzeitplaene.**

> meal plans sollte das ebenfalls moeglich sein, supplements
> mit einzubinden (da faellt mir auf, dass es keine
> ghostentries mehr hat)

`[cmd]` **`meal_plan_entries` braucht die vierte Quelle.**

`[read]` **Und die Ghostentries sind ein eigener Befund** ?
**MISS, ob sie je existiert haben.**

**3** ? **Der Planner, falls der Plan editierbar ist.**

**4** ? **Rezepte.**

`[cmd]` **`recipe_ingredients.food_source` erlaubt heute
`bls` und `custom`** ? **dieselbe Erweiterung wie
`meal_items` in C-513.**

## Und der andere Weg

> in supplements, wenn ich ein produkt suche und waehlen will,
> muss die funktion her, dass ich es einem stack zuweisen kann
> mit den noetigen angaben, oder einem meal hinzufuegen kann

`[read]` **Heute fuehrt der Produkte-Reiter nur zur Tafel** ?
**keine Aktion.**

`[cmd]` **`supplements.stack_items` fuehrt SUBSTANZEN, nicht
Produkte (C-518)** ? **das blockiert *,,einem Stack
zuweisen"*.**

## Was zu klaeren ist, VOR dem Bauen

    A  Spec und Mockup: was sagen sie zur Suche?
       docs/spezifikation/00-QUELLEN.md nennt die
       Dateien je Modul.
    B  gab es Ghostentries? Wo sind sie geblieben?
    C  ist der Planner-Plan editierbar?
    D  soll ein Rezept Supplemente enthalten duerfen?
       Ein Whey im Shake-Rezept: ja. Ein Vitamin D
       im Rezept: vermutlich nein.
    E  was heisst "einem Stack zuweisen mit den
       noetigen Angaben"? Dosis, Zeitpunkt, Zyklus?

`[read]` **Punkt A zuerst** ? **die Spec kann Fragen schon
beantwortet haben.**

## Was ich falsch gemacht habe

`[read]` **G-475 und G-478 haben einen Weg gebaut, den ich nie
gegen die bestehende Bedienung gehalten habe.**

`[cmd]` **`food-such-modal.tsx` existiert seit langem** ? **ich
habe daneben ein zweites Modal bauen lassen.**

`[read]` **Und die Abnahme hat Fotos gezaehlt, nicht
Bedienbarkeit.**

