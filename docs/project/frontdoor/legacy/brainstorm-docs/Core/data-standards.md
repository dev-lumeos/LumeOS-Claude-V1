# Lumeos Medical — Data Standards & Interoperability

## Health Data Standards für Lumeos

### 1. FHIR (Fast Healthcare Interoperability Resources)
- **Was:** Der moderne Standard für Gesundheitsdaten-Austausch (HL7)
- **Warum wichtig:** Apple Health Records nutzt FHIR, 700+ US-Krankenhäuser unterstützen es
- **Für Lumeos:** Ermöglicht direkten Import von Krankenhaus-Daten (wenn User es erlaubt)
- **Resources relevant für Lumeos:**
  - `Observation` — Lab Results, Vitals
  - `MedicationRequest` — Verschreibungen
  - `MedicationStatement` — Was Patient tatsächlich nimmt
  - `Condition` — Diagnosen
  - `DiagnosticReport` — Blutbild-Berichte
  - `Patient` — Demographics

### 2. LOINC (Logical Observation Identifiers Names and Codes)
- **Was:** Universelle Codes für Lab-Tests (90,000+)
- **Warum wichtig:** Standardisiert "Total Cholesterol" über alle Labs der Welt
- **Für Lumeos:** Mapping zwischen verschiedenen Lab-Formaten
- **Beispiel:** `2093-3` = Total Cholesterol, `718-7` = Hemoglobin
- **Lizenz:** Kostenlos, Registrierung nötig

### 3. SNOMED CT (Systematized Nomenclature of Medicine)
- **Was:** Klinische Terminologie (350,000+ Concepts)
- **Warum wichtig:** Standardisiert Diagnosen, Symptome, Procedures
- **Für Lumeos:** Condition Profiles, Symptom Library
- **Lizenz:** Kostenlos in IHTSDO-Mitgliedsländern (inkl. DE, US, UK etc.)

### 4. ICD-10/ICD-11 (International Classification of Diseases)
- **Was:** WHO-Krankheitsklassifikation (55,000+ Codes)
- **ICD-11:** Neueste Version (2022), erweitert um Traditional Medicine
- **Für Lumeos:** Condition Profiles, Disease Monitoring
- **Beispiel:** `E11` = Type 2 Diabetes, `E03` = Hypothyroidism
- **Lizenz:** Kostenlos (WHO)

### 5. RxNorm
- **Was:** Standardisierte Drug Names (NIH/NLM)
- **Warum wichtig:** "Metformin" = "Glucophage" = "Metformin HCl 500mg Tablet"
- **Für Lumeos:** Medication Module — Drug lookup, Interaction Checking
- **API:** REST API verfügbar (rxnav.nlm.nih.gov)
- **Lizenz:** Kostenlos

### 6. OpenFDA
- **Was:** FDA Drug/Device/Food Data APIs
- **Für Lumeos:**
  - `drug/label` — Beipackzettel
  - `drug/event` — Adverse Events (Nebenwirkungen)
  - `drug/interaction` — Drug-Drug Interactions
- **API:** open.fda.gov (kostenlos, Rate Limits)

---

## OCR Pipeline für Bloodwork Upload

### Architektur:
```
PDF/Image Upload
    ↓
OCR Engine (Tesseract / Google Vision / Apple Vision Framework)
    ↓
Text Extraction
    ↓
NLP Parser (Regex + ML)
    ↓
Marker Identification (→ LOINC Mapping)
    ↓
Value + Unit + Reference Range Extraction
    ↓
Validation (plausibility check)
    ↓
User Confirmation ("Stimmen diese Werte?")
    ↓
Storage → Dashboard
```

### OCR Optionen:
| Engine | Kosten | Accuracy | Platform |
|--------|--------|----------|----------|
| **Apple Vision Framework** | $0 | Gut | iOS/macOS only |
| **Google Cloud Vision** | $1.50/1000 pages | Sehr gut | Cross-platform |
| **Tesseract (Open Source)** | $0 | OK-Gut | Cross-platform |
| **Azure Computer Vision** | $1/1000 pages | Sehr gut | Cross-platform |
| **AWS Textract** | $1.50/1000 pages | Sehr gut (table extraction!) | Cross-platform |

**Empfehlung für Lumeos MVP:** Apple Vision Framework (iOS, $0) + Tesseract (Android/Web, $0). Premium: AWS Textract für bessere Table Extraction.

---

## Privacy Architecture

### Tiered Storage Model:
```
Tier 1: Device-Only (Default)
├── Bloodwork Results (encrypted, local)
├── Medication Data (encrypted, local)
├── Symptom Logs (encrypted, local)
└── Health Documents (encrypted, local)

Tier 2: Encrypted Cloud Sync (Opt-In)
├── E2E Encrypted Backup
├── Cross-Device Sync
├── User holds encryption key
└── Server CANNOT read data

Tier 3: Shared Access (Explicit)
├── Doctor Sharing (time-limited link)
├── Caregiver Access (permission-based)
└── Export (PDF/CSV) for appointments
```

### Compliance:
- **HIPAA** (US) — Required for health data
- **GDPR/DSGVO** (EU) — Right to erasure, data portability
- **PDPA** (Thailand) — Relevant für Tom's Location
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
