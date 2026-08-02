# Supplements Module  Protocols

## Protokoll: Interaction Block

Wenn:
- rule.severity = block

Dann:
- Einnahme sperren
- Alert anzeigen

---

## Protokoll: Low Stock

Wenn:
- Bestand < Schwelle

Dann:
- Reorder Flag setzen

---

## Protokoll: Missed Intake

Wenn:
- geplante Einnahme nicht geloggt

Dann:
- Compliance senken
- Hinweis anzeigen

---

## Enhanced Mode

Wenn:
- enhanced_mode = on

Dann:
- zusätzliche Interaktionsregeln aktiv
