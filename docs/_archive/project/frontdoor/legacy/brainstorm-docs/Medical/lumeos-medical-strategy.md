# Lumeos Medical Module — Strategy Document

**Date:** 2026-02-17
**Status:** Research Complete → Strategy Defined

---

## 🎯 Key Findings

### Markt-Landscape
- **14 Apps/Platforms analysiert** across 4 Kategorien: Lab Trackers (InsideTracker, Healthmatters, TrackMyLabs), Symptom+Correlation (Bearable, CareClinic), Medication (MyTherapy), Premium Health (Function Health, Lifeforce, Outlive Bio), Privacy-First (Biotracker, BloodTrack)
- **Digital Health Markt:** $330B+ (2025), Bloodwork-Apps Nische wächst stark
- **User-Zahlen:** MyTherapy 10M+, CareClinic 500K+, Bearable 200K+, InsideTracker 100K+

### Kritische Gaps
1. **MEGA-GAP: NOBODY connects Bloodwork + Meds + Symptoms + Nutrition + Training + Supplements** — jede App ist ein Silo
2. **Lab Ranges vs. Optimal Ranges** — Standard-Labs sagen "normal" bei Ferritin 30, aber optimal für Athleten ist 80-150. Nur Healthmatters/InsideTracker differenzieren
3. **PDF Upload ist table stakes** — User haben Bluttests als PDF, OCR-Import erwarten alle, bieten wenige
4. **Correlation Engine fehlt überall** — Bearable zeigt dass User WOLLEN wissen "was beeinflusst was", aber macht es nur mit Symptoms
5. **Privacy ist #1 Concern** — Medizinische Daten sind das Sensibelste. Biotracker (zero cloud) und BloodTrack (client-side) beweisen die Nachfrage

### Competitive Intelligence
- **InsideTracker:** $499/yr Premium, eigene Bluttests + AI Recommendations, aber teuer und US-only
- **Function Health:** $499/yr, 100+ Biomarker Tests, Waitlist-Modell, Premium Positioning
- **Healthmatters:** Beste Optimal Ranges Engine, Research-basiert, aber nur Web
- **Bearable:** Beste Correlation UX ("What affects what?"), 200K+ Users, bewiesene Nachfrage
- **MyTherapy:** 10M+ Users, beste Medication Reminder UX, aber NULL Bloodwork/Nutrition
- **Biotracker:** Zero-Cloud Privacy, alle Daten lokal, kleine aber loyale Userbase

---

## 🏗️ Lumeos Medical — Architektur

### Modul-Übersicht
```
┌──────────────────────────────────────────────────┐
│                MEDICAL MODULE                     │
├──────────────┬──────────────┬────────────────────┤
│  Bloodwork   │  Medications │  Symptoms          │
│  Lab Results │  Rx + OTC    │  Daily Tracking    │
├──────────────┴──────────────┴────────────────────┤
│            Biomarker Engine                       │
│  100+ Markers, Optimal Ranges, Trend Analysis     │
├──────────────────────────────────────────────────┤
│            Correlation Engine                     │
│  "What affects what?" across ALL modules          │
├──────────────────────────────────────────────────┤
│            Medical Data Standards                 │
│  LOINC · RxNorm · ICD-10 · SNOMED CT · FHIR     │
├──────────────────────────────────────────────────┤
│         Cross-Module Connectors                   │
│  Nutrition ↔ Supplements ↔ Training ↔ Recovery    │
└──────────────────────────────────────────────────┘
```

### Datenfluss
1. **Input:** PDF Upload (OCR) → Lab Results parsed → Biomarker-Werte extrahiert
2. **Processing:** Optimal Range Mapping → Trend Analysis → Flag Anomalies
3. **Correlation:** Biomarker-Changes ↔ Nutrition Log ↔ Supplement Intake ↔ Training Load ↔ Sleep/Recovery
4. **Output:** Dashboard (Biomarker Cards), Alerts, Recommendations, Trend Charts

### Integration mit anderen Modulen
| Modul | Datenfluss | Beispiel |
|-------|-----------|---------|
| **Nutrition** | Biomarker Deficiency → Food Suggestions | "Ferritin 25 → Rotes Fleisch, Spinat, Vitamin C zu Mahlzeiten" |
| **Supplements** | Biomarker → Supplement Gaps | "Vitamin D 18 ng/mL → 5000 IU/Tag supplementieren" |
| **Training** | Biomarker → Training Load Warnings | "CRP erhöht → Trainingsvolumen reduzieren" |
| **Recovery** | Biomarker → Recovery Insights | "Cortisol hoch + HRV niedrig → Overtraining?" |
| **Enhanced Supps** | Bloodwork → Cycle Monitoring | "Leberwerte + Lipide während TRT tracken" |

