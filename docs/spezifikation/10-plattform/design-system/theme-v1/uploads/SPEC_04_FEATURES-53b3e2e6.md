# Supplements Module — Feature Specs
> Spec Phase 4 | Features, Regeln, Implementierungsdetails

---

## Feature 1: Supplement Catalog

### Was es ist
Kuratierte, evidence-graded Supplement-Datenbank.
Nicht Open Source (NIH DSLD / Open Food Facts) — eigene kuratierte Bibliothek
mit wissenschaftlich korrekten Evidence-Grades.

### Evidence Grading (S bis F)
| Grade | Kriterium | Beispiele |
|---|---|---|
| S | Meta-Analysen + 300+ RCTs | Creatine, Caffeine, Whey, Vitamin D |
| A | Mehrere hochwertige RCTs | Omega-3, Magnesium, Zinc, Beta-Alanine |
| B | Einige RCTs, konsistente Ergebnisse | Ashwagandha, Melatonin, K2, Collagen |
| C | Wenige Studien, gemischte Ergebnisse | Turkesterone, Alpha-GPC, Berberine |
| D | Anekdotisch, Tier-Studien, Hype | BCAAs (bei ausreichend Protein) |
| F | Widerlegt oder kein nachweisbarer Effekt | CLA, Tribulus, Deer Antler |

### Suche
- Volltext: Name + name_de + Kategorie
- Filter: Kategorie, Evidence Grade, Timing, Goal-basiert
- Sortierung: Evidence Grade zuerst (S oben)

### nutrients_provided (Cross-Modul)
Jedes Supplement kann Nährstoffe ans Nutrition-Modul melden:
```json
"nutrients_provided": {
  "VITD": {"amount": 1000, "unit": "IU"},
  "FAPUN3": {"amount": 2000, "unit": "mg"}
}
```
Keys = BLS-Nährstoff-Codes. Erlaubt echte Mikronährstoff-Summierung.

---

## Feature 2: Enhanced Substances Catalog

### Was es ist
~85 kuratierte Enhanced Substances in 10 Kategorien.
Strikt getrennt von Standard-Catalog. Opt-In only.

### Kategorien
AAS (Testosterone Esters, Oral, Injectable) | SARMs | Peptides | GH |
GLP-1 Agonists | PCT | Aromatase Inhibitors | Support Supplements | Other

### Spezielle Felder
- hepatotoxicity_level: none/low/moderate/high/severe
- cardiovascular_risk: analog
- androgenic_rating + anabolic_rating (0–500+ Skala)
- requires_pct / requires_ai / requires_serm (Flags)
- aromatization: none/low/moderate/high
- detection_time_days (für getestete Athleten)
- legal_status JSONB (pro Jurisdiktion)

### Bloodwork Panel (Pflicht-Marker)
Pre/Mid/Post Cycle: Total T, Free T, E2 (sensitive), LH, FSH, SHBG, Prolactin,
Hematocrit, Hemoglobin, HDL/LDL, Triglycerides, ALT, AST, GGT, Bilirubin,
Creatinine, BUN, eGFR, PSA, fasting Glucose, HbA1c, TSH, IGF-1, hs-CRP.
→ Diese Marker werden im Medical Modul trackt und mit Enhanced Logs korreliert.

---

## Feature 3: Stack Management

### Regeln
- Beliebig viele Stacks pro User
- Nur 1 aktiv gleichzeitig (DB-Constraint: EXCLUDE)
- Aktivierung deaktiviert automatisch alle anderen
- Stacks können Quellen haben: user | coach | marketplace | template

### Stack Templates
System-Templates für häufige Goals:
- "Muscle Building Starter" (Creatine + Vitamin D + Omega-3 + Magnesium)
- "Daily Health Basics" (Vitamin D + Omega-3 + Magnesium + K2)
- "Fat Loss Stack" (Caffeine + Creatine + Omega-3 + Vitamin D)
- "Recovery & Sleep" (Magnesium + Omega-3 + Melatonin + Glycine)
- "Longevity" (Vitamin D + K2 + Omega-3 + Magnesium + CoQ10 + NAC)

### Stack Item Customization
- Custom-Name: "Morning Magnesium" statt "Magnesium Glycinate"
- Eigene Dosis (kann von Empfehlung abweichen)
- Eigenes Timing
- Cycling-Konfiguration: {on_weeks: 8, off_weeks: 4}

### Frequenz-Optionen
daily | weekdays | training_days | custom | cycling

---

## Feature 4: Daily Intake Tracking

