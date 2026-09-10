# Medical Module — User Flows
> Spec Phase 3 | Alle primären User Flows

---

## Flow 1: Ersten Bluttest importieren (OCR)

```
1. Tab "Blutwerte" → "+ Bluttest hinzufügen"
2. Zwei Optionen:
   [📄 PDF/Foto hochladen]  [✏️ Manuell eingeben]

3a. OCR-Weg:
   → Drag & Drop oder Kamera → Datei wird hochgeladen
   → Processing Screen: "Claude analysiert deinen Bluttest..." (15–30s)
   → Review-Tabelle:
     ┌────────────────────────────────────────────────────────┐
     │ Bitte überprüfe diese Werte                           │
     ├───────────────┬────────┬──────┬──────────┬───────────┤
     │ Biomarker     │ Wert   │ Einh │ Lab-Range │ Bestätigt │
     ├───────────────┼────────┼──────┼──────────┼───────────┤
     │ Cholesterol   │ 175    │ mg/dL│ 100-200   │ ✅        │
     │ LDL           │ 95     │ mg/dL│ <130      │ ✅        │
     │ TSH           │ 2.1    │ mIU/L│ 0.4-4.0   │ ✅        │
     │ Testosteron   │ ???    │ ng/dL│ —         │ ⚠️ Review │
     └───────────────┴────────┴──────┴──────────┴───────────┘
   → [Bestätigen + Speichern]

3b. Manuelle Eingabe:
   → Biomarker-Suche: "Cholesterol" tippen
   → Wert + Einheit eingeben
   → Datum + Labor (optional)
   → Weitere Werte hinzufügen

4. Speichern → System Scores werden neu berechnet
5. Alert falls kritische Werte → "🔴 Dein LDL ist kritisch hoch"
```

---

## Flow 2: Dashboard — Health Overview

```
1. Tab "Dashboard"
2. Overview:
   ┌────────────────────────────────────────────────────────┐
   │ Gesamtscore  78/100  Stabil →                         │
   │                                                        │
   │ Leber     ████████░░  85  Gut                         │
   │ Cardio    ███████░░░  72  Normal                       │
   │ Niere     █████████░  90  Optimal                     │
   │ Hormone   ██████░░░░  68  Verbesserungspotential       │
   │ Metabolic ████████░░  75  Gut                         │
   └────────────────────────────────────────────────────────┘

3. Aktive Alerts (wenn vorhanden):
   ┌────────────────────────────────────────────────────────┐
   │ ⚠️ WARNUNG: LDL 145 mg/dL                            │
   │    Über optimalem Bereich (<100). Cardio-Risiko.       │
   │    → "Das solltest du mit deinem Arzt besprechen"      │
   │    [Verstanden] [Details ansehen]                      │
   └────────────────────────────────────────────────────────┘

4. Quick Actions:
   [+ Bluttest importieren] [📊 Trends ansehen] [📋 Doctor Export]
```

---

## Flow 3: Biomarker Detail & Trend

```
1. Dashboard → Auf "Cardio" klicken → System-Aufschlüsselung
2. Marker: LDL 145 mg/dL

3. Detail-Screen:
   ┌────────────────────────────────────────────────────────┐
   │ LDL Cholesterin                  145 mg/dL             │
   │                                                        │
   │ Status: 🟠 Über Optimal          [NORMAL aber nicht optimal]│
   │                                                        │
   │ Labor-Normal:   <130 mg/dL                             │
   │ Optimal:        <100 mg/dL   ← Das ist das Ziel        │
   │ Kritisch:       >190 mg/dL                             │
   │                                                        │
   │ Verlauf (letzte 4 Tests):                              │
   │ [Linien-Chart: Sep → Dez → Mär → Jun]                  │
   │  145 → 138 → 152 → 145                                 │
   │ Trend: 📊 Stabil (keine signifikante Veränderung)       │
   │                                                        │
   │ Was beeinflusst LDL:                                   │
   │ ↑ Gesättigte Fettsäuren, Bewegungsmangel              │
   │ ↓ Omega-3, Hafer, Bewegung, Statine                   │
   │                                                        │
   │ Supplement-Wirkung:                                    │
   │ Omega-3 (2g/Tag) seit 3 Monaten → LDL: 152→145 (-4.6%)│
   │ ✅ Supplement zeigt Wirkung                            │
   └────────────────────────────────────────────────────────┘
```

---

## Flow 4: Symptom loggen + Korrelation

```
1. Tab "Tracking" → "Symptom loggen"
2. Eingabe:
   ┌────────────────────────────────────────────────────────┐
   │ Neues Symptom                                         │
   │                                                        │
   │ Symptom: [Müdigkeit ▾]                                │
   │ Kategorie: Physical                                    │
   │ Schwere:  [━━━━●━━━━━] 6/10                           │
   │ Seit wann: [heute morgen]                              │
   │                                                        │
   │ Mögliche Trigger:                                      │
   │ [+ Schlechter Schlaf] [+ Intensives Training]          │
   │                                                        │
   │ Gleichzeitige Blutwerte:                               │
   │ → Letzter Bluttest war 3 Wochen ago                    │
   │ → Relevante Werte: Ferritin 18 ng/mL ⚠️               │
   │                                                        │
   │ [Speichern]                                            │
   └────────────────────────────────────────────────────────┘

3. System erkennt: Ferritin niedrig → Müdigkeit häufig
4. Insight erstellt: "Dein niedriges Ferritin (18 ng/mL) könnte
   deine Müdigkeit erklären. Ferritin-Optimal: 80–150 ng/mL.
   → Mit Arzt besprechen."
```

