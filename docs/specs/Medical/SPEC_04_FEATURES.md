# Medical Module — Feature Specs
> Spec Phase 4 | Features, Regeln, Implementierungsdetails

---

## Feature 1: Biomarker Catalog

Kuratierte Datenbank mit 100+ Biomarkern. Read-only nach Seed-Import.

### Dual-Range System (Kern-Feature)
IMMER zwei Bereiche anzeigen:
- **Lab Range** — klinischer Normal-Bereich (was Labor als "normal" meldet)
- **Optimal Range** — performanz-/longevity-optimaler Bereich (evidenzbasiert)

Beispiel Ferritin: Lab Normal 12–300 ng/mL → Optimal Athlete 80–150 ng/mL.
Beispiel Testosterone: Lab Normal 300–1000 → Optimal 500–900 ng/dL.

### Biomarker Flag Algorithmus
```typescript
function calcFlag(value, biomarker, gender, age): BiomarkerFlag {
  const range = getApplicableRange(biomarker, gender, age);
  if (value <= biomarker.critical_low_value)               return 'critical_low';
  if (value >= biomarker.critical_high_value)              return 'critical_high';
  if (value >= range.optimal_min && value <= range.optimal_max) return 'optimal';
  if (value >= range.lab_min    && value <= range.lab_max)      return 'normal';
  return value < range.lab_min ? 'low' : 'high';
}
```

### Suche
pg_trgm über name + name_de + common_name + abbreviations.
Sortierung nach display_priority DESC.

---

## Feature 2: OCR Import (Claude Vision)

### Pipeline
```
Schritt 1: PDF/Bild Upload → Supabase Storage
Schritt 2: Claude Vision API Call
  System Prompt: "Extract all biomarker values from this lab report.
    Return JSON: [{name, value, unit, lab_range_min, lab_range_max, date}]
    For each value provide confidence 0-100."
Schritt 3: Entity Matching — extrahierter Name → LOINC-Code → Biomarker ID
Schritt 4: Unit Normalization (mmol/L → mg/dL, etc.)
Schritt 5: Plausibilitätsprüfung (Wert ausserhalb biologisch möglichem Bereich → Flag)
Schritt 6: Review-UI wenn confidence < 0.80 ODER kein Biomarker Match
Schritt 7: User bestätigt → insert UserBiomarkerResults
```

### Confidence Thresholds
| Confidence | Aktion |
|---|---|
| ≥ 0.85 | Auto-Accept |
| 0.60–0.84 | User Review Required (`needs_verification = true`) |
| < 0.60 | Ablehnen + manuelle Eingabe empfehlen |

### Unit Normalization Map
```typescript
const UNIT_CONVERSIONS: Record<string, Record<string, {factor: number}>> = {
  Cholesterol: { 'mmol/L': { factor: 38.67 }},  // mmol/L × 38.67 = mg/dL
  Glucose:     { 'mmol/L': { factor: 18.02 }},
  Creatinine:  { 'µmol/L': { factor: 0.0113 }},
  Testosterone:{ 'nmol/L': { factor: 28.82 }},
  Cortisol:    { 'nmol/L': { factor: 0.0362 }},
};
```

---

## Feature 3: System Scores

5 Körpersystem-Scores × 0–100. Pure Functions, deterministisch.

### Score-Logik
```typescript
function calcSystemScore(system, userValues, gender, age): number {
  const markers = SYSTEM_MARKERS[system];
  const scores = markers
    .map(name => userValues.find(v => v.name === name))
    .filter(Boolean)
    .map(v => {
      const flag = calcFlag(v.value, v.biomarker, gender, age);
      return flag === 'optimal' ? 100 : flag === 'normal' ? 75 :
             flag === 'low' || flag === 'high' ? 40 : 10;
    });
  if (!scores.length) return null;
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
}
```

### Refresh-Trigger
Score wird neu berechnet:
1. Nach jedem neuen Lab-Ergebnis (via Trigger oder Cron)
2. Wenn User manuell "Neu berechnen" klickt
3. Täglich via Cron (Datumswechsel)

---

## Feature 4: Medical Alerts

### Alert-Generierung (Cron nach jedem Lab-Import)
```typescript
async function generateAlerts(userId: string, newResults: LabResult[]) {
  for (const result of newResults) {
    const flag = calcFlag(result.value, result.biomarker, user.gender, user.age);

    // Critical → sofortiger Alert
    if (flag === 'critical_low' || flag === 'critical_high') {
      await insertAlert(userId, result.biomarker_id, 'critical', flag, result.value);
    }
    // Out of range (aber nicht critical)
    else if (flag === 'low' || flag === 'high') {
      await insertAlert(userId, result.biomarker_id, 'warning', 'out_of_range', result.value);
    }
  }

  // Monitoring Overdue Check
  const overdue = await getMedicationsWithOverdueMonitoring(userId);
  for (const med of overdue) {
    await insertAlert(userId, null, 'info', 'monitoring_overdue', null, med.id);
  }
}
```

### Alert Protokoll
| Severity | UI | Arzt-Hinweis |
|---|---|---|
| critical | 🔴 Rotes Banner — prominent oben | "Sofort Arzt kontaktieren" |
| warning | 🟠 Orange Banner | "Mit Arzt besprechen" |
| info | 🟡 Hinweis-Karte | — |

---

## Feature 5: Symptom + Korrelation

### Symptom → Biomarker Korrelation
Nach Symptom-Eintrag prüft System:
1. Gibt es Lab-Ergebnisse der letzten 30 Tage?
2. Welche Biomarker sind NICHT optimal?
3. Hat dieser Biomarker bekannte Symptom-Verbindungen?

