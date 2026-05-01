
---

## 10. Micronutrient Review — Supplements-Integration und UL-Logik

> Ergänzung April 2026 nach V1-Entscheidungsdokument

### Erweiterte calcMicroFlags Signatur

```typescript
function calcMicroFlags(
  foodTotals:       Record<string, number>,   // nutrient_code → Tageswert aus Food
  supplementTotals: Record<string, number>,   // nutrient_code → Tageswert aus Supplements
  referenceValues:  NutrientReferenceValue[], // aus nutrient_reference_values Tabelle
  userAge:          number,
  userSex:          'male' | 'female',
  userTier:         1 | 2 | 3
): MicroFlagEnhanced[] {

  const flags: MicroFlagEnhanced[] = [];
  const combinedTotals: Record<string, number> = {};

  // Kombiniere Food + Supplement Totals
  const allCodes = new Set([
    ...Object.keys(foodTotals),
    ...Object.keys(supplementTotals),
  ]);
  for (const code of allCodes) {
    combinedTotals[code] = (foodTotals[code] ?? 0) + (supplementTotals[code] ?? 0);
  }

  // Pro Nährstoff individuelle Logik
  for (const ref of referenceValues.filter(r =>
    r.age_min <= userAge &&
    (r.age_max === null || r.age_max >= userAge) &&
    (r.sex === 'both' || r.sex === userSex)
  )) {
    const actual = combinedTotals[ref.nutrient_code] ?? 0;
    const foodActual = foodTotals[ref.nutrient_code] ?? 0;
    const suppActual = supplementTotals[ref.nutrient_code] ?? 0;

    const target = ref.rda ?? ref.ai;
    if (!target) continue;   // Kein Zielwert → grau, kein Flag

    const pct = (actual / target) * 100;

    // UL-Prüfung (höchste Priorität — vor Deficit-Check)
    if (ref.ul && actual > ref.ul) {
      flags.push({
        nutrient_code:    ref.nutrient_code,
        flag_type:        'surplus',
        actual_value:     actual,
        target_value:     ref.ul,
        pct_of_target:    Math.round((actual / ref.ul) * 100),
        severity:         actual > ref.ul * 1.5 ? 'critical' : 'warn',
        source_breakdown: { food: foodActual, supplement: suppActual },
        ul_exceeded:      true,
        reference_type:   'ul',
      });
      continue;  // Wenn UL überschritten, kein separates Deficit-Flag
    }

    // Surplus ohne UL: nur warnen wenn sehr hoch
    if (pct > 300) {
      flags.push({
        nutrient_code:    ref.nutrient_code,
        flag_type:        'surplus',
        actual_value:     actual,
        target_value:     target,
        pct_of_target:    Math.round(pct),
        severity:         pct > 500 ? 'critical' : 'warn',
        source_breakdown: { food: foodActual, supplement: suppActual },
        ul_exceeded:      false,
        reference_type:   ref.rda ? 'rda' : 'ai',
      });
      continue;
    }

    // Deficit
    if (pct < 100) {
      let severity: 'info' | 'warn' | 'critical';
      if (pct < 50)      severity = 'critical';
      else if (pct < 80) severity = 'warn';
      else               severity = 'info';

      flags.push({
        nutrient_code:    ref.nutrient_code,
        flag_type:        'deficit',
        actual_value:     actual,
        target_value:     target,
        pct_of_target:    Math.round(pct * 10) / 10,
        severity,
        source_breakdown: { food: foodActual, supplement: suppActual },
        ul_exceeded:      false,
        reference_type:   ref.rda ? 'rda' : 'ai',
      });
    }
  }

  return flags.sort((a, b) => {
    // UL-Überschreitungen zuerst, dann Critical, dann Warn, dann Info
    if (a.ul_exceeded !== b.ul_exceeded) return a.ul_exceeded ? -1 : 1;
    return SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
  });
}
```

### Erweiterter MicroFlagEnhanced Type

