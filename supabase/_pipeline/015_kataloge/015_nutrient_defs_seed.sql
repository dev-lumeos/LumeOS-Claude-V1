-- 015 Nutrient-Katalog (Seed)
-- Herkunft: supabase/migrations/20240522_002_nutrition_food_core_tables.sql
-- Extrahiert 2026-08-02. Nur dieser Block der Altdatei wurde real verwendet:
-- die Makro-Spalten (ALTER TABLE foods) und die beiden Funktionen aus derselben
-- Datei existieren [cmd] nicht im Container.
-- Erwartet nach Lauf: 138 Zeilen in nutrition.nutrient_defs.
-- Voraussetzung: 20260513_001 (Tabelle) und 20260513_002 (name_th/group_th).

BEGIN;

INSERT INTO nutrition.nutrient_defs
  (code, name_de, name_en, unit, group_de, group_en, sort_index, display_tier,
   is_always_computed, is_partly_computed, formula) VALUES

-- ENERGIE (Tier 1)
('ENERCJ','Energie (Kilojoule)','Energy (kilojoule)','kJ','Energie','Energy',1,1,true,false,
 'PROT625*17 + (CHO-POLYL)*17 + FAT*37 + ALC*29 + OA*13 + POLYL*10 + OLSAC*8 + FIBT*8'),
('ENERCC','Energie (Kilokalorien)','Energy (kilocalorie)','kcal','Energie','Energy',2,1,true,false,
 'PROT625*4 + (CHO-POLYL)*4 + FAT*9 + ALC*7 + OA*3 + POLYL*2.4 + OLSAC*2 + FIBT*2'),

-- MAKRONÃ„HRSTOFFE (Tier 1)
('WATER','Wasser','Water','g','MakronÃ¤hrstoffe','Proximate',3,1,false,false,NULL),
('PROT625','Protein (Nx6,25)','Protein (Nx6.25)','g','MakronÃ¤hrstoffe','Proximate',4,1,false,true,'PROT625=NT*6.25'),
('FAT','Fett','Fat','g','MakronÃ¤hrstoffe','Proximate',5,1,false,false,NULL),
('CHO','Kohlenhydrate, verfÃ¼gbar','Carbohydrate, available','g','MakronÃ¤hrstoffe','Proximate',6,1,true,false,
 'SUGAR+STARCH+OLSAC+POLYL'),
('FIBT','Ballaststoffe, gesamt','Fibre, dietary, total','g','MakronÃ¤hrstoffe','Proximate',7,1,false,true,
 'FIBHMW+FIBLMW'),
('ALC','Alkohol (Ethanol)','Alcohol (Ethanol)','g','MakronÃ¤hrstoffe','Proximate',8,1,false,false,NULL),
('OA','Organische SÃ¤uren, gesamt','Organic acids, total','g','MakronÃ¤hrstoffe','Proximate',9,2,false,true,
 'MALAC+ACEAC+LACAC+TARAC+CITAC'),
('ASH','Rohasche','Ash','g','MakronÃ¤hrstoffe','Proximate',10,2,false,false,NULL),

-- VITAMINE FETTLÃ–SLICH (Tier 1/2)
('VITA','Vitamin A, Retinol-Ã„quivalent (RE)','Vitamin A, Retinol equivalent (RE)','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',11,1,false,true,
 'RETOL + 1/6*CARTB + 1/12*CAROTPAXB'),
('VITAA','Vitamin A, Retinol-AktivitÃ¤ts-Ã„quivalent (RAE)','Vitamin A, Retinol activity equivalent (RAE)','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',12,2,false,true,
 'RETOL + 1/12*CARTB + 1/24*CAROTPAXB'),
