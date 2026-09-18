---
nr: C-509
typ: befund
modul: supplements
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: C-505
entscheidung: null
agent: codex
beauftragt: 2026-09-17
erledigt: 2026-09-08
commit: OFFEN
beruehrt:
  tabellen: [supplements.supplements]
zahlen:
  gemessen: 2026-09-17
  verknuepft: 639122
  gesamt: 3000982
---

# C-509 - der Substanzkatalog ist zu klein

## Befund

`[cmd]` **Nach C-505: 305.080 von 3.000.982 Zeilen verknuepft
(10 %).**

> *,,Nur 2.785 eindeutige, exakte Katalogtreffer wurden
nachverknuepft; keine Zuordnung geraten."*

`[read]` **Die Zurueckhaltung war richtig** ? **aber sie zeigt
das eigentliche Problem.**

`[cmd]` **`supplements.supplements`: 596 Substanzen.**
`[cmd]` **`supplement_aliases`: 2.843 Aliase.**
`[cmd]` **Eindeutige Zutaten in DSLD: rund 14.677 je
Datei.**

`[read]` **596 reichen fuer die Wirkstoffe eines
Supplementkatalogs nicht.**

## Wo die Quelle herkommen koennte

`[cmd]` **`product_content_candidates` traegt 1,7 Mio
Kandidaten (C-485)** ? **die haeufigsten sind der Anfang.**

`[read]` **Ein Stoff, der in 10.000 Produkten vorkommt, ist
wichtiger als einer in dreien.**

### Drei Wege

**a** ? **Die haeufigsten Kandidaten aufnehmen.**

`[cmd]` **MISS: wie viele Produkte deckt man mit den ersten
100, 500, 1.000 Kandidaten ab?**

**b** ? **Eine externe Quelle.**

`[read]` **Fuer Wirkstoffe: PubChem, ChEBI, die
DSLD-Kategorien selbst.**

`[read]` **Fuer Hilfsstoffe: die E-Nummern-Liste,
FDA GRAS.**

**c** ? **Die Klassifikation reicht.**

`[read]` **C-505 hat Naehrwert, Wirkstoff, Hilfsstoff,
Kandidat getrennt** ? **vielleicht braucht ein Hilfsstoff gar
keinen Katalogeintrag, sondern nur ein Etikett.**

`[cmd]` **Fuer die Allergiepruefung reicht der NAME** ?
`allergen_aliases` **arbeitet mit Text (C-498).**

## Was zuerst zu messen ist

    A  die 100 haeufigsten Kandidaten: welche sind
       Wirkstoffe, welche Hilfsstoffe?
    B  wie viele PRODUKTE deckt man damit ab?
    C  braucht ein Hilfsstoff einen Katalogeintrag,
       oder reicht das Etikett aus C-505?

`[read]` **Punkt C entscheidet, ob es 500 oder 14.000 neue
Eintraege braucht.**

## Messung 2026-09-17

**Methode.** Offen bedeutet hier: product_contents.supplement_id IS
NULL und ein nichtleerer ingredient_name. Das sind 2.361.860 von
3.000.982 Zeilen, 97.833 eindeutige Namen. Die Produktzahl zaehlt
jeweils unterschiedliche product_id, nicht Etikettzeilen.

ist_wirkstoff ist ein DSLD-Importflag, keine von uns erratene
Stoffklassifikation. Ein Name bekommt deshalb die Mehrheit seiner
Zeilen als Klasse; W und H bleiben in der Tabelle sichtbar. Das zeigt
zugleich die Grenze der Quelle: Calories, Total Carbohydrates und
Protein stehen darin als Wirkstoff, obwohl sie Naehrwertetiketten
sind. Die Liste ist eine Messgrundlage, **keine Aufnahmeliste**.

### A1 — 100 haeufigste offene Zutaten

