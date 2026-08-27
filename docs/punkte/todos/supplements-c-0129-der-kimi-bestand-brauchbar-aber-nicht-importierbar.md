---
nr: C-129
typ: blocker
modul: supplements
schwere: hoch
angelegt: 2026-08-19
braucht: []
kind_von: C-128
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/spezifikation/pruefung-kimi-bestand.md"]
zahlen: null
---

# C-129 - Der Kimi-Bestand — brauchbar, aber nicht importierbar

## Befund

(neu 2026-08-19). Aus C-128
  (`docs/spezifikation/pruefung-kimi-bestand.md`).

  ### Was vorliegt

  `[cmd]` **237 Substanzen, 56 Medikamentenwirkstoffe, 124
  Medikamentenprodukte** · **29 Warnregeln, 15 Gap-Regeln, 20
  Medikamentenregeln.**

  `[cmd]` **157 Quellen, 9 gespeicherte Konflikte, Evidenzgrade A–F,
  Validation Report mit 0 Fehlern.**

  `[read]` **Zum Vergleich:** Unsere eigenen Specs haben in derselben
  Zeit **sieben gemessene Fehler** produziert (A-20). **Der Unterschied
  liegt nicht am Modell, sondern daran, dass dort Konflikte festgehalten
  statt weggeglaettet werden.**

  ### Die Ueberschneidung ist klein

  | | |
  |---|---|
  | gegen unsere **44** Supplements | **16 direkte Treffer** |
  | gegen den F-05-Katalog (320) | **53** |

  `[read]` **Drei Bestaende, kaum Ueberlappung** — das ist keine
  Dublette, sondern drei verschiedene Ausschnitte.

  ### Kein einziges Regelwerk laeuft heute

  | | voll | teilweise | blockiert |
  |---|---|---|---|
  | `warning_rules` (29) | **0** | 18 | 11 |
  | `nutrient_gap_rules` (15) | **1** | 10 | 4 |
  | `medication_rules` (20) | **0** | 0 | **20** |

  `[cmd]` **Alle 20 Medikamentenregeln blockiert durch fehlendes
  `medical.medications`.**

  ### Was es braucht, in dieser Reihenfolge

  `[cmd]` **1. `medical.medications`** — neue Tabelle, blockiert 20
  Regeln. **Tom, 2026-08-19:** *„LumeOS/Buddy muss auch wissen, was der
  User fuer Medikamente nimmt — also brauchen wir die Daten fuer den
  User zum Erfassen der Medikamente."*

  `[cmd]` **2. Conditions** — 15 Werte (Schwangerschaft, CKD, Leber,
  Epilepsie …).

  `[cmd]` **3. Eine substanzstabile ID- und Aliasschicht** — sonst
  laufen drei Kataloge nebeneinander.

  `[cmd]` **4. `missing_input`-Status fuer Regeln.** `[read]` **Der
  wichtigste Punkt:** Eine Regel, die auf fehlende Daten trifft, darf
  nicht stumm durchfallen. **Dieselbe Lage wie `NO_REFERENCE` bei den
  Naehrstoffen** — Fehlen ist ein Zustand, kein Nichtereignis.

  `[cmd]` **Und tausende Medikamente kommen** — im selben Format. **Die
  Struktur muss sie tragen**, der erste Import nur die 56.
