# Medical Module — Module Contract
> Spec Phase 1 | Final

---

## 1. Zweck

Das Medical-Modul ist ein regelbasiertes Tracking- und Alerting-System für Gesundheitsmarker, Blutwerte und Biomarker. Es verbindet Bloodwork mit allen anderen LumeOS-Modulen.

**KEIN Arzt. KEINE Diagnose. KEIN Therapieplan.**

---

## 2. Safety Rules (absolut, unveränderlich)

```
❌ Keine Diagnose
❌ Keine Therapieempfehlungen
❌ Keine Medikamenten-Dosierungsempfehlungen
❌ Keine "Dein Arzt ist falsch"-Aussagen
✅ Werte zeigen + Referenzbereiche (Lab + Optimal)
✅ Trends und Veränderungen aufzeigen
✅ "Das solltest du mit deinem Arzt besprechen" empfehlen
✅ Supplement-Timing-Information (bei Evidence-Grundlage)
```

Diese Regeln haben oberste Priorität und können durch keine User-Aktion überschrieben werden.

---

## 3. Prinzipien

| Prinzip | Bedeutung |
|---|---|
| **Dual-Range** | Immer Lab Range UND Optimal Range zeigen |
| **Privacy-First** | Medizinische Daten = sensibelste Kategorie, Local-First Default |
| **Standards-basiert** | LOINC-Codes, FHIR R4 compatible, RxNorm |
| **Deterministische Scores** | System Scores = Pure Functions, kein AI |
| **Schema-Isolation** | Schema `medical`, kein direktes Cross-Schema-Join |
| **3-sprachig** | name_de, name_en — TH wo vorhanden |

---

## 4. Outputs zu anderen Modulen

### 4.1 → Supplements: Biomarker-Verlauf für Effectiveness Tracking
```
GET http://medical:5800/api/medical/biomarkers/:id/history?user_id=:uid
```
Basis für: "Vitamin D: 18 → 52 ng/mL nach 3 Monaten Supplementierung ✅"

### 4.2 → Training: Biomarker-Warnungen
```
GET http://medical:5800/api/medical/for-training
```
```json
{
  "restrictions": [
    {"type": "volume_warning", "reason": "hs-CRP 2.8 mg/L — erhöhte Entzündung"},
    {"type": "intensity_warning", "reason": "Ferritin 18 ng/mL — niedrig"}
  ]
}
```

### 4.3 → Recovery: Cortisol + CRP Modifier
```
GET http://medical:5800/api/medical/recovery-biomarkers
```
```json
{
  "cortisol_am": {"value": 28, "flag": "high", "recovery_modifier": 0.85},
  "crp": {"value": 2.1, "flag": "normal", "recovery_modifier": 1.0}
}
```

### 4.4 → Goals: System Scores
```
POST http://goals:5900/api/goals/contributions
```
```json
{
  "module": "medical",
  "compliance_score": 78,
  "details": {
    "overall_health_score": 78,
    "cardiovascular_score": 72,
    "metabolic_score": 75,
    "liver_score": 85,
    "kidney_score": 90,
    "hormonal_score": 68
  }
}
```

### 4.5 → Buddy: Medical Context
```
GET /api/medical/for-ai
```

---

## 5. Inputs von anderen Modulen

### 5.1 Von Enhanced Supplements: Pflicht-Bloodwork Panel
Enhanced Mode Aktivierung → Medical zeigt prominenten Hinweis:
"Enhanced Mode aktiv: Bitte regelmäßige Bluttests (Pre/Mid/Post Cycle)"

### 5.2 Von Nutrition: Mikronährstoff-Mangel-Feedback
Nutrition-Modul kann Medical anfragen: "Hat User Vitamin D Mangel im Blut bestätigt?"
```
GET http://medical:5800/api/medical/biomarkers/vitamin-d/latest
```

---

## 6. Modul-Grenzen

### Medical BESITZT:
- Biomarker-Katalog (100+ Marker, LOINC-Codes, Dual Ranges)
- User Lab-Ergebnisse
- OCR Import Pipeline (Claude Vision)
- System Scores (Liver, Cardio, Kidney, Hormone, Metabolic)
- Medical Alerts
- Symptom Tracking
- Medication Tracking
- Correlation Engine (Biomarker ↔ Lifestyle)
- Doctor Export (PDF Report)

### Medical BESITZT NICHT:
| Was | Wer |
|---|---|
| Supplement-Empfehlungen | Supplements Modul |
| Trainingsplan | Training Modul |
| Recovery-Score | Recovery Modul |
| Ernährungsplan | Nutrition Modul |
| Medikamenten-Dosierungen | Kein Modul — Safety Rule |

---

## 7. API-Übersicht

```
http://medical:5800
  /api/medical/biomarkers          Katalog + User History
  /api/medical/lab-results         CRUD + OCR Import
  /api/medical/health-metrics      System Scores
  /api/medical/symptoms            Symptom Tracking
  /api/medical/medications         Medikamenten-Tracking
  /api/medical/alerts              Medical Alerts
  /api/medical/insights            Korrelationen + AI-Insights
  /api/medical/trends              Statistik-Analyse
  /api/medical/reports             Doctor Export PDF
  /api/medical/for-ai              Buddy Context
  /api/medical/for-goals           Goals Export
  /api/medical/for-training        Training Restrictions
  /api/medical/pending-actions     Offene Actions
```
