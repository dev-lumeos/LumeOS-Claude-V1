---
nr: G-116
typ: entscheidung
modul: nutrition
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: E-16
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# G-116 - Generelle Ausschluesse bewerten mit 0, statt zu filtern

## Befund

(entschieden 2026-08-20). Befund aus G-104.

  **Tom, 2026-08-20:** *„Ich wuerde es einfach mit 0 bewerten, dass es am
  Schluss noch auftaucht."*

  ### Der Befund

  `[cmd]` **Gemessen:** `schokolade` **163 → 1.** *„Kommt vom
  Seed-Ausschluss `ultra_processed`, der ueber die Tag-Schiene hart
  filtert — korrekt, aber an der Pille nicht ablesbar."*

  ### Die Unterscheidung

  | | wirkt | warum |
  |---|---|---|
  | **Allergen** | **hart raus** | Sicherheit — sonst nuetzt es nichts |
  | **Diet type** | hart raus | eine Entscheidung, keine Neigung |
  | **Genereller Ausschluss** | **auf 0, ganz unten** | eine Vorliebe |

  `[read]` **Wer `ultra_processed` meidet, will es trotzdem finden, wenn
  er danach sucht.** Und praktisch loest es das Anzeigeproblem mit: **163
  Treffer, Schokolade unten** — statt eines Treffers ohne Erklaerung.

  ### Was zu tun ist

  `[cmd]` **`general_exclusions[]` und `exclusion_preset_code` wirken
  als Bewertung, nicht als Filter** — die Rangfolge nennt sie heute
  nicht, **sie verhalten sich aber wie Allergene.**

  `[cmd]` **Und die Presets aus C-93 gehoeren dazu** — Halal, Koscher,
  kein Rind. `[read]` **Auch dort gilt: wer Schwein meidet, will
  Schweinefleisch finden koennen**, wenn er ausdruecklich danach sucht.

  `[read]` **Die Allergene bleiben hart** — G-67 hat es begruendet:
  *„`hard_exclude` ist die Stufe, die auch fuer Allergene gilt."*
