---
nr: G-141
typ: entscheidung
modul: quer
schwere: mittel
angelegt: 2026-08-20
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: ["docs/specs/Core/ONBOARDING_ADR.md"]
zahlen: null
---

# G-141 - Das Onboarding ist als ADR final entschieden

## Befund

(neu
  2026-08-20). **Betrifft G-83.** Aus SSOT 173.

  `[cmd]` **`docs/specs/Core/ONBOARDING_ADR.md`, April 2026, Status
  final:** *„Option C: 7-Step Kern-Onboarding + Post-Onboarding
  Setup-Cards."*

  | Schritt | Inhalt | Ziel |
  |---|---|---|
  | 1 | Name, Sprache, Einheitensystem | Auth / Profil |
  | 2 | Geschlecht, Geburtstag, Groesse, Gewicht, **KFA** | Goals (TDEE) |
  | 3 | **Experience Level** | Goals, Nutrition, Training |
  | 4 | **Primaerziel: 12 Goal-Typen** | Goals → TDEE + Makros |
  | 5 | Training: Frequenz, Dauer, Equipment | Training |
  | 6 | Nutrition: Diaettyp, Allergien, Mahlzeiten, Vorlieben | Nutrition |
  | 7 | Zusammenfassung | alle Module |

  `[cmd]` **Beim Abschliessen:** `calculateTDEE()` → Goals-Targets →
  alle Modul-Einstellungen initialisieren.

  ### Eine Abweichung

  `[cmd]` **Der ADR nennt `beginner / intermediate / advanced / elite`.**
  **C-118 hat `beginner / advanced / pro / elite` gebaut** — Toms
  Vorgabe vom 2026-08-19.

  `[read]` **Toms Entscheidung ist juenger und gilt.** **Aber es gehoert
  gewusst**, dass der ADR etwas anderes sagt.

  `[cmd]` **Und *„Post-Onboarding Setup-Cards"*** — in noch nicht
  konfigurierten Modulen erscheinen Einrichtungskarten. **Das ist eine
  eigene Bauform, die niemand kennt.**
