---
nr: C-168
typ: befund
modul: recovery
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

# C-168 - Die Uebertrainings-Schwellen stehen im Entwurf

## Befund

(neu
  2026-08-20). Aus SSOT 173. **Betrifft C-124/E8.**

  `[cmd]` **`OVERTRAINING_SIGNALS` traegt vier Pruefungen mit
  Schwellen und `check`-Funktion:**

  | Signal | Schwelle |
  |---|---|
  | `hrv_low` | 7-Tage-Schnitt **unter 90 % der Grundlinie** |
  | `rhr_high` | Ruhepuls **+5 bpm** ueber Grundlinie |
  | `sleep_poor` | Schlafqualitaet **unter 6** ueber 3 Tage |
  | `fatigue` | subjektives Gefuehl **≤ 4** ueber 3 Tage |

  `[read]` **E8 fragt: *„ab wie vielen Signalen ueber wie viele Tage ist
  ein Arzt-Hinweis angebracht?"*** — **der Entwurf beantwortet den
  ersten Teil.**

  `[cmd]` **Und drei der vier Eingaenge fehlen im Bestand:** HRV auf 127
  von 170 Tagen leer, `resting_hr` 0 von 340. **Nur die Schlafqualitaet
  ist da.**
