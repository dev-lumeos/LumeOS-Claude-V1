---
nr: C-527
typ: messauftrag
modul: supplements
schwere: hoch
angelegt: 2026-09-08
gemessen: 2026-09-22
agent: codex
erledigt: 2026-09-08
commit: 3ed2eac5
beruehrt:
  tabellen: []
entscheidung: offen
---

# C-527 – die DSLD-Quelle trägt mehr als wir lesen

## Ergebnis

Die Quelle trägt den Link zur **DSLD-Labelseite**, nicht den Pfad zu einer
Bilddatei. Er ist bei allen geprüften Quelldaten deterministisch aus
`dsld_id` ableitbar. `Formulation` und `Precautions` sind wertvolle
Etikettbelege, aber Freitext – nicht ohne fachliche Modellierung als
maschinelle Allergen- oder Wechselwirkungslogik verwendbar.

Es gab keine Umsetzung: keine Migration, keine Pipeline- oder App-Änderung.

## A1 – URL-Muster vollständig gemessen

Der Ordner enthält **11** Dateien (`xlsx-batch1.xlsx` bis
`xlsx-batch11.xlsx`), nicht 14. Der C-485-Importer erwartet ebenfalls genau
11. In jeder Datei haben die fünf Datentafeln `URL` als erste Spalte; das
`Read Me` ist keine Datentafel.

| Tafel | Datenzeilen | gültig `https://dsld.od.nih.gov/label/<DSLD ID>` | URL-ID = DSLD ID | Abweichungen |
|---|---:|---:|---:|---:|
| Product Overview | 214.780 | 214.780 | 214.780 | 0 |
| Dietary Supplement Facts | 2.020.130 | 2.020.130 | 2.020.130 | 0 |
| Other Ingredients | 214.780 | 214.780 | 214.780 | 0 |
| Label Statements | 1.467.219 | 1.467.219 | 1.467.219 | 0 |
| Company Information | 253.514 | 253.514 | 253.514 | 0 |
| **Gesamt** | **4.170.423** | **4.170.423** | **4.170.423** | **0** |

`https://dsld.od.nih.gov/label/542` ist damit eine sicher berechenbare
**Webseite zum Etikett**, kein nachgewiesener `label_image_path`. Für den
Etikett-Reiter darf daraus kein erfundener Bildpfad werden.

## A2 – Label Statements vollständig

Die vollständige Quelle hat **elf**, nicht zehn, Statement-Arten. Die Zahlen
sind Produkte je Art (nicht nur Zeilen); pro Produkt/Art gibt es hier genau
eine Zeile. Die Beispiele sind bewusst kurze Auszüge; der Quelltext bleibt
unverändert in der XLSX.

