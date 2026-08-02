# Medical Module — Offene Punkte, Bugs & Geplante Features

## 🔴 Kritische Bugs / Ausstehend

### Bug 1: OCR Pipeline — Claude Vision Integration
**Status:** Scaffolded, nicht vollständig implementiert
**Was fehlt:** `services/ocr.ts` → echten Claude Vision API-Call, Entity Recognition für Biomarker-Namen, Unit Normalization (mmol/L → mg/dL etc.)

### Bug 2: Lab Range vs. Optimal Range — Anzeige
**Problem:** Einige Biomarker-Karten zeigen nur Lab Range, nicht Optimal Range
**Fix:** `BiomarkerCard.tsx` muss immer beide Ranges zeigen wenn optimal_range vorhanden

---

## 🟡 Mittlere Priorität

### Feature: FHIR R4 Export
**Beschreibung:** Vollständiger HL7 FHIR R4 Export für Arzt/Krankenhaus-Systeme
**Abhängigkeit:** Pro-Tier Feature

### Feature: Correlation Engine vollständig
**Beschreibung:** Automatische Korrelations-Erkennung über alle Module
**Was fehlt:** Statistical correlation queries über Zeitreihen (Nutrition, Training, Recovery Daten)

### Feature: CGM Integration (Continuous Glucose Monitor)
**Beschreibung:** Real-Time Glukose-Daten von Dexcom/Abbott Libre
**Warum:** HbA1c ist gut, aber CGM zeigt Glukose-Variabilität (Time in Range)

### Feature: Lab Integration APIs
**Beschreibung:** LabCorp + Quest Diagnostics Direct APIs für automatischen Import
**Aufwand:** Hoch (Vertragspartner, Authentifizierung, Datenschutz)

---

## 🟢 Niedrige Priorität

### Feature: E2E Encryption vollständig
**Beschreibung:** Local-First SQLite + User-held Encryption Keys für Cloud-Backup
**Rationale:** Privacy USP — wichtig für Premium-Tier

### Feature: Population Benchmarking vollständig
**Beschreibung:** `biomarker_population_statistics` Tabelle mit echten Referenzwerten befüllen
**Datenquellen:** NHANES, Healthmatters Research, Peer-reviewed Studies

### Feature: Doctor Integration
**Beschreibung:** Direktes Datensharing mit Arzt (zeitbegrenzte Tokens, HIPAA)

### Feature: Genomic Integration (Phase 3)
**Beschreibung:** 23andMe / AncestryDNA → genetische Risikofaktoren

---

## Offene Design-Fragen

| Frage | Empfehlung |
|---|---|
| Optimal Ranges — wer pflegt die Datenbank? | Internes Team, quartalsweise Review vs. Peer-reviewed Literatur |
| Optimal Ranges für Frauen / HRT-Patientinnen? | Separate Range-Einträge in biomarker_reference_ranges |
| Wie viele historische Bluttests im Free Tier? | 3 Imports / letzte 12 Monate, dann Pro |
| OCR Confidence Threshold für auto-accept? | ≥0.85 auto-accept, 0.60–0.84 User-Review, <0.60 ablehnen |
| Doctor Export — welche Biomarker standardmäßig? | Alle Tier 1 (CBC + Metabolic + Lipid + Liver) |

---

## Bekannte Technische Schulden

| Schuld | Beschreibung |
|---|---|
| Materialized View Refresh | `user_latest_biomarkers` braucht Cron-Refresh nach neuen Imports |
| `user_health_metrics` Berechnung | Aktuell manuell via API, sollte via DB-Trigger nach jedem Lab-Import |
| `biomarker_population_statistics` | Tabelle existiert, aber kein Seed-Daten |
| LOINC-Code Vollständigkeit | Nicht alle 100+ Biomarker haben LOINC-Codes — Lücken füllen |
| Gender-spezifische Ranges | Aktuell nur für wenige Marker implementiert — alle brauchen es |
