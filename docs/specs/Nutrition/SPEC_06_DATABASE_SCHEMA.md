# Nutrition Module — Database Schema
> Spec Phase 6 | Vollständiges SQL-Schema

## Übersicht

Alle Tabellen im Schema `nutrition`. Kein anderes Modul schreibt direkt in dieses Schema.
Cross-Modul-Zugriff nur via API (Port 5100).

```sql
CREATE SCHEMA IF NOT EXISTS nutrition;
SET search_path = nutrition, public;
```

## Tabellen-Index

| Tabelle | Typ | Beschreibung |
|---|---|---|
| `nutrition.nutrient_defs` | Stammdaten | 138 BLS-Nährstoff-Definitionen |
| `nutrition.food_categories` | Stammdaten | Kategorie-Baum (4 Ebenen) |
| `nutrition.foods` | Stammdaten | BLS 4.0 Food-DB (7.140 Foods) |
| `nutrition.food_nutrients` | Stammdaten | Nährstoff-Werte EAV (~570K Zeilen) |
| `nutrition.tag_definitions` | Stammdaten | Semantic Tag Vokabular |
| `nutrition.food_tags` | Stammdaten | Food-Tag-Zuordnungen |
| `nutrition.food_aliases` | Stammdaten | Such-Aliase |
| `nutrition.foods_custom` | User-Daten | User-erstellte Lebensmittel |
| `nutrition.food_preferences` | User-Daten | Diättyp, Allergien, Kochpräferenzen |
| `nutrition.food_preference_items` | User-Daten | Likes/Dislikes auf food/category/tag-Ebene |
| `nutrition.meals` | User-Daten | Mahlzeiten-Container |
| `nutrition.meal_items` | User-Daten | Items + eingefrorene Nährstoffe |
| `nutrition.recipes` | User-Daten | User-Rezepte |
| `nutrition.recipe_items` | User-Daten | Zutaten eines Rezepts |
| `nutrition.meal_plans` | User-Daten | Meal Plans (alle Quellen) |
| `nutrition.meal_plan_days` | User-Daten | Tage innerhalb Plan |
| `nutrition.meal_plan_items` | User-Daten | Items pro Plantag |
| `nutrition.meal_plan_logs` | User-Daten | Ausführungsprotokoll |
| `nutrition.water_logs` | User-Daten | Wasseraufnahme |
| `nutrition.nutrition_targets` | User-Daten | Gecachte Tages-Targets (von Goals) |
| `nutrition.micro_flags` | User-Daten | Mikronährstoff-Warnungen |
| `nutrition.daily_nutrition_summary` | VIEW | Tages-Aggregat |

---

## 1. nutrition.nutrient_defs

138 Nährstoff-Definitionen aus BLS 4.0.
`display_tier`: 1 = immer sichtbar, 2 = Athlet, 3 = Medizinisch/Wissenschaftlich.

```sql
CREATE TABLE nutrition.nutrient_defs (
  code                TEXT PRIMARY KEY,
  name_de             TEXT NOT NULL,
  name_en             TEXT NOT NULL,
  unit                TEXT NOT NULL,
  group_de            TEXT NOT NULL,
  group_en            TEXT NOT NULL,
  sort_index          INTEGER NOT NULL,
  display_tier        INTEGER NOT NULL DEFAULT 2 CHECK (display_tier IN (1,2,3)),
  is_always_computed  BOOLEAN NOT NULL DEFAULT false,
  is_partly_computed  BOOLEAN NOT NULL DEFAULT false,
  formula             TEXT,
  rda_male            NUMERIC(10,3),
  rda_female          NUMERIC(10,3),
  rda_unit            TEXT
);
```

### Seed-Daten: nutrient_defs (138 Codes)

