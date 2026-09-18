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

## Toms Regel, 2026-09-08

> wie bringt man was in essen rein? antwort: powder/liquid/bar
> und allfaellige andere formen, die man daruntermischen kann

> pillen/tablet/capsule/etc gehoeren nicht in meals, der user
> kann die in einen stack einbauen, der wird nicht eine
> tablette zerhacken, nur dass es in einen shake rein passt.
> der trinkt den shake und spuelt die pille/capsule etc aus dem
> stack damit runter (und ja, auch diese kalorien / makros
> mikros gehoeren als zugenommen aus supplement)

### Die Regel

    Meal    was man UNTERMISCHT    Powder, Liquid, Bar, Gummy
    Stack   was man SCHLUCKT       Capsule, Tablet, Softgel
    beide   zaehlen in die Bilanz  C-466 fuehrt sie getrennt

`[read]` **Das loest meinen Einwand auf** ? **ich hatte
argumentiert, Fischoelkapseln haetten Kalorien und duerften
nicht ausgeschlossen werden. Sie werden nicht ausgeschlossen,
sie stehen nur im Stack.**

## Gemessen, On Market

    Capsule           43.301    davon 14.689 mit Naehrwerten
    Powder            24.074           14.123
    Liquid            20.534            4.732
    Tablet or Pill    16.798           12.301
    Softgel Capsule    9.957            7.137
    Other (tea bag)    3.569
    Gummy or Jelly     3.007            3.006
    Lozenge              496
    Unknown              183
    Bar                   40

`[read]` **Nach Toms Regel: Powder, Liquid, Bar, Gummy =
47.655 von 121.959 (39 %) koennen in eine Mahlzeit.**

`[cmd]` **Und `Bar` hat nur 40 Produkte** ? **die
Proteinriegel sind offenbar nicht als `Bar` erfasst. MISS,
wo sie stehen.**

`[read]` **`Other (e.g. tea bag)` und `Lozenge` sind
ungeklaert** ? **Tee zieht man auf, eine Lutschtablette
schluckt man nicht.**

