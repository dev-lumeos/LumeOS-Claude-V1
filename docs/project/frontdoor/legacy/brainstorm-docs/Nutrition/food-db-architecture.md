# Lumeos Food Database — Architektur

**Date:** 2026-02-17
**Status:** Definiert (aligned mit LUMEOS_OVERVIEW.md)

---

## Kernentscheidung: Eigene Food-DB mit BLS-Basis

Lumeos betreibt eine **eigene Food-Datenbank** (`foods` Tabelle), die initial mit BLS 4.0 befüllt und mit zusätzlichen Feldern angereichert wird.

### Warum BLS als Basis?

| Kriterium | BLS 4.0 | USDA SR/FNDDS | Open Food Facts |
|-----------|---------|---------------|-----------------|
| **Nährstoffe** | **138** | 53 | Variabel (5-30) |
| **Laboranalysen** | ✅ Max Rubner-Institut | ✅ USDA Labs | ❌ Crowdsourced |
| **Mikronährstoffe** | ✅ Vollständig inkl. neue Vitaminformen | 🟡 Teilweise | ❌ Meist nur Macros |
| **Einträge** | 7.140 | 8.133 | 3M+ (aber Qualität variiert stark) |
| **Lizenz** | CC BY 4.0 (kostenlos) | Public Domain | ODbL |
| **Sprache** | DE (DACH-Start) | EN | Multi |
| **Datenqualität** | ⭐⭐⭐⭐⭐ Lab-Grade | ⭐⭐⭐⭐⭐ Lab-Grade | ⭐⭐ User-Generated |

**BLS gewinnt weil:** 138 Nährstoffe pro Eintrag (fast 3× USDA), echte Laboranalysen, perfekt für DACH-Marktstart, und seit Dez 2025 komplett kostenlos.

---

## Datenbank-Architektur

### Eigene `foods` Tabelle (Supabase/Postgres)

