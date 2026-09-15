---
nr: C-500
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-09-08
braucht: []
kind_von: C-496
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 68c69158
beruehrt:
  tabellen: [supplements.product_contents]
zahlen:
  gemessen: 2026-09-08
  vitamin_e_iu: 15011
---

# C-500 - die Vitamin-E-Form herausfinden

## Toms Vorgabe

Tom, 2026-09-08:

> mit recherche widerspreche ich dir, ich bin mir sicher dass
> man bei den fehlenden produkte einfach mal kurz online
> recherchieren kann, ob es nicht irgendwo doch dokumentiert
> ist, ob es natuerlich oder synthetisch ist

`[read]` **Er hat recht** ? **der Hersteller schreibt es oft auf
seine Produktseite, auch wenn das DSLD-Etikett es nicht
fuehrt.**

## Der Befund aus C-496

`[cmd]` **46.807 IU-Zeilen, davon Vitamin E 15.011.**

    natuerlich  (d-alpha-Tocopherol)    1 IU = 0,67 mg
    synthetisch (dl-alpha-Tocopherol)   1 IU = 0,45 mg

`[cmd]` **C-496 hat sie als `iu_form_required` markiert** ?
**bewusst offen gelassen.**

## Drei Wege, in dieser Reihenfolge

**1** ? **Die Zutatenzeile lesen.**

`[cmd]` **Gemessen:**

    D-Alpha-Tocopherol       75   -> natuerlich
    Vitamin E Natural       116   -> natuerlich
    Mixed Tocopherols        61   -> pruefen

`[read]` **MISS breiter:** `d-alpha`, `dl-alpha`,
`tocopheryl acetate`, `tocopheryl succinate`, `natural`,
`synthetic` **in `ingredient_name` UND in den ANDEREN Zeilen
desselben Produkts.**

`[read]` **Ein Produkt kann *,,Vitamin E 400 IU"* in der
Naehrwerttafel und *,,d-alpha tocopheryl acetate"* in der
Zutatenliste fuehren** ? **dieselbe Sache, zwei Zeilen.**

**2** ? **Online recherchieren.**

`[cmd]` **`supplier_products` traegt `gtin`, `marke`,
`name_en`** ? **genug, um ein Produkt zu finden.**

`[read]` **Fang bei den GROSSEN Marken an** ? **`NOW` hat
4.977 Produkte, `BulkSupplements` 5.595.**

`[read]` **Wenn deren Produktseite die Form nennt, sind das
tausende auf einmal.**

`[cmd]` **MISS zuerst: welche Marken haben die meisten
Vitamin-E-IU-Zeilen?**

**3** ? **Was uebrig bleibt, bleibt Luecke.**

`[read]` **Und die Luecke steht in der Sicht, wie C-496 es
gebaut hat.**

## Was zu bauen ist

`[read]` **Je Zeile die Form, mit Quelle:**

    vitamin_e_form   natuerlich | synthetisch | unbekannt
    source_id        Zutatenzeile | Herstellerseite | -
    evidence_class   A | B | C

`[cmd]` **Dieselbe Bauform wie C-490** ? **`faktor`,
`source_id`, `evidence_class`.**

## Abnahmebedingungen

    A1  wie viele lassen sich aus der Zutatenzeile
        aufloesen? Zahl.
    A2  welche Marken haben die meisten offenen
        Zeilen? TABELLE.
    A3  fuer die groessten: online recherchiert,
        je Marke die Quelle.
    A4  wie viele bleiben offen? Zahl, und die
        Luecke steht in der Sicht.
    A5  KEINE Form geraten -- wo nichts steht,
        steht "unbekannt".
    A6  Gegenprobe: eine erfundene Form faellt auf.
    A7  Sicherung, Vollkette, Punktelauf.

## Was nicht zu tun ist

**NICHT pauschal annehmen** ? **weder *,,meistens
synthetisch"* noch *,,meistens natuerlich"*.**

**Die 15.011 NICHT einzeln online nachschlagen** ? **nach
Marke buendeln.**

## Bericht

2026-09-15 — umgesetzt und in die laufende Datenbank eingespielt.

- Ausgangsmessung: 15.011 Vitamin-E-IU-Zeilen an 13.954 Produkten. Die
  Zutatenzeile loeste 1.409 Produkte eindeutig auf (`d-alpha` natuerlich,
  `dl-alpha` synthetisch); unqualifiziertes `tocopheryl acetate` bleibt
  absichtlich offen.
- Die groessten offenen Marken vor der Aufloesung waren Douglas
  Laboratories (548), NOW (424), Nature's Plus (353), Nature's Way (285)
  und Carlson (278). Online wurde markenweise, nicht zeilenweise,
  recherchiert. Fuer NOW belegen offizielle Produktseiten mit explizitem
  `d-alpha-tocopherol` die Form; 24 exakte Produktnachweise wurden
  uebernommen. Douglas-Produktunterlagen nennen zwar Formen, liessen sich
  bei den geprueften DSLD-GTINs nicht eindeutig zuordnen und wurden daher
  nicht geraten.
- `supplements.supplier_product_vitamin_e_forms` enthaelt 1.433 belegte
  Formen. 12.521 Vitamin-E-IU-Produkte bleiben offen. Die Sicht
  `produkt_naehrwerte` schreibt dafuer sichtbar
  `vitamin_e_iu_form_unknown`/`vitamin_e_form: unbekannt`, statt eine
  mg-Zahl zu erfinden.
- Belegte Formen rechnen Vitamin E wie verlangt: natuerlich mit 0,67 mg/IU,
  synthetisch mit 0,45 mg/IU. Eine erfundene oder widerspruechliche Form
  scheitert an Constraint bzw. konservativer Evidenzregel.
- `anon` hat keinen SELECT auf der Evidenztabelle; `authenticated` hat
  nur SELECT, `service_role` pflegt den Katalog.

Sicherung vor Einspielen:
`backup/schema/20260915151306_c498_c500_vor_einspielen.sql`.
Vollkette im Wegwerfstand und die C-500-Tests: gruen.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen.**

`[cmd]` **`supplements.supplier_product_vitamin_e_forms`:**

    synthetisch   846  (evidence_class A)
    natuerlich    587  (evidence_class A)
    zusammen    1.433

`[read]` **Beide Klasse A** ? **aus der Zutatenzeile oder vom
Hersteller, nichts geschaetzt.**

> *,,1.409 Formen aus Zutatenzeilen und 24 exakte
NOW-Herstellerbelege."*

`[read]` **Toms Ansage war:** *,,ich bin mir sicher, dass man
das einfach mal kurz online recherchieren kann"* ? **er hat es
getan, nach Marke gebuendelt, und 24 Produkte damit belegt.**

### Und die Luecke bleibt sichtbar

`[cmd]` **12.521 Vitamin-E-IU-Produkte ohne Form.**

> *,,bleiben korrekt als sichtbare Form-Luecke offen; keine
Schaetzung."*

`[read]` **Die Auflage war:** *,,KEINE Form raten ? weder
*meistens synthetisch* noch *meistens natuerlich*."*

`[read]` **1.433 von 13.954 sind elf Prozent** ? **und die
uebrigen 89 stehen als Luecke da, nicht als Zahl.**

**Abgenommen.**