| Zutat | Produkte | DSLD-Flag-Mehrheit (W / H Etikettzeilen) |
|---|---:|---|
| Calories | 49.708 | Wirkstoff (52.285 W / 0 H) |
| Silica | 36.960 | Hilfsstoff (1.572 W / 35.537 H) |
| Total Carbohydrates | 36.719 | Wirkstoff (40.117 W / 0 H) |
| Magnesium Stearate | 36.370 | Hilfsstoff (59 W / 36.322 H) |
| Gelatin | 35.900 | Hilfsstoff (0 W / 35.952 H) |
| Silicon Dioxide (SiO2) | 30.325 | Hilfsstoff (0 W / 30.325 H) |
| Cellulose | 29.302 | Hilfsstoff (130 W / 29.979 H) |
| Microcrystalline Cellulose | 29.227 | Hilfsstoff (108 W / 29.134 H) |
| Sodium | 25.808 | Wirkstoff (27.803 W / 5 H) |
| Total Fat | 25.668 | Wirkstoff (27.119 W / 0 H) |
| Water | 25.413 | Hilfsstoff (194 W / 25.271 H) |
| Glycerin | 25.057 | Hilfsstoff (0 W / 25.078 H) |
| Stearic Acid (C18:0) | 24.591 | Hilfsstoff (0 W / 24.591 H) |
| Pantothenic Acid | 19.798 | Wirkstoff (21.267 W / 6 H) |
| Citric Acid | 19.618 | Hilfsstoff (287 W / 19.361 H) |
| Protein | 17.615 | Wirkstoff (18.915 W / 6 H) |
| Selenium | 16.857 | Wirkstoff (17.586 W / 0 H) |
| Sugar | 16.560 | Wirkstoff (16.141 W / 2.309 H) |
| Chromium | 16.381 | Wirkstoff (17.176 W / 0 H) |
| Calories from Fat | 14.782 | Wirkstoff (15.551 W / 0 H) |
| Dietary Fiber | 14.602 | Wirkstoff (15.457 W / 10 H) |
| Saturated Fat | 13.908 | Wirkstoff (15.072 W / 0 H) |
| Cholesterol | 13.762 | Wirkstoff (14.863 W / 1 H) |
| Proprietary Blend | 12.239 | Wirkstoff (12.578 W / 1 H) |
| Maltodextrin | 12.206 | Hilfsstoff (577 W / 11.734 H) |
| Sucralose | 11.831 | Hilfsstoff (166 W / 11.675 H) |
| Magnesium Stearate (Mg Stearate) | 11.502 | Hilfsstoff (0 W / 11.502 H) |
| Rice Flour | 10.813 | Hilfsstoff (41 W / 10.773 H) |
| Vegetable Cellulose | 10.807 | Hilfsstoff (7 W / 10.800 H) |
| Total Sugars | 10.576 | Wirkstoff (11.809 W / 0 H) |
| Croscarmellose Sodium | 10.517 | Hilfsstoff (5 W / 10.513 H) |
| purified Water | 10.340 | Hilfsstoff (61 W / 10.352 H) |
| Inositol | 10.041 | Wirkstoff (10.562 W / 314 H) |
| Hypromellose | 9.919 | Hilfsstoff (2 W / 9.931 H) |
| Vegetable Magnesium Stearate | 9.020 | Hilfsstoff (2 W / 9.018 H) |
| Added Sugars | 8.271 | Wirkstoff (9.261 W / 0 H) |
| Dicalcium Phosphate | 7.939 | Hilfsstoff (90 W / 7.866 H) |
| Docosahexaenoic Acid | 7.765 | Wirkstoff (8.285 W / 4 H) |
| Phosphorus | 7.670 | Wirkstoff (8.200 W / 29 H) |
| Natural Flavors | 7.661 | Hilfsstoff (28 W / 7.646 H) |
| Trans Fat | 7.581 | Wirkstoff (8.044 W / 0 H) |
| Vegetable Glycerin | 7.338 | Hilfsstoff (55 W / 7.283 H) |
| Eicosapentaenoic Acid | 7.109 | Wirkstoff (7.546 W / 0 H) |
| Soy Lecithin | 7.105 | Hilfsstoff (755 W / 6.408 H) |
| Malic Acid | 6.857 | Hilfsstoff (624 W / 6.287 H) |
| Bromelain | 6.696 | Wirkstoff (6.448 W / 467 H) |
| Vitamin K | 6.679 | Wirkstoff (7.039 W / 4 H) |
| Lipase | 6.160 | Wirkstoff (6.321 W / 203 H) |
| Hydroxypropyl Methylcellulose | 6.159 | Hilfsstoff (7 W / 6.156 H) |
| Titanium Dioxide | 5.992 | Hilfsstoff (1 W / 6.001 H) |
| Lutein | 5.670 | Wirkstoff (5.824 W / 73 H) |
| Amylase | 5.501 | Wirkstoff (5.618 W / 177 H) |
| Protease | 5.413 | Wirkstoff (5.766 W / 418 H) |
| Xanthan Gum | 5.318 | Hilfsstoff (268 W / 5.059 H) |
| Ascorbyl Palmitate | 5.230 | Hilfsstoff (157 W / 5.074 H) |
| Sunflower Lecithin | 5.160 | Hilfsstoff (358 W / 4.859 H) |
| Purified | 5.139 | Hilfsstoff (0 W / 5.148 H) |
| Stearic Acid | 4.827 | Hilfsstoff (261 W / 4.593 H) |
| Cellulase | 4.728 | Wirkstoff (4.771 W / 84 H) |
| Acesulfame Potassium | 4.709 | Hilfsstoff (19 W / 4.691 H) |
| None | 4.539 | Hilfsstoff (0 W / 4.539 H) |
| Vanadium | 4.373 | Wirkstoff (4.441 W / 3 H) |
| Soybean Oil | 4.269 | Hilfsstoff (35 W / 4.256 H) |
| Vegetable Stearate | 4.265 | Hilfsstoff (0 W / 4.339 H) |
| Papain | 4.077 | Wirkstoff (3.849 W / 323 H) |
| Ginger | 4.071 | Wirkstoff (4.032 W / 147 H) |
| Natural and Artificial flavors | 3.816 | Hilfsstoff (17 W / 3.808 H) |
| Alpha Lipoic Acid | 3.813 | Wirkstoff (3.811 W / 66 H) |
| distilled Water | 3.793 | Hilfsstoff (86 W / 3.707 H) |
| Polyunsaturated Fat | 3.764 | Wirkstoff (3.838 W / 0 H) |
| Beeswax | 3.677 | Hilfsstoff (17 W / 3.661 H) |
| Pectin | 3.643 | Hilfsstoff (214 W / 3.432 H) |
| L-Valine | 3.579 | Wirkstoff (3.797 W / 65 H) |
| Mixed Tocopherols | 3.557 | Hilfsstoff (786 W / 2.800 H) |
| L-Isoleucine | 3.512 | Wirkstoff (3.711 W / 68 H) |
| Calcium Carbonate (Ca Carbonate; CaCO3) | 3.511 | Hilfsstoff (0 W / 3.511 H) |
| Lactase | 3.443 | Wirkstoff (3.314 W / 318 H) |
| Sorbitol | 3.417 | Hilfsstoff (38 W / 3.380 H) |
| Caffeine Anhydrous | 3.359 | Wirkstoff (3.695 W / 42 H) |
| Rutin | 3.344 | Wirkstoff (3.232 W / 149 H) |
| Xylitol | 3.344 | Hilfsstoff (619 W / 2.874 H) |
| Fructose | 3.335 | Hilfsstoff (52 W / 3.286 H) |
| Lactobacillus acidophilus | 3.297 | Wirkstoff (3.255 W / 158 H) |
| Guar Gum | 3.206 | Hilfsstoff (370 W / 2.854 H) |
| Medium Chain Triglycerides | 3.137 | Hilfsstoff (505 W / 2.648 H) |
| Sunflower Oil | 3.126 | Hilfsstoff (215 W / 2.969 H) |
| Alcohol | 3.051 | Hilfsstoff (33 W / 3.020 H) |
| Vitamin B2 | 3.035 | Wirkstoff (3.151 W / 26 H) |
| Calcium Silicate | 3.029 | Hilfsstoff (14 W / 3.015 H) |
| Total Omega-3 Fatty Acids | 2.920 | Wirkstoff (3.177 W / 0 H) |
| Potassium Sorbate | 2.890 | Hilfsstoff (47 W / 2.843 H) |
| Coenzyme Q10 | 2.868 | Wirkstoff (2.865 W / 39 H) |
| Powder | 2.856 | Hilfsstoff (0 W / 4.513 H) |
| Caffeine | 2.855 | Wirkstoff (3.174 W / 91 H) |
| PABA | 2.854 | Wirkstoff (2.958 W / 42 H) |
| Turmeric | 2.852 | Wirkstoff (2.356 W / 656 H) |
| Natural flavors | 2.843 | Hilfsstoff (9 W / 2.837 H) |
| Lecithin | 2.840 | Hilfsstoff (914 W / 1.998 H) |
| Chloride | 2.829 | Wirkstoff (2.906 W / 6 H) |
| Zeaxanthin | 2.748 | Wirkstoff (2.838 W / 10 H) |