```sql
INSERT INTO nutrition.nutrient_defs
  (code, name_de, name_en, unit, group_de, group_en, sort_index, display_tier,
   is_always_computed, is_partly_computed, formula) VALUES

-- ENERGIE (Tier 1)
('ENERCJ','Energie (Kilojoule)','Energy (kilojoule)','kJ','Energie','Energy',1,1,true,false,
 'PROT625*17 + (CHO-POLYL)*17 + FAT*37 + ALC*29 + OA*13 + POLYL*10 + OLSAC*8 + FIBT*8'),
('ENERCC','Energie (Kilokalorien)','Energy (kilocalorie)','kcal','Energie','Energy',2,1,true,false,
 'PROT625*4 + (CHO-POLYL)*4 + FAT*9 + ALC*7 + OA*3 + POLYL*2.4 + OLSAC*2 + FIBT*2'),

-- MAKRONÄHRSTOFFE (Tier 1)
('WATER','Wasser','Water','g','Makronährstoffe','Proximate',3,1,false,false,NULL),
('PROT625','Protein (Nx6,25)','Protein (Nx6.25)','g','Makronährstoffe','Proximate',4,1,false,true,'PROT625=NT*6.25'),
('FAT','Fett','Fat','g','Makronährstoffe','Proximate',5,1,false,false,NULL),
('CHO','Kohlenhydrate, verfügbar','Carbohydrate, available','g','Makronährstoffe','Proximate',6,1,true,false,
 'SUGAR+STARCH+OLSAC+POLYL'),
('FIBT','Ballaststoffe, gesamt','Fibre, dietary, total','g','Makronährstoffe','Proximate',7,1,false,true,
 'FIBHMW+FIBLMW'),
('ALC','Alkohol (Ethanol)','Alcohol (Ethanol)','g','Makronährstoffe','Proximate',8,1,false,false,NULL),
('OA','Organische Säuren, gesamt','Organic acids, total','g','Makronährstoffe','Proximate',9,2,false,true,
 'MALAC+ACEAC+LACAC+TARAC+CITAC'),
('ASH','Rohasche','Ash','g','Makronährstoffe','Proximate',10,2,false,false,NULL),

-- VITAMINE FETTLÖSLICH (Tier 1/2)
('VITA','Vitamin A, Retinol-Äquivalent (RE)','Vitamin A, Retinol equivalent (RE)','µg','Fettlösliche Vitamine','Fat-soluble vitamins',11,1,false,true,
 'RETOL + 1/6*CARTB + 1/12*CAROTPAXB'),
('VITAA','Vitamin A, Retinol-Aktivitäts-Äquivalent (RAE)','Vitamin A, Retinol activity equivalent (RAE)','µg','Fettlösliche Vitamine','Fat-soluble vitamins',12,2,false,true,
 'RETOL + 1/12*CARTB + 1/24*CAROTPAXB'),
('RETOL','Retinol','Retinol','µg','Fettlösliche Vitamine','Fat-soluble vitamins',13,2,false,false,NULL),
('CARTB','Beta-Carotin','Beta-carotene','µg','Fettlösliche Vitamine','Fat-soluble vitamins',14,2,false,false,NULL),
('CAROTPAXB','Carotinoide, außer Beta-Carotin','Carotenoids, except beta-carotene','µg','Fettlösliche Vitamine','Fat-soluble vitamins',15,3,false,false,NULL),
('VITD','Vitamin D','Vitamin D','µg','Fettlösliche Vitamine','Fat-soluble vitamins',16,1,false,true,'ERGCAL+CHOCAL'),
('CHOCAL','Vitamin D3 (Cholecalciferol)','Vitamin D3 (cholecalciferol)','µg','Fettlösliche Vitamine','Fat-soluble vitamins',17,2,false,false,NULL),
('ERGCAL','Vitamin D2 (Ergocalciferol)','Vitamin D2 (ergocalciferol)','µg','Fettlösliche Vitamine','Fat-soluble vitamins',18,2,false,false,NULL),
('VITE','Vitamin E (Alpha-Tocopherol)','Vitamin E (alpha-tocopherol)','mg','Fettlösliche Vitamine','Fat-soluble vitamins',19,1,false,false,NULL),
('TOCPHA','Alpha-Tocopherol','Alpha-tocopherol','mg','Fettlösliche Vitamine','Fat-soluble vitamins',20,2,false,false,NULL),
('TOCPHB','Beta-Tocopherol','Beta-tocopherol','mg','Fettlösliche Vitamine','Fat-soluble vitamins',21,3,false,false,NULL),
('TOCPHG','Gamma-Tocopherol','Gamma-tocopherol','mg','Fettlösliche Vitamine','Fat-soluble vitamins',22,3,false,false,NULL),
('TOCPHD','Delta-Tocopherol','Delta-tocopherol','mg','Fettlösliche Vitamine','Fat-soluble vitamins',23,3,false,false,NULL),
('TOCTRA','Alpha-Tocotrienol','Alpha-tocotrienol','mg','Fettlösliche Vitamine','Fat-soluble vitamins',24,3,false,false,NULL),
('VITK','Vitamin K','Vitamin K','µg','Fettlösliche Vitamine','Fat-soluble vitamins',25,1,false,true,'VITK1+VITK2'),
('VITK1','Vitamin K1 (Phyllochinon)','Vitamin K1 (phylloquinone)','µg','Fettlösliche Vitamine','Fat-soluble vitamins',26,2,false,false,NULL),
('VITK2','Vitamin K2 (Menachinone)','Vitamin K2 (menaquinone)','µg','Fettlösliche Vitamine','Fat-soluble vitamins',27,2,false,false,NULL),

-- VITAMINE WASSERLÖSLICH (Tier 1/2)
('THIA','Vitamin B1 (Thiamin)','Vitamin B1 (thiamin)','mg','Wasserlösliche Vitamine','Water-soluble vitamins',28,1,false,false,NULL),
('RIBF','Vitamin B2 (Riboflavin)','Vitamin B2 (riboflavin)','mg','Wasserlösliche Vitamine','Water-soluble vitamins',29,1,false,false,NULL),
('NIAEQ','Niacin-Äquivalent','Niacin equivalent','mg','Wasserlösliche Vitamine','Water-soluble vitamins',30,2,true,false,'NIA+TRP*1000/60'),
('NIA','Niacin','Niacin','mg','Wasserlösliche Vitamine','Water-soluble vitamins',31,1,false,false,NULL),
('PANTAC','Pantothensäure','Pantothenic acid','mg','Wasserlösliche Vitamine','Water-soluble vitamins',32,2,false,false,NULL),
('VITB6','Vitamin B6','Vitamin B6','µg','Wasserlösliche Vitamine','Water-soluble vitamins',33,1,false,false,NULL),
('BIOT','Biotin','Biotin','µg','Wasserlösliche Vitamine','Water-soluble vitamins',34,2,false,false,NULL),
('FOL','Folat-Äquivalent','Folate equivalent','µg','Wasserlösliche Vitamine','Water-soluble vitamins',35,1,true,false,'FOLFD+1.7*FOLAC'),
('FOLFD','Folat','Folate','µg','Wasserlösliche Vitamine','Water-soluble vitamins',36,2,false,false,NULL),
('FOLAC','Folsäure, synthetisch','Folic acid, synthetic','µg','Wasserlösliche Vitamine','Water-soluble vitamins',37,2,false,false,NULL),
('VITB12','Vitamin B12 (Cobalamine)','Vitamin B12 (cobalamin)','µg','Wasserlösliche Vitamine','Water-soluble vitamins',38,1,false,false,NULL),
('VITC','Vitamin C','Vitamin C','mg','Wasserlösliche Vitamine','Water-soluble vitamins',39,1,false,false,NULL),

-- ELEMENTE/MINERALSTOFFE (Tier 1/2)
('NACL','Salz (Natriumchlorid)','Salt (sodium chloride)','g','Elemente','Elements',40,1,true,false,'NA*2.5'),
('NA','Natrium','Sodium','mg','Elemente','Elements',41,1,false,false,NULL),
('CLD','Chlorid','Chloride','mg','Elemente','Elements',42,2,false,false,NULL),
('K','Kalium','Potassium','mg','Elemente','Elements',43,1,false,false,NULL),
('CA','Calcium','Calcium','mg','Elemente','Elements',44,1,false,false,NULL),
('MG','Magnesium','Magnesium','mg','Elemente','Elements',45,1,false,false,NULL),
('P','Phosphor','Phosphorus','mg','Elemente','Elements',46,1,false,false,NULL),
('S','Schwefel','Sulfur','mg','Elemente','Elements',47,3,false,false,NULL),
('FE','Eisen','Iron','mg','Elemente','Elements',48,1,false,false,NULL),
('ZN','Zink','Zinc','mg','Elemente','Elements',49,1,false,false,NULL),
('ID','Iodid','Iodide','µg','Elemente','Elements',50,1,false,false,NULL),
('CU','Kupfer','Copper','µg','Elemente','Elements',51,2,false,false,NULL),
('MN','Mangan','Manganese','µg','Elemente','Elements',52,2,false,false,NULL),
('FD','Fluorid','Fluoride','µg','Elemente','Elements',53,3,false,false,NULL),
('CR','Chrom','Chromium','µg','Elemente','Elements',54,3,false,false,NULL),
('MO','Molybdän','Molybdenum','µg','Elemente','Elements',55,3,false,false,NULL),

-- ORGANISCHE SÄUREN (Tier 3)
('ACEAC','Essigsäure','Acetic acid','g','Organische Säuren','Organic acids',56,3,false,false,NULL),
('CITAC','Zitronensäure','Citric acid','g','Organische Säuren','Organic acids',57,3,false,false,NULL),
('LACAC','Milchsäure','Lactic acid','g','Organische Säuren','Organic acids',58,3,false,false,NULL),
('MALAC','Äpfelsäure','Malic acid','g','Organische Säuren','Organic acids',59,3,false,false,NULL),
('TARAC','Weinsäure','Tartaric acid','g','Organische Säuren','Organic acids',60,3,false,false,NULL),

-- ZUCKERALKOHOLE (Tier 2/3)
('POLYL','Zuckeralkohole, gesamt','Sugar alcohols, total','g','Makronährstoffe','Proximate',61,2,true,false,'MANTL+SORTL+XYLTL'),
('MANTL','Mannit','Mannitol','g','Zuckeralkohole','Sugar alcohols',62,3,false,false,NULL),
('SORTL','Sorbit','Sorbitol','g','Zuckeralkohole','Sugar alcohols',63,3,false,false,NULL),
('XYLTL','Xylit','Xylitol','g','Zuckeralkohole','Sugar alcohols',64,3,false,false,NULL),

-- KOHLENHYDRATE DETAIL (Tier 1/2/3)
('MNSAC','Monosaccharide, gesamt','Monosaccharides, total','g','Kohlenhydrate','Carbohydrates',65,2,true,false,'GLUS+FRUS+GALS'),
('GLUS','Glucose','Glucose','g','Kohlenhydrate','Carbohydrates',66,2,false,false,NULL),
('FRUS','Fructose','Fructose','g','Kohlenhydrate','Carbohydrates',67,2,false,false,NULL),
('GALS','Galactose','Galactose','g','Kohlenhydrate','Carbohydrates',68,3,false,false,NULL),
('DISAC','Disaccharide, gesamt','Disaccharides, total','g','Kohlenhydrate','Carbohydrates',69,2,true,false,'SUCS+MALS+LACS'),
('SUCS','Saccharose','Sucrose','g','Kohlenhydrate','Carbohydrates',70,2,false,false,NULL),
('MALS','Maltose','Maltose','g','Kohlenhydrate','Carbohydrates',71,3,false,false,NULL),
('LACS','Lactose','Lactose','g','Kohlenhydrate','Carbohydrates',72,2,false,false,NULL),
('SUGAR','Zucker, gesamt','Sugars, total','g','Kohlenhydrate','Carbohydrates',73,1,true,false,
 'GLUS+FRUS+GALS+SUCS+MALS+LACS'),
('OLSAC','Oligosaccharide, verfügbar','Oligosaccharides, available','g','Kohlenhydrate','Carbohydrates',74,3,false,false,NULL),
('STARCH','Stärke','Starch','g','Kohlenhydrate','Carbohydrates',75,2,false,false,NULL),

-- BALLASTSTOFFE DETAIL (Tier 2/3)
('FIBLMW','Ballaststoffe, niedermolekular','Fibre, low molecular weight','g','Ballaststoffe','Dietary fibres',76,3,false,false,NULL),
('FIBHMW','Ballaststoffe, hochmolekular','Fibre, high molecular weight','g','Ballaststoffe','Dietary fibres',77,3,false,true,'FIBHMWS+FIBHMWI'),
('FIBINS','Ballaststoffe, wasserunlöslich','Fibre, water insoluble','g','Ballaststoffe','Dietary fibres',78,3,false,false,NULL),
('FIBSOL','Ballaststoffe, wasserlöslich','Fibre, water soluble','g','Ballaststoffe','Dietary fibres',79,3,false,false,NULL),
('FIBHMWS','Ballaststoffe, hochmolekular, wasserlöslich','Fibre, HMW, water soluble','g','Ballaststoffe','Dietary fibres',80,3,false,false,NULL),
('FIBHMWI','Ballaststoffe, hochmolekular, wasserunlöslich','Fibre, HMW, water insoluble','g','Ballaststoffe','Dietary fibres',81,3,false,false,NULL),

-- FETTSÄUREN SUMMEN (Tier 1/2)
('FASAT','Fettsäuren, gesättigt, gesamt','Fatty acids, saturated, total','g','Fettsäuren','Fatty acids',82,1,true,false,
 'F4:0+F6:0+F8:0+F10:0+F12:0+F14:0+F15:0+F16:0+F17:0+F18:0+F20:0+F22:0+F24:0'),
('FAMS','Fettsäuren, einfach ungesättigt, gesamt','Fatty acids, monounsaturated, total','g','Fettsäuren','Fatty acids',96,2,true,false,
 'F14:1CN5+F16:1CN7+F18:1CN7+F18:1CN9+F20:1CN9+F22:1CN9'),
('FAPU','Fettsäuren, mehrfach ungesättigt, gesamt','Fatty acids, polyunsaturated, total','g','Fettsäuren','Fatty acids',103,2,true,false,
 'F18:2C9T11+F18:2CN6+F20:2CN6+F18:3CN3+F18:3CN6+F20:3CN6+F18:4CN3+F20:4CN6+F20:5CN3+F22:5CN3+F22:6CN3'),
('FAPUN3','Omega-3-Fettsäuren, gesamt','Fatty acids, n-3, total','g','Fettsäuren','Fatty acids',104,2,true,false,
 'F18:3CN3+F18:4CN3+F20:5CN3+F22:5CN3+F22:6CN3'),
('FAPUN6','Omega-6-Fettsäuren, gesamt','Fatty acids, n-6, total','g','Fettsäuren','Fatty acids',110,2,true,false,
 'F18:2CN6+F18:3CN6+F20:2CN6+F20:3CN6+F20:4CN6'),

-- GESÄTTIGTE FETTSÄUREN EINZEL (Tier 3 — ausser F16:0 → Tier 2)
('F4:0','Fettsäure C4:0 (Buttersäure)','Fatty acid C4:0 (butyric acid)','g','Fettsäuren','Fatty acids',83,3,false,false,NULL),
('F6:0','Fettsäure C6:0 (Capronsäure)','Fatty acid C6:0 (caproic acid)','g','Fettsäuren','Fatty acids',84,3,false,false,NULL),
('F8:0','Fettsäure C8:0 (Caprylsäure)','Fatty acid C8:0 (caprylic acid)','g','Fettsäuren','Fatty acids',85,3,false,false,NULL),
('F10:0','Fettsäure C10:0 (Caprinsäure)','Fatty acid C10:0 (capric acid)','g','Fettsäuren','Fatty acids',86,3,false,false,NULL),
('F12:0','Fettsäure C12:0 (Laurinsäure)','Fatty acid C12:0 (lauric acid)','g','Fettsäuren','Fatty acids',87,3,false,false,NULL),
('F14:0','Fettsäure C14:0 (Myristinsäure)','Fatty acid C14:0 (myristic acid)','g','Fettsäuren','Fatty acids',88,3,false,false,NULL),
('F15:0','Fettsäure C15:0 (Pentadecylsäure)','Fatty acid C15:0 (pentadecanoic acid)','g','Fettsäuren','Fatty acids',89,3,false,false,NULL),
('F16:0','Fettsäure C16:0 (Palmitinsäure)','Fatty acid C16:0 (palmitic acid)','g','Fettsäuren','Fatty acids',90,2,false,false,NULL),
('F17:0','Fettsäure C17:0 (Margarinsäure)','Fatty acid C17:0 (margaric acid)','g','Fettsäuren','Fatty acids',91,3,false,false,NULL),
('F18:0','Fettsäure C18:0 (Stearinsäure)','Fatty acid C18:0 (stearic acid)','g','Fettsäuren','Fatty acids',92,3,false,false,NULL),
('F20:0','Fettsäure C20:0 (Arachinsäure)','Fatty acid C20:0 (arachidic acid)','g','Fettsäuren','Fatty acids',93,3,false,false,NULL),
('F22:0','Fettsäure C22:0 (Behensäure)','Fatty acid C22:0 (behenic acid)','g','Fettsäuren','Fatty acids',94,3,false,false,NULL),
('F24:0','Fettsäure C24:0 (Lignocerinsäure)','Fatty acid C24:0 (lignoceric acid)','g','Fettsäuren','Fatty acids',95,3,false,false,NULL),

-- EINFACH UNGESÄTTIGTE FS EINZEL (Tier 2/3)
('F14:1CN5','Fettsäure C14:1 n-5 cis (Myristoleinsäure)','Fatty acid C14:1 n-5 (myristoleic acid)','g','Fettsäuren','Fatty acids',97,3,false,false,NULL),
('F16:1CN7','Fettsäure C16:1 n-7 cis (Palmitoleinsäure)','Fatty acid C16:1 n-7 (palmitoleic acid)','g','Fettsäuren','Fatty acids',98,3,false,false,NULL),
('F18:1CN7','Fettsäure C18:1 n-7 cis (Vaccensäure)','Fatty acid C18:1 n-7 (vaccenic acid)','g','Fettsäuren','Fatty acids',99,3,false,false,NULL),
('F18:1CN9','Fettsäure C18:1 n-9 cis (Ölsäure)','Fatty acid C18:1 n-9 (oleic acid)','g','Fettsäuren','Fatty acids',100,2,false,false,NULL),
('F20:1CN9','Fettsäure C20:1 n-9 cis (Gondosäure)','Fatty acid C20:1 n-9 (gondoic acid)','g','Fettsäuren','Fatty acids',101,3,false,false,NULL),
('F22:1CN9','Fettsäure C22:1 n-9 cis (Erucasäure)','Fatty acid C22:1 n-9 (erucic acid)','g','Fettsäuren','Fatty acids',102,3,false,false,NULL),

-- MEHRFACH UNGESÄTTIGTE FS EINZEL (Tier 2/3)
('F18:2CN6','Fettsäure C18:2 n-6 cis (Linolsäure)','Fatty acid C18:2 n-6 (linoleic acid)','g','Fettsäuren','Fatty acids',111,2,false,false,NULL),
('F18:2C9T11','Fettsäure C18:2 n-7 cis 9, trans 11 (konjugierte Linolsäure)','Fatty acid C18:2 n-7 c9,t11 (conjugated linoleic acid)','g','Fettsäuren','Fatty acids',112,3,false,false,NULL),
('F18:3CN3','Fettsäure C18:3 n-3 all-cis (Alpha-Linolensäure)','Fatty acid C18:3 n-3 (alpha-linolenic acid, ALA)','g','Fettsäuren','Fatty acids',105,2,false,false,NULL),
('F18:3CN6','Fettsäure C18:3 n-6 all-cis (Gamma-Linolensäure)','Fatty acid C18:3 n-6 (gamma-linolenic acid)','g','Fettsäuren','Fatty acids',113,3,false,false,NULL),
('F18:4CN3','Fettsäure C18:4 n-3 all-cis (Stearidonsäure)','Fatty acid C18:4 n-3 (stearidonic acid)','g','Fettsäuren','Fatty acids',106,3,false,false,NULL),
('F20:2CN6','Fettsäure C20:2 n-6 all-cis (Eicosadiensäure)','Fatty acid C20:2 n-6 (eicosadienoic acid)','g','Fettsäuren','Fatty acids',114,3,false,false,NULL),
('F20:3CN6','Fettsäure C20:3 n-6 all-cis (Dihomogamma-Linolensäure)','Fatty acid C20:3 n-6 (dihomo-gamma-linolenic acid)','g','Fettsäuren','Fatty acids',115,3,false,false,NULL),
('F20:4CN6','Fettsäure C20:4 n-6 all-cis (Arachidonsäure)','Fatty acid C20:4 n-6 (arachidonic acid)','g','Fettsäuren','Fatty acids',116,2,false,false,NULL),
('F20:5CN3','Fettsäure C20:5 n-3 all-cis (Eicosapentaensäure, EPA)','Fatty acid C20:5 n-3 (eicosapentaenoic acid, EPA)','g','Fettsäuren','Fatty acids',107,2,false,false,NULL),
('F22:5CN3','Fettsäure C22:5 n-3 all-cis (Docosapentaensäure)','Fatty acid C22:5 n-3 (docosapentaenoic acid)','g','Fettsäuren','Fatty acids',108,3,false,false,NULL),
('F22:6CN3','Fettsäure C22:6 n-3 all-cis (Docosahexaensäure, DHA)','Fatty acid C22:6 n-3 (docosahexaenoic acid, DHA)','g','Fettsäuren','Fatty acids',109,2,false,false,NULL),
('FAX','Fettsäuren, sonstige','Fatty acids, other','g','Fettsäuren','Fatty acids',117,3,false,false,NULL),

-- CHOLESTERIN (Tier 1)
('CHORL','Cholesterin','Cholesterol','mg','Sonstige Nährstoffe','Other nutrients',118,1,false,false,NULL),

-- AMINOSÄUREN (Tier 2/3)
('AAE9','Aminosäuren, unentbehrlich, gesamt','Amino acids, essential, total','g','Aminosäuren','Amino acids',119,2,true,false,
 'ILE+LEU+LYS+MET+PHE+THR+TRP+VAL+HIS'),
('ALA','Alanin','Alanine','g','Aminosäuren','Amino acids',120,3,false,false,NULL),
('ARG','Arginin','Arginine','g','Aminosäuren','Amino acids',121,3,false,false,NULL),
('ASP','Asparaginsäure, inklusive Asparagin','Aspartic acid, incl. asparagine','g','Aminosäuren','Amino acids',122,3,false,false,NULL),
('CYSTE','Cystein','Cysteine','g','Aminosäuren','Amino acids',123,3,false,false,NULL),
('GLU','Glutaminsäure, inklusive Glutamin','Glutamic acid, incl. glutamine','g','Aminosäuren','Amino acids',124,3,false,false,NULL),
('GLY','Glycin','Glycine','g','Aminosäuren','Amino acids',125,3,false,false,NULL),
('HIS','Histidin','Histidine','g','Aminosäuren','Amino acids',126,2,false,false,NULL),
('ILE','Isoleucin','Isoleucine','g','Aminosäuren','Amino acids',127,2,false,false,NULL),
('LEU','Leucin','Leucine','g','Aminosäuren','Amino acids',128,2,false,false,NULL),
('LYS','Lysin','Lysine','g','Aminosäuren','Amino acids',129,2,false,false,NULL),
('MET','Methionin','Methionine','g','Aminosäuren','Amino acids',130,2,false,false,NULL),
('PHE','Phenylalanin','Phenylalanine','g','Aminosäuren','Amino acids',131,2,false,false,NULL),
('PRO','Prolin','Proline','g','Aminosäuren','Amino acids',132,3,false,false,NULL),
('SER','Serin','Serine','g','Aminosäuren','Amino acids',133,3,false,false,NULL),
('THR','Threonin','Threonine','g','Aminosäuren','Amino acids',134,2,false,false,NULL),
('TRP','Tryptophan','Tryptophan','g','Aminosäuren','Amino acids',135,2,false,false,NULL),
('TYR','Tyrosin','Tyrosine','g','Aminosäuren','Amino acids',136,3,false,false,NULL),
('VAL','Valin','Valine','g','Aminosäuren','Amino acids',137,2,false,false,NULL),

-- STICKSTOFF (Tier 3)
('NT','Stickstoff, gesamt','Nitrogen, total','g','Sonstige Nährstoffe','Other nutrients',138,3,false,false,NULL);
```

