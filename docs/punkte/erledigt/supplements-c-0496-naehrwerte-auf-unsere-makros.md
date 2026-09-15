---
nr: C-496
typ: feature
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-485
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: ad775929
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

## Bericht 2026-09-15

Die Migration `20260915004915_c496_supplier_product_nutrients.sql` erzeugt die
belegte Namenszuordnung und die berechnete Sicht
`supplements.produkt_naehrwerte`. Es wird nichts nach `nutrition.foods`
kopiert; der kanonische Food-Bestand liegt ohnehin in
`nutrition.food_nutrients`.

`[cmd]` Gemessen wurden **39** wirklich vorkommende DSLD-Namen, jeweils mit
`source_id = dsld_product_label` und Evidenzklasse A. Die haeufigsten sind:

    Calories -> enercc                 52.285
    Vitamin C -> vitc_mg               41.042
    Total Carbohydrates -> cho         40.117
    Calcium -> ca_mg                   39.647
    Vitamin B6 -> vitb6_ug             30.767
    Magnesium -> mg_mg                 30.349
    Vitamin B12 -> vitb12_ug           29.518
    Zinc -> zn_mg                      28.148
    Sodium -> na_mg                    27.808
    Total Fat -> fat                   27.119
    Vitamin E -> vite_mg               26.401
    Water -> water_g                   25.467
    Vitamin A -> vita_ug               25.023
    Potassium -> k_mg                  23.757
    Niacin -> nia_mg                   22.812
    Protein -> prot625                 18.921

Die restlichen gemessenen Namen sind Riboflavin, Sugar, Iron, Thiamine,
Vitamin D/D3, Manganese, Folic Acid, Iodine, Dietary Fiber, Folate,
Saturated Fat, Copper, Total Sugars, Phosphorus, Vitamin K/K2, Vitamin B1/B2/B3,
Alcohol, Salt und Total Carbohydrate; alle stehen als explizite Zeilen in der
Mappingtabelle.

`[cmd]` Einheiten: g/Gram(s)/grams/gm, mg und mcg/ug werden nur als Masse
umgerechnet; Calorie(s), {Calories}, Calories und Kcal sind kcal.
Von **46.807** IU-Zeilen sind **16.069** Vitamin D/D3 und werden mit
1 IU = 0,025 ug gerechnet. Vitamin-E-IU (**15.011**) bleibt wegen unbekannter
natuerlicher/synthetischer Form als `vitamin_e_iu_form_unknown` in `luecken`.
Insgesamt bleiben **30.738** Nicht-Vitamin-D-IU unkonvertiert. DFE, RAE und NE
bleiben Aequivalente, keine erfundene Masse.

`[cmd]` Dr. Mercola Miracle Whey, die 160-kcal-Variante: 40 g, 160 kcal und
32 g Protein pro Portion, also **400 kcal** und **80 g Protein** je 100 g.

`[cmd]` anon hat keinen SELECT auf Mapping oder Sicht; authenticated hat
SELECT, die Sicht ist `security_invoker`.

Sicherung: `backup/schema/20260915011641_c43_vor_kettenlauf.sql`.
Vollkette (215 Schritte, Wegwerf-DB `c496_final`), Schema-Vollstaendigkeit und
der C-496/C-497-Nachweistest (2/2) sind gruen. Nicht live eingespielt; `apps/`,
Dev-Server, Stage, Commit und Push blieben unangetastet.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

    Migration   12.566 B, liegt vor
    LIVE        noch nicht -- er sagt es selbst

`[cmd]` **39 DSLD-Namen gemappt.**

### Die IU-Behandlung ist der Kern

`[cmd]` **46.807 IU-Zeilen, gemessen:**

    Vitamin E            15.011
    Vitamin A            13.727
    Vitamin D             8.381
    Vitamin D3            7.688
    Beta-Carotene           563
    Vitamin A Palmitate     359
    Vitamin D2              144

`[cmd]` **Und die vier Regeln in der Migration:**

    Vitamin D, D3   vitamin_d_iu_to_ug     (0,025)
    Vitamin E       iu_form_required       LUECKE
    Vitamin A       equivalent_not_mass
    sonst           iu_not_convertible_for_nutrient

`[read]` **`Vitamin E` ist die GROESSTE IU-Gruppe und bleibt
bewusst offen** ? **natuerlich 0,67 mg, synthetisch 0,45 mg,
und das Etikett sagt es nicht.**

`[read]` **Genau die Auflage:** *,,wo die Form unbekannt ist:
NICHT umrechnen, sondern als nicht umrechenbar melden."*

`[cmd]` **Und `jsonb_build_object(not_convertible, ...) AS
luecken`** ? **die Luecke steht in der Sicht, nicht im
Bericht.**

### Die Gegenprobe

`[cmd]` **Dr. Mercola: 40 g, 160 kcal, 32 g Protein -> 400 kcal
/ 80 g Protein je 100 g.**

`[read]` **Rechnet, kopiert nicht** ? **der Kommentar sagt es:**
*,,keine Kopie."*

**Abgenommen. Einspielen steht aus.**