---

## Flow 5: Medication Tracking + Monitoring Alert

```
1. Tab "Tracking" → "Medikament hinzufügen"
2. Eingabe:
   Medikament: "Metformin"
   Typ: Prescription
   Dosis: 500mg, 2× täglich
   Indikation: "Typ-2 Diabetes"
   requires_blood_monitoring: ✅ JA
   monitoring_frequency: "quarterly"

3. System setzt next_monitoring_due = today + 90 Tage

4. Nach 90 Tagen → Pending Action:
   "⚠️ Bluttest für Metformin überfällig
    Empfohlene Marker: HbA1c, Kreatinin, eGFR"
   [Bluttest hinzufügen] [Termin vereinbaren]
```

---

## Flow 6: Supplement Effectiveness Check

```
1. Tab "Insights" → "Supplement Wirksamkeit"
2. Übersicht:
   ┌────────────────────────────────────────────────────────┐
   │ Supplement Effectiveness                              │
   │                                                        │
   │ Vitamin D3 (3.000 IU, seit 3 Monaten):               │
   │ Vitamin D: 18 → 52 ng/mL  (+188%) ✅                  │
   │ Jetzt: optimal (40–60 ng/mL)                          │
   │                                                        │
   │ Omega-3 (2g, seit 2 Monaten):                         │
   │ LDL: 152 → 145 mg/dL (-4.6%) 🟡                       │
   │ hs-CRP: 2.1 → 1.8 mg/L (-14%) 🟡                      │
   │ Verbesserung, aber noch nicht optimal                  │
   │                                                        │
   │ Magnesium (400mg, seit 1 Monat):                      │
   │ Kein Bluttest vorhanden → Wirkung unklar              │
   │ [Magnesium (RBC) Test anfordern]                       │
   └────────────────────────────────────────────────────────┘
```

---

## Flow 7: Doctor Export erstellen

```
1. Tab "Insights" → "Doctor Export"
2. Konfiguration:
   Zeitraum: letzte 12 Monate
   Kategorien: [✅CBC] [✅Lipid] [✅Hormone] [✅Vitamine] [□ Thyroid]
   Detailgrad: Standard
   Ziel: Dr. Müller

3. PDF-Vorschau:
   - Executive Summary (aktuelle Scores)
   - Biomarker-Tabelle mit Trend-Pfeilen
   - Auffällige Werte (über optimal) hervorgehoben
   - Supplement-Effectiveness Abschnitt

4. [PDF herunterladen] oder [Link teilen] (mit Ablaufdatum)
```

---

## Flow 8: Medical Alert reagieren

```
1. Critical Alert: "🔴 Testosteorn 185 ng/dL — kritisch niedrig"
2. Alert-Ansicht:
   Wert: 185 ng/dL
   Kritisch niedrig: <200 ng/dL
   Labor-Normal: 300–1000 ng/dL
   
   "Dieser Wert liegt im kritisch niedrigen Bereich.
    Bitte besprich dies zeitnah mit deinem Arzt."
   
   [Arzt kontaktieren]  [Verstanden]

3. Bei "Verstanden" → acknowledged_at = now()
4. Alert bleibt in History sichtbar
```

---

## Flow 9: Cross-Module Alert (Training-Einschränkung)

```
Automatischer Flow, kein direktes User-Input:

1. Neues Lab-Ergebnis: hs-CRP = 3.8 mg/L (über optimal 1.0, aber noch normal <3.0)

2. Medical → Training Modul:
   "Erhöhte Entzündung (CRP 3.8) → Trainingsvolumen moderat halten"

3. Training-Modul zeigt beim nächsten Workout:
   ⚠️ "Erhöhte Entzündungsmarker — intensives Training heute nicht empfohlen"
   
4. Recovery-Modul erhält:
   CRP-Modifier = 0.85 → Recovery Score leicht reduziert
```

---

## Flow 10: Pending Actions

```
GET /api/medical/pending-actions

Auslöser:
- Critical Alert unbestätigt
- Monitoring für Medikament überfällig (next_monitoring_due < today)
- Kein Bluttest seit > 180 Tagen (optionaler Reminder)
- OCR Review erforderlich (needs_verification = true)

Response:
{
  "pending": [
    {
      "type": "critical_alert_unacknowledged",
      "priority": "high",
      "label": "🔴 Kritischer Alert: Testosteron 185 ng/dL",
      "alert_id": "uuid",
      "action_url": "/medical/alerts"
    },
    {
      "type": "ocr_review_required",
      "priority": "normal",
      "label": "Lab-Import vom 15. März: 3 Werte zur Überprüfung",
      "report_id": "uuid",
      "action_url": "/medical/import"
    }
  ]
}
```
