# Nutrition Module — BLS Import Pipeline
> Spec Phase 8 | Einmalige Befüllung der Food-Datenbank aus BLS 4.0

---

## Übersicht

Der BLS-Import ist ein **einmaliger, kontrollierter Prozess** der:
1. Die Excel-Dateien von BLS 4.0 liest
2. Alle 7.140 Foods in `nutrition.foods` importiert
3. Alle 138 × ~7.140 Nährstoffe in `nutrition.food_nutrients` importiert
4. Canonical Names generiert (`name_display`)
5. Kategorien zuweist (`category_id`)
6. `sort_weight` berechnet
7. Tags auto-generiert (via Trigger)
8. Aliase einträgt

---

## Quelldateien

```
BLS_4_0_Daten_2025_DE.xlsx      — Hauptdatei: 7.140 Foods × 418 Spalten
BLS_4_0_Components_DE_EN.xlsx   — Referenz: 138 Nährstoff-Definitionen
```

**Spaltenstruktur der Hauptdatei:**
- Spalte A: `BLS Code`
- Spalte B: `Lebensmittelbezeichnung` (DE)
- Spalte C: `Food name` (EN)
- Ab Spalte D: Pro Nährstoff 3 Spalten: `CODE Wert | CODE Datenherkunft | CODE Referenz`

---

## Phase 1: NutrientDefs seeden

```sql
-- nutrient_defs aus SPEC_06 Seed-Daten einspielen (138 Zeilen)
-- Danach: RDA-Werte updaten
```

Bereits vollständig in SPEC_06 als SQL-INSERT definiert.

---

## Phase 2: Foods importieren

### Skript-Logik (Python)

```python
import openpyxl
import psycopg2
from uuid import uuid4

wb = openpyxl.load_workbook('BLS_4_0_Daten_2025_DE.xlsx', read_only=True)
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
header = rows[0]

# Nährstoff-Code aus Spaltenheader extrahieren
# Format: "CODE Bezeichnung [Einheit/100g]"
def extract_code(col_header):
    return col_header.split()[0] if col_header else None

# Spalten-Index für jeden Nährstoff-Code
code_to_col = {}  # code → (value_col_idx, source_col_idx)
for i in range(3, 417, 3):  # Jeder 3. Spalte ab Spalte 4
    code = extract_code(header[i])
    if code:
        code_to_col[code] = (i, i+1)

MACRO_CODES = {
    'ENERCC': 'enercc', 'ENERCJ': 'enercj', 'WATER': 'water_g',
    'PROT625': 'prot625', 'FAT': 'fat', 'CHO': 'cho',
    'FIBT': 'fibt', 'SUGAR': 'sugar', 'FASAT': 'fasat',
    'NACL': 'nacl', 'ALC': 'alc'
}

for row in rows[1:]:
    bls_code = row[0]
    name_de = row[1]
    name_en = row[2]
    if not bls_code or not name_de:
        continue

    # Schnell-Makros direkt aus Zeile
    macros = {}
    for bls_col, db_col in MACRO_CODES.items():
        if bls_col in code_to_col:
            val_idx = code_to_col[bls_col][0]
            raw = row[val_idx]
            macros[db_col] = parse_bls_value(raw)

    # Sort Weight berechnen (Basis + Modifikatoren)
    sort_weight = calculate_sort_weight(bls_code, name_de, macros)

    # Food einfügen (name_display zunächst = name_de → wird in Phase 4 ersetzt)
    food_id = insert_food(bls_code, name_de, name_en, macros, sort_weight)

    # Nährstoffe einfügen (alle non-null Werte)
    for code, (val_idx, src_idx) in code_to_col.items():
        raw_val = row[val_idx]
        raw_src = row[src_idx]
        parsed = parse_bls_value(raw_val)
        if parsed is not None:  # NULL-Werte überspringen
            insert_nutrient(food_id, code, parsed, raw_src)
```

---

## BLS-Wert Parsing

