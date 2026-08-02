# Medical Module — Strategie & Markt

## Markt-Landscape

**14 Apps/Platforms analysiert** — 4 Kategorien: Lab Trackers (InsideTracker, Healthmatters, TrackMyLabs), Symptom+Correlation (Bearable, CareClinic), Medication (MyTherapy), Premium Health (Function Health, Lifeforce), Privacy-First (Biotracker, BloodTrack)

| App | Preis | Stärke | Schwäche |
|---|---|---|---|
| **InsideTracker** | $499/yr | Beste AI Recommendations, eigene Tests | Teuer, US-only, kein Nutrition/Training |
| **Function Health** | $499/yr | 100+ Biomarker Tests, Premium | Waitlist, kein Integration |
| **Healthmatters** | Free | Beste Optimal Ranges Engine | Nur Web, kein Nutrition/Training |
| **Bearable** | $50/yr | Beste Correlation UX, 200K+ Users | Kein Bloodwork/Nutrition |
| **MyTherapy** | Free | Beste Medication Reminder UX, 10M+ | NULL Bloodwork/Nutrition |
| **Biotracker** | — | Zero-Cloud Privacy | Nische, kein Cross-Module |

---

## Kritische Markt-Lücken

1. **MEGA-GAP: Niemand verbindet Bloodwork + Meds + Nutrition + Training + Supplements** — jede App ist ein Silo
2. **Lab Ranges vs. Optimal Ranges** — Standard-Labs: "normal" bei Ferritin 30, aber optimal für Athleten ist 80–150
3. **PDF Upload fehlt meistens** — User haben Bluttests als PDF, manuell 50 Werte tippen = niemand macht das
4. **Correlation Engine fehlt** — Bearable beweist: User wollen "was beeinflusst was", aber nur mit Symptoms
5. **Privacy ist #1 Concern** — Biotracker (zero cloud) zeigt die Nachfrage

---

## User Personas

### Thomas — Health-Conscious Athlete (40%)
- **Profil:** 32J, 5×/Woche Training, gibt $200+/yr für Bluttests aus
- **Pain:** Arzt sagt "normal" bei T=350 ng/dL (optimal: 600+)
- **Needs:** PDF Upload, Optimal Ranges, Training-Korrelation, Supplement Recommendations
- **Zahlungsbereitschaft:** $19.99/mo

### Anna — Chronic Symptom Tracker (25%)
- **Profil:** 38J, Autoimmun-Erkrankung
- **Pain:** Bearable trackt keine Bloodwork/Nutrition, CareClinic ist umständlich
- **Needs:** Symptom + Bloodwork Korrelation, Medication Reminders, Doctor Export
- **Zahlungsbereitschaft:** $9.99/mo

### Dr. Meyer — Preventive Medicine (20%)
- **Profil:** 55J, Longevity-Fokus, Excel-Spreadsheets für Bluttests
- **Pain:** Keine App zeigt Langzeit-Trends gut
- **Needs:** Multi-Year Trends, 100+ Biomarkers, Doctor Export
- **Zahlungsbereitschaft:** $29.99/mo

### Julia — TRT/HRT Patient (15%)
- **Profil:** 45J, Hormonersatztherapie
- **Pain:** Kein Tool verbindet Hormone + Symptome + Blutwerte
- **Needs:** Hormone Panel, Medication Log, Side Effect Korrelation
- **Zahlungsbereitschaft:** $19.99/mo

---

## Lumeos USPs

### Primary USP: "Die erste App die Blutwerte mit allem verbindet"

InsideTracker kommt am nächsten, aber: $499/yr, nur eigene Tests, keine Nutrition/Training/Supplements.

**Lumeos verbindet alles:**
- Bloodwork (100+ Biomarkers, Optimal Ranges)
- Medications (Rx + OTC + Supplements, Interactions)
- Symptoms (Daily, Korrelation)
- Nutrition (Was du isst → deine Werte)
- Training (Übertraining via Biomarker)
- Supplements (Wirkt dein Vitamin D?)
- Recovery (HRV + Cortisol + Biomarker)

### Secondary USPs

1. **Optimal Ranges statt Lab Ranges** — "Arzt sagt normal. Wir sagen: du könntest besser sein."
2. **PDF OCR — 30 Sekunden statt 30 Minuten** — Foto/PDF → alle Werte automatisch
3. **Correlation Engine** — "CRP steigt wenn Trainingsvolumen >20 Sets/Woche" — kein Competitor
4. **Privacy-First** — Local-First Default, E2E Cloud optional
5. **Medical-Grade Standards** — LOINC, FHIR R4, SNOMED CT

---

## Kompetitive Positionierung

| Kriterium | InsideTracker | Bearable | MyTherapy | Healthmatters | **LumeOS** |
|---|:---:|:---:|:---:|:---:|:---:|
| Bloodwork Tracking | ✅ | ❌ | ❌ | ✅ | ✅ |
| Optimal Ranges | ✅ | ❌ | ❌ | ✅ | ✅ |
| PDF OCR Import | ❌ | ❌ | ❌ | 🟡 | ✅ |
| Symptom Correlation | ❌ | ✅ | ❌ | ❌ | ✅ |
| Medication Tracking | ❌ | 🟡 | ✅ | ❌ | ✅ |
| Nutrition Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| Training Integration | ❌ | ❌ | ❌ | ❌ | ✅ |
| Privacy Local-First | ❌ | ❌ | ❌ | ❌ | ✅ |
| Preis | $499/yr | $50/yr | Free | Free | **~$120/yr** |

---

## Key Design-Entscheidungen

| Entscheidung | Rationale |
|---|---|
| Optimal Ranges IMMER zeigen | "Normal" ≠ "Optimal" — Healthmatters hat bewiesen dass User das wollen |
| Privacy-First (Local-Default) | Medizinische Daten = sensibelste Kategorie. Biotracker-Beweis |
| PDF OCR als Primär-Import | Manuell 50+ Werte tippen macht niemand. OCR = Adoption-Schlüssel |
| LOINC als Standard | Lab-übergreifende Vergleichbarkeit. Ohne Standard ist Multi-Lab-Tracking unmöglich |
| Correlation Engine als Core (nicht Feature) | Nur möglich mit Cross-Module-Architektur, kein Nachbau ohne diese Grundlage |
| Keine eigenen Lab Tests (Phase 1) | Anderes Business (Logistik, Regulations). Phase 1: Tracking. Phase 2: Lab Affiliate |
| Doctor Export als Premium | Arzt-Report mit Optimal Ranges + Trends = starker Pro-Tier Incentive |
