# LUMEOS — Modul: Medical
> Konsolidiert | 2026-04-14
> API Port: 5800 | Status: ✅ 90% komplett

---

## 1. Zweck

Das Medical-Modul ist ein **regelbasiertes Monitoring-System** für Gesundheitsmarker, Blutwerte und Biomarker.

**Medical ist KEIN Arzt.** Es stellt keine Diagnosen, erstellt keine Therapiepläne und gibt keine Dosierungsempfehlungen für Medikamente. Es ist ein Tracking- und Alerting-System das den User informiert und an Fachpersonal verweist wenn nötig.

---

## 2. Architektur

```
Frontend (Next.js/Vite)
  apps/app/modules/medical/
    ├── HealthDashboard.tsx
    ├── LabImport.tsx             (Claude Vision OCR)
    ├── BiomarkerChart.tsx
    ├── SystemScoreCard.tsx
    └── MedicalAlerts.tsx

API Layer (Hono, Port 5800)
  src/api/medical/
    ├── routes/
    │   ├── biomarkers.ts
    │   ├── lab-results.ts
    │   ├── medications.ts
    │   ├── insights.ts
    │   └── trends.ts
    └── services/
        └── ocr.ts               (Claude Vision Integration)
```

---

## 3. Features

### 3.1 Lab-Result OCR (Claude Vision)
- Unterstützte Formate: PDF, Foto, Fax-Scans, handgeschrieben
- Extrahiert: Biomarker-Werte, Einheiten, Referenzbereiche, Labor-Info, Datum
- Confidence-Scoring: 0-100% Sicherheit pro Wert
- Validation: Biologisch plausible Bereiche prüfen
- Duplicate-Detection: Verhindert doppelte Einträge
- Manueller Review-Flag für unsichere Extraktionen
- Multi-Page Support

### 3.2 Biomarker Tracking
- **200+ trackbare Biomarker** über alle Körpersysteme
- Referenzbereiche: Labor-Standard + Optimal-Range + Age/Gender-spezifisch
- Trend-Analyse: Statistische Veränderungen über Zeit
- Korrelations-Analyse: Biomarker vs. Lifestyle-Faktoren (Training, Nutrition, Schlaf)
- Supplement-Effectiveness: Misst Einfluss auf Ziel-Biomarker

### 3.3 System Scores (5 × 0-100)

| System | Analysierte Marker |
|---|---|
| **Liver** | ALT, AST, GGT, Bilirubin, Albumin |
| **Cardio** | LDL, HDL, Triglycerides, CRP, Homocysteine |
| **Kidney** | Creatinine, BUN, eGFR, Uric Acid |
| **Hormone** | Testosterone, Estradiol, Cortisol, TSH, T3, T4 |
| **Metabolic** | HbA1c, Fasting Glucose, Insulin, HOMA-IR |

Score-Berechnung: Gewichteter Average der Marker pro System, relativ zu Optimal-Ranges.

### 3.4 Medical Alerts
- Automatische Warnungen bei kritischen Werten
- Alert-Typen: out_of_range, critical_high, critical_low, trending_bad
- Integration in Coach-Modul (erklärt Alerts, gibt Kontext)
- Dringlichkeit: info, warning, critical

### 3.5 Trend-Analyse (Statistisch)
- Lineare Regression für einfache Trends
- Polynomial Fitting für komplexe Muster
- Change-Point-Detection: Erkennt signifikante Trendänderungen
- Outlier-Detection: Flaggt Ausreißer
- Predictive Modeling: Zukünftige Wert-Projektionen
- Optimal Testing Schedule: Wann nächster Test empfohlen

### 3.6 Korrelations-Discovery
- Lifestyle ↔ Biomarker (Ernährung, Training, Schlaf, Stress)
- Supplement ↔ Biomarker (Effektivitätsmessung)
- Cross-Modul-Korrelationen

### 3.7 Medikamenten-Tracking
- Medikamenten-Zeitplan (optional)
- Side-Effect-Logging
- Wechselwirkungen mit Supplements

### 3.8 Population Benchmarking
- Vergleich mit Altersgruppe, Geschlecht, Fitness-Level
- Biologisches Alter (Health Age vs. Chronologisches Alter)
- Percentile-Ranking

---

## 4. Datenbank-Schema

### `biomarkers` (Master-Katalog)
```sql
id              UUID PK
name            VARCHAR NOT NULL
name_de         VARCHAR
category        VARCHAR               -- Liver, Cardio, Kidney, Hormone, Metabolic
unit            VARCHAR               -- mmol/L, ng/dL, IU/L...
reference_low   NUMERIC               -- Labor-Untergrenze
reference_high  NUMERIC               -- Labor-Obergrenze
optimal_low     NUMERIC               -- Optimaler Bereich (nicht nur normal)
optimal_high    NUMERIC
critical_low    NUMERIC               -- Kritisch niedrig
critical_high   NUMERIC               -- Kritisch hoch
gender_specific BOOLEAN               -- Unterschiedliche Ranges M/F
age_adjustments JSONB                 -- Age-Range: {range: [18,30], low: x, high: y}
description     TEXT
interpretation  TEXT
```