```python
def parse_bls_value(raw):
    """
    BLS-Wert-Typen:
    - Numerisch (int/float) → float
    - '-' (Fehlender Wert) → None (kein Eintrag)
    - 0 (Logische Null) → 0.0
    - 'TR' (Spuren) → None (kein Eintrag — Wert unbekannt)
    - '<LOQ' / '<LOD' → None (unter Nachweisgrenze)
    """
    if raw is None or raw == '-':
        return None
    if isinstance(raw, (int, float)):
        return float(raw)
    s = str(raw).strip()
    if s in ('', '-', 'TR'):
        return None
    if s.startswith('<'):
        return None
    try:
        return float(s.replace(',', '.'))
    except ValueError:
        return None
```

---

## Sort Weight Berechnung

```python
def calculate_sort_weight(bls_code, name_de, macros):
    prefix = bls_code[0].upper()
    name_lower = name_de.lower()

    # Basis nach Kategorie
    base = {
        'C': 700,  # Getreide
        'E': 680,  # Eier/Pasta
        'F': 660,  # Obst
        'G': 660,  # Gemüse
        'H': 650,  # Hülsenfrüchte/Nüsse
        'K': 550,  # Kartoffeln
        'M': 660,  # Milch
        'T': 700,  # Fisch
        'B': 520,  # Brot
        'D': 340,  # Backwaren
        'Q': 460,  # Fette/Öle
        'R': 360,  # Würzmittel
        'S': 240,  # Süsswaren
        'N': 400,  # Getränke
        'P': 180,  # Alkohol
        'X': 200,  # Fertiggerichte
        'Y': 240,  # Zubereitungen
        'W': 440,  # Wurstwaren
    }.get(prefix, 400)

    # U/V split (Fleisch)
    if prefix == 'U':
        if bls_code[1] in ('0', '1', '2'):  # Rind-Muskelfleisch
            base = 800
        elif bls_code[1] in ('3', '4'):  # Kalb
            base = 780
        elif bls_code[1] in ('5', '6'):  # Schwein
            base = 760
        elif bls_code[1] in ('7', '8'):  # Schaf/Lamm
            base = 700
        elif bls_code[1] == '9':  # Konserven
            base = 300
        # Fettgewebe
        if 'fettgewebe' in name_lower or 'fettback' in name_lower:
            base = 100
        # Blut, Knochen
        if any(w in name_lower for w in ['blut', 'knochenmark', 'schwarte']):
            base = 80

    if prefix == 'V':
        if bls_code[1] == '4':  # Geflügel (Hähnchen, Pute)
            base = 790
        elif bls_code[1] in ('2', '3'):  # Wild/Wildgeflügel
            base = 680
        elif bls_code[1] == '1':  # Kaninchen/Pferd
            base = 640
        elif bls_code[1] in ('5', '6'):  # Innereien → stark reduzieren
            if 'leber' in name_lower:
                base = 320  # Leber ist relativ bekannt
            elif 'herz' in name_lower:
                base = 280
            else:
                base = 150  # Gehirn, Lunge, Milz, Kutteln

    # Modifikatoren
    bonus = 0
    prot = macros.get('prot625') or 0
    enercc = macros.get('enercc') or 0

    # Core Fitness Foods Bonus
    if is_core_fitness_food(bls_code):
        bonus += 200

    # Protein-Bonus
    if prot >= 30:
        bonus += 120
    elif prot >= 20:
        bonus += 80

    # Lean Protein
    fat = macros.get('fat') or 0
    if prot >= 20 and fat <= 5:
        bonus += 50

    # Verarbeitungs-Malus
    if prefix in ('X', 'Y'):
        bonus -= 300
    if any(w in name_lower for w in ['gesüsst', 'gezuckert', 'instant']):
        bonus -= 100
    if any(w in name_lower for w in ['konserve', 'dose']):
        bonus -= 80
    if 'gekocht' in name_lower or 'gebraten' in name_lower:
        bonus -= 150

    return max(0, min(1000, base + bonus))


def is_core_fitness_food(bls_code):
    """BLS-Codes der wichtigsten Fitness Foods."""
    CORE_CODES = {
        'V416100',  # Hähnchen Brustfilet
        'V486100',  # Pute Brust
        'U010100',  # Rind Hackfleisch
        'U211100',  # Rind Filet/Lende
        'C133000',  # Hafer Flocken
        'C352000',  # Reis poliert roh
        'E111100',  # Hühnerei roh
        'E113100',  # Hühnerei Eiweiß roh
    }
    # T-Codes für Lachs, Thunfisch, Hering
    CORE_PREFIXES_T = ['T102', 'T103', 'T302', 'T306']  # Hering, Thunfisch, Steinbutt, Heilbutt
    return bls_code in CORE_CODES or any(bls_code.startswith(p) for p in CORE_PREFIXES_T)
```

