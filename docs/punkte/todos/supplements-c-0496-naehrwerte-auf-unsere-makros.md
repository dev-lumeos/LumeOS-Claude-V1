---
nr: C-496
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-485
entscheidung: null
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-08
  zeilen: 3000982
  gemappt: 302293
---

# C-496 - die Naehrwerte auf unsere Makros und Mikros

## Toms Vorgabe

Tom, 2026-09-08:

> naehrwerte und wirkstoffe und hilfsstoffe muessen in der db
> sauber auf unsere bestehenden makros und mikros gematched
> werden, dass wir die werte verwenden koennen und wir es in
> nutrition/nutrients sauber als supplement deklarieren
> koennen. beachte auch die mengeneinheiten

## Was dasteht

`[cmd]` **`product_contents`: 3.000.982 Zeilen, davon 302.293
mit `supplement_id`** ? **10 Prozent.**

`[cmd]` **Die Einheiten, gemessen:**

    (leer)         1.546.935
    mg               897.678
    Gram(s)          197.223
    mcg              191.300
    IU                46.807
    Calorie(s)        45.575
    {Calories}        22.203
    g                 21.017
    mcg DFE            9.245
    mL                 6.041
    mcg RAE            2.929
    mg NE              2.361

`[read]` **Drei Probleme auf einmal:**

**1** ? **Gram(s) und g sind dasselbe, Calorie(s) und
{Calories} auch.**

**2** ? **IU ist KEINE Masse** ? **Internationale Einheiten
rechnen je Stoff anders um (Vitamin A, D, E).**

**3** ? **mcg DFE, mcg RAE, mg NE sind
Aequivalenzeinheiten** ? **Folat, Vitamin A, Niacin.**

`[cmd]` **1,5 Mio Zeilen haben GAR KEINE Einheit** ?
**Hilfsstoffe ohne Mengenangabe.**

## Was LumeOS hat

`[cmd]` **`nutrition.foods` fuehrt die Naehrwertspalten:**

    enercc, prot625, fat, cho, fibt, sugar, fasat,
    nacl, water_g, alc
    vita_ug, vitd_ug, vite_mg, vitk_ug, vitc_mg,
    thia_mg, ribf_mg, nia_mg, vitb6_ug, fol_ug, vitb12_ug
    na_mg, k_mg, ca_mg, mg_mg, p_mg, fe_mg, zn_mg,
    id_ug, cu_ug, mn_ug

`[read]` **Dieselben Spalten in `foods_custom`** ? **die Bauform
steht.**

## Was zu bauen ist

**1** ? **Eine Zuordnungstabelle DSLD-Name auf LumeOS-Spalte.**

    Calories             -> enercc
    Protein              -> prot625
    Total Fat            -> fat
    Total Carbohydrates  -> cho
    Dietary Fiber        -> fibt
    Sugar                -> sugar
    Saturated Fat        -> fasat
    Sodium               -> na_mg
    Potassium            -> k_mg
    Calcium              -> ca_mg
    Vitamin C            -> vitc_mg

`[read]` **MISS, welche Namen wirklich vorkommen** ? **nicht aus
dieser Liste abschreiben.**

`[cmd]` **Und je Zuordnung eine Quelle** ? **wie bei C-490
(`source_id`, `evidence_class`).**

**2** ? **Die Einheiten umrechnen.**

    Gram(s), g          -> g       (gleich)
    Calorie(s),
      {Calories}        -> kcal    (gleich)
    mg                  -> mg
    mcg                 -> ug
    IU                  -> JE STOFF verschieden
    mcg DFE, RAE, NE    -> Aequivalent, nicht Masse

`[read]` **Bei IU: NICHT pauschal umrechnen.**

`[cmd]` **Vitamin D: 1 IU = 0,025 ug. Vitamin E: 1 IU = 0,67 mg
(natuerlich) oder 0,45 mg (synthetisch).**

`[read]` **Wo die Form unbekannt ist: NICHT umrechnen, sondern
als nicht umrechenbar melden.**

**3** ? **Eine Sicht: Naehrwerte je Produkt je Portion.**

    supplements.produkt_naehrwerte
      product_id, portionsgroesse_g,
      enercc, prot625, fat, cho, ...
      quelle: "aus DSLD-Etikett"
      luecken: welche Spalten leer sind und warum

`[read]` **Nicht kopieren, rechnen** ? **eine zweite Wahrheit
waere schlimmer als keine.**

## Und die Deklaration in nutrition

Tom: *,,dass wir es in nutrition/nutrients sauber als supplement
deklarieren koennen"*

`[cmd]` **C-466 hat `nutrient_intake_source_totals_for_day`** ?
**sie fuehrt Nahrung und Supplement GETRENNT und summiert
oben.**

`[read]` **Die Bauform steht** ? **sie braucht die Werte.**

## Abnahmebedingungen

    A1  welche DSLD-Namen kommen vor? TABELLE, nach
        Haeufigkeit.
    A2  je Zuordnung eine Quelle.
    A3  die Einheiten umgerechnet. Je Einheit die Regel.
    A4  IU: wie viele Zeilen, wie viele umrechenbar?
        Der Rest GEMELDET, nicht geraten.
    A5  eine Sicht je Produkt je Portion, mit Luecken.
    A6  Gegenprobe: Dr. Mercola (40 g, Calories 160,
        Protein 32 g) rechnet auf 100 g = 400 kcal,
        80 g Protein.
    A7  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**KEINE Einheit raten** ? **IU ohne bekannten Stoff ist nicht
umrechenbar, und das ist eine Antwort.**

**KEINE Werte nach `foods` kopieren** ? **rechnen.**

**`apps/` nicht anfassen.**

