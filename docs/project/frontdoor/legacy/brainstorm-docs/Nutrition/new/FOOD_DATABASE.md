# Nutrition Module — Food Database & Semantic Tags

## Kernentscheidung: Eigene Food-DB mit BLS 4.0 Basis

Lumeos betreibt eine **eigene Postgres-Tabelle** (`nutrition.foods`), initial befüllt mit BLS 4.0 und angereichert mit 6 weiteren EU/US-Datenbanken.

---

## Warum BLS 4.0 als Basis?

| Kriterium | BLS 4.0 | USDA SR | OpenFoodFacts |
|---|---|---|---|
| Nährstoffe | **138** | 53 | 5–30 |
| Laboranalysen | ✅ Max Rubner-Institut | ✅ USDA Labs | ❌ Crowdsourced |
| Mikronährstoffe | ✅ Vollständig (inkl. D2/D3, K1/K2 — NEU) | 🟡 Teilweise | ❌ Meist nur Macros |
| Einträge | 7.140 | 8.133 | 3M+ (variable Qualität) |
| Lizenz | CC BY 4.0 (kostenlos) | Public Domain | ODbL |
| Sprache | DE (DACH-Start) | EN | Multi |
| Qualität | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**BLS gewinnt:** 138 Nährstoffe (fast 3× USDA), echte Laboranalysen, CC BY 4.0 kostenlos, DACH-Marktstart.
**BLS Download:** https://blsdb.de/download — DOI: 10.25826/Data20251217-134202-0

---

## Quellen-Übersicht

| Quelle | Land | Einträge | Nährstoffe | Lizenz | Strategie |
|---|---|---|---|---|---|
| **BLS 4.0** | DE | 7.140 | 138 | CC BY 4.0 | **Basis (Confidence 1.0)** |
| USDA Foundation | US | 365 | Lab-analyzed | Public Domain | Merge (Gold-Referenz, Conf. 0.95) |
| USDA SR/FNDDS | US | 8.133 | 53 | Public Domain | Merge (US-Foods, Conf. 0.90) |
| Fineli | FI | 4.156 | 50+ | CC BY 4.0 | Merge (Nordic, Conf. 0.90) |
| CIQUAL | FR | 3.185 | 61 | Open License | Merge (French, Conf. 0.90) |
| CoFID / McCance | UK | 2.886 | 51 | OGL v3.0 | Merge (UK, Conf. 0.90) |
| Swiss NWD | CH | 1.190 | Vollständig | Prüfen | Merge (DACH, Conf. 0.90) |
| OpenFoodFacts | INT | 3M+ | 5–30 | ODbL | **Nur Barcode-Mapping** |

---

## Merge-Logik

```
Für jedes Food / jedes Nährstoff-Feld:

1. BLS-Daten          → Confidence 1.0  (Primärquelle)
   ↓ Feld leer?
2. USDA Foundation     → Confidence 0.95 (Gold-Standard Referenz)
   ↓ Feld leer?
3. Regional DB Fill    → Confidence 0.90 (Fineli / CIQUAL / CoFID / Swiss)
   ↓ Food nicht in BLS?
4. Import aus anderer DB → Confidence 0.85
   ↓ Barcode?
5. OpenFoodFacts Mapping → KEIN Nährstoff-Override! Nur barcode-Feld setzen.
```

---

## Import-Pipeline (Phasen)

### Phase 1: BLS 4.0 als Basis (Launch)
```
BLS_4_0_2025_DE.zip
  → Download (CC BY 4.0)
  → Parse ZIP → CSV
  → Map BLS-Felder → Lumeos-Schema
  → Normalize (Einheiten, Dezimalstellen)
  → Import → nutrition.foods (7.140 Einträge, 138 Nährstoffe)
  → Generate foods_portions (BLS Standard-Portionen)
```

### Phase 2: EU-Datenbanken Anreicherung
Leere Felder aus BLS werden mit USDA Foundation, Fineli, CIQUAL, CoFID, Swiss NWD aufgefüllt.
Confidence-Wert wird entsprechend gesetzt.

### Phase 3: Barcode + OpenFoodFacts Mapping
```
Barcode Scan → OFF API
  → Match gegen foods (Name/Kategorie)
  → Falls Match → barcode in foods.barcode speichern
  → Falls kein Match → neuen Eintrag aus OFF (Confidence 0.5)
  → User kann korrigieren → Confidence steigt auf 0.7
```

### Phase 4: MealCam + User-Generated (Laufend)
```
MealCam Scan → Claude Vision API → Erkennung
  → User bestätigt/korrigiert
  → mealcam_feedback → verbessert Matching

User erstellt Custom Food → foods_custom
  → Bei 3+ identischen User-Einträgen → Review für Aufnahme in foods
```

---

## Barcode-Lookup-Flow

```
Barcode → Lumeos eigene DB (mit EAN/UPC aus OFF-Mapping)
  ↓ miss
OpenFoodFacts API (3.3M+ Produkte)
  ↓ miss
User prompt: "Manuell hinzufügen oder Foto machen"
```

---

## MealCam (Claude Vision API)

```
User Foto → Claude Vision API → Erkennungsergebnis (candidates + confidence)
             │
  ≥0.85 HIGH │ 0.50–0.84 MID │ 0.30–0.49 LOW │ <0.15 REJECT
  Auto-Accept│ User Review   │ "Meintest du?"│ Manual Entry
```

**Feedback-Tabellen:**
```sql
mealcam_scans    (id, user_id, image_url, candidates JSONB, selected_food_id)
mealcam_feedback (id, scan_id, correction_type, correct_food_id)
```
`correction_type`: wrong_food / wrong_portion / correct

