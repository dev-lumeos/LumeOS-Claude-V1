---
nr: C-171
typ: befund
modul: medical
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
agent: codex
beauftragt: 2026-09-08
erledigt: 2026-09-08
commit: 302b6294
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-171 - Medical — neun Konstanten ohne Tabelle

## Befund

(neu
  2026-08-20). Aus SSOT 173.

  `[cmd]` **`SYMPTOMS` und `SYMPTOM_BIOMARKER_MAP`** — `[read]` **C-159
  meldet *„keine Symptomtabelle im ganzen Schema"*. Der Entwurf hat
  sie**, mit Zuordnung zu Biomarkern.

  `[cmd]` **Dazu:** `APPOINTMENTS`, `DOCUMENTS`, `HISTORY_TIMELINE`,
  `DIAGNOSES`, `OCR_EXTRACTED`, `CORRELATIONS`, `UNIT_CONVERSIONS`.

  `[read]` **Und vier ganze Tabs fehlen** — `MedMedications`,
  `MedHistory`, `MedDocuments`, `MedAppointments`, **mit acht
  Modalen.**

## Auftrag

**Mitbeauftragt mit C-428 am 2026-09-08.** Der Auftragstext
und der Bericht stehen dort.

## Gemessen am 2026-09-08 mit C-428: bleibt offen

`[cmd]` **Vorhanden:** `symptoms`, `symptom_biomarker_map`,
`appointments`, `health_timeline`, **Dokument- und Originalpfad,
Diagnoseweg, Einheitenpfad.**

`[cmd]` **Es fehlen:** `medical.ocr_extracted` **und**
`medical.correlations`.

`[read]` **Selbst nachgemessen, beide bestaetigt.**

`[read]` **Von neun Konstanten sind sieben inzwischen gebaut** ?
**der Punkt schrumpft, statt zu verschwinden.**

## Abnahme

**2026-09-08, Orchestrator.**

    A1  ocr_extracted: spezifiziert, aber in lab_reports
    A2  correlations: unvereinbar mit E-74
    A3  die sieben tragen ihren Zweck, je mit Zahl
    A4  was RESEARCH.md begruendet und fehlt
    A5  der Punkt schliesst als Tabellenbefund

### A1 — die Spec modelliert es anders

`[cmd]` **`SPEC_02:144` und `SPEC_07:125`: OCR liegt in
`lab_reports`** ? `ocr_status`, **Rohresultat, extrahierte
Werte** ? **KEINE eigene Tabelle.**

`[read]` **Also war `ocr_extracted` nie eine fehlende Tabelle,
sondern ein falsch benannter Befund.**

`[cmd]` **Was live fehlt: sechs Felder, jede OCR-Relation und
-Funktion, und OCR-Zeilen.** `[cmd]` **Der Bucket hat ein
Original.**

### A2 ist die wichtigste Zeile

> *,,`correlations` ist als automatische, persistierte Ableitung
> mit E-74 unvereinbar."*

`[cmd]` **`SPEC_04:136` fordert genau das** ? **E-74 erlaubt keine
Bewertung oder Ableitung medizinischer Daten.**

`[cmd]` **Und die Abgrenzung, die er zieht:**
`symptom_biomarker_map` **ist zulaessig** ? **102 KURATIERTE
Verweise, 0 Diagnosebehauptungen.**

`[read]` **Der Unterschied ist nicht die Tabelle, sondern wer die
Verbindung herstellt** ? **ein Mensch oder die Maschine.**

`[cmd]` **Er hat es als `security_review: warning` gemeldet** ?
**mit der Empfehlung, nichts zu bauen, bevor die Entscheidung
vereinheitlicht ist.**

### A3 — sieben Pfade, je mit Zahl

    symptoms                34 kuratierte, mehrsprachig
    symptom_biomarker_map  102 begruendete Zuordnungen
    appointments             3 Termine mit Typ und Zone
    Dokumente               12 lab_reports, 1 file_ref,
                             1 privates Original
    health_timeline         16 abgeleitete Eintraege
    Diagnoseweg              4 health_events
                             (1 Diagnose, 1 Behandlung,
                              2 Operationen)
    Einheitenpfad          280 Laborwerte mit unit_snapshot

`[read]` **Und die Einschraenkung, die er nicht verschweigt:**

> *,,Der Einheitenpfad BEWAHRT Einheiten, erfuellt aber keine
> echte UNIT_CONVERSIONS-Normalisierung."*

`[read]` **Ein Snapshot ist keine Umrechnung** ? **das gehoert in
einen OCR-Importauftrag, nicht hierher.**

### Was offen bleibt

`[cmd]` **`RESEARCH.md:38` begruendet OCR, Cross-Module-Korrelation,
optimale Bereiche, Provider-Export und Privacy-First.**

`[cmd]` **Heute fehlen: OCR-Pruefung und Normalisierung,
Arzt-Export, die geforderte Analyse.**

`[read]` **Und die Korrelationsteile duerfen ohne neue
E-74-Entscheidung nicht uebernommen werden.**

**Abgenommen, als Tabellenbefund geschlossen.**
