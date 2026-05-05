-- =============================================================
-- Migration: Nutrition Food Core Tables
-- Workorder: WO-nutrition-003
-- Date: 2024-05-20
-- Description: Creates nutrition food core tables, seeds the 138 BLS nutrient definitions from SPEC_06_DATABASE_SCHEMA.md, seeds the 16 V1 tag definitions, and installs deterministic auto-tagging.
-- Rollback note only: reverse manually by dropping trg_foods_auto_tag, nutrition.trg_auto_tag_food_fn(), nutrition.auto_tag_food(UUID), then the seven WO-003 tables after confirming no dependent user data exists.
-- =============================================================

CREATE SCHEMA IF NOT EXISTS nutrition;

CREATE TABLE IF NOT EXISTS nutrition.nutrient_defs (
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
('NT','Stickstoff, gesamt','Nitrogen, total','g','Sonstige Nährstoffe','Other nutrients',138,3,false,false,NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  unit = EXCLUDED.unit,
  group_de = EXCLUDED.group_de,
  group_en = EXCLUDED.group_en,
  sort_index = EXCLUDED.sort_index,
  display_tier = EXCLUDED.display_tier,
  is_always_computed = EXCLUDED.is_always_computed,
  is_partly_computed = EXCLUDED.is_partly_computed,
  formula = EXCLUDED.formula;

CREATE TABLE IF NOT EXISTS nutrition.food_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name_de     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  name_th     TEXT,
  parent_id   UUID REFERENCES nutrition.food_categories(id),
  level       INTEGER NOT NULL CHECK (level IN (1,2,3,4)),
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0,
  bls_hint    TEXT
);

CREATE INDEX IF NOT EXISTS idx_food_categories_parent ON nutrition.food_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_food_categories_level ON nutrition.food_categories(level);

CREATE TABLE IF NOT EXISTS nutrition.foods (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bls_code          TEXT UNIQUE NOT NULL,
  name_de           TEXT NOT NULL,
  name_en           TEXT,
  name_display      TEXT,
  name_display_en   TEXT,
  category_id       UUID REFERENCES nutrition.food_categories(id),
  sort_weight       INTEGER NOT NULL DEFAULT 500 CHECK (sort_weight BETWEEN 0 AND 1000),
  processing_level  TEXT DEFAULT 'raw'
    CHECK (processing_level IN ('raw','minimally_processed','processed','ultra_processed','cooked','fermented','smoked','dried','canned','fortified')),
  is_prepared_dish  BOOLEAN NOT NULL DEFAULT false,
  enercc            NUMERIC(8,2),
  enercj            NUMERIC(8,2),
  water_g           NUMERIC(8,3),
  prot625           NUMERIC(8,3),
  fat               NUMERIC(8,3),
  cho               NUMERIC(8,3),
  fibt              NUMERIC(8,3),
  sugar             NUMERIC(8,3),
  fasat             NUMERIC(8,3),
  nacl              NUMERIC(8,3),
  alc               NUMERIC(8,3),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_foods_name_de_trgm ON nutrition.foods USING GIN (name_display gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_name_display ON nutrition.foods USING GIN (name_display gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_sort_weight ON nutrition.foods(sort_weight DESC);
CREATE INDEX IF NOT EXISTS idx_foods_category ON nutrition.foods(category_id);
CREATE INDEX IF NOT EXISTS idx_foods_bls_code ON nutrition.foods(bls_code);

CREATE TABLE IF NOT EXISTS nutrition.food_nutrients (
  food_id        UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  nutrient_code  TEXT NOT NULL REFERENCES nutrition.nutrient_defs(code),
  value          NUMERIC(12,5) NOT NULL,
  data_source    TEXT NOT NULL,
  PRIMARY KEY (food_id, nutrient_code)
);

CREATE INDEX IF NOT EXISTS idx_food_nutrients_food ON nutrition.food_nutrients(food_id);
CREATE INDEX IF NOT EXISTS idx_food_nutrients_code ON nutrition.food_nutrients(nutrient_code);

CREATE TABLE IF NOT EXISTS nutrition.food_aliases (
  food_id  UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  alias    TEXT NOT NULL,
  locale   TEXT NOT NULL DEFAULT 'de',
  source   TEXT NOT NULL DEFAULT 'editorial'
    CHECK (source IN ('editorial','ai_generated','user')),
  PRIMARY KEY (food_id, alias, locale)
);

CREATE INDEX IF NOT EXISTS idx_food_aliases_alias_trgm ON nutrition.food_aliases USING GIN (alias gin_trgm_ops);

CREATE TABLE IF NOT EXISTS nutrition.tag_definitions (
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
);

INSERT INTO nutrition.tag_definitions
  (code, name_de, name_en, tag_type, is_exclusion_relevant, sort_order, requires_macro_check, macro_rule) VALUES
  ('high_protein','High protein','High protein','fitness',false,10,true,'{"field":"prot625","op":">=","value":20}'::jsonb),
  ('low_carb','Low carb','Low carb','fitness',false,20,true,'{"field":"cho","op":"<=","value":10}'::jsonb),
  ('low_fat','Low fat','Low fat','fitness',false,30,true,'{"field":"fat","op":"<=","value":3}'::jsonb),
  ('high_fiber','High fiber','High fiber','fitness',false,40,true,'{"field":"fibt","op":">=","value":6}'::jsonb),
  ('vegan','Vegan','Vegan','diet',true,50,false,NULL),
  ('vegetarian','Vegetarian','Vegetarian','diet',true,60,false,NULL),
  ('gluten_free','Gluten free','Gluten free','diet',true,70,false,NULL),
  ('lactose_free','Lactose free','Lactose free','diet',true,80,false,NULL),
  ('nut_free','Nut free','Nut free','diet',true,90,false,NULL),
  ('halal','Halal','Halal','diet',true,100,false,NULL),
  ('kosher','Kosher','Kosher','diet',true,110,false,NULL),
  ('spicy','Spicy','Spicy','ingredient',false,120,false,NULL),
  ('thai_food','Thai food','Thai food','ingredient',false,130,false,NULL),
  ('mediterranean','Mediterranean','Mediterranean','diet',false,140,false,NULL),
  ('processed_food','Processed food','Processed food','processing',false,150,false,NULL),
  ('ultra_processed','Ultra processed','Ultra processed','processing',false,160,false,NULL)
ON CONFLICT (code) DO UPDATE SET
  name_de = EXCLUDED.name_de,
  name_en = EXCLUDED.name_en,
  tag_type = EXCLUDED.tag_type,
  is_exclusion_relevant = EXCLUDED.is_exclusion_relevant,
  sort_order = EXCLUDED.sort_order,
  requires_macro_check = EXCLUDED.requires_macro_check,
  macro_rule = EXCLUDED.macro_rule;

CREATE TABLE IF NOT EXISTS nutrition.food_tags (
  food_id     UUID NOT NULL REFERENCES nutrition.foods(id) ON DELETE CASCADE,
  tag_code    TEXT NOT NULL REFERENCES nutrition.tag_definitions(code),
  confidence  NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  PRIMARY KEY (food_id, tag_code)
);

CREATE INDEX IF NOT EXISTS idx_food_tags_food ON nutrition.food_tags(food_id);
CREATE INDEX IF NOT EXISTS idx_food_tags_code ON nutrition.food_tags(tag_code);

CREATE OR REPLACE FUNCTION nutrition.auto_tag_food(p_food_id UUID)
RETURNS VOID AS $$
DECLARE
  v_food nutrition.foods%ROWTYPE;
  v_category_slug TEXT;
  deterministic_tags CONSTANT TEXT[] := ARRAY[
    'high_protein','low_carb','low_fat','high_fiber','vegan','vegetarian',
    'gluten_free','lactose_free','nut_free','mediterranean','processed_food','ultra_processed'
  ];
BEGIN
  SELECT * INTO v_food FROM nutrition.foods WHERE id = p_food_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT slug INTO v_category_slug FROM nutrition.food_categories WHERE id = v_food.category_id;

  DELETE FROM nutrition.food_tags
  WHERE food_id = p_food_id
    AND tag_code = ANY(deterministic_tags);

  IF v_food.prot625 IS NOT NULL AND v_food.prot625 >= 20 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'high_protein', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.cho IS NOT NULL AND v_food.cho <= 10 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'low_carb', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.fat IS NOT NULL AND v_food.fat <= 3 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'low_fat', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.fibt IS NOT NULL AND v_food.fibt >= 6 THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'high_fiber', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.processing_level IN ('processed','cooked','fermented','smoked','dried','canned','fortified') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'processed_food', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_food.processing_level = 'ultra_processed' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'processed_food', 1.0) ON CONFLICT DO NOTHING;
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'ultra_processed', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_category_slug IN ('vegetables','fruit','legumes','nuts-seeds','cereals','potatoes','herbs-spices') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'vegan', 1.0) ON CONFLICT DO NOTHING;
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'vegetarian', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_category_slug IN ('milk-dairy-eggs') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'vegetarian', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_category_slug IN ('fruit','vegetables','potatoes','milk-dairy-eggs','fish-seafood','meat') THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'gluten_free', 1.0) ON CONFLICT DO NOTHING;
  END IF;
  IF v_category_slug IS DISTINCT FROM 'milk-dairy-eggs' AND COALESCE(v_food.name_de,'') !~* '(milch|k?se|kaese|joghurt|quark|sahne)' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'lactose_free', 0.8) ON CONFLICT DO NOTHING;
  END IF;
  IF COALESCE(v_food.name_de,'') !~* '(nuss|n?sse|nuesse|mandel|cashew|walnuss|haselnuss|erdnuss)' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'nut_free', 0.8) ON CONFLICT DO NOTHING;
  END IF;
  IF COALESCE(v_food.name_de,'') ~* '(olive|tomate|fisch|bohne|linse|aubergine|zucchini)' THEN
    INSERT INTO nutrition.food_tags VALUES (p_food_id, 'mediterranean', 0.8) ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION nutrition.trg_auto_tag_food_fn()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM nutrition.auto_tag_food(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_foods_auto_tag
  AFTER INSERT OR UPDATE OF bls_code, name_de, category_id, processing_level, prot625, fat, cho, fibt, enercc
  ON nutrition.foods
  FOR EACH ROW
  EXECUTE FUNCTION nutrition.trg_auto_tag_food_fn();

ALTER TABLE nutrition.nutrient_defs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.tag_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_tags ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_specs CONSTANT TEXT[][] := ARRAY[
    ARRAY['nutrient_defs','nutrient_defs_select'],
    ARRAY['food_categories','food_categories_select'],
    ARRAY['foods','foods_select_all'],
    ARRAY['food_nutrients','food_nutrients_select'],
    ARRAY['food_aliases','food_aliases_select'],
    ARRAY['tag_definitions','tag_defs_select'],
    ARRAY['food_tags','food_tags_select']
  ];
  spec TEXT[];
BEGIN
  FOREACH spec SLICE 1 IN ARRAY policy_specs LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'nutrition'
        AND tablename = spec[1]
        AND policyname = spec[2]
    ) THEN
      EXECUTE format('CREATE POLICY %I ON nutrition.%I FOR SELECT TO authenticated USING (true)', spec[2], spec[1]);
    END IF;
  END LOOP;
END;
$$;

GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role;
GRANT SELECT ON TABLE
  nutrition.nutrient_defs,
  nutrition.food_categories,
  nutrition.foods,
  nutrition.food_nutrients,
  nutrition.food_aliases,
  nutrition.tag_definitions,
  nutrition.food_tags
TO authenticated;
GRANT ALL ON TABLE
  nutrition.nutrient_defs,
  nutrition.food_categories,
  nutrition.foods,
  nutrition.food_nutrients,
  nutrition.food_aliases,
  nutrition.tag_definitions,
  nutrition.food_tags
TO service_role;