---

## 👤 Persona Design

### Persona 1: "Thomas" — Health-Conscious Athlete (40%)
- **Alter:** 32, männlich, trainiert 5x/Woche
- **Ziel:** Bloodwork optimieren, nicht nur "normal" sein
- **Pain Points:** Arzt sagt "alles normal" obwohl Testosterone bei 350 ng/dL (optimal: 600+)
- **Feature-Needs:** PDF Upload, Optimal Ranges, Training-Correlation, Supplement Recommendations
- **Zahlungsbereitschaft:** $19.99/mo — investiert bereits $200+/yr in Bluttests

### Persona 2: "Anna" — Chronic Symptom Tracker (25%)
- **Alter:** 38, weiblich, Autoimmun-Erkrankung
- **Ziel:** Verstehen was Symptoms triggert, Meds optimieren
- **Pain Points:** Bearable trackt Symptoms aber nicht Bloodwork/Nutrition, CareClinic ist umständlich
- **Feature-Needs:** Daily Symptom Logging, Medication Reminders, Correlation Reports, Doctor Export
- **Zahlungsbereitschaft:** $9.99/mo — braucht es täglich

### Persona 3: "Dr. Meyer" — Preventive Medicine (20%)
- **Alter:** 55, männlich, Longevity-Fokus
- **Ziel:** Quarterly Bloodwork Tracking, Trend Analysis über Jahre
- **Pain Points:** Excel-Spreadsheets für Bluttests, keine App zeigt Langzeit-Trends gut
- **Feature-Needs:** Multi-Year Trend Charts, 100+ Biomarkers, Research-Links, Export für Arzt
- **Zahlungsbereitschaft:** $29.99/mo — Preis irrelevant

### Persona 4: "Julia" — TRT/HRT Patient (15%)
- **Alter:** 45, weiblich, Hormonersatztherapie
- **Ziel:** Hormonwerte + Nebenwirkungen tracken
- **Pain Points:** Kein Tool verbindet Hormone + Symptome + Blutwerte + Befinden
- **Feature-Needs:** Hormone Panel Tracking, Medication Log, Side Effect Correlation, Enhanced Supplements Integration
- **Zahlungsbereitschaft:** $19.99/mo — medizinische Notwendigkeit

---

## 💰 Monetization

> **⚠️ WICHTIG:** Das Monetarisierungskonzept wurde grundlegend geändert. Abo = Wallet-Guthaben, Revenue = Transaktionsgebühren. AI-Features = Micro-Transactions aus Wallet. Details: `system/wallet-and-monetization.md`. Preise/Prozentsätze unten sind VERALTET und werden noch angepasst.


### Pricing Tiers

| Tier | Preis | Features |
|------|-------|----------|
| **Free** | $0 | Manuelles Bloodwork-Logging (10 Marker), Medication Reminders, Basic Trends |
| **Plus** | $9.99/mo | PDF OCR Upload (5/mo), 50+ Biomarkers, Symptom Tracking, Correlation Reports, Medication Interactions |
| **Pro** | $19.99/mo | Unlimited PDF Upload, 100+ Biomarkers, Optimal Ranges, Cross-Module Correlation, Doctor Export, API Access |
| **Medical** | $29.99/mo | Everything + FHIR Integration, Multi-Year Trends, Family Profiles, Priority Support |

### Revenue Streams
1. **Subscriptions** (70%) — Core Revenue
2. **Lab Test Partnerships** (15%) — Affiliate mit Quest, Labcorp, LetsGetChecked (10-15% Commission)
3. **Telemedicine Referrals** (10%) — "Werte auffällig? → Verbinde dich mit einem Arzt" (per Lead Fee)
4. **Anonymized Research Data** (5%) — Aggregierte, anonymisierte Biomarker-Trends (Opt-in, GDPR-compliant)

### Conversion Strategy
- **Free → Plus:** "Du hast 3 Bluttests als PDF → lade sie hoch und sieh Trends" (OCR als Hook)
- **Plus → Pro:** "Dein Vitamin D korreliert mit deinem Sleep Score → Upgrade für Cross-Module Insights"
- **Retention:** Quarterly Bloodwork Reminders, "Time for your next test" Push, Year-in-Review Report