### Tages-Generierung
Täglich um Mitternacht (Cron) oder bei erstem App-Öffnen:
→ IntakeLog Einträge für alle aktiven Stack Items erstellen
→ Status: 'pending'
→ Conflict-Resolution: ON CONFLICT DO NOTHING (existierende nicht überschreiben)

### Status-Flow
```
pending → taken (1-Tap)
pending → skipped (bewusst übersprungen)
pending → snoozed + Reminder
```

### Cycling-Check (täglich)
Beim Generieren der IntakeLogs:
```
IF stack_item.frequency = 'cycling':
  IF today is in 'off' phase → IntakeLog NICHT erstellen
  IF today is in 'on' phase → IntakeLog erstellen
```

### Compliance-Berechnung
```typescript
compliance_pct = (items_taken / (items_taken + items_skipped + items_pending)) * 100
// pending zählen als "noch nicht entschieden"
// für Score: nur taken / (taken + skipped)
```

### Evidence Weight Factor (für Goals Score)
```typescript
const EVIDENCE_WEIGHT = { S: 1.0, A: 0.9, B: 0.75, C: 0.6, D: 0.4, F: 0.0 };
weighted_compliance = items.reduce((sum, item) => {
  return sum + (item.status === 'taken' ? EVIDENCE_WEIGHT[item.evidence_grade] : 0);
}, 0) / items.length;
```

---

## Feature 5: Interaction Checker

### Prinzip
Regelbasiert, deterministisch. Kein AI.
Läuft bei: Supplement hinzufügen, Stack aktivieren, täglich bei Intake-Generierung.

### Algorithmus
```typescript
function checkInteractions(stackItems: StackItem[]): InteractionResult[] {
  const results: InteractionResult[] = [];
  const ids = stackItems.map(i => i.supplement_id).filter(Boolean);
  const names = stackItems.map(i => i.custom_name || i.supplement_name);

  // Alle Interactions laden wo BEIDE Supplements im Stack sind
  const interactions = db.query(`
    SELECT * FROM supplements.supplement_interactions
    WHERE is_active = true
      AND (
        (supplement1_id = ANY($1) OR supplement1_name = ANY($2))
        AND (supplement2_id = ANY($1) OR supplement2_name = ANY($2))
      )
    ORDER BY CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 WHEN 'caution' THEN 2 ELSE 3 END
  `, [ids, names]);

  return interactions;
}
```

### Severity-Protokoll
| Severity | Aktion |
|---|---|
| critical | Einnahme sperren (blocks_intake=true) + Pflicht-Alert |
| warning | Alert + Timing-Empfehlung + User muss bestätigen |
| caution | Hinweis anzeigen |
| info | Passiv anzeigen (z.B. Synergien) |

### Timing-Empfehlungen
separate_2h | separate_4h | separate_8h | take_together | avoid

---

## Feature 6: Intelligence Engine (Cross-Module USP)

### 6a. Gap Analysis (Nutrition → Supplements)

```typescript
async function calcNutritionGaps(userId: string, date: string) {
  // 1. Nutrition Mikros holen
  const nutritionRes = await fetch(`${NUTRITION_API}/summary?date=${date}`);
  const micros = nutritionRes.data.micros; // {VITD: 420, MG: 245, ...}

  // 2. Supplement-Beitrag addieren
  const suppNutrients = await getSupplementNutrients(userId, date);
  const totalMicros = mergeMicros(micros, suppNutrients);

  // 3. RDA-Vergleich
  const gaps = RDA_VALUES.map(({ code, rda_male, rda_female, unit }) => {
    const actual = totalMicros[code] ?? 0;
    const rda = userGender === 'male' ? rda_male : rda_female;
    const pct = rda > 0 ? (actual / rda) * 100 : 100;
    return { code, actual, rda, unit, pct, is_gap: pct < 80 };
  });

  return gaps;
}
```

### 6b. Redundancy Detection

```typescript
function detectRedundancies(stackItems: StackItem[]) {
  const nutrientTotals: Record<string, {total: number, sources: string[]}> = {};

  for (const item of stackItems) {
    const nutrients = item.supplement?.nutrients_provided ?? {};
    for (const [code, data] of Object.entries(nutrients)) {
      if (!nutrientTotals[code]) nutrientTotals[code] = { total: 0, sources: [] };
      nutrientTotals[code].total += data.amount;
      nutrientTotals[code].sources.push(item.custom_name ?? item.supplement_name);
    }
  }

  // Finde Nährstoffe mit mehreren Quellen UND > 150% RDA
  return Object.entries(nutrientTotals)
    .filter(([code, data]) => data.sources.length > 1 && exceedsRDA(code, data.total, 1.5))
    .map(([code, data]) => ({
      nutrient: code,
      total: data.total,
      sources: data.sources,
      pct_of_rda: calcRdaPct(code, data.total),
    }));
}
```

