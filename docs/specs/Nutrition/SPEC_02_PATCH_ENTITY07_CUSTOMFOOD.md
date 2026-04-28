## 7. CustomFood

User-erstellte Lebensmittel. **Vollständig getrennt von BLS-Daten.** Kein Merge mit `foods`-Tabelle.

**Barcode:** Dient als Identifier für eigene Produkte. BLS 4.0 hat keine Barcodes.
Beim Scan sucht das System nur in `foods_custom` — kein externer Lookup.

```
id              UUID PK
user_id         UUID NOT NULL
name_de         TEXT NOT NULL
name_en         TEXT
name_th         TEXT
brand           TEXT
barcode         TEXT                EAN / UPC (Identifier, kein Lookup-Schlüssel)
serving_size_g  NUMERIC DEFAULT 100
serving_name    TEXT                z.B. "1 Riegel"
source          TEXT DEFAULT 'user' user | mealcam

-- Pflicht: Makros
enercc    NUMERIC(8,2) NOT NULL
prot625   NUMERIC(8,3) NOT NULL
fat       NUMERIC(8,3) NOT NULL
cho       NUMERIC(8,3) NOT NULL

-- Optional: weitere Makros
fibt      NUMERIC(8,3)   sugar  NUMERIC(8,3)
fasat     NUMERIC(8,3)   nacl   NUMERIC(8,3)
water_g   NUMERIC(8,3)   alc    NUMERIC(8,3)

-- Optional: Mikros (Subset, was User kennt)
vita_ug   vitd_ug   vite_mg   vitk_ug   vitc_mg
thia_mg   ribf_mg   nia_mg    vitb6_ug  fol_ug   vitb12_ug
na_mg     k_mg      ca_mg     mg_mg     p_mg
fe_mg     zn_mg     id_ug     cu_ug     mn_ug

-- Allergene (User-definiert, analog zu BLS allergen_* Tags)
custom_allergens  TEXT[] DEFAULT '{}'
  -- Werte aus EU-14 Allergen-Codes:
  -- allergen_gluten | allergen_milk | allergen_eggs | allergen_fish
  -- allergen_crustaceans | allergen_molluscs | allergen_peanuts | allergen_nuts
  -- allergen_soy | allergen_celery | allergen_mustard | allergen_sesame
  -- allergen_sulphites | allergen_lupin

created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

**Allergen-Filterung:** Smart Search filtert `custom_allergens` identisch zu BLS `food_tags`
mit Allergen-Codes. Beide Quellen werden kombiniert ausgeschlossen.
