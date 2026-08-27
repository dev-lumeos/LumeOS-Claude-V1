---
nr: G-131
typ: befund
modul: training
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-131 - `module-completeness.jsx` ist die Settings-Seite

## Befund

(neu
  2026-08-20). **837 Zeilen, nie erwaehnt.**

  `[cmd]` **Der Name ist irrefuehrend** — die Datei enthaelt:

  | | |
  |---|---|
  | `ProfileSettingsModal`, `ProfilePanel` | Profildaten |
  | `UnitsPanel`, `UnitRow` | **Einheiten** (kg/lb, cm/in) |
  | `ModulesPanel` | welche Module sichtbar sind |
  | `PrivacyPanel`, `PermSelect` | **Freigaben** |
  | `DataSourcesPanel` | Wearables und Importe |
  | `BillingPanel` | Abrechnung |
  | `DangerPanel` | Konto loeschen |
  | **`AnatomyMap`, `MUSCLE_RECOVERY`** | Muskelkarte mit Erholungswerten |

  `[cmd]` **`MUSCLE_RECOVERY` traegt einen Wert je Muskel** — Kopf 100,
  Bizeps 90, Trizeps 82, unterer Ruecken 70, Schultern 70.

  `[read]` **C-124 meldet die Erholungszeiten als unbelegt** — **hier
  stehen sie.** Aber als Anzeigewerte eines Entwurfs, **ohne Quelle**.
  **Der Rechercheauftrag bleibt richtig**, das Format ist damit
  vorgegeben.

  `[cmd]` **Und `/v2/settings` traegt heute nur die
  Erfahrungsgrad-Kachel** (G-80). **Sieben Bereiche fehlen.**