| Statement Type | Produkte | Zehn Beispiele (DSLD-ID · Produkt · Auszug) |
|---|---:|---|
| Suggested Use | 163.683 | 542 · B-2 100 mg · DIRECTIONS: one to two tablets daily; 543 · B-6 100 mg · one tablet daily; 544 · C-1000 · one to two caplets; 545 · Niacin 250 mg · one tablet daily; 546 · Niacinamide 500 mg · one tablet daily; 547 · Brewer's Yeast · two tablets three times daily; 548 · Mega B-100 · one caplet daily; 549 · Gelatin 650 mg · two capsules after meals; 550 · E-Oil · five drops daily; 551 · Creatine Caps 700 mg · six capsules daily |
| Statement of Identity | 199.033 | 542 · B-2 100 mg · FDA disclaimer; 543 · B-6 100 mg · FDA disclaimer; 545 · Niacin 250 mg · FDA disclaimer; 546 · Niacinamide 500 mg · FDA disclaimer; 547 · Brewer's Yeast · Dietary Supplement; 548 · Mega B-100 · FDA disclaimer; 549 · Gelatin 650 mg · FDA disclaimer / Dietary Supplement; 550 · E-Oil · FDA disclaimer; 551 · Creatine Caps 700 mg · FDA disclaimer; 552 · Hardcore Creatine Powder · FDA disclaimer |
| Precautions | 153.879 | 542 · B-2 100 mg · pregnant / medications / doctor; 543 · B-6 100 mg · same warning; 544 · C-1000 · same warning; 545 · Niacin 250 mg · flushing / not fasting; 546 · Niacinamide 500 mg · same warning; 547 · Brewer's Yeast · avoid if allergic to yeast; 548 · Mega B-100 · not for pregnant/nursing; 549 · Gelatin 650 mg · same warning; 550 · E-Oil · medications / procedure; 551 · Creatine Caps 700 mg · kidney disease warning |
| Other | 86.791 | 542 · B-2 100 mg · energy / vision claim; 543 · B-6 100 mg · metabolism / heart claim; 544 · C-1000 · Vitamin World quality text; 545 · Niacin 250 mg · product code and heart claim; 546 · Niacinamide 500 mg · quality text; 547 · Brewer's Yeast · quality text; 548 · Mega B-100 · metabolism / heart claim; 549 · Gelatin 650 mg · nail-health copy; 550 · E-Oil · antioxidant / heart copy; 554 · Echinacea With Goldenseal Root · immune claim |
| Formulation | 91.305 | 542 · B-2 100 mg · No Milk / No Lactose / No Soy / No Gluten; 543 · B-6 100 mg · same exclusions; 544 · C-1000 · same exclusions; 545 · Niacin 250 mg · same exclusions; 546 · Niacinamide 500 mg · same exclusions; 547 · Brewer's Yeast · Contains wheat ingredients; 548 · Mega B-100 · No Milk / No Lactose; 549 · Gelatin 650 mg · No Milk / No Lactose; 550 · E-Oil · dl-Alpha Tocopheryl Acetate; 551 · Creatine Caps 700 mg · No Milk / No Lactose / No Soy |
| Product/Version Code | 73.128 | 542 · B-2 100 mg · PROD. #640 B640 04D; 543 · B-6 100 mg · PROD. #653 B12590 09E; 544 · C-1000 · PROD. #695 B30264 09F; 546 · Niacinamide 500 mg · PROD. #730 B730 03C; 547 · Brewer's Yeast · PROD. #745 B740 08D; 548 · Mega B-100 · PROD. #772 B770 08D; 549 · Gelatin 650 mg · PROD. #783 B780 07E; 550 · E-Oil · PROD. #810 B809 06D; 551 · Creatine Caps 700 mg · PROD. #906 B906 11G; 552 · Hardcore Creatine Powder · PROD. #907 B67900 02B |
| Product Specific Information | 144.942 | 563 · Sunvite Vitamin D3 400 IU · Store at room temperature; 622 · Cell Rush · cool, dry, away from children; 623 · K-Otic · protect from heat/light/moisture; 624 · Kre-Alkalyn EFX Pro · cool, dry, away from children; 625 · Kre-Alkalyn pH-Correct · keep tightly closed; 626 · LBA PRO Chocolate Syrup · cool, dry; 627 · LG5 PRO · cool, dry; 628 · LBA PRO Vanilla Glaze · cool, dry; 629 · Nytric EFX Pro · cool, dry; 630 · Test Charge · ALLERGEN STATEMENT: None |
| Seals/Symbols | 64.979 | 542 · B-2 100 mg · QUALITY ASSURED; 543 · B-6 100 mg · QUALITY ASSURED; 544 · C-1000 · KOF-K certification; 545 · Niacin 250 mg · QUALITY ASSURED; 546 · Niacinamide 500 mg · QUALITY ASSURED; 547 · Brewer's Yeast · QUALITY ASSURED; 548 · Mega B-100 · QUALITY ASSURED; 549 · Gelatin 650 mg · QUALITY ASSURED; 551 · Creatine Caps 700 mg · QUALITY ASSURED; 552 · Hardcore Creatine Powder · QUALITY ASSURED |
| Branding Statement(s) | 73.046 | 542 · B-2 100 mg · © Vitamin World; 543 · B-6 100 mg · © Vitamin World; 544 · C-1000 · © Vitamin World; 545 · Niacin 250 mg · © Vitamin World; 546 · Niacinamide 500 mg · © Vitamin World; 547 · Brewer's Yeast · © Vitamin World; 548 · Mega B-100 · registered trademark; 549 · Gelatin 650 mg · Naturally inspired; 550 · E-Oil · © Vitamin World; 551 · Creatine Caps 700 mg · Pharmaceutical Grade |
| Formulation re: Organic | 12.335 | 661 · Echinacea Goldenseal Propolis Spray · Certified Organic Ingredient; 662 · Certified Organic Valerian Root · Oregon Tilth / USDA Organic; 663 · Valerian Root Alcohol Free · Certified Organic Ingredient; 664 · Passionflower Vine · Oregon Tilth / USDA Organic; 691 · Milk Thistle Seed · Oregon Tilth / USDA Organic; 692 · Green Tea Leaf · certified organic; 693 · Echinacea Supreme · Oregon Tilth / USDA Organic; 718 · Green SuperFood · organic green foods; 731 · Fruit Blast Isolate · Non GMO; 753 · Flax Oil · USDA Organic |
| Formulation re: Homeopathic | 61 | 36.492 · Butterbur · not manufactured with wheat/gluten/soy/milk; 36.498 · Rei-Shi Mushrooms · same exclusions; 36.499 · Rhodiola 500 mg · same exclusions; 40.013 · Coconut Oil · GLUTEN-FREE; 43.469 · Men Over 40 · iron free; 43.471 · Men Over 40 · iron free; 44.075 · Acetyl L-Carnitine · free of gluten/wheat/dairy/soy; 45.221 · Vision Enhancement · vegetarian, dairy free; 47.976 · Sendara Plus · Gluten Free; 54.855 · DLPA · gluten/sugar/preservative free |

