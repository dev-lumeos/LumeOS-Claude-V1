# Supplements Module  Data

## Tabellen (Spec)

Supplements:

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

Enhanced:

- enhanced_substances
- enhanced_stack_items (oder: stack_items mit mode=enhanced)
- enhanced_intake_logs (oder: intake_logs mit mode=enhanced)
- enhanced_interactions

---

## Kernobjekte

### Supplement
- Stammdaten (Name, Form, Standard-Dosis, Inhaltsstoffe)
- Optional: liefert Nährstoffe ins Nutrition Tracking

### Enhanced Substance
- Stammdaten (Name, Klasse, Halbwertszeit, Notizen, optional Detection Window)
- Gehört in eigenen Datensatz (nicht in supplements mischen)

### Stack
- user_stacks = Stack Header
- stack_items = Items im Stack (Supplement + Dose + Timing Slot)
- Enhanced Items laufen entweder:
  - in separater Tabelle, oder
  - in stack_items mit mode=enhanced

### Schedule
- intake_schedule = Plan (wann ein Item fällig ist)
- timing slots: Morning/Midday/Evening/Pre/Post

### Logs
- intake_logs = Einnahmen (Ist)
- Enhanced Logs laufen entweder:
  - in separater Tabelle, oder
  - in intake_logs mit mode=enhanced

### Inventory
- user_inventory = Packungen, Sizes, Restbestand (primär Supplements)

### Interactions
- supplement_interactions = Regeln (Supplements)
- enhanced_interactions = Regeln (Enhanced)
- Cross-Checks sind Pflicht, wenn Enhanced aktiv ist

---

## Altprojekt-Stand

Die Route `/supplements` existiert, aber:

- Actions fehlen
- Types fehlen
- Tests fehlen
- Feature ist faktisch leer