```
┌──────────────────────────────────────────────────────────────┐
│                    LUMEOS FOOD DATABASE                        │
│                    (eigene Postgres-Tabelle)                   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Basis: BLS 4.0 (7.140 Einträge, 138 Nährstoffe)             │
│  ───────────────────────────────────────────────              │
│                                                                │
│  + Angereicherte Felder:                                       │
│    · Lumeos-Food-ID (statt BLS-Schlüssel)                     │
│    · Barcode/EAN (aus OpenFoodFacts Mapping)                  │
│    · Portionsgrößen (foods_portions)                          │
│    · Kategorie-Tags (für Suche/Filter)                        │
│    · Allergen-Flags                                            │
│    · Confidence Score (Lab = 1.0, Calculated = 0.7, User = 0.5)│
│    · Sprach-Varianten (DE/EN/TH)                              │
│    · created_at, updated_at, source                           │
│                                                                │
│  + Ergänzungsquellen (Merge/Fallback):                        │
│    · USDA Foundation Foods (365, Lab-analyzed)                 │
│    · USDA SR/FNDDS (8.133, 53 Nährstoffe)                    │
│    · Fineli (4.156, FI, vollständig)                          │
│    · CIQUAL (3.185, FR, 61 Nährstoffe)                       │
│    · CoFID/McCance & Widdowson (2.886, UK)                    │
│    · Swiss NWD (naehrwertdaten.ch, 1.190, CH)                 │
│    · OpenFoodFacts (Barcode-Matching + fehlende Produkte)     │
│                                                                │
│  + User-Generated:                                             │
│    · foods_custom (pro User, verifizierbar)                   │
│    · MealCam Corrections (Feedback Loop)                      │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Tabellen-Schema (Kern)

```sql
-- Lumeos eigene Food-DB
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bls_code TEXT,                    -- BLS 4.0 Schlüssel (nullable)
  usda_ndb_number TEXT,             -- USDA Reference (nullable)
  name_de TEXT NOT NULL,            -- Deutscher Name (BLS)
  name_en TEXT,                     -- English Name
  name_th TEXT,                     -- Thai Name (Phase 2)
  category TEXT NOT NULL,           -- BLS-Kategorie
  tags TEXT[],                      -- Such-Tags
  
  -- Macros (pro 100g)
  energy_kcal NUMERIC(7,2),
  energy_kj NUMERIC(7,2),
  protein_g NUMERIC(7,3),
  fat_g NUMERIC(7,3),
  carbohydrates_g NUMERIC(7,3),
  fiber_g NUMERIC(7,3),
  
  -- Mikronährstoffe (138 aus BLS)
  -- Vitamine
  vitamin_a_ug NUMERIC(7,3),       -- Retinol-Äquivalent
  vitamin_a_retinol_ug NUMERIC(7,3),
  beta_carotene_ug NUMERIC(7,3),
  vitamin_d_ug NUMERIC(7,3),
  vitamin_d2_ug NUMERIC(7,3),      -- NEU in BLS 4.0
  vitamin_d3_ug NUMERIC(7,3),      -- NEU in BLS 4.0
  vitamin_e_mg NUMERIC(7,3),
  vitamin_k_ug NUMERIC(7,3),
  vitamin_k1_ug NUMERIC(7,3),      -- NEU in BLS 4.0
  vitamin_k2_ug NUMERIC(7,3),      -- NEU in BLS 4.0
  vitamin_c_mg NUMERIC(7,3),
  vitamin_b1_mg NUMERIC(7,3),      -- Thiamin
  vitamin_b2_mg NUMERIC(7,3),      -- Riboflavin
  vitamin_b3_mg NUMERIC(7,3),      -- Niacin
  vitamin_b5_mg NUMERIC(7,3),      -- Pantothensäure
  vitamin_b6_mg NUMERIC(7,3),
  vitamin_b7_ug NUMERIC(7,3),      -- Biotin
  vitamin_b9_ug NUMERIC(7,3),      -- Folat
  vitamin_b12_ug NUMERIC(7,3),
  
  -- Mineralstoffe
  calcium_mg NUMERIC(7,3),
  iron_mg NUMERIC(7,3),
  magnesium_mg NUMERIC(7,3),
  phosphorus_mg NUMERIC(7,3),
  potassium_mg NUMERIC(7,3),
  sodium_mg NUMERIC(7,3),
  zinc_mg NUMERIC(7,3),
  copper_mg NUMERIC(7,3),
  manganese_mg NUMERIC(7,3),
  selenium_ug NUMERIC(7,3),
  iodine_ug NUMERIC(7,3),
  fluoride_ug NUMERIC(7,3),
  chromium_ug NUMERIC(7,3),
  molybdenum_ug NUMERIC(7,3),
  
  -- Fettsäuren
  saturated_fat_g NUMERIC(7,3),
  monounsaturated_fat_g NUMERIC(7,3),
  polyunsaturated_fat_g NUMERIC(7,3),
  omega3_g NUMERIC(7,3),
  omega6_g NUMERIC(7,3),
  trans_fat_g NUMERIC(7,3),
  cholesterol_mg NUMERIC(7,3),
  
  -- Zucker & Stärke
  sugar_g NUMERIC(7,3),
  starch_g NUMERIC(7,3),
  
  -- Aminosäuren (BLS hat alle essentiellen)
  leucine_mg NUMERIC(7,1),
  isoleucine_mg NUMERIC(7,1),
  valine_mg NUMERIC(7,1),
  lysine_mg NUMERIC(7,1),
  methionine_mg NUMERIC(7,1),
  phenylalanine_mg NUMERIC(7,1),
  threonine_mg NUMERIC(7,1),
  tryptophan_mg NUMERIC(7,1),
  histidine_mg NUMERIC(7,1),
  
  -- ... (weitere 80+ Felder aus BLS Mapping)
  
  -- Meta
  source TEXT NOT NULL DEFAULT 'bls_4.0',  -- bls_4.0, usda, off, user
  confidence NUMERIC(3,2) DEFAULT 1.0,     -- 1.0=lab, 0.7=calculated, 0.5=user
  barcode TEXT,                             -- EAN/UPC (aus OFF Mapping)
  portion_default_g NUMERIC(6,1),          -- Standard-Portion
  allergens TEXT[],                         -- gluten, lactose, nuts, etc.
  is_verified BOOLEAN DEFAULT true,         -- BLS/USDA = true, User = false
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Portionsgrößen
CREATE TABLE foods_portions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES foods(id),
  name_de TEXT NOT NULL,            -- "1 Scheibe", "1 Tasse", "1 mittel"
  name_en TEXT,
  amount_g NUMERIC(6,1) NOT NULL,
  is_default BOOLEAN DEFAULT false
);

-- User-eigene Foods
CREATE TABLE foods_custom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  -- gleiche Nährstoff-Felder wie foods
  energy_kcal NUMERIC(7,2),
  protein_g NUMERIC(7,3),
  fat_g NUMERIC(7,3),
  carbohydrates_g NUMERIC(7,3),
  -- ... (vereinfachtes Schema, User gibt ein was er weiß)
  source TEXT DEFAULT 'user',
  barcode TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Import-Pipeline