('RETOL','Retinol','Retinol','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',13,2,false,false,NULL),
('CARTB','Beta-Carotin','Beta-carotene','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',14,2,false,false,NULL),
('CAROTPAXB','Carotinoide, auÃŸer Beta-Carotin','Carotenoids, except beta-carotene','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',15,3,false,false,NULL),
('VITD','Vitamin D','Vitamin D','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',16,1,false,true,'ERGCAL+CHOCAL'),
('CHOCAL','Vitamin D3 (Cholecalciferol)','Vitamin D3 (cholecalciferol)','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',17,2,false,false,NULL),
('ERGCAL','Vitamin D2 (Ergocalciferol)','Vitamin D2 (ergocalciferol)','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',18,2,false,false,NULL),
('VITE','Vitamin E (Alpha-Tocopherol)','Vitamin E (alpha-tocopherol)','mg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',19,1,false,false,NULL),
('TOCPHA','Alpha-Tocopherol','Alpha-tocopherol','mg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',20,2,false,false,NULL),
('TOCPHB','Beta-Tocopherol','Beta-tocopherol','mg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',21,3,false,false,NULL),
('TOCPHG','Gamma-Tocopherol','Gamma-tocopherol','mg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',22,3,false,false,NULL),
('TOCPHD','Delta-Tocopherol','Delta-tocopherol','mg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',23,3,false,false,NULL),
('TOCTRA','Alpha-Tocotrienol','Alpha-tocotrienol','mg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',24,3,false,false,NULL),
('VITK','Vitamin K','Vitamin K','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',25,1,false,true,'VITK1+VITK2'),
('VITK1','Vitamin K1 (Phyllochinon)','Vitamin K1 (phylloquinone)','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',26,2,false,false,NULL),
('VITK2','Vitamin K2 (Menachinone)','Vitamin K2 (menaquinone)','Âµg','FettlÃ¶sliche Vitamine','Fat-soluble vitamins',27,2,false,false,NULL),

-- VITAMINE WASSERLÃ–SLICH (Tier 1/2)
('THIA','Vitamin B1 (Thiamin)','Vitamin B1 (thiamin)','mg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',28,1,false,false,NULL),
('RIBF','Vitamin B2 (Riboflavin)','Vitamin B2 (riboflavin)','mg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',29,1,false,false,NULL),
('NIAEQ','Niacin-Ã„quivalent','Niacin equivalent','mg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',30,2,true,false,'NIA+TRP*1000/60'),
('NIA','Niacin','Niacin','mg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',31,1,false,false,NULL),
('PANTAC','PantothensÃ¤ure','Pantothenic acid','mg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',32,2,false,false,NULL),
('VITB6','Vitamin B6','Vitamin B6','Âµg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',33,1,false,false,NULL),
('BIOT','Biotin','Biotin','Âµg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',34,2,false,false,NULL),
('FOL','Folat-Ã„quivalent','Folate equivalent','Âµg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',35,1,true,false,'FOLFD+1.7*FOLAC'),
('FOLFD','Folat','Folate','Âµg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',36,2,false,false,NULL),
('FOLAC','FolsÃ¤ure, synthetisch','Folic acid, synthetic','Âµg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',37,2,false,false,NULL),
('VITB12','Vitamin B12 (Cobalamine)','Vitamin B12 (cobalamin)','Âµg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',38,1,false,false,NULL),
('VITC','Vitamin C','Vitamin C','mg','WasserlÃ¶sliche Vitamine','Water-soluble vitamins',39,1,false,false,NULL),

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
('ID','Iodid','Iodide','Âµg','Elemente','Elements',50,1,false,false,NULL),
('CU','Kupfer','Copper','Âµg','Elemente','Elements',51,2,false,false,NULL),
('MN','Mangan','Manganese','Âµg','Elemente','Elements',52,2,false,false,NULL),
('FD','Fluorid','Fluoride','Âµg','Elemente','Elements',53,3,false,false,NULL),
('CR','Chrom','Chromium','Âµg','Elemente','Elements',54,3,false,false,NULL),
('MO','MolybdÃ¤n','Molybdenum','Âµg','Elemente','Elements',55,3,false,false,NULL),

