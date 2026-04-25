# WO Templates — Index
# Alle verfügbaren Work Order Templates

---

## Welches Template wählen?

```
type=implementation + complexity=low  + risk=low  → template_implementation_low.md
type=implementation + complexity=med  + risk=*    → template_implementation_medium.md
type=migration                                     → template_migration.md
type=docs                                          → template_docs.md
type=governance / planning / analysis+high risk    → kein Template — Tom definiert manuell → Spark A
```

## Templates

| Template | Routing | Komplexität | DB |
|----------|---------|-------------|-----|
| [implementation_low](template_implementation_low.md) | Spark C (heute B) | < 50 Zeilen | none |
| [implementation_medium](template_implementation_medium.md) | Spark B | 50-200 Zeilen | none/read |
| [migration](template_migration.md) | Spark B + DB-Check | varies | migration |
| [docs](template_docs.md) | Spark C (heute B) | any | none |

## Schnellstart

```bash
# Template kopieren
cp system/workorders/templates/template_implementation_low.md \
   system/workorders/batches/WO-$(date +%Y%m%d)-001.md

# Felder ausfüllen und dann:
# 1. POST http://localhost:9000/classify (WO Classifier)
# 2. Oder: npx tsx tools/scripts/test-e2e-full-pipeline.ts
```