`Suggested Use` ist bereits importiert: 210.388 von 214.780 DSLD-Produkten
haben in `supplier_products.suggested_use` einen Wert. Die übrigen zehn Arten
werden heute nicht in die Datenbank gelesen.

## A3 – Formulation gegen `allergen_aliases`

In den 91.305 Formulation-Texten stehen mindestens diese Negativ-Claims:

| Text im Label | Produkte |
|---|---:|
| `No Lactose` | 4.035 |
| `No Milk` | 4.481 |
| `Gluten Free` | 11.531 |
| `No Gluten` | 6.586 |
| `No Soy` | 4.792 |
| `No Nuts` | 50 |
| `No Wheat` | 7.914 |
| `No Yeast` | 8.218 |

Die aktuelle Allergenbrücke hat 29 positive Zutatenaliase: sechs für
Lactose, sieben für Soy, dreizehn für Nüsse und drei für Magnesium Stearate.
Sie bedeutet „diese Zutat ist vorhanden“, nicht „das Label erklärt sie als
frei von“.

* Bei allen **4.035** `No Lactose`-Claims findet die bestehende positive
  Lactose-Brücke keine passende Zutatenzeile. Das ist konsistent, beweist die
  Abwesenheit aber nicht.
* Bei den **4.792** `No Soy`-Claims gibt es **zwei Widersprüche** zu einer
  vorhandenen, positiv gematchten Zutatenzeile `Soy Lecithin`:
  DSLD 63.829 (*Ubiquinol 200 mg*) sagt im selben Formulation-Text sowohl
  `Contains: Soybeans` als auch `no Soy`; DSLD 260.885 (*Joint Aid w/ Omega
  3-6-9*) sagt `no soy`, während die Facts-Zeile `Soy Lecithin` enthält.