-- ORGANISCHE SÃ„UREN (Tier 3)
('ACEAC','EssigsÃ¤ure','Acetic acid','g','Organische SÃ¤uren','Organic acids',56,3,false,false,NULL),
('CITAC','ZitronensÃ¤ure','Citric acid','g','Organische SÃ¤uren','Organic acids',57,3,false,false,NULL),
('LACAC','MilchsÃ¤ure','Lactic acid','g','Organische SÃ¤uren','Organic acids',58,3,false,false,NULL),
('MALAC','Ã„pfelsÃ¤ure','Malic acid','g','Organische SÃ¤uren','Organic acids',59,3,false,false,NULL),
('TARAC','WeinsÃ¤ure','Tartaric acid','g','Organische SÃ¤uren','Organic acids',60,3,false,false,NULL),

-- ZUCKERALKOHOLE (Tier 2/3)
('POLYL','Zuckeralkohole, gesamt','Sugar alcohols, total','g','MakronÃ¤hrstoffe','Proximate',61,2,true,false,'MANTL+SORTL+XYLTL'),
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
('OLSAC','Oligosaccharide, verfÃ¼gbar','Oligosaccharides, available','g','Kohlenhydrate','Carbohydrates',74,3,false,false,NULL),
('STARCH','StÃ¤rke','Starch','g','Kohlenhydrate','Carbohydrates',75,2,false,false,NULL),

-- BALLASTSTOFFE DETAIL (Tier 2/3)
('FIBLMW','Ballaststoffe, niedermolekular','Fibre, low molecular weight','g','Ballaststoffe','Dietary fibres',76,3,false,false,NULL),
('FIBHMW','Ballaststoffe, hochmolekular','Fibre, high molecular weight','g','Ballaststoffe','Dietary fibres',77,3,false,true,'FIBHMWS+FIBHMWI'),
('FIBINS','Ballaststoffe, wasserunlÃ¶slich','Fibre, water insoluble','g','Ballaststoffe','Dietary fibres',78,3,false,false,NULL),
('FIBSOL','Ballaststoffe, wasserlÃ¶slich','Fibre, water soluble','g','Ballaststoffe','Dietary fibres',79,3,false,false,NULL),
('FIBHMWS','Ballaststoffe, hochmolekular, wasserlÃ¶slich','Fibre, HMW, water soluble','g','Ballaststoffe','Dietary fibres',80,3,false,false,NULL),
('FIBHMWI','Ballaststoffe, hochmolekular, wasserunlÃ¶slich','Fibre, HMW, water insoluble','g','Ballaststoffe','Dietary fibres',81,3,false,false,NULL),

-- FETTSÃ„UREN SUMMEN (Tier 1/2)
('FASAT','FettsÃ¤uren, gesÃ¤ttigt, gesamt','Fatty acids, saturated, total','g','FettsÃ¤uren','Fatty acids',82,1,true,false,
 'F4:0+F6:0+F8:0+F10:0+F12:0+F14:0+F15:0+F16:0+F17:0+F18:0+F20:0+F22:0+F24:0'),
('FAMS','FettsÃ¤uren, einfach ungesÃ¤ttigt, gesamt','Fatty acids, monounsaturated, total','g','FettsÃ¤uren','Fatty acids',96,2,true,false,
 'F14:1CN5+F16:1CN7+F18:1CN7+F18:1CN9+F20:1CN9+F22:1CN9'),
('FAPU','FettsÃ¤uren, mehrfach ungesÃ¤ttigt, gesamt','Fatty acids, polyunsaturated, total','g','FettsÃ¤uren','Fatty acids',103,2,true,false,
 'F18:2C9T11+F18:2CN6+F20:2CN6+F18:3CN3+F18:3CN6+F20:3CN6+F18:4CN3+F20:4CN6+F20:5CN3+F22:5CN3+F22:6CN3'),
