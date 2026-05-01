# nutrient_reference_values — Seed-Struktur und Anforderungen

> Stand: April 2026 | Pass 2 Nutrition Spec
> Datei: docs/specs/Nutrition/NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md

---

## Status

```
⚠️  SEED-WERTE AUSSTEHEND

Konkrete RDA/AI/UL-Werte sind in dieser Datei NICHT hinterlegt.
Grund: Referenzwerte müssen aus geprüften Quelltabellen stammen.

Empfohlene Quellen:
  - DACH-Referenzwerte (Deutsche Gesellschaft für Ernährung, 2020+)
  - EFSA Dietary Reference Values (Europäische Behörde für Lebensmittelsicherheit)
  - IOM/NAM Dietary Reference Intakes (US Institute of Medicine)

Vor der Implementierung:
  1. Quelltabellen beschaffen und prüfen
  2. Werte für V1 aktive Kategorien extrahieren (Alter + Geschlecht, Erwachsene)
  3. Als SQL INSERT in separate Datei:
     docs/specs/Nutrition/NUTRIENT_REFERENCE_VALUES_SEED_DATA.sql
```

---

## Tabellen-Struktur (aus SPEC_06_V1_MIGRATION.sql)

```sql
CREATE TABLE nutrition.nutrient_reference_values (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrient_code   TEXT NOT NULL REFERENCES nutrition.nutrient_defs(code),
  unit            TEXT NOT NULL,
  age_min         INTEGER,
  age_max         INTEGER,
  sex             TEXT CHECK (sex IN ('male','female','both')),
  is_pregnant     BOOLEAN DEFAULT false,
  is_lactating    BOOLEAN DEFAULT false,
  rda             NUMERIC(12,4),
  ai              NUMERIC(12,4),
  ul              NUMERIC(12,4),
  target_min      NUMERIC(12,4),
  target_max      NUMERIC(12,4),
  source          TEXT NOT NULL,
  source_version  TEXT,
  notes           TEXT,
  effective_from  DATE NOT NULL DEFAULT '2020-01-01'
);
```

---

## Pflichtregeln für alle Seed-Werte

1. **`ul = NULL`** wenn kein UL belegt — niemals `ul = 0`
2. **Quelle muss angegeben werden** — kein Wert ohne `source` und `source_version`
3. **Kein Wert erfinden** — nur belegte Werte eintragen
4. **Wasserlösliche Vitamine ohne UL** — `ul = NULL` korrekt, nicht `ul = 9999`
5. **UL-Risikoprofile** in `notes` dokumentieren (z.B. Akkumulation bei fettlöslich)

---

## Nährstoffe die V1 Seed-Werte brauchen

### Priorität 1: Display-Tier 1 (immer sichtbar)

| BLS-Code | Name | Quelle-Priorität | UL vorhanden |
|---|---|---|---|
| ENERCC | Energie kcal | DACH | nein |
| PROT625 | Protein | DACH | nein |
| FAT | Fett | DACH | nein |
| CHO | Kohlenhydrate | DACH | nein |
| FIBT | Ballaststoffe | DACH | nein |
| VITA | Vitamin A (RE) | DACH / EFSA | **ja** |
| VITD | Vitamin D | DACH / EFSA | **ja** |
| VITE | Vitamin E | DACH / EFSA | **ja** |
| VITK | Vitamin K | DACH | kein UL |
| THIA | Vitamin B1 | DACH | kein UL |
| RIBF | Vitamin B2 | DACH | kein UL |
| NIA | Niacin | DACH / EFSA | **ja** |
| VITB6 | Vitamin B6 | DACH / EFSA | **ja** |
| FOL | Folat-Äquivalent | DACH | **ja (FOLAC)** |
| VITB12 | Vitamin B12 | DACH | kein UL |
| VITC | Vitamin C | DACH / EFSA | **ja** |
| NA | Natrium | DACH | kein UL belegt |
| K | Kalium | DACH | **ja (EFSA)** |
| CA | Calcium | DACH / EFSA | **ja** |
| MG | Magnesium | DACH / EFSA | **ja (suppl.)** |
| P | Phosphor | DACH / EFSA | **ja** |
| FE | Eisen | DACH / EFSA | **ja** |
| ZN | Zink | DACH / EFSA | **ja** |
| ID | Iod | DACH / EFSA | **ja** |
| CHORL | Cholesterin | kein RDA | nein |

### Priorität 2: Display-Tier 2 (Athlet-Ansicht)

| BLS-Code | Name | UL vorhanden |
|---|---|---|
| CU | Kupfer | **ja** |
| MN | Mangan | **ja** |
| FAPUN3 | Omega-3 gesamt | nein |
| F20:5CN3 | EPA | nein |
| F22:6CN3 | DHA | nein |
| LEU | Leucin | nein |
| AAE9 | Essentielle Aminosäuren gesamt | nein |

---

## Alters-/Geschlechts-Gruppen für V1

V1 benötigt mindestens:

| Gruppe | age_min | age_max | sex |
|---|---|---|---|
| Erwachsene Männer (18–50) | 18 | 50 | male |
| Erwachsene Frauen (18–50) | 18 | 50 | female |
| Ältere Männer (51+) | 51 | NULL | male |
| Ältere Frauen (51+) | 51 | NULL | female |

Optional für V1 (schema-vorbereitet, nicht aktiv ausgewertet):
- Jugendliche (14–17)
- Schwangere (`is_pregnant = true`)
- Stillende (`is_lactating = true`)

---

## Besondere Hinweis-Felder (notes)

Für folgende Nährstoffe sind `notes` zwingend:

```sql
-- Vitamin A
notes = 'Teratogen: erhöhte Aufnahme in Schwangerschaft vermeiden. RAE ≠ RE Beachtung.'

-- Vitamin D
notes = 'Akkumulation möglich. Fettlöslich. UL gilt für kombinierte Aufnahme Food+Supplements.'

-- Vitamin K
notes = 'Kein UL belegt. Wechselwirkung mit Antikoagulantien (Warfarin) möglich.'

-- Eisen
notes = 'UL gilt für Nicht-Anämiker. Supplementiertes Eisen hat anderes Risikoprofil.'

-- Magnesium (UL nur für Supplements)
notes = 'UL gilt nur für supplementiertes Magnesium, nicht für Nahrungsmagnesium.'
```

---

## Seed-Validierungsregeln (für Implementierung)

```typescript
function validateReferenceValue(value: NutrientReferenceValue): string[] {
  const errors: string[] = [];

  if (!value.source) errors.push('source ist Pflicht');
  if (value.ul === 0) errors.push('ul = 0 verboten — verwende null für "kein UL"');
  if (!value.rda && !value.ai) {
    // OK — Nährstoff ohne Zielwert → status grau
  }
  if (value.age_min !== null && value.age_max !== null && value.age_min > value.age_max) {
    errors.push('age_min darf nicht größer als age_max sein');
  }

  return errors;
}
```

---

## TODO

```
[ ] Quelltabellen beschaffen (DACH 2020, EFSA DRV)
[ ] Werte für Priorität-1 Nährstoffe extrahieren (Erwachsene 18–50)
[ ] Werte für Priorität-2 Nährstoffe (optional V1)
[ ] Als geprüfte SQL-Datei ablegen:
    docs/specs/Nutrition/NUTRIENT_REFERENCE_VALUES_SEED_DATA.sql
[ ] Quellenangaben und effective_from pro Nährstoff
[ ] UL-Risikoprofile in notes dokumentieren
[ ] Review durch medizinisch geprüfte Quelle bevor Produktionseinsatz
```
