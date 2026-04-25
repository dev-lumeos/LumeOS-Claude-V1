# WO Template: Documentation
# Routing: → Spark C (heute Spark B Fallback)
# Schnellster WO-Typ — kein DB, kein Code

```yaml
id: "WO-<YYYYMMDD>-<NNN>"
title: "Document <was dokumentiert wird>"

type: docs
module: <nutrition|training|infra|cross|...>
complexity: low
risk: low
requires_reasoning: false
requires_schema_change: false
db_access: none
created_by: human

files_allowed:
  - "docs/**"
  - "system/**"
  - "README.md"
  - "COMMANDS.md"

acceptance_criteria:
  - "Dokument ist vollständig und korrekt"
  - "Markdown valide und lesbar"
  - "Links funktionieren"
```

## Wann nutzen?

- README aktualisieren
- API Dokumentation schreiben
- Architecture Decision Records (ADR)
- System-Specs aktualisieren
- COMMANDS.md ergänzen

## ADR Template

```markdown
# ADR-<NNN>: <Titel>

**Datum:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated  
**Entscheider:** Tom

## Kontext

<Warum wurde diese Entscheidung getroffen?>

## Entscheidung

<Was wurde entschieden?>

## Konsequenzen

**Positiv:**
- ...

**Negativ:**
- ...

**Neutral:**
- ...
```

ADRs kommen in: `docs/decisions/ADR-<NNN>-<datum>-<slug>.md`