('FAPUN3','Omega-3-FettsÃ¤uren, gesamt','Fatty acids, n-3, total','g','FettsÃ¤uren','Fatty acids',104,2,true,false,
 'F18:3CN3+F18:4CN3+F20:5CN3+F22:5CN3+F22:6CN3'),
('FAPUN6','Omega-6-FettsÃ¤uren, gesamt','Fatty acids, n-6, total','g','FettsÃ¤uren','Fatty acids',110,2,true,false,
 'F18:2CN6+F18:3CN6+F20:2CN6+F20:3CN6+F20:4CN6'),

-- GESÃ„TTIGTE FETTSÃ„UREN EINZEL (Tier 3 â€” ausser F16:0 â†’ Tier 2)
('F4:0','FettsÃ¤ure C4:0 (ButtersÃ¤ure)','Fatty acid C4:0 (butyric acid)','g','FettsÃ¤uren','Fatty acids',83,3,false,false,NULL),
('F6:0','FettsÃ¤ure C6:0 (CapronsÃ¤ure)','Fatty acid C6:0 (caproic acid)','g','FettsÃ¤uren','Fatty acids',84,3,false,false,NULL),
('F8:0','FettsÃ¤ure C8:0 (CaprylsÃ¤ure)','Fatty acid C8:0 (caprylic acid)','g','FettsÃ¤uren','Fatty acids',85,3,false,false,NULL),
('F10:0','FettsÃ¤ure C10:0 (CaprinsÃ¤ure)','Fatty acid C10:0 (capric acid)','g','FettsÃ¤uren','Fatty acids',86,3,false,false,NULL),
('F12:0','FettsÃ¤ure C12:0 (LaurinsÃ¤ure)','Fatty acid C12:0 (lauric acid)','g','FettsÃ¤uren','Fatty acids',87,3,false,false,NULL),
('F14:0','FettsÃ¤ure C14:0 (MyristinsÃ¤ure)','Fatty acid C14:0 (myristic acid)','g','FettsÃ¤uren','Fatty acids',88,3,false,false,NULL),
('F15:0','FettsÃ¤ure C15:0 (PentadecylsÃ¤ure)','Fatty acid C15:0 (pentadecanoic acid)','g','FettsÃ¤uren','Fatty acids',89,3,false,false,NULL),
('F16:0','FettsÃ¤ure C16:0 (PalmitinsÃ¤ure)','Fatty acid C16:0 (palmitic acid)','g','FettsÃ¤uren','Fatty acids',90,2,false,false,NULL),
('F17:0','FettsÃ¤ure C17:0 (MargarinsÃ¤ure)','Fatty acid C17:0 (margaric acid)','g','FettsÃ¤uren','Fatty acids',91,3,false,false,NULL),
('F18:0','FettsÃ¤ure C18:0 (StearinsÃ¤ure)','Fatty acid C18:0 (stearic acid)','g','FettsÃ¤uren','Fatty acids',92,3,false,false,NULL),
('F20:0','FettsÃ¤ure C20:0 (ArachinsÃ¤ure)','Fatty acid C20:0 (arachidic acid)','g','FettsÃ¤uren','Fatty acids',93,3,false,false,NULL),
('F22:0','FettsÃ¤ure C22:0 (BehensÃ¤ure)','Fatty acid C22:0 (behenic acid)','g','FettsÃ¤uren','Fatty acids',94,3,false,false,NULL),
('F24:0','FettsÃ¤ure C24:0 (LignocerinsÃ¤ure)','Fatty acid C24:0 (lignoceric acid)','g','FettsÃ¤uren','Fatty acids',95,3,false,false,NULL),