### RDA-Update (nach Seed)

```sql
-- RDA-Werte nachträglich setzen (DACH-Referenzwerte, Erwachsene 25-50 Jahre)
UPDATE nutrition.nutrient_defs SET rda_male=2800, rda_female=2100, rda_unit='kcal' WHERE code='ENERCC';
UPDATE nutrition.nutrient_defs SET rda_male=56,   rda_female=46,   rda_unit='g'    WHERE code='PROT625';
UPDATE nutrition.nutrient_defs SET rda_male=30,   rda_female=30,   rda_unit='g'    WHERE code='FIBT';
UPDATE nutrition.nutrient_defs SET rda_male=900,  rda_female=700,  rda_unit='µg'   WHERE code='VITA';
UPDATE nutrition.nutrient_defs SET rda_male=20,   rda_female=20,   rda_unit='µg'   WHERE code='VITD';
UPDATE nutrition.nutrient_defs SET rda_male=15,   rda_female=12,   rda_unit='mg'   WHERE code='VITE';
UPDATE nutrition.nutrient_defs SET rda_male=70,   rda_female=60,   rda_unit='µg'   WHERE code='VITK';
UPDATE nutrition.nutrient_defs SET rda_male=1.3,  rda_female=1.0,  rda_unit='mg'   WHERE code='THIA';
UPDATE nutrition.nutrient_defs SET rda_male=1.5,  rda_female=1.2,  rda_unit='mg'   WHERE code='RIBF';
UPDATE nutrition.nutrient_defs SET rda_male=16,   rda_female=13,   rda_unit='mg'   WHERE code='NIA';
UPDATE nutrition.nutrient_defs SET rda_male=1.5,  rda_female=1.2,  rda_unit='mg'   WHERE code='PANTAC';
UPDATE nutrition.nutrient_defs SET rda_male=1.5,  rda_female=1.2,  rda_unit='mg'   WHERE code='VITB6';
UPDATE nutrition.nutrient_defs SET rda_male=40,   rda_female=40,   rda_unit='µg'   WHERE code='BIOT';
UPDATE nutrition.nutrient_defs SET rda_male=320,  rda_female=300,  rda_unit='µg'   WHERE code='FOL';
UPDATE nutrition.nutrient_defs SET rda_male=4.0,  rda_female=4.0,  rda_unit='µg'   WHERE code='VITB12';
UPDATE nutrition.nutrient_defs SET rda_male=110,  rda_female=95,   rda_unit='mg'   WHERE code='VITC';
UPDATE nutrition.nutrient_defs SET rda_male=1500, rda_female=1500, rda_unit='mg'   WHERE code='NA';
UPDATE nutrition.nutrient_defs SET rda_male=4000, rda_female=4000, rda_unit='mg'   WHERE code='K';
UPDATE nutrition.nutrient_defs SET rda_male=1000, rda_female=1000, rda_unit='mg'   WHERE code='CA';
UPDATE nutrition.nutrient_defs SET rda_male=350,  rda_female=300,  rda_unit='mg'   WHERE code='MG';
UPDATE nutrition.nutrient_defs SET rda_male=700,  rda_female=700,  rda_unit='mg'   WHERE code='P';
UPDATE nutrition.nutrient_defs SET rda_male=10,   rda_female=15,   rda_unit='mg'   WHERE code='FE';
UPDATE nutrition.nutrient_defs SET rda_male=10,   rda_female=7,    rda_unit='mg'   WHERE code='ZN';
UPDATE nutrition.nutrient_defs SET rda_male=200,  rda_female=200,  rda_unit='µg'   WHERE code='ID';
UPDATE nutrition.nutrient_defs SET rda_male=1500, rda_female=1200, rda_unit='µg'   WHERE code='CU';
UPDATE nutrition.nutrient_defs SET rda_male=3500, rda_female=3500, rda_unit='µg'   WHERE code='MN';
```

