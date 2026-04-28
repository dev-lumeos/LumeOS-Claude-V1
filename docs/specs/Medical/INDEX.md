# Medical Module — Spec Index
> LumeOS | Vollständige Spezifikation

---

## Dokument-Index

| Spec | Datei | Inhalt |
|---|---|---|
| — | `CONSOLIDATED_KNOWLEDGE.md` | Alle 13 Alt-Dokumente destilliert |
| 01 | `SPEC_01_MODULE_CONTRACT.md` | Zweck, Safety Rules, Inputs/Outputs, Modul-Grenzen |
| 02 | `SPEC_02_ENTITIES.md` | 10 Core Entities (Biomarker, LabReport, HealthMetrics, Symptoms, Medications, ...) |
| 03 | `SPEC_03_USER_FLOWS.md` | 10 User Flows (OCR Import, Dashboard, Trend, Symptom, Supplement Effectiveness, ...) |
| 04 | `SPEC_04_FEATURES.md` | 10 Features (Catalog, OCR, Scores, Alerts, Correlation Engine, Privacy, ...) |
| 05 | `SPEC_05_BIOMARKER_CATALOG.md` | 100+ Biomarker SQL Seed-Daten, 9 Kategorien, Optimal Ranges, Supplement Mapping |
| 06 | `SPEC_06_DATABASE_SCHEMA.md` | Vollständiges SQL (10 Tabellen, Trigger für Flag-Berechnung, Views, RLS, Grants) |
| 07 | `SPEC_07_API.md` | Alle API Endpoints mit Request/Response-Schemas inkl. OCR Import Flow |
| 08 | `SPEC_08_IMPORT_PIPELINE.md` | Seed Pipeline (9 SQL-Dateien), OCR Entity Matching Aliases, Reference Ranges |
| 09 | `SPEC_09_SCORING.md` | System Scores, Flag-Algorithmus, Trend-Berechnung, Supplement Effectiveness |
| 10 | `SPEC_10_COMPONENTS.md` | Frontend: 34 Components, 16 Hooks, 2 Stores, i18n 280+ Keys |

---

## Safety Rules (absolut, immer gültig)

```
❌ Keine Diagnose
❌ Keine Therapieempfehlungen
❌ Keine Medikamenten-Dosierungsempfehlungen
❌ Keine "Dein Arzt ist falsch"-Aussagen
✅ Werte zeigen + Referenzbereiche
✅ Trends und Veränderungen aufzeigen
✅ "Das solltest du mit deinem Arzt besprechen"
```

---

## Kern-Entscheidungen (archiviert)

| Entscheidung | Begründung |
|---|---|
| **Dual-Range (Lab + Optimal)** | "Normal" ≠ "Optimal" — zentraler Differenzierungsvorteil vs. MyTherapy, CareClinic |
| **Privacy-First (Local-Default)** | Medizinische Daten = sensibelste Kategorie. HIPAA/GDPR. Biotracker-Beweis. |
| **PDF OCR als Primär-Import** | Manuell 50+ Werte tippen macht niemand. OCR mit Claude Vision = Adoption-Schlüssel |
| **LOINC als Standard** | Multi-Lab Vergleichbarkeit. Ohne Standard: "Cholesterin" Lab A ≠ Lab B |
| **Trigger für Flag-Berechnung** | Flag immer korrekt — kein App-Code kann vergessen es zu berechnen |
| **Correlation Engine Cross-Module** | Nur möglich mit dieser Architektur. Kein Competitor kann das bauen ohne alle Module |
| **Doctor Export als Premium** | Arzt-Report mit Optimal Ranges + Trends + Supplements = starker Pro-Incentive |
| **Kein eigenes Lab-Netzwerk** | Anderes Business (Logistik, Regulations). Phase 1: Tracking + Analysis |
| **Supplement Effectiveness automatisch** | Wenn Biomarker-History vorhanden + Supplement im Stack → automatische Korrelation |

---

## Kompetitiver Vorteil

| Kriterium | InsideTracker | Bearable | MyTherapy | Healthmatters | **LumeOS** |
|---|:---:|:---:|:---:|:---:|:---:|
| Bloodwork Tracking | ✅ | ❌ | ❌ | ✅ | ✅ |
| Optimal Ranges | ✅ | ❌ | ❌ | ✅ | ✅ |
| PDF OCR | ❌ | ❌ | ❌ | 🟡 | **✅** |
| Symptom Correlation | ❌ | ✅ | ❌ | ❌ | **✅** |
| Medication Tracking | ❌ | 🟡 | ✅ | ❌ | **✅** |
| Nutrition Integration | ❌ | ❌ | ❌ | ❌ | **✅** |
| Training Integration | ❌ | ❌ | ❌ | ❌ | **✅** |
| Supplement Effectiveness | ❌ | ❌ | ❌ | ❌ | **✅** |
| Privacy Local-First | ❌ | ❌ | ❌ | ❌ | **✅** |
| Preis | $499/yr | $50/yr | Free | Free | **~$120/yr** |

---

## Offene Punkte

| # | Beschreibung | Priorität |
|---|---|---|
| 1 | OCR Pipeline vollständig (Claude Vision + Entity Matching) | 🟡 |
| 2 | FHIR R4 Export für Doctor Sharing | 🟡 |
| 3 | Correlation Engine vollständig (Statistical Queries) | 🟡 |
| 4 | CGM Integration (Continuous Glucose Monitor) | 🟡 |
| 5 | E2E Encryption vollständig (User-held Keys) | 🟢 |
| 6 | Population Benchmarking (NHANES Seed-Daten) | 🟢 |
| 7 | Lab Integration APIs (LabCorp, Quest) | 🟢 |

---

## Technologie-Stack

| Layer | Tech |
|---|---|
| API | Hono.js, Port 5800, TypeScript |
| Database | Supabase PostgreSQL, Schema `medical` |
| OCR | Claude Vision API (PDF + Foto) |
| Standards | LOINC, RxNorm, FHIR R4, OpenFDA |
| Auth | JWT via globalAuthMiddleware |
| Scoring | packages/scoring/src/medical.ts (Pure Functions) |
| Contracts | packages/contracts/src/medical/ |
| Frontend | Next.js 15, React, Zustand, TanStack Query |
| Reporting | PDF Generation (Doctor Export, Rechtshinweis Pflicht) |
| i18n | DE/EN/TH (280+ Keys) |