---

## Phase 3: Kategorie-Zuweisung (regelbasiert)

```python
def assign_category(bls_code, name_de, tags):
    """
    Weist category_id zu basierend auf BLS-Code-Pattern.
    Gibt die tiefste zutreffende Kategorie zurück.
    """
    prefix = bls_code[0].upper()
    name_lower = name_de.lower()

    # Food Categories Lookup (aus food_categories Tabelle)
    cat = category_lookup  # dict: slug → id

    # Fisch
    if prefix == 'T':
        if bls_code[1:4] in ('102', '103', '106'):  # Hering, Sprotte
            return cat.get('fatty_fish_sea')
        if bls_code.startswith('T5') or bls_code.startswith('T6'):  # Süsswasser
            return cat.get('freshwater_fish')
        if bls_code.startswith('T73'):  # Garnelen
            return cat.get('shellfish')
        if bls_code.startswith('T78') or bls_code.startswith('T79'):  # Muscheln/Austern
            return cat.get('molluscs')
        return cat.get('lean_fish_sea')  # Default Seefisch

    # Fleisch Rind
    if prefix == 'U' and bls_code[1] in ('0', '1', '2'):
        if 'hackfleisch' in name_lower or 'hack' in name_lower:
            return cat.get('beef_mince')
        if any(w in name_lower for w in ['filet', 'lende']):
            return cat.get('beef_steaks')
        return cat.get('beef_roasts')

    # Geflügel
    if prefix == 'V' and bls_code[1] == '4':
        if 'brustfilet' in name_lower or 'brust' in name_lower:
            return cat.get('chicken_breast')
        if 'pute' in name_lower or bls_code[3] == '8':
            return cat.get('turkey')
        return cat.get('chicken')

    # Innereien
    if prefix == 'V' and bls_code[1] in ('5', '6'):
        if 'leber' in name_lower: return cat.get('liver')
        if 'herz' in name_lower: return cat.get('heart')
        return cat.get('offal_other')

    # Milch
    if prefix == 'M':
        if any(w in name_lower for w in ['parmesan', 'emmentaler', 'gruyère']):
            return cat.get('hard_cheese')
        if any(w in name_lower for w in ['brie', 'camembert']):
            return cat.get('soft_cheese')
        if any(w in name_lower for w in ['mozzarella', 'ricotta', 'quark', 'hüttenkäse']):
            return cat.get('fresh_cheese')
        if any(w in name_lower for w in ['roquefort', 'gorgonzola', 'blau']):
            return cat.get('blue_cheese')
        if any(w in name_lower for w in ['gouda', 'edamer', 'tilsiter']):
            return cat.get('semi_hard_cheese')
        if any(w in name_lower for w in ['joghurt', 'kefir', 'quark', 'skyr']):
            return cat.get('yogurt_quark')
        if 'milch' in name_lower and 'pulver' not in name_lower:
            return cat.get('drinking_milk')
        return cat.get('dairy_other')

    # Getreide
    if prefix == 'C':
        if 'hafer' in name_lower: return cat.get('oats_flakes')
        if 'reis' in name_lower: return cat.get('rice')
        if 'weizen' in name_lower or 'dinkel' in name_lower: return cat.get('wheat_grains')
        return cat.get('grains_other')

    # Weitere Mappings...
    return cat.get(DEFAULT_CATEGORY_MAP.get(prefix, 'other'))
```