### A2 — vorhandene exakte Ziele, ohne Fuzzy-Match

Stichtag: 596 supplements, 2.845 supplement_aliases und 1.541
substance_aliases. Fuer diese Abnahme wurde ausschliesslich gegen
supplements und supplement_aliases geprueft: getrimmte,
kleingeschriebene Gleichheit gegen name_de, name_en, name_th
beziehungsweise alias. Kein Name wurde angenaehert zugeordnet.

| DSLD-Flag-Mehrheit | Top-100-Namen | exakter Katalogtreffer | exakter Alias-Treffer | irgendein Treffer | Produktvorkommen der Treffer* |
|---|---:|---:|---:|---:|---:|
| Hilfsstoff | 53 | 0 | 2 | 2 | 60.957 |
| Wirkstoff | 47 | 2 | 2 | 2 | 19.712 |

*Summe der Produktvorkommen je Name, nicht entdoppelt ueber Namen.
Die vier Namen sind: **Gelatin** und **Glycerin** (nur Alias),
**Selenium** und **Caffeine** (Katalog und Alias). Sie sind trotz
exakter Ziele weiterhin offen; der Messauftrag beweist damit eine
bestehende Nachverknuepfungsluecke, behebt sie aber nicht.

### A3 — Reichweite einer moeglichen Aufnahme

