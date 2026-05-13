# P1-005 Nutrient Definitions Seed Candidate

Status: REVIEW_ONLY_SEED_CANDIDATE

## Purpose

This artifact captures a deterministic review-only candidate for `nutrition.nutrient_defs` seed rows. It is generated from the approved SPEC_06 source text and is not executable.

## Scope

- Review-only seed candidate for `nutrition.nutrient_defs`.
- Exactly 16 candidate columns are emitted.
- `name_th` and `group_th` are intentionally empty strings because Thai translation seed work has not been opened.
- RDA fields are copied only from explicit `UPDATE nutrition.nutrient_defs` examples in the same source file; rows without explicit updates keep empty RDA fields.

## Source refs

- Seed rows: `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md:67-256`
- RDA example updates: `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md:270-295`

## Expected row count

Expected row count: 138
Extracted row count: 138
RDA update rows merged: 26

## Review-only seed candidate table

| code | name_de | name_en | name_th | unit | group_de | group_en | group_th | sort_index | display_tier | is_always_computed | is_partly_computed | formula | rda_male | rda_female | rda_unit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ENERCJ | Energie (Kilojoule) | Energy (kilojoule) |  | kJ | Energie | Energy |  | 1 | 1 | true | false | PROT625*17 + (CHO-POLYL)*17 + FAT*37 + ALC*29 + OA*13 + POLYL*10 + OLSAC*8 + FIBT*8 |  |  |  |
| ENERCC | Energie (Kilokalorien) | Energy (kilocalorie) |  | kcal | Energie | Energy |  | 2 | 1 | true | false | PROT625*4 + (CHO-POLYL)*4 + FAT*9 + ALC*7 + OA*3 + POLYL*2.4 + OLSAC*2 + FIBT*2 | 2800 | 2100 | kcal |
| WATER | Wasser | Water |  | g | Makronährstoffe | Proximate |  | 3 | 1 | false | false | NULL |  |  |  |
| PROT625 | Protein (Nx6,25) | Protein (Nx6.25) |  | g | Makronährstoffe | Proximate |  | 4 | 1 | false | true | PROT625=NT*6.25 | 56 | 46 | g |
| FAT | Fett | Fat |  | g | Makronährstoffe | Proximate |  | 5 | 1 | false | false | NULL |  |  |  |
| CHO | Kohlenhydrate, verfügbar | Carbohydrate, available |  | g | Makronährstoffe | Proximate |  | 6 | 1 | true | false | SUGAR+STARCH+OLSAC+POLYL |  |  |  |
| FIBT | Ballaststoffe, gesamt | Fibre, dietary, total |  | g | Makronährstoffe | Proximate |  | 7 | 1 | false | true | FIBHMW+FIBLMW | 30 | 30 | g |
| ALC | Alkohol (Ethanol) | Alcohol (Ethanol) |  | g | Makronährstoffe | Proximate |  | 8 | 1 | false | false | NULL |  |  |  |
| OA | Organische Säuren, gesamt | Organic acids, total |  | g | Makronährstoffe | Proximate |  | 9 | 2 | false | true | MALAC+ACEAC+LACAC+TARAC+CITAC |  |  |  |
| ASH | Rohasche | Ash |  | g | Makronährstoffe | Proximate |  | 10 | 2 | false | false | NULL |  |  |  |
| VITA | Vitamin A, Retinol-Äquivalent (RE) | Vitamin A, Retinol equivalent (RE) |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 11 | 1 | false | true | RETOL + 1/6*CARTB + 1/12*CAROTPAXB | 900 | 700 | µg |
| VITAA | Vitamin A, Retinol-Aktivitäts-Äquivalent (RAE) | Vitamin A, Retinol activity equivalent (RAE) |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 12 | 2 | false | true | RETOL + 1/12*CARTB + 1/24*CAROTPAXB |  |  |  |
| RETOL | Retinol | Retinol |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 13 | 2 | false | false | NULL |  |  |  |
| CARTB | Beta-Carotin | Beta-carotene |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 14 | 2 | false | false | NULL |  |  |  |
| CAROTPAXB | Carotinoide, außer Beta-Carotin | Carotenoids, except beta-carotene |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 15 | 3 | false | false | NULL |  |  |  |
| VITD | Vitamin D | Vitamin D |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 16 | 1 | false | true | ERGCAL+CHOCAL | 20 | 20 | µg |
| CHOCAL | Vitamin D3 (Cholecalciferol) | Vitamin D3 (cholecalciferol) |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 17 | 2 | false | false | NULL |  |  |  |
| ERGCAL | Vitamin D2 (Ergocalciferol) | Vitamin D2 (ergocalciferol) |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 18 | 2 | false | false | NULL |  |  |  |
| VITE | Vitamin E (Alpha-Tocopherol) | Vitamin E (alpha-tocopherol) |  | mg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 19 | 1 | false | false | NULL | 15 | 12 | mg |
| TOCPHA | Alpha-Tocopherol | Alpha-tocopherol |  | mg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 20 | 2 | false | false | NULL |  |  |  |
| TOCPHB | Beta-Tocopherol | Beta-tocopherol |  | mg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 21 | 3 | false | false | NULL |  |  |  |
| TOCPHG | Gamma-Tocopherol | Gamma-tocopherol |  | mg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 22 | 3 | false | false | NULL |  |  |  |
| TOCPHD | Delta-Tocopherol | Delta-tocopherol |  | mg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 23 | 3 | false | false | NULL |  |  |  |
| TOCTRA | Alpha-Tocotrienol | Alpha-tocotrienol |  | mg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 24 | 3 | false | false | NULL |  |  |  |
| VITK | Vitamin K | Vitamin K |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 25 | 1 | false | true | VITK1+VITK2 | 70 | 60 | µg |
| VITK1 | Vitamin K1 (Phyllochinon) | Vitamin K1 (phylloquinone) |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 26 | 2 | false | false | NULL |  |  |  |
| VITK2 | Vitamin K2 (Menachinone) | Vitamin K2 (menaquinone) |  | µg | Fettlösliche Vitamine | Fat-soluble vitamins |  | 27 | 2 | false | false | NULL |  |  |  |
| THIA | Vitamin B1 (Thiamin) | Vitamin B1 (thiamin) |  | mg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 28 | 1 | false | false | NULL | 1.3 | 1.0 | mg |
| RIBF | Vitamin B2 (Riboflavin) | Vitamin B2 (riboflavin) |  | mg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 29 | 1 | false | false | NULL | 1.5 | 1.2 | mg |
| NIAEQ | Niacin-Äquivalent | Niacin equivalent |  | mg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 30 | 2 | true | false | NIA+TRP*1000/60 |  |  |  |
| NIA | Niacin | Niacin |  | mg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 31 | 1 | false | false | NULL | 16 | 13 | mg |
| PANTAC | Pantothensäure | Pantothenic acid |  | mg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 32 | 2 | false | false | NULL | 1.5 | 1.2 | mg |
| VITB6 | Vitamin B6 | Vitamin B6 |  | µg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 33 | 1 | false | false | NULL | 1.5 | 1.2 | mg |
| BIOT | Biotin | Biotin |  | µg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 34 | 2 | false | false | NULL | 40 | 40 | µg |
| FOL | Folat-Äquivalent | Folate equivalent |  | µg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 35 | 1 | true | false | FOLFD+1.7*FOLAC | 320 | 300 | µg |
| FOLFD | Folat | Folate |  | µg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 36 | 2 | false | false | NULL |  |  |  |
| FOLAC | Folsäure, synthetisch | Folic acid, synthetic |  | µg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 37 | 2 | false | false | NULL |  |  |  |
| VITB12 | Vitamin B12 (Cobalamine) | Vitamin B12 (cobalamin) |  | µg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 38 | 1 | false | false | NULL | 4.0 | 4.0 | µg |
| VITC | Vitamin C | Vitamin C |  | mg | Wasserlösliche Vitamine | Water-soluble vitamins |  | 39 | 1 | false | false | NULL | 110 | 95 | mg |
| NACL | Salz (Natriumchlorid) | Salt (sodium chloride) |  | g | Elemente | Elements |  | 40 | 1 | true | false | NA*2.5 |  |  |  |
| NA | Natrium | Sodium |  | mg | Elemente | Elements |  | 41 | 1 | false | false | NULL | 1500 | 1500 | mg |
| CLD | Chlorid | Chloride |  | mg | Elemente | Elements |  | 42 | 2 | false | false | NULL |  |  |  |
| K | Kalium | Potassium |  | mg | Elemente | Elements |  | 43 | 1 | false | false | NULL | 4000 | 4000 | mg |
| CA | Calcium | Calcium |  | mg | Elemente | Elements |  | 44 | 1 | false | false | NULL | 1000 | 1000 | mg |
| MG | Magnesium | Magnesium |  | mg | Elemente | Elements |  | 45 | 1 | false | false | NULL | 350 | 300 | mg |
| P | Phosphor | Phosphorus |  | mg | Elemente | Elements |  | 46 | 1 | false | false | NULL | 700 | 700 | mg |
| S | Schwefel | Sulfur |  | mg | Elemente | Elements |  | 47 | 3 | false | false | NULL |  |  |  |
| FE | Eisen | Iron |  | mg | Elemente | Elements |  | 48 | 1 | false | false | NULL | 10 | 15 | mg |
| ZN | Zink | Zinc |  | mg | Elemente | Elements |  | 49 | 1 | false | false | NULL | 10 | 7 | mg |
| ID | Iodid | Iodide |  | µg | Elemente | Elements |  | 50 | 1 | false | false | NULL | 200 | 200 | µg |
| CU | Kupfer | Copper |  | µg | Elemente | Elements |  | 51 | 2 | false | false | NULL | 1500 | 1200 | µg |
| MN | Mangan | Manganese |  | µg | Elemente | Elements |  | 52 | 2 | false | false | NULL | 3500 | 3500 | µg |
| FD | Fluorid | Fluoride |  | µg | Elemente | Elements |  | 53 | 3 | false | false | NULL |  |  |  |
| CR | Chrom | Chromium |  | µg | Elemente | Elements |  | 54 | 3 | false | false | NULL |  |  |  |
| MO | Molybdän | Molybdenum |  | µg | Elemente | Elements |  | 55 | 3 | false | false | NULL |  |  |  |
| ACEAC | Essigsäure | Acetic acid |  | g | Organische Säuren | Organic acids |  | 56 | 3 | false | false | NULL |  |  |  |
| CITAC | Zitronensäure | Citric acid |  | g | Organische Säuren | Organic acids |  | 57 | 3 | false | false | NULL |  |  |  |
| LACAC | Milchsäure | Lactic acid |  | g | Organische Säuren | Organic acids |  | 58 | 3 | false | false | NULL |  |  |  |
| MALAC | Äpfelsäure | Malic acid |  | g | Organische Säuren | Organic acids |  | 59 | 3 | false | false | NULL |  |  |  |
| TARAC | Weinsäure | Tartaric acid |  | g | Organische Säuren | Organic acids |  | 60 | 3 | false | false | NULL |  |  |  |
| POLYL | Zuckeralkohole, gesamt | Sugar alcohols, total |  | g | Makronährstoffe | Proximate |  | 61 | 2 | true | false | MANTL+SORTL+XYLTL |  |  |  |
| MANTL | Mannit | Mannitol |  | g | Zuckeralkohole | Sugar alcohols |  | 62 | 3 | false | false | NULL |  |  |  |
| SORTL | Sorbit | Sorbitol |  | g | Zuckeralkohole | Sugar alcohols |  | 63 | 3 | false | false | NULL |  |  |  |
| XYLTL | Xylit | Xylitol |  | g | Zuckeralkohole | Sugar alcohols |  | 64 | 3 | false | false | NULL |  |  |  |
| MNSAC | Monosaccharide, gesamt | Monosaccharides, total |  | g | Kohlenhydrate | Carbohydrates |  | 65 | 2 | true | false | GLUS+FRUS+GALS |  |  |  |
| GLUS | Glucose | Glucose |  | g | Kohlenhydrate | Carbohydrates |  | 66 | 2 | false | false | NULL |  |  |  |
| FRUS | Fructose | Fructose |  | g | Kohlenhydrate | Carbohydrates |  | 67 | 2 | false | false | NULL |  |  |  |
| GALS | Galactose | Galactose |  | g | Kohlenhydrate | Carbohydrates |  | 68 | 3 | false | false | NULL |  |  |  |
| DISAC | Disaccharide, gesamt | Disaccharides, total |  | g | Kohlenhydrate | Carbohydrates |  | 69 | 2 | true | false | SUCS+MALS+LACS |  |  |  |
| SUCS | Saccharose | Sucrose |  | g | Kohlenhydrate | Carbohydrates |  | 70 | 2 | false | false | NULL |  |  |  |
| MALS | Maltose | Maltose |  | g | Kohlenhydrate | Carbohydrates |  | 71 | 3 | false | false | NULL |  |  |  |
| LACS | Lactose | Lactose |  | g | Kohlenhydrate | Carbohydrates |  | 72 | 2 | false | false | NULL |  |  |  |
| SUGAR | Zucker, gesamt | Sugars, total |  | g | Kohlenhydrate | Carbohydrates |  | 73 | 1 | true | false | GLUS+FRUS+GALS+SUCS+MALS+LACS |  |  |  |
| OLSAC | Oligosaccharide, verfügbar | Oligosaccharides, available |  | g | Kohlenhydrate | Carbohydrates |  | 74 | 3 | false | false | NULL |  |  |  |
| STARCH | Stärke | Starch |  | g | Kohlenhydrate | Carbohydrates |  | 75 | 2 | false | false | NULL |  |  |  |
| FIBLMW | Ballaststoffe, niedermolekular | Fibre, low molecular weight |  | g | Ballaststoffe | Dietary fibres |  | 76 | 3 | false | false | NULL |  |  |  |
| FIBHMW | Ballaststoffe, hochmolekular | Fibre, high molecular weight |  | g | Ballaststoffe | Dietary fibres |  | 77 | 3 | false | true | FIBHMWS+FIBHMWI |  |  |  |
| FIBINS | Ballaststoffe, wasserunlöslich | Fibre, water insoluble |  | g | Ballaststoffe | Dietary fibres |  | 78 | 3 | false | false | NULL |  |  |  |
| FIBSOL | Ballaststoffe, wasserlöslich | Fibre, water soluble |  | g | Ballaststoffe | Dietary fibres |  | 79 | 3 | false | false | NULL |  |  |  |
| FIBHMWS | Ballaststoffe, hochmolekular, wasserlöslich | Fibre, HMW, water soluble |  | g | Ballaststoffe | Dietary fibres |  | 80 | 3 | false | false | NULL |  |  |  |
| FIBHMWI | Ballaststoffe, hochmolekular, wasserunlöslich | Fibre, HMW, water insoluble |  | g | Ballaststoffe | Dietary fibres |  | 81 | 3 | false | false | NULL |  |  |  |
| FASAT | Fettsäuren, gesättigt, gesamt | Fatty acids, saturated, total |  | g | Fettsäuren | Fatty acids |  | 82 | 1 | true | false | F4:0+F6:0+F8:0+F10:0+F12:0+F14:0+F15:0+F16:0+F17:0+F18:0+F20:0+F22:0+F24:0 |  |  |  |
| FAMS | Fettsäuren, einfach ungesättigt, gesamt | Fatty acids, monounsaturated, total |  | g | Fettsäuren | Fatty acids |  | 96 | 2 | true | false | F14:1CN5+F16:1CN7+F18:1CN7+F18:1CN9+F20:1CN9+F22:1CN9 |  |  |  |
| FAPU | Fettsäuren, mehrfach ungesättigt, gesamt | Fatty acids, polyunsaturated, total |  | g | Fettsäuren | Fatty acids |  | 103 | 2 | true | false | F18:2C9T11+F18:2CN6+F20:2CN6+F18:3CN3+F18:3CN6+F20:3CN6+F18:4CN3+F20:4CN6+F20:5CN3+F22:5CN3+F22:6CN3 |  |  |  |
| FAPUN3 | Omega-3-Fettsäuren, gesamt | Fatty acids, n-3, total |  | g | Fettsäuren | Fatty acids |  | 104 | 2 | true | false | F18:3CN3+F18:4CN3+F20:5CN3+F22:5CN3+F22:6CN3 |  |  |  |
| FAPUN6 | Omega-6-Fettsäuren, gesamt | Fatty acids, n-6, total |  | g | Fettsäuren | Fatty acids |  | 110 | 2 | true | false | F18:2CN6+F18:3CN6+F20:2CN6+F20:3CN6+F20:4CN6 |  |  |  |
| F4:0 | Fettsäure C4:0 (Buttersäure) | Fatty acid C4:0 (butyric acid) |  | g | Fettsäuren | Fatty acids |  | 83 | 3 | false | false | NULL |  |  |  |
| F6:0 | Fettsäure C6:0 (Capronsäure) | Fatty acid C6:0 (caproic acid) |  | g | Fettsäuren | Fatty acids |  | 84 | 3 | false | false | NULL |  |  |  |
| F8:0 | Fettsäure C8:0 (Caprylsäure) | Fatty acid C8:0 (caprylic acid) |  | g | Fettsäuren | Fatty acids |  | 85 | 3 | false | false | NULL |  |  |  |
| F10:0 | Fettsäure C10:0 (Caprinsäure) | Fatty acid C10:0 (capric acid) |  | g | Fettsäuren | Fatty acids |  | 86 | 3 | false | false | NULL |  |  |  |
| F12:0 | Fettsäure C12:0 (Laurinsäure) | Fatty acid C12:0 (lauric acid) |  | g | Fettsäuren | Fatty acids |  | 87 | 3 | false | false | NULL |  |  |  |
| F14:0 | Fettsäure C14:0 (Myristinsäure) | Fatty acid C14:0 (myristic acid) |  | g | Fettsäuren | Fatty acids |  | 88 | 3 | false | false | NULL |  |  |  |
| F15:0 | Fettsäure C15:0 (Pentadecylsäure) | Fatty acid C15:0 (pentadecanoic acid) |  | g | Fettsäuren | Fatty acids |  | 89 | 3 | false | false | NULL |  |  |  |
| F16:0 | Fettsäure C16:0 (Palmitinsäure) | Fatty acid C16:0 (palmitic acid) |  | g | Fettsäuren | Fatty acids |  | 90 | 2 | false | false | NULL |  |  |  |
| F17:0 | Fettsäure C17:0 (Margarinsäure) | Fatty acid C17:0 (margaric acid) |  | g | Fettsäuren | Fatty acids |  | 91 | 3 | false | false | NULL |  |  |  |
| F18:0 | Fettsäure C18:0 (Stearinsäure) | Fatty acid C18:0 (stearic acid) |  | g | Fettsäuren | Fatty acids |  | 92 | 3 | false | false | NULL |  |  |  |
| F20:0 | Fettsäure C20:0 (Arachinsäure) | Fatty acid C20:0 (arachidic acid) |  | g | Fettsäuren | Fatty acids |  | 93 | 3 | false | false | NULL |  |  |  |
| F22:0 | Fettsäure C22:0 (Behensäure) | Fatty acid C22:0 (behenic acid) |  | g | Fettsäuren | Fatty acids |  | 94 | 3 | false | false | NULL |  |  |  |
| F24:0 | Fettsäure C24:0 (Lignocerinsäure) | Fatty acid C24:0 (lignoceric acid) |  | g | Fettsäuren | Fatty acids |  | 95 | 3 | false | false | NULL |  |  |  |
| F14:1CN5 | Fettsäure C14:1 n-5 cis (Myristoleinsäure) | Fatty acid C14:1 n-5 (myristoleic acid) |  | g | Fettsäuren | Fatty acids |  | 97 | 3 | false | false | NULL |  |  |  |
| F16:1CN7 | Fettsäure C16:1 n-7 cis (Palmitoleinsäure) | Fatty acid C16:1 n-7 (palmitoleic acid) |  | g | Fettsäuren | Fatty acids |  | 98 | 3 | false | false | NULL |  |  |  |
| F18:1CN7 | Fettsäure C18:1 n-7 cis (Vaccensäure) | Fatty acid C18:1 n-7 (vaccenic acid) |  | g | Fettsäuren | Fatty acids |  | 99 | 3 | false | false | NULL |  |  |  |
| F18:1CN9 | Fettsäure C18:1 n-9 cis (Ölsäure) | Fatty acid C18:1 n-9 (oleic acid) |  | g | Fettsäuren | Fatty acids |  | 100 | 2 | false | false | NULL |  |  |  |
| F20:1CN9 | Fettsäure C20:1 n-9 cis (Gondosäure) | Fatty acid C20:1 n-9 (gondoic acid) |  | g | Fettsäuren | Fatty acids |  | 101 | 3 | false | false | NULL |  |  |  |
| F22:1CN9 | Fettsäure C22:1 n-9 cis (Erucasäure) | Fatty acid C22:1 n-9 (erucic acid) |  | g | Fettsäuren | Fatty acids |  | 102 | 3 | false | false | NULL |  |  |  |
| F18:2CN6 | Fettsäure C18:2 n-6 cis (Linolsäure) | Fatty acid C18:2 n-6 (linoleic acid) |  | g | Fettsäuren | Fatty acids |  | 111 | 2 | false | false | NULL |  |  |  |
| F18:2C9T11 | Fettsäure C18:2 n-7 cis 9, trans 11 (konjugierte Linolsäure) | Fatty acid C18:2 n-7 c9,t11 (conjugated linoleic acid) |  | g | Fettsäuren | Fatty acids |  | 112 | 3 | false | false | NULL |  |  |  |
| F18:3CN3 | Fettsäure C18:3 n-3 all-cis (Alpha-Linolensäure) | Fatty acid C18:3 n-3 (alpha-linolenic acid, ALA) |  | g | Fettsäuren | Fatty acids |  | 105 | 2 | false | false | NULL |  |  |  |
| F18:3CN6 | Fettsäure C18:3 n-6 all-cis (Gamma-Linolensäure) | Fatty acid C18:3 n-6 (gamma-linolenic acid) |  | g | Fettsäuren | Fatty acids |  | 113 | 3 | false | false | NULL |  |  |  |
| F18:4CN3 | Fettsäure C18:4 n-3 all-cis (Stearidonsäure) | Fatty acid C18:4 n-3 (stearidonic acid) |  | g | Fettsäuren | Fatty acids |  | 106 | 3 | false | false | NULL |  |  |  |
| F20:2CN6 | Fettsäure C20:2 n-6 all-cis (Eicosadiensäure) | Fatty acid C20:2 n-6 (eicosadienoic acid) |  | g | Fettsäuren | Fatty acids |  | 114 | 3 | false | false | NULL |  |  |  |
| F20:3CN6 | Fettsäure C20:3 n-6 all-cis (Dihomogamma-Linolensäure) | Fatty acid C20:3 n-6 (dihomo-gamma-linolenic acid) |  | g | Fettsäuren | Fatty acids |  | 115 | 3 | false | false | NULL |  |  |  |
| F20:4CN6 | Fettsäure C20:4 n-6 all-cis (Arachidonsäure) | Fatty acid C20:4 n-6 (arachidonic acid) |  | g | Fettsäuren | Fatty acids |  | 116 | 2 | false | false | NULL |  |  |  |
| F20:5CN3 | Fettsäure C20:5 n-3 all-cis (Eicosapentaensäure, EPA) | Fatty acid C20:5 n-3 (eicosapentaenoic acid, EPA) |  | g | Fettsäuren | Fatty acids |  | 107 | 2 | false | false | NULL |  |  |  |
| F22:5CN3 | Fettsäure C22:5 n-3 all-cis (Docosapentaensäure) | Fatty acid C22:5 n-3 (docosapentaenoic acid) |  | g | Fettsäuren | Fatty acids |  | 108 | 3 | false | false | NULL |  |  |  |
| F22:6CN3 | Fettsäure C22:6 n-3 all-cis (Docosahexaensäure, DHA) | Fatty acid C22:6 n-3 (docosahexaenoic acid, DHA) |  | g | Fettsäuren | Fatty acids |  | 109 | 2 | false | false | NULL |  |  |  |
| FAX | Fettsäuren, sonstige | Fatty acids, other |  | g | Fettsäuren | Fatty acids |  | 117 | 3 | false | false | NULL |  |  |  |
| CHORL | Cholesterin | Cholesterol |  | mg | Sonstige Nährstoffe | Other nutrients |  | 118 | 1 | false | false | NULL |  |  |  |
| AAE9 | Aminosäuren, unentbehrlich, gesamt | Amino acids, essential, total |  | g | Aminosäuren | Amino acids |  | 119 | 2 | true | false | ILE+LEU+LYS+MET+PHE+THR+TRP+VAL+HIS |  |  |  |
| ALA | Alanin | Alanine |  | g | Aminosäuren | Amino acids |  | 120 | 3 | false | false | NULL |  |  |  |
| ARG | Arginin | Arginine |  | g | Aminosäuren | Amino acids |  | 121 | 3 | false | false | NULL |  |  |  |
| ASP | Asparaginsäure, inklusive Asparagin | Aspartic acid, incl. asparagine |  | g | Aminosäuren | Amino acids |  | 122 | 3 | false | false | NULL |  |  |  |
| CYSTE | Cystein | Cysteine |  | g | Aminosäuren | Amino acids |  | 123 | 3 | false | false | NULL |  |  |  |
| GLU | Glutaminsäure, inklusive Glutamin | Glutamic acid, incl. glutamine |  | g | Aminosäuren | Amino acids |  | 124 | 3 | false | false | NULL |  |  |  |
| GLY | Glycin | Glycine |  | g | Aminosäuren | Amino acids |  | 125 | 3 | false | false | NULL |  |  |  |
| HIS | Histidin | Histidine |  | g | Aminosäuren | Amino acids |  | 126 | 2 | false | false | NULL |  |  |  |
| ILE | Isoleucin | Isoleucine |  | g | Aminosäuren | Amino acids |  | 127 | 2 | false | false | NULL |  |  |  |
| LEU | Leucin | Leucine |  | g | Aminosäuren | Amino acids |  | 128 | 2 | false | false | NULL |  |  |  |
| LYS | Lysin | Lysine |  | g | Aminosäuren | Amino acids |  | 129 | 2 | false | false | NULL |  |  |  |
| MET | Methionin | Methionine |  | g | Aminosäuren | Amino acids |  | 130 | 2 | false | false | NULL |  |  |  |
| PHE | Phenylalanin | Phenylalanine |  | g | Aminosäuren | Amino acids |  | 131 | 2 | false | false | NULL |  |  |  |
| PRO | Prolin | Proline |  | g | Aminosäuren | Amino acids |  | 132 | 3 | false | false | NULL |  |  |  |
| SER | Serin | Serine |  | g | Aminosäuren | Amino acids |  | 133 | 3 | false | false | NULL |  |  |  |
| THR | Threonin | Threonine |  | g | Aminosäuren | Amino acids |  | 134 | 2 | false | false | NULL |  |  |  |
| TRP | Tryptophan | Tryptophan |  | g | Aminosäuren | Amino acids |  | 135 | 2 | false | false | NULL |  |  |  |
| TYR | Tyrosin | Tyrosine |  | g | Aminosäuren | Amino acids |  | 136 | 3 | false | false | NULL |  |  |  |
| VAL | Valin | Valine |  | g | Aminosäuren | Amino acids |  | 137 | 2 | false | false | NULL |  |  |  |
| NT | Stickstoff, gesamt | Nitrogen, total |  | g | Sonstige Nährstoffe | Other nutrients |  | 138 | 3 | false | false | NULL |  |  |  |