```typescript
export interface MicroFlagEnhanced extends MicroFlag {
  source_breakdown: {
    food:       number;   // Anteil aus Food-Intake
    supplement: number;   // Anteil aus Supplement-Intake
  };
  ul_exceeded:  boolean;   // true wenn UL überschritten
  reference_type: 'rda' | 'ai' | 'ul';   // welcher Referenzwert genutzt wurde
}

export interface NutrientReferenceValue {
  nutrient_code:  string;
  age_min:        number;
  age_max:        number | null;
  sex:            'male' | 'female' | 'both';
  rda:            number | null;
  ai:             number | null;
  ul:             number | null;  // NULL = kein UL belegt
  unit:           string;
  source:         string;
}
```

### Besondere Nährstoff-Gruppen

**Fettlösliche Vitamine (Akkumulationsrisiko):**
```
Vitamin A (VITA): UL 3000 µg/Tag — Teratogen bei Schwangeren
Vitamin D (VITD): UL 100 µg/Tag — Hyperkalzämie-Risiko
Vitamin E (VITE): UL 300 mg/Tag — Blutungsrisiko
Vitamin K (VITK): kein UL belegt (nicht pauschal sicher bei Antikoagulantien)
```

**Fettlösliche Vitamine bei hohem Supplement-Anteil:**
Wenn `supplement_share > 80%` und `total > 150% RDA` → Hinweis auf überprüfen.

**Mineralstoffe mit UL:**
```
Eisen   (FE):  UL 45 mg/Tag
Zink    (ZN):  UL 25 mg/Tag
Selen   (SE):  UL 300 µg/Tag
Jod     (ID):  UL 600 µg/Tag
Kupfer  (CU):  UL 5 mg/Tag
```

**Wasserlösliche Vitamine mit UL:**
```
Vitamin B6 (VITB6): UL 25 mg/Tag — Neuropathie-Risiko
Vitamin C  (VITC):  UL 2000 mg/Tag — Nierensteins
Folsäure synthetisch (FOLAC): UL 1000 µg/Tag
Niacin     (NIA):   UL 35 mg/Tag
```

**Wasserlösliche Vitamine OHNE UL:**
```
Vitamin B1, B2, B12, Biotin, Pantothensäure
→ "kein UL belegt" — nicht pauschal sicher, aber aktuell kein UL
→ Nur bei extremen Überschreitungen (>500% RDA) warnen
```

### Test-Cases Ergänzung

```typescript
describe('calcMicroFlags — UL-Logik', () => {

  it('Vitamin D Food + Supplement kombiniert > UL → ul_exceeded', () => {
    const flags = calcMicroFlagsEnhanced(
      { 'VITD': 20 },    // Food
      { 'VITD': 85 },    // Supplement
      mockRefValues,     // UL = 100
      35, 'male', 1
    );
    const vdFlag = flags.find(f => f.nutrient_code === 'VITD');
    expect(vdFlag?.ul_exceeded).toBe(true);
    expect(vdFlag?.flag_type).toBe('surplus');
    expect(vdFlag?.source_breakdown.supplement).toBe(85);
  });

  it('Wasserlösliches Vitamin ohne UL bei 200% → kein Flag', () => {
    const flags = calcMicroFlagsEnhanced(
      { 'VITB12': 8 },   // 200% RDA
      {},
      mockRefValues,
      35, 'male', 1
    );
    expect(flags.find(f => f.nutrient_code === 'VITB12')).toBeUndefined();
  });

  it('Supplements nicht verfügbar → nur Food bewertet', () => {
    const flags = calcMicroFlagsEnhanced(
      { 'VITD': 4 },     // 20% RDA
      {},                // kein Supplement-Daten
      mockRefValues,
      35, 'male', 1
    );
    const vdFlag = flags.find(f => f.nutrient_code === 'VITD');
    expect(vdFlag?.severity).toBe('critical');
    expect(vdFlag?.source_breakdown.supplement).toBe(0);
  });

});
```