---

## 2. nutrition.food_categories

```sql
CREATE TABLE nutrition.food_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name_de     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  parent_id   UUID REFERENCES nutrition.food_categories(id),
  level       INTEGER NOT NULL CHECK (level IN (1,2,3,4)),
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0,
  bls_hint    TEXT
);

CREATE INDEX idx_food_categories_parent ON nutrition.food_categories(parent_id);
CREATE INDEX idx_food_categories_level  ON nutrition.food_categories(level);
```

---

## 3. nutrition.foods

```sql
CREATE TABLE nutrition.foods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bls_code        TEXT UNIQUE NOT NULL,
  name_de         TEXT NOT NULL,
  name_en         TEXT,

  -- Human Layer
  name_display    TEXT,
  name_display_en TEXT,
  category_id     UUID REFERENCES nutrition.food_categories(id),
  sort_weight     INTEGER NOT NULL DEFAULT 500 CHECK (sort_weight BETWEEN 0 AND 1000),
  processing_level TEXT DEFAULT 'raw'
    CHECK (processing_level IN ('raw','minimally_processed','processed','ultra_processed','cooked','fermented','smoked','dried','canned','fortified')),
  is_prepared_dish BOOLEAN NOT NULL DEFAULT false,

  -- Schnell-Makros (direkte Spalten für Search + Fast Aggregation)
  enercc          NUMERIC(8,2),
  enercj          NUMERIC(8,2),
  water_g         NUMERIC(8,3),
  prot625         NUMERIC(8,3),
  fat             NUMERIC(8,3),
  cho             NUMERIC(8,3),
  fibt            NUMERIC(8,3),
  sugar           NUMERIC(8,3),
  fasat           NUMERIC(8,3),
  nacl            NUMERIC(8,3),
  alc             NUMERIC(8,3),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_foods_name_de_trgm   ON nutrition.foods USING GIN (name_display gin_trgm_ops);
CREATE INDEX idx_foods_name_display   ON nutrition.foods USING GIN (name_display gin_trgm_ops);
CREATE INDEX idx_foods_sort_weight    ON nutrition.foods(sort_weight DESC);
CREATE INDEX idx_foods_category       ON nutrition.foods(category_id);
CREATE INDEX idx_foods_bls_code       ON nutrition.foods(bls_code);

-- pg_trgm Extension (falls nicht vorhanden)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- RLS: BLS-Foods sind für alle authentifizierten User lesbar
ALTER TABLE nutrition.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "foods_select_all" ON nutrition.foods FOR SELECT USING (true);
```

---

## 4. nutrition.food_nutrients

```sql
CREATE TABLE nutrition.food_nutrients (
  food_id         UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  nutrient_code   TEXT NOT NULL REFERENCES nutrition.nutrient_defs(code),
  value           NUMERIC(12,5) NOT NULL,
  data_source     TEXT NOT NULL,
  -- BLS data_source Kategorien:
  -- 'Analyse' | 'Rezeptberechnung' | 'Musterberechnung' | 'Literatur'
  -- 'Aggregation' | 'Labelangabe' | 'Naehrstoffdatenbank' | 'Uebernommener Wert'
  -- 'Reskalierung' | 'Logische Null' | 'Logische Annahme' | 'Spuren' | 'Formelberechnung'
  PRIMARY KEY (food_id, nutrient_code)
);

CREATE INDEX idx_food_nutrients_food  ON nutrition.food_nutrients(food_id);
CREATE INDEX idx_food_nutrients_code  ON nutrition.food_nutrients(nutrient_code);

-- RLS: lesbar für alle authentifizierten
ALTER TABLE nutrition.food_nutrients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_nutrients_select" ON nutrition.food_nutrients FOR SELECT USING (true);
```

**Handling-Regeln beim BLS-Import:**
- `-` (Fehlender Wert) → kein Eintrag in food_nutrients
- `0` mit "Logische Null" → Eintrag mit value=0, data_source='Logische Null'
- `<LOQ` → kein Eintrag (unter Nachweisgrenze = unbekannt)
- Numerischer Wert → Eintrag mit entsprechendem data_source

---

## 5. nutrition.tag_definitions

```sql
CREATE TABLE nutrition.tag_definitions (
  code                  TEXT PRIMARY KEY,
  name_de               TEXT NOT NULL,
  name_en               TEXT NOT NULL,
  tag_type              TEXT NOT NULL
    CHECK (tag_type IN ('ingredient','diet','allergen','fitness','gym','processing')),
  is_exclusion_relevant BOOLEAN NOT NULL DEFAULT false,
  icon                  TEXT,
  sort_order            INTEGER DEFAULT 0,
  requires_macro_check  BOOLEAN DEFAULT false,
  macro_rule            JSONB
  -- macro_rule example: {"field": "prot625", "op": ">=", "value": 20}
);

-- RLS: lesbar für alle
ALTER TABLE nutrition.tag_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tag_defs_select" ON nutrition.tag_definitions FOR SELECT USING (true);
```

---

## 6. nutrition.food_tags