## Provenance discipline

- Every table row is parsed from `docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md:67-256`.
- No nutrient code, label, unit, group, sort order, display tier, computation flag, formula, or RDA value was authored by an LLM.
- Rows missing explicit RDA update examples retain empty `rda_male`, `rda_female`, and `rda_unit` fields.

## Validation query

DO NOT RUN until a later seed-execution boundary is explicitly opened.

```sql
select
  count(*) as row_count,
  count(*) filter (where name_th = '') as empty_name_th,
  count(*) filter (where group_th = '') as empty_group_th
from nutrition.nutrient_defs;
```

## Explicit exclusions

- No seed execution is authorized.
- No local DB apply is authorized.
- No Supabase command is authorized.
- No DEV or LIVE action is authorized.
- No BLS import is authorized.
- No raw BLS commit is authorized.
- No migration execution is authorized.

## Stop conditions

- Stop if the source row count is not exactly 138.
- Stop if any candidate row cannot be traced to the SPEC_06 seed block.
- Stop if any row requires a value not present in the source text.
- Stop if seed execution, DB apply, Supabase, BLS import, raw BLS commit, or migration execution is requested before a new execution boundary is opened.

## Next local-only boundary

Tom must explicitly approve a separate local-only seed execution boundary before any insert/apply command is run.