| neue, haeufigste offene Namen | unterschiedliche Produkte mit mindestens einem solchen Namen |
|---:|---:|
| 100 | 190.955 |
| 500 | 202.589 |
| 1.000 | 205.146 |

Die Zahl ist Reichweite, falls jeder dieser Namen spaeter als eigenes
Ziel aufgenommen und exakt verknuepft wuerde. Sie ist keine Zusage,
dass diese Aufnahme fachlich richtig waere.

### A4 — Hilfsstoffkatalog fuer Allergien nicht nachgewiesen noetig

public.user_allergy_catalog_matches vergleicht direkt
nutrition.search_fold(product_contents.ingredient_name) mit
nutrition.search_fold(allergen_aliases.alias_text). Der SQL-Weg hat
**keine** Bedingung auf supplement_id; ein unverknoepfter Hilfsstoff
wird somit gleich behandelt wie ein verknoepfter.

| Textalias fuer supplements:magnesium_stearate | Produkte | davon ohne supplement_id |
|---|---:|---:|
| Magnesium Stearate | 36.411 | 36.411 |
| Magnesium Stearate (Mg Stearate) | 11.502 | 11.502 |
| Vegetable Magnesium Stearate | 9.024 | 9.024 |

Zusammen liefern diese drei Aliasformen fuer dev@lumeos.app **56.934
unterschiedliche Produkte** als Allergietreffer. Unter den 100
haeufigsten Hilfsstoff-Mehrheiten einer separaten Hilfsstoffrangliste
sind vier bereits als Textalias vorhanden: die drei Magnesium-
Stearate-Formen sowie **Soy Lecithin** (nutrition:contains_soy),
zusammen 63.296 Produktvorkommen. Text reicht damit fuer die
Allergiepruefung nachweislich aus; ein Katalogeintrag wuerde diese
Funktion nicht zusaetzlich freischalten.

