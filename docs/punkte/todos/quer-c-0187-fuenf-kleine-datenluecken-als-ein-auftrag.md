---
nr: C-187
typ: befund
modul: quer
schwere: mittel
angelegt: 2026-08-21
braucht: []
kind_von: null
kinder: []
entscheidung: null
beruehrt:
  tabellen: []
  dateien: []
zahlen: null
---

# C-187 - Fuenf kleine Datenluecken — als ein Auftrag

## Befund

(neu
  2026-08-21). **Klammer, kein neuer Inhalt.**

  `[read]` **Der Orchestrator hat dieses Buendel am 2026-08-20 im
  Fliesstext der Uebergabe als *„C-186"* vergeben und nie angelegt.**
  **Am 2026-08-21 hat G-148 sich C-186 genommen** — exakt das Muster,
  das A-41 beschreibt.

  `[cmd]` **Die fuenf bestehen einzeln weiter und werden hier nur
  zusammengefasst:**

  | | |
  |---|---|
  | **C-175** | `shopping_lists` fehlt — ADR-Pflicht |
  | **C-179** | `EAA` zeigt auf `AAE9` statt auf die neun |
  | **C-178** | Prolactin und ApoB fehlen in `system_groups` |
  | **G-124** | zehn Medication-Spalten |
  | **G-126** | `CHOL` → `CHORL`, 28 Texte, Selen |

  `[read]` **Sie liegen alle in `supabase/`** — ein Agent, ein
  Durchgang. **Wer C-187 abarbeitet, schliesst die fuenf einzeln.**