-- EINFACH UNGESÃ„TTIGTE FS EINZEL (Tier 2/3)
('F14:1CN5','FettsÃ¤ure C14:1 n-5 cis (MyristoleinsÃ¤ure)','Fatty acid C14:1 n-5 (myristoleic acid)','g','FettsÃ¤uren','Fatty acids',97,3,false,false,NULL),
('F16:1CN7','FettsÃ¤ure C16:1 n-7 cis (PalmitoleinsÃ¤ure)','Fatty acid C16:1 n-7 (palmitoleic acid)','g','FettsÃ¤uren','Fatty acids',98,3,false,false,NULL),
('F18:1CN7','FettsÃ¤ure C18:1 n-7 cis (VaccensÃ¤ure)','Fatty acid C18:1 n-7 (vaccenic acid)','g','FettsÃ¤uren','Fatty acids',99,3,false,false,NULL),
('F18:1CN9','FettsÃ¤ure C18:1 n-9 cis (Ã–lsÃ¤ure)','Fatty acid C18:1 n-9 (oleic acid)','g','FettsÃ¤uren','Fatty acids',100,2,false,false,NULL),
('F20:1CN9','FettsÃ¤ure C20:1 n-9 cis (GondosÃ¤ure)','Fatty acid C20:1 n-9 (gondoic acid)','g','FettsÃ¤uren','Fatty acids',101,3,false,false,NULL),
('F22:1CN9','FettsÃ¤ure C22:1 n-9 cis (ErucasÃ¤ure)','Fatty acid C22:1 n-9 (erucic acid)','g','FettsÃ¤uren','Fatty acids',102,3,false,false,NULL),

-- MEHRFACH UNGESÃ„TTIGTE FS EINZEL (Tier 2/3)
('F18:2CN6','FettsÃ¤ure C18:2 n-6 cis (LinolsÃ¤ure)','Fatty acid C18:2 n-6 (linoleic acid)','g','FettsÃ¤uren','Fatty acids',111,2,false,false,NULL),
('F18:2C9T11','FettsÃ¤ure C18:2 n-7 cis 9, trans 11 (konjugierte LinolsÃ¤ure)','Fatty acid C18:2 n-7 c9,t11 (conjugated linoleic acid)','g','FettsÃ¤uren','Fatty acids',112,3,false,false,NULL),
('F18:3CN3','FettsÃ¤ure C18:3 n-3 all-cis (Alpha-LinolensÃ¤ure)','Fatty acid C18:3 n-3 (alpha-linolenic acid, ALA)','g','FettsÃ¤uren','Fatty acids',105,2,false,false,NULL),
('F18:3CN6','FettsÃ¤ure C18:3 n-6 all-cis (Gamma-LinolensÃ¤ure)','Fatty acid C18:3 n-6 (gamma-linolenic acid)','g','FettsÃ¤uren','Fatty acids',113,3,false,false,NULL),
('F18:4CN3','FettsÃ¤ure C18:4 n-3 all-cis (StearidonsÃ¤ure)','Fatty acid C18:4 n-3 (stearidonic acid)','g','FettsÃ¤uren','Fatty acids',106,3,false,false,NULL),
('F20:2CN6','FettsÃ¤ure C20:2 n-6 all-cis (EicosadiensÃ¤ure)','Fatty acid C20:2 n-6 (eicosadienoic acid)','g','FettsÃ¤uren','Fatty acids',114,3,false,false,NULL),
('F20:3CN6','FettsÃ¤ure C20:3 n-6 all-cis (Dihomogamma-LinolensÃ¤ure)','Fatty acid C20:3 n-6 (dihomo-gamma-linolenic acid)','g','FettsÃ¤uren','Fatty acids',115,3,false,false,NULL),
('F20:4CN6','FettsÃ¤ure C20:4 n-6 all-cis (ArachidonsÃ¤ure)','Fatty acid C20:4 n-6 (arachidonic acid)','g','FettsÃ¤uren','Fatty acids',116,2,false,false,NULL),
('F20:5CN3','FettsÃ¤ure C20:5 n-3 all-cis (EicosapentaensÃ¤ure, EPA)','Fatty acid C20:5 n-3 (eicosapentaenoic acid, EPA)','g','FettsÃ¤uren','Fatty acids',107,2,false,false,NULL),
('F22:5CN3','FettsÃ¤ure C22:5 n-3 all-cis (DocosapentaensÃ¤ure)','Fatty acid C22:5 n-3 (docosapentaenoic acid)','g','FettsÃ¤uren','Fatty acids',108,3,false,false,NULL),
('F22:6CN3','FettsÃ¤ure C22:6 n-3 all-cis (DocosahexaensÃ¤ure, DHA)','Fatty acid C22:6 n-3 (docosahexaenoic acid, DHA)','g','FettsÃ¤uren','Fatty acids',109,2,false,false,NULL),
('FAX','FettsÃ¤uren, sonstige','Fatty acids, other','g','FettsÃ¤uren','Fatty acids',117,3,false,false,NULL),

