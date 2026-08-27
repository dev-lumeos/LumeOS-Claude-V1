---
nr: A-33
typ: blocker
modul: medical
schwere: hoch
angelegt: 2026-08-20
braucht: []
kind_von: G-85
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/specs/Medical/SPEC_09_SCORING.md"]
zahlen: null
---

# A-33 - Der Medical-Abgleich, den der Orchestrator nachgeholt hat

## Befund

(neu 2026-08-20). **Tom hat danach gefragt, zu Recht.**

  `[read]` **Drei Auftraege gingen raus, ohne dass Spec, Mockup und
  Vorgaengerrepo gelesen waren.** Der Abgleich danach hat mehr gefunden
  als die Auftraege enthielten.

  ### 1. Der Health score ist entschieden — seit Monaten

  `[cmd]` **`docs/specs/Medical/SPEC_09_SCORING.md`, 408 Zeilen**,
  definiert **beide** Unbekannten aus G-85:

  ```
  SYSTEM_MARKERS = {
    liver:          [ALT, AST, GGT, ALP, Bilirubin, Albumin]
    cardiovascular: [LDL, HDL, Triglyceride, hs-CRP, Homocystein, ApoB]
    kidney:         [Kreatinin, BUN, eGFR, Harnsaeure]
    hormonal:       [Testosteron, Oestradiol, Cortisol, TSH, Free T3, Prolaktin]
    metabolic:      [HbA1c, Glukose, Insulin, HOMA-IR]
  }
  WEIGHTS = { cardiovascular .25, metabolic .25, hormonal .20,
              liver .15, kidney .15 }
  FLAG_SCORE = { optimal 100, normal 75, low/high 40, critical 10 }
  ```

  `[read]` **Der Orchestrator hat G-85 als offene Frage an Tom
  weitergegeben, obwohl die Antwort im Repo lag.**

  `[cmd]` **Und der Umgang mit Luecken ist definiert:** `totalW`
  normalisiert ueber die vorhandenen Systeme, `no_data` wenn keiner
  traegt, **`missing` zaehlt die fehlenden Marker.**

  ### 2. Warum G-84 nur 23 von 37 gruppieren konnte

  `[cmd]` **Die Spec sucht ueber Namen, nicht ueber LOINC:**
  `biomarker_name`, `common_name`, `abbreviation`.

  `[cmd]` **Nachgemessen: 18 der 26 Spec-Marker treffen unseren
  Katalog ueber den Namen.** **Die acht Fehlenden sind
  Namensvarianten** — `GGT` heisst im LOINC *Gamma glutamyl
  transferase*, `eGFR` *Glomerular filtration rate*, `Triglycerides`
  *Triglyceride*.

  `[read]` **`biomarker_aliases` hat 292 Eintraege und ist genau dafuer
  gebaut.** **Damit waeren es 26 von 26.**

  ### 3. `module-medical-data.jsx` traegt dieselbe Rechnung — und mehr

  `[cmd]` **298 Zeilen mit:** `SYSTEM_MARKERS`, `SYSTEM_WEIGHTS`,
  `calcSystemScore`, `calcOverallHealthScore`, `calcBiomarkerTrend`,
  `generateAlerts`, `UNIT_CONVERSIONS`.

  **Und zwei, die woanders fehlen:**

  `[cmd]` **`SUPPLEMENT_BIOMARKER_MAP` und
  `calcSupplementEffectiveness`** — `[read]` **genau das, was C-162
  heute in der Datenbank gebaut hat** (222 Zeilen, 66 Marker). **Die
  Vorlage lag die ganze Zeit da.**

  `[cmd]` **`SYMPTOM_BIOMARKER_MAP` und `SYMPTOMS`** — `[read]` **C-159
  meldet *„keine Symptomtabelle im ganzen Schema"*.** **Das Mockup hat
  sie.**

  ### 4. Vier Medical-Tabs, die nie erwaehnt wurden

  `[cmd]` **`module-medical.jsx`, 809 Zeilen:** `MedMedications`,
  `MedHistory`, `MedDocuments`, `MedAppointments` — **mit
  `AddLabModal`, `UploadDocModal`, `BookAptModal`, fuenf
  Detailmodalen.**

  `[cmd]` **Und `module-medical-modals.jsx`** (453 Zeilen) plus
  **`module-medical-v2.jsx`** (818) mit `RangeIndicator`, `FlagPill`,
  `TrendBadge`.

  `[read]` **176 KB Mockup, elf Specs mit 100 KB** — **davon war bisher
  nichts gelesen.**

  ### Was daraus folgt

  `[cmd]` **G-85 ist nicht blockiert.** Die Zuordnung steht, die
  Gewichtung steht, der Umgang mit Luecken steht.

  `[cmd]` **Pruefend bleibt:** A-20 zaehlt sieben Spec-Fehler.
  **Die 26 Marker gehoeren gegen den Katalog geprueft, bevor jemand
  danach baut** — und die acht Namensvarianten in
  `biomarker_aliases`.

  `[read]` **Und C-159s Landkarte wird kuerzer:** Die Symptomtabelle
  fehlt im Schema, **aber nicht im Entwurf.**
