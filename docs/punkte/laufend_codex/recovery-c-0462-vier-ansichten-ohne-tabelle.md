---
nr: C-462
typ: feature
modul: recovery
schwere: hoch
angelegt: 2026-09-08
braucht: []
kind_von: null
entscheidung: null
agent: codex
beauftragt: 2026-09-08
beruehrt:
  tabellen: [recovery.scores]
zahlen:
  gemessen: 2026-09-08
  fehlend: 4
---

# C-462 — vier Ansichten ohne Tabelle

## Befund

`[cmd]` **`recovery` hat sieben Tabellen:**

    scores    370
    checkins  370
    (fuenf weitere)

`[cmd]` **Es FEHLEN:**

    muscle_soreness
    modality_logs
    protocols
    hrv_readings

`[cmd]` **Und gebaut sind:** `RecMuscleMap`, `RecModalities`,
`RecProtocols`, `RecHRV`.

`[read]` **Vier Ansichten, die in nichts schreiben und aus nichts
lesen.**

## Und 26 Formeln fehlen

`[cmd]` **`tools/vollstaendigkeit.mjs` nennt:** `ACWR_DATA`,
`MAX_DAILY_BONUS`, `MODALITY_BONUS`, `calcModalityBonus`,
`calcTrainingLoadScore` **und 21 weitere.**

`[read]` **Miss, welche davon Tabellen brauchen und welche
Rechenwege sind.**

## Was zu lesen ist

`[cmd]` **`docs/specs/Recovery/`** ? **zuerst.**

`[cmd]` **Der Draft:**
`docs/spezifikation/10-plattform/design-system/lumeos-draft/`
? `module-recovery.jsx`, `module-recovery-v2.jsx`,
`module-recovery-engine.jsx`, `module-recovery-modals.jsx`.

`[read]` **Die Ansichten zeigen, welche Felder sie brauchen.**

## Was gebaut wird

**1** ? `muscle_soreness` ? **je Nutzer, Tag und Muskelgruppe.**

`[cmd]` **`packages/ui/src/koerperkarte-pfade.ts` fuehrt 21
Flaechen** ? **die Zuordnung existiert schon.**

**2** ? `modality_logs` ? **Sauna, Eisbad, Massage, Dehnen.**

`[cmd]` **`MODALITY_BONUS` in der Vorlage** ? **je Modalitaet ein
Wert.**

`[read]` **Miss, ob die Liste geschlossen ist.**

**3** ? `protocols` ? **Erholungsprotokolle.**

`[cmd]` **`RecProtocols` zeigt drei Kacheln** ? **miss, was sie
tragen.**

**4** ? `hrv_readings` ? **HRV je Messung.**

`[cmd]` **`RecHRV` zeigt vier Kacheln, `HRVMeasureModal` ist
gebaut** ? **es schreibt in nichts.**

## Abnahmebedingungen

    A1  je der vier Tabellen: Spalten aus Spec und Draft
        belegt. Fundstelle je Spalte.
    A2  die 26 Formeln: welche brauchen eine Tabelle,
        welche sind Rechenwege? Liste.
    A3  je Tabelle eine Zeile geschrieben und gelesen.
        ROLLBACK.
    A4  RLS je Tabelle, beide Richtungen.
    A5  die 370 scores und 370 checkins bleiben gueltig.
    A6  Sicherung, Vollkette, Punktelauf.

## Was NICHT zu bauen ist

`[read]` **Keine Oberflaeche** ? **die Ansichten stehen.**

`[read]` **Keine Formel erfinden** ? **was die Vorlage nicht
nennt, wird gemeldet.**