### A5 — Entscheidungsvorlage fuer Tom, keine Umsetzung

**Empfehlung:** Den Katalogumfang nicht aus der Top-N-Liste allein
entscheiden. Die ersten 100 decken zwar 190.955 Produkte ab, mischen
aber 47 Wirkstoff-Mehrheiten, 53 Hilfsstoff-Mehrheiten,
Naehrwertetiketten und Importartefakte (None, Purified, Powder).
Eine pauschale Aufnahme waere daher eine Zuordnung geraten.

Tom entscheidet zwischen diesen getrennten Zielen:

1. **Wirkstoff-Katalog ausbauen:** nur fachlich kuratierte
   Wirkstoffkandidaten aufnehmen; Hilfsstoffe bleiben Etiketttext.
2. **Detailanzeige vereinheitlichen:** auch Hilfsstoffe katalogisieren;
   das ist ein eigener, deutlich groesserer Kurationauftrag.
3. **Allergiepruefung:** kein Hilfsstoffkatalog erforderlich; Aliase
   gezielt nach belegtem Textbestand pflegen.

Es wurde nichts am Katalog, an Aliasen oder an Verknuepfungen
geaendert und keine Zuordnung geraten.

## Abnahme

**2026-09-08, Orchestrator. Nachgemessen ? ein Messauftrag,
kein Bauauftrag.**

    verknuepft        639.122 von 3.000.982
    offene Roh-Namen   97.833

`[cmd]` **Die zehn haeufigsten offenen, selbst gemessen:**

    Calories                     49.708
    Silica                       36.960
    Total Carbohydrates          36.719
    Magnesium Stearate           36.370
    Gelatin                      35.900
    Silicon Dioxide (SiO2)       30.325
    Cellulose                    29.302
    Microcrystalline Cellulose   29.227
    Sodium                       25.808
    Total Fat                    25.668

`[read]` **Und genau das ist sein Punkt:** `Calories`,
`Total Carbohydrates`, `Total Fat` **sind NAEHRWERTETIKETTEN,
keine Substanzen.**

> *,,Top-N blind aufzunehmen waere geraten."*

### Die Reichweite faellt steil ab

     100 Namen  ->  190.955 Produkte
     500 Namen  ->  202.589
    1.000 Namen ->  205.146

`[read]` **Die ersten 100 bringen 93 Prozent dessen, was 1.000
braechten** ? **das ist die Zahl, die die Entscheidung
traegt.**

### Punkt C ist beantwortet

> *,,Die drei Magnesium-Stearat-Textaliase treffen 56.934
Produkte, saemtlich OHNE `supplement_id`."*

`[cmd]` **Selbst nachgemessen: 60.994 Produkte enthalten
Magnesiumstearat, davon 0 mit `supplement_id`.**

`[read]` **Die Allergiepruefung schuetzt bereits ? ohne dass
der Stoff im Katalog steht.**

`[read]` **Damit ist die Frage *,,500 oder 14.000 neue
Eintraege?"* beantwortet: KEINE fuer den Schutz.**

### Eine Nebenentdeckung

> *,,Exakte bestehende Ziele unter den Top 100: nur `Gelatin`,
`Glycerin`, `Selenium` und `Caffeine`. Das belegt zusaetzlich
eine NACHVERKNUEPFUNGSLUECKE, wurde aber nicht veraendert."*

`[read]` **Vier Stoffe stehen im Katalog und sind trotzdem
nicht verknuepft** ? **`Gelatin` allein in 35.900 Produkten.**

`[cmd]` **Als C-514.**

### Seine Empfehlung

> *,,Wirkstoffe fachlich kuratieren; Hilfsstoffe fuer Allergien
als belegte Textaliase belassen. Eine Vollkatalogisierung der
Hilfsstoffe waere ein separater Anzeige-/Kurationsauftrag,
nicht Voraussetzung fuer Schutz durch Allergiepruefung."*

`[read]` **Er hat gemessen und empfohlen, nicht gebaut** ?
**die Auflage.**

**Abgenommen. Die Entscheidung liegt bei Tom.**
