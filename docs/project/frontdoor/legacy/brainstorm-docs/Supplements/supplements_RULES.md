# Supplements Module  Rules

## Single Source of Truth

Diese Tabellen sind die Wahrheit für das Supplements-Modul:

- supplements
- user_stacks
- stack_items
- intake_logs
- intake_schedule
- user_inventory
- stack_templates
- stack_template_items
- stack_rotations
- supplement_interactions

Enhanced gehört zum gleichen Modul und ist ebenfalls Single Source of Truth:

- enhanced_substances
- enhanced_stack_items (oder: stack_items mit mode=enhanced)
- enhanced_intake_logs (oder: intake_logs mit mode=enhanced)
- enhanced_interactions

---

## Deterministische Entscheidungen

Regeln:

- Interaktions-Checks sind regelbasiert, nicht KI-Feeling
- Cycling ist explizit und reproduzierbar (On/Off Wochen)
- Timing Slots sind definierte Kategorien (Morning/Midday/Evening/Pre/Post)

---

## Inventory ist Pflicht (Supplements)

Regeln:

- Jede Einnahme kann Inventory reduzieren
- Low-Stock ist ableitbar aus Packungsgröße und Dosierung pro Tag
- Inventory UI darf nie nur Anzeige sein

Hinweis:
- Enhanced hat normalerweise kein klassisches Inventory-Tracking wie Supplements.
- Wenn du es willst, wird es als eigener Inventory-Type umgesetzt (später).

---

## Enhanced Mode ist first-class

Regeln:

- Enhanced ist Teil des Moduls, aber UX-seitig strikt getrennt
- Default ist Supplements-Mode
- Enhanced wird nur sichtbar, wenn der User es aktiviert
- Kein Vermischen in Default-Flows
- Interaktionswarnungen müssen auch Enhanced berücksichtigen, sobald Enhanced aktiv ist

---

## RLS und User-Scope

Regeln:

- user_stacks, stack_items, intake_logs, intake_schedule, user_inventory sind user-scoped
- Enhanced Logs/Items sind ebenfalls user-scoped
- RLS ist Pflicht auf allen User-Tabellen

---

## Modulgrenzen

Supplements darf:

- Stacks verwalten (Supplements + Enhanced)
- Intake planen und loggen
- Inventory tracken (primär Supplements)
- Interaktionen prüfen (Supplements + Enhanced)
- Kosten berechnen (primär Supplements)

Supplements darf nicht:

- Blutwerte interpretieren
- Medikamente managen
- Training planen
