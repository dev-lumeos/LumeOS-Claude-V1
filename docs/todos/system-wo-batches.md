# TODO: system/workorders/batches/ — WO Batch History

# Status: OFFEN — wird mit Orchestrator automatisch gefüllt

# Erstellt: 24. April 2026

## Was fehlt

`system/workorders/batches/` ist leer. Hier sollen ausgeführte WO Batches als Dokumentation gespeichert werden.

## Konzept

```
system/workorders/batches/
  WO-20260424-001.md    → Beschreibung + Ergebnis des WOs
  WO-20260424-002.md    → ...
  WO-20260501-batch-01/ → Zusammengehörige WOs als Batch
    WO-20260501-001.md
    WO-20260501-002.md
    batch_summary.md
```

## Format pro WO File

```markdown
# WO-YYYYMMDD-NNN: <Titel>

**Status:** done / failed  
**Spark:** spark_b  
**Datum:** YYYY-MM-DD  
**Artefakt Hash:** sha256:...

## Was wurde gemacht
<Kurzbeschreibung>

## Geänderte Files
- packages/agent-core/src/registry.ts

## Acceptance Criteria
- [x] NODE_PROFILES nutzt process.env
- [x] TypeScript clean

## triple_hash
1dea3aab275b223a (3/3 identisch)
```

## Wann wird das automatisch gefüllt?

Wenn Orchestrator Service (Port 9005) aktiv ist:
- Nach jedem erfolgreichen WO automatisch eine .md Datei anlegen
- Supabase Audit-Trail als Quelle

## Prompt für Opus wenn bereit

```
Orchestrator Service ist aktiv.

Erweitere den Orchestrator so dass nach jedem abgeschlossenen WO
automatisch eine Batch-Dokumentation in system/workorders/batches/ erstellt wird.

Format: system/workorders/batches/WO-<id>.md
Inhalt: Status, Spark, Hash, geänderte Files, Acceptance Criteria Ergebnis
``