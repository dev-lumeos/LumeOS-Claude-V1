---
nr: G-188
typ: feature
modul: supplements
schwere: mittel
angelegt: 2026-08-25
braucht: []
kind_von: G-187
kinder: []
entscheidung: null
beruehrt:
  tabellen: ["medical.medication_active_substances", "medical.user_medications"]
  dateien: []
zahlen: null
---

# G-188 - Der Wechselwirkungs-Reiter heisst nicht, was er zeigt

## Befund

(neu 2026-08-25). Aus G-187, Entscheidung des Orchestrators.

  `[cmd]` **`supplement_interactions`: 77 gegen Medikamente, 1 gegen
  Alkohol, 0 zwischen zwei Katalogsubstanzen.**

  `[read]` **Der Reiter heisst *„Wechselwirkungen"* und verspricht
  damit Paare zwischen Supplements, die es nicht gibt.** Was er
  tatsaechlich zeigt, sind **Medikamenten-Wechselwirkungen** — und das
  ist wertvoll: `[cmd]` `medical.medication_active_substances` traegt
  seit C-262 **498 Wirkstoffe**, die Bruecke steht.

  **Zu tun:** den Reiter benennen, wie er ist. `[read]` **Und pruefen,
  ob die 498 Wirkstoffe die 77 Paare erreichbar machen** — heute
  treffen je Stack 2 Zeilen, beide Medikamente, die im Bestand des
  Nutzers gar nicht erfasst sind. `[cmd]` `medical.user_medications`
  traegt **2 Zeilen**.