### `user_lab_results` (Einzel-Ergebnisse)
```sql
id              UUID PK
user_id         UUID FK
biomarker_id    UUID FK
value           NUMERIC NOT NULL
unit            VARCHAR NOT NULL
lab_date        DATE NOT NULL
lab_name        VARCHAR
import_source   VARCHAR               -- manual, ocr, wearable
ocr_confidence  NUMERIC               -- 0-100
notes           TEXT
created_at      TIMESTAMPTZ
```

### `lab_reports` (OCR-Import Container)
```sql
id              UUID PK
user_id         UUID FK
report_date     DATE
lab_name        VARCHAR
file_url        VARCHAR               -- Supabase Storage
ocr_status      VARCHAR               -- pending, completed, failed
ocr_results     JSONB                 -- Raw OCR Output
review_required BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ
```

### `medical_alerts`
```sql
id              UUID PK
user_id         UUID FK
biomarker_id    UUID FK
alert_type      VARCHAR               -- out_of_range, critical_high, critical_low, trending_bad
severity        VARCHAR               -- info, warning, critical
triggered_value NUMERIC
triggered_at    TIMESTAMPTZ
acknowledged_at TIMESTAMPTZ
notes           TEXT
```

### `medications`
```sql
id              UUID PK
user_id         UUID FK
name            VARCHAR NOT NULL
dosage          VARCHAR
frequency       VARCHAR
start_date      DATE
end_date        DATE
notes           TEXT
```

### `medication_logs`
```sql
id          UUID PK
user_id     UUID FK
medication_id UUID FK
taken_at    TIMESTAMPTZ
dose_taken  VARCHAR
side_effects TEXT
notes       TEXT
```

---

## 5. API-Endpunkte

| Route | Hauptendpunkte |
|---|---|
| `biomarkers.ts` | `GET /biomarkers` (Katalog), `GET /biomarkers/:id/history` |
| `lab-results.ts` | `POST /lab-results`, `GET /lab-results/history`, `DELETE /lab-results/:id` |
| `lab-results.ts` (OCR) | `POST /lab-reports/import` (Claude Vision Upload) |
| `insights.ts` | `GET /insights` (AI-generierte Analyse), `GET /insights/system-scores` |
| `trends.ts` | `GET /trends/:biomarker_id`, `GET /trends/correlations` |
| `medications.ts` | CRUD Medications + Logs |

---

## 6. System Score Berechnung

```typescript
function computeSystemScore(system: string, userValues: LabValue[]): number {
  const markers = SYSTEM_MARKERS[system]; // z.B. ['ALT', 'AST', 'GGT', ...]
  
  const scores = markers.map(marker => {
    const value = getUserValue(userValues, marker);
    if (!value) return null;
    
    const ref = getBiomarkerRef(marker);
    const optimalRange = [ref.optimal_low, ref.optimal_high];
    
    if (value.value >= optimalRange[0] && value.value <= optimalRange[1]) return 100;
    if (value.value >= ref.reference_low && value.value <= ref.reference_high) return 70;
    if (value.value >= ref.critical_low && value.value <= ref.critical_high) return 30;
    return 0;
  }).filter(Boolean);
  
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
```

---

## 7. Verbindungen zu anderen Modulen

| Modul | Verbindung |
|---|---|
| **Goals** | System Scores → Health Marker Goal Progress |
| **Supplements** | Lab-Daten für Supplement-Effektivitätsmessung (z.B. D3 → 25-OH-D) |
| **Recovery** | Cortisol, CRP → Recovery-Score-Komponente |
| **Coach (AI)** | Erklärt Alerts, gibt evidenzbasierte Kontext-Infos (KEIN Diagnose) |
| **Nutrition** | Mikronährstoff-Defizite im Blut → Nutrition-Anpassungen |

---

## 8. Safety Regeln (absolut)

- ❌ Keine Diagnose
- ❌ Keine Therapieempfehlungen
- ❌ Keine Medikamenten-Dosierungsempfehlungen
- ❌ Keine "Dein Arzt ist falsch"-Aussagen
- ✅ Werte zeigen + Referenzbereiche
- ✅ Trends und Veränderungen aufzeigen
- ✅ "Das solltest du mit deinem Arzt besprechen" empfehlen
- ✅ Supplement-Timing-Informationen (bei Evidence-Grundlage)

---

## 9. Offene Punkte

| # | Typ | Beschreibung | Priorität |
|---|---|---|---|
| TODO | 🟡 | Doctor Integration (Data Sharing mit Arzt) | 🟡 MITTEL |
| TODO | 🟡 | Kontinuierliche Glukose-Monitor (CGM) Integration | 🟡 MITTEL |
| TODO | 🟢 | Lab Integration (LabCorp, Quest) | 🟢 NIEDRIG |
| TODO | 🟢 | Population Benchmarking vollständig | 🟢 NIEDRIG |