---

## Phase 4: Canonical Names (AI-generiert)

```python
import anthropic

client = anthropic.Anthropic()

def generate_canonical_name(bls_code, name_de, name_en, category_slug):
    """
    Generiert user-freundlichen Anzeigenamen via Claude API.
    Batch-Verarbeitung aller 7.140 Foods.
    """
    prompt = f"""Du bist ein Ernährungsexperte. Erstelle einen kurzen, benutzerfreundlichen
deutschen Namen für dieses Lebensmittel aus der BLS-Datenbank.

BLS-Code: {bls_code}
BLS-Name (wissenschaftlich): {name_de}
Englischer Name: {name_en}
Kategorie: {category_slug}

Regeln:
- Max 5 Wörter
- Keine Klassifizierungscodes (wie "S XI", "S VII")
- Keine langen Beschreibungen in Klammern
- Verarbeitungszustand nur wenn relevant (roh, gekocht, geräuchert)
- Auf Deutsch

Beispiele:
"Schwein Fettwamme, ohne Schwarten, geringer Magerfleischanteil (S XI) roh" → "Schweinebauch (roh)"
"Hähnchen Brustfilet, roh" → "Hähnchenbrust (roh)"
"Vollmilch frisch, 3,5 % Fett, pasteurisiert" → "Vollmilch (3,5% Fett)"
"Hühnerei roh" → "Ei (roh)"

Antworte NUR mit dem deutschen Anzeigenamen. Kein Zusatztext."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=50,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text.strip()
```

**Batch-Strategie:**
- 7.140 Foods in Batches von 100 verarbeiten
- Rate Limit: ~50 Requests/Min → ~2.5h Gesamtdauer
- Checkpoint: nach jedem Batch in Datei speichern
- Re-run: nur leere `name_display` verarbeiten

---

## Phase 5: Aliase seeden

```sql
-- Seed-Aliase für häufig gesuchte Foods
INSERT INTO nutrition.food_aliases (food_id, alias, locale, source) VALUES
  -- Hähnchenbrust
  ((SELECT id FROM nutrition.foods WHERE bls_code='V416100'), 'Hühnerbrust', 'de', 'editorial'),
  ((SELECT id FROM nutrition.foods WHERE bls_code='V416100'), 'Chicken Breast', 'en', 'editorial'),
  ((SELECT id FROM nutrition.foods WHERE bls_code='V416100'), 'Brustfilet', 'de', 'editorial'),
  -- Haferflocken
  ((SELECT id FROM nutrition.foods WHERE bls_code='C133000'), 'Oatmeal', 'en', 'editorial'),
  ((SELECT id FROM nutrition.foods WHERE bls_code='C133000'), 'Oats', 'en', 'editorial'),
  ((SELECT id FROM nutrition.foods WHERE bls_code='C133000'), 'Porridge', 'de', 'editorial'),
  -- Eier
  ((SELECT id FROM nutrition.foods WHERE bls_code='E111100'), 'Ei', 'de', 'editorial'),
  ((SELECT id FROM nutrition.foods WHERE bls_code='E111100'), 'Eier', 'de', 'editorial'),
  ((SELECT id FROM nutrition.foods WHERE bls_code='E111100'), 'Egg', 'en', 'editorial'),
  -- Rinderhackfleisch
  ((SELECT id FROM nutrition.foods WHERE bls_code='U010100'), 'Hackfleisch', 'de', 'editorial'),
  ((SELECT id FROM nutrition.foods WHERE bls_code='U010100'), 'Ground Beef', 'en', 'editorial'),
  ((SELECT id FROM nutrition.foods WHERE bls_code='U010100'), 'Mince', 'en', 'editorial');
-- ... (weitere ~200 häufige Aliase)
```