```sql
CREATE TABLE nutrition.food_tags (
  food_id     UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  tag_code    TEXT NOT NULL REFERENCES nutrition.tag_definitions(code),
  confidence  NUMERIC(3,2) NOT NULL DEFAULT 1.0
    CHECK (confidence BETWEEN 0 AND 1),
  PRIMARY KEY (food_id, tag_code)
);

CREATE INDEX idx_food_tags_food ON nutrition.food_tags(food_id);
CREATE INDEX idx_food_tags_code ON nutrition.food_tags(tag_code);

-- RLS
ALTER TABLE nutrition.food_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_tags_select" ON nutrition.food_tags FOR SELECT USING (true);
```

### Auto-Tag Trigger

```sql
CREATE OR REPLACE FUNCTION nutrition.auto_tag_food(p_food_id UUID)
RETURNS VOID AS $$
DECLARE
  v_food nutrition.foods%ROWTYPE;
  v_cat_code TEXT;
BEGIN
  SELECT * INTO v_food FROM nutrition.foods WHERE id = p_food_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- BLS category code = first character of bls_code
  v_cat_code := LEFT(v_food.bls_code, 1);

  -- Alle bestehenden Tags löschen
  DELETE FROM nutrition.food_tags WHERE food_id = p_food_id;

  -- Ingredient Tags (BLS-Code basiert)
  -- Rind (U1xxx, U2xxx, U3xxx ohne Kalb)
  IF v_food.bls_code ~ '^U[12]' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'beef', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  -- Kalb (U3xxx, U4xxx)
  IF v_food.bls_code ~ '^U[34]' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'veal', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  -- Schwein (U5xxx, U6xxx)
  IF v_food.bls_code ~ '^U[56]' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'pork', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  -- Schaf/Lamm (U7xxx, U8xxx)
  IF v_food.bls_code ~ '^U[78]' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'lamb', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  -- Geflügel (V4xxx)
  IF v_food.bls_code ~ '^V4' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'poultry', 1.0) ON CONFLICT DO NOTHING;
    IF v_food.bls_code ~ '^V4[0-9][4]' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'chicken', 0.9) ON CONFLICT DO NOTHING;
    END IF;
    IF v_food.bls_code ~ '^V4[0-9][8]' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'turkey', 0.9) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Wild (V1xxx, V2xxx, V3xxx)
  IF v_food.bls_code ~ '^V[123]' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'game_meat', 1.0) ON CONFLICT DO NOTHING;
    IF v_food.bls_code ~ '^V[12]' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'rabbit', 0.9) ON CONFLICT DO NOTHING;
    END IF;
    IF v_food.bls_code ~ '^V3' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'wild_poultry', 1.0) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Innereien (V5xxx, V6xxx)
  IF v_food.bls_code ~ '^V[56]' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'offal', 1.0) ON CONFLICT DO NOTHING;
    IF LOWER(v_food.name_de) LIKE '%leber%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'liver', 1.0) ON CONFLICT DO NOTHING;
    END IF;
    IF LOWER(v_food.name_de) LIKE '%herz%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'heart', 1.0) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Wurstwaren (W)
  IF v_cat_code = 'W' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'processed_meat', 1.0) ON CONFLICT DO NOTHING;
    IF LOWER(v_food.name_de) LIKE '%schwein%' OR LOWER(v_food.name_de) LIKE '%schinken%' OR LOWER(v_food.name_de) LIKE '%speck%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'pork', 0.9) ON CONFLICT DO NOTHING;
    ELSIF LOWER(v_food.name_de) LIKE '%rind%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'beef', 0.9) ON CONFLICT DO NOTHING;
    ELSIF LOWER(v_food.name_de) LIKE '%geflügel%' OR LOWER(v_food.name_de) LIKE '%pute%' OR LOWER(v_food.name_de) LIKE '%hähnchen%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'poultry', 0.9) ON CONFLICT DO NOTHING;
    ELSE
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'pork', 0.7) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Fisch & Meeresfrüchte (T)
  IF v_cat_code = 'T' THEN
    IF v_food.bls_code ~ '^T7[3-9]' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'shellfish', 1.0) ON CONFLICT DO NOTHING;
      IF LOWER(v_food.name_de) LIKE '%muschel%' OR LOWER(v_food.name_de) LIKE '%auster%' OR LOWER(v_food.name_de) LIKE '%tintenfisch%' THEN
        INSERT INTO nutrition.food_tags VALUES (p_food_id, 'molluscs', 1.0) ON CONFLICT DO NOTHING;
      END IF;
    ELSE
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'fish', 1.0) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Milch (M)
  IF v_cat_code = 'M' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'dairy', 1.0) ON CONFLICT DO NOTHING;
    IF LOWER(v_food.name_de) LIKE '%käse%' OR LOWER(v_food.name_de) LIKE '%quark%' OR LOWER(v_food.name_de) LIKE '%joghurt%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'cheese', 0.9) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Ei (E111xx)
  IF v_food.bls_code ~ '^E111' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'egg', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  -- Soja/Hülsenfrüchte/Nüsse (H)
  IF v_cat_code = 'H' THEN
    IF LOWER(v_food.name_de) LIKE '%tofu%' OR LOWER(v_food.name_de) LIKE '%soja%' OR LOWER(v_food.name_de) LIKE '%tempeh%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'soy', 1.0) ON CONFLICT DO NOTHING;
    END IF;
    IF LOWER(v_food.name_de) LIKE '%nuss%' OR LOWER(v_food.name_de) LIKE '%mandel%' OR LOWER(v_food.name_de) LIKE '%cashew%' OR LOWER(v_food.name_de) LIKE '%walnuss%' OR LOWER(v_food.name_de) LIKE '%haselnuss%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'nuts', 1.0) ON CONFLICT DO NOTHING;
    END IF;
    IF LOWER(v_food.name_de) LIKE '%erdnuss%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'peanuts', 1.0) ON CONFLICT DO NOTHING;
    END IF;
    IF LOWER(v_food.name_de) LIKE '%linse%' OR LOWER(v_food.name_de) LIKE '%erbse%' OR LOWER(v_food.name_de) LIKE '%bohne%' OR LOWER(v_food.name_de) LIKE '%kichererbse%' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'legumes', 1.0) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Glutenhaltiges Getreide (B, C mit Weizen/Roggen/Gerste/Hafer/Dinkel)
  IF v_cat_code IN ('B', 'C', 'D', 'E') THEN
    IF LOWER(v_food.name_de) ~ '(weizen|roggen|gerste|hafer|dinkel|grünkern|emmer|kamut)' THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'gluten_grain', 1.0) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- Kartoffel (K)
  IF v_cat_code = 'K' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'potato', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  -- Gemüse (G)
  IF v_cat_code = 'G' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'vegetable', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  -- Obst (F)
  IF v_cat_code = 'F' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'fruit', 1.0) ON CONFLICT DO NOTHING;
  END IF;

  -- Fitness Tags (makrobasiert)
  IF v_food.prot625 IS NOT NULL AND v_food.prot625 >= 20 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'high_protein', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.prot625 IS NOT NULL AND v_food.prot625 >= 30 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'very_high_protein', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.cho IS NOT NULL AND v_food.cho >= 50 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'high_carb', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.cho IS NOT NULL AND v_food.cho <= 5 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'very_low_carb', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.cho IS NOT NULL AND v_food.cho <= 10 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'low_carb', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.fibt IS NOT NULL AND v_food.fibt >= 6 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'high_fiber', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.enercc IS NOT NULL AND v_food.enercc <= 100 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'low_calorie', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.enercc IS NOT NULL AND v_food.enercc >= 400 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'calorie_dense', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.fat IS NOT NULL AND v_food.fat <= 3 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'low_fat', 1.0) ON CONFLICT DO NOTHING;
  END IF;

  -- Diet Tags (aus Ingredient Tags berechnet)
  IF NOT EXISTS (
    SELECT 1 FROM nutrition.food_tags
    WHERE food_id = p_food_id
    AND tag_code IN ('pork','beef','veal','lamb','mutton','poultry','chicken','turkey','duck','goose',
                     'game_meat','rabbit','wild_poultry','offal','liver','heart','processed_meat',
                     'fish','shellfish','molluscs')
  ) THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'vegetarian', 1.0) ON CONFLICT DO NOTHING;
    IF NOT EXISTS (
      SELECT 1 FROM nutrition.food_tags WHERE food_id = p_food_id AND tag_code IN ('dairy','egg')
    ) THEN
      INSERT INTO nutrition.food_tags VALUES (p_food_id, 'vegan', 1.0) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Allergen Tags (von Ingredient Tags ableiten)
  IF EXISTS (SELECT 1 FROM nutrition.food_tags WHERE food_id=p_food_id AND tag_code='gluten_grain') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_gluten',1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF EXISTS (SELECT 1 FROM nutrition.food_tags WHERE food_id=p_food_id AND tag_code='shellfish') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_crustaceans',0.9) ON CONFLICT DO NOTHING;
  END IF;
  IF EXISTS (SELECT 1 FROM nutrition.food_tags WHERE food_id=p_food_id AND tag_code='egg') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_eggs',1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF EXISTS (SELECT 1 FROM nutrition.food_tags WHERE food_id=p_food_id AND tag_code='fish') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_fish',1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF EXISTS (SELECT 1 FROM nutrition.food_tags WHERE food_id=p_food_id AND tag_code='peanuts') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_peanuts',1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF EXISTS (SELECT 1 FROM nutrition.food_tags WHERE food_id=p_food_id AND tag_code='soy') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_soy',1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF EXISTS (SELECT 1 FROM nutrition.food_tags WHERE food_id=p_food_id AND tag_code='dairy') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_milk',1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF EXISTS (SELECT 1 FROM nutrition.food_tags WHERE food_id=p_food_id AND tag_code='nuts') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_nuts',1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_cat_code = 'P' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_sulphites',0.8) ON CONFLICT DO NOTHING;
  END IF;
  IF EXISTS (SELECT 1 FROM nutrition.food_tags WHERE food_id=p_food_id AND tag_code='molluscs') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id,'allergen_molluscs',1.0) ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE OR REPLACE FUNCTION nutrition.trg_auto_tag_food_fn()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM nutrition.auto_tag_food(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_foods_auto_tag
  AFTER INSERT OR UPDATE OF bls_code, name_de, prot625, fat, cho, fibt, enercc
  ON nutrition.foods
  FOR EACH ROW
  EXECUTE FUNCTION nutrition.trg_auto_tag_food_fn();
```