---

## Nährstoff-Abdeckung BLS 4.0

138 Nährstoffe pro Lebensmittel:

- **Energie:** kcal, kJ
- **Macros:** Protein, Fett, Kohlenhydrate, Ballaststoffe, Wasser, Alkohol
- **Vitamine:**
  - A (Retinol-Äquivalent, Retinol, Beta-Carotin)
  - D (gesamt, D2, D3 — **NEU in BLS 4.0**)
  - E, K (gesamt, K1, K2 — **NEU in BLS 4.0**)
  - C, B1 (Thiamin), B2 (Riboflavin), B3 (Niacin), B5 (Pantothensäure), B6, B7 (Biotin), B9 (Folat), B12
- **Mineralstoffe:** Ca, Fe, Mg, P, K, Na, Zn, Cu, Mn, Se, I, F, Cr, Mo
- **Fettsäuren:** Gesättigt, einfach/mehrfach ungesättigt, Omega-3, Omega-6, Trans, Cholesterin, einzelne FS
- **Aminosäuren:** Alle 9 essentiellen (Leu, Ile, Val, Lys, Met, Phe, Thr, Trp, His) + weitere
- **Zucker:** Gesamt, Glucose, Fructose, Galactose, Saccharose, Lactose, Maltose, Stärke
- **Sonstiges:** Purine, organische Säuren (Citronensäure, Apfelsäure, etc.)

---

## Semantic Tags System

### Tabellen

```sql
nutrition.tag_definitions  -- Tag-Vokabular
  code TEXT PK, label_de, label_en, tag_type, is_exclusion_relevant, sort_order

nutrition.food_tags        -- Food-Tag-Zuordnungen
  food_id UUID, tag_code TEXT, confidence NUMERIC(3,2)
  PRIMARY KEY (food_id, tag_code)

nutrition.v_foods_with_tags  -- View mit Tags als Array
```

### Phase 1 Tags (12)

| Code | Typ | Regel |
|---|---|---|
| `pork` | ingredient | BLS G3* (1.0); H* + Name-Heuristik (0.7–0.9) |
| `beef` | ingredient | BLS G1*, G2* (1.0); H* + "rind" (0.9) |
| `poultry` | ingredient | BLS G5* (1.0); G8* Kaninchen (0.8); H* (0.9) |
| `lamb` | ingredient | BLS G7* (1.0) |
| `fish` | ingredient | BLS J1*, J2* (1.0); J4* (0.9) |
| `shellfish` | ingredient | BLS J3* (1.0) |
| `dairy` | ingredient | BLS K* (1.0) |
| `egg` | ingredient | BLS L* (1.0) |
| `offal` | ingredient | BLS G4* (1.0) |
| `vegetarian` | diet | NOT (pork/beef/poultry/lamb/fish/shellfish/offal) |
| `vegan` | diet | vegetarian AND NOT (dairy/egg) |
| `high_protein` | fitness | protein_g ≥ 15g/100g |

### BLS-Code Mapping Cheat Sheet

```
G1* → beef    G2* → beef    G3* → pork    G4* → offal
G5* → poultry G7* → lamb    G8* → poultry (0.8)
H*  → pork/beef/poultry via Name-Heuristik (0.7–0.9)
J1* → fish    J2* → fish    J3* → shellfish  J4* → fish (0.9)
K*  → dairy   L*  → egg
```

### Auto-Tagging Trigger

```sql
CREATE TRIGGER trg_foods_auto_tag
  AFTER INSERT OR UPDATE OF bls_code, macros, is_active, name_de
  ON nutrition.foods FOR EACH ROW
  EXECUTE FUNCTION nutrition.trigger_auto_tag_food();
```

Bei Trigger: alle Tags des Foods löschen → neu berechnen → einfügen.

### Confidence Levels

| Level | Bedeutung | Beispiel |
|---|---|---|
| 1.0 | Sicher (BLS-Code) | G3* → pork |
| 0.9 | Sehr wahrscheinlich (Name) | H* + "Schinken" → pork |
| 0.8 | Wahrscheinlich | G8* Kaninchen → poultry |
| 0.7 | Unsicher (Default) | H* ohne Name-Match → pork |

### Erwartete Tag-Verteilung (nach Migration)

| Tag | ~Anzahl Foods |
|---|---|
| dairy | ~1.034 |
| vegetarian | ~6.523 |
| vegan | ~4.389 |
| high_protein | ~1.122 |
| pork | ~723 |
| fish | ~387 |

### Geplante Phase 2 + 3 Tags

| Phase | Tags |
|---|---|
| Phase 2 | `gluten`, `nuts`, `soy` (Allergen); `low_carb`, `low_fat` (Fitness); `organic`, `processed` |
| Phase 3 | `halal`, `kosher` (Religion); `local`, `seasonal` (Nachhaltigkeit) |

---

## Kosten

| Phase | Quelle | Kosten |
|---|---|---|
| Phase 1 | BLS 4.0 | **€0** (CC BY 4.0) |
| Phase 2 | USDA, Fineli, CIQUAL, CoFID | **€0** (alle Open Data) |
| Phase 3 | OpenFoodFacts API | **€0** (ODbL) |
| Laufend | Claude Vision (MealCam) | **~$0.01/Scan** |
| Laufend | Swiss NWD | **Lizenz prüfen** |

**Total MVP Food-DB: €0** (nur MealCam-API-Kosten im Betrieb)