---

## Phase 6: Trigger ausführen (Tags auto-generieren)

```sql
-- Tags werden automatisch via trg_foods_auto_tag Trigger gesetzt
-- bei INSERT in nutrition.foods → kein manueller Aufruf nötig

-- Zur Verifikation nach Import:
SELECT tag_code, COUNT(*) as food_count
FROM nutrition.food_tags
GROUP BY tag_code
ORDER BY food_count DESC;
```

**Erwartete Tag-Verteilung:**
```
vegetarian    ~6.500 Foods
vegan         ~4.300 Foods
high_protein  ~1.100 Foods
dairy         ~1.000 Foods
pork          ~720 Foods
fish          ~380 Foods
beef          ~400 Foods
```

---

## Import-Reihenfolge

```
1. CREATE SCHEMA nutrition + alle Tabellen (SPEC_06)
2. Seed nutrient_defs (138 Codes) + RDA-Updates
3. Seed food_categories (Baum aus SPEC_05)
4. Seed tag_definitions (~100 Tags aus SPEC_05)
5. Import foods (7.140 Zeilen, Trigger deaktiviert)
6. Import food_nutrients (~570K Zeilen)
7. Berechne sort_weight für alle Foods
8. Weise category_id zu
9. Aktiviere Trigger → Tags auto-generiert
10. Generiere name_display via Claude API (Batch)
11. Seed food_aliases (editorial)
12. Verifikation: Row-Counts, Tag-Distribution, Score-Test
```

---

## Verifikations-Queries

```sql
-- Gesamt-Übersicht
SELECT 'foods' as table_name, COUNT(*) FROM nutrition.foods
UNION ALL
SELECT 'food_nutrients', COUNT(*) FROM nutrition.food_nutrients
UNION ALL
SELECT 'food_tags', COUNT(*) FROM nutrition.food_tags
UNION ALL
SELECT 'food_aliases', COUNT(*) FROM nutrition.food_aliases;

-- Sort Weight Distribution
SELECT
  CASE
    WHEN sort_weight >= 800 THEN '800-1000 (Top)'
    WHEN sort_weight >= 600 THEN '600-799 (Gut)'
    WHEN sort_weight >= 400 THEN '400-599 (Mittel)'
    WHEN sort_weight >= 200 THEN '200-399 (Niedrig)'
    ELSE '0-199 (Minimal)'
  END as range,
  COUNT(*) as count
FROM nutrition.foods
GROUP BY 1 ORDER BY 1;

-- Suchtest
SELECT name_display, sort_weight, prot625
FROM nutrition.foods
WHERE similarity(name_display, 'Hafer') > 0.15
ORDER BY (similarity(name_display, 'Hafer') * 0.6) + (sort_weight/1000.0 * 0.4) DESC
LIMIT 10;

-- Erwartetes Ergebnis:
-- 1. Haferflocken (sort_weight ~950)
-- 2. Hafer ganzes Korn, roh (~780)
-- 3. Hafer Schrot (~720)
-- ... (keine Fertigbreis oben)
```

---

## Dateistruktur Import-Skripte

```
src/import/
  bls/
    01_seed_nutrient_defs.sql     → 138 Nährstoff-Definitionen
    02_seed_food_categories.sql   → Kategorie-Baum
    03_seed_tag_definitions.sql   → Tag-Vokabular
    04_import_foods.py            → Phase 2: Foods + Nährstoffe
    05_assign_categories.py       → Phase 3: Kategorie-Zuweisung
    06_generate_canonical.py      → Phase 4: name_display via Claude
    07_seed_aliases.sql           → Phase 5: Such-Aliase
    08_verify_import.sql          → Phase 6: Verifikation
    run_all.sh                    → Reihenfolge-Script
```