---

## 7. nutrition.food_aliases

```sql
CREATE TABLE nutrition.food_aliases (
  food_id   UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  alias     TEXT NOT NULL,
  locale    TEXT NOT NULL DEFAULT 'de',
  source    TEXT NOT NULL DEFAULT 'editorial'
    CHECK (source IN ('editorial','ai_generated','user')),
  PRIMARY KEY (food_id, alias, locale)
);

CREATE INDEX idx_food_aliases_alias_trgm ON nutrition.food_aliases USING GIN (alias gin_trgm_ops);
ALTER TABLE nutrition.food_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_aliases_select" ON nutrition.food_aliases FOR SELECT USING (true);
```

---

## 8. nutrition.foods_custom

Vollständig getrennt von BLS-Daten. User sieht eigene Custom Foods in Search vor BLS.

```sql
CREATE TABLE nutrition.foods_custom (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  name_de         TEXT NOT NULL,
  name_en         TEXT,
  brand           TEXT,
  barcode         TEXT,
  serving_size_g  NUMERIC(8,2) DEFAULT 100,
  serving_name    TEXT,
  source          TEXT DEFAULT 'user'
    CHECK (source IN ('user','mealcam','openfoodfacts')),

  -- Makros (Pflicht)
  enercc          NUMERIC(8,2) NOT NULL,
  prot625         NUMERIC(8,3) NOT NULL,
  fat             NUMERIC(8,3) NOT NULL,
  cho             NUMERIC(8,3) NOT NULL,

  -- Makros (optional)
  fibt            NUMERIC(8,3),
  sugar           NUMERIC(8,3),
  fasat           NUMERIC(8,3),
  nacl            NUMERIC(8,3),
  water_g         NUMERIC(8,3),
  alc             NUMERIC(8,3),

  -- Mikros (optional — Subset)
  vita_ug         NUMERIC(8,3), vitd_ug   NUMERIC(8,3), vite_mg  NUMERIC(8,3),
  vitk_ug         NUMERIC(8,3), vitc_mg   NUMERIC(8,3), thia_mg  NUMERIC(8,3),
  ribf_mg         NUMERIC(8,3), nia_mg    NUMERIC(8,3), vitb6_ug NUMERIC(8,3),
  fol_ug          NUMERIC(8,3), vitb12_ug NUMERIC(8,3), na_mg    NUMERIC(8,3),
  k_mg            NUMERIC(8,3), ca_mg     NUMERIC(8,3), mg_mg    NUMERIC(8,3),
  p_mg            NUMERIC(8,3), fe_mg     NUMERIC(8,3), zn_mg    NUMERIC(8,3),
  id_ug           NUMERIC(8,3), cu_ug     NUMERIC(8,3), mn_ug    NUMERIC(8,3),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_foods_custom_user ON nutrition.foods_custom(user_id);
CREATE INDEX idx_foods_custom_name_trgm ON nutrition.foods_custom USING GIN (name_de gin_trgm_ops);

ALTER TABLE nutrition.foods_custom ENABLE ROW LEVEL SECURITY;
CREATE POLICY "foods_custom_owner" ON nutrition.foods_custom
  USING (auth.uid()::text = user_id::text);
```

---

## 9. nutrition.food_preferences + food_preference_items

```sql
-- Allgemeine Ernährungspräferenzen des Users
CREATE TABLE nutrition.food_preferences (
  user_id             UUID PRIMARY KEY,
  diet_type           TEXT DEFAULT 'omnivore'
    CHECK (diet_type IN ('omnivore','pescatarian','vegetarian','vegan','keto','paleo','mediterranean','carnivore','custom')),
  allergies           TEXT[] DEFAULT '{}',
  intolerances        TEXT[] DEFAULT '{}',
  preferred_cuisines  TEXT[] DEFAULT '{}',
  cooking_skill       TEXT DEFAULT 'intermediate'
    CHECK (cooking_skill IN ('beginner','intermediate','advanced')),
  prep_time_max_min   INTEGER DEFAULT 30,
  budget_level        TEXT DEFAULT 'medium'
    CHECK (budget_level IN ('low','medium','high','no_limit')),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nutrition.food_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_prefs_owner" ON nutrition.food_preferences
  USING (auth.uid()::text = user_id::text);

-- Strukturierte Likes/Dislikes auf food/category/tag-Ebene
CREATE TABLE nutrition.food_preference_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  preference      TEXT NOT NULL CHECK (preference IN ('liked','disliked')),
  target_type     TEXT NOT NULL CHECK (target_type IN ('food','category','tag')),
  food_id         UUID REFERENCES nutrition.foods(id),
  custom_food_id  UUID REFERENCES nutrition.foods_custom(id),
  category_id     UUID REFERENCES nutrition.food_categories(id),
  tag_code        TEXT REFERENCES nutrition.tag_definitions(code),
  created_at      TIMESTAMPTZ DEFAULT now(),
  -- Constraint: genau eines der drei Ziel-Felder muss gesetzt sein
  CONSTRAINT exactly_one_target CHECK (
    (food_id IS NOT NULL)::int + (custom_food_id IS NOT NULL)::int +
    (category_id IS NOT NULL)::int + (tag_code IS NOT NULL)::int = 1
  )
);

CREATE INDEX idx_food_pref_items_user ON nutrition.food_preference_items(user_id);

ALTER TABLE nutrition.food_preference_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "food_pref_items_owner" ON nutrition.food_preference_items
  USING (auth.uid()::text = user_id::text);
```

---

## 10. nutrition.meals + meal_items

```sql
CREATE TABLE nutrition.meals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  date        DATE NOT NULL,
  meal_type   TEXT NOT NULL
    CHECK (meal_type IN ('breakfast','lunch','dinner','snack','pre_workout','post_workout','other')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meals_user_date ON nutrition.meals(user_id, date);
ALTER TABLE nutrition.meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meals_owner" ON nutrition.meals USING (auth.uid()::text = user_id::text);
```

```sql
CREATE TABLE nutrition.meal_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id         UUID NOT NULL REFERENCES nutrition.meals(id) ON DELETE CASCADE,

  -- Food-Referenz (denormalisiert für Robustheit)
  food_id         UUID,
  custom_food_id  UUID REFERENCES nutrition.foods_custom(id),
  food_source     TEXT NOT NULL CHECK (food_source IN ('bls','custom','mealcam')),
  food_name       TEXT NOT NULL,
  amount_g        NUMERIC(8,2) NOT NULL,

  -- Schnell-Makros (direkte Spalten für Daily Summary)
  enercc          NUMERIC(8,2),
  prot625         NUMERIC(8,3),
  fat             NUMERIC(8,3),
  cho             NUMERIC(8,3),
  fibt            NUMERIC(8,3),
  sugar           NUMERIC(8,3),
  fasat           NUMERIC(8,3),
  nacl            NUMERIC(8,3),
  water_g         NUMERIC(8,3),

  -- Vollständiger Snapshot aller Nährstoffe (eingefroren)
  -- Format: {"ENERCC": 52.3, "PROT625": 0.26, "VITD": 0.0, ...}
  -- Nur non-null Werte; fehlende Werte = kein Key im JSON
  nutrients       JSONB NOT NULL DEFAULT '{}',

  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meal_items_meal ON nutrition.meal_items(meal_id);
ALTER TABLE nutrition.meal_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_items_owner" ON nutrition.meal_items
  USING (EXISTS (
    SELECT 1 FROM nutrition.meals m
    WHERE m.id = meal_items.meal_id AND auth.uid()::text = m.user_id::text
  ));
```

**Nährstoff-Berechnung beim Erstellen:**
```
für jeden Nährstoff code in food_nutrients:
  meal_item_value = food_nutrient.value × (amount_g / 100.0)
→ nur codes mit existierenden Einträgen werden in nutrients JSONB eingetragen
```

---

## 11. nutrition.recipes + recipe_items