---

## 🔧 Technical Architecture

### OCR Pipeline (Bloodwork PDF)
```
PDF Upload → PDF Parser (pdf.js)
  ↓
Text Extraction → Layout Analysis
  ↓
NLP Entity Recognition
  → Biomarker Name Matching (LOINC Codes)
  → Value Extraction (Regex + NLP)
  → Unit Normalization (mg/dL, nmol/L, etc.)
  → Reference Range Extraction
  ↓
Validation Layer
  → Plausibility Check (Testosterone 10000? → Flag)
  → Unit Conversion (mmol/L → mg/dL)
  → LOINC Code Assignment
  ↓
Storage → PostgreSQL (encrypted at rest)
```

### Medical Data Standards
| Standard | Purpose | Size | Cost |
|----------|---------|------|------|
| **LOINC** | Lab Test Codes | 90K+ codes | Free |
| **RxNorm** | Drug Nomenclature | 100K+ drugs | Free (NLM) |
| **ICD-10** | Diagnosis Codes | 70K+ codes | Free |
| **SNOMED CT** | Clinical Terms | 350K+ concepts | Free (NLM member) |
| **OpenFDA** | Drug Interactions | Full US drug DB | Free API |
| **FHIR R4** | Health Data Exchange | Standard | Free |

### Biomarker Engine
```typescript
interface Biomarker {
  id: string;              // LOINC code
  name: string;            // e.g., "Testosterone, Total"
  category: BiomarkerCategory; // Hormones, Lipids, Metabolic, etc.
  value: number;
  unit: string;
  labRange: { min: number; max: number };  // Standard lab range
  optimalRange: { min: number; max: number }; // Athlete/optimal range
  userRange?: { min: number; max: number };   // Personalized
  trend: 'rising' | 'stable' | 'falling';
  percentile?: number;     // vs. age/sex cohort
}
```

### Optimal Ranges Database
- **Source:** Peer-reviewed literature, Healthmatters research, functional medicine standards
- **Segmented by:** Age, Sex, Activity Level, Goals (Athlete vs. Longevity vs. General)
- **Example:** Ferritin — Lab Normal: 12-300 ng/mL → Optimal Athlete: 80-150 ng/mL

### Privacy Architecture
```
Tier 1 (Default): Local-First
  → SQLite on device, no cloud sync
  → Zero-knowledge: Lumeos cannot see data

Tier 2 (Opt-in): E2E Encrypted Cloud
  → User holds encryption key
  → Cloud backup for multi-device
  → Lumeos still cannot see data

Tier 3 (Opt-in): Shared with Coach/Doctor
  → Selective sharing per Biomarker/Category
  → Time-limited access tokens
  → Audit log of all access
```

### Tech Stack Additions
```
OCR:       Google Document AI / AWS Textract (PDF → structured data)
NLP:       spaCy + custom medical NER model (biomarker extraction)
Crypto:    libsodium (E2E encryption)
FHIR:      hapi-fhir (Java) or fhir.js (Node)
Storage:   SQLite (local) + PostgreSQL (cloud, encrypted)
```

---

## ⚖️ Key Design Decisions

### 1. Optimal Ranges > Lab Normal Ranges
**Decision:** Lumeos zeigt IMMER Optimal Ranges zusätzlich zu Lab Ranges
**Rationale:** "Normal" bei Labs bedeutet "nicht krank" — nicht "optimal". Ferritin 15 ist "normal" aber suboptimal für Athleten. Healthmatters hat bewiesen dass User das wollen. Key Differentiator vs. TrackMyLabs/generic trackers.

### 2. Privacy-First mit Tiered Storage
**Decision:** Default = Local-Only, Cloud = Opt-in + E2E Encrypted
**Rationale:** Medizinische Daten = sensibelste Kategorie. HIPAA/GDPR Compliance ist Pflicht. Biotracker und BloodTrack haben gezeigt dass Privacy ein USP ist. Local-First eliminiert Data Breach Risiko.

### 3. PDF OCR als Primär-Import (nicht manuelle Eingabe)
**Decision:** PDF Upload ist der Haupt-Input-Weg für Bluttests
**Rationale:** User haben PDFs vom Labor. Manuell 50+ Werte eintippen = niemand macht das. OCR mit 95%+ Accuracy ist machbar (Google Document AI). Validierung durch User ("Stimmen diese Werte?").

