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

TemplateRoutingKomplexitätDB[implementation_low](template_implementation_low.md)Spark C (heute B)&lt; 50 Zeilennone[implementation_medium](template_implementation_medium.md)Spark B50-200 Zeilennone/read[migration](template_migration.md)Spark B + DB-Checkvariesmigration[docs](template_docs.md)Spark C (heute B)anynone

## Schnellstart

```bash
# Template kopieren
cp system/workorders/templates/template_implementation_low.md \
   system/workorders/batches/WO-$(date +%Y%m%d)-001.md

# Felder ausfüllen und dann:
# 1. POST http://localhost:9000/classify (WO Classifier)
# 2. Oder: npx tsx tools/scripts/test-e2e-full-pipeline.ts
```
