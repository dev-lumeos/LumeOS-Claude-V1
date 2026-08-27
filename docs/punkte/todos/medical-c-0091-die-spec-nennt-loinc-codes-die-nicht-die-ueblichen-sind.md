---
nr: C-91
typ: feature
modul: medical
schwere: mittel
angelegt: 2026-08-19
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-91 - Die Spec nennt LOINC-Codes, die nicht die ueblichen sind

## Befund

(neu gefasst 2026-08-19). **Nicht dringend.**

  ### Der urspruengliche Befund war falsch gestellt

  `[cmd]` C-84 meldete *„IGF-1, Zink und Selen fehlen im Zuschnitt"*.
  **Gemessen: alle drei sind da, unter anderen Codes.**

  | | Spec | im Katalog |
  |---|---|---|
  | IGF-1 | `10231-9` | **`2484-4`** — live in Toms Befundliste, 286 ng/mL |
  | Zink | `5762-0` | **`14955-9`** (Serum/Plasma), `10918-1`, +4 weitere |
  | Selen | `2913-2` | **`5722-4`** (Blut), `5723-2` (Erythrozyten), +3 |

  `[read]` **Die Marker fehlen nicht — die Spec nennt Codes, die nicht
  die ueblichen sind.** Vermutlich veraltet oder falsch abgeschrieben.

  `[cmd]` **Sechster Spec-Fehler in Folge** — nach
  Magnesium/Methaemoglobin (C-84), C-92, der Severity ohne Schema
  (C-108), den drei Recovery-Formelfehlern (C-111) und der BSS-Formel
  (C-112).

  **Was bleibt:** `[read]` **Wenn ein Labor mit `10231-9` liefert,
  trifft der Import ins Leere.** `[cmd]` Ein Alias-Eintrag in
  `biomarker_aliases` waere die kleine Loesung — **292 Aliase liegen
  dort bereits.**