-- CHOLESTERIN (Tier 1)
('CHORL','Cholesterin','Cholesterol','mg','Sonstige NÃ¤hrstoffe','Other nutrients',118,1,false,false,NULL),

-- AMINOSÃ„UREN (Tier 2/3)
('AAE9','AminosÃ¤uren, unentbehrlich, gesamt','Amino acids, essential, total','g','AminosÃ¤uren','Amino acids',119,2,true,false,
 'ILE+LEU+LYS+MET+PHE+THR+TRP+VAL+HIS'),
('ALA','Alanin','Alanine','g','AminosÃ¤uren','Amino acids',120,3,false,false,NULL),
('ARG','Arginin','Arginine','g','AminosÃ¤uren','Amino acids',121,3,false,false,NULL),
('ASP','AsparaginsÃ¤ure, inklusive Asparagin','Aspartic acid, incl. asparagine','g','AminosÃ¤uren','Amino acids',122,3,false,false,NULL),
('CYSTE','Cystein','Cysteine','g','AminosÃ¤uren','Amino acids',123,3,false,false,NULL),
('GLU','GlutaminsÃ¤ure, inklusive Glutamin','Glutamic acid, incl. glutamine','g','AminosÃ¤uren','Amino acids',124,3,false,false,NULL),
('GLY','Glycin','Glycine','g','AminosÃ¤uren','Amino acids',125,3,false,false,NULL),
('HIS','Histidin','Histidine','g','AminosÃ¤uren','Amino acids',126,2,false,false,NULL),
('ILE','Isoleucin','Isoleucine','g','AminosÃ¤uren','Amino acids',127,2,false,false,NULL),
('LEU','Leucin','Leucine','g','AminosÃ¤uren','Amino acids',128,2,false,false,NULL),
('LYS','Lysin','Lysine','g','AminosÃ¤uren','Amino acids',129,2,false,false,NULL),
('MET','Methionin','Methionine','g','AminosÃ¤uren','Amino acids',130,2,false,false,NULL),
('PHE','Phenylalanin','Phenylalanine','g','AminosÃ¤uren','Amino acids',131,2,false,false,NULL),
('PRO','Prolin','Proline','g','AminosÃ¤uren','Amino acids',132,3,false,false,NULL),
('SER','Serin','Serine','g','AminosÃ¤uren','Amino acids',133,3,false,false,NULL),
('THR','Threonin','Threonine','g','AminosÃ¤uren','Amino acids',134,2,false,false,NULL),
('TRP','Tryptophan','Tryptophan','g','AminosÃ¤uren','Amino acids',135,2,false,false,NULL),
('TYR','Tyrosin','Tyrosine','g','AminosÃ¤uren','Amino acids',136,3,false,false,NULL),
('VAL','Valin','Valine','g','AminosÃ¤uren','Amino acids',137,2,false,false,NULL),

-- STICKSTOFF (Tier 3)
('NT','Stickstoff, gesamt','Nitrogen, total','g','Sonstige NÃ¤hrstoffe','Other nutrients',138,3,false,false,NULL)
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

COMMIT;