### Phase 1: BLS 4.0 als Basis (Launch)

```
BLS_4_0_2025_DE.zip
    ↓ Download (CC BY 4.0, kostenlos)
    ↓ Parse (ZIP → CSV/Excel)
    ↓ Map BLS-Felder → Lumeos-Schema
    ↓ Normalize (Einheiten, Dezimalstellen)
    ↓ Import → foods Tabelle
    ↓ Generate foods_portions (BLS Standard-Portionen)
    = 7.140 Einträge, 138 Nährstoffe pro Eintrag
```

**BLS Download:** https://blsdb.de/download
**Format:** ZIP (CSV)
**Lizenz:** CC BY 4.0 — Namensnennung: Max Rubner-Institut
**DOI:** 10.25826/Data20251217-134202-0

### Phase 2: Anreicherung mit EU-Datenbanken

| Quelle | Land | Einträge | Nährstoffe | Format | Lizenz | Strategie |
|--------|------|----------|------------|--------|--------|-----------|
| **BLS 4.0** | 🇩🇪 DE | 7.140 | 138 | CSV (ZIP) | CC BY 4.0 | **Basis** |
| **USDA Foundation** | 🇺🇸 US | 365 | Lab-analyzed | JSON API | Public Domain | Merge (Gold-Standard Referenz) |
| **USDA SR/FNDDS** | 🇺🇸 US | 8.133 | 53 | CSV/JSON | Public Domain | Merge (US-Foods + Portionsgrößen) |
| **Fineli** | 🇫🇮 FI | 4.156 | 50+ | Open API | CC BY 4.0 | Merge (Nordic Foods) |
| **CIQUAL** | 🇫🇷 FR | 3.185 | 61 | CSV Download | Open License | Merge (French Foods) |
| **CoFID** | 🇬🇧 UK | 2.886 | 51 | Excel (XLSX) | OGL v3.0 | Merge (UK Foods) |
| **Swiss NWD** | 🇨🇭 CH | 1.190 | Vollständig | Web (kein Bulk?) | Prüfen | Merge (DACH-Ergänzung) |
| **OpenFoodFacts** | 🌍 INT | 3M+ | 5-30 | API + Dump | ODbL | Barcode-Matching only |

**Merge-Logik:**
```
Für jedes Food:
  1. BLS-Daten = Primärquelle (Confidence 1.0)
  2. Falls BLS-Feld leer → USDA Foundation Fill (Confidence 0.95)
  3. Falls immer noch leer → Regional DB Fill (Confidence 0.9)
  4. Falls Food nicht in BLS → Import aus anderer DB (Confidence 0.85)
  5. Barcode-Mapping via OpenFoodFacts (kein Nährstoff-Override!)
```

### Phase 3: Barcode + OpenFoodFacts Mapping

```
Barcode Scan → OpenFoodFacts API
    ↓ Match gegen Lumeos foods (Name/Kategorie)
    ↓ Falls Match → Barcode in foods.barcode speichern
    ↓ Falls kein Match → Neuen Eintrag aus OFF erstellen (Confidence 0.5)
    ↓ User kann korrigieren → Confidence steigt auf 0.7
```

### Phase 4: MealCam + User-Generated (Laufend)

```
MealCam Scan → Claude Vision API → Erkennungsergebnis
    ↓ Match gegen foods Tabelle
    ↓ User bestätigt/korrigiert
    ↓ mealcam_feedback → verbessert Matching über Zeit

User erstellt Custom Food → foods_custom
    ↓ Bei 3+ identischen User-Einträgen → Review für Aufnahme in foods
```

---

## MealCam-Architektur (Claude Vision)

```
User Foto → Claude Vision API → Erkennungsergebnis (candidates + confidence)
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              ≥0.85 HIGH          0.50-0.84 MID        <0.50 LOW
              Auto-Accept         User Review           Manual Entry
```

### Confidence Thresholds (aus LUMEOS_OVERVIEW.md)

| Level | Schwelle | Aktion |
|-------|----------|--------|
| AUTO_ACCEPT | ≥ 0.85 | Automatisch ins Meal Log |
| SUGGEST | 0.50 - 0.84 | Vorschläge zeigen, User wählt |
| LOW | 0.30 - 0.49 | "Meintest du...?" mit Alternativen |
| REJECT | < 0.15 | Keine Erkennung, manuelle Eingabe |

