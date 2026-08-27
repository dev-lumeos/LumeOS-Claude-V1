---
nr: C-169
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

# C-169 - Das Trainingsplan-Schema steht im Entwurf

## Befund

(neu
  2026-08-20). Aus SSOT 173. **Betrifft C-145.**

  `[cmd]` **`module-training-spec.jsx` traegt:**

  | | |
  |---|---|
  | **`LANDMARKS`** | MEV/MAV/MRV je Muskelgruppe, zehn Gruppen |
  | **`PROGRESSION_MODELS`** | linear, doppelt — **mit Formel** |
  | **`ROUTINE_TEMPLATES`** | Routinen als Vorlagen |
  | **`DELOAD_TRIGGERS`** | wann entlastet wird |
  | `HR_ZONES`, `HR_MAX`, `SET_TYPES` | |

  `[cmd]` **`PROGRESSION_MODELS` mit Formeln:**
  *linear: `next_weight = current + 2.5 kg`* ·
  *double: `reps < max ? reps+1 : (weight+inc, reps=min)`*

  `[read]` **C-145 meldet *„Bloecke, Wochen, Routinen — fehlendes
  Schema"*.** **Der Entwurf sagt, woraus es besteht.**
