---
nr: C-111
typ: feature
modul: recovery
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: F-01
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["recovery.checkins", "training.workout_sets"]
  dateien: ["docs/spezifikation/30-module/core/recovery/00-schemaentwurf.md", "supabase/config.toml"]
zahlen: null
---

# C-111 - Recovery — neun Entscheidungen und drei Formelfehler

## Befund

(neu 2026-08-19). **Entscheidungen fuer Tom.** Aus dem F-01-Entwurf
  (`docs/spezifikation/30-module/core/recovery/00-schemaentwurf.md`).

  ### Der Zuschnitt

  `[cmd]` **`recovery.checkins` passt unveraendert.** Dazu **fuenf neue
  Strukturen:** `scores`, `hrv_readings`, `modality_log`,
  `overtraining_alerts`, `protocols`/`protocol_assignments`.

  `[cmd]` **Plus eine Luecke, die keine der drei Quellen abdeckt:**
  `protocol_task_checks` — *„das Mockup zeigt abhakbare Tagesaufgaben,
  die Spec hat keinen Ort dafuer."*

  `[cmd]` **Zwei zurueckgestellt:** `sleep_data` bis zum
  Wearable-Import, Stress bis zur Produktentscheidung.

  ### Vier Spec-Tabellen verworfen — mit Begruendung

  `[read]` **Vor allem `training_load_logs`:** *„Die Spec kopiert
  Trainingsdaten ins Recovery-Schema, der Vorgaenger hat nachweislich
  direkt aus `workout_sets` gerechnet."* `[cmd]` Und
  `training.workout_sets` existiert hier seit Schritt `106` mit allen
  noetigen Spalten.

  ### Drei echte Formelfehler

  `[cmd]` **Der SQL-Score-Trigger der `SPEC_06`** — der Trainingsterm
  ergibt **immer rund volle Punkte.**

  `[cmd]` **Die ACWR-Kurve des Mockup-Motors** — **Faktor 1.1 bei ACWR
  1.4**: *„erhoehtes Verletzungsrisiko verbessert den Score."*

  `[cmd]` **Die gedruckten HRV-Anker widersprechen der eigenen Formel.**

  `[read]` **Vierter Beleg dafuer, dass die Specs nicht stimmen** — nach
  C-84 (Magnesium/Methaemoglobin), C-92 und C-108 (Severity `high` ohne
  Schema).

  ### Der stabile Kern stimmt ueberall

  `[cmd]` **In allen drei Quellen identisch:** Manual-Gewichte
  30/15/15/10/15/10/5, HRV 70 + z×15, Basiskurve, Bonusdeckel 5.
  **Darum herum liegen rund zwoelf Widersprueche.**

  `[cmd]` **Und die Soreness-Mittelung entscheidet, ob der Term
  ueberhaupt wirkt:** *„ein Muskel mit Kater 3 ergibt je nach Quelle
  9,4/10 oder 0/10 Punkte."*

  ### Neun Entscheidungen (E1–E9)

  **Kern:** Score-Gewichte bestaetigen · **oder V1 bewusst nur
  `manual`** (`[cmd]` 27 von 36 Check-ins hatten kein HRV) ·
  Soreness-Mittelung · **die sechs Readiness-Texte und der Arzt-Hinweis
  als Urteilssprache** · Stress-Score ja oder nein.

  ### Reihenfolge

  Score → Modalitaeten → Muskelkarte (**nur Lesefunktion ueber
  Training**) → HRV → Protokolle → Uebertraining (braucht Wochen
  Verlauf) → Schlaf und Stress zuletzt.

  `[cmd]` **Der genannte Querblocker ist bereits behoben** — `recovery`
  steht seit 2026-08-18 in `config.toml` (G-55). **Der Entwurf ist an
  dieser Stelle veraltet.**