* Für `No Milk` gibt es keinen eigenständigen Milk-Katalogcode. Für Gluten
  gibt es in `allergen_aliases` ebenfalls keinen Supplier-Produkt-Alias;
  `allergy_search_terms` hilft nur bei der Eingabe-Suche, nicht beim
  Produktabgleich. `No Nuts` ist generisch, die vorhandenen Nuss-Aliase sind
  konkrete Zutaten wie Almond oder Walnut.

Folgerung: `Formulation` ist ein guter sichtbarer **Labelbeleg**, darf aber
ohne eigene, belegte Negativ-Claims nicht in eine automatische Entwarnung
übersetzt werden. Die zwei Widersprüche schließen eine pauschale Ableitung
aus.

## A4 – Precautions: Freitext, keine fertige Wechselwirkungslogik

Von 153.879 Precautions-Texten enthalten 58.850 `warning`, 34.293 `caution`,
100.363 einen Schwangerschaftsbezug, 64.896 einen Medikamentenbezug und
131.543 einen Kinderbezug. Die zehn Beispiele oben reichen von generischen
„consult your doctor“-Hinweisen bis zu konkreten Warnungen (Niacin-Flushing,
Nierenerkrankung, Hefeallergie). Das ist nicht ein einheitliches Schema.

`supplement_interactions` ersetzt diese Quelle nicht: Es enthält 78 aktive
Einträge für 78 Substanzen, alle vom Typ `contraindication` und mit
Evidenzstufe `low`. Die Precautions sind daher zunächst als unveränderter
Etiketttext darstellbar – nicht als automatisch ausgewertete
Wechselwirkungs- oder medizinische Aussage.

## A5 – Company Information

Die Quelltabelle hat 253.514 Zeilen für 214.776 Produkt-IDs. Vorhanden sind
`Company Name`, `Address`, `City`, `State`, `ZIP`, `Country` sowie die fünf
Rollen. Nichtleere Quellwerte:

| Feld | nichtleer | Bereits abgebildet? |
|---|---:|---|
| Company Name | 227.505 | ja, `suppliers.name` |
| Country | 81.795 | ja, `suppliers.land` |
| Manufacturer | 105.270 `Yes` | ja, `product_suppliers.rolle` |
| Distributor | 128.936 `Yes` | ja, `product_suppliers.rolle` |
| Packager | 417 `Yes` | ja, `product_suppliers.rolle` |
| Reseller | 167 `Yes` | ja, soweit Company Name vorhanden |
| Other | 26.928 `Yes` | ja, soweit Company Name vorhanden |
| Address | 109.158 | nein |
| City | 200.799 | nein |
| State | 198.922 | nein |
| ZIP | 188.290 | nein |

Die fünf importierbaren, eindeutigen Produkt–Firma–Rollen stimmen exakt mit
dem Livebestand überein: Manufacturer 104.754, Distributor 128.580,
Packager 417, Reseller 2, Other 1.865. Die Differenz zu den rohen `Yes`-
Zeilen sind Zeilen ohne Company Name (u. a. 165 Reseller und 25.063 Other).

Eine Adresse gehört jedoch nicht sicher nur zu einer Firma: In der Quelle
haben 1.443 Firmen mehrere Adressen und 100 mehrere Länder. `Address`,
`City`, `State` und `ZIP` gehören deshalb, falls übernommen, an eine
Produkt–Firma-Referenz, nicht blind als einzelne Felder an `suppliers`.
`suppliers.website` existiert, aber die Quelle enthält keine Website-Spalte
und bei DSLD-Lieferanten ist sie live leer.

## A6 – Empfehlung für Toms Entscheidung

