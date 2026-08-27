---
nr: C-262
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-24
braucht: []
kind_von: C-259
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-262 - Der Import — vier Wellen

## Befund

(neu 2026-08-24). Aus C-259
  bis C-261.

  `[cmd]` **Stichprobe des Orchestrators an 300 gemeldeten
  FEHLT-Werten: 289 fehlen tatsaechlich, 11 waren Fehlmeldungen** —
  kurze generische Werte wie `substrate`, die irgendwo im Datensatz
  vorkamen. **3,7 % Rauschen, belastbar genug.**

  `[read]` **Die 37.886 FEHLT-Zeilen sind nicht 37.886 Importposten.**
  Drei Sorten: Sachwerte · Pruefvermerke (`not_relevant` — fachlich
  richtig, sagt *„hier gibt es nichts"*) · Provenienz (`sources[].url`,
  `.setid`). **Alle drei gehoeren importiert, aber verschieden
  gewichtet.**

  | Welle | Inhalt |
  |---|---|
  | **1** | CYP (6 Enzyme), **10 Transporter**, Renal, Hepatic, PK, Dosis 290, WADA 448, Thailand 976 |
  | **2** | 66 Biomarker-Erklaerungen, 34 Symptome, 102 Kanten, LOINC-Abgleich |
  | **3** | Namensbruecke 1.131, die 248 verborgenen aufloesen, 29 Unterformen sichtbar |
  | **4** | 498 Wirkstoffe, 453 Formulierungen, 448 Produkte, 20 Regeln |

  `[read]` **Transporter und CYP gehoeren in eigene Zeilen, nicht in
  Spalten** — zehn Transporter mal zwei Felder waeren zwanzig Spalten,
  und beim naechsten dieselbe Diskussion.

  `[read]` **Erst danach kann das System vor Wechselwirkungen warnen.**
  `[cmd]` Digoxin ist P-gp-Substrat mit enger therapeutischer Breite;
  Biotin verfaelscht Laborwerte. Beide stehen unter den 978 Entitaeten
  mit fehlenden Werten.