```sql
CREATE TABLE nutrition.recipes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  servings        NUMERIC(6,2) NOT NULL DEFAULT 1,
  prep_time_min   INTEGER,
  cook_time_min   INTEGER,
  instructions    TEXT,
  tags            TEXT[] DEFAULT '{}',
  is_favorite     BOOLEAN DEFAULT false,
  is_public       BOOLEAN DEFAULT false,

  -- Pre-computed Totals (auto-update via Trigger)
  total_weight_g  NUMERIC(10,2) DEFAULT 0,
  total_enercc    NUMERIC(10,2) DEFAULT 0,
  total_prot625   NUMERIC(10,3) DEFAULT 0,
  total_fat       NUMERIC(10,3) DEFAULT 0,
  total_cho       NUMERIC(10,3) DEFAULT 0,
  total_fibt      NUMERIC(10,3) DEFAULT 0,
  total_sugar     NUMERIC(10,3) DEFAULT 0,

  -- Generated Columns: pro Portion
  serving_weight_g  NUMERIC(10,2) GENERATED ALWAYS AS (total_weight_g / NULLIF(servings, 0)) STORED,
  serving_enercc    NUMERIC(10,2) GENERATED ALWAYS AS (total_enercc / NULLIF(servings, 0)) STORED,
  serving_prot625   NUMERIC(10,3) GENERATED ALWAYS AS (total_prot625 / NULLIF(servings, 0)) STORED,
  serving_fat       NUMERIC(10,3) GENERATED ALWAYS AS (total_fat / NULLIF(servings, 0)) STORED,
  serving_cho       NUMERIC(10,3) GENERATED ALWAYS AS (total_cho / NULLIF(servings, 0)) STORED,

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recipes_user ON nutrition.recipes(user_id);
ALTER TABLE nutrition.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes_owner" ON nutrition.recipes USING (auth.uid()::text = user_id::text);
```

```sql
CREATE TABLE nutrition.recipe_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   UUID NOT NULL REFERENCES nutrition.recipes(id) ON DELETE CASCADE,
  food_id     UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE RESTRICT,
  amount_g    NUMERIC(10,2) NOT NULL,

  -- Pre-computed (food.macro × amount_g / 100)
  enercc      NUMERIC(10,2), prot625 NUMERIC(10,3),
  fat         NUMERIC(10,3), cho     NUMERIC(10,3),
  fibt        NUMERIC(10,3), sugar   NUMERIC(10,3),
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recipe_items_recipe ON nutrition.recipe_items(recipe_id);
ALTER TABLE nutrition.recipe_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipe_items_owner" ON nutrition.recipe_items
  USING (EXISTS (SELECT 1 FROM nutrition.recipes r WHERE r.id = recipe_items.recipe_id AND auth.uid()::text = r.user_id::text));
```

```sql
-- Trigger: Rezept-Totals aktualisieren wenn Items sich ändern
CREATE OR REPLACE FUNCTION nutrition.recalculate_recipe_totals()
RETURNS TRIGGER AS $$
DECLARE v_recipe_id UUID;
BEGIN
  v_recipe_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.recipe_id ELSE NEW.recipe_id END;
  UPDATE nutrition.recipes SET
    total_weight_g = COALESCE((SELECT SUM(amount_g)  FROM nutrition.recipe_items WHERE recipe_id = v_recipe_id),0),
    total_enercc   = COALESCE((SELECT SUM(enercc)    FROM nutrition.recipe_items WHERE recipe_id = v_recipe_id),0),
    total_prot625  = COALESCE((SELECT SUM(prot625)   FROM nutrition.recipe_items WHERE recipe_id = v_recipe_id),0),
    total_fat      = COALESCE((SELECT SUM(fat)       FROM nutrition.recipe_items WHERE recipe_id = v_recipe_id),0),
    total_cho      = COALESCE((SELECT SUM(cho)       FROM nutrition.recipe_items WHERE recipe_id = v_recipe_id),0),
    total_fibt     = COALESCE((SELECT SUM(fibt)      FROM nutrition.recipe_items WHERE recipe_id = v_recipe_id),0),
    total_sugar    = COALESCE((SELECT SUM(sugar)     FROM nutrition.recipe_items WHERE recipe_id = v_recipe_id),0),
    updated_at     = now()
  WHERE id = v_recipe_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recipe_items_recalculate
  AFTER INSERT OR UPDATE OR DELETE ON nutrition.recipe_items
  FOR EACH ROW EXECUTE FUNCTION nutrition.recalculate_recipe_totals();
```

---

## 12. Meal Plans

```sql
CREATE TABLE nutrition.meal_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  days_count      INTEGER NOT NULL DEFAULT 7,
  target_kcal     INTEGER,
  target_protein  INTEGER,
  target_carbs    INTEGER,
  target_fat      INTEGER,

  -- Herkunft
  source          TEXT NOT NULL DEFAULT 'user'
    CHECK (source IN ('user','coach','marketplace','buddy')),
  source_ref_id   UUID,   -- coach_id oder marketplace_product_id

  -- Lifecycle
  lifecycle_type  TEXT NOT NULL DEFAULT 'once'
    CHECK (lifecycle_type IN ('once','rollover','sequence')),
  next_plan_id    UUID REFERENCES nutrition.meal_plans(id),
  rollover_count  INTEGER DEFAULT 0,

  -- Status
  status          TEXT NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned','active','completed','paused','archived')),
  start_date      DATE,
  end_date        DATE,
  activated_at    TIMESTAMPTZ,

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meal_plans_user   ON nutrition.meal_plans(user_id);
CREATE INDEX idx_meal_plans_status ON nutrition.meal_plans(user_id, status);
ALTER TABLE nutrition.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_plans_owner" ON nutrition.meal_plans
  USING (auth.uid()::text = user_id::text);
```

```sql
CREATE TABLE nutrition.meal_plan_days (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID NOT NULL REFERENCES nutrition.meal_plans(id) ON DELETE CASCADE,
  day_number  INTEGER NOT NULL,
  name        TEXT,
  UNIQUE (plan_id, day_number)
);

ALTER TABLE nutrition.meal_plan_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_plan_days_owner" ON nutrition.meal_plan_days
  USING (EXISTS (SELECT 1 FROM nutrition.meal_plans mp WHERE mp.id = meal_plan_days.plan_id AND auth.uid()::text = mp.user_id::text));
```

```sql
CREATE TABLE nutrition.meal_plan_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id          UUID NOT NULL REFERENCES nutrition.meal_plan_days(id) ON DELETE CASCADE,
  meal_type       TEXT NOT NULL
    CHECK (meal_type IN ('breakfast','lunch','dinner','snack','pre_workout','post_workout','other')),
  food_id         UUID REFERENCES nutrition.foods(id),
  custom_food_id  UUID REFERENCES nutrition.foods_custom(id),
  recipe_id       UUID REFERENCES nutrition.recipes(id),
  name            TEXT NOT NULL,
  amount_g        NUMERIC DEFAULT 100,
  enercc          NUMERIC, prot625 NUMERIC, cho NUMERIC, fat NUMERIC,
  sort_order      INTEGER DEFAULT 0,
  CONSTRAINT exactly_one_item_source CHECK (
    (food_id IS NOT NULL)::int + (custom_food_id IS NOT NULL)::int + (recipe_id IS NOT NULL)::int = 1
  )
);

ALTER TABLE nutrition.meal_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_plan_items_owner" ON nutrition.meal_plan_items
  USING (EXISTS (
    SELECT 1 FROM nutrition.meal_plan_days mpd
    JOIN nutrition.meal_plans mp ON mp.id = mpd.plan_id
    WHERE mpd.id = meal_plan_items.day_id AND auth.uid()::text = mp.user_id::text
  ));
```

```sql
CREATE TABLE nutrition.meal_plan_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID NOT NULL REFERENCES nutrition.meal_plans(id) ON DELETE CASCADE,
  plan_item_id    UUID NOT NULL REFERENCES nutrition.meal_plan_items(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,
  execution_date  DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','skipped','deviated')),
  actual_meal_id  UUID REFERENCES nutrition.meals(id),
  logged_via      TEXT CHECK (logged_via IN ('mealcam','manual')),
  deviation_kcal  NUMERIC(6,2),
  deviation_pct   NUMERIC(5,2),
  confirmed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meal_plan_logs_user_date ON nutrition.meal_plan_logs(user_id, execution_date);
ALTER TABLE nutrition.meal_plan_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_plan_logs_owner" ON nutrition.meal_plan_logs
  USING (auth.uid()::text = user_id::text);
```

---

## 13. nutrition.water_logs

```sql
CREATE TABLE nutrition.water_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  date        DATE NOT NULL,
  amount_ml   NUMERIC(8,2) NOT NULL,
  source      TEXT DEFAULT 'manual' CHECK (source IN ('manual','quick_add')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_water_logs_user_date ON nutrition.water_logs(user_id, date);
ALTER TABLE nutrition.water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "water_logs_owner" ON nutrition.water_logs
  USING (auth.uid()::text = user_id::text);
```

---

## 14. nutrition.nutrition_targets

Gecachte Tages-Targets. Täglich von Goals abgerufen und lokal eingefroren.

```sql
CREATE TABLE nutrition.nutrition_targets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  date            DATE NOT NULL,
  UNIQUE (user_id, date),

  -- Von Goals geliefert
  calorie_target  INTEGER NOT NULL,
  protein_target  INTEGER NOT NULL,
  carbs_target    INTEGER NOT NULL,
  fat_target      INTEGER NOT NULL,
  fiber_target    INTEGER DEFAULT 30,
  water_target    INTEGER NOT NULL,
  goal_phase      TEXT CHECK (goal_phase IN ('bulk','cut','maintain','prep')),

  source          TEXT DEFAULT 'goals' CHECK (source IN ('goals','fallback_calculated')),
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_nutrition_targets_user_date ON nutrition.nutrition_targets(user_id, date);
ALTER TABLE nutrition.nutrition_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_targets_owner" ON nutrition.nutrition_targets
  USING (auth.uid()::text = user_id::text);
```

