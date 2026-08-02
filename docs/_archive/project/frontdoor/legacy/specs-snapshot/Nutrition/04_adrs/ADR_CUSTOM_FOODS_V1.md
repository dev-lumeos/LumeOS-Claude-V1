# ADR: Custom Foods V1 — Modell und Pflichtfelder

**Datum:** April 2026 | **Status:** Final — V1 Entscheidung

---

## Kontext

Custom Foods erlauben es Usern, eigene Lebensmittel anzulegen die nicht in BLS 4.0 enthalten sind.

## Entscheidung

### V1: Nur user-privat

Custom Foods sind in V1 nur für den jeweiligen User sichtbar.
Public Sharing / is_public ist Phase 2.

### Pflichtfelder

```
name_de               TEXT NOT NULL     (min 2 Zeichen)
enercc                NUMERIC NOT NULL  (kcal pro 100g)
prot625               NUMERIC NOT NULL  (Protein g pro 100g)
fat                   NUMERIC NOT NULL  (Fett g pro 100g)
cho                   NUMERIC NOT NULL  (Kohlenhydrate g pro 100g)
```

### Optionale Felder

```
name_en, name_th
brand
barcode              (für zukünftigen Barcode-Lookup Phase 2)
fibt, sugar, fasat, nacl, water_g, alc
Mikronährstoffe (Subset: Vitamine, Mineralstoffe)
```

### source-Werte (V1)

```
user     — User erstellt manuell in der App
manual   — Direkte Eingabe (z.B. via Import oder Batch)
import   — Import-Pipeline
admin    — Admin pflegt zentral
```

**Nicht erlaubt:** `openfoodfacts` — OpenFoodFacts ist nicht Teil von V1.
**Nicht erlaubt:** `mealcam` als source — MealCam erstellt Custom Foods als `user` wenn kein BLS-Match.

### Anzeige in Food Search

Custom Foods erscheinen in der Food Search zusammen mit BLS Foods.
Custom Foods werden bevorzugt angezeigt (höherer sort_weight).
Custom Foods werden als "Eigenes Food" markiert.

### Spätere Erweiterungen (Phase 2)

```
is_public → Foods für andere User sichtbar machen
shared_by → Wer hat das Food geteilt
```