### Feedback Loop
```sql
CREATE TABLE mealcam_scans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT,
  candidates JSONB,     -- [{food_id, confidence, name}]
  selected_food_id UUID,
  created_at TIMESTAMPTZ
);

CREATE TABLE mealcam_feedback (
  id UUID PRIMARY KEY,
  scan_id UUID REFERENCES mealcam_scans(id),
  correction_type TEXT,  -- 'wrong_food', 'wrong_portion', 'correct'
  correct_food_id UUID,
  created_at TIMESTAMPTZ
);
```

---

## Nährstoff-Abdeckung: 138 (BLS) → Lumeos Ziel: 140+

### BLS 4.0 liefert (138 Nährstoffe):
- **Energie:** kcal, kJ
- **Macros:** Protein, Fett, KH, Ballaststoffe, Wasser, Alkohol
- **Vitamine:** A (Retinol, Beta-Carotin), D (D2, D3 — NEU), E, K (K1, K2 — NEU), C, B1-B12
- **Mineralstoffe:** Ca, Fe, Mg, P, K, Na, Zn, Cu, Mn, Se, I, F, Cr, Mo
- **Fettsäuren:** Gesättigt, einfach/mehrfach ungesättigt, Omega-3, Omega-6, Trans, Cholesterin, einzelne Fettsäuren
- **Aminosäuren:** Alle 9 essentiellen + weitere
- **Zucker:** Gesamt, Glucose, Fructose, Galactose, Saccharose, Lactose, Maltose, Stärke
- **Organische Säuren:** Citronensäure, Apfelsäure, etc.
- **Sonstiges:** Purine, Harnsäure, etc.

### Lumeos ergänzt (2+ eigene):
- **Confidence Score** (Datenqualität-Indikator)
- **Allergen-Flags** (Gluten, Lactose, Nüsse, etc.)
- **Portion Sizes** (mit lokalen Varianten DE/CH/AT)

---

## Water Tracking

Separates Tracking, nicht in Food-DB:

```sql
CREATE TABLE water_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'manual'  -- manual, quick_add, apple_health
);
```

**Ziel-Berechnung:** 
- Basis: 35ml/kg Körpergewicht
- Anpassung: +500ml pro Trainingsstunde
- Anpassung: +250ml bei Temperatur >30°C (Thailand/Tropen)
- Integration: Apple Health / Google Health Connect Import

---

## Weight Tracking

```sql
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  weight_kg NUMERIC(5,2) NOT NULL,
  body_fat_pct NUMERIC(4,1),       -- optional
  muscle_mass_kg NUMERIC(5,2),     -- optional (Smart Scale)
  measured_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'manual'      -- manual, smart_scale, apple_health
);
```

**Integration:** Apple Health, Google Health Connect, Smart Scales (Withings, Eufy, Renpho)
**Verwendung:** TDEE-Berechnung (Goals Modul), Trend-Analyse, Progress-Tracking

---

## Kosten

| Phase | Quelle | Kosten |
|-------|--------|--------|
| Phase 1 | BLS 4.0 | **€0** (CC BY 4.0) |
| Phase 2 | USDA, Fineli, CIQUAL, CoFID | **€0** (alle Open Data) |
| Phase 3 | OpenFoodFacts API | **€0** (ODbL) |
| Phase 4 | Claude Vision (MealCam) | **~$0.01/Scan** (API Kosten) |
| Laufend | Swiss NWD | **Prüfen** (evtl. Lizenz nötig) |

**Total MVP-Kosten für Food-DB: €0** (nur API-Kosten für MealCam im Betrieb)

---

## Vergleich: Alt (Research v1) → Neu (aligned mit Overview)

| Aspekt | Alt (Research v1) | Neu (aligned) |
|--------|-------------------|---------------|
| Primärquelle | USDA | **BLS 4.0** |
| Nährstoffe | 84 | **138 (BLS) + 2 eigene = 140** |
| Architektur | 4-Layer Lookup | **Eigene DB mit BLS-Basis** |
| EU-Quellen | Keine | **5 EU-Datenbanken** |
| Water Tracking | Nicht erwähnt | **Eigene Tabelle + Ziel-Berechnung** |
| Weight Tracking | Nicht erwähnt | **Eigene Tabelle + Smart Scale** |
| MealCam | "AI Logging" | **Claude Vision + Confidence Thresholds** |
| Barcode | OpenFoodFacts | **OpenFoodFacts als Mapping-Layer** |

---

*Aligned mit LUMEOS_OVERVIEW.md, Stand: 2026-02-17*
