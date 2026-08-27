---
nr: A-20
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["CLAUDE.md"]
zahlen: null
---

# A-20 - Die Spec-Fehlerliste

## Befund

(neu 2026-08-19). **Ersetzt den
  Konsolidierungsteil von A-11.**

  `[read]` **Die Lage hat sich gedreht:** A-11 wollte die Specs zu SSOT
  konsolidieren. **Sechs gemessene Fehler spaeter hiesse das, Falsches zu
  uebernehmen.**

  `[cmd]` **Was stattdessen gilt:** Jeder Entwurf prueft und meldet.
  **Die vier Fable-Auftraege haben genau das getan** — und dabei
  gefunden:

  | | |
  |---|---|
  | C-84 | **Magnesium RBC gegen Methaemoglobin**, ApoB/ApoA1, Reverse T3/T3 |
  | C-84 | Lp(a) `nmol/L` gegen `mg/dL`, eGFR mit und ohne Bezug |
  | C-108 | **Severity `high`, die es im Schema nicht gibt** |
  | C-111 | **drei Recovery-Formelfehler** — Score-Trigger, ACWR-Kurve, HRV-Anker |
  | C-112 | **BSS-Formel 0,5/0,5 gegen 0,6/0,4**, Unit-Test schlaegt nachgerechnet fehl |
  | C-112 | **Proaktivitaetsskala invertiert dokumentiert** (`SPEC_03` gegen `SPEC_11`) |
  | C-91 | **LOINC-Codes, die nicht die ueblichen sind** — IGF-1, Zink, Selen |

  `[cmd]` **Und die Zahlen stimmen auch nicht:** *„100+ Biomarker"* gegen
  74 gegen **47 tatsaechliche SQL-Zeilen** (C-84). *„1.302
  Datensaetze"* gegen **702 gemessene** (F-02).

  `[read]` **Die Liste gehoert gepflegt, nicht abgearbeitet** — sie ist
  der Beleg dafuer, dass `docs/specs/` Datenquelle bleibt und kein
  Sollwert wird. **So steht es in `CLAUDE.md`, und jeder Fund
  bestaetigt es.**