```typescript
// In biomarkers.affected_by_factors + biomarkers.clinical_significance
const SYMPTOM_BIOMARKER_MAP: Record<string, string[]> = {
  fatigue:     ['Ferritin', 'Hemoglobin', 'Vitamin D (25-OH)', 'TSH', 'Free T3', 'Cortisol'],
  brain_fog:   ['TSH', 'Vitamin B12', 'Vitamin D (25-OH)', 'Glucose (fasting)'],
  low_libido:  ['Total Testosterone', 'Estradiol', 'SHBG', 'Prolactin'],
  poor_sleep:  ['Cortisol (AM)', 'Magnesium (RBC)', 'Vitamin D (25-OH)'],
  weight_gain: ['TSH', 'Insulin (fasting)', 'HOMA-IR', 'Cortisol (AM)'],
};
```

Wenn Korrelation gefunden: Insight erstellen (non-diagnostic).

---

## Feature 6: Medication Monitoring

### Monitoring-Due Berechnung
```typescript
function calcNextMonitoringDate(
  medication: UserMedication,
  lastTestDate: Date | null
): Date {
  const FREQ_DAYS: Record<string, number> = {
    weekly: 7, monthly: 30, quarterly: 90, annually: 365,
  };
  const base = lastTestDate ?? medication.start_date;
  const days = FREQ_DAYS[medication.monitoring_frequency ?? 'quarterly'] ?? 90;
  return addDays(base, days);
}
```

Pending Action wenn `next_monitoring_due < today`.

---

## Feature 7: Supplement Effectiveness Tracking

### Automatische Erkennung
```typescript
// Wenn User Supplement im Supplements-Modul trackt + Lab-Ergebnis vorhanden:
function checkSupplementEffectiveness(
  supplementName: string,
  startDate: string,
  biomarkerHistory: LabValue[]
): EffectivenessResult {
  const before = biomarkerHistory.filter(h => h.test_date < startDate);
  const after  = biomarkerHistory.filter(h => h.test_date >= startDate);

  if (!before.length || !after.length) return { status: 'insufficient_data' };

  const baseline = before[before.length - 1].value;
  const latest   = after[after.length - 1].value;
  const changePct = (latest - baseline) / baseline * 100;

  return {
    status: changePct > 20 ? 'effective' : Math.abs(changePct) < 5 ? 'no_change' : 'partial',
    baseline_value: baseline,
    latest_value:   latest,
    change_pct:     Math.round(changePct),
  };
}
```

Bekannte Mappings:
- Vitamin D3 → Vitamin D (25-OH D)
- Iron Bisglycinate → Ferritin
- Omega-3 → hs-CRP, Triglycerides
- Zinc → Zinc (serum)
- Magnesium → Magnesium (RBC)

---

## Feature 8: Correlation Engine (Cross-Module)

Verbindet Biomarker-Veränderungen mit anderen Modul-Daten.

### Verfügbare Korrelationen
| Biomarker-Veränderung | Cross-Module | Insight |
|---|---|---|
| CRP > 1.0 mg/L | Training: wöchentliches Volumen | "CRP steigt bei >20 Sets/Woche" |
| HbA1c Verbesserung | Nutrition: Compliance-Score | "HbA1c verbessert sich bei >80% Nutrition-Compliance" |
| Ferritin < 40 | Recovery: Sleep Score | "Ferritin-Abfall korreliert mit schlechterem Schlaf" |
| Testosterone Abfall | Recovery: ACWR | "Testosterone fällt bei ACWR >1.5 (Übertraining)" |
| Vitamin D steigt | Supplements: Intake Log | "Vitamin D3-Supplementierung wirkt (18→52 ng/mL)" |

### Implementierung
Queries über materialized views + Nutrition/Training/Recovery Summary APIs.
Minimum: 3 Datenpunkte für statistisch relevante Korrelation.

---

## Feature 9: Doctor Export (PDF)

### Report-Struktur
1. Executive Summary — Aktuelle System Scores + Gesamt-Gesundheitstrend
2. Kritische + Auffällige Werte — Alle Flags außer "optimal" mit Kontext
3. Biomarker-Tabelle — Alle Werte: Lab Range | Optimal Range | User Wert | Flag | Trend
4. Supplement Effectiveness — Welche Supplements nachweislich wirken
5. Symptom-Übersicht — Letzte 90 Tage
6. Medikamenten-Übersicht — Aktive Medikamente

### Sicherheitshinweis im Report (Pflicht)
"Dieser Report wurde von LumeOS erstellt. Die enthaltenen Informationen stellen keine medizinische Diagnose oder Therapieempfehlung dar. Bitte besprechen Sie alle Befunde mit Ihrem Arzt."

---

## Feature 10: Privacy Architecture

### Tier 1 (Default): Local-First
- SQLite on Device
- Kein Cloud-Sync
- Zero-Knowledge: Lumeos sieht keine Daten

### Tier 2 (Opt-in): E2E Cloud
- User erstellt Encryption Key
- Cloud Backup mit User-Key verschlüsselt
- Lumeos kann Daten nicht lesen

### Tier 3 (Opt-in): Provider Sharing
```typescript
// Zeitbegrenzte Sharing-Tokens
interface ProviderAccess {
  patient_id:    string;
  provider_email: string;
  access_type:   'medical_data' | 'specific_categories';
  categories?:   string[];
  expires_at:    Date;    // max. 30 Tage
  access_token:  string;  // einmaliger Link
}
```

### Medical Data Standards Compliance
- HIPAA: RLS + Encryption at rest
- GDPR: Right to deletion, data export
- LOINC: Alle Biomarker gemappt
- FHIR R4: Export-Format für Doctor Sharing