### 6c. Training-Aware Timing

```typescript
async function getTrainingAwareStack(userId: string) {
  const workout = await fetch(`${TRAINING_API}/schedule?date=today`);
  const sessionType = workout.data?.session_type; // 'push' | 'pull' | 'legs' | 'rest' | null

  const stackItems = await getActiveStackItems(userId);
  const preWorkout = stackItems.filter(i => i.timing === 'pre_workout');
  const postWorkout = stackItems.filter(i => i.timing === 'post_workout');

  if (!sessionType || sessionType === 'rest') {
    return {
      message: 'Rest Day — Pre-Workout Items heute optional',
      pre_workout: preWorkout.map(i => ({ ...i, suggested_skip: true })),
      post_workout: [],
    };
  }

  return {
    message: `${SESSION_LABELS[sessionType]} heute`,
    pre_workout: preWorkout,
    post_workout: postWorkout,
  };
}
```

### 6d. Cost Tracking

```typescript
function calcMonthlyCost(stackItems: StackItem[]): CostBreakdown {
  const items = stackItems.map(item => {
    const daysPerMonth = FREQUENCY_DAYS[item.frequency] ?? 30;
    const monthly = item.dose * (item.supplement?.cost_per_serving ?? 0) * daysPerMonth;
    return { name: item.custom_name ?? item.supplement_name, monthly };
  });

  const total = items.reduce((sum, i) => sum + i.monthly, 0);
  return { total, breakdown: items };
}
```

---

## Feature 7: Inventory Management

### Verbrauchsrate-Tracking
```
Tagesverbrauch = Σ (dose × days_per_week / 7) pro Item
Restlaufzeit = current_stock / tages_verbrauch (Tage)
Low-Stock Alert: Restlaufzeit < low_stock_threshold (Default: 7 Tage)
```

### Expiry-Tracking
Ablaufdatum → Alert 30 Tage vor Ablauf.
Abgelaufene Produkte → in Inventory als "expired" markieren.

---

## Feature 8: Enhanced Mode (PEDs)

### Architektur
- Separater Tab / Sektion (nie in Standard-Flow gemischt)
- Opt-In: Explizite Einwilligung + Age Check erforderlich
- Getrennte Tabellen: enhanced_substances, intake_logs (mode='enhanced')
- Enhanced Interactions: umfassen auch Enhanced+Standard Kombinationen

### Cycling-Pflicht
Alle Enhanced Substances haben requires_cycling = true.
cycling_protocol JSONB ist Pflicht für Enhanced Stack Items.

### Bloodwork-Integration
Enhanced Users werden im Medical-Modul zur regelmässigen Blutabnahme aufgefordert.
Pre/Mid/Post Cycle Bloodwork Panel (30+ Marker).
Correlation: Enhanced Log + Biomarker-Verlauf.

---

## Feature 9: Compliance Score

```typescript
function calcSupplementScore(
  intakeLogs: IntakeLog[],
  stackItems: StackItem[]
): SupplementScore {
  const working = intakeLogs.filter(l => l.status !== 'pending');
  const taken = working.filter(l => l.status === 'taken');

  // Basis-Compliance
  const base_pct = working.length > 0 ? taken.length / working.length : 0;

  // Evidence-gewichtet
  const weighted = stackItems.reduce((sum, item) => {
    const log = intakeLogs.find(l => l.stack_item_id === item.id);
    const w = EVIDENCE_WEIGHT[item.evidence_grade ?? 'C'];
    return sum + (log?.status === 'taken' ? w : 0);
  }, 0) / (stackItems.length || 1);

  const score = Math.round(weighted * 100);

  return {
    score,
    status: score >= 80 ? 'ok' : score >= 50 ? 'warn' : 'low',
    base_compliance_pct: Math.round(base_pct * 100),
    items_taken: taken.length,
    items_scheduled: working.length,
  };
}

const EVIDENCE_WEIGHT = { S: 1.0, A: 0.9, B: 0.75, C: 0.6, D: 0.4, F: 0.0 };
```

---

## Feature 10: Pending Actions

GET /api/supplements/pending-actions

**Auslöser:**
| Typ | Bedingung |
|---|---|
| take_supplement | Intake pending + Timing-Slot ist verstrichen (nach Uhrzeit) |
| low_stock | Bestand < low_stock_threshold |
| interaction_unresolved | Critical/Warning Interaction im Stack nicht aufgelöst |
| cycling_reminder | Enhanced: Off-Zyklus beginnt morgen |
| bloodwork_due | Enhanced: Pre/Mid/Post Cycle Termin fällig |