---

## 15. nutrition.micro_flags

Mikronährstoff-Warnungen pro Nährstoff pro Tag.

```sql
CREATE TABLE nutrition.micro_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  date            DATE NOT NULL,
  nutrient_code   TEXT NOT NULL REFERENCES nutrition.nutrient_defs(code),
  flag_type       TEXT NOT NULL CHECK (flag_type IN ('deficit','surplus')),
  actual_value    NUMERIC(10,4) NOT NULL,
  target_value    NUMERIC(10,4) NOT NULL,
  pct_of_target   NUMERIC(6,2) NOT NULL,
  severity        TEXT NOT NULL CHECK (severity IN ('info','warn','critical')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Severity-Regeln:
-- deficit: <50% → critical | 50-80% → warn | 80-100% → info
-- surplus: >300% → critical | >200% → warn

CREATE INDEX idx_micro_flags_user_date ON nutrition.micro_flags(user_id, date);
ALTER TABLE nutrition.micro_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "micro_flags_owner" ON nutrition.micro_flags
  USING (auth.uid()::text = user_id::text);
```

---

## 16. VIEW: nutrition.daily_nutrition_summary

```sql
CREATE OR REPLACE VIEW nutrition.daily_nutrition_summary AS
SELECT
  m.user_id,
  m.date,
  COUNT(DISTINCT m.id)                          AS meal_count,

  -- Makros (direkte SUM — schnell)
  COALESCE(SUM(mi.enercc),  0)::NUMERIC(10,2)   AS total_kcal,
  COALESCE(SUM(mi.prot625), 0)::NUMERIC(10,3)   AS total_protein_g,
  COALESCE(SUM(mi.fat),     0)::NUMERIC(10,3)   AS total_fat_g,
  COALESCE(SUM(mi.cho),     0)::NUMERIC(10,3)   AS total_carbs_g,
  COALESCE(SUM(mi.fibt),    0)::NUMERIC(10,3)   AS total_fiber_g,
  COALESCE(SUM(mi.sugar),   0)::NUMERIC(10,3)   AS total_sugar_g,
  COALESCE(SUM(mi.fasat),   0)::NUMERIC(10,3)   AS total_fat_sat_g,
  COALESCE(SUM(mi.nacl),    0)::NUMERIC(10,3)   AS total_salt_g,
  COALESCE(SUM(mi.water_g), 0)::NUMERIC(10,3)   AS total_food_water_g,

  -- Wasser separat
  COALESCE((
    SELECT SUM(wl.amount_ml)
    FROM nutrition.water_logs wl
    WHERE wl.user_id = m.user_id AND wl.date = m.date
  ), 0)::NUMERIC(10,2)                           AS total_water_ml,

  -- Mikros (aus JSONB — flexibel, alle Tier-1 Nährstoffe)
  COALESCE(SUM((mi.nutrients->>'VITA')::NUMERIC),  0) AS total_vita_ug,
  COALESCE(SUM((mi.nutrients->>'VITD')::NUMERIC),  0) AS total_vitd_ug,
  COALESCE(SUM((mi.nutrients->>'VITE')::NUMERIC),  0) AS total_vite_mg,
  COALESCE(SUM((mi.nutrients->>'VITK')::NUMERIC),  0) AS total_vitk_ug,
  COALESCE(SUM((mi.nutrients->>'VITC')::NUMERIC),  0) AS total_vitc_mg,
  COALESCE(SUM((mi.nutrients->>'THIA')::NUMERIC),  0) AS total_thia_mg,
  COALESCE(SUM((mi.nutrients->>'RIBF')::NUMERIC),  0) AS total_ribf_mg,
  COALESCE(SUM((mi.nutrients->>'NIA')::NUMERIC),   0) AS total_nia_mg,
  COALESCE(SUM((mi.nutrients->>'VITB6')::NUMERIC), 0) AS total_vitb6_ug,
  COALESCE(SUM((mi.nutrients->>'FOL')::NUMERIC),   0) AS total_fol_ug,
  COALESCE(SUM((mi.nutrients->>'VITB12')::NUMERIC),0) AS total_vitb12_ug,
  COALESCE(SUM((mi.nutrients->>'NA')::NUMERIC),    0) AS total_na_mg,
  COALESCE(SUM((mi.nutrients->>'K')::NUMERIC),     0) AS total_k_mg,
  COALESCE(SUM((mi.nutrients->>'CA')::NUMERIC),    0) AS total_ca_mg,
  COALESCE(SUM((mi.nutrients->>'MG')::NUMERIC),    0) AS total_mg_mg,
  COALESCE(SUM((mi.nutrients->>'P')::NUMERIC),     0) AS total_p_mg,
  COALESCE(SUM((mi.nutrients->>'FE')::NUMERIC),    0) AS total_fe_mg,
  COALESCE(SUM((mi.nutrients->>'ZN')::NUMERIC),    0) AS total_zn_mg,
  COALESCE(SUM((mi.nutrients->>'ID')::NUMERIC),    0) AS total_id_ug,
  COALESCE(SUM((mi.nutrients->>'CHORL')::NUMERIC), 0) AS total_chorl_mg,

  -- Tier 2 Mikros
  COALESCE(SUM((mi.nutrients->>'FAPUN3')::NUMERIC),0) AS total_omega3_g,
  COALESCE(SUM((mi.nutrients->>'FAPUN6')::NUMERIC),0) AS total_omega6_g,
  COALESCE(SUM((mi.nutrients->>'LEU')::NUMERIC),   0) AS total_leu_g,
  COALESCE(SUM((mi.nutrients->>'AAE9')::NUMERIC),  0) AS total_eaa_g

FROM nutrition.meals m
LEFT JOIN nutrition.meal_items mi ON mi.meal_id = m.id
GROUP BY m.user_id, m.date;
```

---

## 17. Suchabfrage (Standard + Smart Search)

### Standard Search

```sql
SELECT
  f.id,
  f.name_display,
  f.name_display_en,
  f.bls_code,
  f.enercc,
  f.prot625,
  f.fat,
  f.cho,
  f.fibt,
  f.sort_weight,
  f.category_id,
  ARRAY_AGG(ft.tag_code) FILTER (WHERE ft.tag_code IS NOT NULL) AS tags,
  false AS is_custom
FROM nutrition.foods f
LEFT JOIN nutrition.food_tags ft ON ft.food_id = f.id
WHERE similarity(f.name_display, $1) > 0.15
   OR f.name_display ILIKE '%' || $1 || '%'
GROUP BY f.id
UNION ALL
SELECT
  fc.id,
  fc.name_de   AS name_display,
  fc.name_en   AS name_display_en,
  NULL         AS bls_code,
  fc.enercc, fc.prot625, fc.fat, fc.cho, fc.fibt,
  1001         AS sort_weight,  -- Custom Foods immer zuerst
  NULL         AS category_id,
  '{}'         AS tags,
  true         AS is_custom
FROM nutrition.foods_custom fc
WHERE fc.user_id = $2
  AND (similarity(fc.name_de, $1) > 0.15 OR fc.name_de ILIKE '%' || $1 || '%')
ORDER BY
  is_custom DESC,
  (similarity(name_display, $1) * 0.60) + (sort_weight / 1001.0 * 0.40) DESC
LIMIT $3 OFFSET $4;
```

### Smart Search (Preference-aware)

Preference-Score-Berechnung:
```
+100  für liked food (food_preference_items WHERE preference='liked' AND food_id = food.id)
-100  für disliked food
+50   für liked category (category_id in liked categories)
-50   für disliked category
+30   für liked tag
-100  für allergen tag match (aus food_preferences.allergies)
-100  für diet_type incompatible (e.g. vegan user → food has pork/beef/dairy)
```

---

## 18. Grants

```sql
GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role;

GRANT SELECT ON nutrition.foods, nutrition.nutrient_defs, nutrition.food_nutrients,
  nutrition.food_categories, nutrition.tag_definitions, nutrition.food_tags,
  nutrition.food_aliases TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  nutrition.foods_custom, nutrition.food_preferences, nutrition.food_preference_items,
  nutrition.meals, nutrition.meal_items, nutrition.recipes, nutrition.recipe_items,
  nutrition.meal_plans, nutrition.meal_plan_days, nutrition.meal_plan_items,
  nutrition.meal_plan_logs, nutrition.water_logs, nutrition.nutrition_targets,
  nutrition.micro_flags TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA nutrition TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA nutrition TO authenticated, service_role;
```

---

## Ausstehende Korrekturen in SPEC_06

Die folgenden 3 Fixes müssen beim nächsten Schreiben angewendet werden:

1. `nutrition.food_categories`: `name_th TEXT` nach `name_en` hinzufügen
2. `nutrition.foods_custom`: `source CHECK` → `('user','mealcam')` — `'openfoodfacts'` entfernen
3. `nutrition.foods_custom`: `name_th TEXT` Spalte nach `name_en` hinzufügen
4. `nutrition.shopping_lists` + `nutrition.shopping_list_items` Tabellen aus SPEC_02 (Entities 12+13) übernehmen
