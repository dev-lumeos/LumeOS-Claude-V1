# Supplements  Definition of Done

1. Tabellen existieren: supplements, user_stacks, stack_items, intake_schedule, intake_logs, user_inventory, supplement_interactions, enhanced_substances, enhanced_interactions
2. RLS aktiv (user_id scope)
3. API: createStack, addStackItem, rebuildSchedule, logIntake, toggleEnhancedMode funktioniert
4. ruleset.v1.json validiert (supplement + enhanced + cross)
5. RISKS.md deckt Interactions ab (block/warn)
6. Dashboard bekommt supplements_status + conflicts + low stock
7. UI: Today Schedule + Stack Builder + Inventory + Interactions funktionieren
8. Compliance: missed intakes werden erkannt
9. Tests: Schedule + Interaction eval + mode switching
10. Keine Writes außerhalb Supplements Actions