### 4. LOINC als Biomarker-Standard
**Decision:** Jeder Biomarker wird auf LOINC-Code gemappt
**Rationale:** 90K+ Codes, internationaler Standard, kostenlos, ermöglicht Lab-übergreifende Vergleichbarkeit. Ohne Standard-Codes ist Multi-Lab-Tracking unmöglich.

### 5. Correlation Engine als Cross-Module Core
**Decision:** Correlations sind KEIN Feature sondern eine Core Engine die alle Module nutzen
**Rationale:** Bearable hat bewiesen: User WOLLEN wissen "Mein Schlaf ist schlecht wenn Ferritin unter 50 UND ich nicht supplementiere". Nur möglich mit Cross-Module Data. Kein Competitor kann das.

### 6. Keine eigenen Lab Tests (vorerst)
**Decision:** Lumeos verkauft keine Bluttests, nur Tracking + Analysis
**Rationale:** InsideTracker/Function Health machen $499/yr mit eigenen Tests — aber das ist ein anderes Business (Logistik, Labs, Regulations). Phase 1: Tracking. Phase 2 (optional): Lab Partnerships als Affiliate.

### 7. Doctor Export als Premium Feature
**Decision:** PDF/FHIR Export für Arztbesuche im Pro Tier
**Rationale:** User wollen dem Arzt zeigen "Hier sind meine Trends". Generierter Report mit Optimal Ranges + Trends + Correlations. Arzt sieht auf einen Blick was relevant ist.

---

## 🚀 Lumeos Medical USP

### Primary USP: "The First App That Connects Your Bloodwork to Everything Else"

Kein Competitor verbindet:
- **Bloodwork** (100+ Biomarkers, Optimal Ranges, Trend Analysis)
- **Medications** (Rx + OTC + Supplements, Interactions)
- **Symptoms** (Daily Tracking, Correlation)
- **Nutrition** (Was du isst beeinflusst deine Werte)
- **Training** (Overtraining Detection via Biomarkers)
- **Supplements** (Wirkt dein Vitamin D? Check dein Blut)
- **Recovery** (HRV + Cortisol + Sleep + Biomarkers)

**InsideTracker** kommt am nächsten, aber: $499/yr, nur eigene Tests, keine Nutrition/Training/Supplement Integration.

### Secondary USPs

1. **Optimal Ranges statt Lab Ranges**
   - "Dein Arzt sagt normal. Wir sagen: du könntest besser sein."
   - Segmentiert nach Alter, Geschlecht, Aktivitätslevel, Ziel

2. **PDF OCR — 30 Sekunden statt 30 Minuten**
   - Foto/PDF vom Bluttest → alle Werte automatisch erfasst
   - Validation UI: "Stimmen diese Werte?"

3. **Correlation Engine**
   - "Dein Schlaf Score fiel 14 Tage nachdem dein Ferritin unter 50 ging"
   - "Dein CRP steigt wenn dein Trainingsvolumen über 20 Sets/Woche geht"
   - Cross-Module Insights die kein anderes Tool bieten kann

4. **Privacy-First**
   - Local-First Default — deine medizinischen Daten verlassen NIE dein Gerät
   - Optional E2E Cloud — du hältst den Schlüssel
   - Selektives Sharing mit Arzt/Coach

5. **Medical-Grade Data Standards**
   - LOINC Codes, FHIR Export, SNOMED CT
   - Interoperabel mit Krankenhaus-Systemen
   - Nicht nur ein Tracker — ein Medical Data Hub

### Warum Lumeos gewinnt
| Kriterium | InsideTracker | Bearable | MyTherapy | Healthmatters | **Lumeos** |
|-----------|:---:|:---:|:---:|:---:|:---:|
| Bloodwork Tracking | ✅ | ❌ | ❌ | ✅ | ✅ |
| Optimal Ranges | ✅ | ❌ | ❌ | ✅ | ✅ |
| Symptom Correlation | ❌ | ✅ | ❌ | ❌ | ✅ |
| Medication Tracking | ❌ | 🟡 | ✅ | ❌ | ✅ |
| Nutrition Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| Training Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| Supplement Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| Privacy (Local-First) | ❌ | ❌ | ❌ | ❌ | ✅ |
| PDF OCR Import | ❌ | ❌ | ❌ | 🟡 | ✅ |
| **Price** | $499/yr | $50/yr | Free | Free | **$120/yr** |