1. **Zuerst Label Statements roh und normalisiert importieren:** eigene
   Relation `supplements.supplier_product_label_statements` mit
   `supplier_product_id`, `statement_type`, `statement_text`, `source` und
   `source_dsld_id`. Zuerst die Typen `precautions`, `formulation` und
   `product_specific_information`; der Reiter Hinweise kann sie dann
   wortgetreu zeigen. Eine Relation ist belastbarer als zehn bis elf neue
   Nullable-Spalten an `supplier_products`.
2. **Label-URL nicht doppelt speichern:** im Detail-Readmodell
   `label_url` als `https://dsld.od.nih.gov/label/` plus `dsld_id` ausgeben.
   Das ist eine Seiten-URL; der Name `label_image_path` wäre sachlich falsch.
3. **Company-Adressen nachrangig und relationell:** falls benötigt, eine
   produktbezogene Firmenadresse mit `address`, `city`, `state`,
   `postal_code`, `country` modellieren. Die Hersteller-, Distributor- und
   Packagerrolle ist bereits vollständig übernommen.
4. **Keine automatische Allergen-Entwarnung und keine Interpretation der
   Precautions.** Erst nach einer fachlich kuratierten, widerspruchsresistenten
   Negativ-Claim-Bauform darf daraus Produktlogik werden.

## A7 – Keine Umsetzung

`git status --short supabase/` enthält keine C-527-Änderung. Insbesondere
wurden weder die Quelle noch eine Migration, Pipeline, View, Funktion oder
RLS geändert.

## Abnahme

**2026-09-08, Orchestrator. Ein Messauftrag, kein Bau.**

`[cmd]` **`supabase/` unveraendert, selbst geprueft.**

### Die URL ist eine Webseite, kein Bildpfad

> *,,Alle 4.170.423 URL-Zeilen folgen exakt
`https://dsld.od.nih.gov/label/<DSLD-ID>`. Das ist eine
Label-WEBSEITE, kein Bildpfad."*

`[read]` **Toms Annahme war *,,der Pfad zu den Etiketten"*** ?
**der Reiter *,,Etikett"* aus G-492 kann damit ein Link sein,
kein Bild.** **Toms Entscheidung.**

`[cmd]` **Und das Muster haelt ueber alle Dateien** ? **also
`label_url` aus `dsld_id` berechnen, nicht importieren.**

### Formulation widerspricht sich selbst

> *,,Zwei *No Soy*-Claims widersprechen vorhandenen *Soy
Lecithin*-Zutaten."*

`[read]` **Ein Etikett, das *,,kein Soja"* sagt und Soja
enthaelt** ? **darum KEINE automatische Allergen-Entwarnung
aus Formulation.**

`[read]` **Genau die Grenze, die C-502 und C-525 gezogen
haben: lieber warnen als entwarnen.**

### Die Firmen

> *,,Firmenrollen sind bereits vollstaendig importiert;
Adresse, Stadt, Staat und Postleitzahl fehlen. Sie waeren
PRODUKT-FIRMENBEZOGEN zu modellieren, nicht direkt an der
Firma."*

### Seine Empfehlung

> *,,Statements zuerst ROH in einer eigenen Relation
importieren; `label_url` im Readmodell aus `dsld_id`
berechnen; keine automatische Allergen-Entwarnung aus
Formulation ableiten."*

**Abgenommen. Die Etikett-Frage liegt bei Tom.**

## BERICHTIGT durch C-532, 2026-09-08

`[cmd]` **Die Artenzahlen oben sind NICHT massgeblich.**

> C-532: *,,Der dortige XLSX-Analysator behandelte ausgelassene
Zwischenzellen als Spaltenverschiebung. Der C-532-Importer liest
die Tabellen korrekt."*

    Arten          11, nicht 10
                   (Formulation re: Homeopathic fehlte)
    Statements     1.467.176
    Produkte       214.759
    Dateien        11, nicht 14

`[read]` **Auch meine eigene Zaehlung (batch1) im Auftragstext
war betroffen, und die *,,14 Dateien"* waren falsch geschrieben.**

